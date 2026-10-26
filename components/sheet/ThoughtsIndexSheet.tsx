'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { Sheet } from '@/components/sheet/Sheet';
import { useMobileSpotlight } from '@/lib/chrome/useMobileSpotlight';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { MOTION } from '@/lib/motion/tokens';
import { EDITORIAL_LINE } from '@/lib/type/display';
import type { Article } from '@/types/content';

function published(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return '';
  }
  return new Date(parsed).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** One crop for every still, the portrait of the reference card. */
const CARD_ASPECT = '4 / 5';

function ArticleCard({
  article,
  eager,
  mobile,
  spotlighted,
  index,
  setNode,
}: {
  article: Article;
  eager: boolean;
  mobile: boolean;
  spotlighted: boolean;
  index: number;
  setNode: (index: number, node: HTMLElement | null) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const [hover, setHover] = useState(false);
  const active = mobile ? spotlighted : hover;
  const tags = (article.tags ?? []).filter((tag) => tag.trim().length > 0);

  const copy = {
    off: { transition: { staggerChildren: 0 } },
    on: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
  };
  const line = {
    off: { y: '110%', transition: { duration: MOTION.reduced } },
    on: {
      y: '0%',
      transition: {
        duration: reduced ? MOTION.reduced : 0.55,
        ease: MOTION.easeOut,
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
  const wash = {
    off: { opacity: 0, transition: { duration: MOTION.reduced } },
    on: {
      opacity: 1,
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
      onPointerEnter={mobile ? undefined : () => setHover(true)}
      onPointerLeave={mobile ? undefined : () => setHover(false)}
      onFocus={mobile ? undefined : () => setHover(true)}
      onBlur={mobile ? undefined : () => setHover(false)}
    >
      <motion.span
        className={`relative block w-full overflow-hidden bg-hairline transition-[border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          active ? 'rounded-[30px]' : 'rounded-none'
        }`}
        style={{ aspectRatio: CARD_ASPECT }}
        initial={false}
        animate={active ? 'on' : 'off'}
      >
        <span className="tk-loading absolute inset-0" aria-hidden />
        <Image
          src={article.coverImage.src}
          alt=""
          fill
          priority={eager}
          loading={eager ? undefined : 'lazy'}
          sizes="(min-width: 768px) 30vw, 92vw"
          quality={95}
          unoptimized={isUnoptimizedAsset(article.coverImage)}
          className="object-cover"
        />
        <motion.span
          variants={wash}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black/80 via-black/35 to-transparent"
        />
        <motion.span
          variants={copy}
          className="absolute inset-x-0 bottom-0 flex flex-col items-start p-[clamp(1rem,2cqi,1.75rem)] text-white"
        >
          <span className="block overflow-hidden pt-[0.12em] pb-[0.26em]">
            <motion.span
              variants={line}
              className="font-display block leading-snug"
              style={{ fontSize: EDITORIAL_LINE }}
            >
              {article.title}
            </motion.span>
          </span>
          {tags.length ? (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((name) => (
                <motion.span
                  key={name}
                  variants={tag}
                  className="rounded-full border-2 border-white/70 px-3 py-1 text-[0.78rem] font-medium leading-none"
                >
                  {name}
                </motion.span>
              ))}
            </span>
          ) : null}
        </motion.span>
      </motion.span>
      <span className="mt-3 block text-[0.82rem] leading-tight text-mute">
        {published(article.publishedAt)}
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

        <div className="grid grid-cols-1 gap-[1.6cqi] px-[3cqi] pt-[3cqi] pb-[6cqi] max-md:gap-5 max-md:px-12 @md:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article._id}
              article={article}
              eager={index < 9}
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
