import { notFound } from 'next/navigation';

import { fetchSiteContent } from '@/sanity/lib/fetch';
import type {
  AboutSection,
  AboutSectionKey,
  Article,
  ContactInfo,
  Project,
  SiteContent,
} from '@/types/content';

export const ABOUT_KEYS = ['team', 'process', 'why', 'services'] as const;

export async function getSiteContent(): Promise<SiteContent> {
  return fetchSiteContent();
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

export async function adjacentProjects(slug: string): Promise<{
  prev: Project | undefined;
  next: Project | undefined;
}> {
  const { projects } = await getSiteContent();
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((project) => project.slug.current === slug);
  if (index < 0) {
    return { prev: undefined, next: undefined };
  }
  return {
    prev: ordered[index - 1],
    next: ordered[index + 1],
  };
}

export async function projectStaticParams(): Promise<{ slug: string }[]> {
  const { projects } = await getSiteContent();
  return projects.map((project) => ({ slug: project.slug.current }));
}

export async function articleStaticParams(): Promise<{ slug: string }[]> {
  const { articles } = await getSiteContent();
  return articles.map((article) => ({ slug: article.slug.current }));
}

export function aboutStaticParams(): { section: AboutSectionKey }[] {
  return ABOUT_KEYS.map((section) => ({ section }));
}
