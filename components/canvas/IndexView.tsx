'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import type {
  CanvasNode,
  LeafCanvasNode,
  PortableText,
  PortableTextBlock,
} from '@/types/content';

import {
  editorialCopy,
  editorialLeaves,
  editorialMore,
  editorialThoughts,
} from '@/lib/canvas/editorial';
import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import { useSmoothScroll } from '@/lib/canvas/useSmoothScroll';
import { MaskedWords } from '@/components/chrome/MaskedWords';
import { MOTION } from '@/lib/motion/tokens';
import { DISPLAY_BALANCE } from '@/lib/type/display';
import { HeroReel } from '@/components/canvas/HeroReel';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { InquirySection } from '@/components/inquiry/InquirySection';
import { PillLabel } from '@/components/sheet/PillLabel';

function IndexArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="ml-[0.25em] inline-block h-[0.92em] w-[0.92em] align-[-0.14em] text-ink"
      aria-hidden
    >
      <path
        d="M6.5 6.5 L17.5 17.5 M17.5 11.5 L17.5 17.5 L11.5 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * One slot per project, in the order the index reads them. The third runs the
 * full measure — it is the piece the page is built around — and the two
 * either side of it hold their own halves.
 */
const SLOT = [
  {
    wrap: 'w-full max-w-[40rem] md:max-w-none md:w-[58%]',
    aspect: 'aspect-[16/10]',
  },
  {
    wrap: 'ml-auto w-full max-w-[34rem] md:mt-[-12vw] md:w-[40%]',
    aspect: 'aspect-[4/5]',
  },
  {
    wrap: 'w-full md:mt-24 md:w-full',
    // A third taller than the band it started as: at the full measure a
    // narrow letterbox reads as a strip rather than a picture.
    aspect: 'aspect-[5/4] md:aspect-[16/9]',
  },
  {
    // Half again the width it closed on, and the cap comes off with it or the
    // share of the column it is given stops meaning anything past 36rem.
    wrap: 'ml-auto w-full max-w-[36rem] md:mt-24 md:w-[69%] md:max-w-none',
    // Half the height it stood at, so the frame is read across rather than
    // cropped to a portrait of the middle of it.
    aspect: 'aspect-[4/5] md:aspect-[8/5]',
  },
] as const;

/**
 * The Why copy, read once on the way down from the showcase into the index.
 * The same text the About sheet carries, minus its heading — the line the
 * sheet opens on is the sheet's own — set larger here, because these few
 * paragraphs are the whole of the page at this point.
 */
