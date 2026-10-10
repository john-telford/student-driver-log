import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CredentialsSignin } from 'next-auth';

// The login action doesn't count attempts itself (authorizeCredentials does,
// once per attempt; src/auth.test.ts drives that through Auth.js's own
// callback). It only maps what signIn throws to a message.
vi.hoisted(() => {
  process.env.DATABASE_URL = ':memory:';
});
const signIn = vi.hoisted(() => vi.fn());
vi.mock('@/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/auth')>()),
  signIn,
}));

import { RateLimitedSignin } from '@/auth';
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
  it('says to wait when authorize reports the sign-in is rate limited', async () => {
    signIn.mockRejectedValue(new RateLimitedSignin());
    expect(await loginAction(undefined, form())).toEqual({
      error: 'Too many login attempts. Please try again in a few minutes.',
    });
  });

  it('reports invalid credentials for any other sign-in failure', async () => {
    signIn.mockRejectedValue(new CredentialsSignin());
    expect(await loginAction(undefined, form())).toEqual({ error: 'Invalid email or password.' });
  });

  it('rethrows non-auth errors such as the success redirect', async () => {
    const redirectError = new Error('NEXT_REDIRECT');
    signIn.mockRejectedValue(redirectError);
    await expect(loginAction(undefined, form())).rejects.toBe(redirectError);
  });
});
