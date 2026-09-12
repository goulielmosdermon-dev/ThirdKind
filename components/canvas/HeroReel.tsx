'use client';

/**
 * The header band's film: one loop, muted, filling whatever box it is given.
 * It replaced the project slider, so it carries no title and no View pill —
 * the headline over it speaks for the page — and a click on it opens the work
 * index rather than any single project.
 */
export function HeroReel({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="See the work"
      className="absolute inset-0 block h-full w-full cursor-pointer border-0 bg-black p-0"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover max-md:object-[60%_center]"
        src="/header/reel.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <span
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
        aria-hidden
      />
    </button>
  );
}
