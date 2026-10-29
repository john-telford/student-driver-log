'use server';

import { headers } from 'next/headers';
import { actionIp, securityEvent } from '@/lib/security-event';
import { RESET_REQUESTED_MESSAGE, requestPasswordReset } from '@/services/password-reset';

export type ForgotPasswordState = { message: string; isError?: boolean } | undefined;

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = (formData.get('email') as string | null)?.toLowerCase().trim();
  if (!email) return { message: 'Email is required.', isError: true };

  const hdrs = await headers();
  const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';

  const outcome = await requestPasswordReset(email, `${proto}://${host}`);
  securityEvent('password_reset.requested', { surface: 'web', ip: await actionIp(), email, outcome });

  return { message: RESET_REQUESTED_MESSAGE };
}
