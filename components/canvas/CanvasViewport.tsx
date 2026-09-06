'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import type {
  CanvasNode,
  Edge,
  LeafCanvasNode,
  Viewport,
} from '@/types/content';
import { WORLD_HEIGHT, WORLD_WIDTH } from '@/types/content';

import { normalizeWheelDelta, type Point } from '@/lib/canvas/coords';
import {
  hoverTileWorldRect,
  isWorldRectVisible,
  pickAdjacentHoverCaptionScreen,
  tileCenter,
} from '@/lib/canvas/geometry';
import { spreadLayout } from '@/lib/canvas/spreadLayout';
import { useViewport } from '@/lib/canvas/useViewport';
import {
  CLICK_TRAVEL_PX,
  TRAVEL_ANIMATION_MS,
  WHEEL_DELTA_CLAMP,
  ZOOM_STEP,
  isClickGesture,
  viewportCenter,
  viewportToFitRect,
  type ViewportSize,
} from '@/lib/canvas/viewport';

import { MOTION } from '@/lib/motion/tokens';
import {
  ALIEN_ASPECT,
  HUMAN_ASPECT,
  contentOpacity,
  layoutHands,
  mottoOpacity,
  remap,
  STORY_LINES,
  storyLineOpacity,
} from '@/lib/intro/layout';

import { EdgeLayer } from '@/components/canvas/EdgeLayer';
import { HeroShowcase } from '@/components/canvas/HeroShowcase';
import { IndexView } from '@/components/canvas/IndexView';
import { NodeLayer, shouldCenterOnFocus } from '@/components/canvas/NodeLayer';
import { useIntro } from '@/components/intro/IntroContext';
import { useSheetNav } from '@/components/sheet/SheetNav';

function localPoint(
  event: PointerEvent<HTMLElement> | WheelEvent,
  element: HTMLElement,
): Point {
  const rect = element.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function leafIdFromTarget(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) {
    return null;
  }
  const node = target.closest('[data-node-id]');
  return node?.getAttribute('data-node-id') ?? null;
}

type ViewMode = 'matrix' | 'matrix2' | 'index';

/**
 * Air left around the showcase band. 88 is the tightest that still clears the
 * parked hands and the bottom bar; below it the band runs under the hand in
 * the lower right.
 */
const HERO_FIT_PADDING = 88;
/** Scrolling up only returns to the band from this strip of the screen. */
const HERO_RETURN_STRIP = 0.18;
/**
 * A stream of wheel events closer together than this counts as one gesture.
 * Trackpads keep firing through their inertia, so travel listens only to the
 * first event of a gesture and waits for the wheel to fall quiet before it
 * will listen again.
 */
const GESTURE_GAP_MS = 160;
/** How long a travel animation owns the wheel; outlasts the move itself. */
const TRAVEL_LOCK_MS = TRAVEL_ANIMATION_MS + 250;

type PanSession = {
  pointerId: number;
  lastX: number;
  lastY: number;
  startTime: number;
  travel: number;
  leafId: string | null;
  suppressClick: boolean;
  /** Smoothed pointer speed in px/ms, used to throw the canvas on release. */
  vx: number;
  vy: number;
  lastMove: number;
};

