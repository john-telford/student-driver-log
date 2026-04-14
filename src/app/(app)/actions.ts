'use server';

import { cookies } from 'next/headers';

export async function selectStudentAction(studentId: number) {
  const jar = await cookies();
  jar.set('selected_student_id', String(studentId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/** Read the selected student id from the cookie (server components only). */
export async function getSelectedStudentId(): Promise<number | null> {
  const jar = await cookies();
  const val = jar.get('selected_student_id')?.value;
  return val ? Number(val) : null;
}
