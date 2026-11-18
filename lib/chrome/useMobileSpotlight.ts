'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useFramed } from '@/components/mobile/MobileChrome';
import { useNarrow } from '@/lib/chrome/useNarrow';

/**
 * On a phone, which card in a list is the one being read: the one centred on
 * screen, followed as the reader scrolls. Desktop is hover, so this stays off there.
 */
export function useMobileSpotlight(count: number): {
  mobile: boolean;
  activeIndex: number;
  setNode: (index: number, node: HTMLElement | null) => void;
} {
  const narrow = useNarrow();
  const framed = useFramed();
  const mobile = narrow || framed;
  const [activeIndex, setActiveIndex] = useState(0);
  const nodesRef = useRef<(HTMLElement | null)[]>([]);

  const setNode = useCallback((index: number, node: HTMLElement | null) => {
    nodesRef.current[index] = node;
  }, []);

  useEffect(() => {
    if (!mobile || count === 0) {
      return;
    }

    const pick = () => {
      const nodes = nodesRef.current;
      let root: HTMLElement | null = null;
      for (const node of nodes) {
        if (node) {
          root = node.closest('[data-sheet-scroller]');
          break;
        }
      }
      const rootBox = root
        ? root.getBoundingClientRect()
        : { top: 0, height: window.innerHeight };
      // The card whose middle sits closest to the middle of the screen is
      // the one being read.
      const centre = rootBox.top + rootBox.height / 2;
      let best = 0;
      let nearest = Infinity;
      for (let i = 0; i < count; i += 1) {
        const node = nodes[i];
        if (!node) {
          continue;
        }
        const box = node.getBoundingClientRect();
        const distance = Math.abs(box.top + box.height / 2 - centre);
        if (distance < nearest) {
          nearest = distance;
          best = i;
        }
      }
      setActiveIndex((current) => (current === best ? current : best));
    };

    pick();
    const boot = requestAnimationFrame(pick);
    let frame = 0;
    const onScroll = () => {
      if (frame !== 0) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        pick();
      });
    };

    let root: HTMLElement | Window = window;
    for (const node of nodesRef.current) {
      if (node) {
        const scroller = node.closest('[data-sheet-scroller]');
        if (scroller instanceof HTMLElement) {
          root = scroller;
        }
        break;
      }
    }
    const observer = new IntersectionObserver(onScroll, {
      root: root instanceof HTMLElement ? root : null,
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    for (let i = 0; i < count; i += 1) {
      const node = nodesRef.current[i];
      if (node) {
        observer.observe(node);
      }
    }
    root.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(boot);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
      observer.disconnect();
      root.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count, mobile]);

  return { mobile, activeIndex, setNode };
}
