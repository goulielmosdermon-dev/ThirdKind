import { describe, expect, it } from 'vitest';

import { WORLD_HEIGHT, WORLD_WIDTH } from '@/types/content';

import { screenToWorld, worldToScreen } from '@/lib/canvas/coords';
import {
  CLICK_MAX_DURATION_MS,
  CLICK_TRAVEL_PX,
  FIT_PADDING_PX,
  FIT_SCALE_MIN,
  INITIAL_FOCUS_WORLD,
  INITIAL_SCALE,
  MIN_VISIBLE_FRACTION,
  SCALE_MAX,
  SCALE_MIN,
  clampScale,
  clampTranslation,
  clampViewport,
  createInitialViewport,
  isClickGesture,
  viewportReducer,
  viewportToFitRect,
  zoomAroundPoint,
} from '@/lib/canvas/viewport';

const size = { width: 1200, height: 800 };

describe('clampScale', () => {
  it('clamps to the allowed zoom range', () => {
    expect(clampScale(0.1)).toBe(SCALE_MIN);
    expect(clampScale(8)).toBe(SCALE_MAX);
    expect(clampScale(1)).toBe(1);
  });
});

describe('clampTranslation', () => {
  it('keeps 60% of a small world overlapping the viewport', () => {
    const worldSpan = 400;
    const viewSpan = 1000;
    const minOverlap = MIN_VISIBLE_FRACTION * worldSpan;
    const min = minOverlap - worldSpan;
    const max = viewSpan - minOverlap;

    expect(clampTranslation(min - 80, worldSpan, viewSpan)).toBe(min);
    expect(clampTranslation(max + 80, worldSpan, viewSpan)).toBe(max);
    expect(clampTranslation(200, worldSpan, viewSpan)).toBe(200);
  });

  it('lets a large world leave at most 40% of the viewport empty', () => {
    const worldSpan = 3000;
    const viewSpan = 1000;
    const minOverlap = MIN_VISIBLE_FRACTION * viewSpan;
    const min = minOverlap - worldSpan;
    const max = viewSpan - minOverlap;

    expect(clampTranslation(min - 10, worldSpan, viewSpan)).toBe(min);
    expect(clampTranslation(max + 10, worldSpan, viewSpan)).toBe(max);
  });
});

describe('clampViewport', () => {
  it('clamps scale then pan against the world', () => {
    const next = clampViewport({ x: 50_000, y: -50_000, scale: 0.01 }, size);
    expect(next.scale).toBe(FIT_SCALE_MIN);
    const worldW = WORLD_WIDTH * next.scale;
    const worldH = WORLD_HEIGHT * next.scale;
    const minOverlapX = MIN_VISIBLE_FRACTION * Math.min(worldW, size.width);
    const minOverlapY = MIN_VISIBLE_FRACTION * Math.min(worldH, size.height);
    expect(next.x).toBe(size.width - minOverlapX);
    expect(next.y).toBe(minOverlapY - worldH);
  });
});

describe('zoomAroundPoint', () => {
  it('keeps the world point under the cursor stationary', () => {
    const viewport = { x: -200, y: -80, scale: 0.8 };
    const anchor = { x: 640, y: 360 };
    const worldBefore = screenToWorld(anchor, viewport);
    const next = zoomAroundPoint(viewport, 1.6, anchor, {
      width: 4000,
      height: 3000,
    });
    const worldAfter = screenToWorld(anchor, next);
    expect(worldAfter.x).toBeCloseTo(worldBefore.x);
    expect(worldAfter.y).toBeCloseTo(worldBefore.y);
    expect(next.scale).toBe(1.6);
  });
});

describe('viewportReducer', () => {
  it('pans then clamps', () => {
    const start = clampViewport({ x: -100, y: -100, scale: 0.7 }, size);
    const panned = viewportReducer(start, {
      type: 'pan',
      dx: 40,
      dy: -15,
      size,
    });
    expect(panned.x).toBe(start.x + 40);
    expect(panned.y).toBe(start.y - 15);
    expect(panned.scale).toBe(start.scale);
  });
});

describe('isClickGesture', () => {
  it('treats a short, still press as a click', () => {
    expect(isClickGesture(0, 120)).toBe(true);
    expect(
      isClickGesture(CLICK_TRAVEL_PX - 0.1, CLICK_MAX_DURATION_MS - 1),
    ).toBe(true);
  });

  it('rejects a pan by travel or duration', () => {
    expect(isClickGesture(CLICK_TRAVEL_PX, 80)).toBe(false);
    expect(isClickGesture(2, CLICK_MAX_DURATION_MS)).toBe(false);
    expect(isClickGesture(20, 800)).toBe(false);
  });
});

describe('viewportToFitRect', () => {
  it('centers the rect in the viewport with equal side margins', () => {
    const rect = { x: 1000, y: 400, width: 1600, height: 1200 };
    const view = { width: 1200, height: 800 };
    const fitted = viewportToFitRect(rect, view);
    const center = worldToScreen(
      { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
      fitted,
    );
    expect(center.x).toBeCloseTo(view.width / 2);
    expect(center.y).toBeCloseTo(view.height / 2);
    const scaledW = rect.width * fitted.scale;
    const scaledH = rect.height * fitted.scale;
    expect(view.width - scaledW).toBeGreaterThanOrEqual(FIT_PADDING_PX * 2 - 0.5);
    expect(view.height - scaledH).toBeGreaterThanOrEqual(FIT_PADDING_PX * 2 - 0.5);
  });
});

describe('createInitialViewport', () => {
  it('places the constellation focus near the viewport centre', () => {
    const start = createInitialViewport(size);
    const screen = worldToScreen(INITIAL_FOCUS_WORLD, start);
    expect(screen.x).toBeCloseTo(size.width / 2);
    expect(screen.y).toBeCloseTo(size.height / 2);
    expect(start.scale).toBe(INITIAL_SCALE);
  });
});
