import type {
  AboutSection,
  AboutSectionKey,
  Article,
  ContactInfo,
  GalleryItem,
  ImageAsset,
  PortableText,
  PortableTextBlock,
  Project,
  SiteContent,
  SiteSettings,
  TileWidth,
} from '@/types/content';
import { TILE_WIDTHS } from '@/types/content';

import { urlFor } from '@/sanity/lib/image';

type SanityAsset = {
  _id?: string;
  url?: string;
  metadata?: { dimensions?: { width?: number; height?: number } };
};

type SanityImage = {
  alt?: string;
  hotspot?: { x: number; y: number };
  asset?: SanityAsset;
};

type SanitySpan = {
  _type?: string;
  _key?: string;
  text?: string;
  marks?: string[];
};

type SanityBlock = {
  _type?: string;
  _key?: string;
  style?: PortableTextBlock['style'];
  listItem?: PortableTextBlock['listItem'];
  level?: number;
  children?: SanitySpan[];
  markDefs?: PortableTextBlock['markDefs'];
  alt?: string;
  hotspot?: { x: number; y: number };
  asset?: SanityAsset;
};

type SanityGalleryItem =
  (SanityImage & { _type?: 'image' }) | { _type?: 'videoUrl'; url?: string };

function isTileWidth(value: number): value is TileWidth {
  return (TILE_WIDTHS as readonly number[]).includes(value);
}

export function mapImage(
  image: SanityImage | null | undefined,
  fallbackAlt: string,
): ImageAsset {
  const alt = image?.alt?.trim() || fallbackAlt;
  if (!image?.asset) {
    return {
      src: '/placeholders/tile-0.svg',
      alt,
      width: 480,
      height: 480,
    };
  }

  const width = image.asset.metadata?.dimensions?.width ?? 1200;
  const height = image.asset.metadata?.dimensions?.height ?? 1200;
  const src = image.asset.url
    ? urlFor(image).width(1200).fit('max').url()
    : '/placeholders/tile-0.svg';

  return {
    src,
    alt,
    width,
    height,
    hotspot: image.hotspot
      ? { x: image.hotspot.x, y: image.hotspot.y }
      : undefined,
  };
}

export function mapPortable(
  value: SanityBlock[] | null | undefined,
): PortableText {
  if (!value) {
    return [];
  }

  const blocks: PortableText = [];
  value.forEach((block, index) => {
    const key = block._key ?? `block-${index}`;
    if (block._type === 'image') {
      blocks.push({
        _type: 'image',
        _key: key,
        image: mapImage(block, 'Still'),
      });
      return;
    }

    if (block._type !== 'block') {
      return;
    }

    blocks.push({
      _type: 'block',
      _key: key,
      style: block.style,
      listItem: block.listItem,
      level: block.level,
      markDefs: block.markDefs,
      children: (block.children ?? []).map((child, childIndex) => ({
        _type: 'span',
        _key: child._key ?? `${key}-span-${childIndex}`,
        text: child.text ?? '',
        marks: child.marks,
      })),
    });
  });
  return blocks;
}

function mapPosition(position: {
  x?: number;
  y?: number;
  tileWidth?: number;
  tileHeight?: number;
  rotation?: number;
}): {
  x: number;
  y: number;
  tileWidth: TileWidth;
  tileHeight?: TileWidth;
  rotation?: number;
} {
  const tileWidth = position.tileWidth;
  const tileHeight = position.tileHeight;
  return {
    x: position.x ?? 0,
    y: position.y ?? 0,
    tileWidth: tileWidth && isTileWidth(tileWidth) ? tileWidth : 128,
    tileHeight: tileHeight && isTileWidth(tileHeight) ? tileHeight : undefined,
    rotation: position.rotation,
  };
}

function mapGallery(
  items: SanityGalleryItem[] | null | undefined,
): GalleryItem[] {
  if (!items) {
    return [];
  }
  const gallery: GalleryItem[] = [];
  for (const item of items) {
    if (item._type === 'videoUrl' && 'url' in item && item.url) {
      gallery.push({ _type: 'videoUrl', url: item.url });
    } else if (item._type === 'image') {
      gallery.push({ _type: 'image', image: mapImage(item, 'Gallery still') });
    }
  }
  return gallery;
}

