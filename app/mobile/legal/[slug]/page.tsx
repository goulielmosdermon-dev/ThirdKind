import { notFound } from 'next/navigation';

import { LegalSheet } from '@/components/sheet/LegalSheet';
import { getLegalPage, isLegalSlug, LEGAL_SLUGS } from '@/lib/fixtures/legal';

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export default async function MobileLegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    notFound();
  }
  const page = getLegalPage(slug);
  if (!page) {
    notFound();
  }
  return <LegalSheet page={page} />;
}
