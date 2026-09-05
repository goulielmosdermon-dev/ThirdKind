import { describe, expect, it } from 'vitest';

import {
  ALIEN_ASPECT,
  ALIEN_CONTACT,
  HUMAN_ASPECT,
  HUMAN_CONTACT,
  HUMAN_NUDGE_Y,
  HUMAN_SCALE,
  contentOpacity,
  handTravel,
  largeHandHeight,
  layoutHands,
  mottoOpacity,
  storyLineOpacity,
} from '@/lib/intro/layout';

describe('intro layout', () => {
  it('starts hands near the center and ends them in the corners', () => {
    const start = layoutHands(0, 1440, 900);
    const end = layoutHands(1, 1440, 900);

    const largeH = largeHandHeight(1440);
    const humanH0 = largeH * HUMAN_SCALE;
    expect(
      start.alien.x + largeH * ALIEN_ASPECT * ALIEN_CONTACT.x,
    ).toBeCloseTo(720);
    expect(
      start.human.x + humanH0 * HUMAN_ASPECT * HUMAN_CONTACT.x,
    ).toBeCloseTo(720);
    expect(start.alien.y + largeH * ALIEN_CONTACT.y).toBeCloseTo(450);
    expect(start.human.y + humanH0 * HUMAN_CONTACT.y).toBeCloseTo(
      450 + HUMAN_NUDGE_Y,
    );
    expect(start.alien.height).toBe(largeH);
    expect(start.human.height).toBeCloseTo(humanH0);
    expect(start.human.x).toBeLessThan(800);
    expect(end.alien.x).toBe(32);
    expect(end.alien.y).toBe(32);
    expect(end.human.height).toBeCloseTo(end.alien.height);
    expect(end.human.x).toBeCloseTo(
      1440 - 32 - largeHandHeight(1440) * 0.25 * (2517 / 1819),
    );
    expect(end.alien.height).toBeCloseTo(largeHandHeight(1440) * 0.25);
  });

  it('maps motto and content onto later progress', () => {
    expect(handTravel(0)).toBe(0);
    expect(handTravel(1)).toBe(1);
    expect(mottoOpacity(0)).toBe(0);
    expect(mottoOpacity(0.3)).toBe(0);
    expect(mottoOpacity(0.62)).toBeGreaterThan(0.9);
    expect(mottoOpacity(1)).toBe(0);
    expect(storyLineOpacity(0, 0)).toBe(0);
    expect(storyLineOpacity(0.22, 0)).toBeGreaterThan(0.9);
    expect(storyLineOpacity(0.25, 1)).toBeGreaterThan(0);
    expect(storyLineOpacity(0.6, 0)).toBe(0);
    expect(storyLineOpacity(1, 1)).toBe(0);
    expect(contentOpacity(0.5)).toBe(0);
    expect(contentOpacity(0.75)).toBe(0);
    expect(contentOpacity(1)).toBe(1);
  });
});
