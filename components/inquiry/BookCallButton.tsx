'use client';

import { PillLabel } from '@/components/sheet/PillLabel';
import { useInquiry } from '@/components/inquiry/InquiryProvider';

export function BookCallButton({
  label = 'reach out',
  tone = 'ink',
  variant = 'solid',
  className,
}: {
  label?: string;
  tone?: 'ink' | 'paper';
  variant?: 'solid' | 'quiet';
  className?: string;
}) {
  const { openInquiry } = useInquiry();

  if (variant === 'quiet') {
    return (
      <button
        type="button"
        className={`inline-flex w-fit rounded-md bg-black/[0.06] px-4 py-2 text-sm text-ink ${className ?? ''}`}
        onClick={() => openInquiry()}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`inline-flex transition-opacity duration-300 hover:opacity-85 ${className ?? ''}`}
      onClick={() => openInquiry()}
    >
      <PillLabel label={label} tone={tone} labelClassName="lowercase" />
    </button>
  );
}
