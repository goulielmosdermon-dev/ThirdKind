import { WORLD_HEIGHT, WORLD_WIDTH, type Viewport } from '@/types/content';

import { screenToWorld, type Point } from '@/lib/canvas/coords';
import { MOTION } from '@/lib/motion/tokens';

export type ViewportSize = {
  width: number;
  height: number;
};

export const SCALE_MIN = 0.45;
export const SCALE_MAX = 2.6;
export const FIT_SCALE_MIN = 0.12;
export const FIT_PADDING_PX = 48;
export const INITIAL_SCALE = 0.55;
export const INITIAL_FOCUS_WORLD = { x: 2360, y: 1320 };
export const ZOOM_STEP = 1.25;
export const ZOOM_ANIMATION_MS = MOTION.zoom * 1000;
/** Moving between the showcase and the sections is a journey, not a nudge. */
export const TRAVEL_ANIMATION_MS = 1150;
export const MIN_VISIBLE_FRACTION = 0.6;
/** Time constant for easing the viewport toward its target, in ms. */
export const GLIDE_TAU_MS = 95;
/** Momentum decay per second after a drag ends. */
export const GLIDE_FRICTION = 0.0022;
/** Below this speed (px/ms) a glide is over. */
export const GLIDE_MIN_SPEED = 0.015;
/** A single wheel event may not ask for more than this much delta. */
export const WHEEL_DELTA_CLAMP = 90;
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
  minScale?: number,
): Viewport {
  const floor =
    minScale ?? (viewport.scale < SCALE_MIN ? FIT_SCALE_MIN : SCALE_MIN);
  const scale = Math.min(SCALE_MAX, Math.max(floor, viewport.scale));
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

export function viewportToFitRect(
  rect: { x: number; y: number; width: number; height: number },
  size: ViewportSize,
  paddingPx = FIT_PADDING_PX,
): Viewport {
  const availW = Math.max(1, size.width - paddingPx * 2);
  const availH = Math.max(1, size.height - paddingPx * 2);
  const scale = Math.min(
    SCALE_MAX,
    Math.max(
      FIT_SCALE_MIN,
      Math.min(availW / Math.max(rect.width, 1), availH / Math.max(rect.height, 1)),
    ),
  );
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  return {
    x: size.width / 2 - cx * scale,
    y: size.height / 2 - cy * scale,
    scale,
  };
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
