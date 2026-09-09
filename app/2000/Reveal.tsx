'use client';

import { useEffect, useMemo, useRef } from 'react';

/**
 * Masked line reveal.
 *
 * Words are emitted on the server so the copy is real text before any script
 * runs. On the client the words are grouped into visual lines by comparing
 * offsetTop — CSS has no concept of "a line", so the break points have to be
 * read back after layout — and each group is wrapped in a mask (overflow
 * hidden) around a mover. The mover waits below its mask, slides home, and
 * later leaves upward through the top of it, 60ms apart down the block.
 *
 * Uncontrolled, it releases itself when it scrolls into view. Given `state`
 * it is driven from outside, which is how a pinned run swaps one text for the
 * next without either of them moving on the page.
 *
 * Line breaks change with the viewport, so a debounced resize regroups from
 * the flat word list. Under prefers-reduced-motion nothing is grouped at all
 * and the text stays plain, selectable and screen-reader clean.
 */

export type RevealState = 'below' | 'in' | 'above';

const STAGGER = 0.06;

/**
 * Splits `__underlined__` runs out of a line. `__label|href__` makes the run a
 * link as well.
 */
function tokenize(line: string) {
  return line.split(/__(.+?)__/g).map((part, i) => {
    if (i % 2 === 0) return { text: part, underline: false };

    const [text = '', href] = part.split('|');
    return { text, underline: true, href };
  });
}

/** Groups a paragraph's `.w` words into masked lines. */
function group(p: HTMLElement, from: number) {
  const words = Array.from(p.querySelectorAll<HTMLElement>('.w'));
  if (words.length === 0) return from;

  const lines: HTMLElement[][] = [];
  let current: HTMLElement[] = [];
  let lastTop: number | null = null;

  for (const word of words) {
    const top = word.offsetTop;
    if (lastTop !== null && top > lastTop) {
      lines.push(current);
      current = [];
    }
    lastTop = top;
    current.push(word);
  }
  lines.push(current);

  const frag = document.createDocumentFragment();
  lines.forEach((line, i) => {
    const mask = document.createElement('span');
    mask.className = 'ln';
    const mover = document.createElement('span');
    mover.className = 'ln__i';
    mover.style.transitionDelay = `${(from + i) * STAGGER}s`;
    line.forEach((word, j) => {
      if (j > 0) mover.appendChild(document.createTextNode(' '));
      mover.appendChild(word);
    });
    mask.appendChild(mover);
    frag.appendChild(mask);
  });

  p.replaceChildren(frag);
  return from + lines.length;
}

export function Reveal({
  lines,
  className,
  state,
}: {
  lines: string[];
  className: string;
  state?: RevealState;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const controlled = state !== undefined;
  const html = useMemo(() => linesToHtml(lines), [lines]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const paragraphs = Array.from(el.querySelectorAll<HTMLElement>('p'));
    /* Stash the flat word markup once: regrouping already-grouped spans would
       corrupt after the first resize. */
    const flat = paragraphs.map((p) => p.innerHTML);

    const split = () => {
      let index = 0;
      paragraphs.forEach((p, i) => {
        p.innerHTML = flat[i] ?? '';
        index = group(p, index);
      });
    };

    split();
    el.dataset.reveal = 'below';

    let observer: IntersectionObserver | undefined;
    if (!controlled) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            el.dataset.reveal = 'in';
            observer?.disconnect();
          }
        },
        { rootMargin: '0px 0px -15% 0px' },
      );
      observer.observe(el);
    }

    let timer: ReturnType<typeof setTimeout>;
    let width = window.innerWidth;
    const onResize = () => {
      /* Mobile browsers fire resize when the URL bar hides; width is the only
         thing that can change where the lines break. */
      if (window.innerWidth === width) return;
      width = window.innerWidth;
      clearTimeout(timer);
      timer = setTimeout(split, 180);
    };
    window.addEventListener('resize', onResize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [html, controlled]);

  /* Controlled: the run owns the state, so write it straight to the DOM. */
  useEffect(() => {
    const el = ref.current;
    if (!el || !controlled) return;
    el.dataset.reveal = state;
  }, [state, controlled]);

  /* The markup is handed over as a string rather than as children. The
     splitter rewrites this subtree, so React must not try to reconcile it —
     it diffed the old children against nodes that were no longer there and
     threw NotFoundError on removeChild. The string is stable, so React sees
     nothing to update no matter how often the run re-renders. */
  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

const escape = (value: string) => value.replace(/[&<>"]/g, (c) => ESCAPES[c]!);

/**
 * One word per span, spaces kept as real text so the copy still wraps.
 *
 * A linked run makes every one of its words an anchor rather than wrapping
 * them in one: the splitter moves `.w` nodes into the line masks, which would
 * carry them out of a single enclosing anchor. Adjacent word-anchors read and
 * behave as one link.
 */
function wordsToHtml(text: string, underline: boolean, href?: string) {
  const className = underline ? 'w underline' : 'w';

  return text
    .split(/(\s+)/)
    .filter((chunk) => chunk !== '')
    .map((chunk) => {
      if (/^\s+$/.test(chunk)) return ' ';
      const word = escape(chunk);
      return href
        ? `<a class="${className} hover:text-mute" href="${escape(href)}" target="_blank" rel="noreferrer">${word}</a>`
        : `<span class="${className}">${word}</span>`;
    })
    .join('');
}

function linesToHtml(lines: string[]) {
  return lines
    .map((line, i) => {
      const inner = tokenize(line)
        .map((token) => wordsToHtml(token.text, token.underline, token.href))
        .join('');
      return `<p${i > 0 ? ' class="mt-[1.5em]"' : ''}>${inner}</p>`;
    })
    .join('');
}
