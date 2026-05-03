# Story 1.2: Populate Core State Configurations (IL + Representative Set)

Status: ready-for-dev

## Story

As a developer,
I want Illinois plus one representative state per validation mode and edge-case category populated in `src/data/state-configs.ts`,
so that the validation engine, trip form, dashboard, and report renderer can be built and tested against a realistic set of state configs before all 51 are complete.

## Acceptance Criteria

1. `src/data/state-configs.ts` contains at minimum 11 entries covering all validation-mode variants and major edge cases: IL, CO, PA, MN, DC, OH, NC, ME, SD, AR, plus one Tier 2 attestation state (NY or TX)
2. Every entry satisfies the TypeScript compiler with no type errors or `as any` casts
3. A static data validation script (added in this story) runs in CI and asserts: all `field_key` values use the defined vocabulary; all `source_url` fields are non-empty strings; `validation_mode === 'none'` entries have `total_hours_required === 0`; `validation_mode === 'full'` entries have `total_hours_required > 0`
4. The validation script passes for all entries present
5. `npm run build` and `npm test -- --run` both pass

## Tasks / Subtasks

- [ ] Research and add 10 new state entries to `src/data/state-configs.ts` (AC: 1, 2)
  - [ ] CO — `validation_mode: 'full'`, supervisor name required (used in Story 8.2 E2E test)
  - [ ] PA — `validation_mode: 'full'`, inclement hours required
  - [ ] MN — `validation_mode: 'full'`, supervisor + start/end time in report_columns
  - [ ] DC — `validation_mode: 'full'`, supervisor license required
  - [ ] OH — `validation_mode: 'full'`, daily cap warning (server-side only)
  - [ ] NC — `validation_mode: 'full'`, weekly cap warning (server-side only)
  - [ ] ME — `validation_mode: 'full'`, log notarization required
  - [ ] SD — `validation_mode: 'full'`, inclement + log submission required
  - [ ] AR — `validation_mode: 'none'`, no hour requirement
  - [ ] NY or TX — Tier 2 attestation state
- [ ] Update `STATE_CODES` (auto-derived from `Object.keys(STATE_CONFIGS)`) — no manual change needed if IL was built correctly in Story 1.1
- [ ] Create static validation script `scripts/validate-state-configs.ts` (AC: 3, 4)
  - [ ] Verify every `field_key` in `report_columns` is in the defined vocabulary
  - [ ] Verify every `source_url` is a non-empty string
  - [ ] Verify `validation_mode === 'none'` ↔ `total_hours_required === 0`
  - [ ] Add script to CI (AC: 3) — add `npm run validate:states` step or run inline
- [ ] Add `validate:states` script to `package.json` if adding as npm script
- [ ] Verify build and tests pass (AC: 5)

## Dev Notes

### Prerequisite

Story 1.1 must be complete. The `StateConfig` type in `src/lib/types/state-config.ts` is the source of truth for all field names.

### Key State Details to Research

Look up each state's official learner permit page (use the `source_url` you supply). Minimum data needed per entry:

| State | total_hrs | night_hrs | inclement_hrs | supervisor_field | supervisor_license | hold_days | notes |
|---|---|---|---|---|---|---|---|
| CO | 50 | 10 | 0 | **true** | false | 12 months (365) | supervisor_name in report_columns |
| PA | 65 | 10 | **5** | false | false | 6 months (180) | inclement_minutes in form |
| MN | 50 | 15 | 0 | **true** | false | 6 months (180) | supervisor name + start/end time columns |
| DC | 40 | 10 | 0 | **true** | **true** | 6 months (180) | supervisor_license in form |
| OH | 50 | 10 | 0 | false | false | 6 months (180) | daily cap 4h — Server Action, NOT validateTrip |
| NC | 60 | 10 | 0 | false | false | 12 months (365) | weekly cap 10h — Server Action, NOT validateTrip |
| ME | 70 | 0 | 0 | false | false | varies | log_notarization_required: true |
| SD | 50 | 10 | **5** | false | false | 6 months (180) | inclement + log_submission_required |
| AR | 0 | 0 | 0 | false | false | 0 | validation_mode: 'none' |

