'use client';

import { useLayoutEffect, type ReactNode } from 'react';

export function SlideUp({ id, children }: { id: string; children: ReactNode }) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);
  return (
    <article key={id} className="collab-company">
      {children}
    </article>
  );
}
