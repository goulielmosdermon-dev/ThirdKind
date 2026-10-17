'use client';

import { useContext, useId, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

import { SlideState } from './SwapRun';

import type { Block } from './deck';

type EaseBlock = Extract<Block, { kind: 'ease' }>;

type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const BASE = 0.75;

function Box({
  label,
  shown,
  still,
  delay,
  from,
  accent,
}: {
  label: string;
  shown: boolean;
  still: boolean;
  delay: number;
  from?: 'left' | 'right';
  accent?: boolean;
}) {
  const move = still ? undefined : `0.55s ${EASE} ${BASE + delay}s`;
  const shift = from === 'left' ? '-0.6em' : from === 'right' ? '0.6em' : '0';
  return (
    <span
      className={`w-max border px-[0.85em] py-[0.5em] font-sans text-[0.58em] leading-none font-extrabold tracking-[0.1em] uppercase ${
        accent ? 'border-select text-select' : 'border-ink text-ink'
      }`}
      style={{
        opacity: shown ? 1 : 0,
        transform: `translateX(${shown ? '0' : shift})`,
        transition: move,
      }}
    >
      {label}
    </span>
  );
}

/**
 * Kahneman's causes and consequences of cognitive ease, drawn rather than
 * shown as a picture: the boxes are type, the arrows are lines, so the
 * figure stays sharp at the size of the slide.
 *
 * Lines are measured from the boxes themselves, so they always leave a
 * cause and arrive at a consequence — they do not sit in a gutter and hope.
 */
export function EaseGraph({
  block,
  className = '',
}: {
  block: EaseBlock;
  className?: string;
}) {
  const slide = useContext(SlideState);
  const reduced = useReducedMotion();
  const shown = slide === null || slide === 'in';
  const still = reduced === true;
  const drawn = shown || still;
  const uid = useId().replace(/:/g, '');

  const rootRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLSpanElement>(null);
  const fromRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const toRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [incoming, setIncoming] = useState<Line[]>([]);
  const [outgoing, setOutgoing] = useState<Line[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const center = centerRef.current;
    if (!root || !center) {
      return;
    }

    const measure = () => {
      const rb = root.getBoundingClientRect();
      const cb = center.getBoundingClientRect();
      const cxIn = cb.left - rb.left;
      const cxOut = cb.right - rb.left;
      const cy = cb.top + cb.height / 2 - rb.top;
      const along = (i: number, n: number) => {
        if (n <= 1) {
          return cy;
        }
        const t = i / (n - 1);
        return cb.top - rb.top + cb.height * (0.18 + t * 0.64);
      };

      const edge = (el: HTMLSpanElement | null, side: 'right' | 'left') => {
        if (!el) {
          return null;
        }
        const b = el.getBoundingClientRect();
        return {
          x: (side === 'right' ? b.right : b.left) - rb.left,
          y: b.top + b.height / 2 - rb.top,
        };
      };

      const causes = fromRefs.current;
      setIncoming(
        causes.flatMap((el, i) => {
          const p = edge(el, 'right');
          return p
            ? [{ x1: p.x, y1: p.y, x2: cxIn, y2: along(i, causes.length) }]
            : [];
        }),
      );
      const effects = toRefs.current;
      setOutgoing(
        effects.flatMap((el) => {
          const p = edge(el, 'left');
          return p ? [{ x1: cxOut, y1: cy, x2: p.x, y2: p.y }] : [];
        }),
      );
    };

    measure();
    const watcher = new ResizeObserver(measure);
    watcher.observe(root);
    return () => watcher.disconnect();
  }, [block.from, block.to, drawn]);

  const move = (duration: number, delay: number) =>
    still ? undefined : `${duration}s ${EASE} ${BASE + delay}s`;

  return (
    <figure className={className}>
      <div
        ref={rootRef}
        className="relative grid grid-cols-[auto_minmax(4rem,1fr)_auto_minmax(4rem,1fr)_auto] grid-rows-4 items-center"
        style={{ minHeight: '15em' }}
      >
        {block.from.map((label, i) => (
          <span
            key={label}
            ref={(node) => {
              fromRefs.current[i] = node;
            }}
            className="col-start-1 justify-self-start"
            style={{ gridRow: i + 1 }}
          >
            <Box
              label={label}
              shown={drawn}
              still={still}
              delay={0.08 * i}
              from="left"
            />
          </span>
        ))}

        <span
          ref={centerRef}
          className="col-start-3 row-span-4 justify-self-center"
        >
          <Box
            label={block.center}
            shown={drawn}
            still={still}
            delay={0.42}
            accent
          />
        </span>

        {block.to.map((label, i) => (
          <span
            key={label}
            ref={(node) => {
              toRefs.current[i] = node;
            }}
            className="col-start-5 justify-self-start"
            style={{ gridRow: i + 1 }}
          >
            <Box
              label={label}
              shown={drawn}
              still={still}
              delay={0.36 + 0.08 * i}
              from="right"
              accent
            />
          </span>
        ))}

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <marker
              id={`${uid}-in`}
              markerWidth="6"
              markerHeight="6"
              refX="5.4"
              refY="3"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
            </marker>
            <marker
              id={`${uid}-out`}
              markerWidth="6"
              markerHeight="6"
              refX="5.4"
              refY="3"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0 0 L6 3 L0 6 Z" fill="currentColor" />
            </marker>
          </defs>
          {incoming.map((line, i) => (
            <line
              key={`in-${i}`}
              {...line}
              stroke="currentColor"
              strokeWidth="1.2"
              markerEnd={`url(#${uid}-in)`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={drawn ? 0 : 1}
              style={{ transition: move(0.7, 0.28 + 0.06 * i) }}
            />
          ))}
          {outgoing.map((line, i) => (
            <line
              key={`out-${i}`}
              {...line}
              stroke="currentColor"
              strokeWidth="1.2"
              markerEnd={`url(#${uid}-out)`}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={drawn ? 0 : 1}
              style={{ transition: move(0.7, 0.48 + 0.06 * i) }}
            />
          ))}
        </svg>
      </div>

      {block.caption ? (
        <figcaption
          className="mt-[1.35em] font-display text-[0.62em] leading-none text-mute"
          style={{
            opacity: drawn ? 1 : 0,
            transition: move(0.5, 0.78),
          }}
        >
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
