'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { PAGES, pageIsCurrent } from '@/components/chrome/CommandNav';
import { usePageScroll } from '@/components/chrome/PageScroll';
import { useIntro } from '@/components/intro/IntroContext';
import { AppLink, sitePath } from '@/components/mobile/MobileChrome';
import { useSheetNav } from '@/components/sheet/SheetNav';
import { useBackdropTone } from '@/lib/chrome/useBackdropTone';
import { contentOpacity } from '@/lib/intro/layout';
import { MOTION } from '@/lib/motion/tokens';
import type { CanvasNode } from '@/types/content';

/**
 * The top bar: the name in the display serif on the left, a two-line
 * hamburger on the right. The menu drops from the top, the mirror of a sheet
 * rising from the bottom, and lists the pages large and in black.
 */
export function TopMenu({ nodes }: { nodes: CanvasNode[] }) {
  const pathname = usePathname();
  const path = sitePath(pathname);
  const reduced = useReducedMotion();
  const { markOpenedFromCanvas } = useSheetNav();
  const { progress, complete } = useIntro();
  const reveal = contentOpacity(progress);
  // On the home page the bar belongs to the header band and scrolls away with
  // it rather than staying pinned; elsewhere a sheet covers it anyway.
  const { headerTop } = usePageScroll();
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const ride = path === '/' && !open ? headerTop : 0;
  // Over the dark showcase the bar goes white; over the open menu it is ink.
  const dark = useBackdropTone(barRef) === 'dark' && !open;
  const tone = dark ? 'text-white' : 'text-ink';
  const line = dark ? 'bg-white' : 'bg-ink';

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const duration = reduced ? MOTION.reduced : MOTION.sheetIn;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.nav
            key="top-menu"
            id={menuId}
            aria-label="Site"
            data-overlay
            data-chrome
            className="fixed inset-x-0 top-0 z-[41] bg-void px-12 pt-24 pb-12 shadow-[0_20px_60px_rgb(28_26_22/0.12)] md:px-10"
            initial={reduced ? { opacity: 0 } : { y: '-100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '-100%' }}
            transition={{ duration, ease: MOTION.easeOut }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <ul className="flex flex-wrap gap-2">
              {PAGES.map((page) => {
                const current = pageIsCurrent(page.label, path);
                return (
                  <li key={page.label}>
                    <AppLink
                      href={page.href}
                      aria-current={current ? 'page' : undefined}
                      className={`inline-block text-[clamp(1rem,1.5vw,1.2rem)] rounded-md bg-black/[0.08] px-[0.5em] py-[0.15em] font-sans leading-snug text-ink transition-colors duration-300 hover:bg-black/[0.14] ${
                        current ? 'opacity-50' : ''
                      }`}
                      onClick={() => {
                        const leaf = nodes.find(
                          (node) =>
                            node.kind === 'leaf' && node.href === page.href,
                        );
                        if (leaf?.kind === 'leaf') {
                          markOpenedFromCanvas(leaf.id);
                        }
                        setOpen(false);
                      }}
                    >
                      {page.label}
                    </AppLink>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>

      <div
        ref={barRef}
        data-overlay
        data-chrome
        className="fixed inset-x-0 top-0 z-[42] flex items-center justify-between py-5 pr-9 pl-12 md:px-10"
        style={{
          opacity: reveal,
          transform: `translate3d(0, ${ride}px, 0)`,
          pointerEvents: complete ? 'auto' : 'none',
          transition: 'opacity 0.5s ease',
        }}
        aria-hidden={!complete}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <AppLink
          href="/"
          className={`font-display font-semibold text-[clamp(1.5rem,2.2vw,2.125rem)] leading-none transition-colors duration-300 ${tone}`}
          onClick={() => setOpen(false)}
        >
          ThirdKind.
        </AppLink>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={menuId}
          className="relative flex h-10 w-10 items-center justify-center focus-visible:outline-none"
          onClick={() => setOpen((value) => !value)}
        >
          {/* Two lines that cross into an X while the menu is open. */}
          <span className="relative block h-[7px] w-4" aria-hidden>
            <span
              className={`absolute left-0 h-[2px] w-4 -translate-y-1/2 transition-all duration-300 ${line} ${
                open ? 'top-1/2 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute left-0 h-[2px] w-4 -translate-y-1/2 transition-all duration-300 ${line} ${
                open ? 'top-1/2 -rotate-45' : 'top-full'
              }`}
            />
          </span>
        </button>
      </div>
    </>
  );
}
