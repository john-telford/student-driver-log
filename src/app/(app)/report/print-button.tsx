'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90 print:hidden"
    >
      Print
    </button>
  );
}