export function mapProject(doc: {
  _id: string;
  title?: string;
  client?: string;
  slug?: { current?: string };
  order?: number;
  hoverDescription?: string;
  heroVideoUrl?: string;
  featured?: boolean;
  canvasPosition?: {
    x?: number;
    y?: number;
    tileWidth?: number;
    tileHeight?: number;
    rotation?: number;
  };
  credits?: { role?: string; name?: string }[];
  thumbnail?: SanityImage;
  posterImage?: SanityImage;
  body?: SanityBlock[];
  gallery?: SanityGalleryItem[];
}): Project {
  const title = doc.title ?? 'Untitled';
  return {
    _id: doc._id,
    _type: 'project',
    title,
    client: doc.client ?? '',
    slug: { current: doc.slug?.current ?? doc._id },
    order: doc.order ?? 0,
    thumbnail: mapImage(doc.thumbnail, title),
    hoverDescription: doc.hoverDescription ?? '',
    heroVideoUrl: doc.heroVideoUrl ?? '',
    posterImage: mapImage(doc.posterImage, `${title} poster`),
    body: mapPortable(doc.body),
    credits: (doc.credits ?? []).flatMap((credit) =>
      credit.role && credit.name
        ? [{ role: credit.role, name: credit.name }]
        : [],
    ),
    gallery: mapGallery(doc.gallery),
    story: [],
    canvasPosition: mapPosition(doc.canvasPosition ?? {}),
    featured: Boolean(doc.featured),
  };
}

export function mapArticle(doc: {
  _id: string;
  title?: string;
  slug?: { current?: string };
  publishedAt?: string;
  hoverDescription?: string;
  excerpt?: string;
  canvasPosition?: {
    x?: number;
    y?: number;
    tileWidth?: number;
    tileHeight?: number;
    rotation?: number;
  };
  seo?: {
    title?: string;
    description?: string;
    ogImage?: SanityImage;
  };
  coverImage?: SanityImage;
  body?: SanityBlock[];
}): Article {
  const title = doc.title ?? 'Untitled';
  return {
    _id: doc._id,
    _type: 'article',
    title,
    slug: { current: doc.slug?.current ?? doc._id },
    publishedAt: doc.publishedAt ?? new Date(0).toISOString(),
    coverImage: mapImage(doc.coverImage, title),
    hoverDescription: doc.hoverDescription ?? '',
    excerpt: doc.excerpt ?? '',
    body: mapPortable(doc.body),
    canvasPosition: mapPosition(doc.canvasPosition ?? {}),
    seo: {
      title: doc.seo?.title,
      description: doc.seo?.description,
      ogImage: doc.seo?.ogImage ? mapImage(doc.seo.ogImage, title) : undefined,
    },
  };
}

const ABOUT_KEYS: AboutSectionKey[] = [
  'team',
  'process',
  'why',
  'services',
  'poem',
];

function isAboutKey(value: string): value is AboutSectionKey {
  return ABOUT_KEYS.includes(value as AboutSectionKey);
}

export function mapAboutSection(doc: {
  _id: string;
  key?: string;
  title?: string;
  hoverDescription?: string;
  canvasPosition?: {
    x?: number;
    y?: number;
    tileWidth?: number;
    tileHeight?: number;
    rotation?: number;
  };
  thumbnail?: SanityImage;
  body?: SanityBlock[];
  teamMembers?: { name?: string; role?: string; portrait?: SanityImage }[];
  processSteps?: {
    step?: number;
    title?: string;
    description?: string;
  }[];
  offer?: { statement?: string };
  services?: {
    title?: string;
    slug?: { current?: string };
    description?: string;
  }[];
  faqs?: { question?: string; answer?: string }[];
}): AboutSection {
  const key = doc.key && isAboutKey(doc.key) ? doc.key : 'why';
  const base = {
    _id: doc._id,
    _type: 'aboutSection' as const,
    title: doc.title ?? (key === 'poem' ? '' : key),
    hoverDescription: doc.hoverDescription ?? '',
    thumbnail: mapImage(
      doc.thumbnail,
      doc.title || (key === 'poem' ? 'About' : key),
    ),
    body: mapPortable(doc.body),
    canvasPosition: mapPosition(doc.canvasPosition ?? {}),
  };

  if (key === 'team') {
    return {
      ...base,
      key,
      teamMembers: (doc.teamMembers ?? []).flatMap((member) =>
        member.name && member.role
          ? [
              {
                name: member.name,
                role: member.role,
                portrait: mapImage(member.portrait, member.name),
              },
            ]
          : [],
      ),
    };
  }

  if (key === 'process') {
    return {
      ...base,
      key,
      processSteps: (doc.processSteps ?? []).flatMap((step) =>
        step.step && step.title && step.description
          ? [
              {
                step: step.step,
                title: step.title,
                description: step.description,
              },
            ]
          : [],
      ),
    };
  }

  if (key === 'poem') {
    return { ...base, key };
  }

  if (key === 'services') {
    return {
      ...base,
      key,
      ...(doc.offer?.statement
        ? {
            offer: { statement: doc.offer.statement },
          }
        : {}),
      services: (doc.services ?? []).flatMap((service) =>
        service.title && service.description
          ? [
              {
                title: service.title,
                slug: { current: service.slug?.current ?? service.title },
                description: service.description,
              },
            ]
          : [],
      ),
      faqs: (doc.faqs ?? []).flatMap((faq) =>
        faq.question && faq.answer
          ? [{ question: faq.question, answer: faq.answer }]
          : [],
      ),
    };
  }

  return { ...base, key: 'why' };
}

