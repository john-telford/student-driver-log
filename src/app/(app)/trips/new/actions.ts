'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, locationTypes, weatherConditions } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

  await db.insert(trips).values({
    studentId,
    createdBy,
    tripDate,
    locationType: locationType as typeof locationTypes[number],
    weather: weather as typeof weatherConditions[number],
    daytimeMinutes,
    nighttimeMinutes,
    notes: notes || null,
  });

  return { success: true };
}
