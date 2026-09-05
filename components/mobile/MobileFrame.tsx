'use client';

import { usePathname } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

import { CommandNav } from '@/components/chrome/CommandNav';
import { IntroProvider } from '@/components/intro/IntroContext';
import { InquiryProvider } from '@/components/inquiry/InquiryProvider';
import {
  MobileChromeProvider,
  MOBILE_PREFIX,
} from '@/components/mobile/MobileChrome';
import { IPHONE_15_PRO } from '@/components/mobile/MobilePreview';
import { SheetNavProvider } from '@/components/sheet/SheetNav';
import type { CanvasNode } from '@/types/content';

export function MobileFrame({
  children,
  sheet,
  nodes,
}: {
  children: ReactNode;
  sheet: ReactNode;
  nodes: CanvasNode[];
}) {
  const pathname = usePathname();
  const onHome = pathname === MOBILE_PREFIX;

  return (
    <MobileChromeProvider>
      <SheetNavProvider>
        <IntroProvider skip={!onHome}>
          <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#e8e4dc] px-4 py-8">
            <p className="text-caption tracking-[0.14em] text-mute uppercase">
              iPhone 15 Pro · 393 × 852
            </p>
            <div
              className="relative shrink-0 bg-black shadow-[0_24px_80px_rgb(28_26_22/0.28)]"
              style={{
                width: IPHONE_15_PRO.width + 16,
                height: IPHONE_15_PRO.height + 16,
                borderRadius: 58,
                padding: 8,
              }}
            >
              <div
                className="relative overflow-hidden bg-void"
                style={{
                  width: IPHONE_15_PRO.width,
                  height: IPHONE_15_PRO.height,
                  borderRadius: 47,
                }}
              >
                <div
                  className="pointer-events-none absolute top-3 left-1/2 z-[60] h-[34px] w-[126px] -translate-x-1/2 rounded-full bg-black"
                  aria-hidden
                />
                <div
                  className="@container relative h-full w-full overflow-hidden"
                  style={
                    {
                      '--frame-h': `${IPHONE_15_PRO.height}px`,
                    } as CSSProperties
                  }
                >
                  <InquiryProvider>
                    {children}
                    {/* See AppShell: a stale slot would block the canvas. */}
                    {onHome ? null : sheet}
                    <CommandNav nodes={nodes} embedded />
                  </InquiryProvider>
                </div>
              </div>
            </div>
          </div>
        </IntroProvider>
      </SheetNavProvider>
    </MobileChromeProvider>
  );
}
