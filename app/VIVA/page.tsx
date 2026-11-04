import { Deck } from '../2000/DeckView';
import { chapters, credits } from './deck';
import './viva.css';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VIVA creatives, ThirdKind',
  description:
    'Three films putting VIVA solutions at the heart of human interaction.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="viva-deck">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter
            id="viva-logo-transparent"
            x="0"
            y="0"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.12549  0 0 0 0 0.14902  0 0 0 0 0.21569  -0.249 -0.836 -0.084 0 1.169"
            />
          </filter>
        </defs>
      </svg>
      <Deck
        chapters={chapters}
        credits={credits}
        motion="swap"
        nav="tags"
        gutter="tight"
      />
    </div>
  );
}
