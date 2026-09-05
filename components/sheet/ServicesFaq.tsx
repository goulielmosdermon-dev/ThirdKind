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
        className={`w-full rounded-md px-4 py-2.5 text-left text-[0.875rem] leading-snug transition-colors duration-200 ${
          open
            ? 'bg-ink text-white'
            : 'bg-black/[0.06] text-ink hover:bg-black/[0.1]'
        }`}
        onClick={onToggle}
      >
        {faq.question}
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
            <div className="flex gap-3 pt-3 pr-1 pb-2 pl-7">
              <span aria-hidden className="text-mute">
                &#8627;
              </span>
              <p className="text-[0.875rem] leading-[1.45] text-ink">
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
      <ul className="flex w-full flex-col gap-2">
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
