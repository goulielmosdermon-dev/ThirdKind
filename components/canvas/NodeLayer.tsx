'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import type { CanvasNode, LeafCanvasNode, Viewport } from '@/types/content';

import { driftStyle } from '@/lib/canvas/drift';
import {
  isNodeInView,
  isWorldPointOnScreen,
  tileCenter,
  visibleWorldRect,
  type WorldRect,
  hoverTileWorldRect,
} from '@/lib/canvas/geometry';
import {
  GRID_HEADER,
  isGridTagLeaf,
  isPoemLeaf,
  sortGridTagLeaves,
} from '@/lib/canvas/gridLayout';
import { leafReadingOrder } from '@/lib/canvas/readingOrder';
import { INITIAL_FOCUS_WORLD, type ViewportSize } from '@/lib/canvas/viewport';
import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import { MOTION } from '@/lib/motion/tokens';

const PRIORITY_COUNT = 6;

function subscribePointerFine(onStoreChange: () => void): () => void {
  const media = window.matchMedia('(pointer: fine)');
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
}

function usePointerFine(): boolean {
  return useSyncExternalStore(
    subscribePointerFine,
    () => window.matchMedia('(pointer: fine)').matches,
    () => false,
  );
}

function nearestLeafIds(nodes: CanvasNode[]): Set<string> {
  return new Set(
    nodes
      .filter((node): node is LeafCanvasNode => node.kind === 'leaf')
      .map((node) => ({
        id: node.id,
        distance: Math.hypot(
          node.position.x - INITIAL_FOCUS_WORLD.x,
          node.position.y - INITIAL_FOCUS_WORLD.y,
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, PRIORITY_COUNT)
      .map((node) => node.id),
  );
}

export function NodeLayer({
  nodes,
  viewport,
  size,
  panning,
  hoveredId,
  packed = false,
  revealEnabled = true,
  aspects,
  onAspect,
  onHover,
  onFocusNode,
  onActivateNode,
}: {
  nodes: CanvasNode[];
  viewport: Viewport;
  size: ViewportSize;
  panning: boolean;
  hoveredId: string | null;
  packed?: boolean;
  revealEnabled?: boolean;
  /** Real height/width per node, measured once each thumbnail decodes. */
  aspects: Record<string, number>;
  onAspect: (id: string, ratio: number) => void;
  onHover: (id: string | null) => void;
  onFocusNode: (node: LeafCanvasNode) => void;
  onActivateNode: (node: LeafCanvasNode) => void;
}) {
  const pointerFine = usePointerFine();
  const reduced = useReducedMotion() ?? false;
  const view: WorldRect = visibleWorldRect(viewport, size);
  const revealView: WorldRect = visibleWorldRect(viewport, size, 0.04);
  const inverseScale = 1 / viewport.scale;
  const priorityIds = useMemo(() => nearestLeafIds(nodes), [nodes]);
  const leaves = useMemo(() => leafReadingOrder(nodes), [nodes]);
  const hubs = nodes.filter((node) => node.kind === 'hub');
  const [entered, setEntered] = useState<ReadonlySet<string>>(() => new Set());
  const tileLeaves = packed
    ? leaves.filter(
        (node) =>
          isPoemLeaf(node) ||
          (node.hubKey !== 'about' && node.hubKey !== 'contact'),
      )
    : leaves;
  const tagLeavesByHub = useMemo(() => {
    if (!packed) {
      return new Map<string, LeafCanvasNode[]>();
    }
    const grouped = new Map<string, LeafCanvasNode[]>();
    for (const node of leaves) {
      if (!isGridTagLeaf(node)) {
        continue;
      }
      const list = grouped.get(node.hubKey) ?? [];
      list.push(node);
      grouped.set(node.hubKey, list);
    }
    for (const [key, list] of grouped) {
      grouped.set(key, sortGridTagLeaves(list));
    }
    return grouped;
  }, [leaves, packed]);

  useEffect(() => {
    if (packed || !revealEnabled) {
      return;
    }
    setEntered((current) => {
      let next: Set<string> | null = null;
      for (const node of nodes) {
        if (node.kind === 'ambient' || current.has(node.id)) {
          continue;
        }
        if (!isNodeInView(node, revealView, viewport.scale)) {
          continue;
        }
        if (!next) {
          next = new Set(current);
        }
        next.add(node.id);
      }
      return next ?? current;
    });
  }, [nodes, packed, revealEnabled, revealView, viewport.scale]);

  const isEntered = (id: string) =>
    packed || reduced || !revealEnabled || entered.has(id);

  return (
    <>
      {hubs.map((node) => {
        if (
          !isNodeInView(node, view, viewport.scale) &&
          !entered.has(node.id)
        ) {
          return null;
        }
        const shown = isEntered(node.id);
        return (
          <motion.div
            key={node.id}
            className="pointer-events-none absolute z-[1]"
            initial={false}
            animate={{ left: node.position.x, top: node.position.y }}
            transition={{ duration: MOTION.hub, ease: MOTION.easeOut }}
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: 'top left',
            }}
          >
            <div
              className={`w-80 bg-void px-1 ${packed ? '' : 'tk-drift'}`}
              style={
                packed ? undefined : driftStyle(node.id, node.position.rotation)
              }
            >
              <motion.div
                initial={false}
                animate={{ opacity: shown ? 1 : 0 }}
                transition={{
                  duration: reduced ? MOTION.reduced : MOTION.sheetIn,
                  ease: MOTION.easeOut,
                }}
              >
                <h2 className="font-sans text-lede font-normal text-ink">
                  {node.label}
                </h2>
              </motion.div>
            </div>
          </motion.div>
        );
      })}

      {hubs.map((hub) => {
        const tags = tagLeavesByHub.get(hub.hubKey);
        if (!tags?.length || !isNodeInView(hub, view, viewport.scale)) {
          return null;
        }
        return (
          <motion.div
            key={`${hub.id}-tags`}
            className="absolute z-[2]"
            initial={false}
            animate={{
              left: hub.position.x,
              top: hub.position.y + GRID_HEADER,
            }}
            transition={{ duration: MOTION.hub, ease: MOTION.easeOut }}
            style={{
              transform: `scale(${inverseScale})`,
              transformOrigin: 'top left',
            }}
          >
            <div className="flex w-80 flex-wrap gap-1.5">
              {tags.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  data-node-id={node.id}
                  aria-label={node.title}
                  className="cursor-pointer rounded-md bg-black/[0.08] px-2.5 py-1 text-xs text-ink"
                  onPointerDown={(event) => event.stopPropagation()}
                  onFocus={() => onFocusNode(node)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onActivateNode(node);
                    }
                  }}
                  onClick={() => onActivateNode(node)}
                >
                  {node.title}
                </button>
              ))}
            </div>
          </motion.div>
        );
      })}

      {tileLeaves.map((node) => {
        const visible = isNodeInView(node, view, viewport.scale);
        const width = node.position.tileWidth;
        const height = node.position.tileHeight ?? width;
        const shown = isEntered(node.id);
        // Hovering opens the tile to twice its size at the thumbnail's own
        // proportions, so the crop lifts and you see the whole frame. Growing
        // from the centre keeps it anchored where the eye already is. The
        // declared width/height are a stand-in for remote media, so the ratio
        // comes from the decoded image wherever we have it.
        const hovered = hoveredId === node.id;
        const grown = hoverTileWorldRect(node, aspects);
        const openWidth = grown?.width ?? width;
        const boxWidth = hovered && grown ? grown.width : width;
        const boxHeight = hovered && grown ? grown.height : height;
        const boxLeft = hovered && grown ? grown.x : node.position.x;
        const boxTop = hovered && grown ? grown.y : node.position.y;
        return (
          <motion.button
            key={node.id}
            type="button"
            data-node-id={node.id}
            aria-label={
              [node.title, node.hoverDescription].filter(Boolean).join('. ') ||
              'Open'
            }
            className={`absolute z-[2] cursor-pointer overflow-hidden border-0 bg-transparent p-0 ${
              packed ? '' : 'tk-drift'
            }`}
            initial={false}
            animate={{
              left: boxLeft,
              top: boxTop,
              width: boxWidth,
              height: boxHeight,
            }}
            transition={{
              duration: reduced ? MOTION.reduced : MOTION.hub,
              ease: MOTION.easeOut,
            }}
            style={{
              zIndex: hoveredId === node.id ? 3 : 2,
              ...(packed
                ? undefined
                : driftStyle(node.id, node.position.rotation)),
            }}
            onMouseEnter={() => {
              if (pointerFine && !panning) {
                onHover(node.id);
              }
            }}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onFocusNode(node)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActivateNode(node);
              }
            }}
          >
            <motion.span
              className="absolute inset-0 block origin-center bg-paper"
              initial={false}
              animate={{
                opacity: shown ? 1 : 0,
                scale: shown ? 1 : 0.92,
              }}
              transition={{
                duration: reduced ? MOTION.reduced : MOTION.sheetIn,
                ease: MOTION.easeOut,
              }}
            >
              {visible && node.swatch ? (
                <span
                  className="absolute inset-0"
                  style={{ backgroundColor: node.swatch }}
                />
              ) : null}
              {visible && !node.swatch ? (
                <span className="absolute inset-0">
                  <Image
                    src={node.thumbnail.src}
                    alt={node.thumbnail.alt}
                    fill
                    sizes={`${openWidth}px`}
                    priority={priorityIds.has(node.id)}
                    unoptimized={isUnoptimizedSrc(node.thumbnail.src)}
                    onLoad={(event) => {
                      const img = event.currentTarget;
                      if (img.naturalWidth > 0) {
                        onAspect(node.id, img.naturalHeight / img.naturalWidth);
                      }
                    }}
                    className="object-cover"
                  />
                </span>
              ) : null}
            </motion.span>
          </motion.button>
        );
      })}
    </>
  );
}

export function shouldCenterOnFocus(
  node: LeafCanvasNode,
  viewport: Viewport,
  size: ViewportSize,
): boolean {
  return !isWorldPointOnScreen(tileCenter(node.position), viewport, size);
}
