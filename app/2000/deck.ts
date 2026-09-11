/**
 * The 2000 deck.
 *
 * A presentation template rendered as a single landing page rather than a
 * stack of slides. `blocks` follow the slide order exactly — image order is
 * the order of appearance and must not be reshuffled; the files in
 * /public/2000 are numbered for exactly that.
 *
 * Text blocks carry `lines`, not a paragraph: each line reveals on its own as
 * the block scrolls into view.
 */

export type Plate = {
  src: string;
  /** Intrinsic pixel size, so the browser reserves the right box. */
  w: number;
  h: number;
  alt: string;
};

export type Row = readonly [label: string, value: string];

export type ListItem = string | readonly [term: string, note: string];

export type Block =
  | { kind: 'full'; image: Plate; caption?: string }
  | { kind: 'pair'; images: [Plate, Plate]; caption?: string }
  | { kind: 'plate'; image: Plate }
  /** Its own full-height section. `__word__` marks an underlined run. */
  | { kind: 'text'; lines: string[] }
  /**
   * The opening of a deck, centred, which fades out instead of moving away.
   * A word, or the recipient's mark set the same way.
   */
  | { kind: 'lead'; text: string; image?: undefined }
  | { kind: 'lead'; image: Plate; text?: undefined }
  /**
   * A standfirst over an itemised run — what a text slide cannot hold.
   *
   * A plain item flows as a tag. One given a note is a thing with something
   * to say about it, so the run sets them out as terms instead.
   */
  | { kind: 'list'; title?: string; items: ListItem[] }
  /** A piece of music, named and playable. */
  | { kind: 'sound'; src: string; title: string; artist: string }
  /** A film, in the site's own player. */
  | { kind: 'film'; vimeoId: string; title: string; caption?: string }
  /** A priced breakdown: rows, then the total set apart. */
  | {
      kind: 'table';
      title: string;
      caption?: string;
      rows: Row[];
      total: Row;
    }
  | { kind: 'credits'; image: Plate };

export type Credit = {
  name: string;
  role: string;
  url: string;
  href: string;
};

export type Chapter = {
  /** Anchor id for the section; the rail links to it. */
  id: string;
  title: string;
  /** Off the index — the section still renders, it just isn't listed. */
  unlisted?: boolean;
  blocks: Block[];
};

const img = (n: string, w: number, h: number, alt: string): Plate => ({
  src: `/2000/${n}`,
  w,
  h,
  alt,
});

