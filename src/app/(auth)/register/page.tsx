'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction } from './actions';

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Outer white border frame — mimics highway sign reflective border */}
      <div className="p-[6px] bg-white rounded-3xl shadow-lg border-[3px] border-black w-full max-w-sm">
        {/* Inner green sign panel */}
        <div className="bg-primary rounded-[1.2rem] px-8 py-7 space-y-6">

          {/* Sign header */}
          <div className="text-center space-y-1 border-b-2 border-white/30 pb-5">
            <h1 className="text-white text-2xl font-black tracking-wide uppercase leading-tight">
              Student Driver Log
            </h1>
            <p className="text-white/60 text-[10px] tracking-[0.2em] uppercase">
              Create Parent Account
            </p>
          </div>

          {/* Instructional note */}
          <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">
            Students are added from the dashboard after registration.
          </p>

          {/* Form */}
          <form action={action} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {state?.errors?.name && (
                <p className="mt-1 text-[11px] font-semibold text-accent">{state.errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-bold text-white/80 uppercase tracking-widest mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {state?.errors?.email && (
                <p className="mt-1 text-[11px] font-semibold text-accent">{state.errors.email}</p>
              )}
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
                autoComplete="new-password"
                className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {state?.errors?.password && (
                <p className="mt-1 text-[11px] font-semibold text-accent">{state.errors.password}</p>
              )}
            </div>

            {state?.errors?.form && (
              <p className="text-[12px] font-semibold text-accent">{state.errors.form}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-1 rounded bg-accent px-4 py-2.5 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/50 uppercase tracking-widest border-t border-white/20 pt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-bold hover:opacity-80">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
