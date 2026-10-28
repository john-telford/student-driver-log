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

const PERSONAL = "Password can't contain the student's name or email address.";

describe('addStudentAction password rule', () => {
  it('rejects a common password and creates no student', async () => {
    const res = await addStudentAction(undefined, form('Jimmy Lee', 'jimmy@example.com', 'ILOVEYOU'));
    expect(res).toEqual({ errors: { password: 'That password is too common. Choose something harder to guess.' } });
    expect(await studentExists('jimmy@example.com')).toBe(false);
  });

  // The name and email fixtures share no 4+ character piece, so each test
  // pins one of the two checks.
  it("rejects a password containing the student's name", async () => {
    const res = await addStudentAction(undefined, form('Jimmy Lee', 'jl@example.com', 'Jimmy-drives-2026'));
    expect(res).toEqual({ errors: { password: PERSONAL } });
    expect(await studentExists('jl@example.com')).toBe(false);
  });

  it("rejects a password containing the student's email local part", async () => {
    const res = await addStudentAction(undefined, form('Jimmy Lee', 'roadrunner@example.com', 'my-roadrunner-1'));
    expect(res).toEqual({ errors: { password: PERSONAL } });
    expect(await studentExists('roadrunner@example.com')).toBe(false);
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

  it('logs student.added for a new student and a duplicate email, without the email', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await addStudentAction(undefined, form('Kim Lee', 'kim@example.com', 'gravel-lantern-42'));
    await addStudentAction(undefined, form('Kim Lee', 'kim@example.com', 'gravel-lantern-42'));
    const lines = warn.mock.calls.map((c) => String(c[0])).filter((l) => l.startsWith('SEC '));
    const events = lines.map((l) => JSON.parse(l.slice(4)));
    expect(events).toEqual([
      expect.objectContaining({ event: 'student.added', userId: 1, outcome: 'created' }),
      expect.objectContaining({ event: 'student.added', userId: 1, outcome: 'duplicate_email' }),
    ]);
    expect(events[0].account).toMatch(/^[0-9a-f]{12}$/);
    expect(events[0].account).toBe(events[1].account);
    expect(lines.join('\n')).not.toContain('kim@example.com');
    warn.mockRestore();
  });
});
