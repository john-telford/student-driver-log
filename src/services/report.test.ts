import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the drizzle query chain: select().from().where() [awaited] -> [row].
// Same shape as the ownership-check calls in trips.test.ts — this query has no
// .orderBy(), the totals row resolves directly off .where().
const whereMock = vi.fn<(...args: unknown[]) => unknown>();
const fromMock = vi.fn(() => ({ where: whereMock }));
vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: fromMock }),
  },
}));

import { getReport, TOTAL_REQUIRED_MIN, NIGHT_REQUIRED_MIN } from './report';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getReport', () => {
  it('aggregates a student\'s totals and progress', async () => {
    whereMock.mockResolvedValue([{ daytime: '120', nighttime: '30' }]);

    const report = await getReport(5);

    expect(report).toEqual({
      daytimeMinutes: 120,
      nighttimeMinutes: 30,
      totalMinutes: 150,
      totalRequiredMinutes: TOTAL_REQUIRED_MIN,
      nightRequiredMinutes: NIGHT_REQUIRED_MIN,
      totalPercent: 5, // round(150/3000*100)
      nightPercent: 5, // round(30/600*100)
    });
  });

  it('returns all-zero totals (not NaN) for a student with no trips', async () => {
    whereMock.mockResolvedValue([{ daytime: null, nighttime: null }]);

    const report = await getReport(99);

    expect(report).toEqual({
      daytimeMinutes: 0,
      nighttimeMinutes: 0,
      totalMinutes: 0,
      totalRequiredMinutes: TOTAL_REQUIRED_MIN,
      nightRequiredMinutes: NIGHT_REQUIRED_MIN,
      totalPercent: 0,
      nightPercent: 0,
    });
  });

  it('handles an empty result row (no aggregate row at all)', async () => {
    whereMock.mockResolvedValue([]);

    const report = await getReport(99);

    expect(report.totalMinutes).toBe(0);
    expect(report.totalPercent).toBe(0);
    expect(report.nightPercent).toBe(0);
  });

  it('clamps percent at 100 when totals exceed the requirement', async () => {
    whereMock.mockResolvedValue([{ daytime: '3000', nighttime: '900' }]);

    const report = await getReport(5);

    expect(report.totalPercent).toBe(100);
    expect(report.nightPercent).toBe(100);
  });

  it('rounds a non-round percent fraction', async () => {
    // 1000/3000 = 33.33...% -> rounds to 33
    whereMock.mockResolvedValue([{ daytime: '1000', nighttime: '0' }]);

    const report = await getReport(5);

    expect(report.totalPercent).toBe(33);
  });
});
