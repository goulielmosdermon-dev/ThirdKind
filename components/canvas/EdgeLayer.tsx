'use client';

import type { CanvasNode, Edge } from '@/types/content';
import { WORLD_HEIGHT, WORLD_WIDTH } from '@/types/content';

import { tileCenter } from '@/lib/canvas/geometry';

export function EdgeLayer({
  nodes,
  edges,
}: {
  nodes: CanvasNode[];
  edges: Edge[];
}) {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg
      viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
      className="pointer-events-none absolute inset-0 text-hairline"
      aria-hidden
    >
      {edges.map((edge) => {
        const from = byId.get(edge.fromNodeId);
        const to = byId.get(edge.toNodeId);
        if (!from || !to) {
          return null;
        }
        const start = tileCenter(from.position);
        const end = tileCenter(to.position);
        return (
          <line
            key={edge.id}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="currentColor"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
