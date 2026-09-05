import type {
  AboutSection,
  Article,
  ContactInfo,
  ImageAsset,
  PortableText,
  PortableTextBlock,
  Project,
  SiteContent,
  SiteSettings,
} from '@/types/content';

import { deriveCanvasNodes, deriveEdges } from '@/lib/canvas/derive';
import media from '@/lib/fixtures/webflow-media.json';

/** Service lists as published on thirdkindcreative.com/work/* */
const PROJECT_SERVICES: Record<string, string[]> = {
  'scytales-2': ['Creative', 'Production', 'Post-Production', 'VFX'],
  scania: ['Creative', 'Production', 'Post-Production', 'VFX'],
  scytales: ['Production', 'Post-Production'],
  'up-hellas': [
    'Creative',
    'Production',
    'Post-Production',
    'VFX',
    'Graphic Design',
  ],
  'augustine-jewels': [
    'Creative',
    'Production',
    'Post Production',
    'Visual Effects',
  ],
  ilana: ['Creative', 'Production', 'Post-Production'],
  'rap-therapy': ['Creative', 'Production', 'Post Production'],
  'oldboy-brand': ['Production', 'Post Production'],
  noirgaze: ['Production', 'Post Production'],
  'a-m': ['Production', 'Post-Production'],
};

const PLACEHOLDER_COUNT = 6;

function placeholderSrc(alt: string): string {
  let hash = 0;
  for (let index = 0; index < alt.length; index += 1) {
    hash = (hash + alt.charCodeAt(index) * (index + 1)) % PLACEHOLDER_COUNT;
  }
  return `/placeholders/tile-${hash}.svg`;
}

function image(alt: string): ImageAsset {
  return {
    src: placeholderSrc(alt),
    alt,
    width: 480,
    height: 480,
  };
}

let portableKey = 0;

function block(
  text: string,
  style: PortableTextBlock['style'] = 'normal',
): PortableTextBlock {
  portableKey += 1;
  return {
    _type: 'block',
    _key: `b${portableKey}`,
    style,
    children: [
      {
        _type: 'span',
        _key: `s${portableKey}`,
        text,
      },
    ],
  };
}

function copy(...paragraphs: string[]): PortableText {
  return paragraphs.map((paragraph) => block(paragraph));
}

function isSectionHeading(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= 52 && !/[.!?]/.test(trimmed);
}

function articleCopy(...paragraphs: string[]): PortableText {
  return paragraphs.map((paragraph) =>
    block(paragraph, isSectionHeading(paragraph) ? 'h2' : 'normal'),
  );
}

function localPortrait(alt: string, file: string): ImageAsset {
  return {
    src: `/about/${file}`,
    alt,
    width: 896,
    height: 896,
  };
}

const TEAM_PORTRAITS: Record<string, string> = {
  'Goulielmos Dermon': 'goulielmos-dermon.png',
  'Goncalo Fonseça': 'goncalo-fonseca.png',
  'Daria Dikalo': 'daria-dikalo.jpeg',
  'Tejas Ewing': 'tejas-ewing.png',
  'Carrie Penn': 'carrie-penn.png',
};

function hydrateAboutSection(section: AboutSection): AboutSection {
  if (section.key === 'team') {
    const teamMembers = section.teamMembers.map((member) => {
      const file = TEAM_PORTRAITS[member.name];
      return file
        ? { ...member, portrait: localPortrait(member.name, file) }
        : member;
    });
    const tilePortrait =
      teamMembers.find((member) => member.name === 'Daria Dikalo') ??
      teamMembers[0];

    return {
      ...section,
      thumbnail: tilePortrait ? tilePortrait.portrait : section.thumbnail,
      teamMembers,
    };
  }

  return section;
}

/** Stills we ship ourselves, kept at native size and served uncompressed. */
const LOCAL_STILL: Record<string, { width: number; height: number }> = {
  '/work/scytales-2/str-1.jpg': { width: 5504, height: 3072 },
  '/work/scytales-2/alc-3.jpg': { width: 5504, height: 3072 },
  '/work/scytales-2/sc-2.jpg': { width: 5504, height: 3072 },
  '/work/up-hellas/poster.png': { width: 1736, height: 974 },
  '/work/up-hellas/still-1.png': { width: 1314, height: 1158 },
  '/work/up-hellas/still-2.png': { width: 2068, height: 1154 },
};

