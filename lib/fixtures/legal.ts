import type { PortableText, PortableTextBlock } from '@/types/content';

let key = 0;

function block(
  text: string,
  style: PortableTextBlock['style'] = 'normal',
): PortableTextBlock {
  key += 1;
  return {
    _type: 'block',
    _key: `legal-${key}`,
    style,
    children: [{ _type: 'span', _key: `legal-s${key}`, text }],
  };
}

function copy(
  ...parts: Array<[string, PortableTextBlock['style']?]>
): PortableText {
  return parts.map(([text, style]) => block(text, style));
}

export const LEGAL_SLUGS = ['privacy', 'cookies', 'terms'] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalPage = {
  slug: LegalSlug;
  title: string;
  body: PortableText;
};

export const legalPages: Record<LegalSlug, LegalPage> = {
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    body: copy(
      ['Who we are', 'h2'],
      [
        'Third Kind is a creative studio. This site is thirdkindcreative.com. If you write to us, you are writing to people, not a platform.',
      ],
      ['What we collect', 'h2'],
      [
        'When you use Book a Call or Find out more, we collect the details you type: name, company email, phone number, company name, the service you are interested in, an estimated media budget, what you are inquiring about, an ideal start date, and where you heard about us.',
      ],
      [
        'We do not ask for payment details on this site. We do not scrape your contacts. We do not buy lists.',
      ],
      ['How we use it', 'h2'],
      [
        'We use that information to answer you, to book a conversation, and to understand whether the work is a fit. We do not sell it. We do not use it for advertising networks.',
      ],
      ['Who else sees it', 'h2'],
      [
        'A small number of tools may process a message in order to deliver it — for example an email provider that sends the inquiry to our inbox. Vimeo hosts the films you watch on this site; their player is their product, and their terms apply to that playback.',
      ],
      ['How long we keep it', 'h2'],
      [
        'Inquiry details stay with us for as long as we need them to finish the conversation, and no longer than is useful. If you ask us to delete them, we will, unless we are required to keep a record.',
      ],
      ['Your rights', 'h2'],
      [
        'If you are in the European Economic Area or the UK, you can ask to see what we hold, to correct it, to delete it, to limit how we use it, or to object. You can also complain to your local data protection authority. In Greece that is the Hellenic Data Protection Authority.',
      ],
      ['How to reach us', 'h2'],
      [
        'Write to goulielmos@thirdkindcreative.com. Put “privacy” in the subject if you want it handled as a rights request.',
      ],
      ['Last updated', 'h2'],
      ['31 August 2026.'],
    ),
  },
  cookies: {
    slug: 'cookies',
    title: 'Cookie Notice',
    body: copy(
      ['What this page is', 'h2'],
      [
        'A cookie is a small file a site stores on your device so it can remember something. This notice is how we use them — and how we do not.',
      ],
      ['What we set', 'h2'],
      [
        'This site does not run advertising cookies, retargeting pixels, or a marketing tag manager. We do not use cookies to follow you around the web.',
      ],
      [
        'The site may keep a short technical preference in the browser so the page works as you left it. Those are strictly necessary to run the interface.',
      ],
      ['Films from Vimeo', 'h2'],
      [
        'Work pages embed films from Vimeo. When a film loads, Vimeo may set its own cookies or similar storage. That is Vimeo’s processing, not a Third Kind campaign. You can read Vimeo’s cookie documentation on their site, and you can block third-party cookies in your browser if you prefer not to load them.',
      ],
      ['How to control cookies', 'h2'],
      [
        'Every major browser lets you block or delete cookies. If you block all cookies, some embedded films may not play. That is a trade you are allowed to make.',
      ],
      ['Changes', 'h2'],
      [
        'If we start using analytics or other non-essential cookies, we will update this notice before we do. Last updated 31 August 2026.',
      ],
    ),
  },
  terms: {
    slug: 'terms',
    title: 'Terms of Service',
    body: copy(
      ['Using this site', 'h2'],
      [
        'By browsing thirdkindcreative.com you agree to these terms. If you do not, close the page. The site is an introduction to the work, not a shop window with a checkout.',
      ],
      ['The work on the site', 'h2'],
      [
        'Films, stills, writing, and the design of this site belong to Third Kind or to the clients who commissioned them. You may watch and read. You may not copy, scrape, resell, or pass the work off as your own.',
      ],
      ['Inquiries are not a contract', 'h2'],
      [
        'Sending the Book a Call form is a request for a conversation. It does not book a crew, reserve a date, or set a fee. A project starts when both sides agree in writing.',
      ],
      ['Accuracy', 'h2'],
      [
        'We take care with what we publish. The site can still contain mistakes, unfinished pages, or work that has since been recut. It is offered as-is. We are not liable for decisions you make solely from what you read here.',
      ],
      ['Conduct', 'h2'],
      [
        'Do not misuse the site: no attempts to break it, flood it, or harvest it. We can refuse an inquiry that is abusive or clearly not a brief.',
      ],
      ['Law', 'h2'],
      [
        'These terms are governed by the laws of Greece. If a court finds one line unenforceable, the rest still stands.',
      ],
      ['Contact', 'h2'],
      [
        'Questions about these terms: goulielmos@thirdkindcreative.com. Last updated 31 August 2026.',
      ],
    ),
  },
};

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}

export function getLegalPage(slug: string): LegalPage | undefined {
  if (!isLegalSlug(slug)) {
    return undefined;
  }
  return legalPages[slug];
}
