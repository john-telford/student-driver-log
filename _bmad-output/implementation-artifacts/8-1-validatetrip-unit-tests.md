# Story 8.1: validateTrip Unit Tests

Status: ready-for-dev

## Story

As a developer,
I want the complete suite of `validateTrip()` unit tests passing,
so that state-specific validation logic is regression-protected and all `it.todo` stubs from Story 1.1 are resolved.

## Acceptance Criteria

1. All `it.todo` stubs in `src/lib/validation.test.ts` are replaced with passing tests — no `it.todo` remains
2. Suite covers at minimum 10 test cases across 6+ state configs, asserting on `.code` (never `.message`)
3. All 10 required test cases listed below pass
4. `formatCell` tests in `src/lib/report/format-cell.test.ts` (from Story 5.1) continue to pass
5. `npm test -- --run` passes with zero failures and zero skipped tests in these files

## Tasks / Subtasks

- [ ] Add `validateTrip` import and fixture imports to `src/lib/validation.test.ts` (if not already added in Story 3.1)
- [ ] Add additional state config fixtures to `src/lib/validation.fixtures.ts` as needed: PA, MN, DC, AR, OH
- [ ] Replace all 10 `it.todo` stubs with passing implementations (AC: 1-3)
- [ ] Run `npm test -- --run` and verify all tests pass (AC: 5)

## Dev Notes

### Prerequisites

Stories 3.1 (validateTrip implemented), 5.1 (format-cell.test.ts created). All prior stories must be complete.

### Required Test Implementations

Replace each `it.todo` with the following implementations:

```typescript
import { describe, it, expect } from 'vitest';
import { validateTrip } from './validation';
import { validILTrip, ilStateConfig } from './validation.fixtures';
import type { TripInput } from '@/lib/types/validation';
import type { StateConfig } from '@/lib/types/state-config';

describe('validateTrip', () => {

  // IL baseline
  it('IL baseline: valid trip returns no errors', () => {
    const result = validateTrip(validILTrip, ilStateConfig);
    expect(result.errors).toHaveLength(0);
  });

  it('IL baseline: trip date in future returns DATE_IN_FUTURE error', () => {
    const trip: TripInput = { ...validILTrip, tripDate: '2099-01-01' };
    const result = validateTrip(trip, ilStateConfig);
    expect(result.errors.some(e => e.code === 'DATE_IN_FUTURE')).toBe(true);
  });

  // PA inclement
  it('PA inclement: inclement weather with 0 inclement_minutes returns INCLEMENT_REQUIRED', () => {
    const result = validateTrip(
      { ...validILTrip, weather: 'rain', inclementMinutes: 0 },
      paStateConfig  // inclement_hours_required > 0
    );
    expect(result.errors.some(e => e.code === 'INCLEMENT_REQUIRED')).toBe(true);
  });

  it('PA inclement: inclement_minutes exceeding daytime + nighttime returns INCLEMENT_EXCEEDS_TOTAL', () => {
    const trip: TripInput = { ...validILTrip, daytimeMinutes: 30, nighttimeMinutes: 0, inclementMinutes: 31, weather: 'rain' };
    const result = validateTrip(trip, paStateConfig);
    expect(result.errors.some(e => e.code === 'INCLEMENT_EXCEEDS_TOTAL')).toBe(true);
  });

  it('PA inclement: inclement_minutes equal to daytime + nighttime passes validation', () => {
    const trip: TripInput = { ...validILTrip, daytimeMinutes: 30, nighttimeMinutes: 0, inclementMinutes: 30, weather: 'rain' };
    const result = validateTrip(trip, paStateConfig);
    expect(result.errors.some(e => e.code === 'INCLEMENT_EXCEEDS_TOTAL')).toBe(false);
    expect(result.errors.some(e => e.code === 'INCLEMENT_REQUIRED')).toBe(false);
  });

  // MN supervisor
  it('MN supervisor: empty supervisorName with supervisor_field_required returns SUPERVISOR_REQUIRED', () => {
    const trip: TripInput = { ...validILTrip, supervisorName: '' };
    const result = validateTrip(trip, mnStateConfig);  // supervisor_field_required: true
    expect(result.errors.some(e => e.code === 'SUPERVISOR_REQUIRED')).toBe(true);
  });

  // DC supervisor license
  it('DC supervisor license: empty supervisorLicense with supervisor_license_field_required returns SUPERVISOR_LICENSE_REQUIRED', () => {
    const trip: TripInput = { ...validILTrip, supervisorName: 'Jane Doe', supervisorLicense: '' };
    const result = validateTrip(trip, dcStateConfig);  // supervisor_license_field_required: true
    expect(result.errors.some(e => e.code === 'SUPERVISOR_LICENSE_REQUIRED')).toBe(true);
  });

  // AR none-mode
  it('AR none-mode: invalid locationType does NOT return LOCATION_INVALID', () => {
    const trip: TripInput = { ...validILTrip, locationType: 'invalid_location' };
    const result = validateTrip(trip, arStateConfig);  // validation_mode: 'none'
    expect(result.errors.some(e => e.code === 'LOCATION_INVALID')).toBe(false);
  });

  it('AR none-mode: both daytimeMinutes and nighttimeMinutes at 0 returns NO_MINUTES_LOGGED', () => {
    const trip: TripInput = { ...validILTrip, daytimeMinutes: 0, nighttimeMinutes: 0 };
    const result = validateTrip(trip, arStateConfig);
    expect(result.errors.some(e => e.code === 'NO_MINUTES_LOGGED')).toBe(true);
  });

  // OH daily cap
  it('OH daily cap: validateTrip does NOT return OH_DAILY_CAP — cumulative cap is a Server Action concern', () => {
    // The OH daily cap check happens in addTripAction/updateTripAction via DB query.
    // validateTrip() is a pure function with no DB access and must never return this code.
    const result = validateTrip(validILTrip, ohStateConfig);
    expect(result.errors.some(e => e.code === 'OH_DAILY_CAP')).toBe(false);
    expect(result.warnings.some(w => w.code === 'OH_DAILY_CAP')).toBe(false);
  });

});
```

