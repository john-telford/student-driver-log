import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { CredentialsSignin } from 'next-auth';

// NextAuth() reads these when src/auth.ts is imported.
vi.hoisted(() => {
  process.env.AUTH_SECRET = 'test-auth-secret-at-least-32-characters-long!!';
  process.env.AUTH_TRUST_HOST = 'true';
});

// Only the limiter wiring is under test; the bcrypt/DB check has its own tests.
vi.mock('@/services/auth', () => ({ verifyCredentials: vi.fn() }));

import { verifyCredentials } from '@/services/auth';
import { authorizeCredentials, handlers, RateLimitedSignin } from './auth';

const USER = { id: 42, name: 'Jimmy', email: 'jimmy@example.com', userType: 'student', parentId: 7 } as const;
const CREDS = { email: 'jimmy@example.com', password: 'whatever-it-is' };

// The limiter's store is module-level, so each test signs in from its own IP.
function request(ip: string): Request {
  return new Request('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'x-forwarded-for': ip },
  });
}

async function failTimes(ip: string, times: number, creds = CREDS) {
  vi.mocked(verifyCredentials).mockResolvedValue(null);
  for (let i = 0; i < times; i++) {
    expect(await authorizeCredentials(creds, request(ip))).toBeNull();
  }
}

async function succeed(ip: string) {
  vi.mocked(verifyCredentials).mockResolvedValue({ ...USER });
  expect(await authorizeCredentials(CREDS, request(ip))).not.toBeNull();
}

async function expectLimited(ip: string, creds = CREDS) {
  vi.mocked(verifyCredentials).mockClear();
  await expect(authorizeCredentials(creds, request(ip))).rejects.toBeInstanceOf(RateLimitedSignin);
  expect(verifyCredentials).not.toHaveBeenCalled();
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

  it('keys on the client IP and the normalized email', async () => {
    await failTimes('192.0.2.3', 5);
    // Same IP, other email; same email, other IP: both still get a real check.
    await failTimes('192.0.2.3', 1, { email: 'pat@example.com', password: 'x' });
    await failTimes('192.0.2.4', 1);
    // Case and surrounding spaces don't make a new key.
    await expectLimited('192.0.2.3', { email: '  JIMMY@Example.com ', password: 'x' });
  });

  it('counts concurrent attempts before checking credentials, so at most 5 of a burst reach it', async () => {
    let release!: (value: null) => void;
    const slow = new Promise<null>((resolve) => { release = resolve; });
    vi.mocked(verifyCredentials).mockReturnValue(slow);

    const burst = Array.from({ length: 10 }, () => authorizeCredentials(CREDS, request('192.0.2.5')));
    release(null);
    const results = await Promise.allSettled(burst);

    expect(verifyCredentials).toHaveBeenCalledTimes(5);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(5);
    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    expect(rejected).toHaveLength(5);
    for (const r of rejected) expect(r.reason).toBeInstanceOf(RateLimitedSignin);
  });

  it('does not reset earlier failures on a success', async () => {
    await failTimes('192.0.2.6', 4);
    await succeed('192.0.2.6');
    await failTimes('192.0.2.6', 1);
    await expectLimited('192.0.2.6');
  });

  it('limits a repeated 4 failures + 1 success cycle', async () => {
    await failTimes('192.0.2.7', 4);
    await succeed('192.0.2.7');
    await failTimes('192.0.2.7', 1);
    await expectLimited('192.0.2.7');
    // Still limited even for the right password.
    vi.mocked(verifyCredentials).mockResolvedValue({ ...USER });
    await expect(authorizeCredentials(CREDS, request('192.0.2.7'))).rejects.toBeInstanceOf(RateLimitedSignin);
  });

  it('does not count a request missing the email or password', async () => {
    for (let i = 0; i < 6; i++) {
      expect(await authorizeCredentials({ email: CREDS.email }, request('192.0.2.8'))).toBeNull();
      expect(await authorizeCredentials({ password: 'x' }, request('192.0.2.8'))).toBeNull();
    }
    expect(verifyCredentials).not.toHaveBeenCalled();
    await failTimes('192.0.2.8', 5);
  });

  // The iOS app's token route uses `token:<ip>:<email>`; a website lockout
  // must not lock the app out, or the reverse.
  it('keeps its count separate from the token route', async () => {
    const { consumeAttempt } = await import('@/lib/rate-limit');
    for (let i = 0; i < 6; i++) consumeAttempt(`token:192.0.2.9:${CREDS.email}`);
    await failTimes('192.0.2.9', 1);
  });
});

// Through Auth.js itself: a form POST to the credentials callback must reach
// authorizeCredentials, so dropping the limiter from the provider's
// `authorize` fails here.
describe('Auth.js credentials callback', () => {
  const BASE = 'http://localhost:3000/api/auth';

  async function csrf(): Promise<{ token: string; cookie: string }> {
    const res = await handlers.GET(new NextRequest(`${BASE}/csrf`));
    const { csrfToken } = (await res.json()) as { csrfToken: string };
    const cookie = res.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
    return { token: csrfToken, cookie };
  }

  async function postCallback(ip: string): Promise<string> {
    const { token, cookie } = await csrf();
    const res = await handlers.POST(
      new NextRequest(`${BASE}/callback/credentials`, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-forwarded-for': ip,
          cookie,
        },
        body: new URLSearchParams({ ...CREDS, csrfToken: token }),
      })
    );
    return res.headers.get('location') ?? '';
  }

  it('limits the 6th failed sign-in posted to the callback', async () => {
    vi.mocked(verifyCredentials).mockResolvedValue(null);
    for (let i = 0; i < 5; i++) {
      expect(await postCallback('192.0.2.10')).toContain('code=credentials');
    }
    expect(verifyCredentials).toHaveBeenCalledTimes(5);
    expect(await postCallback('192.0.2.10')).toContain('code=rate_limited');
    expect(verifyCredentials).toHaveBeenCalledTimes(5);
  });
});
