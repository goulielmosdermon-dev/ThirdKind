'use client';

import { PortableBody } from '@/components/sheet/PortableBody';
import { Sheet } from '@/components/sheet/Sheet';
import { useFramed } from '@/components/mobile/MobileChrome';
import type { LegalPage } from '@/lib/fixtures/legal';

export function LegalSheet({ page }: { page: LegalPage }) {
  const framed = useFramed();
  return (
    <Sheet title={page.title} tone="editorial">
      <article data-surface="light" className="bg-paper">
        <header
          className={`pl-[8cqi] pr-4 pb-10 ${framed ? 'pt-[6.5rem]' : 'pt-20 @md:pt-24'}`}
        >
          <p className="text-sm text-mute">Legal</p>
          <h1 className="font-display mt-4 w-full max-w-[40ch] text-[clamp(2.25rem,4.6cqi,3.85rem)] leading-[1.08] text-balance text-ink">
            {page.title}
          </h1>
        </header>
        <div className="mx-auto max-w-[42rem] px-[8cqi] pb-24 @md:px-0 @md:pb-28">
          <PortableBody value={page.body} density="editorial" />
        </div>
      </article>
    </Sheet>
  );
}
