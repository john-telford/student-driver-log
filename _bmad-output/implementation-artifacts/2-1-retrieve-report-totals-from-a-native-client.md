# Story 2.1: Retrieve report totals from a native client

Status: review

## Story

As the student driver,
I want to fetch my running totals and progress on my phone,
so that I know how close I am to the Illinois requirements.

Extracts the totals + progress aggregation into `src/services/report.ts` (currently
computed inline in `src/app/(app)/dashboard/page.tsx` against `TOTAL_REQUIRED_MIN` =
3000 and `NIGHT_REQUIRED_MIN` = 600); refactors the dashboard onto it; exposes
`GET /api/v1/report`.

## Acceptance Criteria

1. Valid token → `GET /api/v1/report` returns `200` with my total minutes, nighttime
   minutes, and progress vs the 3000/600-minute Illinois requirements as JSON.
2. The totals reflect only my own trips (NFR2) — never another student's.
3. No/invalid token → `401`.
4. The web dashboard's numbers are unchanged after the extraction, and the full test
   suite passes (NFR3).

## Tasks / Subtasks

- [x] **Task 1: `report` service (AC: 1, 2)**
  - [x] Create `src/services/report.ts`. Export `TOTAL_REQUIRED_MIN = 50 * 60` (3000)
    and `NIGHT_REQUIRED_MIN = 10 * 60` (600) — same values as the current dashboard
    constants, just relocated so there is one source of truth.
  - [x] Add `getReport(studentId: number): Promise<Report>`. Aggregate with the exact
    same query shape as today's dashboard: `db.select({ daytime: sum(trips.daytimeMinutes), nighttime: sum(trips.nighttimeMinutes) }).from(trips).where(eq(trips.studentId, studentId))`,
    then `Number(row?.daytime ?? 0)` / `Number(row?.nighttime ?? 0)` (drizzle's `sum()`
    returns a string; the `Number(... ?? 0)` coercion is required, not optional —
    dropping it silently breaks the percent math).
  - [x] `Report` type/shape (this is also the `GET /api/v1/report` JSON body — field
    names are the API contract, not just internal plumbing):
    ```ts
    export type Report = {
      daytimeMinutes: number;
      nighttimeMinutes: number;
      totalMinutes: number;
      totalRequiredMinutes: number;   // 3000, echoed for client convenience
      nightRequiredMinutes: number;   // 600
      totalPercent: number;           // round((totalMinutes / totalRequiredMinutes) * 100), clamped to 100
      nightPercent: number;           // round((nighttimeMinutes / nightRequiredMinutes) * 100), clamped to 100
    };
    ```
  - [x] Percent math must match the dashboard's existing formula exactly (`Math.min(100, Math.round((value / required) * 100))`) — do not round before clamping or clamp before rounding, the order matters for edge values.
  - [x] The ownership boundary here is simply `where(eq(trips.studentId, studentId))` — there is no separate "existence" check needed (unlike `updateTrip`/`deleteTrip`); a student with zero trips just gets all-zero totals, which is correct behavior, not an error.

