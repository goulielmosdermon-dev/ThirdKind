import Image from 'next/image';

import { isUnoptimizedSrc } from '@/lib/content/mediaSrc';
import type { PortableText } from '@/types/content';

const headingClass: Record<string, string> = {
  // A heading inside the prose is the sans, set bold: the display face is for
  // the page's own masthead, and the two would read as the same rank here.
  h2: 'font-sans font-semibold text-[1.65rem] leading-snug text-ink',
  h3: 'font-display text-lede text-ink',
  h4: 'font-display text-body text-ink',
  blockquote: 'border-l border-signal pl-4 text-lede text-mute italic',
  normal: 'text-body leading-relaxed text-ink',
};

export function PortableBody({
  value,
  density = 'compact',
}: {
  value: PortableText;
  density?: 'compact' | 'editorial';
}) {
  const copyClass =
    density === 'editorial'
      ? 'text-[1.05rem] leading-[1.8] text-ink'
      : 'text-body leading-relaxed text-ink';

  return (
    <div className={density === 'editorial' ? 'space-y-10' : 'space-y-4'}>
      {value.map((block) => {
        if (block._type === 'image') {
          return (
            <div key={block._key}>
              <Image
                src={block.image.src}
                alt={block.image.alt}
                width={block.image.width}
                height={block.image.height}
                sizes="768px"
                unoptimized={isUnoptimizedSrc(block.image.src)}
                className="h-auto w-full rounded-md"
              />
            </div>
          );
        }

        const text = block.children.map((child) => child.text).join('');
        const style = block.style ?? 'normal';
        const className =
          style === 'normal' || !headingClass[style]
            ? copyClass
            : headingClass[style];
        if (block.style === 'h2') {
          return (
            <h2
              key={block._key}
              className={`${className} ${density === 'editorial' ? 'pt-6' : ''}`}
            >
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
