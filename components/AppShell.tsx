'use client';

import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

import { CanvasViewport } from '@/components/canvas/CanvasViewport';
import { CommandNav } from '@/components/chrome/CommandNav';
import { TopMenu } from '@/components/chrome/TopMenu';
import { PageScrollProvider } from '@/components/chrome/PageScroll';
import { IntroProvider } from '@/components/intro/IntroContext';
import { InquiryProvider } from '@/components/inquiry/InquiryProvider';
import { SheetNavProvider } from '@/components/sheet/SheetNav';
import { MOTION } from '@/lib/motion/tokens';
import type { CanvasNode, Edge, PortableText } from '@/types/content';

export function AppShell({
  children,
  sheet,
  nodes,
  edges,
  manifesto,
  wordmarkLeft,
  wordmarkRight,
}: {
  children: ReactNode;
  sheet: ReactNode;
  nodes: CanvasNode[];
  edges: Edge[];
  /** The Why copy, read on the index page between showcase and list. */
  manifesto: PortableText;
  wordmarkLeft: string;
  wordmarkRight: string;
}) {
  const pathname = usePathname();
  const sheetSegment = useSelectedLayoutSegment('sheet');
  const intercepted = sheetSegment !== null && sheetSegment !== '__DEFAULT__';
  const reduced = useReducedMotion();
  const sheetOpen = pathname !== '/';

  return (
    <SheetNavProvider>
      <InquiryProvider>
        <IntroProvider skip={sheetOpen}>
          <PageScrollProvider>
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
                  manifesto={manifesto}
                  wordmarkLeft={wordmarkLeft}
                  wordmarkRight={wordmarkRight}
                />
              </motion.div>
              {/* Render one reading surface: an intercepted slot retains its
                  background route, which may itself contain a full-page sheet. */}
              {sheetOpen ? (
                <div key={pathname} className="relative z-[45]">
                  {intercepted ? sheet : children}
                </div>
              ) : (
                children
              )}
              <CommandNav nodes={nodes} />
              <TopMenu nodes={nodes} />
            </div>
          </PageScrollProvider>
        </IntroProvider>
      </InquiryProvider>
    </SheetNavProvider>
  );
}
