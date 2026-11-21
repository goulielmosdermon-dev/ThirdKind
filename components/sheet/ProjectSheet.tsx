'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import { HeroFilm, WorkReel, WorkStory } from '@/components/sheet/WorkMedia';
import { PROJECT_COUNTRY } from '@/lib/canvas/derive';
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
  const sameName = project.client.trim() === project.title.trim();
  // The published service list doubles as the work's tags, as on the index.
  const services = project.credits
    .map((credit) => credit.role)
    .filter((role) => role.trim().length > 0);
  const country = PROJECT_COUNTRY[project.slug.current];

  return (
    <Sheet title={project.title} tone="editorial">
      <article data-surface="light" className="bg-paper">
        <header
          className={`px-12 pb-16 @md:px-[8cqi] @md:pb-[7cqi] ${framed ? 'pt-[9rem]' : 'pt-32 @md:pt-[10cqi]'}`}
        >
          {/* Set like a thought's title: the client in the sans, the work's
              own name finishing the line in the serif. A project named after
              its client is just the name. */}
          <h1
            className="w-full max-w-[30ch] leading-[1.08] tracking-[-0.015em] text-ink"
            style={{ fontSize: HEADER_LINE }}
          >
            <span className="font-sans font-semibold tracking-[-0.025em]">
              {sameName ? project.title : project.client}
            </span>
            {sameName ? null : (
              <span className="font-display"> {project.title}</span>
            )}
          </h1>
          {services.length > 0 || country ? (
            <p className="mt-8 font-sans text-sm text-ink @md:mt-10 @md:text-base">
              {services.join(', ')}
              {services.length > 0 && country ? (
                <span aria-hidden className="mx-2">
                  •
                </span>
              ) : null}
              {country ? <span className="opacity-70">{country}</span> : null}
            </p>
          ) : null}
        </header>

        {/* Edge to edge; desktop crops height, phone runs twice as tall. */}
        <div className="pb-10">
          <div
            className="sheet-header-still relative w-full overflow-hidden"
            style={
              {
                '--still-w': project.posterImage.width,
                '--still-h': project.posterImage.height,
              } as CSSProperties
            }
          >
            <Image
              src={project.posterImage.src}
              alt={project.posterImage.alt}
              fill
              priority
              sizes="100vw"
              unoptimized={isUnoptimizedAsset(project.posterImage)}
              className="object-cover"
            />
          </div>
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
