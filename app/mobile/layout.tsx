import { MobileFrame } from '@/components/mobile/MobileFrame';
import { deriveCanvasNodes } from '@/lib/canvas/derive';
import { getSiteContent } from '@/lib/content/queries';

export default async function MobileLayout({
  children,
  sheet,
}: {
  children: React.ReactNode;
  sheet: React.ReactNode;
}) {
  const content = await getSiteContent();
  const nodes = deriveCanvasNodes(content);

  return (
    <MobileFrame nodes={nodes} sheet={sheet}>
      {children}
    </MobileFrame>
  );
}
