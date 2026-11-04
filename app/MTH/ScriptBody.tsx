'use client';

import { useEffect, useRef } from 'react';

const DURATION = 0.5;
const STAGGER = 0.1;
const FADED_OPACITY = 0.15;

type Speaker = { name: string; paragraphs: string[] };

export function ScriptBody({ speakers }: { speakers: Speaker[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const paragraphs = [
      ...element.querySelectorAll<HTMLElement>('[data-paragraph]'),
    ];
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const distance = rect.height;
      const progress = Math.max(
        0,
        Math.min(1, (window.innerHeight * 0.65 - rect.top) / distance),
      );
      // One timeline for the entire script; stagger continues across paragraphs.
      const time = progress * (DURATION + (paragraphs.length - 1) * STAGGER);
      paragraphs.forEach((paragraph, index) => {
        const local = reduced.matches
          ? 1
          : Math.max(0, Math.min(1, (time - index * STAGGER) / DURATION));
        const eased = 1 - (1 - local) ** 2;
        paragraph.style.opacity = String(
          FADED_OPACITY + (1 - FADED_OPACITY) * eased,
        );
      });
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <div ref={root}>
      {speakers.map((speaker, index) => (
        <section className="mdh-speaker" key={`${speaker.name}-${index}`}>
          <h2>{speaker.name}</h2>
          {speaker.paragraphs.map((paragraph) => (
            <p key={paragraph} data-paragraph>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
