import { ArrowUpRight } from '@/components/chrome/ArrowUpRight';

/**
 * The two-block call-to-action from BookCallButton — label, hairline gap,
 * square arrow — rendered as spans so it can sit inside a link.
 */
export function PillLabel({
  label,
  tone = 'ink',
  labelClassName = '',
}: {
  label: string;
  tone?: 'ink' | 'paper';
  /** Somewhere to hide the word and leave the arrow, where room is tight. */
  labelClassName?: string;
}) {
  const block = tone === 'paper' ? 'bg-white text-ink' : 'bg-ink text-white';

  return (
    <span className="inline-flex items-stretch gap-px">
      <span
        className={`flex items-center rounded-md px-5 text-sm tracking-[0.04em] ${block} ${labelClassName}`}
      >
        {label}
      </span>
      <span
        className={`flex aspect-square w-[2.65rem] items-center justify-center rounded-md ${block}`}
      >
        <ArrowUpRight />
      </span>
    </span>
  );
}
