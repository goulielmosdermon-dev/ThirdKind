export const BUDGET_OPTIONS = [
  'Under $50,000',
  '$50,000 – $100,000',
  '$100,000 – $250,000',
  '$250,000 – $1 million',
  '$1 million – $5 million',
  'Over $5 million',
] as const;

export const INQUIRY_ABOUT_OPTIONS = [
  'A new film or campaign',
  'An ongoing partnership',
  'A specific service',
  'Something else',
] as const;

export const START_DATE_OPTIONS = [
  'As soon as possible',
  'This quarter',
  'In 3–6 months',
  'Just exploring',
] as const;

export type InquiryPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  about: string;
  startDate: string;
  source: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function inList(value: string, options: readonly string[]): boolean {
  return options.includes(value);
}

export function parseInquiry(
  input: unknown,
): { ok: true; data: InquiryPayload } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') {
    return { ok: false, error: 'Invalid request.' };
  }
  const body = input as Record<string, unknown>;
  if (asString(body.website)) {
    return { ok: false, error: 'spam' };
  }

  const data: InquiryPayload = {
    name: asString(body.name),
    email: asString(body.email),
    phone: asString(body.phone),
    company: asString(body.company),
    budget: asString(body.budget),
    about: asString(body.about),
    startDate: asString(body.startDate),
    source: asString(body.source),
  };

  /*
    Who is asking, where to answer them, and who they are asking for: the
    three the inquiry is worthless without. The rest depends on which way in
    was used — the overlay asks its own set and marks them required in the
    browser; the page asks a shorter one — so they are checked only when they
    are there, rather than demanding fields a given form never offers.
  */
  if (!data.name) {
    return { ok: false, error: 'Please add your name.' };
  }
  if (!EMAIL_PATTERN.test(data.email)) {
    return { ok: false, error: 'Please add a work email.' };
  }
  if (!data.company) {
    return { ok: false, error: 'Please add your company name.' };
  }
  if (data.budget && !inList(data.budget, BUDGET_OPTIONS)) {
    return { ok: false, error: 'Please select a media budget.' };
  }
  if (data.startDate && !inList(data.startDate, START_DATE_OPTIONS)) {
    return { ok: false, error: 'Please select an ideal start date.' };
  }

  return { ok: true, data };
}

export function formatInquiryEmail(data: InquiryPayload): string {
  // Only what was actually asked: the two forms ask different things, and a
  // run of empty labels reads as a fault in the form rather than a short
  // answer.
  return (
    [
      ['Name', data.name],
      ['Work email', data.email],
      ['Phone', data.phone],
      ['Company', data.company],
      ['Annual estimated media budget', data.budget],
      ['Inquiring about', data.about],
      ['Ideal start date', data.startDate],
      ['Where they heard about us', data.source],
    ] as const
  )
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}
