'use server';

import { auth, signOut } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type DeleteAccountState = { error: string } | undefined;

export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const session = await auth();
  if (!session?.user?.id || session.user.userType !== 'parent') {
    return { error: 'Not authorized.' };
  }

  const confirm = formData.get('confirm') as string;
  if (confirm !== 'DELETE') {
    return { error: 'Type DELETE exactly to confirm.' };
  }

  await db.delete(users).where(eq(users.id, Number(session.user.id)));

  // Cascade deletes all student accounts and their trips.
  // signOut redirects — throws NEXT_REDIRECT, which propagates normally.
  await signOut({ redirectTo: '/register' });
}
