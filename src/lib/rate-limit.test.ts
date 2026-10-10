import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  clearFailures,
  clientIp,
  isRateLimited,
  recordFailure,
  retryAfterSeconds,
} from './rate-limit';

const MINUTE = 60 * 1000;

// The store is module-level, so each test uses its own key.
let n = 0;
let key: string;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-10T12:00:00Z'));
  key = `test:${++n}`;
});

afterEach(() => {
  vi.useRealTimers();
});

function fail(times: number) {
  for (let i = 0; i < times; i++) recordFailure(key);
}

describe('rate limiter', () => {
  it('allows 4 failures and limits on the 5th', () => {
    fail(4);
    expect(isRateLimited(key)).toBe(false);
    fail(1);
    expect(isRateLimited(key)).toBe(true);
  });

  it('keeps keys independent', () => {
    fail(5);
    expect(isRateLimited(`${key}-other`)).toBe(false);
  });

  it('frees the key 15 minutes after the first failure in the window', () => {
    fail(5);
    vi.advanceTimersByTime(15 * MINUTE - 1);
    expect(isRateLimited(key)).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isRateLimited(key)).toBe(false);
  });

  it('starts a new window, not a running total, after expiry', () => {
    fail(4);
    vi.advanceTimersByTime(15 * MINUTE);
    fail(4);
    expect(isRateLimited(key)).toBe(false);
  });

  it('clears the count on success', () => {
    fail(5);
    clearFailures(key);
    expect(isRateLimited(key)).toBe(false);
    fail(4);
    expect(isRateLimited(key)).toBe(false);
  });

  it('reports whole seconds until the window frees', () => {
    expect(retryAfterSeconds(key)).toBe(0);
    fail(5);
    expect(retryAfterSeconds(key)).toBe(900);
    vi.advanceTimersByTime(10 * MINUTE + 500);
    expect(retryAfterSeconds(key)).toBe(300);
    vi.advanceTimersByTime(5 * MINUTE);
    expect(retryAfterSeconds(key)).toBe(0);
  });
});

describe('clientIp', () => {
  it('uses the first x-forwarded-for hop', () => {
    expect(clientIp(new Headers({ 'x-forwarded-for': ' 203.0.113.7 , 10.0.0.1' }))).toBe('203.0.113.7');
  });

  it('falls back to localhost without the header', () => {
    expect(clientIp(new Headers())).toBe('127.0.0.1');
  });
});
