import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { ValidationError } from '@/services/errors';
import { listTrips, createTrip } from '@/services/trips';

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

// POST /api/v1/trips — create a trip for the caller's student, returns it (201).
export async function POST(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = resolveApiStudentId(caller);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body.', { body: 'Invalid JSON body.' });
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new ValidationError('Invalid JSON body.', { body: 'Invalid JSON body.' });
    }

    const trip = await createTrip(body as Record<string, unknown>, {
      studentId,
      createdBy: studentId,
    });
    return withCors(request, Response.json(trip, { status: 201 }));
  } catch (err) {
    return withCors(request, errorResponse(err));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