- [x] **Task 2: Refactor dashboard onto the service (AC: 4 — regression)**
  - [x] In `src/app/(app)/dashboard/page.tsx`, delete the local `TOTAL_REQUIRED_MIN`/`NIGHT_REQUIRED_MIN` constants and the inline `db.select({ daytime: sum(...), nighttime: sum(...) })` block + the `totalPct`/`nightPct` calculation. Replace with a single `const report = selectedStudentId ? await getReport(selectedStudentId) : null;`.
  - [x] Update the JSX to read from `report` (`report.daytimeMinutes`, `report.nighttimeMinutes`, `report.totalMinutes`, `report.totalPercent`, `report.nightPercent`) instead of the old locals (`totalDaytime`, `totalNighttime`, `grandTotal`, `totalPct`, `nightPct`). Keep `remainingHours()` and `formatMinutes()` exactly as-is — they're presentation helpers, not part of the aggregation being extracted; call `remainingHours(report.totalMinutes, report.totalRequiredMinutes)` and `remainingHours(report.nighttimeMinutes, report.nightRequiredMinutes)`.
  - [x] **Do not touch `src/app/(app)/report/page.tsx`.** Its per-row running-totals table (`runningDay`/`runningNight` accumulated per trip for the printable log) is a different, unrelated calculation from the dashboard's aggregate-vs-requirement progress bars — it does not use `TOTAL_REQUIRED_MIN`/`NIGHT_REQUIRED_MIN` today and has no progress-percent UI. Confirmed via `grep -n "TOTAL_REQUIRED_MIN\|NIGHT_REQUIRED_MIN" src/app/(app)/report/page.tsx` → no matches. Nothing here belongs to this story's extraction; leave the file alone.
  - [x] The `selectedStudentId ? (...) : (...)` render branch was switched to `report ? (...) : (...)` — `report` is derived 1:1 from `selectedStudentId` (`null` iff `selectedStudentId` is falsy), and gating on `report` directly gives TypeScript's narrowing inside the JSX branch instead of a non-null assertion.

- [x] **Task 3: `GET /api/v1/report` handler (AC: 1, 2, 3)**
  - [x] Create `src/app/api/v1/report/route.ts`. Same thin-handler shape as `src/app/api/v1/trips/route.ts`: `requireApiUser(request)` → `resolveApiStudentId(caller)` → `getReport(studentId)` → `withCors(request, Response.json(report))`. `catch (err) { return withCors(request, errorResponse(err)); }`.
  - [x] Add `OPTIONS(request)` → `preflight(request)`, matching every other `/api/v1` route.
  - [x] No request body, no path params — simplest handler in the API so far. No pagination/query params added; not required by any AC.

