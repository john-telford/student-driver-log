import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CredentialsSignin } from 'next-auth';

// Only the limiter wiring is under test; the bcrypt/DB check has its own tests.
vi.mock('@/services/auth', () => ({ verifyCredentials: vi.fn() }));

import { verifyCredentials } from '@/services/auth';
import { authorizeCredentials, RateLimitedSignin } from './auth';

const USER = { id: 42, name: 'Jimmy', email: 'jimmy@example.com', userType: 'student', parentId: 7 } as const;
const CREDS = { email: 'jimmy@example.com', password: 'whatever-it-is' };

// The limiter's store is module-level, so each test signs in from its own IP.
function request(ip: string): Request {
  return new Request('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
  });
}

async function failTimes(ip: string, times: number) {
  vi.mocked(verifyCredentials).mockResolvedValue(null);
  for (let i = 0; i < times; i++) {
    expect(await authorizeCredentials(CREDS, request(ip))).toBeNull();
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authorizeCredentials', () => {
  it('returns the user on valid credentials', async () => {
    vi.mocked(verifyCredentials).mockResolvedValue({ ...USER });
    expect(await authorizeCredentials(CREDS, request('192.0.2.1'))).toEqual({
      id: '42',
      name: 'Jimmy',
      email: 'jimmy@example.com',
      userType: 'student',
      parentId: 7,
    });
  });

  it('throws a rate_limited CredentialsSignin after 5 failures, without checking credentials', async () => {
    await failTimes('192.0.2.2', 5);
    vi.mocked(verifyCredentials).mockClear();

    const attempt = authorizeCredentials(CREDS, request('192.0.2.2'));
    await expect(attempt).rejects.toBeInstanceOf(RateLimitedSignin);
    await expect(attempt).rejects.toBeInstanceOf(CredentialsSignin);
    await expect(attempt).rejects.toMatchObject({ code: 'rate_limited' });
    expect(verifyCredentials).not.toHaveBeenCalled();
  });

  it('keys on the client IP', async () => {
    await failTimes('192.0.2.3', 5);
    await failTimes('192.0.2.4', 1);
  });

  it('clears the count on success', async () => {
    await failTimes('192.0.2.5', 4);
    vi.mocked(verifyCredentials).mockResolvedValue({ ...USER });
    expect(await authorizeCredentials(CREDS, request('192.0.2.5'))).not.toBeNull();
    await failTimes('192.0.2.5', 5);
  });

  it('does not count a request missing the email or password', async () => {
    for (let i = 0; i < 6; i++) {
      expect(await authorizeCredentials({ email: 'a@b.c' }, request('192.0.2.6'))).toBeNull();
    }
    expect(verifyCredentials).not.toHaveBeenCalled();
    await failTimes('192.0.2.6', 5);
  });

  // The iOS app's token route uses `token:<ip>`; a website lockout must not
  // lock the app out, or the reverse.
  it('keeps its count separate from the token route', async () => {
    const { recordFailure } = await import('@/lib/rate-limit');
    for (let i = 0; i < 5; i++) recordFailure('token:192.0.2.7');
    await failTimes('192.0.2.7', 1);
  });
});
