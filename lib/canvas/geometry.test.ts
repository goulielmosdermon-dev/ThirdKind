import { describe, expect, it } from 'vitest';

import {
  isNodeInView,
  rectsIntersect,
  tileCenter,
  visibleWorldRect,
} from '@/lib/canvas/geometry';
import type { LeafCanvasNode } from '@/types/content';

const leaf = (overrides: Partial<LeafCanvasNode> = {}): LeafCanvasNode => ({
  id: 'project-a',
  kind: 'leaf',
  hubKey: 'work',
  href: '/work/a',
  title: 'A',
  hoverDescription: 'A line',
  thumbnail: {
    src: '/placeholders/tile-0.svg',
    alt: 'A',
    width: 480,
    height: 480,
  },
  documentId: 'project-a',
  position: { x: 100, y: 100, tileWidth: 128 },
  ...overrides,
});

describe('geometry', () => {
  it('places the tile centre at half the authored width', () => {
    expect(tileCenter({ x: 10, y: 20, tileWidth: 128 })).toEqual({
      x: 74,
      y: 84,
    });
  });

  it('detects AABB overlap', () => {
    expect(
      rectsIntersect(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 9, y: 9, width: 10, height: 10 },
      ),
    ).toBe(true);
    expect(
      rectsIntersect(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 11, y: 0, width: 10, height: 10 },
      ),
    ).toBe(false);
  });

  it('expands the visible world by a 25% margin', () => {
    const view = visibleWorldRect(
      { x: 0, y: 0, scale: 1 },
      { width: 100, height: 80 },
      0.25,
    );
    expect(view.x).toBe(-25);
    expect(view.y).toBe(-20);
    expect(view.width).toBe(150);
    expect(view.height).toBe(120);
  });

  it('culls nodes outside the padded viewport', () => {
    const view = { x: 0, y: 0, width: 200, height: 200 };
    expect(
      isNodeInView(
        leaf({ position: { x: 50, y: 50, tileWidth: 96 } }),
        view,
        1,
      ),
    ).toBe(true);
    expect(
      isNodeInView(
        leaf({ position: { x: 400, y: 50, tileWidth: 96 } }),
        view,
        1,
      ),
    ).toBe(false);
  });
});
