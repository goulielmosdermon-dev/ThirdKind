import type { CanvasPosition, CanvasNode, Viewport } from '@/types/content';

import type { Point } from '@/lib/canvas/coords';
import { screenToWorld, worldToScreen } from '@/lib/canvas/coords';
import type { ViewportSize } from '@/lib/canvas/viewport';

export type WorldRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const CULL_MARGIN = 0.25;

export function tileSize(position: CanvasPosition): {
  width: number;
  height: number;
} {
  return {
    width: position.tileWidth,
    height: position.tileHeight ?? position.tileWidth,
  };
}

export const HOVER_TILE_SCALE = 2;

/**
 * The rect a tile grows into on hover: twice as wide, at the decoded image's
 * own ratio, expanded from the centre. Shared so the tile and its caption
 * cannot disagree about where the tile actually is.
 */
export function hoverTileWorldRect(
  node: CanvasNode,
  aspects: Record<string, number>,
): WorldRect | null {
  if (node.kind !== 'leaf') {
    return null;
  }
  const { width, height } = tileSize(node.position);
  const ratio = aspects[node.id] ?? 1;
  const grownWidth = width * HOVER_TILE_SCALE;
  const grownHeight = grownWidth * ratio;
  return {
    x: node.position.x - (grownWidth - width) / 2,
    y: node.position.y - (grownHeight - height) / 2,
    width: grownWidth,
    height: grownHeight,
  };
}

export function tileCenter(position: CanvasPosition): Point {
  const { width, height } = tileSize(position);
  return {
    x: position.x + width / 2,
    y: position.y + height / 2,
  };
}

const HUB_COPY_WIDTH = 160;
const HUB_COPY_HEIGHT = 44;

export function spokeAnchor(node: CanvasNode, scale: number): Point {
  if (node.kind === 'hub') {
    return {
      x: node.position.x + HUB_COPY_WIDTH / (2 * scale),
      y: node.position.y + HUB_COPY_HEIGHT / (2 * scale),
    };
  }

  return tileCenter(node.position);
}

export function nodeWorldRect(node: CanvasNode, scale: number): WorldRect {
  if (node.kind === 'hub') {
    const inverse = 1 / scale;
    return {
      x: node.position.x,
      y: node.position.y,
      width: 320 * inverse,
      height: 96 * inverse,
    };
  }

  const { width, height } = tileSize(node.position);
  return {
    x: node.position.x,
    y: node.position.y,
    width,
    height,
  };
}

export function rectsIntersect(a: WorldRect, b: WorldRect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function visibleWorldRect(
  viewport: Viewport,
  size: ViewportSize,
  margin: number = CULL_MARGIN,
): WorldRect {
  const topLeft = screenToWorld({ x: 0, y: 0 }, viewport);
  const bottomRight = screenToWorld(
    { x: size.width, y: size.height },
    viewport,
  );
  const width = bottomRight.x - topLeft.x;
  const height = bottomRight.y - topLeft.y;
  const padX = width * margin;
  const padY = height * margin;
  return {
    x: topLeft.x - padX,
    y: topLeft.y - padY,
    width: width + padX * 2,
    height: height + padY * 2,
  };
}

export function isNodeInView(
  node: CanvasNode,
  view: WorldRect,
  scale: number,
): boolean {
  return rectsIntersect(nodeWorldRect(node, scale), view);
}

export function isWorldPointOnScreen(
  world: Point,
  viewport: Viewport,
  size: ViewportSize,
  padding = 72,
): boolean {
  const screen = worldToScreen(world, viewport);
  return (
    screen.x >= padding &&
    screen.y >= padding &&
    screen.x <= size.width - padding &&
    screen.y <= size.height - padding
  );
}

export const HOVER_CAPTION_WIDTH = 288;
export const HOVER_CAPTION_HEIGHT = 104;

export function overlapArea(a: WorldRect, b: WorldRect): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return width * height;
}