**Verify these numbers against each state's `source_url` before submitting.** The values above are approximate; the official DMV page is authoritative.

### report_columns for New States

New states need `report_columns` entries appropriate for their form. Rules:
- CO needs a supervisor name column: `{ label: 'Supervisor Name', field_key: 'supervisorName', data_type: 'text' }`
- PA needs an inclement column: `{ label: 'Inclement Weather Minutes', field_key: 'inclementMinutes', data_type: 'minutes_hhmm' }`
- MN needs supervisor + start/end time columns
- AR (none-mode): `report_columns: []` is acceptable since the form doesn't render state-specific columns
- For states with no official form (some Tier 2): `report_columns: []`, `official_form_name: null`, `official_form_url: null`

### Static Validation Script Location

Create `scripts/validate-state-configs.ts`. Run with `npx tsx scripts/validate-state-configs.ts` (tsx is already available via the Next.js toolchain — check devDeps; if not present, use `ts-node` or add `tsx`).

```typescript
// scripts/validate-state-configs.ts
import { STATE_CONFIGS } from '../src/data/state-configs';

// VALID_FIELD_KEYS matches the vocabulary defined in Story 1.1
const VALID_FIELD_KEYS = [
  'tripDate', 'locationType', 'weather', 'daytimeMinutes', 'nighttimeMinutes',
  'inclementMinutes', 'supervisorName', 'supervisorLicense', 'startTime', 'endTime',
  'notes', 'cumulativeDay', 'cumulativeNight', 'cumulativeTotal',
  'initials', 'signature', 'custom',
];

let errors = 0;
for (const [code, cfg] of Object.entries(STATE_CONFIGS)) {
  if (!cfg.source_url) { console.error(`${code}: source_url is empty`); errors++; }
  if (cfg.validation_mode === 'none' && cfg.total_hours_required !== 0) {
    console.error(`${code}: none-mode must have total_hours_required === 0`); errors++;
  }
  if (cfg.validation_mode === 'full' && cfg.total_hours_required <= 0) {
    console.error(`${code}: full-mode must have total_hours_required > 0`); errors++;
  }
  for (const col of cfg.report_columns) {
    if (!VALID_FIELD_KEYS.includes(col.field_key)) {
      console.error(`${code}: invalid field_key '${col.field_key}' in report_columns`); errors++;
    }
    if (col.field_key === 'custom' && !col.custom_field_name) {
      console.error(`${code}: custom column missing custom_field_name`); errors++;
    }
  }
}
if (errors > 0) { console.error(`\n${errors} validation error(s) found.`); process.exit(1); }
console.log(`✓ All ${Object.keys(STATE_CONFIGS).length} state configs valid.`);
```

**Important:** `state-configs.ts` uses `import 'server-only'`. Running this script directly with `tsx` from the CLI won't trigger Next.js's server-only guard — the script will import fine. The guard only fires at Next.js build time (when a Client Component tries to import it).

### IL official_form_url

Fill in `official_form_url` for the IL entry added in Story 1.1. Look it up from `https://www.ilsos.gov` and add the PDF URL. The IL story 1.1 set it to `null` as a placeholder.

### Tier 2 State Entry

For the Tier 2 state (NY or TX), set `tier: 2`. The `attestation_language` should reference that it was sourced from IIHS data. The validation script does not differentiate by tier — all fields still required.

### Anti-Patterns

- Do NOT hard-code OH/NC cap hours in state config — these are enforced by Server Actions via DB query, not by `validateTrip()` or state config fields
- Do NOT skip `source_url` even for Tier 2 states — use the IIHS data URL as source
- Do NOT co-locate any of the type definitions — they live in `src/lib/types/`
- Do NOT modify `src/lib/types/state-config.ts` — if you need a new field, discuss first; adding fields is a type-breaking change

### References

- Type definitions: [src/lib/types/state-config.ts](src/lib/types/state-config.ts) (created in Story 1.1)
- Data file to extend: [src/data/state-configs.ts](src/data/state-configs.ts)
- field_key vocabulary: Story 1.1 dev notes
- Architecture pattern 1 (StateConfig access): [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
