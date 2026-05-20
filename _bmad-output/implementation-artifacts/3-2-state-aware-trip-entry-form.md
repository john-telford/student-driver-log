# Story 3.2: State-Aware Trip Entry Form

Status: ready-for-dev

## Story

As a user logging a driving session,
I want the trip form to show only the fields my state requires and validate my entry against my state's rules,
so that every trip I log is valid for my state's official form.

## Acceptance Criteria

1. Server Component pages (`/trips/new` and `/trips/[id]/edit`) resolve `STATE_CONFIGS[user.state_code]` and pass `stateConfig` as a typed prop to the Client Component form
2. Location type and weather dropdowns are populated from `stateConfig.location_type_options` and `stateConfig.weather_options`
3. Inclement minutes field appears only when `stateConfig.inclement_hours_required > 0`
4. Supervisor name field appears only when `stateConfig.supervisor_field_required = true`
5. Supervisor license field appears only when `stateConfig.supervisor_license_field_required = true`
6. Start/end time fields auto-calculate total minutes when both are filled; TIME_ORDER_INVALID shown as field error
7. On client submit, `validateTrip()` errors render as field-level messages and block submission; warnings render as toasts but allow submission
8. Server Actions call `validateTrip()` as an authoritative gate before any DB write
9. For OH users: Server Action appends `OH_DAILY_CAP` warning if daily total > 4h; trip is still saved
10. For NC users: Server Action appends `NC_WEEKLY_CAP` warning if weekly total > 10h; trip is still saved
11. A code comment in `addTripAction`/`updateTripAction` documents why OH/NC cap checks are server-only

## Tasks / Subtasks

- [ ] Modify `src/app/(app)/trips/new/page.tsx` — resolve stateConfig server-side, pass as prop (AC: 1)
- [ ] Modify `src/app/(app)/trips/[id]/edit/page.tsx` — same pattern (AC: 1)
- [ ] Modify `src/app/(app)/trips/new/trip-form.tsx` — accept stateConfig prop, conditional fields (AC: 2-7)
  - [ ] Replace hardcoded `locationTypes`/`weatherConditions` imports with `stateConfig` options
  - [ ] Add conditional inclement minutes field
  - [ ] Add conditional supervisor name field
  - [ ] Add conditional supervisor license field
  - [ ] Add start/end time fields (all states — stored for states that need them)
  - [ ] Wire client-side `validateTrip()` on submit
- [ ] Modify `src/app/(app)/trips/[id]/edit/edit-trip-form.tsx` — same conditional fields (AC: 2-7)
- [ ] Modify `src/app/(app)/trips/new/actions.ts` — `createTripAction` (AC: 8-11)
  - [ ] Call `validateTrip()` before DB insert
  - [ ] OH/NC cumulative cap queries post-validation
  - [ ] Save new fields: `inclementMinutes`, `supervisorName`, `supervisorLicense`, `startTime`, `endTime`
- [ ] Find and modify the update/delete trip actions file — `updateTripAction` same server-side validation pattern (AC: 8-11)

## Dev Notes

### Prerequisites

Stories 1.1 (types), 1.5 (trips schema with new columns), 3.1 (validateTrip) must be complete.

### Current State of Files to Read Before Editing

- [src/app/(app)/trips/new/trip-form.tsx](src/app/(app)/trips/new/trip-form.tsx) — imports `locationTypes`, `weatherConditions` from `@/db/schema`; hardcoded options
- [src/app/(app)/trips/new/actions.ts](src/app/(app)/trips/new/actions.ts) — `createTripAction` inserts basic fields only; no validateTrip call yet
- [src/app/(app)/trips/[id]/edit/edit-trip-form.tsx](src/app/(app)/trips/[id]/edit/edit-trip-form.tsx) — similar to trip-form.tsx
- [src/app/(app)/trips/new/page.tsx](src/app/(app)/trips/new/page.tsx) — read current structure

### StateConfig Prop Threading (Architecture Pattern 2)

```typescript
// trips/new/page.tsx (Server Component)
import { STATE_CONFIGS } from '@/data/state-configs';
import { auth } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';

export default async function NewTripPage() {
  const session = await auth();
  const userId = Number(session!.user.id);
  const [user] = await db.select({ stateCode: users.stateCode })
    .from(users).where(eq(users.id, userId));
  const stateConfig = STATE_CONFIGS[user.stateCode ?? 'IL'];
  if (!stateConfig) throw new Error(`Unknown state: ${user.stateCode}`);
  return <TripForm stateConfig={stateConfig} />;
}
```

