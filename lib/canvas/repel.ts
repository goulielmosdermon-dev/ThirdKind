import type { Point } from '@/lib/canvas/coords';

/** Reach of the field, as a multiple of the hovered tile's longest side. */
export const REPEL_RADIUS_FACTOR = 1.7;
/** Furthest push, as a multiple of that same side. */
export const REPEL_STRENGTH_FACTOR = 0.52;
/** Floors, so a small tile still clears room for its caption. */
export const REPEL_MIN_RADIUS = 320;
export const REPEL_MIN_STRENGTH = 110;

/**
 * The field a hovered tile projects. A larger tile displaces its neighbours
 * further, so the gap it opens stays in proportion to the thing being read.
 */
export function repelField(tileWidth: number, tileHeight: number): {
  radius: number;
  strength: number;
} {
  const side = Math.max(tileWidth, tileHeight);
  return {
    radius: Math.max(REPEL_MIN_RADIUS, side * REPEL_RADIUS_FACTOR),
    strength: Math.max(REPEL_MIN_STRENGTH, side * REPEL_STRENGTH_FACTOR),
  };
}

/**
 * How far a neighbour steps aside for the tile being hovered. The push is
 * strongest right beside the cursor and eases to nothing at the radius, so
 * the surrounding tiles part rather than jumping.
 */
export function repelOffset(
  centre: Point,
  from: Point,
  radius: number,
  strength: number,
): Point {
  const dx = centre.x - from.x;
  const dy = centre.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0 || distance >= radius) {
    return { x: 0, y: 0 };
  }
  // Squared falloff: neighbours near the edge of the radius barely move.
  const falloff = (1 - distance / radius) ** 2;
  const push = strength * falloff;
  return { x: (dx / distance) * push, y: (dy / distance) * push };
}

/**
 * The smallest move that takes `box` clear of `reserved`, plus a margin.
 *
 * The radial field alone cannot promise clearance — a tile just outside the
 * radius stays put even when the caption reaches it. This resolves the
 * overlap directly: pick the nearest edge and step over it, so the hovered
 * tile and its caption always end up on empty ground.
 */
export function clearOffset(
  box: { x: number; y: number; width: number; height: number },
  reserved: { x: number; y: number; width: number; height: number },
  margin: number,
): Point {
  const overlaps =
    box.x < reserved.x + reserved.width &&
    box.x + box.width > reserved.x &&
    box.y < reserved.y + reserved.height &&
    box.y + box.height > reserved.y;
  if (!overlaps) {
    return { x: 0, y: 0 };
  }

  const right = reserved.x + reserved.width + margin - box.x;
  const left = reserved.x - margin - (box.x + box.width);
  const down = reserved.y + reserved.height + margin - box.y;
  const up = reserved.y - margin - (box.y + box.height);

  const moves: Point[] = [
    { x: right, y: 0 },
    { x: left, y: 0 },
    { x: 0, y: down },
    { x: 0, y: up },
  ];
  return moves.reduce((best, move) =>
    Math.hypot(move.x, move.y) < Math.hypot(best.x, best.y) ? move : best,
  );
}

/** Union of the hovered tile and its caption — the ground to keep clear. */
export function reservedRect(
  tile: { x: number; y: number; width: number; height: number },
  caption: { x: number; y: number; width: number; height: number },
): { x: number; y: number; width: number; height: number } {
  const x = Math.min(tile.x, caption.x);
  const y = Math.min(tile.y, caption.y);
  return {
    x,
    y,
    width: Math.max(tile.x + tile.width, caption.x + caption.width) - x,
    height: Math.max(tile.y + tile.height, caption.y + caption.height) - y,
  };
}
