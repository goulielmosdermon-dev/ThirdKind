import { describe, expect, it } from 'vitest';

import { formatInquiryEmail, parseInquiry } from './fields';

const valid = {
  name: 'Ada',
  email: 'ada@brand.com',
  phone: '+30 210 000 0000',
  company: 'Brand',
  budget: '$1 million – $5 million',
  about: 'A new film or campaign',
  startDate: 'This quarter',
  source: 'A producer',
};

describe('parseInquiry', () => {
  it('accepts a complete questionnaire', () => {
    const result = parseInquiry(valid);
    expect(result.ok).toBe(true);
  });

  it('rejects a budget that is no longer offered', () => {
    const result = parseInquiry({ ...valid, budget: '$5M – $10M' });
    expect(result).toEqual({
      ok: false,
      error: 'Please select a media budget.',
    });
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
