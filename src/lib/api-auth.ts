import { SignJWT, jwtVerify } from 'jose';
import { UnauthorizedError, NotFoundError, ValidationError } from '@/services/errors';
import { assertParentOwnsStudent } from '@/services/accounts';
import type { UserType } from '@/db/schema';

// Bearer-token auth for the `/api/v1` surface. This issues and verifies a
// standalone HS256 token that mirrors the Auth.js session identity
// ({ sub, userType, parentId }), signed with a DEDICATED secret
// (API_JWT_SECRET) — not the Auth.js JWE cookie secret, which is not designed
// for third-party/native Bearer use. See architecture §5, decision D5.

const TOKEN_LIFETIME = '8h'; // mirrors the web session maxAge

export type ApiCaller = {
  userId: number;
  userType: UserType;
  parentId: number | null;
};

// Read + encode the signing secret at call time (not module load) so a missing
// env var fails loudly on the request that needs it, rather than at import.
function getApiSecret(): Uint8Array {
  const secret = process.env.API_JWT_SECRET;
  if (!secret) {
    throw new Error('API_JWT_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function issueApiToken(user: {
  id: number;
  userType: UserType;
  parentId: number | null;
}): Promise<string> {
  return new SignJWT({ userType: user.userType, parentId: user.parentId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(TOKEN_LIFETIME)
    .sign(getApiSecret());
}

// Verify the `Authorization: Bearer <jwt>` header on an incoming request and
// return the caller context. Throws UnauthorizedError on any failure — missing
// header, wrong scheme, malformed/tampered token, or expiry. Never logs the token.
export async function requireApiUser(request: Request): Promise<ApiCaller> {
  const header = request.headers.get('authorization');
  // The `Bearer` scheme is case-insensitive per RFC 7235.
  if (!header || header.slice(0, 7).toLowerCase() !== 'bearer ') {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = header.slice(7).trim();
  if (!token) {
    throw new UnauthorizedError('Missing bearer token');
  }

  try {
    // Pin the algorithm to HS256 — jose is HMAC-only with a symmetric key
    // anyway, but pinning is the defensive norm.
    const { payload } = await jwtVerify(token, getApiSecret(), {
      algorithms: ['HS256'],
    });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) {
      // A missing/non-numeric `sub` must not become a NaN userId that then
      // flows into ownership queries — reject it as an invalid token.
      throw new UnauthorizedError('Invalid token subject');
    }
    return {
      userId,
      userType: payload.userType as UserType,
      parentId: (payload.parentId as number | null) ?? null,
    };
  } catch (err) {
    // Re-throw the "secret not set" misconfiguration as-is so it surfaces as a
    // 500, not a 401 — it is an ops problem, not a bad token.
    if (err instanceof Error && err.message === 'API_JWT_SECRET is not set') {
      throw err;
    }
    throw new UnauthorizedError('Invalid or expired token');
  }
}

// Resolve which student's data an API caller is acting on.
//
// - A student acts on their own data. A `studentId` query parameter is
//   optional for them; if present it must be their own id (404 otherwise).
// - A parent must name one of their own students with `?studentId=` (400 if
//   it's missing or malformed, 404 if it isn't theirs, so a parent can't probe
//   other families' ids). Parent support on iOS: App Review 2026-10-29.
export async function resolveApiStudentId(caller: ApiCaller, request: Request): Promise<number> {
  const raw = new URL(request.url).searchParams.get('studentId');
  const requested = raw === null ? null : parseStudentId(raw);

  if (caller.userType === 'student') {
    if (requested !== null && requested !== caller.userId) {
      throw new NotFoundError('Student not found.');
    }
    return caller.userId;
  }

  if (requested === null) {
    throw new ValidationError('Choose a student.', { studentId: 'studentId is required for parent accounts.' });
  }
  await assertParentOwnsStudent(caller.userId, requested);
  return requested;
}

// Positive canonical decimal integers only, like trip ids.
function parseStudentId(raw: string): number {
  const id = /^\d{1,12}$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Invalid student id.', { studentId: 'Invalid student id.' });
  }
  return id;
}
