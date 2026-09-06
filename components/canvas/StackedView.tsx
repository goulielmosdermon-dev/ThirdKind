'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useRef, useState } from 'react';

import { HeroCarousel } from '@/components/canvas/HeroShowcase';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { gridSectionKey } from '@/lib/canvas/gridLayout';
import { leafReadingOrder } from '@/lib/canvas/readingOrder';
import { repelOffset } from '@/lib/canvas/repel';
import { isUnoptimizedAsset } from '@/lib/content/mediaSrc';
import { MOTION } from '@/lib/motion/tokens';
import { HUB_KEYS, type CanvasNode, type HubKey, type LeafCanvasNode } from '@/types/content';

/**
 * A whisper of the canvas's magnet. The radius has to clear a whole column —
 * tile centres sit roughly 460px apart at three across — or no neighbour ever
 * falls inside it.
 */
const NUDGE_RADIUS = 780;
// The falloff is squared, so at a neighbour's distance only a sixth of this
// survives — about 10px, which is the intended whisper.
const NUDGE_STRENGTH = 62;

const SECTION_LABEL: Record<HubKey, string> = {
  work: 'Work',
  thoughts: 'Thoughts',
  about: 'About',
  contact: 'Contact',
};

function Tile({
  node,
  onOpen,
  onHover,
  offset,
  reduced,
  registerRef,
}: {
  node: LeafCanvasNode;
  onOpen: (node: LeafCanvasNode) => void;
  onHover: (id: string | null) => void;
  offset: { x: number; y: number };
  reduced: boolean;
  registerRef: (id: string, element: HTMLLIElement | null) => void;
}) {
  return (
    <li
      ref={(element) => registerRef(node.id, element)}
      className="mb-[3vw] break-inside-avoid"
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: `transform ${MOTION.hub}s cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
    >
      <motion.button
        type="button"
        initial={reduced ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: reduced ? MOTION.reduced : MOTION.sheetIn,
          ease: MOTION.easeOut,
        }}
        onClick={() => onOpen(node)}
        onMouseEnter={() => onHover(node.id)}
        onMouseLeave={() => onHover(null)}
        className="group block w-full cursor-pointer border-0 bg-transparent p-0 text-left"
      >
        {/* Crops are left as authored — the ragged rhythm is the point. */}
        <span className="relative block w-full overflow-hidden bg-hairline">
          <span className="tk-loading absolute inset-0" aria-hidden />
          <Image
            src={node.thumbnail.src}
            alt=""
            width={node.thumbnail.width}
            height={node.thumbnail.height}
            sizes="(min-width: 1100px) 30vw, (min-width: 700px) 46vw, 92vw"
            unoptimized={isUnoptimizedAsset(node.thumbnail)}
            className="h-auto w-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
          />
        </span>
        <span className="font-display mt-3 block text-[clamp(1rem,1.4vw,1.3rem)] leading-tight text-ink">
          {node.title}
        </span>
        {node.hoverDescription ? (
          <span className="mt-1 block text-[0.95rem] leading-snug text-mute">
            {node.hoverDescription}
          </span>
        ) : null}
      </motion.button>
    </li>
  );
}

/**
 * Organized 2: the same content as the canvas, read as a page. Sections stack
 * one under the other with real headings, three tiles to a row, and the
 * showcase leading at the top.
 */
export function StackedView({
  nodes,
  onOpen,
}: {
  nodes: CanvasNode[];
  onOpen: (node: LeafCanvasNode) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const tileRefs = useRef(new Map<string, HTMLLIElement>());

  const registerRef = useCallback((id: string, element: HTMLLIElement | null) => {
    if (element) {
      tileRefs.current.set(id, element);
    } else {
      tileRefs.current.delete(id);
    }
  }, []);

  const leaves = leafReadingOrder(nodes);
  const sections = HUB_KEYS.map((key) => ({
    key,
    label: SECTION_LABEL[key],
    items: leaves.filter((leaf) => gridSectionKey(leaf) === key),
  })).filter((section) => section.items.length > 0);

  // Neighbours give a little as the cursor arrives — a transform only, so the
  // grid never reflows. Measured in the hover handler, where reading the DOM
  // is allowed, rather than during render or in an effect.
  const [offsets, setOffsets] = useState<Map<string, { x: number; y: number }>>(
    () => new Map(),
  );

  const handleHover = useCallback(
    (id: string | null) => {
      const tiles = tileRefs.current;
      const from = id ? tiles.get(id) : null;
      if (!from || reduced) {
        setOffsets((current) => (current.size === 0 ? current : new Map()));
        return;
      }
      const a = from.getBoundingClientRect();
      const origin = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
      const next = new Map<string, { x: number; y: number }>();
      tiles.forEach((element, otherId) => {
        if (otherId === id) {
          return;
        }
        const b = element.getBoundingClientRect();
        const push = repelOffset(
          { x: b.x + b.width / 2, y: b.y + b.height / 2 },
          origin,
          NUDGE_RADIUS,
          NUDGE_STRENGTH,
        );
        if (push.x !== 0 || push.y !== 0) {
          next.set(otherId, push);
        }
      });
      setOffsets(next);
    },
    [reduced],
  );

  return (
    <motion.div
      data-stacked-view
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? MOTION.reduced : MOTION.zoom }}
      className="absolute inset-0 z-[8] overflow-y-auto overscroll-y-contain bg-void"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
        <HeroCarousel nodes={nodes} onOpen={onOpen} scale={520} />
      </div>

      <div className="px-[4vw] pt-[6vw] pb-[8vw]">
        {sections.map((section) => (
          <section key={section.key} className="mb-[8vw] last:mb-0">
            <h2 className="font-display mb-[3vw] text-[clamp(1.8rem,4vw,3.2rem)] leading-none text-ink">
              {section.label}
            </h2>
            <ul className="columns-1 gap-[3vw] md:columns-2 lg:columns-3">
              {section.items.map((node) => (
                <Tile
                  key={node.id}
                  node={node}
                  onOpen={onOpen}
                  onHover={handleHover}
                  offset={offsets.get(node.id) ?? { x: 0, y: 0 }}
                  reduced={reduced}
                  registerRef={registerRef}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <SiteFooter />
    </motion.div>
  );
}
