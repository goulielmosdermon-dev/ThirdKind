'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

import type { CanvasNode } from '@/types/content';

import { editorialCopy, editorialLeaves } from '@/lib/canvas/editorial';
import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
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

export function IndexView({
  nodes,
  onOpen,
  onPrefetch,
  density = 'desktop',
}: {
  nodes: CanvasNode[];
  onOpen: (href: string, nodeId: string) => void;
  /** Warms the sheet route so the panel can slide in without a fetch gap. */
  onPrefetch?: (href: string) => void;
  density?: 'desktop' | 'phone';
}) {
  const items = useMemo(() => editorialLeaves(nodes), [nodes]);
  const reduced = useReducedMotion() ?? false;

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
        className={
          phone
            ? 'flex h-dvh items-center px-5'
            : 'flex h-dvh items-center px-[clamp(2rem,5.5vw,5.5rem)]'
        }
      >
        <div className="relative mx-auto aspect-[16/9] w-full max-w-[calc((100dvh-12rem)*16/9)] overflow-hidden bg-black">
          <HeroCarousel
            nodes={nodes}
            onOpen={(node) => onOpen(node.href, node.id)}
            scale={phone ? 260 : 520}
          />
        </div>
      </section>

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
                  className="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-ink"
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
                        className="object-cover"
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
