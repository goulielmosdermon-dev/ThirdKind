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
      error: 'Please add a work email.',
    });
  });

  it('files one name from a form that asks for the two halves', () => {
    const result = parseInquiry({
      firstName: 'Ada',
      lastName: 'Lovelace',
      company: 'Brand',
      jobTitle: 'Head of Brand',
      email: 'ada@brand.com',
      message: 'Six films, please.',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe('Ada Lovelace');
      expect(result.data.jobTitle).toBe('Head of Brand');
      expect(result.data.message).toBe('Six films, please.');
    }
  });

  it('silently drops honeypot spam', () => {
    const result = parseInquiry({ ...valid, website: 'https://spam.test' });
    expect(result).toEqual({ ok: false, error: 'spam' });
  });

  it('formats a readable email body', () => {
    const parsed = parseInquiry(valid);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      const body = formatInquiryEmail(parsed.data);
      expect(body).toContain('Work email: ada@brand.com');
      // Only what was asked: a run of empty labels reads as a broken form.
      expect(body).not.toContain('Message:');
    }
  });
});
