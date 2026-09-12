'use client';

import { createContext, useCallback, useEffect, useRef, useState } from 'react';

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

/**
 * How long a step is left alone to land before another is accepted.
 *
 * The deck moves a slide at a time, and a trackpad sends a flick as a long
 * run of wheel events. Without a lock, one gesture would spend the whole run
 * and travel four or five slides — which is the thing being fixed.
 */
const STEP_LOCK_MS = 620;

/** Below this, a wheel event is noise rather than a gesture. */
const WHEEL_THRESHOLD = 6;

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
 * The frame sticks and never moves: moving on swaps one slide for the next
 * rather than carrying the page past it. Each slide leaves the way it came —
 * text through its line masks, everything else clipped from the same edge —
 * so the deck reads as slides replacing each other on the spot instead of a
 * long page travelling upward.
 *
 * The deck is stepped, not scrolled. A wheel gesture, an arrow key or the
 * buttons move it exactly one slide and then hold, so nothing is skimmed past
 * by accident; the page's own scroll position is still what says which slide
 * is up, which is what keeps the index rail, the anchors and the back button
 * working. Touch keeps its native scrolling, because a thumb has no notion of
 * a discrete step.
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
  const activeRef = useRef(0);
  const lockedUntil = useRef(0);

  /** The scroll position that reads as slide `i`: the middle of its band. */
  const offsetOf = useCallback(
    (i: number) => {
      const el = ref.current;
      if (!el) {
        return 0;
      }
      const top = el.getBoundingClientRect().top + window.scrollY;
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        return top;
      }
      const band = travel / slides.length;
      return top + Math.min(travel, band * (i + 0.5));
    },
    [slides.length],
  );

  const go = useCallback(
    (i: number) => {
      const next = Math.min(Math.max(i, 0), slides.length - 1);
      if (next === activeRef.current && Date.now() < lockedUntil.current) {
        return;
      }
      lockedUntil.current = Date.now() + STEP_LOCK_MS;
      activeRef.current = next;
      setActive(next);
      window.scrollTo({ top: offsetOf(next), behavior: 'smooth' });
    },
    [offsetOf, slides.length],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      // While a step is landing the position is mid-flight and would read as
      // whatever it is passing over. The step already said where it is going.
      if (Date.now() < lockedUntil.current) {
        return;
      }
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) {
        return;
      }
      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        travel,
      );
      const index = Math.min(
        Math.floor((scrolled / travel) * slides.length),
        slides.length - 1,
      );
      activeRef.current = index;
      setActive(index);
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(measure);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        return;
      }
      // The deck owns the wheel: a gesture is a step, never a distance.
      event.preventDefault();
      if (Date.now() < lockedUntil.current) {
        return;
      }
      if (Math.abs(event.deltaY) < WHEEL_THRESHOLD) {
        return;
      }
      go(activeRef.current + (event.deltaY > 0 ? 1 : -1));
    };

    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        return;
      }
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          event.preventDefault();
          go(activeRef.current + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'PageUp':
          event.preventDefault();
          go(activeRef.current - 1);
          break;
        case 'Home':
          event.preventDefault();
          go(0);
          break;
        case 'End':
          event.preventDefault();
          go(slides.length - 1);
          break;
        default:
          break;
      }
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // Only a fine pointer is taken over. A thumb scrolls the way it always
    // did, and the position it lands on still says which slide is up.
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (fine) {
      window.addEventListener('wheel', onWheel, { passive: false });
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [go, slides.length]);

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

      {/* The controls ride with the viewport, not with the run: they are the
          one part of the deck that is always in the same place. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
        <div className="pointer-events-auto mx-auto flex w-full max-w-[1180px] items-center justify-between gap-6 px-5 pb-5 md:px-10 md:pb-7">
          <p className="font-sans text-[0.6875rem] leading-none tracking-[0.09em] text-mute uppercase tabular-nums">
            {String(active + 1).padStart(2, '0')} /{' '}
            {String(slides.length).padStart(2, '0')}
          </p>

          <div className="flex items-center gap-2">
            <StepButton
              label="Previous slide"
              disabled={active === 0}
              onClick={() => go(active - 1)}
              d="M15 5 8 12l7 7"
            />
            <StepButton
              label="Next slide"
              disabled={active === slides.length - 1}
              onClick={() => go(active + 1)}
              d="M9 5l7 7-7 7"
            />
          </div>
        </div>

        {/* How far through the deck you are, across the foot of the page. */}
        <div
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              'color-mix(in srgb, var(--color-hairline) 70%, transparent)',
          }}
        >
          <div
            className="h-full bg-ink transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${((active + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** One of the two steps, drawn as a chevron so it needs no font. */
function StepButton({
  label,
  disabled,
  onClick,
  d,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  d: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink transition-opacity duration-200 disabled:pointer-events-none disabled:opacity-25"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </button>
  );
}
