import type {
  AboutSection,
  Article,
  CanvasNode,
  ContactInfo,
  Edge,
  ImageAsset,
  PortableText,
  PortableTextBlock,
  Project,
  SiteContent,
  SiteSettings,
} from '@/types/content';

const PLACEHOLDER: ImageAsset = {
  src: '/placeholders/tile.svg',
  alt: 'Placeholder still',
  width: 480,
  height: 270,
};

function image(alt: string): ImageAsset {
  return { ...PLACEHOLDER, alt };
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
      canvasPosition: { x: 920, y: 640, tileWidth: 224 },
    },
    {
      key: 'thoughts',
      label: 'Thoughts',
      description: 'Perspectives from the intersection of film and craft.',
      canvasPosition: { x: 3280, y: 700, tileWidth: 224 },
    },
    {
      key: 'about',
      label: 'About',
      description: 'The people, the process, and why we exist.',
      canvasPosition: { x: 1080, y: 1980, tileWidth: 224 },
    },
    {
      key: 'contact',
      label: 'Contact',
      description: 'New business and collaborations.',
      canvasPosition: { x: 3420, y: 2080, tileWidth: 224 },
    },
  ],
  ambientTiles: [
    {
      id: 'ambient-1',
      image: image('Ambient texture'),
      canvasPosition: { x: 2100, y: 420, tileWidth: 96, rotation: -8 },
      opacity: 0.35,
    },
    {
      id: 'ambient-2',
      image: image('Ambient texture'),
      canvasPosition: { x: 2360, y: 1480, tileWidth: 128, rotation: 6 },
      opacity: 0.28,
    },
    {
      id: 'ambient-3',
      image: image('Ambient texture'),
      canvasPosition: { x: 1880, y: 2380, tileWidth: 96, rotation: 4 },
      opacity: 0.4,
    },
    {
      id: 'ambient-4',
      image: image('Ambient texture'),
      canvasPosition: { x: 4200, y: 380, tileWidth: 96, rotation: -3 },
      opacity: 0.3,
    },
    {
      id: 'ambient-5',
      image: image('Ambient texture'),
      canvasPosition: { x: 260, y: 1680, tileWidth: 128, rotation: 7 },
      opacity: 0.32,
    },
    {
      id: 'ambient-6',
      image: image('Ambient texture'),
      canvasPosition: { x: 4540, y: 1680, tileWidth: 96, rotation: -5 },
      opacity: 0.26,
    },
  ],
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
    heroVideoUrl: 'https://vimeo.com/000000001',
    posterImage: image('Scytáles ID Authentication poster'),
    body: copy('Placeholder body. Real copy and Vimeo URLs land in Phase 5.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Scytáles still') }],
    canvasPosition: { x: 700, y: 420, tileWidth: 176, rotation: -3 },
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
    heroVideoUrl: 'https://vimeo.com/000000002',
    posterImage: image('Scania Vehicle E-Wallet poster'),
    body: copy('Placeholder body for Scania Vehicle E-Wallet.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Scania still') }],
    canvasPosition: { x: 1140, y: 380, tileWidth: 224 },
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
    heroVideoUrl: 'https://vimeo.com/000000003',
    posterImage: image('Scytáles Internal Sales poster'),
    body: copy('Placeholder body for Scytáles Internal Sales.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Scytáles sales still') }],
    canvasPosition: { x: 1380, y: 620, tileWidth: 128, rotation: 4 },
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
    heroVideoUrl: 'https://vimeo.com/000000004',
    posterImage: image('UP Hellas poster'),
    body: copy('Placeholder body for A Christmas UP-ROL.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('UP Hellas still') }],
    canvasPosition: { x: 540, y: 680, tileWidth: 128 },
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
    heroVideoUrl: 'https://vimeo.com/000000005',
    posterImage: image('Rap Therapy poster'),
    body: copy('Placeholder body for Will It Ever Stop.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Rap Therapy still') }],
    canvasPosition: { x: 980, y: 880, tileWidth: 176, rotation: 2 },
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
    heroVideoUrl: 'https://vimeo.com/000000006',
    posterImage: image('Augustine Jewels poster'),
    body: copy('Placeholder body for Nordic Collection.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Augustine still') }],
    canvasPosition: { x: 1320, y: 960, tileWidth: 128, rotation: -5 },
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
    heroVideoUrl: 'https://vimeo.com/000000007',
    posterImage: image('OldBoy Brand poster'),
    body: copy('Placeholder body for Worldwide Neighbourhood.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('OldBoy still') }],
    canvasPosition: { x: 640, y: 980, tileWidth: 176 },
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
    heroVideoUrl: 'https://vimeo.com/000000008',
    posterImage: image('Ilana poster'),
    body: copy('Placeholder body for Ilana.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Ilana still') }],
    canvasPosition: { x: 420, y: 860, tileWidth: 96, rotation: 6 },
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
    heroVideoUrl: 'https://vimeo.com/000000009',
    posterImage: image('A&M Architects poster'),
    body: copy(
      'Placeholder body for A Brighter Tomorrow for a Bright Architect Firm.',
    ),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('A&M still') }],
    canvasPosition: { x: 1180, y: 1180, tileWidth: 176, rotation: -2 },
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
    heroVideoUrl: 'https://vimeo.com/000000010',
    posterImage: image('Noir Gaze poster'),
    body: copy('Placeholder body for Noir Gaze New Product Launch.'),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Noir Gaze still') }],
    canvasPosition: { x: 860, y: 1200, tileWidth: 128 },
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
    canvasPosition: { x: 3040, y: 460, tileWidth: 176, rotation: -4 },
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
    body: copy('Placeholder article body for From Idea to Impact.'),
    canvasPosition: { x: 3480, y: 420, tileWidth: 128 },
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
    body: copy('Placeholder article body for young creative teams.'),
    canvasPosition: { x: 3720, y: 640, tileWidth: 176, rotation: 3 },
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
    canvasPosition: { x: 3060, y: 780, tileWidth: 128, rotation: 5 },
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
    canvasPosition: { x: 3420, y: 960, tileWidth: 224 },
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
    canvasPosition: { x: 3800, y: 980, tileWidth: 128, rotation: -6 },
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
    canvasPosition: { x: 2920, y: 1040, tileWidth: 176 },
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
    canvasPosition: { x: 3240, y: 1220, tileWidth: 128, rotation: 4 },
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
    canvasPosition: { x: 3640, y: 1280, tileWidth: 176, rotation: -3 },
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
    canvasPosition: { x: 3000, y: 1360, tileWidth: 96 },
    seo: { title: 'Donations Start With a Story' },
  },
];