function optimized(asset: ImageAsset): ImageAsset {
  if (!asset.unoptimized) {
    return asset;
  }
  const next = { ...asset };
  delete next.unoptimized;
  return next;
}

function remote(alt: string, src: string | undefined): ImageAsset {
  if (!src) {
    return image(alt);
  }
  const local = LOCAL_STILL[src];
  if (local) {
    return { src, alt, ...local, unoptimized: true };
  }
  return { src: encodeURI(src), alt, width: 1600, height: 900 };
}

function hydrateProject(project: Project): Project {
  const item = media.work[project.slug.current as keyof typeof media.work] as
    | {
        thumb?: string;
        poster?: string;
        heroVideo?: string | null;
        body: string[];
        gallery: Array<
          | { type: 'image'; src: string }
          | { type: 'silentVideo'; vimeoId: string }
          | { type: 'film'; vimeoId: string }
        >;
        story: Array<
          | { type: 'copy'; text: string }
          | { type: 'image'; src: string }
          | { type: 'silentVideo'; vimeoId: string }
          | { type: 'film'; vimeoId: string; poster?: string }
        >;
        reel?: string[];
      }
    | undefined;
  const services = PROJECT_SERVICES[project.slug.current];
  const credits = services
    ? services.map((role) => ({ role, name: '' }))
    : project.credits;
  if (!item) {
    return services ? { ...project, credits } : project;
  }
  const paras = item.body.filter((paragraph) => paragraph.length > 40);
  return {
    ...project,
    // Thumbnails are only ever shown small, so they keep going through the
    // optimiser even when the full-size still beside them does not.
    thumbnail: optimized(remote(project.thumbnail.alt, item.thumb)),
    posterImage: remote(project.posterImage.alt, item.poster || item.thumb),
    heroVideoUrl: item.heroVideo ? `https://vimeo.com/${item.heroVideo}` : '',
    body: paras.length > 0 ? copy(...paras) : project.body,
    credits,
    gallery: item.gallery.map((entry) => {
      if (entry.type === 'image') {
        return {
          _type: 'image' as const,
          image: remote(project.title, entry.src),
        };
      }
      if (entry.type === 'silentVideo') {
        return { _type: 'silentVideo' as const, vimeoId: entry.vimeoId };
      }
      return { _type: 'film' as const, vimeoId: entry.vimeoId };
    }),
    story: item.story.map((beat) => {
      if (beat.type === 'copy') {
        return { _type: 'copy' as const, text: beat.text };
      }
      if (beat.type === 'image') {
        return {
          _type: 'image' as const,
          image: remote(project.title, beat.src),
        };
      }
      if (beat.type === 'silentVideo') {
        return { _type: 'silentVideo' as const, vimeoId: beat.vimeoId };
      }
      return {
        _type: 'film' as const,
        vimeoId: beat.vimeoId,
        ...(beat.poster
          ? { poster: remote(`${project.title} film still`, beat.poster) }
          : {}),
      };
    }),
    ...(item.reel?.length ? { reel: item.reel } : {}),
  };
}

function hydrateArticle(article: Article): Article {
  const item = media.posts[article.slug.current as keyof typeof media.posts];
  if (!item) {
    return article;
  }
  const paras = item.body.filter((paragraph) => paragraph.trim().length > 0);
  return {
    ...article,
    coverImage: remote(article.coverImage.alt, item.cover),
    body: paras.length > 0 ? articleCopy(...paras) : article.body,
  };
}

