/**
 * How bright the page is behind a piece of floating chrome.
 *
 * The browser will not hand back rendered screen pixels — that would leak
 * whatever a cross-origin image happens to show — so brightness is read from
 * the sources instead: a solid fill from its computed colour, a picture from
 * the picture itself, drawn small into a canvas and measured there.
 *
 * The pure parts live here so they can be read and tested on their own; the
 * hook that runs them against a live element is useBackdropTone.
 */

import type { SurfaceTone } from '@/lib/chrome/useSurfaceTone';

/** Below this, a sample counts as dark. Mid-grey is nobody's friend. */
export const DARK_AT = 0.35;

/**
 * The share of dark samples that turns the chrome to its bright state, and the
 * lower share that turns it back.
 *
 * Two thresholds rather than one: a bar sitting at the edge of a single
 * threshold flips back and forth on every frame of a slow scroll. It has to
 * cross the whole gap to change its mind.
 */
export const TO_BRIGHT = 0.65;
export const TO_DARK = 0.45;

/** The grid laid over the chrome: enough points to judge, few enough to be cheap. */
export const COLUMNS = 12;
export const ROWS = 4;

/** Pictures are read at this size — the question is a region, not a detail. */
const SAMPLE_EDGE = 32;

/** Relative luminance of an sRGB colour, 0 (black) to 1 (white). */
export function luminance(r: number, g: number, b: number): number {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Colours already resolved, by the string they came as. */
const colours = new Map<
  string,
  { rgb: [number, number, number]; alpha: number } | null
>();

/**
 * A computed colour, whatever notation it arrived in.
 *
 * Tailwind's opacity modifiers compute to `oklab(... / 0.1)` in a modern
 * browser, not to `rgba()`, so the numbers are not read out of the string.
 * The browser is asked to do the conversion instead: paint the colour onto a
 * single pixel and read the pixel back. Answers are kept, since a page has
 * only a handful of distinct colours in it.
 */
function resolve(
  color: string,
): { rgb: [number, number, number]; alpha: number } | null {
  if (colours.has(color)) {
    return colours.get(color) ?? null;
  }
  let answer: { rgb: [number, number, number]; alpha: number } | null = null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context) {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      // An unparseable colour leaves fillStyle at its default black, which
      // would read as a dark surface. Nothing is better than a wrong answer.
      if (
        context.fillStyle !== '#000000' ||
        /^(#000000|black|rgba?\(0, ?0, ?0)/.test(color)
      ) {
        context.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
        answer = { rgb: [r ?? 0, g ?? 0, b ?? 0], alpha: (a ?? 0) / 255 };
      }
    }
  } catch {
    answer = null;
  }
  colours.set(color, answer);
  return answer;
}

/** A computed background colour, or null when it is see-through. */
export function solidLuminance(color: string): number | null {
  // The common case, and the one that needs no browser: plain rgb()/rgba().
  const plain =
    /^rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?/.exec(
      color,
    );
  if (plain) {
    const alpha = plain[4] === undefined ? 1 : Number(plain[4]);
    if (alpha < 0.85) {
      return null;
    }
    return luminance(Number(plain[1]), Number(plain[2]), Number(plain[3]));
  }
  const resolved = resolve(color);
  if (!resolved) {
    return null;
  }
  // A wash lets what is under it through, so it is not the answer on its own.
  if (resolved.alpha < 0.85) {
    return null;
  }
  return luminance(...resolved.rgb);
}

/**
 * Where a point on the screen falls inside a picture that is cropped to fill
 * its box — the `object-fit: cover` arithmetic, in fractions of the source.
 *
 * Returns null when the point is outside the box.
 */
export function coverPoint(
  box: { left: number; top: number; width: number; height: number },
  source: { width: number; height: number },
  x: number,
  y: number,
): { u: number; v: number } | null {
  if (
    box.width <= 0 ||
    box.height <= 0 ||
    source.width <= 0 ||
    source.height <= 0
  ) {
    return null;
  }
  // The scale cover settles on: whichever axis has to stretch further.
  const scale = Math.max(box.width / source.width, box.height / source.height);
  const drawn = { width: source.width * scale, height: source.height * scale };
  // What cover cuts off, split evenly either side.
  const offsetX = (drawn.width - box.width) / 2;
  const offsetY = (drawn.height - box.height) / 2;
  const u = (x - box.left + offsetX) / drawn.width;
  const v = (y - box.top + offsetY) / drawn.height;
  if (u < 0 || u > 1 || v < 0 || v > 1) {
    return null;
  }
  return { u, v };
}

