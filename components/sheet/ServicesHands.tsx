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
  wide: { ratio: 2.35, alienHeight: 0.7 },
  phone: { ratio: 1.55, alienHeight: 0.55 },
} as const;

/** Where the two hands sit for their fingertips to meet at the centre. */
function place(ratio: number, alienHeight: number) {
  const humanHeight = alienHeight * HUMAN_SCALE;
  // Widths as a share of the frame, once the frame's own ratio is taken out.
  const alienWidth = (alienHeight * ALIEN_ASPECT) / ratio;
  const humanWidth = (humanHeight * HUMAN_ASPECT) / ratio;
  return {
    alien: {
      left: 0.5 - alienWidth * ALIEN_CONTACT.x,
      top: 0.5 - alienHeight * ALIEN_CONTACT.y,
      width: alienWidth,
    },
    human: {
      left: 0.5 - humanWidth * HUMAN_CONTACT.x,
      top: 0.5 - humanHeight * HUMAN_CONTACT.y,
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

      {/* The ring is centred on the touch, and turns for as long as the page
          is open — the work is the part that keeps going. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          // Wide enough to ring the touch and hold the words, never so wide
          // that it becomes the picture instead of the hands.
          className={`relative aspect-square ${
            narrow ? 'w-[min(46%,13rem)]' : 'w-[min(26%,17rem)]'
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
              // Drawn on once the hands have met, and left a little short of
              // a full turn: the gap is what makes the ring read as going
              // round rather than as a circle sitting still.
              initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: reduced ? 1 : 0.84, opacity: 1 }}
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
            // The words fall over the fingers as much as over the ground, so they
            // are set to difference: white on the black, black on the hand.
            className="font-display absolute inset-0 flex items-center justify-center px-[12%] text-center text-[clamp(0.78rem,2.6cqi,1.45rem)] leading-tight text-balance text-white mix-blend-difference"
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
