'use client';

import Image from 'next/image';
import { useState } from 'react';

import { ShapedTag } from './ShapedTag';
import type { ListItem, Plate, TagShape } from './deck';

function parts(item: ListItem): {
  term: string;
  note: string;
  image?: Plate;
  shape?: TagShape;
} {
  if (typeof item === 'string') return { term: item, note: '' };
  const extra = item[2];
  if (typeof extra === 'string') {
    return { term: item[0], note: item[1] ?? '', shape: extra };
  }
  return { term: item[0], note: item[1] ?? '', image: extra };
}

/**
 * Tags that keep their shape, and a single panel underneath — still on the
 * left, note on the right. The panel is taken out of flow so the centred
 * slide does not jump when it appears.
 */
export function HoverTags({ items }: { items: readonly ListItem[] }) {
  const rows = items.map(parts);
  const [active, setActive] = useState<string | null>(null);
  const current = rows.find((row) => row.term === active);

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      <ul
        className={`flex flex-wrap ${
          rows.some((row) => row.shape)
            ? 'items-center gap-x-8 gap-y-5'
            : 'gap-2'
        }`}
      >
        {rows.map((row) => {
          const on = active === row.term;
          const bind = {
            onPointerEnter: () => setActive(row.term),
            onFocus: () => setActive(row.term),
            onClick: () => setActive(row.term),
          };
          return (
            <li key={row.term}>
              {row.shape ? (
                <ShapedTag shape={row.shape} on={on} {...bind}>
                  {row.term}
                </ShapedTag>
              ) : (
                <button
                  type="button"
                  {...bind}
                  className={`cursor-default border px-4 py-2 text-[0.95rem] leading-none transition-colors duration-fast outline-none ${
                    on ? 'border-select text-select' : 'border-ink text-ink'
                  }`}
                >
                  {row.term}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {current && (current.image || current.note) ? (
        <div className="absolute top-full left-0 z-10 mt-5 flex items-start gap-5">
          {current.image ? (
            <span
              className="relative w-[min(17.5rem,42vw)] shrink-0 overflow-hidden bg-hairline"
              style={{
                aspectRatio: `${current.image.w} / ${current.image.h}`,
              }}
            >
              <Image
                src={current.image.src}
                alt={current.image.alt}
                width={current.image.w}
                height={current.image.h}
                sizes="280px"
                unoptimized
                className={`h-full w-full object-cover ${current.image.grade ?? ''}`}
              />
            </span>
          ) : null}
          {current.note ? (
            <div className="max-w-[38ch] pt-1 text-[0.95rem] leading-[1.35]">
              {current.note.split('\n\n').map((chunk, i) => (
                <p
                  key={i}
                  className={
                    i === 0 ? 'text-mute' : 'mt-8 whitespace-pre-line text-ink'
                  }
                >
                  {chunk}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
