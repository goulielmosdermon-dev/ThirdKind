import Image from 'next/image';

import { DeckIndex } from './Index';
import { FadeIn } from './FadeIn';
import { PinnedRun } from './PinnedRun';
import { Reveal } from './Reveal';
import { type Brand } from './brands';
import { chapters, credits, type Block, type Plate } from './deck';

/** One font, one size — everything on the page uses this and nothing else. */
const TEXT = 'font-display text-[1.375rem] leading-[1.3]';

/** The index sits at half the deck's size, in the site sans — it labels, it
    doesn't speak, so it stays out of the deck's voice. */
const NAV = 'font-sans text-[0.6875rem] leading-[1.3]';

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
}: {
  block: Exclude<Block, { kind: 'text' }>;
  first: boolean;
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
 */
export function Deck({ brand }: { brand?: Brand }) {
  const entries = chapters
    .filter((c) => !c.unlisted)
    .map((c) => ({ id: c.id, title: c.title }));

  return (
    <div className="bg-paper text-ink">
      <DeckIndex entries={entries} textClass={NAV} />

      <main className="flex flex-col gap-[16vh] py-[12vh] lg:pl-44">
        {brand ? (
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
                />
              ),
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
