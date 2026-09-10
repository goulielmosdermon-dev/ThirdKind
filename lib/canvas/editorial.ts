import type { CanvasNode, LeafCanvasNode } from '@/types/content';

import { leafReadingOrder } from '@/lib/canvas/readingOrder';

const INDEX_WORK_ORDER = [
  '/work/scania',
  '/work/up-hellas',
  '/work/scytales-2',
  '/work/scytales',
  '/work/ilana',
  '/work/rap-therapy',
] as const;

/**
 * The index proper is the work, and only the work. The writing follows it in
 * a list of its own — see editorialThoughts — rather than carrying on in the
 * same run of pictures.
 */
export function editorialLeaves(nodes: CanvasNode[]): LeafCanvasNode[] {
  const work = leafReadingOrder(nodes).filter((node) => node.hubKey === 'work');
  return [...work].sort((a, b) => {
    const aRank = INDEX_WORK_ORDER.findIndex((href) => href === a.href);
    const bRank = INDEX_WORK_ORDER.findIndex((href) => href === b.href);
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });
}

/** The writing, in reading order, for the list under the work. */
export function editorialThoughts(nodes: CanvasNode[]): LeafCanvasNode[] {
  return leafReadingOrder(nodes).filter((node) => node.hubKey === 'thoughts');
}

export function editorialCopy(node: LeafCanvasNode): {
  line: string;
  name: string;
} {
  if (node.hubKey === 'work') {
    const [client] = node.title.split(' — ');
    return {
      line: node.hoverDescription || node.title,
      name: client?.trim() ?? '',
    };
  }

  // A piece of writing goes in the index under its own title — the same line
  // the page opens on — rather than the hover précis the canvas uses.
  return {
    line: node.title || node.hoverDescription,
    name: '',
  };
}