const aboutSections: AboutSection[] = [
  {
    _id: 'about-team',
    _type: 'aboutSection',
    key: 'team',
    title: 'Team',
    hoverDescription: 'Five people. One stubborn standard for the work.',
    thumbnail: image('Third Kind team'),
    body: copy('The people who make the films.'),
    canvasPosition: { x: 860, y: 1760, tileWidth: 176, rotation: -3 },
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
    hoverDescription: 'From brief to delivery, with the numbers kept honest.',
    thumbnail: image('Process'),
    body: copy('How a project moves from first conversation to last delivery.'),
    canvasPosition: { x: 1320, y: 1800, tileWidth: 128, rotation: 4 },
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
    hoverDescription: 'Stop making ads. Tell more stories.',
    thumbnail: image('Why Third Kind'),
    body: [
      block('Stop making ads, tell more stories.', 'h2'),
      block(
        'We work from genuine intentions: to inspire, to entertain, and to provide value. Nobody likes to be interrupted. Nobody likes to be preached to.',
      ),
      block(
        'A close encounter of the third kind, in Hynek’s classification — popularised by Close Encounters of the Third Kind (1977) — is contact with an unidentified presence. The name is the brief: make something that feels like it arrived from slightly elsewhere.',
      ),
    ],
    canvasPosition: { x: 900, y: 2140, tileWidth: 224 },
  },
  {
    _id: 'about-services',
    _type: 'aboutSection',
    key: 'services',
    title: 'Services',
    hoverDescription: 'Entertainment, story, production, and human-led AI.',
    thumbnail: image('Services'),
    body: copy('Four offerings. One standard.'),
    canvasPosition: { x: 1360, y: 2200, tileWidth: 176, rotation: -4 },
    services: [
      {
        title: 'Entertainment in Business',
        slug: { current: 'entertainment-in-business' },
        description:
          'Work that holds attention inside a commercial context, without apology.',
      },
      {
        title: 'Storytelling',
        slug: { current: 'storytelling' },
        description: 'Narrative as the operating system, not the garnish.',
      },
      {
        title: 'Production',
        slug: { current: 'production' },
        description: 'Films, documentaries, and commercials made end to end.',
      },
      {
        title: 'Human-Led AI Creativity',
        slug: { current: 'human-led-ai-creativity' },
        description:
          'Machine speed, human taste. The model does not get the last cut.',
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
  hoverDescription: 'A conversation. Not a funnel.',
  thumbnail: image('Contact'),
  canvasPosition: { x: 3680, y: 2240, tileWidth: 176, rotation: 3 },
};

export const siteContent: SiteContent = {
  settings,
  projects,
  articles,
  aboutSections,
  contact,
};

export function deriveCanvasNodes(content: SiteContent): CanvasNode[] {
  const hubs: CanvasNode[] = content.settings.hubs.map((hub) => ({
    id: `hub-${hub.key}`,
    kind: 'hub',
    hubKey: hub.key,
    label: hub.label,
    description: hub.description,
    position: hub.canvasPosition,
  }));

  const projectLeaves: CanvasNode[] = content.projects.map((project) => ({
    id: project._id,
    kind: 'leaf',
    hubKey: 'work',
    href: `/work/${project.slug.current}`,
    title: `${project.client} — ${project.title}`,
    hoverDescription: project.hoverDescription,
    thumbnail: project.thumbnail,
    documentId: project._id,
    position: project.canvasPosition,
  }));

  const articleLeaves: CanvasNode[] = content.articles.map((article) => ({
    id: article._id,
    kind: 'leaf',
    hubKey: 'thoughts',
    href: `/thoughts/${article.slug.current}`,
    title: article.title,
    hoverDescription: article.hoverDescription,
    thumbnail: article.coverImage,
    documentId: article._id,
    position: article.canvasPosition,
  }));

  const aboutLeaves: CanvasNode[] = content.aboutSections.map((section) => ({
    id: section._id,
    kind: 'leaf',
    hubKey: 'about',
    href: `/about/${section.key}`,
    title: section.title,
    hoverDescription: section.hoverDescription,
    thumbnail: section.thumbnail,
    documentId: section._id,
    position: section.canvasPosition,
  }));

  const contactLeaf: CanvasNode = {
    id: content.contact._id,
    kind: 'leaf',
    hubKey: 'contact',
    href: '/contact',
    title: content.contact.heading,
    hoverDescription: content.contact.hoverDescription,
    thumbnail: content.contact.thumbnail,
    documentId: content.contact._id,
    position: content.contact.canvasPosition,
  };

  const ambient: CanvasNode[] = content.settings.ambientTiles.map((tile) => ({
    id: tile.id,
    kind: 'ambient',
    image: tile.image,
    opacity: tile.opacity,
    position: tile.canvasPosition,
  }));

  return [
    ...hubs,
    ...projectLeaves,
    ...articleLeaves,
    ...aboutLeaves,
    contactLeaf,
    ...ambient,
  ];
}

export function deriveEdges(nodes: CanvasNode[]): Edge[] {
  const hubs = nodes.filter((node) => node.kind === 'hub');

  return nodes.flatMap((node) => {
    if (node.kind !== 'leaf') {
      return [];
    }

    const hub = hubs.find((candidate) => candidate.hubKey === node.hubKey);
    if (!hub) {
      return [];
    }

    return [
      {
        id: `edge-${hub.id}-${node.id}`,
        fromNodeId: hub.id,
        toNodeId: node.id,
        kind: 'spoke' as const,
      },
    ];
  });
}

export const canvasNodes = deriveCanvasNodes(siteContent);
export const edges = deriveEdges(canvasNodes);
