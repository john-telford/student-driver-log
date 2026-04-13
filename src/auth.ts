import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users } from '@/db/schema';

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
        username: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username as string));

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          userType: user.userType,
          parentId: user.parentId ?? null,
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