function ManifestoBand({
  blocks,
  phone,
  sectionRef,
}: {
  blocks: PortableText;
  phone: boolean;
  sectionRef: RefObject<HTMLElement | null>;
}) {
  const lines = blocks.filter(
    (block): block is PortableTextBlock =>
      block._type === 'block' && block.style !== 'h2',
  );
  if (lines.length === 0) {
    return null;
  }

  return (
    // Full-bleed black, and it says so, which is what tells the command bar to
    // invert while the reader is over it.
    <section
      ref={sectionRef}
      data-surface="dark"
      className="bg-black text-white"
    >
      <div
        // The gap read from the showcase's own edge, not the section box: the
        // slab starts below the section's own bottom padding, so its top
        // padding is the smaller of the two numbers.
        // Three caps used to stack here — the column at 92rem, the gutter
        // stopping at 11rem, and the prose at 52rem — and the prose was
        // reached first, so the band read as the same narrow ribbon at every
        // size and only drifted further into the middle as the screen grew.
        // It takes the index's rule instead: a gutter that is a share of the
        // screen, and nothing else in the way.
        className={
          phone
            ? 'px-5 pt-14 pb-16'
            : // The band ran nearly the width of the screen with 4rem of air
              // above and below it, which read as a strip rather than a page.
              // The gutter is a larger share of the screen and keeps growing
              // with it; the air is set from the same measure, so a wide
              // screen gets a deeper band rather than a longer line.
              'px-5 pt-14 pb-16 md:px-[14vw] md:pt-[clamp(6rem,11vw,22rem)] md:pb-[clamp(6rem,11vw,22rem)]'
        }
      >
        <div className={phone ? 'space-y-6' : 'space-y-8'}>
          {lines.map((block) => (
            <p
              key={block._key}
              className={
                phone
                  ? 'text-[1.45rem] leading-[1.6]'
                  : 'text-[clamp(1.6rem,2.3vw,2.15rem)] leading-[1.5]'
              }
            >
              {block.children.map((child) => child.text).join('')}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Three more pieces, in a row, after the index has been read.
 *
 * The card is the index's own — the line and its arrow, then what the work
 * involved, then the picture — so a piece reads the same wherever it appears.
 * The row is deliberately uneven: each slot takes a different crop and hangs
 * at a different height, which is what keeps three cards side by side from
 * reading as a grid of boxes.
 */
const MORE_SLOT = [
  { wrap: '', aspect: 'aspect-[16/10]' },
  { wrap: 'md:mt-[6vw]', aspect: 'aspect-square' },
  { wrap: 'md:mt-[2vw]', aspect: 'aspect-[4/3]' },
] as const;

function MoreWork({
  items,
  phone,
  reduced,
  onOpen,
  onPrefetch,
}: {
  items: LeafCanvasNode[];
  phone: boolean;
  reduced: boolean;
  onOpen: (href: string, nodeId: string) => void;
  onPrefetch?: (href: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={phone ? 'mt-20' : 'mt-[clamp(6rem,12vw,14rem)]'}>
      <ul
        className={`grid grid-cols-1 items-start ${
          phone ? 'gap-14' : 'gap-10 md:grid-cols-3 md:gap-[4%]'
        }`}
      >
        {items.map((node, index) => {
          const slot = MORE_SLOT[index % MORE_SLOT.length] ?? MORE_SLOT[0];
          const { line, name } = editorialCopy(node);
          // The arrow stays welded to the last word so it never wraps alone.
          const cut = line.lastIndexOf(' ');
          let lead = '';
          let tail = line;
          if (name) {
            lead = `${line} `;
            tail = '';
          } else if (cut > 0) {
            lead = line.slice(0, cut + 1);
            tail = line.slice(cut + 1);
          }

          return (
            <motion.li
              key={node.id}
              className={phone ? '' : slot.wrap}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: reduced ? MOTION.reduced : 0.6,
                delay: reduced ? 0 : index * 0.08,
                ease: MOTION.easeOut,
              }}
            >
              <button
                type="button"
                className="group w-full cursor-pointer border-0 bg-transparent p-0 text-left text-ink"
                onClick={() => onOpen(node.href, node.id)}
                onPointerEnter={() => onPrefetch?.(node.href)}
                onFocus={() => onPrefetch?.(node.href)}
              >
                <p
                  // The index's own size, and the arrow with it: IndexArrow is
                  // set in em, so it follows the line it is welded to.
                  className={`font-display leading-snug ${
                    phone
                      ? 'mb-3 text-[1.05rem]'
                      : 'mb-4 text-[clamp(1.05rem,1.55vw,1.4rem)] max-md:text-[1.15rem]'
                  }`}
                >
                  {lead}
                  <span className="whitespace-nowrap">
                    {name ? <span className="text-mute">{name}</span> : tail}
                    <IndexArrow />
                  </span>
                </p>

                {node.tags?.length ? (
                  <ul
                    className={`flex flex-wrap gap-1.5 ${phone ? 'mb-3' : 'mb-4'}`}
                  >
                    {node.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full border border-hairline px-3 py-1 text-[0.78rem] leading-none text-mute"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <span
                  className={`relative block w-full overflow-hidden bg-paper ${slot.aspect}`}
                >
                  <Image
                    src={node.thumbnail.src}
                    alt={node.thumbnail.alt}
                    fill
                    sizes={phone ? '393px' : '(min-width: 768px) 30vw, 92vw'}
                    unoptimized={isUnoptimizedSrc(node.thumbnail.src)}
                    className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                  />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

/** How many pieces of writing the index opens with, and how many each
    "Show more" adds after that. */
const OPENS_WITH = 5;
const STEP = 2;

/** One piece of writing: label, title, and the button, top-aligned. */
function ThoughtRow({
  node,
  phone,
  index,
  reduced = false,
  onOpen,
  onPrefetch,
}: {
  node: LeafCanvasNode;
  phone: boolean;
  /** Its place in the run, which is how far behind the one above it lands. */
  index: number;
  reduced?: boolean;
  onOpen: (href: string, nodeId: string) => void;
  onPrefetch?: (href: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  // Where the still sits, in the row's own box, so it rides the pointer
  // across the line the way the reference does.
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLLIElement>(null);
  const label = node.tags?.[0] ?? 'Article';

  return (
    <motion.li
      ref={rowRef}
      // Each row resolves as it arrives. The ones on screen together trickle
      // down a beat apart; the ones further along simply come in as they are
      // reached. A row brought in by "Show more" is already in view, so it
      // fades on the spot.
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{
        duration: reduced ? MOTION.reduced : 0.6,
        delay: reduced ? 0 : Math.min(index, 5) * 0.08,
        ease: MOTION.easeOut,
      }}
      className="relative border-t border-hairline last:border-b"
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') {
          return;
        }
        setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onPointerMove={(event) => {
        const box = rowRef.current?.getBoundingClientRect();
        if (!box) {
          return;
        }
        setPoint({ x: event.clientX - box.left, y: event.clientY - box.top });
      }}
    >
      <button
        type="button"
        className="group flex w-full cursor-pointer items-start gap-4 border-0 bg-transparent px-0 py-5 text-left text-ink md:gap-8 md:py-6"
        onClick={() => onOpen(node.href, node.id)}
        onPointerEnter={() => onPrefetch?.(node.href)}
        onFocus={() => onPrefetch?.(node.href)}
      >
        <span className="hidden w-[9rem] shrink-0 pt-[0.15em] text-[0.9rem] leading-snug text-ink md:block">
          {label}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.78rem] text-mute md:hidden">
            {label}
          </span>
          {/* Title in the sans, précis in Plantin — the two voices the
              reference sets the line in. */}
          <span className="mt-1 block text-[1.05rem] leading-snug font-semibold md:mt-0 md:text-[clamp(1.05rem,1.5vw,1.35rem)]">
            {node.title}
            {node.hoverDescription ? (
              // Kept on the shared display balance, so the two faces read at
              // the same optical size along the line.
              <span
                className="font-display font-normal text-mute"
                style={{ fontSize: DISPLAY_BALANCE }}
              >
                {' '}
                {node.hoverDescription}
              </span>
            ) : null}
          </span>
        </span>
        <span className="shrink-0 self-start">
          <PillLabel
            label="Read now"
            // No room for the word on a phone; the arrow says it.
            labelClassName="max-md:hidden"
            open={hovered}
          />
        </span>
      </button>

      {!phone ? (
        <span
          className="pointer-events-none absolute z-20 block w-[14rem] overflow-hidden"
          style={{
            left: point.x,
            top: point.y,
            transform: `translate(-50%, -50%) scale(${hovered ? 1 : 0.86})`,
            opacity: hovered ? 1 : 0,
            transition:
              'opacity 260ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          aria-hidden
        >
          <span className="relative block aspect-[16/10] w-full bg-black">
            <Image
              src={node.thumbnail.src}
              alt=""
              fill
              sizes="224px"
              unoptimized={isUnoptimizedSrc(node.thumbnail.src)}
              className="object-cover"
            />
          </span>
        </span>
      ) : null}
    </motion.li>
  );
}

/**
 * The writing, under the work: one line of type at full volume, read a word
 * at a time out of its own mask, then the pieces as a plain ruled list rather
 * than another run of pictures competing with the index above it.
 */
function ThoughtsRun({
  items,
  phone,
  onOpen,
  onPrefetch,
}: {
  items: LeafCanvasNode[];
  phone: boolean;
  onOpen: (href: string, nodeId: string) => void;
  onPrefetch?: (href: string) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  // Five to begin with, then two at a time. The rest of the writing is a
  // click away rather than a page of scrolling nobody asked for.
  const [shown, setShown] = useState(OPENS_WITH);
  const visible = items.slice(0, shown);
  const more = items.length - visible.length;

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Its own band, with room either side of it rather than a screen of
          it: the line arrives out of its masks as the section comes up, and
          runs backwards as the reader leaves it for the writing below. */}
      <section
        // The index around it runs the width of the screen; this band keeps
        // the measure the page was drawn at. It backs out of the column's
        // gutter and sets its own, which is the one the whole page used
        // before the index was let off its cap.
        className={
          phone
            ? 'pt-44 pb-36'
            : 'pt-[clamp(14rem,28vw,26rem)] pb-[clamp(11rem,22vw,20rem)] md:-mx-[12vw]'
        }
      >
        <h2
          className={`font-display leading-[0.92] tracking-[-0.02em] text-ink ${
            phone
              ? 'text-[clamp(2.4rem,13vw,3.6rem)]'
              : 'text-[clamp(3rem,9.5vw,9rem)] md:mx-auto md:max-w-[92rem] md:px-[clamp(5.5rem,12vw,11rem)]'
          }`}
        >
          <MaskedWords
            once={false}
            words={[
              { text: 'Because' },
              { text: 'it\u2019s' },
              { text: 'so' },
              { text: 'much' },
              { text: 'fun' },
            ]}
          />
        </h2>
      </section>

      <section>
        <ul>
          {visible.map((node, index) => (
            <ThoughtRow
              key={node.id}
              node={node}
              phone={phone}
              index={index}
              reduced={reduced}
              onOpen={onOpen}
              onPrefetch={onPrefetch}
            />
          ))}
        </ul>

        {more > 0 ? (
          <button
            type="button"
            onClick={() => setShown((count) => count + STEP)}
            className="mt-8 cursor-pointer border-0 bg-transparent p-0 text-[0.9rem] text-mute underline-offset-4 transition-colors duration-300 hover:text-ink hover:underline"
          >
            Show more
          </button>
        ) : null}
      </section>
    </>
  );
}

export function IndexView({
  nodes,
  manifesto = [],
  onOpen,
  onPrefetch,
  onOpeningPassed,
  onHeaderPassed,
  onHeaderOffset,
  density = 'desktop',
}: {
  nodes: CanvasNode[];
  /** The Why section's own copy, read the same here as it is in the sheet. */
  manifesto?: PortableText;
  onOpen: (href: string, nodeId: string) => void;
  /** Warms the sheet route so the panel can slide in without a fetch gap. */
  onPrefetch?: (href: string) => void;
  /**
   * Called as the black section clears the top of the screen, which is where
   * the opening — showcase and manifesto — gives way to the index proper.
   */
  onOpeningPassed?: (passed: boolean) => void;
  /** Called as the showcase itself clears the top of the screen. */
  onHeaderPassed?: (passed: boolean) => void;
  /** The showcase's live distance from the top of the screen, in px. */
  onHeaderOffset?: (top: number) => void;
  density?: 'desktop' | 'phone';
}) {
  const items = useMemo(() => editorialLeaves(nodes), [nodes]);
  const thoughts = useMemo(() => editorialThoughts(nodes), [nodes]);
  const more = useMemo(() => editorialMore(nodes), [nodes]);
  const reduced = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useSmoothScroll(scrollRef);

  // The motto is drawn above this view, so that it can be the same element
  // the intro lands on. For it to scroll with the band rather than hang over
  // the page, it is told where the band currently is.
  useEffect(() => {
    if (!onHeaderOffset) {
      return;
    }
    let frame = 0;
    const read = () => {
      frame = 0;
      const box = headerRef.current?.getBoundingClientRect();
      onHeaderOffset(box ? box.top : 0);
    };
    const ping = () => {
      if (frame === 0) {
        frame = requestAnimationFrame(read);
      }
    };
    ping();
    const scroller = scrollRef.current;
    scroller?.addEventListener('scroll', ping, { passive: true });
    window.addEventListener('scroll', ping, { passive: true });
    window.addEventListener('resize', ping);
    return () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
      scroller?.removeEventListener('scroll', ping);
      window.removeEventListener('scroll', ping);
      window.removeEventListener('resize', ping);
    };
  }, [onHeaderOffset]);

  // Watched rather than measured on every scroll event: the only thing anyone
  // downstream needs is the moment a section leaves the top edge.
  useEffect(() => {
    const watch = (
      target: HTMLElement | null,
      notify: ((passed: boolean) => void) | undefined,
    ) => {
      if (!notify) {
        return undefined;
      }
      if (!target) {
        // Nothing to clear — nothing is waiting on it either.
        notify(true);
        return undefined;
      }
      // In the phone preview the page scrolls inside the device frame, so the
      // frame is the root; on the site itself the index is the whole screen.
      const root = target.closest('[data-preview-scroll]');
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const edge = entry.rootBounds?.top ?? 0;
            notify(
              !entry.isIntersecting && entry.boundingClientRect.bottom <= edge,
            );
          }
        },
        { root, threshold: 0 },
      );
      observer.observe(target);
      return observer;
    };

    const watchers = [
      watch(manifestoRef.current, onOpeningPassed),
      watch(headerRef.current, onHeaderPassed),
    ];
    return () => {
      for (const observer of watchers) {
        observer?.disconnect();
      }
    };
  }, [onHeaderPassed, onOpeningPassed]);

  // Touch has no hover, so the only reliable warm-up is up front.
  useEffect(() => {
    if (!onPrefetch) {
      return;
    }
    for (const item of [...items, ...more, ...thoughts]) {
      onPrefetch(item.href);
    }
  }, [items, more, onPrefetch, thoughts]);

  const sheet = {
    hidden: { opacity: 0 },
    shown: {
      opacity: 1,
      transition: {
        duration: reduced ? MOTION.reduced : MOTION.zoom,
        ease: MOTION.easeOut,
        delayChildren: reduced ? 0 : 0.06,
        staggerChildren: reduced ? 0 : 0.04,
      },
    },
    gone: {
      opacity: 0,
      pointerEvents: 'none' as const,
      transition: {
        duration: reduced ? MOTION.reduced : MOTION.zoom,
        ease: MOTION.easeOut,
      },
    },
  };

  // Each part of an index item arrives in turn: the line rises out of its
  // mask, the tags come one after another, and the picture wipes open.
  const mask = {
    hidden: { y: reduced ? 0 : '110%' },
    shown: {
      y: 0,
      transition: {
        duration: reduced ? MOTION.reduced : 0.85,
        ease: MOTION.easeOut,
      },
    },
  };

  const tagIn = {
    hidden: { opacity: 0, y: reduced ? 0 : 6 },
    shown: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? MOTION.reduced : 0.5,
        ease: MOTION.easeOut,
      },
    },
  };

  const wipe = {
    hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
    shown: {
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: {
        duration: reduced ? MOTION.reduced : 1.05,
        ease: MOTION.easeOut,
      },
    },
  };

  const phone = density === 'phone';

  return (
    <motion.div
      ref={scrollRef}
      data-index-view
      variants={sheet}
      initial="hidden"
      animate="shown"
      exit="gone"
      className={
        phone
          ? 'relative z-[8]'
          : 'absolute inset-0 z-[8] overflow-y-auto overscroll-y-contain'
      }
      onPointerDown={(event) => event.stopPropagation()}
    >
      {/*
        The page opens on the showcase, framed as it is on the canvas — inset
        with air around it rather than bleeding to the edges — and scrolling
        carries on into the index proper.
      */}
      <section
        ref={headerRef}
        // The band is the whole screen, edge to edge, on a phone and on a
        // desktop alike: it is the page's opening frame, and the headline the
        // intro lands on carries on over it.
        className={
          phone
            ? 'relative flex h-[80dvh] items-center'
            : 'relative h-dvh w-full'
        }
      >
        {/* @container so the overlay can size itself from the band's own
            height, whatever the window does. */}
        <div
          // The cursor is drawn above every layer of the page, so it finds the
          // band by this marker rather than being nested inside it.
          data-hero-band
          // Declared dark from the moment it is on screen, so the command bar
          // is already in its dark state when the header arrives rather than
          // catching up after a scroll.
          data-surface="dark"
          className="@container relative h-full w-full overflow-hidden bg-black"
        >
          <HeroReel onOpen={() => onOpen('/work', '')} />
        </div>
      </section>

      <ManifestoBand
        blocks={manifesto}
        phone={phone}
        sectionRef={manifestoRef}
      />

      <div
        className={
          phone
            ? 'px-5 pt-4 pb-16'
            : // No cap on the measure from here down, and a gutter that is a
              // share of the screen rather than a number that stops growing:
              // held to 92rem the index sat in a strip down the middle of a
              // large display with the better part of it left empty either
              // side. 12vw is what the old clamp already resolved to at the
              // width the page was drawn for, so nothing moves until there is
              // more screen than that.
              'min-h-full px-5 pt-12 pb-16 md:px-[12vw] md:pt-[clamp(7rem,12vw,24rem)] md:pb-[clamp(6rem,10vw,20rem)]'
        }
      >
        <ul className={`flex flex-col ${phone ? 'gap-12' : 'gap-16 md:gap-0'}`}>
          {items.map((node, index) => {
            const shape = SLOT[index % SLOT.length] ?? SLOT[0];
            const slot = phone
              ? { wrap: 'w-full', aspect: shape.aspect }
              : shape;
            const { line, name } = editorialCopy(node);
            // The arrow stays welded to the last word so it never wraps alone.
            const cut = line.lastIndexOf(' ');
            let lead = '';
            let tail = line;
            if (name) {
              lead = `${line} `;
              tail = '';
            } else if (cut > 0) {
              lead = line.slice(0, cut + 1);
              tail = line.slice(cut + 1);
            }
            return (
              <motion.li
                key={node.id}
                className={slot.wrap}
                initial="hidden"
                whileInView="shown"
                // Read as the piece comes up, once. A quarter of it in view is
                // enough — waiting for half means the tall slots never fire on
                // a short window.
                viewport={{ once: true, amount: 0.25 }}
                variants={{
                  hidden: {},
                  shown: {
                    transition: { staggerChildren: reduced ? 0 : 0.08 },
                  },
                }}
              >
                <button
                  type="button"
                  className="group w-full cursor-pointer border-0 bg-transparent p-0 text-left text-ink"
                  onClick={() => onOpen(node.href, node.id)}
                  onPointerEnter={() => onPrefetch?.(node.href)}
                  onFocus={() => onPrefetch?.(node.href)}
                >
                  {/* The line rises out of its own box — the same mask the
                      writing's heading is read through. */}
                  <span
                    className={`block overflow-hidden pt-[0.12em] pb-[0.26em] ${
                      phone
                        ? '-mt-[0.12em] mb-[calc(0.75rem-0.26em)]'
                        : '-mt-[0.12em] mb-[calc(1rem-0.26em)] max-w-[36rem]'
                    }`}
                  >
                    <motion.p
                      variants={mask}
                      className={`font-display leading-snug ${
                        phone
                          ? 'text-[1.05rem]'
                          : // On a phone it is set at the size the manifesto
                            // body is read at, so the page keeps one measure.
                            'text-[clamp(1.05rem,1.55vw,1.4rem)] max-md:text-[1.15rem]'
                      }`}
                    >
                      {lead}
                      <span className="whitespace-nowrap">
                        {name ? (
                          <span className="text-mute">{name}</span>
                        ) : (
                          tail
                        )}
                        <IndexArrow />
                      </span>
                    </motion.p>
                  </span>
                  {node.tags?.length ? (
                    // The tags arrive one after the other, after the line and
                    // before the picture.
                    <motion.ul
                      variants={{
                        hidden: {},
                        shown: {
                          transition: {
                            staggerChildren: reduced ? 0 : 0.07,
                          },
                        },
                      }}
                      className={`flex flex-wrap gap-1.5 ${phone ? 'mb-3' : 'mb-4'}`}
                    >
                      {node.tags.map((tag) => (
                        <motion.li
                          key={tag}
                          variants={tagIn}
                          className="rounded-full border border-hairline px-3 py-1 text-[0.78rem] leading-none text-mute"
                        >
                          {tag}
                        </motion.li>
                      ))}
                    </motion.ul>
                  ) : null}
                  <motion.span
                    variants={wipe}
                    className={`relative block w-full overflow-hidden bg-paper ${slot.aspect}`}
                  >
                    {node.swatch ? (
                      <span
                        className="absolute inset-0"
                        style={{ backgroundColor: node.swatch }}
                      />
                    ) : (
                      <Image
                        src={node.thumbnail.src}
                        alt={node.thumbnail.alt}
                        fill
                        sizes={
                          phone ? '393px' : '(min-width: 768px) 55vw, 92vw'
                        }
                        priority={index < 3}
                        unoptimized={isUnoptimizedSrc(node.thumbnail.src)}
                        className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                      />
                    )}
                  </motion.span>
                </button>
              </motion.li>
            );
          })}
        </ul>

        <ThoughtsRun
          items={thoughts}
          phone={phone}
          onOpen={onOpen}
          onPrefetch={onPrefetch}
        />

        <MoreWork
          items={more}
          phone={phone}
          reduced={reduced}
          onOpen={onOpen}
          onPrefetch={onPrefetch}
        />

        <InquirySection phone={phone} />
      </div>
      <SiteFooter compact={phone} />
    </motion.div>
  );
}
