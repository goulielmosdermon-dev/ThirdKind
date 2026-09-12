'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { AppLink } from '@/components/mobile/MobileChrome';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import type { Project } from '@/types/content';

/**
 * The work as one long wall: columns of stills that keep going down, dealt out
 * again as the reader reaches the end of them. It scrolls the way the rest of
 * the site does — nothing moves sideways.
 */

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

/** How many columns fit at a given width. */
function columnsFor(width: number): number {
  if (width < 560) return 1;
  if (width < 860) return 2;
  if (width < 1180) return 3;
  if (width < 1500) return 4;
  return 5;
}

/** The first runs of the catalogue are what load. */
const FIRST_RUNS = 2;
/** A ceiling, so a reader who holds scroll does not grow the page forever. */
const MAX_RUNS = 40;
/** How close to the bottom the reader gets before the next run is dealt. */
const REACH = 1600;

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
        className="relative block w-full overflow-hidden rounded-md bg-hairline"
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

export function WorkIndexSheet({ projects }: { projects: Project[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);
  const [runs, setRuns] = useState(FIRST_RUNS);

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

  // The wall has no end: as the reader comes within a screen or so of the
  // bottom another run of the catalogue is dealt on behind them. The sheet
  // scrolls in its own box, so the reach is measured against that box rather
  // than the window.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) {
      return;
    }
    let scroller: HTMLElement | null = grid.parentElement;
    while (scroller) {
      const overflow = getComputedStyle(scroller).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        break;
      }
      scroller = scroller.parentElement;
    }
    if (!scroller) {
      return;
    }
    const box = scroller;
    const onScroll = () => {
      const left = box.scrollHeight - box.scrollTop - box.clientHeight;
      if (left < REACH) {
        setRuns((current) => Math.min(current + 1, MAX_RUNS));
      }
    };
    box.addEventListener('scroll', onScroll, { passive: true });
    return () => box.removeEventListener('scroll', onScroll);
  }, []);

  if (projects.length === 0) {
    return (
      <Sheet title="Work" tone="editorial">
        <div data-surface="light" className="bg-paper" />
      </Sheet>
    );
  }

  // One long deal of cards — the catalogue, over and over — dropped into the
  // columns in turn, so the columns stay level however tall each card is.
  const cards = Array.from({ length: runs * projects.length }, (_, index) => ({
    key: index,
    project: projects[index % projects.length]!,
    aspect: ASPECTS[index % ASPECTS.length]!,
  }));
  const lanes = Array.from({ length: columns }, (_, lane) =>
    cards.filter((card) => card.key % columns === lane),
  );

  return (
    <Sheet title="Work" tone="editorial">
      <div data-surface="light" className="bg-paper">
        <div
          ref={gridRef}
          className="flex items-start gap-[1.6cqi] px-[3cqi] pt-24 pb-[6cqi] max-md:gap-5 max-md:px-5 max-md:pt-20"
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
