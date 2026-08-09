import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { getReport } from '@/services/report';

// GET /api/v1/report — the caller's own totals + progress vs the IL requirements.
export async function GET(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = resolveApiStudentId(caller);
    const report = await getReport(studentId);
    return withCors(request, Response.json(report));
  } catch (err) {
    return withCors(request, errorResponse(err));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
