import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

vi.mock('@/services/accounts', () => ({ registerParent: vi.fn() }));

import { jwtVerify } from 'jose';
import { registerParent } from '@/services/accounts';
import { ValidationError } from '@/services/errors';
import { POST, OPTIONS } from './route';

beforeAll(() => {
  process.env.API_JWT_SECRET = 'test-secret-at-least-32-bytes-long-xx';
  process.env.API_ALLOWED_ORIGINS = 'http://localhost:3000';
});

beforeEach(() => {
  vi.clearAllMocks();
});

let ipCounter = 0;
function post(body: unknown, ip = `10.0.0.${++ipCounter}`): Request {
  return new Request('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/v1/auth/register', () => {
  it('creates a parent and returns a parent token with 201', async () => {
    vi.mocked(registerParent).mockResolvedValue({
      id: 9, name: 'Pat', email: 'pat@example.com', userType: 'parent', parentId: null,
    });
    const res = await POST(post({ name: 'Pat', email: 'pat@example.com', password: 'granite-orbit-47' }));
    expect(res.status).toBe(201);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const { token } = await res.json();
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.API_JWT_SECRET));
    expect(payload.sub).toBe('9');
    expect(payload.userType).toBe('parent');
  });

  it('returns 400 with the fields on invalid input', async () => {
    vi.mocked(registerParent).mockRejectedValue(
      new ValidationError('Name is required.', { name: 'Name is required.' })
    );
    const res = await POST(post({ email: 'pat@example.com' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: { code: 'validation_error', message: 'Name is required.', fields: { name: 'Name is required.' } },
    });
  });

  it('returns 400 on a non-object body without calling the service', async () => {
    const res = await POST(post('[1,2]'));
    expect(res.status).toBe(400);
    expect(registerParent).not.toHaveBeenCalled();
  });

  it('limits one IP to 5 attempts per window', async () => {
    vi.mocked(registerParent).mockRejectedValue(new ValidationError('x', { name: 'x' }));
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await POST(post({}, '10.9.9.9'))).status);
    expect(statuses).toEqual([400, 400, 400, 400, 400, 429]);
    const limited = await POST(post({}, '10.9.9.9'));
    expect(limited.headers.get('retry-after')).toMatch(/^\d+$/);
  });

  it('answers a preflight', async () => {
    const res = await OPTIONS(new Request('http://localhost:3000/api/v1/auth/register', { method: 'OPTIONS' }));
    expect(res.status).toBe(204);
  });
});
