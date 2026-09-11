'use client';

import { createContext, useEffect, useRef, useState } from 'react';

import { Reveal, type RevealState } from './Reveal';

/**
 * Where the slide you are inside of stands. Null outside a swapping run, so
 * anything that reads it can fall back to watching the page for itself.
 *
 * A context rather than a prop because the slides are rendered on the server
 * and handed here as elements: a function cannot cross that boundary, but a
 * provider wrapped around them can.
 */
export const SlideState = createContext<RevealState | null>(null);

/** How long an arriving slide waits for the one it replaces to leave. */
const LAG = 0.7;

export type Slide = {
  /** Set on the first slide of a chapter, so the rail can reach it. */
  chapter?: string;
  /** A text slide, read through the line masks. */
  lines?: string[];
  /** Anything else — a mark, a track, a plate. */
  node?: React.ReactNode;
};

/**
 * The whole deck in one place.
 *
 * The frame sticks and never moves: scrolling swaps one slide for the next
 * rather than carrying the page past it. Each slide leaves the way it came —
 * text through its line masks, everything else clipped from the same edge —
 * so the deck reads as slides replacing each other on the spot instead of a
 * long page travelling upward.
 *
 * State is derived from scroll position rather than played as a one-shot, so
 * scrolling back up runs the sequence backwards.
 */
export function SwapRun({
  slides,
  className,
}: {
  slides: Slide[];
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        return;
      }
      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        travel,
      );
      const index = Math.floor((scrolled / travel) * slides.length);
      setActive(Math.min(index, slides.length - 1));
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [slides.length]);

  const stateOf = (i: number): RevealState =>
    i === active ? 'in' : i < active ? 'above' : 'below';

  return (
    <div
      ref={ref}
      className="relative"
      style={{ height: `${(slides.length + 1) * 100}svh` }}
    >
      {/* One marker per chapter, covering the whole stretch of scroll that
          plays it — every slide, not only the first — so the rail both links
          to a chapter and knows which one is being read. */}
      {slides.map((slide, i) => {
        if (!slide.chapter) {
          return null;
        }
        const next = slides.findIndex((s, j) => j > i && s.chapter);
        const span = (next === -1 ? slides.length : next) - i;
        return (
          <div
            key={slide.chapter}
            id={`ch-${slide.chapter}`}
            aria-hidden
            className="pointer-events-none absolute left-0 w-px"
            style={{ top: `${i * 100}svh`, height: `${span * 100}svh` }}
          />
        );
      })}

      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto w-full max-w-[1180px] px-5 md:px-10">
          {/* Stacked in one grid cell, so every slide occupies the same spot
              and the one before it is replaced rather than pushed. Centred in
              the row as well as on the screen: the cell is as tall as the
              longest slide, and without this the short ones sit at the top of
              it and read high. */}
          <div className="grid items-center">
            {slides.map((slide, i) => {
              const state = stateOf(i);
              return (
                <div
                  key={i}
                  className="col-start-1 row-start-1"
                  style={{
                    // Every slide sits in the same cell, so the ones that are
                    // not being read are still lying over the one that is.
                    // They are deaf to the pointer until it is their turn, or
                    // the last slide quietly swallows every click.
                    pointerEvents: state === 'in' ? 'auto' : 'none',
                    // And the one arriving waits for the one it replaces to
                    // finish leaving, or the two read on top of each other.
                    ...(i > 0
                      ? ({ '--reveal-lag': `${LAG}s` } as React.CSSProperties)
                      : {}),
                  }}
                  aria-hidden={state !== 'in'}
                >
                  {slide.lines ? (
                    <Reveal
                      lines={slide.lines}
                      className={`${className} max-w-[44ch]`}
                      state={state}
                    />
                  ) : (
                    <div
                      // The same move the lines make, on a thing that has no
                      // lines: in from below, out through the top.
                      style={{
                        opacity: state === 'in' ? 1 : 0,
                        transform:
                          state === 'in'
                            ? 'none'
                            : state === 'above'
                              ? 'translateY(-6%)'
                              : 'translateY(6%)',
                        transition:
                          'opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 1.15s cubic-bezier(0.22, 1, 0.36, 1)',
                        transitionDelay:
                          state === 'in' && i > 0 ? `${LAG}s` : '0s',
                      }}
                    >
                      <SlideState.Provider value={state}>
                        {slide.node}
                      </SlideState.Provider>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
