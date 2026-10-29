'use client';

import Image from 'next/image';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import { HeroFilm, WorkReel, WorkStory } from '@/components/sheet/WorkMedia';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { vimeoIdFromUrl } from '@/lib/content/vimeo';
import { HEADER_LINE } from '@/lib/type/display';
import type { Project } from '@/types/content';

export function ProjectSheet({
  project,
  moreWork,
}: {
  project: Project;
  moreWork: Project[];
}) {
  const framed = useFramed();
  const vimeoId = vimeoIdFromUrl(project.heroVideoUrl);
  const useStory = project.story.length > 0;

  return (
    <Sheet title={project.title} tone="editorial">
      <article data-surface="light" className="bg-paper">
        <header
          className={`px-12 pb-10 @md:px-[8cqi] ${framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'}`}
        >
          <h1
            className="font-display w-full max-w-[18ch] leading-[1.02] font-semibold tracking-[-0.015em] text-balance text-ink"
            style={{ fontSize: HEADER_LINE }}
          >
            {project.title}
          </h1>
        </header>

        <div className="px-12 pb-10 @md:px-[8cqi]">
          <Image
            src={project.posterImage.src}
            alt={project.posterImage.alt}
            width={project.posterImage.width}
            height={project.posterImage.height}
            priority
            sizes="(min-width: 1024px) 84vw, 84vw"
            unoptimized={isUnoptimizedAsset(project.posterImage)}
            className="h-auto w-full"
          />
        </div>

        <div
          data-surface="light"
          className="bg-paper px-12 pt-6 pb-24 @md:px-[8cqi] @md:pt-10"
        >
          <div className="mx-auto flex max-w-[1100px] flex-col gap-14 @md:gap-16">
            {vimeoId ? (
              <HeroFilm vimeoId={vimeoId} title={`${project.title} film`} />
            ) : null}

            {useStory ? (
              <WorkStory beats={project.story} />
            ) : (
              <div className="max-w-[38rem]">
                <PortableBody
                  value={project.body}
                  density="editorial"
                  copyClassName="text-[clamp(1rem,1.5vw,1.2rem)] leading-[1.8] text-ink"
                />
              </div>
            )}

            <WorkReel vimeoIds={project.reel ?? []} />
          </div>
        </div>

        {moreWork.length > 0 ? (
          <section data-surface="dark" className="bg-black pt-20 pb-28">
            {/* Every card is the same width with the same crop, so the runs
                between them read as one rhythm rather than a gap that changes
                with each still. */}
            <ul className="flex items-end gap-[2cqi] overflow-x-auto overscroll-x-contain px-[6cqi] pb-2 max-md:gap-6 max-md:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {moreWork.map((item) => (
                <li
                  key={item._id}
                  className="w-[min(70cqi,24rem)] shrink-0 max-md:w-[min(78cqi,20rem)]"
                >
                  <AppLink
                    href={`/work/${item.slug.current}`}
                    className="block"
                  >
                    <span className="relative block aspect-video overflow-hidden bg-hairline">
                      <Image
                        src={item.thumbnail.src}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 24rem, 70vw"
                        unoptimized={isUnoptimizedAsset(item.thumbnail)}
                        className="object-cover"
                      />
                    </span>
                    <span className="mt-4 block font-sans text-[1.05rem] leading-snug text-white">
                      {item.title}
                      {item.client.trim() !== item.title.trim() ? (
                        <>
                          {' '}
                          <span className="font-display text-white/70">
                            {item.client}
                          </span>
                        </>
                      ) : null}
                    </span>
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
