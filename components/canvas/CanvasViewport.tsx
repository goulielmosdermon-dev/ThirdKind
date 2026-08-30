'use client';

import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import type { CanvasNode, Edge, LeafCanvasNode } from '@/types/content';
import { WORLD_HEIGHT, WORLD_WIDTH } from '@/types/content';

import type { Point } from '@/lib/canvas/coords';
import { tileCenter } from '@/lib/canvas/geometry';
import { useViewport } from '@/lib/canvas/useViewport';
import {
  CLICK_TRAVEL_PX,
  ZOOM_STEP,
  isClickGesture,
  viewportCenter,
  type ViewportSize,
} from '@/lib/canvas/viewport';

import { EdgeLayer } from '@/components/canvas/EdgeLayer';
import { NodeLayer, shouldCenterOnFocus } from '@/components/canvas/NodeLayer';
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

type PanSession = {
  pointerId: number;
  lastX: number;
  lastY: number;
  startTime: number;
  travel: number;
  leafId: string | null;
  suppressClick: boolean;
};

export function CanvasViewport({
  nodes,
  edges,
}: {
  nodes: CanvasNode[];
  edges: Edge[];
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<ViewportSize | null>(null);
  const [panning, setPanning] = useState(false);
  const [gestureActive, setGestureActive] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const router = useRouter();
  const { markOpenedFromCanvas } = useSheetNav();

  const {
    viewport,
    panBy,
    zoomTo,
    zoomByFactor,
    animateZoomTo,
    centerOnWorld,
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

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const intensity = event.ctrlKey ? 0.012 : 0.0025;
      zoomByFactor(
        Math.exp(-event.deltaY * intensity),
        localPoint(event, frame),
      );
    };

    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
  }, [zoomByFactor]);

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
      event.target.closest('[data-chrome]')
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
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame || !pointersRef.current.has(event.pointerId)) {
      return;
    }

    const point = localPoint(event, frame);
    pointersRef.current.set(event.pointerId, point);

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

    const pan = panRef.current;
    if (
      pan &&
      pan.pointerId === event.pointerId &&
      !pan.suppressClick &&
      pan.leafId &&
      isClickGesture(pan.travel, event.timeStamp - pan.startTime)
    ) {
      const node = nodes.find((candidate) => candidate.id === pan.leafId);
      if (node?.kind === 'leaf') {
        markOpenedFromCanvas(node.id);
        router.push(node.href);
      }
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
    if (!size) {
      return;
    }
    if (shouldCenterOnFocus(node, readViewport(), size)) {
      centerOnWorld(tileCenter(node.position));
    }
  };

  const onZoomButton = (direction: 1 | -1) => {
    if (!size) {
      return;
    }
    const factor = direction === 1 ? ZOOM_STEP : 1 / ZOOM_STEP;
    animateZoomTo(viewport.scale * factor, viewportCenter(size));
  };

  return (
    <div
      ref={frameRef}
      className={`relative h-dvh w-dvw overflow-hidden bg-neutral-950 select-none ${
        panning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute origin-top-left"
        style={{
          width: WORLD_WIDTH,
          height: WORLD_HEIGHT,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          willChange: gestureActive ? 'transform' : undefined,
        }}
      >
        <EdgeLayer nodes={nodes} edges={edges} />
        {size ? (
          <NodeLayer
            nodes={nodes}
            viewport={viewport}
            size={size}
            panning={panning}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onFocusNode={onFocusNode}
            onActivateNode={openLeaf}
          />
        ) : null}
      </div>

      <p className="pointer-events-none absolute top-8 left-10 text-6xl font-semibold tracking-tight text-white">
        Third
      </p>
      <p className="pointer-events-none absolute right-10 bottom-24 text-6xl font-semibold tracking-tight text-white">
        Kind
      </p>

      <p className="pointer-events-none absolute bottom-6 left-6 rounded-full border border-neutral-600 px-3 py-1.5 text-sm text-neutral-300">
        Click a node to open it
      </p>

      <div
        data-chrome
        className="absolute right-6 bottom-6 flex items-center gap-2 text-sm text-neutral-200"
      >
        <span>Zoom</span>
        <button
          type="button"
          aria-label="Zoom in"
          className="flex h-11 w-11 items-center justify-center border border-neutral-600"
          onClick={() => onZoomButton(1)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="flex h-11 w-11 items-center justify-center border border-neutral-600"
          onClick={() => onZoomButton(-1)}
        >
          −
        </button>
      </div>
    </div>
  );
}
