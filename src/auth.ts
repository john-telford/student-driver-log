import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyCredentials } from '@/services/auth';

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await verifyCredentials({
          email: credentials.email as string,
          password: credentials.password as string,
        });
        if (!user) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          userType: user.userType,
          parentId: user.parentId,
        };
      },
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
