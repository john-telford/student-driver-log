'use server';

import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function selectStudentAction(studentId: number) {
  const jar = await cookies();
  jar.set('selected_student_id', String(studentId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Resolve the effective selected student ID for a parent.
 * Uses the cookie if set; falls back to their first student.
 * Returns null if the parent has no students at all.
 */
export async function resolveSelectedStudentId(parentId: number): Promise<number | null> {
  const jar = await cookies();
  const val = jar.get('selected_student_id')?.value;

  if (val) {
    const studentId = Number(val);
    const [student] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, studentId));
    // Only trust the cookie value if the student actually exists
    if (student) return studentId;
  }

  // No cookie or stale cookie — fall back to first student
  const [first] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.parentId, parentId))
    .limit(1);

  return first?.id ?? null;
}
