# Business Requirements Document: Multi-State Expansion

> **AI-Generated Document**
> Date: 2026-04-25 15:14:00 CT
> Model: Claude Opus 4.6
> User: John Telford
> Prompt: Build a detailed BRD for expanding student-driver-log from Illinois-only to all 50 states + DC. Resolve all open product owner questions. Cover screen changes, workflow changes, and data schema changes.
> WARNING: This document was produced by an AI language model. Content may contain errors, omissions, or hallucinations. All factual claims, data, and recommendations should be independently verified before use.

---

## 1. Executive Summary

student-driver-log currently supports only Illinois (50 hours total, 10 at night, Form DSD X 152). This BRD defines the requirements to expand to all 50 US states plus Washington DC.

The core challenge is not adding more states to a dropdown. It is that each jurisdiction defines different hour thresholds, night-hour subsets, supervisor eligibility rules, log field requirements, and documentation formats. The app must become a configurable, data-driven platform where state-specific rules govern validation, progress tracking, and report generation without per-state code branches.

**Scope:** Architecture, data model, screen, workflow, and report changes required to support multi-state operation. This is a v2.0 feature set that builds on the existing MVP.

**Out of scope:** iOS app (v1.5), GPS tracking, multi-user/OAuth (v1.0), monetization, marketing, legal review of state compliance claims, admin UI for state config management.

---

## 2. Problem Statement

The current app hardcodes Illinois requirements: 50 total hours, 10 nighttime hours, a single set of location-type and weather enums, and a report matching Illinois Form DSD X 152. A user in Colorado (50 hrs, 10 night, mandatory submitted log DR 2324), Pennsylvania (65 hrs, 10 night, 5 inclement weather), or Maine (70 hrs, 10 night, mailed-in log MVE-21) cannot use the app because the hour targets, progress bars, validation rules, and report output are wrong for their state.

---

## 3. Goals and Success Criteria

**Goal 1:** A user in any US state can select their state and see accurate hour requirements, progress tracking, and validation rules for their jurisdiction.

**Goal 2:** The report output adapts to match the field requirements of each state (column structure, attestation language, signature blocks).

**Goal 3:** Adding or updating a state's requirements is a data change (database/config), not a code change.

**Success criteria:**

- App supports all 51 jurisdictions at launch
- Adding a new state or updating an existing state's rules requires only a config/seed-data change and no code deployment
- All existing Illinois functionality continues to work without regression
- Report output passes manual comparison against each state's official log form for the 16 Tier 1 launch-priority states
- Tier 2 and Tier 3 states launch with IIHS-sourced data and a prominent accuracy disclaimer

---

## 4. Key Product Decisions

The following decisions were evaluated during requirements gathering and are now locked. They are documented here so the delivery team does not revisit them.

**Decision 1: Existing IL users will be prompted to confirm their state on next login.**
One-time modal on first login after v2.0 deployment. Modal shows: "We now support all 50 states. Please confirm your state to ensure your requirements are accurate." State defaults to Illinois. User confirms or changes. Modal does not appear again after confirmation. Implementation: add `state_confirmed` boolean to users table, default false for existing users, true for new registrations.

**Decision 2: The app will not validate supervisor eligibility at trip entry.**
States have varying supervisor age (18-25+) and tenure (1-5 years) requirements. The app will display the user's state supervisor rules on the state info card (dashboard) and on the trip entry form as helper text. It will not ask for supervisor age or validate eligibility. Rationale: too intrusive, the app cannot verify, and incorrect validation could create false confidence. The supervisor_name field (where required by state forms) is a text input with no age/tenure validation.

**Decision 3: States with zero hour requirements (AR, MS, NJ) are fully supported.**
Users in these states can register and log trips. The dashboard removes progress bars and shows cumulative stats only: "You have logged X hours (Y daytime, Z nighttime) of practice." The report page generates a simple practice log without compliance framing. Rationale: parents in these states still benefit from tracking, and the app should not exclude them.

**Decision 4: RoadReady-compatible output format is deferred to v2.1.**
For states that explicitly accept RoadReady app printouts (AK, CO, IA, NV, NH, OH, VT), the v2.0 app generates a clean PDF containing the same fields as the state's official form. Matching the exact RoadReady output format is a v2.1 enhancement. For v2.0, the PDF includes a footer disclaimer and a link to the official state form.

**Decision 5: State config is managed via code/migration only.**
No admin UI. State config changes go through the standard development workflow: update seed file, create migration, deploy. Rationale: state laws change infrequently (quarterly review cycle), the user base does not justify the engineering cost of an admin UI, and code review on config changes provides a quality gate. Admin UI is a v3.0 consideration if user volume justifies it.

**Decision 6: Data accuracy threshold is tiered.**
Tier 1 states (16 states with mandatory submitted logs) are manually verified against official state DMV sites before launch. Tier 2 and Tier 3 states launch with IIHS-sourced data and a stronger disclaimer: "Requirements shown are based on publicly available information. Verify with your state's licensing agency." All states include a `source_url` field linking to the authoritative source used.

---

## 5. State Segmentation and Launch Priority

### 5.1 Tier 1: Launch Priority (16 states)

States where a per-trip submitted log is mandatory and paper-based. Highest product-market fit. Manually verified before launch.

