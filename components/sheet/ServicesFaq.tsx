'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';

import { MOTION } from '@/lib/motion/tokens';
import { EDITORIAL_LINE } from '@/lib/type/display';
import type { Faq } from '@/types/content';

export type RuledItem = { key: string; label: string; body: string };

/**
 * One line, set like a line of the Thoughts list: its number where a thought
 * shows its tag, the label in the sans, a rule beneath. Opening it lets the
 * body open under the label, in the sans as well.
 */
function RuledRow({
  item,
  index,
  open,
  onToggle,
}: {
  item: RuledItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const panelId = useId();

  return (
    <li className="w-full border-b border-ink last:border-b-0">
      <div className="transition-opacity duration-300 group-hover/list:[&:not(:hover)]:opacity-30">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          className="grid w-full cursor-pointer grid-cols-[minmax(7rem,14%)_1fr_auto] items-baseline gap-x-[3cqi] border-0 bg-transparent py-[clamp(0.9rem,1.6cqi,1.4rem)] text-left text-ink max-md:grid-cols-[1fr_auto]"
          onClick={onToggle}
        >
          <span className="font-sans text-sm opacity-60 max-md:hidden">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className="font-sans leading-snug font-medium"
            style={{ fontSize: EDITORIAL_LINE }}
          >
            {item.label}
          </span>
          <span
            aria-hidden
            className={`shrink-0 leading-none transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? 'rotate-45' : ''
            }`}
            style={{ fontSize: EDITORIAL_LINE }}
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
              <div className="grid grid-cols-[minmax(7rem,14%)_1fr_auto] gap-x-[3cqi] pb-[clamp(1.2rem,2.2cqi,1.9rem)] max-md:grid-cols-1">
                <span aria-hidden className="max-md:hidden" />
                <p
                  className="font-sans max-w-[44rem] leading-[1.45] text-ink"
                  style={{ fontSize: EDITORIAL_LINE }}
                >
                  {item.body}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  );
}

/**
 * Accordion: each line opens in place, so the list never jumps to the top.
 * Shared by the services and the questions so the two read as one list style.
 */
export function RuledList({
  items,
  initialOpen = null,
}: {
  items: RuledItem[];
  initialOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(initialOpen);

  return (
    <ul className="group/list m-0 w-full list-none p-0">
      {items.map((item, index) => (
        <RuledRow
          key={item.key}
          item={item}
          index={index}
          open={open === index}
          onToggle={() =>
            setOpen((current) => (current === index ? null : index))
          }
        />
      ))}
    </ul>
  );
}

export function ServicesFaq({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="w-full min-w-0">
      <p className="pb-4 text-sm lowercase text-mute">frequently asked</p>
      <RuledList
        initialOpen={0}
        items={faqs.map((faq) => ({
          key: faq.question,
          label: faq.question,
          body: faq.answer,
        }))}
      />
    </div>
  );
}
