---
stepsCompleted: [1, 2, 3, 4, 5]
status: complete
completedAt: '2026-04-30'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd-v2-multi-state.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/project-context.md'
---

# student-driver-log - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for student-driver-log v2.0 (Multi-State Expansion), decomposing the requirements from the BRD, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can select their state from a dropdown of all 51 jurisdictions (50 states + DC) during registration; a state summary card displays requirements for the selected state.
FR2: Existing pre-v2.0 users see a non-dismissable state confirmation modal on first post-v2.0 login; the modal cannot be dismissed — they must confirm their state to proceed.
FR3: A driver education checkbox appears conditionally on registration and the state confirmation modal for states where driver-ed affects hour requirements (AL, AZ, MN, NE, NV, OR, SD, WV).
FR4: Users can optionally enter their permit issue date during registration (used for hold-period tracking).
FR5: The trip entry form renders conditional fields (inclement minutes, supervisor name, supervisor license, start/end time) based on the user's state configuration flags.
FR6: Location type and weather dropdowns are populated from the user's state config (location_type_options, weather_options) instead of hardcoded values.
FR7: The system validates trips against state-specific rules via validateTrip(); errors block submission; soft violations (OH daily cap, NC weekly cap) show a warning toast but allow submission.
FR8: The dashboard displays dynamic progress bars using state-specific hour targets (total hours, nighttime hours, inclement hours for PA/SD).
FR9: States with no hour requirement (AR, MS, NJ — validation_mode 'none') display cumulative stats only with no progress bars.
FR10: States where driver_ed_completed = true and hours_waived_with_driver_ed = true show a "waived" green banner and cumulative stats without targets.
FR11: The dashboard shows a hold period tracker card when permit_issue_date is set (permit date, required hold period, earliest eligible date, days remaining).
FR12: The dashboard shows a collapsible state info card with state-specific requirements (hours, supervisor rules, hold period, official form link, night driving definition).
FR13: The dashboard shows a completion checklist when all hour requirements are met (and hold period elapsed if permit_issue_date set), with state-specific next steps.
FR14: The report page renders dynamically from the state's report_columns configuration, with state-specific attestation text and an optional notarization block.
FR15: The report includes a disclaimer footer on every page and an optional official form download link.
FR16: The PDF export supports dynamic columns, variable page orientation (portrait ≤9 columns, landscape >9), and an attestation page.
FR17: A Settings page allows users to change their state (with confirmation dialog), driver-ed status, permit issue date, and driver name, and delete their account.
FR18: Changing state triggers a confirmation dialog showing new requirements and explicitly stating that existing trips are not deleted.
FR19: The trips list shows conditional columns (inclement, supervisor) and supports date range filtering and CSV export with state-specific column headers.
FR20: Legal disclaimers appear in three locations: registration state summary card, dashboard state info card footer, and all report/PDF pages.
FR21: Public state information pages (/states and /states/[code]) are available without authentication, with a CTA to register pre-filled with the state code.

### NonFunctional Requirements

NFR1: State config is delivered as a static TypeScript module (src/data/state-configs.ts) — zero DB round trips, zero runtime caching required, available at build time.
NFR2: A composite index on (user_id, trip_date) is added to the trips table for dashboard aggregation query performance.
NFR3: Report generation handles 500+ trips without timeout: target <3s for HTML render, <10s for PDF generation.
NFR4: users.state_code is validated application-side against STATE_CODES (no DB FK constraint); invalid codes are rejected at registration and state-change Server Actions.
NFR5: Changing a user's state does not delete or modify existing trips; historical trip data remains valid even if state-specific enum options differ.
NFR6: validateTrip() has ≥10 unit tests across ≥6 state configs, asserting on ValidationResult.code (SCREAMING_SNAKE_CASE), not message strings.
NFR7: Report column renderer (formatCell) has unit tests for IL, PA, MN, and DC column configurations; includes a test for the never-branch compile guard.
NFR8: An E2E test covers the CO user full flow: register, log trip with supervisor name, view dashboard with CO targets, view report with CO columns, export PDF.
NFR9: A static data validation script verifies all 51 STATE_CONFIGS entries use only known field_key vocabulary, non-empty source_url, and consistent validation_mode.
NFR10: The state selector is keyboard-navigable and screen-reader compatible; includes the state abbreviation in aria-label.
NFR11: Conditional fields use aria-live="polite" regions so screen readers announce when fields appear or disappear.
NFR12: The report table uses semantic HTML structure: <thead>, <th scope="col">, <tbody>.
NFR13: Dashboard progress bars use role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax, and aria-label attributes.

### Additional Requirements

From Architecture document:

