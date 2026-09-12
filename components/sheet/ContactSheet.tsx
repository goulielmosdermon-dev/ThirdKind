'use client';

import { BookCallButton } from '@/components/inquiry/BookCallButton';
import { Sheet } from '@/components/sheet/Sheet';
import { useFramed } from '@/components/mobile/MobileChrome';
import type { ContactInfo } from '@/types/content';

export function ContactSheet({ contact }: { contact: ContactInfo }) {
  const framed = useFramed();
  return (
    <Sheet title="Contact" tone="editorial">
      <article
        className={`flex min-h-[var(--frame-h,100dvh)] items-center bg-paper px-12 pb-28 @md:px-[8cqi] ${
          framed ? 'pt-[6.5rem]' : 'pt-16'
        }`}
      >
        <div className="grid w-full items-start gap-16 @md:grid-cols-2 @md:gap-8">
          <h1 className="font-display text-[clamp(2.25rem,4.6cqi,3.85rem)] leading-[1.08] text-ink">
            Contact.
          </h1>
          <div className="text-[1.05rem] leading-snug text-ink">
            <p>{contact.heading}</p>
            <p className="mt-2">{contact.newBusinessName}</p>
            {/* Read from the contact record rather than written in, so the
                address the page shows is the one the form answers to. */}
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="mt-2 inline-block underline underline-offset-4 transition-opacity duration-300 hover:opacity-70"
              >
                {contact.email}
              </a>
            ) : null}
            <div className="mt-8">
              <BookCallButton />
            </div>
          </div>
        </div>
      </article>
    </Sheet>
  );
}
