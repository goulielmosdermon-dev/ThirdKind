import { Deck } from '../2000/DeckView';
import { brands } from '../2000/brands';
import { chapters, credits } from './deck';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'epay — Customer Testimonial Campaign',
  description: 'A proposal from ThirdKind Creative.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Deck brand={brands.ePay} chapters={chapters} credits={credits} />;
}
