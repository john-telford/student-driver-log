import NextAuth, { CredentialsSignin, type DefaultSession, type User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyCredentials } from '@/services/auth';
import {
  clearFailures,
  clientIp,
  isRateLimited,
  recordFailure,
} from '@/lib/rate-limit';

// Extend next-auth types to carry userType and parentId through the session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userType: string;
      parentId: number | null;
    } & DefaultSession['user'];
  }

  interface User {
    userType: string;
    parentId: number | null;
  }
}

// Thrown instead of returning null so the login action can tell "slow down"
// apart from "wrong password". Auth.js puts `code` in the redirect URL of a
// direct POST to /api/auth/callback/credentials.
export class RateLimitedSignin extends CredentialsSignin {
  code = 'rate_limited';
}

// Every website sign-in reaches this function, both through the login action's
// signIn() (which forwards the action's request headers) and through a direct
// POST to the Auth.js callback, so this is the one place that counts failed
// website attempts.
export async function authorizeCredentials(
  credentials: Partial<Record<'email' | 'password', unknown>>,
  request: Request
): Promise<User | null> {
  if (!credentials?.email || !credentials?.password) return null;

  const limitKey = `web:${clientIp(request.headers)}`;
  if (isRateLimited(limitKey)) throw new RateLimitedSignin();

  const user = await verifyCredentials({
    email: credentials.email as string,
    password: credentials.password as string,
  });
  if (!user) {
    recordFailure(limitKey);
    return null;
  }
  clearFailures(limitKey);

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    userType: user.userType,
    parentId: user.parentId,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: authorizeCredentials,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.parentId = user.parentId;
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          userType: token.userType as string,
          parentId: token.parentId as number | null,
        },
      };
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isPublic =
        nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
      if (isPublic) return true;
      return isLoggedIn;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
});
