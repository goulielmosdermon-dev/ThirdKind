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

  return (
    <AppShell
      sheet={sheet}
      nodes={nodes}
      edges={edges}
      wordmarkLeft={content.settings.wordmarkLeft}
      wordmarkRight={content.settings.wordmarkRight}
    >
      {children}
    </AppShell>
  );
}
