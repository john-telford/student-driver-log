'use server';

import { AuthError } from 'next-auth';
import { signIn, RateLimitedSignin } from '@/auth';

export type LoginState = { error: string } | undefined;

// Failed attempts are counted and limited in authorizeCredentials (src/auth.ts),
// which signIn() calls; counting here as well would charge each failed attempt
// twice.
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof RateLimitedSignin) {
      return { error: 'Too many login attempts. Please try again in a few minutes.' };
    }
    if (error instanceof AuthError) {
      return { error: 'Invalid email or password.' };
    }
    throw error;
  }
}
