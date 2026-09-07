'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Milestones = {
  /** The showcase has been scrolled fully off the top of the screen. */
  headerPassed: boolean;
  /** Half of it has — where the motto parked on it gives up its place. */
  headerHalfPassed: boolean;
  /** The black manifesto section has too — the opening is behind us. */
  openingPassed: boolean;
};

type PageScrollValue = Milestones & {
  report: (next: Partial<Milestones>) => void;
};

/**
 * How far down the index the reader has come, shared with the chrome that sits
 * outside it — the command bar is a sibling of the canvas, not a child of the
 * scroller, so it has no other way to know.
 */
const PageScrollContext = createContext<PageScrollValue | null>(null);

export function PageScrollProvider({ children }: { children: ReactNode }) {
  const [milestones, setMilestones] = useState<Milestones>({
    headerPassed: false,
    headerHalfPassed: false,
    openingPassed: false,
  });

  const report = useCallback((next: Partial<Milestones>) => {
    setMilestones((current) => {
      const merged = { ...current, ...next };
      return merged.headerPassed === current.headerPassed &&
        merged.headerHalfPassed === current.headerHalfPassed &&
        merged.openingPassed === current.openingPassed
        ? current
        : merged;
    });
  }, []);

  const value = useMemo(
    () => ({ ...milestones, report }),
    [milestones, report],
  );

  return (
    <PageScrollContext.Provider value={value}>
      {children}
    </PageScrollContext.Provider>
  );
}

/**
 * Outside a provider — the phone preview, say — the opening is treated as
 * already behind us, so nothing that waits on it stays hidden.
 */
export function usePageScroll(): PageScrollValue {
  return (
    useContext(PageScrollContext) ?? {
      headerPassed: true,
      headerHalfPassed: true,
      openingPassed: true,
      report: () => {},
    }
  );
}
