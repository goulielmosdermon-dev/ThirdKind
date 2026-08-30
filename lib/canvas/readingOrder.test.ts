import { describe, expect, it } from 'vitest';

import { leafReadingOrder } from '@/lib/canvas/readingOrder';
import type { CanvasNode, LeafCanvasNode } from '@/types/content';

const leaf = (
  id: string,
  hubKey: LeafCanvasNode['hubKey'],
  x: number,
  y: number,
): LeafCanvasNode => ({
  id,
  kind: 'leaf',
  hubKey,
  href: `/${hubKey}/${id}`,
  title: id,
  hoverDescription: id,
  thumbnail: {
    src: '/placeholders/tile-0.svg',
    alt: id,
    width: 480,
    height: 480,
  },
  documentId: id,
  position: { x, y, tileWidth: 96 },
});

describe('leafReadingOrder', () => {
  it('sorts by hub, then top-to-bottom, then left-to-right', () => {
    const nodes: CanvasNode[] = [
      leaf('c', 'thoughts', 10, 10),
      leaf('b', 'work', 80, 10),
      leaf('a', 'work', 10, 10),
      {
        id: 'hub-work',
        kind: 'hub',
        hubKey: 'work',
        label: 'Work',
        description: '',
        position: { x: 0, y: 0, tileWidth: 96 },
      },
    ];

    expect(leafReadingOrder(nodes).map((node) => node.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
