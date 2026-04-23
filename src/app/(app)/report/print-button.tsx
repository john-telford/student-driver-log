'use client';

export default function ReportActions() {
  return (
    <div className="flex gap-3 print:hidden">
      <a
        href="/api/report/pdf"
        download
        className="rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90"
      >
        Download PDF
      </a>
      <button
        onClick={() => window.print()}
        className="rounded border border-border px-4 py-2 text-sm font-bold text-foreground uppercase tracking-widest hover:bg-muted"
      >
        Print
      </button>
    </div>
  );
}