function worldRectToScreen(rect: WorldRect, viewport: Viewport): WorldRect {
  const topLeft = worldToScreen({ x: rect.x, y: rect.y }, viewport);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: rect.width * viewport.scale,
    height: rect.height * viewport.scale,
  };
}

function clampCaptionOrigin(
  origin: Point,
  size: ViewportSize,
  margin: number,
): Point {
  return {
    x: Math.min(
      size.width - HOVER_CAPTION_WIDTH - margin,
      Math.max(margin, origin.x),
    ),
    y: Math.min(
      size.height - HOVER_CAPTION_HEIGHT - margin,
      Math.max(margin, origin.y),
    ),
  };
}

export function pickAdjacentHoverCaptionScreen(
  hovered: CanvasNode,
  viewport: Viewport,
  size: ViewportSize,
): Point {
  const margin = 24;
  const gap = 10;
  const tile = worldRectToScreen(
    nodeWorldRect(hovered, viewport.scale),
    viewport,
  );
  return clampCaptionOrigin(
    { x: tile.x, y: tile.y + tile.height + gap },
    size,
    margin,
  );
}

export function pickHoverCaptionScreen(
  hovered: CanvasNode,
  _nodes: CanvasNode[],
  viewport: Viewport,
  size: ViewportSize,
  /** The tile's own world rect, when it differs from its resting size. */
  tileWorldRect?: WorldRect,
): Point {
  const margin = 24;
  const gap = 12;
  const tile = worldRectToScreen(
    tileWorldRect ?? nodeWorldRect(hovered, viewport.scale),
    viewport,
  );
  const chrome: WorldRect[] = [
    { x: 16, y: size.height - 72, width: 230, height: 52 },
    { x: size.width - 210, y: size.height - 80, width: 190, height: 64 },
  ];
  const tileCx = tile.x + tile.width / 2;
  const tileCy = tile.y + tile.height / 2;

  // Side first, vertically centred on the tile, then the corners. Stacking it
  // above or below is a last resort: those read as sitting on the image.
  const midY = tileCy - HOVER_CAPTION_HEIGHT / 2;
  const rightX = tile.x + tile.width + gap;
  const leftX = tile.x - HOVER_CAPTION_WIDTH - gap;
  const candidates: Array<Point & { beside: boolean }> = [
    { x: rightX, y: midY, beside: true },
    { x: leftX, y: midY, beside: true },
    { x: rightX, y: tile.y, beside: true },
    { x: leftX, y: tile.y, beside: true },
    { x: rightX, y: tile.y + tile.height - HOVER_CAPTION_HEIGHT, beside: true },
    { x: leftX, y: tile.y + tile.height - HOVER_CAPTION_HEIGHT, beside: true },
    { x: tile.x, y: tile.y + tile.height + gap, beside: false },
    { x: tile.x, y: tile.y - HOVER_CAPTION_HEIGHT - gap, beside: false },
  ].map((origin) => ({
    ...clampCaptionOrigin(origin, size, margin),
    beside: origin.beside,
  }));

  let best = candidates[0] ?? { x: margin, y: margin };
  let bestScore = Number.POSITIVE_INFINITY;

  for (const origin of candidates) {
    const caption = {
      x: origin.x,
      y: origin.y,
      width: HOVER_CAPTION_WIDTH,
      height: HOVER_CAPTION_HEIGHT,
    };
    const chromeHit = chrome.reduce(
      (sum, obstacle) => sum + overlapArea(caption, obstacle),
      0,
    );
    // Covering the image is the thing to avoid, so it outweighs everything.
    const tileHit = overlapArea(caption, tile);
    const distance = Math.hypot(
      origin.x + HOVER_CAPTION_WIDTH / 2 - tileCx,
      origin.y + HOVER_CAPTION_HEIGHT / 2 - tileCy,
    );
    // Beside the tile is the whole point, so stacking above or below is only
    // reached when neither side can sit clear of the image.
    const score =
      tileHit * 400 + chromeHit + distance * 12 + (origin.beside ? 0 : 1500);
    if (score < bestScore) {
      bestScore = score;
      best = origin;
    }
  }

  return best;
}
