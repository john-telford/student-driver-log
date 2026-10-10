import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { rmSync } from 'node:fs';

// A password reset applies the password rule with the account's own name and
// email, looked up from the reset token. Only the redirect is stubbed.
//
// The action uses db.transaction(), after which libsql opens a fresh
// connection; a :memory: DB would be empty there, so this test uses a
// throwaway file DB in the OS temp directory instead.
const tmpDir = await vi.hoisted(async () => {
  const { mkdtempSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const dir = mkdtempSync(join(tmpdir(), 'reset-password-test-'));
  process.env.DATABASE_URL = `file:${join(dir, 'test.db')}`;
  return dir;
});
const redirect = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ redirect }));

import { migrate } from 'drizzle-orm/libsql/migrator';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { passwordResetTokens, users } from '@/db/schema';
import { resetPasswordAction } from './actions';

const RAW_TOKEN = 'raw-reset-token';
// The name and the email local part share no 4+ character piece, so the name
// test and the email test each pin one of the two checks.

beforeAll(async () => {
  if (!process.env.DATABASE_URL?.startsWith(`file:${tmpDir}`)) throw new Error('refusing to run against a real database');
  await migrate(db, { migrationsFolder: fileURLToPath(new URL('../../../../drizzle', import.meta.url)) });
  await db.insert(users).values({ id: 1, email: 'cm.driver@example.com', passwordHash: 'old-hash', name: 'Casey Morgan', userType: 'parent' });
  await db.insert(passwordResetTokens).values({
    userId: 1,
    tokenHash: createHash('sha256').update(RAW_TOKEN).digest('hex'),
    expiresAt: '2099-01-01T00:00:00.000Z',
  });
});

afterAll(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

beforeEach(() => {
  redirect.mockClear();
});

function form(password: string): FormData {
  const f = new FormData();
  f.set('token', RAW_TOKEN);
  f.set('password', password);
  return f;
}

async function state() {
  const [user] = await db.select().from(users).where(eq(users.id, 1));
  const [token] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.userId, 1));
  return { hash: user.passwordHash, used: token.usedAt };
}

describe('resetPasswordAction password rule', () => {
  it('rejects a common password and leaves the password and token alone', async () => {
    expect(await resetPasswordAction(undefined, form('sunshine'))).toEqual({
      error: 'That password is too common. Choose something harder to guess.',
    });
    expect(await state()).toEqual({ hash: 'old-hash', used: null });
  });

  it("rejects a password containing the account's name", async () => {
    expect(await resetPasswordAction(undefined, form('Morgan-river-9'))).toEqual({
      error: "Password can't contain your name or email address.",
    });
    expect(await state()).toEqual({ hash: 'old-hash', used: null });
  });

  it("rejects a password containing the account's email local part", async () => {
    expect(await resetPasswordAction(undefined, form('night-driver-9'))).toEqual({
      error: "Password can't contain your name or email address.",
    });
    expect(await state()).toEqual({ hash: 'old-hash', used: null });
  });

  it('still enforces the 8-character minimum, including a missing password', async () => {
    const message = { error: 'Password must be at least 8 characters.' };
    expect(await resetPasswordAction(undefined, form('k7#vQ2m'))).toEqual(message);
    const noPassword = new FormData();
    noPassword.set('token', RAW_TOKEN);
    expect(await resetPasswordAction(undefined, noPassword)).toEqual(message);
    expect(await state()).toEqual({ hash: 'old-hash', used: null });
  });

  it('sets an acceptable password and uses up the token', async () => {
    await resetPasswordAction(undefined, form('gravel-lantern-42'));
    const after = await state();
    expect(after.hash).not.toBe('old-hash');
    expect(after.used).not.toBeNull();
    expect(redirect).toHaveBeenCalledWith('/login?reset=1');
  });
});
