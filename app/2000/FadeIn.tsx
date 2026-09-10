'use client';

import { useEffect, useRef } from 'react';

/** Plates resolve as they come into view rather than simply being there. */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Seconds behind the rest, so a run of them cascades rather than lands. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.dataset.fade = 'out';

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          el.dataset.fade = 'in';
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
