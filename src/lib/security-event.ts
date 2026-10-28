import { createHmac } from 'crypto';
import { headers } from 'next/headers';
import { clientIp } from '@/lib/rate-limit';

// Structured security events for the daily security review (Ripley).
//
// Each event is one line on stderr: `SEC {"event":"signin.failed",...}`.
// console.warn lands in Vercel runtime logs at level "warning", so the reviewer
// finds every event with one search for "SEC". There is no log store of our own
// and no new dependency: Vercel's log retention is the retention.
//
// What is never logged: passwords, tokens, reset links, or a raw email
// address. Accounts belong to teenagers and their parents, so an email is
// recorded only as `account`, a short keyed hash. The same email always gives
// the same hash, which is enough to spot "one account, many IPs" or "many
// accounts, one IP" without the logs holding the address itself.

export type SecurityEventName =
  | 'signin.failed'
  | 'signin.ratelimited'
  | 'register'
  | 'password_reset.requested'
  | 'password_reset.invalid_token'
  | 'password_reset.completed'
  | 'api.unauthorized'
  | 'api.forbidden'
  | 'api.not_found'
  | 'trip.not_found';

export type SecurityEventFields = {
  surface?: 'web' | 'token' | 'api';
  ip?: string;
  email?: unknown; // hashed into `account`, never logged as-is
  userId?: number | string;
  path?: string;
  outcome?: string;
  reason?: string;
};

// Keyed with AUTH_SECRET (always set in production for Auth.js) so the hash
// can't be reversed by hashing a list of guessed emails. The 'sec-log:' prefix
// keeps this use of the secret separate from Auth.js's own.
export function accountHash(email: unknown): string | undefined {
  if (typeof email !== 'string') return undefined;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHmac('sha256', process.env.AUTH_SECRET ?? 'dev-only-unkeyed')
    .update(`sec-log:${normalized}`)
    .digest('hex')
    .slice(0, 12);
}

export function securityEvent(
  event: SecurityEventName,
  fields: SecurityEventFields = {}
): void {
  const { email, ...rest } = fields;
  const record: Record<string, unknown> = { event };
  const account = accountHash(email);
  if (account) record.account = account;
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== '') record[key] = value;
  }
  // Logging must never break the request it describes.
  try {
    console.warn(`SEC ${JSON.stringify(record)}`);
  } catch {
    // ignore
  }
}

// The client IP inside a Server Action, where there is no Request object.
// headers() throws outside a request scope (e.g. in unit tests); the event is
// still worth logging without the IP.
export async function actionIp(): Promise<string | undefined> {
  try {
    return clientIp(await headers());
  } catch {
    return undefined;
  }
}
