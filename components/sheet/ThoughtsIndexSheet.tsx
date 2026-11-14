'use client';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { Sheet } from '@/components/sheet/Sheet';
import { EDITORIAL_LINE } from '@/lib/type/display';
import type { Article } from '@/types/content';

/** One frame for every card, the portrait of the reference card. */
const CARD_ASPECT = '4 / 5';

/**
 * A plain black card: no still, square corners, the title held top left and
 * the tags bottom right, both always on show.
 */
function ArticleCard({ article }: { article: Article }) {
  const tags = (article.tags ?? []).filter((tag) => tag.trim().length > 0);

  return (
    <AppLink
      href={`/thoughts/${article.slug.current}`}
      className="group block w-full"
    >
      <span
        className="relative block w-full overflow-hidden bg-black text-white"
        style={{ aspectRatio: CARD_ASPECT }}
      >
        <span
          className="font-sans absolute top-0 left-0 block max-w-full p-[clamp(1rem,2cqi,1.75rem)] leading-snug"
          style={{ fontSize: EDITORIAL_LINE }}
        >
          {article.title}
        </span>
        {tags.length ? (
          <span className="absolute right-0 bottom-0 flex max-w-full flex-wrap justify-end gap-1.5 p-[clamp(1rem,2cqi,1.75rem)]">
            {tags.map((name) => (
              <span
                key={name}
                className="rounded-full border-2 border-white/70 px-3 py-1 text-[0.78rem] font-medium leading-none"
              >
                {name}
              </span>
            ))}
          </span>
        ) : null}
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
          // Clear of the close button, which floats over this corner. The
          // about sheets stand their headings off by the same amount.
          className={`px-[3cqi] pb-[3cqi] max-md:px-12 ${
            framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'
          }`}
        >
          <IndexHeading name="Thoughts" />
        </div>

        <div className="grid grid-cols-1 gap-[1.6cqi] px-[3cqi] pt-[3cqi] pb-[6cqi] max-md:gap-5 max-md:px-12 @md:grid-cols-4">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      </div>
    </Sheet>
  );
}
