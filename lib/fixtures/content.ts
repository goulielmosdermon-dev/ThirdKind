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
      canvasPosition: { x: 1680, y: 1080, tileWidth: 224 },
    },
    {
      key: 'thoughts',
      label: 'Thoughts',
      description: 'Perspectives from the intersection of film and craft.',
      canvasPosition: { x: 3120, y: 980, tileWidth: 224 },
    },
    {
      key: 'about',
      label: 'About',
      description: 'The people, the process, and why we exist.',
      canvasPosition: { x: 1760, y: 2040, tileWidth: 224 },
    },
    {
      key: 'contact',
      label: 'Contact',
      description: 'New business and collaborations.',
      canvasPosition: { x: 3280, y: 2100, tileWidth: 224 },
    },
  ],
  ambientTiles: [
    {
      id: 'ambient-1',
      image: image('Ambient texture'),
      canvasPosition: { x: 2280, y: 760, tileWidth: 96, rotation: -8 },
      opacity: 0.35,
    },
    {
      id: 'ambient-2',
      image: image('Ambient texture'),
      canvasPosition: { x: 2460, y: 1480, tileWidth: 128, rotation: 6 },
      opacity: 0.28,
    },
    {
      id: 'ambient-3',
      image: image('Ambient texture'),
      canvasPosition: { x: 2480, y: 2180, tileWidth: 96, rotation: 4 },
      opacity: 0.4,
    },
    {
      id: 'ambient-4',
      image: image('Ambient texture'),
      canvasPosition: { x: 3720, y: 720, tileWidth: 96, rotation: -3 },
      opacity: 0.3,
    },
    {
      id: 'ambient-5',
      image: image('Ambient texture'),
      canvasPosition: { x: 1220, y: 1680, tileWidth: 128, rotation: 7 },
      opacity: 0.32,
    },
    {
      id: 'ambient-6',
      image: image('Ambient texture'),
      canvasPosition: { x: 3920, y: 1860, tileWidth: 96, rotation: -5 },
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
    heroVideoUrl: 'https://vimeo.com/1174819047',
    posterImage: image('Scytáles ID Authentication poster'),
    body: copy(
      'In this project, we handled the full production journey, from creative all the way to VFX and post-production, across four emotional short films, each exploring a domain where verifying identity genuinely matters: pornography, alcohol, gambling, and social media.',
      'At the heart of the work is a simple, human idea: these are the people whose identities Scytáles’ authentication technology quietly protects. Rather than lead with the tech, we led with the lives it safeguards.',
    ),
    credits: [{ role: 'Creative Direction', name: 'Third Kind' }],
    gallery: [{ _type: 'image', image: image('Scytáles still') }],
    canvasPosition: { x: 1420, y: 820, tileWidth: 176, rotation: -3 },
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
    canvasPosition: { x: 1880, y: 780, tileWidth: 224 },
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
    canvasPosition: { x: 2140, y: 1020, tileWidth: 128, rotation: 4 },
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
    canvasPosition: { x: 1380, y: 1120, tileWidth: 128 },
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
    canvasPosition: { x: 1720, y: 1360, tileWidth: 176, rotation: 2 },
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
    canvasPosition: { x: 2080, y: 1320, tileWidth: 128, rotation: -5 },
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
    canvasPosition: { x: 1480, y: 1480, tileWidth: 176 },
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
    canvasPosition: { x: 1240, y: 1280, tileWidth: 96, rotation: 6 },
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
    canvasPosition: { x: 1960, y: 1580, tileWidth: 176, rotation: -2 },
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
    canvasPosition: { x: 1680, y: 1680, tileWidth: 128 },
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
    canvasPosition: { x: 2860, y: 720, tileWidth: 176, rotation: -4 },
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
    canvasPosition: { x: 3360, y: 680, tileWidth: 128 },
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
    canvasPosition: { x: 3580, y: 900, tileWidth: 176, rotation: 3 },
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
    canvasPosition: { x: 2880, y: 1080, tileWidth: 128, rotation: 5 },
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
    canvasPosition: { x: 3240, y: 1240, tileWidth: 224 },
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
    canvasPosition: { x: 3600, y: 1280, tileWidth: 128, rotation: -6 },
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
    canvasPosition: { x: 2760, y: 1320, tileWidth: 176 },
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
    canvasPosition: { x: 3080, y: 1480, tileWidth: 128, rotation: 4 },
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
    canvasPosition: { x: 3480, y: 1520, tileWidth: 176, rotation: -3 },
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
    canvasPosition: { x: 2920, y: 1600, tileWidth: 96 },
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
    canvasPosition: { x: 1520, y: 1840, tileWidth: 176, rotation: -3 },
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
    canvasPosition: { x: 2000, y: 1860, tileWidth: 128, rotation: 4 },
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
        'We stand on the fundamental belief that when a business has genuine intentions to inspire, entertain, and to provide value through its communication, it will build strong relationships, and invite more customers.',
      ),
      block(
        'No one likes to get interrupted by ads, no one likes to be preached to, but everyone likes to be entertained, feel, and believe.',
      ),
      block(
        'A close encounter of the third kind, in Hynek’s classification — popularised by Close Encounters of the Third Kind (1977) — is contact with an unidentified presence. The name is the brief: make something that feels like it arrived from slightly elsewhere.',
      ),
    ],
    canvasPosition: { x: 1580, y: 2200, tileWidth: 224 },
  },
  {
    _id: 'about-services',
    _type: 'aboutSection',
    key: 'services',
    title: 'Services',
    hoverDescription: 'Entertainment, story, production, and human-led AI.',
    thumbnail: image('Services'),
    body: copy('Four offerings. One standard.'),
    canvasPosition: { x: 2040, y: 2240, tileWidth: 176, rotation: -4 },
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
  canvasPosition: { x: 3520, y: 2260, tileWidth: 176, rotation: 3 },
};

export const siteContent: SiteContent = {
  settings,
  projects,
  articles,
  aboutSections,
  contact,
};

export { deriveCanvasNodes, deriveEdges };

export const canvasNodes = deriveCanvasNodes(siteContent);
export const edges = deriveEdges(canvasNodes);
