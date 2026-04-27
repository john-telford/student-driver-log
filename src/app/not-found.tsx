import Link from 'next/link';
import { auth } from '@/auth';

export default async function NotFound() {
  const session = await auth();
  const href = session?.user ? '/dashboard' : '/login';
  const label = session?.user ? 'Go to Dashboard' : 'Go to Login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-[6px] bg-white rounded-3xl shadow-lg border-[3px] border-black w-full max-w-sm">
        <div className="bg-primary rounded-[1.2rem] px-8 py-10 space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-accent font-black text-8xl tracking-tight leading-none">404</p>
            <h1 className="text-white font-black text-xl uppercase tracking-widest">
              Road Not Found
            </h1>
            <p className="text-white/60 text-sm">
              This destination doesn't exist on our map.
            </p>
          </div>
          <Link
            href={href}
            className="inline-block rounded bg-accent px-6 py-2.5 text-sm font-black text-accent-foreground uppercase tracking-widest hover:opacity-90"
          >
            {label}
          </Link>
        </div>
      </div>
    </div>
  );
}