| State | Total Hrs | Night Hrs | Other Hrs | Official Form | Submission |
|-------|-----------|-----------|-----------|---------------|------------|
| CO | 50 | 10 | - | DR 2324 | Required at appointment |
| DC | 40 | - | - | DMV-GRAD-HR40 | Required at road test |
| IN | 50 | 10 | - | State Form 54706 | Required at BMV |
| KY | 60 | 10 | - | Practice Driving Log | Required before skills test |
| ME | 70 | 10 | - | MVE-21 | Mailed to BMV |
| MD | 60 | 10 | - | RD-006 | Required at skills test |
| MI | 50 | 10 | - | Supervised Driving Log | Required at skills exam |
| MN | 50 | 15 | - | Supervised Driving Log | Required with application |
| MT | 50 | 10 | - | MV-TD | Required at license station |
| NV | 50 | 10 | - | DLD-130 | Required (strict format) |
| NH | 40 | 10 | - | DSMV 509 | Required with application |
| OH | 50 | 10 | - | BMV 5791 | Required, notarized |
| SD | 50 | 10 | 10 inclement | DPS Student Driving Log | Required with application |
| VT | 40 | 10 | - | VN-210 | Required with application |
| WI | 50 | 10 | - | HS-303 | Required with application |
| WV | 50 | 10 | - | DMV-10-GDL | Required with Level 2 app |

### 5.2 Tier 2: Attestation States (18 states)

States requiring a signed affidavit/certification form but no per-trip log. App value is convenience + accuracy.

AL, AZ, CT, FL, GA, HI, IL (current), KS, NE, NY, NC, OK, PA, RI, SC, TN, TX, WY

### 5.3 Tier 3: Informal/No Requirement (17 states)

States with optional logs, parent-signed applications, or no hour requirement. App value is organizational.

AK, AR, CA, DE, ID, IA, LA, MA, MO, MS, NJ, NM, ND, OR, UT, VA, WA

---

## 6. Data Schema Changes

### 6.1 New Static Module: `src/data/state-configs.ts`

This is the core of the multi-state engine. Each entry defines one jurisdiction's complete rule set. State config is delivered as a **static TypeScript module** — not a database table. This eliminates runtime DB round-trips, cold-start latency, and caching complexity. Updating a state's requirements is a code change (edit the file, open a PR, deploy).

**Rationale:** Config changes at most quarterly. A deploy-per-update is acceptable for a personal project. Static typing enforces schema correctness at compile time. Git history is the audit trail. Admin UI (if ever needed) is a v3.0 consideration.

```typescript
// src/data/state-configs.ts

export type ValidationMode =
  | 'full'        // all rules apply (most states)
  | 'hours_only'  // no form/column requirements
  | 'log_only'    // no hour targets, just structured logging
  | 'none';       // AR, MS, NJ — no requirements, cumulative stats only

export type ReportColumnDataType =
  | 'date' | 'text' | 'minutes_hhmm' | 'minutes_raw'
  | 'cumulative_minutes' | 'initials' | 'signature' | 'custom';

export type ReportColumn = {
  field_key: string;           // from defined vocabulary, or 'custom'
  custom_field_name?: string;  // required when field_key === 'custom'
  label: string;
  data_type: ReportColumnDataType;
  html_width_pct?: number;     // defaults computed from data_type if omitted
  pdf_width_pt?: number;       // defaults computed from data_type if omitted
};

export type StateConfig = {
  state_code: string;                    // 2-letter: "IL", "CO", "DC"
  state_name: string;
  validation_mode: ValidationMode;
  permit_min_age_months: number;         // e.g. 180 = 15 years
  total_hours_required: number;          // 0 for none-required states
  daytime_hours_required: number | null; // null if no explicit daytime minimum
  nighttime_hours_required: number;
  inclement_hours_required: number;      // PA=5, SD=10, others=0
  hours_waived_with_driver_ed: boolean;  // AL, NE, WV
  driver_ed_hours_count_toward_total: boolean;
  max_hours_per_day: number | null;      // null if no cap; OH=4
  max_hours_per_week: number | null;     // null if no cap; NC=10
  hold_period_days: number;
  supervisor_min_age: number;
  supervisor_min_license_years: number;
  supervisor_must_be_relative: boolean;
  supervisor_field_required: boolean;
  supervisor_license_field_required: boolean;
  night_definition_start: string;        // "sunset" | "21:00" | "30min_after_sunset"
  night_definition_end: string;          // "sunrise" | "05:00" | "30min_before_sunrise"
  timezone: string;                      // IANA tz, e.g. "America/Chicago"
  official_form_name: string | null;     // e.g. "DSD X 152"
  official_form_url: string | null;
  log_submission_required: boolean;
  log_notarization_required: boolean;
  report_columns: ReportColumn[];        // typed array, not JSON string
  attestation_language: string | null;
  supervisor_rules_display: string;
  location_type_options: string[];       // typed array, not JSON string
  weather_options: string[];             // typed array, not JSON string
  notes: string | null;
  effective_date: string;                // ISO date when this config became valid (for display)
  source_url: string;                    // authoritative URL for quarterly verification
};

export const STATE_CONFIGS: Record<string, StateConfig> = { /* 51 entries */ };
export const STATE_CODES = Object.keys(STATE_CONFIGS);
```

**No `id`, `created_at`, or `updated_at` fields** — `state_code` is the primary key; git history is the audit trail.

### 6.2 Changes to `users` Table

```
users (MODIFIED -- new fields added, existing fields unchanged)
  state_code          TEXT NOT NULL DEFAULT "IL"  -- validated app-side against STATE_CODES (no DB FK)
  state_confirmed     BOOLEAN NOT NULL DEFAULT true  -- false for pre-v2.0 users
  driver_ed_completed BOOLEAN NOT NULL DEFAULT false
  permit_issue_date   TEXT  -- ISO date, optional, for hold-period tracking
```

**Note on `state_code` integrity:** With state config delivered as a static module rather than a DB table, there is no database FK constraint on `users.state_code`. Validity is enforced at the application layer: registration and state-change Server Actions validate `state_code` against `STATE_CODES` before writing. Invalid state codes are rejected with a user-facing error.

### 6.3 Changes to `trips` Table

