import { renderToBuffer } from '@react-pdf/renderer';
import { db } from '@/db';
import { trips } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ReportDocument } from './document';

// Shared by the web PDF route (session-cookie auth) and the `/api/v1/report/pdf`
// route (Bearer auth) — each resolves its own studentId/studentName/parentName
// per its own auth model, then hands off here for the actual PDF bytes.
export async function buildReportPdf(
  studentId: number,
  studentName: string | null,
  parentName: string | null
): Promise<{ buffer: Buffer; filename: string }> {
  const tripRows = await db
    .select()
    .from(trips)
    .where(eq(trips.studentId, studentId))
    .orderBy(trips.tripDate, trips.id);

  let runningDay = 0;
  let runningNight = 0;
  const rows = tripRows.map((trip) => {
    runningDay += trip.daytimeMinutes;
    runningNight += trip.nighttimeMinutes;
    return { ...trip, runningDay, runningNight, grandTotal: runningDay + runningNight };
  });

  const printedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const buffer = await renderToBuffer(
    <ReportDocument
      rows={rows}
      studentName={studentName}
      parentName={parentName}
      totalDay={runningDay}
      totalNight={runningNight}
      printedDate={printedDate}
    />
  );

  const slug = studentName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const filename = `driving-log-${slug || 'report'}.pdf`;

  return { buffer, filename };
}
