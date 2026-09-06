'use client';

import Image from 'next/image';

import { AppLink } from '@/components/mobile/MobileChrome';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import { HeroFilm, WorkReel, WorkStory } from '@/components/sheet/WorkMedia';
import { isUnoptimizedAsset, isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import { vimeoIdFromUrl } from '@/lib/content/vimeo';
import type { Project } from '@/types/content';

export function ProjectSheet({
  project,
  moreWork,
}: {
  project: Project;
  moreWork: Project[];
}) {
  const vimeoId = vimeoIdFromUrl(project.heroVideoUrl);
  const useStory = project.story.length > 0;

  return (
    <Sheet title={project.title} tone="editorial">
      <article>
        <header
          data-surface="dark"
          className="relative min-h-[var(--frame-h,100dvh)] overflow-hidden"
        >
          <span className="tk-loading absolute inset-0" aria-hidden />
          <Image
            src={project.posterImage.src}
            alt={project.posterImage.alt}
            fill
            priority
            sizes="100vw"
            unoptimized={isUnoptimizedAsset(project.posterImage)}
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 px-[6cqi] pb-28 @md:px-[8cqi] @md:pb-20">
            <h1 className="font-display max-w-[18ch] text-[clamp(1.75rem,3.5cqi,3.15rem)] leading-[1.05] text-white">
              {project.title}
            </h1>
            <p className="mt-4 max-w-[36rem] text-[1.05rem] leading-snug text-white/90 @md:text-xl">
              {project.hoverDescription}
            </p>
          </div>
        </header>

        <div
          data-surface="light"
          className="bg-paper px-[6cqi] pt-16 pb-24 @md:px-[8cqi] @md:pt-24"
        >
          <div className="mx-auto flex max-w-[1100px] flex-col gap-14 @md:gap-16">
            {vimeoId ? (
              <HeroFilm vimeoId={vimeoId} title={`${project.title} film`} />
            ) : null}

            {useStory ? (
              <WorkStory beats={project.story} />
            ) : (
              <div className="max-w-[38rem]">
                <PortableBody value={project.body} density="editorial" />
              </div>
            )}

            <WorkReel vimeoIds={project.reel ?? []} />

            {project.credits.length > 0 ? (
              <div className="max-w-[38rem] text-ink">
                <p className="text-[1.05rem] leading-[1.8] font-semibold">
                  Services
                </p>
                {/* Tags wrap rather than stacking one to a line. */}
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.credits.map((credit) => (
                    <li
                      key={`${credit.role}-${credit.name}`}
                      className="rounded-full border border-hairline px-3.5 py-1.5 text-[0.85rem] leading-none text-mute"
                    >
                      {credit.name
                        ? `${credit.role} — ${credit.name}`
                        : credit.role}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {moreWork.length > 0 ? (
          <section data-surface="dark" className="bg-black pt-20 pb-28">
            <ul className="flex items-end gap-1.5 overflow-x-auto overscroll-x-contain px-[6cqi] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {moreWork.map((item) => (
                <li key={item._id} className="shrink-0">
                  <AppLink
                    href={`/work/${item.slug.current}`}
                    className="block"
                  >
                    <p className="font-display text-[1.2rem] leading-tight text-white">
                      {item.client}
                    </p>
                    <p className="mt-1 max-w-[16rem] text-sm leading-snug text-white/70">
                      {item.hoverDescription}
                    </p>
                    <Image
                      src={item.thumbnail.src}
                      alt=""
                      width={item.thumbnail.width}
                      height={item.thumbnail.height}
                      sizes="40vw"
                      unoptimized={isUnoptimizedSrc(item.thumbnail.src)}
                      className="mt-3 h-auto w-auto max-h-[min(52cqh,28rem)] max-w-[min(70cqi,28rem)]"
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
