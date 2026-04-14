import Link from 'next/link';
import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, type UserType } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TripsTable from './trips-table';

export default async function TripsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, userType: userTypeRaw } = session.user;
  const userType = userTypeRaw as UserType;
  const userId = Number(id);

  let studentId: number;
  let studentName: string | null = null;

  if (userType === 'parent') {
    const jar = await cookies();
    const cookieVal = jar.get('selected_student_id')?.value;
    if (!cookieVal) {
      return (
        <div className="space-y-4">
          <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Trips</h1>
          <div className="rounded border border-border bg-card p-6 text-sm text-muted-foreground">
            Select a student from the nav bar to view their trips.
          </div>
        </div>
      );
    }
    studentId = Number(cookieVal);
    // Verify student belongs to this parent and get name
    const [student] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.parentId, userId)));
    if (!student) {
      return (
        <div className="space-y-4">
          <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Trips</h1>
          <div className="rounded border border-border bg-card p-6 text-sm text-muted-foreground">
            Select a student from the nav bar.
          </div>
        </div>
      );
    }
    studentName = student.name;
  } else {
    studentId = userId;
  }

  const tripRows = await db
    .select()
    .from(trips)
    .where(eq(trips.studentId, studentId))
    .orderBy(desc(trips.tripDate), desc(trips.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Trips</h1>
          {studentName && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {studentName}
            </p>
          )}
        </div>
        <Link
          href="/trips/new"
          className="rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90"
        >
          Log Trip
        </Link>
      </div>

      {tripRows.length === 0 ? (
        <div className="rounded border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No trips logged yet.{' '}
          <Link href="/trips/new" className="font-semibold text-primary hover:underline">
            Log the first one.
          </Link>
        </div>
      ) : (
        <TripsTable trips={tripRows} />
      )}
    </div>
  );
}
