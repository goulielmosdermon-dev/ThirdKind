'use client';

import { Hands, HANDS_SRC_H, HANDS_SRC_W } from '@/components/Hands';

/**
 * The hands, meeting, in the black band on Services.
 *
 * The traced drawing, turned on its side so the reach is horizontal: inverted
 * and screened onto the black so the stroke reads white. It draws
 * itself once as it comes into view.
 */
export function ServicesHands() {
  return (
    <div
      data-surface="dark"
      className="relative mx-auto w-full max-w-[min(56rem,86cqi)]"
      style={{ aspectRatio: `${HANDS_SRC_H} / ${HANDS_SRC_W}` }}
    >
      <div
        className="absolute top-1/2 left-1/2 text-black [filter:invert(1)] [mix-blend-mode:screen]"
        style={{
          width: `${(HANDS_SRC_W / HANDS_SRC_H) * 100}%`,
          transform: 'translate(-50%, -50%) scaleX(-1) rotate(-90deg)',
        }}
      >
        <Hands />
      </div>
    </div>
  );
}
