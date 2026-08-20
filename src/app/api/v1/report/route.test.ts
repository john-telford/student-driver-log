import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

// requireApiUser is mocked (auth is exercised in api-auth.test.ts);
// resolveApiStudentId stays real so the parent→403 policy is tested for real.
vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, requireApiUser: vi.fn() };
});
vi.mock('@/services/report', () => ({ getReport: vi.fn() }));

import { requireApiUser } from '@/lib/api-auth';
import { getReport } from '@/services/report';
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
  return new Request('http://localhost:3000/api/v1/report', {
    headers: origin ? { origin } : {},
  });
}

describe('GET /api/v1/report', () => {
  it('returns the caller report on a valid student token', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 42,
      userType: 'student',
      parentId: 7,
    });
    const report = {
      daytimeMinutes: 120,
      nighttimeMinutes: 30,
      totalMinutes: 150,
      totalRequiredMinutes: 3000,
      nightRequiredMinutes: 600,
      totalPercent: 5,
      nightPercent: 5,
    };
    vi.mocked(getReport).mockResolvedValue(report);

    const res = await GET(get(ALLOWED));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(report);
    expect(getReport).toHaveBeenCalledWith(42);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });

  it('returns 401 when the token is missing or invalid', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());

    const res = await GET(get());
    expect(res.status).toBe(401);
    expect(getReport).not.toHaveBeenCalled();
  });

  it('returns 403 for a parent token (parent API not supported in v1)', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 1,
      userType: 'parent',
      parentId: null,
    });

    const res = await GET(get());
    expect(res.status).toBe(403);
    expect(getReport).not.toHaveBeenCalled();
  });
});

describe('OPTIONS /api/v1/report', () => {
  it('returns a 204 preflight', async () => {
    const res = await OPTIONS(get(ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });
});
