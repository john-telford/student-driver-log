import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { buildReportPdf } from '@/app/api/report/pdf/build';

// GET /api/v1/report/pdf — a student's driving log as a PDF: the caller's own,
// or for a parent the student named by ?studentId=. As on the web route, the
// parent's name goes on the log only when a parent downloads it.
export async function GET(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = await resolveApiStudentId(caller, request);

    const [student] = await db.select({ name: users.name }).from(users).where(eq(users.id, studentId));
    const studentName = student?.name ?? null;

    let parentName: string | null = null;
    if (caller.userType === 'parent') {
      const [parent] = await db.select({ name: users.name }).from(users).where(eq(users.id, caller.userId));
      parentName = parent?.name ?? null;
    }

    const { buffer, filename } = await buildReportPdf(studentId, studentName, parentName);

    return withCors(
      request,
      new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    );
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