- **Brownfield expansion** — v2.0 builds on the existing main codebase; no starter template needed; all existing stack decisions carry forward.
- **server-only boundary** — src/data/state-configs.ts must have `import 'server-only'` as its first line; any Client Component import produces a build error by design.
- **New type files** — src/lib/types/state-config.ts (StateConfig, ReportColumn, ValidationMode, ReportColumnDataType) and src/lib/types/validation.ts (TripInput, ValidationResult, ValidationOutput) must be created in Issue #14 before all other issues.
- **Validation fixtures** — src/lib/validation.fixtures.ts created in Issue #14 provides canonical TripInput and StateConfig stubs for all subsequent test files.
- **New shadcn/ui components** — select, progress, alert-dialog, badge must be added via `npx shadcn@latest add` before use.
- **DB migration is additive only** — no new tables; only users and trips columns modified; all new columns are nullable or have defaults; migration is one-way once deployed to Turso.
- **CI update** — .github/workflows/ci.yml needs a db:migrate step added before npm test (owned by Issue #16).
- **validateTrip() purity contract** — must contain zero server imports (no next/headers, Drizzle, auth()); file header comment must document this; called on both client (UX feedback) and server (authoritative gate).
- **Cumulative cap separation** — OH daily cap and NC weekly cap warnings are computed in addTripAction/updateTripAction Server Actions via DB query after validateTrip(), not inside validateTrip() itself.
- **Report renderer boundary** — @react-pdf/renderer imports must only appear in src/app/api/report/pdf/report-table.pdf.tsx; HTML and PDF renderers are separate components sharing only formatCell().
- **formatCell() contract** — returns string always; never returns JSX; lives in src/lib/report/format-cell.ts; uses a discriminated union switch with a never default case.
- **StateConfirmationGate contract** — Client Component at src/app/(app)/state-confirmation-gate.tsx; layout.tsx fetches user.state_confirmed and passes boolean prop; renders shadcn Dialog with open={!stateConfirmed}; non-dismissable.
- **(public) route group** — src/app/(public)/states/ for unauthenticated state pages; no layout.tsx needed; middleware matcher must exclude these paths.
- **Issue sequencing constraints** — #16 (users schema) must merge before #17 (trips schema); #14 (types + stub) must be first; critical path: #14 → #15 → #16 → #17 → #18 → ... → #30.
- **StateConfig prop threading** — Server Component resolves STATE_CONFIGS[user.state_code] and passes stateConfig as a typed prop to Client Components; no Client Component fetches or computes state config independently; no React Context.
- **validation_mode branching** — always branch on stateConfig.validation_mode, never on numeric field values (e.g. total_hours_required === 0 is insufficient for AR/MS/NJ).
- **Timezone handling** — StateConfig.timezone (IANA string) is used in validateTrip() to convert UTC trip times to local time for night-hour classification; native Intl.DateTimeFormat used (no new dependency).
- **UTC ISO8601 for start_time/end_time** — stored as UTC ISO8601 strings in trips table; local time derived at validation time from StateConfig.timezone.

### UX Design Requirements

No UX Design document was found for this feature set. All UI patterns are fully specified in the PRD (Section 7) and Architecture document.

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | 2 | State selector + summary card on registration |
| FR2 | 2 | State confirmation modal for existing users |
| FR3 | 2 | Driver-ed checkbox (conditional) |
| FR4 | 2 | Permit issue date on registration |
| FR5 | 3 | Conditional trip fields (inclement, supervisor, time) |
| FR6 | 3 | Location/weather dropdowns from state config |
| FR7 | 3 | validateTrip() engine |
| FR8 | 4 | Dynamic dashboard progress bars |
| FR9 | 4 | No-requirement states cumulative stats |
| FR10 | 4 | Driver-ed waived banner |
| FR11 | 4 | Hold period tracker |
| FR12 | 4 | State info card |
| FR13 | 4 | Completion checklist when all requirements met |
| FR14 | 5 | Dynamic report renderer + attestation block + notarization |
| FR15 | 5 | Disclaimer footer + official form download link |
| FR16 | 5 | PDF dynamic columns + orientation + attestation |
| FR17 | 6 | Settings page (state, driver-ed, permit date, name, delete) |
| FR18 | 6 | State change confirmation dialog |
| FR19 | 3 | Trips list conditional columns + filter + CSV export |
| FR20 | 2, 4, 5, 7 | Legal disclaimers (registration, dashboard, report/PDF, public pages) |
| FR21 | 7 | Public state information pages |

## Epic List

### Epic 1: State Configuration Foundation
Users in any US state can have their data correctly processed — this epic delivers the type-safe configuration engine (51 jurisdictions), validation fixtures, and additive DB schema changes that every subsequent epic depends on.
**Issues:** #14 (types + stub + validation fixtures + test skeleton), #15a (populate IL + 10 representative states + CI validation script), #15b (populate remaining 40 states + Tier 1 manual verification), #16 (users table migration), #17 (trips table migration + ON DELETE CASCADE)
**FRs covered:** No direct FRs — pure infrastructure. NFR1, NFR4 addressed here.
**Key notes:**
- #14 must include `it.todo` test stubs for validateTrip in `src/lib/validation.test.ts` (skeleton moves to Epic 8 for completion)
- Static data validation script runs in CI from the moment #15 merges — not a one-time check
- #16 must merge before #17; both must deploy (migrate-then-deploy) before any Epic 2+ code goes to production
- Explicit dependency: `#16 → #17`

### Epic 2: State-Aware Registration & Onboarding
New users from any state can register with accurate requirements shown upfront; existing Illinois users are guided through a one-time, non-dismissable state confirmation before they can proceed.
**Issues:** #18 (state confirmation modal for existing users), #19 (registration flow: state selector, summary card, driver-ed, permit date)
**FRs covered:** FR1, FR2, FR3, FR4, FR20 (registration disclaimer)
**Key notes:**
- Explicit dependencies: `#16 → #18`, `#16 → #19`
- Issue #18 must surface the user's state tier (Tier 2/3 disclaimer language) in the modal AC — not just the state name
- Tier 2 states in the modal must show: "Requirements shown are based on publicly available information (IIHS). Verify with your state's licensing agency."

### Epic 3: State-Aware Trip Logging
Users log driving sessions with the fields their state requires, get immediate state-specific validation feedback, and can view/filter/export their trip history with state-appropriate columns.
**Issues:** #20 (validateTrip() pure function engine), #21 (trip form conditional fields + client-side validation), #26 (trips list: conditional columns, date range filter, CSV export)
**FRs covered:** FR5, FR6, FR7, FR19
**Key notes:**
- Explicit dependency: `#15 → #20` (validateTrip cannot be meaningfully tested with only the IL stub from #14)
- validateTrip unit tests (≥10 passing, ≥6 states) AC belongs to #28 (Epic 8); test skeleton belongs to #14 (Epic 1)
- #26 is independently parallelizable if #21 blocks — trips list and CSV export have no dependency on conditional form fields being complete
- Driver-ed waived state is determined in the Server Action / dashboard data fetch, not inside validateTrip()

### Epic 4: State-Aware Progress Dashboard
Users see accurate progress toward their state's specific hour requirements (including inclement and hold period), or cumulative stats if their state has no requirement, plus a completion checklist when they're ready to test.
**Issues:** #22a (dynamic progress bars, display modes, completion checklist — Story 4.1), #22b (hold period tracker, state info card — Story 4.2)
**FRs covered:** FR8, FR9, FR10, FR11, FR12, FR20 (dashboard state card disclaimer)
**Key notes:**
- Dashboard display mode branches on `stateConfig.validation_mode`, not on `total_hours_required === 0`
- "Waived" banner depends on `driver_ed_completed` flag from the users table (#16) and `hours_waived_with_driver_ed` from state config (#15) — no validateTrip dependency
- Dashboard disclaimer for Tier 2 states: "Verify these requirements with [state]'s [agency]. Data effective: [effective_date]."

### Epic 5: State-Specific Report & PDF Export
Users generate a practice log formatted to their state's official column structure with correct attestation language, and download it as a properly oriented PDF ready for submission.
**Issues:** #23 (dynamic HTML report renderer: ReportTableHTML, formatCell, attestation, notarization), #24 (PDF dynamic columns, orientation, attestation page)
**FRs covered:** FR14, FR15, FR16, FR20 (report/PDF disclaimer)
**Key notes:**
- Explicit dependency: `#23 → #24` (PDF renderer consumes the column interface defined in HTML renderer)
- Tier 2 states require a stronger disclaimer on the report/PDF: "Requirements shown are based on publicly available information (IIHS) and may not reflect recent changes."
- PDF orientation on mobile (iOS Safari) must be in Epic 8 QA checklist — landscape PDFs at the DMV counter are a real failure mode
- `formatCell()` returns `string` always — HTML renderer wraps; PDF renderer passes to `<Text>`

### Epic 6: Account Settings & State Management
Users can update their state, driver-ed status, permit issue date, and profile details after registration — with a clear confirmation dialog explaining exactly what changes and what doesn't.
**Issues:** #25 (settings page: state change with dialog, driver-ed, permit date, driver name, account delete)
**FRs covered:** FR17, FR18
**Key notes:**
- State change behavior must be explicit in AC: existing trips are NOT deleted, NOT re-validated against new state rules; progress bars and completion status recalculate against new state config; historical trip field values (location, weather) render as-is even if new state has different enum options
- Changing state clears `driver_ed_completed` — user must re-confirm for new state
- State change dialog copy must be locked before coding: "Your [N] existing trip entries will NOT be deleted. Your progress will be recalculated using [New State]'s requirements."

### Epic 7: Public State Information Pages
Prospective users can discover the app via search and check their state's requirements before registering — with a direct CTA pre-filled with their state code.
**Issues:** #27 (public /states and /states/[code] pages, middleware matcher update)
**FRs covered:** FR21, FR20 (Tier 2 disclaimer on public state detail pages)
**Key notes:**
- Only depends on Epic 1 (#15 for state config data) — can ship in parallel with Epics 4/5/6 if bandwidth allows
- Tier 2 state detail pages (/states/[code]) must show IIHS data disclaimer inline, not just in the registered app
- Middleware matcher must exclude `/states` and `/states/[code]` from auth guard

### Epic 8: Quality Assurance & Launch Readiness
The app's state requirement data is verified accurate for Tier 1 states, automated tests confirm correct behavior across multiple state configurations, and all critical flows are regression-tested.
**Issues:** #28 (validateTrip unit tests ≥10 passing across ≥6 states; formatCell unit tests for IL/PA/MN/DC), #29 (CO full flow E2E: register, log trip, dashboard, report, PDF), #30 (Tier 1 manual QA: 16 states against DMV sites)
**NFRs covered:** NFR6, NFR7, NFR8, NFR9
**Key notes:**
- #28 completes the test stubs created in #14; tests assert on `ValidationResult.code`, not `.message`
- #29 must ship in the same PR as the CO state config entry in state-configs.ts
- Epic 8 QA checklist must explicitly cover PDF rendering on iOS Safari (landscape orientation for high-column-count states)
- Static data validation script (CI gate from Epic 1) is validated passing for all 51 entries

---

## Epic 1: State Configuration Foundation

Users in any US state can have their data correctly processed — this epic delivers the type-safe configuration engine (51 jurisdictions), validation fixtures, and additive DB schema changes that every subsequent epic depends on.

### Story 1.1: Create State Config Type System and Foundation Files

As a developer,
I want a complete type system for state configurations, a single-state stub, validation fixtures, and test skeletons in place,
So that all subsequent issues have a stable, compile-verified foundation to build on.

**Acceptance Criteria:**

**Given** the project has no v2.0 types yet
**When** Story 1.1 is complete
**Then** `src/lib/types/state-config.ts` exports `StateConfig`, `ReportColumn`, `ValidationMode`, `ReportColumnDataType` with all fields defined in the PRD Section 6.1
**And** `src/lib/types/validation.ts` exports `TripInput`, `ValidationResult` (with `.code: string` and `.message: string`), and `ValidationOutput` (`{ errors: ValidationResult[], warnings: ValidationResult[] }`)
**And** `src/lib/types/state-config.ts` and `src/lib/types/validation.ts` have no `import 'server-only'` — these type files are importable from both Client Components and Server Components; only the data file is server-gated
**And** `src/data/state-configs.ts` has `import 'server-only'` as its first line, exports `STATE_CONFIGS: Record<string, StateConfig>` and `STATE_CODES: string[]`, and contains a complete, valid Illinois entry matching current app behavior — the type definitions it uses are imported from `src/lib/types/state-config.ts`, not co-located in this file
**And** `src/lib/validation.fixtures.ts` exports at least one canonical `TripInput` stub and one `StateConfig` stub (IL) usable in test files without importing `src/data/state-configs.ts` directly
**And** `src/lib/validation.test.ts` contains a `describe('validateTrip')` block with named `it.todo(...)` stubs covering at minimum: IL baseline, PA inclement, MN supervisor, AR none-mode, OH daily cap warning, DC supervisor license, inclement boundary (equal to total), inclement boundary (exceeds total)
**And** `npm run build` passes with no TypeScript errors
**And** `npm test -- --run` passes (all todos are skipped, not failing)

### Story 1.2: Populate Core State Configurations (IL + Representative Set)

As a developer,
I want Illinois plus one representative state per validation mode and edge-case category populated in `src/data/state-configs.ts`,
So that the validation engine, trip form, dashboard, and report renderer can be built and tested against a realistic set of state configs before all 51 are complete.

**Acceptance Criteria:**

**Given** Story 1.1 is complete
**When** Story 1.2 is complete
**Then** `src/data/state-configs.ts` contains at minimum 11 entries covering all validation-mode variants and major edge cases:
- IL (validation_mode: full, existing behavior baseline)
- CO (full, supervisor required — used in E2E test Story 8.2)
- PA (full, inclement hours required)
- MN (full, supervisor + start/end time in report_columns)
- DC (full, supervisor license required)
- OH (full, daily cap warning)
- NC (full, weekly cap warning)
- ME (full, log notarization required)
- SD (full, inclement + log submission)
- AR (none — no hour requirement)
- A Tier 2 attestation state (e.g. NY or TX)
**And** every entry satisfies the TypeScript compiler with no type errors or `as any` casts
**And** the static data validation script (added in this story) runs in CI and asserts: all `field_key` values in `report_columns` use the defined vocabulary, all `source_url` fields are non-empty strings, `validation_mode === 'none'` entries have `total_hours_required === 0`, `validation_mode === 'full'` entries have `total_hours_required > 0`
**And** the validation script passes for all entries present
**And** `npm run build` and `npm test -- --run` both pass

### Story 1.3: Populate All Remaining State Configurations

As a developer,
I want all remaining 40+ jurisdictions populated in `src/data/state-configs.ts` with manually verified data for Tier 1 states,
So that the app correctly serves users from every US state and DC at launch.

**Acceptance Criteria:**

**Given** Story 1.2 is complete
**When** Story 1.3 is complete
**Then** `STATE_CONFIGS` contains exactly 51 entries: all 50 states plus DC
**And** every entry satisfies the TypeScript compiler with no type errors or `as any` casts
**And** the static data validation script passes for all 51 entries in CI
**And** AR, MS, and NJ entries have `validation_mode: 'none'` and `total_hours_required: 0`
**And** all 16 Tier 1 states (CO, DC, IN, KY, ME, MD, MI, MN, MT, NV, NH, OH, SD, VT, WI, WV) are manually verified against their `source_url` before this story is marked done — each entry's hours, supervisor rules, hold period, and `report_columns` field labels are confirmed to match the official DMV page
**And** a verification note is added to the PR for each Tier 1 state: `[x] CO — verified YYYY-MM-DD` or `[ ] CO — DISCREPANCY: <note>`
**And** any discrepancies found are corrected and `effective_date` updated before merge
**And** `npm run build` and `npm test -- --run` both pass

### Story 1.4: Extend Users Table for State-Awareness

As a developer,
I want the users table extended with state-awareness columns and the CI pipeline updated,
So that all subsequent auth and onboarding flows can persist and read state-specific user data.

**Acceptance Criteria:**

**Given** Story 1.1 is complete and the current users table has no state columns
**When** Story 1.4 is complete
**Then** `src/db/schema.ts` adds to the users table: `state_code TEXT NOT NULL DEFAULT 'IL'`, `state_confirmed BOOLEAN NOT NULL DEFAULT true`, `driver_ed_completed BOOLEAN NOT NULL DEFAULT false`, `permit_issue_date TEXT` (nullable)
**And** a Drizzle migration is generated and applied without errors on a fresh local database
**And** the migration is additive only — no existing columns are modified or removed
**And** `.github/workflows/ci.yml` adds `npm run db:migrate` as a step before `npm test -- --run`
**And** `npm run build`, `npm test -- --run`, and the CI workflow all pass

### Story 1.5: Extend Trips Table for State-Specific Fields

As a developer,
I want the trips table extended with state-specific optional fields, a performance index, and cascade-delete wiring,
So that conditional trip data can be stored efficiently and account deletion cleanly removes all associated records.

**Acceptance Criteria:**

**Given** Story 1.4 is complete and merged
**When** Story 1.5 is complete
**Then** `src/db/schema.ts` adds to the trips table: `inclement_minutes INTEGER NOT NULL DEFAULT 0`, `supervisor_name TEXT` (nullable), `supervisor_license TEXT` (nullable), `vehicle_info TEXT` (nullable), `start_time TEXT` (nullable), `end_time TEXT` (nullable)
**And** a composite index on `(user_id, trip_date)` is added to the trips table via Drizzle schema
**And** the `trips.user_id` foreign key is defined with `ON DELETE CASCADE` so that deleting a user record automatically deletes all their trips — no application-layer manual deletion needed
**And** a Drizzle migration is generated and applied without errors
**And** the migration is additive only — no existing trip data is modified
**And** all existing Playwright E2E tests still pass
**And** `npm run build` and `npm test -- --run` pass

---

## Epic 2: State-Aware Registration & Onboarding

New users from any state register with accurate requirements shown upfront; existing pre-v2.0 users confirm their state via a non-dismissable modal before they can proceed.

### Story 2.1: State Confirmation Gate for Existing Users

As an existing user logging in after the v2.0 deployment,
I want to be prompted once to confirm my state before I can use the app,
So that my requirements, progress, and report format are accurate for my jurisdiction.

**Acceptance Criteria:**

**Given** a user with `state_confirmed = false` logs in and navigates to any protected route
**When** `(app)/layout.tsx` renders
**Then** `<StateConfirmationGate>` renders a non-dismissable shadcn `<Dialog>` blocking all page content — no close button, no backdrop dismiss
**And** the dialog contains: heading "We now support all 50 states", explanatory body text, a state dropdown pre-selected to "Illinois", and a "Confirm" button
**And** a driver-ed checkbox appears only for states where `hours_waived_with_driver_ed = true` or `driver_ed_hours_count_toward_total = true` (AL, AZ, MN, NE, NV, OR, SD, WV)
**And** for Tier 2 states selected in the dropdown, the dialog shows inline: "Requirements shown are based on publicly available information (IIHS). Verify with your state's licensing agency."
**And** for AR, MS, and NJ: the dialog shows "Your state does not require logged practice hours, but tracking your practice is still supported."

**Given** the user selects a state and clicks Confirm
**When** the Server Action runs
**Then** `users.state_code` is updated, `users.state_confirmed` is set to `true`, and `users.driver_ed_completed` is set per the checkbox
**And** `router.refresh()` is called so the layout re-evaluates and renders `{children}` instead of the modal
**And** the user lands on the page they were navigating to

**Given** a user with `state_confirmed = true`
**When** any protected route renders
**Then** `<StateConfirmationGate>` renders `{children}` directly with no modal

**Given** a user deep-links to a protected route while `state_confirmed = false`
**When** the page loads
**Then** the gate still blocks — it re-evaluates on every layout render; no IL default fallback is provided

### Story 2.2: State-Aware Registration Flow

As a new user registering from any US state,
I want to select my state and see my state's requirements during registration,
So that I start the app with the correct hour targets, validation rules, and report format from day one.

**Acceptance Criteria:**

**Given** a visitor opens `/register`
**When** the page loads
**Then** the form includes a required state dropdown listing all 51 jurisdictions alphabetically with no pre-selected default — the user must actively choose
**And** states with no hour requirement (AR, MS, NJ) appear in a "No state requirement" group at the bottom with an explanatory label

**Given** the user selects a state from the dropdown
**When** the selection changes
**Then** a state summary card renders showing: total hours required, nighttime hours required, inclement hours (if `inclement_hours_required > 0`), supervisor requirements (`supervisor_rules_display`), and official form name
**And** a driver-ed checkbox appears only for applicable states (AL, AZ, MN, NE, NV, OR, SD, WV)
**And** for AR, MS, NJ: a notice renders "Your state does not mandate logged practice hours, but tracking your practice can help you prepare and build confidence."
**And** below the state summary card: "Requirements shown are based on publicly available information and may not reflect recent changes. Always verify with your state's licensing agency."

**Given** the user completes registration and submits
**When** the Server Action runs
**Then** the new user record is created with `state_code` set to the selected state, `state_confirmed = true`, `driver_ed_completed` per the checkbox (or false if hidden), and `permit_issue_date` set if provided
**And** `state_code` is validated server-side against `STATE_CODES` — an invalid code returns an error and the form does not submit
**And** `permit_issue_date`, if provided, is validated as not in the future
**And** all existing registration validation rules are unchanged (username 3–32 chars, password 8+ chars, driver name required)

**Given** the user submits without selecting a state
**When** the Server Action runs
**Then** a field-level error renders: "Please select your state"

---

## Epic 3: State-Aware Trip Logging

Users log driving sessions with the fields their state requires, get immediate state-specific validation feedback, and can view/filter/export their trip history with state-appropriate columns.

### Story 3.1: State-Specific Trip Validation Engine

As a developer,
I want a pure, server-import-free `validateTrip()` function that enforces state-specific rules,
So that trip entry can be validated identically on the client (UX feedback) and server (authoritative gate) without duplication.

**Acceptance Criteria:**

**Given** `src/lib/validation.ts` does not yet exist
**When** Story 3.1 is complete
**Then** `src/lib/validation.ts` exports `validateTrip(trip: TripInput, stateConfig: StateConfig): ValidationOutput`
**And** the file header contains `// Pure function — NO server imports. Runs on client and server.` and imports zero server-only modules
**And** validation branches on `stateConfig.validation_mode` — `'none'` mode skips enum validation and returns only minimal checks (date not future, at least one minute > 0)
**And** all error `ValidationResult.code` values are `SCREAMING_SNAKE_CASE`: `DATE_REQUIRED`, `DATE_IN_FUTURE`, `LOCATION_REQUIRED`, `LOCATION_INVALID`, `WEATHER_REQUIRED`, `WEATHER_INVALID`, `MINUTES_OUT_OF_RANGE`, `NO_MINUTES_LOGGED`, `INCLEMENT_EXCEEDS_TOTAL`, `INCLEMENT_REQUIRED`, `SUPERVISOR_REQUIRED`, `SUPERVISOR_LICENSE_REQUIRED`, `TIME_ORDER_INVALID`, `NOTES_TOO_LONG`

**Given** a trip where `inclement_minutes > daytime_minutes + nighttime_minutes`
**When** `validateTrip()` is called
**Then** `errors` contains `{ code: 'INCLEMENT_EXCEEDS_TOTAL', field: 'inclement_minutes' }`

**Given** a trip for a PA user where weather indicates inclement conditions and `inclement_minutes === 0`
**When** `validateTrip()` is called
**Then** `errors` contains `{ code: 'INCLEMENT_REQUIRED', field: 'inclement_minutes' }`

**Given** a trip for an AR user (validation_mode 'none') with an invalid `location_type`
**When** `validateTrip()` is called
**Then** `errors` does NOT contain `LOCATION_INVALID` — none-mode skips enum checks

**Given** a trip for a MN user where `stateConfig.supervisor_field_required = true` and `supervisor_name` is empty
**When** `validateTrip()` is called
**Then** `errors` contains `{ code: 'SUPERVISOR_REQUIRED', field: 'supervisor_name' }`

**And** `npm test -- --run` passes (the `it.todo` stubs from Story 1.1 remain; full passing tests land in Epic 8)

### Story 3.2: State-Aware Trip Entry Form

As a user logging a driving session,
I want the trip form to show only the fields my state requires and validate my entry against my state's rules,
So that every trip I log is valid for my state's official form.

**Acceptance Criteria:**

**Given** a user navigates to `/trips/new` or `/trips/[id]/edit`
**When** the page loads
**Then** the Server Component resolves `STATE_CONFIGS[user.state_code]` and passes `stateConfig` as a typed prop to the Client Component form — no direct import of `src/data/state-configs.ts` in the Client Component
**And** the location type dropdown options come from `stateConfig.location_type_options`
**And** the weather dropdown options come from `stateConfig.weather_options`
**And** below any supervisor fields, helper text displays `stateConfig.supervisor_rules_display`

**Given** the user's state has `inclement_hours_required > 0` (PA, SD)
**When** the form renders
**Then** an inclement minutes field appears with label "Minutes in inclement weather" and helper text "This is a subset of your day/night minutes, not additional time."

**Given** the user's state has `supervisor_field_required = true`
**When** the form renders
**Then** a supervisor name text input appears, marked required

**Given** the user's state has `supervisor_license_field_required = true` (DC, ME)
**When** the form renders
**Then** a supervisor license text input appears, marked required

**Given** the user fills in both start time and end time
**When** both fields have valid values
**Then** total minutes are auto-calculated and populate the daytime/nighttime fields
**And** if `end_time <= start_time`, a field-level error renders: "End time must be after start time"

**Given** the user submits the form
**When** `validateTrip()` is called on the client
**Then** all `errors` render as field-level messages and submission is blocked
**And** all `warnings` render as orange toast notifications but submission is allowed

**Given** the user submits and the client passes validation
**When** `addTripAction` or `updateTripAction` runs
**Then** `validateTrip()` is called server-side as the authoritative gate — an invalid trip returns `{ errors, warnings }` and does not write to the DB
**And** for OH users: the Server Action queries cumulative minutes for the selected date; if `daily_total > 4 * 60`, a warning with code `OH_DAILY_CAP` is appended and the trip is still saved
**And** for NC users: the Server Action queries cumulative minutes for the week; if `weekly_total > 10 * 60`, a warning with code `NC_WEEKLY_CAP` is appended and the trip is still saved
**And** a code comment in `addTripAction` / `updateTripAction` documents that OH/NC cumulative cap warnings are server-only by design — `validateTrip()` cannot enforce them because it has no DB access; these warnings will not surface in real-time client validation, only on Server Action response

### Story 3.3: Trips List Conditional Columns, Filtering, and CSV Export

As a user viewing my trip history,
I want to see state-relevant columns, filter by date range, and export my log as a CSV,
So that I can review my progress and share data in a format matching my state's form.

**Acceptance Criteria:**

**Given** a user navigates to `/trips`
**When** the page loads
**Then** the trips table shows a conditional inclement minutes column only for PA/SD users (`stateConfig.inclement_hours_required > 0`)
**And** a conditional supervisor name column only when `stateConfig.supervisor_field_required = true`
**And** the column order matches the user's `stateConfig.report_columns` field order where applicable

**Given** a date range filter control above the table
**When** the user selects "Last 30 days", "Last 90 days", or a custom date range
**Then** the table updates to show only trips within that range, with "All time" as the default

**Given** the user clicks "Export CSV"
**When** the download triggers
**Then** the CSV file is generated with column headers matching the `label` values from `stateConfig.report_columns`
**And** the CSV contains only the columns defined in `stateConfig.report_columns` — columns not applicable to the user's state are omitted entirely (not emitted as empty columns)
**And** the filename is `driving-log-[STATE_CODE]-[YYYY-MM-DD].csv`
**And** all currently filtered trips are included (respects the active date range filter)

---

## Epic 4: State-Aware Progress Dashboard

Users see accurate progress toward their state's specific requirements — or cumulative stats if their state has none — plus hold period tracking and a completion checklist when they're ready.

### Story 4.1: Dynamic Progress Bars and Completion Checklist (#22a)

As a user on the dashboard,
I want to see progress bars that reflect my state's actual hour requirements — or cumulative stats if my state has no requirement — and a completion checklist when I've hit all my targets,
So that I always know exactly where I stand relative to what my state requires.

**Acceptance Criteria:**

**Given** a user whose state has `validation_mode === 'full'` and `total_hours_required > 0`
**When** the dashboard loads
**Then** progress bars display using `stateConfig.total_hours_required` and `stateConfig.nighttime_hours_required` as targets
**And** each progress bar label shows "[current] of [target] hours"
**And** for PA and SD users (`stateConfig.inclement_hours_required > 0`), a third progress bar displays inclement weather hours with the correct target

**Given** a user whose state has `validation_mode === 'none'` (AR, MS, NJ)
**When** the dashboard loads
**Then** no progress bars are shown
**And** cumulative stat cards display: "Total practice: X hours", "Daytime: Y hours", "Nighttime: Z hours"
**And** a header reads: "Your state does not require logged practice hours. Here is your practice summary."

**Given** a user where `driver_ed_completed = true` and `stateConfig.hours_waived_with_driver_ed = true`
**When** the dashboard loads
**Then** a green banner displays: "Your state waives the [X]-hour practice requirement because you completed driver education. Your logged hours are shown below for your records."
**And** progress bars render with no target (cumulative display only, no percentage fill)

**Given** a user whose total hours ≥ `total_hours_required`, nighttime hours ≥ `nighttime_hours_required`, and inclement hours ≥ `inclement_hours_required` (where applicable)
**When** the dashboard loads
**Then** a green completion card displays with state-specific next steps
**And** if `stateConfig.log_submission_required = true`: "Print your log and bring it to [agency]. Download your official form: [link]."
**And** if `stateConfig.log_notarization_required = true`: "Your state requires your log to be notarized before submission."
**And** if `stateConfig.hold_period_days > 0` and `permit_issue_date` is set and the hold period has not elapsed, the completion card is suppressed — hours AND hold period must both be satisfied
**And** if `stateConfig.hold_period_days === 0` or `permit_issue_date` is not set, the hold period does not gate the completion card

**Given** the dashboard data fetch
**When** the Server Component runs
**Then** it branches on `stateConfig.validation_mode`, never on `total_hours_required === 0`

### Story 4.2: Hold Period Tracker and State Info Card (#22b)

As a user on the dashboard,
I want to see how many days remain on my mandatory holding period and a summary of my state's requirements,
So that I know when I'm eligible to take my road test and can quickly reference my state's rules.

**Acceptance Criteria:**

**Given** a user whose state has `stateConfig.hold_period_days > 0` and `permit_issue_date` is set
**When** the dashboard loads
**Then** a hold period tracker card displays below the progress bars showing: permit issue date, required hold period in days, earliest eligible test date, and days remaining (or "Eligible!" if the date has passed)

**Given** a user whose state has `stateConfig.hold_period_days > 0` and `permit_issue_date` is NOT set
**When** the dashboard loads
**Then** the hold period card shows: "Add your permit issue date in Settings to track your holding period."

**Given** a user whose state has `stateConfig.hold_period_days === 0`
**When** the dashboard loads
**Then** the hold period card does not render at all

**Given** the state info card component
**When** the dashboard loads
**Then** a collapsible card (collapsed by default) titled "[State Name] Requirements" displays: total hours required, night hours required, inclement hours (if applicable), supervisor rules (`supervisor_rules_display`), hold period (if `hold_period_days > 0`), official form name with link, and night driving definition
**And** the card footer shows: "Verify these requirements with [state agency]. Data effective: [stateConfig.effective_date]."
**And** for Tier 2 states, the footer additionally shows: "Requirements shown are based on publicly available information (IIHS)."
**And** a "Change state" link navigates to `/settings`
**And** for Tier 2 states, a visible badge or footnote on the state info card reads "Data source: IIHS (publicly available)" — this is always visible when the card is collapsed, not only when expanded, so users cannot miss it during normal use

**Given** a user clicks the state info card header
**When** the card toggles
**Then** it expands to show full requirements and collapses back on a second click

---

## Epic 5: State-Specific Report & PDF Export

Users generate a practice log formatted to their state's official column structure with correct attestation language, and download it as a properly oriented PDF ready for submission.

### Story 5.1: Dynamic HTML Report Renderer

As a user on the report page,
I want to see a practice log table formatted to my state's official column structure with the correct attestation language and disclaimer,
So that I can print or review a report that matches what my state's DMV expects.

**Acceptance Criteria:**

**Given** `src/lib/report/format-cell.ts` does not yet exist
**When** Story 5.1 is complete
**Then** `formatCell(trip, col, context): string` is exported from `src/lib/report/format-cell.ts`, returns `string` always, and never returns JSX
**And** the switch covers all `ReportColumnDataType` values with a `never` default case that causes a compile error when a new `data_type` is added without a handler
**And** `custom` field_key renders `String(trip[col.custom_field_name] ?? '')`
**And** `src/lib/report/format-cell.test.ts` tests each `data_type` variant: `date`, `text`, `minutes_hhmm`, `minutes_raw`, `cumulative_minutes`, `initials`, `signature`, `custom`
**And** `format-cell.test.ts` includes a test that verifies the `never` default branch is compile-time enforced — documents that adding a new `data_type` without a handler is a TypeScript error, not a silent runtime bug

**Given** a user navigates to `/report`
**When** the Server Component runs
**Then** `STATE_CONFIGS[user.state_code]` is resolved server-side and `stateConfig.report_columns` is passed as a typed prop to `<ReportTableHTML>`
**And** `<ReportTableHTML>` renders a semantic HTML table: `<thead>` with `<th scope="col">` per column label, `<tbody>` with one `<tr>` per trip, and a totals row for cumulative columns
**And** column widths use `html_width_pct` from the column definition, or algorithmic defaults per `data_type` if omitted
**And** the report header reads: "[State Name] Practice Driving Log" with "Reference: [form name]" if `official_form_name` is not null

**Given** the trip table renders
**When** the attestation block renders below it
**Then** state-specific text from `stateConfig.attestation_language` appears, followed by a signature line: "Signature of Parent, Guardian, or Supervising Adult: _______________ Date: ________"
**And** if `stateConfig.log_notarization_required = true`, a Notary Public block renders with fields for name, commission number, expiration, seal area, and date

**Given** the report page renders
**When** any state is selected
**Then** a disclaimer footer displays: "Generated by studentdriver.site. This document is a practice driving log generated for your convenience. It is not an official state document. Verify acceptance with your local licensing office before submitting."
**And** if `stateConfig.official_form_url` is not null, a link displays: "Download the official [state] form"
**And** for Tier 2 states, an additional line: "Requirements shown are based on publicly available information (IIHS) and may not reflect recent changes."
**And** `@react-pdf/renderer` is not imported anywhere in this file or its dependencies

### Story 5.2: Dynamic PDF Export

As a user who has reviewed their report,
I want to download a PDF formatted to my state's column structure with correct page orientation, attestation, and disclaimer,
So that I have a document ready to print and submit (or transcribe to the official form).

**Acceptance Criteria:**

**Given** a user clicks "Download PDF" on the report page
**When** `GET /api/report/pdf` runs
**Then** the same `STATE_CONFIGS[user.state_code]` and trip data fetch runs as the HTML report
**And** `<ReportTablePDF>` in `src/app/api/report/pdf/report-table.pdf.tsx` is the only file in the project that imports `@react-pdf/renderer`
**And** `<ReportTablePDF>` imports `formatCell` from `src/lib/report/format-cell.ts` — no duplicated formatting logic

**Given** the state config has 9 or fewer `report_columns`
**When** the PDF renders
**Then** the page orientation is portrait

**Given** the state config has 10 or more `report_columns`
**When** the PDF renders
**Then** the page orientation is landscape

**Given** the PDF spans multiple pages
**When** trips paginate
**Then** column headers repeat at the top of each page

**Given** the final content of the PDF
**When** the attestation content renders
**Then** attestation language, signature lines, and (if `log_notarization_required = true`) the notarization block appear on a dedicated final page

**Given** every page of the PDF
**When** it renders
**Then** a footer displays: "Generated by studentdriver.site. Not an official state document."
**And** for Tier 2 states, the footer also includes: "Requirements based on publicly available information (IIHS). Verify with your state's licensing agency."
**And** the file downloads with filename `driving-log-[STATE_CODE]-[YYYY-MM-DD].pdf`

---

## Epic 6: Account Settings & State Management

Users update their state, driver-ed status, permit issue date, and profile details after registration — with explicit confirmation when changing state.

### Story 6.1: Account Settings and State Change

As a registered user,
I want to update my state, driver education status, permit issue date, and name from a settings page,
So that my requirements and report format stay accurate as my situation changes.

**Acceptance Criteria:**

**Given** the `(app)` layout navigation
**When** any authenticated page renders
**Then** a "Settings" link is present in the app nav pointing to `/settings`

**Given** an authenticated user navigates to `/settings`
**When** the page loads
**Then** the settings form displays current values for: driver name (editable text field), state (dropdown, current state pre-selected), driver-ed checkbox (shown only for applicable states, reflecting current `driver_ed_completed`), and permit issue date (date picker, pre-filled if set)

**Given** the user edits driver name, driver-ed checkbox, or permit issue date
**When** the user clicks "Save changes"
**Then** those fields are persisted to the users table via a Server Action — the state field is NOT part of this save path
**And** `permit_issue_date`, if provided, is validated as not in the future
**And** a success toast confirms the update

**Given** the user selects a different state from the state dropdown
**When** the selection changes (before any Save is clicked)
**Then** a shadcn `<AlertDialog>` renders immediately, showing:
- "Changing your state to [New State] will update your hour requirements and report format."
- "[New State] requires: [X] total hours, [Y] night hours[, Z inclement hours]."
- "Your [N] existing trip entries will NOT be deleted or modified."
- Confirm and Cancel buttons

**Given** the user confirms the state change dialog
**When** the Server Action runs
**Then** `users.state_code` is updated to the new state
**And** `users.driver_ed_completed` is reset to `false` — user must re-confirm driver-ed for the new state
**And** the user is redirected to `/dashboard` where progress bars immediately reflect the new state's targets — existing trips are not deleted, not re-validated; progress recalculates against the new state config on next dashboard load with no additional action required

**Given** the user cancels the state change dialog
**When** the dialog closes
**Then** no changes are made and the state dropdown reverts to the original value

**Given** the user clicks "Delete Account", types "DELETE" in the confirmation input, and clicks the final confirm button
**When** the Server Action runs
**Then** all student user records with `parentId = user.id` are permanently deleted along with their trips
**And** the parent user record and all their own associated trips are permanently deleted
**And** the session is invalidated and the user is redirected to `/login`

**Given** the user opens the delete account dialog but has not typed "DELETE" exactly
**When** they attempt to confirm
**Then** the confirm button remains disabled until the exact string "DELETE" is entered

---

## Epic 7: Public State Information Pages

Prospective users can discover the app via search and check their state's requirements before registering — with a direct CTA pre-filled with their state code.

### Story 7.1: Public State Information Pages

As a prospective user researching learner's permit requirements,
I want to browse a list of all states and view detailed requirements for my state without logging in,
So that I can confirm the app meets my needs before creating an account.

**Acceptance Criteria:**

**Given** a visitor navigates to `/states`
**When** the page loads without authentication
**Then** a grid of all 51 jurisdictions renders, each card showing: state name, total hours required, night hours required, permit age, and whether log submission is required
**And** the grid is sortable by hours required and filterable by "log required" / "no log required" / "no hour requirement"
**And** the page renders as a Server Component with no auth check — the `(public)` route group excludes it from `(app)/layout.tsx`'s auth guard

**Given** a visitor navigates to `/states/[code]` for a valid state code
**When** the page loads
**Then** the full requirements breakdown renders: hours, supervisor rules, hold period (if `hold_period_days > 0`), driver-ed impact, night driving definition, official form name with link, and `source_url` as "View source" at the bottom
**And** a "Start tracking your hours" CTA button links to `/register?state=[code]`

**Given** a visitor navigates to `/states/[code]` for a Tier 2 state
**When** the page loads
**Then** an inline disclaimer renders: "Requirements shown are based on publicly available information (IIHS) and may not reflect recent changes. Always verify with your state's licensing agency."

**Given** a visitor navigates to `/states/[code]` with an invalid or unrecognised state code
**When** the page loads
**Then** a 404 response is returned via Next.js `notFound()`

**Given** the middleware configuration
**When** `/states` or `/states/[code]` is requested
**Then** the auth middleware does not intercept these paths — they are excluded from the matcher in `src/middleware.ts`
**And** Story 2.1 also modifies `src/middleware.ts`; this story's middleware changes must be based on the Story 2.1 branch or explicitly coordinated at PR time to avoid merge conflicts

**Given** the `/register` page
**When** it receives a `?state=[code]` query parameter with a valid state code
**Then** the state dropdown pre-selects that state and the state summary card renders immediately on load

---

## Epic 8: Quality Assurance & Launch Readiness

Automated tests confirm correct behavior across multiple state configurations, all critical flows are regression-tested, and a final spot-check verifies the Tier 1 data populated in Story 1.3 is accurate.

### Story 8.1: validateTrip Unit Tests

As a developer,
I want the complete suite of `validateTrip()` unit tests passing,
So that state-specific validation logic is regression-protected and all `it.todo` stubs from Story 1.1 are resolved.

**Acceptance Criteria:**

**Given** the `it.todo` stubs in `src/lib/validation.test.ts` from Story 1.1
**When** Story 8.1 is complete
**Then** all stubs are replaced with passing tests — no `it.todo` remains in the file
**And** the suite covers at minimum 10 test cases across 6 or more state configs, asserting on `ValidationResult.code` (never `.message`)

**Given** the following test cases are required
**When** each runs
**Then** it passes:
- IL baseline: valid trip passes with no errors
- IL baseline: date in future returns `DATE_IN_FUTURE`
- PA inclement: weather is inclement, `inclement_minutes === 0` returns `INCLEMENT_REQUIRED`
- PA inclement: `inclement_minutes > daytime + nighttime` returns `INCLEMENT_EXCEEDS_TOTAL`
- PA inclement: `inclement_minutes === daytime + nighttime` (boundary) passes with no errors
- MN supervisor: `supervisor_field_required = true`, empty `supervisor_name` returns `SUPERVISOR_REQUIRED`
- DC supervisor license: `supervisor_license_field_required = true`, empty value returns `SUPERVISOR_LICENSE_REQUIRED`
- AR none-mode: invalid `location_type` does NOT return `LOCATION_INVALID`
- AR none-mode: both minutes zero returns `NO_MINUTES_LOGGED`
- OH daily cap: documents that `OH_DAILY_CAP` warning is a Server Action concern, not a `validateTrip()` output — test asserts the pure function does NOT return this code

**And** `formatCell` tests in `src/lib/report/format-cell.test.ts` (written in Story 5.1) continue to pass — no regressions
**And** `npm test -- --run` passes with zero failures and zero skipped tests in these files

### Story 8.2: Colorado Full-Flow End-to-End Test

As a developer,
I want an E2E test covering the complete CO user flow,
So that the most critical multi-state path is regression-protected across register, log, dashboard, report, and PDF.

**Acceptance Criteria:**

**Given** the CO state config entry exists in `src/data/state-configs.ts` (shipped in the same PR as this test)
**When** the E2E test suite runs against a production build on port 3001
**Then** the following steps all pass in sequence:

1. Visit `/register`, select Colorado, verify the state summary card shows CO's requirements (50 hrs total, 10 night, supervisor name required), complete registration
2. Log a trip: navigate to `/trips/new`, verify the supervisor name field is visible, fill in all fields including supervisor name, submit — verify the trip appears in `/trips`
3. Dashboard: navigate to `/dashboard`, verify progress bars show CO targets (50 hrs, 10 night), verify the state info card shows "Colorado Requirements"
4. Report: navigate to `/report`, verify the report table includes a supervisor name column matching CO's `report_columns`
5. PDF: click "Download PDF", intercept the Playwright download event, assert the downloaded filename matches `driving-log-CO-*.pdf` and the response Content-Type is `application/pdf`

**And** the test uses an isolated `test.db` (not local.db or Turso production)
**And** `AUTH_TRUST_HOST=1` and `AUTH_URL=http://localhost:3001` are set in the Playwright webServer env
**And** `npm run test:e2e` passes with this test included

### Story 8.3: Final Tier 1 Spot-Check and Launch Sign-off

As a developer,
I want a final regression spot-check of the Tier 1 state data and a confirmed iOS Safari PDF test,
So that any data errors introduced since Story 1.3's primary verification are caught before launch.

**Acceptance Criteria:**

**Given** Story 1.3 completed primary manual verification of all 16 Tier 1 states
**When** Story 8.3 runs as a pre-launch gate
**Then** a spot-check is performed on a sample of 4–5 Tier 1 states (one per major edge-case: notarization, inclement, supervisor license, hold period, submission-required) confirming their `source_url` still resolves and the key fields (total hours, form name) are unchanged
**And** any discrepancies found are corrected in `src/data/state-configs.ts` with `effective_date` updated
**And** the static data validation script passes in CI after any corrections

**Given** a Tier 1 state with ≥10 `report_columns` (MN or DC)
**When** the PDF is downloaded and opened in iOS Safari on a physical device or Simulator
**Then** the landscape orientation renders legibly — columns are not clipped and text is readable at the DMV counter

**And** a sign-off checklist is added to the PR:
- `[x]` Static data validation script passing for all 51 entries
- `[x]` Spot-check complete for 4–5 Tier 1 states
- `[x]` iOS Safari landscape PDF verified
- `[x]` All Playwright E2E tests passing
- `[x]` All Vitest unit tests passing