### Additional Fixtures Needed

Add to `src/lib/validation.fixtures.ts`:

```typescript
export const paStateConfig: StateConfig = {
  ...ilStateConfig,
  state_code: 'PA',
  state_name: 'Pennsylvania',
  state_agency: 'Pennsylvania Department of Transportation',
  inclement_hours_required: 5,  // PA requires inclement hours
};

export const mnStateConfig: StateConfig = {
  ...ilStateConfig,
  state_code: 'MN',
  state_name: 'Minnesota',
  state_agency: 'Minnesota Department of Public Safety',
  supervisor_field_required: true,
};

export const dcStateConfig: StateConfig = {
  ...ilStateConfig,
  state_code: 'DC',
  state_name: 'District of Columbia',
  state_agency: 'DC DMV',
  supervisor_field_required: true,
  supervisor_license_field_required: true,
};

export const arStateConfig: StateConfig = {
  ...ilStateConfig,
  state_code: 'AR',
  state_name: 'Arkansas',
  state_agency: 'Arkansas Department of Finance and Administration',
  validation_mode: 'none',
  total_hours_required: 0,
  nighttime_hours_required: 0,
  inclement_hours_required: 0,
};

export const ohStateConfig: StateConfig = {
  ...ilStateConfig,
  state_code: 'OH',
  state_name: 'Ohio',
  state_agency: 'Ohio Bureau of Motor Vehicles',
  // OH daily cap (4h) is NOT a StateConfig field — it's hardcoded in the Server Action
};
```

### Assertion Style

Always assert on `.code`, never `.message`:
```typescript
// ✅ correct
expect(result.errors.some(e => e.code === 'INCLEMENT_REQUIRED')).toBe(true);
// ❌ wrong — message strings change for copy reasons
expect(result.errors[0].message).toBe('Log inclement weather minutes...');
```

### format-cell.test.ts Regression

Run `npm test -- --run` to confirm `format-cell.test.ts` (Story 5.1) still passes. Do not modify it in this story.

### References

- Test file to complete: [src/lib/validation.test.ts](src/lib/validation.test.ts)
- Fixtures to extend: [src/lib/validation.fixtures.ts](src/lib/validation.fixtures.ts)
- validateTrip implementation: [src/lib/validation.ts](src/lib/validation.ts)
- format-cell tests: [src/lib/report/format-cell.test.ts](src/lib/report/format-cell.test.ts)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
