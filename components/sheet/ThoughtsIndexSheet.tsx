'use client';

import Image from 'next/image';

import { AppLink } from '@/components/mobile/MobileChrome';
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

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <div className="grid gap-[3cqi] @lg:grid-cols-[1.6fr_1fr] @lg:gap-[3cqi]">
      <AppLink
        href={`/thoughts/${article.slug.current}`}
        className="group relative block aspect-[16/10] w-full overflow-hidden bg-hairline"
      >
        <span className="tk-loading absolute inset-0" aria-hidden />
        <Image
          src={article.coverImage.src}
          alt=""
          fill
          priority
          sizes="(min-width: 900px) 62vw, 100vw"
          unoptimized={isUnoptimizedAsset(article.coverImage)}
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />
      </AppLink>

      <div className="flex flex-col items-start self-center">
        <p className="text-[0.8rem] tracking-[0.08em] text-mute">
          {published(article.publishedAt)}
        </p>
        <h2 className="mt-3 font-display text-[clamp(1.3rem,2.6cqi,2rem)] leading-[1.12] font-semibold text-ink">
          {article.title}
        </h2>
        <p className="mt-3 max-w-[38ch] text-[1rem] leading-snug text-mute">
          {article.excerpt}
        </p>
        <AppLink
          href={`/thoughts/${article.slug.current}`}
          className="mt-6 rounded-full bg-ink px-5 py-2 text-[0.82rem] text-paper transition-opacity duration-300 hover:opacity-85"
        >
          Read More
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
        <span className="relative block aspect-[16/10] w-full overflow-hidden bg-hairline">
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
        <span className="mt-1.5 block font-display text-[1.05rem] leading-tight font-semibold text-ink">
          {article.title}
        </span>
      </AppLink>
    </li>
  );
}

export function ThoughtsIndexSheet({
  articles,
  standfirst,
}: {
  articles: Article[];
  standfirst: string;
}) {
  // allArticles() sorts newest first, so the lead is simply the latest piece
  // and the grid carries the rest.
  const [featured, ...rest] = articles;

  return (
    <Sheet title="Thoughts" tone="editorial">
      <div data-surface="light" className="bg-paper pb-24">
        <div className="px-[5cqi] pt-[7cqi] pb-[3cqi] @md:pt-[5cqi]">
          <IndexHeading name="Thoughts" standfirst={standfirst} />
        </div>

        {featured ? (
          <div className="px-[5cqi]">
            <FeaturedArticle article={featured} />
          </div>
        ) : null}

        {rest.length > 0 ? (
          <ul className="mt-[5cqi] grid grid-cols-1 gap-x-[2.5cqi] gap-y-[3.5cqi] px-[5cqi] @sm:grid-cols-2 @lg:grid-cols-3 @xl:grid-cols-4">
            {rest.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </ul>
        ) : null}
      </div>
    </Sheet>
  );
}
