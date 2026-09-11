import type { InquiryPayload } from '@/lib/inquiry/fields';

/**
 * Submissions are kept in Supabase, written with the service key so the table
 * can stay closed to everyone else: row-level security is on and no policy
 * grants the anon key anything, which leaves the dashboard and this route as
 * the only ways in.
 */
export function isStoreConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

/**
 * Files one inquiry. Resolves to an error string rather than throwing: an
 * inquiry that reached us is not lost because the archive was unreachable, so
 * the caller reports the failure and carries on with the email.
 */
export async function saveInquiry(
  data: InquiryPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  /*
    The columns the page's own form fills. They are written when the table has
    them and dropped when it does not, so an inquiry is never lost to a table
    that has not been migrated yet — see supabase/add-inquiry-columns.sql.
  */
  const added = {
    first_name: data.firstName,
    last_name: data.lastName,
    job_title: data.jobTitle,
    message: data.message,
  };

  const legacy = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    budget: data.budget,
    about: data.about,
    start_date: data.startDate,
    source: data.source,
  };

  const send = async (row: Record<string, string>) =>
    fetch(`${url}/rest/v1/inquiries`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        // Nothing is read back, so ask for the smallest possible reply.
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });

  try {
    let response = await send({ ...legacy, ...added });

    if (!response.ok) {
      const reason = await response.text();
      // PGRST204: the table has no such column. Everything the added fields
      // carry is also in `name` and `about`, so the row still stands up.
      if (!reason.includes('PGRST204')) {
        return { ok: false, error: `${response.status} ${reason}` };
      }
      console.warn('[inquiry] filed without the added columns:', reason);
      response = await send(legacy);
      if (!response.ok) {
        return {
          ok: false,
          error: `${response.status} ${await response.text()}`,
        };
      }
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/** One filed inquiry, as the table keeps it. */
export type StoredInquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  budget: string | null;
  about: string | null;
  start_date: string | null;
  source: string | null;
  status: string;
  /* Null on a row filed before the columns existed, or by the overlay. */
  first_name?: string | null;
  last_name?: string | null;
  job_title?: string | null;
  message?: string | null;
};

/** Everything filed, newest first. Server-side only — this reads with the key. */
export async function listInquiries(): Promise<StoredInquiry[]> {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return [];
  }
  const response = await fetch(
    `${url}/rest/v1/inquiries?select=*&order=created_at.desc`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    console.error('[inquiry] could not be read:', await response.text());
    return [];
  }
  return (await response.json()) as StoredInquiry[];
}
