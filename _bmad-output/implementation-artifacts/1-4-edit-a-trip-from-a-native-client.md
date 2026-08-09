# Story 1.4: Edit a trip from a native client

Status: done

## Story

As the student driver,
I want to correct a logged drive from my phone,
so that my records are accurate.

Extracts `updateTrip` into the trip service; refactors web `updateTripAction` onto
it. Exposes `PATCH /api/v1/trips/:id`.

## Acceptance Criteria

1. Valid token + a trip I own + valid fields → trip updated, updated trip returned as JSON (200).
2. A trip id I do not own → `404` and nothing changes (NFR2). (Not-found and not-owned return the same response — no existence leak, matching current web behavior which returns "Trip not found" for both.)
3. Invalid fields → `400` with the same validation as create (NFR1) — reuses `validateTrip` from story 1.3.
4. No/invalid token → `401`.

## Tasks / Subtasks

- [x] **Task 1: `updateTrip` service (AC: 1, 2, 3)**
  - [x] Add `updateTrip(tripId: number, input: TripInput, ctx: { studentId: number }): Promise<Trip>` to `src/services/trips.ts`. Ownership check FIRST (`select where id = tripId AND studentId = ctx.studentId`); if no row, throw `NotFoundError('Trip not found.')` — before validating input, so a non-owned trip never even gets a validation response (matches current web order: ownership check precedes field validation).
  - [x] Then call the existing `validateTrip` (exported/reused, not duplicated) — same rules as create.
  - [x] `db.update(trips).set({...}).where(eq(trips.id, tripId)).returning()` → return updated row.

