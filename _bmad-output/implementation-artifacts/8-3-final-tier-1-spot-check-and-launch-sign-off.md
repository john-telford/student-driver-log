# Story 8.3: Final Tier 1 Spot-Check and Launch Sign-off

Status: ready-for-dev

## Story

As a developer,
I want a final regression spot-check of the Tier 1 state data and a confirmed iOS Safari PDF test,
so that any data errors introduced since Story 1.3's primary verification are caught before launch.

## Acceptance Criteria

1. Spot-check performed on 4–5 Tier 1 states (one per major edge-case category), confirming `source_url` resolves and key fields are unchanged
2. Any discrepancies corrected in `src/data/state-configs.ts` with `effective_date` updated
3. Static data validation script passes in CI after any corrections
4. A Tier 1 state with ≥10 `report_columns` (MN or DC) tested in iOS Safari — landscape PDF is legible
5. Sign-off checklist added to the PR (see format below)
6. `npm run test:e2e` passes
7. `npm test -- --run` passes

## Tasks / Subtasks

- [ ] Spot-check 4–5 Tier 1 states against their official DMV pages (AC: 1)
  - [ ] ME — notarization required; verify form name and notarization requirement
  - [ ] SD — inclement hours; verify current hour requirements
  - [ ] DC — supervisor license; verify current form and supervisor rules
  - [ ] VT or WI — hold period; verify hold period days
  - [ ] OH — daily cap; verify total hours and note that cap is server-side only
- [ ] Correct any discrepancies found, update `effective_date` (AC: 2)
- [ ] Run `npm run validate:states` to confirm CI gate passes (AC: 3)
- [ ] Test landscape PDF in iOS Safari for MN or DC (AC: 4)
- [ ] Add sign-off checklist to PR description (AC: 5)
- [ ] Run `npm run test:e2e` and `npm test -- --run` (AC: 6, 7)

## Dev Notes

### This Story is Primarily Manual QA

Most of the work is opening official DMV websites and comparing data. The coding work is limited to correcting any discrepancies found.

### Spot-Check Focus Areas

Choose states that exercise each major edge-case:

| Category | Suggested State | What to Verify |
|---|---|---|
| Notarization | ME | `log_notarization_required: true`, form name, source_url |
| Inclement hours | SD | `inclement_hours_required` value, source_url |
| Supervisor license | DC | `supervisor_license_field_required: true`, supervisor rules text |
| Hold period | VT or WI | `hold_period_days` value, source_url |
| No-requirement | AR or MS | `validation_mode: 'none'`, `total_hours_required: 0` |

Visit each `source_url` from the config. If the URL returns 404 or the data differs, correct the entry and update `effective_date` to today.

### iOS Safari PDF Test

For a Tier 1 state with ≥10 report columns (likely MN or DC — check their `report_columns.length`):

1. Log in on a physical iPhone or Simulator with Safari
2. Navigate to `/report` and click "Download PDF"
3. Open the downloaded PDF in Safari's PDF viewer
4. Verify: all columns are visible, text is readable at normal zoom, no columns are clipped off-screen
5. This is the "DMV counter test" — landscape PDFs on a phone must be legible when held horizontally

If the landscape PDF fails on iOS Safari, file this as a bug for v2.1 and note it in the PR — do not block launch on it if all other checks pass.

### Static Validation Script

```bash
npm run validate:states
```

Must pass for all 51 entries before this story is marked done. If `validate:states` is not an npm script, run:

```bash
npx tsx scripts/validate-state-configs.ts
```

### Sign-off Checklist (Add to PR Description)

```markdown
## Launch Sign-off Checklist

- [ ] Static data validation script passing for all 51 entries (`npm run validate:states`)
- [ ] Spot-check complete:
  - [ ] ME — verified YYYY-MM-DD (or DISCREPANCY: <note>)
  - [ ] SD — verified YYYY-MM-DD
  - [ ] DC — verified YYYY-MM-DD
  - [ ] VT — verified YYYY-MM-DD
  - [ ] OH — verified YYYY-MM-DD
- [ ] iOS Safari landscape PDF verified for MN or DC
- [ ] All Playwright E2E tests passing (`npm run test:e2e`)
- [ ] All Vitest unit tests passing (`npm test -- --run`)
```

### If Discrepancies Are Found

Edit `src/data/state-configs.ts` directly. For the corrected entry:
1. Update the field(s) that changed
2. Update `effective_date` to today's date
3. Run `npm run validate:states` to confirm the fix is clean
4. Note the discrepancy in the PR checklist: `ME — DISCREPANCY: notarization no longer required per 2026 law change. Corrected.`

### References

- State config data: [src/data/state-configs.ts](src/data/state-configs.ts)
- Validation script: `scripts/validate-state-configs.ts`
- Tier 1 states list: CO, DC, IN, KY, ME, MD, MI, MN, MT, NV, NH, OH, SD, VT, WI, WV

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
