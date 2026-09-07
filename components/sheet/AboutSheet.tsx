'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';

import { useFramed } from '@/components/mobile/MobileChrome';
import { PortableBody } from '@/components/sheet/PortableBody';
import { ServicesFaq } from '@/components/sheet/ServicesFaq';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import { MOTION } from '@/lib/motion/tokens';
import type {
  AboutSection,
  Faq,
  PortableText,
  ProcessStep,
  ServiceOffering,
  ServicesOffer,
} from '@/types/content';

const PROCESS_INTRO = 'From brief to delivery, with the numbers kept honest.';

const TEAM_INTRO =
  'From slightly elsewhere. Different backgrounds, one stubborn standard for the work.';

function poemLines(value: PortableText): string[] {
  return value
    .flatMap((block) =>
      block._type === 'block'
        ? [
            block.children
              .map((child) => child.text)
              .join('')
              .trim(),
          ]
        : [],
    )
    .filter(Boolean);
}

function PoemReveal({ lines, framed }: { lines: string[]; framed: boolean }) {
  const reduced = useReducedMotion();

  return (
    <div
      className={`flex min-h-[var(--frame-h,calc(100dvh-5rem))] items-center px-[8cqi] pb-24 ${
        framed ? 'pt-[6.5rem]' : 'pt-20'
      }`}
    >
      <div className="max-w-[28ch]">
        {lines.map((line, index) => (
          <motion.p
            key={`${index}-${line}`}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? MOTION.reduced : 0.95,
              delay: reduced ? 0 : 0.08 + index * 0.16,
              ease: MOTION.easeOut,
            }}
            className="font-display text-[1.05rem] leading-[1.85] text-ink"
          >
            {line}
          </motion.p>
        ))}
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduced ? MOTION.reduced : 0.95,
            // Lands after the last line, so the poem finishes before the
            // credit arrives.
            delay: reduced ? 0 : 0.08 + lines.length * 0.16,
            ease: MOTION.easeOut,
          }}
          className="mt-8 text-[0.85rem] tracking-[0.06em] text-mute"
        >
          Felix Dennis
        </motion.p>
      </div>
    </div>
  );
}

