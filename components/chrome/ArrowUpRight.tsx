/** Shared with BookCallButton so every call-to-action carries the same mark. */
export function ArrowUpRight({
  className = 'h-3.5 w-3.5',
  cap = 'round',
  join = 'round',
}: {
  className?: string;
  cap?: 'round' | 'square' | 'butt';
  join?: 'round' | 'miter' | 'bevel';
}) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path
        d="M4 12L12 4M12 4H6.5M12 4V9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap={cap}
        strokeLinejoin={join}
      />
    </svg>
  );
}
