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

export function editorialLeaves(nodes: CanvasNode[]): LeafCanvasNode[] {
  const leaves = leafReadingOrder(nodes).filter(
    (node) => node.hubKey === 'work' || node.hubKey === 'thoughts',
  );
  const work = leaves.filter((node) => node.hubKey === 'work');
  const thoughts = leaves.filter((node) => node.hubKey === 'thoughts');
  const ranked = [...work].sort((a, b) => {
    const aRank = INDEX_WORK_ORDER.findIndex((href) => href === a.href);
    const bRank = INDEX_WORK_ORDER.findIndex((href) => href === b.href);
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });
  return [...ranked, ...thoughts];
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

  return {
    line: node.hoverDescription || node.title,
    name: '',
  };
}
