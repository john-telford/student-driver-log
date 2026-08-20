import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  trips,
  locationTypes,
  weatherConditions,
  type Trip,
  type LocationType,
  type WeatherCondition,
} from '@/db/schema';
import { ValidationError, NotFoundError } from '@/services/errors';

// Trip business logic, shared by the web (Server Actions / Server Components)
// and the REST API. Every function takes an explicit studentId and enforces
// ownership itself — the `where studentId` clause IS the security boundary, so
// it must live here, not in the caller (architecture §4).

export async function listTrips(studentId: number): Promise<Trip[]> {
  return db
    .select()
    .from(trips)
    .where(eq(trips.studentId, studentId))
    .orderBy(desc(trips.tripDate), desc(trips.id));
}

export type TripInput = {
  tripDate?: unknown;
  locationType?: unknown;
  weather?: unknown;
  daytimeMinutes?: unknown;
  nighttimeMinutes?: unknown;
  notes?: unknown;
};

export type TripContext = { studentId: number; createdBy: number };

type ValidatedTrip = {
  tripDate: string;
  locationType: LocationType;
  weather: WeatherCondition;
  daytimeMinutes: number;
  nighttimeMinutes: number;
  notes: string | null;
};

// Validate a trip payload against the single source of truth for trip rules.
// Field order and messages mirror the web form exactly so the web wrapper's
// behavior is unchanged (NFR1/NFR3). Throws ValidationError on the first
// failure with a single { field } — matching the web action's early return.
function validateTrip(input: TripInput): ValidatedTrip {
  const tripDate =
    typeof input.tripDate === 'string' ? input.tripDate.trim() : '';
  if (!tripDate) {
    throw new ValidationError('Date is required.', { tripDate: 'Date is required.' });
  }
  const parsedDate = new Date(tripDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new ValidationError('Enter a valid date.', {
      tripDate: 'Enter a valid date.',
    });
  }
  if (parsedDate > new Date()) {
    throw new ValidationError('Date cannot be in the future.', {
      tripDate: 'Date cannot be in the future.',
    });
  }

  if (
    typeof input.locationType !== 'string' ||
    !locationTypes.includes(input.locationType as LocationType)
  ) {
    throw new ValidationError('Select a location type.', {
      locationType: 'Select a location type.',
    });
  }

  if (
    typeof input.weather !== 'string' ||
    !weatherConditions.includes(input.weather as WeatherCondition)
  ) {
    throw new ValidationError('Select a weather condition.', {
      weather: 'Select a weather condition.',
    });
  }

  // Accept only a number or a numeric string — a boolean/array/object would
  // otherwise coerce to a misleading value (true→1, []→0) and slip through.
  const toMinutes = (v: unknown): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v.trim() !== '') return Number(v);
    return NaN;
  };
  const daytimeMinutes = toMinutes(input.daytimeMinutes);
  const nighttimeMinutes = toMinutes(input.nighttimeMinutes);
  // Whole minutes only, 0–600. The web wrappers pre-clamp+round, so they never
  // reach this rejection — the rule lives here once (NFR1).
  const inRange = (n: number) => Number.isInteger(n) && n >= 0 && n <= 600;
  if (!inRange(daytimeMinutes) || !inRange(nighttimeMinutes)) {
    throw new ValidationError('Minutes must be between 0 and 600.', {
      minutes: 'Minutes must be between 0 and 600.',
    });
  }
  if (daytimeMinutes === 0 && nighttimeMinutes === 0) {
    throw new ValidationError('Enter at least 1 minute of driving time.', {
      minutes: 'Enter at least 1 minute of driving time.',
    });
  }

  const notes = typeof input.notes === 'string' ? input.notes.trim() : '';
  if (notes.length > 500) {
    throw new ValidationError('Notes must be 500 characters or fewer.', {
      notes: 'Notes must be 500 characters or fewer.',
    });
  }

  return {
    tripDate,
    locationType: input.locationType as LocationType,
    weather: input.weather as WeatherCondition,
    daytimeMinutes,
    nighttimeMinutes,
    notes: notes || null,
  };
}

export async function createTrip(
  input: TripInput,
  ctx: TripContext
): Promise<Trip> {
  const v = validateTrip(input);
  const [created] = await db
    .insert(trips)
    .values({
      studentId: ctx.studentId,
      createdBy: ctx.createdBy,
      tripDate: v.tripDate,
      locationType: v.locationType,
      weather: v.weather,
      daytimeMinutes: v.daytimeMinutes,
      nighttimeMinutes: v.nighttimeMinutes,
      notes: v.notes,
    })
    .returning();
  return created;
}

export async function updateTrip(
  tripId: number,
  input: TripInput,
  ctx: { studentId: number }
): Promise<Trip> {
  // Ownership check FIRST — a non-owned/non-existent trip never reaches
  // validation, matching the web action's existing order and hiding whether
  // the id exists at all (NFR2).
  const [existing] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.studentId, ctx.studentId)));
  if (!existing) {
    throw new NotFoundError('Trip not found.');
  }

  const v = validateTrip(input);
  const [updated] = await db
    .update(trips)
    .set({
      tripDate: v.tripDate,
      locationType: v.locationType,
      weather: v.weather,
      daytimeMinutes: v.daytimeMinutes,
      nighttimeMinutes: v.nighttimeMinutes,
      notes: v.notes,
    })
    // Keep the studentId predicate on the write itself (defense-in-depth), not
    // just on the ownership check above. If the row was deleted between the two
    // statements, `returning()` is empty — treat that as not-found rather than
    // returning undefined.
    .where(and(eq(trips.id, tripId), eq(trips.studentId, ctx.studentId)))
    .returning();
  if (!updated) {
    throw new NotFoundError('Trip not found.');
  }
  return updated;
}

export async function deleteTrip(
  tripId: number,
  ctx: { studentId: number }
): Promise<void> {
  // Ownership check first (same pattern as updateTrip) — a non-owned trip
  // throws NotFoundError rather than silently deleting 0 rows, so the API can
  // report a visible 404 (NFR2). The web wrapper swallows this error to
  // preserve its existing silent-no-op behavior; see actions.ts.
  const [existing] = await db
    .select({ id: trips.id })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.studentId, ctx.studentId)));
  if (!existing) {
    throw new NotFoundError('Trip not found.');
  }

  // Keep the studentId predicate on the delete itself (defense-in-depth).
  await db
    .delete(trips)
    .where(and(eq(trips.id, tripId), eq(trips.studentId, ctx.studentId)));
}
