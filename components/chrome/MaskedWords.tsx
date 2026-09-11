'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Fragment, useEffect, useRef, useState } from 'react';

import { MOTION } from '@/lib/motion/tokens';

export type MaskedWord = {
  text: string;
  /** Per word, so a line can change voice halfway through it. */
  className?: string;
};

/**
 * A line read a word at a time, each rising out of a mask of its own.
 *
 * The mask is the word's own box, opened up above and below the baseline and
 * pulled back by the same amount: ascenders and descenders clear it without
 * the line taking any more room than it would set plain.
 *
 * Left to `once`, it plays when the line arrives and stays. Set `once` false
 * and the line leaves the way it came in — rising on out through the top of
 * its masks as the reader carries on past, and dropping back down into place
 * on the way back — which is what lets a heading close itself rather than
 * simply being scrolled off.
 */
export function MaskedWords({
  words,
  className,
  once = true,
  amount = 0.4,
}: {
  words: MaskedWord[];
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<'below' | 'shown' | 'above'>('below');

  /*
    Watched here rather than through whileInView, which only plays a line in:
    leaving needs to know which edge the line went out by, so that it rises on
    through the top when the reader carries on and comes back down when they
    turn around.
  */
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
          setState('shown');
          if (once) {
            observer.disconnect();
          }
          return;
        }
        setState(entry.boundingClientRect.top < 0 ? 'above' : 'below');
      },
      { threshold: amount },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [amount, once]);

  return (
    <motion.span
      ref={ref}
      initial="below"
      animate={state}
      variants={{
        below: { transition: { staggerChildren: reduced ? 0 : 0.075 } },
        shown: { transition: { staggerChildren: reduced ? 0 : 0.075 } },
        above: { transition: { staggerChildren: reduced ? 0 : 0.05 } },
      }}
      className={className}
    >
      {words.map((word, index) => (
        <Fragment key={`${word.text}-${index}`}>
          {index > 0 ? ' ' : null}
          <span className="inline-block -mt-[0.12em] -mb-[0.26em] overflow-hidden pt-[0.12em] pb-[0.26em] align-bottom">
            <motion.span
              className={`inline-block ${word.className ?? ''}`}
              variants={{
                below: { y: reduced ? 0 : '110%' },
                shown: {
                  y: 0,
                  transition: {
                    duration: reduced ? MOTION.reduced : 0.85,
                    ease: MOTION.easeOut,
                  },
                },
                above: {
                  y: reduced ? 0 : '-110%',
                  transition: {
                    duration: reduced ? MOTION.reduced : 0.7,
                    ease: MOTION.easeOut,
                  },
                },
              }}
            >
              {word.text}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </motion.span>
  );
}
