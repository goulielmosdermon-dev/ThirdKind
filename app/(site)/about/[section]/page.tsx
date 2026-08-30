import { AboutSheet } from '@/components/sheet/AboutSheet';
import {
  aboutStaticParams,
  getSiteContent,
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
  const [about, content] = await Promise.all([
    requireAboutSection(section),
    getSiteContent(),
  ]);
  return <AboutSheet section={about} poem={content.settings.poem} />;
}
