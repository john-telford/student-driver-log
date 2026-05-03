---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-04-30'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd-v2-multi-state.md'
  - '_bmad-output/project-context.md'
  - 'docs/architecture.md'
  - 'docs/data-models.md'
  - 'docs/api-contracts.md'
  - 'docs/source-tree-analysis.md'
  - 'docs/component-inventory.md'
workflowType: 'architecture'
project_name: 'student-driver-log'
user_name: 'John'
date: '2026-04-30'
---

# Architecture Decision Document: student-driver-log v2.0 (Multi-State Expansion)

> **Document purpose:** This document exists for one reason — to eliminate implementation ambiguity at the story level. An agent reading any v2.0 issue (#14–#30) should find in this document the contracts, boundaries, and data flows it needs without revisiting the PRD or inferring intent from types alone.
>
> **What this document contains:** Data flow patterns, module boundaries, routing contracts, integration seams, and explicit decisions with rationale.
>
> **What this document does not contain:** TypeScript type definitions (belong in `src/lib/types/`), per-state data (belongs in `src/data/state-configs.ts`), validation rule tables (belong in `src/lib/validation.ts`), or UI copy. Keeping those out prevents this document from becoming a second source of truth that drifts from the code.

_Sections are appended as we work through each architectural decision. Read the PRD (`prd-v2-multi-state.md`) for requirements. Read this document for implementation contracts._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (17 implementation issues):**

- State config engine: `src/data/state-configs.ts` static TypeScript module (51 entries × ~28 typed
  fields) is the single source of truth for validation rules, conditional form fields, dashboard
  progress targets, and report column layout. Zero DB round trips; zero runtime caching required.
- Registration flow: state selector, summary card, conditional driver-ed checkbox, permit issue date
- Existing-user migration: one-time state confirmation modal for users where `state_confirmed = false`;
  check in `(app)/layout.tsx`, render client-side via `StateConfirmationGate` component,
  handle via Server Action. Modal is not dismissable — must confirm to proceed.
- Trip entry: conditional fields (inclement minutes, supervisor name/license, start/end time)
  driven by `StateConfig` flags
- `validateTrip()`: pure function returning `{ errors: ValidationResult[], warnings: ValidationResult[] }`,
  called on client (UX feedback) and server (authoritative gate). Validates a single trip in
  isolation — cumulative hour cap warnings are handled at the Server Action layer with a DB
  query, not inside `validateTrip()`
- Dashboard: dynamic progress bars from state config targets; hold-period tracker; display mode
  determined by `validation_mode` (see Cross-Cutting Concerns #3)
- Dynamic HTML report: `ReportTableHTML` component driven by `ReportColumn[]` from state config
- Dynamic PDF: `ReportTablePDF` component — same column schema as HTML, shares `formatCell()`
  formatter, but `@react-pdf/renderer` types must not leak into browser components. Portrait ≤9
  columns, landscape >9.
- Settings page: state change flow with confirmation dialog (does not delete existing trips)
- Public state info pages: `/states` and `/states/[code]` (unauthenticated, SEO-facing)
- Trips list: conditional columns, date range filter, CSV export matching state column headers

**Non-Functional Requirements:**

- Performance: state config is a static import — zero latency; composite index on
  `(user_id, trip_date)`; 500+ trips <3s HTML / <10s PDF
- Data integrity: `src/data/state-configs.ts` read-only to application code; `users.state_code`
  validated app-side against `STATE_CODES`; changing state never deletes trips; historical trip
  data valid regardless of state change
- Testing: `validateTrip` ≥10 unit tests across ≥6 state configs (assert on `.code`, not
  `.message`); report renderer unit tests for IL/PA/MN/DC; E2E for CO full flow; static data
  validation script
- Accessibility: keyboard-navigable state selector; `aria-live` for conditional field appearance;
  semantic report table; `role="progressbar"` with ARIA attributes
- Legal: disclaimer text in 3 locations (registration, dashboard, report/PDF)

**Scale & Complexity:**

- Primary domain: full-stack web (Next.js App Router, Server Components + Server Actions)
- Complexity level: medium-high (brownfield expansion; config-driven architecture)
- Implementation issues: 17 (sequential with dependency chain)

### Technical Constraints & Dependencies

- Next.js 15/16: `params` and `searchParams` must be awaited; Server Components by default;
  Server Actions for mutations
- libSQL/Turso: SQLite; no native JSON column type; `users` and `trips` new columns are
  the only schema changes in v2.0 (no state config tables)
- Drizzle ORM: schema is source of truth; `db:generate` → `db:migrate`
- No state management libraries; no barrel files; `middleware.ts` must keep `runtime = 'nodejs'`
- Brownfield: v2.0 DB migration is additive only; one-way once deployed to Turso
- Timezone: trip times stored as UTC ISO8601 strings; `StateConfig` includes an IANA `timezone`
  field; day/night classification in `validateTrip()` derives local time using `timezone`.
  Omitting this causes silent DST bugs (IL breaks in summer without it).

### Resolved Architectural Decisions

| Decision | Resolution | Rationale |
|---|---|---|
| State config delivery | Static TypeScript module (`src/data/state-configs.ts`) | Config changes ≤quarterly; deploy-per-update acceptable; compile-time type safety; git = audit trail; eliminates N+1, cold-start, caching complexity |
| `report_columns` layout hints | Algorithmic defaults per `data_type`; optional per-column `html_width_pct` / `pdf_width_pt` override | Single `width_pct` truncates PDF for long text values; algorithmic defaults reduce seed data effort; per-column override handles outliers |
| `validateTrip()` absent categories | `validation_mode` enum on `StateConfig` gates validation categories | AR/MS/NJ are not "hours=0" — they have no hours concept; zero-value threshold silently applies inappropriate enum checks |
| `report_columns` unknown types | `field_key: 'custom'` + `custom_field_name` escape hatch | Keeps Goal 3 intact for plain-text columns; new field types requiring special formatting remain code changes |

### Known Deferred Decisions (v2.1)

- **Config-at-time-of-PDF provenance:** With static JSON, the config used to generate a PDF is
  the git SHA of the deployed build, not a queryable DB record. Accepted for v2.0. A
  `state_config_history` DB table and `effective_date` embedding in PDF metadata are v2.1
  considerations if compliance requirements justify them.

### Open Questions (must resolve before affected story)

- **`state_confirmed = false` degraded behavior:** If the confirmation modal is bypassed (deep
  link, browser back): does the app function with IL defaults, block all navigation, or
  something else? Must be resolved before Issue #18.

### `validation_mode` Definitions

| Mode | States | Behavior |
|---|---|---|
| `full` | Most states (48) | All rules apply: hour targets, location/weather enums, supervisor fields, inclement minutes |
| `hours_only` | States with hours but no form requirements | Hour tracking and basic validation; no `report_columns` rendering or supervisor fields |
| `log_only` | States with structured log but no hour target | Conditional field validation; report renders; no progress bars |
| `none` | AR, MS, NJ | No hour requirements, no form requirements; cumulative stats display only; minimal validation (date not future, at least one minute > 0) |

### Cross-Cutting Concerns for Implementation

1. **`StateConfig` access pattern** — import `STATE_CONFIGS` from `src/data/state-configs.ts`
   directly in Server Components and Server Actions. Pass the resolved `StateConfig` object
   as a parameter to `validateTrip()` and as a serialized prop to Client Components. No
   DB fetch, no `React.cache()` wrapper needed.

2. **`validateTrip()` dual-call contract** — pure function (zero server imports: no
   `next/headers`, no Drizzle, no `auth()`). Server Action call is always authoritative.
   Client call is UX feedback only. `ValidationResult.code` is the stable test assertion
   surface — not `.message`.

3. **`validation_mode` gates entire validation categories** — do not branch on
   `total_hours_required === 0`; branch on `stateConfig.validation_mode`. AR users must
   not receive "Invalid location type" errors.

4. **`report_columns` exhaustive formatter** — `formatCell()` uses a discriminated union
   switch with a `never` default case. Adding a new `data_type` without updating the
   switch must be a compile error. The `custom` escape hatch renders
   `String(trip[col.custom_field_name] ?? '')`.

5. **HTML/PDF renderer boundary** — `ReportTableHTML` and `ReportTablePDF` are separate
   components. `@react-pdf/renderer` imports must not appear in any file that renders in
   the browser. Enforce via file naming: `report-table.pdf.tsx` vs `report-table.html.tsx`.

6. **Additive migration discipline** — every new column is nullable or has a DEFAULT.
   Migration runs before TypeScript type update before code change. The v2.0 migration
   targets `users` and `trips` only — no new tables.

7. **Timezone in `validateTrip()`** — use `StateConfig.timezone` (IANA string) to convert
   UTC trip times to local time before applying night-hour classification. Do not hardcode
   hour boundaries.

### Priority Artifacts for Remaining Architecture Steps

The following four contracts must be produced in the architecture document before
implementation begins. Each eliminates a class of agent implementation errors:

1. **`StateConfig` data flow** — how the static module flows from import to Server Component
   to Server Action to Client Component prop
2. **Module boundary map** — what files import what; what must never import what
   (`@react-pdf/renderer` boundary; `validateTrip()` zero-server-import rule)
3. **`state_confirmed` routing contract** — exact location in component tree, render
   behavior during check, deep-link behavior
4. **Report renderer contract** — two components, one formatter, shared column array,
   no cross-contamination

---

## Starter Template Evaluation

**Brownfield project — no starter template required.** The v2.0 expansion builds on
the existing codebase at `main`. Stack is locked by project conventions (see CLAUDE.md).

### Foundation

All existing layers carried forward unchanged. See `docs/architecture.md` for the
current baseline architecture.

### v2.0 Additions

**New static module (zero new dependencies):**
- `src/data/state-configs.ts` — `StateConfig` typed module, imported directly

**New types (zero new dependencies):**
- `src/lib/types/state-config.ts` — `StateConfig`, `ReportColumn`, `ValidationMode`,
  `ReportColumnDataType`
- `src/lib/types/validation.ts` — `TripInput`, `ValidationResult`, `ValidationOutput`

**Timezone handling:**
- v2.0 uses native `Intl.DateTimeFormat` for UTC→local conversion in `validateTrip()`
- No new dependency required; sunset/sunrise calculation deferred to v2.1
- If a timezone utility is needed later, `date-fns-tz` is the preferred addition

**New shadcn/ui components (added via `npx shadcn@latest add`):**
- `select` — state selector dropdown
- `progress` — progress bars on dashboard
- `alert-dialog` — state change confirmation dialog
- `badge` — completion status indicators

---

## Core Architectural Decisions

All decisions below are v2.0-specific. Existing stack decisions (auth, database, Server Actions pattern, UI library, CI/CD, hosting) are carried forward unchanged.

### Decision 1 — Trip time storage format

- **Decision:** UTC ISO8601 strings (`"2026-04-30T22:00:00.000Z"`) for `start_time` and `end_time` columns on `trips`
- **Rationale:** Single unambiguous value; `validateTrip()` derives local time from `StateConfig.timezone` at validation time; consistent with existing date handling in the codebase
- **Affects:** Issue #17 (trips schema), Issue #20 (validateTrip), Issue #21 (trip entry form)

### Decision 2 — `StateConfig` access pattern for Client Components

- **Decision:** Parent Server Component resolves `StateConfig` via `STATE_CONFIGS[user.state_code]` and passes it as a typed prop to Client Components. `src/data/state-configs.ts` is never imported by Client Components.
- **Rationale:** Zero client bundle impact; typesafe; no round-trip; keeps the static module server-side
- **Enforcement:** `src/data/state-configs.ts` should include `import 'server-only'` at the top to produce a build error if accidentally imported in a Client Component
- **Affects:** All issues that render Client Components consuming state config (#19, #21, #22, #23)

### Decision 3 — `state_confirmed` routing contract

- **Decision:** `(app)/layout.tsx` fetches `user.state_confirmed` alongside existing student-resolution logic. Passes boolean to `<StateConfirmationGate state_confirmed={...}>` — a Client Component that renders the confirmation modal when `false`, or `{children}` when `true`.
- **Degraded behavior:** Modal is non-dismissable. No IL default fallback — protected routes do not render until the user confirms their state. Deep links re-evaluate on next server render; the gate re-checks on every layout load.
- **Rationale:** Single check point; blocks all protected routes; consistent with existing `AppLayout` auth guard pattern; avoids middleware complexity
- **Affects:** Issue #18 (state confirmation modal), Issue #16 (users schema must add `state_confirmed`)

### Decision 4 — Report renderer module boundary

- **Decision:**
  - Shared formatter: `src/lib/report/format-cell.ts` — pure function, no renderer imports
  - HTML renderer: `src/app/(app)/report/report-table.html.tsx` — imports from `format-cell.ts`, no `@react-pdf/renderer`
  - PDF renderer: `src/app/api/report/pdf/report-table.pdf.tsx` — imports from `format-cell.ts` and `@react-pdf/renderer`
- **Enforcement:** `.pdf.tsx` suffix documents the import boundary. `@react-pdf/renderer` must not appear in any `.tsx` file outside `src/app/api/report/pdf/`
- **Rationale:** `@react-pdf/renderer` uses a custom React reconciler incompatible with browser rendering; contamination causes runtime crashes
- **Affects:** Issue #23 (HTML report renderer), Issue #24 (PDF export)

### Decision 5 — New route placement

- **Decision:** Add a `(public)` route group with a minimal layout (no auth guard, no student selector):
  - `src/app/(public)/layout.tsx` — minimal shell, no `auth()` call
  - `src/app/(public)/states/page.tsx` — state list
  - `src/app/(public)/states/[code]/page.tsx` — state detail
  - `src/app/(app)/settings/page.tsx` — authenticated settings page (within existing `(app)` group)
- **Rationale:** `/states` pages are SEO-facing and unauthenticated; they must not be wrapped by AppLayout's auth guard; a separate route group is the correct App Router pattern
- **Affects:** Issue #25 (settings), Issue #27 (public state pages)

### Decision 6 — Cumulative cap warning separation

- **Decision:** OH daily cap and NC weekly cap warnings are computed in `addTripAction` / `updateTripAction` Server Actions as a post-validation step. The action queries the DB for existing trips in the relevant window, computes cumulative totals, appends any warnings to the `validateTrip()` result, and returns the combined `{ errors, warnings }` to the client.
- **Rationale:** `validateTrip()` is a pure function with no DB access; cumulative logic requires a DB query; separating the two keeps the pure function testable without DB fixtures
- **Affects:** Issue #20 (validateTrip engine), Issue #21 (trip entry form)

---

## Implementation Patterns & Consistency Rules

8 conflict areas identified where agents implementing different issues could make incompatible choices.

### Pattern 1 — `StateConfig` resolution in Server Components

All Server Components and Server Actions use direct map access. No DB fetch, no helper function, no context.

```typescript
// ✅ correct
import { STATE_CONFIGS } from '@/data/state-configs';
const stateConfig = STATE_CONFIGS[user.state_code];
if (!stateConfig) throw new Error(`Unknown state: ${user.state_code}`);

// ❌ anti-pattern — no DB fetch
const stateConfig = await getStateConfigFromDB(user.state_code);
// ❌ anti-pattern — no client import (build error: server-only)
import { STATE_CONFIGS } from '@/data/state-configs';
```

`src/data/state-configs.ts` must have `import 'server-only'` as its first line.

### Pattern 2 — `StateConfig` prop threading to Client Components

Parent Server Component resolves `stateConfig` and passes it as a typed prop. No Client Component fetches or computes state config independently. No React Context.

```typescript
// ✅ correct — page.tsx (Server Component)
const stateConfig = STATE_CONFIGS[user.state_code];
return <TripForm stateConfig={stateConfig} />;

// ✅ correct — Client Component
type TripFormProps = { stateConfig: StateConfig };
export function TripForm({ stateConfig }: TripFormProps) { ... }
```

### Pattern 3 — `validateTrip()` call sites

- **Client:** call on form submit only (not on every keystroke). Display `errors` inline, `warnings` as toasts.
- **Server Action:** always call before any DB write. Server call is the gate — never skip it.
- `src/lib/validation.ts` must contain zero server imports (`next/headers`, Drizzle, `auth()`). File header comment: `// Pure function — NO server imports. Runs on client and server.`

```typescript
// ✅ correct — Server Action pattern
const { errors, warnings } = validateTrip(tripInput, stateConfig);
// cumulative cap DB query appends to warnings here (OH/NC only)
if (errors.length > 0) return { errors, warnings };
// proceed to DB insert
```

### Pattern 4 — `ValidationResult.code` naming

All codes are `SCREAMING_SNAKE_CASE` describing the violated rule: `'LOCATION_REQUIRED'`, `'INCLEMENT_EXCEEDS_TOTAL'`, `'SUPERVISOR_REQUIRED'`, `'DATE_IN_FUTURE'`.

Tests assert on `.code`, never `.message` (message strings change for copy reasons).

```typescript
// ✅ correct
expect(result.errors[0].code).toBe('LOCATION_REQUIRED');
// ❌ anti-pattern
expect(result.errors[0].message).toBe('Location type is required');
```

### Pattern 5 — `validation_mode` branching

Branch on `stateConfig.validation_mode` exclusively. Never use numeric field values as proxies.

```typescript
// ✅ correct
if (stateConfig.validation_mode === 'none') return validateMinimal(trip);

// ❌ anti-pattern — wrong for AR (total_hours_required === 0 is insufficient)
if (stateConfig.total_hours_required === 0) { ... }
```

### Pattern 6 — Report formatter dispatch

`formatCell()` lives exclusively in `src/lib/report/format-cell.ts`. Both HTML and PDF renderers import it. Neither duplicates formatting logic. The switch must have a `never` default:

```typescript
default: {
  const _: never = col.data_type; // compile error when new data_type added without handler
  return '';
}
```

### Pattern 7 — `StateConfirmationGate` placement

- Component: `src/app/(app)/state-confirmation-gate.tsx` (`'use client'`)
- `(app)/layout.tsx` wraps `{children}`: `<StateConfirmationGate stateConfirmed={user.state_confirmed}>`
- Modal: shadcn `<Dialog>` with `open={!stateConfirmed}`, no close button — non-dismissable
- On confirm: Server Action sets `state_confirmed = true`, then `router.refresh()`

### Pattern 8 — Canonical file locations for v2.0

| File | Location |
|---|---|
| State config data | `src/data/state-configs.ts` (`import 'server-only'` at top) |
| StateConfig + ReportColumn types | `src/lib/types/state-config.ts` |
| Validation types | `src/lib/types/validation.ts` |
| `validateTrip()` | `src/lib/validation.ts` |
| Validation fixtures | `src/lib/validation.fixtures.ts` |
| Report formatter | `src/lib/report/format-cell.ts` |
| HTML report table | `src/app/(app)/report/report-table.html.tsx` |
| PDF report table | `src/app/api/report/pdf/report-table.pdf.tsx` (only file importing `@react-pdf/renderer`) |
| Confirmation gate | `src/app/(app)/state-confirmation-gate.tsx` |
| Public state pages | `src/app/(public)/states/` (new `(public)` route group) |
| Settings page | `src/app/(app)/settings/page.tsx` |

---

## Project Structure & Boundaries

### v2.0 Directory Tree

Items marked `← NEW` are added for v2.0. Items marked `← MOD` have v2.0 changes.

```
student-driver-log/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/
│   │   │       ├── page.tsx                        ← MOD: state selector, driver-ed, permit date
│   │   │       └── actions.ts                      ← MOD: persist state_code, state_confirmed=true
│   │   │
│   │   ├── (app)/
│   │   │   ├── layout.tsx                          ← MOD (#18): fetch state_confirmed, wrap StateConfirmationGate
│   │   │   ├── actions.ts
│   │   │   ├── state-confirmation-gate.tsx         ← NEW (#18): 'use client', Dialog gate
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                        ← MOD (#22): dynamic progress bars, hold period, completion
│   │   │   │   └── actions.ts
│   │   │   │
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx                        ← MOD (#26): conditional columns, date filter, CSV export
│   │   │   │   ├── trips-table.tsx                 ← MOD (#26): conditional column rendering
│   │   │   │   ├── actions.ts                      ← MOD (#21): validateTrip + cumulative cap check
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx                    ← MOD (#21): pass stateConfig prop to TripForm
│   │   │   │   │   └── trip-form.tsx               ← MOD (#21): conditional fields from stateConfig
│   │   │   │   └── [id]/edit/
│   │   │   │       ├── page.tsx                    ← MOD (#21): pass stateConfig prop
│   │   │   │       └── edit-trip-form.tsx          ← MOD (#21): conditional fields
│   │   │   │
│   │   │   ├── report/
│   │   │   │   ├── page.tsx                        ← MOD (#23): pass stateConfig + report_columns
│   │   │   │   ├── print-button.tsx
│   │   │   │   └── report-table.html.tsx           ← NEW (#23): dynamic HTML renderer
│   │   │   │
│   │   │   ├── settings/                           ← NEW (#25)
│   │   │   │   ├── page.tsx
│   │   │   │   ├── settings-form.tsx               ← 'use client'
│   │   │   │   └── actions.ts
│   │   │   │
│   │   │   └── students/new/
│   │   │       ├── page.tsx
│   │   │       ├── add-student-form.tsx
│   │   │       └── actions.ts
│   │   │
│   │   ├── (public)/                               ← NEW route group (#27); no layout.tsx needed
│   │   │   └── states/
│   │   │       ├── page.tsx                        ← NEW (#27): state list
│   │   │       └── [code]/
│   │   │           └── page.tsx                    ← NEW (#27): state detail
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── report/pdf/
│   │   │       ├── route.ts                        ← MOD (#24): dynamic columns, landscape threshold
│   │   │       └── report-table.pdf.tsx            ← NEW (#24): @react-pdf/renderer dynamic renderer
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── data/
│   │   └── state-configs.ts                        ← NEW (#14+#15): import 'server-only'; read-only, no async, no DB
│   │
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── utils.test.ts
│   │   ├── validation.ts                           ← NEW (#20): validateTrip() pure function
│   │   ├── validation.test.ts                      ← NEW (#28): ≥10 test cases, 6+ state configs
│   │   ├── validation.fixtures.ts                  ← NEW (#14): canonical TripInput + StateConfig stubs
│   │   ├── report/
│   │   │   ├── format-cell.ts                      ← NEW (#23): shared formatter, never default, returns string
│   │   │   └── format-cell.test.ts                 ← NEW (#23): per data_type + explicit never-branch throw test
│   │   └── types/
│   │       ├── state-config.ts                     ← NEW (#14): StateConfig, ReportColumn, ValidationMode
│   │       └── validation.ts                       ← NEW (#14): TripInput, ValidationResult, ValidationOutput
│   │
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts                               ← MOD (#16 then #17, sequential): users then trips columns
│   │
│   ├── components/ui/                              ← MOD: add select, progress, alert-dialog, badge
│   ├── auth.ts
│   └── middleware.ts                               ← MOD (#27): add (public) paths to matcher exclusions
│
├── drizzle/
│   └── migrations/                                 ← NEW (#16+#17): additive migration, users + trips only
│
├── tests/
│   └── e2e/
│       ├── auth.spec.ts
│       └── multi-state-co.spec.ts                  ← NEW (#29): CO full flow; requires CO config in same PR
│
└── .github/workflows/ci.yml                        ← MOD (#16): add db:migrate step before npm test
```

### Issue-to-File Mapping

| Issue | Primary files | Notes |
|---|---|---|
| #14 | `src/data/state-configs.ts` (stub + `server-only`), `src/lib/types/state-config.ts`, `src/lib/types/validation.ts`, `src/lib/validation.fixtures.ts` | Foundation issue; all other issues depend on these types |
| #15 | `src/data/state-configs.ts` (populate 51 entries) | Vocabulary audit must precede data entry |
| #16 | `src/db/schema.ts` (users columns), `drizzle/migrations/`, `.github/workflows/ci.yml` | Must run before #17; CI update adds `db:migrate` before `npm test` |
| #17 | `src/db/schema.ts` (trips columns), `drizzle/migrations/` | Must run after #16 merges |
| #18 | `src/app/(app)/state-confirmation-gate.tsx`, `src/app/(app)/layout.tsx` | Owns `layout.tsx`; subsequent issues are additive-only |
| #19 | `src/app/(auth)/register/page.tsx`, `src/app/(auth)/register/actions.ts` | |
| #20 | `src/lib/validation.ts` | Import `validation.fixtures.ts` for test stubs |
| #21 | `src/app/(app)/trips/new/trip-form.tsx`, `edit-trip-form.tsx`, `trips/actions.ts` | |
| #22 | `src/app/(app)/dashboard/page.tsx` | |
| #23 | `src/lib/report/format-cell.ts`, `format-cell.test.ts`, `src/app/(app)/report/report-table.html.tsx`, `report/page.tsx` | `formatCell()` returns `string`, always |
| #24 | `src/app/api/report/pdf/report-table.pdf.tsx`, `pdf/route.ts` | Only file importing `@react-pdf/renderer` |
| #25 | `src/app/(app)/settings/` (all files) | |
| #26 | `src/app/(app)/trips/page.tsx`, `trips-table.tsx` | |
| #27 | `src/app/(public)/states/page.tsx`, `src/app/(public)/states/[code]/page.tsx`, `src/middleware.ts` | No layout file needed — root layout applies. Middleware matcher must exclude `(public)` paths. |
| #28 | `src/lib/validation.test.ts`, `src/lib/report/format-cell.test.ts` | |
| #29 | `tests/e2e/multi-state-co.spec.ts` | Must ship in same PR as CO config entry in `state-configs.ts` |
| #30 | Manual QA of `src/data/state-configs.ts` Tier 1 entries | |

### Structural Constraints

**`(public)` route group layout:** No `(public)/layout.tsx` is created in v2.0. The route group provides auth isolation from `(app)` without a layout file — the root `app/layout.tsx` applies to public pages directly. If a public navigation bar is later needed, add `(public)/layout.tsx` as a static Server Component with no `auth()`, no DB queries, no student selector.

**`src/data/` write constraint:** This directory contains read-only static data — no async functions, no DB imports, no dynamic computation. Any change is a PR, not a runtime operation.

**`src/app/(app)/layout.tsx` ownership:** Issue #18 owns the file. All subsequent issues that add navigation elements (settings link, state indicator) append to the layout without touching the `StateConfirmationGate` wiring.

**`StateConfirmationGate` implementation contract:** The gate must be implemented as: Server Component (`layout.tsx`) fetches `user.state_confirmed` → passes boolean prop to `<StateConfirmationGate stateConfirmed={bool}>` (Client Component) → renders `<Dialog open={!stateConfirmed}>` or `{children}`. Do NOT use `useEffect` redirect (causes flash on cold load) or render the modal from a Server Component (loses interactivity).

**`src/db/schema.ts` sequencing:** Issues #16 and #17 both modify this file and must be sequential. #16 merges first (users columns + migration + CI update), then #17 (trips columns + migration).

**`formatCell()` return type:** Returns `string`, always. If the HTML renderer needs markup, it wraps the string after calling `formatCell()`. This function must never return JSX — doing so couples it to React and breaks the PDF renderer.

**Server Action state types:** Follow the existing project pattern — each Server Action co-locates its `useActionState` type in the same `actions.ts` file (e.g. `export type AddTripState = { errors: ValidationResult[]; warnings: ValidationResult[] }`). Trip mutation actions (#21) include both `errors` and `warnings`. Non-mutation actions that succeed by redirecting need no state type. No shared `ActionResult` type — no new type file needed for this pattern. No Server Action throws to the client. No Server Action returns a flat `{ error: string }` shape.

### Data Flows

**State config → Client Component:**
```
STATE_CONFIGS[user.state_code]          (Server Component)
  → stateConfig prop                    (passed to Client Component)
  → validateTrip(tripInput, stateConfig) (called on submit)
  → dropdown options rendered from stateConfig.location_type_options
```

**Trip mutation:**
```
TripForm submit → addTripAction(formData)
  → auth() + resolve student
  → STATE_CONFIGS[user.state_code]
  → validateTrip(tripInput, stateConfig) → { errors, warnings }
  → [OH/NC] DB query cumulative → append warnings
  → if errors: return { errors, warnings }
  → db.insert(trips) → revalidatePath → redirect('/trips')
```

**Report rendering:**
```
/report page.tsx (Server Component)
  → STATE_CONFIGS[user.state_code] → stateConfig.report_columns
  → db.select(trips) sorted ASC
  → <ReportTableHTML columns={stateConfig.report_columns} trips={trips} />
      → formatCell(trip[col.field_key], col, { cumulative }) → string

/api/report/pdf route.ts
  → same fetch
  → <ReportTablePDF columns={stateConfig.report_columns} trips={trips} />
      → formatCell() → string → @react-pdf/renderer <Text>
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision compatibility:** All technology choices are compatible. Static module + `server-only` + Next.js 16 enforces the boundary at build time. `validateTrip()` pure function + Vitest requires zero mocking. `formatCell()` returning `string` works identically for HTML and `@react-pdf/renderer`. UTC ISO8601 + `Intl.DateTimeFormat` uses no new dependencies. `validation_mode` enum values stored as TEXT strings in SQLite — no mapping needed.

**Pattern consistency:** All 8 patterns are coherent with the 6 architectural decisions. No contradictions found. `validation_mode` branching (Pattern 5) directly implements Decision 3. `formatCell()` `never` default (Pattern 6) directly implements Decision 4.

**Structure alignment:** `src/data/`, `src/lib/types/`, `src/lib/report/` follow the project's existing colocate-with-concern convention. `(public)` route group follows the same group pattern as `(auth)` and `(app)`. Issue-to-file mapping covers all 17 issues without gaps.

### Requirements Coverage Validation ✅

All 11 functional requirement categories from the PRD are architecturally supported and mapped to specific issues and files. All NFRs are addressed: performance (static import, zero latency), data integrity (`server-only` boundary + `STATE_CODES` validation), testing (unit + E2E coverage specified), accessibility (implementation detail per PRD), legal disclaimers (implementation detail per PRD).

### Implementation Readiness Validation ✅

**Decision completeness:** 4 locked decisions from context analysis, 6 v2.0-specific decisions from step 4, all with rationale. The one open question (`state_confirmed` degraded behavior) resolved: non-dismissable, no fallback.

**Structure completeness:** Complete directory tree with issue annotations, issue-to-file mapping for all 17 issues, structural constraints (sequencing, ownership, boundaries), 3 data flow diagrams.

**Pattern completeness:** 8 patterns covering all identified conflict points. Server Action state type convention clarified. `formatCell()` return type constraint documented. `StateConfirmationGate` implementation contract specified. Fixture files assigned to Issue #14.

### Gap Analysis Results

**Critical gaps: none.**

**Important gaps identified and resolved during validation:**

| Gap | Resolution |
|---|---|
| `ActionResult` type undefined | Dissolved — existing per-action `XxxState` convention handles this; `AddTripState` adds `warnings` field for v2.0 |
| `(public)/layout.tsx` content unspecified | Resolved — no layout file needed; route group provides isolation; root layout applies |

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Brownfield constraints and project context analyzed
- [x] Scale and complexity assessed (medium-high, 17 issues)
- [x] Technical constraints identified (Next.js 16, Turso, server-only boundary)
- [x] 7 cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] 4 locked decisions from context analysis (static JSON, layout hints, validation_mode, custom escape hatch)
- [x] 6 v2.0-specific decisions (trip time format, StateConfig access, state_confirmed routing, renderer boundary, route placement, cumulative cap separation)
- [x] Known deferred decisions documented (PDF provenance, sunset calc, admin UI)

**✅ Implementation Patterns**
- [x] 8 conflict-prevention patterns with correct/anti-pattern examples
- [x] Server Action state type convention (per-action, co-located)
- [x] `formatCell()` return type constraint (`string` always)
- [x] `StateConfirmationGate` implementation contract
- [x] File ownership and sequencing constraints

**✅ Project Structure**
- [x] Complete directory tree with all v2.0 files and issue annotations
- [x] Issue-to-file mapping for all 17 issues
- [x] Structural constraints (layout ownership, schema sequencing, CI update ownership)
- [x] 3 data flow diagrams (state config access, trip mutation, report rendering)

### Architecture Readiness Assessment

**Overall status: READY FOR IMPLEMENTATION**

**Confidence level: High**

**Key strengths:**
- Static JSON decision eliminates an entire class of runtime caching bugs
- `validation_mode` enum cleanly handles AR/MS/NJ behavioral edge case without zero-value tricks
- `custom` field_key escape hatch keeps Goal 3 intact without pre-launch vocabulary exhaustion
- Fixture files assigned to Issue #14 prevent test stub divergence across 17 concurrent agents
- Structural constraints on `layout.tsx` ownership and `schema.ts` sequencing prevent the highest-probability merge conflicts

**Deferred to v2.1:**
- `state_config_history` DB table for PDF provenance tracking
- Sunset/sunrise calculation in `validateTrip()` (fixed-time boundaries sufficient for v2.0)
- Admin UI for state config management

### Implementation Handoff

**First issue to start:** Issue #14 — creates the type foundation everything else depends on: `src/lib/types/state-config.ts`, `src/lib/types/validation.ts`, `src/data/state-configs.ts` stub with `import 'server-only'`, and `src/lib/validation.fixtures.ts`.

**Critical path:** #14 → #15 → (#16, #17 sequential) → #18 → #19 → #20 → #21 → #22 → #23 → #24 → #25 → #26 → #27 → #28 → #29 → #30

**AI agent guidelines:**
- Read this document before implementing any v2.0 issue
- The PRD (`prd-v2-multi-state.md`) contains requirements; this document contains implementation contracts
- When in doubt about a pattern: check Implementation Patterns section first
- When in doubt about file location: check Pattern 8 and the Issue-to-File Mapping table
- Never import `src/data/state-configs.ts` from a Client Component — it will produce a build error by design
