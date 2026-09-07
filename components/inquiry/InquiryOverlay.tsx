'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { useFramed } from '@/components/mobile/MobileChrome';
import {
  BUDGET_OPTIONS,
  INQUIRY_ABOUT_OPTIONS,
  START_DATE_OPTIONS,
} from '@/lib/inquiry/fields';
import { MOTION } from '@/lib/motion/tokens';
import { calendlyUrl, openCalendly } from '@/lib/inquiry/calendly';

function Field({
  label,
  index,
  children,
}: {
  label: string;
  index: number;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.label
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? MOTION.reduced : 0.42,
        delay: reduced ? 0 : 0.16 + index * 0.055,
        ease: MOTION.easeOut,
      }}
      className="flex flex-col gap-1.5 rounded-md bg-black/[0.06] px-4 py-3"
    >
      <span className="text-[0.7rem] leading-none text-mute">{label}</span>
      {children}
    </motion.label>
  );
}

const inputClass =
  'w-full bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-mute/70';

const selectClass = `${inputClass} appearance-none pr-6`;

function Chevron() {
  return (
    <span
      className="pointer-events-none absolute right-0 bottom-1 text-mute"
      aria-hidden
    >
      <svg viewBox="0 0 12 8" className="h-2 w-3">
        <path
          d="M1 1.5l5 5 5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    </span>
  );
}

export function InquiryOverlay({ onClose }: { onClose: () => void }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const framed = useFramed();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  useEffect(() => {
    const previous = document.activeElement;
    panelRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }
      const nodes = [
        ...panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((node) => node.tabIndex !== -1);
      const first = nodes[0];
      const last = nodes.at(-1);
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [onClose]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? 'Could not send the inquiry.');
        return;
      }
      setSent(true);
      // Filed first, then the scheduler: the answers are safe whether or not
      // a time is ever picked, and Calendly opens over the confirmation so
      // closing it leaves the reader somewhere sensible.
      void openCalendly({
        name: String(payload.name ?? ''),
        email: String(payload.email ?? ''),
      });
    } catch {
      setError('Could not send the inquiry. Please try again.');
    } finally {
      setPending(false);
    }
  }

  const duration = reduced ? MOTION.reduced : MOTION.sheetIn;

  return (
    <motion.div
      className={`${
        framed
          ? 'absolute inset-0 z-[70] flex items-end justify-center'
          : 'fixed inset-0 z-50 flex items-end justify-center sm:items-center'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? MOTION.reduced : MOTION.backdrop }}
    >
      <motion.button
        type="button"
        aria-label="Close questionnaire"
        className="absolute inset-0 bg-ink/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? MOTION.reduced : MOTION.backdrop }}
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration, ease: MOTION.easeOut }}
        className={`relative z-10 w-full overflow-y-auto bg-paper px-5 pt-3 pb-6 outline-none ${
          framed
            ? 'max-h-full shadow-[0_-8px_40px_rgba(28,26,22,0.12)]'
            : 'max-h-[min(94dvh,52rem)] max-w-[28rem] shadow-[0_-8px_40px_rgba(28,26,22,0.12)] sm:rounded-md sm:px-6'
        }`}
      >
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center text-2xl leading-none text-mute"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <h2 id={titleId} className="font-display sr-only">
          Book a call
        </h2>
        {sent ? (
          <div className="flex min-h-[24rem] flex-col justify-center px-1 py-10">
            <p className="font-display text-[1.65rem] leading-snug text-ink">
              We have it.
            </p>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-mute">
              {calendlyUrl()
                ? 'A conversation, not a funnel. Pick a time that suits you — we have the rest.'
                : 'A conversation, not a funnel. We will write back shortly.'}
            </p>
            <button
              type="button"
              className="mt-10 w-full rounded-md bg-ink py-3.5 text-center text-[0.95rem] text-white"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-2.5" onSubmit={onSubmit}>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden
            />
            <Field index={0} label="Name">
              <input
                required
                name="name"
                autoComplete="name"
                placeholder="Name"
                className={inputClass}
              />
            </Field>
            <Field index={1} label="Company Email">
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                className={inputClass}
              />
            </Field>
            <Field index={2} label="Phone Number">
              <input
                required
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="Phone"
                className={inputClass}
              />
            </Field>
            <Field index={3} label="Company Name">
              <input
                required
                name="company"
                autoComplete="organization"
                placeholder="Company Name"
                className={inputClass}
              />
            </Field>
            <Field index={4} label="Annual estimated media budget">
              <span className="relative block">
                <select
                  required
                  name="budget"
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="" disabled>
                    Please select...
                  </option>
                  {BUDGET_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Chevron />
              </span>
            </Field>
            <Field index={5} label="What are you inquiring about?">
              <span className="relative block">
                <select
                  required
                  name="about"
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="" disabled>
                    Please select...
                  </option>
                  {INQUIRY_ABOUT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Chevron />
              </span>
            </Field>
            <Field index={6} label="Ideal start date">
              <span className="relative block">
                <select
                  required
                  name="startDate"
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="" disabled>
                    Please select...
                  </option>
                  {START_DATE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Chevron />
              </span>
            </Field>
            <Field index={7} label="Where did you hear about us?">
              <input
                required
                name="source"
                placeholder="Where / Who / How"
                className={inputClass}
              />
            </Field>
            {error ? (
              <p className="px-1 pt-1 text-sm text-ink">{error}</p>
            ) : null}
            <motion.button
              type="submit"
              disabled={pending}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduced ? MOTION.reduced : 0.42,
                delay: reduced ? 0 : 0.16 + 9 * 0.055,
                ease: MOTION.easeOut,
              }}
              className="mt-3 w-full rounded-md bg-ink py-3.5 text-center text-[0.95rem] text-white disabled:opacity-60"
            >
              {pending ? 'Sending…' : 'Book a Call'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
