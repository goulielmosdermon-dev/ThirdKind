import { describe, expect, it } from 'vitest';

import { canvasNodes, edges, siteContent } from '@/lib/fixtures/content';
import {
  TILE_WIDTHS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type TileWidth,
} from '@/types/content';

const HOVER_MAX = 90;
const tileWidthSet = new Set<TileWidth>(TILE_WIDTHS);

describe('site fixtures', () => {
  it('covers the launch catalogue', () => {
    expect(siteContent.projects).toHaveLength(10);
    expect(siteContent.articles).toHaveLength(10);
    expect(siteContent.aboutSections).toHaveLength(5);
    expect(siteContent.settings.hubs).toHaveLength(4);
    expect(siteContent.contact.email).toBe('goulielmos@thirdkindcreative.com');
  });

  it('keeps slugs unique and hover lines within 90 characters', () => {
    const projectSlugs = siteContent.projects.map((item) => item.slug.current);
    const articleSlugs = siteContent.articles.map((item) => item.slug.current);

    expect(new Set(projectSlugs).size).toBe(projectSlugs.length);
    expect(new Set(articleSlugs).size).toBe(articleSlugs.length);

    const hoverLines = [
      ...siteContent.projects.map((item) => item.hoverDescription),
      ...siteContent.articles.map((item) => item.hoverDescription),
      ...siteContent.aboutSections.map((item) => item.hoverDescription),
      siteContent.contact.hoverDescription,
    ];

    for (const line of hoverLines) {
      expect(line.length).toBeLessThanOrEqual(HOVER_MAX);
    }
  });

  it('places every canvas node inside the world with a legal tile width', () => {
    for (const node of canvasNodes) {
      const { x, y, tileWidth, tileHeight } = node.position;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(WORLD_WIDTH);
      expect(y).toBeLessThan(WORLD_HEIGHT);
      expect(tileWidthSet.has(tileWidth)).toBe(true);
      if (tileHeight !== undefined) {
        expect(tileWidthSet.has(tileHeight)).toBe(true);
      }
    }
  });

  it('does not reuse a project hero still in its gallery', () => {
    for (const project of siteContent.projects) {
      const gallerySrcs = project.gallery.flatMap((item) =>
        item._type === 'image' ? [item.image.src] : [],
      );
      expect(gallerySrcs).not.toContain(project.posterImage.src);
    }
  });

  it('uses the live-site Services lists as project credits', () => {
    const bySlug = Object.fromEntries(
      siteContent.projects.map((project) => [
        project.slug.current,
        project.credits.map((credit) => credit.role),
      ]),
    );
    expect(bySlug['scytales-2']).toEqual([
      'Creative',
      'Production',
      'Post-Production',
      'VFX',
    ]);
    expect(bySlug.scania).toEqual([
      'Creative',
      'Production',
      'Post-Production',
      'VFX',
    ]);
    expect(bySlug.scytales).toEqual(['Production', 'Post-Production']);
    expect(bySlug['up-hellas']).toEqual([
      'Creative',
      'Production',
      'Post-Production',
      'VFX',
      'Graphic Design',
    ]);
    expect(bySlug['augustine-jewels']).toEqual([
      'Creative',
      'Production',
      'Post Production',
      'Visual Effects',
    ]);
    expect(bySlug.ilana).toEqual(['Creative', 'Production', 'Post-Production']);
    expect(bySlug['rap-therapy']).toEqual([
      'Creative',
      'Production',
      'Post Production',
    ]);
    expect(bySlug['oldboy-brand']).toEqual(['Production', 'Post Production']);
    expect(bySlug.noirgaze).toEqual(['Production', 'Post Production']);
    expect(bySlug['a-m']).toEqual(['Production', 'Post-Production']);
  });

  it('derives a spoke per leaf plus bridges between neighbouring hubs', () => {
    const leafIds = canvasNodes
      .filter((node) => node.kind === 'leaf')
      .map((node) => node.id);
    const spokes = edges.filter((edge) => edge.kind === 'spoke');
    const spine = edges.filter((edge) => edge.kind === 'related');

    for (const id of leafIds) {
      expect(spokes.some((edge) => edge.toNodeId === id)).toBe(true);
    }
    expect(spokes.length).toBeGreaterThan(leafIds.length);
    expect(spine.length).toBeGreaterThan(0);
  });
});
