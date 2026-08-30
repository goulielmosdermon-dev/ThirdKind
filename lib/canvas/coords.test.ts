import { describe, expect, it } from 'vitest';

import { screenToWorld, worldToScreen } from '@/lib/canvas/coords';
import type { Viewport } from '@/types/content';

const viewport: Viewport = { x: 40, y: -20, scale: 1.5 };

describe('screen ↔ world', () => {
  it('converts world to screen with translate then scale origin 0 0', () => {
    expect(worldToScreen({ x: 100, y: 50 }, viewport)).toEqual({
      x: 100 * 1.5 + 40,
      y: 50 * 1.5 - 20,
    });
  });

  it('inverts through a round trip', () => {
    const world = { x: 812.4, y: 1900 };
    const screen = worldToScreen(world, viewport);
    const back = screenToWorld(screen, viewport);
    expect(back.x).toBeCloseTo(world.x);
    expect(back.y).toBeCloseTo(world.y);
  });
});