- [x] **Task 2: Refactor web `updateTripAction` (AC: none new — regression)**
  - [x] `src/app/(app)/trips/actions.ts`: replace the inline ownership-check + validation + update with a call to `updateTrip(tripId, input, { studentId })`. Keep the existing `resolveStudentId` helper (cookie-based, web-only) and the minutes clamp (same clamp-before-call pattern as story 1.3's `createTripAction`). Catch `NotFoundError` → `{ errors: { form: 'Trip not found.' } }`; catch `ValidationError` → `{ errors: err.fields }`.

- [x] **Task 3: `PATCH /api/v1/trips/:id` handler (AC: 1, 2, 3, 4)**
  - [x] Create `src/app/api/v1/trips/[id]/route.ts` with `PATCH(request, { params })` and `OPTIONS(request)`. Next.js 16: `{ params }: { params: Promise<{ id: string }> }`, `const { id } = await params` (verified against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`).
  - [x] `requireApiUser` → `resolveApiStudentId` → parse `id` to a number (non-numeric → `ValidationError` → 400) → parse JSON body (non-object → `ValidationError`) → `updateTrip(tripId, body, { studentId })` → `Response.json(trip)`. try/catch → `withCors(request, errorResponse(err))`.

- [x] **Task 4: Tests (AC: 1–4)**
  - [x] `trips.test.ts` — `updateTrip`: owned trip + valid fields → updates and returns; non-owned/non-existent trip id → throws `NotFoundError` (assert no update call made); invalid fields on an owned trip → throws `ValidationError` (reuse the 1.3 validation matrix, don't re-derive it — just prove `updateTrip` delegates to the same `validateTrip`).
  - [x] `[id]/route.test.ts` — PATCH valid → 200 + updated trip; PATCH non-owned id → 404; PATCH invalid body → 400; PATCH no token → 401; non-numeric id → 400; `OPTIONS` preflight.
  - [x] Full suite green + build.

## Dev Notes

### Current web behavior to preserve (`src/app/(app)/trips/actions.ts`)

Order: resolve studentId (cookie/self) → **ownership check** (select by id+studentId; not found → `{ errors: { form: 'Trip not found.' } }`) → validate (same 5 rules as create, clamped minutes) → update. The API mirrors this order exactly: ownership before validation.

### Reuse, don't duplicate

- `validateTrip` from story 1.3 (`src/services/trips.ts`) — export it if not already, and call it from `updateTrip`. Do NOT copy the validation rules a second time.
- `resolveApiStudentId`, `errorResponse`, `withCors`, `preflight`, typed errors — all from 1.1–1.3.
- The route file is new (`[id]/route.ts`), distinct from the collection route (`trips/route.ts`) — standard Next.js nested dynamic segment.

### Scope guardrails

- No delete (story 1.5 — but note the `[id]/route.ts` file will likely gain a `DELETE` handler in that story; this story only adds `PATCH`+`OPTIONS`).
- `studentId` on an update is never changed — a trip cannot be reassigned to a different student via this endpoint (not in the update `.set()`).

### References

- [Source: src/app/(app)/trips/actions.ts] — exact current ownership-check + validation + update order.
- [Source: src/services/trips.ts] — `validateTrip`/`TripInput`/`ValidationError` from story 1.3, reused here.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md] — async `params` convention for dynamic route handlers.
- [Source: _bmad-output/planning-artifacts/epics.md#story-14-edit-a-trip-from-a-native-client] — BDD ACs.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5 (BMAD dev-story, autonomous run)

### Debug Log References

- `tsc` failed on 4 new test assertions: `whereMock`'s default implementation (`() => ({ orderBy: orderByMock })`) fixed its inferred return type, so `mockResolvedValueOnce([...])` (used for the `updateTrip` ownership-check path, which awaits `.where(...)` directly with no `.orderBy()` call) didn't type-check. Fixed by loosening `whereMock`'s type to `vi.fn<(...args: unknown[]) => unknown>(...)` — safe since these are test doubles, not production types.

### Completion Notes List

- All 4 ACs implemented. 58 unit tests green (11 new: 4 for `updateTrip`, 7 for the `PATCH` route); `tsc`/`eslint`/build clean.
- `updateTrip` checks ownership *before* validating input, matching the pre-refactor web order exactly (a non-owned/nonexistent trip id gets `404` even with garbage field values, never a `400`) — covered by a dedicated test.
- `validateTrip` (from story 1.3) is reused unexported/module-internal — both `createTrip` and `updateTrip` call the same function; no duplicated rules.
- Web `updateTripAction` refactored onto `updateTrip`; kept the existing `resolveStudentId` cookie helper and the minutes clamp (same pattern as 1.3's `createTripAction`) so web behavior/messages are unchanged.
- New nested route `src/app/api/v1/trips/[id]/route.ts` — Next.js 16 async `params` convention verified against the local docs before writing.
- **Not yet run:** live smoke test against the real dev server (unit + build coverage is comprehensive; a live round-trip can be added as a Verify step before merge if desired).
- **Awaiting code review** (per user instruction, to be run on Opus).

### File List

**New:**
- `src/app/api/v1/trips/[id]/route.ts` — `PATCH` + `OPTIONS`
- `src/app/api/v1/trips/[id]/route.test.ts`

**Modified:**
- `src/services/trips.ts` — added `updateTrip` (reuses `validateTrip`)
- `src/app/(app)/trips/actions.ts` — `updateTripAction` refactored onto `updateTrip`
- `src/services/trips.test.ts` — added `updateTrip` test suite + update-chain mocks

### Change Log

- 2026-08-09 — Implemented story 1.4: `updateTrip` service (ownership-before-validation), `PATCH /api/v1/trips/:id`, web `updateTripAction` refactor. 58 tests green, build clean. Status → review (code review pending on Opus).

## Review Findings (Code Review 2026-08-09, Opus — Blind/Edge/Auditor)

_Branch-level review of stories 1.3–1.5. Cross-cutting/shared-layer findings and the full defer/dismiss list are in story 1.5. Below are findings owned by 1.4's code._

**Decision needed:**

- [x] [Review][Decision → resolved: keep full-replace, documented] `PATCH` requires ALL fields (behaves like PUT) [src/services/trips.ts `updateTrip` / [id]/route.ts] — `updateTrip` runs the full `validateTrip`, so a partial `PATCH` 400s on the first missing field. **Decision (John, 2026-08-09): keep full-replace (PUT-style) semantics for v1 — the iOS edit screen submits the whole form.** Action: add a clarifying comment on the `PATCH` handler noting the client must send all fields. No behavior change.

**Patch:**

- [x] [Review][Patch] Ownership predicate dropped from the UPDATE/DELETE write + unhandled empty return [src/services/trips.ts `updateTrip`/`deleteTrip`] — the ownership `SELECT` runs first (good), but the mutating statement now filters by `id` only; the `studentId` predicate that the file's own comment calls "the security boundary" is gone from the write. Also, if the row vanishes between select and write, `.returning()` is empty → `updateTrip` returns `undefined` → route emits **200 with a `null` body** instead of 404. Restore `and(eq(id), eq(studentId))` on the write and throw `NotFoundError` when `returning()` is empty (closes the TOCTOU too). (blind+edge, Medium) — also affects 1.5's `deleteTrip`.
- [x] [Review][Patch] `parseTripId` accepts hex / exponent / negative / empty [src/app/api/v1/trips/[id]/route.ts `parseTripId`] — `Number("0x10")`→16, `"1e3"`→1000, `"-5"`, `""`→0 all satisfy `Number.isInteger`. Ownership still gates access (→404, no leak), but the id contract is looser than "positive integer." Tighten to a canonical positive decimal. (blind+edge+auditor, Low)
