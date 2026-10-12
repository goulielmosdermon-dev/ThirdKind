import { notFound } from 'next/navigation';

import { DesignSheet } from '@/components/sheet/DesignSheet';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design',
  robots: { index: false, follow: false },
};

/**
 * A working page, kept off the live site. Production answers 404 so it
 * cannot be opened, indexed, or shared by accident.
 */
export default function DesignPage() {
  if (process.env.NODE_ENV === 'production') notFound();

  return <DesignSheet />;
}
