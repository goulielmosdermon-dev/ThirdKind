'use client';

import { cubicBezier } from 'motion';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

import { HANDS_MAIN_LENGTH, HANDS_PIECES } from './handsCenterline';

export const HANDS_SRC_W = 1778;
export const HANDS_SRC_H = 2522;

const DRAW_MS = 3000;
const drawEase = cubicBezier(0.45, 0, 0.55, 1);

const WIDTH_MIN = 1.8;
const WIDTH_MAX = 5.6;
/** Distance the width profile travels along the line, in source units per second. */
const FLOW_SPEED = 170;

type Piece = {
  loop: boolean;
  x: Float64Array;
  y: Float64Array;
  nx: Float64Array;
  ny: Float64Array;
  /** Arc length within the piece. */
  s: Float64Array;
  /** Position in the width profile: 0–1 around the main contour or the loop. */
  u: Float64Array;
  length: number;
};

function buildPieces(): Piece[] {
  let mainOffset = 0;
  return HANDS_PIECES.map(({ loop, pts }) => {
    const n = pts.length / 2;
    const x = new Float64Array(n);
    const y = new Float64Array(n);
    const s = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      x[i] = pts[2 * i] ?? 0;
      y[i] = pts[2 * i + 1] ?? 0;
      if (i > 0)
        s[i] =
          (s[i - 1] ?? 0) + Math.hypot(x[i]! - x[i - 1]!, y[i]! - y[i - 1]!);
    }
    const nx = new Float64Array(n);
    const ny = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      // Loops are closed: their first and last points coincide.
      const a = i > 0 ? i - 1 : loop ? n - 2 : 0;
      const b = i < n - 1 ? i + 1 : loop ? 1 : n - 1;
      const tx = x[b]! - x[a]!;
      const ty = y[b]! - y[a]!;
      const len = Math.hypot(tx, ty) || 1;
      nx[i] = -ty / len;
      ny[i] = tx / len;
    }
    const length = s[n - 1] ?? 0;
    const u = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      u[i] = loop ? s[i]! / length : (mainOffset + s[i]!) / HANDS_MAIN_LENGTH;
    }
    if (!loop) mainOffset += length;
    return { loop, x, y, nx, ny, s, u, length };
  });
}

/** Stroke width at profile position `u` and time `t` (seconds). Periodic in `u`. */
function widthAt(piece: Piece, u: number, t: number) {
  const span = piece.loop ? piece.length : HANDS_MAIN_LENGTH;
  const phase = (FLOW_SPEED * t) / span;
  const level = piece.loop
    ? 0.5 + 0.5 * Math.sin(2 * Math.PI * (u - phase))
    : 0.5 +
      0.3 * Math.sin(2 * Math.PI * 3 * (u - phase)) +
      0.2 * Math.sin(2 * Math.PI * 5 * (u - phase) + 1.7);
  return WIDTH_MIN + (WIDTH_MAX - WIDTH_MIN) * level;
}

/** Filled outline of `piece` from its start up to arc length `upto`, with round ends. */
function outline(piece: Piece, upto: number, t: number) {
  const { x, y, nx, ny, s, u } = piece;
  const left: string[] = [];
  const right: string[] = [];
  let endR = 0;
  let startR = 0;
  const push = (px: number, py: number, qx: number, qy: number, r: number) => {
    left.push(`${(px + qx * r).toFixed(1)} ${(py + qy * r).toFixed(1)}`);
    right.push(`${(px - qx * r).toFixed(1)} ${(py - qy * r).toFixed(1)}`);
    if (left.length === 1) startR = r;
    endR = r;
  };
  for (let i = 0; i < x.length; i++) {
    const si = s[i]!;
    if (si <= upto) {
      push(x[i]!, y[i]!, nx[i]!, ny[i]!, widthAt(piece, u[i]!, t) / 2);
      continue;
    }
    if (i > 0) {
      const f = (upto - s[i - 1]!) / (si - s[i - 1]!);
      const lerp = (a: Float64Array) => a[i - 1]! + (a[i]! - a[i - 1]!) * f;
      push(
        lerp(x),
        lerp(y),
        lerp(nx),
        lerp(ny),
        widthAt(piece, lerp(u), t) / 2,
      );
    }
    break;
  }
  if (left.length === 0) return '';
  const r = (v: number) => v.toFixed(1);
  return (
    `M${left.join('L')}` +
    `A${r(endR)} ${r(endR)} 0 0 0 ${right[right.length - 1]}` +
    `L${right.reverse().join('L')}` +
    `A${r(startR)} ${r(startR)} 0 0 0 ${left[0]}Z`
  );
}

type HandsProps = {
  className?: string;
};

/**
 * Centerline of the hands drawing, mirrored horizontally and rendered as a
 * filled outline so its width can vary along the line. It draws itself once,
 * from the fingertips, when it comes into view; the detached finger loops are
 * separate pieces on the same timeline so it reads as a single pen. Thick and
 * thin stretches then flow slowly around the line.
 */
export function Hands({ className }: HandsProps) {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<SVGPathElement>('[data-hands-draw] path'),
    );
    const pieces = buildPieces();
    const total = pieces.reduce((sum, p) => sum + p.length, 0);

    const render = (drawn: number, t: number) => {
      let start = 0;
      pieces.forEach((piece, i) => {
        const upto = Math.min(piece.length, drawn - start);
        start += piece.length;
        els[i]?.setAttribute('d', upto > 0 ? outline(piece, upto, t) : '');
      });
    };

    if (reduced) {
      render(total, 0);
      return;
    }

    let drawStart: number | null = null;
    let frame = 0;
    const tick = (now: number) => {
      drawStart ??= now;
      const progress = Math.min(1, (now - drawStart) / DRAW_MS);
      render(total * drawEase(progress), now / 1000);
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry?.isIntersecting) frame = requestAnimationFrame(tick);
    });
    observer.observe(root);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={['hands', className].filter(Boolean).join(' ')}
      role="img"
      aria-label="Two hands reaching toward each other, fingertips touching."
    >
      <svg
        viewBox={`0 0 ${HANDS_SRC_W} ${HANDS_SRC_H}`}
        width={HANDS_SRC_W}
        height={HANDS_SRC_H}
        aria-hidden="true"
        className="block h-auto w-full"
      >
        <g
          data-hands-draw=""
          transform={`translate(${HANDS_SRC_W} 0) scale(-1 1)`}
          fill="currentColor"
        >
          {HANDS_PIECES.map((_, i) => (
            <path key={i} />
          ))}
        </g>
      </svg>
    </div>
  );
}
