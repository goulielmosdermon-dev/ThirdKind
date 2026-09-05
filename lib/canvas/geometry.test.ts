import { describe, expect, it } from 'vitest';

import {
  isNodeInView,
  overlapArea,
  pickAdjacentHoverCaptionScreen,
  pickHoverCaptionScreen,
  rectsIntersect,
  spokeAnchor,
  tileCenter,
  visibleWorldRect,
} from '@/lib/canvas/geometry';
import type { HubCanvasNode, LeafCanvasNode, TileWidth } from '@/types/content';

/** Smallest authored tile width; the hover cases only need a known size. */
const TILE: TileWidth = 96;

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

  it('uses tileHeight when the tile is not square', () => {
    expect(
      tileCenter({ x: 10, y: 20, tileWidth: 176, tileHeight: 96 }),
    ).toEqual({
      x: 98,
      y: 68,
    });
  });

  it('hides hub spoke origins behind the heading', () => {
    const hub: HubCanvasNode = {
      id: 'hub-work',
      kind: 'hub',
      hubKey: 'work',
      label: 'Work',
      description: 'Films',
      position: { x: 100, y: 200, tileWidth: 224 },
    };
    expect(spokeAnchor(hub, 0.5)).toEqual({ x: 260, y: 244 });
    expect(spokeAnchor(leaf(), 1)).toEqual({ x: 164, y: 164 });
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

  it('measures overlapping area', () => {
    expect(
      overlapArea(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 0, width: 10, height: 10 },
      ),
    ).toBe(50);
    expect(
      overlapArea(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 0, width: 10, height: 10 },
      ),
    ).toBe(0);
  });

  it('keeps hover copy next to the hovered tile', () => {
    const hovered = leaf({
      position: { x: 40, y: 40, tileWidth: TILE },
    });
    const blocker = leaf({
      id: 'project-b',
      documentId: 'project-b',
      position: { x: 40, y: 130 + TILE, tileWidth: TILE },
    });
    const origin = pickHoverCaptionScreen(
      hovered,
      [hovered, blocker],
      { x: 0, y: 0, scale: 1 },
      { width: 900, height: 700 },
    );

    const tileCx = 40 + TILE / 2;
    const tileCy = 40 + TILE / 2;
    const distance = Math.hypot(
      origin.x + 144 - tileCx,
      origin.y + 52 - tileCy,
    );
    expect(distance).toBeLessThan(220);
  });

  it('pins grid hover copy under the tile', () => {
    const hovered = leaf({
      position: { x: 200, y: 80, tileWidth: TILE },
    });
    const origin = pickAdjacentHoverCaptionScreen(
      hovered,
      { x: 0, y: 0, scale: 1 },
      { width: 900, height: 700 },
    );

    expect(origin.x).toBe(200);
    // Flush against the tile's lower edge, no gap.
    expect(origin.y).toBe(80 + TILE);
    expect(origin.above).toBe(false);
  });

  it('flips the copy above a tile sitting at the foot of the screen', () => {
    const hovered = leaf({
      position: { x: 200, y: 520, tileWidth: TILE },
    });
    const origin = pickAdjacentHoverCaptionScreen(
      hovered,
      { x: 0, y: 0, scale: 1 },
      { width: 900, height: 700 },
      undefined,
      { width: 288, height: 104 },
    );

    expect(origin.above).toBe(true);
    // Flush against the tile's upper edge, not sitting on the image.
    expect(origin.y + 104).toBe(520);
  });
});
