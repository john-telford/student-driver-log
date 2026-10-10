import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { fileURLToPath } from 'node:url';

// Registration applies the password rule with the new account's name and
// email. Runs against an in-memory DB; only the post-signup sign-in is stubbed.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});
const signIn = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock('@/auth', () => ({ signIn }));

import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { registerAction } from './actions';

beforeAll(async () => {
  if (process.env.DATABASE_URL !== ':memory:') throw new Error('refusing to run against a real database');
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../drizzle', import.meta.url)) });
});

beforeEach(() => {
  signIn.mockClear();
});

function form(name: string, email: string, password: string): FormData {
  const f = new FormData();
  f.set('name', name);
  f.set('email', email);
  f.set('password', password);
  return f;
}

async function userExists(email: string) {
  return (await db.select().from(users).where(eq(users.email, email))).length > 0;
}

describe('registerAction password rule', () => {
  it('rejects a common password and creates no account', async () => {
    const res = await registerAction(undefined, form('Pat Lee', 'pat@example.com', 'Football'));
    expect(res).toEqual({ errors: { password: 'That password is too common. Choose something harder to guess.' } });
    expect(await userExists('pat@example.com')).toBe(false);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("rejects a password containing the user's name", async () => {
    const res = await registerAction(undefined, form('Pat Morgan', 'pat@example.com', 'morgan-river-9'));
    expect(res).toEqual({ errors: { password: "Password can't contain your name or email address." } });
    expect(await userExists('pat@example.com')).toBe(false);
  });

  it("rejects a password containing the email's local part", async () => {
    const res = await registerAction(undefined, form('Pat Lee', 'driverdad@example.com', 'x-DriverDad-1'));
    expect(res).toEqual({ errors: { password: "Password can't contain your name or email address." } });
  });

  it('still enforces the 8-character minimum', async () => {
    const res = await registerAction(undefined, form('Pat Lee', 'pat@example.com', 'k7#vQ2m'));
    expect(res).toEqual({ errors: { password: 'Password must be at least 8 characters.' } });
  });

  it('creates the account and signs in with an acceptable password', async () => {
    const res = await registerAction(undefined, form('Pat Lee', 'pat@example.com', 'gravel-lantern-42'));
    expect(res).toBeUndefined();
    expect(await userExists('pat@example.com')).toBe(true);
    expect(signIn).toHaveBeenCalledOnce();
  });
});
