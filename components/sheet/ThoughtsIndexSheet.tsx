'use client';

import Image from 'next/image';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { PillLabel } from '@/components/sheet/PillLabel';
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

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <div className="grid gap-[3cqi] @lg:grid-cols-[1.75fr_1fr]">
      <AppLink
        href={`/thoughts/${article.slug.current}`}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-md bg-hairline"
      >
        <span className="tk-loading absolute inset-0" aria-hidden />
        <Image
          src={article.coverImage.src}
          alt=""
          fill
          priority
          sizes="(min-width: 900px) 64vw, 100vw"
          unoptimized={isUnoptimizedAsset(article.coverImage)}
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />
      </AppLink>

      {/* Title, standfirst and action stack down the right-hand column. */}
      <div className="flex flex-col items-start">
        <h2 className="font-display text-[clamp(1.3rem,2.4cqi,1.95rem)] leading-[1.12] text-ink">
          {article.title}
        </h2>
        <p className="mt-4 max-w-[34ch] text-[1rem] leading-snug text-mute">
          {article.excerpt}
        </p>
        <AppLink
          href={`/thoughts/${article.slug.current}`}
          className="mt-6 transition-opacity duration-300 hover:opacity-85"
        >
          <PillLabel label="Read Story" />
        </AppLink>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <li>
      <AppLink
        href={`/thoughts/${article.slug.current}`}
        className="group block"
      >
        <span className="relative block aspect-[16/10] w-full overflow-hidden rounded-md bg-hairline">
          <span className="tk-loading absolute inset-0" aria-hidden />
          <Image
            src={article.coverImage.src}
            alt=""
            fill
            sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 90vw"
            unoptimized={isUnoptimizedAsset(article.coverImage)}
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </span>
        <span className="mt-3 block text-[0.78rem] tracking-[0.08em] text-mute">
          {published(article.publishedAt)}
        </span>
        <span className="mt-1.5 block font-display text-[1.05rem] leading-tight text-ink">
          {article.title}
        </span>
      </AppLink>
    </li>
  );
}

export function ThoughtsIndexSheet({ articles }: { articles: Article[] }) {
  const framed = useFramed();
  // A pinned piece leads when one is marked; otherwise allArticles() has
  // already sorted newest first, so the latest takes the slot.
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const rest = articles.filter((article) => article !== featured);

  return (
    <Sheet title="Thoughts" tone="editorial">
      <div data-surface="light" className="bg-paper pb-24">
        <div
          // Clear of the close button, which floats over this corner. The
          // about sheets stand their headings off by the same amount.
          className={`px-12 pb-[3cqi] @md:px-[5cqi] ${
            framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'
          }`}
        >
          <IndexHeading name="Thoughts" />
        </div>

        {featured ? (
          <div className="px-12 @md:px-[5cqi]">
            <FeaturedArticle article={featured} />
          </div>
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-[5cqi] grid grid-cols-1 gap-x-[2.5cqi] gap-y-[3.5cqi] px-12 @md:px-[5cqi] @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
            {rest.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </ul>
        ) : null}
      </div>
    </Sheet>
  );
}
