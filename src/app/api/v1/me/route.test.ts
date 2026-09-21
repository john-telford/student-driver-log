import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { SignJWT } from 'jose';

// Auth and the service are real: only the DB is mocked, so the expired/tampered
// token and deleted-user cases exercise the actual 401 paths end to end.
const limitMock = vi.fn();
const whereMock = vi.fn(() => ({ limit: limitMock }));
const fromMock = vi.fn(() => ({ where: whereMock }));
const selectMock = vi.fn<(columns: Record<string, unknown>) => unknown>(() => ({ from: fromMock }));
vi.mock('@/db', () => ({ db: { select: (cols: Record<string, unknown>) => selectMock(cols) } }));

import { issueApiToken } from '@/lib/api-auth';
import { GET, OPTIONS } from './route';

const ALLOWED = 'http://localhost:3000';
const SECRET = 'test-secret-for-me-route';

beforeAll(() => {
  process.env.API_ALLOWED_ORIGINS = ALLOWED;
  process.env.API_JWT_SECRET = SECRET;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function get(token?: string, origin?: string): Request {
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (origin) headers.origin = origin;
  return new Request('http://localhost:3000/api/v1/me', { headers });
}

const student = { id: 42, name: 'Jimmy', email: 'jimmy@example.com', userType: 'student' };
const parent = { id: 7, name: 'John', email: 'john@example.com', userType: 'parent' };

describe('GET /api/v1/me', () => {
  it('returns the caller identity for a student token', async () => {
    limitMock.mockResolvedValue([student]);
    const token = await issueApiToken({ id: 42, userType: 'student', parentId: 7 });

    const res = await GET(get(token, ALLOWED));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(student);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });

  it('returns 200 for a parent token (not rejected here; data routes reject parents)', async () => {
    limitMock.mockResolvedValue([parent]);
    const token = await issueApiToken({ id: 7, userType: 'parent', parentId: null });

    const res = await GET(get(token));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(parent);
  });

  it('returns exactly { id, name, email, userType } and selects explicit columns only', async () => {
    // Even if the DB layer over-returned, the handler must not add columns; and
    // the query itself must never ask for passwordHash.
    limitMock.mockResolvedValue([student]);
    const token = await issueApiToken({ id: 42, userType: 'student', parentId: 7 });

    const res = await GET(get(token));
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(['email', 'id', 'name', 'userType']);
    expect(Object.keys(selectMock.mock.calls[0][0]).sort()).toEqual([
      'email',
      'id',
      'name',
      'userType',
    ]);
  });

  it('returns 401 with no Authorization header', async () => {
    const res = await GET(get());
    expect(res.status).toBe(401);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it('returns 401 for an expired token', async () => {
    const expired = await new SignJWT({ userType: 'student', parentId: 7 })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('42')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(SECRET));

    const res = await GET(get(expired));
    expect(res.status).toBe(401);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it('returns 401 for a tampered token', async () => {
    const token = await issueApiToken({ id: 42, userType: 'student', parentId: 7 });
    const [h, p, s] = token.split('.');
    const tampered = `${h}.${p}.${s.slice(0, -2)}${s.endsWith('AA') ? 'BB' : 'AA'}`;

    const res = await GET(get(tampered));
    expect(res.status).toBe(401);
    expect(selectMock).not.toHaveBeenCalled();
  });

  it('returns 401 (not 500) when the user was deleted but the token is still valid', async () => {
    limitMock.mockResolvedValue([]);
    const token = await issueApiToken({ id: 99, userType: 'student', parentId: 7 });

    const res = await GET(get(token));
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthorized');
  });
});

describe('OPTIONS /api/v1/me', () => {
  it('returns a 204 preflight', async () => {
    const res = await OPTIONS(get(undefined, ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });
});
