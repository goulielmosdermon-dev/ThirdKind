import type { Chapter, Credit, Plate } from '../2000/deck';

/** Reference stills, numbered in the order they were handed over. */
const SIZES: Record<number, [number, number]> = {
  1: [1422, 792],
  3: [1848, 882],
  5: [1786, 996],
  6: [2138, 1040],
  7: [1688, 708],
  9: [2192, 1308],
  10: [1948, 1100],
  11: [1694, 954],
  12: [1698, 1020],
  13: [1370, 1540],
  14: [2972, 1270],
  17: [2058, 1152],
  18: [2306, 1306],
  19: [2160, 1216],
  21: [2674, 1116],
  22: [2122, 880],
  23: [2082, 1306],
  24: [2374, 1334],
  25: [2230, 1348],
  26: [1700, 1670],
  28: [2772, 1156],
  30: [1940, 1264],
  31: [1348, 986],
};

const img = (n: number, alt: string): Plate => {
  const [w, h] = SIZES[n] ?? [1920, 1080];
  return { src: `/ePay/${String(n).padStart(2, '0')}.jpg`, w, h, alt };
};

/**
 * The epay proposal.
 *
 * Same deck as 2000 — one page, one measure, one voice — carrying a proposal
 * rather than a body of work. Rendering, the index, the pinned runs and the
 * reveals all come from DeckView; this file is only the slides, in order.
 *
 * Plates are added as they arrive: an image block dropped into a chapter
 * below is all it takes.
 */
