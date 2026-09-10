import { ArrowUpRight } from '@/components/chrome/ArrowUpRight';

/** Slightly past 1 and back, so the swap arrives with a little give. */
const EASE = 'cubic-bezier(0.34,1.32,0.64,1)';

/**
 * The site's button: label, hairline gap, square arrow.
 *
 * On hover the arrow crosses to the other side — the one on the right
 * collapses to nothing while the one on the left opens out, both on the same
 * settling curve, so it reads as a single move rather than two.
 *
 * It is rendered as spans throughout, so it can sit inside a link or a button
 * and take its hover from whichever of those is wrapping it.
 */
export function PillLabel({
  label,
  tone = 'ink',
  labelClassName = '',
  open,
}: {
  label: string;
  tone?: 'ink' | 'paper';
  /** Somewhere to hide the word and leave the arrow, where room is tight. */
  labelClassName?: string;
  /**
   * Drives the swap from outside, for the rows where the whole line is the
   * hover target rather than the button. Left off, the button answers to its
   * own hover.
   */
  open?: boolean;
}) {
  const block = tone === 'paper' ? 'bg-white text-ink' : 'bg-ink text-white';
  const controlled = open !== undefined;

  const arrow = (side: 'left' | 'right') => {
    // The wrapper is a touch wider than the arrow it holds, and the slack is
    // pushed to the label's side: that is the hairline gap between the two.
    const slack = side === 'left' ? 'justify-start' : 'justify-end';
    const origin = side === 'left' ? 'origin-right' : 'origin-left';
    const shown = controlled ? (side === 'left' ? open : !open) : undefined;

    const wrapperMotion = controlled
      ? undefined
      : side === 'left'
        ? 'w-0 group-hover/pill:w-[var(--pill-slot)]'
        : 'w-[var(--pill-slot)] group-hover/pill:w-0';
    const arrowMotion = controlled
      ? undefined
      : side === 'left'
        ? 'scale-50 opacity-0 group-hover/pill:scale-100 group-hover/pill:opacity-100'
        : 'scale-100 opacity-100 group-hover/pill:scale-50 group-hover/pill:opacity-0';

    return (
      <span
        className={`flex items-stretch overflow-hidden ${slack} ${wrapperMotion ?? ''}`}
        style={{
          width: controlled ? (shown ? 'var(--pill-slot)' : '0rem') : undefined,
          transition: `width 420ms ${EASE}`,
        }}
        aria-hidden
      >
        <span
          className={`flex aspect-square w-[var(--pill-arrow)] shrink-0 items-center justify-center rounded-md ${origin} ${block} ${arrowMotion ?? ''}`}
          style={{
            transform: controlled ? `scale(${shown ? 1 : 0.5})` : undefined,
            opacity: controlled ? (shown ? 1 : 0) : undefined,
            transition: `transform 420ms ${EASE}, opacity 260ms ease`,
          }}
        >
          <ArrowUpRight />
        </span>
      </span>
    );
  };

  return (
    <span
      // The button comes back a size on a phone, where it would otherwise run
      // most of the width of the screen. The slot is the arrow plus the
      // hairline gap that sits between it and the label.
      className="group/pill inline-flex items-stretch [--pill-arrow:2.1rem] [--pill-slot:2.15rem] md:[--pill-arrow:2.65rem] md:[--pill-slot:2.7rem]"
    >
      {arrow('left')}
      <span
        className={`flex items-center rounded-md px-3.5 text-[0.8rem] whitespace-nowrap tracking-[0.04em] md:px-5 md:text-sm ${block} ${labelClassName}`}
      >
        {label}
      </span>
      {arrow('right')}
    </span>
  );
}
