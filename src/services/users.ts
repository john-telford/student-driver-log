import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, type UserType } from '@/db/schema';
import { UnauthorizedError } from './errors';

export type UserProfile = {
  id: number;
  name: string;
  email: string;
  userType: UserType;
};

// The caller's own identity, read fresh from the DB (the token deliberately
// carries no name/email — it would go stale for the token's lifetime). Columns
// are selected explicitly so passwordHash can never leak into a response.
// A missing row means a still-valid token outlived its user → 401, not 404/500.
export async function getUserProfile(userId: number): Promise<UserProfile> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      userType: users.userType,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError('User no longer exists');
  }
  return user;
}
