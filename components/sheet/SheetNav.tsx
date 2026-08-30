'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type SheetNavValue = {
  markOpenedFromCanvas: (nodeId: string) => void;
  dismissToCanvas: (navigate: (href: '/' | 'back') => void) => void;
  originNodeId: string | null;
};

const SheetNavContext = createContext<SheetNavValue | null>(null);

export function SheetNavProvider({ children }: { children: ReactNode }) {
  const openedFromCanvasRef = useRef(false);
  const [originNodeId, setOriginNodeId] = useState<string | null>(null);

  const markOpenedFromCanvas = useCallback((nodeId: string) => {
    openedFromCanvasRef.current = true;
    setOriginNodeId(nodeId);
  }, []);

  const dismissToCanvas = useCallback(
    (navigate: (href: '/' | 'back') => void) => {
      if (openedFromCanvasRef.current) {
        openedFromCanvasRef.current = false;
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
