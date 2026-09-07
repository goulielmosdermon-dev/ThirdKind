'use client';

import { AnimatePresence } from 'motion/react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { InquiryOverlay } from '@/components/inquiry/InquiryOverlay';

type InquiryContextValue = {
  openInquiry: () => void;
  closeInquiry: () => void;
};

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openInquiry = useCallback(() => {
    setOpen(true);
  }, []);

  const closeInquiry = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ openInquiry, closeInquiry }),
    [closeInquiry, openInquiry],
  );

  return (
    <InquiryContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {open ? <InquiryOverlay key="inquiry" onClose={closeInquiry} /> : null}
      </AnimatePresence>
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiry must be used within InquiryProvider');
  }
  return context;
}
