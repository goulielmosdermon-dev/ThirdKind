import { describe, expect, it } from 'vitest';

import { vimeoIdFromUrl, vimeoPlayerSrc, vimeoWatchUrl } from './vimeo';

describe('vimeo player urls', () => {
  it('appends the privacy hash from the saved live-site embeds', () => {
    expect(vimeoPlayerSrc('1174819047', { autoplay: '1' })).toBe(
      'https://player.vimeo.com/video/1174819047?h=730e2ca400&autoplay=1',
    );
    expect(vimeoWatchUrl('935002942')).toBe(
      'https://vimeo.com/935002942/f2348512fe',
    );
  });

  it('reads an id from a hashed vimeo.com url', () => {
    expect(vimeoIdFromUrl('https://vimeo.com/1174819047/730e2ca400')).toBe(
      '1174819047',
    );
  });
});
