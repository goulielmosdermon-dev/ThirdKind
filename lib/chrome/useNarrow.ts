'use client';

import { useSyncExternalStore } from 'react';

/** Tailwind's md, below which the site lays out as a phone. */
const NARROW_QUERY = '(max-width: 767px)';

function subscribe(onStoreChange: () => void): () => void {
  const media = window.matchMedia(NARROW_QUERY);
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
}

/** True on a phone-width window. False on the server and first paint. */
export function useNarrow(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}
