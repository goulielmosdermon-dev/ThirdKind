'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, type RefObject } from 'react';

import type {
  CanvasNode,
  PortableText,
  PortableTextBlock,
} from '@/types/content';

import { editorialCopy, editorialLeaves } from '@/lib/canvas/editorial';
import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import { useSmoothScroll } from '@/lib/canvas/useSmoothScroll';
import { MOTION } from '@/lib/motion/tokens';
import { HeroCarousel } from '@/components/canvas/HeroShowcase';
import { SiteFooter } from '@/components/chrome/SiteFooter';

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

const SALES_HREF = '/work/scytales';
const SALES_SLOT = {
  wrap: 'ml-auto w-full max-w-[42rem] md:mt-16 md:w-[42%]',
  aspect: 'aspect-[11/6]',
} as const;

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
    wrap: 'w-full max-w-[38rem] md:mt-16 md:w-[50%]',
    aspect: 'aspect-[3/2]',
  },
  {
    wrap: 'ml-auto w-full max-w-[32rem] md:mt-[-6vw] md:w-[44%]',
    aspect: 'aspect-square',
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
        className={
          phone
            ? 'px-5 pt-14 pb-16'
            : 'mx-auto max-w-[92rem] px-[clamp(5.5rem,12vw,11rem)] pt-[clamp(2rem,4.8vw,4rem)] pb-[clamp(2rem,5vw,4rem)]'
        }
      >
        <div className={phone ? 'space-y-6' : 'max-w-[52rem] space-y-8'}>
          {lines.map((block) => (
            <p
              key={block._key}
              className={
                phone
                  ? 'text-[1.05rem] leading-[1.7]'
                  : 'text-[clamp(1.15rem,1.65vw,1.55rem)] leading-[1.6]'
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

export function IndexView({
  nodes,
  manifesto = [],
  onOpen,
  onPrefetch,
  onOpeningPassed,
  onHeaderPassed,
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
  density?: 'desktop' | 'phone';
}) {
  const items = useMemo(() => editorialLeaves(nodes), [nodes]);
  const reduced = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useSmoothScroll(scrollRef);

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
    for (const item of items) {
      onPrefetch(item.href);
    }
  }, [items, onPrefetch]);

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

  const entry = {
    hidden: { opacity: 0, y: reduced ? 0 : 32 },
    shown: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? MOTION.reduced : MOTION.sheetIn,
        ease: MOTION.easeOut,
      },
    },
    gone: {
      opacity: 0,
      y: reduced ? 0 : 12,
      transition: {
        duration: reduced ? MOTION.reduced : MOTION.zoom,
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
        // Horizontally: the same column as everything below it, so the band's
        // edges line up with the copy and the index as the window changes.
        // Vertically: even air top and bottom. The lower hand docks 112px up
        // from the bottom to clear the command bar, but it parks out in the
        // margin the column leaves it, so the band no longer has to duck under
        // it the way it did when it ran to the edge of the window.
        className={
          phone
            ? 'flex h-dvh items-center'
            : 'flex h-dvh items-center md:mx-auto md:max-w-[92rem] md:px-[clamp(5.5rem,12vw,11rem)] md:py-[5rem]'
        }
      >
        {/* @container so the overlay can size itself from the band's own
            height, whatever the window does. */}
        <div
          // On a phone the band is the whole screen — no gutters, no air, it
          // reads as a full slide. From md up it takes the same column as the
          // sections below, keeping that width at every size and giving way on
          // height instead: it crops into the still rather than shrinking away
          // from the margins, which is what made it drift out of line with the
          // sections below in a short window.
          className="@container relative h-full w-full overflow-hidden bg-black md:aspect-[16/9] md:h-auto md:max-h-full"
        >
          <HeroCarousel
            nodes={nodes}
            onOpen={(node) => onOpen(node.href, node.id)}
            scale={0}
            mode="screen"
          />
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
            : 'mx-auto min-h-full max-w-[92rem] px-[clamp(5.5rem,12vw,11rem)] pt-[clamp(3rem,7vw,6rem)] pb-20'
        }
      >
        <ul className={`flex flex-col ${phone ? 'gap-12' : 'gap-16 md:gap-0'}`}>
          {items.map((node, index) => {
            const slot = phone
              ? node.href === SALES_HREF
                ? { wrap: 'w-full', aspect: 'aspect-[11/6]' }
                : {
                    wrap: 'w-full',
                    aspect:
                      SLOT[index % SLOT.length]?.aspect ?? 'aspect-[16/10]',
                  }
              : node.href === SALES_HREF
                ? SALES_SLOT
                : (SLOT[index % SLOT.length] ?? SLOT[0]);
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
              <motion.li key={node.id} variants={entry} className={slot.wrap}>
                <button
                  type="button"
                  className="group w-full cursor-pointer border-0 bg-transparent p-0 text-left text-ink"
                  onClick={() => onOpen(node.href, node.id)}
                  onPointerEnter={() => onPrefetch?.(node.href)}
                  onFocus={() => onPrefetch?.(node.href)}
                >
                  <p
                    className={`font-display leading-snug ${
                      phone
                        ? 'mb-3 text-[1.05rem]'
                        : 'mb-4 max-w-[36rem] text-[clamp(1.05rem,1.55vw,1.4rem)]'
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
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
      <SiteFooter compact={phone} />
    </motion.div>
  );
}
