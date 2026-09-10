'use client';

import { useSmoothPage } from '@/lib/chrome/useSmoothPage';

/** Mounts the deck's wheel easing. Renders nothing. */
export function SmoothPage() {
  useSmoothPage();
  return null;
}
