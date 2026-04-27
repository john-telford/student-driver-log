'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Outer white border frame — mimics highway sign reflective border */}
      <div className="p-[6px] bg-white rounded-3xl shadow-lg border-[3px] border-black w-full max-w-sm">
        {/* Inner green sign panel */}
        <div className="bg-primary rounded-[1.2rem] px-8 py-7 space-y-6">

          {/* Sign header */}
          <div className="text-center space-y-3 border-b-2 border-white/30 pb-5">
            {/* Illinois state route marker */}
            <div className="flex justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 drop-shadow-md"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Illinois Route 101"
              >
                {/* White square with rounded corners */}
                <rect x="2" y="2" width="96" height="96" rx="9" ry="9" fill="white" />
                {/* Thick black border */}
                <rect x="2" y="2" width="96" height="96" rx="9" ry="9" fill="none" stroke="#111111" strokeWidth="5" />
                {/* ILLINOIS */}
                <text
                  x="50"
                  y="33"
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="800"
                  fill="#111111"
                  fontFamily="Overpass, sans-serif"
                  letterSpacing="2"
                >
                  ILLINOIS
                </text>
                {/* Route number */}
                <text
                  x="50"
                  y="84"
                  textAnchor="middle"
                  fontSize="52"
                  fontWeight="900"
                  fill="#111111"
                  fontFamily="Overpass, sans-serif"
                >
                  101
                </text>
              </svg>
            </div>

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
                className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold text-white/80 uppercase tracking-widest"
                >
                  Password
                </label>
                <Link href="/forgot-password" className="text-[10px] text-accent/80 hover:text-accent uppercase tracking-widest">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {state?.error && (
              <p className="text-[12px] font-semibold text-accent">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full mt-1 rounded bg-accent px-4 py-2.5 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
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
