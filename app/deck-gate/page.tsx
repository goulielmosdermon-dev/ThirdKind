import { notFound } from 'next/navigation';

import { brands } from '../2000/brands';
import { Gate } from './Gate';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Private',
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ deck?: string }>;
}) {
  const { deck } = await searchParams;
  if (!deck || !brands[deck]) notFound();

  return (
    <div className="flex min-h-svh items-center bg-paper text-ink">
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-10">
        <Gate slug={deck} />
      </div>
    </div>
  );
}
