'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { useFramed } from '@/components/mobile/MobileChrome';
import { PillLabel } from '@/components/sheet/PillLabel';
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
      // Drawn like the site's buttons: no fill or box, a hairline under the
      // words, and the display italic on the label while the field is in use.
      data-field=""
      className="group/field flex flex-col gap-2 border-b border-ink pb-2 focus-within:shadow-[0_1px_0_0_var(--color-ink)]"
    >
      <span className="font-sans text-[0.78rem] leading-none text-mute not-italic group-focus-within/field:font-display group-focus-within/field:text-ink group-focus-within/field:italic group-hover/field:font-display group-hover/field:italic">
        {label}
      </span>
      {children}
    </motion.label>
  );
}

const inputClass =
  'w-full bg-transparent font-sans text-[clamp(1rem,1.5vw,1.2rem)] leading-snug text-ink outline-none placeholder:text-mute/70';

// Required and still on the empty option, a select is :invalid: it reads as a
// placeholder until something is picked.
const selectClass = `${inputClass} appearance-none pr-6 invalid:text-mute/70`;

function Chevron() {
  return (
    <span
      className="pointer-events-none absolute right-0 bottom-2 text-ink"
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
  // Kept so the scheduler can be re-opened: Calendly's popup closes on a tap
  // outside it, and losing it should not mean losing the booking.
  const [booking, setBooking] = useState<{ name: string; email: string }>({
    name: '',
    email: '',
  });
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
      const invitee = {
        name: String(payload.name ?? ''),
        email: String(payload.email ?? ''),
      };
      setBooking(invitee);
      // Filed first, then the scheduler: the answers are safe whether or not
      // a time is ever picked, and Calendly opens over the confirmation so
      // closing it leaves the reader somewhere sensible.
      void openCalendly(invitee);
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
            : 'max-h-[min(94dvh,52rem)] max-w-[28rem] shadow-[0_-8px_40px_rgba(28,26,22,0.12)] sm:px-6'
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
        {/* The dialog is named for the button that opens it, so a screen
            reader hears the same words the page showed. */}
        <h2 id={titleId} className="font-display sr-only">
          Make Extraordinary
        </h2>
        {sent ? (
          <div className="flex flex-col justify-center px-1 py-6">
            <p className="font-display text-[1.65rem] leading-snug text-ink">
              We have it.
            </p>
            <p className="mt-3 text-[1.05rem] leading-relaxed text-mute">
              {calendlyUrl()
                ? 'A conversation, not a funnel. Pick a time that suits you. We have the rest.'
                : 'A conversation, not a funnel. We will write back shortly.'}
            </p>
            {/*
              The scheduler closes on a tap outside it, so the way back has to
              stay on screen: this panel waits underneath with the invitee
              still to hand.
            */}
            <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-4">
              {calendlyUrl() ? (
                <button
                  type="button"
                  className="inline-flex cursor-pointer border-0 bg-transparent p-0"
                  onClick={() => void openCalendly(booking)}
                >
                  <PillLabel label="Pick a time" />
                </button>
              ) : null}
              <button
                type="button"
                className="inline-flex cursor-pointer border-0 bg-transparent p-0"
                onClick={onClose}
              >
                <PillLabel label="Close" />
              </button>
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
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
              className="mt-4 inline-flex cursor-pointer border-0 bg-transparent p-0 disabled:opacity-60"
            >
              <PillLabel label={pending ? 'Sending…' : 'Make Extraordinary'} />
            </motion.button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
