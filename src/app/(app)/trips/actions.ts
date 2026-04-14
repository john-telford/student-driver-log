'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, locationTypes, weatherConditions, type UserType } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

  // Verify trip belongs to this student
  const [existing] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.studentId, studentId)));
  if (!existing) return { errors: { form: 'Trip not found.' } };

  // trip_date
  const tripDate = (formData.get('tripDate') as string | null)?.trim() ?? '';
  if (!tripDate) return { errors: { tripDate: 'Date is required.' } };
  if (new Date(tripDate) > new Date()) {
    return { errors: { tripDate: 'Date cannot be in the future.' } };
  }

  // location_type
  const locationType = formData.get('locationType') as string | null;
  if (!locationType || !locationTypes.includes(locationType as never)) {
    return { errors: { locationType: 'Select a location type.' } };
  }

  // weather
  const weather = formData.get('weather') as string | null;
  if (!weather || !weatherConditions.includes(weather as never)) {
    return { errors: { weather: 'Select a weather condition.' } };
  }

  // minutes
  const daytimeMinutes = Math.max(0, Math.min(600, Number(formData.get('daytimeMinutes') ?? 0)));
  const nighttimeMinutes = Math.max(0, Math.min(600, Number(formData.get('nighttimeMinutes') ?? 0)));
  if (daytimeMinutes === 0 && nighttimeMinutes === 0) {
    return { errors: { minutes: 'Enter at least 1 minute of driving time.' } };
  }

  // notes
  const notes = (formData.get('notes') as string | null)?.trim() ?? '';
  if (notes.length > 500) {
    return { errors: { notes: 'Notes must be 500 characters or fewer.' } };
  }

  await db
    .update(trips)
    .set({
      tripDate,
      locationType: locationType as typeof locationTypes[number],
      weather: weather as typeof weatherConditions[number],
      daytimeMinutes,
      nighttimeMinutes,
      notes: notes || null,
    })
    .where(eq(trips.id, tripId));

  return { success: true };
}
