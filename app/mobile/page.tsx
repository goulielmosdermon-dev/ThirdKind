import type { Metadata } from 'next';

import { MobileHome } from '@/components/mobile/MobilePreview';
import { deriveCanvasNodes } from '@/lib/canvas/derive';
import { getSiteContent } from '@/lib/content/queries';

export const metadata: Metadata = {
  title: 'Mobile · Third Kind',
};

export default async function MobilePage() {
  const content = await getSiteContent();
  const nodes = deriveCanvasNodes(content);
  const manifesto =
    content.aboutSections.find((section) => section.key === 'why')?.body ?? [];

  return <MobileHome nodes={nodes} manifesto={manifesto} />;
}
