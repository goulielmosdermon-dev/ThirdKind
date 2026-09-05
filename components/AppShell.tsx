'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { CanvasViewport } from '@/components/canvas/CanvasViewport';
import { CommandNav } from '@/components/chrome/CommandNav';
import { IntroProvider } from '@/components/intro/IntroContext';
import { InquiryProvider } from '@/components/inquiry/InquiryProvider';
import { SheetNavProvider } from '@/components/sheet/SheetNav';
import { MOTION } from '@/lib/motion/tokens';
import type { CanvasNode, Edge } from '@/types/content';

export function AppShell({
  children,
  sheet,
  nodes,
  edges,
  wordmarkLeft,
  wordmarkRight,
}: {
  children: ReactNode;
  sheet: ReactNode;
  nodes: CanvasNode[];
  edges: Edge[];
  wordmarkLeft: string;
  wordmarkRight: string;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const sheetOpen = pathname !== '/';

  return (
    <SheetNavProvider>
      <InquiryProvider>
        <IntroProvider skip={sheetOpen}>
          <div className="relative h-dvh overflow-hidden bg-void">
            <motion.div
              className="h-full origin-center"
              animate={
                reduced
                  ? { opacity: sheetOpen ? 0.88 : 1 }
                  : {
                      scale: sheetOpen ? 0.98 : 1,
                      opacity: sheetOpen ? 0.92 : 1,
                    }
              }
              transition={{
                duration: reduced ? MOTION.reduced : MOTION.sheetIn,
                ease: MOTION.easeOut,
              }}
            >
              <CanvasViewport
                nodes={nodes}
                edges={edges}
                wordmarkLeft={wordmarkLeft}
                wordmarkRight={wordmarkRight}
              />
            </motion.div>
            {/*
              Next keeps a parallel-route slot on its last match during soft
              navigation — default.tsx only applies on a fresh load — so a
              sheet closed with router.push('/') stays mounted, and its
              invisible backdrop swallows every click on the canvas. The path
              is the source of truth for whether a sheet exists.
            */}
            {sheetOpen ? sheet : null}
            {children}
            <CommandNav nodes={nodes} />
          </div>
        </IntroProvider>
      </InquiryProvider>
    </SheetNavProvider>
  );
}
