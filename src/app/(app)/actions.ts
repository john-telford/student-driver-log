'use server';

import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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
    // Verify the student exists AND belongs to this parent — prevents stale
    // cookies from a previous login leaking another parent's student data
    const [student] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.parentId, parentId)));
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
