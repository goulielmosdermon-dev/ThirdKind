import type { CanvasNode, LeafCanvasNode } from '@/types/content';

import { leafReadingOrder } from '@/lib/canvas/readingOrder';

/**
 * The four the index carries, in order. The rest of the work is still on the
 * canvas and in the Work sheet; this is the run the page reads.
 */
const INDEX_WORK_ORDER = [
  '/work/scania',
  '/work/up-hellas',
  '/work/scytales-2',
  '/work/rap-therapy',
] as const;

/**
 * The index proper is the work, and only the work. The writing follows it in
 * a list of its own — see editorialThoughts — rather than carrying on in the
 * same run of pictures.
 */
export function editorialLeaves(nodes: CanvasNode[]): LeafCanvasNode[] {
  const work = leafReadingOrder(nodes).filter((node) => node.hubKey === 'work');
  return INDEX_WORK_ORDER.map((href) =>
    work.find((node) => node.href === href),
  ).filter((node): node is LeafCanvasNode => Boolean(node));
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
