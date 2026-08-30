import type { SiteContent } from '@/types/content';

import { siteContent as fallbackContent } from '@/lib/fixtures/content';
import { client } from '@/sanity/lib/client';
import { mapSiteContent } from '@/sanity/lib/map';
import { siteContentQuery } from '@/sanity/lib/queries';
import { isSanityConfigured } from '@/sanity/env';

export async function fetchSiteContent(): Promise<SiteContent> {
  if (!isSanityConfigured()) {
    return fallbackContent;
  }

  const raw = await client.fetch(
    siteContentQuery,
    {},
    { next: { tags: ['content'] } },
  );
  const mapped = mapSiteContent(raw);
  if (!mapped) {
    throw new Error(
      'Sanity returned incomplete site content. Publish siteSettings and contactInfo, then run pnpm seed:sanity.',
    );
  }
  return mapped;
}
