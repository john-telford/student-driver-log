import { requireApiUser, resolveApiStudentId } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { ValidationError } from '@/services/errors';
import { updateTrip, deleteTrip } from '@/services/trips';

function parseTripId(id: string): number {
  // Positive canonical decimal integers only — reject hex (0x10), exponent
  // (1e3), signs, whitespace, and empty so the id contract is unambiguous.
  if (!/^\d+$/.test(id)) {
    throw new ValidationError('Invalid trip id.', { id: 'Invalid trip id.' });
  }
  const tripId = Number(id);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    throw new ValidationError('Invalid trip id.', { id: 'Invalid trip id.' });
  }
  return tripId;
}

// PATCH /api/v1/trips/:id — update a trip I own; returns the updated trip.
// NB: v1 semantics are full-replace (PUT-style) — the client must send ALL trip
// fields; a partial body is validated as a whole and rejected if incomplete.
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
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
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

// DELETE /api/v1/trips/:id — delete a trip I own. 204 No Content on success.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const studentId = resolveApiStudentId(caller);
    const { id } = await params;
    const tripId = parseTripId(id);

    await deleteTrip(tripId, { studentId });
    return withCors(request, new Response(null, { status: 204 }));
  } catch (err) {
    return withCors(request, errorResponse(err));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
