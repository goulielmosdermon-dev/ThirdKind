'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import type { Plate } from './deck';

type Row = { plates: Plate[]; height: number };

/**
 * Stills packed into justified rows — each row fills the width, each picture
 * keeps its own aspect, with a hairline gap. Row height is chosen so the
 * whole wall fits the slide without shrinking the width.
 */
export function JustifiedBoard({
  images,
  gap = 3,
}: {
  images: readonly Plate[];
  gap?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    const measure = () =>
      setSize({ width: frame.clientWidth, height: frame.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const rows =
    size.width > 0 && size.height > 0
      ? fit(images, size.width, size.height, gap)
      : [];

  return (
    <div ref={frameRef} className="flex h-[78svh] w-full items-center">
      <div className="flex w-full flex-col" style={{ gap }}>
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex w-full"
            style={{ gap, height: row.height }}
          >
            {row.plates.map((plate) => {
              const aspect = plate.w / plate.h;
              return (
                // Native img keeps animated GIFs alive; Next Image would
                // freeze them even with unoptimized.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={plate.src}
                  src={plate.src}
                  alt={plate.alt}
                  width={plate.w}
                  height={plate.h}
                  className="h-full object-cover"
                  style={{
                    width: row.height * aspect,
                    flex: '0 0 auto',
                  }}
                  draggable={false}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function fit(
  images: readonly Plate[],
  width: number,
  height: number,
  gap: number,
): Row[] {
  let low = 48;
  let high = Math.min(220, height);
  let best = pack(images, width, gap, low);

  for (let i = 0; i < 18; i += 1) {
    const mid = (low + high) / 2;
    const rows = pack(images, width, gap, mid);
    const total =
      rows.reduce((sum, row) => sum + row.height, 0) +
      gap * Math.max(0, rows.length - 1);
    if (total <= height) {
      best = rows;
      low = mid;
    } else {
      high = mid;
    }
  }

  return best;
}

function pack(
  images: readonly Plate[],
  width: number,
  gap: number,
  targetRow: number,
): Row[] {
  const rows: Row[] = [];
  let current: Plate[] = [];
  let aspectSum = 0;

  const flush = (justify: boolean) => {
    if (current.length === 0) {
      return;
    }
    const gaps = gap * Math.max(0, current.length - 1);
    const height = justify
      ? (width - gaps) / aspectSum
      : Math.min(targetRow * 1.2, (width - gaps) / aspectSum);
    rows.push({ plates: current, height });
    current = [];
    aspectSum = 0;
  };

  for (const plate of images) {
    const aspect = plate.w / Math.max(1, plate.h);
    const nextSum = aspectSum + aspect;
    const gaps = gap * current.length;
    const rowWidth = nextSum * targetRow + gaps;
    if (current.length > 0 && rowWidth > width) {
      flush(true);
    }
    current.push(plate);
    aspectSum += aspect;
  }
  flush(current.length > 1);
  return rows;
}
