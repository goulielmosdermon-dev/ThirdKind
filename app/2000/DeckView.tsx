import Image from 'next/image';

import { DeckIndex } from './Index';
import { FadeIn } from './FadeIn';
import { Lead } from './Lead';
import { SmoothPage } from './SmoothPage';
import { SoundBar } from './SoundBar';
import { PinnedRun } from './PinnedRun';
import { Quadrant } from './Quadrant';
import { SwapRun, type Slide } from './SwapRun';
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
  className = 'h-auto w-full',
}: {
  plate: Plate;
  sizes: string;
  priority?: boolean;
  /**
   * How the plate fills its box. The flowing page gives a plate all the height
   * it asks for, so the default is the full width at natural height; a slide
   * has only the screen, and overrides this to fit inside it.
   */
  className?: string;
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
      className={className}
    />
  );
}

/**
 * A block with no frame of its own: no full-height box, no fade, no sticky.
 * The run it sits in owns all of that — this is only what the slide shows.
 */
function SlideBody({ block }: { block: Exclude<Block, { kind: 'text' }> }) {
  switch (block.kind) {
    case 'lead':
      return block.image ? (
        <Image
          src={block.image.src}
          alt={block.image.alt}
          width={block.image.w}
          height={block.image.h}
          priority
          unoptimized
          /* A raster mark arrives on a white box, and multiply drops it into
             the paper without needing a cut-out of every logo. A vector one is
             already cut out, and multiplying would only dirty its colour. */
          className={`mx-auto h-auto w-[min(34rem,78vw)] ${
            block.image.src.endsWith('.svg') ? '' : 'mix-blend-multiply'
          }`}
        />
      ) : (
        <p className={`${TEXT} text-[clamp(2.5rem,9vw,6rem)] leading-none`}>
          {block.text}
        </p>
      );

    case 'sound':
      return (
        <SoundBar
          src={block.src}
          title={block.title}
          artist={block.artist}
          className={TEXT}
        />
      );

    /* The plates are bounded here in a way the flowing page never needed. A
       slide has exactly the screen: a tall plate given its natural height
       runs off the bottom of a frame that cannot scroll, and a caption above
       it takes room the plate then has to give back. `object-contain` inside
       a capped box keeps the whole image on screen at whatever shape it
       happens to be. */
    case 'full':
      return (
        <figure>
          {block.caption ? (
            <figcaption className={`mb-[4vh] max-w-[44ch] ${TEXT}`}>
              {block.caption}
            </figcaption>
          ) : null}
          <Frame
            plate={block.image}
            sizes="(min-width: 1180px) 1180px, 100vw"
            className={`mx-auto w-auto object-contain ${
              block.caption ? 'max-h-[46svh]' : 'max-h-[74svh]'
            }`}
          />
        </figure>
      );

    case 'pair':
      return (
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
          <Frame
            plate={block.images[0]}
            sizes="(min-width: 768px) 46vw, 100vw"
            className="mx-auto max-h-[64svh] w-auto object-contain md:max-h-[70svh]"
          />
          <Frame
            plate={block.images[1]}
            sizes="(min-width: 768px) 46vw, 100vw"
            className="mx-auto max-h-[64svh] w-auto object-contain md:max-h-[70svh]"
          />
        </div>
      );

    case 'plate':
      return (
        <figure className="flex w-full justify-center">
          <div className="w-[min(320px,60vw)]">
            <Frame plate={block.image} sizes="320px" />
          </div>
        </figure>
      );

    /* Set by height rather than into a grid: every still keeps its own shape
       and nothing is cropped to make the rows line up. The board wraps into
       two or three rows and reads as one spread, which is the whole reason it
       is not a run of pairs. */
    case 'mosaic':
      return (
        <figure>
          {block.caption ? (
            <figcaption className={`mb-[4vh] max-w-[44ch] ${TEXT}`}>
              {block.caption}
            </figcaption>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {block.images.map((plate) => (
              <Frame
                key={plate.src}
                plate={plate}
                sizes="(min-width: 768px) 30vw, 45vw"
                className="h-[13svh] w-auto object-contain md:h-[17svh]"
              />
            ))}
          </div>
        </figure>
      );

    /* Sized off the slide rather than the page: one font size drives the
       dots, the gaps and every label, so the plot fills the frame without
       being redrawn for it. */
    case 'quadrant':
      return (
        <Quadrant
          block={block}
          className="mx-auto w-full max-w-[31rem] text-[clamp(0.53rem,1.05vw,0.85rem)]"
        />
      );

    /* A list is a slide in its own right here. It carries none of the page
       version's furniture — no Column, no FadeIn, and above all no sticky
       heading, which has nothing to stick to inside a frame that does not
       scroll. The heading simply holds the left of the slide. */
    case 'list': {
      const termed = block.items.some((item) => Array.isArray(item));

      return (
        <div className="grid grid-cols-1 gap-[4vh] md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-16">
          {block.title ? (
            <p className={TEXT}>{block.title}</p>
          ) : (
            <div aria-hidden />
          )}

          {termed ? (
            <dl className="flex flex-col gap-[3.5vh]">
              {block.items.map((item) => {
                const [term, note] = Array.isArray(item)
                  ? item
                  : [item as string, ''];
                return (
                  <div key={term}>
                    <dt className={TEXT}>{term}</dt>
                    {note ? (
                      <dd
                        className={`mt-[0.4em] max-w-[38ch] ${TEXT} text-mute`}
                      >
                        {note}
                      </dd>
                    ) : null}
                  </div>
                );
              })}
            </dl>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {block.items.map((item) => (
                <li key={String(item)}>
                  <span className="block rounded-full border border-hairline px-4 py-2 text-[0.95rem] leading-none text-mute">
                    {String(item)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    /*
      Still unwritten for a swapping deck: `table`, `film` and `credits`. They
      fall through to nothing rather than to a broken slide — but a blank
      slide is what a deck using them in `swap` would get, so write the case
      before reaching for the kind, not after.
    */
    default:
      return null;
  }
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
       the left of the section while the items sit beside it.

       Plain ones flow as tags: wrapped rather than stacked, so the rows break
       where the words do and the block reads loose instead of like a
       checklist. Ones carrying a note are set out as terms down the column,
       because a tag has nowhere to put the second line. */
    case 'list': {
      const termed = block.items.some((item) => Array.isArray(item));

      return (
        <Column>
          <div className="grid grid-cols-1 gap-[6vh] md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
            {block.title ? (
              // The column stretches to the row — that is the box the heading
              // sticks inside — and the heading itself is the short element
              // that travels down it.
              <div className="md:h-full">
                <div className="md:sticky md:top-[22vh]">
                  <Reveal className={TEXT} lines={[block.title]} />
                </div>
              </div>
            ) : (
              <div aria-hidden />
            )}

            {termed ? (
              <dl className="flex flex-col gap-[5vh]">
                {block.items.map((item, i) => {
                  const [term, note] = Array.isArray(item)
                    ? item
                    : [item as string, ''];
                  return (
                    <FadeIn key={term} delay={i * 0.06}>
                      <dt className={TEXT}>{term}</dt>
                      {note ? (
                        <dd
                          className={`mt-[0.4em] max-w-[38ch] ${TEXT} text-mute`}
                        >
                          {note}
                        </dd>
                      ) : null}
                    </FadeIn>
                  );
                })}
              </dl>
            ) : (
              /* Set below the deck's reading size: at full size each tag takes
                 a line of its own and the block reads as a list again, which
                 is the one thing it is not. */
              <ul className="flex flex-wrap gap-2">
                {block.items.map((item, i) => (
                  <li key={String(item)}>
                    <FadeIn delay={i * 0.05}>
                      <span className="block rounded-full border border-hairline px-4 py-2 text-[0.95rem] leading-none text-mute">
                        {String(item)}
                      </span>
                    </FadeIn>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Column>
      );
    }

    case 'sound':
      return (
        <Column>
          <FadeIn>
            <SoundBar
              src={block.src}
              title={block.title}
              artist={block.artist}
              className={TEXT}
            />
          </FadeIn>
        </Column>
      );

    case 'quadrant':
      return (
        <Column>
          <FadeIn>
            <Quadrant
              block={block}
              className="mx-auto w-full max-w-[31rem] text-[clamp(0.5rem,0.95vw,0.8rem)]"
            />
          </FadeIn>
        </Column>
      );

    case 'mosaic':
      return (
        <Column>
          <FadeIn>
            <figure>
              {block.caption ? (
                <figcaption className={`mb-[6vh] ${TEXT}`}>
                  {block.caption}
                </figcaption>
              ) : null}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                {block.images.map((plate) => (
                  <Frame
                    key={plate.src}
                    plate={plate}
                    sizes="(min-width: 768px) 30vw, 45vw"
                    className="h-[16vh] w-auto object-contain md:h-[22vh]"
                  />
                ))}
              </div>
            </figure>
          </FadeIn>
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
  motion = 'pinned',
}: {
  brand?: Brand;
  chapters?: Chapter[];
  credits?: Credit[];
  /**
   * How the deck carries the reader. `pinned` holds a run of texts still and
   * swaps them in place, with the plates scrolling past between the runs;
   * `swap` does that to the whole deck — every slide, plates included, is
   * replaced on the spot and nothing ever travels up the screen.
   */
  motion?: 'pinned' | 'swap';
}) {
  const swap = motion === 'swap';

  /* One slide per block, in order, with the first of each chapter carrying
     the id the rail links to. */
  const slides: Slide[] = swap
    ? chapters.flatMap((chapter) =>
        chapter.blocks.map((block, index) => ({
          chapter: index === 0 ? chapter.id : undefined,
          ...(block.kind === 'text'
            ? { lines: block.lines }
            : { node: <SlideBody block={block} /> }),
        })),
      )
    : [];
  const entries = chapters
    .filter((c) => !c.unlisted)
    .map((c) => ({ id: c.id, title: c.title }));

  return (
    <div className="bg-paper text-ink">
      {/* A stepping deck owns the wheel itself — a gesture is one slide, not a
          distance — so the page easing would only be a second hand on the same
          control, fighting each step as it lands. */}
      {swap ? null : <SmoothPage />}
      <DeckIndex entries={entries} textClass={NAV} />

      <main
        className={`flex flex-col lg:pl-44 ${
          swap ? '' : 'gap-[16vh] py-[12vh]'
        }`}
      >
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

        {swap ? (
          <>
            {/* Named for the reader of a screen reader, who gets the run as a
                list of chapters rather than as a stack of slides. */}
            {chapters.map((chapter) => (
              <h2 key={chapter.id} className="sr-only">
                {chapter.title}
              </h2>
            ))}
            <SwapRun slides={slides} className={TEXT} />
          </>
        ) : (
          chapters.map((chapter, ci) => (
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
          ))
        )}
      </main>
    </div>
  );
}
