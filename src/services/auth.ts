import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users, type UserType } from '@/db/schema';

// Transport-agnostic credential verification. This is the single source of the
// bcrypt check — both the web (Auth.js `authorize()`) and the API
// (`POST /api/v1/auth/token`) call it, so there is no logic drift between them.
//
// Returns the caller's identity on success, or null on any failure (unknown
// email or wrong password). Never logs the password or the stored hash (NFR4).

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  userType: UserType;
  parentId: number | null;
};

export async function verifyCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthUser | null> {
  if (!email || !password) return null;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    userType: user.userType,
    parentId: user.parentId ?? null,
  };
}
