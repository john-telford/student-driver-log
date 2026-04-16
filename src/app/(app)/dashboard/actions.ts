'use server';

import { signOut } from '@/auth';
import { cookies } from 'next/headers';

export async function logoutAction() {
  // Clear selected student cookie so it doesn't leak to the next login
  const jar = await cookies();
  jar.delete('selected_student_id');
  await signOut({ redirectTo: '/login' });
}
