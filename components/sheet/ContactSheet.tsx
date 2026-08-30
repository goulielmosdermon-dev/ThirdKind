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
          <p className="text-sm text-neutral-400">New Business</p>
          <p className="mt-1 text-lg">{contact.newBusinessName}</p>
          <a
            href={`mailto:${contact.email}`}
            className="mt-2 inline-block text-neutral-300 underline-offset-4 hover:underline"
          >
            {contact.email}
          </a>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              name="name"
              required
              className="border border-neutral-700 bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              name="email"
              type="email"
              required
              className="border border-neutral-700 bg-transparent px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Message
            <textarea
              name="message"
              required
              rows={5}
              className="border border-neutral-700 bg-transparent px-3 py-2"
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
            className="self-start border border-neutral-500 px-4 py-2 text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </Sheet>
  );
}
