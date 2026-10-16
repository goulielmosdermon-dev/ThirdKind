import type { Chapter, Credit, Plate } from '../2000/deck';

const still = (
  n: number,
  w: number,
  h: number,
  alt: string,
  grade?: string,
): Plate => ({
  src: `/mindthehack/${String(n).padStart(2, '0')}.jpg`,
  w,
  h,
  alt,
  ...(grade ? { grade } : {}),
});

/**
 * Mind The Hack — a content strategy.
 *
 * Fifteen slides, carried like Ford: `swap`, so the frame never moves and
 * each slide replaces the one before it. One block is one slide.
 */
export const chapters: Chapter[] = [
  {
    id: '01',
    title: 'Mind The Hack',
    blocks: [
      {
        kind: 'lead',
        image: {
          src: '/mindthehack/logo.svg',
          w: 1912,
          h: 345,
          alt: 'Mind The Hack',
          grade: 'brightness-0',
        },
      },
    ],
  },
  {
    id: '02',
    title: 'The problem',
    blocks: [
      {
        kind: 'list',
        title: 'Great product. Silent brand.',
        items: [
          'No video',
          'No educational content',
          'No product content',
          'A quiet LinkedIn',
        ],
      },
    ],
  },
  {
    id: '03',
    title: 'The real pain',
    blocks: [
      {
        kind: 'text',
        lines: ["You're doing everything yourself."],
      },
    ],
  },
  {
    id: '04',
    title: 'Why now',
    blocks: [
      {
        kind: 'list',
        title: 'Regulation is a first buying moment.',
        boxed: true,
        items: [
          ['NIS2', 'Audit due 30 June 2026. Boards now liable.'],
          ['DORA', 'Already enforceable. Real attack testing.'],
          ['EU AI Act', 'Tightening through 2026–27.'],
        ],
        plot: {
          kind: 'quadrant',
          title: 'Nobody owns story + craft. You can.',
          axes: {
            top: 'Strong craft',
            bottom: 'Generic / low craft',
            left: 'Product-led',
            right: 'Story-led',
          },
          points: [
            { label: 'Pentera', x: -0.729, y: 0.751 },
            { label: 'Mind The Hack', x: 0.317, y: 0.739, mark: true },
            { label: 'Horizon3', x: -0.315, y: 0.475 },
            { label: 'Cymulate', x: -0.139, y: -0.122 },
            { label: 'Picus', x: -0.579, y: -0.223, side: 'left' },
            { label: 'XM Cyber', x: -0.7, y: -0.623 },
            { label: 'Cytomate', x: -0.348, y: -0.823 },
          ],
        },
      },
    ],
  },
  {
    id: '05',
    title: 'The idea',
    blocks: [
      {
        kind: 'text',
        lines: [
          "You can't bore people into buying. Educate, entertain, challenge.",
        ],
      },
    ],
  },
  {
    id: '06',
    title: 'What this returns',
    nav: 'The Returns',
    blocks: [
      {
        kind: 'list',
        title: 'What this returns',
        items: [
          'Faster sales',
          'Market expansion',
          'Credibility',
          'Talent attraction',
          'Pricing power',
          'Your time back',
        ],
      },
    ],
  },
  {
    id: '07',
    title: 'The usual objections',
    nav: 'Objections',
    blocks: [
      {
        kind: 'list',
        title: 'The usual objections',
        boxed: true,
        items: [
          ['Cost', 'Start small. Step one only.'],
          ['Slow payback', 'Product content works from week one.'],
          ['Hard to measure', 'Reach, recall, pipeline. Tracked monthly.'],
          ['No time', 'We run it. You show up.'],
          ['Inconsistency', 'A weekly rhythm, built for you.'],
        ],
      },
    ],
  },
  {
    id: '08',
    title: 'One step at a time',
    blocks: [
      {
        kind: 'list',
        title: 'One step at a time',
        items: [
          'Product videos and testimonials',
          'Educational LinkedIn content and the brand film',
          'High-end creative',
        ],
      },
    ],
  },
  {
    id: '09',
    title: 'Step 1',
    blocks: [
      {
        kind: 'list',
        title: 'Step 1',
        hover: true,
        items: [
          [
            'Product videos',
            'An anthology — one film per product, service or pain point. Each service can be translated into a creative, and becomes an asset in the communication of the company. Quality and originality are kept at the highest standard.',
            still(11, 1010, 567, 'A terrain map, threats marked in red'),
          ],
          [
            'Testimonials',
            'Testimonials are arguably the single most effective form of persuasion for B2B sales, and a paramount asset in every business communication.',
            still(13, 1011, 540, 'A customer, speaking to camera'),
          ],
        ],
      },
    ],
  },
  {
    id: '10',
    title: 'Step 2',
    blocks: [
      {
        kind: 'list',
        title: 'Step 2',
        hover: true,
        items: [
          [
            'Educational LinkedIn content',
            'Educating the audience is an indirect, long-term way to convert it: easily shareable content that provides value without a specific ask. It works incredibly well for simplifying complex ideas into small, digestible pieces. Founder-led educational content works best.',
            still(14, 686, 540, 'A founder talking to a microphone'),
          ],
          [
            'The brand film',
            'A brand film encapsulates the values, mission and people behind the organisation. It starts with the why and the existing problem, and moves into how that problem is solved through the ideas and practices of the company. The brand story is told through the voice of the founder and the team, and must be personal and honest.',
            still(10, 1444, 804, 'A founder, mid-sentence'),
          ],
        ],
      },
    ],
  },
  {
    id: '11',
    title: 'Step 3',
    blocks: [
      {
        kind: 'list',
        title: 'Step 3',
        hover: true,
        items: [
          [
            'Hero film',
            'Mind the hack. The world is familiar with the London Underground’s “Mind the gap” — which happens, intentionally or not, to be the company name. The hero creative leans into that familiarity, with a campaign that addresses a danger much like falling into the tracks, but for businesses instead. Getting hacked.',
            still(2, 898, 673, 'Towers seen from the pavement'),
          ],
        ],
      },
    ],
  },
  {
    id: '12',
    title: 'What we need from you',
    blocks: [
      {
        kind: 'text',
        lines: ['One shoot day. One hour a month. We handle the rest.'],
      },
    ],
  },
  {
    id: '13',
    title: 'Proof',
    blocks: [
      {
        kind: 'list',
        title: 'Proof',
        items: [
          [
            'Scytáles',
            'Started with product, then built creatives. Same path.',
          ],
        ],
      },
    ],
  },
  {
    id: '14',
    title: 'What success looks like',
    nav: 'Success',
    blocks: [
      {
        kind: 'list',
        title: 'What success looks like',
        items: [
          'Reach beyond Greece',
          'Message recall',
          'Pipeline from target accounts',
        ],
      },
    ],
  },
  {
    id: '15',
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
