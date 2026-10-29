import { ValidationError } from '@/services/errors';

// Reads a request body that must be a JSON object, for the /api/v1 routes that
// take one. Malformed JSON, `null`, arrays and primitives are all a 400.
export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body.', { body: 'Invalid JSON body.' });
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new ValidationError('Invalid JSON body.', { body: 'Invalid JSON body.' });
  }
  return body as Record<string, unknown>;
}
