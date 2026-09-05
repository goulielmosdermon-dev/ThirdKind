import type { ReactNode } from 'react';

/**
 * The masthead both index sheets share: the section name set solid, followed
 * by its standfirst on the same line so the two read as one sentence.
 *
 * Plantin ships Regular only, so the two halves separate on tone rather than
 * weight — asking for a bold here just gets a synthesised one.
 */
export function IndexHeading({
  name,
  standfirst,
}: {
  name: string;
  standfirst?: ReactNode;
}) {
  return (
    <h1 className="font-display text-[clamp(1.6rem,5.2cqi,3.6rem)] leading-[1.08] tracking-[-0.015em] text-ink">
      {name}.
      {standfirst ? (
        <> <span className="text-ink/70">{standfirst}</span></>
      ) : null}
    </h1>
  );
}
