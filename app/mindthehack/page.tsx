import { Deck } from '../2000/DeckView';
import { brands } from '../2000/brands';
import { chapters, credits } from './deck';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mind The Hack — Communications & Demand Strategy',
  description: 'A strategy from ThirdKind Creative.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Deck
      brand={brands.mindthehack}
      chapters={chapters}
      credits={credits}
      // Nothing travels. The frame stays where it is and each slide is
      // replaced on the spot, so the wheel moves the deck on rather than
      // moving the page past it.
      motion="swap"
    />
  );
}
