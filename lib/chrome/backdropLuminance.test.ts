import { describe, expect, it } from 'vitest';

import {
  coverPoint,
  luminance,
  solidLuminance,
  verdict,
} from '@/lib/chrome/backdropLuminance';

describe('luminance', () => {
  it('runs black to white', () => {
    expect(luminance(0, 0, 0)).toBe(0);
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 5);
  });

  it('weights green over blue, as the eye does', () => {
    expect(luminance(0, 255, 0)).toBeGreaterThan(luminance(0, 0, 255));
  });
});

describe('solidLuminance', () => {
  it('reads an opaque colour', () => {
    expect(solidLuminance('rgb(0, 0, 0)')).toBe(0);
  });

  it('declines a wash, which lets the page through', () => {
    expect(solidLuminance('rgba(255, 255, 255, 0.1)')).toBeNull();
    expect(solidLuminance('rgba(0, 0, 0, 0)')).toBeNull();
  });
});

describe('coverPoint', () => {
  const box = { left: 0, top: 0, width: 100, height: 100 };

  it('puts the centre of the box at the centre of the picture', () => {
    const place = coverPoint(box, { width: 200, height: 100 }, 50, 50);
    expect(place?.u).toBeCloseTo(0.5, 5);
    expect(place?.v).toBeCloseTo(0.5, 5);
  });

  it('accounts for the crop cover takes off a wide picture', () => {
    // A 2:1 picture in a square box: a quarter is cut from each side, so the
    // left edge of the box is a quarter into the source.
    const place = coverPoint(box, { width: 200, height: 100 }, 0, 50);
    expect(place?.u).toBeCloseTo(0.25, 5);
  });

  it('refuses a point that falls off the picture altogether', () => {
    // Well left of the box, and past the crop cover had in hand.
    expect(coverPoint(box, { width: 200, height: 100 }, -120, 50)).toBeNull();
  });
});

describe('verdict', () => {
  it('turns bright only past 65% dark', () => {
    expect(verdict(0.5, 'light')).toBe('light');
    expect(verdict(0.7, 'light')).toBe('dark');
  });

  it('holds its state through the gap, so it cannot flicker', () => {
    expect(verdict(0.5, 'dark')).toBe('dark');
    expect(verdict(0.64, 'light')).toBe('light');
  });

  it('turns back only below 45%', () => {
    expect(verdict(0.4, 'dark')).toBe('light');
  });
});
