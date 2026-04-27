import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, type UserType } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { resolveSelectedStudentId } from '../actions';
import ReportActions from './print-button';
import { formatHMM } from '@/lib/utils';

const locationLabels: Record<string, string> = {
  highway:     'Highway',
  residential: 'Residential',
  rural:       'Rural',
  urban:       'Urban',
  parking_lot: 'Parking Lot',
  race_track:  'Race Track',
};

const weatherLabels: Record<string, string> = {
  clear: 'Clear',
  rain:  'Rain',
  snow:  'Snow',
  fog:   'Fog',
  ice:   'Ice',
};

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id, userType: userTypeRaw } = session.user;
  const userType = userTypeRaw as UserType;
  const userId = Number(id);

  let studentId: number;
  let studentName: string | null = null;
  let parentName: string | null = null;

  if (userType === 'parent') {
    const resolved = await resolveSelectedStudentId(userId);
    if (!resolved) redirect('/dashboard');
    studentId = resolved;
    const [student] = await db
      .select({ name: users.name })
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.parentId, userId)));
    studentName = student?.name ?? null;
    const [parent] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    parentName = parent?.name ?? null;
  } else {
    studentId = userId;
    const [student] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    studentName = student?.name ?? null;
  }

  const tripRows = await db
    .select()
    .from(trips)
    .where(eq(trips.studentId, studentId))
    .orderBy(desc(trips.tripDate), desc(trips.id));

  // Build rows with running totals
  let runningDay = 0;
  let runningNight = 0;
  const rows = tripRows.map((trip) => {
    runningDay += trip.daytimeMinutes;
    runningNight += trip.nighttimeMinutes;
    return {
      ...trip,
      runningDay,
      runningNight,
      grandTotal: runningDay + runningNight,
    };
  });

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-xl font-black uppercase tracking-wide text-foreground">Driving Log Report</h1>
          {studentName && (
            <p className="text-sm text-muted-foreground mt-0.5">{studentName}</p>
          )}
        </div>
        <ReportActions />
      </div>

      {/* Report — styled for both screen and print */}
      <div className="report-container">
        {/* Header */}
        <div className="mb-6 text-center print:mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground print:text-black">
            Illinois Secretary of State — DSD X 152.4
          </p>
          <h2 className="text-lg font-black uppercase tracking-wide mt-1 text-foreground print:text-black">
            Behind-the-Wheel Driving Log
          </h2>
          <div className="mt-3 flex justify-center gap-8 text-sm print:gap-6">
            <span><span className="font-semibold">Student:</span> {studentName ?? '—'}</span>
            {parentName && <span><span className="font-semibold">Parent/Guardian:</span> {parentName}</span>}
            <span><span className="font-semibold">Printed:</span> {today}</span>
          </div>
        </div>

        {/* Table */}
        {rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8 print:hidden">No trips logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-primary text-white print:bg-black print:text-white">
                  {[
                    'Date',
                    'Location of Practice',
                    'Weather Conditions',
                    'Daytime',
                    'Daytime Total',
                    'Nighttime',
                    'Nighttime Total',
                    'Grand Total',
                    'Initials',
                  ].map((h) => (
                    <th
                      key={h}
                      className="border border-primary/30 px-2 py-2 text-center font-bold uppercase tracking-wider print:border-black"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 1 ? 'bg-muted/30' : ''}>
                    <td className="border border-border px-2 py-1.5 text-center tabular-nums print:border-black">{row.tripDate}</td>
                    <td className="border border-border px-2 py-1.5 print:border-black">{locationLabels[row.locationType] ?? row.locationType}</td>
                    <td className="border border-border px-2 py-1.5 print:border-black">{weatherLabels[row.weather] ?? row.weather}</td>
                    <td className="border border-border px-2 py-1.5 text-center tabular-nums print:border-black">{formatHMM(row.daytimeMinutes)}</td>
                    <td className="border border-border px-2 py-1.5 text-center tabular-nums font-semibold print:border-black">{formatHMM(row.runningDay)}</td>
                    <td className="border border-border px-2 py-1.5 text-center tabular-nums print:border-black">{formatHMM(row.nighttimeMinutes)}</td>
                    <td className="border border-border px-2 py-1.5 text-center tabular-nums font-semibold print:border-black">{formatHMM(row.runningNight)}</td>
                    <td className="border border-border px-2 py-1.5 text-center tabular-nums font-bold print:border-black">{formatHMM(row.grandTotal)}</td>
                    <td className="border border-border px-2 py-1.5 print:border-black">&nbsp;</td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-primary/10 font-bold print:bg-transparent">
                  <td colSpan={3} className="border border-border px-2 py-2 text-right uppercase tracking-wider text-xs print:border-black">
                    Totals
                  </td>
                  <td className="border border-border px-2 py-2 text-center tabular-nums print:border-black">{formatHMM(runningDay)}</td>
                  <td className="border border-border px-2 py-2 text-center print:border-black" />
                  <td className="border border-border px-2 py-2 text-center tabular-nums print:border-black">{formatHMM(runningNight)}</td>
                  <td className="border border-border px-2 py-2 text-center print:border-black" />
                  <td className="border border-border px-2 py-2 text-center tabular-nums print:border-black">{formatHMM(runningDay + runningNight)}</td>
                  <td className="border border-border px-2 py-2 print:border-black" />
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Signature block */}
        <div className="mt-8 grid grid-cols-2 gap-8 text-sm print:mt-6">
          <div>
            <div className="border-b border-foreground/40 pb-1 print:border-black">&nbsp;</div>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider print:text-black">Student Signature</p>
          </div>
          <div>
            <div className="border-b border-foreground/40 pb-1 print:border-black">&nbsp;</div>
            <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider print:text-black">Parent / Guardian Signature</p>
          </div>
        </div>
      </div>
    </>
  );
}
