'use client';

import { useMemo, useState } from 'react';

import type { StoredInquiry } from '@/lib/inquiry/store';

/** Column order, and the header each one carries. */
const COLUMNS = [
  ['created_at', 'Received'],
  ['name', 'Name'],
  ['job_title', 'Job title'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['company', 'Company'],
  ['message', 'Message'],
  ['budget', 'Budget'],
  ['about', 'About'],
  ['start_date', 'Start'],
  ['source', 'Heard about us'],
  ['status', 'Status'],
] as const;

function received(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? value
    : date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function cell(row: StoredInquiry, key: (typeof COLUMNS)[number][0]): string {
  const value = row[key];
  if (key === 'created_at') {
    return received(String(value));
  }
  return value ? String(value) : '—';
}

/** The distinct values a column actually holds, for its filter. */
function optionsFor(rows: StoredInquiry[], key: keyof StoredInquiry): string[] {
  const seen = new Set<string>();
  for (const row of rows) {
    const value = row[key];
    if (value) {
      seen.add(String(value));
    }
  }
  return [...seen].sort();
}

export function FormsTable({ rows }: { rows: StoredInquiry[] }) {
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('');
  const [oldestFirst, setOldestFirst] = useState(false);

  const budgets = useMemo(() => optionsFor(rows, 'budget'), [rows]);
  const statuses = useMemo(() => optionsFor(rows, 'status'), [rows]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (budget && row.budget !== budget) {
        return false;
      }
      if (status && row.status !== status) {
        return false;
      }
      if (!needle) {
        return true;
      }
      // Search reads the row as it is written, so a match on anything on
      // screen — a company, a phone number, a stray word — finds it.
      return COLUMNS.some(([key]) =>
        cell(row, key).toLowerCase().includes(needle),
      );
    });
    return oldestFirst ? [...filtered].reverse() : filtered;
  }, [budget, oldestFirst, query, rows, status]);

  const select =
    'rounded-md border border-hairline bg-white px-2 py-1.5 text-[0.85rem] outline-none focus:border-ink';

  return (
    <div className="border border-hairline">
      {/* Filters and search, in the band above the fields. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline bg-white/60 px-3 py-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          className={`${select} min-w-[14rem] flex-1`}
        />
        <select
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
          className={select}
          aria-label="Filter by budget"
        >
          <option value="">All budgets</option>
          {budgets.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={select}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setOldestFirst((current) => !current)}
          className={`${select} cursor-pointer`}
        >
          {oldestFirst ? 'Oldest first' : 'Newest first'}
        </button>
        <span className="ml-auto text-[0.8rem] text-mute">
          {shown.length} of {rows.length}
        </span>
      </div>

      {/*
        Columns take the width of what is in them — w-auto with nothing
        wrapping — and the table scrolls sideways rather than squeezing a long
        email into an ellipsis.
      */}
      <div className="overflow-x-auto">
        {/*
          w-full with a slack column at the end: the real columns still take
          the width of what is in them, and the empty one soaks up whatever is
          left so the rules and the row banding run to the edge of the box
          rather than stopping mid-way.
        */}
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-white/60 text-left">
              <th className="border-b border-hairline px-3 py-2 font-normal text-mute">
                #
              </th>
              {COLUMNS.map(([key, label]) => (
                <th
                  key={key}
                  className="border-b border-l border-hairline px-3 py-2 font-normal whitespace-nowrap text-mute"
                >
                  {label}
                </th>
              ))}
              <th className="w-full border-b border-hairline" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {shown.map((row, index) => (
              <tr key={row.id} className="odd:bg-white/30">
                <td className="border-b border-hairline px-3 py-2 text-right tabular-nums text-mute">
                  {index + 1}
                </td>
                {COLUMNS.map(([key]) => (
                  <td
                    key={key}
                    // A note runs to a paragraph, so it is held to a column
                    // width and cut, with the whole of it on the title —
                    // everything else takes the width of what is in it.
                    className={`border-b border-l border-hairline px-3 py-2 ${
                      key === 'message'
                        ? 'max-w-[26rem] truncate'
                        : 'whitespace-nowrap'
                    }`}
                    title={key === 'message' ? (row.message ?? '') : undefined}
                  >
                    {key === 'email' ? (
                      <a
                        className="underline underline-offset-2"
                        href={`mailto:${row.email}`}
                      >
                        {row.email}
                      </a>
                    ) : (
                      cell(row, key)
                    )}
                  </td>
                ))}
                <td className="border-b border-hairline" aria-hidden />
              </tr>
            ))}
            {shown.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length + 2}
                  className="px-3 py-10 text-center text-mute"
                >
                  {rows.length === 0
                    ? 'Nothing has come in yet.'
                    : 'Nothing matches those filters.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