const settings: SiteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  wordmarkLeft: 'Third',
  wordmarkRight: 'Kind',
  hubs: [
    {
      key: 'work',
      label: 'Work',
      description: 'Films, commercials, and branded documentaries.',
      canvasPosition: { x: 1800, y: 1160, tileWidth: 224 },
    },
    {
      key: 'thoughts',
      label: 'Thoughts',
      description: 'Perspectives from the intersection of film and craft.',
      canvasPosition: { x: 2860, y: 1120, tileWidth: 224 },
    },
    {
      key: 'about',
      label: 'About',
      description: 'The people, the process, and why we exist.',
      canvasPosition: { x: 2260, y: 1560, tileWidth: 224, rotation: -6 },
    },
    {
      key: 'contact',
      label: 'Contact',
      description: 'New business and collaborations.',
      canvasPosition: { x: 3120, y: 1720, tileWidth: 224 },
    },
  ],
  ambientTiles: [],
  defaultSeo: {
    title: 'Third Kind',
    description:
      'A creative agency producing films, documentaries, and commercials.',
  },
  socialLinks: [
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/thirdkindcreative',
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/goulielmos-dermon-64a8ba18a',
    },
  ],
  poem: [
    block('Very small our earth, I’m told —', 'blockquote'),
    block('by those who weigh the sky;', 'blockquote'),
    block('Our seven seas but shallow scrapes.', 'blockquote'),
    block('To bathe a ball where angry apes.', 'blockquote'),
    block('Breed gods consigned to die.', 'blockquote'),
    block('Very young our race, I’m told —', 'blockquote'),
    block('by those who relish age;', 'blockquote'),
    block('Where infants dressed in men’s array.', 'blockquote'),
    block('Spout lines of some unfinished play.', 'blockquote'),
    block('Upon a pinprick stage.', 'blockquote'),
    block('Very foolish we, I’m told —', 'blockquote'),
    block('by those more wise than I;', 'blockquote'),
    block('The reckless need to know God’s face.', 'blockquote'),
    block('Our one, redeeming, savage grace:', 'blockquote'),
    block('This urge to wonder: ‘Why?’', 'blockquote'),
  ],
};