/** The state the chrome should be in, given how much of it stands on dark. */
export function verdict(darkShare: number, current: SurfaceTone): SurfaceTone {
  if (current === 'dark') {
    // Already bright chrome: it stays until the ground is clearly light again.
    return darkShare < TO_DARK ? 'light' : 'dark';
  }
  return darkShare > TO_BRIGHT ? 'dark' : 'light';
}

type Pixels = { data: Uint8ClampedArray; edge: number };
/** 'blocked' is a source the browser will never let us read; 'pending', one that is not ready yet. */
type Sampled = Pixels | 'blocked' | 'pending';

/**
 * Pictures already read, by the source they were read from.
 *
 * Reading one costs a draw and a getImageData; the answer does not change
 * while the picture is on screen, so it is read once and kept. Only settled
 * answers are kept: a picture that was not decoded yet must be asked again on
 * the next pass, or it would be remembered as unreadable for good.
 */
const readings = new Map<string, Pixels | 'blocked'>();
/**
 * A film is redrawn for every probe point, and two bars probe 48 points each
 * — a hundred canvas reads of the same frame. One frame is read and held for
 * this long instead, which is short enough that the bar still follows a cut.
 */
const FRAME_MS = 120;
const frames = new Map<string, { at: number; pixels: Pixels }>();

/** Draw a picture small and keep its pixels. Cross-origin sources refuse. */
function readPixels(
  media: HTMLImageElement | HTMLVideoElement,
  key: string,
): Sampled {
  const held = readings.get(key);
  if (held) {
    return held;
  }
  if (media instanceof HTMLVideoElement) {
    const frame = frames.get(key);
    if (frame && performance.now() - frame.at < FRAME_MS) {
      return frame.pixels;
    }
  }
  if (media instanceof HTMLImageElement && !media.complete) {
    return 'pending';
  }
  let result: Sampled = 'pending';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_EDGE;
    canvas.height = SAMPLE_EDGE;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context) {
      context.drawImage(media, 0, 0, SAMPLE_EDGE, SAMPLE_EDGE);
      const data = context.getImageData(0, 0, SAMPLE_EDGE, SAMPLE_EDGE).data;
      // Nothing landed on the canvas — the picture is not painted yet. Ask
      // again next time rather than remembering the blank.
      let painted = false;
      for (let at = 3; at < data.length; at += 4) {
        if ((data[at] ?? 0) > 0) {
          painted = true;
          break;
        }
      }
      result = painted ? { data, edge: SAMPLE_EDGE } : 'pending';
    }
  } catch {
    // Tainted by a cross-origin source. Nothing here will ever be readable,
    // and the caller falls back to what the surface says about itself.
    result = 'blocked';
  }
  // A video is still moving, so its reading is kept only for a frame's worth
  // of probes rather than for good.
  if (result !== 'pending') {
    if (media instanceof HTMLImageElement) {
      readings.set(key, result);
    } else if (result !== 'blocked') {
      frames.set(key, { at: performance.now(), pixels: result });
    }
  }
  return result;
}

/** Brightness of a picture at one point on the screen, or null if unreadable. */
export function mediaLuminance(
  media: HTMLImageElement | HTMLVideoElement,
  x: number,
  y: number,
): number | null {
  const source =
    media instanceof HTMLImageElement
      ? { width: media.naturalWidth, height: media.naturalHeight }
      : { width: media.videoWidth, height: media.videoHeight };
  if (!source.width || !source.height) {
    return null;
  }
  const key =
    media instanceof HTMLImageElement ? media.currentSrc || media.src : 'video';
  const pixels = readPixels(media, key);
  if (pixels === 'blocked' || pixels === 'pending') {
    return null;
  }
  const box = media.getBoundingClientRect();
  const fit = getComputedStyle(media).objectFit;
  const place =
    fit === 'cover' || fit === ''
      ? coverPoint(box, source, x, y)
      : // Anything else is close enough to a straight stretch for a
        // brightness question.
        {
          u: (x - box.left) / box.width,
          v: (y - box.top) / box.height,
        };
  if (!place) {
    return null;
  }
  const column = Math.min(
    pixels.edge - 1,
    Math.max(0, Math.floor(place.u * pixels.edge)),
  );
  const row = Math.min(
    pixels.edge - 1,
    Math.max(0, Math.floor(place.v * pixels.edge)),
  );
  const at = (row * pixels.edge + column) * 4;
  const alpha = pixels.data[at + 3] ?? 255;
  if (alpha < 200) {
    return null;
  }
  return luminance(
    pixels.data[at] ?? 0,
    pixels.data[at + 1] ?? 0,
    pixels.data[at + 2] ?? 0,
  );
}

/** Forget every picture read so far. Used when the page changes under us. */
export function forgetReadings(): void {
  readings.clear();
  frames.clear();
}
