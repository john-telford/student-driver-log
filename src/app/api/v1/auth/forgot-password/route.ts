import { readJsonObject } from '@/lib/api-body';
import { errorResponse } from '@/lib/api-error';
import { preflight, withCors } from '@/lib/cors';
import { accountKey, clientIp, consumeAttempt } from '@/lib/rate-limit';
import { securityEvent } from '@/lib/security-event';
import { ValidationError } from '@/services/errors';
import { RESET_REQUESTED_MESSAGE, requestPasswordReset } from '@/services/password-reset';

// POST /api/v1/auth/forgot-password — { email } → 202 { message }. Emails the
// same one-hour reset link as the website's Forgot Password form; the reset
// itself happens on the website. The answer is the same whether or not the
// email is registered. Public, like /auth/token.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request.headers);
  try {
    const body = await readJsonObject(request);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(email)) {
      throw new ValidationError('Enter a valid email.', { email: 'Enter a valid email.' });
    }

    const attempt = consumeAttempt(accountKey('reset', request.headers, email));
    if (attempt.limited) {
      securityEvent('password_reset.requested', { surface: 'api', ip, email, outcome: 'rate_limited' });
      return withCors(
        request,
        Response.json(
          { error: { code: 'rate_limited', message: 'Too many attempts. Try again in a few minutes.' } },
          { status: 429, headers: { 'Retry-After': String(attempt.retryAfter) } }
        )
      );
    }

    const outcome = await requestPasswordReset(email, new URL(request.url).origin);
    securityEvent('password_reset.requested', { surface: 'api', ip, email, outcome });
    return withCors(request, Response.json({ message: RESET_REQUESTED_MESSAGE }, { status: 202 }));
  } catch (err) {
    return withCors(request, errorResponse(err, request));
  }
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
