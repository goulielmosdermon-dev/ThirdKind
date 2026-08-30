'use client';

import { useRouter } from 'next/navigation';
import { useReducedMotion } from 'motion/react';
import { motion } from 'motion/react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';

import { useSheetNav } from '@/components/sheet/SheetNav';
import { MOTION } from '@/lib/motion/tokens';

const SWIPE_PX = 120;
const SWIPE_VELOCITY = 0.55;

function focusable(root: HTMLElement): HTMLElement[] {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((node) => !node.hasAttribute('disabled') && node.tabIndex !== -1);
}

export function Sheet({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const titleId = useId();
  const router = useRouter();
  const reduced = useReducedMotion();
  const { dismissToCanvas, originNodeId } = useSheetNav();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const closedRef = useRef(false);
  const dragRef = useRef<{ y: number; time: number } | null>(null);
  const [dragY, setDragY] = useState(0);

  const finishClose = useCallback(() => {
    if (originNodeId) {
      const origin = document.querySelector<HTMLElement>(
        `[data-node-id="${originNodeId}"]`,
      );
      origin?.focus();
    }
    dismissToCanvas((target) => {
      if (target === 'back') {
        router.back();
        return;
      }
      router.push('/');
    });
  }, [dismissToCanvas, originNodeId, router]);

  const requestClose = useCallback(() => {
    if (closing) {
      return;
    }
    setClosing(true);
  }, [closing]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!closing) {
      return;
    }
    const wait = (reduced ? MOTION.reduced : MOTION.sheetOut) * 1000 + 80;
    const timer = window.setTimeout(() => {
      if (!closedRef.current) {
        closedRef.current = true;
        finishClose();
      }
    }, wait);
    return () => window.clearTimeout(timer);
  }, [closing, finishClose, reduced]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }
      const nodes = focusable(panelRef.current);
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose]);

  const onHeaderPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {
      if (!(error instanceof DOMException)) {
        throw error;
      }
    }
    dragRef.current = { y: event.clientY, time: event.timeStamp };
  };

  const onHeaderPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) {
      return;
    }
    setDragY(Math.max(0, event.clientY - start.y));
  };

  const onHeaderPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    dragRef.current = null;
    if (!start) {
      setDragY(0);
      return;
    }
    const dy = Math.max(0, event.clientY - start.y);
    const dt = Math.max(1, event.timeStamp - start.time);
    const velocity = dy / dt;
    if (dy >= SWIPE_PX || velocity >= SWIPE_VELOCITY) {
      requestClose();
      return;
    }
    setDragY(0);
  };

  const duration = reduced
    ? MOTION.reduced
    : closing
      ? MOTION.sheetOut
      : MOTION.sheetIn;

  return (
    <div className="fixed inset-0 z-40">
      <motion.button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-void"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 0.72 }}
        transition={{ duration: reduced ? MOTION.reduced : MOTION.backdrop }}
        onClick={requestClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex h-[min(92dvh,900px)] flex-col border-t border-hairline bg-void text-ink outline-none"
        initial={reduced ? { opacity: 0 } : { y: '100%', opacity: 1 }}
        animate={
          reduced
            ? { opacity: closing ? 0 : 1 }
            : { y: closing ? '100%' : dragY, opacity: 1 }
        }
        transition={{
          duration: !closing && dragY > 0 ? 0 : duration,
          ease: MOTION.easeOut,
        }}
        onAnimationComplete={() => {
          if (closing && !closedRef.current) {
            closedRef.current = true;
            finishClose();
          }
        }}
      >
        <div
          className="flex shrink-0 items-center justify-between border-b border-hairline px-6 py-4"
          onPointerDown={onHeaderPointerDown}
          onPointerMove={onHeaderPointerMove}
          onPointerUp={onHeaderPointerUp}
          onPointerCancel={onHeaderPointerUp}
        >
          <h1 id={titleId} className="font-display pr-4 text-title text-ink">
            {title}
          </h1>
          <button
            type="button"
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-hairline font-mono text-mute"
            onClick={requestClose}
            onPointerDown={(event) => event.stopPropagation()}
          >
            ×
          </button>
        </div>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
