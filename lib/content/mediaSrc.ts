import type { CSSProperties } from 'react';

import type { ImageAsset } from '@/types/content';

export function isUnoptimizedSrc(src: string): boolean {
  return /\.(svg|gif)(\?|$)/i.test(src);
}

/** Formats Next cannot resize, plus assets explicitly marked to stay as shot. */
export function isUnoptimizedAsset(asset: ImageAsset): boolean {
  return asset.unoptimized === true || isUnoptimizedSrc(asset.src);
}

/**
 * Puts the hotspot on the frame's centre line under `object-cover`, at any
 * frame shape, held back only where that would open a gap at an edge.
 *
 * A percentage `object-position` lines the point up with the same percentage
 * of the frame, which only centres it at 50%. The offset is worked out in the
 * frame's own units instead, so the image's parent must be a size container.
 */
export function coverFocusStyle(asset: ImageAsset): CSSProperties | undefined {
  if (!asset.hotspot) {
    return undefined;
  }
  const wide = (asset.width / asset.height) * 100;
  const shift = (asset.hotspot.x - 0.5) * wide;
  return {
    objectPosition: `min(0px, max(calc((100cqw - ${wide}cqh) / 2 - ${shift}cqh), calc(100cqw - ${wide}cqh))) 50%`,
  };
}

/** The wrapper `coverFocusStyle` measures against. */
export const COVER_FOCUS_FRAME = 'absolute inset-0 [container-type:size]';
