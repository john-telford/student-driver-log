// In-memory rate limiter — persists within a serverless instance lifetime.
// Acceptable for a low-traffic personal app; not suitable for high-volume services.

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
