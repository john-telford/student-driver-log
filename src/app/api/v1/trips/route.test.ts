import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

// requireApiUser is mocked (auth is exercised in api-auth.test.ts);
// resolveApiStudentId stays real so the parent→403 policy is tested for real.
vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, requireApiUser: vi.fn() };
});
vi.mock('@/services/trips', () => ({ listTrips: vi.fn() }));

import { requireApiUser } from '@/lib/api-auth';
import { listTrips } from '@/services/trips';
import { UnauthorizedError } from '@/services/errors';
import { GET, OPTIONS } from './route';

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

  it('returns 403 for a parent token (parent API not supported in v1)', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 1,
      userType: 'parent',
      parentId: null,
    });

    const res = await GET(get());
    expect(res.status).toBe(403);
    expect(listTrips).not.toHaveBeenCalled();
  });
});

describe('OPTIONS /api/v1/trips', () => {
  it('returns a 204 preflight', async () => {
    const res = await OPTIONS(get(ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });
});
