import { describe, expect, it } from 'vitest';

import { getLegalPage, LEGAL_SLUGS } from './legal';

describe('legal pages', () => {
  it('covers privacy, cookies, and terms', () => {
    expect(LEGAL_SLUGS).toEqual(['privacy', 'cookies', 'terms']);
    expect(getLegalPage('privacy')?.title).toBe('Privacy Policy');
    expect(getLegalPage('cookies')?.title).toBe('Cookie Notice');
    expect(getLegalPage('terms')?.title).toBe('Terms of Service');
  });

  it('writes enough body copy to stand as a page', () => {
    for (const slug of LEGAL_SLUGS) {
      const page = getLegalPage(slug);
      expect(page).toBeDefined();
      expect(page?.body.length).toBeGreaterThan(6);
    }
  });
});
