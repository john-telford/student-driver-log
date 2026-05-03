# Story 3.1: State-Specific Trip Validation Engine

Status: ready-for-dev

## Story

As a developer,
I want a pure, server-import-free `validateTrip()` function that enforces state-specific rules,
so that trip entry can be validated identically on the client (UX feedback) and server (authoritative gate) without duplication.

## Acceptance Criteria

1. `src/lib/validation.ts` exports `validateTrip(trip: TripInput, stateConfig: StateConfig): ValidationOutput`
2. The file header contains `// Pure function — NO server imports. Runs on client and server.` and imports zero server-only modules
3. Validation branches on `stateConfig.validation_mode` — `'none'` mode returns only minimal checks
4. All error `ValidationResult.code` values are SCREAMING_SNAKE_CASE as defined
5. Given specific inputs, the function returns the correct validation codes (see required behaviors below)
6. `npm test -- --run` passes — `it.todo` stubs from Story 1.1 remain as todos, not failing

## Tasks / Subtasks

- [ ] Create `src/lib/validation.ts` (AC: 1, 2)
  - [ ] File header comment: `// Pure function — NO server imports. Runs on client and server.`
  - [ ] Import only from `@/lib/types/validation` and `@/lib/types/state-config`
  - [ ] Implement `validateTrip(trip: TripInput, stateConfig: StateConfig): ValidationOutput`
- [ ] Implement validation branches by `validation_mode` (AC: 3)
  - [ ] `'none'` mode: only check `DATE_IN_FUTURE` and `NO_MINUTES_LOGGED`
  - [ ] `'full'` mode: all checks below
- [ ] Implement all required error codes (AC: 4, 5)
- [ ] Verify `npm test -- --run` passes (AC: 6)

## Dev Notes

### Prerequisites

Story 1.1 must be complete: `src/lib/types/validation.ts` and `src/lib/validation.fixtures.ts` must exist.

### Zero Server Imports — Hard Rule

`src/lib/validation.ts` must NOT import:
- `next/headers`
- Drizzle / `@/db` / `@/db/schema`
- `@/auth`
- `import 'server-only'`
- Any Next.js server utilities

The TypeScript compiler will catch direct imports. The risk is re-exporting something that chains to a server-only module — audit your import tree.

### Validation Logic

```typescript
export function validateTrip(trip: TripInput, stateConfig: StateConfig): ValidationOutput {
  const errors: ValidationResult[] = [];
  const warnings: ValidationResult[] = [];

  // 1. Date validation (all modes)
  if (!trip.tripDate) {
    errors.push({ code: 'DATE_REQUIRED', message: 'Date is required.', field: 'tripDate' });
  } else if (trip.tripDate > new Date().toISOString().split('T')[0]) {
    errors.push({ code: 'DATE_IN_FUTURE', message: 'Date cannot be in the future.', field: 'tripDate' });
  }

  // 2. Minutes validation (all modes)
  const totalMinutes = (trip.daytimeMinutes ?? 0) + (trip.nighttimeMinutes ?? 0);
  if (totalMinutes <= 0) {
    errors.push({ code: 'NO_MINUTES_LOGGED', message: 'At least one minute of driving must be logged.', field: 'daytimeMinutes' });
  }

  // Exit early for none-mode — skip all enum/field checks
  if (stateConfig.validation_mode === 'none') {
    return { errors, warnings };
  }

  // 3. Location type (full/hours_only/log_only mode)
  if (!trip.locationType) {
    errors.push({ code: 'LOCATION_REQUIRED', message: 'Location type is required.', field: 'locationType' });
  } else if (!stateConfig.location_type_options.includes(trip.locationType)) {
    errors.push({ code: 'LOCATION_INVALID', message: 'Invalid location type.', field: 'locationType' });
  }

  // 4. Weather
  if (!trip.weather) {
    errors.push({ code: 'WEATHER_REQUIRED', message: 'Weather condition is required.', field: 'weather' });
  } else if (!stateConfig.weather_options.includes(trip.weather)) {
    errors.push({ code: 'WEATHER_INVALID', message: 'Invalid weather condition.', field: 'weather' });
  }

  // 5. Minutes range
  if ((trip.daytimeMinutes ?? 0) < 0 || (trip.nighttimeMinutes ?? 0) < 0) {
    errors.push({ code: 'MINUTES_OUT_OF_RANGE', message: 'Minutes cannot be negative.', field: 'daytimeMinutes' });
  }

  // 6. Inclement minutes
  const inclementMin = trip.inclementMinutes ?? 0;
  if (inclementMin > totalMinutes) {
    errors.push({ code: 'INCLEMENT_EXCEEDS_TOTAL', message: 'Inclement minutes cannot exceed total minutes.', field: 'inclementMinutes' });
  }
  if (stateConfig.inclement_hours_required > 0) {
    const isInclement = trip.weather && ['rain', 'snow', 'fog', 'ice'].includes(trip.weather);
    if (isInclement && inclementMin === 0) {
      errors.push({ code: 'INCLEMENT_REQUIRED', message: 'Log inclement weather minutes for this weather condition.', field: 'inclementMinutes' });
    }
  }

  // 7. Supervisor
  if (stateConfig.supervisor_field_required && !trip.supervisorName?.trim()) {
    errors.push({ code: 'SUPERVISOR_REQUIRED', message: 'Supervisor name is required.', field: 'supervisorName' });
  }
  if (stateConfig.supervisor_license_field_required && !trip.supervisorLicense?.trim()) {
    errors.push({ code: 'SUPERVISOR_LICENSE_REQUIRED', message: 'Supervisor license is required.', field: 'supervisorLicense' });
  }

  // 8. Time order (if both start/end provided)
  if (trip.startTime && trip.endTime && trip.endTime <= trip.startTime) {
    errors.push({ code: 'TIME_ORDER_INVALID', message: 'End time must be after start time.', field: 'endTime' });
  }

  // 9. Notes length
  if (trip.notes && trip.notes.length > 500) {
    errors.push({ code: 'NOTES_TOO_LONG', message: 'Notes cannot exceed 500 characters.', field: 'notes' });
  }

  return { errors, warnings };
}
```

