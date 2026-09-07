import { AppShell } from '@/components/AppShell';
import { deriveCanvasNodes, deriveEdges } from '@/lib/canvas/derive';
import { getSiteContent } from '@/lib/content/queries';

export default async function SiteLayout({
  children,
  sheet,
}: {
  children: React.ReactNode;
  sheet: React.ReactNode;
}) {
  const content = await getSiteContent();
  const nodes = deriveCanvasNodes(content);
  const edges = deriveEdges(nodes);
  const manifesto =
    content.aboutSections.find((section) => section.key === 'why')?.body ?? [];

  return (
    <AppShell
      sheet={sheet}
      nodes={nodes}
      edges={edges}
      manifesto={manifesto}
      wordmarkLeft={content.settings.wordmarkLeft}
      wordmarkRight={content.settings.wordmarkRight}
    >
      {children}
    </AppShell>
  );
}
