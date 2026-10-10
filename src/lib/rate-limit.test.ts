import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  clientIp,
  consumeAttempt,
  refundAttempt,
  signInKey,
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

function consume(times: number) {
  for (let i = 0; i < times; i++) expect(consumeAttempt(key)).toEqual({ limited: false });
}

describe('rate limiter', () => {
  it('allows 5 attempts and limits the 6th', () => {
    consume(5);
    expect(consumeAttempt(key)).toMatchObject({ limited: true });
  });

  it('does not count a limited attempt', () => {
    consume(5);
    for (let i = 0; i < 3; i++) consumeAttempt(key);
    refundAttempt(key);
    expect(consumeAttempt(key)).toEqual({ limited: false });
  });

  it('keeps keys independent', () => {
    consume(5);
    expect(consumeAttempt(`${key}-other`)).toEqual({ limited: false });
  });

  it('frees the key 15 minutes after the first attempt in the window', () => {
    consume(5);
    vi.advanceTimersByTime(15 * MINUTE - 1);
    expect(consumeAttempt(key)).toMatchObject({ limited: true });
    vi.advanceTimersByTime(1);
    expect(consumeAttempt(key)).toEqual({ limited: false });
  });

  it('starts a new window, not a running total, after expiry', () => {
    consume(4);
    vi.advanceTimersByTime(15 * MINUTE);
    consume(5);
    expect(consumeAttempt(key)).toMatchObject({ limited: true });
  });

  it('refunds one attempt, not the whole count', () => {
    consume(5);
    refundAttempt(key);
    consume(1);
    expect(consumeAttempt(key)).toMatchObject({ limited: true });
  });

  it('never refunds below zero', () => {
    refundAttempt(key);
    consume(1);
    refundAttempt(key);
    refundAttempt(key);
    consume(5);
    expect(consumeAttempt(key)).toMatchObject({ limited: true });
  });

  it('reports whole seconds until the window frees', () => {
    consume(5);
    expect(consumeAttempt(key)).toEqual({ limited: true, retryAfter: 900 });
    vi.advanceTimersByTime(10 * MINUTE + 500);
    expect(consumeAttempt(key)).toEqual({ limited: true, retryAfter: 300 });
    vi.advanceTimersByTime(5 * MINUTE - 501);
    expect(consumeAttempt(key)).toEqual({ limited: true, retryAfter: 1 });
  });
});

describe('signInKey', () => {
  const headers = new Headers({ 'x-forwarded-for': '203.0.113.7' });

  it('keys on surface, IP and the normalized email', () => {
    expect(signInKey('web', headers, '  Jimmy@Example.COM ')).toBe('web:203.0.113.7:jimmy@example.com');
    expect(signInKey('token', headers, 'jimmy@example.com')).toBe('token:203.0.113.7:jimmy@example.com');
  });

  it('has no key without an email', () => {
    expect(signInKey('web', headers, undefined)).toBeNull();
    expect(signInKey('web', headers, '   ')).toBeNull();
    expect(signInKey('token', headers, ['a@b.c'])).toBeNull();
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
