import { describe, expect, it } from 'vitest';

import { mapImage, mapPortable } from '@/sanity/lib/map';

describe('sanity mappers', () => {
  it('falls back when an image has no asset', () => {
    const mapped = mapImage({ alt: 'Still' }, 'Fallback');
    expect(mapped.src).toBe('/placeholders/tile-0.svg');
    expect(mapped.alt).toBe('Still');
  });

  it('maps portable blocks and skips unknown types', () => {
    const mapped = mapPortable([
      {
        _type: 'block',
        _key: 'a',
        style: 'normal',
        children: [{ _type: 'span', _key: 's', text: 'Hello' }],
      },
      { _type: 'unknown' },
    ]);
    expect(mapped).toHaveLength(1);
    if (mapped[0]?._type !== 'block') {
      throw new Error('expected a text block');
    }
    expect(mapped[0].children[0]?.text).toBe('Hello');
  });
});
