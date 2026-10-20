'use client';

import { useState } from 'react';

import { MaskedCycle } from '@/components/chrome/MaskedCycle';
import { PillLabel } from '@/components/sheet/PillLabel';

const BAND_LINES = [
  'Don\u2019t interrupt. Invite',
  'Give before you take',
  'Because it\u2019s so much fun',
] as const;

/**
 * The presentation waits here: the same three lines that hang on the
 * index, then a small start. The deck itself is not on the page until
 * that is pressed.
 */
export function Opening({ children }: { children: React.ReactNode }) {
  const [started, setStarted] = useState(false);

  if (started) {
    return <div data-deck="mindthehack">{children}</div>;
  }

  return (
    <div className="relative flex min-h-svh flex-col bg-paper text-ink">
      <div className="flex flex-1 items-center">
        <div className="relative w-full">
          <h2 className="font-display w-full px-12 text-[clamp(3rem,9.5vw,9rem)] leading-[0.92] tracking-[-0.02em] md:mx-auto md:max-w-[92rem] md:px-[clamp(5.5rem,12vw,11rem)]">
            <MaskedCycle phrases={BAND_LINES} />
          </h2>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="absolute top-full left-1/2 mt-16 -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0"
          >
            <PillLabel label="Enter the presentation" />
          </button>
        </div>
      </div>
    </div>
  );
}
