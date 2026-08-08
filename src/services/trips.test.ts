import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the drizzle query chain: select().from().where().orderBy() resolves rows.
const orderByMock = vi.fn();
const whereMock = vi.fn(() => ({ orderBy: orderByMock }));
const fromMock = vi.fn(() => ({ where: whereMock }));
vi.mock('@/db', () => ({
  db: { select: () => ({ from: fromMock }) },
}));

import { listTrips } from './trips';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listTrips', () => {
  it('returns the rows for the given student, ordered by the chain', async () => {
    const rows = [
      { id: 2, studentId: 5, tripDate: '2026-02-01' },
      { id: 1, studentId: 5, tripDate: '2026-01-01' },
    ];
    orderByMock.mockResolvedValue(rows);

    const result = await listTrips(5);

    expect(result).toBe(rows);
    // Ownership filter is applied (where clause) and an ordering is requested.
    expect(whereMock).toHaveBeenCalledOnce();
    expect(orderByMock).toHaveBeenCalledOnce();
  });

  it('returns an empty array when the student has no trips', async () => {
    orderByMock.mockResolvedValue([]);
    const result = await listTrips(99);
    expect(result).toEqual([]);
  });
});
