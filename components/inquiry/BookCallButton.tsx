'use client';

import { useInquiry } from '@/components/inquiry/InquiryProvider';

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M4 12L12 4M12 4H6.5M12 4V9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BookCallButton({
  label = 'book a call',
  tone = 'ink',
  variant = 'solid',
  service,
  className,
}: {
  label?: string;
  tone?: 'ink' | 'paper';
  variant?: 'solid' | 'quiet';
  service?: string;
  className?: string;
}) {
  const { openInquiry } = useInquiry();

  if (variant === 'quiet') {
    return (
      <button
        type="button"
        className={`inline-flex w-fit rounded-md bg-black/[0.06] px-4 py-2 text-sm text-ink ${className ?? ''}`}
        onClick={() => openInquiry({ service })}
      >
        {label}
      </button>
    );
  }

  const block = tone === 'paper' ? 'bg-white text-ink' : 'bg-ink text-white';

  return (
    <button
      type="button"
      className={`inline-flex items-stretch gap-px ${className ?? ''}`}
      onClick={() => openInquiry({ service })}
    >
      <span
        className={`flex items-center rounded-md px-5 text-sm lowercase tracking-[0.04em] ${block}`}
      >
        {label}
      </span>
      <span
        className={`flex aspect-square w-[2.65rem] items-center justify-center rounded-md ${block}`}
      >
        <ArrowUpRight />
      </span>
    </button>
  );
}
