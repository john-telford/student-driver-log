# Story 2.2: Download the official PDF log from a native client

Status: review

## Story

As the student driver,
I want to download my official Illinois driving-log PDF from my phone,
so that I can submit or share it.

Extracts the PDF-buffer-building logic out of the existing web route
(`src/app/api/report/pdf/route.tsx`) into a shared helper, and adds a new
`GET /api/v1/report/pdf` that authenticates via Bearer token instead of the
session cookie + selected-student cookie. **The existing web route keeps its
current session-cookie behavior unchanged** — this is an extraction, not a
replacement, so both the web and native surfaces keep working (AC3).

## Acceptance Criteria

1. Valid token → `GET /api/v1/report/pdf` returns `200` with the Illinois SOS
   DSD X 152.4 PDF for my own log, `Content-Type: application/pdf`.
2. No/invalid token → `401`.
3. The existing web PDF download (`GET /api/report/pdf`, session-cookie auth)
   still works exactly as before, and the full test suite passes (NFR3).

## Tasks / Subtasks

- [x] **Task 1: Extract shared PDF-buffer builder (AC: 3 — regression-safe refactor)**
  - [x] Create `src/app/api/report/pdf/build.tsx` (`.tsx` because it calls
    `renderToBuffer(<ReportDocument .../>)`, which needs JSX — matching why the
    *existing* route file is itself `.tsx`, not `.ts`). Export:
    ```ts
    export async function buildReportPdf(
      studentId: number,
      studentName: string | null,
      parentName: string | null
    ): Promise<{ buffer: Buffer; filename: string }>
    ```
  - [x] Move the trip query + running-totals computation + `renderToBuffer` call +
    filename derivation from the current `route.tsx` **verbatim** into this
    function — same query (`db.select().from(trips).where(eq(trips.studentId, studentId)).orderBy(trips.tripDate, trips.id)` — **ascending**, unlike the dashboard/report page's `desc()` ordering; this is a chronological printed log, do not change the sort direction), same running-total reduction, same `ReportDocument` props, same filename pattern (`driving-log-${studentName?.toLowerCase().replace(/\s+/g, '-') ?? 'report'}.pdf`).
  - [x] Refactor `src/app/api/report/pdf/route.tsx`: keep all of its existing
    session-cookie auth, `resolveSelectedStudentId`, parent/student
    `studentId`/`studentName`/`parentName` resolution **exactly as-is** — that
    logic is web-specific (cookie-based student selection) and out of scope.
    Only replace the trip-query-through-`renderToBuffer` block with a single
    call: `const { buffer, filename } = await buildReportPdf(studentId, studentName, parentName);`, then build the `NextResponse` from that as today.
  - [x] This task must produce a **zero-behavior-change** diff on the web route — same 401/400 responses, same headers, same PDF bytes for the same input. It's a pure extraction.

- [x] **Task 2: `GET /api/v1/report/pdf` handler (AC: 1, 2)**
  - [x] Create `src/app/api/v1/report/pdf/route.ts` (plain `.ts` — this file has
    no JSX of its own, it only calls the already-JSX-resolved `buildReportPdf`).
    Same thin-handler shape as every other `/api/v1` route: `requireApiUser(request)` → `resolveApiStudentId(caller)` → look up the caller's own name (`db.select({ name: users.name }).from(users).where(eq(users.id, studentId))`) → `buildReportPdf(studentId, studentName, null)`.
  - [x] **`parentName` is always `null` here** — v1 callers are always students
    (parent API access throws `ForbiddenError` inside `resolveApiStudentId`,
    unchanged from Epic 1), and this matches the *existing* web route's own
    student-branch, which never fetches a parent name either. Do not add a
    parent-name lookup; there is no parent context available for a student
    caller and none is needed (parity with the existing student-session PDF).
  - [x] Build the response with the Web-standard `Response` (not `NextResponse` — every other `/api/v1` handler uses plain `Response`/`Request`, keep this one consistent rather than pulling in a Next-specific import for the first time in `/api/v1`):
    ```ts
    return withCors(request, new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    }));
    ```
  - [x] `catch (err) { return withCors(request, errorResponse(err)); }` — a
    missing/invalid token throws `UnauthorizedError` (→ `401`, AC 2); a parent
    token throws `ForbiddenError` (→ `403`, not explicitly required by an AC
    but is the existing, already-tested `resolveApiStudentId` policy — do not
    special-case it away).
  - [x] Add `OPTIONS(request)` → `preflight(request)`, matching every other route.

- [x] **Task 3: Tests (AC: 1–3)**
  - [x] `src/app/api/report/pdf/build.test.ts` — mock `@/db`'s `select().from().where().orderBy()` chain (same shape as `listTrips` in `trips.test.ts`) to return trip rows, and mock `@react-pdf/renderer`'s `renderToBuffer` (it's slow and irrelevant to this story's logic — assert it was *called* with the right props, don't render real PDF bytes in unit tests). Cases: running totals accumulate correctly across multiple rows; filename derives from `studentName` (lowercased, spaces→hyphens) and falls back to `'report'` when `studentName` is `null`; zero trips → empty rows array, totals `0`, `renderToBuffer` still called once (an empty log is still a valid, downloadable PDF).
  - [x] `src/app/api/report/pdf/route.test.ts` — **new file; no test existed for this route before.** Added for real regression coverage on AC 3, not just "nothing else broke." Mock `@/auth`'s `auth()`, mock `@/app/(app)/actions`'s `resolveSelectedStudentId`, mock `./build`'s `buildReportPdf`. Cases: no session → `401`; parent session with no resolved student → `400`; parent session with a student → resolves name/parent-name, calls `buildReportPdf`, returns `200` with `Content-Type: application/pdf` and the `Content-Disposition` header from the mocked filename; student session → `buildReportPdf` called with the student's own id and `parentName: null`.
  - [x] `src/app/api/v1/report/pdf/route.test.ts` — mirror the other `/api/v1` route tests: mock `@/lib/api-auth`'s `requireApiUser` (keep `resolveApiStudentId` real), mock `@/db` for the name lookup, mock `./build`'s… actually mock `@/app/api/report/pdf/build`'s `buildReportPdf`. Cases: valid student token → `200`, `Content-Type: application/pdf`, CORS header present, `buildReportPdf` called with `(studentId, studentName, null)`; missing/invalid token → `401`, `buildReportPdf` not called; parent token → `403`, `buildReportPdf` not called; `OPTIONS` → `204` with CORS headers.
  - [x] Full suite green (`npm test -- --run`) + `npm run build` + `npx eslint .` clean (no new errors — the project has 15 pre-existing, unrelated lint errors elsewhere; do not fix or touch those files).

## Dev Notes

### This is the last story in Epic 2 — no new shared infrastructure

Every auth/CORS/error-mapping piece already exists from Epic 1 and story 2.1:
`requireApiUser`/`resolveApiStudentId` (`src/lib/api-auth.ts`), `errorResponse`
(`src/lib/api-error.ts`), `preflight`/`withCors` (`src/lib/cors.ts`). This story's
only *new* piece of shared code is the `buildReportPdf` extraction — everything
else is wiring, identical in shape to `src/app/api/v1/report/route.ts` from 2.1.

### Current web route being refactored (`src/app/api/report/pdf/route.tsx`)

Full current contents for reference — the extraction boundary is everything
from the `db.select().from(trips)...` line down to the `renderToBuffer(...)`
call and the `filename` line:

```tsx
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id, userType: userTypeRaw } = session.user;
  const userType = userTypeRaw as UserType;
  const userId = Number(id);

  let studentId: number;
  let studentName: string | null = null;
  let parentName: string | null = null;

  if (userType === 'parent') {
    const resolved = await resolveSelectedStudentId(userId);
    if (!resolved) {
      return new NextResponse('No student selected', { status: 400 });
    }
    studentId = resolved;
    const [student] = await db.select({ name: users.name }).from(users)
      .where(and(eq(users.id, studentId), eq(users.parentId, userId)));
    studentName = student?.name ?? null;
    const [parent] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    parentName = parent?.name ?? null;
  } else {
    studentId = userId;
    const [student] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    studentName = student?.name ?? null;
  }

  // ---- everything below this line moves into buildReportPdf(studentId, studentName, parentName) ----
  const tripRows = await db.select().from(trips).where(eq(trips.studentId, studentId)).orderBy(trips.tripDate, trips.id);
  let runningDay = 0, runningNight = 0;
  const rows = tripRows.map((trip) => {
    runningDay += trip.daytimeMinutes;
    runningNight += trip.nighttimeMinutes;
    return { ...trip, runningDay, runningNight, grandTotal: runningDay + runningNight };
  });
  const printedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const buffer = await renderToBuffer(<ReportDocument rows={rows} studentName={studentName} parentName={parentName} totalDay={runningDay} totalNight={runningNight} printedDate={printedDate} />);
  const filename = `driving-log-${studentName?.toLowerCase().replace(/\s+/g, '-') ?? 'report'}.pdf`;
  // ---- end of extracted block ----

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}
```

After the refactor, everything above the marked block stays in `route.tsx`
unchanged; everything inside the marked block becomes the body of
`buildReportPdf` in `build.tsx`; the final `NextResponse` construction stays in
`route.tsx`, just fed from `{ buffer, filename }` instead of local variables.

### Why extract into `build.tsx` and not `src/services/report.ts`

`buildReportPdf` must call `renderToBuffer(<ReportDocument .../>)`, which requires
JSX — that's *why the existing route file is `.tsx` and not `.ts` today*, and
it's why the extraction target is also `.tsx`, co-located next to `document.tsx`
in the same directory, not `src/services/*.ts` (which is plain `.ts`, no JSX,
throughout the codebase — introducing the first `.tsx` service file would be an
unnecessary convention break for one function). `src/services/report.ts` (2.1)
is unrelated — it computes dashboard *progress percentages*, not PDF rows; do
not conflate the two.

### The v1 route needs its own tiny name lookup — do not try to reuse `getReport`

`getReport()` from 2.1 returns totals/percentages, not the student's `name`.
The v1 PDF route needs the caller's own name for the PDF header, which requires
its own minimal `db.select({ name: users.name })...` — three lines, not worth a
new service function for. Copy the exact query shape from the existing route's
student branch (shown above).

### Reuse — do not reinvent

- `requireApiUser`, `resolveApiStudentId` — `src/lib/api-auth.ts` (1.1). A parent
  caller is rejected by `resolveApiStudentId` itself (`ForbiddenError` → `403`);
  no new parent-handling code needed or wanted.
- `errorResponse`, `preflight`, `withCors` — `src/lib/cors.ts`/`src/lib/api-error.ts` (1.1).
- `ReportDocument` (`src/app/api/report/pdf/document.tsx`) — unchanged, consumed
  by the new `build.tsx`, not modified.

### Project Structure Notes

- New file: `src/app/api/report/pdf/build.tsx` (+ `build.test.ts`).
- New file: `src/app/api/v1/report/pdf/route.ts` (+ `route.test.ts`) — one
  directory level under `src/app/api/v1/report/` (alongside 2.1's `route.ts`
  for the totals endpoint).
- Modified: `src/app/api/report/pdf/route.tsx` — narrowed to auth/resolution +
  response-building; delegates rendering to `build.tsx`.
- New test file: `src/app/api/report/pdf/route.test.ts` — this route had zero
  test coverage before; add it now since the refactor touches it directly.
- No new dependencies, no schema changes, no new env vars.

### Testing standards summary

- Vitest unit tests co-located with source. Mock `@/db`'s query chain the same
  way `trips.test.ts`/`report.test.ts` (2.1) do.
- Mock `@react-pdf/renderer`'s `renderToBuffer` in `build.test.ts` — do not let
  unit tests actually render PDFs; assert on the call, not the bytes.
- Route tests mock `@/lib/api-auth`'s `requireApiUser` only (keep
  `resolveApiStudentId` real) for the v1 route — see
  `src/app/api/v1/report/route.test.ts` (2.1) and `src/app/api/v1/trips/route.test.ts` (1.2/1.3) for the exact pattern.
- No e2e changes required by the ACs — there is no existing Playwright coverage
  of either PDF route today (`tests/e2e/core-journey.spec.ts` only navigates to
  `/report`, never downloads the PDF), so this story doesn't need to touch e2e.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#story-22-download-the-official-pdf-log-from-a-native-client] — BDD ACs.
- [Source: _bmad-output/planning-artifacts/architecture.md §6] — `GET /api/v1/report/pdf` endpoint table entry: "reuse existing... adapt to accept Bearer auth + explicit studentId."
- [Source: _bmad-output/planning-artifacts/architecture.md §6, row 8] — "The existing PDF route returns `400` when a parent has no student selected; under the API it instead reads the explicit/resolved `studentId`" — confirms the v1 route never hits that 400 path (a student caller always has a `studentId` — itself).
- [Source: _bmad-output/planning-artifacts/architecture.md §10] — migration step 4 ("Adapt the PDF route for Bearer auth + explicit studentId").
- [Source: src/app/api/report/pdf/route.tsx] — current web route, full extraction source (reproduced above).
- [Source: src/app/api/report/pdf/document.tsx] — `ReportDocument` component, unchanged.
- [Source: src/app/api/v1/report/route.ts] — 2.1's thin-handler pattern, copied here.
- [Source: _bmad-output/implementation-artifacts/2-1-retrieve-report-totals-from-a-native-client.md] — most recent story; established the `/api/v1/report/*` route-test mocking conventions this story reuses verbatim.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMAD dev-story, autonomous run)

