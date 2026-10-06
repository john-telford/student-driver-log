import { describe, it, expect, beforeAll, vi } from 'vitest';
import { fileURLToPath } from 'node:url';

// The privacy policy and /support promise that deleting a parent account also
// deletes its student accounts and every driving session. That rests on the
// ON DELETE CASCADE foreign keys in the schema, so exercise it for real
// against an in-memory DB; only the session and the redirect are stubbed.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});
const session = vi.hoisted(() => ({ user: { id: '1', userType: 'parent' } }));
vi.mock('@/auth', () => ({
  auth: async () => session,
  signOut: vi.fn(async () => undefined),
}));

import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, trips, users } from '@/db/schema';
import { deleteAccountAction } from './actions';

const trip = { tripDate: '2026-08-01', locationType: 'residential', weather: 'clear', daytimeMinutes: 30 } as const;

beforeAll(async () => {
  // This test migrates and deletes; never let it run against a real database.
  if (process.env.DATABASE_URL !== ':memory:') throw new Error('refusing to run against a real database');
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../drizzle', import.meta.url)) });
  await db.insert(users).values([
    { id: 1, email: 'p@example.com', passwordHash: 'x', name: 'Parent', userType: 'parent' },
    { id: 2, email: 's1@example.com', passwordHash: 'x', name: 'Student A', userType: 'student', parentId: 1 },
    { id: 3, email: 's2@example.com', passwordHash: 'x', name: 'Student B', userType: 'student', parentId: 1 },
    { id: 4, email: 'other@example.com', passwordHash: 'x', name: 'Other Parent', userType: 'parent' },
    { id: 5, email: 's3@example.com', passwordHash: 'x', name: 'Student C', userType: 'student', parentId: 4 },
  ]);
  await db.insert(trips).values([
    { ...trip, studentId: 2, createdBy: 1 },
    { ...trip, studentId: 3, createdBy: 3 },
    { ...trip, studentId: 5, createdBy: 5 },
  ]);
  await db.insert(passwordResetTokens).values({ userId: 2, tokenHash: 'h', expiresAt: '2099-01-01' });
});

describe('deleteAccountAction', () => {
  it('refuses without the typed confirmation', async () => {
    const form = new FormData();
    form.set('confirm', 'delete');
    expect(await deleteAccountAction(undefined, form)).toEqual({ error: 'Type DELETE exactly to confirm.' });
    expect(await db.select().from(users)).toHaveLength(5);
  });

  // The copy says only a parent deletes accounts; a student session must not.
  it('refuses a student session', async () => {
    session.user = { id: '2', userType: 'student' };
    const form = new FormData();
    form.set('confirm', 'DELETE');
    try {
      expect(await deleteAccountAction(undefined, form)).toEqual({ error: 'Not authorized.' });
    } finally {
      session.user = { id: '1', userType: 'parent' };
    }
    expect(await db.select().from(users)).toHaveLength(5);
  });

  it("deletes the parent, its students, their trips and tokens, and nobody else's", async () => {
    const form = new FormData();
    form.set('confirm', 'DELETE');
    await deleteAccountAction(undefined, form);

    expect((await db.select().from(users)).map((u) => u.id).sort()).toEqual([4, 5]);
    expect((await db.select().from(trips)).map((t) => t.studentId)).toEqual([5]);
    expect(await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.userId, 2))).toEqual([]);
  });
});

// Production FKs cascade, but the action deletes each table itself so the
// policy holds even without them, and does it in one transaction.
describe('deleteAccountAction without relying on the cascade', () => {
  const confirmed = () => {
    const form = new FormData();
    form.set('confirm', 'DELETE');
    return form;
  };
  const asParent = async (id: number, run: () => Promise<unknown>) => {
    session.user = { id: String(id), userType: 'parent' };
    try {
      return await run();
    } finally {
      session.user = { id: '1', userType: 'parent' };
    }
  };

  it('deletes tokens, trips, students and the parent explicitly with FK enforcement off', async () => {
    await db.insert(users).values([
      { id: 10, email: 'p10@example.com', passwordHash: 'x', name: 'Parent 10', userType: 'parent' },
      { id: 11, email: 's11@example.com', passwordHash: 'x', name: 'Student 11', userType: 'student', parentId: 10 },
      { id: 12, email: 's12@example.com', passwordHash: 'x', name: 'Student 12', userType: 'student', parentId: 10 },
    ]);
    await db.insert(trips).values([
      { ...trip, studentId: 11, createdBy: 10 },
      { ...trip, studentId: 12, createdBy: 12 },
    ]);
    await db.insert(passwordResetTokens).values([
      { userId: 10, tokenHash: 'h10', expiresAt: '2099-01-01' },
      { userId: 11, tokenHash: 'h11', expiresAt: '2099-01-01' },
    ]);

    await db.run(sql`PRAGMA foreign_keys = OFF`);
    try {
      await asParent(10, () => deleteAccountAction(undefined, confirmed()));
    } finally {
      await db.run(sql`PRAGMA foreign_keys = ON`);
    }

    expect((await db.select().from(users)).map((u) => u.id).sort()).toEqual([4, 5]);
    expect((await db.select().from(trips)).map((t) => t.studentId)).toEqual([5]);
    expect(await db.select().from(passwordResetTokens)).toEqual([]);
  });

  it('rolls back every delete when one fails', async () => {
    await db.insert(users).values([
      { id: 30, email: 'p30@example.com', passwordHash: 'x', name: 'Parent 30', userType: 'parent' },
      { id: 31, email: 's31@example.com', passwordHash: 'x', name: 'Student 31', userType: 'student', parentId: 30 },
    ]);
    await db.insert(trips).values({ ...trip, studentId: 31, createdBy: 30 });
    await db.insert(passwordResetTokens).values({ userId: 31, tokenHash: 'h31', expiresAt: '2099-01-01' });

    // Fail the last statement (the parent row) after the children are gone.
    await db.run(sql.raw(
      "CREATE TRIGGER block_parent_30 BEFORE DELETE ON users WHEN old.id = 30 BEGIN SELECT RAISE(ABORT, 'blocked'); END",
    ));
    try {
      await expect(asParent(30, () => deleteAccountAction(undefined, confirmed()))).rejects.toThrow();
    } finally {
      await db.run(sql`DROP TRIGGER block_parent_30`);
    }

    expect((await db.select().from(users)).map((u) => u.id).sort((a, b) => a - b)).toEqual([4, 5, 30, 31]);
    expect((await db.select().from(trips)).map((t) => t.studentId).sort((a, b) => a - b)).toEqual([5, 31]);
    expect((await db.select().from(passwordResetTokens)).map((t) => t.userId)).toEqual([31]);
  });
});