const projects: Project[] = [
  {
    _id: 'project-scytales-2',
    _type: 'project',
    title: 'ID Authentication',
    client: 'Scytáles',
    slug: { current: 'scytales-2' },
    order: 1,
    thumbnail: image('Scytáles ID Authentication'),
    hoverDescription: 'Identity, proven on camera — without the lecture.',
    heroVideoUrl: 'https://vimeo.com/1174819047',
    posterImage: image('Scytáles ID Authentication poster'),
    body: copy(
      'In this project, we handled the full production journey, from creative all the way to VFX and post-production, across four emotional short films, each exploring a domain where verifying identity genuinely matters: pornography, alcohol, gambling, and social media.',
      'At the heart of the work is a simple, human idea: these are the people whose identities Scytáles’ authentication technology quietly protects. Rather than lead with the tech, we led with the lives it safeguards.',
    ),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Scytáles still') }],
    story: [],
    canvasPosition: { x: 1520, y: 880, tileWidth: 176, rotation: -6 },
    featured: true,
  },
  {
    _id: 'project-scania',
    _type: 'project',
    title: 'Vehicle E-Wallet',
    client: 'Scania',
    slug: { current: 'scania' },
    order: 2,
    thumbnail: image('Scania Vehicle E-Wallet'),
    hoverDescription: 'A fleet film about paying for the road, not the paper.',
    heroVideoUrl: 'https://vimeo.com/1174801751',
    posterImage: image('Scania Vehicle E-Wallet poster'),
    body: copy(
      'The Scania team is planning to revolutionise the truck driving industry with bespoke technology that will give freedom to millions of drivers worldwide.',
      'They needed a solid video that communicates this change, balancing creativity with corporate presentation.',
      'Because we know that, corporate or not, communication is always referred to humans, we achieved the right balance of immersion through 3D work and storytelling through a standalone script.',
    ),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Scania still') }],
    story: [],
    canvasPosition: { x: 1820, y: 860, tileWidth: 128, rotation: 5 },
    featured: true,
  },
  {
    _id: 'project-scytales',
    _type: 'project',
    title: 'Internal Sales',
    client: 'Scytáles',
    slug: { current: 'scytales' },
    order: 3,
    thumbnail: image('Scytáles Internal Sales'),
    hoverDescription: 'An internal story told like an external one.',
    heroVideoUrl: 'https://vimeo.com/1162194421',
    posterImage: image('Scytáles Internal Sales poster'),
    body: copy('Placeholder body for Scytáles Internal Sales.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Scytáles sales still') }],
    story: [],
    canvasPosition: {
      x: 2160,
      y: 860,
      tileWidth: 176,
      tileHeight: 96,
      rotation: 8,
    },
    featured: false,
  },
  {
    _id: 'project-up-hellas',
    _type: 'project',
    title: 'A Christmas UP-ROL',
    client: 'UP Hellas',
    slug: { current: 'up-hellas' },
    order: 4,
    thumbnail: image('UP Hellas A Christmas UP-ROL'),
    hoverDescription: 'Seasonal warmth without the usual jingle trap.',
    heroVideoUrl: 'https://vimeo.com/1148438581',
    posterImage: image('UP Hellas poster'),
    body: copy('Placeholder body for A Christmas UP-ROL.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('UP Hellas still') }],
    story: [],
    canvasPosition: { x: 1380, y: 1040, tileWidth: 176, rotation: -4 },
    featured: false,
  },
  {
    _id: 'project-rap-therapy',
    _type: 'project',
    title: 'Will It Ever Stop',
    client: 'Rap Therapy',
    slug: { current: 'rap-therapy' },
    order: 5,
    thumbnail: image('Rap Therapy Will It Ever Stop'),
    hoverDescription: 'A music film that lets the wound speak first.',
    heroVideoUrl: 'https://vimeo.com/1070483583',
    posterImage: image('Rap Therapy poster'),
    body: copy(
      'Inspired by Rap Therapy, a powerful initiative led by Bhishma that empowers young people from underserved neighbourhoods through music, the film captures more than just a performance. It’s a protest.',
      'Through a bold and technically demanding tracking shot, young performers deliver a unified message: they want a life free from crime, fear, and violence.',
    ),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Rap Therapy still') }],
    story: [],
    canvasPosition: { x: 1400, y: 1280, tileWidth: 176, rotation: 4 },
    featured: true,
  },
  {
    _id: 'project-augustine-jewels',
    _type: 'project',
    title: 'Nordic Collection',
    client: 'Augustine Jewels',
    slug: { current: 'augustine-jewels' },
    order: 6,
    thumbnail: image('Augustine Jewels Nordic Collection'),
    hoverDescription: 'Light, metal, and the quiet of a northern room.',
    heroVideoUrl: 'https://vimeo.com/935002942',
    posterImage: image('Augustine Jewels poster'),
    body: copy('Placeholder body for Nordic Collection.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Augustine still') }],
    story: [],
    canvasPosition: { x: 1780, y: 1420, tileWidth: 96, rotation: -7 },
    featured: false,
  },
  {
    _id: 'project-oldboy-brand',
    _type: 'project',
    title: 'Worldwide Neighbourhood',
    client: 'OldBoy Brand',
    slug: { current: 'oldboy-brand' },
    order: 7,
    thumbnail: image('OldBoy Brand Worldwide Neighbourhood'),
    hoverDescription: 'A neighbourhood that happens to span a planet.',
    heroVideoUrl: 'https://vimeo.com/891108973',
    posterImage: image('OldBoy Brand poster'),
    body: copy('Placeholder body for Worldwide Neighbourhood.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('OldBoy still') }],
    story: [],
    canvasPosition: { x: 1320, y: 1180, tileWidth: 128, rotation: 3 },
    featured: false,
  },
  {
    _id: 'project-ilana',
    _type: 'project',
    title: 'Ilana',
    client: 'Ilana',
    slug: { current: 'ilana' },
    order: 8,
    thumbnail: image('Ilana'),
    hoverDescription: 'A portrait built from gesture, fabric, and pause.',
    heroVideoUrl: 'https://vimeo.com/897034201',
    posterImage: image('Ilana poster'),
    body: copy('Placeholder body for Ilana.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [
      { _type: 'image', image: image('Ilana still') },
      { _type: 'videoUrl', url: 'https://vimeo.com/958965737' },
    ],
    story: [],
    canvasPosition: { x: 1540, y: 760, tileWidth: 128, rotation: 6 },
    featured: false,
  },
  {
    _id: 'project-a-m',
    _type: 'project',
    title: 'A Brighter Tomorrow for a Bright Architect Firm',
    client: 'A&M Architects',
    slug: { current: 'a-m' },
    order: 9,
    thumbnail: image('A&M Architects'),
    hoverDescription: 'Architecture as a story of light, not floorplans.',
    heroVideoUrl: 'https://vimeo.com/838480328',
    posterImage: image('A&M Architects poster'),
    body: copy(
      'Placeholder body for A Brighter Tomorrow for a Bright Architect Firm.',
    ),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('A&M still') }],
    story: [],
    canvasPosition: { x: 1980, y: 1440, tileWidth: 176, rotation: -5 },
    featured: false,
  },
  {
    _id: 'project-noirgaze',
    _type: 'project',
    title: 'New Product Launch',
    client: 'Noir Gaze',
    slug: { current: 'noirgaze' },
    order: 10,
    thumbnail: image('Noir Gaze New Product Launch'),
    hoverDescription: 'A launch film that treats product like character.',
    heroVideoUrl: 'https://vimeo.com/956762066',
    posterImage: image('Noir Gaze poster'),
    body: copy('Placeholder body for Noir Gaze New Product Launch.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Noir Gaze still') }],
    story: [],
    canvasPosition: { x: 2340, y: 1220, tileWidth: 128, rotation: 2 },
    featured: false,
  },
];

