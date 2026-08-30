import { createClient } from 'next-sanity';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

import { siteContent } from '../lib/fixtures/content';
import { apiVersion, dataset, projectId } from '../sanity/env';

async function main() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || projectId === 'placeholder') {
    throw new Error('Set NEXT_PUBLIC_SANITY_PROJECT_ID before seeding.');
  }
  if (!token) {
    throw new Error('Set SANITY_API_WRITE_TOKEN before seeding.');
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  const placeholder = resolve(process.cwd(), 'public/placeholders/tile-0.svg');
  const uploaded = await client.assets.upload(
    'image',
    createReadStream(placeholder),
    { filename: 'tile-0.svg' },
  );
  const image = {
    _type: 'image' as const,
    asset: { _type: 'reference' as const, _ref: uploaded._id },
    alt: 'Placeholder still',
  };

  const transaction = client.transaction();

  transaction.createOrReplace({
    ...siteContent.settings,
    ambientTiles: siteContent.settings.ambientTiles.map((tile) => ({
      ...tile,
      image,
    })),
    defaultSeo: {
      ...siteContent.settings.defaultSeo,
      ogImage: image,
    },
  });

  transaction.createOrReplace({
    ...siteContent.contact,
    thumbnail: image,
  });

  for (const project of siteContent.projects) {
    transaction.createOrReplace({
      ...project,
      thumbnail: { ...image, alt: project.thumbnail.alt },
      posterImage: { ...image, alt: project.posterImage.alt },
      gallery: project.gallery.map((item) =>
        item._type === 'image' ? { ...image, alt: item.image.alt } : item,
      ),
    });
  }

  for (const article of siteContent.articles) {
    transaction.createOrReplace({
      ...article,
      coverImage: { ...image, alt: article.coverImage.alt },
      seo: {
        ...article.seo,
        ogImage: article.seo.ogImage
          ? { ...image, alt: article.seo.ogImage.alt }
          : undefined,
      },
    });
  }

  for (const section of siteContent.aboutSections) {
    const extra =
      section.key === 'team'
        ? {
            teamMembers: section.teamMembers.map((member) => ({
              ...member,
              portrait: { ...image, alt: member.portrait.alt },
            })),
          }
        : {};
    transaction.createOrReplace({
      ...section,
      thumbnail: { ...image, alt: section.thumbnail.alt },
      ...extra,
    });
  }

  await transaction.commit();
  console.log('Seeded Sanity dataset', dataset);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(message);
  process.exit(1);
});
