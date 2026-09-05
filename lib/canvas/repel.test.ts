import { describe, expect, it } from 'vitest';

import {
  REPEL_MIN_RADIUS,
  REPEL_MIN_STRENGTH,
  clearOffset,
  repelField,
  repelOffset,
  reservedRect,
} from '@/lib/canvas/repel';

const { radius: REPEL_RADIUS, strength: REPEL_STRENGTH } = repelField(400, 400);
const push = (centre: { x: number; y: number }) =>
  repelOffset(centre, { x: 0, y: 0 }, REPEL_RADIUS, REPEL_STRENGTH);

describe('repelOffset', () => {
  it('pushes a neighbour directly away from the hovered tile', () => {
    const offset = push({ x: 100, y: 0 });
    expect(offset.y).toBe(0);
    expect(offset.x).toBeGreaterThan(0);
  });

  it('leaves tiles beyond the radius where they are', () => {
    expect(push({ x: REPEL_RADIUS, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(push({ x: REPEL_RADIUS + 200, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('eases off with distance', () => {
    const near = push({ x: 60, y: 0 }).x;
    const far = push({ x: 300, y: 0 }).x;
    expect(near).toBeGreaterThan(far);
    expect(near).toBeLessThanOrEqual(REPEL_STRENGTH);
  });

  it('never moves the hovered tile itself', () => {
    expect(push({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe('repelField', () => {
  it('scales reach and push with the hovered tile', () => {
    const small = repelField(200, 200);
    const large = repelField(500, 500);
    expect(large.radius).toBeGreaterThan(small.radius);
    expect(large.strength).toBeGreaterThan(small.strength);
  });

  it('keeps a floor so a small tile still clears its caption', () => {
    const tiny = repelField(40, 40);
    expect(tiny.radius).toBe(REPEL_MIN_RADIUS);
    expect(tiny.strength).toBe(REPEL_MIN_STRENGTH);
  });

  it('measures from the longest side', () => {
    expect(repelField(500, 100)).toEqual(repelField(100, 500));
  });
});

describe('clearOffset', () => {
  const reserved = { x: 100, y: 100, width: 200, height: 200 };

  it('leaves a box that already clears the reserved ground', () => {
    expect(
      clearOffset({ x: 400, y: 400, width: 50, height: 50 }, reserved, 10),
    ).toEqual({ x: 0, y: 0 });
  });

  it('steps out over the nearest edge', () => {
    // Overlapping near the right edge, so the shortest way out is rightward.
    const move = clearOffset(
      { x: 280, y: 180, width: 50, height: 50 },
      reserved,
      10,
    );
    expect(move.y).toBe(0);
    expect(move.x).toBe(30);
  });

  it('moves far enough that nothing overlaps afterwards', () => {
    const box = { x: 150, y: 150, width: 60, height: 60 };
    const move = clearOffset(box, reserved, 12);
    const moved = { ...box, x: box.x + move.x, y: box.y + move.y };
    const stillOverlaps =
      moved.x < reserved.x + reserved.width &&
      moved.x + moved.width > reserved.x &&
      moved.y < reserved.y + reserved.height &&
      moved.y + moved.height > reserved.y;
    expect(stillOverlaps).toBe(false);
  });
});

describe('reservedRect', () => {
  it('covers the tile and the caption beneath it', () => {
    expect(
      reservedRect(
        { x: 10, y: 10, width: 100, height: 100 },
        { x: 10, y: 120, width: 180, height: 60 },
      ),
    ).toEqual({ x: 10, y: 10, width: 180, height: 170 });
  });
});
