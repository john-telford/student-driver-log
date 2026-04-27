import Link from 'next/link';
import ResetPasswordForm from './reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-[6px] bg-white rounded-3xl shadow-lg border-[3px] border-black w-full max-w-sm">
        <div className="bg-primary rounded-[1.2rem] px-8 py-7 space-y-6">

          <div className="text-center space-y-2 border-b-2 border-white/30 pb-5">
            <h1 className="text-white text-xl font-black tracking-wide uppercase leading-tight">
              Set New Password
            </h1>
            <p className="text-white/60 text-[11px] tracking-widest uppercase">
              Student Driver Log
            </p>
          </div>

          {!token ? (
            <div className="space-y-4 text-center">
              <p className="text-accent text-sm font-semibold">Invalid reset link.</p>
              <Link href="/forgot-password" className="text-white/60 text-xs underline hover:text-white">
                Request a new one
              </Link>
            </div>
          ) : (
            <ResetPasswordForm token={token} />
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
