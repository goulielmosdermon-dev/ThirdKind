'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from 'motion/react';

import { clamp01 } from '@/lib/intro/layout';

type IntroValue = {
  progress: number;
  complete: boolean;
  advance: (delta: number) => void;
};

const IntroContext = createContext<IntroValue | null>(null);

export function IntroProvider({
  children,
  skip = false,
}: {
  children: ReactNode;
  skip?: boolean;
}) {
  const reduced = useReducedMotion() === true;
  const [progress, setProgress] = useState(skip ? 1 : 0);

  useEffect(() => {
    if (skip) {
      setProgress(1);
    }
  }, [skip]);

  const advance = useCallback((delta: number) => {
    setProgress((current) => clamp01(current + delta));
  }, []);

  const resolved = skip || reduced ? 1 : progress;

  const value = useMemo(
    () => ({
      progress: resolved,
      complete: resolved >= 0.999,
      advance,
    }),
    [advance, resolved],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

export function useIntro(): IntroValue {
  const value = useContext(IntroContext);
  if (!value) {
    throw new Error('useIntro must be used within IntroProvider');
  }
  return value;
}
