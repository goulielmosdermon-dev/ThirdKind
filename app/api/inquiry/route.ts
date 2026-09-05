import { NextResponse } from 'next/server';

import { getContact } from '@/lib/content/queries';
import { formatInquiryEmail, parseInquiry } from '@/lib/inquiry/fields';

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

  console.info('[inquiry]', subject, '\n', text);
  return NextResponse.json({ ok: true });
}
