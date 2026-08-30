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
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
          <Image
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            unoptimized={article.coverImage.src.endsWith('.svg')}
            className="object-cover"
          />
        </div>
        <p className="text-sm text-neutral-400">
          {published} · {minutes} min read
        </p>
        <p className="text-neutral-300">{article.excerpt}</p>
        <PortableBody value={article.body} />
        <button
          type="button"
          className="self-start border border-neutral-600 px-4 py-2 text-sm"
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
