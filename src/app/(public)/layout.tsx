import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-primary border-b-4 border-accent">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/login"
            className="text-white font-black text-sm uppercase tracking-widest hover:opacity-80"
          >
            Student Driver Log
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        {children}
      </main>
      <footer className="border-t border-black/10 py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap gap-4 text-xs text-black/40 uppercase tracking-widest">
          <Link href="/about" className="hover:text-black/70">About</Link>
          <Link href="/privacy" className="hover:text-black/70">Privacy</Link>
          <Link href="/terms" className="hover:text-black/70">Terms</Link>
          <Link href="/faq" className="hover:text-black/70">FAQ</Link>
        </div>
      </footer>
    </div>
  );
}
