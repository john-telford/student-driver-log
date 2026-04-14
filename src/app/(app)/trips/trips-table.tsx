'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { type Trip, locationTypes, weatherConditions } from '@/db/schema';
import { deleteTripAction } from './actions';

const locationLabels: Record<typeof locationTypes[number], string> = {
  highway:     'Highway',
  residential: 'Residential',
  rural:       'Rural',
  urban:       'Urban',
  parking_lot: 'Parking Lot',
  race_track:  'Race Track',
};

const weatherLabels: Record<typeof weatherConditions[number], string> = {
  clear: 'Clear',
  rain:  'Rain',
  snow:  'Snow',
  fog:   'Fog',
  ice:   'Ice',
};

function formatMinutes(min: number): string {
  if (min === 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function TripsTable({ trips }: { trips: Trip[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteTripAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <>
      <div className="rounded border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Weather</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Daytime</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Nighttime</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, i) => (
                <tr
                  key={trip.id}
                  className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-muted/20' : ''}`}
                >
                  <td className="px-4 py-3 text-foreground tabular-nums">{trip.tripDate}</td>
                  <td className="px-4 py-3 text-foreground">{locationLabels[trip.locationType]}</td>
                  <td className="px-4 py-3 text-foreground">{weatherLabels[trip.weather]}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMinutes(trip.daytimeMinutes)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatMinutes(trip.nighttimeMinutes)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/trips/${trip.id}/edit`}
                        className="text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(trip)}
                        className="text-xs font-bold text-destructive uppercase tracking-widest hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  Delete the {deleteTarget.tripDate} trip ({locationLabels[deleteTarget.locationType]},{' '}
                  {weatherLabels[deleteTarget.weather]},{' '}
                  {formatMinutes(deleteTarget.daytimeMinutes + deleteTarget.nighttimeMinutes)} total)?
                  This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded border border-border px-4 py-2 text-sm font-bold text-foreground uppercase tracking-widest hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={pending}
              className="rounded bg-destructive px-4 py-2 text-sm font-bold text-white uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Deleting…' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
