'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { CanvasViewport } from '@/components/canvas/CanvasViewport';
import { SheetNavProvider } from '@/components/sheet/SheetNav';
import { canvasNodes, edges } from '@/lib/fixtures/content';

export function AppShell({
  children,
  sheet,
}: {
  children: ReactNode;
  sheet: ReactNode;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const sheetOpen = pathname !== '/';

  return (
    <SheetNavProvider>
      <div className="relative h-dvh overflow-hidden bg-neutral-950">
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
          transition={{ duration: reduced ? 0.12 : 0.42 }}
        >
          <CanvasViewport nodes={canvasNodes} edges={edges} />
        </motion.div>
        {sheet}
        {children}
      </div>
    </SheetNavProvider>
  );
}
