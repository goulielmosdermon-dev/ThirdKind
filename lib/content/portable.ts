import type { PortableText } from '@/types/content';

export function portablePlainText(value: PortableText): string {
  return value
    .map((block) => {
      if (block._type === 'block') {
        return block.children.map((child) => child.text).join('');
      }
      return '';
    })
    .join(' ');
}

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
