import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the drizzle query chains:
//   select().from().where().orderBy() -> rows   (listTrips)
//   insert().values().returning()     -> [row]  (createTrip)
const orderByMock = vi.fn();
const whereMock = vi.fn(() => ({ orderBy: orderByMock }));
const fromMock = vi.fn(() => ({ where: whereMock }));
const returningMock = vi.fn();
const valuesMock = vi.fn(() => ({ returning: returningMock }));
vi.mock('@/db', () => ({
  db: {
    select: () => ({ from: fromMock }),
    insert: () => ({ values: valuesMock }),
  },
}));

import { listTrips, createTrip } from './trips';
import { ValidationError } from './errors';

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
    expect(whereMock).toHaveBeenCalledOnce();
    expect(orderByMock).toHaveBeenCalledOnce();
  });

  it('returns an empty array when the student has no trips', async () => {
    orderByMock.mockResolvedValue([]);
    const result = await listTrips(99);
    expect(result).toEqual([]);
  });
});

const validInput = {
  tripDate: '2026-01-01',
  locationType: 'highway',
  weather: 'clear',
  daytimeMinutes: 45,
  nighttimeMinutes: 0,
  notes: 'ok',
};
const ctx = { studentId: 5, createdBy: 5 };

describe('createTrip — happy path', () => {
  it('inserts with the context ids and returns the created row', async () => {
    const created = { id: 10, ...validInput, studentId: 5, createdBy: 5 };
    returningMock.mockResolvedValue([created]);

    const result = await createTrip(validInput, ctx);

    expect(result).toBe(created);
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 5,
        createdBy: 5,
        tripDate: '2026-01-01',
        locationType: 'highway',
        weather: 'clear',
        daytimeMinutes: 45,
        nighttimeMinutes: 0,
        notes: 'ok',
      })
    );
  });

  it('coerces empty notes to null', async () => {
    returningMock.mockResolvedValue([{ id: 11 }]);
    await createTrip({ ...validInput, notes: '   ' }, ctx);
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({ notes: null })
    );
  });
});

describe('createTrip — validation (never inserts)', () => {
  const cases: Array<[string, Record<string, unknown>, string, string]> = [
    ['missing date', { ...validInput, tripDate: '' }, 'tripDate', 'Date is required.'],
    [
      'future date',
      { ...validInput, tripDate: '2999-01-01' },
      'tripDate',
      'Date cannot be in the future.',
    ],
    [
      'invalid location',
      { ...validInput, locationType: 'moon' },
      'locationType',
      'Select a location type.',
    ],
    [
      'invalid weather',
      { ...validInput, weather: 'hail' },
      'weather',
      'Select a weather condition.',
    ],
    [
      'minutes over 600',
      { ...validInput, daytimeMinutes: 700 },
      'minutes',
      'Minutes must be between 0 and 600.',
    ],
    [
      'negative minutes',
      { ...validInput, nighttimeMinutes: -5 },
      'minutes',
      'Minutes must be between 0 and 600.',
    ],
    [
      'both zero',
      { ...validInput, daytimeMinutes: 0, nighttimeMinutes: 0 },
      'minutes',
      'Enter at least 1 minute of driving time.',
    ],
    [
      'notes too long',
      { ...validInput, notes: 'x'.repeat(501) },
      'notes',
      'Notes must be 500 characters or fewer.',
    ],
  ];

  it.each(cases)('rejects %s', async (_label, input, field, message) => {
    await expect(createTrip(input, ctx)).rejects.toMatchObject({
      name: 'ValidationError',
      fields: { [field]: message },
    });
    expect(valuesMock).not.toHaveBeenCalled();
  });

  it('throws a ValidationError instance', async () => {
    await expect(
      createTrip({ ...validInput, tripDate: '' }, ctx)
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
