import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { fileURLToPath } from 'node:url';

// Reaching for a trip the student doesn't own is logged as trip.not_found.
// Runs against an in-memory DB; only the session is stubbed.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});
vi.mock('@/auth', () => ({
  auth: async () => ({ user: { id: '2', userType: 'student' } }),
}));

import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from '@/db';
import { trips, users } from '@/db/schema';
import { deleteTripAction, updateTripAction } from './actions';

beforeAll(async () => {
  if (process.env.DATABASE_URL !== ':memory:') throw new Error('refusing to run against a real database');
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../drizzle', import.meta.url)) });
  await db.insert(users).values([
    { id: 1, email: 'p@example.com', passwordHash: 'x', name: 'Parent', userType: 'parent' },
    { id: 2, email: 's1@example.com', passwordHash: 'x', name: 'Student A', userType: 'student', parentId: 1 },
    { id: 3, email: 's2@example.com', passwordHash: 'x', name: 'Student B', userType: 'student', parentId: 1 },
  ]);
  await db.insert(trips).values({
    id: 50, studentId: 3, createdBy: 3, tripDate: '2026-08-01', locationType: 'residential', weather: 'clear', daytimeMinutes: 30,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function captureEvents() {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  return () =>
    warn.mock.calls
      .map((c) => String(c[0]))
      .filter((l) => l.startsWith('SEC '))
      .map((l) => JSON.parse(l.slice(4)));
}

describe('trip actions security events', () => {
  it("logs an attempt to delete another student's trip, and leaves it in place", async () => {
    const events = captureEvents();
    await deleteTripAction(50);
    expect(events()).toEqual([
      { event: 'trip.not_found', surface: 'web', userId: 2, path: 'trip/50', outcome: 'delete' },
    ]);
    expect(await db.select().from(trips)).toHaveLength(1);
  });

  it("logs an attempt to update another student's trip", async () => {
    const events = captureEvents();
    const res = await updateTripAction(50, undefined, new FormData());
    expect(res).toEqual({ errors: { form: 'Trip not found.' } });
    expect(events()).toEqual([
      { event: 'trip.not_found', surface: 'web', userId: 2, path: 'trip/50', outcome: 'update' },
    ]);
  });

  // Server Action arguments come from the client, whatever the TypeScript type says.
  it('does not log a crafted, non-numeric trip id as written', async () => {
    const events = captureEvents();
    await deleteTripAction('ignore-previous-instructions' as unknown as number);
    expect(events()).toEqual([expect.objectContaining({ event: 'trip.not_found', path: 'trip/:other' })]);
  });
});