export function CanvasViewport({
  nodes,
  edges,
  wordmarkLeft: _wordmarkLeft,
  wordmarkRight: _wordmarkRight,
}: {
  nodes: CanvasNode[];
  edges: Edge[];
  wordmarkLeft: string;
  wordmarkRight: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pageScrollRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ViewportSize | null>(null);
  const [panning, setPanning] = useState(false);
  const [gestureActive, setGestureActive] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Declared thumbnail sizes are placeholders for remote media, so the true
  // ratio is recorded when each image decodes and drives the hover box.
  const [aspects, setAspects] = useState<Record<string, number>>({});
  const noteAspect = useCallback((id: string, ratio: number) => {
    if (!Number.isFinite(ratio) || ratio <= 0) {
      return;
    }
    setAspects((current) =>
      Math.abs((current[id] ?? 0) - ratio) < 0.001
        ? current
        : { ...current, [id]: ratio },
    );
  }, []);
  const router = useRouter();
  const { markOpenedFromCanvas } = useSheetNav();
  const prefetchSheet = useCallback(
    (href: string) => router.prefetch(href),
    [router],
  );
  const { progress, complete, advance } = useIntro();
  const reducedMotion = useReducedMotion() === true;
  const reveal = contentOpacity(progress);
  const motto = mottoOpacity(progress);
  const completeRef = useRef(complete);
  completeRef.current = complete;
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const introDragRef = useRef<{ lastY: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('index');
  const indexed = viewMode === 'index';
  const spread = viewMode === 'matrix2';
  const spreadResult = useMemo(() => spreadLayout(nodes), [nodes]);
  // Matrix 2 re-files the same nodes into loose per-hub grids; everything
  // downstream (hover, reveal, hit-testing) reads these instead.
  const viewNodes = spread ? spreadResult.nodes : nodes;
  // Organized has two stations: the showcase band, and the sections below it.
  const [heroFocused, setHeroFocused] = useState(true);
  // When the running transition lands, and when the last wheel event arrived.
  const travelLockRef = useRef(0);
  const lastWheelRef = useRef(0);
  const gestureUsedRef = useRef(false);
  const indexedRef = useRef(indexed);
  indexedRef.current = indexed;
  const matrixViewportRef = useRef<Viewport | null>(null);

  const {
    viewport,
    panBy,
    zoomTo,
    smoothZoomByFactor,
    glideBy,
    animateZoomTo,
    centerOnWorld,
    animateTo,
    animateFitRect,
    readViewport,
  } = useViewport(size);

  const pointersRef = useRef(new Map<number, Point>());
  const panRef = useRef<PanSession | null>(null);
  const pinchRef = useRef<{ startDistance: number; startScale: number } | null>(
    null,
  );

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const onWheel = (event: WheelEvent) => {
      // Gesture bookkeeping runs for every wheel event, the intro's included:
      // the scroll that ends the intro must not also count as the scroll that
      // leaves the showcase band.
      const now = event.timeStamp;
      if (now - lastWheelRef.current > GESTURE_GAP_MS) {
        gestureUsedRef.current = false;
      }
      lastWheelRef.current = now;

      if (!completeRef.current) {
        event.preventDefault();
        // This gesture belongs to the intro; travel waits for the next one.
        gestureUsedRef.current = true;
        const height = sizeRef.current?.height ?? 800;
        const span = Math.max(height * 3.6, 2200);
        advanceRef.current(event.deltaY / span);
        return;
      }
      if (!(event.target instanceof Node) || !frame.contains(event.target)) {
        return;
      }
      if (indexedRef.current) {
        // The scroll that ended the intro must not carry on into the page and
        // land the reader halfway down it. Native scrolling resumes with the
        // next gesture.
        if (gestureUsedRef.current) {
          event.preventDefault();
        }
        return;
      }
      if (event.target instanceof Element && event.target.closest('footer')) {
        return;
      }
      event.preventDefault();

      // In Organized the wheel also travels between the showcase band and the
      // sections. Going down always leaves the band; coming back only happens
      // from the top strip, because a scroll up in the middle of the matrix
      // means zoom out, not navigate.
      if (spread && !event.ctrlKey) {
        const animating = now - travelLockRef.current < TRAVEL_LOCK_MS;
        const height = sizeRef.current?.height ?? 800;
        const inTopStrip = event.clientY <= height * HERO_RETURN_STRIP;
        const armed = !animating && !gestureUsedRef.current;

        if (armed && event.deltaY > 0 && heroFocused) {
          gestureUsedRef.current = true;
          travelLockRef.current = now;
          setHeroFocused(false);
          animateFitRect(
            spreadResult.sections,
            undefined,
            TRAVEL_ANIMATION_MS,
          );
          return;
        }
        if (armed && event.deltaY < 0 && !heroFocused && inTopStrip) {
          gestureUsedRef.current = true;
          travelLockRef.current = now;
          setHeroFocused(true);
          animateFitRect(
            spreadResult.hero,
            HERO_FIT_PADDING,
            TRAVEL_ANIMATION_MS,
          );
          return;
        }
        // A transition owns the wheel until it lands, so it cannot be left
        // stranded between the two stations.
        return;
      }

      // Outside Organized the wheel still zooms; inside it, zoom belongs to
      // the +/- buttons alone, so scrolling only ever travels.
      if (spread) {
        return;
      }

      const delta = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        sizeRef.current?.height ?? 800,
        WHEEL_DELTA_CLAMP,
      );
      const intensity = event.ctrlKey ? 0.012 : 0.0025;
      smoothZoomByFactor(
        Math.exp(-delta * intensity),
        localPoint(event, frame),
      );
    };

    window.addEventListener('wheel', onWheel, {
      passive: false,
      capture: true,
    });
    return () => window.removeEventListener('wheel', onWheel, true);
  }, [
    animateFitRect,
    heroFocused,
    smoothZoomByFactor,
    spread,
    spreadResult.hero,
    spreadResult.sections,
  ]);

  const endGestureIfIdle = useCallback(() => {
    if (pointersRef.current.size === 0) {
      panRef.current = null;
      pinchRef.current = null;
      setPanning(false);
      setGestureActive(false);
    }
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-chrome], [data-index-view]')
    ) {
      return;
    }

    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    try {
      frame.setPointerCapture(event.pointerId);
    } catch (error) {
      if (!(error instanceof DOMException)) {
        throw error;
      }
    }
    const point = localPoint(event, frame);
    pointersRef.current.set(event.pointerId, point);
    setGestureActive(true);

    if (!complete) {
      introDragRef.current = { lastY: point.y };
      return;
    }

    if (pointersRef.current.size === 2) {
      const points = [...pointersRef.current.values()];
      const first = points[0];
      const second = points[1];
      if (first && second) {
        pinchRef.current = {
          startDistance: distance(first, second),
          startScale: readViewport().scale,
        };
      }
      panRef.current = null;
      setPanning(false);
      return;
    }

    panRef.current = {
      pointerId: event.pointerId,
      lastX: point.x,
      lastY: point.y,
      startTime: event.timeStamp,
      travel: 0,
      leafId: leafIdFromTarget(event.target),
      suppressClick: false,
      vx: 0,
      vy: 0,
      lastMove: event.timeStamp,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame || !pointersRef.current.has(event.pointerId)) {
      return;
    }

    const point = localPoint(event, frame);
    pointersRef.current.set(event.pointerId, point);

    if (!complete && introDragRef.current) {
      const dy = point.y - introDragRef.current.lastY;
      introDragRef.current.lastY = point.y;
      const span = Math.max((size?.height ?? 800) * 3.6, 2200);
      advance(-dy / span);
      return;
    }

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const points = [...pointersRef.current.values()];
      const first = points[0];
      const second = points[1];
      if (!first || !second || pinchRef.current.startDistance === 0) {
        return;
      }
      const ratio = distance(first, second) / pinchRef.current.startDistance;
      zoomTo(pinchRef.current.startScale * ratio, midpoint(first, second));
      return;
    }

    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) {
      return;
    }

    const dx = point.x - pan.lastX;
    const dy = point.y - pan.lastY;
    pan.travel += Math.hypot(dx, dy);
    pan.lastX = point.x;
    pan.lastY = point.y;

    // Exponentially smoothed so one jittery sample cannot define the throw.
    const dt = Math.max(1, event.timeStamp - pan.lastMove);
    pan.lastMove = event.timeStamp;
    const blend = Math.min(1, dt / 50);
    pan.vx += (dx / dt - pan.vx) * blend;
    pan.vy += (dy / dt - pan.vy) * blend;

    if (pan.travel >= CLICK_TRAVEL_PX && !panning) {
      setPanning(true);
      setHoveredId(null);
    }

    panBy(dx, dy);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (frame?.hasPointerCapture(event.pointerId)) {
      frame.releasePointerCapture(event.pointerId);
    }

    introDragRef.current = null;

    const pan = panRef.current;
    if (
      complete &&
      pan &&
      pan.pointerId === event.pointerId &&
      !pan.suppressClick &&
      pan.leafId &&
      isClickGesture(pan.travel, event.timeStamp - pan.startTime)
    ) {
      const node = viewNodes.find((candidate) => candidate.id === pan.leafId);
      if (node?.kind === 'leaf') {
        markOpenedFromCanvas(node.id);
        router.push(node.href);
      }
    } else if (
      pan &&
      pan.pointerId === event.pointerId &&
      pan.travel >= CLICK_TRAVEL_PX &&
      pointersRef.current.size <= 1 &&
      // A pause before release means the user set the canvas down.
      event.timeStamp - pan.lastMove < 90 &&
      !reducedMotion
    ) {
      glideBy(pan.vx, pan.vy);
    }

    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size === 1) {
      pinchRef.current = null;
      const remaining = [...pointersRef.current.entries()][0];
      if (remaining) {
        const [pointerId, point] = remaining;
        panRef.current = {
          pointerId,
          lastX: point.x,
          lastY: point.y,
          startTime: event.timeStamp,
          travel: 0,
          leafId: null,
          suppressClick: true,
          vx: 0,
          vy: 0,
          lastMove: event.timeStamp,
        };
      }
      endGestureIfIdle();
      return;
    }

    panRef.current = null;
    pinchRef.current = null;
    endGestureIfIdle();
  };

  const openLeaf = (node: LeafCanvasNode) => {
    markOpenedFromCanvas(node.id);
    router.push(node.href);
  };

  const onFocusNode = (node: LeafCanvasNode) => {
    if (!size || indexed) {
      return;
    }
    if (shouldCenterOnFocus(node, readViewport(), size)) {
      centerOnWorld(tileCenter(node.position));
    }
  };

  const onZoomButton = (direction: 1 | -1) => {
    if (!size || indexed) {
      return;
    }
    const factor = direction === 1 ? ZOOM_STEP : 1 / ZOOM_STEP;
    animateZoomTo(viewport.scale * factor, viewportCenter(size));
  };

  const framedSpreadRef = useRef(false);
  useEffect(() => {
    if (framedSpreadRef.current || !size || viewMode !== 'matrix2') {
      return;
    }
    framedSpreadRef.current = true;
    animateTo(viewportToFitRect(spreadResult.hero, size, HERO_FIT_PADDING));
  }, [animateTo, size, spreadResult.bounds, viewMode]);

  // The carousel only runs while its band is actually on screen.
  const heroPaused =
    !spread ||
    !size ||
    !isWorldRectVisible(spreadResult.hero, viewport, size);

  const onViewMode = (mode: ViewMode) => {
    if (mode === viewMode) {
      return;
    }
    setHoveredId(null);
    if (viewMode === 'matrix') {
      matrixViewportRef.current = readViewport();
    }
    if (mode === 'matrix' && matrixViewportRef.current) {
      animateTo(matrixViewportRef.current);
    }
    // Matrix 2 is laid out somewhere else in the world, so frame it rather
    // than leaving the viewport pointed at the constellation.
    if (mode === 'matrix2') {
      setHeroFocused(true);
      animateFitRect(spreadResult.hero, HERO_FIT_PADDING);
    }
    pageScrollRef.current?.scrollTo({ top: 0 });
    setViewMode(mode);
  };

  const hovered =
    hoveredId && !panning
      ? viewNodes.find(
          (node): node is LeafCanvasNode =>
            node.kind === 'leaf' && node.id === hoveredId,
        )
      : undefined;
  const [captionSize, setCaptionSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  // A two-line title is taller than the nominal box, and the neighbours have
  // to make room for what is actually drawn.
  const measureCaption = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    setCaptionSize((current) =>
      current &&
      Math.abs(current.width - rect.width) < 1 &&
      Math.abs(current.height - rect.height) < 1
        ? current
        : { width: rect.width, height: rect.height },
    );
  }, []);

  const hoveredRect = hovered ? hoverTileWorldRect(hovered, aspects) : null;
  const captionOrigin =
    hovered && size && !indexed
      ? pickAdjacentHoverCaptionScreen(
          hovered,
          viewport,
          size,
          hoveredRect ?? undefined,
          captionSize ?? undefined,
        )
      : null;
  const hands =
    size && size.width > 0 && size.height > 0
      ? layoutHands(progress, size.width, size.height)
      : null;

  return (
    <div
      ref={frameRef}
      data-intro-complete={complete ? 'true' : undefined}
      className={`relative h-dvh w-dvw overflow-hidden bg-void select-none ${
        indexed ? 'cursor-default' : panning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ touchAction: indexed ? 'pan-y' : 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div ref={pageScrollRef} className="h-full overflow-hidden">
        <div className="relative h-dvh overflow-hidden">
          <div
            className="absolute origin-top-left"
            aria-hidden={!complete}
            style={{
              width: WORLD_WIDTH,
              height: WORLD_HEIGHT,
              opacity: indexed ? 0 : reveal,
              pointerEvents: indexed || !complete ? 'none' : 'auto',
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
              willChange: gestureActive ? 'transform' : undefined,
              transition: complete
                ? `opacity ${MOTION.zoom}s cubic-bezier(0.22, 1, 0.36, 1)`
                : 'opacity 0.5s ease',
            }}
          >
            {spread && complete ? (
              <HeroShowcase
                nodes={viewNodes}
                rect={spreadResult.hero}
                onOpen={openLeaf}
                paused={heroPaused}
              />
            ) : null}

            <EdgeLayer
              nodes={nodes}
              edges={spread ? [] : edges}
              scale={viewport.scale}
              viewport={viewport}
              size={size}
              hoveredId={hoveredId}
              revealEnabled={complete}
            />
            {size ? (
              <NodeLayer
                nodes={viewNodes}
                viewport={viewport}
                size={size}
                panning={panning}
                hoveredId={hoveredId}
                captionScreen={captionOrigin}
                captionSize={captionSize}
                revealEnabled={complete}
                aspects={aspects}
                onAspect={noteAspect}
                onHover={setHoveredId}
                onFocusNode={onFocusNode}
                onActivateNode={openLeaf}
              />
            ) : null}
          </div>

          {hands ? (
            <>
              <Image
                src="/brand/hand-alien.png"
                alt="Third Kind"
                width={3354}
                height={2203}
                priority
                className="tk-hands-in pointer-events-none absolute top-0 left-0 z-20 max-w-none"
                style={{
                  height: hands.alien.height,
                  width: hands.alien.height * ALIEN_ASPECT,
                  transform: `translate(${hands.alien.x}px, ${hands.alien.y}px)`,
                  transition: complete
                    ? undefined
                    : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
              <Image
                src="/brand/hand-human.png"
                alt=""
                width={2517}
                height={1819}
                priority
                className="tk-hands-in pointer-events-none absolute top-0 left-0 z-20 max-w-none"
                style={{
                  height: hands.human.height,
                  width: hands.human.height * HUMAN_ASPECT,
                  transform: `translate(${hands.human.x}px, ${hands.human.y}px)`,
                  transition: complete
                    ? undefined
                    : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </>
          ) : null}

          <div
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6"
            aria-hidden={progress < 0.02 || progress > 0.55}
          >
            <div className="w-full max-w-[40rem] text-left">
              {STORY_LINES.map((line, index) => (
                <p
                  key={line}
                  className="font-display text-[clamp(1.15rem,2.2vw,1.65rem)] leading-[1.35] text-ink"
                  style={{
                    opacity: storyLineOpacity(progress, index),
                    transition: complete
                      ? undefined
                      : 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <p
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6 text-center font-display text-[clamp(1.125rem,3.5vw,2.875rem)] leading-[0.95] text-ink"
            style={{
              opacity: motto,
              transition: complete ? undefined : 'opacity 0.4s ease',
            }}
            aria-hidden={motto < 0.05}
          >
            MAKE EXTRAORDINARY
          </p>

          {!complete ? (
            <p
              className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center text-ink"
              style={{ opacity: 1 - remap(progress, 0.9, 1) }}
              aria-label="Scroll to continue"
              aria-hidden={progress > 0.95}
            >
              <svg
                className="tk-scroll-arrow"
                width="16"
                height="24"
                viewBox="0 0 16 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M8 21V4" />
                <path d="M2.5 9.5 8 4l5.5 5.5" />
              </svg>
            </p>
          ) : null}

          <AnimatePresence>
            {hovered &&
            captionOrigin &&
            (hovered.title || hovered.hoverDescription) ? (
              <motion.div
                key={hovered.id}
                ref={measureCaption}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: MOTION.hover, ease: MOTION.easeOut }}
                className="pointer-events-none absolute z-20 w-72 bg-void px-2 py-2 text-ink"
                style={{ left: captionOrigin.x, top: captionOrigin.y }}
              >
                <p className="font-display text-lede leading-tight">
                  {hovered.title}
                </p>
                <p className="mt-1 text-caption leading-snug text-mute">
                  {hovered.hoverDescription}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {indexed && complete ? (
          <IndexView
            key="index"
            nodes={nodes}
            onOpen={(href, nodeId) => {
              markOpenedFromCanvas(nodeId);
              router.push(href);
            }}
            onPrefetch={prefetchSheet}
          />
        ) : null}
      </AnimatePresence>

      <div
        data-chrome
        className="absolute bottom-6 left-6 z-30 flex items-center gap-2 px-3 py-1.5 text-sm"
        style={{
          opacity: reveal,
          pointerEvents: complete ? 'auto' : 'none',
        }}
      >
        {(
          // The constellation view stays in the code — only its button is
          // hidden — so restoring it is one line.
          [
            ['index', 'Index'],
            ['matrix2', 'Organized'],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            aria-pressed={viewMode === mode}
            className={`rounded-md px-1.5 focus-visible:outline-none ${
              viewMode === mode ? 'text-ink' : 'text-mute'
            }`}
            onClick={() => onViewMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      {!indexed ? (
        <div
          data-chrome
          className="absolute right-6 bottom-6 z-30 flex items-center gap-1 text-ink"
          style={{
            opacity: reveal,
            pointerEvents: complete ? 'auto' : 'none',
          }}
        >
          <button
            type="button"
            aria-label="Zoom in"
            className="flex h-11 w-11 items-center justify-center rounded-none focus-visible:outline-none"
            onClick={() => onZoomButton(1)}
          >
            <span className="relative block h-3.5 w-3.5" aria-hidden>
              <span className="absolute top-1/2 left-0 h-0.5 w-3.5 -translate-y-1/2 bg-ink" />
              <span className="absolute top-0 left-1/2 h-3.5 w-0.5 -translate-x-1/2 bg-ink" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            className="flex h-11 w-11 items-center justify-center rounded-none focus-visible:outline-none"
            onClick={() => onZoomButton(-1)}
          >
            <span className="block h-0.5 w-3.5 bg-ink" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
