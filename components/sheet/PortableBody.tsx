import Image from 'next/image';

import type { PortableText } from '@/types/content';

const headingClass: Record<string, string> = {
  h2: 'text-2xl font-semibold tracking-tight',
  h3: 'text-xl font-semibold tracking-tight',
  h4: 'text-lg font-semibold',
  blockquote: 'border-l border-neutral-600 pl-4 text-neutral-300 italic',
  normal: 'text-neutral-200 leading-relaxed',
};

export function PortableBody({ value }: { value: PortableText }) {
  return (
    <div className="space-y-4">
      {value.map((block) => {
        if (block._type === 'image') {
          return (
            <div key={block._key} className="relative aspect-video w-full">
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
          headingClass[style] ?? 'text-neutral-200 leading-relaxed';
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
