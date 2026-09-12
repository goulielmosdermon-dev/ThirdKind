/**
 * The feel of an eased wheel, in one place.
 *
 * Two hooks ease the wheel — `useSmoothPage` on the document, `useSmoothScroll`
 * on a scroll container — and the whole point is that a reader moving between
 * a deck, the canvas index and a sheet cannot tell where one ends and the next
 * begins. Tuning them apart is what makes a site feel assembled rather than
 * made, so the numbers that decide the feel live here and the hooks only
 * decide what they are scrolling.
 *
 * `DELTA_CLAMP` deliberately stays local to each hook: it caps how far one
 * notch may ask to travel, which is a property of the surface's size, not of
 * the easing.
 */

/**
 * Time constant of the approach, in ms. Larger is looser: the surface keeps
 * gliding for longer after the wheel stops, and each notch reads as a push on
 * something heavy rather than a step.
 *
 * 130 was a short, tidy ease. 780 was three times that again, and coasted far
 * enough that a swapping deck skipped whole slides per notch — the index there
 * is derived from scroll position, so a long glide does not read as weight, it
 * reads as slides going missing. 260 is twice the original: enough that a run
 * of notches blends into one travel, short enough that the surface still
 * answers the wheel.
 */
export const TAU_MS = 260;

/**
 * Below this distance the glide is over.
 *
 * The tail of an exponential is slow, so the last fraction of a pixel would
 * otherwise go on animating well after the surface has visibly stopped. A 1px
 * close is not visible; a 1px animation still running is.
 */
export const SETTLE_PX = 1;
