import { chapters } from '../VIVA/deck';
import references from './references.json';

import type { Plate } from '../2000/deck';

export type Story = {
  title: string;
  tag?: string;
  tagHref?: string;
  screenplay?: boolean;
  paragraphs: string[];
};
export type CostLine = { label: string; amount: number };
export type CostGroup = { title: string; lines: CostLine[] };
export type Company = {
  id: string;
  name: string;
  quote: string[];
  proposalImage?: Plate;
  observations: string[];
  stories?: Story[];
  references: Plate[];
  costBook?: CostGroup[];
  process?: string[];
  results?: string[];
};

export const vivaStories: Story[] = chapters.flatMap((chapter) =>
  chapter.blocks.flatMap((block) =>
    block.kind === 'copy' &&
    ['Sleep Tight', 'The Taxi Driver', 'The Tip'].includes(block.title ?? '') &&
    block.body
      ? [
          {
            title: block.title!,
            tag: block.tag,
            paragraphs: block.body.split('\n\n'),
          },
        ]
      : [],
  ),
);
export const vivaReferences = chapters.flatMap((chapter) =>
  chapter.blocks.flatMap((block) =>
    block.kind === 'justified' ? block.images : [],
  ),
);

export const companies: Company[] = [
  {
    id: 'viva',
    name: 'VIVA',
    quote: [
      'ThirdKind can create a series of emotional films, each centered around VIVA’s core products. We can also improve the storytelling and production quality of testimonials and product videos.',
    ],
    observations: [
      'Low production quality and corporate content.',
      'Lack of emotional communication.',
      'Low-quality product videos.',
      'No video creatives beyond demos and product content.',
      'Testimonials could feel less staged, with higher production quality and more emotional impact.',
    ],
    stories: vivaStories,
    references: vivaReferences,
  },
  {
    id: 'more-com',
    name: 'MORE.COM',
    quote: [
      'With more.com, ThirdKind would produce a short film. A complete fictional story with characters and a plot centered around their product, without focusing directly on it — instead, focusing on the moments and connections between characters.',
      'We would create a cinema screening as an event to launch the film, followed by a digital release, with the cinema event providing the first wave of promotional material.',
    ],
    observations: [
      'more.com promotes art — film, music, and more. This approach fits naturally within its communication.',
      'Three interconnected stories, released as separate creatives online and as a single film on the silver screen.',
    ],
    stories: [
      {
        title: 'Story one / Stella',
        paragraphs: [
          'Stella is 22 and has never kissed a boy (some would say too old and too late…). She is also a massive Fontaines D.C. fan, a band playing in her city, Athens, in less than three months. A concert she can’t miss. On her way back from the concert, she accidentally bumps into someone who might lead to her first kiss.',
        ],
      },
      {
        title: 'Story two / Aris',
        paragraphs: [
          'Aris is an avid filmmaker but lives a very lonely life. His main companions are films, their characters, and the owner of the local cinema. His life changes when, on his way to the cinema, he accidentally bumps into Stella, who’s on her way back from her favourite concert.',
        ],
      },
      {
        title: 'Story three / Together',
        paragraphs: [
          'Stella and Aris, two very different people, connect through their love of art.',
        ],
      },
    ],
    references: references['more-com'],
  },
  {
    id: 'medicine-du-monde',
    name: 'MEDICINE DU MONDE',
    quote: [
      'We’d like to play here with the power of moving images. Instead of a traditional high-concept campaign, ThirdKind creates still frames, captured in extreme slow motion.',
    ],
    observations: [
      'A campaign of five films — five frames, thirty seconds each.',
      'Each frame is a complete story of its own, like a moving painting.',
    ],
    references: references['medicine-du-monde'],
  },
  {
    id: 'ag-design',
    name: 'AG DESIGN',
    quote: [
      'ThirdKind proposes a brand video that shows the culture and thinking behind the agency. Since the team works remotely, we can create bespoke team-member profiles and stories: a video for each person, filmed in their own space or a cozy studio.',
    ],
    observations: [
      'The team works remotely, with individual spaces and stories to explore.',
      'The videos can be used separately as material, or merged into a single brand video that captures the core spirit of the agency.',
    ],
    references: references['ag-design'],
  },
  {
    id: 'cardinal',
    name: 'CARDINAL',
    quote: [
      'ThirdKind can create extremely tasty and provoking food content for Cardinal’s own product line, and a series of emotional films — twenty-to-thirty-second shorts — each centered around core Cardinal products.',
    ],
    observations: [
      'Outdated cooking content.',
      'Low on creativity and emotion.',
    ],
    references: references.cardinal,
  },
  {
    id: 'abek',
    name: 'ABEK',
    quote: [
      'ABEK has a series of products we can communicate creatively. We also see a big opportunity for the corporate communication of the company itself — two very separate things.',
    ],
    observations: [
      'Some of its brands could benefit from more creative and emotional communication:',
      'CHOCO LULU',
      'ESPRESSO',
      'SUPER FOODS',
      'QUALITA UNICA',
    ],
    references: [],
  },
];
