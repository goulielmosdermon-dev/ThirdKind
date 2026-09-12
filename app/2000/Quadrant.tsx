import type { Block } from './deck';

type QuadrantBlock = Extract<Block, { kind: 'quadrant' }>;

/**
 * The dots, as they were drawn.
 *
 * Taken off the source plots rather than invented: the grey of the field, the
 * accent that marks us, and a rule faint enough that the axes read as a
 * crossing rather than as a frame. They are literal values because that is
 * what they are — this one chart's palette, not the site's.
 */
const FIELD = '#8a8a8a';
const MARK = '#00c59a';
const RULE = 'color-mix(in srgb, var(--color-hairline) 62%, transparent)';

/** The axis ends: the deck's voice, set small and tracked so they label. */
const AXIS =
  'font-display uppercase tracking-[0.14em] text-[0.5em] leading-none text-mute whitespace-nowrap';

/**
 * A positioning plot.
 *
 * The whole thing is sized in `em` off one font size, so the chart scales as a
 * drawing: change the size on the outer box and the dots, the gaps and the
 * type all move together. Points are placed by percentage inside the plot
 * rather than by a viewBox, which keeps every label as real, selectable text
 * in the page's own fonts.
 */
export function Quadrant({
  block,
  className = '',
}: {
  block: QuadrantBlock;
  className?: string;
}) {
  const { title, axes, points } = block;

  return (
    <figure className={className}>
      <figcaption
        className={`mb-[1.2em] font-display text-[0.62em] uppercase leading-none tracking-[0.16em] text-mute`}
      >
        {title}
      </figcaption>

      {/* The box the plot is read in. The top and bottom axis names sit
          outside the crossing, so the plot itself is inset by the room they
          take rather than overlapping them. */}
      <div className="relative aspect-[16/10] w-full">
        <span className={`absolute top-0 left-1/2 -translate-x-1/2 ${AXIS}`}>
          {axes.top}
        </span>
        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 ${AXIS}`}>
          {axes.bottom}
        </span>

        <div className="absolute inset-x-0 top-[2.1em] bottom-[2.1em]">
          {/* The axes themselves. */}
          <span
            aria-hidden
            className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
            style={{ background: RULE }}
          />
          <span
            aria-hidden
            className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2"
            style={{ background: RULE }}
          />

          {/* The horizontal axis is named at its ends, just above the rule. */}
          <span
            className={`absolute top-1/2 left-0 -translate-y-[165%] ${AXIS}`}
          >
            {axes.left}
          </span>
          <span
            className={`absolute top-1/2 right-0 -translate-y-[165%] ${AXIS}`}
          >
            {axes.right}
          </span>

          {points.map((point) => {
            const right = point.side !== 'left';
            return (
              <div
                key={point.label}
                className="absolute"
                style={{
                  left: `${50 + point.x * 50}%`,
                  top: `${50 - point.y * 50}%`,
                }}
              >
                {/* The dot is centred on the coordinate; the name hangs off
                    it, on whichever side the plot had it. */}
                <span
                  aria-hidden
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: point.mark ? '1.05em' : '0.8em',
                    height: point.mark ? '1.05em' : '0.8em',
                    background: point.mark ? MARK : FIELD,
                  }}
                />
                <span
                  className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap ${
                    right ? 'left-[0.85em]' : 'right-[0.85em]'
                  } ${
                    point.mark
                      ? 'font-display text-[0.78em]'
                      : 'font-sans text-[0.66em] text-ink'
                  }`}
                  style={point.mark ? { color: MARK } : undefined}
                >
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
