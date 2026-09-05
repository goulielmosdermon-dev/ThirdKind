import { notFound } from 'next/navigation';

import { fetchSiteContent } from '@/sanity/lib/fetch';
import type {
  AboutSection,
  AboutSectionKey,
  Article,
  ContactInfo,
  Hub,
  HubKey,
  Project,
  SiteContent,
} from '@/types/content';

export const ABOUT_KEYS = [
  'team',
  'process',
  'why',
  'services',
  'poem',
] as const;

/**
 * About sections hidden from the site. The content and its route handler stay
 * in place; they are simply filtered out before anything renders, so the
 * section disappears from the canvas, the nav, and the static params at once.
 */
const HIDDEN_ABOUT_KEYS: readonly AboutSectionKey[] = ['process'];

function isHiddenAboutKey(key: AboutSectionKey): boolean {
  return HIDDEN_ABOUT_KEYS.includes(key);
}

export async function getSiteContent(): Promise<SiteContent> {
  const content = await fetchSiteContent();
  return {
    ...content,
    aboutSections: content.aboutSections.filter(
      (section) => !isHiddenAboutKey(section.key),
    ),
  };
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const { projects } = await getSiteContent();
  return projects.find((project) => project.slug.current === slug);
}

export async function requireProject(slug: string): Promise<Project> {
  const project = await getProject(slug);
  if (!project) {
    notFound();
  }
  return project;
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const { articles } = await getSiteContent();
  return articles.find((article) => article.slug.current === slug);
}

export async function requireArticle(slug: string): Promise<Article> {
  const article = await getArticle(slug);
  if (!article) {
    notFound();
  }
  return article;
}

export async function getAboutSection(
  key: string,
): Promise<AboutSection | undefined> {
  const { aboutSections } = await getSiteContent();
  return aboutSections.find((section) => section.key === key);
}

export async function requireAboutSection(key: string): Promise<AboutSection> {
  const section = await getAboutSection(key);
  if (!section) {
    notFound();
  }
  return section;
}

export function isAboutKey(key: string): key is AboutSectionKey {
  return (ABOUT_KEYS as readonly string[]).includes(key);
}

export async function getContact(): Promise<ContactInfo> {
  const { contact } = await getSiteContent();
  return contact;
}

export async function allProjects(): Promise<Project[]> {
  const { projects } = await getSiteContent();
  return [...projects].sort((a, b) => a.order - b.order);
}

export async function projectStaticParams(): Promise<{ slug: string }[]> {
  const { projects } = await getSiteContent();
  return projects.map((project) => ({ slug: project.slug.current }));
}

export async function allArticles(): Promise<Article[]> {
  const { articles } = await getSiteContent();
  return [...articles].sort(
    (left, right) =>
      Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
  );
}

/** The hub blurb doubles as the standfirst on each index page. */
export async function getHub(key: HubKey): Promise<Hub | undefined> {
  const { settings } = await getSiteContent();
  return settings.hubs.find((hub) => hub.key === key);
}

export async function articleByline(): Promise<{
  name: string;
  role: string;
  linkedInUrl?: string;
}> {
  const { aboutSections, contact, settings } = await getSiteContent();
  const lead = aboutSections.find((section) => section.key === 'team')
    ?.teamMembers[0];
  const linkedIn = settings.socialLinks.find((link) =>
    /linkedin/i.test(`${link.label} ${link.url}`),
  );
  return {
    name: lead?.name ?? contact.newBusinessName,
    role: lead?.role ?? 'Creative Director',
    linkedInUrl: linkedIn?.url,
  };
}

export async function articleStaticParams(): Promise<{ slug: string }[]> {
  const { articles } = await getSiteContent();
  return articles.map((article) => ({ slug: article.slug.current }));
}

export function aboutStaticParams(): { section: AboutSectionKey }[] {
  return ABOUT_KEYS.filter((key) => !isHiddenAboutKey(key)).map(
    (section) => ({ section }),
  );
}
