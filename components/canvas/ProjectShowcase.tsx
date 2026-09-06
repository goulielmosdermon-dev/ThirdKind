'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import type { CanvasNode, LeafCanvasNode } from '@/types/content';

/** The three that lead, in order. */
const SHOWCASE_IDS = [
  'project-scytales-2',
  'project-scania',
  'project-up-hellas',
] as const;

/** Below this share of the viewport height, the panel starts giving way. */
const HAND_OFF_START = 0.55;
/** And by this point it has cleared the screen entirely. */
const HAND_OFF_END = 0.92;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * The lead-in above the canvas: three projects, which slide away as the
 * pointer moves down the screen to hand over to the matrix beneath.
 */
export function ProjectShowcase({
  nodes,
  onOpen,
  onCleared,
}: {
  nodes: CanvasNode[];
  onOpen: (node: LeafCanvasNode) => void;
  onCleared: () => void;
}) {
  const [progress, setProgress] = useState(0);

  const featured = SHOWCASE_IDS.map((id) =>
    nodes.find(
      (node): node is LeafCanvasNode => node.kind === 'leaf' && node.id === id,
    ),
  ).filter((node): node is LeafCanvasNode => Boolean(node));

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const ratio = event.clientY / window.innerHeight;
      const next = clamp01(
        (ratio - HAND_OFF_START) / (HAND_OFF_END - HAND_OFF_START),
      );
      // Only ever gives way — nudging back up should not drag it in again.
      setProgress((current) => Math.max(current, next));
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    if (progress < 0.999) {
      return;
    }
    onCleared();
  }, [onCleared, progress]);

  if (featured.length === 0) {
    return null;
  }

  return (
    <div
      data-showcase
      data-surface="light"
      className="absolute inset-0 z-20 flex flex-col justify-center bg-void px-[4vw]"
      style={{
        transform: `translate3d(0, ${-progress * 100}%, 0)`,
        opacity: 1 - progress * 0.35,
      }}
    >
      {/* The panel fills the viewport, so viewport breakpoints apply here;
          the @container variants used elsewhere have no container. */}
      <ul className="mx-auto grid w-full max-w-[92rem] grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {featured.map((node) => (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onOpen(node)}
              className="group block w-full text-left"
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden bg-hairline">
                <span className="tk-loading absolute inset-0" aria-hidden />
                <Image
                  src={node.thumbnail.src}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 900px) 30vw, 90vw"
                  unoptimized={isUnoptimizedAsset(node.thumbnail)}
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </span>
              <span className="font-display mt-4 block text-[clamp(1.05rem,1.6vw,1.4rem)] leading-tight text-ink">
                {node.title}
              </span>
              {node.hoverDescription ? (
                <span className="mt-1 block text-[0.95rem] leading-snug text-mute">
                  {node.hoverDescription}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <p
        className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-[0.7rem] tracking-[0.18em] text-mute lowercase"
        style={{ opacity: 1 - progress }}
      >
        move down to explore
      </p>
    </div>
  );
}