### Debug Log References

- None. Clean extraction + new thin handler, following the established `/api/v1` pattern.

### Completion Notes List

- All 3 ACs implemented. `buildReportPdf(studentId, studentName, parentName)` in `src/app/api/report/pdf/build.tsx` now holds the trip-query/running-totals/`renderToBuffer`/filename logic, called by both the existing web route (session auth, unchanged resolution logic) and the new `GET /api/v1/report/pdf` (Bearer auth via `requireApiUser`/`resolveApiStudentId`).
- The web route diff is a pure extraction — same auth flow, same 401/400 responses, same `NextResponse` construction; only the trip-query-through-filename block moved into `buildReportPdf`. Added `route.test.ts` for it since no test existed before (4 cases: no-session 401, parent-no-student 400, parent success path with parent name, student success path with `parentName: null`), giving AC 3 real regression coverage rather than just "the suite didn't break."
- The v1 route mirrors 2.1's `report/route.ts` shape exactly, plus a 3-line student-name lookup (not worth promoting into `getReport()`, which returns totals/percentages, not names). `parentName` is always `null` — v1 callers are student-only (enforced by the existing `resolveApiStudentId`, unchanged).
- Response building uses plain Web `Response` (not `NextResponse`) in the v1 route, consistent with every other `/api/v1` handler — this is the first binary-body `/api/v1` response, but the header-setting shape is identical to a JSON one.
- Unit-tested `buildReportPdf` with mocked `@react-pdf/renderer.renderToBuffer` (via `vi.hoisted()` — a plain top-level `const` referenced from a `vi.mock` factory threw a TDZ `ReferenceError` on this particular mock; `vi.hoisted()` fixed it) — asserts on the call/props, never renders real PDF bytes in unit tests.
- 94 unit tests green (12 new: 4 build + 4 web-route + 4 v1-route); `tsc --noEmit` clean; `npm run build` clean (CI-placeholder env vars, `ci-build.db` cleaned up after) — confirms `/api/v1/report/pdf` registers as a route alongside the untouched `/api/report/pdf`; `npx eslint .` on every file this story touched is clean (the 15 pre-existing errors elsewhere are untouched, same as 2.1).
- No live end-to-end round-trip or new Playwright coverage — neither PDF route had e2e coverage before this story (confirmed via grep on `tests/e2e/core-journey.spec.ts`), and none is required by the ACs; the new web-route unit tests plus the v1 route's mirrored-pattern unit tests were judged sufficient.
- **Epic 2 dev work complete — both stories implemented and awaiting review.** Awaiting code review (per user instruction, to be run separately on Opus).

### File List

**Added:**
- `src/app/api/report/pdf/build.tsx` — `buildReportPdf(studentId, studentName, parentName)`, extracted from the web route
- `src/app/api/report/pdf/build.test.ts`
- `src/app/api/report/pdf/route.test.ts` — new regression coverage for the refactored web route
- `src/app/api/v1/report/pdf/route.ts` — `GET`, `OPTIONS`
- `src/app/api/v1/report/pdf/route.test.ts`

**Modified:**
- `src/app/api/report/pdf/route.tsx` — narrowed to auth/resolution + response-building; delegates PDF rendering to `buildReportPdf`

### Change Log

- 2026-08-09 — Implemented story 2.2: extracted `buildReportPdf` shared helper, refactored the web PDF route onto it (behavior-preserving), added `GET /api/v1/report/pdf` with Bearer auth. 94 tests green, build + lint clean. Status → review (code review pending on Opus, separate session). **Epic 2 dev work complete — both stories (2.1, 2.2) implemented and awaiting review.**
