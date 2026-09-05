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
import { useSurfaceTone } from '@/lib/chrome/useSurfaceTone';
import { contentOpacity } from '@/lib/intro/layout';
import { MOTION } from '@/lib/motion/tokens';
import type { CanvasNode } from '@/types/content';

const PAGES = [
  { label: 'Work', href: '/' },
  { label: 'Thoughts', href: '/' },
  { label: 'About', href: '/about/team' },
  // Process is hidden for now; restore this entry to bring the section back.
  // { label: 'Process', href: '/about/process' },
  { label: 'Why', href: '/about/why' },
  { label: 'Services', href: '/about/services' },
  { label: 'Contact', href: '/contact' },
] as const;

function pageIsCurrent(label: string, pathname: string): boolean {
  if (label === 'Work') {
    return pathname === '/' || pathname.startsWith('/work');
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
  const dark = useSurfaceTone(rootRef) === 'dark';

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

  const resolveHref = (page: (typeof PAGES)[number]): string => {
    if (page.label === 'Thoughts') {
      const article = nodes.find(
        (node) => node.kind === 'leaf' && node.hubKey === 'thoughts',
      );
      return article?.kind === 'leaf' ? article.href : '/';
    }
    return page.href;
  };

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
      data-chrome
      className={`pointer-events-auto inset-x-0 bottom-5 z-50 mx-auto w-[min(92%,20rem)] ${
        embedded ? 'absolute' : 'fixed'
      }`}
      style={{
        opacity: reveal,
        pointerEvents: complete ? 'auto' : 'none',
        transition: complete ? undefined : 'opacity 0.5s ease',
      }}
      aria-hidden={!complete}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        // The bar is anchored at its bottom edge, so animating the menu's own
        // height grows it upward and leaves the input exactly where it was.
        // Motion's layout projection used to scale the whole bar instead,
        // which is what made it jump on open.
        // The radius stays a fixed 21px rather than animating rounded-full ->
        // rounded-[22px]: CSS interpolates 9999px linearly, so the corners read
        // as fully round for most of the transition and then snap flat at the
        // end. At the closed height (42px) 21px is already a full pill, so a
        // constant value looks identical closed and never jumps open.
        className={`rounded-[21px] border px-3 py-1.5 shadow-[0_10px_30px_rgb(28_26_22/0.08)] backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          dark ? 'border-white/20 bg-white/12' : 'border-ink/10 bg-white/10'
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
              <div className="pt-1.5 pb-3 flex flex-wrap gap-1.5">
                {PAGES.map((page) => {
                  const current = pageIsCurrent(page.label, path);
                  return (
                    <AppLink
                      key={page.label}
                      href={resolveHref(page)}
                      aria-current={current ? 'page' : undefined}
                      className={`rounded-md px-2.5 py-1 text-xs transition-colors duration-300 ${
                        dark
                          ? 'bg-white/15 text-white'
                          : 'bg-black/[0.08] text-ink'
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
                      {page.label}
                    </AppLink>
                  );
                })}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Explore ThirdKind"
            aria-label="Explore ThirdKind"
            className={`min-w-0 flex-1 bg-transparent text-[0.8rem] outline-none transition-colors duration-300 focus-visible:outline-none ${
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
            className="flex h-7 w-7 shrink-0 items-center justify-center focus-visible:outline-none"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex h-3 w-4 flex-col justify-between" aria-hidden>
              <span
                className={`h-px transition-colors duration-300 ${dark ? 'bg-white' : 'bg-ink'}`}
              />
              <span
                className={`h-px transition-colors duration-300 ${dark ? 'bg-white' : 'bg-ink'}`}
              />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
