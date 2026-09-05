'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from 'react';

export const MOBILE_PREFIX = '/mobile';

type MobileChromeValue = {
  framed: true;
  homeHref: typeof MOBILE_PREFIX;
};

const MobileChromeContext = createContext<MobileChromeValue | null>(null);

export function MobileChromeProvider({ children }: { children: ReactNode }) {
  return (
    <MobileChromeContext.Provider
      value={{ framed: true, homeHref: MOBILE_PREFIX }}
    >
      {children}
    </MobileChromeContext.Provider>
  );
}

export function useMobileChrome(): MobileChromeValue | null {
  return useContext(MobileChromeContext);
}

export function useFramed(): boolean {
  const pathname = usePathname();
  return useMobileChrome() !== null || pathname.startsWith(MOBILE_PREFIX);
}

export function sitePath(pathname: string): string {
  if (pathname === MOBILE_PREFIX) {
    return '/';
  }
  if (pathname.startsWith(`${MOBILE_PREFIX}/`)) {
    return pathname.slice(MOBILE_PREFIX.length);
  }
  return pathname;
}

export function withMobilePrefix(href: string, framed: boolean): string {
  if (!framed || href.startsWith('http') || href.startsWith('mailto:')) {
    return href;
  }
  if (href === '/') {
    return MOBILE_PREFIX;
  }
  if (href.startsWith(MOBILE_PREFIX)) {
    return href;
  }
  return `${MOBILE_PREFIX}${href}`;
}

export function AppLink({
  href,
  ...props
}: ComponentProps<typeof Link>) {
  const framed = useFramed();
  const resolved =
    typeof href === 'string' ? withMobilePrefix(href, framed) : href;
  return <Link href={resolved} {...props} />;
}
