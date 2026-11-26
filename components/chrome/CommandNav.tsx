'use client';

import { AnimatePresence, motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { useIntro } from '@/components/intro/IntroContext';
import {
  AppLink,
  sitePath,
  useFramed,
  withMobilePrefix,
} from '@/components/mobile/MobileChrome';
import { useSheetNav } from '@/components/sheet/SheetNav';
import { usePageScroll } from '@/components/chrome/PageScroll';
import { useBackdropTone } from '@/lib/chrome/useBackdropTone';
import { contentOpacity } from '@/lib/intro/layout';
import { MOTION } from '@/lib/motion/tokens';
import type { CanvasNode } from '@/types/content';

export const PAGES = [
  { label: 'Work', href: '/work' },
  { label: 'Thoughts', href: '/thoughts' },
  { label: 'Team', href: '/about/team' },
  // Process is hidden for now; restore this entry to bring the section back.
  // { label: 'Process', href: '/about/process' },
  { label: 'Why', href: '/about/why' },
  { label: 'Services', href: '/about/services' },
  // The poem, under the name of the thing it is for.
  { label: 'Remember', href: '/about/poem' },
  { label: 'Contact', href: '/contact' },
] as const;

export function pageIsCurrent(label: string, pathname: string): boolean {
  if (label === 'Work') {
    // '/' is the canvas now that Work has an index of its own.
    return pathname.startsWith('/work');
  }
  if (label === 'Thoughts') {
    return pathname.startsWith('/thoughts');
  }
  const page = PAGES.find((item) => item.label === label);
  return page ? pathname === page.href : false;
}

export function CommandNav({
  nodes,
  embedded = false,
}: {
  nodes: CanvasNode[];
  embedded?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const framed = useFramed();
  const { markOpenedFromCanvas } = useSheetNav();
  const path = sitePath(pathname);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const menuId = useId();
  const { progress, complete } = useIntro();
  const reveal = contentOpacity(progress);
  // Judged by the pixels behind the bar rather than by what the section
  // underneath claims about itself: a black photograph inside a light section
  // used to leave the bar in its light state, unreadable.
  const dark = useBackdropTone(rootRef) === 'dark';
  // The bar keeps off the showcase and rises into place once the reader has
  // scrolled on to the band of sayings below it. A page opened over the
  // showcase has left it behind already, so the bar is there for that page.
  const { headerPassed } = usePageScroll();
  const waiting = !embedded && !headerPassed && path === '/';

  // The width the page buttons wrap at once the bar is fully open. Held fixed
  // while the bar widens, so they wrap the same at every frame and the menu's
  // height is measured once, rather than measured narrow and snapping after.
  const [chipsWidth, setChipsWidth] = useState<number>();
  useEffect(() => {
    const measure = () => {
      const bar = rootRef.current;
      if (!bar) return;
      const rem = parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const block = embedded
        ? ((bar.offsetParent as HTMLElement | null)?.clientWidth ??
          window.innerWidth)
        : window.innerWidth;
      const openWidth = Math.min(block * 0.92, 26.667 * rem);
      // Less the bar's side padding (1rem each).
      setChipsWidth(openWidth - 2 * rem);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [embedded]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('[data-command-nav]')
      ) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  const resolveHref = (page: (typeof PAGES)[number]): string => page.href;

  const go = (href: string, nodeId?: string) => {
    if (nodeId) {
      markOpenedFromCanvas(nodeId);
    }
    setOpen(false);
    setQuery('');
    router.push(withMobilePrefix(href, framed));
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const needle = query.trim().toLowerCase();
    if (!needle) {
      setOpen(true);
      return;
    }

    const page = PAGES.find((item) => item.label.toLowerCase() === needle);
    if (page) {
      const href = resolveHref(page);
      const leaf = nodes.find(
        (node) => node.kind === 'leaf' && node.href === href,
      );
      go(href, leaf?.kind === 'leaf' ? leaf.id : undefined);
      return;
    }

    const leaf = nodes.find(
      (node) =>
        node.kind === 'leaf' &&
        `${node.title} ${node.hoverDescription}`.toLowerCase().includes(needle),
    );
    if (leaf?.kind === 'leaf') {
      go(leaf.href, leaf.id);
    }
  };

  return (
    <div
      ref={rootRef}
      data-command-nav
      // Floats over the page, so the surface probe looks straight past it.
      data-overlay
      data-chrome
      // Closed it is a small bar; opening, it widens from the centre as the
      // menu grows upward, so the whole thing opens from small to large.
      className={`pointer-events-auto inset-x-0 bottom-5 z-50 mx-auto ${
        open ? 'w-[min(92%,26.667rem)]' : 'w-[min(92%,15.5rem)]'
      } ${embedded ? 'absolute' : 'fixed'}`}
      style={{
        opacity: waiting ? 0 : reveal,
        transform: waiting
          ? 'translate3d(0, calc(100% + 1.25rem), 0)'
          : undefined,
        pointerEvents: complete && !waiting ? 'auto' : 'none',
        transition: complete
          ? 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
          : 'opacity 0.5s ease',
      }}
      aria-hidden={!complete || waiting}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        // The bar is anchored at its bottom edge, so animating the menu's own
        // height grows it upward and leaves the input exactly where it was.
        // Motion's layout projection used to scale the whole bar instead,
        // which is what made it jump on open.
        // Square-cornered, with no outline: just the blurred glass.
        className={`px-4 py-2 shadow-[0_10px_30px_rgb(28_26_22/0.08)] backdrop-blur-2xl backdrop-saturate-150 transition-[background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          dark ? 'bg-white/12' : 'bg-white/10'
        }`}
      >
        <AnimatePresence initial={false}>
          {open ? (
            <motion.nav
              id={menuId}
              key="menu"
              aria-label="Site"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: MOTION.hub, ease: MOTION.easeOut }}
              className="overflow-hidden"
            >
              <div
                className="pt-2 pb-4 flex flex-wrap gap-x-5 gap-y-2"
                style={{ width: chipsWidth }}
              >
                {PAGES.map((page) => {
                  const current = pageIsCurrent(page.label, path);
                  return (
                    <AppLink
                      key={page.label}
                      href={resolveHref(page)}
                      aria-current={current ? 'page' : undefined}
                      // Plain words set like the "Explore ThirdKind" line:
                      // same size, weight and grey. The page you are on is
                      // the one in full ink.
                      className={`group/link inline-flex items-center font-sans text-[1.067rem] leading-[1.4rem] transition-colors duration-300 ${
                        dark
                          ? current
                            ? 'text-white'
                            : 'text-white/70 hover:text-white'
                          : current
                            ? 'text-ink'
                            : 'text-ink/70 hover:text-ink'
                      }`}
                      onClick={() => {
                        const href = resolveHref(page);
                        const leaf = nodes.find(
                          (node) => node.kind === 'leaf' && node.href === href,
                        );
                        if (leaf?.kind === 'leaf') {
                          markOpenedFromCanvas(leaf.id);
                        }
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <span
                        className={`relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-700 after:ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/link:after:origin-left group-hover/link:after:scale-x-100${page.label === 'Remember' ? ' nav-marker' : ''}`}
                      >
                        {page.label}
                      </span>
                    </AppLink>
                  );
                })}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
        <form onSubmit={onSubmit} className="flex items-center gap-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Explore ThirdKind"
            aria-label="Explore ThirdKind"
            className={`min-w-0 flex-1 bg-transparent text-[1.067rem] outline-none transition-colors duration-300 focus-visible:outline-none ${
              dark
                ? 'text-white placeholder:text-white/70'
                : 'text-ink placeholder:text-ink/70'
            }`}
          />
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls={menuId}
            className="flex h-[2.333rem] w-[2.333rem] shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none"
            onClick={() => setOpen((value) => !value)}
          >
            <span
              className="flex h-2.5 w-[1.333rem] flex-col justify-between"
              aria-hidden
            >
              {/* The two lines meet in the middle and cross into an × as the
                  menu opens, and part back into lines as it closes. */}
              <span
                className={`h-px transition-[background-color,translate,rotate] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${dark ? 'bg-white' : 'bg-ink'} ${open ? 'translate-y-[4.5px] rotate-45' : ''}`}
              />
              <span
                className={`h-px transition-[background-color,translate,rotate] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${dark ? 'bg-white' : 'bg-ink'} ${open ? '-translate-y-[4.5px] -rotate-45' : ''}`}
              />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
