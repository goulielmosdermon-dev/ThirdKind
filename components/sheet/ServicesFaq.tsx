'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';

import { MOTION } from '@/lib/motion/tokens';
import type { Faq } from '@/types/content';

function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const panelId = useId();

  return (
    <li className="w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="group flex w-full cursor-pointer items-baseline justify-between gap-4 border-0 bg-transparent py-2 text-left text-ink"
        onClick={onToggle}
      >
        <span
          className={`text-[clamp(1rem,1.5vw,1.2rem)] leading-snug underline underline-offset-4 ${
            open
              ? 'font-display italic'
              : 'font-sans not-italic group-hover:font-display group-hover:italic'
          }`}
        >
          {faq.question}
        </span>
        <span
          aria-hidden
          className="shrink-0 text-[clamp(1rem,1.5vw,1.2rem)] leading-none"
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            role="region"
            initial={reduced ? { height: 'auto' } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { height: 0 } : { height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? MOTION.reduced : MOTION.hub,
              ease: MOTION.easeOut,
            }}
            className="overflow-hidden"
          >
            <div className="flex gap-3 pt-1 pr-1 pb-3">
              <span aria-hidden className="text-mute">
                &#8627;
              </span>
              <p className="text-[clamp(1rem,1.5vw,1.2rem)] leading-[1.45] text-ink">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

/** Accordion: each question opens in place, so the list never jumps to the top. */
export function ServicesFaq({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-w-0">
      <p className="pb-4 text-sm lowercase text-mute">frequently asked</p>
      <ul className="flex w-full flex-col gap-1">
        {faqs.map((faq, index) => (
          <FaqItem
            key={faq.question}
            faq={faq}
            open={open === index}
            onToggle={() =>
              setOpen((current) => (current === index ? null : index))
            }
          />
        ))}
      </ul>
    </div>
  );
}
