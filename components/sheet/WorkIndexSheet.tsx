'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import type { Project } from '@/types/content';

/**
 * The crops the wall cycles through, so a column reads as a run of different
 * pictures rather than a stack of identical boxes.
 */
const ASPECTS = ['16/10', '3/4', '16/9', '1/1', '4/5', '3/2'] as const;

/**
 * Column widths, repeated across however many columns there is room for. They
 * are close to even but never quite, which is what keeps the wall from
 * settling into a table.
 */
const WEIGHTS = [1, 0.88, 1.16, 0.94, 1.08] as const;

/** How many columns fit at a given width. Two at most. */
function columnsFor(width: number): number {
  return width < 560 ? 1 : 2;
}

function ProjectCard({
  project,
  aspect,
  eager,
}: {
  project: Project;
  aspect: string;
  eager: boolean;
}) {
  return (
    <AppLink
      href={`/work/${project.slug.current}`}
      className="group block w-full"
    >
      <span
        className="relative block w-full overflow-hidden bg-hairline"
        style={{ aspectRatio: aspect }}
      >
        <span className="tk-loading absolute inset-0" aria-hidden />
        <Image
          src={project.thumbnail.src}
          alt=""
          fill
          priority={eager}
          loading={eager ? undefined : 'lazy'}
          // Well over the card's own width, and at a quality that leaves the
          // grain alone: nothing here should look re-encoded.
          sizes="560px"
          quality={95}
          unoptimized={isUnoptimizedAsset(project.thumbnail)}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      </span>
      <span className="mt-3 block text-[0.82rem] leading-tight text-mute">
        {project.client}
      </span>
      <span className="font-display mt-1 block text-[1.05rem] leading-tight text-ink">
        {project.title}
      </span>
    </AppLink>
  );
}

export function WorkIndexSheet({
  projects,
  standfirst,
}: {
  projects: Project[];
  standfirst?: string;
}) {
  const framed = useFramed();
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2);

  // Column count is worked out here rather than in CSS because the cards are
  // dealt into the columns one by one: the wall has to know how many there
  // are before it can share them out.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }
    const measure = () => setColumns(columnsFor(grid.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  if (projects.length === 0) {
    return (
      <Sheet title="Work" tone="editorial">
        <div data-surface="light" className="bg-paper" />
      </Sheet>
    );
  }

  // One deal of the catalogue, dropped into the columns in turn so they stay
  // level however tall each card is.
  const cards = projects.map((project, index) => ({
    key: index,
    project,
    aspect: ASPECTS[index % ASPECTS.length]!,
  }));
  const lanes = Array.from({ length: columns }, (_, lane) =>
    cards.filter((card) => card.key % columns === lane),
  );

  return (
    <Sheet title="Work" tone="editorial">
      <div data-surface="light" className="bg-paper">
        <div
          // Clear of the close button, which floats over this corner.
          className={`px-[3cqi] pb-[3cqi] max-md:px-12 ${
            framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'
          }`}
        >
          <IndexHeading name="Work" standfirst={standfirst} />
        </div>

        <div
          ref={gridRef}
          className="flex items-start gap-[1.6cqi] px-[3cqi] pt-[3cqi] pb-[6cqi] max-md:gap-5 max-md:px-12"
        >
          {lanes.map((lane, index) => (
            <div
              key={index}
              className="flex min-w-0 flex-col gap-[4cqi] max-md:gap-10"
              style={{ flex: `${WEIGHTS[index % WEIGHTS.length]} 1 0%` }}
            >
              {lane.map((card) => (
                <ProjectCard
                  key={card.key}
                  project={card.project}
                  aspect={card.aspect}
                  eager={card.key < columns * 2}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
