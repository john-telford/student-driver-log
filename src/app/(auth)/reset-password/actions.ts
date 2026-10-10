'use server';

import { createHash } from 'crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { validatePassword } from '@/lib/password';

export type ResetPasswordState = { error: string } | undefined;

export async function resetPasswordAction(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const raw = formData.get('token') as string | null;
  const password = (formData.get('password') as string | null) ?? '';

  if (!raw) return { error: 'Invalid reset link.' };

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

  // Checked after the token so the rule can include the account's name/email.
  const [user] = await db
    .select({ name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, tokenRow.userId));
  const passwordError = validatePassword(password, user ?? {});
  if (passwordError) return { error: passwordError };

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
