'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resetPasswordAction } from './actions';

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label
          htmlFor="password"
          className="block text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1"
        >
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="text-white/40 text-[10px] mt-1">Minimum 8 characters</p>
      </div>

      {state?.error && (
        <div className="space-y-2">
          <p className="text-[12px] font-semibold text-accent">{state.error}</p>
          <Link href="/forgot-password" className="text-white/60 text-xs underline hover:text-white">
            Request a new link
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-1 rounded bg-accent px-4 py-2.5 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Set New Password'}
      </button>
    </form>
  );
}