- [x] **Task 4: Tests (AC: 1–4)**
  - [x] `src/services/report.test.ts` — `getReport`: aggregates a student's trips into the right shape; zero trips (both `null` aggregate fields and an empty result row) → all-zero `Report` with correct `totalRequiredMinutes`/`nightRequiredMinutes` and `0` percents (not `NaN`); percent clamps at `100` when totals exceed the requirement; percent rounds correctly on a non-round fraction (1000/3000 → 33%). Mocked `@/db` the same way `trips.test.ts` mocks the `select().from().where()` chain (awaited directly, no `.orderBy()`).
  - [x] `src/app/api/v1/report/route.test.ts` — mirrors `trips/route.test.ts`'s structure: mocks `@/lib/api-auth`'s `requireApiUser` (keeps `resolveApiStudentId` real), mocks `@/services/report`'s `getReport`. Cases: valid student token → `200` + JSON body equals the mocked report + CORS header present; missing/invalid token → `401`; parent token → `403`; `OPTIONS` → `204` with CORS headers.
  - [x] Full suite green (`npm test -- --run` → 82 tests, 9 files, all passing) + `npm run build` clean (with placeholder `DATABASE_URL`/`AUTH_SECRET`/`API_JWT_SECRET`, matching the CI build step) + `npx eslint .` — the 15 pre-existing errors are all in files untouched by this story (`report/page.tsx`, `about`/`faq`/`privacy`/`terms`/`not-found`/`opengraph-image`); zero new lint errors in any file this story touched. Playwright e2e was not run (unit/integration coverage plus the confirmed-clean build were judged sufficient for this story's scope — no new UI, only a data-source swap behind existing JSX).

## Dev Notes

### Why this is the first Epic 2 story

Epic 1 already built every shared piece this story needs — there is nothing new to
invent: `requireApiUser`/`resolveApiStudentId` (`src/lib/api-auth.ts`), `errorResponse`
(`src/lib/api-error.ts`), `preflight`/`withCors` (`src/lib/cors.ts`), the typed error
taxonomy (`src/services/errors.ts`). This story is a straight application of that
pattern to a new, simpler service (no mutations, no ownership-check-then-write, just a
read aggregate) — resist any urge to add auth/CORS/error-mapping code inline in the
route; wire the existing helpers exactly as `trips/route.ts` does.

### Current dashboard code being replaced (`src/app/(app)/dashboard/page.tsx`)

```ts
const TOTAL_REQUIRED_MIN = 50 * 60;   // 3000 min
const NIGHT_REQUIRED_MIN = 10 * 60;   // 600 min
...
let totalDaytime = 0;
let totalNighttime = 0;
if (selectedStudentId) {
  const [totals] = await db
    .select({ daytime: sum(trips.daytimeMinutes), nighttime: sum(trips.nighttimeMinutes) })
    .from(trips)
    .where(eq(trips.studentId, selectedStudentId));
  totalDaytime = Number(totals?.daytime ?? 0);
  totalNighttime = Number(totals?.nighttime ?? 0);
}
const grandTotal = totalDaytime + totalNighttime;
const totalPct = Math.min(100, Math.round((grandTotal / TOTAL_REQUIRED_MIN) * 100));
const nightPct = Math.min(100, Math.round((totalNighttime / NIGHT_REQUIRED_MIN) * 100));
```
This entire block moves into `getReport()` verbatim (renamed fields per the `Report`
type above). The page keeps its `if (selectedStudentId) { ... } else { <"select a
student"> }` branching structure unchanged — only the data-fetching source changes.

`remainingHours()` and `formatMinutes()` (lines ~19–33 of the same file) are **not**
part of this extraction — they're pure presentation formatters with no business rule
in them, leave them where they are and call them with the new `report.*` fields.

### Response shape for `GET /api/v1/report`

The `Report` object *is* the response body — no wrapper, no pagination envelope,
matching the flat-JSON convention of `GET /api/v1/trips` (an array) and `POST
/api/v1/trips` (the created trip object). AC 1 explicitly lists total minutes,
nighttime minutes, and progress — the `Report` shape above covers all three plus the
requirement constants, which the epics.md source note flags as useful for the client
to render without hardcoding IL's 3000/600 minute rule itself.

### Reuse — do not reinvent

- `requireApiUser`, `resolveApiStudentId` — `src/lib/api-auth.ts` (1.1).
- `errorResponse` — `src/lib/api-error.ts` (1.1). A read-only `GET` with no body/param
  parsing only ever throws `UnauthorizedError` (bad token) or `ForbiddenError` (parent
  caller, via `resolveApiStudentId`) — there is no `ValidationError`/`NotFoundError`
  path in this story, unlike every trips route.
- `preflight`, `withCors` — `src/lib/cors.ts` (1.1).
- Aggregation query shape — copy from the current dashboard code (above), don't
  redesign it. It's already correct and already tested implicitly by existing
  dashboard e2e coverage.

### Project Structure Notes

- New file: `src/services/report.ts` (+ `report.test.ts` alongside it) — matches the
  `src/services/trips.ts` co-located-test convention.
- New file: `src/app/api/v1/report/route.ts` (+ `route.test.ts`) — matches
  `src/app/api/v1/trips/route.ts`'s file layout one directory level up.
- Modified: `src/app/(app)/dashboard/page.tsx` — narrow diff, only the aggregation
  block and its JSX consumers change.
- No new dependencies, no schema changes, no new env vars.

### Testing standards summary

- Vitest unit tests co-located with source (`*.test.ts`), mocking `@/db` at the
  `select().from().where()` chain level — see `src/services/trips.test.ts` for the
  established mock shape (this story's query has no `.orderBy()`, so the mock is
  simpler: `where` resolves the rows directly, like the ownership-check calls in
  `updateTrip`/`deleteTrip`).
- Route tests mock `@/lib/api-auth`'s `requireApiUser` only (via
  `vi.mock('@/lib/api-auth', async (importOriginal) => {...})`, keeping
  `resolveApiStudentId` real) and mock the service module — see
  `src/app/api/v1/trips/route.test.ts` for the exact pattern, including the
  `ALLOWED`/`process.env.API_ALLOWED_ORIGINS` CORS test setup in `beforeAll`.
