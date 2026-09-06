'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { PillLabel } from '@/components/sheet/PillLabel';
import type { WorldRect } from '@/lib/canvas/geometry';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import type { CanvasNode, LeafCanvasNode } from '@/types/content';

/** The projects that lead, in order. */
export const HERO_IDS = [
  'project-scytales-2',
  'project-scania',
  'project-up-hellas',
] as const;

/** How long a project holds before it gives way, in ms. */
export const HERO_HOLD_MS = 10000;
/** How long the outgoing slide takes, in ms. */
export const HERO_SLIDE_MS = 900;

/**
 * The showcase band that leads the Organized canvas. It is drawn in world
 * coordinates like any tile, so it pans and zooms with everything else and
 * you can drag back up to it.
 */
export function HeroShowcase({
  nodes,
  rect,
  onOpen,
  paused = false,
}: {
  nodes: CanvasNode[];
  rect: WorldRect;
  onOpen: (node: LeafCanvasNode) => void;
  /** Held still while the band is out of view. */
  paused?: boolean;
}) {
  const featured = HERO_IDS.map((id) =>
    nodes.find(
      (node): node is LeafCanvasNode => node.kind === 'leaf' && node.id === id,
    ),
  ).filter((node): node is LeafCanvasNode => Boolean(node));

  const [index, setIndex] = useState(0);
  const count = featured.length;

  useEffect(() => {
    if (paused || count < 2) {
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, HERO_HOLD_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (featured.length === 0) {
    return null;
  }

  return (
    <div
      data-hero-showcase
      className="absolute overflow-hidden bg-black"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        zIndex: 1,
      }}
    >
      {featured.map((node, position) => {
        // Each slide waits to the right, holds centre, then leaves left.
        const offset = position - index;
        return (
          <button
            key={node.id}
            type="button"
            aria-hidden={offset !== 0}
            tabIndex={offset === 0 ? 0 : -1}
            onClick={() => onOpen(node)}
            className="absolute inset-0 block cursor-pointer border-0 bg-transparent p-0 text-left"
            style={{
              transform: `translate3d(${offset * 100}%, 0, 0)`,
              transition: `transform ${HERO_SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`,
              // Only the slide leaving and the one arriving need painting.
              visibility: Math.abs(offset) > 1 ? 'hidden' : 'visible',
            }}
          >
            <Image
              src={node.thumbnail.src}
              alt=""
              fill
              priority={position === 0}
              sizes="100vw"
              unoptimized={isUnoptimizedAsset(node.thumbnail)}
              className="object-cover"
            />
            <span
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
              aria-hidden
            />
            {/* Same treatment as the Work page's featured project, stacked
                at the foot of the frame rather than the head. Everything is
                sized from the band's own height: these are world units, so a
                fixed px value would be microscopic once drawn. */}
            <span
              className="absolute bottom-0 left-0 flex flex-col items-start"
              style={{
                padding: rect.height * 0.05,
                gap: rect.height * 0.035,
              }}
            >
              <span className="block">
                <span
                  className="font-display block leading-tight text-white"
                  style={{ fontSize: rect.height * 0.055 }}
                >
                  {node.title}
                </span>
                {node.hoverDescription ? (
                  <span
                    className="block leading-snug text-white/80"
                    style={{
                      fontSize: rect.height * 0.026,
                      marginTop: rect.height * 0.014,
                    }}
                  >
                    {node.hoverDescription}
                  </span>
                ) : null}
              </span>
              <span
                className="origin-bottom-left"
                // PillLabel is built in fixed px for the sheets; its natural
                // height is 2.65rem, so scale it to sit with this type.
                style={{ scale: `${(rect.height * 0.05) / 42.4}` }}
              >
                <PillLabel label="View" tone="paper" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
