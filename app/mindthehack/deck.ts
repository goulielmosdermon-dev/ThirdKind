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
 * Twenty slides, carried like Ford: `swap`, so the frame never moves and
 * each slide replaces the one before it. One block is one slide.
 */
export const chapters: Chapter[] = [
  {
    id: '01',
    title: 'Mind The Hack',
    nav: 'Mind the Hack',
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
        scale: 0.5,
      },
    ],
  },
  {
    id: '02',
    title: 'The Problem',
    blocks: [
      {
        kind: 'list',
        title: 'Great product. Silent brand.',
        lede: "You're doing everything yourself.",
        items: [
          'No video',
          'No educational content',
          'No product content',
          'A quiet LinkedIn',
        ],
        squares: ['No trust', 'No strategy'],
      },
      {
        kind: 'mosaic',
        images: [
          {
            src: '/work/mindthehack/01-hellenic-team.png',
            w: 1024,
            h: 570,
            alt: 'Hellenic Cyber Security Team — European Cybersecurity Challenge 2026',
          },
          {
            src: '/work/mindthehack/02-sifted-250.png',
            w: 1024,
            h: 1022,
            alt: 'Mind The Hack featured in the Sifted 250',
          },
          {
            src: '/work/mindthehack/03-dive-deeper.png',
            w: 1020,
            h: 1024,
            alt: 'This summer, we dive deeper. Into the cloud.',
          },
          {
            src: '/work/mindthehack/04-startupper.png',
            w: 1024,
            h: 570,
            alt: 'Why manage cybersecurity any other way',
          },
          {
            src: '/work/mindthehack/05-five-stops.png',
            w: 772,
            h: 1024,
            alt: 'Five stops. One question. Europe 2026.',
          },
          {
            src: '/work/mindthehack/06-ctf.png',
            w: 1024,
            h: 730,
            alt: 'CipherX CTF leaderboard',
          },
          {
            src: '/work/mindthehack/07-london.png',
            w: 1016,
            h: 1024,
            alt: 'Mind The Hack is heading to London',
          },
          {
            src: '/work/mindthehack/08-speaker.png',
            w: 1008,
            h: 1024,
            alt: 'Stavros Kirikos speaking at Infocom Security',
          },
          {
            src: '/work/mindthehack/09-pool.png',
            w: 466,
            h: 1024,
            alt: 'Working from a poolside sofa',
          },
        ],
      },
    ],
  },
  {
    id: '06',
    title: 'The Show Up',
    blocks: [
      {
        kind: 'list',
        title: 'The Show Up',
        hover: true,
        items: [
          [
            'Repetition',
            'Pair the brand with the moment of need, again and again. For a cybersecurity firm, that is the panic after a breach. Repeat it until the problem itself brings the brand to mind.',
            'arrows',
          ],
          [
            'Resemblance',
            "Look like the kind of company a buyer can safely choose: polished, confident work. Then one distinctive touch, so you don't blend with every competitor.",
            'square',
          ],
          [
            'Cause and effect',
            'Testimonials. They worked with us, and this happened — a story the buyer can repeat to their boss.',
            'flow',
          ],
        ],
      },
    ],
  },
  {
    id: '19',
    title: 'Why',
    blocks: [
      {
        kind: 'text',
        lines: [
          'We show up to create trust.',
          'We show up to create ease for the consumer to make a decision.',
        ],
      },
    ],
  },
  {
    id: '07',
    title: 'Cognitive ease',
    nav: 'Ease',
    blocks: [
      {
        kind: 'ease',
        center: 'Ease',
        from: [
          'Repeated experience',
          'Clear display',
          'Primed idea',
          'Good mood',
        ],
        to: ['Feels familiar', 'Feels true', 'Feels good', 'Feels effortless'],
      },
    ],
  },
  {
    id: '05',
    title: 'The Fundamentals',
    blocks: [
      {
        kind: 'list',
        title: 'The Fundamentals',
        items: [],
        squares: ['Educate', 'Entertain', 'Challenge'],
      },
    ],
  },
  {
    id: '10',
    title: 'One step at a time',
    blocks: [
      {
        kind: 'list',
        title: 'One step at a time',
        items: [],
        squares: [
          'Product videos and testimonials',
          'Educational LinkedIn content and the brand film',
          'High-End Creatives',
        ],
      },
    ],
  },
  {
    id: '11',
    title: 'Step 1',
    nav: 'The Three Steps',
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
    id: '12',
    title: 'Step 2',
    unlisted: true,
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
    id: '13',
    title: 'Step 3',
    unlisted: true,
    blocks: [
      {
        kind: 'list',
        title: 'Step 3',
        hover: true,
        items: [
          [
            'High-End Creatives',
            'Mind the hack. The world is familiar with the London Underground’s “Mind the gap” — which happens, intentionally or not, to be the company name. The hero creative leans into that familiarity, with a campaign that addresses a danger much like falling into the tracks, but for businesses instead. Getting hacked.',
            still(2, 898, 673, 'Towers seen from the pavement'),
          ],
        ],
      },
    ],
  },
  {
    id: '14',
    title: 'What We Need from You',
    blocks: [
      {
        kind: 'text',
        lines: [
          'One shoot day. One hour a month. We handle the rest.',
          'Educational content is better in-house: someone who knows the business.',
        ],
      },
    ],
  },
  {
    id: '18',
    title: 'B2B',
    blocks: [
      {
        kind: 'list',
        title: 'People make the purchase. Not the business.',
        items: [],
        squares: [
          'The buy is bigger',
          'The stake is personal',
          'They care more',
          'They have more to lose',
          'So it has to be exact',
        ],
      },
    ],
  },
  {
    id: '08',
    title: 'What this returns long-term',
    nav: 'The Returns',
    blocks: [
      {
        kind: 'list',
        title: 'What this returns long-term',
        items: [],
        accent: true,
        squares: [
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
    id: '09',
    title: 'The usual objections',
    nav: 'Objections',
    blocks: [
      {
        kind: 'list',
        title: 'The usual objections',
        boxed: true,
        accent: true,
        items: [
          ['Cost', 'Start small. Step one only.'],
          ['Slow payback', 'Product content works from week one.'],
          [
            'Hard to measure',
            'Some of the most effective things are the hardest to measure.',
          ],
          ['No time', 'We run it. You show up.'],
          ['Inconsistency', 'A weekly rhythm, built for you.'],
        ],
      },
    ],
  },
  {
    id: '04',
    title: 'Why Now?',
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
          axes: {
            top: 'Strong craft',
            bottom: 'Generic / low craft',
            left: 'Product-led',
            right: 'Story-led',
          },
          points: [
            { label: 'Pentera', x: -0.729, y: 0.751 },
            {
              label: 'Mind The Hack',
              x: 0.317,
              y: 0.739,
              mark: true,
              logo: { src: '/mindthehack/logo.svg', w: 1912, h: 345 },
            },
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
    id: '15',
    title: 'Proof',
    nav: 'Proof and Success',
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
      {
        kind: 'grid',
        cells: [
          {
            kind: 'film',
            vimeoId: '1162194421',
            title: 'Scytáles — Internal Sales',
            poster: {
              src: '/work/scytales/sales-1.png',
              w: 1446,
              h: 952,
              alt: 'Scytáles Internal Sales',
            },
          },
          {
            kind: 'film',
            vimeoId: '1212261799',
            title: 'Scytáles — Age Verification Connector',
            poster: {
              src: '/work/scytales/sales-2.png',
              w: 1920,
              h: 1080,
              alt: 'Scytáles Age Verification Connector',
            },
          },
          {
            kind: 'film',
            vimeoId: '1174801751',
            title: 'Scania — Vehicle E-Wallet',
            poster: {
              src: '/work/scania/header.png',
              w: 2242,
              h: 1256,
              alt: 'Scania Vehicle E-Wallet',
            },
          },
          {
            kind: 'film',
            vimeoId: '1212308055',
            title: 'epay — testimonial',
            poster: {
              src: '/work/epay-testimonial.jpg',
              w: 640,
              h: 360,
              alt: 'Customer testimonial',
            },
          },
          {
            kind: 'film',
            vimeoId: '1205498725',
            title: 'Scytáles identity — social',
            poster: {
              src: '/work/scytales-2/str-1.jpg',
              w: 5504,
              h: 3072,
              alt: 'Scytáles identity — social',
            },
          },
          {
            kind: 'film',
            vimeoId: '1205498724',
            title: 'Scytáles identity — alcohol',
            poster: {
              src: '/work/scytales-2/alc-3.jpg',
              w: 5504,
              h: 3072,
              alt: 'Scytáles identity — alcohol',
            },
          },
          {
            kind: 'film',
            vimeoId: '1205498726',
            title: 'Scytáles identity — gambling',
            poster: {
              src: '/work/scytales-2/gmb-3.jpg',
              w: 5504,
              h: 3072,
              alt: 'Scytáles identity — gambling',
            },
          },
          {
            kind: 'film',
            vimeoId: '1205498727',
            title: 'Scytáles identity — screen',
            poster: {
              src: '/work/scytales-2/sc-2.jpg',
              w: 5504,
              h: 3072,
              alt: 'Scytáles identity — screen',
            },
          },
        ],
      },
    ],
  },
  {
    id: '16',
    title: 'What success looks like',
    unlisted: true,
    blocks: [
      {
        kind: 'list',
        title: 'What success looks like',
        items: [],
        squares: [
          'Reach beyond Greece',
          'Message recall',
          'Pipeline from target accounts',
        ],
      },
    ],
  },
  {
    id: '17',
    title: 'thirdkindcreative.com',
    nav: 'ThirdKind',
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
