import type { Chapter, Credit, Plate } from '../2000/deck';

/** Stills lifted from the presentation, numbered in the order they appear. */
const SIZES: Record<number, [number, number]> = {
  1: [1017, 573],
  2: [898, 673],
  3: [690, 288],
  4: [536, 223],
  5: [386, 256],
  6: [487, 223],
  7: [386, 204],
  8: [611, 423],
  9: [271, 203],
  10: [1444, 804],
  11: [1010, 567],
  12: [1011, 569],
  13: [1011, 540],
  14: [686, 540],
};

const img = (n: number, alt: string): Plate => {
  const [w, h] = SIZES[n] ?? [1920, 1080];
  return { src: `/mindthehack/${String(n).padStart(2, '0')}.jpg`, w, h, alt };
};

/**
 * Mind The Hack — a communications & demand strategy.
 *
 * Same measure and voice as ePay, but carried like Ford: `swap`, so the frame
 * never moves and each slide replaces the one before it. That makes the block
 * list literal — one block is one slide — so copy is merged into as few blocks
 * as it will bear, and a paragraph that belongs to a plate rides on it as a
 * caption rather than taking a slide of its own.
 *
 * The two competition slides are scatter plots on the page. A landing page has
 * no axes to hang them on, so each becomes the reading the plot was drawn to
 * make — the position stated rather than pointed at.
 */
