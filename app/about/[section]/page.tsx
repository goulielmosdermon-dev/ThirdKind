import { AboutSheet } from '@/components/sheet/AboutSheet';
import {
  aboutStaticParams,
  isAboutKey,
  requireAboutSection,
} from '@/lib/content/queries';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return aboutStaticParams();
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isAboutKey(section)) {
    notFound();
  }
  return <AboutSheet section={requireAboutSection(section)} />;
}