const articles: Article[] = [
  {
    _id: 'article-leading-the-creative-landscape',
    _type: 'article',
    title:
      'Should companies follow the digital change or should they be the change?',
    slug: { current: 'leading-the-creative-landscape' },
    publishedAt: '2024-03-12T00:00:00.000Z',
    coverImage: image(
      'Should companies follow the digital change or should they be the change?',
    ),
    hoverDescription: 'Follow the shift, or author it. Only one ages well.',
    excerpt:
      'A case for leading the creative landscape instead of trailing the tools.',
    body: copy(
      'Placeholder article body. Full Portable Text migrates from the live site in Phase 5.',
    ),
    featured: true,
    canvasPosition: { x: 2540, y: 840, tileWidth: 176, rotation: -6 },
    seo: {
      title:
        'Should companies follow the digital change or should they be the change?',
    },
  },
  {
    _id: 'article-from-idea-to-impact',
    _type: 'article',
    title: 'From Idea to Impact: Our Approach to Production',
    slug: { current: 'from-idea-to-impact-our-approach-to-production' },
    publishedAt: '2024-04-02T00:00:00.000Z',
    coverImage: image('From Idea to Impact'),
    hoverDescription: 'How a brief becomes a film people actually finish.',
    excerpt: 'The production path from first conversation to last frame.',
    body: copy(
      'We begin with listening. We study the audience, learn the brand’s goals, and uncover the stories that can spark a connection.',
      'With insights in place, we shape the concept. We write scripts, build storyboards, and design a narrative that feels alive.',
      'Every project is tailored. Some require a lean crew, others demand larger sets. Editing is where the story comes together, then we adapt the work across formats.',
      'A campaign is not complete at launch. We review performance, gather feedback, and refine our approach.',
    ),
    canvasPosition: { x: 2900, y: 800, tileWidth: 96, rotation: 4 },
    seo: { title: 'From Idea to Impact: Our Approach to Production' },
  },
  {
    _id: 'article-young-creative-teams',
    _type: 'article',
    title: 'The Hidden Value of Young Creative Teams',
    slug: { current: 'the-hidden-value-of-young-creative-teams' },
    publishedAt: '2024-05-18T00:00:00.000Z',
    coverImage: image('The Hidden Value of Young Creative Teams'),
    hoverDescription: 'Hunger, range, and the cost of only hiring veterans.',
    excerpt: 'Why young teams are a production advantage, not a risk.',
    body: copy(
      'Young creatives are not tied to the formulas of the past. They experiment, adapt, and pull influence from new cultures and formats.',
      'Marketing moves fast. Younger teams are used to reacting quickly, testing new tools, and working at the pace of digital culture.',
      'Big agencies carry big overheads. Smaller and younger teams can deliver the same quality of work at a more efficient cost.',
      'Choosing a young team is not a compromise. It is often the smarter choice.',
    ),
    canvasPosition: { x: 3260, y: 860, tileWidth: 176, rotation: 6 },
    seo: { title: 'The Hidden Value of Young Creative Teams' },
  },
  {
    _id: 'article-storytelling-wins',
    _type: 'article',
    title: 'Why Storytelling Wins: The Future of Brand Communication',
    slug: {
      current: 'why-storytelling-wins-the-future-of-brand-communication',
    },
    publishedAt: '2024-06-09T00:00:00.000Z',
    coverImage: image('Why Storytelling Wins'),
    hoverDescription: 'Messages expire. Stories compound.',
    excerpt: 'Brand communication as narrative craft, not campaign clutter.',
    body: copy('Placeholder article body for Why Storytelling Wins.'),
    canvasPosition: { x: 2560, y: 1040, tileWidth: 128, rotation: 5 },
    seo: { title: 'Why Storytelling Wins: The Future of Brand Communication' },
  },
  {
    _id: 'article-abandoning-creativity',
    _type: 'article',
    title: 'Abandoning creativity is professional suicide',
    slug: {
      current:
        'why-the-lack-of-creativity-is-killing-your-brand-and-how-to-fix-it',
    },
    publishedAt: '2024-07-21T00:00:00.000Z',
    coverImage: image('Abandoning creativity is professional suicide'),
    hoverDescription: 'Safe work is not a strategy. It is a slow exit.',
    excerpt: 'What happens when brands trade invention for template.',
    body: copy('Placeholder article body for abandoning creativity.'),
    canvasPosition: { x: 3260, y: 1320, tileWidth: 176, rotation: -4 },
    seo: { title: 'Abandoning creativity is professional suicide' },
  },
  {
    _id: 'article-ten-ad-tactics',
    _type: 'article',
    title:
      'Ten Ad Tactics That Will Still Work When Everyone Else Gets Ignored',
    slug: { current: '10-ways-to-craft-commercials-that-sell-in-2025' },
    publishedAt: '2024-09-04T00:00:00.000Z',
    coverImage: image('Ten Ad Tactics'),
    hoverDescription: 'Ten moves that still cut through when the feed is full.',
    excerpt: 'Tactics for commercials that sell without shouting.',
    body: copy('Placeholder article body for ten ad tactics.'),
    canvasPosition: { x: 3440, y: 1180, tileWidth: 128, rotation: -6 },
    seo: {
      title:
        'Ten Ad Tactics That Will Still Work When Everyone Else Gets Ignored',
    },
  },
  {
    _id: 'article-b2b',
    _type: 'article',
    title: 'Business to Business Doesn’t Have to Mean Boring-to-Boring',
    slug: { current: 'business-to-business-advertising-secrets' },
    publishedAt: '2024-10-11T00:00:00.000Z',
    coverImage: image(
      'Business to Business Doesn’t Have to Mean Boring-to-Boring',
    ),
    hoverDescription: 'B2B is still made of people. Film them that way.',
    excerpt: 'How B2B work can feel human without losing the brief.',
    body: copy('Placeholder article body for B2B advertising.'),
    canvasPosition: { x: 2480, y: 1200, tileWidth: 176 },
    seo: {
      title: 'Business to Business Doesn’t Have to Mean Boring-to-Boring',
    },
  },
  {
    _id: 'article-right-stories',
    _type: 'article',
    title: 'What If the Story You’re Telling Is the Reason You’re Not Growing?',
    slug: { current: 'are-you-telling-the-right-stories-for-your-brand' },
    publishedAt: '2024-11-16T00:00:00.000Z',
    coverImage: image(
      'What If the Story You’re Telling Is the Reason You’re Not Growing?',
    ),
    hoverDescription: 'Wrong story, right budget: a quiet way to stall.',
    excerpt: 'Choosing the story that actually moves a brand forward.',
    body: copy('Placeholder article body for the right stories.'),
    canvasPosition: { x: 2900, y: 1400, tileWidth: 96, rotation: 8 },
    seo: {
      title:
        'What If the Story You’re Telling Is the Reason You’re Not Growing?',
    },
  },
  {
    _id: 'article-corporate-creative',
    _type: 'article',
    title: 'Corporate Creative Doesn’t Have to Be Corporate',
    slug: {
      current:
        'advertising-corporations---people-who-know-a-company-well-are-5-times-more-likely-to-have-a-favorable-opinion-of-it',
    },
    publishedAt: '2025-01-08T00:00:00.000Z',
    coverImage: image('Corporate Creative Doesn’t Have to Be Corporate'),
    hoverDescription: 'Familiarity breeds favour. Sterility breeds nothing.',
    excerpt:
      'People who know a company well are far more likely to like it. Film accordingly.',
    body: copy('Placeholder article body for corporate creative.'),
    canvasPosition: { x: 3320, y: 1380, tileWidth: 176, rotation: -5 },
    seo: { title: 'Corporate Creative Doesn’t Have to Be Corporate' },
  },
  {
    _id: 'article-donations',
    _type: 'article',
    title: 'Donations Start With a Story',
    slug: {
      current:
        'advertising-for-good-causes-strategies-for-effective-nonprofit-marketing',
    },
    publishedAt: '2025-02-20T00:00:00.000Z',
    coverImage: image('Donations Start With a Story'),
    hoverDescription: 'Causes need witnesses, not slogans.',
    excerpt: 'Nonprofit films that ask without preaching.',
    body: copy('Placeholder article body for donations and story.'),
    canvasPosition: { x: 2620, y: 1420, tileWidth: 128, rotation: 3 },
    seo: { title: 'Donations Start With a Story' },
  },
];

