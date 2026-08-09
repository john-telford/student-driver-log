'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createTrip } from '@/services/trips';
import { ValidationError } from '@/services/errors';

export type TripFormState = {
  success?: true;
  errors?: {
    tripDate?: string;
    locationType?: string;
    weather?: string;
    minutes?: string;
    notes?: string;
    form?: string;
  };
};

export async function createTripAction(
  _prev: TripFormState | undefined,
  formData: FormData
): Promise<TripFormState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id: sessionId, userType } = session.user;
  const createdBy = Number(sessionId);

  // Determine studentId from cookie (parents) or self (students)
  let studentId: number;
  if (userType === 'parent') {
    const allStudents = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.parentId, createdBy));
    if (allStudents.length === 0) return { errors: { form: 'No students found. Add a student first.' } };

    const jar = await cookies();
    const cookieVal = jar.get('selected_student_id')?.value;
    const cookieId = cookieVal ? Number(cookieVal) : null;
    // Mirror nav fallback: cookie → first student
    const selected = allStudents.find((s) => s.id === cookieId) ?? allStudents[0];
    studentId = selected.id;
  } else {
    studentId = createdBy;
  }

  // Clamp + round minutes to a whole 0–600 as input normalization (preserves
  // the existing web UX of silently accepting out-of-range spinner values;
  // rounding keeps the service's whole-minute rule from ever firing on the web),
  // then delegate all validation + the insert to the shared service.
  const daytimeMinutes = Math.round(Math.max(0, Math.min(600, Number(formData.get('daytimeMinutes') ?? 0))));
  const nighttimeMinutes = Math.round(Math.max(0, Math.min(600, Number(formData.get('nighttimeMinutes') ?? 0))));

  try {
    await createTrip(
      {
        tripDate: (formData.get('tripDate') as string | null)?.trim() ?? '',
        locationType: formData.get('locationType'),
        weather: formData.get('weather'),
        daytimeMinutes,
        nighttimeMinutes,
        notes: (formData.get('notes') as string | null)?.trim() ?? '',
      },
      { studentId, createdBy }
    );
  } catch (err) {
    if (err instanceof ValidationError && err.fields) {
      return { errors: err.fields as TripFormState['errors'] };
    }
    throw err;
  }

  return { success: true };
}
