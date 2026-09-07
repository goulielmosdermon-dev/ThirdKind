import { NextResponse } from 'next/server';

import { getContact } from '@/lib/content/queries';
import { formatInquiryEmail, parseInquiry } from '@/lib/inquiry/fields';
import { isStoreConfigured, saveInquiry } from '@/lib/inquiry/store';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = parseInquiry(body);
  if (!parsed.ok) {
    if (parsed.error === 'spam') {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Filed first, and on its own terms: the archive is the record, the mail is
  // the nudge. A failure here is logged and does not fail the submission —
  // losing an inquiry to a database hiccup would be the worse outcome.
  const stored = isStoreConfigured()
    ? await saveInquiry(parsed.data)
    : { ok: false as const, error: 'Supabase is not configured.' };
  if (!stored.ok) {
    console.error('[inquiry] not filed:', stored.error);
  }

  const contact = await getContact();
  const to =
    process.env.INQUIRY_TO?.trim() || contact.formRecipient || contact.email;
  const text = formatInquiryEmail(parsed.data);
  const subject = `New inquiry from ${parsed.data.name} (${parsed.data.company})`;

  const webhook = process.env.INQUIRY_WEBHOOK_URL?.trim();
  if (webhook) {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...parsed.data, to, subject, text }),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Could not send the inquiry. Please email us directly.' },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.INQUIRY_FROM?.trim();
  if (resendKey && from) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: parsed.data.email,
        subject,
        text,
      }),
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Could not send the inquiry. Please email us directly.' },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  }

  // No mail configured. That is fine if the inquiry was filed; if it was not,
  // nothing has kept it, and saying otherwise would lose it silently.
  console.info('[inquiry]', subject, '\n', text);
  if (!stored.ok) {
    return NextResponse.json(
      { error: 'Could not send the inquiry. Please email us directly.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
