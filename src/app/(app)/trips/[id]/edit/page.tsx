import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, type UserType } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import EditTripForm from './edit-trip-form';

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const tripId = Number(idParam);
  if (isNaN(tripId)) notFound();

  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, userType: userTypeRaw } = session.user;
  const userType = userTypeRaw as UserType;
  const userId = Number(id);

  let studentId: number;
  if (userType === 'parent') {
    const jar = await cookies();
    const cookieVal = jar.get('selected_student_id')?.value;
    if (!cookieVal) redirect('/trips');
    studentId = Number(cookieVal);
    // Verify student belongs to this parent
    const [student] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.parentId, userId)));
    if (!student) redirect('/trips');
  } else {
    studentId = userId;
  }

  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.studentId, studentId)));

  if (!trip) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/trips"
          className="text-xs font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground"
        >
          ← Trips
        </Link>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Edit Trip</h1>
      </div>
      <div className="rounded border border-border bg-card p-6">
        <EditTripForm trip={trip} />
      </div>
    </div>
  );
}
