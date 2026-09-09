'use client';

import { useEffect, useState } from 'react';

type Entry = { id: string; title: string };

/**
 * The one index the page has. It tracks the chapter currently crossing the
 * upper third of the viewport so the deck reads as a single document with a
 * position, not as a stack of slides.
 */
export function DeckIndex({
  entries,
  textClass,
}: {
  entries: Entry[];
  textClass: string;
}) {
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
