'use client';

import { PillLabel } from '@/components/sheet/PillLabel';
import { useInquiry } from '@/components/inquiry/InquiryProvider';

export function BookCallButton({
  label = 'Make Extraordinary',
  tone = 'ink',
  className,
}: {
  label?: string;
  tone?: 'ink' | 'paper';
  variant?: 'solid' | 'quiet';
  className?: string;
}) {
  const { openInquiry } = useInquiry();

  return (
    <button
      type="button"
      className={`inline-flex cursor-pointer border-0 bg-transparent p-0 ${className ?? ''}`}
      onClick={() => openInquiry()}
    >
      <PillLabel label={label} tone={tone} />
    </button>
  );
}