```
trips (MODIFIED -- new fields added, existing fields unchanged)
  inclement_minutes   INTEGER NOT NULL DEFAULT 0  -- PA, SD
  supervisor_name     TEXT  -- required by some state forms
  supervisor_license  TEXT  -- required by DC, ME
  vehicle_info        TEXT  -- some states require vehicle identification
  start_time          TEXT  -- MN logs with start/end; optional for all others
  end_time            TEXT  -- paired with start_time
```

### 6.4 State Config History — Deferred to v2.1

With static config, git history is the audit trail for state rule changes. Each update to `src/data/state-configs.ts` is a committed PR with a conventional commit message (`chore(state-configs): update OH total_hours_required 50→40`) and the `effective_date` field in the config entry is updated to match.

A formal `state_config_history` DB table (originally specified here) is deferred to v2.1. If user volume or compliance requirements justify it, v2.1 can introduce the table and backfill history from git log. For v2.0 the tradeoff is accepted: config-at-time-of-PDF-generation is the git SHA of the deployed build, not a queryable DB record.

### 6.5 Static Data Strategy

The state config data is the single largest work item in this project. It requires populating 51 entries with 28+ typed fields each, including `report_columns`, `location_type_options`, and `weather_options` as typed TypeScript arrays.

**Approach:** `src/data/state-configs.ts` exports `STATE_CONFIGS: Record<string, StateConfig>` as a static module. Each entry is sourced from state-by-state research with `source_url` pointing to the authoritative DMV/SOS page. TypeScript enforces schema correctness at compile time — no JSON parse errors at runtime.

**Pre-population audit:** Before writing any entries, do a structural scan of all 51 official state forms to identify any field categories not covered by the current `ReportColumn` vocabulary. New `field_key` values or `data_type` values must be added to the type definitions before populating data. This prevents vocabulary gaps discovered during Tier 1 QA from blocking the launch.

**Verification process for Tier 1 states:** Before launch, a human reviewer opens each Tier 1 state's official DMV page (via `source_url`), compares the data against the page, and marks the entry as verified. This is a manual QA step, not automated.

