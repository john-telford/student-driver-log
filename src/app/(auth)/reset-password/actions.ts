'use server';

import { createHash } from 'crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';

export type ResetPasswordState = { error: string } | undefined;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const raw = formData.get('token') as string | null;
  const password = formData.get('password') as string | null;

  if (!raw) return { error: 'Invalid reset link.' };
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const tokenHash = createHash('sha256').update(raw.trim()).digest('hex');
  const now = new Date().toISOString();

  const [tokenRow] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now)
      )
    );

  if (!tokenRow) {
    return { error: 'This link has expired or has already been used. Request a new one.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.transaction(async (tx) => {
    await tx.update(users)
      .set({ passwordHash })
      .where(eq(users.id, tokenRow.userId));
    await tx.update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, tokenRow.id));
  });

  redirect('/login?reset=1');
}
