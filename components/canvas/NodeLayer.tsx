'use client';

import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useSyncExternalStore } from 'react';

import type { CanvasNode, LeafCanvasNode, Viewport } from '@/types/content';

import {
  isNodeInView,
  isWorldPointOnScreen,
  tileCenter,
  visibleWorldRect,
  type WorldRect,
} from '@/lib/canvas/geometry';
import { leafReadingOrder } from '@/lib/canvas/readingOrder';
import { INITIAL_FOCUS_WORLD, type ViewportSize } from '@/lib/canvas/viewport';
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
  onHover,
  onFocusNode,
  onActivateNode,
}: {
  nodes: CanvasNode[];
  viewport: Viewport;
  size: ViewportSize;
  panning: boolean;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onFocusNode: (node: LeafCanvasNode) => void;
  onActivateNode: (node: LeafCanvasNode) => void;
}) {
  const pointerFine = usePointerFine();
  const view: WorldRect = visibleWorldRect(viewport, size);
  const inverseScale = 1 / viewport.scale;
  const priorityIds = useMemo(() => nearestLeafIds(nodes), [nodes]);
  const leaves = useMemo(() => leafReadingOrder(nodes), [nodes]);
  const hovered = leaves.find((node) => node.id === hoveredId) ?? null;

  return (
    <>
      {nodes.map((node) => {
        if (node.kind === 'ambient') {
          if (!isNodeInView(node, view, viewport.scale)) {
            return null;
          }
          return (
            <div
              key={node.id}
              aria-hidden
              className="pointer-events-none absolute overflow-hidden"
              style={{
                left: node.position.x,
                top: node.position.y,
                width: node.position.tileWidth,
                height: node.position.tileWidth,
                opacity: node.opacity,
                transform: node.position.rotation
                  ? `rotate(${node.position.rotation}deg)`
                  : undefined,
              }}
            >
              <span className="absolute inset-0">
                <Image
                  src={node.image.src}
                  alt=""
                  fill
                  sizes={`${node.position.tileWidth}px`}
                  unoptimized={node.image.src.endsWith('.svg')}
                  className="object-cover"
                />
              </span>
            </div>
          );
        }

        if (node.kind === 'hub') {
          if (!isNodeInView(node, view, viewport.scale)) {
            return null;
          }
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: MOTION.hub, ease: MOTION.easeOut }}
              className="pointer-events-none absolute w-80"
              style={{
                left: node.position.x,
                top: node.position.y,
                transform: `scale(${inverseScale})`,
                transformOrigin: 'top left',
              }}
            >
              <h2 className="font-display text-display text-ink">
                {node.label}
              </h2>
              <p className="mt-1 max-w-xs text-caption leading-snug text-mute">
                {node.description}
              </p>
            </motion.div>
          );
        }

        return null;
      })}

      {leaves.map((node) => {
        const visible = isNodeInView(node, view, viewport.scale);
        const width = node.position.tileWidth;
        return (
          <button
            key={node.id}
            type="button"
            data-node-id={node.id}
            aria-label={`${node.title}. ${node.hoverDescription}`}
            className="absolute cursor-pointer overflow-hidden border-0 bg-void p-0 ring-1 ring-hairline/50"
            style={{
              left: node.position.x,
              top: node.position.y,
              width,
              height: width,
              transform: node.position.rotation
                ? `rotate(${node.position.rotation}deg)`
                : undefined,
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
            {visible ? (
              <span className="absolute inset-0">
                <span className="tk-loading absolute inset-0" aria-hidden />
                <Image
                  src={node.thumbnail.src}
                  alt={node.thumbnail.alt}
                  fill
                  sizes={`${width}px`}
                  priority={priorityIds.has(node.id)}
                  unoptimized={node.thumbnail.src.endsWith('.svg')}
                  className="object-cover"
                />
              </span>
            ) : null}
          </button>
        );
      })}

      <AnimatePresence>
        {hovered && pointerFine && !panning ? (
          <motion.div
            key={hovered.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: MOTION.hover, ease: MOTION.easeOut }}
            className="pointer-events-none absolute z-10 w-64 border border-hairline bg-void/95 px-4 py-3 text-ink"
            style={{
              left: hovered.position.x,
              top: hovered.position.y + hovered.position.tileWidth + 10,
              transform: `scale(${inverseScale})`,
              transformOrigin: 'top left',
            }}
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
