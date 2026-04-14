import { auth } from '@/auth';
import { db } from '@/db';
import { users, trips, type UserType } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import AddStudentForm from './add-student-form';

const locationLabels: Record<string, string> = {
  highway: 'Highway', residential: 'Residential', rural: 'Rural',
  urban: 'Urban', parking_lot: 'Parking Lot', race_track: 'Race Track',
};

function formatMinutes(min: number): string {
  if (min === 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default async function DashboardPage() {
  const session = await auth();
  const { name, userType: userTypeRaw, id } = session!.user;
  const userType = userTypeRaw as UserType;
  const userId = Number(id);

  let students: { id: number; name: string; email: string }[] = [];
  if (userType === 'parent') {
    students = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.parentId, userId));
  }

  // Resolve student for recent trips
  let recentStudentId: number | null = null;
  if (userType === 'parent') {
    const jar = await cookies();
    const cookieVal = jar.get('selected_student_id')?.value;
    if (cookieVal) {
      const studentId = Number(cookieVal);
      const [student] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.id, studentId), eq(users.parentId, userId)));
      if (student) recentStudentId = studentId;
    }
  } else {
    recentStudentId = userId;
  }

  const recentTrips = recentStudentId
    ? await db
        .select()
        .from(trips)
        .where(eq(trips.studentId, recentStudentId))
        .orderBy(desc(trips.tripDate), desc(trips.id))
        .limit(5)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {name}.</p>
      </div>

      {/* Parent: student management */}
      {userType === 'parent' && (
        <div className="rounded border border-border bg-card p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wide text-foreground">
            Students
          </h2>

          {students.length > 0 ? (
            <ul className="space-y-1">
              {students.map((s) => (
                <li key={s.id} className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-foreground">{s.name}</span>
                  <span className="text-muted-foreground">{s.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No students yet. Add one below to start logging trips.
            </p>
          )}

          <div className="border-t border-border pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Add a Student
            </p>
            <AddStudentForm />
          </div>
        </div>
      )}

      {/* Progress summary — built in issue #7 */}
      <div className="rounded border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Hour totals and progress bar coming in issue #7.
      </div>

      {/* Recent trips */}
      <div className="rounded border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Recent Trips</h2>
          <Link href="/trips" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
            View All
          </Link>
        </div>
        {recentTrips.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No trips yet.{' '}
            <Link href="/trips/new" className="font-semibold text-primary hover:underline">
              Log the first one.
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40">
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</th>
                  <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Daytime</th>
                  <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Nighttime</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip, i) => (
                  <tr key={trip.id} className={`border-t border-border ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-2 tabular-nums">{trip.tripDate}</td>
                    <td className="px-4 py-2">{locationLabels[trip.locationType] ?? trip.locationType}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatMinutes(trip.daytimeMinutes)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{formatMinutes(trip.nighttimeMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
