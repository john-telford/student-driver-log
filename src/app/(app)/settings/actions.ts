'use server';

import { auth, signOut } from '@/auth';
import { actionIp, securityEvent } from '@/lib/security-event';
import { deleteAccount } from '@/services/accounts';

export type DeleteAccountState = { error: string } | undefined;

export async function deleteAccountAction(
  _prev: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const session = await auth();
  if (!session?.user?.id || session.user.userType !== 'parent') {
    // The form is only shown to parents, so a signed-in student here means a
    // hand-crafted action call.
    if (session?.user?.id) {
      securityEvent('web.forbidden', { surface: 'web', ip: await actionIp(), userId: Number(session.user.id), outcome: 'delete_account' });
    }
    return { error: 'Not authorized.' };
  }

  const confirm = formData.get('confirm') as string;
  if (confirm !== 'DELETE') {
    return { error: 'Type DELETE exactly to confirm.' };
  }

  const parentId = Number(session.user.id);
  // Deletes the parent, every student account, and every trip in the family.
  await deleteAccount({ userId: parentId, userType: 'parent' });
  securityEvent('account.deleted', { surface: 'web', ip: await actionIp(), userId: parentId });

  // signOut redirects — throws NEXT_REDIRECT, which propagates normally.
  await signOut({ redirectTo: '/register' });
}