const aboutSections: AboutSection[] = [
  {
    _id: 'about-team',
    _type: 'aboutSection',
    key: 'team',
    title: 'Team',
    hoverDescription:
      'From slightly elsewhere. Different backgrounds, one stubborn standard for the work.',
    thumbnail: image('Third Kind team'),
    body: copy(
      'From slightly elsewhere. Different backgrounds, one stubborn standard for the work.',
    ),
    canvasPosition: { x: 1688, y: 1624, tileWidth: 176, rotation: -6 },
    teamMembers: [
      {
        name: 'Goulielmos Dermon',
        role: 'Creative Director',
        portrait: image('Goulielmos Dermon'),
      },
      {
        name: 'Goncalo Fonseça',
        role: 'Creative Producer',
        portrait: image('Goncalo Fonseça'),
      },
      {
        name: 'Daria Dikalo',
        role: 'Head of Production',
        portrait: image('Daria Dikalo'),
      },
      {
        name: 'Tejas Ewing',
        role: 'Script Writer',
        portrait: image('Tejas Ewing'),
      },
      {
        name: 'Carrie Penn',
        role: 'Composer',
        portrait: image('Carrie Penn'),
      },
    ],
  },
  {
    _id: 'about-process',
    _type: 'aboutSection',
    key: 'process',
    title: 'Process',
    hoverDescription: '',
    thumbnail: image('Process'),
    body: copy('How a project moves from first conversation to last delivery.'),
    canvasPosition: { x: 2788, y: 1592, tileWidth: 96, rotation: 5 },
    processSteps: [
      {
        step: 1,
        title: 'Listen',
        description: 'The brief, the audience, and what must not be said.',
      },
      {
        step: 2,
        title: 'Story',
        description: 'A narrative spine before a treatment, not after.',
      },
      {
        step: 3,
        title: 'Craft',
        description: 'Production that protects the idea on the floor.',
      },
      {
        step: 4,
        title: 'Cut',
        description: 'Edit, sound, and colour as one argument.',
      },
      {
        step: 5,
        title: 'Deliver',
        description: 'Masters, versions, and a film that still holds.',
      },
    ],
  },
  {
    _id: 'about-why',
    _type: 'aboutSection',
    key: 'why',
    title: 'Why',
    hoverDescription: '',
    thumbnail: image('Why Third Kind'),
    body: [
      block('Stop making ads, tell more stories.', 'h2'),
      block(
        'We stand on the fundamental belief that when a business has genuine intentions to inspire, entertain, and to provide value through its communication, it will build strong relationships, and invite more customers.',
      ),
      block(
        'No one likes to get interrupted by ads, no one likes to be preached to, but everyone likes to be entertained, feel, and believe.',
      ),
      block(
        'A close encounter of the third kind, in Hynek’s classification — popularised by Close Encounters of the Third Kind (1977) — is contact with an unidentified presence. The name is the brief: make something that feels like it arrived from slightly elsewhere.',
      ),
    ],
    canvasPosition: { x: 2040, y: 1800, tileWidth: 176, rotation: 4 },
  },
  {
    _id: 'about-poem',
    _type: 'aboutSection',
    key: 'poem',
    title: '',
    hoverDescription: '',
    thumbnail: image('About'),
    body: [],
    canvasPosition: { x: 2288, y: 1992, tileWidth: 96, rotation: -3 },
  },
  {
    _id: 'about-services',
    _type: 'aboutSection',
    key: 'services',
    title: 'Creative Services',
    hoverDescription: '',
    thumbnail: image('Services'),
    body: copy('One offer, several disciplines.'),
    canvasPosition: { x: 2500, y: 1800, tileWidth: 128, rotation: -5 },
    offer: {
      statement:
        'A brand has to keep showing up: big moments and small, broad and personal. We make work that holds across all of it, cut for every channel it lands on, personal where that earns attention, and made without waste.',
    },
    services: [
      {
        title: 'Reading the room',
        slug: { current: 'reading-the-room' },
        description:
          "Your customers belonged to something before they belonged to you. A sport, a scene, a group chat. We go and look at what those worlds actually care about this year, and find you a way in that doesn't make everyone wince.",
      },
      {
        title: 'Brand Strategy',
        slug: { current: 'brand-strategy' },
        description:
          'Before anyone writes a word, the room has to agree on what you stand for and who you are for. We get that onto one page in plain language, so every decision after it has something to point at.',
      },
      {
        title: 'How it feels',
        slug: { current: 'how-it-feels' },
        description:
          'People remember how you made them feel long after they forget what you said. We work on the parts that carry the feeling: how you sound, how you move, what you look like when nobody is paying close attention.',
      },
      {
        title: 'Getting heard',
        slug: { current: 'getting-heard' },
        description:
          'A good film nobody sees is an expensive hobby. We work out where the work goes, in what order, and what each piece is there to do, so the whole run adds up to something.',
      },
      {
        title: 'Worth watching',
        slug: { current: 'worth-watching' },
        description:
          'Most ads get skipped because they earned it. We make the ones people sit through, and now and then send to a mate, which is the only share worth counting.',
      },
      {
        title: 'Proof it worked',
        slug: { current: 'proof-it-worked' },
        description:
          'You should not have to take our word for it. We agree what we are watching before the work goes out, take a reading, take another one after, and show you both.',
      },
      {
        title: 'Steady stream',
        slug: { current: 'steady-stream' },
        description:
          'One big film a year stopped carrying a brand a while ago. We set you up to keep making things: quick where it can be quick, careful where it counts, without spending the whole budget on the small stuff.',
      },
    ],
    faqs: [
      {
        question: 'How long does a film take from brief to delivery?',
        answer:
          'A narrative spine lands in the first week and a treatment follows inside two. After that the schedule depends on the work: a single-location brand film is usually four to six weeks end to end; a campaign with several cutdowns, eight to ten. We quote a date we can hold.',
      },
      {
        question: 'How is Third Kind different from an agency?',
        answer:
          'An agency sells you a message and then hires someone to shoot it. We start with the story and stay on it through the last cut, so nobody hands the idea over halfway and hopes it survives.',
      },
      {
        question: 'What happens after I get in touch?',
        answer:
          'A conversation, not a funnel. We listen for the brief, the audience, and the thing that must not be said, then come back with a story direction and an honest number. If the work is not right for us we will say so in that first call rather than three weeks later.',
      },
      {
        question: 'What does a project cost?',
        answer:
          'It is scoped per film. A two-day shoot and a multi-country campaign are not the same animal. What stays fixed is how the number is built: every line is something you can see on screen.',
      },
      {
        question: 'Do you only make commercials?',
        answer:
          'No. Commercials, brand films, branded documentaries, internal films, and music films all pass through the same process. The format changes; the belief that someone has to actually want to finish watching does not.',
      },
      {
        question: 'Can you work with a script or treatment we already have?',
        answer:
          'Yes. We will read it properly before suggesting a change. If the story holds we produce it. If it does not, we will tell you where it loses the audience and let you decide how far to take that.',
      },
      {
        question: 'How do you use AI?',
        answer:
          'For speed in concepting, stills, and motion tests, where a machine is genuinely faster than a mood board. It never gets the last cut. Taste, casting, performance, and the final edit stay with people, because that is the part an audience can feel.',
      },
      {
        question: 'Do you shoot globally?',
        answer:
          'Yes. We produce wherever the story needs to be, working with local crew we have used before rather than whoever is cheapest that week. Remote briefs are normal for us; the shoot moves, the process does not.',
      },
      {
        question: 'What do we get at the end?',
        answer:
          'Masters in the formats you actually need — broadcast, social, and archive — plus the cutdowns and versions agreed at the start. Edit, sound, and colour are treated as one argument, so the fifteen-second version still holds the film together instead of looking like an offcut.',
      },
    ],
  },
];

const contact: ContactInfo = {
  _id: 'contactInfo',
  _type: 'contactInfo',
  heading: 'New Business',
  newBusinessName: 'Goulielmos Dermon',
  email: 'goulielmos@thirdkindcreative.com',
  formRecipient: 'goulielmos@thirdkindcreative.com',
  hoverDescription: '',
  thumbnail: image('Contact'),
  canvasPosition: { x: 3380, y: 1600, tileWidth: 128, rotation: 6 },
};

export const siteContent: SiteContent = {
  settings,
  projects: projects.map(hydrateProject),
  articles: articles.map(hydrateArticle),
  aboutSections: aboutSections.map(hydrateAboutSection),
  contact,
};

export { deriveCanvasNodes, deriveEdges };

export const canvasNodes = deriveCanvasNodes(siteContent);
export const edges = deriveEdges(canvasNodes);
