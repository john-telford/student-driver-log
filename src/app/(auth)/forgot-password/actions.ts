'use server';

import { randomBytes, createHash } from 'crypto';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev';

const SUCCESS_MESSAGE = "If that email is registered, you'll receive a link shortly.";

export type ForgotPasswordState = { message: string; isError?: boolean } | undefined;

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = (formData.get('email') as string | null)?.toLowerCase().trim();
  if (!email) return { message: 'Email is required.', isError: true };

  const [user] = await db.select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.email, email));

  if (!user) return { message: SUCCESS_MESSAGE };

  const raw = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Invalidate any existing tokens for this user
  await db.transaction(async (tx) => {
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await tx.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt });
  });

  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const resetUrl = `${proto}://${host}/reset-password?token=${raw}`;

  // Escape name for HTML — name is user-supplied content
  const safeName = user.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Reset your Student Driver Log password',
      html: `
        <p>Hi ${safeName},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  } catch {
    // Email delivery failure is silent — don't reveal whether the address exists
  }

  return { message: SUCCESS_MESSAGE };
}