export const chapters: Chapter[] = [
  {
    id: '01',
    title: 'Opening',
    blocks: [
      // 1
      {
        kind: 'full',
        image: img('1.jpg', 5504, 4206, 'Figures leaping from a sea wall'),
      },
    ],
  },
  {
    id: '02',
    title: 'The premise',
    blocks: [
      // 2
      {
        kind: 'text',
        lines: [
          'Brands have become standardized, maybe too glossy, and communication seems typical and familiar.',
        ],
      },
      // 3
      { kind: 'text', lines: ['Only a few dare to challenge and provoke.'] },
      // 4
      {
        kind: 'text',
        lines: [
          'Imagery has the power to do so, extraordinary in a world of ordinary.',
        ],
      },
      // 5
      {
        kind: 'text',
        lines: [
          'This campaign is founded on the basis of visually striking moments and inspirations designed to provoke emotions of lust, beauty, sexuality, and peace.',
        ],
      },
    ],
  },
  {
    id: '03',
    title: 'The imagery',
    blocks: [
      // 6
      {
        kind: 'pair',
        images: [
          img('2.jpg', 1792, 2368, 'Portrait half-submerged in dark water'),
          img('3.jpg', 1536, 2752, 'Inverted figure beneath the surface'),
        ],
      },
      // 7
      {
        kind: 'pair',
        images: [
          img('4.jpg', 2560, 1664, 'Two figures suspended over the sea'),
          img('5.jpg', 1792, 2400, 'A hand meeting still water'),
        ],
      },
      // 8
      {
        kind: 'full',
        image: img('6.jpg', 5504, 3072, 'White dress caught in coastal wind'),
      },
      // 9
      {
        kind: 'pair',
        images: [
          img('7.jpg', 2048, 2048, 'Low sun banding across shallow water'),
          img('8.jpg', 1598, 1946, 'Portrait behind shadowed hands'),
        ],
      },
      // 10
      {
        kind: 'pair',
        images: [
          img('9.jpg', 2304, 1842, 'A pool held in the dunes'),
          img('10.jpg', 1344, 768, 'A body mid-air above the water'),
        ],
      },
      // 11
      {
        kind: 'pair',
        images: [
          img('11.jpg', 1232, 1374, 'Concrete pergola against the horizon'),
          img('12.jpg', 2336, 1824, 'Light pooled in a sand crater'),
        ],
      },
      // 12
      {
        kind: 'pair',
        images: [
          img('13.jpg', 1792, 2400, 'A face carved in pale stone'),
          img('14.jpg', 1792, 2400, 'Hair thrown across a face'),
        ],
      },
      // 13
      {
        kind: 'full',
        image: img('15.jpg', 2560, 1664, 'Two figures leaping into open sea'),
      },
      // 14
      {
        kind: 'full',
        image: img('16.jpg', 2528, 1696, 'A body floating in bright water'),
      },
      // 15
      {
        kind: 'full',
        image: img('17.jpg', 3388, 2444, 'Linen and limbs against warm rock'),
      },
      // 16
      {
        kind: 'pair',
        images: [
          img('18.jpg', 1136, 1286, 'Profile with eyes closed'),
          img('19.jpg', 1138, 1286, 'A figure standing chest-deep in water'),
        ],
      },
      // 17
      {
        kind: 'plate',
        image: img('20.jpg', 1220, 1712, 'A single fractured stone'),
      },
      // 18
      {
        kind: 'pair',
        images: [
          img('21.jpg', 1984, 2144, 'Backlit hair against a bleached sky'),
          img('22.jpg', 1064, 1200, 'A figure crossing a white cliff face'),
        ],
      },
      // 19
      {
        kind: 'full',
        image: img('23.jpg', 1530, 1644, 'Sequins refracting under water'),
      },
    ],
  },
  {
    id: '04',
    title: 'The approach',
    blocks: [
      // 20
      {
        kind: 'text',
        lines: [
          'Filmed at 2000 frames per second, every frame will be meticulously crafted and composed.',
        ],
      },
      // 21
      {
        kind: 'text',
        lines: [
          'Our approach is more like photographers capturing a __moment__ in time.',
        ],
      },
      // 22
      {
        kind: 'text',
        lines: [
          'The combination of those moments makes the whole. It makes our story. Our dream.',
          '*Although we care more for the feeling and the moment than the story itself.',
        ],
      },
      // 23
      {
        kind: 'text',
        lines: [
          'Like a summer fever. A summer feeling. The feeling we all dream of.',
        ],
      },
    ],
  },
  {
    id: '05',
    title: 'The team',
    blocks: [
      // 24 + 25
      {
        kind: 'full',
        caption: 'The team.',
        image: img('24.jpeg', 2574, 1598, 'Chris and Goulielmos on location'),
      },
      // 26
      {
        kind: 'text',
        lines: [
          'Chris and Goulielmos are close collaborators and share the belief that imagery holds a strong power and is the most effective tool to communicate.',
          '“We live to create beautiful imagery, its our drug”',
        ],
      },
      // 27
      {
        kind: 'pair',
        caption: 'culture',
        images: [
          img('25.jpeg', 782, 978, 'Silhouette against the sea light'),
          img('26.jpeg', 1212, 1620, 'Walking the rocks above the water'),
        ],
      },
      // 28
      {
        kind: 'text',
        lines: [
          'Mediterranean culture is a key factor in the heart of this campaign. Goulielmos is an Athens-born and raised kid, with every summer spent on the Greek Islands, and Chris comes from a Greek mother and a British father. He was born and raised on the island of Mallorca in the city of Deià.',
        ],
      },
      // 29
      {
        kind: 'text',
        lines: [
          'One of their latest project together is __Roses & Cigarettes|https://www.youtube.com/watch?v=nd75XUhVU_Q&t=116s__',
        ],
      },
    ],
  },
  {
    id: '06',
    title: 'Credits',
    unlisted: true,
    blocks: [
      // 30
      {
        kind: 'credits',
        image: img('27.jpeg', 1338, 1454, 'Behind the camera on set'),
      },
    ],
  },
];

export const credits: Credit[] = [
  {
    name: 'Chris Hudson',
    role: 'Cinematographer',
    url: 'c-hudson.com',
    href: 'https://c-hudson.com',
  },
  {
    name: 'Goulielmos Dermon',
    role: 'Director',
    url: 'thirdkindcreative.com',
    href: 'https://thirdkindcreative.com',
  },
];
