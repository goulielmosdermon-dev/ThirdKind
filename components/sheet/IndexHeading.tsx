import type { ReactNode } from 'react';

/**
 * The masthead both index sheets share: the section name set solid, followed
 * by its standfirst on the same line so the two read as one sentence.
 *
 * The name is set in Nib Pro's SemiBold and the standfirst drops back on tone,
 * so the two halves read apart without a second weight.
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
        <>
          {' '}
          <span className="text-ink/70">{standfirst}</span>
        </>
      ) : null}
    </h1>
  );
}
