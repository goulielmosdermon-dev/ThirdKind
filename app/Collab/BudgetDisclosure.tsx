'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useId, useState } from 'react';

export function BudgetDisclosure({
  total,
  lines,
}: {
  total: string;
  lines: { label: string; amount: string }[];
}) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const listId = useId();

  return (
    <>
      <span className="mb-3 block text-center text-sm">Estimated</span>
      <p className="mb-5 text-center text-[clamp(3rem,8vw,7rem)] leading-none tracking-tight">
        {total}
      </p>
      <button
        type="button"
        aria-label={open ? 'Hide budget breakdown' : 'Show budget breakdown'}
        aria-expanded={open}
        aria-controls={listId}
        className="mx-auto grid size-12 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4"
        onClick={() => setOpen(!open)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className={`size-7 motion-safe:transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m5 9 7 7 7-7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div id={listId} className="collab-cost-book-list">
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              className="overflow-hidden"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.42 }}
            >
              <div className="collab-cost-group pt-6">
                <ul>
                  {lines.map(({ label, amount }, index) => (
                    <motion.li
                      key={label}
                      initial={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reducedMotion ? 0 : 0.25,
                        delay: reducedMotion ? 0 : index * 0.055,
                      }}
                    >
                      <span>{label}</span>
                      <span>{amount}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