- No e2e changes required by the ACs, but the dashboard page render path changes —
  if time allows, run `npm run build && npm run test:e2e` to confirm the existing
  dashboard Playwright coverage still passes (NFR3 applies here, same as every prior
  story).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#story-21-retrieve-report-totals-from-a-native-client] — BDD ACs.
- [Source: _bmad-output/planning-artifacts/architecture.md §6] — `GET /api/v1/report` endpoint table entry, thin-handler pattern.
- [Source: _bmad-output/planning-artifacts/architecture.md §10] — migration step 3 ("Add `/api/v1/trips` + `/api/v1/report` handlers over the services").
- [Source: src/app/(app)/dashboard/page.tsx] — current inline totals/progress computation being extracted.
- [Source: src/app/(app)/report/page.tsx] — confirmed unrelated per-row running-totals table; out of scope.
- [Source: src/app/api/v1/trips/route.ts] — thin-handler pattern this story's route copies.
- [Source: src/lib/api-auth.ts, src/lib/api-error.ts, src/lib/cors.ts] — shared `/api/v1` infrastructure from Epic 1, reused verbatim.
- [Source: _bmad-output/implementation-artifacts/1-5-delete-a-trip-from-a-native-client.md] — most recent story; established reuse/testing conventions and the shared-layer review findings already fixed (algorithm pinning, case-insensitive Bearer, `Cache-Control: no-store` on tokens) that this story inherits for free since it adds no new auth code.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMAD dev-story, autonomous run)

### Debug Log References

- None. Clean implementation, following the trips-service/route thin-handler pattern from Epic 1.

### Completion Notes List

- All 4 ACs implemented. `getReport(studentId)` in `src/services/report.ts` centralizes the totals/progress math that previously lived inline in `dashboard/page.tsx`; `GET /api/v1/report` exposes it over the existing `requireApiUser`/`resolveApiStudentId`/`errorResponse`/`withCors` stack from Epic 1 — no new shared infrastructure needed.
- Dashboard refactor is a narrow diff: removed the two local constants and the inline aggregation block, added one `getReport()` call, and switched the render-branch condition from `selectedStudentId ?` to `report ?` (equivalent truthiness, cleaner TS narrowing). `remainingHours()`/`formatMinutes()` presentation helpers untouched.
- Confirmed `src/app/(app)/report/page.tsx` is out of scope — its per-row running-totals table is a distinct, unrelated calculation with no `TOTAL_REQUIRED_MIN`/`NIGHT_REQUIRED_MIN` reference; left untouched per Dev Notes.
- 82 unit tests green (13 new: 5 service + 8 route incl. OPTIONS); `tsc --noEmit`, `npm run build` (with CI-placeholder env vars, cleaned up the throwaway `ci-build.db` after), and `npx eslint .` all clean on every file this story touched — build confirms `/api/v1/report` registers as a route. The 15 pre-existing lint errors elsewhere in the app were not introduced by this story.
- No live end-to-end round-trip against the dev server this time (unlike story 1.5's epic-closing verification) — this story has no new auth/ownership logic to prove beyond what's already covered by mocked unit/integration tests and the existing `resolveApiStudentId` parent-403 policy (itself proven in Epic 1).
- **Awaiting code review** (per user instruction, to be run separately on Opus).

### File List

**Added:**
- `src/services/report.ts` — `getReport(studentId)`, `TOTAL_REQUIRED_MIN`, `NIGHT_REQUIRED_MIN`
- `src/services/report.test.ts`
- `src/app/api/v1/report/route.ts` — `GET`, `OPTIONS`
- `src/app/api/v1/report/route.test.ts`

**Modified:**
- `src/app/(app)/dashboard/page.tsx` — aggregation/progress math extracted to `getReport()`; JSX reads from `report.*`

### Change Log

- 2026-08-09 — Implemented story 2.1: `report` service, `GET /api/v1/report`, dashboard refactor onto the new service. 82 tests green, build + lint clean. Status → review (code review pending on Opus, separate session).
