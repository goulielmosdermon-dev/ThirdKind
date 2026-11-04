'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const menu = [
  ['viva', 'VIVA'],
  ['more-com', 'MORE.COM'],
  ['medicine-du-monde', 'MEDICINE DU MONDE'],
  ['ag-design', 'AG DESIGN'],
  ['cardinal', 'CARDINAL'],
  ['abek', 'ABEK'],
];

export function CollabNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const active = pathname.split('/')[2] || 'viva';
  useEffect(() => {
    let frame = 0;
    const cache = new WeakMap<HTMLImageElement, CanvasRenderingContext2D>();
    const update = () => {
      frame = 0;
      const hero = document.querySelector<HTMLElement>('.collab-header');
      const image = hero?.querySelector('img');
      if (!hero || !image) return;
      const heroRect = hero.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      let context = cache.get(image);
      if (!context && image.complete && image.naturalWidth) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        context =
          canvas.getContext('2d', { willReadFrequently: true }) ?? undefined;
        if (context) {
          context.drawImage(image, 0, 0, 128, 128);
          cache.set(image, context);
        }
      }
      const background = getComputedStyle(hero)
        .backgroundColor.match(/[\d.]+/g)
        ?.slice(0, 3)
        .map(Number) ?? [255, 255, 255];
      const scale = Math.max(
        imageRect.width / (image.naturalWidth || 1),
        imageRect.height / (image.naturalHeight || 1),
      );
      const drawnWidth = image.naturalWidth * scale;
      const drawnHeight = image.naturalHeight * scale;
      navRef.current?.querySelectorAll('a').forEach((link) => {
        const rect = link.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        let rgb = [255, 255, 255];
        if (y >= heroRect.top && y <= heroRect.bottom) {
          rgb = background;
          if (
            context &&
            x >= imageRect.left &&
            x <= imageRect.right &&
            y >= imageRect.top &&
            y <= imageRect.bottom
          ) {
            const sx =
              (x - imageRect.left + (drawnWidth - imageRect.width) / 2) /
              drawnWidth;
            const sy =
              (y - imageRect.top + (drawnHeight - imageRect.height) / 2) /
              drawnHeight;
            rgb = [
              ...context.getImageData(
                Math.max(0, Math.min(127, Math.floor(sx * 128))),
                Math.max(0, Math.min(127, Math.floor(sy * 128))),
                1,
                1,
              ).data,
            ].slice(0, 3);
          }
        }
        const brightness =
          (rgb[0]! * 0.2126 + rgb[1]! * 0.7152 + rgb[2]! * 0.0722) / 255;
        link.dataset.contrast = brightness > 0.5 ? 'dark' : 'light';
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('load', schedule, true);
    // Recheck after the incoming page has finished sliding into position.
    const timer = window.setTimeout(schedule, 750);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('load', schedule, true);
    };
  }, [pathname]);
  return (
    <nav ref={navRef} className="collab-nav" aria-label="Companies">
      {menu.map(([id, name]) => (
        <Link
          key={id}
          href={`/Collab/${id}`}
          scroll={false}
          aria-current={active === id ? 'page' : undefined}
        >
          {name}
        </Link>
      ))}
    </nav>
  );
}
