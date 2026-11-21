'use client';

import Image from 'next/image';
import { useState } from 'react';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { readMinutes, splitTitle } from '@/lib/content/articleTitle';
import { EDITORIAL_LINE } from '@/lib/type/display';
import type { Article } from '@/types/content';

/**
 * One line of the reading list: what kind of piece, the title, how long it
 * takes. A rule between lines, no buttons — the whole line is the link.
 * On hover the cover follows the pointer along the line.
 */
function ArticleRow({ article }: { article: Article }) {
  const [hover, setHover] = useState(false);
  const [x, setX] = useState(0);
  const [lead, rest] = splitTitle(article.title);
  const kind = article.tags?.[0] ?? 'Thought';
  const minutes = readMinutes(article);

  return (
    <AppLink
      href={`/thoughts/${article.slug.current}`}
      className="group relative grid w-full grid-cols-[minmax(7rem,14%)_1fr_auto] items-baseline gap-x-[3cqi] py-[clamp(0.9rem,1.6cqi,1.4rem)] text-ink no-underline max-md:grid-cols-1 max-md:gap-y-1"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerMove={(e) =>
        setX(e.clientX - e.currentTarget.getBoundingClientRect().left)
      }
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <span className="font-sans text-sm opacity-60">{kind}</span>

      <span
        className="relative z-10 leading-snug transition-opacity duration-300 group-hover:opacity-70"
        style={{ fontSize: EDITORIAL_LINE }}
      >
        <span className="font-sans font-medium">{lead}</span>
        {rest && <span className="font-display"> {rest}</span>}
      </span>

      <span className="font-sans text-sm whitespace-nowrap max-md:hidden">
        <span className="font-medium">{minutes} min</span>{' '}
        <span className="opacity-60">read</span>
      </span>

      <span
        aria-hidden
        className={`pointer-events-none absolute top-1/2 left-0 z-20 hidden w-[min(16cqi,10rem)] overflow-hidden bg-hairline transition-opacity duration-300 md:block ${
          hover ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          aspectRatio: '16 / 9',
          transform: `translate(calc(${x}px - 50%), -50%)`,
        }}
      >
        <Image
          src={article.coverImage.src}
          alt=""
          fill
          sizes="10rem"
          quality={90}
          unoptimized={isUnoptimizedAsset(article.coverImage)}
          className="object-cover"
        />
      </span>
    </AppLink>
  );
}

export function ThoughtsIndexSheet({ articles }: { articles: Article[] }) {
  const framed = useFramed();

  return (
    <Sheet title="Thoughts" tone="editorial">
      <div data-surface="light" className="bg-paper">
        <div
          className={`px-[3cqi] pb-[3cqi] max-md:px-12 ${
            framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'
          }`}
        >
          <IndexHeading name="Thoughts" />
        </div>

        <div className="px-[3cqi] pt-[1cqi] pb-[8cqi] max-md:px-12">
          <ul className="m-0 list-none p-0">
            {articles.map((article) => (
              <li
                key={article._id}
                className="border-b border-ink last:border-b-0"
              >
                <ArticleRow article={article} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
