'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { AppLink, useFramed } from '@/components/mobile/MobileChrome';
import { IndexHeading } from '@/components/sheet/IndexHeading';
import { Sheet } from '@/components/sheet/Sheet';
import { PROJECT_COUNTRY } from '@/lib/canvas/derive';
import {
  COVER_FOCUS_FRAME,
  coverFocusStyle,
  isUnoptimizedAsset,
} from '@/lib/content/mediaSrc';
import { MOTION } from '@/lib/motion/tokens';
import { EDITORIAL_LINE } from '@/lib/type/display';
import type { Project } from '@/types/content';

/**
 * The crops the wall cycles through, so a column reads as a run of different
 * pictures rather than a stack of identical boxes.
 */
const ASPECTS = ['16/10', '3/4', '16/9', '1/1', '4/5', '3/2'] as const;

/** Crops set by hand, by slug, where the cycle's crop does not suit the picture. */
const ASPECT_BY_SLUG: Record<string, string> = {
  // Kept in step with its slot in the home index.
  'augustine-jewels': '20/21',
  scytales: '4/3',
};

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
  const reduced = useReducedMotion() ?? false;
  const [active, setActive] = useState(false);
  const tags = project.credits
    .map((credit) => credit.role)
    .filter((role) => role.trim().length > 0);
  const country = PROJECT_COUNTRY[project.slug.current];
  const sameName = project.client.trim() === project.title.trim();

  const copy = {
    off: { transition: { staggerChildren: 0 } },
    on: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
  };
  const line = {
    off: { y: '110%', transition: { duration: MOTION.reduced } },
    on: {
      y: '0%',
      transition: {
        duration: reduced ? MOTION.reduced : 0.55,
        ease: MOTION.easeOut,
      },
    },
  };
  const tag = {
    off: {
      opacity: 0,
      y: reduced ? 0 : 6,
      transition: { duration: MOTION.reduced },
    },
    on: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? MOTION.reduced : 0.45,
        ease: MOTION.easeOut,
      },
    },
  };

  return (
    <AppLink
      href={`/work/${project.slug.current}`}
      className="group block w-full"
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <motion.span
        className="relative block w-full overflow-hidden bg-hairline"
        style={{ aspectRatio: aspect }}
        initial={false}
        animate={active ? 'on' : 'off'}
      >
        <span className="tk-loading absolute inset-0" aria-hidden />
        <span className={COVER_FOCUS_FRAME}>
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
            style={coverFocusStyle(project.thumbnail)}
            className="object-cover"
          />
        </span>
        <motion.span
          variants={copy}
          className="absolute inset-x-0 bottom-0 flex flex-col items-start p-[clamp(1rem,2cqi,1.75rem)] text-white"
        >
          <span className="block overflow-hidden pt-[0.12em] pb-[0.26em]">
            <motion.span
              variants={line}
              className="font-display block leading-snug"
              style={{ fontSize: EDITORIAL_LINE }}
            >
              {sameName ? (
                project.title
              ) : (
                <>
                  {project.title}{' '}
                  <span className="text-white/70">{project.client}</span>
                </>
              )}
            </motion.span>
          </span>
          {tags.length || country ? (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((name) => (
                <motion.span
                  key={name}
                  variants={tag}
                  className="rounded-full border border-white/60 px-3 py-1 text-[0.78rem] leading-none"
                >
                  {name}
                </motion.span>
              ))}
              {country ? (
                <motion.span
                  variants={tag}
                  className="border border-white/60 px-3 py-1 text-[0.78rem] leading-none"
                >
                  {country}
                </motion.span>
              ) : null}
            </span>
          ) : null}
        </motion.span>
      </motion.span>
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
    aspect:
      ASPECT_BY_SLUG[project.slug.current] ?? ASPECTS[index % ASPECTS.length]!,
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
              // The same gap down a column as across the columns.
              className="flex min-w-0 flex-col gap-[1.6cqi] max-md:gap-5"
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
