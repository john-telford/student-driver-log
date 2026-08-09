import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { ValidationError } from '@/services/errors';
import { updateTrip } from '@/services/trips';

function parseTripId(id: string): number {
  const tripId = Number(id);
  if (!Number.isInteger(tripId)) {
    throw new ValidationError('Invalid trip id.', { id: 'Invalid trip id.' });
  }
  return tripId;
}

// PATCH /api/v1/trips/:id — update a trip I own; returns the updated trip.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = resolveApiStudentId(caller);
    const { id } = await params;
    const tripId = parseTripId(id);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body.', { body: 'Invalid JSON body.' });
    }
    if (typeof body !== 'object' || body === null) {
      throw new ValidationError('Invalid JSON body.', { body: 'Invalid JSON body.' });
    }

    const trip = await updateTrip(tripId, body as Record<string, unknown>, {
      studentId,
    });
    return withCors(request, Response.json(trip));
  } catch (err) {
    return withCors(request, errorResponse(err));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
