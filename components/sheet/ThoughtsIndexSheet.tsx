'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { Sheet } from '@/components/sheet/Sheet';
import { useMobileSpotlight } from '@/lib/chrome/useMobileSpotlight';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { MOTION } from '@/lib/motion/tokens';
import { EDITORIAL_LINE } from '@/lib/type/display';
import type { Article } from '@/types/content';

/** One frame for every card, the portrait of the reference card. */
const CARD_ASPECT = '4 / 5';

/**
 * A plain black card: square corners, the title held top left and the tags
 * bottom right. On desktop the tags are always on show and the still fades up
 * behind them on hover. On a phone the card being read, as the work index
 * picks it, brings up its still and then its tags one by one.
 */
function ArticleCard({
  article,
  mobile,
  spotlighted,
  index,
  setNode,
}: {
  article: Article;
  mobile: boolean;
  spotlighted: boolean;
  index: number;
  setNode: (index: number, node: HTMLElement | null) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const tags = (article.tags ?? []).filter((tag) => tag.trim().length > 0);
  // Desktop keeps its tags in view, so only the phone runs them in and out.
  const active = mobile ? spotlighted : true;

  const group = {
    off: { transition: { staggerChildren: 0 } },
    on: {
      transition: {
        delayChildren: reduced ? 0 : 0.15,
        staggerChildren: reduced ? 0 : 0.07,
      },
    },
  };
  const tag = {
    off: {
      opacity: 0,
      y: reduced ? 0 : 6,
      transition: { duration: MOTION.reduced },
    },
    on: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? MOTION.reduced : 0.45,
        ease: MOTION.easeOut,
      },
    },
  };

  return (
    <AppLink
      href={`/thoughts/${article.slug.current}`}
      className="group block w-full"
      ref={(node) => setNode(index, node)}
    >
      <span
        className="relative block w-full overflow-hidden bg-black text-white"
        style={{ aspectRatio: CARD_ASPECT }}
      >
        <span
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mobile
              ? spotlighted
                ? 'opacity-100'
                : 'opacity-0'
              : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
          }`}
        >
          <Image
            src={article.coverImage.src}
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 92vw"
            quality={90}
            unoptimized={isUnoptimizedAsset(article.coverImage)}
            className="object-cover"
          />
          {/* Keeps the white type readable over a light still. */}
          <span className="absolute inset-0 bg-black/30" />
        </span>
        <span
          className="font-sans absolute top-0 left-0 z-10 block max-w-full p-[clamp(1rem,2cqi,1.75rem)] leading-snug"
          style={{ fontSize: EDITORIAL_LINE }}
        >
          {article.title}
        </span>
        {tags.length ? (
          <motion.span
            variants={group}
            initial={false}
            animate={active ? 'on' : 'off'}
            className="absolute right-0 bottom-0 z-10 flex max-w-full flex-wrap justify-end gap-1.5 p-[clamp(1rem,2cqi,1.75rem)]"
          >
            {tags.map((name) => (
              <motion.span
                key={name}
                variants={tag}
                className="rounded-full border-2 border-white/70 px-3 py-1 text-[0.78rem] font-medium leading-none"
              >
                {name}
              </motion.span>
            ))}
          </motion.span>
        ) : null}
      </span>
    </AppLink>
  );
}

export function ThoughtsIndexSheet({ articles }: { articles: Article[] }) {
  const framed = useFramed();
  const { mobile, activeIndex, setNode } = useMobileSpotlight(articles.length);

  return (
    <Sheet title="Thoughts" tone="editorial">
      <div data-surface="light" className="bg-paper">
        <div
          // Clear of the close button, which floats over this corner. The
          // about sheets stand their headings off by the same amount.
          className={`px-[3cqi] pb-[3cqi] max-md:px-12 ${
            framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'
          }`}
        >
          <IndexHeading name="Thoughts" />
        </div>

        <div className="grid grid-cols-1 gap-[1.6cqi] px-[3cqi] pt-[3cqi] pb-[6cqi] max-md:gap-5 max-md:px-12 @md:grid-cols-4">
          {articles.map((article, index) => (
            <ArticleCard
              key={article._id}
              article={article}
              mobile={mobile}
              spotlighted={activeIndex === index}
              index={index}
              setNode={setNode}
            />
          ))}
        </div>
      </div>
    </Sheet>
  );
}
