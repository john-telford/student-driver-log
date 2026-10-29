'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { actionIp, securityEvent } from '@/lib/security-event';
import { createStudent } from '@/services/accounts';
import { ValidationError } from '@/services/errors';

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
    if (session?.user?.id) {
      securityEvent('web.forbidden', { surface: 'web', ip: await actionIp(), userId: Number(session.user.id), outcome: 'add_student' });
    }
    return { errors: { form: 'Unauthorized.' } };
  }

  const parentId = Number(session.user.id);
  const email = formData.get('email');
  try {
    await createStudent(parentId, {
      name: formData.get('name'),
      email,
      password: formData.get('password'),
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      if (err.fields?.email === 'That email is already in use.') {
        securityEvent('student.added', { surface: 'web', ip: await actionIp(), userId: parentId, email, outcome: 'duplicate_email' });
      }
      return { errors: err.fields ?? { form: err.message } };
    }
    throw err;
  }
  securityEvent('student.added', { surface: 'web', ip: await actionIp(), userId: parentId, email, outcome: 'created' });

  redirect('/dashboard');
}
