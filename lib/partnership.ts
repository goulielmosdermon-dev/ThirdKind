import type { Metadata } from 'next';

export const PARTNERSHIPS = {
  USA: { label: 'USA', market: 'US' },
  UK: { label: 'UK', market: 'UK' },
  China: { label: 'China', market: 'China', native: '第三类' },
  Japan: { label: 'Japan', market: 'Japan', native: '第三種' },
  India: { label: 'India', market: 'India' },
  Brazil: { label: 'Brazil', market: 'Brazil' },
} as const;

export type PartnershipKey = keyof typeof PARTNERSHIPS;

export function partnershipMeta(key: PartnershipKey): Metadata {
  const { label, market } = PARTNERSHIPS[key];
  return {
    title: `ThirdKind. ${label}`,
    description: `A partnership to run ThirdKind in the ${market} market. Not a job — a share of what you build.`,
  };
}
