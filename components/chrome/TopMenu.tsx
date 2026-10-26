'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { PAGES, pageIsCurrent } from '@/components/chrome/CommandNav';
import { usePageScroll } from '@/components/chrome/PageScroll';
import { useIntro } from '@/components/intro/IntroContext';
import { AppLink, sitePath } from '@/components/mobile/MobileChrome';
import { useSheetNav } from '@/components/sheet/SheetNav';
import { editorialThoughts } from '@/lib/canvas/editorial';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { useBackdropTone } from '@/lib/chrome/useBackdropTone';
import { contentOpacity } from '@/lib/intro/layout';
import { MOTION } from '@/lib/motion/tokens';
import { HEADER_LINE } from '@/lib/type/display';
import type { CanvasNode, LeafCanvasNode } from '@/types/content';

/** The piece the menu opens its three with — same lead as the thoughts reel. */
const LEAD = '/thoughts/business-to-business-advertising-secrets';

/** Large lines in the open menu; everything else sits under them as tags. */
const PRIMARY = new Set(['Work', 'Thoughts', 'Services']);

/**
 * The top bar: the name in the display serif on the left, a two-line
 * hamburger on the right. Open, the menu fills the screen — pages large on
 * the left at the manifesto size, three pieces of writing on the right.
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

  const stories = useMemo(() => {
    const thoughts = editorialThoughts(nodes);
    const lead = thoughts.find((node) => node.href === LEAD);
    const rest = thoughts.filter((node) => node.href !== LEAD);
    return [lead, ...rest]
      .filter((node): node is LeafCanvasNode => Boolean(node))
      .slice(0, 3);
  }, [nodes]);

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
            <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-[8cqi]">
              <div className="flex flex-col gap-10">
                <ul className="flex flex-col gap-[0.35em]">
                  {PAGES.filter((page) => PRIMARY.has(page.label)).map(
                    (page) => {
                      const current = pageIsCurrent(page.label, path);
                      return (
                        <li key={page.label}>
                          <AppLink
                            href={page.href}
                            aria-current={current ? 'page' : undefined}
                            className={`group/menu inline-block transition-opacity duration-300 ${
                              current
                                ? 'opacity-100'
                                : 'opacity-55 hover:opacity-100'
                            }`}
                            onClick={() => openPage(page.href)}
                          >
                            <span
                              className="relative inline-block font-sans leading-[1.15] tracking-[-0.015em] text-white not-italic after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/menu:font-display group-hover/menu:italic group-hover/menu:after:scale-x-100"
                              style={{ fontSize: HEADER_LINE }}
                            >
                              {page.label}
                            </span>
                          </AppLink>
                        </li>
                      );
                    },
                  )}
                </ul>
                <ul className="flex flex-wrap gap-2">
                  {PAGES.filter((page) => !PRIMARY.has(page.label)).map(
                    (page) => {
                      const current = pageIsCurrent(page.label, path);
                      return (
                        <li key={page.label}>
                          <AppLink
                            href={page.href}
                            aria-current={current ? 'page' : undefined}
                            className={`inline-block rounded-full border-2 px-3 py-1 font-sans text-[0.78rem] font-medium leading-none transition-colors duration-300 ${
                              current
                                ? 'border-white text-white'
                                : 'border-white/55 text-white/80 hover:border-white hover:text-white'
                            }`}
                            onClick={() => openPage(page.href)}
                          >
                            {page.label}
                          </AppLink>
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>

              {stories.length > 0 ? (
                <ul className="flex w-full max-w-[34rem] flex-col gap-6 justify-self-start lg:justify-self-end">
                  {stories.map((story) => (
                    <li key={story.id}>
                      <AppLink
                        href={story.href}
                        className="group flex items-center gap-5 no-underline md:gap-6"
                        onClick={() => openPage(story.href)}
                      >
                        <span className="relative aspect-square h-16 w-16 shrink-0 overflow-hidden bg-white/10 md:h-20 md:w-20">
                          <Image
                            src={story.thumbnail.src}
                            alt=""
                            fill
                            sizes="80px"
                            unoptimized={isUnoptimizedAsset(story.thumbnail)}
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-sans block text-[0.7rem] leading-none tracking-[0.06em] text-white/55 uppercase">
                            Thought
                          </span>
                          <span className="font-sans mt-2 block text-[0.95rem] leading-snug text-white md:text-[1.05rem]">
                            {story.title}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className="shrink-0 text-white/70 transition-transform duration-300 group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </AppLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
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
          className="relative flex h-10 w-10 items-center justify-end focus-visible:outline-none"
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
