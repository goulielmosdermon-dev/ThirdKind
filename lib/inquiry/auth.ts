import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE = 'tk_forms';
/** How long a sign-in lasts before the password is asked for again. */
const SESSION_MS = 1000 * 60 * 60 * 24 * 14;

function secret(): string | null {
  return process.env.FORMS_PASSWORD?.trim() || null;
}

export function isFormsConfigured(): boolean {
  return secret() !== null;
}

function sign(expires: number, key: string): string {
  return createHmac('sha256', key).update(String(expires)).digest('hex');
}

function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  // timingSafeEqual throws on a length mismatch, which is itself a leak of
  // sorts; comparing digests of a fixed width sidesteps both.
  return left.length === right.length && timingSafeEqual(left, right);
}

/** The value to store, or null if the password was wrong. */
export function tokenFor(password: string): string | null {
  const key = secret();
  if (!key || !same(password, key)) {
    return null;
  }
  const expires = Date.now() + SESSION_MS;
  return `${expires}.${sign(expires, key)}`;
}

export function isValidToken(token: string | undefined): boolean {
  const key = secret();
  if (!key || !token) {
    return false;
  }
  const [rawExpires, signature] = token.split('.');
  const expires = Number(rawExpires);
  if (!rawExpires || !signature || !Number.isFinite(expires)) {
    return false;
  }
  if (expires < Date.now()) {
    return false;
  }
  return same(signature, sign(expires, key));
}

export const FORMS_COOKIE = COOKIE;
export const FORMS_SESSION_MS = SESSION_MS;
