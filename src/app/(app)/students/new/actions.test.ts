import { describe, it, expect, beforeAll, vi } from 'vitest';
import { fileURLToPath } from 'node:url';

// A parent adding a student applies the password rule with the student's name
// and email. Runs against an in-memory DB; only the session and the redirect
// are stubbed.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});
vi.mock('@/auth', () => ({
  auth: async () => ({ user: { id: '1', userType: 'parent' } }),
}));
const redirect = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ redirect }));

import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { addStudentAction } from './actions';

beforeAll(async () => {
  if (process.env.DATABASE_URL !== ':memory:') throw new Error('refusing to run against a real database');
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../../drizzle', import.meta.url)) });
  await db.insert(users).values({ id: 1, email: 'p@example.com', passwordHash: 'x', name: 'Parent', userType: 'parent' });
});

function form(name: string, email: string, password: string): FormData {
  const f = new FormData();
  f.set('name', name);
  f.set('email', email);
  f.set('password', password);
  return f;
}

async function studentExists(email: string) {
  return (await db.select().from(users).where(eq(users.email, email))).length > 0;
}

describe('addStudentAction password rule', () => {
  it('rejects a common password and creates no student', async () => {
    const res = await addStudentAction(undefined, form('Jimmy Lee', 'jimmy@example.com', 'ILOVEYOU'));
    expect(res).toEqual({ errors: { password: 'That password is too common. Choose something harder to guess.' } });
    expect(await studentExists('jimmy@example.com')).toBe(false);
  });

  it("rejects a password containing the student's name", async () => {
    const res = await addStudentAction(undefined, form('Jimmy Lee', 'jimmy@example.com', 'Jimmy-drives-2026'));
    expect(res).toEqual({ errors: { password: "Password can't contain your name or email address." } });
    expect(await studentExists('jimmy@example.com')).toBe(false);
  });

  it("rejects a password containing the student's email local part", async () => {
    const res = await addStudentAction(undefined, form('Jimmy Lee', 'roadrunner@example.com', 'my-roadrunner-1'));
    expect(res).toEqual({ errors: { password: "Password can't contain your name or email address." } });
  });

  it('still enforces the 8-character minimum', async () => {
    const res = await addStudentAction(undefined, form('Jimmy Lee', 'jimmy@example.com', 'k7#vQ2m'));
    expect(res).toEqual({ errors: { password: 'Password must be at least 8 characters.' } });
  });

  it('creates the student with an acceptable password', async () => {
    await addStudentAction(undefined, form('Jimmy Lee', 'jimmy@example.com', 'gravel-lantern-42'));
    expect(await studentExists('jimmy@example.com')).toBe(true);
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});
