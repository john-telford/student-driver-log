import { requireApiUser } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { getUserProfile } from '@/services/users';

// GET /api/v1/me — the caller's own identity ({ id, name, email, userType }).
// Deliberately does NOT call resolveApiStudentId: it returns only the caller's
// own row, so it is safe for parent tokens too (parents are rejected on the
// data routes, which lets a client show "parents aren't supported yet").
export async function GET(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    const profile = await getUserProfile(caller.userId);
    // Personal data + bearer-authenticated: never let an intermediary cache it.
    return withCors(
      request,
      Response.json(profile, { headers: { 'Cache-Control': 'no-store' } })
    );
  } catch (err) {
    return withCors(request, errorResponse(err));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
