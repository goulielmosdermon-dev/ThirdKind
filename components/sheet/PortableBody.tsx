import Image from 'next/image';

import type { PortableText } from '@/types/content';

const headingClass: Record<string, string> = {
  h2: 'font-display text-title text-ink',
  h3: 'font-display text-lede text-ink',
  h4: 'font-display text-body text-ink',
  blockquote: 'border-l border-signal pl-4 text-lede text-mute italic',
  normal: 'text-body leading-relaxed text-ink',
};

export function PortableBody({ value }: { value: PortableText }) {
  return (
    <div className="space-y-4">
      {value.map((block) => {
        if (block._type === 'image') {
          return (
            <div
              key={block._key}
              className="relative aspect-video w-full overflow-hidden bg-void"
            >
              <span className="tk-loading absolute inset-0" aria-hidden />
              <Image
                src={block.image.src}
                alt={block.image.alt}
                fill
                sizes="768px"
                unoptimized={block.image.src.endsWith('.svg')}
                className="object-cover"
              />
            </div>
          );
        }

        const text = block.children.map((child) => child.text).join('');
        const style = block.style ?? 'normal';
        const className =
          headingClass[style] ?? 'text-body leading-relaxed text-ink';
        if (block.style === 'h2') {
          return (
            <h2 key={block._key} className={className}>
              {text}
            </h2>
          );
        }
        if (block.style === 'blockquote') {
          return (
            <blockquote key={block._key} className={className}>
              {text}
            </blockquote>
          );
        }
        return (
          <p key={block._key} className={className}>
            {text}
          </p>
        );
      })}
    </div>
  );
}
