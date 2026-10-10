import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { jwtVerify } from 'jose';

// Mock the credential check so the route test is about HTTP behavior + token
// issuance, not the bcrypt/DB path (covered in services/auth.test.ts).
vi.mock('@/services/auth', () => ({ verifyCredentials: vi.fn() }));

import { verifyCredentials } from '@/services/auth';
import { POST, OPTIONS } from './route';

const SECRET = 'test-secret-value-at-least-32-characters-long!!';
const ALLOWED = 'http://localhost:3000';

beforeAll(() => {
  process.env.API_JWT_SECRET = SECRET;
  process.env.API_ALLOWED_ORIGINS = ALLOWED;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function post(body: unknown, origin?: string, ip?: string): Request {
  return new Request('http://localhost:3000/api/v1/auth/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(origin ? { origin } : {}),
      ...(ip ? { 'x-forwarded-for': ip } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/v1/auth/token', () => {
  it('returns a signed token with mirrored claims on valid credentials', async () => {
    vi.mocked(verifyCredentials).mockResolvedValue({
      id: 42,
      name: 'Jimmy',
      email: 'jimmy@example.com',
      userType: 'student',
      parentId: 7,
    });

    const res = await POST(post({ email: 'jimmy@example.com', password: 'ok' }));
    expect(res.status).toBe(200);

    const json = (await res.json()) as { token: string };
    expect(typeof json.token).toBe('string');

    const { payload } = await jwtVerify(
      json.token,
      new TextEncoder().encode(SECRET)
    );
    expect(payload.sub).toBe('42');
    expect(payload.userType).toBe('student');
    expect(payload.parentId).toBe(7);
    expect(payload.exp).toBeTypeOf('number');
  });

  it('returns 401 and no token on invalid credentials', async () => {
    vi.mocked(verifyCredentials).mockResolvedValue(null);

    const res = await POST(post({ email: 'x@y.z', password: 'bad' }));
    expect(res.status).toBe(401);

    const json = (await res.json()) as { token?: string; error?: unknown };
    expect(json.token).toBeUndefined();
    expect(json.error).toBeDefined();
  });

  it('returns 400 on an invalid JSON body', async () => {
    const res = await POST(post('not json{', ALLOWED));
    expect(res.status).toBe(400);
  });

  it('returns 400 on a non-object JSON body (e.g. null)', async () => {
    const res = await POST(post('null', ALLOWED));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { token?: string };
    expect(json.token).toBeUndefined();
  });

  it('echoes the allow-listed origin in CORS headers', async () => {
    vi.mocked(verifyCredentials).mockResolvedValue(null);
    const res = await POST(post({ email: 'a', password: 'b' }, ALLOWED));
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });
});

// The limiter's store is module-level, so each test signs in from its own IP.
describe('POST /api/v1/auth/token rate limiting', () => {
  const USER = { id: 42, name: 'Jimmy', email: 'jimmy@example.com', userType: 'student', parentId: 7 } as const;
  const bad = (ip: string, email = 'x@y.z') => POST(post({ email, password: 'bad' }, undefined, ip));
  const good = (ip: string) => POST(post({ email: 'x@y.z', password: 'ok' }, undefined, ip));

  async function failTimes(ip: string, times: number, email = 'x@y.z') {
    vi.mocked(verifyCredentials).mockResolvedValue(null);
    for (let i = 0; i < times; i++) expect((await bad(ip, email)).status).toBe(401);
  }

  async function succeed(ip: string) {
    vi.mocked(verifyCredentials).mockResolvedValue({ ...USER });
    expect((await good(ip)).status).toBe(200);
  }

  async function expectLimited(ip: string, email = 'x@y.z') {
    vi.mocked(verifyCredentials).mockClear();
    expect((await bad(ip, email)).status).toBe(429);
    expect(verifyCredentials).not.toHaveBeenCalled();
  }

  it('answers the 6th attempt with 429 rate_limited and Retry-After, without checking credentials', async () => {
    await failTimes('198.51.100.1', 5);
    vi.mocked(verifyCredentials).mockClear();

    const res = await POST(post({ email: 'x@y.z', password: 'bad' }, ALLOWED, '198.51.100.1'));
    expect(res.status).toBe(429);
    const retryAfter = Number(res.headers.get('retry-after'));
    expect(retryAfter).toBeGreaterThan(890);
    expect(retryAfter).toBeLessThanOrEqual(900);
    expect(await res.json()).toEqual({
      error: { code: 'rate_limited', message: 'Too many sign-in attempts. Try again in a few minutes.' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
    expect(verifyCredentials).not.toHaveBeenCalled();
  });

  it('counts Retry-After down from the first attempt in the window', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    try {
      await failTimes('198.51.100.8', 5);
      vi.advanceTimersByTime(10 * 60 * 1000);
      const res = await bad('198.51.100.8');
      expect(res.status).toBe(429);
      expect(res.headers.get('retry-after')).toBe('300');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keys on the client IP and the normalized email', async () => {
    await failTimes('198.51.100.2', 5);
    // Same IP, other email; same email, other IP: both still get a real check.
    await failTimes('198.51.100.2', 1, 'pat@example.com');
    await failTimes('198.51.100.3', 1);
    // Case and surrounding spaces don't make a new key.
    await expectLimited('198.51.100.2', ' X@Y.Z ');
  });

  it('counts concurrent attempts before checking credentials, so at most 5 of a burst reach it', async () => {
    let release!: (value: null) => void;
    const slow = new Promise<null>((resolve) => { release = resolve; });
    vi.mocked(verifyCredentials).mockReturnValue(slow);

    // POST awaits the body before counting, so start them all, then let the
    // credential checks finish together.
    const burst = Array.from({ length: 10 }, () => bad('198.51.100.4'));
    await vi.waitFor(() => expect(verifyCredentials).toHaveBeenCalledTimes(5));
    release(null);
    const statuses = (await Promise.all(burst)).map((r) => r.status).sort();

    expect(verifyCredentials).toHaveBeenCalledTimes(5);
    expect(statuses).toEqual([401, 401, 401, 401, 401, 429, 429, 429, 429, 429]);
  });

  it('does not reset earlier failures on a success', async () => {
    await failTimes('198.51.100.5', 4);
    await succeed('198.51.100.5');
    await failTimes('198.51.100.5', 1);
    await expectLimited('198.51.100.5');
  });

  it('limits a repeated 4 failures + 1 success cycle', async () => {
    await failTimes('198.51.100.6', 4);
    await succeed('198.51.100.6');
    await failTimes('198.51.100.6', 1);
    await expectLimited('198.51.100.6');
    // Still limited even for the right password.
    vi.mocked(verifyCredentials).mockResolvedValue({ ...USER });
    expect((await good('198.51.100.6')).status).toBe(429);
  });

  it('does not count malformed-request 400s or requests without an email', async () => {
    vi.mocked(verifyCredentials).mockResolvedValue(null);
    for (let i = 0; i < 6; i++) {
      expect((await POST(post('not json{', undefined, '198.51.100.7'))).status).toBe(400);
      expect((await POST(post('null', undefined, '198.51.100.7'))).status).toBe(400);
      expect((await POST(post({ password: 'bad' }, undefined, '198.51.100.7'))).status).toBe(401);
      expect((await POST(post({ email: '  ', password: 'bad' }, undefined, '198.51.100.7'))).status).toBe(401);
    }
    await failTimes('198.51.100.7', 5);
    await expectLimited('198.51.100.7');
  });
});

describe('OPTIONS /api/v1/auth/token (CORS preflight)', () => {
  it('returns 204 and allows an allow-listed origin', async () => {
    const res = await OPTIONS(post({}, ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });

  it('does not grant access to a disallowed origin', async () => {
    const res = await OPTIONS(post({}, 'https://evil.example.com'));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
