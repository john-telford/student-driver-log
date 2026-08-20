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

function post(body: unknown, origin?: string): Request {
  return new Request('http://localhost:3000/api/v1/auth/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(origin ? { origin } : {}),
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
