// CORS policy for the `/api/v1` surface. Native clients (Swift/RN) don't enforce
// CORS, but we lock it down anyway for a future web/PWA client and to keep the
// browser attack surface explicit (architecture §7). Allow-list only — a
// specific origin is echoed back, never `*` paired with credentials (NFR6).

const ALLOWED_METHODS = 'GET, POST, PATCH, DELETE, OPTIONS';
const ALLOWED_HEADERS = 'Authorization, Content-Type';

function allowedOrigins(): string[] {
  return (process.env.API_ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

// Returns the CORS headers for a request from `origin`. When the origin is not
// allow-listed (or absent, e.g. a same-origin/native request), no
// Access-Control-Allow-Origin is granted — the browser then blocks the response.
export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    Vary: 'Origin',
  };
  if (origin && allowedOrigins().includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

// Copy CORS headers derived from the request's Origin onto an existing response.
export function withCors(request: Request, response: Response): Response {
  const headers = corsHeaders(request.headers.get('origin'));
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

// Preflight (OPTIONS) response: 204 with the CORS headers, no body.
export function preflight(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin')),
  });
}
