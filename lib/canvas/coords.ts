import type { Viewport } from '@/types/content';

export type Point = {
  x: number;
  y: number;
};

export function worldToScreen(world: Point, viewport: Viewport): Point {
  return {
    x: world.x * viewport.scale + viewport.x,
    y: world.y * viewport.scale + viewport.y,
  };
}

export function screenToWorld(screen: Point, viewport: Viewport): Point {
  return {
    x: (screen.x - viewport.x) / viewport.scale,
    y: (screen.y - viewport.y) / viewport.scale,
  };
}

/**
 * Wheel deltas arrive in wildly different units — pixels, lines, pages, and
 * per-device step sizes — so one notch of a mouse wheel can be forty times a
 * trackpad nudge. Normalise to pixels and cap a single event so no one frame
 * can lurch the canvas.
 */
export function normalizeWheelDelta(
  deltaY: number,
  deltaMode: number,
  viewportHeight: number,
  clamp: number,
): number {
  let px = deltaY;
  if (deltaMode === 1) {
    px *= 16;
  } else if (deltaMode === 2) {
    px *= viewportHeight;
  }
  return Math.max(-clamp, Math.min(clamp, px));
}