### Complete ValidationResult.code Vocabulary

All codes that must exist (from the epics AC):
`DATE_REQUIRED`, `DATE_IN_FUTURE`, `LOCATION_REQUIRED`, `LOCATION_INVALID`, `WEATHER_REQUIRED`, `WEATHER_INVALID`, `MINUTES_OUT_OF_RANGE`, `NO_MINUTES_LOGGED`, `INCLEMENT_EXCEEDS_TOTAL`, `INCLEMENT_REQUIRED`, `SUPERVISOR_REQUIRED`, `SUPERVISOR_LICENSE_REQUIRED`, `TIME_ORDER_INVALID`, `NOTES_TOO_LONG`

Codes NOT produced by `validateTrip()` — these come from Server Actions after DB queries:
- `OH_DAILY_CAP` — OH daily 4h cap (Story 3.2 adds this to addTripAction)
- `NC_WEEKLY_CAP` — NC weekly 10h cap (Story 3.2)

### Night-Hour Classification (Note: Deferred)

Story 3.1 does NOT implement night-hour re-classification. The trip form accepts `daytimeMinutes` and `nighttimeMinutes` as entered by the user. The `startTime`/`endTime` fields are stored and validated for order but night-hour auto-calculation from `StateConfig.timezone` is deferred to v2.1. Story 3.1 only validates TIME_ORDER_INVALID.

### it.todo Stubs Remain

The `src/lib/validation.test.ts` file (created in Story 1.1) has `it.todo(...)` stubs. Do **not** implement those tests in this story — they belong to Story 8.1. After adding `src/lib/validation.ts`, the test file will need to import `validateTrip`:

```typescript
// Add to the top of validation.test.ts:
import { validateTrip } from './validation';
import { validILTrip, ilStateConfig } from './validation.fixtures';
```

These imports are needed for Story 8.1 to work. You may add them now, or leave it for Story 8.1. If you add them, the `it.todo` stubs still show as skipped and `npm test -- --run` still passes.

### References

- Type definitions: [src/lib/types/validation.ts](src/lib/types/validation.ts), [src/lib/types/state-config.ts](src/lib/types/state-config.ts)
- Fixtures: [src/lib/validation.fixtures.ts](src/lib/validation.fixtures.ts)
- Test stubs: [src/lib/validation.test.ts](src/lib/validation.test.ts)
- Architecture Pattern 3 (validateTrip call sites), Cross-Cutting Concern #2, #3

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
