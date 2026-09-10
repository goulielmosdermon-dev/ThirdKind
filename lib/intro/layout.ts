export const ALIEN_ASPECT = 3354 / 2203;
export const HUMAN_ASPECT = 2517 / 1819;

/** Apex of the alien pointing fingertip, in image UV. */
export const ALIEN_CONTACT = { x: 3352 / 3354, y: 1370 / 2203 };
/** Apex of the human pointing fingertip, in image UV. */
export const HUMAN_CONTACT = { x: 1 / 2517, y: 237 / 1819 };
export const HUMAN_SCALE = 0.85;
export const HUMAN_NUDGE_Y = 5;

/**
 * The intro reads as beats, one after the other rather than on top of each
 * other: the hands hold and part, then the story reads, then the motto, then
 * the canvas comes up.
 */
export const INTRO = {
  handsEnd: 0.3,
  storyInStart: 0.34,
  storyOutStart: 0.48,
  storyStagger: 0.1,
  storyLineWindow: 0.08,
  mottoInStart: 0.72,
  mottoInEnd: 0.8,
  mottoOutStart: 0.94,
  mottoOutEnd: 0.99,
  contentStart: 0.97,
  contentEnd: 1,
} as const;

/**
 * The motto arrives a line at a time, and the screen is left empty either
 * side of it: the story clears at 0.66 and nothing follows for a beat, then
 * "Extraordinary", a hold, "in a world of ordinary", a longer hold, and only
 * then the header.
 */
export const MOTTO_LINES = [
  { start: 0.74, end: 0.79 },
  { start: 0.83, end: 0.88 },
] as const;

export const STORY_LINES = [
  'You already know the difference.',
  'Between the thing you scrolled past this morning and the thing you’ve been thinking about for a week.',
] as const;

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function remap(value: number, start: number, end: number): number {
  if (value <= start) {
    return 0;
  }
  if (value >= end) {
    return 1;
  }
  return (value - start) / (end - start);
}

export function mottoOpacity(progress: number): number {
  const fadeIn = remap(progress, INTRO.mottoInStart, INTRO.mottoInEnd);
  const fadeOut = 1 - remap(progress, INTRO.mottoOutStart, INTRO.mottoOutEnd);
  return Math.min(fadeIn, fadeOut);
}

/** Opening copy: each line fades in, then out, before “Make Extraordinary”. */
export function storyLineOpacity(
  progress: number,
  index: number,
  count = STORY_LINES.length,
): number {
  const i = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  const offset = i * INTRO.storyStagger;
  const fadeIn = remap(
    progress,
    INTRO.storyInStart + offset,
    INTRO.storyInStart + offset + INTRO.storyLineWindow,
  );
  const fadeOut =
    1 -
    remap(
      progress,
      INTRO.storyOutStart + offset,
      INTRO.storyOutStart + offset + INTRO.storyLineWindow,
    );
  return Math.min(fadeIn, fadeOut);
}

/** Opacity of one motto line as the intro plays out. */
export function mottoLineOpacity(progress: number, index: number): number {
  const line =
    MOTTO_LINES[Math.min(Math.max(index, 0), MOTTO_LINES.length - 1)];
  return line ? remap(progress, line.start, line.end) : 0;
}

export function contentOpacity(progress: number): number {
  return remap(progress, INTRO.contentStart, INTRO.contentEnd);
}

export function handTravel(progress: number): number {
  return easeOutCubic(remap(progress, 0, INTRO.handsEnd));
}

export function largeHandHeight(viewportWidth: number): number {
  return Math.min(160, Math.max(72, viewportWidth * 0.16));
}

export type HandLayoutOptions = {
  largeHeight?: number;
  endScale?: number;
  safeTop?: number;
  safeBottom?: number;
  inset?: number;
  dockBottom?: number;
};

export function layoutHands(
  progress: number,
  viewportWidth: number,
  viewportHeight: number,
  options: HandLayoutOptions = {},
): {
  alien: { x: number; y: number; height: number };
  human: { x: number; y: number; height: number };
} {
  const t = handTravel(progress);
  const largeH = options.largeHeight ?? largeHandHeight(viewportWidth);
  const endScale = options.endScale ?? 0.25;
  const smallH = largeH * endScale;
  const alienH = lerp(largeH, smallH, t);
  const humanH0 = largeH * HUMAN_SCALE;
  const humanH1 = smallH;
  const humanH = lerp(humanH0, humanH1, t);
  const alienW0 = largeH * ALIEN_ASPECT;
  const humanW0 = humanH0 * HUMAN_ASPECT;
  const humanW1 = humanH1 * HUMAN_ASPECT;
  const cx = viewportWidth / 2;
  const cy = viewportHeight / 2;
  const inset = options.inset ?? 32;
  const safeTop = options.safeTop ?? 32;
  const dockBottom = options.dockBottom ?? 112;

  const startAlien = {
    x: cx - alienW0 * ALIEN_CONTACT.x,
    y: cy - largeH * ALIEN_CONTACT.y,
  };
  const startHuman = {
    x: cx - humanW0 * HUMAN_CONTACT.x,
    y: cy - humanH0 * HUMAN_CONTACT.y + HUMAN_NUDGE_Y,
  };
  const endAlien = { x: inset, y: safeTop };
  const endHuman = {
    x: viewportWidth - inset - humanW1,
    y: viewportHeight - dockBottom - humanH1,
  };

  return {
    alien: {
      x: lerp(startAlien.x, endAlien.x, t),
      y: lerp(startAlien.y, endAlien.y, t),
      height: alienH,
    },
    human: {
      x: lerp(startHuman.x, endHuman.x, t),
      y: lerp(startHuman.y, endHuman.y, t),
      height: humanH,
    },
  };
}
