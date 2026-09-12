'use client';

import { useContext } from 'react';
import { useReducedMotion } from 'motion/react';

import { SlideState } from './SwapRun';

import type { Block } from './deck';

type QuadrantBlock = Extract<Block, { kind: 'quadrant' }>;

/**
 * The dots, as they were drawn.
 *
 * Taken off the source plots rather than invented: the grey of the field, the
 * accent that marks us, and a rule faint enough that the axes read as a
 * crossing rather than as a frame. They are literal values because that is
 * what they are — this one chart's palette, not the site's.
 */
const FIELD = '#8a8a8a';
const MARK = '#00c59a';
const RULE = 'color-mix(in srgb, var(--color-hairline) 62%, transparent)';

/** The axis ends: the deck's voice, set small and tracked so they label. */
const AXIS =
  'font-display uppercase tracking-[0.14em] text-[0.5em] leading-none text-mute whitespace-nowrap';

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * The plot draws itself, in the order you would draw it by hand.
 *
 * Everything is measured from the moment the slide arrives, not from the
 * moment it is mounted: on a swapping deck the slide is rendered long before
 * it is read, and an animation that had already finished by then would never
 * be seen. `BASE` clears the swap itself, so the drawing starts once the slide
 * is actually on screen.
 */
const BASE = 0.75;
const AXIS_DRAW = 0.78;
const LABEL_IN = 0.6;
const DOT_IN = 0.55;
/** Each dot follows the one before it, so the field fills rather than blinks. */
const DOT_STAGGER = 0.07;

/**
 * A positioning plot.
 *
 * The whole thing is sized in `em` off one font size, so the chart scales as a
 * drawing: change the size on the outer box and the dots, the gaps and the
 * type all move together. Points are placed by percentage inside the plot
 * rather than by a viewBox, which keeps every label as real, selectable text
 * in the page's own fonts.
 */
export function Quadrant({
  block,
  className = '',
}: {
  block: QuadrantBlock;
  className?: string;
}) {
  const { title, axes, points } = block;

  /*
    On a swapping deck the slide says when it is being read. On a deck that
    flows there is no such signal and the block is simply there, already faded
    in by the run around it — so `null` means draw it, finished.
  */
  const slide = useContext(SlideState);
  const reduced = useReducedMotion();
  const shown = slide === null || slide === 'in';
  const still = reduced === true;

  /** A transition that does nothing at all when motion is not wanted. */
  const move = (duration: number, delay: number) =>
    still ? undefined : `${duration}s ${EASE} ${BASE + delay}s`;

  const drawn = shown || still;

  return (
    <figure className={className}>
      <figcaption className="mb-[1.2em] font-display text-[0.62em] tracking-[0.16em] text-mute uppercase leading-none">
        {title}
      </figcaption>

      {/* The box the plot is read in. The top and bottom axis names sit
          outside the crossing, so the plot itself is inset by the room they
          take rather than overlapping them. */}
      <div className="relative aspect-[16/10] w-full">
        {/* The names on the upright axis rise into place. */}
        <span
          className={`absolute top-0 left-1/2 ${AXIS}`}
          style={{
            opacity: drawn ? 1 : 0,
            transform: `translateX(-50%) translateY(${drawn ? '0' : '0.7em'})`,
            transition: move(LABEL_IN, 0.45),
          }}
        >
          {axes.top}
        </span>
        <span
          className={`absolute bottom-0 left-1/2 ${AXIS}`}
          style={{
            opacity: drawn ? 1 : 0,
            transform: `translateX(-50%) translateY(${drawn ? '0' : '0.7em'})`,
            transition: move(LABEL_IN, 0.52),
          }}
        >
          {axes.bottom}
        </span>

        <div className="absolute inset-x-0 top-[2.1em] bottom-[2.1em]">
          {/* The upright axis is drawn downward, from the top. */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
            style={{
              background: RULE,
              transformOrigin: 'top',
              transform: `translateX(-50%) scaleY(${drawn ? 1 : 0})`,
              transition: move(AXIS_DRAW, 0),
            }}
          />
          {/* And the level one rightward, from the left. */}
          <span
            aria-hidden
            className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2"
            style={{
              background: RULE,
              transformOrigin: 'left',
              transform: `translateY(-50%) scaleX(${drawn ? 1 : 0})`,
              transition: move(AXIS_DRAW, 0.12),
            }}
          />

          {/* The horizontal axis is named at its ends, just above the rule.
              Each name arrives from its own end, the way the rule did. */}
          <span
            className={`absolute top-1/2 left-0 ${AXIS}`}
            style={{
              opacity: drawn ? 1 : 0,
              transform: `translateY(-165%) translateX(${drawn ? '0' : '-0.8em'})`,
              transition: move(LABEL_IN, 0.45),
            }}
          >
            {axes.left}
          </span>
          <span
            className={`absolute top-1/2 right-0 ${AXIS}`}
            style={{
              opacity: drawn ? 1 : 0,
              transform: `translateY(-165%) translateX(${drawn ? '0' : '0.8em'})`,
              transition: move(LABEL_IN, 0.52),
            }}
          >
            {axes.right}
          </span>

          {points.map((point, i) => {
            const right = point.side !== 'left';
            /* The field lands in the order it is written, and we land last —
               so the eye is walked across the competition and then shown
               where we sit. */
            const delay = 0.75 + i * DOT_STAGGER;
            return (
              <div
                key={point.label}
                className="absolute"
                style={{
                  left: `${50 + point.x * 50}%`,
                  top: `${50 - point.y * 50}%`,
                  opacity: drawn ? 1 : 0,
                  transform: `translateY(${drawn ? '0' : '0.6em'})`,
                  transition: move(DOT_IN, delay),
                }}
              >
                {/* The dot is centred on the coordinate; the name hangs off
                    it, on whichever side the plot had it. It comes up small
                    and settles at size, so the field pops rather than fades. */}
                <span
                  aria-hidden
                  className="absolute rounded-full"
                  style={{
                    width: point.mark ? '1.05em' : '0.8em',
                    height: point.mark ? '1.05em' : '0.8em',
                    background: point.mark ? MARK : FIELD,
                    transform: `translate(-50%, -50%) scale(${drawn ? 1 : 0.4})`,
                    transition: move(DOT_IN, delay),
                  }}
                />
                <span
                  className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap ${
                    right ? 'left-[0.85em]' : 'right-[0.85em]'
                  } ${
                    point.mark
                      ? 'font-display text-[0.78em]'
                      : 'font-sans text-[0.66em] text-ink'
                  }`}
                  style={point.mark ? { color: MARK } : undefined}
                >
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
