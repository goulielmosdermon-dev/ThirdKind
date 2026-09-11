import type { Chapter, Credit } from '../2000/deck';

/**
 * The Ford treatment.
 *
 * The same deck as 2000 — one page, one measure, one voice — carrying a
 * story told in decades. Plates are added as they arrive: an image block
 * dropped into a chapter below is all it takes.
 */
export const chapters: Chapter[] = [
  {
    id: '01',
    title: 'Ford',
    blocks: [
      {
        kind: 'lead',
        image: { src: '/Ford/logo.png', w: 1794, h: 543, alt: 'Ford' },
      },
    ],
  },
  {
    id: '02',
    title: 'Soundtrack',
    blocks: [
      {
        kind: 'sound',
        src: '/Ford/soundtrack.mp3',
        title: 'What a Diff’rence a Day Makes',
        artist: 'Dinah Washington',
      },
    ],
  },
  {
    id: '03',
    title: 'The story',
    blocks: [
      {
        kind: 'text',
        lines: [
          '1970s, rural America. A young couple buys a small house at the edge of open land. From the bedroom window, the sunset stretches wide and endless. Orange bleeding into pink. That room fills with life. The first time they make love, the light slips away as they pull the curtains halfway.',
          'A couple of years later, they lie in the same bed with their newborn son between them, quiet, watching the sun sink through the glass, breathing in sync.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'The 80s. The couple climbs out of an old Ford truck that still smells new. Dust rises. He lifts her, spins her once, kisses her hard, and laughter carries on the air. The sunset watches.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'The 90s. They stand by the window, older now, hands folded. Their son drives off for college, shrinking down the road, his car framed perfectly in the window as the sun dips behind him. In the far distance, metal beams begin to rise. Construction. Something changing.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'The 2000s. A mall grows, steel and concrete inching higher, stealing the horizon piece by piece. The son returns and brings a girl. In the yard, he drops to one knee, dad’s Ford behind them. From the window, the mother watches, smiling softly. She looks up. The sunset is still there, but thinner now, squeezed between buildings.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'The 2010s. The view is gone. Just walls. The mother stands at the window, disappointed, then hears an engine. Her son arrives in a new Ford. A granddaughter bursts out, runs, and throws herself into her grandfather’s arms. Laughter fills the yard.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'The 2020s. She is sick, old, and weak, elevated in bed so she can try to see outside. But the building blocks everything. No sky. No color.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'The house suddenly trembles. She grips the sheets. Outside, her old husband strains in the 70s Ford, a rope tied tight around the house. The engine growls. The house barely shifts. Then another engine roars. A brand-new Ford pulls alongside. Together they pull. Wood groans. The ground cracks. The house slides a single foot. Inside, the room floods with light. The sunset returns. She exhales. A tear rolls down her cheek.',
        ],
      },
    ],
  },
  {
    id: '04',
    title: 'Why Ford',
    blocks: [
      { kind: 'text', lines: ['History, power, family, time, horizon.'] },
    ],
  },
  {
    id: '05',
    title: 'ThirdKind Creative',
    unlisted: true,
    blocks: [
      {
        kind: 'text',
        lines: ['__thirdkindcreative.com|https://thirdkindcreative.com__'],
      },
    ],
  },
];

export const credits: Credit[] = [
  {
    name: 'Goulielmos Dermon',
    role: 'Creative Director / Producer',
    url: 'thirdkindcreative.com',
    href: 'https://thirdkindcreative.com',
  },
];
