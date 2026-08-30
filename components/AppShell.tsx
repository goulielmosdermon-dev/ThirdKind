'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { CanvasViewport } from '@/components/canvas/CanvasViewport';
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
      <div className="relative h-dvh overflow-hidden bg-void">
        <motion.div
          className="h-full origin-center"
          animate={
            reduced
              ? { opacity: sheetOpen ? 0.7 : 1 }
              : {
                  scale: sheetOpen ? 0.98 : 1,
                  opacity: sheetOpen ? 0.85 : 1,
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
        {sheet}
        {children}
      </div>
    </SheetNavProvider>
  );
}