export const chapters: Chapter[] = [
  {
    id: '01',
    title: 'Mind The Hack',
    blocks: [
      { kind: 'lead', text: 'Mind The Hack' },
      {
        kind: 'text',
        lines: [
          'A communications and demand strategy for Mind The Hack.',
          'Prepared by ThirdKind — July 2026.',
        ],
      },
    ],
  },
  {
    id: '02',
    title: 'The problem',
    blocks: [
      {
        kind: 'text',
        lines: ['Strong product.', 'Quiet, unclear story.'],
      },
    ],
  },
  {
    id: '03',
    title: 'The goal',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Global expansion.',
          'From a strong Greek player to an internationally recognised category name in one to two years.',
        ],
      },
    ],
  },
  {
    id: '04',
    title: 'The timing',
    blocks: [
      {
        kind: 'list',
        title: 'Regulation is a forced buying moment.',
        items: [
          [
            'NIS2',
            'First compliance audit due 30 June 2026. Boards and CEOs are now personally liable.',
          ],
          [
            'DORA',
            'Already enforceable. Financial firms must run real attack testing.',
          ],
          [
            'EU AI Act',
            'Obligations tightening through 2026–27. High-risk timelines are still moving; watch this space.',
          ],
        ],
      },
    ],
  },
  {
    id: '05',
    title: 'The competition',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Geographically, the category is owned by the heavily funded: Pentera, Cymulate, XM Cyber and Horizon3 out of the US and Israel, with Picus on the line between.',
          'Europe and the Gulf are thinly held — Cytomate out of Qatar, and Mind The Hack as the regional challenger.',
        ],
      },
      {
        kind: 'list',
        title: 'As it communicates',
        items: [
          [
            'Product-led, strong craft',
            'Pentera and Horizon3 make the work well and talk only about the product.',
          ],
          [
            'Generic, low craft',
            'Cymulate, Picus, XM Cyber and Cytomate — the bulk of the field, saying the same thing the same way.',
          ],
          [
            'Story-led, strong craft',
            'Empty. This is the corner Mind The Hack can take.',
          ],
        ],
      },
    ],
  },
  {
    id: '06',
    title: 'Audience',
    blocks: [
      {
        kind: 'text',
        lines: [
          'The CISO who wants to sleep at night.',
          'The board that fears personal liability.',
          'The analyst who is drowning in noise.',
        ],
      },
    ],
  },
  {
    id: '07',
    title: 'The honest gaps',
    blocks: [
      {
        kind: 'list',
        title: 'The honest gaps',
        items: [
          'A fragmented message',
          'Almost no awareness abroad',
          'Some branding, but no story',
          'No demand infrastructure',
          'One founder carrying the brand',
          'No marketing function, yet',
        ],
      },
    ],
  },
  {
    id: '08',
    title: 'Move one',
    blocks: [
      {
        kind: 'list',
        title: 'Unify the message.',
        items: [
          ['Before', '“The Exposure-Decision Platform”'],
          [
            'After',
            'Breach that never happened. Exposure validation, guarded by hackers, always.',
          ],
        ],
      },
    ],
  },
  {
    id: '09',
    title: 'Move two',
    blocks: [
      {
        kind: 'list',
        title: 'Build the demand engine.',
        items: [
          'Main creative',
          'Brand video',
          'Platform video',
          'Educational content',
          'Testimonials',
          'Product, service and other creatives',
        ],
      },
    ],
  },
  {
    id: '10',
    title: 'Move three',
    blocks: [
      {
        kind: 'text',
        lines: ['Distribute.', 'Reach. Qualified pipeline. Faster cycles.'],
      },
    ],
  },
  {
    id: '11',
    title: 'Think like a storyteller',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Think like a storyteller.',
          'You cannot bore people into buying.',
        ],
      },
    ],
  },
  {
    id: '12',
    title: 'The main creatives',
    blocks: [
      {
        kind: 'list',
        title: 'The main creatives',
        items: ['A flagship hero film', 'Brand film', 'Platform film'],
      },
      {
        kind: 'full',
        image: img(1, 'An office block, lit up after hours'),
        caption:
          'The hero film is not a tool whose results can be measured directly. It is a creative, inviting view of the world of Mind The Hack — a piece of work that is easily shareable, memorable and attention-grabbing. Its main purpose is awareness.',
      },
    ],
  },
  {
    id: '13',
    title: 'The idea',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Mind the hack.',
          'The world is familiar with the London Underground’s “Mind the gap” — which happens, intentionally or not, to be the company name.',
          'The hero creative leans into that familiarity, with a campaign that addresses a danger much like falling into the tracks, but for businesses instead. Getting hacked.',
        ],
      },
      { kind: 'full', image: img(2, 'Towers seen from the pavement') },
      {
        kind: 'mosaic',
        images: [
          img(3, 'A woman on an escalator, late'),
          img(8, 'Glass and concrete, straight up'),
          img(4, 'A man under a skylight'),
          img(6, 'A window cleaner on a high façade'),
          img(5, 'A figure against tower blocks'),
          img(7, 'A rope access worker, over the edge'),
          img(9, 'Someone stepping into the air'),
        ],
      },
    ],
  },
  {
    id: '14',
    title: 'Brand film',
    blocks: [
      {
        kind: 'text',
        lines: [
          'A brand film encapsulates the values, mission and people behind the organisation. It starts with the why and the existing problem, and moves into how that problem is solved through the ideas and practices of the company.',
          'The brand story is told through the voice of the founder and the team, and must be personal and honest.',
        ],
      },
      { kind: 'full', image: img(10, 'A founder, mid-sentence') },
    ],
  },
  {
    id: '15',
    title: 'The platform film',
    blocks: [
      {
        kind: 'full',
        image: img(11, 'A terrain map, threats marked in red'),
        caption:
          'The platform film communicates simply and effectively the use and complexity of the core product and the problems it solves. It is designed to capture the attention and curiosity of prospects and direct them to the landing page.',
      },
    ],
  },
  {
    id: '16',
    title: 'The content creatives',
    blocks: [
      {
        kind: 'list',
        title: 'The content creatives',
        items: [
          'An anthology — one film per product, service or pain point',
          'Testimonial films',
          'Educational social cut-downs',
          'Thought leader posts',
        ],
      },
      {
        kind: 'full',
        image: img(12, 'A product, shown on screen'),
        caption:
          'Each service can be translated into a creative. This helps sales conversions and acts as an additional creative asset in the communication strategy of the company. Quality and originality are kept at the highest standard.',
      },
      {
        kind: 'full',
        image: img(13, 'A customer, speaking to camera'),
        caption:
          'Testimonials are arguably the single most effective form of persuasion for B2B sales, and a paramount asset in every business communication.',
      },
      {
        kind: 'full',
        image: img(14, 'A founder talking to a microphone'),
        caption:
          'Educating the audience is an indirect, long-term way to convert it: easily shareable content that provides value without a specific ask. It works incredibly well for simplifying complex ideas into small, digestible pieces. Founder-led educational content works best.',
      },
    ],
  },
  {
    id: '17',
    title: 'Example links',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Main creative — __youtube.com/watch?v=FDNkDBNR7AM|https://www.youtube.com/watch?v=FDNkDBNR7AM__',
          'Brand video — __youtube.com/watch?v=VQBlTtpjukA|https://www.youtube.com/watch?v=VQBlTtpjukA__',
          'The platform creative — __youtube.com/watch?v=CmtfNp-e7VE|https://www.youtube.com/watch?v=CmtfNp-e7VE__',
          'Educational creative — __youtube.com/watch?v=rKV5JcALQoQ|https://www.youtube.com/watch?v=rKV5JcALQoQ__',
          'Films per sector — __thirdkindcreative.com/work/scytales-2|https://www.thirdkindcreative.com/work/scytales-2__',
          'Service-based creative — __vimeo.com/1174819047|https://vimeo.com/1174819047/730e2ca400?fl=tl&fe=ec__',
          'Testimonials and client stories — __youtube.com/watch?v=muMLwfngNVk|https://www.youtube.com/watch?v=muMLwfngNVk__',
        ],
      },
    ],
  },
  {
    id: '18',
    title: 'What success looks like',
    blocks: [
      {
        kind: 'list',
        title: 'What success looks like',
        items: [
          ['Global', 'Geographic spread of engagement beyond Greece.'],
          ['Clarity', 'Message recall.'],
          ['Reach', 'Reach into target accounts, and branded-search lift.'],
        ],
      },
    ],
  },
  {
    id: '19',
    title: 'Timeline',
    blocks: [
      {
        kind: 'list',
        title: 'Timeline',
        items: [
          [
            'Q1 — The content engine',
            'Testimonials, educational content, brand film and platform film.',
          ],
          [
            'Q2 — Hero film',
            'Filming the hero creative, and finalising the Q1 creatives.',
          ],
          [
            'Q3 — Creatives',
            'Breaking down each service and product into small, digestible creatives.',
          ],
          ['Q4 — Repetition', 'Measure and repeat.'],
        ],
      },
    ],
  },
  {
    id: '20',
    title: 'Distribution',
    blocks: [
      {
        kind: 'list',
        title: 'Distribution',
        items: [
          [
            'Post weekly',
            'The founder and the company share the educational cut-downs and content creatives consistently, in public.',
          ],
          [
            'Target the right accounts',
            'Paid, account-based: the specific CISOs and boards we want, not a broad audience.',
          ],
          [
            'One link, one next step',
            'Every film points to a single landing page.',
          ],
          [
            'Measure and tighten',
            'Watch what lands, cut more of it, drop what doesn’t. The engine improves every month.',
          ],
        ],
      },
    ],
  },
  {
    id: '21',
    title: 'Young but strong',
    blocks: [
      {
        kind: 'list',
        title: 'You don’t need a big agency. You need the right one.',
        items: [
          [
            'Vehicle e-wallet — Scania',
            'Voted the most important project at the Hackathon. The film was distributed internally at Traton Group and is used to push the funding of the e-wallet technology.',
          ],
          [
            'HR Christmas — UP Hellas',
            '30,000 views on YouTube, with no ad spend.',
          ],
          [
            'ID Verification — Scytáles',
            'An awareness campaign for four of the core groups their technology protects.',
          ],
        ],
      },
    ],
  },
  {
    id: '22',
    title: 'Why us',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Because of the oversaturation of the market and the constant bombardment of information, the moment we perceive an ad, our brain shuts off.',
          'The way we work at ThirdKind is to try not to make ads, but to entertain and educate.',
          'So we can invite our audience to opt in, instead of opting out.',
        ],
      },
    ],
  },
  {
    id: '23',
    title: 'Up next',
    blocks: [
      {
        kind: 'list',
        title: 'Up next',
        items: [
          ['Align', 'Agree on the direction and the priorities.'],
          ['Kick off Q1', 'Start up the creative engine.'],
          ['Build the team', 'Lock the people around this account.'],
          ['First creatives live', 'Build momentum.'],
        ],
      },
    ],
  },
  {
    // Off the index, the way the other decks close.
    id: '24',
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
