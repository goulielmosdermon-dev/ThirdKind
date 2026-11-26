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

/** The menu's lines: smaller than the header line, still the largest type on the bar. */
const MENU_LINE = 'clamp(1.5rem, 2.6vw, 2.5rem)';

/**
 * The top bar: the name in the display serif on the left, a two-line
 * hamburger on the right. Open, the menu fills the screen — every page large,
 * in a grid three across the full width.
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
  // Over the dark showcase the bar goes white; over the open menu it is white
  // on black.
  const dark = useBackdropTone(barRef) === 'dark' || open;
  const tone = dark ? 'text-white' : 'text-ink';
  const line = dark ? 'bg-white' : 'bg-ink';

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const duration = reduced ? MOTION.reduced : MOTION.sheetIn;

  const openPage = (href: string) => {
    const leaf = nodes.find(
      (node) => node.kind === 'leaf' && node.href === href,
    );
    if (leaf?.kind === 'leaf') {
      markOpenedFromCanvas(leaf.id);
    }
    setOpen(false);
  };

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
            data-surface="dark"
            className="fixed inset-0 z-[41] flex flex-col bg-black px-12 pt-28 pb-12 text-white md:px-[8cqi] md:pt-32 md:pb-16"
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration, ease: MOTION.easeOut }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {/* Every page at the same large size, three to a row, the grid
                running the full width of the menu. */}
            <ul className="grid w-full flex-1 grid-cols-2 content-center gap-x-[4cqi] gap-y-[0.6em] md:grid-cols-3">
              {PAGES.map((page, index) => {
                const current = pageIsCurrent(page.label, path);
                return (
                  // Each line rises out of its own mask, one after another,
                  // once the menu has started to come up.
                  <li
                    key={page.label}
                    className="min-w-0 overflow-hidden pb-[0.2em]"
                  >
                    <motion.div
                      initial={reduced ? { opacity: 0 } : { y: '115%' }}
                      animate={reduced ? { opacity: 1 } : { y: '0%' }}
                      exit={reduced ? { opacity: 0 } : { y: '115%' }}
                      transition={{
                        duration: reduced ? MOTION.reduced : 0.7,
                        ease: MOTION.easeOut,
                        delay: reduced ? 0 : 0.12 + index * 0.06,
                      }}
                    >
                      <AppLink
                        href={page.href}
                        aria-current={current ? 'page' : undefined}
                        className="group/menu inline-block"
                        onClick={() => openPage(page.href)}
                      >
                        <span
                          // Stays in the sans on hover. The underline draws in from the left
                          // and leaves to the right, on a slow, even ease.
                          className={`relative inline-block font-sans leading-[1.15] tracking-[-0.015em] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-700 after:ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/menu:after:origin-left group-hover/menu:after:scale-x-100${page.label === 'Remember' ? ' nav-marker' : ''}`}
                          style={{ fontSize: MENU_LINE }}
                        >
                          {page.label}
                        </span>
                      </AppLink>
                    </motion.div>
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
        className="fixed inset-x-0 top-0 z-[42] flex items-center justify-between px-12 py-5 md:px-[8cqi]"
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
          className={`font-display font-semibold text-[clamp(1.25rem,1.7vw,1.625rem)] leading-none transition-colors duration-300 ${tone}`}
          onClick={() => setOpen(false)}
        >
          ThirdKind.
        </AppLink>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls={menuId}
          className="relative flex h-10 w-10 cursor-pointer items-center justify-end focus-visible:outline-none"
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
