import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/app/(app)/actions', () => ({ resolveSelectedStudentId: vi.fn() }));
vi.mock('./build', () => ({ buildReportPdf: vi.fn() }));

// Mock the drizzle query chain: select().from().where() [awaited] -> rows,
// used for the studentName/parentName lookups.
const whereMock = vi.fn();
const fromMock = vi.fn(() => ({ where: whereMock }));
vi.mock('@/db', () => ({ db: { select: () => ({ from: fromMock }) } }));

import { auth } from '@/auth';
import { resolveSelectedStudentId } from '@/app/(app)/actions';
import { buildReportPdf } from './build';
import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/report/pdf', () => {
  it('returns 401 with no session', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
    expect(buildReportPdf).not.toHaveBeenCalled();
  });

  it("returns 400 when a parent has no student selected", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', userType: 'parent' },
    } as never);
    vi.mocked(resolveSelectedStudentId).mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(400);
    expect(buildReportPdf).not.toHaveBeenCalled();
  });

  it('builds the PDF for a parent session with a resolved student', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', userType: 'parent' },
    } as never);
    vi.mocked(resolveSelectedStudentId).mockResolvedValue(5);
    // First lookup: student name; second lookup: parent name.
    whereMock.mockResolvedValueOnce([{ name: 'Jimmy' }]).mockResolvedValueOnce([{ name: 'John' }]);
    vi.mocked(buildReportPdf).mockResolvedValue({
      buffer: Buffer.from('pdf'),
      filename: 'driving-log-jimmy.pdf',
    });

    const res = await GET();

    expect(buildReportPdf).toHaveBeenCalledWith(5, 'Jimmy', 'John');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toBe('attachment; filename="driving-log-jimmy.pdf"');
  });

  it('builds the PDF for a student session with no parent name', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: '42', userType: 'student' },
    } as never);
    whereMock.mockResolvedValueOnce([{ name: 'Jimmy' }]);
    vi.mocked(buildReportPdf).mockResolvedValue({
      buffer: Buffer.from('pdf'),
      filename: 'driving-log-jimmy.pdf',
    });

    const res = await GET();

    expect(buildReportPdf).toHaveBeenCalledWith(42, 'Jimmy', null);
    expect(res.status).toBe(200);
    expect(resolveSelectedStudentId).not.toHaveBeenCalled();
  });
});
