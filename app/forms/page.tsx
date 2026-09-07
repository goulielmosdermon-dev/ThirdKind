import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { FormsTable } from '@/components/forms/FormsTable';
import {
  FORMS_COOKIE,
  FORMS_SESSION_MS,
  isFormsConfigured,
  isValidToken,
  tokenFor,
} from '@/lib/inquiry/auth';
import { listInquiries } from '@/lib/inquiry/store';

// Names and phone numbers: never prerendered, never cached, never indexed.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Inquiries · Third Kind',
  robots: { index: false, follow: false },
};

async function signIn(formData: FormData) {
  'use server';

  const password = String(formData.get('password') ?? '');
  const token = tokenFor(password);
  if (!token) {
    // Reported through the URL rather than state: the form is a plain POST, so
    // there is nothing client-side holding an error between renders.
    redirect('/forms?wrong=1');
  }
  const store = await cookies();
  store.set(FORMS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/forms',
    maxAge: Math.floor(FORMS_SESSION_MS / 1000),
  });
}

async function signOut() {
  'use server';

  const store = await cookies();
  store.delete({ name: FORMS_COOKIE, path: '/forms' });
}

export default async function FormsPage({
  searchParams,
}: {
  searchParams: Promise<{ wrong?: string }>;
}) {
  const { wrong } = await searchParams;
  const store = await cookies();
  const signedIn = isValidToken(store.get(FORMS_COOKIE)?.value);

  if (!isFormsConfigured()) {
    return (
      <main className="mx-auto max-w-[32rem] px-6 py-24 text-ink">
        <h1 className="font-display text-2xl">Inquiries</h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-mute">
          This page needs a password before it will show anything. Set
          FORMS_PASSWORD in the environment and reload.
        </p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-[24rem] px-6 py-24 text-ink">
        <h1 className="font-display text-2xl">Inquiries</h1>
        <form action={signIn} className="mt-6 flex flex-col gap-3">
          <label className="text-[0.85rem] text-mute" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            className="rounded-md border border-hairline bg-white px-3 py-2 text-[0.95rem] outline-none focus:border-ink"
          />
          {wrong ? (
            <p className="text-[0.85rem] text-red-700">
              That password is not right.
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-1 cursor-pointer rounded-md bg-ink px-4 py-2 text-[0.9rem] text-white"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const rows = await listInquiries();

  return (
    <main className="min-h-dvh bg-paper px-6 py-10 text-ink">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl">Inquiries</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="cursor-pointer text-[0.85rem] text-mute underline underline-offset-4"
          >
            Sign out
          </button>
        </form>
      </div>
      <FormsTable rows={rows} />
    </main>
  );
}
