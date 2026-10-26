import { Deck } from '../2000/DeckView';
import { chapters, credits } from './deck';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'epay creatives — ThirdKind',
  description:
    'Three films putting epay solutions at the heart of human interaction.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Deck
      chapters={chapters}
      credits={credits}
      motion="swap"
      nav="tags"
      gutter="tight"
    />
  );
}
