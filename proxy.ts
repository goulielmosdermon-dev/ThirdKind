import { NextResponse } from 'next/server';

import { accessToken, brands, cookieName } from './app/2000/brands';

import type { NextRequest } from 'next/server';

/**
 * Gates each brand edition of the 2000 deck.
 *
 * The deck goes out as a private link, so an edition is unreadable until its
 * password has been entered. Unauthorised requests are rewritten — not
 * redirected — to the gate, so the URL the brand was given stays in the bar.
 */
export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split('/')[1] ?? '';
  const brand = brands[slug];
  if (!brand) return NextResponse.next();

  const cookie = request.cookies.get(cookieName(brand.slug))?.value;
  if (cookie && cookie === (await accessToken(brand)))
    return NextResponse.next();

  const gate = request.nextUrl.clone();
  gate.pathname = '/deck-gate';
  gate.search = `?deck=${brand.slug}`;

  return NextResponse.rewrite(gate);
}

export const config = {
  matcher: ['/ZARA2000/:path*', '/ZARA2000', '/ePay/:path*', '/ePay'],
};
