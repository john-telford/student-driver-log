// In-memory sign-in limiter: 5 attempts per key per 15 minutes.
//
// Every attempt is counted before the password is checked, so a burst of
// concurrent requests can't all get past the limit while bcrypt runs. A
// successful sign-in refunds only its own attempt; earlier failures stay
// counted until the window ends, so signing in to one account can't reset the
// count for guesses against another.
//
// The Map lives in the module, so on Vercel each function instance keeps its
// own count and loses it on a cold start. An attacker spread across instances
// gets more than 5 tries per window. That is acceptable for 1.0's traffic and
// threat model; a shared store (e.g. Redis) is the upgrade if it ever is not.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface Entry {
  count: number;
  windowStart: number;
}

export type AttemptResult =
  | { limited: false }
  | { limited: true; retryAfter: number }; // whole seconds, for Retry-After

const store = new Map<string, Entry>();

// Counts one attempt against the key, or reports that the key is limited (in
// which case nothing is counted and the caller must not check the password).
// Synchronous on purpose: nothing can interleave between the check and the
// count.
export function consumeAttempt(key: string): AttemptResult {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    store.set(key, entry);
  }
  if (entry.count >= MAX_ATTEMPTS) {
    // Always >= 1: the window is still open, so its end is in the future.
    return { limited: true, retryAfter: Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000) };
  }
  entry.count++;
  return { limited: false };
}

// Gives back the attempt a successful sign-in consumed. If the window rolled
// over while the password was being checked, this refunds one attempt in the
// new window instead; at most one extra attempt per 15 minutes, so not worth
// tracking.
export function refundAttempt(key: string): void {
  const entry = store.get(key);
  if (entry && entry.count > 0) entry.count--;
}

// The client IP the limiter keys on: the first x-forwarded-for hop. On Vercel
// the platform sets that header, so a client cannot choose its own value.
export function clientIp(headers: Headers): string {
  return (headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();
}

// The key for one sign-in surface ('web' or 'token'), client IP and email.
// Keyed by IP + email, not IP alone: a school's Wi-Fi or a phone carrier puts
// many students behind one IP, and an IP-only count would let five typos by
// anyone there lock everyone out. Returns null when there is no email; such a
// request can't be a guess at an account's password, so it isn't counted.
export function signInKey(
  surface: 'web' | 'token',
  headers: Headers,
  email: unknown
): string | null {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalized) return null;
  return `${surface}:${clientIp(headers)}:${normalized}`;
}
