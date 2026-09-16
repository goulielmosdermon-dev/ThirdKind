'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Fragment, useEffect, useRef, useState } from 'react';

import { MOTION } from '@/lib/motion/tokens';

/*
  The masks a word rises through.

  Slower than the line that only ever arrives: this one turns over in front of
  the reader every few seconds, and a move you watch repeatedly wants more time
  in it than one you catch once on the way past.
*/
const WORD_IN = 1.5;
const WORD_OUT = 1.25;
const STAGGER_IN = 0.1;
const STAGGER_OUT = 0.075;

/*
  How far a word travels to be out of sight.

  Its own height is not enough: a glyph is drawn well above and below the line
  box it is measured by — at this size, by a good part of it — so a word moved
  its own height leaves the tops of the tall letters and the tails of the
  descenders sitting in the mask. Far enough that nothing is left behind.
*/
const TRAVEL = 175;

/** How long a line stands, once it is all the way in. */
const HOLD_MS = 2000;

type Phase = 'below' | 'shown' | 'above';

/** How long a line of `count` words takes to arrive, and to leave. */
const inMs = (count: number) => (WORD_IN + STAGGER_IN * (count - 1)) * 1000;
const outMs = (count: number) => (WORD_OUT + STAGGER_OUT * (count - 1)) * 1000;

/**
 * One line at a time, each read through the same masks.
 *
 * A phrase rises a word at a time out of its masks, stands for a beat, then
 * leaves the way it came — up and out through the top — and the next one
 * follows it. The masks are the words' own boxes, opened above and below the
 * baseline so ascenders and descenders clear them without the line taking any
 * more room than it would set plain.
 *
 * Nothing turns over off-screen: the run is held while the band is out of
 * sight, so a reader who arrives always arrives at the start of a line rather
 * than halfway through one leaving.
 */
export function MaskedCycle({
  phrases,
  className,
  holdMs = HOLD_MS,
}: {
  /** The lines, in the order they are read. Split into words on the spaces. */
  phrases: readonly string[];
  className?: string;
  holdMs?: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('below');

  const words = (phrases[index] ?? '').split(' ').filter(Boolean);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const watcher = new IntersectionObserver(
      ([entry]) => setSeen(entry?.isIntersecting ?? false),
      // Held to a band across the middle of the screen: the line turns over
      // where it can be watched, not as it clips the bottom edge.
      { threshold: 0, rootMargin: '-25% 0px -25% 0px' },
    );
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);

  useEffect(() => {
    if (!seen) {
      return;
    }
    const count = Math.max(words.length, 1);
    // Each phase sets the clock for the next: in, stand, out, and on to the
    // line after it.
    const wait =
      phase === 'below'
        ? 60
        : phase === 'shown'
          ? (reduced ? 0 : inMs(count)) + holdMs
          : reduced
            ? 0
            : outMs(count);
    const timer = window.setTimeout(() => {
      if (phase === 'below') {
        setPhase('shown');
      } else if (phase === 'shown') {
        setPhase('above');
      } else {
        setIndex((current) => (current + 1) % Math.max(phrases.length, 1));
        setPhase('below');
      }
    }, wait);
    return () => window.clearTimeout(timer);
  }, [holdMs, phase, phrases.length, reduced, seen, words.length]);

  return (
    // Every line is laid in the same cell, the ones not being read held there
    // unseen: the band is then as tall as its longest line at any width, and
    // the page below it does not move as the lines turn over.
    <span ref={ref} className={`grid ${className ?? ''}`}>
      {phrases.map((phrase) => (
        <span
          key={phrase}
          aria-hidden
          className="invisible col-start-1 row-start-1"
        >
          {phrase}
        </span>
      ))}
      <motion.span
        className="col-start-1 row-start-1"
        initial="below"
        animate={phase}
        variants={{
          below: { transition: { staggerChildren: reduced ? 0 : STAGGER_IN } },
          shown: { transition: { staggerChildren: reduced ? 0 : STAGGER_IN } },
          above: { transition: { staggerChildren: reduced ? 0 : STAGGER_OUT } },
        }}
      >
        {words.map((word, at) => (
          <Fragment key={`${index}-${at}`}>
            {at > 0 ? ' ' : null}
            <span className="inline-block -mt-[0.12em] -mb-[0.26em] overflow-hidden pt-[0.12em] pb-[0.26em] align-bottom">
              <motion.span
                className="inline-block"
                // The word is moved, nothing else: given its own layer, the
                // travel is the compositor's job rather than the page's.
                style={{ willChange: 'transform' }}
                variants={{
                  below: { y: reduced ? 0 : `${TRAVEL}%` },
                  shown: {
                    y: 0,
                    transition: {
                      duration: reduced ? MOTION.reduced : WORD_IN,
                      ease: MOTION.easeOut,
                    },
                  },
                  above: {
                    y: reduced ? 0 : `-${TRAVEL}%`,
                    transition: {
                      duration: reduced ? MOTION.reduced : WORD_OUT,
                      ease: MOTION.easeOut,
                    },
                  },
                }}
              >
                {word}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </motion.span>
    </span>
  );
}
