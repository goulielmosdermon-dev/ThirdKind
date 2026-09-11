'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type RefObject } from 'react';

export type SurfaceTone = 'light' | 'dark';

/** Sheet transitions move surfaces for a while, so keep sampling until they land. */
const SETTLE_MS = 700;
const NUDGE_MS = 140;

/**
 * Surfaces declare their own tone with data-surface. Reading the hit-test stack
 * rather than the marker list keeps the answer correct when a light panel is
 * layered over a dark one.
 *
 * Only what floats over the page is looked past, and it says so with
 * data-overlay. data-chrome is a different question — it asks the canvas not
 * to start a drag from here — and the footer answers yes to it while being as
 * much a surface as anything else on the page. Reading the one as the other
 * left the bar in its light state over a black footer.
 */
function toneBehind(x: number, y: number): SurfaceTone {
  for (const element of document.elementsFromPoint(x, y)) {
    if (element.closest('[data-overlay]')) {
      continue;
    }
    const surface = element.closest('[data-surface]');
    return surface?.getAttribute('data-surface') === 'dark' ? 'dark' : 'light';
  }
  return 'light';
}

/** Tone of whatever sits directly behind the given chrome element. */
export function useSurfaceTone(
  ref: RefObject<HTMLElement | null>,
): SurfaceTone {
  const pathname = usePathname();
  const [tone, setTone] = useState<SurfaceTone>('light');

  useEffect(() => {
    let frame = 0;
    let until = performance.now() + SETTLE_MS;

    const loop = () => {
      frame = 0;
      const element = ref.current;
      const box = element?.getBoundingClientRect();
      if (box && box.width > 0) {
        setTone(toneBehind(box.left + box.width / 2, box.top + box.height / 2));
      }
      if (performance.now() < until) {
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
    window.addEventListener('scroll', onMove, {
      capture: true,
      passive: true,
    });
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
