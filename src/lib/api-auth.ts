import { SignJWT, jwtVerify } from 'jose';
import { UnauthorizedError, ForbiddenError } from '@/services/errors';
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
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    throw new UnauthorizedError('Missing bearer token');
  }

  try {
    const { payload } = await jwtVerify(token, getApiSecret());
    return {
      userId: Number(payload.sub),
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

// Resolve which student's data an API caller is acting on. v1 iOS = the student
// logs in as their own account, so studentId is simply their own userId
// (architecture D8). Parent-on-iOS is a deferred fast-follow: a parent caller
// has no way to specify a student yet, so reject explicitly rather than guess.
export function resolveApiStudentId(caller: ApiCaller): number {
  if (caller.userType === 'student') {
    return caller.userId;
  }
  throw new ForbiddenError('Parent API access is not supported yet');
}
