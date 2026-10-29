import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { fileURLToPath } from 'node:url';
import { vi } from 'vitest';

// The account lifecycle the website and the native API share. Runs against an
// in-memory DB.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});

import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, trips, users } from '@/db/schema';
import { NotFoundError, ValidationError } from './errors';
import {
  assertParentOwnsStudent,
  createStudent,
  deleteAccount,
  listStudents,
  registerParent,
} from './accounts';

beforeAll(async () => {
  if (process.env.DATABASE_URL !== ':memory:') throw new Error('refusing to run against a real database');
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)) });
});

beforeEach(async () => {
  await db.delete(passwordResetTokens);
  await db.delete(trips);
  await db.delete(users);
});

const STRONG = 'granite-orbit-47';

async function seedFamily() {
  const [parent] = await db
    .insert(users)
    .values({ email: 'parent@example.com', passwordHash: 'x', name: 'Pat Parent', userType: 'parent' })
    .returning();
  const [kidA] = await db
    .insert(users)
    .values({ email: 'a@example.com', passwordHash: 'x', name: 'Avery', userType: 'student', parentId: parent.id })
    .returning();
  const [kidB] = await db
    .insert(users)
    .values({ email: 'b@example.com', passwordHash: 'x', name: 'Blake', userType: 'student', parentId: parent.id })
    .returning();
  const trip = { tripDate: '2026-10-01', locationType: 'urban' as const, weather: 'clear' as const, daytimeMinutes: 30 };
  await db.insert(trips).values([
    { ...trip, studentId: kidA.id, createdBy: kidA.id },
    { ...trip, studentId: kidA.id, createdBy: parent.id },
    { ...trip, studentId: kidB.id, createdBy: kidB.id },
  ]);
  await db.insert(passwordResetTokens).values([
    { userId: kidA.id, tokenHash: 'ha', expiresAt: '2099-01-01' },
    { userId: parent.id, tokenHash: 'hp', expiresAt: '2099-01-01' },
  ]);
  return { parent, kidA, kidB };
}

describe('registerParent', () => {
  it('creates a parent account with a normalized email and a hashed password', async () => {
    const user = await registerParent({ name: ' Pat Lee ', email: ' Pat@Example.com ', password: STRONG });
    expect(user).toMatchObject({ name: 'Pat Lee', email: 'pat@example.com', userType: 'parent', parentId: null });
    const [row] = await db.select().from(users).where(eq(users.id, user.id));
    expect(row.passwordHash).not.toBe(STRONG);
    expect(row.passwordHash.startsWith('$2')).toBe(true);
  });

  it('reports every invalid field at once', async () => {
    const err = await registerParent({ name: '', email: 'nope', password: 'short' }).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(Object.keys(err.fields)).toEqual(['name', 'email', 'password']);
  });

  it('rejects a taken email on the email field', async () => {
    await registerParent({ name: 'Pat Lee', email: 'pat@example.com', password: STRONG });
    const err = await registerParent({ name: 'Pat Two', email: 'PAT@example.com', password: STRONG }).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.fields).toEqual({ email: 'An account with that email already exists.' });
  });

  it('ignores non-string input rather than crashing', async () => {
    const err = await registerParent({ name: 42, email: null, password: {} }).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
  });
});

describe('createStudent / listStudents / assertParentOwnsStudent', () => {
  it("adds a student under the parent and lists the parent's students only", async () => {
    const { parent } = await seedFamily();
    const [other] = await db
      .insert(users)
      .values({ email: 'other@example.com', passwordHash: 'x', name: 'Other', userType: 'parent' })
      .returning();
    await createStudent(other.id, { name: 'Casey', email: 'casey@example.com', password: STRONG });

    const created = await createStudent(parent.id, { name: 'Drew', email: 'Drew@Example.com', password: STRONG });
    expect(created).toMatchObject({ name: 'Drew', email: 'drew@example.com' });

    const list = await listStudents(parent.id);
    expect(list.map((s) => s.name)).toEqual(['Avery', 'Blake', 'Drew']);
    expect(list[0]).not.toHaveProperty('passwordHash');
  });

  it("applies the student password rule with the student's name", async () => {
    const { parent } = await seedFamily();
    const err = await createStudent(parent.id, { name: 'Drew Smith', email: 'drew@example.com', password: 'smith-river-9' }).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.fields).toHaveProperty('password');
  });

  it('rejects a taken email', async () => {
    const { parent } = await seedFamily();
    const err = await createStudent(parent.id, { name: 'Dup', email: 'a@example.com', password: STRONG }).catch((e) => e);
    expect(err.fields).toEqual({ email: 'That email is already in use.' });
  });

  it("finds a parent's own student and hides everyone else's", async () => {
    const { parent, kidA } = await seedFamily();
    await expect(assertParentOwnsStudent(parent.id, kidA.id)).resolves.toBeUndefined();
    await expect(assertParentOwnsStudent(parent.id, parent.id)).rejects.toBeInstanceOf(NotFoundError);
    await expect(assertParentOwnsStudent(parent.id + 999, kidA.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('deleteAccount', () => {
  it('a student removes only themselves, their trips and their reset tokens', async () => {
    const { parent, kidA, kidB } = await seedFamily();
    await deleteAccount({ userId: kidA.id, userType: 'student' });

    const remaining = await db.select({ id: users.id }).from(users);
    expect(remaining.map((r) => r.id).sort()).toEqual([parent.id, kidB.id].sort());
    const tripRows = await db.select().from(trips);
    expect(tripRows.every((t) => t.studentId === kidB.id)).toBe(true);
    expect(tripRows).toHaveLength(1);
    const tokens = await db.select().from(passwordResetTokens);
    expect(tokens.map((t) => t.userId)).toEqual([parent.id]);
  });

  it('a student id with a parent role claim cannot delete a parent', async () => {
    const { parent } = await seedFamily();
    await expect(deleteAccount({ userId: parent.id, userType: 'student' })).rejects.toBeInstanceOf(NotFoundError);
    expect(await db.select().from(users).where(eq(users.id, parent.id))).toHaveLength(1);
    expect(await db.select().from(trips)).toHaveLength(3);
    expect(await db.select().from(passwordResetTokens)).toHaveLength(2);
  });

  it('a parent removes the whole family', async () => {
    const { parent } = await seedFamily();
    const [other] = await db
      .insert(users)
      .values({ email: 'other@example.com', passwordHash: 'x', name: 'Other', userType: 'parent' })
      .returning();

    await deleteAccount({ userId: parent.id, userType: 'parent' });

    expect((await db.select().from(users)).map((u) => u.id)).toEqual([other.id]);
    expect(await db.select().from(trips)).toHaveLength(0);
    expect(await db.select().from(passwordResetTokens)).toHaveLength(0);
  });
});
