import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the drizzle query chain: select().from().where().orderBy() -> rows.
const orderByMock = vi.fn();
const whereMock = vi.fn(() => ({ orderBy: orderByMock }));
const fromMock = vi.fn(() => ({ where: whereMock }));
vi.mock('@/db', () => ({
  db: { select: () => ({ from: fromMock }) },
}));

// Don't actually render PDF bytes in unit tests — assert on the call instead.
// vi.mock factories are hoisted above imports, so the mock fn must be too.
const { renderToBufferMock } = vi.hoisted(() => ({
  renderToBufferMock: vi.fn(async () => Buffer.from('fake-pdf-bytes')),
}));
vi.mock('@react-pdf/renderer', () => ({ renderToBuffer: renderToBufferMock }));
vi.mock('./document', () => ({ ReportDocument: () => null }));

import { buildReportPdf } from './build';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('buildReportPdf', () => {
  it('accumulates running totals across trips in order', async () => {
    orderByMock.mockResolvedValue([
      { id: 1, tripDate: '2026-01-01', daytimeMinutes: 30, nighttimeMinutes: 10 },
      { id: 2, tripDate: '2026-01-02', daytimeMinutes: 20, nighttimeMinutes: 5 },
    ]);

    await buildReportPdf(5, 'Jimmy', 'John');

    expect(renderToBufferMock).toHaveBeenCalledOnce();
    const element = renderToBufferMock.mock.calls[0][0] as { props: Record<string, unknown> };
    expect(element.props.totalDay).toBe(50);
    expect(element.props.totalNight).toBe(15);
    expect(element.props.rows).toEqual([
      { id: 1, tripDate: '2026-01-01', daytimeMinutes: 30, nighttimeMinutes: 10, runningDay: 30, runningNight: 10, grandTotal: 40 },
      { id: 2, tripDate: '2026-01-02', daytimeMinutes: 20, nighttimeMinutes: 5, runningDay: 50, runningNight: 15, grandTotal: 65 },
    ]);
    expect(element.props.studentName).toBe('Jimmy');
    expect(element.props.parentName).toBe('John');
  });

  it('derives the filename from studentName (lowercased, spaces to hyphens)', async () => {
    orderByMock.mockResolvedValue([]);

    const { filename } = await buildReportPdf(5, 'Jimmy Telford', null);

    expect(filename).toBe('driving-log-jimmy-telford.pdf');
  });

  it('falls back to "report" when studentName is null', async () => {
    orderByMock.mockResolvedValue([]);

    const { filename } = await buildReportPdf(5, null, null);

    expect(filename).toBe('driving-log-report.pdf');
  });

  it('handles zero trips: empty rows, zero totals, still renders a PDF', async () => {
    orderByMock.mockResolvedValue([]);

    const { buffer } = await buildReportPdf(5, 'Jimmy', null);

    expect(renderToBufferMock).toHaveBeenCalledOnce();
    const element = renderToBufferMock.mock.calls[0][0] as { props: Record<string, unknown> };
    expect(element.props.rows).toEqual([]);
    expect(element.props.totalDay).toBe(0);
    expect(element.props.totalNight).toBe(0);
    expect(buffer).toEqual(Buffer.from('fake-pdf-bytes'));
  });
});
