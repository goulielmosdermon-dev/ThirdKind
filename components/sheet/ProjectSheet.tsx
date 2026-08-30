'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import type { Project } from '@/types/content';

export function ProjectSheet({
  project,
  prevSlug,
  nextSlug,
}: {
  project: Project;
  prevSlug?: string;
  nextSlug?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const vimeoId = project.heroVideoUrl.split('/').filter(Boolean).at(-1);

  return (
    <Sheet title={`${project.client} — ${project.title}`}>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <div className="relative aspect-video overflow-hidden bg-neutral-900">
          {playing && vimeoId ? (
            <iframe
              title={`${project.title} film`}
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
              className="h-full w-full"
              allow="autoplay; fullscreen"
            />
          ) : (
            <button
              type="button"
              className="relative h-full w-full cursor-pointer"
              onClick={() => setPlaying(true)}
            >
              <Image
                src={project.posterImage.src}
                alt={project.posterImage.alt}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                unoptimized={project.posterImage.src.endsWith('.svg')}
                className="object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-sm tracking-wide uppercase">
                Play
              </span>
            </button>
          )}
        </div>

        <header>
          <p className="text-sm text-neutral-400">{project.client}</p>
          <p className="mt-2 text-neutral-300">{project.hoverDescription}</p>
        </header>

        {project.credits.length > 0 ? (
          <ul className="space-y-1 font-mono text-sm text-neutral-400">
            {project.credits.map((credit) => (
              <li key={`${credit.role}-${credit.name}`}>
                {credit.role} — {credit.name}
              </li>
            ))}
          </ul>
        ) : null}

        <PortableBody value={project.body} />

        {project.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {project.gallery.map((item, index) =>
              item._type === 'image' ? (
                <div
                  key={`${item.image.src}-${index}`}
                  className="relative aspect-square"
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="300px"
                    unoptimized={item.image.src.endsWith('.svg')}
                    className="object-cover"
                  />
                </div>
              ) : (
                <p key={item.url} className="text-sm text-neutral-400">
                  {item.url}
                </p>
              ),
            )}
          </div>
        ) : null}

        <nav className="flex justify-between border-t border-neutral-800 pt-6 text-sm">
          {prevSlug ? (
            <Link
              href={`/work/${prevSlug}`}
              className="underline-offset-4 hover:underline"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          {nextSlug ? (
            <Link
              href={`/work/${nextSlug}`}
              className="underline-offset-4 hover:underline"
            >
              Next
            </Link>
          ) : null}
        </nav>
      </div>
    </Sheet>
  );
}
