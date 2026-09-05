import type { ImageAsset } from '@/types/content';

export function isUnoptimizedSrc(src: string): boolean {
  return /\.(svg|gif)(\?|$)/i.test(src);
}

/** Formats Next cannot resize, plus assets explicitly marked to stay as shot. */
export function isUnoptimizedAsset(asset: ImageAsset): boolean {
  return asset.unoptimized === true || isUnoptimizedSrc(asset.src);
}