export const chapters: Chapter[] = [
  {
    id: '01',
    title: 'Proposal',
    blocks: [
      {
        kind: 'lead',
        image: {
          src: '/ePay/logo.png',
          w: 4406,
          h: 1215,
          alt: 'epay',
        },
      },
      {
        kind: 'text',
        lines: [
          'ThirdKind Creative proposes the production of a series of six customer testimonial films, each filmed at a different location, supported by cinematic B-roll that captures the people, environments and real-world use of epay’s services.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'The aim is a cohesive set of films that feel credible, human and visually consistent — six finished pieces that work on their own and together as one campaign.',
        ],
      },
      { kind: 'full', image: img(3, 'Open water, arms wide on deck') },
    ],
  },
  {
    id: '02',
    title: 'The production',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Six customer testimonial films.',
          'Each testimonial is produced as an individual film, with a consistent visual language across the campaign.',
        ],
      },
      {
        kind: 'pair',
        images: [
          img(9, 'A customer, mid-sentence'),
          img(10, 'A customer talking, at home'),
        ],
      },
      {
        kind: 'list',
        title: 'The production includes',
        items: [
          'Creative direction',
          'Pre-production and production planning',
          'Interview preparation and direction',
          'Filming at 6 separate locations',
          'Professional camera, lighting and sound',
          'Cinematic B-roll at each location',
          'On-location production crew',
          'Editing of 6 final testimonial films',
          'Colour grading',
          'Sound design and mixing',
          'Titles and basic motion graphics',
          'Final delivery in agreed formats',
        ],
      },
      {
        kind: 'pair',
        images: [
          img(12, 'A customer in his own workplace'),
          img(13, 'A customer seated, listening'),
        ],
      },
      { kind: 'full', image: img(14, 'An interview set up outdoors') },
    ],
  },
  {
    id: '03',
    title: 'B-roll',
    blocks: [
      {
        kind: 'text',
        lines: ['Each location is treated as more than an interview setup.'],
      },
      {
        kind: 'text',
        lines: [
          'We film around the customer — their environment, their people, their work — and cut it through the interview, so each story is carried as much by what is seen as by what is said.',
        ],
      },
      { kind: 'full', image: img(21, 'A card, a terminal, a coffee') },
      {
        kind: 'pair',
        images: [
          img(23, 'A counter from above, mid-transaction'),
          img(31, 'A terminal waiting for a card'),
        ],
      },
      {
        kind: 'pair',
        images: [
          img(22, 'A printed ticket, handed over'),
          img(7, 'A payment made without looking up'),
        ],
      },
      { kind: 'full', image: img(30, 'A counter laid out for the morning') },
    ],
  },
  {
    id: '04',
    title: 'Visual approach',
    blocks: [
      {
        kind: 'text',
        lines: ['The films are natural, contemporary and cinematic.'],
      },
      {
        kind: 'text',
        lines: [
          'The focus is on genuine customer experiences rather than traditional corporate interviews. Interviews are directed to feel conversational and authentic, while the B-roll carries the visual storytelling around each customer’s story.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'All six films share one production and post-production language, so that they work together as a single campaign.',
        ],
      },
      {
        kind: 'pair',
        images: [
          img(11, 'A customer in half-light'),
          img(26, 'A welcome across a counter'),
        ],
      },
      { kind: 'full', image: img(24, 'Serving a customer at the window') },
      {
        kind: 'pair',
        images: [
          img(17, 'Working late, by the light of a screen'),
          img(18, 'A payment taken at a kitchen table'),
        ],
      },
    ],
  },
  {
    id: '05',
    title: 'Deliverables',
    blocks: [
      {
        kind: 'list',
        title: 'Deliverables',
        items: ['6 × finished customer testimonial films'],
      },
      {
        kind: 'text',
        lines: [
          'Final specifications and durations to be agreed prior to production.',
        ],
      },
      {
        kind: 'pair',
        images: [
          img(19, 'Hands at a laptop, paying'),
          img(5, 'Behind the counter of a shop'),
        ],
      },
      { kind: 'full', image: img(6, 'A room full of people, mid-service') },
    ],
  },
  {
    id: '06',
    title: 'Similar work',
    blocks: [
      {
        kind: 'film',
        vimeoId: '1212308055',
        title: 'ThirdKind Creative — selected work',
        caption: 'Similar work from ThirdKind.',
      },
    ],
  },
  {
    id: '07',
    title: 'Single testimonial',
    blocks: [
      {
        kind: 'table',
        title: 'Single testimonial',
        rows: [
          ['Creative & pre-production', '€600'],
          // Director, cinematography, lighting, 1st AC and sound, read as the
          // one line they are on the day.
          ['Production', '€4,100'],
          ['Equipment', '€800'],
          ['Post-production', '€1,500'],
          ['Travel & logistics', '€500'],
        ],
        total: ['Total', '€7,500 + VAT'],
        caption:
          'Production and post-production for one testimonial at one location. Actor fees are not included in this quote.',
      },
    ],
  },
  {
    id: '08',
    title: 'Six testimonials',
    blocks: [
      {
        kind: 'table',
        title: 'Six testimonials',
        rows: [
          // The saving sits where it is actually made — one brief, one crew,
          // one continuous hire. Post is six times the single-film figure
          // exactly: an edit, a grade and a mix do not get cheaper by the
          // half-dozen, and saying so is what makes the rest of it credible.
          ['Creative & pre-production', '€3,500'],
          ['Production', '€19,500'],
          ['Equipment', '€3,500'],
          ['Post-production', '€9,000'],
          ['Travel & logistics', '€2,500'],
        ],
        total: ['Total', '€38,000 + VAT'],
        caption:
          'Production and post-production for all six testimonials across six separate locations. The six-film package is a campaign rate, based on the efficiencies of producing the projects as one coordinated production. Actor fees are not included in this quote.',
      },
      {
        kind: 'list',
        title: 'Not included',
        items: [
          'Actor fees',
          'Subtitling and language versions beyond the delivered cut',
          'Revisions beyond two rounds per film',
        ],
      },
    ],
  },
  {
    id: '09',
    title: 'Scheduling',
    blocks: [
      {
        kind: 'text',
        lines: [
          'Production dates and the final delivery schedule are agreed with epay following approval of the proposal.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'A detailed production schedule is prepared during pre-production, covering interviewees, locations, logistics, filming requirements and deliverables.',
        ],
      },
      {
        kind: 'text',
        lines: [
          'Following approval, ThirdKind Creative begins pre-production and coordinates the production schedule with the epay team.',
        ],
      },
      {
        kind: 'pair',
        images: [
          img(25, 'A lounge between departures'),
          img(28, 'A window seat, somewhere at sea'),
        ],
      },
      { kind: 'full', image: img(1, 'Open sea, and a ship going somewhere') },
    ],
  },
  {
    // Off the index, the way 2000 closes on its credits. It becomes a
    // `credits` block — plate on the left, names down the right — as soon as
    // there is a still to carry it.
    id: '10',
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
