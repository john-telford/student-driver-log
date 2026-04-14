import { auth } from '@/auth';
import { db } from '@/db';
import { users, trips, type UserType } from '@/db/schema';
import { eq, and, desc, sum } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';

// Illinois learner permit requirements
const TOTAL_REQUIRED_MIN = 50 * 60;   // 3000 min
const NIGHT_REQUIRED_MIN = 10 * 60;   // 600 min

const locationLabels: Record<string, string> = {
  highway: 'Highway', residential: 'Residential', rural: 'Rural',
  urban: 'Urban', parking_lot: 'Parking Lot', race_track: 'Race Track',
};

function formatHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function formatMinutes(min: number): string {
  if (min === 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function remainingHours(current: number, required: number): string {
  const rem = Math.max(0, required - current);
  const h = Math.floor(rem / 60);
  const m = rem % 60;
  if (rem === 0) return 'Complete';
  if (h === 0) return `${m}m left`;
  if (m === 0) return `${h}h left`;
  return `${h}h ${m}m left`;
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

  // Resolve selected student (cookie for parents, self for students)
  let selectedStudentId: number | null = null;
  let selectedStudentName: string | null = null;
  if (userType === 'parent') {
    const jar = await cookies();
    const cookieVal = jar.get('selected_student_id')?.value;
    if (cookieVal) {
      const studentId = Number(cookieVal);
      const [student] = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(and(eq(users.id, studentId), eq(users.parentId, userId)));
      if (student) {
        selectedStudentId = studentId;
        selectedStudentName = student.name;
      }
    }
  } else {
    selectedStudentId = userId;
  }

  // Aggregate totals
  let totalDaytime = 0;
  let totalNighttime = 0;
  if (selectedStudentId) {
    const [totals] = await db
      .select({
        daytime: sum(trips.daytimeMinutes),
        nighttime: sum(trips.nighttimeMinutes),
      })
      .from(trips)
      .where(eq(trips.studentId, selectedStudentId));
    totalDaytime = Number(totals?.daytime ?? 0);
    totalNighttime = Number(totals?.nighttime ?? 0);
  }
  const grandTotal = totalDaytime + totalNighttime;

  const totalPct = Math.min(100, Math.round((grandTotal / TOTAL_REQUIRED_MIN) * 100));
  const nightPct = Math.min(100, Math.round((totalNighttime / NIGHT_REQUIRED_MIN) * 100));

  // Recent trips (last 5)
  const recentTrips = selectedStudentId
    ? await db
        .select()
        .from(trips)
        .where(eq(trips.studentId, selectedStudentId))
        .orderBy(desc(trips.tripDate), desc(trips.id))
        .limit(5)
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {name}.</p>
      </div>

      {/* Parent: student list */}
      {userType === 'parent' && (
        <div className="rounded border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide text-foreground">Students</h2>
            <Link
              href="/students/new"
              className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
            >
              + Add a Student
            </Link>
          </div>
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
              No students yet.{' '}
              <Link href="/students/new" className="font-semibold text-primary hover:underline">
                Add one to get started.
              </Link>
            </p>
          )}
        </div>
      )}

      {/* Hour totals + progress */}
      {selectedStudentId ? (
        <div className="rounded border border-border bg-card p-6 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-foreground">
            Progress{selectedStudentName ? ` — ${selectedStudentName}` : ''}
          </h2>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Daytime', value: formatHMM(totalDaytime) },
              { label: 'Nighttime', value: formatHMM(totalNighttime) },
              { label: 'Total', value: formatHMM(grandTotal) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded border border-border p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-black tabular-nums text-foreground">{value}</p>
              </div>
            ))}
          </div>

          {/* 50-hour progress */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">50-Hour Requirement</p>
              <p className="text-xs text-muted-foreground">{remainingHours(grandTotal, TOTAL_REQUIRED_MIN)}</p>
            </div>
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${totalPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{totalPct}% of 50:00</p>
          </div>

          {/* 10-hour night progress */}
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">10-Hour Night Requirement</p>
              <p className="text-xs text-muted-foreground">{remainingHours(totalNighttime, NIGHT_REQUIRED_MIN)}</p>
            </div>
            <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${nightPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{nightPct}% of 10:00</p>
          </div>
        </div>
      ) : (
        <div className="rounded border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Select a student to view progress.
        </div>
      )}

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
