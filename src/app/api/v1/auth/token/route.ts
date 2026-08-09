import { verifyCredentials } from '@/services/auth';
import { issueApiToken } from '@/lib/api-auth';
import { preflight, withCors } from '@/lib/cors';

// POST /api/v1/auth/token — exchange { email, password } for a Bearer JWT.
// No auth required (this is how you obtain auth). Public per the middleware
// matcher, which excludes /api/v1.

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCors(
      request,
      Response.json(
        { error: { code: 'invalid_request', message: 'Invalid JSON body.' } },
        { status: 400 }
      )
    );
  }

  // Guard against non-object bodies (e.g. a literal `null` or an array, which
  // parse fine but are not a valid credentials object).
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return withCors(
      request,
      Response.json(
        { error: { code: 'invalid_request', message: 'Invalid JSON body.' } },
        { status: 400 }
      )
    );
  }

  const { email: emailRaw, password: passwordRaw } = body as Record<
    string,
    unknown
  >;
  const email = typeof emailRaw === 'string' ? emailRaw : '';
  const password = typeof passwordRaw === 'string' ? passwordRaw : '';

  const user = await verifyCredentials({ email, password });
  if (!user) {
    return withCors(
      request,
      Response.json(
        {
          error: {
            code: 'invalid_credentials',
            message: 'Invalid email or password.',
          },
        },
        { status: 401 }
      )
    );
  }

  const token = await issueApiToken(user);
  // Never let an intermediary/proxy cache a bearer credential.
  return withCors(
    request,
    Response.json({ token }, { headers: { 'Cache-Control': 'no-store' } })
  );
}

export async function OPTIONS(request: Request): Promise<Response> {
  return preflight(request);
}
