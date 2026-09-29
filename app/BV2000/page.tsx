import { Deck } from '../2000/DeckView';
import { brands } from '../2000/brands';
import { fashionChapters } from '../2000/deck';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2000 — Bottega Veneta',
  description: 'Filmed at 2000 frames per second.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Deck brand={brands.BV2000} chapters={fashionChapters} />;
}
