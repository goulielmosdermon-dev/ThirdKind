/**
 * CMS-agnostic content contracts for the constellation canvas.
 * Phase 5 maps Sanity documents onto these shapes; app code should depend
 * on this module, not on Sanity types directly.
 */

export const WORLD_WIDTH = 4800;
/** Tall enough for the Organized layout's hero band above its sections. */
export const WORLD_HEIGHT = 4400;

export const TILE_WIDTHS = [96, 128, 176, 224] as const;
export type TileWidth = (typeof TILE_WIDTHS)[number];

export const HUB_KEYS = ['work', 'thoughts', 'about', 'contact'] as const;
export type HubKey = (typeof HUB_KEYS)[number];

export type NodeKind = 'hub' | 'leaf' | 'ambient';

export type Viewport = {
  x: number;
  y: number;
  scale: number;
};

export type CanvasPosition = {
  x: number;
  y: number;
  tileWidth: TileWidth;
  tileHeight?: TileWidth;
  rotation?: number;
};

export type EdgeKind = 'spoke' | 'related';

export type Edge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  kind: EdgeKind;
};

export type ImageHotspot = {
  x: number;
  y: number;
};

export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  hotspot?: ImageHotspot;
  /** Serve the original file untouched, skipping Next's image pipeline. */
  unoptimized?: boolean;
};

export type Slug = {
  current: string;
};

export type Seo = {
  title?: string;
  description?: string;
  ogImage?: ImageAsset;
};

export type PortableTextMarkDef = {
  _type: 'link';
  _key: string;
  href: string;
};

export type PortableTextSpan = {
  _type: 'span';
  _key: string;
  text: string;
  marks?: string[];
};

export type PortableTextBlock = {
  _type: 'block';
  _key: string;
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  children: PortableTextSpan[];
  markDefs?: PortableTextMarkDef[];
};

export type PortableTextImageBlock = {
  _type: 'image';
  _key: string;
  image: ImageAsset;
};

export type PortableText = Array<PortableTextBlock | PortableTextImageBlock>;

export type Credit = {
  role: string;
  name: string;
};

export type GalleryImage = {
  _type: 'image';
  image: ImageAsset;
};

export type GalleryVideo = {
  _type: 'videoUrl';
  url: string;
};

export type GallerySilentVideo = {
  _type: 'silentVideo';
  vimeoId: string;
};

export type GalleryFilm = {
  _type: 'film';
  vimeoId: string;
};

export type GalleryItem =
  GalleryImage | GalleryVideo | GallerySilentVideo | GalleryFilm;

export type WorkBeat =
  | { _type: 'copy'; text: string }
  | { _type: 'image'; image: ImageAsset }
  | { _type: 'silentVideo'; vimeoId: string }
  | { _type: 'film'; vimeoId: string; poster?: ImageAsset };

export type Project = {
  _id: string;
  _type: 'project';
  title: string;
  client: string;
  slug: Slug;
  order: number;
  thumbnail: ImageAsset;
  hoverDescription: string;
  heroVideoUrl: string;
  posterImage: ImageAsset;
  body: PortableText;
  credits: Credit[];
  gallery: GalleryItem[];
  story: WorkBeat[];
  /** Vertical loops shown as a strip at the foot of the page. */
  reel?: string[];
  canvasPosition: CanvasPosition;
  featured: boolean;
};

export type Article = {
  _id: string;
  _type: 'article';
  title: string;
  slug: Slug;
  publishedAt: string;
  coverImage: ImageAsset;
  hoverDescription: string;
  excerpt: string;
  /** What the piece is about, shown as tags beside the work's own. */
  tags?: string[];
  body: PortableText;
  /** Pins the piece to the lead slot on the Thoughts index. */
  featured?: boolean;
  canvasPosition: CanvasPosition;
  seo: Seo;
};

export type TeamMember = {
  name: string;
  role: string;
  portrait: ImageAsset;
};

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
};

export type ServiceOffering = {
  title: string;
  slug: Slug;
  description: string;
};

/** The single offer the stages belong to, above the scrolling column. */
export type ServicesOffer = {
  statement: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type AboutSectionKey = 'team' | 'process' | 'why' | 'services' | 'poem';

type AboutSectionBase = {
  _id: string;
  _type: 'aboutSection';
  title: string;
  hoverDescription: string;
  thumbnail: ImageAsset;
  body: PortableText;
  canvasPosition: CanvasPosition;
};

export type AboutTeamSection = AboutSectionBase & {
  key: 'team';
  teamMembers: TeamMember[];
};

export type AboutProcessSection = AboutSectionBase & {
  key: 'process';
  processSteps: ProcessStep[];
};

export type AboutWhySection = AboutSectionBase & {
  key: 'why';
  /**
   * What the Why page itself says. The section's body is the landing page's
   * manifesto band, and the two had been reading the same words.
   */
  pageBody?: PortableText;
};

export type AboutServicesSection = AboutSectionBase & {
  key: 'services';
  offer?: ServicesOffer;
  services: ServiceOffering[];
  faqs: Faq[];
};

export type AboutPoemSection = AboutSectionBase & {
  key: 'poem';
};

export type AboutSection =
  | AboutTeamSection
  | AboutProcessSection
  | AboutWhySection
  | AboutServicesSection
  | AboutPoemSection;

export type ContactInfo = {
  _id: string;
  _type: 'contactInfo';
  heading: string;
  newBusinessName: string;
  email: string;
  formRecipient: string;
  /** Required to render Contact as a canvas leaf (not in the original schema sketch). */
  hoverDescription: string;
  thumbnail: ImageAsset;
  canvasPosition: CanvasPosition;
};

export type Hub = {
  key: HubKey;
  label: string;
  description: string;
  canvasPosition: CanvasPosition;
};

export type AmbientTile = {
  id: string;
  image: ImageAsset;
  canvasPosition: CanvasPosition;
  opacity: number;
};

export type SocialLink = {
  label: string;
  url: string;
};

export type SiteSettings = {
  _id: string;
  _type: 'siteSettings';
  wordmarkLeft: string;
  wordmarkRight: string;
  hubs: Hub[];
  ambientTiles: AmbientTile[];
  defaultSeo: Seo;
  socialLinks: SocialLink[];
  poem: PortableText;
};

export type SiteContent = {
  settings: SiteSettings;
  projects: Project[];
  articles: Article[];
  aboutSections: AboutSection[];
  contact: ContactInfo;
};

type CanvasNodeBase = {
  id: string;
  position: CanvasPosition;
};

export type HubCanvasNode = CanvasNodeBase & {
  kind: 'hub';
  hubKey: HubKey;
  label: string;
  description: string;
};

export type LeafCanvasNode = CanvasNodeBase & {
  /** What the work involved, shown as tags. Empty for non-project leaves. */
  tags?: string[];
  kind: 'leaf';
  hubKey: HubKey;
  href: string;
  title: string;
  hoverDescription: string;
  thumbnail: ImageAsset;
  documentId: string;
  swatch?: string;
};

export type AmbientCanvasNode = CanvasNodeBase & {
  kind: 'ambient';
  image: ImageAsset;
  opacity: number;
};

export type CanvasNode = HubCanvasNode | LeafCanvasNode | AmbientCanvasNode;
