import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

// requireApiUser is mocked (auth is exercised in api-auth.test.ts);
// resolveApiStudentId stays real so the parent studentId policy is tested for real.
vi.mock('@/services/accounts', () => ({ assertParentOwnsStudent: vi.fn() }));
vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, requireApiUser: vi.fn() };
});
vi.mock('@/services/trips', () => ({ listTrips: vi.fn(), createTrip: vi.fn() }));

import { requireApiUser } from '@/lib/api-auth';
import { listTrips, createTrip } from '@/services/trips';
import { UnauthorizedError, ValidationError } from '@/services/errors';
import { GET, POST, OPTIONS } from './route';

const ALLOWED = 'http://localhost:3000';

beforeAll(() => {
  process.env.API_ALLOWED_ORIGINS = ALLOWED;
});

beforeEach(() => {
  vi.clearAllMocks();
});

function get(origin?: string): Request {
  return new Request('http://localhost:3000/api/v1/trips', {
    headers: origin ? { origin } : {},
  });
}

describe('parent callers', () => {
  const parent = { userId: 7, userType: 'parent' as const, parentId: null };

  it("lists the named student's trips for their parent", async () => {
    vi.mocked(requireApiUser).mockResolvedValue(parent);
    vi.mocked(listTrips).mockResolvedValue([] as never);
    const res = await GET(new Request('http://localhost:3000/api/v1/trips?studentId=42'));
    expect(res.status).toBe(200);
    expect(listTrips).toHaveBeenCalledWith(42);
  });

  it('records the parent as createdBy on a trip they log', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(parent);
    vi.mocked(createTrip).mockResolvedValue({ id: 1 } as never);
    const res = await POST(
      new Request('http://localhost:3000/api/v1/trips?studentId=42', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ tripDate: '2026-10-01' }),
      })
    );
    expect(res.status).toBe(201);
    expect(createTrip).toHaveBeenCalledWith({ tripDate: '2026-10-01' }, { studentId: 42, createdBy: 7 });
  });
});

describe('GET /api/v1/trips', () => {
  it('returns the caller trips on a valid student token', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 42,
      userType: 'student',
      parentId: 7,
    });
    const rows = [{ id: 1, studentId: 42, tripDate: '2026-01-01' }];
    vi.mocked(listTrips).mockResolvedValue(rows as never);

    const res = await GET(get(ALLOWED));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
    // studentId resolved to the caller's own id
    expect(listTrips).toHaveBeenCalledWith(42);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });

  it('returns 401 when the token is missing or invalid', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());

    const res = await GET(get());
    expect(res.status).toBe(401);
    expect(listTrips).not.toHaveBeenCalled();
  });

  it('returns 400 for a parent token with no studentId', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 1,
      userType: 'parent',
      parentId: null,
    });

    const res = await GET(get());
    expect(res.status).toBe(400);
    expect(listTrips).not.toHaveBeenCalled();
  });
});

function post(body: unknown, origin?: string): Request {
  return new Request('http://localhost:3000/api/v1/trips', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('POST /api/v1/trips', () => {
  const studentCaller = { userId: 42, userType: 'student' as const, parentId: 7 };

  it('creates a trip and returns it with 201', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    const created = { id: 9, studentId: 42, tripDate: '2026-01-01' };
    vi.mocked(createTrip).mockResolvedValue(created as never);

    const res = await POST(post({ tripDate: '2026-01-01' }, ALLOWED));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
    // studentId and createdBy both the caller's own id
    expect(createTrip).toHaveBeenCalledWith(expect.any(Object), {
      studentId: 42,
      createdBy: 42,
    });
  });

  it('maps a ValidationError to 400 with fields', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    vi.mocked(createTrip).mockRejectedValue(
      new ValidationError('Date is required.', { tripDate: 'Date is required.' })
    );

    const res = await POST(post({}, ALLOWED));
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error: { fields?: Record<string, string> } };
    expect(json.error.fields).toEqual({ tripDate: 'Date is required.' });
  });

  it('returns 400 on a non-object body without calling the service', async () => {
    vi.mocked(requireApiUser).mockResolvedValue(studentCaller);
    const res = await POST(post('null', ALLOWED));
    expect(res.status).toBe(400);
    expect(createTrip).not.toHaveBeenCalled();
  });

  it('returns 401 with no token', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());
    const res = await POST(post({ tripDate: '2026-01-01' }));
    expect(res.status).toBe(401);
    expect(createTrip).not.toHaveBeenCalled();
  });

  it('returns 400 for a parent token with no studentId', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 1,
      userType: 'parent',
      parentId: null,
    });
    const res = await POST(post({ tripDate: '2026-01-01' }));
    expect(res.status).toBe(400);
    expect(createTrip).not.toHaveBeenCalled();
  });
});

describe('OPTIONS /api/v1/trips', () => {
  it('returns a 204 preflight', async () => {
    const res = await OPTIONS(get(ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });
});
