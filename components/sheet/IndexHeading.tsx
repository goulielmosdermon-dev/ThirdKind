import type { ReactNode } from 'react';

/**
 * The masthead both index sheets share: the section name set solid, followed
 * by its standfirst on the same line so the two read as one sentence.
 */
export function IndexHeading({
  name,
  standfirst,
}: {
  name: string;
  standfirst: ReactNode;
}) {
  return (
    <h1 className="font-display text-[clamp(1.6rem,5.2cqi,3.6rem)] leading-[1.08] tracking-[-0.015em] text-ink">
      <span className="font-semibold">{name}.</span>{' '}
      <span className="text-ink/85">{standfirst}</span>
    </h1>
  );
}
