import type { CSSProperties } from 'react';

import { ArrowUpRight } from '@/components/chrome/ArrowUpRight';

/**
 * The site's button: underlined label, arrow, no fill or stroke.
 *
 * Hover shifts the words into the display italic, the same change as a
 * menu item. The arrow stays put.
 *
 * It is rendered as spans throughout, so it can sit inside a link or a button
 * and take its hover from whichever of those is wrapping it.
 */
export function PillLabel({
  label,
  tone = 'ink',
  labelClassName = '',
  textClassName = 'text-[clamp(1rem,1.5vw,1.2rem)] leading-snug',
  arrowClassName = 'h-3.5 w-3.5',
  style,
}: {
  label: string;
  tone?: 'ink' | 'paper';
  /** Somewhere to hide the word and leave the arrow, where room is tight. */
  labelClassName?: string;
  /** Size and leading — menus keep the page's large line; buttons keep the default. */
  textClassName?: string;
  arrowClassName?: string;
  style?: CSSProperties;
}) {
  const color = tone === 'paper' ? 'text-white' : 'text-ink';

  return (
    <span
      className={`group/pill inline-flex items-baseline gap-[0.35em] ${color}`}
    >
      <span
        className={`relative font-sans not-italic whitespace-nowrap after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-current group-hover/pill:font-display group-hover/pill:italic ${textClassName} ${labelClassName}`}
        style={style}
      >
        {label}
      </span>
      <span className="inline-flex translate-y-[0.08em]" aria-hidden>
        <ArrowUpRight className={arrowClassName} />
      </span>
    </span>
  );
}
