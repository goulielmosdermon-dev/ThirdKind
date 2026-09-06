'use client';

import Image from 'next/image';
import { useEffect, useRef, useSyncExternalStore } from 'react';

/** Rendered width of the hand, in px. */
export const CURSOR_WIDTH = 24;
/** How much it opens over something clickable. */
export const CURSOR_HOVER_SCALE = 1.25;
/** Anything matching this counts as hoverable, on any page. */
const INTERACTIVE =
  'a,button,[role="button"],[data-node-id],input,textarea,select,summary';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia('(pointer: fine)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * The pointer, drawn as the hand from the opening and turned to point up.
 *
 * A CSS `cursor: url()` cannot be animated or blended, so the hand is a real
 * element that follows the mouse. It is written straight to the DOM rather
 * than through state so it never trails a render behind the pointer.
 */
export function CursorHand() {
  const fine = useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(pointer: fine)').matches,
    () => false,
  );
  const wrapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!fine) {
      return;
    }
    const onMove = (event: MouseEvent) => {
      const wrap = wrapRef.current;
      const image = imageRef.current;
      if (!wrap || !image) {
        return;
      }
      wrap.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      wrap.style.opacity = '1';
      const over =
        event.target instanceof Element && event.target.closest(INTERACTIVE);
      image.style.transform = `rotate(90deg) scale(${over ? CURSOR_HOVER_SCALE : 1})`;
    };
    const onLeave = () => {
      const wrap = wrapRef.current;
      if (wrap) {
        wrap.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [fine]);

  if (!fine) {
    return null;
  }

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] opacity-0 will-change-transform"
    >
      <Image
        ref={imageRef}
        src="/brand/hand-human.png"
        alt=""
        width={2517}
        height={1819}
        priority
        // Difference keeps the hand legible on any ground: dark on paper,
        // light on a black film still, without a second asset.
        className="max-w-none origin-center mix-blend-difference invert transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: CURSOR_WIDTH,
          height: 'auto',
          // Centred on the pointer, then turned so the finger points up.
          marginLeft: -CURSOR_WIDTH / 2,
          marginTop: -CURSOR_WIDTH / 2,
          transform: 'rotate(90deg)',
        }}
      />
    </div>
  );
}
