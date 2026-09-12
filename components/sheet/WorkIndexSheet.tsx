'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { AppLink } from '@/components/mobile/MobileChrome';
import { Sheet } from '@/components/sheet/Sheet';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import type { Project } from '@/types/content';

/**
 * The work as a field rather than a page: one block of the catalogue, tiled
 * out in every direction, drifting gently upward on its own and draggable
 * anywhere. Nothing ends, so nothing has to be paginated — the same work comes
 * round again, the way a wall of stills would if you kept walking past it.
 */

/** The block's grid, in px. Cards are laid on it by row span. */
const COL_W = 460;
const ROW_H = 190;
const GAP = 34;
/** Room under each still for the client and the title. */
const CAPTION_H = 62;
const COLS = 5;
const ROWS = 12;
const TILE_W = COLS * COL_W;
const TILE_H = ROWS * ROW_H;

/**
 * How tall each card stands, column by column. Every run sums to ROWS, which
 * is what lets the block tile against itself without a seam.
 */
const SPANS: number[][] = [
  [3, 4, 2, 3],
  [4, 2, 3, 3],
  [2, 3, 4, 3],
  [3, 3, 2, 4],
  [4, 3, 3, 2],
];

/** The drift, in px per second. Slow enough to read against. */
const DRIFT = 16;
/** How much of its speed a thrown grid keeps each frame. */
const FRICTION = 0.94;
/** Past this, a pointer down counts as a drag rather than a click. */
const DRAG_PX = 6;

