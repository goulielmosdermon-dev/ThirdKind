import { describe, expect, it } from 'vitest';

import { MOTION } from '@/lib/motion/tokens';

describe('motion tokens', () => {
  it('matches the Phase 4 duration map', () => {
    expect(MOTION.reduced).toBe(0.12);
    expect(MOTION.hover).toBe(0.16);
    expect(MOTION.zoom).toBe(0.22);
    expect(MOTION.backdrop).toBe(0.24);
    expect(MOTION.sheetOut).toBe(0.32);
    expect(MOTION.hub).toBe(0.35);
    expect(MOTION.sheetIn).toBe(0.42);
  });
});
