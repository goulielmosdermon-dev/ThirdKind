import type {
  CanvasNode,
  CanvasPosition,
  HubKey,
  LeafCanvasNode,
  TileWidth,
} from '@/types/content';
import { HUB_KEYS } from '@/types/content';

import type { WorldRect } from '@/lib/canvas/geometry';
import { leafReadingOrder } from '@/lib/canvas/readingOrder';
import { INITIAL_FOCUS_WORLD } from '@/lib/canvas/viewport';

export const GRID_TILE: TileWidth = 176;
export const GRID_GAP = 16;
export const GRID_HEADER = 88;
export const GRID_SECTION_PAD = 48;
export const GRID_COLS = 4;

const SECTION_ORDER: HubKey[] = [...HUB_KEYS];

const ABOUT_TAG_HREF_ORDER = [
  '/about/team',
  '/about/process',
  '/about/why',
  '/about/services',
] as const;

export function isPoemLeaf(node: LeafCanvasNode): boolean {
  return node.href === '/about/poem';
}

export function isGridTagLeaf(node: LeafCanvasNode): boolean {
  return (
    (node.hubKey === 'about' || node.hubKey === 'contact') &&
    !isPoemLeaf(node) &&
    node.title.trim().length > 0
  );
}

export function gridSectionKey(node: LeafCanvasNode): HubKey {
  return isPoemLeaf(node) ? 'thoughts' : node.hubKey;
}

export function sortGridTagLeaves(
  leaves: LeafCanvasNode[],
): LeafCanvasNode[] {
  return [...leaves].sort((a, b) => {
    const aRank = ABOUT_TAG_HREF_ORDER.findIndex((href) => href === a.href);
    const bRank = ABOUT_TAG_HREF_ORDER.findIndex((href) => href === b.href);
    return (aRank === -1 ? 99 : aRank) - (bRank === -1 ? 99 : bRank);
  });
}

export function gridLayout(nodes: CanvasNode[]): {
  positions: Map<string, CanvasPosition>;
  bounds: WorldRect;
} {
  const leaves = leafReadingOrder(nodes);
  const byHub = new Map<HubKey, LeafCanvasNode[]>(
    SECTION_ORDER.map((key) => [key, []]),
  );
  for (const leaf of leaves) {
    byHub.get(gridSectionKey(leaf))?.push(leaf);
  }

  const maxCount = Math.max(
    ...SECTION_ORDER.map((key) => byHub.get(key)?.length ?? 0),
    1,
  );
  const rows = Math.ceil(maxCount / GRID_COLS);
  const innerW = GRID_COLS * GRID_TILE + (GRID_COLS - 1) * GRID_GAP;
  const innerH =
    GRID_HEADER + rows * GRID_TILE + Math.max(0, rows - 1) * GRID_GAP;
  const quadW = innerW + GRID_SECTION_PAD * 2;
  const quadH = innerH + GRID_SECTION_PAD * 2;
  const totalW = quadW * 2;
  const totalH = quadH * 2;
  const originX = INITIAL_FOCUS_WORLD.x - totalW / 2;
  const originY = INITIAL_FOCUS_WORLD.y - totalH / 2;

  const positions = new Map<string, CanvasPosition>();

  SECTION_ORDER.forEach((key, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const sx = originX + col * quadW + GRID_SECTION_PAD;
    const sy = originY + row * quadH + GRID_SECTION_PAD;
    const hub = nodes.find(
      (node) => node.kind === 'hub' && node.hubKey === key,
    );
    if (hub) {
      positions.set(hub.id, {
        x: sx,
        y: sy,
        tileWidth: GRID_TILE,
        rotation: 0,
      });
    }

    (byHub.get(key) ?? []).forEach((leaf, leafIndex) => {
      const c = leafIndex % GRID_COLS;
      const r = Math.floor(leafIndex / GRID_COLS);
      positions.set(leaf.id, {
        x: sx + c * (GRID_TILE + GRID_GAP),
        y: sy + GRID_HEADER + r * (GRID_TILE + GRID_GAP),
        tileWidth: GRID_TILE,
        rotation: 0,
      });
    });
  });

  return {
    positions,
    bounds: { x: originX, y: originY, width: totalW, height: totalH },
  };
}
