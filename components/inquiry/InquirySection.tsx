'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

import { ArrowUpRight } from '@/components/chrome/ArrowUpRight';
import { MaskedWords } from '@/components/chrome/MaskedWords';
import { PillLabel } from '@/components/sheet/PillLabel';
import { MOTION } from '@/lib/motion/tokens';

type Step = {
  key: string;
  question: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  /** The last one is a note rather than a line, so it gets room to be one. */
  long?: boolean;
};

const STEPS: Step[] = [
  {
    key: 'firstName',
    question: 'First name',
    placeholder: 'First name',
    autoComplete: 'given-name',
  },
  {
    key: 'lastName',
    question: 'Last name',
    placeholder: 'Last name',
    autoComplete: 'family-name',
  },
  {
    key: 'company',
    question: 'Company',
    placeholder: 'Company name',
    autoComplete: 'organization',
  },
  {
    key: 'jobTitle',
    question: 'Job title',
    placeholder: 'Your role',
    autoComplete: 'organization-title',
  },
  {
    key: 'email',
    question: 'Work email',
    placeholder: 'you@company.com',
    type: 'email',
    autoComplete: 'email',
  },
  {
    key: 'message',
    question: 'How can we help you?',
    placeholder: 'Tell us what you have in mind',
    long: true,
  },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function faultIn(step: Step, value: string): string {
  const answer = value.trim();
  if (!answer) {
    return 'This one we do need.';
  }
  if (step.key === 'email' && !EMAIL.test(answer)) {
    return 'That address does not look right.';
  }
  return '';
}

/**
 * The way in, at the foot of the page: one question at a time rather than a
 * form to be waded through, answered in the page instead of in an overlay.
 *
 * It posts to the same endpoint the overlay does. The archive keeps one name
 * and one free-text field, so the two names are joined and the role is filed
 * with the note — nothing is dropped, and separating them again is a column
 * away if it is ever worth it.
 */
export function InquirySection({ phone }: { phone: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [at, setAt] = useState(0);
  const [fault, setFault] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const step = STEPS[at]!;
  const value = answers[step.key] ?? '';
  const last = at === STEPS.length - 1;

  const set = (next: string) => {
    setAnswers((current) => ({ ...current, [step.key]: next }));
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
        body: JSON.stringify({
          name: `${answers.firstName ?? ''} ${answers.lastName ?? ''}`.trim(),
          email: answers.email ?? '',
          company: answers.company ?? '',
          about: answers.jobTitle
            ? `${answers.jobTitle}\n\n${answers.message ?? ''}`
            : (answers.message ?? ''),
        }),
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

  const heading = phone
    ? 'text-[clamp(2rem,10vw,2.75rem)]'
    : 'text-[clamp(2.25rem,5vw,4.25rem)]';

  return (
    <section
      // Air on every side of it: this is the last thing on the page and the
      // one thing on it being asked of the reader, so it is given the room a
      // question deserves rather than the rhythm of the index above it.
      className={
        phone
          ? 'mt-24 pb-10'
          : 'mt-[clamp(7rem,16vw,15rem)] grid grid-cols-1 gap-[10vh] pb-[6vh] md:grid-cols-2 md:gap-[8%]'
      }
    >
      <h2
        className={`font-sans leading-[1.02] font-semibold tracking-[-0.02em] text-ink ${heading}`}
      >
        <MaskedWords
          words={[
            { text: 'Let\u2019s' },
            { text: 'make' },
            // The word the whole page turns on, in the display face.
            { text: 'extraordinary.', className: 'font-display' },
          ]}
        />
      </h2>

      <div className={phone ? 'mt-14' : ''}>
        {sent ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduced ? MOTION.reduced : 0.5,
              ease: MOTION.easeOut,
            }}
          >
            <p className="font-display text-[1.5rem] leading-snug text-ink">
              We have it.
            </p>
            <p className="mt-4 max-w-[34ch] text-[1rem] leading-relaxed text-mute">
              Someone will come back to you shortly — usually the same day.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="relative w-fit">
              <p className="max-w-[34ch] rounded-2xl bg-ink px-6 py-5 text-[0.95rem] leading-relaxed text-white">
                A few quick questions, one at a time, so the right person can
                get back to you.
              </p>
              {/* Held clear of the corner rather than against it — it hovers
                  below and off to the side, the way the tail of a message
                  does — and grows into place as the note is reached. */}
              <motion.span
                aria-hidden
                initial={reduced ? false : { scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: reduced ? MOTION.reduced : 0.55,
                  delay: reduced ? 0 : 0.18,
                  ease: [0.34, 1.4, 0.64, 1],
                }}
                className="absolute -right-4 -bottom-4 block h-3 w-3 rounded-full bg-ink"
              />
            </div>

            {/* The question and its answer swap in place, so nothing below
                them moves as the flow runs down. */}
            <div
              // No reserved height: the controls sit under whichever field is
              // showing. Every question but the last is the same one-line
              // input, so nothing moves until the note arrives at the end.
              className={phone ? 'mt-6' : 'mt-[6vh]'}
            >
              <motion.div
                key={step.key}
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? MOTION.reduced : 0.45,
                  ease: MOTION.easeOut,
                }}
              >
                {/* The placeholder asks it, so the label is for screen
                    readers alone — set above the field it would only say the
                    same thing twice. */}
                <label htmlFor={`ask-${step.key}`} className="sr-only">
                  {step.question}
                </label>

                {step.long ? (
                  <textarea
                    id={`ask-${step.key}`}
                    rows={3}
                    placeholder={step.placeholder}
                    value={value}
                    onChange={(event) => set(event.target.value)}
                    className="w-full resize-none border-b border-hairline bg-transparent pb-3 text-[1.05rem] leading-relaxed text-ink outline-none transition-colors duration-300 placeholder:text-mute/70 focus:border-ink"
                  />
                ) : (
                  <input
                    id={`ask-${step.key}`}
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
                    className="w-full border-b border-hairline bg-transparent pb-3 text-[1.05rem] text-ink outline-none transition-colors duration-300 placeholder:text-mute/70 focus:border-ink"
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

            {/* Where the reader is, and the way on — held to opposite ends of
                the column, the arrow on the outer edge. */}
            <div
              className={`flex items-center justify-between gap-6 ${
                phone ? 'mt-5' : 'mt-[3vh]'
              }`}
            >
              <ul className="flex items-center gap-2">
                {STEPS.map((one, index) => (
                  <li key={one.key}>
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={one.question}
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
