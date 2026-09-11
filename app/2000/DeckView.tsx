import Image from 'next/image';

import { DeckIndex } from './Index';
import { FadeIn } from './FadeIn';
import { Lead } from './Lead';
import { SmoothPage } from './SmoothPage';
import { PinnedRun } from './PinnedRun';
import { Reveal } from './Reveal';
import { FilmPlayer } from '@/components/sheet/FilmPlayer';
import { type Brand } from './brands';
import {
  chapters as deck2000,
  credits as credits2000,
  type Block,
  type Chapter,
  type Credit,
  type Plate,
} from './deck';

/** One font, one size — everything on the page uses this and nothing else. */
const TEXT = 'font-display text-[1.375rem] leading-[1.3]';

/** The index sits at half the deck's size, in the site sans — it labels, it
    doesn't speak, so it stays out of the deck's voice. Set in caps, with the
    tracking that small caps need to stay legible rather than bunch up. */
const NAV =
  'font-sans text-[0.6875rem] leading-[1.3] uppercase tracking-[0.09em]';

/** Every block shares one spine: text sits on the same left edge as the plates. */
function Column({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 md:px-10">
      {children}
    </div>
  );
}

/**
 * Source files are served untouched: `unoptimized` keeps Next from
 * re-encoding the plates, which is the whole point of the deck.
 */
function Frame({
  plate,
  sizes,
  priority = false,
}: {
  plate: Plate;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={plate.src}
      alt={plate.alt}
      width={plate.w}
      height={plate.h}
      sizes={sizes}
      priority={priority}
      unoptimized
      className="h-auto w-full"
    />
  );
}

/** Everything that is not a pinned text run. */
function BlockView({
  block,
  first,
  credits,
}: {
  block: Exclude<Block, { kind: 'text' }>;
  first: boolean;
  credits: Credit[];
}) {
  switch (block.kind) {
    case 'full':
      return (
        <Column>
          <FadeIn>
            <figure>
              {block.caption ? (
                <figcaption className={`mb-[6vh] ${TEXT}`}>
                  {block.caption}
                </figcaption>
              ) : null}
              <Frame
                plate={block.image}
                sizes="(min-width: 1180px) 1180px, 100vw"
                priority={first}
              />
            </figure>
          </FadeIn>
        </Column>
      );

    /* The pair is deliberately off-balance — the second plate hangs lower so
       two images never read as a slide with two boxes on it. */
    case 'pair':
      return (
        <Column>
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-10">
            <FadeIn className="md:pt-[4vw]">
              <figure>
                {block.caption ? (
                  <figcaption className={`mb-[6vh] ${TEXT}`}>
                    {block.caption}
                  </figcaption>
                ) : null}
                <Frame
                  plate={block.images[0]}
                  sizes="(min-width: 768px) 46vw, 100vw"
                />
              </figure>
            </FadeIn>
            <FadeIn className="md:pt-[14vw]">
              <figure>
                <Frame
                  plate={block.images[1]}
                  sizes="(min-width: 768px) 46vw, 100vw"
                />
              </figure>
            </FadeIn>
          </div>
        </Column>
      );

    case 'plate':
      return (
        <figure className="flex w-full justify-center">
          <FadeIn className="w-[min(320px,60vw)]">
            <Frame plate={block.image} sizes="320px" />
          </FadeIn>
        </figure>
      );

    case 'lead':
      return (
        <Lead
          text={block.text}
          image={block.image}
          className={`${TEXT} text-[clamp(2.5rem,9vw,6rem)] leading-none`}
        />
      );

    /* An itemised run — a scope, a set of deliverables. The heading holds
       the left of the section while the items scroll past it, and the section
       lets go once the last one is through. */
    case 'list':
      return (
        <Column>
          <div className="grid grid-cols-1 gap-[6vh] md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
            {block.title ? (
              // The column stretches to the row — that is the box the
              // heading sticks inside — and the heading itself is the short
              // element that travels down it. Sticking the stretched item
              // instead pins nothing, and giving it a screen's height lets go
              // a whole viewport early.
              <div className="md:h-full">
                <div className="md:sticky md:top-[22vh]">
                  <Reveal className={TEXT} lines={[block.title]} />
                </div>
              </div>
            ) : (
              <div aria-hidden />
            )}
            {/* The first item starts level with the heading; the tail gives
                the last one room to clear before the section releases. */}
            <ul className={`flex flex-col md:pb-[12vh] ${TEXT}`}>
              {block.items.map((item) => (
                <li key={item}>
                  <FadeIn delay={0.04}>
                    {/* The rule is the list's only ornament: it reads as a
                        schedule of work, not as bullets. */}
                    <span className="block border-t border-hairline py-[0.9em] md:py-[2.6em]">
                      {item}
                    </span>
                  </FadeIn>
                </li>
              ))}
            </ul>
          </div>
        </Column>
      );

    /* A film, in the same player the work pages use.

       It holds the screen the way a table does: the frame sticks for a
       viewport of scroll, so the film is not passed over before there is any
       chance to start it. */
    case 'film':
      return (
        <div className="h-[220svh]">
          <div className="sticky top-0 flex h-svh items-center">
            <Column>
              <FadeIn>
                <figure>
                  {block.caption ? (
                    <figcaption className={`mb-[4vh] ${TEXT}`}>
                      {block.caption}
                    </figcaption>
                  ) : null}
                  <FilmPlayer vimeoId={block.vimeoId} title={block.title} />
                </figure>
              </FadeIn>
            </Column>
          </div>
        </div>
      );

    /* A priced breakdown. Same measure and same voice as the deck — the only
       thing that separates the total from the rows is a heavier rule.

       It holds the screen for a beat rather than passing through: the frame
       sticks for a viewport of scroll, so a table is read rather than
       scrolled over, and the page moves on once it lets go. */
    case 'table':
      return (
        <div className="h-[200svh]">
          <div className="sticky top-0 flex h-svh items-center">
            <Column>
              <FadeIn>
                <figure className="max-w-[46rem]">
                  <figcaption className={`mb-[5vh] ${TEXT}`}>
                    {block.title}
                  </figcaption>
                  {/* Each line resolves as it arrives, a beat behind the one
                      above it, so the breakdown reads down rather than
                      landing. */}
                  <dl className={TEXT}>
                    {block.rows.map(([label, value], i) => (
                      <FadeIn key={label} delay={i * 0.09}>
                        <div className="flex items-baseline justify-between gap-8 border-t border-hairline py-[0.85em]">
                          <dt className="min-w-0">{label}</dt>
                          <dd className="shrink-0 tabular-nums text-mute">
                            {value}
                          </dd>
                        </div>
                      </FadeIn>
                    ))}
                    <FadeIn delay={block.rows.length * 0.09}>
                      <div className="flex items-baseline justify-between gap-8 border-t-2 border-ink py-[0.85em]">
                        <dt className="min-w-0">{block.total[0]}</dt>
                        <dd className="shrink-0 tabular-nums">
                          {block.total[1]}
                        </dd>
                      </div>
                    </FadeIn>
                  </dl>
                  {block.caption ? (
                    <p className={`mt-[3vh] max-w-[44ch] ${TEXT} text-mute`}>
                      {block.caption}
                    </p>
                  ) : null}
                </figure>
              </FadeIn>
            </Column>
          </div>
        </div>
      );

    /* Slide 30: the plate on the left, the two names stacked down the right. */
    case 'credits':
      return (
        <Column>
          <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-2 md:gap-16">
            <FadeIn>
              <figure>
                <Frame
                  plate={block.image}
                  sizes="(min-width: 768px) 46vw, 100vw"
                />
              </figure>
            </FadeIn>
            <div className="flex flex-col justify-between gap-[14vh] py-[6vh]">
              {credits.map((person) => (
                <Reveal
                  key={person.name}
                  className={TEXT}
                  lines={[
                    person.name,
                    person.role,
                    `__${person.url}|${person.href}__`,
                  ]}
                />
              ))}
            </div>
          </div>
        </Column>
      );
  }
}

