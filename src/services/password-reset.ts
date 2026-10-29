import { randomBytes, createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';

// Starts a password reset: a one-hour, single-use link emailed to the account.
// Shared by the website's Forgot Password form and POST
// /api/v1/auth/forgot-password. The reset itself always happens on the
// website's /reset-password page, which the emailed link opens.
//
// Callers show the same message whatever this returns, so the response never
// reveals whether an email is registered; the outcome is for security events.

const FROM = process.env.RESEND_FROM ?? 'onboarding@resend.dev';

export const RESET_REQUESTED_MESSAGE = "If that email is registered, you'll receive a link shortly.";

export type ResetOutcome = 'sent' | 'unknown_email';

// `origin` is the website's own origin (scheme + host), used to build the link.
export async function requestPasswordReset(email: string, origin: string): Promise<ResetOutcome> {
  const normalized = email.trim().toLowerCase();
  const [user] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.email, normalized));
  if (!user) return 'unknown_email';

  const raw = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Invalidate any existing tokens for this user
  await db.transaction(async (tx) => {
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
    await tx.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt });
  });

  const resetUrl = `${origin}/reset-password?token=${raw}`;

  // Escape name for HTML — name is user-supplied content
  const safeName = user.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  try {
    // Constructed per call so a missing key fails only the send, not the import.
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM,
      to: normalized,
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
  return 'sent';
}
