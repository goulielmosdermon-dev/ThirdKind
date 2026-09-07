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

  if (!data.name) {
    return { ok: false, error: 'Please add your name.' };
  }
  if (!EMAIL_PATTERN.test(data.email)) {
    return { ok: false, error: 'Please add a company email.' };
  }
  if (!data.phone) {
    return { ok: false, error: 'Please add a phone number.' };
  }
  if (!data.company) {
    return { ok: false, error: 'Please add your company name.' };
  }
  if (!inList(data.budget, BUDGET_OPTIONS)) {
    return { ok: false, error: 'Please select a media budget.' };
  }
  if (!inList(data.about, INQUIRY_ABOUT_OPTIONS)) {
    return { ok: false, error: 'Please select what you are inquiring about.' };
  }
  if (!inList(data.startDate, START_DATE_OPTIONS)) {
    return { ok: false, error: 'Please select an ideal start date.' };
  }
  if (!data.source) {
    return { ok: false, error: 'Please tell us where you heard about us.' };
  }

  return { ok: true, data };
}

export function formatInquiryEmail(data: InquiryPayload): string {
  return [
    `Name: ${data.name}`,
    `Company email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Company: ${data.company}`,
    `Annual estimated media budget: ${data.budget}`,
    `Inquiring about: ${data.about}`,
    `Ideal start date: ${data.startDate}`,
    `Where they heard about us: ${data.source}`,
  ].join('\n');
}
