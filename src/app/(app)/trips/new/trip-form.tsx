'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createTripAction, type TripFormState } from './actions';
import { locationTypes, weatherConditions } from '@/db/schema';

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

const inputClass =
  'mt-1 block w-full rounded border border-input px-3 py-2 text-sm text-foreground ' +
  'placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

const labelClass = 'block text-xs font-bold text-foreground uppercase tracking-wider';
const errorClass = 'mt-1 text-xs text-destructive font-medium';

export default function TripForm() {
  const [state, action, pending] = useActionState<TripFormState | undefined, FormData>(
    createTripAction,
    undefined
  );

  const today = new Date().toISOString().split('T')[0];

  if (state?.success) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="space-y-2">
          <p className="text-4xl">✓</p>
          <h2 className="text-xl font-black uppercase tracking-wide text-foreground">Trip Logged</h2>
          <p className="text-sm text-muted-foreground">The driving session has been saved.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="rounded bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90 text-center"
          >
            Go to Dashboard
          </Link>
          <a
            href="/trips/new"
            className="rounded border border-border px-6 py-2.5 text-sm font-bold text-foreground uppercase tracking-widest hover:bg-muted text-center"
          >
            Log Another Trip
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {/* Date */}
      <div>
        <label htmlFor="tripDate" className={labelClass}>Date</label>
        <input
          id="tripDate"
          name="tripDate"
          type="date"
          required
          max={today}
          defaultValue={today}
          className={inputClass}
        />
        {state?.errors?.tripDate && <p className={errorClass}>{state.errors.tripDate}</p>}
      </div>

      {/* Location type */}
      <div>
        <label htmlFor="locationType" className={labelClass}>Location</label>
        <select id="locationType" name="locationType" required className={inputClass}>
          <option value="">Select…</option>
          {locationTypes.map((l) => (
            <option key={l} value={l}>{locationLabels[l]}</option>
          ))}
        </select>
        {state?.errors?.locationType && <p className={errorClass}>{state.errors.locationType}</p>}
      </div>

      {/* Weather */}
      <div>
        <label htmlFor="weather" className={labelClass}>Weather</label>
        <select id="weather" name="weather" required className={inputClass}>
          <option value="">Select…</option>
          {weatherConditions.map((w) => (
            <option key={w} value={w}>{weatherLabels[w]}</option>
          ))}
        </select>
        {state?.errors?.weather && <p className={errorClass}>{state.errors.weather}</p>}
      </div>

      {/* Minutes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="daytimeMinutes" className={labelClass}>Daytime (min)</label>
          <input
            id="daytimeMinutes"
            name="daytimeMinutes"
            type="number"
            min="0"
            max="600"
            defaultValue="0"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="nighttimeMinutes" className={labelClass}>Nighttime (min)</label>
          <input
            id="nighttimeMinutes"
            name="nighttimeMinutes"
            type="number"
            min="0"
            max="600"
            defaultValue="0"
            className={inputClass}
          />
        </div>
      </div>
      {state?.errors?.minutes && <p className={errorClass}>{state.errors.minutes}</p>}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes <span className="font-normal normal-case text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="Any notes about the session…"
          className={inputClass + ' resize-none'}
        />
        {state?.errors?.notes && <p className={errorClass}>{state.errors.notes}</p>}
      </div>

      {state?.errors?.form && <p className={errorClass}>{state.errors.form}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Log Trip'}
        </button>
        <Link
          href="/trips"
          className="rounded border border-border px-4 py-2.5 text-sm font-bold text-foreground uppercase tracking-widest hover:bg-muted text-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