export function mapContact(doc: {
  _id: string;
  heading?: string;
  newBusinessName?: string;
  email?: string;
  formRecipient?: string;
  hoverDescription?: string;
  canvasPosition?: {
    x?: number;
    y?: number;
    tileWidth?: number;
    tileHeight?: number;
    rotation?: number;
  };
  thumbnail?: SanityImage;
}): ContactInfo {
  return {
    _id: doc._id,
    _type: 'contactInfo',
    heading: doc.heading ?? 'Contact',
    newBusinessName: doc.newBusinessName ?? '',
    email: doc.email ?? '',
    formRecipient: doc.formRecipient ?? doc.email ?? '',
    hoverDescription: doc.hoverDescription ?? '',
    thumbnail: mapImage(doc.thumbnail, 'Contact'),
    canvasPosition: mapPosition(doc.canvasPosition ?? {}),
  };
}

export function mapSettings(doc: {
  _id: string;
  wordmarkLeft?: string;
  wordmarkRight?: string;
  hubs?: {
    key?: string;
    label?: string;
    description?: string;
    canvasPosition?: {
      x?: number;
      y?: number;
      tileWidth?: number;
      tileHeight?: number;
      rotation?: number;
    };
  }[];
  ambientTiles?: {
    id?: string;
    opacity?: number;
    canvasPosition?: {
      x?: number;
      y?: number;
      tileWidth?: number;
      tileHeight?: number;
      rotation?: number;
    };
    image?: SanityImage;
  }[];
  defaultSeo?: {
    title?: string;
    description?: string;
    ogImage?: SanityImage;
  };
  socialLinks?: { label?: string; url?: string }[];
  poem?: SanityBlock[];
}): SiteSettings {
  return {
    _id: doc._id,
    _type: 'siteSettings',
    wordmarkLeft: doc.wordmarkLeft ?? 'Third',
    wordmarkRight: doc.wordmarkRight ?? 'Kind',
    hubs: (doc.hubs ?? []).flatMap((hub) => {
      if (
        hub.key !== 'work' &&
        hub.key !== 'thoughts' &&
        hub.key !== 'about' &&
        hub.key !== 'contact'
      ) {
        return [];
      }
      return [
        {
          key: hub.key,
          label: hub.label ?? hub.key,
          description: hub.description ?? '',
          canvasPosition: mapPosition(hub.canvasPosition ?? {}),
        },
      ];
    }),
    ambientTiles: (doc.ambientTiles ?? []).map((tile, index) => ({
      id: tile.id ?? `ambient-${index}`,
      image: mapImage(tile.image, 'Ambient texture'),
      canvasPosition: mapPosition(tile.canvasPosition ?? {}),
      opacity: tile.opacity ?? 0.3,
    })),
    defaultSeo: {
      title: doc.defaultSeo?.title,
      description: doc.defaultSeo?.description,
      ogImage: doc.defaultSeo?.ogImage
        ? mapImage(doc.defaultSeo.ogImage, 'Third Kind')
        : undefined,
    },
    socialLinks: (doc.socialLinks ?? []).flatMap((link) =>
      link.label && link.url ? [{ label: link.label, url: link.url }] : [],
    ),
    poem: mapPortable(doc.poem),
  };
}

export function mapSiteContent(raw: {
  settings?: Parameters<typeof mapSettings>[0] | null;
  projects?: Parameters<typeof mapProject>[0][] | null;
  articles?: Parameters<typeof mapArticle>[0][] | null;
  aboutSections?: Parameters<typeof mapAboutSection>[0][] | null;
  contact?: Parameters<typeof mapContact>[0] | null;
}): SiteContent | null {
  if (!raw.settings || !raw.contact) {
    return null;
  }
  return {
    settings: mapSettings(raw.settings),
    projects: (raw.projects ?? []).map(mapProject),
    articles: (raw.articles ?? []).map(mapArticle),
    aboutSections: (raw.aboutSections ?? []).map(mapAboutSection),
    contact: mapContact(raw.contact),
  };
}
