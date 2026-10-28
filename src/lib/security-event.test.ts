import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { accountHash, securityEvent, actionIp } from './security-event';
import { errorResponse } from './api-error';
import { UnauthorizedError, ForbiddenError, NotFoundError, ValidationError } from '@/services/errors';

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-auth-secret-at-least-32-characters-long!!';
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Every logged line, parsed back from `SEC {json}`.
function captureEvents() {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  return () =>
    warn.mock.calls
      .map((c) => String(c[0]))
      .filter((line) => line.startsWith('SEC '))
      .map((line) => JSON.parse(line.slice(4)) as Record<string, unknown>);
}

describe('accountHash', () => {
  it('is stable across case and whitespace, and 12 hex characters', () => {
    const a = accountHash('Jimmy@Example.com ');
    expect(a).toMatch(/^[0-9a-f]{12}$/);
    expect(accountHash('jimmy@example.com')).toBe(a);
  });

  it('differs between accounts', () => {
    expect(accountHash('a@example.com')).not.toBe(accountHash('b@example.com'));
  });

  it('is keyed: it does not equal a plain SHA-256 of the email', async () => {
    const { createHash } = await import('crypto');
    const plain = createHash('sha256').update('jimmy@example.com').digest('hex').slice(0, 12);
    expect(accountHash('jimmy@example.com')).not.toBe(plain);
  });

  it('returns undefined for a missing or non-string email', () => {
    expect(accountHash(undefined)).toBeUndefined();
    expect(accountHash('   ')).toBeUndefined();
    expect(accountHash(42)).toBeUndefined();
  });
});

describe('securityEvent', () => {
  it('writes one SEC-prefixed JSON line with the hashed account and no raw email', () => {
    const events = captureEvents();
    securityEvent('signin.failed', { surface: 'web', ip: '203.0.113.9', email: 'jimmy@example.com' });

    expect(events()).toEqual([
      { event: 'signin.failed', account: accountHash('jimmy@example.com'), surface: 'web', ip: '203.0.113.9' },
    ]);
    const line = String(vi.mocked(console.warn).mock.calls[0][0]);
    expect(line).not.toContain('jimmy@example.com');
  });

  it('drops undefined and empty fields', () => {
    const events = captureEvents();
    securityEvent('password_reset.invalid_token', { surface: 'web', ip: undefined, reason: '' });
    expect(events()).toEqual([{ event: 'password_reset.invalid_token', surface: 'web' }]);
  });

  it('never throws, even if logging fails', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {
      throw new Error('stderr closed');
    });
    expect(() => securityEvent('register', { outcome: 'created' })).not.toThrow();
  });
});

describe('actionIp', () => {
  it('returns undefined outside a request scope instead of throwing', async () => {
    await expect(actionIp()).resolves.toBeUndefined();
  });
});

describe('errorResponse security events', () => {
  const req = () =>
    new Request('http://localhost:3000/api/v1/trips/17', {
      method: 'PATCH',
      headers: { 'x-forwarded-for': '198.51.100.7, 10.0.0.1' },
    });

  it.each([
    [new UnauthorizedError('Invalid or expired token'), 401, 'api.unauthorized'],
    [new ForbiddenError('Parent API access is not supported yet'), 403, 'api.forbidden'],
    [new NotFoundError('Trip not found.'), 404, 'api.not_found'],
  ])('logs %s as %s', (err, status, event) => {
    const events = captureEvents();
    expect(errorResponse(err, req()).status).toBe(status);
    expect(events()).toEqual([
      { event, surface: 'api', ip: '198.51.100.7', path: 'PATCH /api/v1/trips/17', reason: err.message },
    ]);
  });

  it('does not log validation errors', () => {
    const events = captureEvents();
    expect(errorResponse(new ValidationError('Invalid trip id.'), req()).status).toBe(400);
    expect(events()).toEqual([]);
  });

  it('does not log when no request is passed', () => {
    const events = captureEvents();
    expect(errorResponse(new UnauthorizedError(), undefined).status).toBe(401);
    expect(events()).toEqual([]);
  });
});
