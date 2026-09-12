'use client';

import Image from 'next/image';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import type { Article } from '@/types/content';

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <circle cx="7.55" cy="8.2" r="1.22" fill="var(--color-paper)" />
      <rect
        x="6.45"
        y="10.05"
        width="2.2"
        height="6.95"
        fill="var(--color-paper)"
      />
      <path
        fill="var(--color-paper)"
        d="M12.95 10.05v1.08c.34-.52.98-1.25 2.22-1.25 1.58 0 2.78 1.05 2.78 3.28V17h-2.2v-3.62c0-1.12-.4-1.88-1.4-1.88-.76 0-1.2.52-1.4 1.02-.07.18-.1.44-.1.7V17h-2.2s.03-6.62 0-6.95h2.3z"
      />
    </svg>
  );
}

export function ArticleSheet({
  article,
  moreThoughts,
  byline,
}: {
  article: Article;
  moreThoughts: Article[];
  byline: { name: string; role: string; linkedInUrl?: string };
}) {
  const framed = useFramed();
  return (
    <Sheet title={article.title} tone="editorial">
      <article data-surface="light" className="bg-paper">
        <header
          className={`px-[8cqi] pb-10 ${framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'}`}
        >
          <p className="text-sm text-mute">Idea</p>
          <h1 className="font-display mt-4 w-full max-w-[40ch] text-[clamp(1.5rem,3cqi,2.5rem)] leading-[1.12] text-balance text-ink">
            {article.title}
          </h1>
          {/* Set like the work's tags, so the two indexes read as one shelf. */}
          {article.tags?.length ? (
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-hairline px-3 py-1 text-[0.78rem] leading-none text-mute"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div className="px-[8cqi]">
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            width={article.coverImage.width}
            height={article.coverImage.height}
            priority
            sizes="(min-width: 1024px) 84vw, 84vw"
            unoptimized={isUnoptimizedSrc(article.coverImage.src)}
            className="h-auto w-full rounded-md"
          />
        </div>

        <div className="mx-auto max-w-[42rem] px-[8cqi] pt-16 pb-8 @md:px-0 @md:pt-20">
          <PortableBody value={article.body} density="editorial" />
        </div>

        <footer className="mx-auto max-w-[42rem] px-[8cqi] pt-8 pb-16 @md:px-0 @md:pb-20">
          <div className="border-t border-hairline pt-10">
            <p className="text-sm text-ink">Written by</p>
            <p className="mt-1 text-sm text-ink">{byline.name}</p>
            <p className="text-sm text-mute">{byline.role}</p>
            {byline.linkedInUrl ? (
              <a
                href={byline.linkedInUrl}
                className="mt-4 inline-flex text-ink"
                target="_blank"
                rel="noreferrer"
                aria-label={`${byline.name} on LinkedIn`}
              >
                <LinkedInMark />
              </a>
            ) : null}
          </div>
        </footer>

        {moreThoughts.length > 0 ? (
          <section className="bg-paper pt-20 pb-28">
            <ul className="flex items-end gap-1 overflow-x-auto overscroll-x-contain px-[6cqi] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {moreThoughts.map((item) => (
                <li key={item._id} className="w-min shrink-0">
                  <AppLink
                    href={`/thoughts/${item.slug.current}`}
                    className="block"
                  >
                    <p className="w-0 min-w-full font-display text-[1.2rem] leading-tight text-ink">
                      {item.title}
                    </p>
                    <p className="mt-1 w-0 min-w-full text-sm leading-snug text-mute">
                      {item.hoverDescription}
                    </p>
                    <Image
                      src={item.coverImage.src}
                      alt=""
                      width={item.coverImage.width}
                      height={item.coverImage.height}
                      sizes="40vw"
                      unoptimized={isUnoptimizedSrc(item.coverImage.src)}
                      className="mt-2 block h-auto w-auto min-w-[16rem] max-h-[min(52cqh,28rem)] max-w-[min(70cqi,28rem)] rounded-md"
                    />
                  </AppLink>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </Sheet>
  );
}
