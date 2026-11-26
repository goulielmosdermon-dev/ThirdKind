import {
  vivaReferences,
  vivaStories,
  type Company,
  type Story,
} from '../Collab/companies';

const products: Record<string, Pick<Story, 'tag' | 'tagHref'>> = {
  'Sleep Tight': {
    tag: 'Nexi SmartPOS Mini (PAX A50)',
    tagHref: 'https://www.nexi.gr/el/pos/wireless-pos/',
  },
  'The Taxi Driver': {
    tag: 'Nexi SoftPOS',
    tagHref: 'https://www.nexi.gr/el/pos/wireless-pos/',
  },
  'The Tip': {
    tag: 'Nexi SmartPOS (PAX A920 Pro)',
    tagHref: 'https://www.nexi.gr/el/business/bar-restaurants/',
  },
};

export const company: Company = {
  id: 'nexi',
  name: 'Nexi XPay',
  quote: ['ThirdKind proposes three films about what happens after you pay.'],
  observations: [],
  stories: vivaStories.map((story) => ({ ...story, ...products[story.title] })),
  references: vivaReferences,
};
