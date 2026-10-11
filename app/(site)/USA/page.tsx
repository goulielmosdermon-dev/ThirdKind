import { UsaSheet } from '@/components/sheet/UsaSheet';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ThirdKind. USA',
  description:
    'A partnership to run ThirdKind in the US market. Not a job — a share of what you build.',
};

export default function UsaPage() {
  return <UsaSheet />;
}
