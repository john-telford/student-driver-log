# Story 1.1: Create State Config Type System and Foundation Files

Status: ready-for-dev

## Story

As a developer,
I want a complete type system for state configurations, a single-state stub, validation fixtures, and test skeletons in place,
so that all subsequent issues have a stable, compile-verified foundation to build on.

## Acceptance Criteria

1. `src/lib/types/state-config.ts` exports `StateConfig`, `ReportColumn`, `ValidationMode`, `ReportColumnDataType` with all fields defined in the PRD Section 6.1
2. `src/lib/types/validation.ts` exports `TripInput`, `ValidationResult` (with `.code: string` and `.message: string`), and `ValidationOutput` (`{ errors: ValidationResult[], warnings: ValidationResult[] }`)
3. Neither `src/lib/types/state-config.ts` nor `src/lib/types/validation.ts` has `import 'server-only'` — these type files must be importable from both Client Components and Server Components
4. `src/data/state-configs.ts` has `import 'server-only'` as its **first line**, exports `STATE_CONFIGS: Record<string, StateConfig>` and `STATE_CODES: string[]`, and contains a complete valid Illinois entry matching current app behavior. Its type imports come from `src/lib/types/state-config.ts`, not co-located.
5. `src/lib/validation.fixtures.ts` exports at least one canonical `TripInput` stub and one `StateConfig` stub (IL) usable in test files without importing `src/data/state-configs.ts` directly
6. `src/lib/validation.test.ts` contains a `describe('validateTrip')` block with named `it.todo(...)` stubs covering at minimum the cases listed in Tasks below
7. `npm run build` passes with no TypeScript errors
8. `npm test -- --run` passes — all todos skipped, not failing

## Tasks / Subtasks

- [ ] Create `src/lib/types/state-config.ts` (AC: 1, 3)
  - [ ] Export `ValidationMode` as `'full' | 'hours_only' | 'log_only' | 'none'`
  - [ ] Export `ReportColumnDataType` union (see exact values in Dev Notes)
  - [ ] Export `ReportColumn` interface (see exact shape in Dev Notes)
  - [ ] Export `StateConfig` interface with all fields (see exact shape in Dev Notes)
  - [ ] No `import 'server-only'`
- [ ] Create `src/lib/types/validation.ts` (AC: 2, 3)
  - [ ] Export `TripInput` (see exact shape in Dev Notes)
  - [ ] Export `ValidationResult` with `code: string`, `message: string`, optional `field?: string`
  - [ ] Export `ValidationOutput` with `errors: ValidationResult[]` and `warnings: ValidationResult[]`
  - [ ] No `import 'server-only'`
- [ ] Create `src/data/state-configs.ts` (AC: 4)
  - [ ] `import 'server-only'` as line 1
  - [ ] Import `StateConfig` from `@/lib/types/state-config`
  - [ ] Build complete Illinois entry (see exact values in Dev Notes)
  - [ ] Export `STATE_CONFIGS: Record<string, StateConfig>` keyed by 2-letter state code
  - [ ] Export `STATE_CODES: string[]` (array of keys from STATE_CONFIGS)
- [ ] Create `src/lib/validation.fixtures.ts` (AC: 5)
  - [ ] Export `validILTrip: TripInput` — a valid IL trip with all required fields
  - [ ] Export `ilStateConfig: StateConfig` — hand-coded IL stub (do NOT import from `src/data/state-configs.ts`)
  - [ ] Import types from `@/lib/types/state-config` and `@/lib/types/validation` only
- [ ] Create `src/lib/validation.test.ts` (AC: 6)
  - [ ] Import `describe` and `it` from `'vitest'` (project uses explicit imports, not globals)
  - [ ] Single `describe('validateTrip', () => { ... })` block
  - [ ] Add all `it.todo(...)` stubs listed in Dev Notes — exact names matter for Story 8.1
- [ ] Verify build and tests pass (AC: 7, 8)

## Dev Notes

### New Directories — Create Both

`src/lib/types/` and `src/data/` do not exist yet. Create them by writing files into those paths.

### Critical Boundary Rules

