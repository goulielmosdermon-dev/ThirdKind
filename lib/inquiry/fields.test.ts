import { describe, expect, it } from 'vitest';

import { formatInquiryEmail, parseInquiry } from './fields';

const valid = {
  name: 'Ada',
  email: 'ada@brand.com',
  phone: '+30 210 000 0000',
  company: 'Brand',
  service: 'Brand Strategy',
  budget: '$1M – $5M',
  about: 'A new film or campaign',
  startDate: 'This quarter',
  source: 'A producer',
};

describe('parseInquiry', () => {
  it('accepts a complete questionnaire', () => {
    const result = parseInquiry(valid);
    expect(result.ok).toBe(true);
  });

  it('rejects a missing email', () => {
    const result = parseInquiry({ ...valid, email: 'not-an-email' });
    expect(result).toEqual({
      ok: false,
      error: 'Please add a company email.',
    });
  });

  it('silently drops honeypot spam', () => {
    const result = parseInquiry({ ...valid, website: 'https://spam.test' });
    expect(result).toEqual({ ok: false, error: 'spam' });
  });

  it('formats a readable email body', () => {
    expect(formatInquiryEmail(valid)).toContain('Company email: ada@brand.com');
  });
});
