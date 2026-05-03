# Story 1.3: Populate All Remaining State Configurations

Status: ready-for-dev

## Story

As a developer,
I want all remaining 40+ jurisdictions populated in `src/data/state-configs.ts` with manually verified data for Tier 1 states,
so that the app correctly serves users from every US state and DC at launch.

## Acceptance Criteria

1. `STATE_CONFIGS` contains exactly 51 entries: all 50 states plus DC
2. Every entry satisfies the TypeScript compiler with no type errors or `as any` casts
3. The static data validation script (from Story 1.2) passes for all 51 entries in CI
4. AR, MS, and NJ have `validation_mode: 'none'` and `total_hours_required: 0`
5. All 16 Tier 1 states (CO, DC, IN, KY, ME, MD, MI, MN, MT, NV, NH, OH, SD, VT, WI, WV) are manually verified against their `source_url` before marking this story done
6. A verification note is added to the PR for each Tier 1 state: `[x] CO — verified YYYY-MM-DD` or `[ ] CO — DISCREPANCY: <note>`
7. Any discrepancies found are corrected and `effective_date` updated before merge
8. `npm run build` and `npm test -- --run` both pass

## Tasks / Subtasks

- [ ] Add remaining ~40 state entries to `src/data/state-configs.ts` (AC: 1, 2)
  - [ ] AL, AK, AZ, CA, CT, DE, FL, GA, HI, ID, IL (done), IN, IA, KS, KY, LA
  - [ ] MA, MD, MI, MN (done), MS, MO, MT, NE, NV, NH, NJ, NM, NY (or done as Tier 2 in 1.2)
  - [ ] ND, OH (done), OK, OR, PA (done), RI, SC, SD (done), TN, TX
  - [ ] UT, VT, VA, WA, WV, WI, WY, DC (done)
  - [ ] MS and NJ: `validation_mode: 'none'`, `total_hours_required: 0`
- [ ] Verify Tier 1 states against official DMV pages (AC: 5, 6, 7)
- [ ] Run `npm run validate:states` locally — all 51 must pass (AC: 3)
- [ ] Verify build and tests pass (AC: 8)

## Dev Notes

### Prerequisite

Stories 1.1 and 1.2 must be complete. Do not create entries for states already in 1.2 (IL, CO, PA, MN, DC, OH, NC, ME, SD, AR, + Tier 2 state).

### Tier Classification

- **Tier 1** (manually verified against official DMV): CO, DC, IN, KY, ME, MD, MI, MN, MT, NV, NH, OH, SD, VT, WI, WV  
  IL is also Tier 1 (verified in-app for years).
- **Tier 2** (IIHS data): most remaining states
- Tier determines the disclaimer shown in the app ("based on publicly available information (IIHS)").

### Special Cases

| State | validation_mode | Notes |
|---|---|---|
| AR | `'none'` | No hour requirement |
| MS | `'none'` | No hour requirement |
| NJ | `'none'` | No hour requirement |
| States in Tier 1 | `'full'` typically | Manually verify hours, supervisor rules, hold period |

### States Requiring Driver-Ed Checkbox

Set `hours_waived_with_driver_ed: true` for: AL, AZ, MN, NE, NV, OR, SD, WV  
These states show the driver-ed checkbox on registration and the state confirmation modal.

### Minimal Entry for Tier 2 States

For Tier 2 states where you don't have official data yet, use IIHS as the source. Minimum valid entry:

```typescript
const XX: StateConfig = {
  state_code: 'XX',
  state_name: 'State Name',
  state_agency: 'State DMV Name',
  tier: 2,
  effective_date: '2026-01-01',
  source_url: 'https://www.iihs.org/topics/teenagers/graduated-licensing-laws#table1',
  timezone: 'America/Chicago',  // use correct IANA timezone
  validation_mode: 'full',
  total_hours_required: 50,  // verify
  nighttime_hours_required: 10,
  inclement_hours_required: 0,
  hold_period_days: 180,
  permit_min_age: 15,
  night_start_hour: 21,
  night_end_hour: 6,
  night_driving_definition: 'After 9:00 PM and before 6:00 AM.',
  supervisor_field_required: false,
  supervisor_license_field_required: false,
  supervisor_rules_display: 'A licensed adult driver must supervise all practice sessions.',
  hours_waived_with_driver_ed: false,
  driver_ed_hours_count_toward_total: false,
  log_submission_required: false,
  log_notarization_required: false,
  location_type_options: ['highway', 'residential', 'rural', 'urban', 'parking_lot'],
  weather_options: ['clear', 'rain', 'snow', 'fog', 'ice'],
  official_form_name: null,
  official_form_url: null,
  attestation_language: 'I certify that the above entries are true and correct.',
  report_columns: [
    { label: 'Date', field_key: 'tripDate', data_type: 'date', html_width_pct: 10 },
    { label: 'Location', field_key: 'locationType', data_type: 'text', html_width_pct: 20 },
    { label: 'Weather', field_key: 'weather', data_type: 'text', html_width_pct: 15 },
    { label: 'Daytime', field_key: 'daytimeMinutes', data_type: 'minutes_hhmm', html_width_pct: 10 },
    { label: 'Nighttime', field_key: 'nighttimeMinutes', data_type: 'minutes_hhmm', html_width_pct: 10 },
    { label: 'Total', field_key: 'cumulativeTotal', data_type: 'cumulative_minutes', html_width_pct: 10 },
    { label: 'Initials', field_key: 'initials', data_type: 'initials', html_width_pct: 8 },
  ],
};
```

### PR Verification Checklist Format

Add to PR description:

```
## Tier 1 State Verification
- [x] CO — verified 2026-05-03
- [x] DC — verified 2026-05-03
- [ ] IN — DISCREPANCY: source_url returns 404, used archive.org copy
...
```

### Anti-Patterns

- Do NOT copy/paste entries without verifying `source_url` resolves
- Do NOT use `as any` to bypass TypeScript — fix the type instead
- Do NOT add a `state_configs_history` table or any DB logic — this is a static module (v2.1 concern per architecture deferred decisions)

### References

- Data file: [src/data/state-configs.ts](src/data/state-configs.ts)
- Validation script: `scripts/validate-state-configs.ts` (created in Story 1.2)
- IIHS graduated licensing laws table: https://www.iihs.org/topics/teenagers/graduated-licensing-laws

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
