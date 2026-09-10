'use client';

import { useEffect, useRef, useState } from 'react';

/** The one curve the cursor arrives and leaves on. */
const ELASTIC = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** How much of the remaining distance it closes each frame. */
const FOLLOW = 0.14;

/**
 * The header's own cursor. While the pointer is over the showcase a small
 * round "Explore" trails along behind it — over the headline as well, which is
 * why the pointer is tracked on the window rather than on a layer of the
 * band's own. It steps aside for the button, which has an action of its own,
 * and scrolling shrinks it away.
 *
 * The band itself is one big button, so clicking through the cursor opens
 * whichever project is on screen without this having to do anything. It is
 * drawn above the headline so nothing can cover it.
 */
export function ExploreCursor() {
  const [shown, setShown] = useState(false);
  const dotRef = useRef<HTMLSpanElement>(null);
  // Where the pointer is, and where the cursor has got to so far. It closes
  // the gap a fraction at a time, which is what gives it the lag.
  const target = useRef<{ x: number; y: number } | null>(null);
  const at = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    let frame = 0;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const want = target.current;
      if (!want) {
        return;
      }
      const here = at.current ?? want;
      const next = {
        x: here.x + (want.x - here.x) * FOLLOW,
        y: here.y + (want.y - here.y) * FOLLOW,
      };
      at.current = next;
      const dot = dotRef.current;
      if (dot) {
        dot.style.left = `${next.x}px`;
        dot.style.top = `${next.y}px`;
      }
    };
    frame = requestAnimationFrame(draw);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }
      const band = document.querySelector('[data-hero-band]');
      const box = band?.getBoundingClientRect();
      const inside =
        box &&
        box.width > 0 &&
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      // The button and the command bar answer for themselves, so the cursor
      // gets out of the way rather than sitting on top of them.
      const overAction =
        event.target instanceof Element &&
        event.target.closest(
          '[data-hero-action], [data-command-nav], [data-chrome]',
        );

      if (!inside || overAction) {
        setShown(false);
        return;
      }
      const point = { x: event.clientX, y: event.clientY };
      target.current = point;
      // Coming back from nothing, it starts under the pointer rather than
      // sliding in from wherever it was left.
      if (!at.current) {
        at.current = point;
        const dot = dotRef.current;
        if (dot) {
          dot.style.left = `${point.x}px`;
          dot.style.top = `${point.y}px`;
        }
      }
      setShown(true);
    };

    const away = () => {
      setShown(false);
      at.current = null;
      target.current = null;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', away);
    window.addEventListener('wheel', away, { passive: true, capture: true });
    window.addEventListener('scroll', away, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', away);
      window.removeEventListener('wheel', away, true);
      window.removeEventListener('scroll', away, true);
    };
  }, []);

  return (
    <span
      ref={dotRef}
      className="pointer-events-none fixed z-[60] flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-white text-[0.8rem] tracking-[0.04em] text-white"
      style={{
        transform: `translate(-50%, -50%) scale(${shown ? 1 : 0})`,
        opacity: shown ? 1 : 0,
        // The same give going out as coming in, so it shrinks away rather
        // than blinking out.
        transition: `transform 520ms ${ELASTIC}, opacity 320ms ease`,
      }}
      aria-hidden
    >
      Explore
    </span>
  );
}
