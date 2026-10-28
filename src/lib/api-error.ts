import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '@/services/errors';
import { clientIp } from '@/lib/rate-limit';
import { securityEvent, type SecurityEventName } from '@/lib/security-event';

// Map a thrown typed service/auth error to an HTTP JSON response for the
// `/api/v1` surface. Body shape: { error: { code, message, fields? } }
// (architecture §6). Unknown errors are re-thrown so they surface as a 500
// rather than being masked as a client error.
//
// Pass the request so 401/403/404s are logged as security events: a run of
// them from one IP is token forgery or someone walking trip ids that aren't
// theirs (a trip owned by another student answers 404, not 403).
export function errorResponse(err: unknown, request?: Request): Response {
  if (request) logDenied(err, request);
  if (err instanceof ValidationError) {
    return Response.json(
      {
        error: {
          code: 'validation_error',
          message: err.message,
          ...(err.fields ? { fields: err.fields } : {}),
        },
      },
      { status: 400 }
    );
  }
  if (err instanceof UnauthorizedError) {
    return Response.json(
      { error: { code: 'unauthorized', message: err.message } },
      { status: 401 }
    );
  }
  if (err instanceof ForbiddenError) {
    return Response.json(
      { error: { code: 'forbidden', message: err.message } },
      { status: 403 }
    );
  }
  if (err instanceof NotFoundError) {
    return Response.json(
      { error: { code: 'not_found', message: err.message } },
      { status: 404 }
    );
  }
  throw err;
}

function logDenied(err: unknown, request: Request): void {
  let event: SecurityEventName | null = null;
  if (err instanceof UnauthorizedError) event = 'api.unauthorized';
  else if (err instanceof ForbiddenError) event = 'api.forbidden';
  else if (err instanceof NotFoundError) event = 'api.not_found';
  if (!event) return;
  let path: string | undefined;
  try {
    path = `${request.method} ${new URL(request.url).pathname}`;
  } catch {
    path = undefined;
  }
  securityEvent(event, {
    surface: 'api',
    ip: clientIp(request.headers),
    path,
    reason: (err as Error).message,
  });
}
