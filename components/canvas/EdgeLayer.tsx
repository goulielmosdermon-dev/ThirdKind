'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import type { CanvasNode, Edge, Viewport } from '@/types/content';
import { WORLD_HEIGHT, WORLD_WIDTH } from '@/types/content';

import { isNodeInView, spokeAnchor, visibleWorldRect } from '@/lib/canvas/geometry';
import type { ViewportSize } from '@/lib/canvas/viewport';
import { MOTION } from '@/lib/motion/tokens';

export function EdgeLayer({
  nodes,
  edges,
  scale,
  viewport,
  size,
  hoveredId,
  revealEnabled = true,
}: {
  nodes: CanvasNode[];
  edges: Edge[];
  scale: number;
  viewport?: Viewport;
  size?: ViewportSize | null;
  hoveredId: string | null;
  revealEnabled?: boolean;
}) {
  const reduced = useReducedMotion() ?? false;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const isHovered = (edge: Edge) =>
    edge.toNodeId === hoveredId || edge.fromNodeId === hoveredId;
  const idle = edges.filter((edge) => !isHovered(edge));
  const active = edges.filter(isHovered);
  const [drawn, setDrawn] = useState<ReadonlySet<string>>(() => new Set());
  const view =
    viewport && size
      ? visibleWorldRect(viewport, size, 0.04)
      : null;

  useEffect(() => {
    if (!revealEnabled || !view) {
      return;
    }
    setDrawn((current) => {
      let next: Set<string> | null = null;
      const lookup = new Map(nodes.map((node) => [node.id, node]));
      for (const edge of edges) {
        if (current.has(edge.id)) {
          continue;
        }
        const from = lookup.get(edge.fromNodeId);
        const to = lookup.get(edge.toNodeId);
        if (!from || !to) {
          continue;
        }
        if (
          !isNodeInView(from, view, scale) &&
          !isNodeInView(to, view, scale)
        ) {
          continue;
        }
        if (!next) {
          next = new Set(current);
        }
        next.add(edge.id);
      }
      return next ?? current;
    });
  }, [edges, nodes, revealEnabled, scale, view]);

  const line = (edge: Edge, hover: boolean) => {
    const from = byId.get(edge.fromNodeId);
    const to = byId.get(edge.toNodeId);
    if (!from || !to) {
      return null;
    }
    const start = spokeAnchor(from, scale);
    const end = spokeAnchor(to, scale);
    const shown =
      reduced || !revealEnabled || hover || drawn.has(edge.id);
    return (
      <line
        key={edge.id}
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        pathLength={1}
        stroke={hover ? 'var(--color-ink)' : 'var(--color-hairline)'}
        strokeWidth={hover ? 2.4 : 0.85}
        strokeDasharray="1"
        strokeDashoffset={shown ? 0 : 1}
        vectorEffect="non-scaling-stroke"
        style={{
          transition: reduced
            ? undefined
            : `stroke-dashoffset ${MOTION.sheetIn}s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      />
    );
  };

  return (
    <svg
      viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      {idle.map((edge) => line(edge, false))}
      {active.map((edge) => line(edge, true))}
    </svg>
  );
}
