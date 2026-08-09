import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, requireApiUser: vi.fn() };
});
vi.mock('@/services/trips', () => ({ updateTrip: vi.fn(), deleteTrip: vi.fn() }));

import { requireApiUser } from '@/lib/api-auth';
import { updateTrip, deleteTrip } from '@/services/trips';
import { UnauthorizedError, NotFoundError } from '@/services/errors';
import { PATCH, DELETE, OPTIONS } from './route';

const ALLOWED = 'http://localhost:3000';
const studentCaller = { userId: 42, userType: 'student' as const, parentId: 7 };

beforeAll(() => {
  process.env.API_ALLOWED_ORIGINS = ALLOWED;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function patch(id: string, body: unknown, origin?: string): Request {
  return new Request(`http://localhost:3000/api/v1/trips/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

function del(id: string, origin?: string): Request {
  return new Request(`http://localhost:3000/api/v1/trips/${id}`, {
    method: 'DELETE',
    headers: origin ? { origin } : {},
  });
}

describe('PATCH /api/v1/trips/:id', () => {
  it('updates a trip and returns it with 200', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    const updated = { id: 10, studentId: 42, tripDate: '2026-01-01' };
    vi.mocked(updateTrip).mockResolvedValue(updated as never);

    const res = await PATCH(patch('10', { tripDate: '2026-01-01' }, ALLOWED), ctx('10'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(updateTrip).toHaveBeenCalledWith(10, expect.any(Object), { studentId: 42 });
  });

  it('returns 404 for a trip id the caller does not own', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    vi.mocked(updateTrip).mockRejectedValue(new NotFoundError('Trip not found.'));

    const res = await PATCH(patch('999', { tripDate: '2026-01-01' }), ctx('999'));
    expect(res.status).toBe(404);
  });

  it('returns 400 on a non-numeric id without calling the service', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);

    const res = await PATCH(patch('abc', { tripDate: '2026-01-01' }), ctx('abc'));
    expect(res.status).toBe(400);
    expect(updateTrip).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid JSON body', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    const res = await PATCH(patch('10', 'not json{'), ctx('10'));
    expect(res.status).toBe(400);
    expect(updateTrip).not.toHaveBeenCalled();
  });

  it('returns 401 with no valid token', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());
    const res = await PATCH(patch('10', { tripDate: '2026-01-01' }), ctx('10'));
    expect(res.status).toBe(401);
    expect(updateTrip).not.toHaveBeenCalled();
  });

  it('returns 403 for a parent token', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 1,
      userType: 'parent',
      parentId: null,
    });
    const res = await PATCH(patch('10', { tripDate: '2026-01-01' }), ctx('10'));
    expect(res.status).toBe(403);
    expect(updateTrip).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/v1/trips/:id', () => {
  it('deletes an owned trip and returns 204 with no body', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    vi.mocked(deleteTrip).mockResolvedValue(undefined);

    const res = await DELETE(del('10', ALLOWED), ctx('10'));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
    expect(deleteTrip).toHaveBeenCalledWith(10, { studentId: 42 });
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });

  it('returns 404 for a trip id the caller does not own', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    vi.mocked(deleteTrip).mockRejectedValue(new NotFoundError('Trip not found.'));

    const res = await DELETE(del('999'), ctx('999'));
    expect(res.status).toBe(404);
  });

  it('returns 400 on a non-numeric id without calling the service', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    const res = await DELETE(del('abc'), ctx('abc'));
    expect(res.status).toBe(400);
    expect(deleteTrip).not.toHaveBeenCalled();
  });

  it('returns 401 with no valid token', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());
    const res = await DELETE(del('10'), ctx('10'));
    expect(res.status).toBe(401);
    expect(deleteTrip).not.toHaveBeenCalled();
  });

  it('returns 403 for a parent token', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 1,
      userType: 'parent',
      parentId: null,
    });
    const res = await DELETE(del('10'), ctx('10'));
    expect(res.status).toBe(403);
    expect(deleteTrip).not.toHaveBeenCalled();
  });
});

describe('OPTIONS /api/v1/trips/:id', () => {
  it('returns a 204 preflight', async () => {
    const res = await OPTIONS(patch('10', {}, ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });
});
