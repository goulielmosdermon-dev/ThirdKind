import type { Article } from '@/types/content';

/**
 * Splits a title into a lead, set in the sans, and the rest of the sentence,
 * set in the display serif — the line says what the piece is, then finishes
 * in the page's voice.
 *
 * A colon is the natural break. Without one, the line turns at the first
 * small joining word past the opening two, so the lead is the subject.
 */
const TURN_WORDS = new Set([
  'with',
  'and',
  'of',
  'to',
  'is',
  'in',
  'for',
  'when',
  'doesn’t',
  "doesn't",
  'start',
  'starts',
  'wins',
  'means',
  'has',
  'have',
]);

export function splitTitle(title: string): [string, string] {
  const colon = title.indexOf(':');
  if (colon > 0 && colon < title.length - 1) {
    return [title.slice(0, colon + 1), title.slice(colon + 1).trim()];
  }
  const words = title.split(' ');
  for (let i = 2; i < words.length - 1; i++) {
    if (TURN_WORDS.has((words[i] ?? '').toLowerCase())) {
      return [words.slice(0, i).join(' '), words.slice(i).join(' ')];
    }
  }
  return [title, ''];
}

/** Minutes to read the body, at an unhurried 230 words a minute. */
export function readMinutes(article: Article): number {
  let words = 0;
  for (const block of article.body ?? []) {
    if (block._type !== 'block') continue;
    for (const span of block.children) {
      words += span.text.split(/\s+/).filter(Boolean).length;
    }
  }
  return Math.max(1, Math.round(words / 230));
}
