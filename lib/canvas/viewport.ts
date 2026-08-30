import { WORLD_HEIGHT, WORLD_WIDTH, type Viewport } from '@/types/content';

import { screenToWorld, type Point } from '@/lib/canvas/coords';
import { MOTION } from '@/lib/motion/tokens';

export type ViewportSize = {
  width: number;
  height: number;
};

export const SCALE_MIN = 0.45;
export const SCALE_MAX = 2.6;
export const INITIAL_SCALE = 0.55;
export const INITIAL_FOCUS_WORLD = { x: 2480, y: 1520 };
export const ZOOM_STEP = 1.25;
export const ZOOM_ANIMATION_MS = MOTION.zoom * 1000;
export const MIN_VISIBLE_FRACTION = 0.6;
export const CLICK_TRAVEL_PX = 6;
export const CLICK_MAX_DURATION_MS = 400;

export type ViewportAction =
  | { type: 'set'; viewport: Viewport; size: ViewportSize }
  | { type: 'pan'; dx: number; dy: number; size: ViewportSize }
  | {
      type: 'zoom';
      scale: number;
      anchor: Point;
      size: ViewportSize;
    };

export function clampScale(scale: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale));
}

/**
 * Keep enough of the world overlapping the viewport that the user cannot
 * pan into empty space. On each axis the overlap must be at least 60% of
 * the smaller of world-span and viewport-span.
 */
export function clampTranslation(
  translation: number,
  worldSpan: number,
  viewSpan: number,
): number {
  const minOverlap = MIN_VISIBLE_FRACTION * Math.min(worldSpan, viewSpan);
  const min = minOverlap - worldSpan;
  const max = viewSpan - minOverlap;
  return Math.min(max, Math.max(min, translation));
}

export function clampViewport(
  viewport: Viewport,
  size: ViewportSize,
): Viewport {
  const scale = clampScale(viewport.scale);
  return {
    x: clampTranslation(viewport.x, WORLD_WIDTH * scale, size.width),
    y: clampTranslation(viewport.y, WORLD_HEIGHT * scale, size.height),
    scale,
  };
}

export function zoomAroundPoint(
  viewport: Viewport,
  nextScale: number,
  screenPoint: Point,
  size: ViewportSize,
): Viewport {
  const world = screenToWorld(screenPoint, viewport);
  const scale = clampScale(nextScale);
  return clampViewport(
    {
      x: screenPoint.x - world.x * scale,
      y: screenPoint.y - world.y * scale,
      scale,
    },
    size,
  );
}

export function createInitialViewport(size: ViewportSize): Viewport {
  const scale = clampScale(INITIAL_SCALE);
  return clampViewport(
    {
      x: size.width / 2 - INITIAL_FOCUS_WORLD.x * scale,
      y: size.height / 2 - INITIAL_FOCUS_WORLD.y * scale,
      scale,
    },
    size,
  );
}

export function viewportReducer(
  state: Viewport,
  action: ViewportAction,
): Viewport {
  switch (action.type) {
    case 'set':
      return clampViewport(action.viewport, action.size);
    case 'pan':
      return clampViewport(
        {
          x: state.x + action.dx,
          y: state.y + action.dy,
          scale: state.scale,
        },
        action.size,
      );
    case 'zoom':
      return zoomAroundPoint(state, action.scale, action.anchor, action.size);
  }
}

export function isClickGesture(travelPx: number, durationMs: number): boolean {
  return travelPx < CLICK_TRAVEL_PX && durationMs < CLICK_MAX_DURATION_MS;
}

export function viewportCenter(size: ViewportSize): Point {
  return { x: size.width / 2, y: size.height / 2 };
}

export function viewportToCenterWorld(
  viewport: Viewport,
  world: Point,
  size: ViewportSize,
): Viewport {
  return clampViewport(
    {
      x: size.width / 2 - world.x * viewport.scale,
      y: size.height / 2 - world.y * viewport.scale,
      scale: viewport.scale,
    },
    size,
  );
}

export function lerpViewport(
  from: Viewport,
  to: Viewport,
  t: number,
): Viewport {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    scale: from.scale + (to.scale - from.scale) * t,
  };
}
