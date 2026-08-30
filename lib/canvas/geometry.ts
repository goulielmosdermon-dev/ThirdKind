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

export function tileCenter(position: CanvasPosition): Point {
  return {
    x: position.x + position.tileWidth / 2,
    y: position.y + position.tileWidth / 2,
  };
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

  return {
    x: node.position.x,
    y: node.position.y,
    width: node.position.tileWidth,
    height: node.position.tileWidth,
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
