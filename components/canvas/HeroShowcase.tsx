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
      <HeroCarousel
        nodes={nodes}
        onOpen={onOpen}
        paused={paused}
        scale={rect.height}
      />
    </div>
  );
}

/**
 * The slides themselves, filling whatever box they are given.
 *
 * In `world` mode the box is measured in world units, so the copy is sized
 * from `scale` — the box's height — and the View pill, which is built in
 * fixed px for the sheets, is scaled to match. On a page the box is already
 * in CSS px: type comes from container-query height units and the pill is
 * left at its natural size, the same as every other button on the site.
 */
export function HeroCarousel({
  nodes,
  onOpen,
  paused = false,
  scale,
  mode = 'world',
}: {
  nodes: CanvasNode[];
  onOpen: (node: LeafCanvasNode) => void;
  paused?: boolean;
  scale: number;
  mode?: 'world' | 'screen';
}) {
  const screen = mode === 'screen';
  const featured = HERO_IDS.map((id) =>
    nodes.find(
      (node): node is LeafCanvasNode => node.kind === 'leaf' && node.id === id,
    ),
  ).filter((node): node is LeafCanvasNode => Boolean(node));

  const count = featured.length;
  // The track runs one way only. It carries the list twice, so stepping past
  // the last slide lands on an identical copy of the first, and the counter
  // is reset there with the transition off — invisible, because the frame
  // either side of the reset is the same picture. Wrapping the index instead
  // would slide everything back to the right, which is the rewind we do not
  // want.
  const slides = count > 1 ? [...featured, ...featured] : featured;
  const [step, setStep] = useState(0);
  const [gliding, setGliding] = useState(true);

  useEffect(() => {
    if (paused || count < 2) {
      return;
    }
    const timer = window.setInterval(() => {
      setStep((current) => current + 1);
    }, HERO_HOLD_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  useEffect(() => {
    if (step !== count || count < 2) {
      return;
    }
    const timer = window.setTimeout(() => {
      setGliding(false);
      setStep(0);
    }, HERO_SLIDE_MS + 60);
    return () => window.clearTimeout(timer);
  }, [count, step]);

  // Restore the transition on the frame after the silent jump.
  useEffect(() => {
    if (gliding) {
      return;
    }
    const raf = requestAnimationFrame(() => setGliding(true));
    return () => cancelAnimationFrame(raf);
  }, [gliding]);

  if (featured.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 flex"
      style={{
        width: `${slides.length * 100}%`,
        transform: `translate3d(-${(step * 100) / slides.length}%, 0, 0)`,
        transition: gliding
          ? `transform ${HERO_SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`
          : 'none',
      }}
    >
      {slides.map((node, position) => {
        const duplicate = position >= count;
        return (
          <button
            key={`${node.id}-${position}`}
            type="button"
            aria-hidden={duplicate || position !== step % count}
            tabIndex={!duplicate && position === step % count ? 0 : -1}
            onClick={() => onOpen(node)}
            className="relative block h-full shrink-0 cursor-pointer border-0 bg-transparent p-0 text-left"
            style={{ width: `${100 / slides.length}%` }}
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
            <span
              // Title and action hold opposite corners of the lower edge.
              className={`absolute inset-x-0 bottom-0 flex items-end justify-between ${
                screen ? 'gap-[4cqh] p-[5cqh]' : ''
              }`}
              style={
                screen
                  ? undefined
                  : { padding: scale * 0.05, gap: scale * 0.035 }
              }
            >
              <span
                className={`font-display block leading-tight text-white ${screen ? 'text-[5.5cqh]' : ''}`}
                style={screen ? undefined : { fontSize: scale * 0.055 }}
              >
                {node.title}
              </span>
              <span
                className="shrink-0 origin-bottom-right"
                // PillLabel is built in fixed px for the sheets. In world
                // units it has to be scaled up to sit with this type; on a
                // page it is already the right size.
                style={screen ? undefined : { scale: `${(scale * 0.05) / 42.4}` }}
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
