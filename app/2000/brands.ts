/**
 * The gated decks.
 *
 * A deck goes out to one recipient at a time, so an edition is this registry
 * entry plus a route that renders `<Deck brand={…} />` — the page's rules and
 * behaviour are shared, never copied. Some editions carry the 2000 slides;
 * others, like the epay proposal, bring their own.
 *
 * `password` gates the edition. It is a soft gate for a private link shared
 * with a client, not a secret: the point is that the deck is not readable by
 * anyone who guesses the URL. Set DECK_PASSWORD_<SLUG> to override without a
 * code change.
 */

export type Brand = {
  slug: string;
  name: string;
  /** The recipient's mark, ahead of the first slide. Optional until it lands. */
  logo?: { src: string; w: number; h: number };
  password: string;
};

export const brands: Record<string, Brand> = {
  ZARA2000: {
    slug: 'ZARA2000',
    name: 'Zara',
    logo: { src: '/2000/logos/zara.webp', w: 1024, h: 538 },
    password: process.env.DECK_PASSWORD_ZARA2000 ?? 'ZARA2000',
  },
  ePay: {
    slug: 'ePay',
    name: 'epay',
    password: process.env.DECK_PASSWORD_EPAY ?? 'EPAY2026',
  },
};

export const cookieName = (slug: string) => `deck_${slug}`;

/**
 * The value the gate cookie must hold. Derived from the password so the
 * password itself never rides along in a cookie, and so rotating it
 * invalidates every link already handed out.
 */
export async function accessToken(brand: Brand) {
  const data = new TextEncoder().encode(`${brand.slug}:${brand.password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
