'use client';

import { useEffect, useId, useState } from 'react';

type Entry = { id: string; title: string };

/**
 * The one index the page has. It tracks the chapter currently crossing the
 * upper third of the viewport so the deck reads as a single document with a
 * position, not as a stack of slides.
 */
export function DeckIndex({
  entries,
  textClass,
  variant = 'rail',
}: {
  entries: Entry[];
  textClass: string;
  /**
   * How the index is carried. `rail` stands the whole list down the left
   * margin; `menu` folds it behind a hamburger, which is what a deck read
   * full-screen wants — the list is a way back, not something to read.
   */
  variant?: 'rail' | 'menu';
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const [active, setActive] = useState(entries[0]?.id ?? '');

  useEffect(() => {
    const sections = entries
      .map((e) => document.getElementById(`ch-${e.id}`))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (records) => {
        const hit = records
          .filter((r) => r.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
        if (hit) setActive(hit.target.id.replace('ch-', ''));
      },
      { rootMargin: '-12% 0px -70% 0px' },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  if (variant === 'menu') {
    return (
      <>
        <button
          type="button"
          aria-label={open ? 'Close index' : 'Open index'}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
          className="fixed top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-paper/85 text-ink backdrop-blur md:top-6 md:left-6"
        >
          <span className="flex h-3 w-4 flex-col justify-between" aria-hidden>
            <span className="h-px w-full bg-ink" />
            <span className="h-px w-full bg-ink" />
          </span>
        </button>

        {/* The list itself, folded away until it is asked for. It is still in
            the document when closed — a screen reader gets the whole index,
            and the anchors still work — only hidden from sight. */}
        <nav
          id={menuId}
          aria-label="Index"
          hidden={!open}
          className="fixed top-0 left-0 z-30 flex h-full w-[min(20rem,80vw)] flex-col justify-center gap-3 border-r border-hairline bg-paper/95 px-8 backdrop-blur"
        >
          {entries.map((e) => (
            <a
              key={e.id}
              href={`#ch-${e.id}`}
              aria-current={active === e.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
              className={`${textClass} transition-opacity duration-fast ${
                active === e.id
                  ? 'text-ink opacity-100'
                  : 'text-mute opacity-55 hover:opacity-100'
              }`}
            >
              {e.title}
            </a>
          ))}
        </nav>
      </>
    );
  }

  return (
    <>
      <nav
        aria-label="Index"
        className="pointer-events-none fixed top-0 left-0 z-20 hidden h-full w-44 flex-col justify-center gap-2 pl-8 lg:flex"
      >
        {entries.map((e) => (
          <a
            key={e.id}
            href={`#ch-${e.id}`}
            aria-current={active === e.id ? 'true' : undefined}
            className={`pointer-events-auto ${textClass} transition-opacity duration-fast ${
              active === e.id
                ? 'text-ink opacity-100'
                : 'text-mute opacity-45 hover:opacity-90'
            }`}
          >
            {e.title}
          </a>
        ))}
      </nav>

      <nav
        aria-label="Index"
        className="sticky top-0 z-20 flex gap-5 overflow-x-auto border-b border-hairline bg-paper/90 px-5 py-3 backdrop-blur lg:hidden"
      >
        {entries.map((e) => (
          <a
            key={e.id}
            href={`#ch-${e.id}`}
            aria-current={active === e.id ? 'true' : undefined}
            className={`shrink-0 ${textClass} whitespace-nowrap ${
              active === e.id ? 'text-ink' : 'text-mute'
            }`}
          >
            {e.title}
          </a>
        ))}
      </nav>
    </>
  );
}
