/**
 * Calendly's own popup, opened once the inquiry is filed. The scheduler is
 * theirs and the questions are ours: everything the form asked is already
 * saved by the time this runs, so a caller who never picks a time is still a
 * caller we know about.
 */
const SCRIPT = 'https://assets.calendly.com/assets/external/widget.js';
const STYLES = 'https://assets.calendly.com/assets/external/widget.css';

type Prefill = { name?: string; email?: string };

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string; prefill?: Prefill }) => void;
    };
  }
}

/** The scheduling link, or null while none is configured. */
export function calendlyUrl(): string | null {
  return process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || null;
}

function loadOnce(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Calendly) {
      resolve();
      return;
    }
    if (!document.querySelector(`link[href="${STYLES}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = STYLES;
      document.head.append(link);
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('calendly')));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT;
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error('calendly')));
    document.head.append(script);
  });
}

/**
 * Opens the scheduler. Resolves false when there is nothing to open or the
 * script will not load — the caller then leaves its own confirmation up, so a
 * blocked third party never looks like a lost submission.
 */
export async function openCalendly(prefill: Prefill): Promise<boolean> {
  const url = calendlyUrl();
  if (!url) {
    return false;
  }
  try {
    await loadOnce();
    if (!window.Calendly) {
      return false;
    }
    window.Calendly.initPopupWidget({ url, prefill });
    return true;
  } catch {
    return false;
  }
}
