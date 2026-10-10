import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CredentialsSignin } from 'next-auth';

// The login action no longer counts failures itself (authorizeCredentials
// does, see src/auth.test.ts); it only maps what signIn throws to a message.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});
const signIn = vi.hoisted(() => vi.fn());
vi.mock('@/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/auth')>()),
  signIn,
}));

import { RateLimitedSignin } from '@/auth';
import { isRateLimited } from '@/lib/rate-limit';
import { loginAction } from './actions';

function form(): FormData {
  const f = new FormData();
  f.set('email', 'x@example.com');
  f.set('password', 'not-it');
  return f;
}

beforeEach(() => {
  signIn.mockReset();
});

describe('loginAction', () => {
  it('says to wait when authorize reports the IP is rate limited', async () => {
    signIn.mockRejectedValue(new RateLimitedSignin());
    expect(await loginAction(undefined, form())).toEqual({
      error: 'Too many login attempts. Please try again in a few minutes.',
    });
  });

  it('reports invalid credentials for any other sign-in failure', async () => {
    signIn.mockRejectedValue(new CredentialsSignin());
    expect(await loginAction(undefined, form())).toEqual({ error: 'Invalid email or password.' });
  });

  it('does not count failures itself, so one failed attempt is counted once', async () => {
    signIn.mockRejectedValue(new CredentialsSignin());
    for (let i = 0; i < 6; i++) await loginAction(undefined, form());
    expect(isRateLimited('127.0.0.1')).toBe(false);
    expect(isRateLimited('web:127.0.0.1')).toBe(false);
  });

  it('rethrows non-auth errors such as the success redirect', async () => {
    const redirectError = new Error('NEXT_REDIRECT');
    signIn.mockRejectedValue(redirectError);
    await expect(loginAction(undefined, form())).rejects.toBe(redirectError);
  });
});
