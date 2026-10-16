'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { ArrowUpRight } from '@/components/chrome/ArrowUpRight';

/** The one curve the cursor arrives and leaves on. */
const ELASTIC = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** How much of the remaining distance it closes each frame. */
const FOLLOW = 0.14;

type Pt = readonly [number, number];

const VIEW = 100;
const CX = VIEW / 2;
const CY = VIEW / 2;
/** Inset so a 1px stroke and the spike miters stay inside the box. */
const R = 46;
/** Shared vertex count so every shape can lerp into the next. */
const N = 60;
const SPIKES = 15;
/** One shape every three seconds: sit, then ease into the next. */
const HOLD_MS = 2000;
const MORPH_MS = 1000;
const SLOT_MS = HOLD_MS + MORPH_MS;
const CYCLE_MS = SLOT_MS * 4;

function raySeg(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  a: Pt,
  b: Pt,
): number | null {
  const ex = b[0] - a[0];
  const ey = b[1] - a[1];
  const denom = dx * ey - dy * ex;
  if (Math.abs(denom) < 1e-8) {
    return null;
  }
  const sx = a[0] - ox;
  const sy = a[1] - oy;
  const t = (sx * ey - sy * ex) / denom;
  const u = (sx * dy - sy * dx) / denom;
  if (t >= 0 && u >= -1e-6 && u <= 1 + 1e-6) {
    return t;
  }
  return null;
}

function polygon(sides: number, turn: number): Pt[] {
  return Array.from({ length: sides }, (_, i) => {
    const a = turn + (i / sides) * Math.PI * 2;
    return [CX + Math.cos(a) * R, CY + Math.sin(a) * R] as const;
  });
}

function star(count: number): Pt[] {
  const inner = R * 0.68;
  const out: Pt[] = [];
  for (let i = 0; i < count; i += 1) {
    const outerA = -Math.PI / 2 + (i / count) * Math.PI * 2;
    const innerA = -Math.PI / 2 + ((i + 0.5) / count) * Math.PI * 2;
    out.push([CX + Math.cos(outerA) * R, CY + Math.sin(outerA) * R]);
    out.push([CX + Math.cos(innerA) * inner, CY + Math.sin(innerA) * inner]);
  }
  return out;
}

function sample(verts: Pt[]): Pt[] {
  return Array.from({ length: N }, (_, i) => {
    const theta = -Math.PI / 2 + (i / N) * Math.PI * 2;
    const dx = Math.cos(theta);
    const dy = Math.sin(theta);
    let hit = R;
    for (let v = 0; v < verts.length; v += 1) {
      const t = raySeg(
        CX,
        CY,
        dx,
        dy,
        verts[v]!,
        verts[(v + 1) % verts.length]!,
      );
      if (t != null) {
        hit = t;
        break;
      }
    }
    return [CX + dx * hit, CY + dy * hit] as const;
  });
}

const CIRCLE: Pt[] = Array.from({ length: N }, (_, i) => {
  const a = -Math.PI / 2 + (i / N) * Math.PI * 2;
  return [CX + Math.cos(a) * R, CY + Math.sin(a) * R] as const;
});
const HEX = sample(polygon(6, -Math.PI / 2));
const SQUARE = sample(polygon(4, Math.PI / 4));
const SPIKE = sample(star(SPIKES));
const SHAPES = [CIRCLE, HEX, SQUARE, SPIKE] as const;

function ease(t: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, t)));
}

function pathAt(elapsed: number): string {
  const cycle = ((elapsed % CYCLE_MS) + CYCLE_MS) % CYCLE_MS;
  const slot = Math.floor(cycle / SLOT_MS) % SHAPES.length;
  const local = cycle - slot * SLOT_MS;
  const from = SHAPES[slot]!;
  const to = SHAPES[(slot + 1) % SHAPES.length]!;
  const t = local < HOLD_MS ? 0 : ease((local - HOLD_MS) / MORPH_MS);
  let d = '';
  for (let i = 0; i < N; i += 1) {
    const a = from[i]!;
    const b = to[i]!;
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

const CIRCLE_PATH = pathAt(0);

/**
 * The page's own cursor. While the pointer is over something that opens, a
 * morphing outline trails along behind it — circle, hexagon, square, a
 * 15-spike seal, then circle again — with a sharp arrow in the middle. It
 * grows out of nothing when it arrives and shrinks back when it leaves. It
 * steps aside for anything with an action of its own, and scrolling shrinks
 * it away.
 *
 * Two things claim it. The header band is matched by its box rather than by
 * what the pointer is actually over, because the headline is drawn above the
 * band rather than inside it, and a pointer over the headline is still a
 * pointer over the band. Everything else — the index's project stills — simply
 * marks itself `data-explore` and is matched by containment.
 *
 * Both are already one big button, so clicking through the cursor opens
 * whatever is under it without this having to do anything. It is drawn above
 * the page so nothing can cover it.
 */
export function ExploreCursor() {
  const reduced = useReducedMotion() ?? false;
  const [shown, setShown] = useState(false);
  const dotRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const shownRef = useRef(false);
  const reducedRef = useRef(reduced);
  const elapsed = useRef(0);
  const lastTick = useRef(0);
  // Where the pointer is, and where the cursor has got to so far. It closes
  // the gap a fraction at a time, which is what gives it the lag.
  const target = useRef<{ x: number; y: number } | null>(null);
  const at = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    shownRef.current = shown;
    reducedRef.current = reduced;
  }, [reduced, shown]);

  useEffect(() => {
    let frame = 0;

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const want = target.current;
      if (want) {
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
      }

      const path = pathRef.current;
      if (!path) {
        return;
      }
      if (reducedRef.current) {
        elapsed.current = 0;
        lastTick.current = 0;
        path.setAttribute('d', CIRCLE_PATH);
        return;
      }
      if (!shownRef.current) {
        // Freeze on the shape it was, so coming back picks up there
        // rather than snapping to the circle.
        lastTick.current = 0;
        return;
      }
      if (lastTick.current === 0) {
        lastTick.current = now;
      }
      elapsed.current += now - lastTick.current;
      lastTick.current = now;
      path.setAttribute('d', pathAt(elapsed.current));
    };
    frame = requestAnimationFrame(draw);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }
      const band = document.querySelector('[data-hero-band]');
      const box = band?.getBoundingClientRect();
      const overBand =
        box &&
        box.width > 0 &&
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      // Anything else that opens says so for itself, and nothing is drawn over
      // those, so what the pointer is on is answer enough.
      const overExplore =
        event.target instanceof Element &&
        event.target.closest('[data-explore]');
      const inside = overBand || overExplore;
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
      className="pointer-events-none fixed z-[60] flex h-[5.5rem] w-[5.5rem] items-center justify-center text-white"
      style={{
        transform: `translate(-50%, -50%) scale(${shown ? 1 : 0})`,
        opacity: shown ? 1 : 0,
        // The same give going out as coming in, so it shrinks away rather
        // than blinking out.
        transition: `transform 520ms ${ELASTIC}, opacity 320ms ease`,
      }}
      aria-hidden
    >
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        <path
          ref={pathRef}
          d={CIRCLE_PATH}
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinejoin="miter"
          strokeLinecap="square"
          strokeMiterlimit={12}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <ArrowUpRight
        className="relative h-[2.25rem] w-[2.25rem]"
        cap="square"
        join="miter"
      />
    </span>
  );
}