| File | `import 'server-only'`? | Why |
|---|---|---|
| `src/lib/types/state-config.ts` | **NO** | Must be importable by Client Components for type checking |
| `src/lib/types/validation.ts` | **NO** | `validateTrip()` runs on client — needs TripInput there |
| `src/data/state-configs.ts` | **YES (line 1)** | Contains raw state data; build error if client imports it |
| `src/lib/validation.fixtures.ts` | **NO** | Imported by test files |

The `import 'server-only'` guard on `state-configs.ts` is enforced at build time by Next.js. If any Client Component accidentally imports it, `npm run build` will fail with a clear error. This is intentional (see Architecture Decision 2).

### Exact Type Definitions

**`src/lib/types/state-config.ts`**

```typescript
export type ValidationMode = 'full' | 'hours_only' | 'log_only' | 'none';

export type ReportColumnDataType =
  | 'date'
  | 'text'
  | 'minutes_hhmm'
  | 'minutes_raw'
  | 'cumulative_minutes'
  | 'initials'
  | 'signature'
  | 'custom';

export type ReportColumn = {
  label: string;                // Column header displayed in table and PDF
  field_key: string;            // Identifies the data source (see field_key vocabulary below)
  data_type: ReportColumnDataType;
  custom_field_name?: string;   // Required when field_key === 'custom'
  html_width_pct?: number;      // Optional override for HTML table column width
  pdf_width_pt?: number;        // Optional override for PDF column width
};

export type StateConfig = {
  // Identity
  state_code: string;           // 2-letter uppercase abbreviation, e.g. 'IL', 'DC'
  state_name: string;           // Full name, e.g. 'Illinois'
  state_agency: string;         // e.g. 'Illinois Secretary of State'
  tier: 1 | 2 | 3;             // 1=manually verified, 2=IIHS data, 3=unverified
  effective_date: string;       // YYYY-MM-DD, last verified date
  source_url: string;           // Official source URL — must be non-empty (CI validates)
  timezone: string;             // IANA timezone, e.g. 'America/Chicago'

  // Hour requirements
  validation_mode: ValidationMode;
  total_hours_required: number; // 0 for 'none' mode states (AR, MS, NJ)
  nighttime_hours_required: number;
  inclement_hours_required: number;
  hold_period_days: number;     // 0 if no hold period
  permit_min_age: number;       // Minimum age to obtain a learner's permit

  // Night driving classification for validateTrip()
  night_start_hour: number;     // 0-23, local time when nighttime begins
  night_end_hour: number;       // 0-23, local time when nighttime ends
  night_driving_definition: string; // Human-readable description for UI

  // Conditional trip fields
  supervisor_field_required: boolean;
  supervisor_license_field_required: boolean;
  supervisor_rules_display: string;  // Plain text shown below supervisor fields

  // Driver education
  hours_waived_with_driver_ed: boolean;       // True for AL, AZ, MN, NE, NV, OR, SD, WV
  driver_ed_hours_count_toward_total: boolean;

  // Log submission requirements
  log_submission_required: boolean;
  log_notarization_required: boolean;

  // State-specific dropdown options (populates form fields)
  location_type_options: string[];
  weather_options: string[];

  // Official form
  official_form_name: string | null;
  official_form_url: string | null;

  // Report
  attestation_language: string;
  report_columns: ReportColumn[];
};
```

**`src/lib/types/validation.ts`**

```typescript
export type TripInput = {
  tripDate: string;                    // YYYY-MM-DD
  locationType: string;                // from stateConfig.location_type_options
  weather: string;                     // from stateConfig.weather_options
  daytimeMinutes: number;
  nighttimeMinutes: number;
  inclementMinutes: number;            // default 0; subset of daytime+nighttime
  supervisorName?: string | null;
  supervisorLicense?: string | null;
  startTime?: string | null;           // UTC ISO8601, e.g. '2026-04-30T22:00:00.000Z'
  endTime?: string | null;             // UTC ISO8601
  notes?: string | null;
};

export type ValidationResult = {
  code: string;     // SCREAMING_SNAKE_CASE — the stable assertion surface in tests
  message: string;  // Human-readable — do NOT assert on this in tests (it changes)
  field?: string;   // Form field name the error belongs to, for inline display
};

export type ValidationOutput = {
  errors: ValidationResult[];    // Block submission
  warnings: ValidationResult[];  // Allow submission, show toast
};
```

