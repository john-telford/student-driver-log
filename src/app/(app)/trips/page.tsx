import Link from 'next/link';
import { TripsSuccessToast } from './trips-success-toast';

export default function TripsPage() {
  return (
    <>
      <TripsSuccessToast />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-wide text-foreground">
            Trips
          </h1>
          <Link
            href="/trips/new"
            className="rounded bg-primary px-4 py-2 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90"
          >
            Log Trip
          </Link>
        </div>
        <div className="rounded border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Trip list coming in issue #6.
        </div>
      </div>
    </>
  );
}
