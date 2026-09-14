'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

import type { LeafCanvasNode } from '@/types/content';

import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import { PillLabel } from '@/components/sheet/PillLabel';
import { EDITORIAL_LINE, EDITORIAL_LINE_PHONE } from '@/lib/type/display';

/** How many pieces the reel carries. */
const SHOWS = 5;

/**
 * Pieces the reel passes over, by the route they open.
 *
 * Not a judgement on the writing — both are still in the index and on their
 * own pages. The reel stands white type on the still itself, and these two
 * are shot against near-white, so the words sat on nothing. Kept as a list of
 * routes rather than an image swap: the pictures are right for the pieces,
 * they are only wrong for this one treatment.
 */
/**
 * The piece the reel opens on, by the route it opens.
 *
 * Reading order decides the rest; this one is chosen, because the first slide
 * is the only one everybody sees.
 */
const LEAD = '/thoughts/business-to-business-advertising-secrets';

const SKIP = new Set([
  '/thoughts/the-hidden-value-of-young-creative-teams',
  '/thoughts/10-ways-to-craft-commercials-that-sell-in-2025',
]);
/** How long a piece holds the screen before the reel moves on. */
const HOLD_MS = 6000;
/** The crossfade between one piece and the next. */
const FADE = 'opacity 900ms cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * The writing, as a reel rather than a list.
 *
 * One piece at a time fills the screen: the still full bleed, the section it
 * belongs to, its line, and the button, all standing on the picture at the
 * bottom-left. The pieces are marked out along the foot as a run of rules, one
 * per piece, and the one being read is the one that is drawn.
 *
 * Every still is mounted and stacked, and the reel crossfades between them by
 * opacity alone. Swapping the `src` of a single frame would show the next
 * picture arriving, which on a screen-sized image is a visible load rather
 * than a cut.
 */
export function ThoughtsReel({
  items: all,
  phone,
  onOpen,
  onPrefetch,
}: {
  items: LeafCanvasNode[];
  phone: boolean;
  onOpen: (href: string, nodeId: string) => void;
  onPrefetch?: (href: string) => void;
}) {
  // Five. Every piece gets a rule along the foot, and a row of ten of those
  // stops reading as a place in a run and starts reading as a scrollbar.
  const pool = all.filter((node) => !SKIP.has(node.href));
  const items = [
    ...pool.filter((node) => node.href === LEAD),
    ...pool.filter((node) => node.href !== LEAD),
  ].slice(0, SHOWS);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [seen, setSeen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const frame = useRef<HTMLElement>(null);

  /*
    The reel does not start until it is on screen. Run from mount, it spends
    its first two or three slides while the reader is still somewhere up the
    page, so by the time they arrive the piece chosen to open on has already
    been and gone. It also stops again when they leave, which is what keeps a
    reader who scrolls back finding the slide they left.
  */
  useEffect(() => {
    const el = frame.current;
    if (!el) {
      return;
    }
    const watcher = new IntersectionObserver(
      ([entry]) => setSeen(entry?.isIntersecting ?? false),
      // Half of it: enough that the reel is what is being looked at rather
      // than something clipping the bottom of the screen.
      { threshold: 0.5 },
    );
    watcher.observe(el);
    return () => watcher.disconnect();
  }, []);

  useEffect(() => {
    if (items.length < 2 || held || reduced || !seen) {
      return;
    }
    const timer = window.setTimeout(
      () => setActive((i) => (i + 1) % items.length),
      HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, held, items.length, reduced, seen]);

  const current = items[active] ?? items[0];
  if (!current) {
    return null;
  }
  const kicker = current.tags?.[0] ?? 'Article';

  return (
    <section
      ref={frame}
      // Out of the index's gutter and across the whole screen: the picture is
      // the section, and a margin either side of it would make it a card.
      className="relative -mx-12 h-[90svh] overflow-hidden bg-black md:-mx-[12vw]"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      aria-roledescription="carousel"
      aria-label="Writing"
    >
      {items.map((node, index) => (
        <Image
          key={node.id}
          src={node.thumbnail.src}
          alt=""
          fill
          sizes="100vw"
          priority={index === 0}
          unoptimized={isUnoptimizedSrc(node.thumbnail.src)}
          className="object-cover"
          style={{
            opacity: index === active ? 1 : 0,
            transition: reduced ? undefined : FADE,
          }}
        />
      ))}

      {/* The copy sits on the picture, and a picture is whatever it happens
          to be — one of these is a pink dummy on white. The wash runs across
          rather than up, because the words stand in the middle of the frame
          now and a gradient weighted to the foot would leave them on bare
          picture. A second, lighter one along the bottom carries the rules.
          Both are heavy enough for the brightest still in the run, not the
          average one. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgb(0 0 0 / 0.74) 0%, rgb(0 0 0 / 0.5) 30%, rgb(0 0 0 / 0.18) 58%, rgb(0 0 0 / 0) 80%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgb(0 0 0 / 0.4) 0%, rgb(0 0 0 / 0) 26%)',
        }}
      />

      {/* The words sit in the middle of the frame, not at its foot: the still
          is the section, and hanging the copy off the bottom edge made it
          read as a caption under a picture rather than as the piece itself. */}
      <div
        className={`absolute inset-0 flex items-center ${
          phone ? 'px-12' : 'px-[12vw]'
        }`}
      >
        <div className="max-w-[46rem]">
          <p className="font-sans text-[0.6875rem] leading-none tracking-[0.09em] text-white/70 uppercase">
            {kicker}
          </p>
          <p
            className="mt-4 font-display leading-snug tracking-[-0.015em] text-white"
            style={{
              fontSize: phone ? EDITORIAL_LINE_PHONE : EDITORIAL_LINE,
            }}
          >
            {current.title}
          </p>

          <button
            type="button"
            className="mt-7 cursor-pointer border-0 bg-transparent p-0"
            onClick={() => onOpen(current.href, current.id)}
            onPointerEnter={() => onPrefetch?.(current.href)}
            onFocus={() => onPrefetch?.(current.href)}
          >
            <PillLabel label="Read now" tone="paper" />
          </button>
        </div>
      </div>

      {/* One rule per piece, held at the foot while the words stay centred.
          The reel is short enough that a row of them reads as a place in a
          run rather than as a scrollbar. */}
      {items.length > 1 ? (
        <div
          className={`absolute inset-x-0 bottom-0 ${
            phone ? 'px-12 pb-14' : 'px-[12vw] pb-16'
          }`}
        >
          <div className="flex items-center gap-2">
            {items.map((node, index) => (
              <button
                key={node.id}
                type="button"
                aria-label={node.title}
                aria-current={index === active}
                onClick={() => setActive(index)}
                onPointerEnter={() => onPrefetch?.(node.href)}
                className="group h-4 w-10 cursor-pointer border-0 bg-transparent p-0"
              >
                <span
                  className="block h-px w-full"
                  style={{
                    background:
                      index === active ? '#ffffff' : 'rgb(255 255 255 / 0.4)',
                    transition: 'background-color 300ms ease',
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
