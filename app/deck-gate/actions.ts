'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { accessToken, brands, cookieName } from '../2000/brands';

/**
 * Checks a deck password server-side and, on success, stores the derived
 * token in an httpOnly cookie. The password itself never reaches the client.
 */
export async function unlock(_state: string | null, formData: FormData) {
  const slug = String(formData.get('deck') ?? '');
  const brand = brands[slug];
  if (!brand) return 'Unknown deck.';

  const password = String(formData.get('password') ?? '');
  if (password !== brand.password) return 'That password does not match.';

  const store = await cookies();
  store.set(cookieName(brand.slug), await accessToken(brand), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/${brand.slug}`);
}
