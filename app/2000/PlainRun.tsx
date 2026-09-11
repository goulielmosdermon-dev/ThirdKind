'use client';

import { useEffect, useRef, useState } from 'react';

import { Reveal, type RevealState } from './Reveal';

/**
 * Watches an element against a band across the middle of the screen and says
 * where it stands: waiting below, read, or gone out through the top.
 *
 * The band rather than the whole viewport, so a thing both arrives and leaves
 * while it is still in front of the reader. Which way it went is read from
 * where it sits against the middle, not against the top edge — it clears the
 * band long before it clears the screen, and at that moment its top is still
 * a positive number.
 */
export function useCrossing(
  ref: React.RefObject<HTMLElement | null>,
): RevealState {
  const [state, setState] = useState<RevealState>('below');

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          setState('in');
          return;
        }
        const box = entry.boundingClientRect;
        setState(
          box.top + box.height / 2 < window.innerHeight / 2 ? 'above' : 'below',
        );
      },
      { threshold: 0, rootMargin: '-30% 0px -30% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return state;
}

/**
 * One text slide, on its own screen.
 *
 * Where a pinned run holds the page still and swaps one text for the next,
 * this lets the page scroll and works the masks instead: the lines rise in as
 * the slide reaches the middle of the screen and leave through the top as it
 * carries on. Nothing sticks, nothing is held back.
 */
export function PlainRun({
  lines,
  className,
}: {
  lines: string[];
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useCrossing(ref);

  return (
    <div ref={ref} className="flex min-h-svh items-center">
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-10">
        <Reveal
          lines={lines}
          className={`${className} max-w-[44ch]`}
          state={state}
        />
      </div>
    </div>
  );
}