type Card = {
  key: string;
  project: Project;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Positive modulo, so the field wraps the same way in both directions. */
function wrap(value: number, span: number): number {
  return ((value % span) + span) % span;
}

function layout(projects: Project[]): Card[] {
  const cards: Card[] = [];
  let index = 0;
  for (let column = 0; column < COLS; column += 1) {
    const spans = SPANS[column % SPANS.length]!;
    let row = 0;
    for (let step = 0; step < spans.length; step += 1) {
      const span = spans[step]!;
      cards.push({
        key: `${column}-${step}`,
        project: projects[index % projects.length]!,
        x: column * COL_W,
        y: row * ROW_H,
        width: COL_W - GAP,
        height: span * ROW_H - GAP,
      });
      row += span;
      index += 1;
    }
  }
  return cards;
}

function Card({ card, eager }: { card: Card; eager: boolean }) {
  const { project } = card;
  return (
    <AppLink
      href={`/work/${project.slug.current}`}
      draggable={false}
      className="group absolute block"
      style={{
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
      }}
    >
      <span
        className="relative block w-full overflow-hidden rounded-md bg-hairline"
        style={{ height: card.height - CAPTION_H }}
      >
        <Image
          src={project.thumbnail.src}
          alt=""
          fill
          draggable={false}
          priority={eager}
          loading={eager ? undefined : 'lazy'}
          sizes="480px"
          unoptimized={isUnoptimizedAsset(project.thumbnail)}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      </span>
      <span className="mt-3 block text-[0.82rem] leading-tight text-mute">
        {project.client}
      </span>
      <span className="font-display mt-1 block text-[1.15rem] leading-tight text-ink">
        {project.title}
      </span>
    </AppLink>
  );
}

export function WorkIndexSheet({ projects }: { projects: Project[] }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  // How many copies of the block it takes to cover the frame, with one spare
  // on every side so a copy is always waiting where the field is heading.
  const [copies, setCopies] = useState({ x: 2, y: 2 });
  // A block built at desktop measure would show a single column edge to edge
  // on a phone, so the whole field is drawn down until a column and a half
  // fits. Stills scale with it; nothing reflows.
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(1);

  useEffect(() => {
    const frame = frameRef.current;
    const field = fieldRef.current;
    if (!frame || !field) {
      return;
    }

    const measure = () => {
      const next = Math.min(
        1,
        Math.max(0.75, frame.clientWidth / (COL_W * 1.15)),
      );
      scaleRef.current = next;
      setScale(next);
      setCopies({
        x: Math.ceil(frame.clientWidth / (TILE_W * next)) + 1,
        y: Math.ceil(frame.clientHeight / (TILE_H * next)) + 1,
      });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(frame);

    // The field is moved by writing the transform straight onto the node:
    // state would re-render the whole wall sixty times a second for a change
    // no component needs to know about.
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let last = 0;
    let raf = 0;

    const step = (now: number) => {
      const elapsed = last === 0 ? 16 : Math.min(now - last, 64);
      last = now;
      const seconds = elapsed / 1000;
      x += vx * seconds;
      y += vy * seconds - DRIFT * seconds;
      // Friction is per-frame, so it is raised to the number of frames this
      // one stood in for: a dropped frame slows the throw by the same amount
      // it would have if it had been drawn.
      const decay = FRICTION ** (elapsed / 16.67);
      vx *= decay;
      vy *= decay;
      if (Math.abs(vx) < 0.5) vx = 0;
      if (Math.abs(vy) < 0.5) vy = 0;
      const size = scaleRef.current;
      field.style.transform = `translate3d(${-wrap(-x, TILE_W * size)}px, ${-wrap(-y, TILE_H * size)}px, 0) scale(${size})`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      // The wheel pushes the field rather than placing it, so a flick keeps
      // gliding and a stop settles instead of stopping dead.
      vy -= event.deltaY * 7;
      vx -= event.deltaX * 7;
    };
    frame.addEventListener('wheel', onWheel, { passive: false });

    let pointer = 0;
    let dragged = false;
    let px = 0;
    let py = 0;
    let pt = 0;

    const onDown = (event: PointerEvent) => {
      pointer = event.pointerId;
      dragged = false;
      px = event.clientX;
      py = event.clientY;
      pt = event.timeStamp;
      vx = 0;
      vy = 0;
      frame.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerId !== pointer) {
        return;
      }
      const dx = event.clientX - px;
      const dy = event.clientY - py;
      if (!dragged && Math.hypot(dx, dy) < DRAG_PX) {
        return;
      }
      dragged = true;
      frame.dataset.dragging = 'true';
      const gap = Math.max(event.timeStamp - pt, 1);
      x += dx;
      y += dy;
      vx = (dx / gap) * 1000;
      vy = (dy / gap) * 1000;
      px = event.clientX;
      py = event.clientY;
      pt = event.timeStamp;
    };

    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== pointer) {
        return;
      }
      pointer = 0;
      delete frame.dataset.dragging;
      // A drag that ended on a card must not also open it.
      if (dragged) {
        event.preventDefault();
      }
    };

    frame.addEventListener('pointerdown', onDown);
    frame.addEventListener('pointermove', onMove);
    frame.addEventListener('pointerup', onUp);
    frame.addEventListener('pointercancel', onUp);
    const onClick = (event: MouseEvent) => {
      if (dragged) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    frame.addEventListener('click', onClick, true);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      frame.removeEventListener('wheel', onWheel);
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerup', onUp);
      frame.removeEventListener('pointercancel', onUp);
      frame.removeEventListener('click', onClick, true);
    };
  }, []);

  if (projects.length === 0) {
    return (
      <Sheet title="Work" tone="editorial">
        <div data-surface="light" className="bg-paper" />
      </Sheet>
    );
  }

  const cards = layout(projects);
  const tiles = Array.from(
    { length: (copies.x + 1) * (copies.y + 1) },
    (_, i) => ({
      column: i % (copies.x + 1),
      row: Math.floor(i / (copies.x + 1)),
    }),
  );

  return (
    <Sheet title="Work" tone="editorial" scrollerClassName="overflow-hidden">
      <div
        ref={frameRef}
        data-surface="light"
        className="relative h-full w-full touch-none overflow-hidden bg-paper select-none [&[data-dragging]]:cursor-grabbing cursor-grab"
      >
        <div
          ref={fieldRef}
          className="absolute top-0 left-0 origin-top-left will-change-transform"
          style={{
            width: TILE_W,
            height: TILE_H,
            transform: `scale(${scale})`,
          }}
        >
          {tiles.map((tile) => (
            <div
              key={`${tile.column}-${tile.row}`}
              className="absolute top-0 left-0"
              style={{
                width: TILE_W,
                height: TILE_H,
                transform: `translate3d(${(tile.column - 1) * TILE_W}px, ${(tile.row - 1) * TILE_H}px, 0)`,
              }}
            >
              {cards.map((card) => (
                <Card
                  key={card.key}
                  card={card}
                  eager={tile.column === 1 && tile.row === 1}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
