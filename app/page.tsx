import { CanvasViewport } from '@/components/canvas/CanvasViewport';
import { canvasNodes } from '@/lib/fixtures/content';

export default function Home() {
  return <CanvasViewport nodes={canvasNodes} />;
}
