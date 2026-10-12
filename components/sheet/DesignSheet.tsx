'use client';

import { Sheet } from '@/components/sheet/Sheet';
import { useFramed } from '@/components/mobile/MobileChrome';

export function DesignSheet() {
  const framed = useFramed();

  return (
    <Sheet title="Design" tone="editorial">
      <article
        data-surface="light"
        className={`min-h-[var(--frame-h,100dvh)] bg-paper px-12 pb-28 ${
          framed ? 'pt-[6.5rem]' : 'pt-20'
        }`}
      >
        <h1 className="font-display text-[clamp(2.25rem,4.6cqi,3.85rem)] leading-[1.08] text-ink">
          Design.
        </h1>
      </article>
    </Sheet>
  );
}
