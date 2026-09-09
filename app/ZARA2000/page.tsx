import { Deck } from '../2000/DeckView';
import { brands } from '../2000/brands';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2000 — Zara',
  description: 'Filmed at 2000 frames per second.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Deck brand={brands.ZARA2000} />;
}
