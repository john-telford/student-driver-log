import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { auth } from '@/auth';
import { db } from '@/db';
import { trips, users, type UserType } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { resolveSelectedStudentId } from '@/app/(app)/actions';
import { ReportDocument } from './document';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id, userType: userTypeRaw } = session.user;
  const userType = userTypeRaw as UserType;
  const userId = Number(id);

  let studentId: number;
  let studentName: string | null = null;
  let parentName: string | null = null;

  if (userType === 'parent') {
    const resolved = await resolveSelectedStudentId(userId);
    if (!resolved) {
      return new NextResponse('No student selected', { status: 400 });
    }
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

  const filename = `driving-log-${studentName?.toLowerCase().replace(/\s+/g, '-') ?? 'report'}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
