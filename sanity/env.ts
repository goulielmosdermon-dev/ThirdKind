export const apiVersion = '2025-08-30';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';

export function isSanityConfigured(): boolean {
  return projectId.length > 0 && projectId !== 'placeholder';
}
