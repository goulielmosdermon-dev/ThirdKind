'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { useReducedMotion } from 'motion/react';

import type { TagShape } from './deck';

const ORBIT_MS = 28000;

function stadiumD(w: number, h: number, inset: number): string {
  const x = inset;
  const y = inset;
  const W = Math.max(w - inset * 2, 1);
  const H = Math.max(h - inset * 2, 1);
  const r = H / 2;
  return `M ${x + r} ${y} H ${x + W - r} A ${r} ${r} 0 0 1 ${x + W - r} ${y + H} H ${x + r} A ${r} ${r} 0 0 1 ${x + r} ${y}`;
}

/**
 * A stadium that starts at the bottom centre and runs counter-clockwise:
 * right along the floor, up the right cap, left along the roof, down the
 * left cap. Split in half, that is two arrows chasing each other.
 */
function stadiumCycleD(w: number, h: number, inset: number): string {
  const x = inset;
  const y = inset;
  const W = Math.max(w - inset * 2, 1);
  const H = Math.max(h - inset * 2, 1);
  const r = H / 2;
  const cx = x + W / 2;
  return `M ${cx} ${y + H} H ${x + W - r} A ${r} ${r} 0 0 0 ${x + W - r} ${y} H ${x + r} A ${r} ${r} 0 0 0 ${x + r} ${y + H} H ${cx}`;
}

function ArrowRing({ w, h }: { w: number; h: number }) {
  const trackRef = useRef<SVGPathElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const [n, setN] = useState(0);
  const d = stadiumD(w, h, 2.2);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const len = track.getTotalLength();
    if (len >= 8) {
      setN(Math.max(14, Math.round(len / 13)));
    }
  }, [d]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    if (!track || !group || n === 0) {
      return;
    }
    const len = track.getTotalLength();
    const marks = [...group.querySelectorAll('path')];
    const place = (t: number) => {
      for (let i = 0; i < marks.length; i++) {
        const mark = marks[i];
        if (!mark) {
          continue;
        }
        const s = ((i / n + t) % 1) * len;
        const a = track.getPointAtLength(s);
        const b = track.getPointAtLength((s + 6) % len);
        const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        mark.setAttribute(
          'transform',
          `translate(${a.x} ${a.y}) rotate(${deg})`,
        );
      }
    };
    place(0);
    if (reduced) {
      return;
    }
    const origin = performance.now();
    let id = 0;
    const tick = (now: number) => {
      place(((now - origin) % ORBIT_MS) / ORBIT_MS);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [d, n, reduced]);

  return (
    <>
      <path ref={trackRef} d={d} fill="none" stroke="none" />
      <g ref={groupRef}>
        {Array.from({ length: n }, (_, i) => (
          <path
            key={i}
            d="M -6.5 -3.4 L 4 0 L -6.5 3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </>
  );
}

const HEAD_LEN = 8;
const HEAD_HALF = 3.6;
const HEAD_OVERLAP = 1.5;

function CycleArrows({ w, h }: { w: number; h: number }) {
  const trackRef = useRef<SVGPathElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const headsRef = useRef<SVGGElement>(null);
  const d = stadiumCycleD(w, h, 2.2);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stroke = strokeRef.current;
    const heads = headsRef.current;
    if (!track || !stroke || !heads) {
      return;
    }
    const len = track.getTotalLength();
    if (len < 16) {
      return;
    }
    const gap = HEAD_LEN - HEAD_OVERLAP * 2;
    const visible = len / 2 - gap;
    stroke.setAttribute('stroke-dasharray', `${visible} ${gap}`);
    const tips = [...heads.querySelectorAll('path')];
    const place = (t: number) => {
      const shift = t * len;
      stroke.setAttribute('stroke-dashoffset', String(-shift));
      for (let i = 0; i < tips.length; i++) {
        const tip = tips[i];
        if (!tip) {
          continue;
        }
        const s = (visible - HEAD_OVERLAP + i * (len / 2) + shift + len) % len;
        const a = track.getPointAtLength(s);
        const b = track.getPointAtLength((s + 5) % len);
        const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        tip.setAttribute(
          'transform',
          `translate(${a.x} ${a.y}) rotate(${deg})`,
        );
      }
    };
    place(0);
    if (reduced) {
      return;
    }
    const origin = performance.now();
    let id = 0;
    const tick = (now: number) => {
      place(((now - origin) % ORBIT_MS) / ORBIT_MS);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [d, reduced]);

  return (
    <>
      <path ref={trackRef} d={d} fill="none" stroke="none" />
      <path
        ref={strokeRef}
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="butt"
        strokeLinejoin="round"
      />
      <g ref={headsRef}>
        {[0, 1].map((i) => (
          <path
            key={i}
            d={`M 0 ${-HEAD_HALF} L ${HEAD_LEN} 0 L 0 ${HEAD_HALF} Z`}
            fill="currentColor"
          />
        ))}
      </g>
    </>
  );
}

function Frame({ w, h, shape }: { w: number; h: number; shape: TagShape }) {
  if (w < 2 || h < 2) {
    return null;
  }

  if (shape === 'arrows') {
    return <ArrowRing w={w} h={h} />;
  }

  if (shape === 'square') {
    return (
      <rect
        x="1.15"
        y="1.15"
        width={Math.max(w - 2.3, 1)}
        height={Math.max(h - 2.3, 1)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
      />
    );
  }

  return <CycleArrows w={w} h={h} />;
}

/**
 * A hover tag whose outline is drawn: a ring of arrows, a square, or two
 * arrows chasing around the pill — instead of the usual stroke.
 */
export function ShapedTag({
  shape,
  on,
  children,
  ...rest
}: {
  shape: TagShape;
  on: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const measure = () => setBox({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const watcher = new ResizeObserver(measure);
    watcher.observe(el);
    return () => watcher.disconnect();
  }, [children]);

  const pad =
    shape === 'square'
      ? 'px-[2.7rem] py-[1.5rem]'
      : shape === 'flow'
        ? 'px-[2.9rem] py-[1.7rem]'
        : 'px-[2.7rem] py-[1.5rem]';

  return (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={`relative cursor-default ${pad} text-[0.95rem] leading-none transition-colors duration-fast outline-none ${
        on ? 'text-select' : 'text-ink'
      }`}
    >
      <svg
        aria-hidden
        width={box.w}
        height={box.h}
        className="pointer-events-none absolute inset-0 overflow-visible"
      >
        <Frame w={box.w} h={box.h} shape={shape} />
      </svg>
      <span className="relative">{children}</span>
    </button>
  );
}
