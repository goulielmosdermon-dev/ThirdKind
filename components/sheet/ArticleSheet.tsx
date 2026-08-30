'use client';

import Image from 'next/image';
import { useState } from 'react';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import { portablePlainText, readingMinutes } from '@/lib/content/portable';
import type { Article } from '@/types/content';

export function ArticleSheet({ article }: { article: Article }) {
  const [copied, setCopied] = useState(false);
  const minutes = readingMinutes(portablePlainText(article.body));
  const published = new Date(article.publishedAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Sheet title={article.title}>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="relative aspect-[16/9] overflow-hidden bg-void">
          <span className="tk-loading absolute inset-0" aria-hidden />
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            unoptimized={article.coverImage.src.endsWith('.svg')}
            className="object-cover"
          />
        </div>
        <p className="font-mono text-caption tracking-widest text-mute uppercase">
          {published} · {minutes} min read
        </p>
        <p className="text-lede text-ink">{article.excerpt}</p>
        <PortableBody value={article.body} />
        <button
          type="button"
          className="self-start border border-hairline px-4 py-2 font-mono text-caption tracking-widest uppercase"
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
          }}
        >
          {copied ? 'Link copied' : 'Share link'}
        </button>
      </div>
    </Sheet>
  );
}
