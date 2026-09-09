import { notFound } from 'next/navigation';

import { Deck } from './DeckView';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '2000',
  description: 'Filmed at 2000 frames per second.',
  robots: { index: false, follow: false },
};

/**
 * The unbranded master, for working on the deck locally.
 *
 * It is deliberately not reachable in production: the deck goes out one brand
 * at a time behind a password, and an open copy of the same work would make
 * those gates pointless. Brand editions live at their own routes.
 */
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <Deck />;
}
