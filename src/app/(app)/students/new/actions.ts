'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/password';

export type AddStudentState = {
  errors?: {
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  };
};

export async function addStudentAction(
  _prev: AddStudentState | undefined,
  formData: FormData
): Promise<AddStudentState> {
  const session = await auth();
  if (!session?.user || session.user.userType !== 'parent') {
    return { errors: { form: 'Unauthorized.' } };
  }

  const name = (formData.get('name') as string).trim();
  const email = (formData.get('email') as string).trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!name) return { errors: { name: 'Name is required.' } };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { errors: { email: 'Enter a valid email.' } };
  const passwordError = validatePassword(password, { name, email, forStudent: true });
  if (passwordError) return { errors: { password: passwordError } };

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) return { errors: { email: 'That email is already in use.' } };

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({
    name,
    email,
    passwordHash,
    userType: 'student',
    parentId: Number(session.user.id),
  });

  redirect('/dashboard');
}
