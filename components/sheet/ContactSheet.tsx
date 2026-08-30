'use client';

import { FormEvent } from 'react';

import { Sheet } from '@/components/sheet/Sheet';
import type { ContactInfo } from '@/types/content';

export function ContactSheet({ contact }: { contact: ContactInfo }) {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Sheet title={contact.heading}>
      <div className="mx-auto flex max-w-xl flex-col gap-8">
        <div>
          <p className="font-mono text-caption tracking-widest text-mute uppercase">
            New Business
          </p>
          <p className="font-display mt-1 text-title">
            {contact.newBusinessName}
          </p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-2 inline-block text-mute underline-offset-4 hover:text-ink hover:underline"
          >
            {contact.email}
          </a>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 font-mono text-caption tracking-widest uppercase">
            Name
            <input
              name="name"
              required
              className="border border-hairline bg-transparent px-3 py-2 font-sans text-body text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 font-mono text-caption tracking-widest uppercase">
            Email
            <input
              name="email"
              type="email"
              required
              className="border border-hairline bg-transparent px-3 py-2 font-sans text-body text-ink"
            />
          </label>
          <label className="flex flex-col gap-1 font-mono text-caption tracking-widest uppercase">
            Message
            <textarea
              name="message"
              required
              rows={5}
              className="border border-hairline bg-transparent px-3 py-2 font-sans text-body text-ink"
            />
          </label>
          <p className="hidden" aria-hidden>
            <label>
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
          </p>
          <button
            type="submit"
            className="self-start border border-hairline px-4 py-2 font-mono text-caption tracking-widest uppercase"
          >
            Send
          </button>
        </form>
      </div>
    </Sheet>
  );
}
