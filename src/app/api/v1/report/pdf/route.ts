import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { buildReportPdf } from '@/app/api/report/pdf/build';

// GET /api/v1/report/pdf — the caller's own driving log as a PDF. v1 callers
// are always students (resolveApiStudentId rejects parents), so parentName is
// always null here — matching the existing web route's own student branch.
export async function GET(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = resolveApiStudentId(caller);

    const [student] = await db.select({ name: users.name }).from(users).where(eq(users.id, studentId));
    const studentName = student?.name ?? null;

    const { buffer, filename } = await buildReportPdf(studentId, studentName, null);

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
    return withCors(request, errorResponse(err));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
