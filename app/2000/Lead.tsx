'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import type { Plate } from './deck';

/**
 * The opening word of a deck.
 *
 * It holds the middle of the screen and then simply goes: opacity only, no
 * mask and no travel, so the first slide reads as clearing rather than being
 * pulled off the top. The frame sticks for a screen and a half of scroll,
 * which is the room the fade needs to finish before the next slide arrives.
 */
export function Lead({
  text,
  image,
  className,
  plain = false,
}: {
  text?: string;
  /** A mark instead of a word, held to the same centre and the same fade. */
  image?: Plate;
  className: string;
  /**
   * No sticky frame and no scroll-driven fade: one screen, and the opening
   * simply resolves and goes the way everything else on the page does.
   */
  plain?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || plain) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const travel = el.offsetHeight - window.innerHeight;
      if (travel <= 0) return;
      const scrolled = Math.min(
        Math.max(-el.getBoundingClientRect().top, 0),
        travel,
      );
      /* Gone by two thirds of the way through, so the screen is clear for a
         beat before the next text starts arriving. */
      setOpacity(1 - Math.min(scrolled / (travel * 0.66), 1));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [plain]);

  return (
    // The opening is the one slide that ignores the page's frame: it pulls
    // back both the rail's column and the deck's top padding, so the mark
    // sits on the true centre of the screen rather than the centre of what is
    // left over.
    <div
      ref={ref}
      className={`lg:-ml-44 ${plain ? '' : '-mt-[12vh]'}`}
      style={{ height: plain ? '100svh' : '180svh' }}
    >
      <div
        className={`flex h-svh items-center justify-center px-5 ${
          plain ? '' : 'sticky top-0'
        }`}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.w}
            height={image.h}
            priority
            unoptimized
            /* The mark arrives on a white box; multiply drops it into the
               paper without needing a cut-out. */
            className="h-auto w-[min(30rem,72vw)] mix-blend-multiply"
            style={{ opacity }}
          />
        ) : (
          <p className={className} style={{ opacity }}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
