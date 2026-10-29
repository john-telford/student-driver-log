import { requireApiUser } from '@/lib/api-auth';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { clientIp } from '@/lib/rate-limit';
import { securityEvent } from '@/lib/security-event';
import { deleteAccount } from '@/services/accounts';
import { getUserProfile } from '@/services/users';

// DELETE /api/v1/account — permanently delete the caller's account (App Store
// Guideline 5.1.1(v)). 204 on success. A parent's deletion removes the whole
// family: every student account and every trip. A student's removes only that
// student and their trips; the parent account stays (services/accounts).
// The app asks for confirmation before calling this; the server doesn't.
export async function DELETE(request: Request): Promise<Response> {
  try {
    const caller = await requireApiUser(request);
    // 401 if the account is already gone, so a retried delete is idempotent
    // from the app's side (it signs out on 401 either way).
    await getUserProfile(caller.userId);
    await deleteAccount(caller);
    securityEvent('account.deleted', {
      surface: 'api',
      ip: clientIp(request.headers),
      userId: caller.userId,
      outcome: caller.userType,
    });
    return withCors(request, new Response(null, { status: 204 }));
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
