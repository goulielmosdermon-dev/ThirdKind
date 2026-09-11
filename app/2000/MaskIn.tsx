'use client';

import { useRef } from 'react';

import { useCrossing } from './PlainRun';

/**
 * A plate, masked rather than faded.
 *
 * It opens from the bottom as it reaches the middle of the screen and closes
 * out through the top as the reader carries on, which is the same move the
 * text beside it makes. Nothing sticks and nothing parallaxes: the picture is
 * simply there, and then it is not.
 */
export function MaskIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useCrossing(ref);
  const clip =
    state === 'in'
      ? 'inset(0% 0% 0% 0%)'
      : state === 'above'
        ? 'inset(0% 0% 100% 0%)'
        : 'inset(100% 0% 0% 0%)';

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          clipPath: clip,
          transition: 'clip-path 1.05s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
