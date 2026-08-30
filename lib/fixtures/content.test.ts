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
    expect(siteContent.aboutSections).toHaveLength(4);
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
      const { x, y, tileWidth } = node.position;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(WORLD_WIDTH);
      expect(y).toBeLessThan(WORLD_HEIGHT);
      expect(tileWidthSet.has(tileWidth)).toBe(true);
    }
  });

  it('derives one spoke edge per leaf', () => {
    const leafCount = canvasNodes.filter((node) => node.kind === 'leaf').length;
    expect(edges).toHaveLength(leafCount);
    expect(edges.every((edge) => edge.kind === 'spoke')).toBe(true);
  });
});
