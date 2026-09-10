import { describe, expect, it } from 'vitest';

import type { LeafCanvasNode } from '@/types/content';

import {
  editorialCopy,
  editorialLeaves,
  editorialThoughts,
} from '@/lib/canvas/editorial';

const leaf = (
  overrides: Partial<LeafCanvasNode> &
    Pick<LeafCanvasNode, 'id' | 'hubKey' | 'title'>,
): LeafCanvasNode => ({
  kind: 'leaf',
  href: '/x',
  hoverDescription: '',
  thumbnail: { src: '/x.jpg', alt: 'x', width: 100, height: 100 },
  documentId: overrides.id,
  position: { x: 0, y: 0, tileWidth: 96 },
  ...overrides,
});

describe('editorialCopy', () => {
  it('uses the hover line and client for work', () => {
    expect(
      editorialCopy(
        leaf({
          id: 'w1',
          hubKey: 'work',
          title: 'Scania — Vehicle E-Wallet',
          hoverDescription: 'A fleet film about paying for the road.',
        }),
      ),
    ).toEqual({
      line: 'A fleet film about paying for the road.',
      name: 'Scania',
    });
  });

  it('uses the title for thoughts', () => {
    expect(
      editorialCopy(
        leaf({
          id: 't1',
          hubKey: 'thoughts',
          title: 'Why Storytelling Wins',
          hoverDescription: 'Messages expire. Stories compound.',
        }),
      ),
    ).toEqual({
      line: 'Why Storytelling Wins',
      name: '',
    });
  });
});

describe('editorialLeaves', () => {
  it('keeps only work — the writing runs in a list of its own', () => {
    const nodes = [
      leaf({ id: 'w1', hubKey: 'work', title: 'W' }),
      leaf({ id: 'a1', hubKey: 'about', title: 'About' }),
      leaf({ id: 't1', hubKey: 'thoughts', title: 'T' }),
    ];
    expect(editorialLeaves(nodes).map((node) => node.id)).toEqual(['w1']);
    expect(editorialThoughts(nodes).map((node) => node.id)).toEqual(['t1']);
  });

  it('orders featured work for the index', () => {
    const leaves = editorialLeaves([
      leaf({
        id: 'ilana',
        hubKey: 'work',
        title: 'Ilana',
        href: '/work/ilana',
      }),
      leaf({
        id: 'noir',
        hubKey: 'work',
        title: 'Noir Gaze',
        href: '/work/noirgaze',
      }),
      leaf({
        id: 'sales',
        hubKey: 'work',
        title: 'Scytáles — Internal Sales',
        href: '/work/scytales',
      }),
      leaf({
        id: 'up',
        hubKey: 'work',
        title: 'UP Hellas',
        href: '/work/up-hellas',
      }),
      leaf({
        id: 'auth',
        hubKey: 'work',
        title: 'Scytáles — ID Authentication',
        href: '/work/scytales-2',
      }),
      leaf({
        id: 'scania',
        hubKey: 'work',
        title: 'Scania',
        href: '/work/scania',
      }),
      leaf({
        id: 'rap',
        hubKey: 'work',
        title: 'Rap Therapy',
        href: '/work/rap-therapy',
      }),
      leaf({
        id: 'idea',
        hubKey: 'thoughts',
        title: 'An idea',
        href: '/thoughts/an-idea',
      }),
    ]);
    expect(leaves.map((node) => node.id)).toEqual([
      'scania',
      'up',
      'auth',
      'sales',
      'ilana',
      'rap',
      'noir',
    ]);
  });
});
