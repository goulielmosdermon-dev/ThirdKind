'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from 'motion/react';

import { clamp01 } from '@/lib/intro/layout';

type IntroValue = {
  progress: number;
  complete: boolean;
  /** True while the intro is playing itself out. */
  autoplay: boolean;
  advance: (delta: number) => void;
};

const IntroContext = createContext<IntroValue | null>(null);

/**
 * Where the intro opens. The hands and the story that used to come before the
 * motto are gone, so progress starts just short of "Extraordinary" and the
 * timeline in lib/intro/layout carries on from there unchanged.
 */
const INTRO_START = 0.72;

/**
 * The intro plays in beats: "Extraordinary", a hold, "in a world of
 * ordinary", a hold, and the page fades up. Each entry is [elapsed ms,
 * progress], interpolated in between, so a beat is lengthened by moving one
 * number rather than re-timing the whole thing.
 */
const AUTOPLAY_BEATS: ReadonlyArray<readonly [number, number]> = [
  [0, INTRO_START],
  [300, INTRO_START],
  // "Extraordinary".
  [1300, 0.8],
  // "in a world of ordinary", after a beat.
  [2400, 0.9],
  // Held, then the page fades up.
  [4000, 0.94],
  [4800, 1],
];

const AUTOPLAY_MS = AUTOPLAY_BEATS[AUTOPLAY_BEATS.length - 1]![0];

/** Progress at `elapsed`, straight-lined between the beats either side of it. */
function autoplayProgress(elapsed: number): number {
  for (let i = 1; i < AUTOPLAY_BEATS.length; i += 1) {
    const [prevAt, prevValue] = AUTOPLAY_BEATS[i - 1]!;
    const [at, value] = AUTOPLAY_BEATS[i]!;
    if (elapsed <= at) {
      const span = at - prevAt;
      const t = span > 0 ? (elapsed - prevAt) / span : 1;
      return prevValue + (value - prevValue) * t;
    }
  }
  return 1;
}

export function IntroProvider({
  children,
  skip = false,
}: {
  children: ReactNode;
  skip?: boolean;
}) {
  const reduced = useReducedMotion() === true;
  const [progress, setProgress] = useState(skip ? 1 : INTRO_START);
  // Only known in the browser, so it settles on the first effect rather than
  // during render; until then the intro is treated as hand-driven.
  const [autoplay, setAutoplay] = useState(false);

  // Adjusting state during render rather than in an effect: once the intro is
  // skipped it stays played out, so returning to the canvas does not rewind it.
  const [wasSkipped, setWasSkipped] = useState(skip);
  if (skip !== wasSkipped) {
    setWasSkipped(skip);
    if (skip) {
      setProgress(1);
    }
  }

  // The intro plays by itself on every screen: the motto lands a line at a
  // time and the page fades up without the reader having to do anything.
  useEffect(() => {
    if (skip) {
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) {
        setAutoplay(true);
      }
      start ??= now;
      const elapsed = now - start;
      const played = clamp01(autoplayProgress(elapsed));
      // Never runs backwards over a drag that has already carried further.
      setProgress((current) => Math.max(current, played));
      if (elapsed < AUTOPLAY_MS) {
        frame = requestAnimationFrame(tick);
      } else {
        setAutoplay(false);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [skip]);

  const advance = useCallback((delta: number) => {
    setProgress((current) => clamp01(current + delta));
  }, []);

  const resolved = skip || reduced ? 1 : progress;

  const value = useMemo(
    () => ({
      progress: resolved,
      complete: resolved >= 0.999,
      autoplay: autoplay && !skip && !reduced,
      advance,
    }),
    [advance, autoplay, reduced, resolved, skip],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

export function useIntro(): IntroValue {
  const value = useContext(IntroContext);
  if (!value) {
    throw new Error('useIntro must be used within IntroProvider');
  }
  return value;
}
