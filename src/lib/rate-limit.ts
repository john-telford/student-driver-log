// In-memory sign-in limiter: 5 failed attempts per key per 15 minutes. Only
// failures count; a success clears the key.
//
// The Map lives in the module, so on Vercel each function instance keeps its
// own count and loses it on a cold start. An attacker spread across instances
// gets more than 5 tries per window. That is acceptable for 1.0's traffic and
// threat model; a shared store (e.g. Redis) is the upgrade if it ever is not.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILURES = 5;

interface Entry {
  count: number;
  windowStart: number;
}

const store = new Map<string, Entry>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) return false;
  return entry.count >= MAX_FAILURES;
}

// Whole seconds until the key's window frees (for a Retry-After header);
// 0 when the key is not limited.
export function retryAfterSeconds(key: string): number {
  const entry = store.get(key);
  if (!entry || !isRateLimited(key)) return 0;
  return Math.ceil((entry.windowStart + WINDOW_MS - Date.now()) / 1000);
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
  } else {
    entry.count++;
  }
}

export function clearFailures(key: string): void {
  store.delete(key);
}

// The client IP the limiter keys on: the first x-forwarded-for hop. On Vercel
// the platform sets that header, so a client cannot choose its own value.
export function clientIp(headers: Headers): string {
  return (headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();
}
