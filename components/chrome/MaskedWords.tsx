'use client';

import { motion, useInView, useReducedMotion } from 'motion/react';
import { Fragment, useRef } from 'react';

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
 * and it runs backwards on the way out, which is what lets a heading close
 * itself as the reader leaves the section it belongs to.
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
  /*
    Watched, and the state written from what it says, rather than left to
    whileInView: that only plays the line in. Falling back out of it on the
    way past depends on there being no `animate` to return to, which is a
    quiet rule to build a section's closing move on.
  */
  const inView = useInView(ref, { amount, once });

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={inView ? 'shown' : 'hidden'}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: reduced ? 0 : 0.075 } },
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
                hidden: { y: reduced ? 0 : '110%' },
                shown: {
                  y: 0,
                  transition: {
                    duration: reduced ? MOTION.reduced : 0.85,
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
