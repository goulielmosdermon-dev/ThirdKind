'use client';

import Image from 'next/image';

import { AppLink } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { PillLabel } from '@/components/sheet/PillLabel';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import type { Project } from '@/types/content';

function FeaturedProject({ project }: { project: Project }) {
  return (
    <AppLink
      href={`/work/${project.slug.current}`}
      className="group relative block aspect-[16/9] w-full overflow-hidden bg-black"
    >
      <span className="tk-loading absolute inset-0" aria-hidden />
      <Image
        src={project.posterImage.src}
        alt=""
        fill
        priority
        sizes="100vw"
        unoptimized={isUnoptimizedAsset(project.posterImage)}
        className="object-cover"
      />
      <span
        className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/25"
        aria-hidden
      />
      <span className="absolute inset-x-0 top-0 flex flex-col items-start gap-3 p-[4cqi] @md:p-[3cqi]">
        <span className="block">
          <span className="block font-display text-[clamp(1rem,1.9cqi,1.4rem)] leading-tight text-white">
            {project.client}
          </span>
          <span className="mt-0.5 block text-[clamp(0.85rem,1.5cqi,1.1rem)] leading-tight text-white/80">
            {project.title}
          </span>
        </span>
        <PillLabel label="View" tone="paper" />
      </span>
    </AppLink>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <li>
      <AppLink href={`/work/${project.slug.current}`} className="group block">
        <span className="relative block aspect-[4/3] w-full overflow-hidden bg-hairline">
          <span className="tk-loading absolute inset-0" aria-hidden />
          <Image
            src={project.thumbnail.src}
            alt=""
            fill
            sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 90vw"
            unoptimized={isUnoptimizedAsset(project.thumbnail)}
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        </span>
        <span className="mt-3 block font-display text-[1.05rem] leading-tight text-ink">
          {project.client}
        </span>
        <span className="mt-1 block text-[0.95rem] leading-snug text-mute">
          {project.title}
        </span>
      </AppLink>
    </li>
  );
}

export function WorkIndexSheet({
  projects,
  standfirst,
}: {
  projects: Project[];
  standfirst: string;
}) {
  // The featured project leads; everything else, itself included, sits in the
  // grid so the page still reads as a complete list.
  const featured = projects.find((project) => project.featured) ?? projects[0];

  return (
    <Sheet title="Work" tone="editorial">
      <div data-surface="light" className="bg-paper pb-24">
        <div className="px-[5cqi] pt-[7cqi] pb-[3cqi] @md:pt-[5cqi]">
          <IndexHeading name="Work" standfirst={standfirst} />
        </div>

        {featured ? (
          <div className="px-[5cqi]">
            <FeaturedProject project={featured} />
          </div>
        ) : null}

        <ul className="mt-[4cqi] grid grid-cols-2 gap-x-[2.5cqi] gap-y-[3.5cqi] px-[5cqi] @md:grid-cols-3 @xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </ul>
      </div>
    </Sheet>
  );
}
