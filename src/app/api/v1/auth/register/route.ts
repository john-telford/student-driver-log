import { issueApiToken } from '@/lib/api-auth';
import { readJsonObject } from '@/lib/api-body';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { accountKey, clientIp, consumeAttempt } from '@/lib/rate-limit';
import { securityEvent } from '@/lib/security-event';
import { registerParent } from '@/services/accounts';
import { ValidationError } from '@/services/errors';

// POST /api/v1/auth/register — create a parent account from the native app and
// sign it in: { name, email, password } → 201 { token }. The same rules as the
// website's /register (services/accounts). Public, like /auth/token.
//
// Limited per client IP (lib/rate-limit): 429 `rate_limited` with Retry-After.
// Every attempt counts, successful or not, since each one can create a row.
export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request.headers);
  try {
    const attempt = consumeAttempt(accountKey('register', request.headers));
    if (attempt.limited) {
      securityEvent('register', { surface: 'api', ip, outcome: 'rate_limited' });
      return withCors(
        request,
        Response.json(
          { error: { code: 'rate_limited', message: 'Too many attempts. Try again in a few minutes.' } },
          { status: 429, headers: { 'Retry-After': String(attempt.retryAfter) } }
        )
      );
    }

    const body = await readJsonObject(request);
    let user;
    try {
      user = await registerParent(body);
    } catch (err) {
      if (err instanceof ValidationError && err.fields?.email === 'An account with that email already exists.') {
        securityEvent('register', { surface: 'api', ip, email: body.email, outcome: 'duplicate_email' });
      }
      throw err;
    }
    securityEvent('register', { surface: 'api', ip, email: user.email, userId: user.id, outcome: 'created' });

    const token = await issueApiToken(user);
    return withCors(
      request,
      Response.json({ token }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
    );
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