### field_key Vocabulary (for report_columns)

The static data validation script (Story 1.2) will assert that every `field_key` in `report_columns` is in this vocabulary. Use exactly these values:

**Trip data fields** (look up value from `TripInput`):
- `'tripDate'` — use with `data_type: 'date'`
- `'locationType'` — use with `data_type: 'text'`
- `'weather'` — use with `data_type: 'text'`
- `'daytimeMinutes'` — use with `data_type: 'minutes_hhmm'` or `'minutes_raw'`
- `'nighttimeMinutes'` — use with `data_type: 'minutes_hhmm'` or `'minutes_raw'`
- `'inclementMinutes'` — use with `data_type: 'minutes_hhmm'` or `'minutes_raw'`
- `'supervisorName'` — use with `data_type: 'text'`
- `'supervisorLicense'` — use with `data_type: 'text'`
- `'startTime'` — use with `data_type: 'text'`
- `'endTime'` — use with `data_type: 'text'`
- `'notes'` — use with `data_type: 'text'`

**Computed running totals** (resolved from context in `formatCell`):
- `'cumulativeDay'` — use with `data_type: 'cumulative_minutes'`
- `'cumulativeNight'` — use with `data_type: 'cumulative_minutes'`
- `'cumulativeTotal'` — use with `data_type: 'cumulative_minutes'`

**Special** (no trip data lookup needed):
- `'initials'` — use with `data_type: 'initials'`
- `'signature'` — use with `data_type: 'signature'`
- `'custom'` — use with `data_type: 'custom'`, requires `custom_field_name`

### Complete Illinois Entry for `src/data/state-configs.ts`

The IL entry must match the column layout of the existing `src/app/api/report/pdf/document.tsx` COLS (9 columns). Do not change the existing PDF until Story 5.2.

```typescript
import 'server-only';
import type { StateConfig } from '@/lib/types/state-config';

const IL: StateConfig = {
  state_code: 'IL',
  state_name: 'Illinois',
  state_agency: 'Illinois Secretary of State',
  tier: 1,
  effective_date: '2026-01-01',
  source_url: 'https://www.ilsos.gov/departments/drivers/graduated_dl/home.html',
  timezone: 'America/Chicago',

  validation_mode: 'full',
  total_hours_required: 50,
  nighttime_hours_required: 10,
  inclement_hours_required: 0,
  hold_period_days: 0,
  permit_min_age: 15,

  night_start_hour: 20,  // 8 PM — IL "after dark" approximation for v2.0
  night_end_hour: 6,     // 6 AM
  night_driving_definition: 'After sunset and before sunrise (approximately after 8:00 PM and before 6:00 AM).',

  supervisor_field_required: false,
  supervisor_license_field_required: false,
  supervisor_rules_display: 'A licensed driver age 21 or older must accompany you during all practice sessions.',

  hours_waived_with_driver_ed: false,
  driver_ed_hours_count_toward_total: false,

  log_submission_required: false,
  log_notarization_required: false,

  location_type_options: ['highway', 'residential', 'rural', 'urban', 'parking_lot', 'race_track'],
  weather_options: ['clear', 'rain', 'snow', 'fog', 'ice'],

  official_form_name: 'DSD X 152.4',
  official_form_url: null,  // TODO Story 1.2: add the actual ilsos.gov PDF URL

  attestation_language:
    'I hereby certify under the penalties of perjury that the entries above are ' +
    'true and correct to the best of my knowledge.',

  report_columns: [
    { label: 'Date',                 field_key: 'tripDate',         data_type: 'date',               html_width_pct: 9  },
    { label: 'Location of Practice', field_key: 'locationType',     data_type: 'text',               html_width_pct: 18 },
    { label: 'Weather Conditions',   field_key: 'weather',          data_type: 'text',               html_width_pct: 12 },
    { label: 'Daytime',              field_key: 'daytimeMinutes',   data_type: 'minutes_hhmm',       html_width_pct: 8  },
    { label: 'Daytime Total',        field_key: 'cumulativeDay',    data_type: 'cumulative_minutes', html_width_pct: 9  },
    { label: 'Nighttime',            field_key: 'nighttimeMinutes', data_type: 'minutes_hhmm',       html_width_pct: 8  },
    { label: 'Nighttime Total',      field_key: 'cumulativeNight',  data_type: 'cumulative_minutes', html_width_pct: 9  },
    { label: 'Grand Total',          field_key: 'cumulativeTotal',  data_type: 'cumulative_minutes', html_width_pct: 9  },
    { label: 'Initials',             field_key: 'initials',         data_type: 'initials',           html_width_pct: 7  },
  ],
};

export const STATE_CONFIGS: Record<string, StateConfig> = {
  IL,
};

export const STATE_CODES: string[] = Object.keys(STATE_CONFIGS);
```