/**
 * Consecutive text slides are one pinned run; anything else stays in the
 * normal flow. Grouping happens here rather than in the deck so the data
 * stays a plain list of slides in order.
 */
type Group =
  | { run: true; texts: string[][] }
  | { run: false; block: Exclude<Block, { kind: 'text' }> };

function groupBlocks(blocks: Block[]): Group[] {
  const groups: Group[] = [];

  for (const block of blocks) {
    if (block.kind === 'text') {
      const last = groups.at(-1);
      if (last?.run) last.texts.push(block.lines);
      else groups.push({ run: true, texts: [block.lines] });
    } else {
      groups.push({ run: false, block });
    }
  }

  return groups;
}

/**
 * The deck. `brand` adds the recipient's mark ahead of the opening plate;
 * without one the deck reads as the unbranded original.
 *
 * The slides arrive as data, so a second deck is a second `chapters` list
 * rather than a second copy of this file — every rule of the page, the index,
 * the pinned runs and the reveals, is shared.
 */
export function Deck({
  brand,
  chapters = deck2000,
  credits = credits2000,
}: {
  brand?: Brand;
  chapters?: Chapter[];
  credits?: Credit[];
}) {
  const entries = chapters
    .filter((c) => !c.unlisted)
    .map((c) => ({ id: c.id, title: c.title }));

  return (
    <div className="bg-paper text-ink">
      <SmoothPage />
      <DeckIndex entries={entries} textClass={NAV} />

      <main className="flex flex-col gap-[16vh] py-[12vh] lg:pl-44">
        {brand?.logo ? (
          <Column>
            <FadeIn>
              <Image
                src={brand.logo.src}
                alt={brand.name}
                width={brand.logo.w}
                height={brand.logo.h}
                priority
                unoptimized
                /* Brand marks arrive on a white box; multiply drops it into
                   the paper without needing a cut-out of every logo. */
                className="h-auto w-[min(220px,45vw)] mix-blend-multiply"
              />
            </FadeIn>
          </Column>
        ) : null}

        {chapters.map((chapter, ci) => (
          <section
            key={chapter.id}
            id={`ch-${chapter.id}`}
            className="flex flex-col gap-[12vh]"
          >
            <h2 className="sr-only">{chapter.title}</h2>
            {groupBlocks(chapter.blocks).map((group, gi) =>
              group.run ? (
                <PinnedRun key={gi} texts={group.texts} className={TEXT} />
              ) : (
                <BlockView
                  key={gi}
                  block={group.block}
                  first={ci === 0 && gi === 0}
                  credits={credits}
                />
              ),
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
