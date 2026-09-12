'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
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

/**
 * The crops the grid cycles through, so a column reads as a run of different
 * pictures rather than a stack of identical boxes. Same wall as the work.
 */
const ASPECTS = ['16/10', '3/4', '16/9', '1/1', '4/5', '3/2'] as const;

/** Column widths, close to even but never quite. */
const WEIGHTS = [1, 0.88, 1.16, 0.94, 1.08] as const;

/** How many columns fit at a given width. */
function columnsFor(width: number): number {
  if (width < 560) return 1;
  if (width < 860) return 2;
  if (width < 1180) return 3;
  if (width < 1500) return 4;
  return 5;
}

function ArticleCard({
  article,
  aspect,
  eager,
}: {
  article: Article;
  aspect: string;
  eager: boolean;
}) {
  return (
    <AppLink
      href={`/thoughts/${article.slug.current}`}
      className="group block w-full"
    >
      <span
        className="relative block w-full overflow-hidden rounded-md bg-hairline"
        style={{ aspectRatio: aspect }}
      >
        <span className="tk-loading absolute inset-0" aria-hidden />
        <Image
          src={article.coverImage.src}
          alt=""
          fill
          priority={eager}
          loading={eager ? undefined : 'lazy'}
          sizes="560px"
          quality={95}
          unoptimized={isUnoptimizedAsset(article.coverImage)}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      </span>
      <span className="mt-3 block text-[0.82rem] leading-tight text-mute">
        {published(article.publishedAt)}
      </span>
      <span className="font-display mt-1 block text-[1.05rem] leading-tight text-ink">
        {article.title}
      </span>
    </AppLink>
  );
}

export function ThoughtsIndexSheet({ articles }: { articles: Article[] }) {
  const framed = useFramed();
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);

  // Column count is worked out here rather than in CSS because the cards are
  // dealt into the columns one by one: the grid has to know how many there
  // are before it can share them out.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }
    const measure = () => setColumns(columnsFor(grid.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  const lanes = Array.from({ length: columns }, (_, lane) =>
    articles
      .map((article, index) => ({ article, index }))
      .filter((card) => card.index % columns === lane),
  );

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

        <div
          ref={gridRef}
          className="flex items-start gap-[1.6cqi] px-[3cqi] pt-[3cqi] pb-[6cqi] max-md:gap-5 max-md:px-12"
        >
          {lanes.map((lane, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col gap-[4cqi] max-md:gap-10"
              style={{ flex: `${WEIGHTS[index % WEIGHTS.length]} 1 0%` }}
            >
              {lane.map((card) => (
                <ArticleCard
                  key={card.article._id}
                  article={card.article}
                  aspect={ASPECTS[card.index % ASPECTS.length]!}
                  eager={card.index < columns * 2}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
