import { Deck } from '../2000/DeckView';
import { brands } from '../2000/brands';
import { chapters, credits } from './deck';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ford — Ready, Set, Ford',
  description: 'A treatment from ThirdKind Creative.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Deck
      brand={brands.Ford}
      chapters={chapters}
      credits={credits}
      // Nothing sticks and nothing is held back: the slides simply resolve as
      // they arrive and leave as they go.
      motion="plain"
    />
  );
}