**Do NOT import `STATE_CONFIGS` in `trip-form.tsx`** — it's a Client Component; the import will fail at build time due to `import 'server-only'`.

### TripFormState Update

The existing `TripFormState` in `actions.ts` has `errors.locationType`, `errors.weather`, etc. Add new error fields:

```typescript
export type TripFormState = {
  success?: true;
  errors?: {
    tripDate?: string;
    locationType?: string;
    weather?: string;
    minutes?: string;
    inclementMinutes?: string;
    supervisorName?: string;
    supervisorLicense?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
    form?: string;
  };
  warnings?: string[];  // toast messages
};
```

### Client-Side validateTrip Pattern

Call `validateTrip()` on form submit (not on every keystroke):

```typescript
// In trip-form.tsx, before dispatching the server action:
import { validateTrip } from '@/lib/validation';
import type { TripInput } from '@/lib/types/validation';

// Build TripInput from form values:
const tripInput: TripInput = {
  tripDate, locationType, weather,
  daytimeMinutes: Number(daytimeMinutes),
  nighttimeMinutes: Number(nighttimeMinutes),
  inclementMinutes: Number(inclementMinutes ?? 0),
  supervisorName: supervisorName || null,
  supervisorLicense: supervisorLicense || null,
  startTime: startTime || null,
  endTime: endTime || null,
  notes: notes || null,
};
const { errors, warnings } = validateTrip(tripInput, stateConfig);
if (errors.length > 0) {
  // render errors inline, do not submit
  return;
}
// show warnings as toasts, then submit
```

Use `sonner` toast (already installed: `src/components/ui/sonner.tsx`) for warnings.

### Server Action Pattern (createTripAction)

```typescript
// In createTripAction, after resolving studentId:
import { STATE_CONFIGS } from '@/data/state-configs';
import { validateTrip } from '@/lib/validation';
import { and, gte, lte, sum } from 'drizzle-orm';

const [user] = await db.select({ stateCode: users.stateCode })
  .from(users).where(eq(users.id, createdBy));
const stateConfig = STATE_CONFIGS[user.stateCode ?? 'IL'];

const tripInput: TripInput = { /* build from formData */ };
const result = validateTrip(tripInput, stateConfig);

// OH/NC cumulative cap checks — server-only by design (validateTrip has no DB access)
if (stateConfig.state_code === 'OH') {
  const [dayTotals] = await db.select({ total: sum(trips.daytimeMinutes + trips.nighttimeMinutes) })
    .from(trips)
    .where(and(eq(trips.studentId, studentId), eq(trips.tripDate, tripInput.tripDate)));
  if (Number(dayTotals?.total ?? 0) + tripInput.daytimeMinutes + tripInput.nighttimeMinutes > 4 * 60) {
    result.warnings.push({ code: 'OH_DAILY_CAP', message: 'Ohio recommends no more than 4 hours of practice per day.' });
  }
}
// NC weekly cap: similar pattern with date range for current week

if (result.errors.length > 0) return { errors: mapValidationErrors(result.errors), warnings: [] };

// Proceed to DB insert with all new fields
await db.insert(trips).values({
  studentId, createdBy, tripDate, locationType, weather,
  daytimeMinutes, nighttimeMinutes,
  inclementMinutes: inclementMin,
  supervisorName: supervisorName || null,
  supervisorLicense: supervisorLicense || null,
  startTime: startTime || null,
  endTime: endTime || null,
  notes: notes || null,
});
```

### Removing Schema Imports from trip-form.tsx

The current `trip-form.tsx` imports `locationTypes`, `weatherConditions` from `@/db/schema`. Remove these imports — replace with options from the `stateConfig` prop. The schema enums are now redundant for the form; they exist only for the DB column definitions.

### Edit Trip Form

Apply identical changes to `edit-trip-form.tsx`. The edit action (`updateTripAction`) needs the same server-side `validateTrip()` call and OH/NC cap logic.

### References

- trip-form.tsx: [src/app/(app)/trips/new/trip-form.tsx](src/app/(app)/trips/new/trip-form.tsx)
- createTripAction: [src/app/(app)/trips/new/actions.ts](src/app/(app)/trips/new/actions.ts)
- validateTrip: [src/lib/validation.ts](src/lib/validation.ts) (created in Story 3.1)
- Architecture Pattern 2 (StateConfig prop threading), Pattern 3 (validateTrip call sites), Decision 6 (cumulative cap separation)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
