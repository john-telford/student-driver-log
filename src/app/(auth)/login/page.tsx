'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[oklch(0.20_0.04_152)]">
      {/* Outer white border frame — mimics highway sign reflective border */}
      <div className="p-[6px] bg-white rounded-[3px] shadow-2xl w-full max-w-sm">
        {/* Inner green sign panel */}
        <div className="bg-primary rounded-[2px] px-8 py-7 space-y-6">

          {/* Sign header */}
          <div className="text-center space-y-1 border-b-2 border-white/30 pb-5">
            <p className="text-accent text-[10px] font-bold tracking-[0.25em] uppercase">
              Illinois SOS
            </p>
            <h1 className="text-white text-2xl font-black tracking-wide uppercase leading-tight">
              Student Driver Log
            </h1>
            <p className="text-white/60 text-[10px] tracking-[0.2em] uppercase">
              Learner Permit Hour Tracker
            </p>
          </div>

          {/* Form */}
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
                className="w-full rounded-[2px] border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-[2px] border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {state?.error && (
              <p className="text-[12px] font-semibold text-accent">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-1 rounded-[2px] bg-accent px-4 py-2.5 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/50 uppercase tracking-widest border-t border-white/20 pt-4">
            Need an account?{' '}
            <Link href="/register" className="text-accent font-bold hover:opacity-80">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
