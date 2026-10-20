'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef, useState } from 'react';

import type { Plate } from './deck';

/** Close to even, never quite — the same weights the work wall uses. */
const WEIGHTS = [1, 0.88, 1.16] as const;

/**
 * Stills hung like the work index: three columns, a little uneven. Each
 * picture keeps the shape it arrived in — nothing is cropped to a frame.
 */
export function MosaicBoard({
  images,
  fit = false,
}: {
  images: Plate[];
  /** Scale the wall to the slide instead of letting a tall column run off. */
  fit?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [shell, setShell] = useState<number | undefined>();

  const cards = images.slice(0, 9).map((plate, index) => ({ plate, index }));
  const lanes = Array.from({ length: 3 }, (_, lane) =>
    cards.filter((card) => card.index % 3 === lane),
  );

  useLayoutEffect(() => {
    if (!fit) {
      return;
    }
    const frame = frameRef.current;
    const board = boardRef.current;
    if (!frame || !board) {
      return;
    }

    const measure = () => {
      const natural = board.offsetHeight;
      const avail = frame.clientHeight;
      if (natural <= 0 || avail <= 0) {
        return;
      }
      const next = Math.min(1, avail / natural);
      setScale(next);
      setShell(natural * next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(board);
    return () => observer.disconnect();
  }, [fit, images]);

  const wall = (
    <div ref={boardRef} className="flex w-full items-start gap-3">
      {lanes.map((lane, index) => (
        <div
          key={index}
          className="flex min-w-0 flex-col gap-3"
          style={{ flex: `${WEIGHTS[index] ?? 1} 1 0%` }}
        >
          {lane.map((card) => (
            <Image
              key={card.plate.src}
              src={card.plate.src}
              alt={card.plate.alt}
              width={card.plate.w}
              height={card.plate.h}
              unoptimized
              sizes="(min-width: 768px) 28vw, 90vw"
              className="h-auto w-full"
            />
          ))}
        </div>
      ))}
    </div>
  );

  if (!fit) {
    return wall;
  }

  return (
    <div
      ref={frameRef}
      className="flex h-[72svh] w-full items-center overflow-hidden"
    >
      <div
        className="w-full overflow-hidden"
        style={shell != null ? { height: shell } : undefined}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {wall}
        </div>
      </div>
    </div>
  );
}
