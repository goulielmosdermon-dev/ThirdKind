'use client';

import { useEffect, useRef, useState } from 'react';

import { Reveal, type RevealState } from './Reveal';

/**
 * A run of consecutive text slides, pinned.
 *
 * The outer element is tall — one viewport of scroll per text, plus one to
 * hold the last — and the frame inside it sticks. So the page stops advancing
 * while you scroll through it: the texts swap in place, each masking out
 * through the top of its lines as the next masks in from below.
 *
 * State is derived from scroll position rather than played as a one-shot, so
 * scrolling back up runs the sequence backwards: a text that left upward
 * comes back down into place.
 */
export function PinnedRun({
  texts,
  className,
}: {
  texts: string[][];
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) return;

      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        travel,
      );
      const index = Math.floor((scrolled / travel) * texts.length);
      setActive(Math.min(index, texts.length - 1));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [texts.length]);

  const stateOf = (i: number): RevealState =>
    i === active ? 'in' : i < active ? 'above' : 'below';

  return (
    <div ref={ref} style={{ height: `${(texts.length + 1) * 100}svh` }}>
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto w-full max-w-[1180px] px-5 md:px-10">
          {/* Stacked in one grid cell so every text occupies the same spot. */}
          <div className="grid">
            {texts.map((lines, i) => (
              <div key={i} className="col-start-1 row-start-1">
                <Reveal
                  lines={lines}
                  className={`${className} max-w-[44ch]`}
                  state={stateOf(i)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
