'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, locationTypes, weatherConditions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type TripFormState = {
  errors?: {
    studentId?: string;
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

  // Determine studentId
  let studentId: number;
  if (userType === 'parent') {
    const raw = formData.get('studentId');
    if (!raw) return { errors: { studentId: 'Select a student.' } };
    studentId = Number(raw);
    // Verify this student belongs to the logged-in parent
    const [student] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, studentId));
    if (!student) return { errors: { studentId: 'Invalid student.' } };
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

  redirect('/trips?success=1');
}
