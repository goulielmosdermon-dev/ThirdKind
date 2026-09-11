'use client';

import { useEffect, type RefObject } from 'react';

import { normalizeWheelDelta } from '@/lib/canvas/coords';

/** Time constant of the approach, in ms. Larger is looser. */
const TAU_MS = 105;
/** A single wheel event may not ask for more than this much travel. */
const DELTA_CLAMP = 220;
/** Below this distance the glide is over. */
const SETTLE_PX = 0.4;

/**
 * Eases the wheel instead of jumping with it.
 *
 * The browser applies a wheel event to `scrollTop` in one step, which reads
 * as a series of hops on a page of large images. This carries a target and
 * approaches it exponentially — frame-rate independent, and new input moves
 * the target rather than restarting an animation.
 *
 * Only fine pointers are taken over: touch has its own inertia, and keyboard
 * and scrollbar dragging stay native, with the target resynced whenever the
 * element scrolls by any means other than this loop.
 */
export function useSmoothScroll(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const fine = window.matchMedia('(pointer: fine)').matches;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || still) {
      return;
    }

    let target = element.scrollTop;
    let raf = 0;
    let last = 0;
    /*
      The last position this loop wrote. A scroll event is dispatched at the
      next paint rather than when scrollTop is assigned, so a flag set around
      the assignment is already false again by the time the event arrives and
      cannot tell our own scrolling from anyone else's. The position can.
    */
    let written = -1;

    const step = (now: number) => {
      const previous = last || now;
      // Capped so a background tab cannot teleport the page on return.
      const dt = Math.min(64, Math.max(1, now - previous));
      last = now;

      const current = element.scrollTop;
      const next = current + (target - current) * (1 - Math.exp(-dt / TAU_MS));
      if (Math.abs(target - next) < SETTLE_PX) {
        element.scrollTop = target;
        written = element.scrollTop;
        raf = 0;
        last = 0;
        return;
      }
      element.scrollTop = next;
      written = element.scrollTop;
      raf = requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      // The intro claims its own gesture; it has already been prevented.
      if (event.defaultPrevented || event.ctrlKey) {
        return;
      }
      const limit = element.scrollHeight - element.clientHeight;
      if (limit <= 0) {
        return;
      }
      event.preventDefault();
      const delta = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        element.clientHeight,
        DELTA_CLAMP,
      );
      target = Math.min(limit, Math.max(0, target + delta));
      written = element.scrollTop;
      if (raf === 0) {
        last = 0;
        raf = requestAnimationFrame(step);
      }
    };

    // Anything that scrolls the element without going through the loop —
    // a scrollbar drag, a keypress, an anchor — takes it over: the glide is
    // abandoned there and then, rather than left to finish and pull the
    // reader back to where the wheel had been heading.
    const onScroll = () => {
      const now = element.scrollTop;
      if (Math.abs(now - written) <= 1) {
        return;
      }
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
      target = now;
    };

    element.addEventListener('wheel', onWheel, { passive: false });
    element.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('scroll', onScroll);
      if (raf !== 0) {
        cancelAnimationFrame(raf);
      }
    };
  }, [ref]);
}
