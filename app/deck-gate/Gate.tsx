'use client';

import { useActionState } from 'react';

import { unlock } from './actions';

/** The whole page behind the gate is one field. */
export function Gate({ slug }: { slug: string }) {
  const [error, action, pending] = useActionState(unlock, null);

  return (
    <form action={action} className="flex w-full max-w-[26rem] flex-col gap-5">
      <input type="hidden" name="deck" value={slug} />
      <label htmlFor="password" className="font-display text-[1.375rem]">
        This deck is private.
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        aria-describedby={error ? 'gate-error' : undefined}
        className="border-b border-hairline bg-transparent pb-2 font-display text-[1.375rem] outline-none focus:border-ink"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start font-sans text-[0.6875rem] text-mute uppercase disabled:opacity-40"
      >
        {pending ? 'Opening…' : 'Enter'}
      </button>
      {error ? (
        <p
          id="gate-error"
          role="alert"
          className="font-sans text-[0.6875rem] text-mute"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
