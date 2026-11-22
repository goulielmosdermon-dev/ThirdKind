/**
 * What we do, as two large circles rather than a list: Creative & Production,
 * the making, and Strategy & Brand, the thinking behind it. Each just crosses
 * into the other, so they read as separate
 * disciplines that still touch.
 *
 * Drawn as an SVG so the overlap holds at every width. A row on desktop; on a
 * phone the same chain runs down the page, so the labels stay readable. Thin
 * rules in the page's ink, labels in the sans. Hovering a circle mutes the
 * others.
 */
/** Each label's lines, broken by hand so a long one sits inside its circle. */
const LABELS = [
  ['Creative &', 'Production'],
  ['Strategy &', 'Brand'],
] as const;
const R = 170;
/** How far each circle crosses into the next. */
const OVERLAP = 34;
const STEP = 2 * R - OVERLAP;
const PAD = 2;
const LENGTH = 2 * R + STEP * (LABELS.length - 1) + PAD * 2;
const DEPTH = 2 * R + PAD * 2;

function Chain({
  vertical,
  className,
}: {
  vertical: boolean;
  className: string;
}) {
  return (
    <svg
      viewBox={vertical ? `0 0 ${DEPTH} ${LENGTH}` : `0 0 ${LENGTH} ${DEPTH}`}
      role="img"
      aria-label="Creative & Production, and Strategy & Brand"
      className={`h-auto text-ink [&:has(g:hover)_g:not(:hover)]:opacity-30 ${className}`}
    >
      {LABELS.map((label, index) => {
        const along = PAD + R + index * STEP;
        const across = PAD + R;
        const cx = vertical ? across : along;
        const cy = vertical ? along : across;
        const size = vertical ? 34 : 22;
        return (
          <g
            key={label.join(' ')}
            className="transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <circle
              cx={cx}
              cy={cy}
              r={R}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
            />
            <text
              textAnchor="middle"
              fill="currentColor"
              className="font-sans font-medium"
              style={{ fontSize: size }}
            >
              {label.map((line, row) => (
                <tspan
                  key={line}
                  x={cx}
                  // Centred as a block: each line sits a line-height apart
                  // around the circle's middle.
                  y={cy + (row - (label.length - 1) / 2) * size * 1.15}
                  dominantBaseline="middle"
                >
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function ServicesVenn() {
  return (
    <>
      <Chain vertical={false} className="hidden w-full md:block" />
      <Chain
        vertical
        className="mx-auto block w-full max-w-[20rem] md:hidden"
      />
    </>
  );
}
