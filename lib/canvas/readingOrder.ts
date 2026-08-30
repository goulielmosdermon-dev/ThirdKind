import type { CanvasNode, LeafCanvasNode } from '@/types/content';
import { HUB_KEYS } from '@/types/content';

const hubRank = new Map(HUB_KEYS.map((key, index) => [key, index]));

export function leafReadingOrder(nodes: CanvasNode[]): LeafCanvasNode[] {
  const leaves = nodes.filter(
    (node): node is LeafCanvasNode => node.kind === 'leaf',
  );

  return [...leaves].sort((a, b) => {
    const hubDelta =
      (hubRank.get(a.hubKey) ?? 0) - (hubRank.get(b.hubKey) ?? 0);
    if (hubDelta !== 0) {
      return hubDelta;
    }
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });
}
