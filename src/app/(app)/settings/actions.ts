'use server';

import { auth, signOut } from '@/auth';
import { db } from '@/db';
import { passwordResetTokens, trips, users } from '@/db/schema';
import { eq, inArray, or } from 'drizzle-orm';

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

  const parentId = Number(session.user.id);
  // Subqueries run per statement, so the children go before the students
  // they are found through.
  const studentIds = db.select({ id: users.id }).from(users).where(eq(users.parentId, parentId));
  const familyIds = db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.id, parentId), eq(users.parentId, parentId)));

  // The ON DELETE CASCADE foreign keys would remove all of this on their own;
  // deleting each table explicitly keeps the privacy policy's promise even if
  // FK enforcement is ever off. A libsql batch runs as one transaction (BEGIN …
  // COMMIT, rolled back on any error); db.transaction() is avoided because
  // libsql opens a fresh connection afterwards, which empties a :memory: DB.
  await db.batch([
    db.delete(passwordResetTokens).where(inArray(passwordResetTokens.userId, familyIds)),
    db
      .delete(trips)
      .where(or(inArray(trips.studentId, familyIds), inArray(trips.createdBy, familyIds))),
    db.delete(users).where(inArray(users.id, studentIds)),
    db.delete(users).where(eq(users.id, parentId)),
  ]);

  // signOut redirects — throws NEXT_REDIRECT, which propagates normally.
  await signOut({ redirectTo: '/register' });
}
