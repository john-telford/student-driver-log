'use server';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { signIn } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';

export type RegisterState = { errors: Record<string, string> } | undefined;

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get('name') as string)?.trim();
  const username = (formData.get('username') as string)?.trim();
  const password = (formData.get('password') as string) ?? '';

  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Name is required.';
  if (!username || username.length < 3 || username.length > 32) {
    errors.username = 'Username must be 3 to 32 characters.';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username may only contain letters, numbers, and underscores.';
  }
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (Object.keys(errors).length > 0) return { errors };

  // Check uniqueness
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username));

  if (existing) {
    return { errors: { username: 'That username is already taken.' } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    username,
    passwordHash,
    name,
    userType: 'parent',
  });

  // Sign in immediately after registering
  try {
    await signIn('credentials', {
      username,
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
