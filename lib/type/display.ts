/**
 * Nib Pro and Figtree sit at almost the same x-height — 0.53 against roughly
 * 0.52 of the em — so the two need no correction to read at the same optical
 * size beside each other. This is the one place to tune that, wherever they
 * are set together on a line or in a stack.
 */
export const DISPLAY_BALANCE = '1em';

/**
 * The size an editorial line is set at, wherever one is read.
 *
 * A project's line in the index, a piece of writing's title in the reel, and
 * the manifesto are the same kind of thing — one sentence of the page's own
 * voice, standing on its own above or beside a picture — and they were set at
 * three different sizes. One value, so they stay the same kind of thing.
 *
 * The value is the intro's own, so the line the page opens on and the lines it
 * goes on to read are set alike at every width rather than only at the one the
 * window happened to be.
 *
 * Applied as a style rather than a class: Tailwind only ships the class names
 * it can see written out in the source, so a shared constant cannot be one.
 */
export const EDITORIAL_LINE = 'clamp(1.15rem, 2.2vw, 1.65rem)';
export const EDITORIAL_LINE_PHONE = 'clamp(1rem, 4vw, 1.22rem)';
