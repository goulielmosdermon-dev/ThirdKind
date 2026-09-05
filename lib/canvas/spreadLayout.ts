import {
  TILE_WIDTHS,
  type CanvasNode,
  type HubKey,
  type LeafCanvasNode,
  type TileWidth,
} from '@/types/content';
import { HUB_KEYS } from '@/types/content';

import type { WorldRect } from '@/lib/canvas/geometry';
import { gridSectionKey } from '@/lib/canvas/gridLayout';
import { leafReadingOrder } from '@/lib/canvas/readingOrder';
import { INITIAL_FOCUS_WORLD } from '@/lib/canvas/viewport';

/** Nominal cell the jitter is applied inside. */
export const SPREAD_CELL = 300;
export const SPREAD_COLS = 4;
/** The hub label occupies one cell at the centre of its section. */
export const SPREAD_SECTION_PAD = 100;
/** How far a tile may wander from its cell centre, in px. */
export const SPREAD_JITTER = 30;
/** How far a whole section may sit off the 2x2 axis, in px. */
export const SPREAD_SECTION_JITTER = 110;

const SECTION_ORDER: HubKey[] = [...HUB_KEYS];

/**
 * Art direction: a label may be nudged off its reserved cell. About reads
 * better sitting above and right of the yellow tile than beside it.
 */
const LABEL_NUDGE: Partial<Record<HubKey, { x: number; y: number }>> = {
  about: { x: SPREAD_CELL * 1.8, y: -SPREAD_CELL * 0.8 },
};

/**
 * Deterministic 0..1 from an id, so a tile lands in the same place on every
 * render and between server and client — Math.random would hydrate wrong.
 */
function hash01(id: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/** One step up the authored ladder, so Matrix 2 reads slightly larger. */
export function enlargeTile(width: TileWidth): TileWidth {
  const index = TILE_WIDTHS.indexOf(width);
  if (index === -1) {
    return width;
  }
  return TILE_WIDTHS[Math.min(TILE_WIDTHS.length - 1, index + 1)] ?? width;
}

/**
 * A calmer relative of the constellation: every leaf keeps its hub, but the
 * sections sit in four quadrants and tiles land on a grid that is nudged off
 * true, so the arrangement reads as ordered without looking typeset.
 */
export function spreadLayout(nodes: CanvasNode[]): {
  nodes: CanvasNode[];
  bounds: WorldRect;
} {
  const leaves = leafReadingOrder(nodes);
  const byHub = new Map<HubKey, LeafCanvasNode[]>(
    SECTION_ORDER.map((key) => [key, []]),
  );
  for (const leaf of leaves) {
    byHub.get(gridSectionKey(leaf))?.push(leaf);
  }

  // +1 for the hub label, which sits in a cell of its own at the centre.
  const rowsFor = (key: HubKey) =>
    Math.max(1, Math.ceil(((byHub.get(key)?.length ?? 0) + 1) / SPREAD_COLS));

  // Each band is only as tall as the busier of its two sections, so a small
  // section like Contact does not leave a quadrant of empty world behind it.
  const bandRows = [
    Math.max(rowsFor(SECTION_ORDER[0]!), rowsFor(SECTION_ORDER[1]!)),
    Math.max(rowsFor(SECTION_ORDER[2]!), rowsFor(SECTION_ORDER[3]!)),
  ];
  const bandHeight = bandRows.map(
    (rows) => rows * SPREAD_CELL + SPREAD_SECTION_PAD * 2,
  );
  const quadW = SPREAD_COLS * SPREAD_CELL + SPREAD_SECTION_PAD * 2;
  const totalW = quadW * 2;
  const totalH = bandHeight.reduce((sum, height) => sum + height, 0);
  const originX = INITIAL_FOCUS_WORLD.x - totalW / 2;
  const originY = INITIAL_FOCUS_WORLD.y - totalH / 2;

  const placed = new Map<string, CanvasNode>();

  SECTION_ORDER.forEach((key, index) => {
    const band = Math.floor(index / 2);
    // Nudge the whole section off the quadrant grid so the four clusters do
    // not read as a perfect square.
    const offsetX = (hash01(key, 11) - 0.5) * 2 * SPREAD_SECTION_JITTER;
    const offsetY = (hash01(key, 12) - 0.5) * 2 * SPREAD_SECTION_JITTER;
    const sx =
      originX + (index % 2) * quadW + SPREAD_SECTION_PAD + offsetX;
    const sy =
      originY +
      (band === 0 ? 0 : bandHeight[0]!) +
      SPREAD_SECTION_PAD +
      offsetY;

    const sectionLeaves = byHub.get(key) ?? [];
    const rows = Math.max(
      1,
      Math.ceil((sectionLeaves.length + 1) / SPREAD_COLS),
    );
    // Reserve the middle cell so the label sits inside its own cluster
    // rather than heading it, the way the constellation reads.
    const labelRow = Math.floor((rows - 1) / 2);
    const labelCol = Math.floor((SPREAD_COLS - 1) / 2);
    const labelCell = labelRow * SPREAD_COLS + labelCol;

    const cellOrigin = (cell: number) => ({
      x: sx + (cell % SPREAD_COLS) * SPREAD_CELL,
      y: sy + Math.floor(cell / SPREAD_COLS) * SPREAD_CELL,
    });

    const hub = nodes.find(
      (node) => node.kind === 'hub' && node.hubKey === key,
    );
    if (hub) {
      const at = cellOrigin(labelCell);
      const nudge = LABEL_NUDGE[key] ?? { x: 0, y: 0 };
      placed.set(hub.id, {
        ...hub,
        position: {
          ...hub.position,
          x: at.x + nudge.x,
          y: at.y + SPREAD_CELL / 2 + nudge.y,
          rotation: 0,
        },
      });
    }

    let cell = 0;
    sectionLeaves.forEach((leaf) => {
      if (cell === labelCell) {
        cell += 1;
      }
      const at = cellOrigin(cell);
      cell += 1;

      const tileWidth = enlargeTile(leaf.position.tileWidth);
      const slack = Math.max(0, SPREAD_CELL - tileWidth) / 2;
      const jitterX = (hash01(leaf.id, 1) - 0.5) * 2 * SPREAD_JITTER;
      const jitterY = (hash01(leaf.id, 2) - 0.5) * 2 * SPREAD_JITTER;

      placed.set(leaf.id, {
        ...leaf,
        position: {
          ...leaf.position,
          x: at.x + slack + jitterX,
          y: at.y + slack + jitterY,
          tileWidth,
          rotation: 0,
        },
      });
    });
  });

  return {
    // Anything the sections do not claim (ambient tiles) is dropped, so the
    // view only ever shows work filed under a hub.
    nodes: nodes.flatMap((node) => {
      const next = placed.get(node.id);
      return next ? [next] : [];
    }),
    bounds: {
      x: originX - SPREAD_SECTION_JITTER,
      y: originY - SPREAD_SECTION_JITTER,
      width: totalW + SPREAD_SECTION_JITTER * 2,
      height: totalH + SPREAD_SECTION_JITTER * 2,
    },
  };
}
