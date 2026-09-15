'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

import { useNarrow } from '@/lib/chrome/useNarrow';
import {
  ALIEN_ASPECT,
  ALIEN_CONTACT,
  HUMAN_ASPECT,
  HUMAN_CONTACT,
  HUMAN_SCALE,
} from '@/lib/intro/layout';

/**
 * The hands, meeting, at the head of Services.
 *
 * The same two assets the site opens on, held horizontally this time: the
 * alien hand reaching in from the left, the human from the right, and the
 * fingertips touching dead centre. Where they meet is the subject of the
 * page, so a ring is drawn around the touch and named.
 *
 * The placement is worked out from the same contact points the intro uses
 * rather than by eye, so the fingertips meet exactly, at every width, and go
 * on meeting if the artwork is ever recut.
 */

/**
 * The frame the hands are composed in, and how much of it a hand fills.
 *
 * Wide, like the reach itself — but a phone has no width to give away, so
 * there the frame stands taller and the hands take a smaller share of its
 * height, which comes to about the same reach across.
 */
const FRAME = {
  wide: { ratio: 2.8, alienHeight: 0.85 },
  phone: { ratio: 1.55, alienHeight: 0.55 },
} as const;

/**
 * The human hand sits a hair below the line the fingers meet on, the way a
 * hand reaching up to another one does. A share of the frame's height, and a
 * small one: any more and they stop touching.
 */
const HUMAN_DROP = 0.018;

/**
 * Where the two hands sit.
 *
 * The fingertips are brought together first, which puts the touch at the
 * centre of the frame — but the alien hand is much the wider of the two, so
 * centring the touch leaves the whole group sitting left with a hole of black
 * to the right of it. The pair is therefore slid back until the group itself
 * is centred, and the touch, which is what the ring and the words hang off,
 * moves with it.
 */
function place(ratio: number, alienHeight: number) {
  const humanHeight = alienHeight * HUMAN_SCALE;
  // Widths as a share of the frame, once the frame's own ratio is taken out.
  const alienWidth = (alienHeight * ALIEN_ASPECT) / ratio;
  const humanWidth = (humanHeight * HUMAN_ASPECT) / ratio;
  const alienLeft = 0.5 - alienWidth * ALIEN_CONTACT.x;
  const humanLeft = 0.5 - humanWidth * HUMAN_CONTACT.x;
  // What it takes to put as much black on the left of the pair as the right.
  const slide = (1 - (alienLeft + humanLeft + humanWidth)) / 2;
  return {
    touch: { x: 0.5 + slide, y: 0.5 },
    alien: {
      left: alienLeft + slide,
      top: 0.5 - alienHeight * ALIEN_CONTACT.y,
      width: alienWidth,
    },
    human: {
      left: humanLeft + slide,
      top: 0.5 - humanHeight * HUMAN_CONTACT.y + HUMAN_DROP,
      width: humanWidth,
    },
  };
}

/**
 * The artwork is drawn on a slant — both hands reach downhill. Each is turned
 * about its own fingertip so the two meet along a level line, the way they do
 * when they are set side by side. Turning about the contact point is what
 * keeps them touching exactly while they turn.
 */
const ALIEN_TURN = -14;
const HUMAN_TURN = -15;

/** How far apart they start, as a share of their own width. */
const APART = 26;

/** The reach in, and everything that waits on it landing. */
const REACH_S = 1.5;
const TOUCHED_S = REACH_S - 0.15;
const REACH = [0.22, 1, 0.36, 1] as const;

export function ServicesHands() {
  const reduced = useReducedMotion() ?? false;
  const narrow = useNarrow();
  const frame = narrow ? FRAME.phone : FRAME.wide;
  const hands = place(frame.ratio, frame.alienHeight);
  // Nothing travels for a reader who asked for stillness: the hands are
  // already touching, the ring already drawn.
  const from = (x: number) => (reduced ? {} : { x: `${x}%`, opacity: 0 });
  const to = { x: '0%', opacity: 1 };
  const reach = reduced
    ? { duration: 0 }
    : { duration: REACH_S, ease: REACH, opacity: { duration: 0.6 } };

  return (
    <div
      data-surface="dark"
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: `${frame.ratio}` }}
      role="img"
      aria-label="A constellation hand and a human hand reaching toward each other, the point where they meet marked “our work together”."
    >
      <motion.div
        className="absolute"
        style={{
          left: `${hands.alien.left * 100}%`,
          top: `${hands.alien.top * 100}%`,
          width: `${hands.alien.width * 100}%`,
        }}
        initial={from(-APART)}
        animate={to}
        transition={reach}
      >
        <div
          style={{
            transform: `rotate(${ALIEN_TURN}deg)`,
            transformOrigin: `${ALIEN_CONTACT.x * 100}% ${ALIEN_CONTACT.y * 100}%`,
          }}
        >
          <Image
            src="/brand/hand-alien.png"
            alt=""
            width={3354}
            height={2203}
            priority
            sizes="60vw"
            // The artwork is drawn dark for paper. On this ground it is turned
            // over, the same way the canvas turns it over on its dark passages.
            className="h-auto w-full [filter:invert(1)]"
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute"
        style={{
          left: `${hands.human.left * 100}%`,
          top: `${hands.human.top * 100}%`,
          width: `${hands.human.width * 100}%`,
        }}
        initial={from(APART)}
        animate={to}
        transition={reach}
      >
        <div
          style={{
            transform: `rotate(${HUMAN_TURN}deg)`,
            transformOrigin: `${HUMAN_CONTACT.x * 100}% ${HUMAN_CONTACT.y * 100}%`,
          }}
        >
          <Image
            src="/brand/hand-human.png"
            alt=""
            width={2517}
            height={1819}
            priority
            sizes="50vw"
            className="h-auto w-full [filter:invert(1)]"
          />
        </div>
      </motion.div>

      {/* The ring is centred on the touch itself, wherever the pair has slid
          to, and turns for as long as the page is open — the work is the part
          that keeps going. Small: it marks the touch, it does not replace it. */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: `${hands.touch.x * 100}%`,
          top: `${hands.touch.y * 100}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`relative aspect-square ${
            narrow ? 'w-[5.5rem]' : 'w-[min(13vw,8.5rem)]'
          }`}
        >
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden
            initial={reduced ? undefined : { rotate: -90 }}
            animate={reduced ? undefined : { rotate: 270 }}
            transition={
              reduced
                ? undefined
                : {
                    duration: 22,
                    ease: 'linear',
                    repeat: Infinity,
                    delay: TOUCHED_S,
                  }
            }
          >
            <motion.circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.6"
              // Drawn on once the hands have met, and closed: the ring is a
              // ring, not a run of one.
              initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      pathLength: {
                        duration: 1.6,
                        ease: 'easeInOut',
                        delay: TOUCHED_S,
                      },
                      opacity: { duration: 0.3, delay: TOUCHED_S },
                    }
              }
            />
          </motion.svg>
          <motion.p
            // Over the ring rather than inside it: the ring marks the touch,
            // and the words stand above the mark. Difference keeps them
            // readable wherever a finger runs behind them.
            className="font-display absolute bottom-full left-1/2 mb-[0.9em] -translate-x-1/2 text-center text-[clamp(1rem,2vw,1.45rem)] leading-tight whitespace-nowrap text-white mix-blend-difference"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.7, delay: TOUCHED_S + 0.35 }
            }
          >
            Our work together
          </motion.p>
        </div>
      </div>
    </div>
  );
}