**Note:** `location_type_options` and `weather_options` use the same values as the existing `locationTypes` and `weatherConditions` const arrays in `src/db/schema.ts`. Do NOT import from schema.ts into state-configs.ts (server-only to server-only import is fine, but state-configs.ts should be self-contained for clarity). The option arrays are just `string[]` — re-state them inline.

### Validation Fixtures (`src/lib/validation.fixtures.ts`)

Import from `@/lib/types/state-config` and `@/lib/types/validation` only — never from `src/data/state-configs.ts`.

```typescript
import type { TripInput } from '@/lib/types/validation';
import type { StateConfig } from '@/lib/types/state-config';

export const validILTrip: TripInput = {
  tripDate: '2026-04-30',
  locationType: 'residential',
  weather: 'clear',
  daytimeMinutes: 60,
  nighttimeMinutes: 0,
  inclementMinutes: 0,
};

// Minimal IL stub — enough for validateTrip tests.
// For the full entry see src/data/state-configs.ts (server-only).
export const ilStateConfig: StateConfig = {
  state_code: 'IL',
  state_name: 'Illinois',
  state_agency: 'Illinois Secretary of State',
  tier: 1,
  effective_date: '2026-01-01',
  source_url: 'https://www.ilsos.gov/departments/drivers/graduated_dl/home.html',
  timezone: 'America/Chicago',
  validation_mode: 'full',
  total_hours_required: 50,
  nighttime_hours_required: 10,
  inclement_hours_required: 0,
  hold_period_days: 0,
  permit_min_age: 15,
  night_start_hour: 20,
  night_end_hour: 6,
  night_driving_definition: 'After sunset and before sunrise.',
  supervisor_field_required: false,
  supervisor_license_field_required: false,
  supervisor_rules_display: 'A licensed driver age 21 or older must accompany you.',
  hours_waived_with_driver_ed: false,
  driver_ed_hours_count_toward_total: false,
  log_submission_required: false,
  log_notarization_required: false,
  location_type_options: ['highway', 'residential', 'rural', 'urban', 'parking_lot', 'race_track'],
  weather_options: ['clear', 'rain', 'snow', 'fog', 'ice'],
  official_form_name: 'DSD X 152.4',
  official_form_url: null,
  attestation_language: 'I hereby certify that the entries above are true and correct.',
  report_columns: [],  // Not needed for validateTrip tests
};
```

### Test Stubs (`src/lib/validation.test.ts`)

Vitest requires explicit imports — no globals (see `vitest.config.ts`, no `globals: true`). The `validateTrip` function does not exist yet (Story 3.1 creates it) — do **not** import it in this story. The describe block must exist and `npm test -- --run` must pass with all stubs showing as skipped.

