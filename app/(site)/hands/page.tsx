import { HandsSheet } from '@/components/sheet/HandsSheet';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hands',
};

export default function HandsPage() {
  return <HandsSheet />;
}
