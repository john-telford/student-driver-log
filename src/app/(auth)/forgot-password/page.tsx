'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordResetAction } from './actions';

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-[6px] bg-white rounded-3xl shadow-lg border-[3px] border-black w-full max-w-sm">
        <div className="bg-primary rounded-[1.2rem] px-8 py-7 space-y-6">

          <div className="text-center space-y-2 border-b-2 border-white/30 pb-5">
            <h1 className="text-white text-xl font-black tracking-wide uppercase leading-tight">
              Reset Password
            </h1>
            <p className="text-white/60 text-[11px] tracking-widest uppercase">
              Student Driver Log
            </p>
          </div>

          {state?.message ? (
            <div className="space-y-4">
              <p className={`text-sm font-semibold text-center ${state.isError ? 'text-accent' : 'text-white'}`}>
                {state.message}
              </p>
              {!state.isError && (
                <p className="text-white/50 text-xs text-center">
                  Check your inbox and spam folder.
                </p>
              )}
            </div>
          ) : (
            <form action={action} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <button
                type="submit"
                disabled={pending}
                className="w-full mt-1 rounded bg-accent px-4 py-2.5 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
              >
                {pending ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-[10px] text-white/50 uppercase tracking-widest border-t border-white/20 pt-4">
            <Link href="/login" className="text-accent font-bold hover:opacity-80">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
