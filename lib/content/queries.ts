import { notFound } from 'next/navigation';

import { siteContent } from '@/lib/fixtures/content';
import type {
  AboutSection,
  AboutSectionKey,
  Article,
  ContactInfo,
  Project,
} from '@/types/content';

export const ABOUT_KEYS = ['team', 'process', 'why', 'services'] as const;

export function getProject(slug: string): Project | undefined {
  return siteContent.projects.find((project) => project.slug.current === slug);
}

export function requireProject(slug: string): Project {
  const project = getProject(slug);
  if (!project) {
    notFound();
  }
  return project;
}

export function getArticle(slug: string): Article | undefined {
  return siteContent.articles.find((article) => article.slug.current === slug);
}

export function requireArticle(slug: string): Article {
  const article = getArticle(slug);
  if (!article) {
    notFound();
  }
  return article;
}

export function getAboutSection(key: string): AboutSection | undefined {
  return siteContent.aboutSections.find((section) => section.key === key);
}

export function requireAboutSection(key: string): AboutSection {
  const section = getAboutSection(key);
  if (!section) {
    notFound();
  }
  return section;
}

export function isAboutKey(key: string): key is AboutSectionKey {
  return (ABOUT_KEYS as readonly string[]).includes(key);
}

export function getContact(): ContactInfo {
  return siteContent.contact;
}

export function adjacentProjects(slug: string): {
  prev: Project | undefined;
  next: Project | undefined;
} {
  const ordered = [...siteContent.projects].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((project) => project.slug.current === slug);
  if (index < 0) {
    return { prev: undefined, next: undefined };
  }
  return {
    prev: ordered[index - 1],
    next: ordered[index + 1],
  };
}

export function projectStaticParams(): { slug: string }[] {
  return siteContent.projects.map((project) => ({
    slug: project.slug.current,
  }));
}

export function articleStaticParams(): { slug: string }[] {
  return siteContent.articles.map((article) => ({
    slug: article.slug.current,
  }));
}

export function aboutStaticParams(): { section: AboutSectionKey }[] {
  return ABOUT_KEYS.map((section) => ({ section }));
}