```typescript
import { describe, it } from 'vitest';

describe('validateTrip', () => {
  // IL baseline
  it.todo('IL baseline: valid trip returns no errors');
  it.todo('IL baseline: trip date in future returns DATE_IN_FUTURE error');

  // PA inclement
  it.todo('PA inclement: inclement weather with 0 inclement_minutes returns INCLEMENT_REQUIRED');
  it.todo('PA inclement: inclement_minutes exceeding daytime + nighttime returns INCLEMENT_EXCEEDS_TOTAL');
  it.todo('PA inclement: inclement_minutes equal to daytime + nighttime passes validation');

  // MN supervisor
  it.todo('MN supervisor: empty supervisorName with supervisor_field_required returns SUPERVISOR_REQUIRED');

  // DC supervisor license
  it.todo('DC supervisor license: empty supervisorLicense with supervisor_license_field_required returns SUPERVISOR_LICENSE_REQUIRED');

  // AR none-mode
  it.todo('AR none-mode: invalid locationType does NOT return LOCATION_INVALID');
  it.todo('AR none-mode: both daytimeMinutes and nighttimeMinutes at 0 returns NO_MINUTES_LOGGED');

  // OH daily cap (server action concern — pure function does NOT produce this)
  it.todo('OH daily cap: validateTrip does NOT return OH_DAILY_CAP — cumulative cap is a Server Action concern');
});
```

**The exact stub names above must match what Story 8.1 expects** — Story 8.1 will replace each `it.todo` with a passing test. Do not paraphrase or rename them.

### Existing Code This Story Touches

**Does not modify any existing files.** This story creates 5 new files only:
- `src/lib/types/state-config.ts` (NEW)
- `src/lib/types/validation.ts` (NEW)
- `src/data/state-configs.ts` (NEW)
- `src/lib/validation.fixtures.ts` (NEW)
- `src/lib/validation.test.ts` (NEW)

**Existing code to understand (read, do not modify):**
- [src/db/schema.ts](src/db/schema.ts) — `locationTypes` and `weatherConditions` const arrays must match IL's `location_type_options` and `weather_options` (they do, by design).
- [src/app/api/report/pdf/document.tsx](src/app/api/report/pdf/document.tsx) — The hardcoded IL COLS array (9 columns). The IL `report_columns` entry in state-configs.ts must mirror this structure. This file is **not** replaced until Story 5.2.

### Architecture Patterns to Follow

All from [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md):

- **Pattern 1** — `STATE_CONFIGS[user.state_code]` is the only correct access pattern. No DB fetch, no helper function, no React Context.
- **Pattern 8** — Canonical file locations. `src/data/` is a new directory for read-only static data only (no async functions, no DB imports, no dynamic computation in this directory ever).
- **Decision 2** — `src/data/state-configs.ts` must have `import 'server-only'` to enforce the server boundary at build time.
- **Cross-Cutting Concern #3** — Always branch on `stateConfig.validation_mode`, never on `total_hours_required === 0`.

### Anti-Patterns to Prevent

- **Do not** put `import 'server-only'` in the type files — they must be importable by Client Components
- **Do not** co-locate the StateConfig/ReportColumn types inside `state-configs.ts` — they must be in separate files in `src/lib/types/`
- **Do not** import `src/data/state-configs.ts` from `validation.fixtures.ts` — fixtures must be independently usable in tests without the server-only module
- **Do not** add any test implementations in `validation.test.ts` — all test bodies belong to Story 8.1
- **Do not** create a `src/lib/validation.ts` stub — the pure function belongs to Story 3.1; having an empty stub would break type expectations
- **Do not** create barrel files (`index.ts` re-exports) in any of these new directories
- **Do not** import from `src/db/schema.ts` in the new type files — the types are completely independent of the DB layer

### Project Structure Notes

- **Path alias:** `@/` resolves to `src/` — use `@/lib/types/state-config` not `../../lib/types/state-config`
- **TypeScript strict mode** is enabled — all fields in `StateConfig` must have values in the IL entry
- **No barrel files** — each file is imported directly by path, never through an `index.ts`
- **ES modules** — no `require()`, no `module.exports`

### References

- Acceptance Criteria source: [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) — Epic 1, Story 1.1
- Architecture contracts: [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md) — Decisions 1-2, Patterns 1, 4, 8
- Existing PDF (IL column reference): [src/app/api/report/pdf/document.tsx](src/app/api/report/pdf/document.tsx) — COLS constant
- Existing DB schema (enum values): [src/db/schema.ts](src/db/schema.ts) — `locationTypes`, `weatherConditions`
- Vitest config: [vitest.config.ts](vitest.config.ts) — no globals; explicit `import { describe, it } from 'vitest'` required

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
