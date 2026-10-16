'use client';

import { Hands } from '@/components/Hands';
import { Sheet } from '@/components/sheet/Sheet';
import { useFramed } from '@/components/mobile/MobileChrome';

export function HandsSheet() {
  const framed = useFramed();

  return (
    <Sheet title="Hands" tone="editorial">
      <article
        data-surface="light"
        className={`flex min-h-[var(--frame-h,100dvh)] items-center justify-center bg-paper px-12 pb-28 ${
          framed ? 'pt-[6.5rem]' : 'pt-20'
        }`}
      >
        <Hands className="mx-auto w-full max-w-[min(36rem,86cqi)] text-ink" />
      </article>
    </Sheet>
  );
}
