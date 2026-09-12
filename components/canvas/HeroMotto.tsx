'use client';

import { useInquiry } from '@/components/inquiry/InquiryProvider';
import { PillLabel } from '@/components/sheet/PillLabel';
import { DISPLAY_BALANCE } from '@/lib/type/display';

/**
 * The line the intro lands on, and the line the header holds — one element,
 * drawn once. It does not hand over to a second copy as the page comes up: it
 * simply changes colour, dark on the canvas and light over the showcase, and
 * the button fades in under it. Two elements cross-fading is what made the
 * line double and drift.
 *
 * "Extraordinary" runs flush left and the rest of the sentence is stood off
 * to the right under it, so the two lines step apart rather than stacking.
 */
export function HeroMotto({
  tone,
  action,
  lines = [1, 1],
}: {
  tone: 'ink' | 'paper';
  /** The header carries the button; the intro does not. It fades in. */
  action: boolean;
  /**
   * Opacity per line. On the way in the two arrive one at a time, with a beat
   * between them; once the page is up they are simply both there.
   */
  lines?: readonly [number, number];
}) {
  const { openInquiry } = useInquiry();

  return (
    // On a phone the block runs to the gutter rather than sitting centred:
    // the button is nearly the width of the screen, so a centred block leaves
    // it almost no margin on the left.
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-start px-12 md:justify-center md:px-6">
      <div className="w-full md:w-fit">
        <p
          className={`text-[clamp(2rem,4.8vw,4.5rem)] leading-[1.02] tracking-[-0.015em] transition-colors duration-500 ${
            tone === 'paper' ? 'text-white' : 'text-ink'
          }`}
        >
          <span
            className="block font-display font-semibold"
            style={{
              fontSize: DISPLAY_BALANCE,
              opacity: lines[0],
              transition: 'opacity 0.5s ease',
            }}
          >
            Extraordinary
          </span>
          <span
            // The step to the right is a desktop shape; on a phone there is
            // no room for it and the line stacks flush under the first.
            className="block font-medium md:pl-[4.2em]"
            style={{ opacity: lines[1], transition: 'opacity 0.5s ease' }}
          >
            in a world of ordinary
          </span>
        </p>

        <button
          type="button"
          onClick={() => openInquiry()}
          // The canvas claims pointerdown for panning, which cancels the click
          // that would otherwise follow. The index does the same thing.
          onPointerDown={(event) => event.stopPropagation()}
          data-hero-action
          className="mt-[clamp(0.875rem,1.75vw,1.5rem)] inline-block transition-opacity duration-700 hover:opacity-85"
          style={{
            opacity: action ? 1 : 0,
            pointerEvents: action ? 'auto' : 'none',
          }}
          aria-hidden={!action}
          tabIndex={action ? undefined : -1}
        >
          <PillLabel
            label="Make Extraordinary"
            tone={tone === 'paper' ? 'paper' : 'ink'}
          />
        </button>
      </div>
    </div>
  );
}
