'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

import { ArrowUpRight } from '@/components/chrome/ArrowUpRight';
import { PillLabel } from '@/components/sheet/PillLabel';
import {
  BUDGET_OPTIONS,
  INQUIRY_ABOUT_OPTIONS,
  START_DATE_OPTIONS,
} from '@/lib/inquiry/fields';
import { MOTION } from '@/lib/motion/tokens';
import { DISPLAY_BALANCE } from '@/lib/type/display';

type Step = {
  name: string;
  /** Asked as a question, one at a time, rather than labelled as a field. */
  question: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  options?: readonly string[];
};

/**
 * Every field the inquiry needs, in the order it is asked. The server requires
 * all eight, so none of them is optional here either — the flow simply refuses
 * to advance until the answer is one it can send.
 */
const STEPS: Step[] = [
  {
    name: 'name',
    question: 'Who are we speaking to?',
    placeholder: 'Your name',
    autoComplete: 'name',
  },
  {
    name: 'email',
    question: 'Where do we reach you?',
    placeholder: 'Company email',
    type: 'email',
    autoComplete: 'email',
  },
  {
    name: 'phone',
    question: 'And a number, if it comes to that?',
    placeholder: 'Phone number',
    type: 'tel',
    autoComplete: 'tel',
  },
  {
    name: 'company',
    question: 'Who do you work for?',
    placeholder: 'Company name',
    autoComplete: 'organization',
  },
  {
    name: 'budget',
    question: 'What is the annual media budget?',
    options: BUDGET_OPTIONS,
  },
  {
    name: 'about',
    question: 'What is this about?',
    options: INQUIRY_ABOUT_OPTIONS,
  },
  {
    name: 'startDate',
    question: 'When would you want to start?',
    options: START_DATE_OPTIONS,
  },
  {
    name: 'source',
    question: 'How did you find us?',
    placeholder: 'Where, who, how',
  },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** What is wrong with this answer, if anything. */
function faultIn(step: Step, value: string): string {
  const answer = value.trim();
  if (!answer) {
    return step.options ? 'Pick one to carry on.' : 'This one we do need.';
  }
  if (step.name === 'email' && !EMAIL.test(answer)) {
    return 'That address does not look right.';
  }
  return '';
}

/**
 * The way in, at the foot of the page: one question at a time rather than a
 * form to be waded through, answered in the page instead of in an overlay.
 *
 * It posts to the same endpoint the overlay does, so an inquiry that arrives
 * this way is filed exactly like any other.
 */
export function InquirySection({ phone }: { phone: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [at, setAt] = useState(0);
  const [fault, setFault] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const step = STEPS[at]!;
  const value = answers[step.name] ?? '';
  const last = at === STEPS.length - 1;

  const set = (next: string) => {
    setAnswers((current) => ({ ...current, [step.name]: next }));
    if (fault) {
      setFault('');
    }
  };

  async function advance() {
    const wrong = faultIn(step, value);
    if (wrong) {
      setFault(wrong);
      return;
    }
    if (!last) {
      setAt((i) => i + 1);
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFault(result.error ?? 'Could not send that. Try again?');
        return;
      }
      setSent(true);
    } catch {
      setFault('Could not send that. Try again?');
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className={
        phone
          ? 'mt-20'
          : 'mt-[clamp(5rem,11vw,10rem)] grid grid-cols-1 gap-[6vh] md:grid-cols-2 md:gap-16'
      }
    >
      <h2
        className={`font-display leading-[0.95] tracking-[-0.02em] text-ink ${
          phone
            ? 'text-[clamp(2rem,11vw,3rem)]'
            : 'text-[clamp(2.25rem,5.5vw,5rem)]'
        }`}
      >
        Let&rsquo;s make
        <br />
        something extraordinary.
      </h2>

      <div className={phone ? 'mt-10' : 'md:pt-[1vh]'}>
        {sent ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? MOTION.reduced : 0.5,
              ease: MOTION.easeOut,
            }}
          >
            <p
              className="font-display text-[1.4rem] leading-snug text-ink"
              style={{ fontSize: DISPLAY_BALANCE }}
            >
              We have it.
            </p>
            <p className="mt-3 max-w-[34ch] text-[1rem] leading-relaxed text-mute">
              Someone will come back to you shortly — usually the same day.
            </p>
          </motion.div>
        ) : (
          <>
            <p className="max-w-[34ch] text-[0.95rem] leading-relaxed text-mute">
              A few questions, one at a time, so we know who is asking and what
              it is for.
            </p>

            {/* The question and its answer swap in place, so the block does
                not jump as the flow moves down it. */}
            <div className="mt-9 min-h-[8.5rem]">
              <motion.div
                key={step.name}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? MOTION.reduced : 0.45,
                  ease: MOTION.easeOut,
                }}
              >
                <label
                  htmlFor={`ask-${step.name}`}
                  className="font-display block text-[1.25rem] leading-snug text-ink"
                  style={{ fontSize: DISPLAY_BALANCE }}
                >
                  {step.question}
                </label>

                {step.options ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {step.options.map((option) => {
                      const picked = value === option;
                      return (
                        <li key={option}>
                          <button
                            type="button"
                            aria-pressed={picked}
                            onClick={() => set(option)}
                            className={`cursor-pointer rounded-full border px-4 py-2 text-[0.85rem] leading-none transition-colors duration-300 ${
                              picked
                                ? 'border-ink bg-ink text-white'
                                : 'border-hairline text-mute hover:border-ink hover:text-ink'
                            }`}
                          >
                            {option}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <input
                    id={`ask-${step.name}`}
                    type={step.type ?? 'text'}
                    autoComplete={step.autoComplete}
                    placeholder={step.placeholder}
                    value={value}
                    onChange={(event) => set(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void advance();
                      }
                    }}
                    className="mt-5 w-full max-w-[26rem] border-b border-hairline bg-transparent pb-2 text-[1.05rem] text-ink outline-none transition-colors duration-300 placeholder:text-mute/70 focus:border-ink"
                  />
                )}

                <p
                  className="mt-3 text-[0.8rem] text-signal"
                  role={fault ? 'alert' : undefined}
                  style={{ opacity: fault ? 1 : 0 }}
                >
                  {fault || ' '}
                </p>
              </motion.div>
            </div>

            <div className="mt-6 flex items-center gap-5">
              {/* Where the reader is in the run, and the way back. */}
              <ul className="flex items-center gap-1.5" aria-hidden>
                {STEPS.map((one, index) => (
                  <li key={one.name}>
                    <button
                      type="button"
                      tabIndex={-1}
                      disabled={index > at}
                      onClick={() => setAt(index)}
                      className={`block h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                        index === at
                          ? 'bg-ink'
                          : index < at
                            ? 'cursor-pointer bg-ink/35 hover:bg-ink'
                            : 'bg-hairline'
                      }`}
                    />
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={pending}
                onClick={() => void advance()}
                aria-label={last ? 'Send' : 'Next question'}
                className="cursor-pointer border-0 bg-transparent p-0 transition-opacity duration-300 hover:opacity-85 disabled:opacity-50"
              >
                {last ? (
                  <PillLabel label={pending ? 'Sending' : 'Reach Out'} />
                ) : (
                  <span className="flex aspect-square w-[2.65rem] items-center justify-center rounded-md bg-ink text-white">
                    <ArrowUpRight />
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
