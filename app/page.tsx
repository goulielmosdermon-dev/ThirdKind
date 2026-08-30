import { CanvasViewport } from '@/components/canvas/CanvasViewport';
import { canvasNodes, edges } from '@/lib/fixtures/content';

export default function Home() {
  return <CanvasViewport nodes={canvasNodes} edges={edges} />;
}
