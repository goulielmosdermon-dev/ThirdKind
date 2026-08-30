'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

import type { Viewport } from '@/types/content';

import type { Point } from '@/lib/canvas/coords';
import {
  ZOOM_ANIMATION_MS,
  clampViewport,
  createInitialViewport,
  lerpViewport,
  viewportReducer,
  viewportToCenterWorld,
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
  animateZoomTo: (scale: number, anchor: Point) => void;
  centerOnWorld: (world: Point) => void;
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

  const cancelAnimation = useCallback(() => {
    if (animRef.current !== 0) {
      cancelAnimationFrame(animRef.current);
      animRef.current = 0;
    }
  }, []);

  const panBy = useCallback(
    (dx: number, dy: number) => {
      cancelAnimation();
      apply({ type: 'pan', dx, dy, size: sizeRef.current });
    },
    [apply, cancelAnimation],
  );

  const zoomTo = useCallback(
    (scale: number, anchor: Point) => {
      cancelAnimation();
      apply({ type: 'zoom', scale, anchor, size: sizeRef.current });
    },
    [apply, cancelAnimation],
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

  useEffect(() => {
    if (!size) {
      return;
    }

    sizeRef.current = size;
    if (!fittedRef.current) {
      fittedRef.current = true;
      commit(createInitialViewport(size));
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
    };
  }, []);

  return {
    viewport,
    panBy,
    zoomTo,
    zoomByFactor,
    animateZoomTo,
    centerOnWorld,
    cancelAnimation,
    readViewport,
  };
}
