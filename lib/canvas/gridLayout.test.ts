import { describe, expect, it } from 'vitest';

import type {
  CanvasNode,
  HubCanvasNode,
  LeafCanvasNode,
} from '@/types/content';

import {
  GRID_GAP,
  GRID_HEADER,
  GRID_TILE,
  gridLayout,
  isGridTagLeaf,
  sortGridTagLeaves,
} from '@/lib/canvas/gridLayout';

const hub = (
  key: 'work' | 'thoughts' | 'about' | 'contact',
  x: number,
): HubCanvasNode => ({
  id: `hub-${key}`,
  kind: 'hub',
  hubKey: key,
  label: key,
  description: '',
  position: { x, y: 0, tileWidth: 224 },
});

const leaf = (
  id: string,
  hubKey: 'work' | 'thoughts' | 'about' | 'contact',
  x: number,
): LeafCanvasNode => ({
  id,
  kind: 'leaf',
  hubKey,
  href: `/${hubKey}/${id}`,
  title: id,
  hoverDescription: '',
  thumbnail: { src: '/x.jpg', alt: id, width: 100, height: 100 },
  documentId: id,
  position: { x, y: 10, tileWidth: 96 },
});

describe('gridLayout', () => {
  it('places hubs in a 2x2 and tiles on a regular grid', () => {
    const nodes: CanvasNode[] = [
      hub('work', 10),
      hub('thoughts', 20),
      hub('about', 30),
      hub('contact', 40),
      leaf('w1', 'work', 1),
      leaf('w2', 'work', 2),
      leaf('t1', 'thoughts', 3),
      leaf('a1', 'about', 4),
      leaf('c1', 'contact', 5),
    ];
    const { positions, bounds } = gridLayout(nodes);

    const workHub = positions.get('hub-work');
    const thoughtsHub = positions.get('hub-thoughts');
    const aboutHub = positions.get('hub-about');
    expect(workHub).toBeDefined();
    expect(thoughtsHub?.x).toBeGreaterThan(workHub!.x);
    expect(aboutHub?.y).toBeGreaterThan(workHub!.y);

    const w1 = positions.get('w1');
    const w2 = positions.get('w2');
    expect(w1?.tileWidth).toBe(GRID_TILE);
    expect(w1?.y).toBe((workHub?.y ?? 0) + GRID_HEADER);
    expect(w2?.x).toBe((w1?.x ?? 0) + GRID_TILE + GRID_GAP);
    expect(w2?.y).toBe(w1?.y);
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);
  });

  it('places the poem swatch with Thoughts in grid', () => {
    const nodes: CanvasNode[] = [
      hub('work', 10),
      hub('thoughts', 20),
      hub('about', 30),
      hub('contact', 40),
      leaf('t1', 'thoughts', 3),
      {
        ...leaf('poem', 'about', 4),
        href: '/about/poem',
        title: '',
      },
    ];
    const { positions } = gridLayout(nodes);
    const thoughtsHub = positions.get('hub-thoughts');
    const t1 = positions.get('t1');
    const poem = positions.get('poem');
    expect(poem?.y).toBe(t1?.y);
    expect(poem?.x).toBe((t1?.x ?? 0) + GRID_TILE + GRID_GAP);
    expect(poem?.y).toBe((thoughtsHub?.y ?? 0) + GRID_HEADER);
  });

  it('treats titled about and contact leaves as grid tags', () => {
    expect(isGridTagLeaf(leaf('team', 'about', 1))).toBe(true);
    expect(isGridTagLeaf(leaf('new-business', 'contact', 2))).toBe(true);
    expect(isGridTagLeaf(leaf('w1', 'work', 3))).toBe(false);
    expect(
      isGridTagLeaf({
        ...leaf('poem', 'about', 4),
        title: '   ',
      }),
    ).toBe(false);
  });

  it('orders about tags to match the site menu', () => {
    const ordered = sortGridTagLeaves([
      { ...leaf('services', 'about', 1), href: '/about/services', title: 'Services' },
      { ...leaf('team', 'about', 2), href: '/about/team', title: 'Team' },
      { ...leaf('why', 'about', 3), href: '/about/why', title: 'Why' },
      { ...leaf('process', 'about', 4), href: '/about/process', title: 'Process' },
    ]);
    expect(ordered.map((node) => node.title)).toEqual([
      'Team',
      'Process',
      'Why',
      'Services',
    ]);
  });
});
