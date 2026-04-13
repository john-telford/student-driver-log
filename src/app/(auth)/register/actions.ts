'use server';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';

export type RegisterState = { errors: Record<string, string> } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string) ?? '';

  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Name is required.';
  if (!email || !EMAIL_RE.test(email)) {
    errors.email = 'A valid email address is required.';
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (Object.keys(errors).length > 0) return { errors };

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    return { errors: { email: 'An account with that email already exists.' } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    email,
    passwordHash,
    name,
    userType: 'parent',
  });

  try {
    await signIn('credentials', {
      email,
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