**Quarterly maintenance:** After launch, compare entries against the IIHS GDL table (https://www.iihs.org/topics/teenagers/graduated-licensing-laws-table) quarterly. Any changes are a PR to `src/data/state-configs.ts` updating the relevant fields and `effective_date`. No DB migration required.

**Known states in regulatory flux (as of April 2026):**

| State | Issue | Action Required |
|-------|-------|-----------------|
| NC | HB 584 eliminated log/DEC requirements Oct 2025; holding period reverts Jan 2026 | Verify current status with NCDMV before seeding |
| FL | DETS course required since Aug 2025 (SB 994) | Verify impact on hour logging requirements |
| OH | Sept 2025 law expanded driver-ed to all under-21 | Verify BMV 5791 form revision |
| IN | Supervisor rules recently tightened to 25+ relative | Verify effective date and exceptions |

### 6.6 Migration Strategy

The v2.0 DB migration is additive only — existing IL users and their trip data are unaffected.

- Add new columns to `users` with defaults so existing rows are valid immediately
- `state_confirmed` defaults to `false` for existing users, triggering the one-time state confirmation modal on next login
- Add new columns to `trips` as nullable (no existing data to backfill)
- **No `state_configs` or `state_config_history` DB tables** — state config is a static module, not a DB schema change
- Run as a single Drizzle schema change targeting only `users` and `trips`: `db:generate` then `db:migrate`
- Zero downtime: all new columns have defaults or are nullable
- This migration is one-way: once deployed to Turso and users begin confirming their states, rolling back the `users` schema change would corrupt data. Document before deploying.

---

## 7. Screen Changes

### 7.1 Registration Screen (`/register`)

**Current state:** Username, password, driver name.

**Changes:**

| Element | Change | Details |
|---------|--------|---------|
| State selector | NEW | Dropdown of all 51 jurisdictions, sorted alphabetically. Required field. No default (user must explicitly select). Grouped: states with hour requirements first, then "No state requirement" group (AR, MS, NJ) at bottom with explanatory label. |
| State summary card | NEW | After state selection, display a card showing: total hours required, night hours required, inclement hours (if applicable), supervisor requirements (from `supervisor_rules_display`), official form name. Sourced from `state_configs`. |
| Driver ed checkbox | NEW (conditional) | "Have you completed a state-approved driver education course?" Displayed only for states where `hours_waived_with_driver_ed = true` (AL, NE, WV) or where driver-ed reduces hours (AZ, MN, NV, OR, SD). Hidden for all other states. |
| Permit issue date | NEW | Date picker. Label: "When did you receive your learner's permit? (optional)". Not required at registration. Used for hold-period tracking on dashboard. |
| "No hours required" notice | NEW (conditional) | For AR, MS, NJ: "Your state does not mandate logged practice hours, but tracking your practice can help you prepare for the road test and build confidence." |

**Validation:**

- `state_code` required, must match a valid `state_configs.state_code`
- `permit_issue_date` if provided, cannot be in the future
- All existing validation unchanged (username 3-32 chars, password 8+ chars, driver_name required)

### 7.2 State Confirmation Modal (existing users only)

**New component.** Displayed once for all users whose `state_confirmed = false` (pre-v2.0 users).

| Element | Details |
|---------|---------|
| Header | "We now support all 50 states" |
| Body | "Please confirm your state so we can show you the correct requirements and report format." |
| State dropdown | Pre-selected to Illinois (existing default). User can change or confirm. |
| Driver ed checkbox | Same conditional logic as registration. |
| Confirm button | Sets `state_code`, `state_confirmed = true`, optionally `driver_ed_completed`. |
| Dismiss | Not dismissable. Must confirm to proceed. Blocks all other navigation. |

### 7.3 Trip Entry Form (`/trips/new`)

**Current state:** Date, location type (5 options), weather (5 options), daytime minutes, nighttime minutes, notes.

**Changes:**

| Element | Change | Details |
|---------|--------|---------|
| Location type dropdown | MODIFIED | Options populated from `state_configs.location_type_options` for the user's state. Default set covers most states: highway, residential, rural, urban, parking_lot. States like ND add: dirt_gravel, winter_conditions. |
| Weather dropdown | MODIFIED | Options populated from `state_configs.weather_options`. Default: clear, rain, snow, fog, ice. PA and SD options must clearly distinguish inclement from non-inclement conditions. |
| Inclement minutes field | NEW (conditional) | Displayed only when `state_configs.inclement_hours_required > 0` (PA, SD). Integer input, 0-600. Label: "Minutes in inclement weather (rain, snow, fog, ice)". Helper text: "This is a subset of your day/night minutes, not additional time." |
| Supervisor name | NEW (conditional) | Text input. Displayed when `state_configs.supervisor_field_required = true`. Label: "Supervising driver name". |
| Supervisor license | NEW (conditional) | Text input. Displayed when `state_configs.supervisor_license_field_required = true` (DC, ME). Label: "Supervisor license number". |
| Start time / End time | NEW (optional) | Time pickers. Always available for all states. When both provided, auto-calculate total minutes and populate daytime/nighttime fields. If trip spans sunset/sunrise, prompt user to manually split day/night portions. |
| Supervisor rules helper | NEW | Below the supervisor fields (or at form top if no supervisor fields), display: "Supervisor requirement: [supervisor_rules_display from state_configs]". Informational only, no validation against it. |
| Daily cap warning | NEW (conditional) | For OH users: if cumulative hours for the selected date exceed 4, display orange toast: "Ohio limits countable practice to 4 hours per day. This entry will still be saved." Soft warning, does not block. |
| Weekly cap warning | NEW (conditional) | For NC users: if cumulative hours for the week containing the selected date exceed 10, display orange toast. Soft warning, does not block. |

**Validation:**

- `location_type` must be in user's state `location_type_options` array
- `weather` must be in user's state `weather_options` array
- `inclement_minutes` required and > 0 only when state has `inclement_hours_required > 0` AND weather selection indicates inclement conditions
- `inclement_minutes` cannot exceed `daytime_minutes + nighttime_minutes` (subset, not additive)
- `supervisor_name` required when `state_configs.supervisor_field_required = true`
- `supervisor_license` required when `state_configs.supervisor_license_field_required = true`
- If `start_time` and `end_time` both provided, `end_time` must be after `start_time`
- All existing validation unchanged (date not in future, at least one of day/night > 0, minutes 0-600, notes max 500 chars)

### 7.4 Trips List (`/trips`)

**Current state:** Table with date, location, weather, daytime, nighttime, total, actions.

**Changes:**

| Element | Change | Details |
|---------|--------|---------|
| Inclement column | NEW (conditional) | Shown only for PA/SD users. Displays inclement minutes per trip. |
| Supervisor column | NEW (conditional) | Shown when `state_configs.supervisor_field_required = true`. |
| Column ordering | MODIFIED | Match the user's state `report_columns` field order. Illinois users see identical column order to current app. |
| Filter by date range | NEW | Date range picker above table. Defaults to "All time". Options: Last 30 days, Last 90 days, Custom range. |
| Export CSV | NEW | "Export CSV" button. Column headers match state form field labels from `report_columns`. Filename: `driving-log-[state_code]-[date].csv`. |

### 7.5 Dashboard (`/dashboard`)

**Current state:** Daytime total, nighttime total, grand total, progress bars to 50h and 10h night.

**Changes:**

| Element | Change | Details |
|---------|--------|---------|
| Hour targets | MODIFIED | Progress bars use `state_configs.total_hours_required` and `state_configs.nighttime_hours_required` instead of hardcoded 50/10. Progress bar labels show "[current] of [target] hours". |
| Inclement progress bar | NEW (conditional) | Third progress bar for PA (target: 5h) and SD (target: 10h). Label: "Inclement weather: [current] of [target] hours". |
| "Hours waived" banner | NEW (conditional) | For users with `driver_ed_completed = true` in a state where `hours_waived_with_driver_ed = true`: green banner: "Your state waives the [X]-hour practice requirement because you completed driver education. Your logged hours are shown below for your records." Progress bars render but with no target (cumulative display only). |
| "No requirement" display | NEW (conditional) | For AR, MS, NJ users: replace progress bars with cumulative stats cards: "Total practice: X hours", "Daytime: Y hours", "Nighttime: Z hours". No target, no progress bar. Header: "Your state does not require logged practice hours. Here is your practice summary." |
| Hold period tracker | NEW | Card below progress bars. Requires `permit_issue_date` to be set. Shows: permit issue date, required hold period (from `state_configs.hold_period_days`), earliest eligible date, days remaining (or "Eligible!" if past). If `permit_issue_date` is not set, card shows: "Add your permit issue date in Settings to track your holding period." |
| State info card | NEW | Collapsible card (collapsed by default). Title: "[State Name] Requirements". Contents: total hours, night hours, inclement hours (if applicable), supervisor rules, hold period, official form name with link, night driving definition. Footer: "Change state" link to `/settings`. |
| Completion checklist | NEW | When ALL hour requirements are met (and hold period elapsed if `permit_issue_date` set): green completion card with state-specific next steps. If `log_submission_required`: "Print your log and bring it to [agency]. Download your official form: [link]." If `log_notarization_required`: "Your state requires your log to be notarized before submission." |

### 7.6 Report (`/report`)

**Current state:** Single Illinois SOS format. Columns: Date, Location of Practice, Weather Conditions, Daytime, Daytime Total, Nighttime, Nighttime Total, Grand Total, Initials.

**Changes:**

The report renders dynamically based on the `report_columns` JSON from `state_configs`. The renderer is a single component that accepts a column definition array and trip data, producing both HTML and PDF output.

| Element | Change | Details |
|---------|--------|---------|
| Report header | MODIFIED | "[State Name] Practice Driving Log". If `official_form_name` exists: "Reference: [form name]". |
| Column structure | MODIFIED | Rendered from `state_configs.report_columns` JSON. Each column definition specifies field_key, label, width, and data_type. See Section 8 for schema. |
| Supervisor columns | CONDITIONAL | Rendered when `report_columns` includes supervisor_name or supervisor_license fields. |
| Inclement column | CONDITIONAL | Rendered when `report_columns` includes inclement_minutes or inclement_cumulative fields. |
| Running totals | MODIFIED | Final row(s) show totals for each cumulative column defined in `report_columns`. |
| Attestation block | NEW | Below the trip table. State-specific text from `state_configs.attestation_language`. Signature line: "Signature of Parent, Guardian, or Supervising Adult: _______________  Date: ________". |
| Notarization block | NEW (conditional) | When `log_notarization_required = true` (FL, OH, HI): additional block with Notary Public section: name, commission number, expiration, seal area, date. |
| Official form link | NEW | "Download the official [state] form: [link]" when `official_form_url` is not null. |
| Disclaimer footer | NEW | On every report: "Generated by studentdriver.site. This document is a practice driving log generated for your convenience. It is not an official state document. Verify acceptance with your local licensing office before submitting." |
| Print styling | MODIFIED | @media print CSS handles variable column counts (8 through 11). Font sizes scale down for wider tables. Landscape orientation triggered when column count > 9. |

### 7.7 PDF Export (`/api/report/pdf`)

**Current state:** Single Illinois-format PDF via @react-pdf/renderer.

**Changes:**

| Element | Change | Details |
|---------|--------|---------|
| Dynamic columns | MODIFIED | PDF layout accepts column definitions from `report_columns`. Column widths specified as percentages in the JSON, converted to absolute widths at render time. |
| Page orientation | MODIFIED | Portrait for column count <= 9. Landscape for 10+. |
| Multi-page tables | MODIFIED | Trips paginate with repeated column headers on each page. Rows per page calculated dynamically based on column count and orientation. |
| Attestation page | NEW | Final page with attestation text, signature lines, and notarization block (conditional). |
| Disclaimer footer | NEW | Bottom of every page: "Generated by studentdriver.site. Not an official state document." |

### 7.8 New Screen: Settings (`/settings`)

**New screen.** Allows users to modify profile and state settings after registration.

| Element | Details |
|---------|---------|
| Driver name | Editable text field. Current value pre-filled. |
| State selector | Dropdown matching registration. Changing state triggers confirmation dialog (see Section 9.5). |
| Driver ed toggle | Same conditional logic as registration. |
| Permit issue date | Date picker. |
| Delete account | Destructive action. Requires typing "DELETE" to confirm. Permanently deletes user record and all associated trips. |

### 7.9 New Screen: State Information (`/states` and `/states/[code]`)

Public-facing (no auth required). Serves as reference content and SEO.

| Element | Details |
|---------|---------|
| State list page (`/states`) | Grid of all 51 jurisdictions. Each card shows: state name, total hours, night hours, permit age, whether log submission is required. Sortable by hours required. Filterable by "log required" / "no log required" / "no hour requirement". |
| State detail page (`/states/[code]`) | Full requirements breakdown: hours, supervisor rules, hold period, driver-ed impact, night driving definition, official form name + link, nighttime curfew, passenger restrictions, license tiers. Source link at bottom. |
| CTA | "Start tracking your hours" button linking to `/register?state=[code]`. |

---

## 8. `report_columns` JSON Schema

The `state_configs.report_columns` field drives dynamic report rendering. The renderer is a single React component that accepts this schema and trip data.

### Column definition:

```json
{
  "field_key": "trip_date",
  "label": "Date",
  "width_pct": 10,
  "data_type": "date",
  "format": "MM/DD/YYYY"
}
```

**Supported `data_type` values:**

| Type | Rendering | Example |
|------|-----------|---------|
| `date` | Formatted date string | "04/25/2026" |
| `text` | Raw text from field | "Highway" |
| `minutes_hhmm` | Integer minutes displayed as H:MM | 90 -> "1:30" |
| `minutes_raw` | Integer minutes displayed as number | 90 -> "90" |
| `cumulative_minutes` | Running total of a minute field, displayed as H:MM | "12:30" |
| `initials` | Empty cell for handwritten initials (print) | "" |
| `signature` | Empty cell for handwritten signature (print) | "" |

**Supported `field_key` values:**

`trip_date`, `location_type`, `weather`, `daytime_minutes`, `daytime_cumulative`, `nighttime_minutes`, `nighttime_cumulative`, `inclement_minutes`, `inclement_cumulative`, `grand_total_cumulative`, `supervisor_name`, `supervisor_license`, `initials`, `notes`, `start_time`, `end_time`

### Example: Illinois (current app behavior preserved)

```json
[
  {"field_key": "trip_date", "label": "Date", "width_pct": 8, "data_type": "date"},
  {"field_key": "location_type", "label": "Location of Practice", "width_pct": 18, "data_type": "text"},
  {"field_key": "weather", "label": "Weather Conditions", "width_pct": 14, "data_type": "text"},
  {"field_key": "daytime_minutes", "label": "Daytime", "width_pct": 10, "data_type": "minutes_hhmm"},
  {"field_key": "daytime_cumulative", "label": "Daytime Total", "width_pct": 10, "data_type": "cumulative_minutes"},
  {"field_key": "nighttime_minutes", "label": "Nighttime", "width_pct": 10, "data_type": "minutes_hhmm"},
  {"field_key": "nighttime_cumulative", "label": "Nighttime Total", "width_pct": 10, "data_type": "cumulative_minutes"},
  {"field_key": "grand_total_cumulative", "label": "Grand Total", "width_pct": 10, "data_type": "cumulative_minutes"},
  {"field_key": "initials", "label": "Initials", "width_pct": 10, "data_type": "initials"}
]
```

### Example: Pennsylvania (inclement weather column)

```json
[
  {"field_key": "trip_date", "label": "Date", "width_pct": 7, "data_type": "date"},
  {"field_key": "location_type", "label": "Location", "width_pct": 13, "data_type": "text"},
  {"field_key": "weather", "label": "Weather", "width_pct": 10, "data_type": "text"},
  {"field_key": "daytime_minutes", "label": "Day", "width_pct": 8, "data_type": "minutes_hhmm"},
  {"field_key": "daytime_cumulative", "label": "Day Total", "width_pct": 8, "data_type": "cumulative_minutes"},
  {"field_key": "nighttime_minutes", "label": "Night", "width_pct": 8, "data_type": "minutes_hhmm"},
  {"field_key": "nighttime_cumulative", "label": "Night Total", "width_pct": 8, "data_type": "cumulative_minutes"},
  {"field_key": "inclement_minutes", "label": "Inclement", "width_pct": 8, "data_type": "minutes_hhmm"},
  {"field_key": "inclement_cumulative", "label": "Incl. Total", "width_pct": 8, "data_type": "cumulative_minutes"},
  {"field_key": "grand_total_cumulative", "label": "Grand Total", "width_pct": 8, "data_type": "cumulative_minutes"},
  {"field_key": "initials", "label": "Init.", "width_pct": 6, "data_type": "initials"}
]
```

### Example: Minnesota (start/end time, supervisor, minute-level)

```json
[
  {"field_key": "trip_date", "label": "Date", "width_pct": 8, "data_type": "date"},
  {"field_key": "start_time", "label": "Start", "width_pct": 8, "data_type": "text"},
  {"field_key": "end_time", "label": "End", "width_pct": 8, "data_type": "text"},
  {"field_key": "daytime_minutes", "label": "Minutes", "width_pct": 8, "data_type": "minutes_raw"},
  {"field_key": "daytime_cumulative", "label": "Total Min", "width_pct": 8, "data_type": "cumulative_minutes"},
  {"field_key": "location_type", "label": "Skills/Route", "width_pct": 14, "data_type": "text"},
  {"field_key": "weather", "label": "Conditions", "width_pct": 10, "data_type": "text"},
  {"field_key": "nighttime_minutes", "label": "Day/Night", "width_pct": 6, "data_type": "text"},
  {"field_key": "supervisor_name", "label": "Supervisor", "width_pct": 14, "data_type": "text"},
  {"field_key": "initials", "label": "Init.", "width_pct": 6, "data_type": "initials"}
]
```

### Example: DC (supervisor license required)

```json
[
  {"field_key": "trip_date", "label": "Date", "width_pct": 8, "data_type": "date"},
  {"field_key": "location_type", "label": "Location", "width_pct": 14, "data_type": "text"},
  {"field_key": "weather", "label": "Weather", "width_pct": 10, "data_type": "text"},
  {"field_key": "daytime_minutes", "label": "Hours", "width_pct": 8, "data_type": "minutes_hhmm"},
  {"field_key": "daytime_cumulative", "label": "Total", "width_pct": 8, "data_type": "cumulative_minutes"},
  {"field_key": "supervisor_name", "label": "Tutor Name", "width_pct": 16, "data_type": "text"},
  {"field_key": "supervisor_license", "label": "Tutor License #", "width_pct": 14, "data_type": "text"},
  {"field_key": "grand_total_cumulative", "label": "Grand Total", "width_pct": 10, "data_type": "cumulative_minutes"},
  {"field_key": "initials", "label": "Init.", "width_pct": 6, "data_type": "initials"}
]
```

---

## 9. Workflow Changes

### 9.1 Registration Flow

```
/register
  1. User selects state from dropdown
  2. State summary card renders with requirements
  3. [If state in {AL, AZ, MN, NE, NV, OR, SD, WV}]: driver-ed checkbox appears
  4. [If state in {AR, MS, NJ}]: "no requirement" informational notice appears
  5. User enters driver name, username, password
  6. User optionally enters permit issue date
  7. Submit
  8. Server creates user with state_code, state_confirmed=true
  9. Redirect to /dashboard with state-specific targets
```

### 9.2 Existing User State Confirmation Flow

```
Any authenticated page (post v2.0 deploy)
  1. Check users.state_confirmed
  2. [If false]: render blocking modal (Section 7.2)
  3. User selects state, optionally checks driver-ed
  4. Confirm
  5. Server updates state_code, state_confirmed=true
  6. Page reloads with state-specific content
```

### 9.3 Trip Entry Flow

```
/trips/new
  1. Form renders with fields determined by user's state_config:
     - Location options from state_configs.location_type_options
     - Weather options from state_configs.weather_options
     - Inclement minutes (if inclement_hours_required > 0)
     - Supervisor name (if supervisor_field_required)
     - Supervisor license (if supervisor_license_field_required)
     - Start/end time (always available, optional)
     - Supervisor rules displayed as helper text
  2. User fills form
  3. [If start_time and end_time provided]: auto-calculate total minutes
  4. Client-side validation against state rules
  5. [If OH and daily hours > 4]: orange warning toast, submission allowed
  6. [If NC and weekly hours > 10]: orange warning toast, submission allowed
  7. Submit (server action)
  8. Server validates against state_configs
  9. [If validation fails]: return errors, form repopulates
  10. [If validation passes]: insert trip, success toast, redirect to /trips
```

### 9.4 Progress Calculation Flow

```
/dashboard (on load)
  1. Fetch user record (includes state_code, driver_ed_completed, permit_issue_date)
  2. Fetch state_config for user's state_code
  3. Fetch all trips for user
  4. Calculate aggregates:
     - total_daytime = SUM(daytime_minutes)
     - total_nighttime = SUM(nighttime_minutes)
     - total_inclement = SUM(inclement_minutes)
     - grand_total = total_daytime + total_nighttime
  5. Determine display mode:
     a. [If total_hours_required = 0]: cumulative stats only, no progress bars
     b. [If driver_ed_completed AND hours_waived_with_driver_ed]: 
        cumulative stats with "waived" banner, no target on bars
     c. [Otherwise]: progress bars with targets from state_config
  6. Calculate hold period (if permit_issue_date set):
     - earliest_eligible = permit_issue_date + hold_period_days
     - days_remaining = max(0, earliest_eligible - today)
  7. Check completion:
     - [If grand_total >= total_hours_required 
        AND total_nighttime >= nighttime_hours_required
        AND total_inclement >= inclement_hours_required
        AND (permit_issue_date not set OR days_remaining = 0)]:
        show completion card with state-specific next steps
```

### 9.5 State Change Flow

```
/settings -> change state
  1. User selects new state from dropdown
  2. Confirmation dialog:
     "Changing your state to [new state] will update your hour
      requirements and report format.
      
      [New State] requires: [X] total hours, [Y] night hours[, Z inclement hours].
      
      Your [N] existing trip entries will NOT be deleted or modified.
      
      Continue?"
  3. [If user confirms]:
     - Server updates users.state_code
     - Clear driver_ed_completed (user must re-confirm for new state)
     - Redirect to /dashboard
  4. [If user cancels]: no change
```

### 9.6 Report Generation Flow

```
/report (on load)
  1. Fetch user's state_config
  2. Fetch all trips, sorted by trip_date ASC
  3. Parse report_columns JSON from state_config
  4. For each trip, map trip fields to report columns:
     - Cumulative columns computed as running totals
     - date formatted per column spec
     - minutes formatted per data_type (hhmm vs raw)
  5. Render HTML table:
     - Header row from column labels
     - Data rows from mapped trip data
     - Totals row at bottom
  6. Render attestation block (state_configs.attestation_language)
  7. [If log_notarization_required]: render notarization section
  8. Render disclaimer footer
  9. "Download PDF" button -> /api/report/pdf
  10. [If official_form_url]: "View official form" link

/api/report/pdf (on request)
  1. Same data fetch and column mapping as HTML
  2. Determine orientation: portrait if columns <= 9, landscape if > 9
  3. Render PDF via @react-pdf/renderer with dynamic columns
  4. Paginate trips with repeated headers
  5. Append attestation page
  6. Return PDF blob as download
```

---

## 10. Validation Rule Engine

### 10.1 Architecture

Create a pure function `validateTrip(trip, stateConfig)` in `src/lib/validation.ts`. This function:

- Accepts a trip object and the user's state config
- Returns `{ valid: boolean, errors: ValidationResult[], warnings: ValidationResult[] }`
- Each `ValidationResult` has `{ field: string, message: string }`
- Errors block submission. Warnings allow submission with a toast notification.
- Called on both client (for immediate feedback) and server (authoritative gate)

### 10.2 Validation Rules

**Error rules (block submission):**

| Rule | Condition | Message |
|------|-----------|---------|
| Trip date required | `!trip_date` | "Trip date is required" |
| Trip date not future | `trip_date > today` | "Trip date cannot be in the future" |
| Location required | `!location_type` | "Location type is required" |
| Location valid | `location_type not in stateConfig.location_type_options` | "Invalid location type for [state]" |
| Weather required | `!weather` | "Weather conditions are required" |
| Weather valid | `weather not in stateConfig.weather_options` | "Invalid weather condition for [state]" |
| Minutes range | `daytime_minutes < 0 OR > 600` | "Minutes must be between 0 and 600" |
| Minutes range | `nighttime_minutes < 0 OR > 600` | "Minutes must be between 0 and 600" |
| At least one > 0 | `daytime + nighttime = 0` | "At least one of daytime or nighttime must be greater than 0" |
| Inclement subset | `inclement_minutes > daytime + nighttime` | "Inclement minutes cannot exceed total trip minutes" |
| Inclement required | `stateConfig.inclement_hours_required > 0 AND weather is inclement AND inclement_minutes = 0` | "Inclement weather minutes are required for [state]" |
| Supervisor required | `stateConfig.supervisor_field_required AND !supervisor_name` | "Supervising driver name is required for [state]" |
| Supervisor license required | `stateConfig.supervisor_license_field_required AND !supervisor_license` | "Supervisor license number is required for [state]" |
| Time order | `start_time AND end_time AND end_time <= start_time` | "End time must be after start time" |
| Notes length | `notes.length > 500` | "Notes must be 500 characters or fewer" |

**Warning rules (allow submission, show toast):**

| Rule | Condition | Message |
|------|-----------|---------|
| OH daily cap | `stateConfig.max_hours_per_day AND daily_total > max * 60` | "Ohio limits countable practice to [X] hours per day" |
| NC weekly cap | `stateConfig.max_hours_per_week AND weekly_total > max * 60` | "North Carolina limits countable practice to [X] hours per week" |

### 10.3 Test Coverage

Unit tests for `validateTrip` covering at minimum:

- IL: baseline validation (existing behavior)
- PA: inclement minutes required when weather is inclement
- MN: supervisor name required
- AR: no hours required, minimal validation
- OH: daily cap warning triggers at > 4 hours
- DC: supervisor license required
- Edge case: all fields at maximum values
- Edge case: all fields at minimum values
- Edge case: inclement_minutes = daytime + nighttime (valid, at boundary)
- Edge case: inclement_minutes = daytime + nighttime + 1 (invalid)

---

## 11. Non-Functional Requirements

### 11.1 Performance

- State config is a static module import (`src/data/state-configs.ts`) — zero DB round trips, zero caching required, available at build time
- Dashboard aggregation query: add composite index on `(user_id, trip_date)` to trips table
- Report generation: handle 500+ trips without pagination timeout (target < 3s for HTML render, < 10s for PDF)

### 11.2 Data Integrity

- `src/data/state-configs.ts` is read-only to application code; changes only via PR → deploy
- `users.state_code` is validated application-side against `STATE_CODES` (no DB FK — see §6.2)
- Changing a user's state does not delete or modify existing trips
- Existing trip data remains valid even if user changes to a state with different location/weather options (report renders whatever text is stored, does not re-validate historical entries)

### 11.3 Testing

- `validateTrip` unit tests: 10+ test cases covering 6+ state configs (see 10.3)
- Report column renderer unit test: verify correct HTML output for IL, PA, MN, DC configs
- E2E test: register as CO user, log trip with supervisor name, view dashboard with CO targets, view report with CO columns, export PDF
- Static data validation script: iterate all `STATE_CONFIGS` entries, verify `report_columns` uses only known `field_key` vocabulary, verify `source_url` is non-empty, verify `validation_mode` is consistent with `total_hours_required` (e.g. `none` mode requires `total_hours_required === 0`)

### 11.4 Accessibility

- State selector: keyboard-navigable, screen-reader compatible, includes state abbreviation in aria-label
- Conditional fields: use `aria-live="polite"` regions so screen readers announce when fields appear/disappear based on state selection
- Report table: semantic `<thead>`, `<th scope="col">`, `<tbody>` structure
- Progress bars: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`

---

## 12. Legal Disclaimer Requirements

The following disclaimer appears in three locations:

**Location 1: Registration state-selection (below state summary card)**
> "Requirements shown are based on publicly available information and may not reflect recent changes. Always verify with your state's licensing agency."

**Location 2: Dashboard state info card (footer)**
> "Verify these requirements with [state_name]'s [DMV/SOS/DPS]. Data effective: [state_configs.effective_date]."

**Location 3: Report page and PDF (footer on every page)**
> "Generated by studentdriver.site. This document is a practice driving log generated for your convenience. It is not an official state document. Verify acceptance with your local licensing office before submitting."

---

## 13. Implementation Sequence

These issues follow the existing 13-issue MVP sequence. They should be worked sequentially. Each issue is scoped for one Claude Code session.

| # | Title | Dependencies | Size |
|---|-------|--------------|------|
| 14 | Create src/data/state-configs.ts with TypeScript types (StateConfig, ReportColumn, ValidationMode) and pre-population vocabulary audit | MVP complete | S |
| 15 | Populate state-configs.ts with all 51 jurisdictions | #14 | XL |
| 16 | Add state_code, state_confirmed, driver_ed_completed, permit_issue_date to users table (Drizzle migration) | MVP complete | S |
| 17 | Add inclement_minutes, supervisor fields, start/end time to trips table (Drizzle migration) | MVP complete | S |
| 18 | Build state confirmation modal for existing users | #16 | M |
| 19 | Update registration flow with state selector and summary card | #15, #16 | M |
| 20 | Build validateTrip engine with state-driven rules | #15, #17 | M |
| 21 | Update trip entry form with conditional fields and state validation | #17, #19, #20 | L |
| 22 | Update dashboard with dynamic progress bars, hold period, completion | #16, #19 | M |
| 23 | Build dynamic HTML report renderer from report_columns | #15, #17 | L |
| 24 | Update PDF export for dynamic columns and attestation page | #23 | M |
| 25 | Build settings page with state change flow | #16 | M |
| 26 | Update trips list with conditional columns, filters, CSV export | #17, #21 | M |
| 27 | Build public state info pages (/states and /states/[code]) | #15 | M |
| 28 | Add validateTrip unit tests for 6+ state configs | #20 | M |
| 29 | Add E2E test: CO user full flow (register, log, dashboard, report, PDF) | #21, #22, #23, #24 | M |
| 30 | Tier 1 state verification: manual QA of 16 state configs against DMV sites | #15 | L (manual) |

**Total: 17 issues. Estimated 3-5 weeks of Claude Code sessions for an experienced developer working part-time.**

---

## 14. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| State law data inaccuracy | High | High | Tiered verification: Tier 1 manual QA before launch; Tier 2/3 with stronger disclaimer; source_url on every config |
| State changes law post-launch | Certain | Medium | Quarterly IIHS review; PR to state-configs.ts with updated `effective_date`; git history as audit trail; `state_config_history` DB table deferred to v2.1 |
| Users assume app output is legally sufficient | High | High | Disclaimers on registration, dashboard, report, and PDF; link to official forms; never claim "official" status |
| Report format rejected by state licensing office | Medium | Medium | Position as "practice log" not "official form"; provide official form download link; note that app data can be transcribed to official form |
| Scope creep into per-state custom features | High | Medium | Config-driven architecture; if a state needs something report_columns cannot express, extend the JSON schema rather than adding code branches |
| Notarization cannot be digitally satisfied | Certain | Low | App generates printable log; user prints and visits notary; app does not attempt digital notarization |
| Seed data entry is error-prone | High | Medium | Seed data validation script (issue #30); automated JSON schema checks; human QA for Tier 1 |
| Conditional UI complexity overwhelms users | Medium | Medium | Progressive disclosure: conditional fields only appear for states that need them; users in simple states see the same minimal form as today |
