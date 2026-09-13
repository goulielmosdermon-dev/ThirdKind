'use client';

import { motion, useReducedMotion } from 'motion/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { IndexView } from '@/components/canvas/IndexView';
import { useIntro } from '@/components/intro/IntroContext';
import {
  MOBILE_PREFIX,
  withMobilePrefix,
} from '@/components/mobile/MobileChrome';
import { useSheetNav } from '@/components/sheet/SheetNav';
import {
  ALIEN_ASPECT,
  HUMAN_ASPECT,
  layoutHands,
  mottoOpacity,
  STORY_LINES,
  storyLineOpacity,
} from '@/lib/intro/layout';
import { MOTION } from '@/lib/motion/tokens';
import type { CanvasNode, PortableText } from '@/types/content';

/** CSS viewport of iPhone 15 Pro. */
export const IPHONE_15_PRO = { width: 393, height: 852 } as const;
/** Status bar + Dynamic Island. Time and battery sit in this band. */
const IPHONE_SAFE_TOP = 62;
const IPHONE_SAFE_BOTTOM = 34;
const MOBILE_HANDS = {
  endScale: 0.3,
  safeTop: IPHONE_SAFE_TOP,
  inset: 14,
  dockBottom: IPHONE_SAFE_BOTTOM + 76,
} as const;

function MobileScreen({
  nodes,
  manifesto,
}: {
  nodes: CanvasNode[];
  manifesto: PortableText;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const sheetOpen = pathname !== MOBILE_PREFIX;
  const { markOpenedFromCanvas } = useSheetNav();
  const prefetch = useCallback(
    (href: string) => router.prefetch(withMobilePrefix(href, true)),
    [router],
  );
  const { progress, complete, advance } = useIntro();
  const motto = mottoOpacity(progress);
  const screenRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<number | null>(null);
  const completeRef = useRef(complete);
  const advanceRef = useRef(advance);
  // Read by the drag handlers, which are registered once; kept in step here
  // rather than during render.
  useEffect(() => {
    completeRef.current = complete;
    advanceRef.current = advance;
  });
  // The showcase is the whole screen here and the black section follows it, so
  // the hands keep out of the way until the reader is past both.
  const [openingPassed, setOpeningPassed] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number }>(
    IPHONE_15_PRO,
  );

  useEffect(() => {
    const frame = screenRef.current;
    if (!frame) {
      return;
    }
    const measure = () => {
      const rect = frame.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = screenRef.current;
    if (!frame) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      if (completeRef.current) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const span = Math.max(size.height * 3.6, 2200);
      advanceRef.current(event.deltaY / span);
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
  }, [size.height]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (complete) {
      return;
    }
    dragRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (complete || dragRef.current === null) {
      return;
    }
    const dy = event.clientY - dragRef.current;
    dragRef.current = event.clientY;
    const span = Math.max(size.height * 3.6, 2200);
    advance(-dy / span);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const hands = layoutHands(progress, size.width, size.height, MOBILE_HANDS);

  return (
    <motion.div
      ref={screenRef}
      className="relative h-full w-full origin-center overflow-hidden bg-void"
      animate={
        reduced
          ? { opacity: sheetOpen ? 0.88 : 1 }
          : { scale: sheetOpen ? 0.98 : 1, opacity: sheetOpen ? 0.92 : 1 }
      }
      transition={{
        duration: reduced ? MOTION.reduced : MOTION.sheetIn,
        ease: MOTION.easeOut,
      }}
      style={{ touchAction: complete ? 'pan-y' : 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {hands ? (
        <>
          <Image
            src="/brand/hand-alien.png"
            alt="Third Kind"
            width={3354}
            height={2203}
            priority
            className={`pointer-events-none absolute top-0 left-0 z-20 max-w-none mix-blend-multiply ${complete ? '' : 'tk-hands-in'}`}
            style={{
              height: hands.alien.height,
              width: hands.alien.height * ALIEN_ASPECT,
              transform: `translate(${hands.alien.x}px, ${hands.alien.y}px)`,
              opacity: openingPassed || !complete ? 1 : 0,
              transition: complete
                ? 'opacity 0.45s ease'
                : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <Image
            src="/brand/hand-human.png"
            alt=""
            width={2517}
            height={1819}
            priority
            className={`pointer-events-none absolute top-0 left-0 z-20 max-w-none mix-blend-multiply ${complete ? '' : 'tk-hands-in'}`}
            style={{
              height: hands.human.height,
              width: hands.human.height * HUMAN_ASPECT,
              transform: `translate(${hands.human.x}px, ${hands.human.y}px)`,
              opacity: openingPassed || !complete ? 1 : 0,
              transition: complete
                ? 'opacity 0.45s ease'
                : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), height 0.45s cubic-bezier(0.22, 1, 0.36, 1), width 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </>
      ) : null}

      <div
        // Held clear of the parked fingertips either side.
        className="pointer-events-none absolute inset-0 z-30 flex items-center px-12"
        aria-hidden={progress < 0.02 || progress > 0.55}
      >
        <div className="w-full text-left">
          {STORY_LINES.map((line, index) => (
            <p
              key={line}
              className="font-display text-[1.15rem] leading-[1.35] text-ink"
              style={{
                opacity: storyLineOpacity(progress, index),
                transition: complete
                  ? undefined
                  : 'opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <p
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-12 text-center font-display text-[1.65rem] leading-[0.95] text-ink"
        style={{
          opacity: motto,
          transition: complete ? undefined : 'opacity 0.4s ease',
        }}
        aria-hidden={motto < 0.05}
      >
        Extraordinary in a world of ordinary
      </p>

      {complete ? (
        <div
          data-preview-scroll
          data-surface="light"
          className="h-full overflow-y-auto overscroll-y-contain"
        >
          <IndexView
            density="phone"
            nodes={nodes}
            manifesto={manifesto}
            onOpeningPassed={setOpeningPassed}
            onOpen={(href, nodeId) => {
              markOpenedFromCanvas(nodeId);
              router.push(withMobilePrefix(href, true));
            }}
            onPrefetch={prefetch}
          />
        </div>
      ) : null}
    </motion.div>
  );
}

export function MobileHome({
  nodes,
  manifesto,
}: {
  nodes: CanvasNode[];
  manifesto: PortableText;
}) {
  return <MobileScreen nodes={nodes} manifesto={manifesto} />;
}
