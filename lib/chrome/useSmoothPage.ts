'use client';

import { useEffect } from 'react';

import { normalizeWheelDelta } from '@/lib/canvas/coords';

/** Time constant of the approach, in ms. Larger is looser. */
const TAU_MS = 130;
/** A single wheel event may not ask for more than this much travel. */
const DELTA_CLAMP = 260;
/** Below this distance the glide is over. */
const SETTLE_PX = 0.4;

/**
 * Eases the wheel on the page itself, the way useSmoothScroll does inside the
 * canvas.
 *
 * The browser applies a wheel event to the scroll position in one step, which
 * reads as a series of hops on a page of large plates. This carries a target
 * and approaches it exponentially — frame-rate independent, and new input
 * moves the target rather than restarting an animation.
 *
 * It drives the real scroll position rather than transforming a wrapper, so
 * `position: sticky` and every IntersectionObserver on the page keep working;
 * a transform-based smooth scroll silently breaks both.
 *
 * Only fine pointers are taken over: touch has its own inertia, and keyboard,
 * anchors and scrollbar dragging stay native, with the target resynced
 * whenever the page scrolls by any means other than this loop.
 */
export function useSmoothPage(): void {
  useEffect(() => {
    const scroller = document.scrollingElement as HTMLElement | null;
    if (!scroller) {
      return;
    }
    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) {
      return;
    }

    let target = scroller.scrollTop;
    let raf = 0;
    let last = 0;
    let driving = false;

    const step = (now: number) => {
      const previous = last || now;
      // Capped so a background tab cannot teleport the page on return.
      const dt = Math.min(64, Math.max(1, now - previous));
      last = now;

      const current = scroller.scrollTop;
      const next = current + (target - current) * (1 - Math.exp(-dt / TAU_MS));
      driving = true;
      if (Math.abs(target - next) < SETTLE_PX) {
        scroller.scrollTop = target;
        driving = false;
        raf = 0;
        last = 0;
        return;
      }
      scroller.scrollTop = next;
      driving = false;
      raf = requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey) {
        return;
      }
      const limit = scroller.scrollHeight - window.innerHeight;
      if (limit <= 0) {
        return;
      }
      event.preventDefault();
      const delta = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        window.innerHeight,
        DELTA_CLAMP,
      );
      target = Math.min(limit, Math.max(0, target + delta));
      if (raf === 0) {
        last = 0;
        raf = requestAnimationFrame(step);
      }
    };

    const onScroll = () => {
      if (!driving && raf === 0) {
        target = scroller.scrollTop;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      if (raf !== 0) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);
}
