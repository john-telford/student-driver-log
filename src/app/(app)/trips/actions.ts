'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, type UserType } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateTrip } from '@/services/trips';
import { ValidationError, NotFoundError } from '@/services/errors';

export type TripEditState = {
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

/** Resolve the student ID the current user is acting on behalf of. */
async function resolveStudentId(userId: number, userType: UserType): Promise<number | null> {
  if (userType === 'parent') {
    const jar = await cookies();
    const val = jar.get('selected_student_id')?.value;
    if (!val) return null;
    const studentId = Number(val);
    const [student] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.parentId, userId)));
    return student ? studentId : null;
  }
  return userId;
}

export async function deleteTripAction(tripId: number): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = Number(session.user.id);
  const userType = session.user.userType as UserType;

  const studentId = await resolveStudentId(userId, userType);
  if (!studentId) return;

  // Only delete if the trip actually belongs to this student (prevents spoofing)
  await db
    .delete(trips)
    .where(and(eq(trips.id, tripId), eq(trips.studentId, studentId)));
}

export async function updateTripAction(
  tripId: number,
  _prev: TripEditState | undefined,
  formData: FormData
): Promise<TripEditState> {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const userId = Number(session.user.id);
  const userType = session.user.userType as UserType;

  const studentId = await resolveStudentId(userId, userType);
  if (!studentId) return { errors: { form: 'No student selected.' } };

  // Clamp minutes to 0–600 as input normalization (matches createTripAction's
  // pattern from story 1.3), then delegate ownership check + validation +
  // update to the shared service.
  const daytimeMinutes = Math.max(0, Math.min(600, Number(formData.get('daytimeMinutes') ?? 0)));
  const nighttimeMinutes = Math.max(0, Math.min(600, Number(formData.get('nighttimeMinutes') ?? 0)));

  try {
    await updateTrip(
      tripId,
      {
        tripDate: (formData.get('tripDate') as string | null)?.trim() ?? '',
        locationType: formData.get('locationType'),
        weather: formData.get('weather'),
        daytimeMinutes,
        nighttimeMinutes,
        notes: (formData.get('notes') as string | null)?.trim() ?? '',
      },
      { studentId }
    );
  } catch (err) {
    if (err instanceof NotFoundError) {
      return { errors: { form: 'Trip not found.' } };
    }
    if (err instanceof ValidationError && err.fields) {
      return { errors: err.fields as TripEditState['errors'] };
    }
    throw err;
  }

  return { success: true };
}
