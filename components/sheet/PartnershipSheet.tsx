'use client';

import { Sheet } from '@/components/sheet/Sheet';
import { useFramed } from '@/components/mobile/MobileChrome';
import { PARTNERSHIPS, type PartnershipKey } from '@/lib/partnership';

const QUALITIES = [
  'Long-term thinker',
  'Quality over quantity',
  'Obsessing over the small details',
  'Patient',
  'Proactive',
  'Persistent',
  'Loyal',
  'HONEST',
  'Avid reader',
  'Creator',
] as const;

function Label({ children }: { children: string }) {
  return (
    <p className="font-display mt-12 text-[1.15rem] leading-snug font-bold text-ink">
      {children}
    </p>
  );
}

export function PartnershipSheet({ market }: { market: PartnershipKey }) {
  const framed = useFramed();
  const entry = PARTNERSHIPS[market];
  const { label, market: place } = entry;
  const native = 'native' in entry ? entry.native : undefined;
  const title = `ThirdKind. ${label}`;

  return (
    <Sheet title={title} tone="editorial">
      <article
        className={`flex min-h-[var(--frame-h,100dvh)] items-center justify-center bg-paper px-12 pb-28 ${
          framed ? 'pt-[6.5rem]' : 'pt-20'
        }`}
      >
        <div className="w-full max-w-[38rem] text-center text-[1.05rem] leading-[1.55] text-ink">
          <h1 className="font-display text-[clamp(2.25rem,4.6cqi,3.85rem)] leading-[1.08]">
            {title}
            {native ? (
              <span className="mt-3 block font-sans font-semibold">
                {native}
              </span>
            ) : null}
          </h1>
          <p className="mt-10">
            If you&apos;ve been working for a large creative agency and have
            been thinking of starting something of your own, we should have a
            chat.
          </p>

          <Label>You could be</Label>
          <p className="mt-3">
            A copywriter, creative director, account manager, art director,
            strategy director, brand strategist or _________.
          </p>

          <Label>About</Label>
          <p className="mt-3">
            ThirdKind&apos;s mission is to bring honest, high-quality
            communication to its customers. Film is at the heart of everything
            we do, so you need to love it as much as we do!
          </p>

          <Label>10 qualities we&apos;re looking for from you</Label>
          <ul className="mt-4 space-y-1.5">
            {QUALITIES.map((quality) => (
              <li key={quality}>{quality}</li>
            ))}
          </ul>

          <Label>Your responsibility</Label>
          <p className="mt-3">
            By joining ThirdKind, you will essentially be running your own
            company, bringing on and managing clients, and pushing forward our
            creative vision.
          </p>

          <Label>Partnership</Label>
          <p className="mt-3">
            This isn&apos;t a job but a partnership. You&apos;d own a share of
            what you build and run ThirdKind in your market as your own.
          </p>

          <Label>Your first goal</Label>
          <p className="mt-3">
            Bring in your first client in the {place} market.
          </p>

          <Label>Contact</Label>
          <p className="mt-3">
            Get in touch at{' '}
            <a
              href="mailto:goulielmos@thirdkindcreative.com"
              className="underline underline-offset-4 transition-opacity duration-300 hover:opacity-70"
            >
              goulielmos@thirdkindcreative.com
            </a>
          </p>
        </div>
      </article>
    </Sheet>
  );
}
