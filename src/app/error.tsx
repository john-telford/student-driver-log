'use client';

import Link from 'next/link';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-[6px] bg-white rounded-3xl shadow-lg border-[3px] border-black w-full max-w-sm">
        <div className="bg-primary rounded-[1.2rem] px-8 py-10 space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-accent font-black text-8xl tracking-tight leading-none">500</p>
            <h1 className="text-white font-black text-xl uppercase tracking-widest">
              Unexpected Detour
            </h1>
            <p className="text-white/60 text-sm">
              Something went wrong on our end.
            </p>
            {error.digest && (
              <p className="text-white/40 text-xs font-mono">ref: {error.digest}</p>
            )}
          </div>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={unstable_retry}
              className="rounded bg-accent px-6 py-2.5 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90"
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="text-white/60 text-xs uppercase tracking-widest hover:text-white"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