function ProcessView({
  title,
  intro,
  steps,
  framed,
}: {
  title: string;
  intro: string;
  steps: ProcessStep[];
  framed: boolean;
}) {
  const ordered = steps.slice().sort((a, b) => a.step - b.step);

  return (
    <div className="px-[8cqi] pb-28">
      <header className={`pb-10 ${framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'}`}>
        <h1 className="font-display mt-4 w-full max-w-[40ch] text-[clamp(2.25rem,4.6cqi,3.85rem)] leading-[1.08] text-balance text-white">
          {title}
        </h1>
        {intro ? (
          <p className="mt-6 max-w-[36rem] text-[1.05rem] leading-snug text-white/70">
            {intro}
          </p>
        ) : null}
      </header>
      {/* Two across: the whole process is on screen when the page opens, so
          there is nothing to scroll through to see it. */}
      <ol className="grid grid-cols-1 gap-x-12 gap-y-14 pt-8 @md:grid-cols-2">
        {ordered.map((step) => (
          <li key={step.step} className="flex flex-col">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 text-sm text-white">
              {step.step}
            </span>
            <h2 className="font-display mt-6 text-[clamp(1.5rem,2.6cqi,2.25rem)] leading-tight text-white">
              {step.title}
            </h2>
            <p className="mt-5 text-[clamp(1.15rem,1.9cqi,1.5rem)] leading-[1.4] text-white">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One discipline, dressed like the FAQ rows beside it. The panel still opens
 * over whatever sits below it in the grid so the other column never reflows.
 */
function DisciplineRow({
  service,
  open,
  onToggle,
}: {
  service: ServiceOffering;
  open: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const panelId = useId();

  return (
    <li className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-[0.875rem] leading-snug transition-colors duration-200 ${
          open
            ? 'rounded-t-md bg-ink text-white'
            : 'rounded-md bg-black/[0.06] text-ink hover:bg-black/[0.1]'
        }`}
      >
        <span>{service.title}</span>
        <span aria-hidden className="shrink-0 text-base leading-none">
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="panel"
            role="region"
            // The panel is in flow, so opening a row pushes the rest of the
            // list down. It used to be absolutely positioned at @md, which
            // painted it straight over the next button and hid it.
            className="overflow-hidden rounded-b-md bg-ink"
            initial={reduced ? { height: 'auto' } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { height: 0 } : { height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? MOTION.reduced : MOTION.hub,
              ease: MOTION.easeOut,
            }}
          >
            <div className="flex gap-3 pt-1 pr-4 pb-4 pl-7 @md:pb-5">
              <span aria-hidden className="text-white/50">
                &#8627;
              </span>
              <p className="text-[0.875rem] leading-[1.45] text-white/90">
                {service.description}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function DisciplineGrid({ services }: { services: ServiceOffering[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-2 @md:grid-cols-2">
      {services.map((service) => {
        const key = service.slug.current;
        return (
          <DisciplineRow
            key={key}
            service={service}
            open={open === key}
            onToggle={() =>
              setOpen((current) => (current === key ? null : key))
            }
          />
        );
      })}
    </ul>
  );
}

function ServicesView({
  title,
  offer,
  services,
  faqs,
  framed,
}: {
  title: string;
  offer?: ServicesOffer;
  services: ServiceOffering[];
  faqs: Faq[];
  framed: boolean;
}) {
  // Same shape as the Work index: one left-aligned column inset by the page
  // gutter, with the image filling the width between those gutters.
  return (
    <div className="px-[5cqi] pb-28">
      <div className={framed ? 'pt-[6.5rem]' : 'pt-[7cqi] @md:pt-[5cqi]'}>
        <h1 className="font-display w-full max-w-[40ch] text-[clamp(2.25rem,4.6cqi,3.85rem)] leading-[1.08] text-balance text-ink">
          {title}.
        </h1>
      </div>

      <Image
        src="/about/our-work-together.jpg"
        alt="A constellation hand and a human hand reaching toward each other, the point where they meet marked “our work together”."
        width={1600}
        height={1558}
        sizes="(min-width: 900px) 90vw, 100vw"
        className="mt-[3cqi] w-full"
      />

      {offer ? (
        <p className="mt-[4cqi] max-w-[42rem] text-[clamp(1.2rem,2.2cqi,1.45rem)] leading-[1.45] text-ink">
          {offer.statement}
        </p>
      ) : null}
      <DisciplineGrid services={services} />
      <section className="mt-[6cqi]">
        <ServicesFaq faqs={faqs} />
      </section>
    </div>
  );
}

export function AboutSheet({
  section,
  poem,
}: {
  section: AboutSection;
  poem: PortableText;
}) {
  // Why opens its body with the same line as an h2, so a standfirst would repeat it.
  let intro = section.hoverDescription;
  if (section.key === 'team') {
    intro = TEAM_INTRO;
  } else if (section.key === 'process') {
    intro = PROCESS_INTRO;
  } else if (section.key === 'why') {
    intro = '';
  }
  const process = section.key === 'process';
  const poemPage = section.key === 'poem';
  const services = section.key === 'services';
  const framed = useFramed();

  return (
    <Sheet
      title={poemPage ? 'Poem' : section.title}
      tone="editorial"
      panelClassName={process ? 'bg-black text-white' : undefined}
    >
      <article
        data-surface={process ? 'dark' : 'light'}
        className={process ? 'bg-black text-white' : 'bg-paper'}
      >
        {poemPage ? (
          <PoemReveal lines={poemLines(poem)} framed={framed} />
        ) : process && section.key === 'process' ? (
          <ProcessView
            title={section.title}
            intro={intro}
            steps={section.processSteps}
            framed={framed}
          />
        ) : services && section.key === 'services' ? (
          <ServicesView
            title={section.title}
            offer={section.offer}
            services={section.services}
            faqs={section.faqs}
            framed={framed}
          />
        ) : (
          <>
            <header
              className={`snap-start pl-[8cqi] pr-4 pb-10 ${
                framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'
              }`}
            >
              <h1 className="font-display mt-4 w-full max-w-[40ch] text-[clamp(2.25rem,4.6cqi,3.85rem)] leading-[1.08] text-balance text-ink">
                {/* The full stop is the heading's, not the section's — the
                    title still reads plain in the tab, the nav and on the
                    canvas. */}
                {section.key === 'team' ? `${section.title}.` : section.title}
              </h1>
              {intro ? (
                <p className="mt-6 max-w-[36rem] text-[1.05rem] leading-snug text-mute">
                  {intro}
                </p>
              ) : null}
            </header>

            <div
              className={`mx-auto max-w-[42rem] px-[8cqi] @md:px-0 ${
                section.key === 'why' ? 'pb-48 @md:pb-56' : 'pb-24 @md:pb-28'
              }`}
            >
              {section.key === 'team' ? (
                <ul className="grid gap-6 @md:grid-cols-2">
                  {section.teamMembers.map((member) => (
                    <li key={member.name} className="flex flex-col gap-3">
                      <div className="relative aspect-square overflow-hidden bg-paper">
                        <Image
                          src={member.portrait.src}
                          alt={member.portrait.alt}
                          fill
                          sizes="300px"
                          unoptimized={isUnoptimizedSrc(member.portrait.src)}
                          className="object-cover"
                        />
                      </div>
                      <p className="font-display text-lede">{member.name}</p>
                      <p className="text-sm text-mute">{member.role}</p>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.key === 'why' ? (
                <PortableBody value={section.body} density="editorial" />
              ) : null}
            </div>
          </>
        )}
      </article>
    </Sheet>
  );
}
