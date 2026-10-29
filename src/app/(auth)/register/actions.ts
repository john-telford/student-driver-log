'use server';

import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { actionIp, securityEvent } from '@/lib/security-event';
import { registerParent } from '@/services/accounts';
import { ValidationError } from '@/services/errors';

export type RegisterState = { errors: Record<string, string> } | undefined;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password') ?? '';

  try {
    await registerParent({ name, email, password });
  } catch (err) {
    if (err instanceof ValidationError) {
      if (err.fields?.email === 'An account with that email already exists.') {
        securityEvent('register', { surface: 'web', ip: await actionIp(), email, outcome: 'duplicate_email' });
      }
      return { errors: err.fields ?? { form: err.message } };
    }
    throw err;
  }
  securityEvent('register', { surface: 'web', ip: await actionIp(), email, outcome: 'created' });

  try {
    await signIn('credentials', {
      email: String(email).trim().toLowerCase(),
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { errors: { form: 'Account created but sign-in failed. Please log in.' } };
    }
    throw error;
  }
}
