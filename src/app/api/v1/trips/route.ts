import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { listTrips } from '@/services/trips';

// GET /api/v1/trips — the caller's own trips, newest first.
export async function GET(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = resolveApiStudentId(caller);
    const trips = await listTrips(studentId);
    return withCors(request, Response.json(trips));
  } catch (err) {
    return withCors(request, errorResponse(err));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
