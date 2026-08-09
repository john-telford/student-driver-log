import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

// requireApiUser is mocked (auth is exercised in api-auth.test.ts);
// resolveApiStudentId stays real so the parent→403 policy is tested for real.
vi.mock('@/lib/api-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-auth')>();
  return { ...actual, requireApiUser: vi.fn() };
});
vi.mock('@/app/api/report/pdf/build', () => ({ buildReportPdf: vi.fn() }));

// Mock the drizzle query chain: select().from().where() [awaited] -> rows,
// used for the studentName lookup.
const whereMock = vi.fn();
const fromMock = vi.fn(() => ({ where: whereMock }));
vi.mock('@/db', () => ({ db: { select: () => ({ from: fromMock }) } }));

import { requireApiUser } from '@/lib/api-auth';
import { buildReportPdf } from '@/app/api/report/pdf/build';
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
  return new Request('http://localhost:3000/api/v1/report/pdf', {
    headers: origin ? { origin } : {},
  });
}

describe('GET /api/v1/report/pdf', () => {
  it('returns the PDF for a valid student token', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 42,
      userType: 'student',
      parentId: 7,
    });
    whereMock.mockResolvedValue([{ name: 'Jimmy' }]);
    vi.mocked(buildReportPdf).mockResolvedValue({
      buffer: Buffer.from('pdf'),
      filename: 'driving-log-jimmy.pdf',
    });

    const res = await GET(get(ALLOWED));

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toBe('attachment; filename="driving-log-jimmy.pdf"');
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
    expect(buildReportPdf).toHaveBeenCalledWith(42, 'Jimmy', null);
  });

  it('returns 401 when the token is missing or invalid', async () => {
    vi.mocked(requireApiUser).mockRejectedValue(new UnauthorizedError());

    const res = await GET(get());
    expect(res.status).toBe(401);
    expect(buildReportPdf).not.toHaveBeenCalled();
  });

  it('returns 403 for a parent token (parent API not supported in v1)', async () => {
    vi.mocked(requireApiUser).mockResolvedValue({
      userId: 1,
      userType: 'parent',
      parentId: null,
    });

    const res = await GET(get());
    expect(res.status).toBe(403);
    expect(buildReportPdf).not.toHaveBeenCalled();
  });
});

describe('OPTIONS /api/v1/report/pdf', () => {
  it('returns a 204 preflight', async () => {
    const res = await OPTIONS(get(ALLOWED));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ALLOWED);
  });
});
