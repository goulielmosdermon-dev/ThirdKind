'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type RefObject } from 'react';

import {
  COLUMNS,
  DARK_AT,
  ROWS,
  forgetReadings,
  mediaLuminance,
  solidLuminance,
  verdict,
} from '@/lib/chrome/backdropLuminance';
import type { SurfaceTone } from '@/lib/chrome/useSurfaceTone';

/** Sheet transitions move surfaces for a while, so keep sampling until they land. */
const SETTLE_MS = 700;
const NUDGE_MS = 140;
/** The grid is cheap but not free, so it is read at most this often. */
const EVERY_MS = 90;
/** How often the bar looks again when nothing has announced a change. */
const HEARTBEAT_MS = 1000;

/**
 * Brightness at one point on the screen, read from whatever is topmost there
 * that can answer.
 *
 * The stack is walked rather than only its first entry: a transparent wrapper
 * over a photograph should give the photograph's answer, not give up. What
 * floats over the page says so with data-overlay and is looked straight past —
 * the chrome must not read itself.
 *
 * Returns the tone a declared surface claims when nothing in the stack can be
 * measured, which is the old behaviour, kept for the cases pixels cannot reach:
 * a cross-origin video, a canvas, anything the browser will not let us read.
 */
function toneAt(x: number, y: number): boolean | null {
  for (const element of document.elementsFromPoint(x, y)) {
    if (element.closest('[data-overlay]')) {
      continue;
    }
    if (
      element instanceof HTMLImageElement ||
      element instanceof HTMLVideoElement
    ) {
      const value = mediaLuminance(element, x, y);
      if (value !== null) {
        return value < DARK_AT;
      }
      // Unreadable picture: fall back to what its surface claims rather than
      // letting the point count as light.
      const surface = element.closest('[data-surface]');
      if (surface) {
        return surface.getAttribute('data-surface') === 'dark';
      }
      continue;
    }
    if (element instanceof HTMLElement) {
      const value = solidLuminance(getComputedStyle(element).backgroundColor);
      if (value !== null) {
        return value < DARK_AT;
      }
    }
  }
  return null;
}

/**
 * The tone of the page behind a piece of floating chrome, judged by its pixels.
 *
 * A grid is laid over the chrome and every point is asked how bright the page
 * is there. When more than 65% of the points stand on something dark the
 * chrome is told 'dark', meaning: wear your bright state. It has to fall below
 * 45% to be told otherwise, so a bar hovering at the threshold does not flicker
 * its way down the page.
 */
export function useBackdropTone(
  ref: RefObject<HTMLElement | null>,
): SurfaceTone {
  const pathname = usePathname();
  const [tone, setTone] = useState<SurfaceTone>('light');
  useEffect(() => {
    // A new page is new pictures at the same urls' expense; nothing read for
    // the last one is worth keeping.
    forgetReadings();
    let frame = 0;
    let until = performance.now() + SETTLE_MS;
    let read = 0;

    const loop = () => {
      frame = 0;
      const now = performance.now();
      const element = ref.current;
      const box = element?.getBoundingClientRect();
      if (box && box.width > 0 && now - read >= EVERY_MS) {
        read = now;
        let dark = 0;
        let known = 0;
        // Points sit at the middle of each cell, so none of them lands on the
        // chrome's own edge.
        for (let column = 0; column < COLUMNS; column += 1) {
          for (let row = 0; row < ROWS; row += 1) {
            const x = box.left + ((column + 0.5) / COLUMNS) * box.width;
            const y = box.top + ((row + 0.5) / ROWS) * box.height;
            const isDark = toneAt(x, y);
            if (isDark === null) {
              continue;
            }
            known += 1;
            if (isDark) {
              dark += 1;
            }
          }
        }
        if (known > 0) {
          // The verdict depends on the state the chrome is already in — that
          // is what the two thresholds are — so it is settled against the
          // current value rather than a copy of it.
          setTone((current) => verdict(dark / known, current));
        }
      }
      if (now < until) {
        frame = requestAnimationFrame(loop);
      }
    };

    const ping = (ms: number) => {
      until = Math.max(until, performance.now() + ms);
      if (frame === 0) {
        frame = requestAnimationFrame(loop);
      }
    };

    ping(SETTLE_MS);

    const onMove = () => ping(NUDGE_MS);
    // Not everything that changes what is behind the bar is a scroll: a
    // picture finishing its load, a video playing, a sheet settling. A slow
    // heartbeat catches those without holding a frame loop open all day.
    const heart = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        ping(NUDGE_MS);
      }
    }, HEARTBEAT_MS);
    window.addEventListener('scroll', onMove, { capture: true, passive: true });
    document.addEventListener('scroll', onMove, {
      capture: true,
      passive: true,
    });
    window.addEventListener('resize', onMove);

    const scrollParents: HTMLElement[] = [];
    let node = ref.current?.parentElement ?? null;
    while (node && node !== document.body) {
      node.addEventListener('scroll', onMove, { passive: true });
      scrollParents.push(node);
      node = node.parentElement;
    }
    document
      .querySelectorAll('[data-preview-scroll], [data-sheet-scroller]')
      .forEach((item) => {
        if (item instanceof HTMLElement) {
          item.addEventListener('scroll', onMove, { passive: true });
          scrollParents.push(item);
        }
      });

    return () => {
      window.clearInterval(heart);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', onMove, true);
      document.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
      for (const parent of scrollParents) {
        parent.removeEventListener('scroll', onMove);
      }
    };
  }, [pathname, ref]);

  return tone;
}
