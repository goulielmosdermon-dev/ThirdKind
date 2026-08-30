import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

type WebhookBody = {
  _type?: string;
};

export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return new Response('Missing SANITY_REVALIDATE_SECRET', { status: 500 });
  }

  try {
    const { isValidSignature, body } = await parseBody<WebhookBody>(
      request,
      secret,
      true,
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 },
      );
    }

    if (!body?._type) {
      return NextResponse.json({ message: 'Bad Request' }, { status: 400 });
    }

    revalidateTag('content', 'max');
    return NextResponse.json({ revalidated: true, type: body._type });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(message, { status: 500 });
  }
}
