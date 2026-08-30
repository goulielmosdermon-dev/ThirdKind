import { createImageUrlBuilder } from '@sanity/image-url';

import { dataset, projectId } from '@/sanity/env';

const builder = createImageUrlBuilder({
  projectId: projectId || 'placeholder',
  dataset,
});

export function urlFor(source: {
  asset?: { _id?: string; url?: string };
  hotspot?: { x: number; y: number };
  crop?: unknown;
}) {
  return builder.image(source);
}
