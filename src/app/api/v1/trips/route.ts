import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { ValidationError } from '@/services/errors';
import { listTrips, createTrip } from '@/services/trips';

// GET /api/v1/trips — a student's trips, newest first: the caller's own, or
// for a parent the student named by ?studentId= (see resolveApiStudentId).
export async function GET(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = await resolveApiStudentId(caller, request);
    const trips = await listTrips(studentId);
    return withCors(request, Response.json(trips));
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

// POST /api/v1/trips — create a trip for that student, returns it (201).
// createdBy is the caller, so a parent-logged trip records the parent.
export async function POST(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = await resolveApiStudentId(caller, request);

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
      createdBy: caller.userId,
    });
    return withCors(request, Response.json(trip, { status: 201 }));
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
