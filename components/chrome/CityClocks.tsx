'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { EDITORIAL_LINE, EDITORIAL_LINE_PHONE } from '@/lib/type/display';

/**
 * The places the studio keeps time in.
 *
 * Portugal and the UK share an offset for most of the year, so both are kept
 * rather than folded together: the point is where the work happens, not how
 * many distinct clock faces it comes to.
 */
const CITIES = [
  { label: 'Athens', zone: 'Europe/Athens' },
  { label: 'London', zone: 'Europe/London' },
  { label: 'Lisbon', zone: 'Europe/Lisbon' },
] as const;

/** Between these hours a face reads as day; outside them, as night. */
const DAY_FROM = 7;
const DAY_TO = 19;

/** How often the hands are re-read. */
const TICK_MS = 30_000;

type Reading = { hours: number; minutes: number };

/** The wall time in a zone, taken from the reader's own clock. */
function readClock(zone: string, at: Date): Reading {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(at);
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? '0');
  // Midnight comes back as 24 in some runtimes; fold it to 0 so the hand sits
  // at the top of the face rather than a full turn past it.
  return { hours: value('hour') % 24, minutes: value('minute') };
}

/**
 * A clock face, drawn at the time it is telling.
 *
 * Night faces are filled and light faces are outlined, so the row reads at a
 * glance as where the sun is rather than as three identical marks.
 */
function ClockFace({ hours, minutes }: Reading) {
  const night = hours < DAY_FROM || hours >= DAY_TO;
  // The hour hand carries the minutes with it, so it sits between the marks
  // the way a real one does.
  const hourTurn = ((hours % 12) + minutes / 60) * 30;
  const minuteTurn = minutes * 6;
  const stroke = night ? 'var(--clock-ink, #000)' : 'currentColor';

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10 shrink-0"
      aria-hidden
      style={{ color: 'currentColor' }}
    >
      <circle
        cx="12"
        cy="12"
        r="11"
        fill={night ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1"
      />
      <g stroke={stroke} strokeWidth="1.1" strokeLinecap="round">
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="6.6"
          transform={`rotate(${hourTurn} 12 12)`}
        />
        <line
          x1="12"
          y1="12"
          x2="12"
          y2="4.6"
          transform={`rotate(${minuteTurn} 12 12)`}
        />
      </g>
    </svg>
  );
}

/**
 * The three cities, each with the time it is keeping.
 *
 * The clocks only start once the component is on the reader's machine: drawn
 * on the server they would be stamped with the server's minute and then jump
 * when the page came alive.
 */
export function CityClocks({ compact = false }: { compact?: boolean }) {
  // On the minute would be tidier, but a slow tick is cheap and a face never
  // sits more than half a minute behind.
  const subscribe = useCallback((onChange: () => void) => {
    const timer = window.setInterval(onChange, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  // The clocks only start once the component is on the reader's machine: the
  // server has no business deciding what minute it is, so it renders no hands
  // and the reader's own clock fills them in.
  const stamp = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / TICK_MS) * TICK_MS,
    () => null,
  );
  const now = stamp === null ? null : new Date(stamp);

  return (
    <ul
      // Spread across the whole footer: the first city hard left, the last
      // hard right, the middle one held between them. Stacked on a narrow
      // window, where three across would set the names in single letters.
      className={`flex w-full text-white/70 ${
        compact
          ? 'flex-col gap-6'
          : 'flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8'
      }`}
      style={{ ['--clock-ink' as string]: '#000' }}
    >
      {CITIES.map((city) => {
        const reading = now ? readClock(city.zone, now) : null;
        return (
          <li key={city.zone} className="flex items-center gap-3">
            {reading ? (
              <ClockFace {...reading} />
            ) : (
              // A plain ring until the reader's clock is known, so the row
              // does not shift when the hands arrive.
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10 shrink-0"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            )}
            {/* Set like a line in the index — the same voice, the same size. */}
            <span
              className="font-display leading-none"
              style={{
                fontSize: compact ? EDITORIAL_LINE_PHONE : EDITORIAL_LINE,
              }}
            >
              {city.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
