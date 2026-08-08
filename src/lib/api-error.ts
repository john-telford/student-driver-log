import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '@/services/errors';

// Map a thrown typed service/auth error to an HTTP JSON response for the
// `/api/v1` surface. Body shape: { error: { code, message, fields? } }
// (architecture §6). Unknown errors are re-thrown so they surface as a 500
// rather than being masked as a client error.
export function errorResponse(err: unknown): Response {
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
