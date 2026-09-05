'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

import type { Viewport } from '@/types/content';

import type { Point } from '@/lib/canvas/coords';
import {
  GLIDE_FRICTION,
  GLIDE_MIN_SPEED,
  GLIDE_TAU_MS,
  ZOOM_ANIMATION_MS,
  clampViewport,
  createInitialViewport,
  lerpViewport,
  viewportReducer,
  viewportToCenterWorld,
  viewportToFitRect,
  zoomAroundPoint,
  type ViewportAction,
  type ViewportSize,
} from '@/lib/canvas/viewport';

const FALLBACK_SIZE: ViewportSize = { width: 1280, height: 800 };

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function useViewport(size: ViewportSize | null): {
  viewport: Viewport;
  panBy: (dx: number, dy: number) => void;
  zoomTo: (scale: number, anchor: Point) => void;
  zoomByFactor: (factor: number, anchor: Point) => void;
  /** Wheel zoom: moves a target the viewport eases toward, so bursts of
   *  events read as one continuous move rather than a series of jumps. */
  smoothZoomByFactor: (factor: number, anchor: Point) => void;
  /** Carries a finished drag on with decaying momentum. */
  glideBy: (vx: number, vy: number) => void;
  animateZoomTo: (scale: number, anchor: Point) => void;
  centerOnWorld: (world: Point) => void;
  animateTo: (end: Viewport) => void;
  animateFitRect: (rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  cancelAnimation: () => void;
  readViewport: () => Viewport;
} {
  const sizeRef = useRef<ViewportSize>(size ?? FALLBACK_SIZE);

  const [viewport, dispatch] = useReducer(
    viewportReducer,
    FALLBACK_SIZE,
    createInitialViewport,
  );

  const draftRef = useRef<Viewport>(viewport);
  const rafRef = useRef(0);
  const animRef = useRef(0);
  const fittedRef = useRef(false);
  // Where the viewport is heading, and how fast it was thrown.
  const targetRef = useRef<Viewport>(viewport);
  const velocityRef = useRef({ x: 0, y: 0 });
  const easeRef = useRef(0);
  const lastFrameRef = useRef(0);

  const flush = useCallback(() => {
    rafRef.current = 0;
    dispatch({
      type: 'set',
      viewport: draftRef.current,
      size: sizeRef.current,
    });
  }, []);

  const commit = useCallback(
    (next: Viewport) => {
      draftRef.current = clampViewport(next, sizeRef.current);
      if (rafRef.current === 0) {
        rafRef.current = requestAnimationFrame(flush);
      }
    },
    [flush],
  );

  const apply = useCallback(
    (action: ViewportAction) => {
      commit(viewportReducer(draftRef.current, action));
    },
    [commit],
  );

  const stopEasing = useCallback(() => {
    if (easeRef.current !== 0) {
      cancelAnimationFrame(easeRef.current);
      easeRef.current = 0;
    }
    velocityRef.current = { x: 0, y: 0 };
    lastFrameRef.current = 0;
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animRef.current !== 0) {
      cancelAnimationFrame(animRef.current);
      animRef.current = 0;
    }
    stopEasing();
  }, [stopEasing]);

  /**
   * One loop drives both behaviours: an exponential approach toward the zoom
   * target, and momentum left over from a drag. Exponential easing is
   * frame-rate independent and has no fixed duration, so fresh input during a
   * move simply moves the target instead of restarting an animation.
   */
  const runEase = useCallback(() => {
    if (easeRef.current !== 0) {
      return;
    }
    const step = (now: number) => {
      const previous = lastFrameRef.current || now;
      // Cap dt so a background tab or a dropped frame cannot teleport things.
      const dt = Math.min(64, Math.max(1, now - previous));
      lastFrameRef.current = now;

      const current = draftRef.current;
      const velocity = velocityRef.current;
      let moving = false;

      if (velocity.x !== 0 || velocity.y !== 0) {
        const decay = Math.exp(-GLIDE_FRICTION * dt);
        targetRef.current = clampViewport(
          {
            ...targetRef.current,
            x: targetRef.current.x + velocity.x * dt,
            y: targetRef.current.y + velocity.y * dt,
          },
          sizeRef.current,
        );
        velocity.x *= decay;
        velocity.y *= decay;
        if (Math.hypot(velocity.x, velocity.y) < GLIDE_MIN_SPEED) {
          velocityRef.current = { x: 0, y: 0 };
        } else {
          moving = true;
        }
      }

      const target = targetRef.current;
      const t = 1 - Math.exp(-dt / GLIDE_TAU_MS);
      const next = lerpViewport(current, target, t);
      const settled =
        Math.abs(next.x - target.x) < 0.05 &&
        Math.abs(next.y - target.y) < 0.05 &&
        Math.abs(next.scale - target.scale) < 0.0002;

      commit(settled ? target : next);

      if (!settled || moving) {
        easeRef.current = requestAnimationFrame(step);
      } else {
        easeRef.current = 0;
        lastFrameRef.current = 0;
      }
    };
    easeRef.current = requestAnimationFrame(step);
  }, [commit]);

  const panBy = useCallback(
    (dx: number, dy: number) => {
      cancelAnimation();
      apply({ type: 'pan', dx, dy, size: sizeRef.current });
      targetRef.current = draftRef.current;
    },
    [apply, cancelAnimation],
  );

  const zoomTo = useCallback(
    (scale: number, anchor: Point) => {
      cancelAnimation();
      apply({ type: 'zoom', scale, anchor, size: sizeRef.current });
      targetRef.current = draftRef.current;
    },
    [apply, cancelAnimation],
  );

  const smoothZoomByFactor = useCallback(
    (factor: number, anchor: Point) => {
      if (animRef.current !== 0) {
        cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      }
      // Compose onto the target, not the drawn frame, so rapid wheel events
      // accumulate instead of each one starting over from behind.
      targetRef.current = zoomAroundPoint(
        targetRef.current,
        targetRef.current.scale * factor,
        anchor,
        sizeRef.current,
      );
      runEase();
    },
    [runEase],
  );

  const glideBy = useCallback(
    (vx: number, vy: number) => {
      velocityRef.current = { x: vx, y: vy };
      targetRef.current = draftRef.current;
      runEase();
    },
    [runEase],
  );

  const zoomByFactor = useCallback(
    (factor: number, anchor: Point) => {
      zoomTo(draftRef.current.scale * factor, anchor);
    },
    [zoomTo],
  );

  const readViewport = useCallback(() => draftRef.current, []);

  const animateTo = useCallback(
    (end: Viewport) => {
      cancelAnimation();
      const start = draftRef.current;
      const origin = performance.now();

      targetRef.current = clampViewport(end, sizeRef.current);

      const step = (now: number) => {
        const t = Math.min(1, (now - origin) / ZOOM_ANIMATION_MS);
        const eased = easeOutCubic(t);
        commit(lerpViewport(start, end, eased));
        if (t < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          animRef.current = 0;
        }
      };

      animRef.current = requestAnimationFrame(step);
    },
    [cancelAnimation, commit],
  );

  const animateZoomTo = useCallback(
    (scale: number, anchor: Point) => {
      animateTo(
        zoomAroundPoint(draftRef.current, scale, anchor, sizeRef.current),
      );
    },
    [animateTo],
  );

  const centerOnWorld = useCallback(
    (world: Point) => {
      animateTo(
        viewportToCenterWorld(draftRef.current, world, sizeRef.current),
      );
    },
    [animateTo],
  );

  const animateFitRect = useCallback(
    (rect: { x: number; y: number; width: number; height: number }) => {
      animateTo(viewportToFitRect(rect, sizeRef.current));
    },
    [animateTo],
  );

  useEffect(() => {
    if (!size) {
      return;
    }

    sizeRef.current = size;
    if (!fittedRef.current) {
      fittedRef.current = true;
      const initial = createInitialViewport(size);
      targetRef.current = initial;
      commit(initial);
      return;
    }

    commit(draftRef.current);
  }, [commit, size]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== 0) {
        cancelAnimationFrame(rafRef.current);
      }
      if (animRef.current !== 0) {
        cancelAnimationFrame(animRef.current);
      }
      if (easeRef.current !== 0) {
        cancelAnimationFrame(easeRef.current);
      }
    };
  }, []);

  return {
    viewport,
    panBy,
    zoomTo,
    zoomByFactor,
    smoothZoomByFactor,
    glideBy,
    animateZoomTo,
    centerOnWorld,
    animateTo,
    animateFitRect,
    cancelAnimation,
    readViewport,
  };
}
