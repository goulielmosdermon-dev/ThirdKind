'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { sitePath } from '@/components/mobile/MobileChrome';

type SheetNavValue = {
  markOpenedFromCanvas: (nodeId: string) => void;
  dismissToCanvas: (navigate: (href: '/' | 'back') => void) => void;
  originNodeId: string | null;
};

const SheetNavContext = createContext<SheetNavValue | null>(null);

export function SheetNavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const openedFromCanvasRef = useRef(false);
  const armedPathRef = useRef<string | null>(null);
  const [originNodeId, setOriginNodeId] = useState<string | null>(null);

  // Only a sheet opened directly off the canvas can be dismissed with
  // history.back(). Opening one from inside another sheet — the command nav, an
  // in-page link — leaves the previous entry pointing at that sheet, so closing
  // has to push the canvas instead of stepping back into it.
  const markOpenedFromCanvas = useCallback(
    (nodeId: string) => {
      openedFromCanvasRef.current = sitePath(pathname) === '/';
      armedPathRef.current = null;
      setOriginNodeId(nodeId);
    },
    [pathname],
  );

  // A sheet can also link straight to another sheet without going through
  // markOpenedFromCanvas, which would leave the arm from the first open in
  // place. Remember which sheet the canvas actually opened and disarm as soon
  // as the route moves past it.
  useEffect(() => {
    if (!openedFromCanvasRef.current || sitePath(pathname) === '/') {
      return;
    }
    if (armedPathRef.current === null) {
      armedPathRef.current = pathname;
      return;
    }
    if (armedPathRef.current !== pathname) {
      openedFromCanvasRef.current = false;
      armedPathRef.current = null;
    }
  }, [pathname]);

  const dismissToCanvas = useCallback(
    (navigate: (href: '/' | 'back') => void) => {
      if (openedFromCanvasRef.current) {
        openedFromCanvasRef.current = false;
        armedPathRef.current = null;
        navigate('back');
        return;
      }
      navigate('/');
    },
    [],
  );

  const value = useMemo(
    () => ({ markOpenedFromCanvas, dismissToCanvas, originNodeId }),
    [dismissToCanvas, markOpenedFromCanvas, originNodeId],
  );

  return (
    <SheetNavContext.Provider value={value}>
      {children}
    </SheetNavContext.Provider>
  );
}

export function useSheetNav(): SheetNavValue {
  const value = useContext(SheetNavContext);
  if (!value) {
    throw new Error('useSheetNav must be used within SheetNavProvider');
  }
  return value;
}
