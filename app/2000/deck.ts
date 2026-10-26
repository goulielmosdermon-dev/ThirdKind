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
  /** A grade on the picture — grayscale, contrast — left off for a straight still. */
  grade?: string;
};

export type Row = readonly [label: string, value: string];

/** How a hover tag is drawn, when it should not be a pill. */
export type TagShape = 'arrows' | 'square' | 'flow';

/** One cell in a proof grid: a film with its poster, or a still. */
export type GridCell =
  | { kind: 'film'; vimeoId: string; title: string; poster?: Plate }
  | { kind: 'still'; image: Plate };

export type ListItem =
  | string
  | readonly [term: string, note: string]
  | readonly [term: string, note: string, image: Plate]
  | readonly [term: string, note: string, shape: TagShape];

/** A labelled run of tags, so a slide can carry more than one shelf. */
export type TagGroup = {
  label: string;
  items: readonly string[];
  /** Draw the label as a square tag instead of a heading. */
  square?: boolean;
};

/**
 * A positioning plot: two axes, a field of competitors, and us.
 *
 * Drawn rather than shown as a picture, so the type is the deck's own and
 * the thing stays sharp and readable at any size. Coordinates run -1 to 1
 * from the crossing of the axes — x to the right, y upward — which is how
 * the plot is read, and keeps the numbers meaningful if the box changes
 * shape.
 */
export type QuadrantBlock = {
  kind: 'quadrant';
  title?: string;
  axes: { top: string; right: string; bottom: string; left: string };
  points: {
    label: string;
    x: number;
    y: number;
    /** Which side of the dot the name sits on. Defaults to the right. */
    side?: 'left' | 'right';
    /** Us. Larger, in the deck's own voice, and in the accent. */
    mark?: boolean;
    /** A mark instead of the dot and name — the logo sits on the point. */
    logo?: { src: string; w: number; h: number };
  }[];
};

/**
 * A cause-and-effect graph: a column of causes, a centre, a column of
 * consequences, arrows in and out. Drawn, so it stays the slide's own type.
 */
export type EaseBlock = {
  kind: 'ease';
  caption?: string;
  center: string;
  from: readonly string[];
  to: readonly string[];
};

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
  | { kind: 'lead'; image: Plate; text?: undefined; scale?: number }
  /**
   * A standfirst over an itemised run — what a text slide cannot hold.
   *
   * A plain item flows as a tag. One given a note is a thing with something
   * to say about it, so the run sets them out as terms instead. `boxed`
   * keeps the tag and puts the note in a square under it. `hover` keeps the
   * tag and drops the note — and a still, if one is carried — in underneath
   * on hover. `groups` is the same tags, shelved under labels, for a slide
   * that has more than one kind of thing to name.
   */
  | {
      kind: 'list';
      title?: string;
      items: ListItem[];
      groups?: undefined;
      /** The competition plot, sitting beside the list on the same slide. */
      plot?: QuadrantBlock;
      /** Tag on top, square note under it — an answer, not a second tag. */
      boxed?: boolean;
      /** Tag stays a tag; the note appears beneath it on hover. */
      hover?: boolean;
      /** A soft cue under the tags — how to find the hover. */
      hint?: string;
      /** A line above the tags — the claim the tags then prove. */
      lede?: string;
      /** Square tags under the round ones — a verdict, not another pill. */
      squares?: readonly string[];
      /** The square tags in the selection blue, not ink. */
      accent?: boolean;
    }
  | { kind: 'list'; title?: string; groups: TagGroup[]; items?: undefined }
  /**
   * A board of stills, read as one image rather than as several.
   *
   * A pair sets two plates against each other and means the comparison; a
   * mosaic means the opposite — that no single frame is the point and the
   * spread is. Reference and moodboards go here, at the size they actually
   * are, instead of being dealt out two to a slide.
   */
  | { kind: 'mosaic'; images: Plate[]; caption?: string }
  /**
   * A justified wall of stills — rows fill the width, each picture keeps
   * its shape, packed like a contact sheet rather than a mosaic column.
   */
  | { kind: 'justified'; images: Plate[] }
  /**
   * Title over body, set with the work-sheet gutter — a creative named
   * plainly, without the deck's denser measure.
   */
  | { kind: 'copy'; title: string; body?: string; tag?: string }
  /**
   * A related piece of work: a still that opens the live page.
   */
  | {
      kind: 'similar';
      title: string;
      href: string;
      image: Plate;
      note?: string;
    }
  /**
   * Work on one slide: films with their posters, stills beside them.
   * One cell is one piece. The grid holds the spread.
   */
  | { kind: 'grid'; cells: GridCell[] }
  | QuadrantBlock
  | EaseBlock
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
  /** Shorter name in the index, when the slide title is longer than the list wants. */
  nav?: string;
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

/**
 * The 2000 deck as the fashion houses read it: the premise names them as
 * fashion brands rather than brands at large.
 */
export const fashionChapters: Chapter[] = chapters.map((chapter) => ({
  ...chapter,
  blocks: chapter.blocks.map((block) =>
    block.kind === 'text'
      ? {
          ...block,
          lines: block.lines.map((line) =>
            line.replace(
              /^Brands have become standardized/,
              'Fashion brands have become standardized',
            ),
          ),
        }
      : block,
  ),
}));

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
    url: 'goulielmos.site',
    href: 'https://goulielmos.site',
  },
];
