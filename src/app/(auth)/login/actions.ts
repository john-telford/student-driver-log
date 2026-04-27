'use server';

import { AuthError } from 'next-auth';
import { headers } from 'next/headers';
import { signIn } from '@/auth';
import { isRateLimited, recordFailure, clearFailures } from '@/lib/rate-limit';

export type LoginState = { error: string } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const hdrs = await headers();
  const ip = (hdrs.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0].trim();

  if (isRateLimited(ip)) {
    return { error: 'Too many login attempts. Please try again in a few minutes.' };
  }

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
    clearFailures(ip);
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailure(ip);
      return { error: 'Invalid email or password.' };
    }
    throw error;
  }
}
