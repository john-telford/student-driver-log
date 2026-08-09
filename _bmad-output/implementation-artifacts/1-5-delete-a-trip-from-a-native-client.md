# Story 1.5: Delete a trip from a native client

Status: review

## Story

As the student driver,
I want to remove a mistaken entry from my phone,
so that my log only contains real drives.

Extracts `deleteTrip` into the trip service; refactors web `deleteTripAction` onto
it. Exposes `DELETE /api/v1/trips/:id`.

## Acceptance Criteria

1. Valid token + a trip I own → `DELETE /api/v1/trips/:id` deletes the trip, returns `204 No Content`.
2. A trip id I do not own → `404` and nothing is deleted (NFR2).
3. No/invalid token → `401`.

## Tasks / Subtasks

- [x] **Task 1: `deleteTrip` service (AC: 1, 2)**
  - [x] Add `deleteTrip(tripId: number, ctx: { studentId: number }): Promise<void>` to `src/services/trips.ts`. Ownership check first (same pattern as `updateTrip`): `select where id = tripId AND studentId = ctx.studentId`; no row → throw `NotFoundError('Trip not found.')`. Otherwise `db.delete(trips).where(eq(trips.id, tripId))`.
  - [x] **Behavior change from today's web action, by design**: the current `deleteTripAction` deletes with a compound `where(id AND studentId)` and silently no-ops (0 rows affected, no error) if the trip isn't owned. The service now explicitly detects this and throws, because the API AC requires a visible `404` (NFR2) — a stateless client needs to know the delete didn't happen. See Task 2 for how the web wrapper preserves its old silent UX despite this.

- [x] **Task 2: Refactor web `deleteTripAction` (regression — preserve silent no-op)**
  - [x] `src/app/(app)/trips/actions.ts`: call `deleteTrip(tripId, { studentId })`. Catch `NotFoundError` and swallow it (`return`) — this reproduces the current web behavior exactly (no error surfaced to the UI for a non-owned/already-deleted trip id). Any other thrown error propagates.

- [x] **Task 3: `DELETE /api/v1/trips/:id` handler (AC: 1, 2, 3)**
  - [x] Add `DELETE(request, { params })` to `src/app/api/v1/trips/[id]/route.ts` (same file as `PATCH` from story 1.4 — reuse `parseTripId`). `requireApiUser` → `resolveApiStudentId` → parse id → `deleteTrip(tripId, { studentId })` → `withCors(request, new Response(null, { status: 204 }))`. try/catch → `withCors(request, errorResponse(err))`.

- [x] **Task 4: Tests (AC: 1–3)**
  - [x] `trips.test.ts` — `deleteTrip`: owned trip → deletes (assert the delete call), returns `undefined`; non-owned/non-existent → throws `NotFoundError`, delete never called.
  - [x] `[id]/route.test.ts` — `DELETE` valid → `204`, no body; non-owned id → `404`; no token → `401`; parent token → `403`; non-numeric id → `400`.
  - [x] Full suite green + build.

## Dev Notes

### Current web behavior (`src/app/(app)/trips/actions.ts` `deleteTripAction`)

```ts
await db.delete(trips).where(and(eq(trips.id, tripId), eq(trips.studentId, studentId)));
```
No existence/ownership check beforehand — a non-owned id just deletes 0 rows, no error. The refactor **intentionally changes internal behavior** (service now checks-then-throws) but **preserves external web behavior** (the wrapper catches and swallows `NotFoundError`). This is the same shape as story 1.4's ownership handling, but here the web wrapper discards the error instead of surfacing it — because that's what the current UI already does.

### Reuse

- `parseTripId` (added in story 1.4, same route file) — do not duplicate.
- `resolveApiStudentId`, `errorResponse`, `withCors`, `preflight`, `NotFoundError` — from 1.1/1.2/1.4.

### Response shape

`204 No Content`, empty body, on success — standard REST for DELETE. No JSON payload needed (the client already knows what it asked to delete).

### Scope guardrails

- This is the last story in Epic 1. No new shared seams expected — everything (`resolveApiStudentId`, `errorResponse`, typed errors, `validateTrip`) already exists from 1.1–1.4.

### References

- [Source: src/app/(app)/trips/actions.ts] — current `deleteTripAction` (silent no-op behavior to preserve).
- [Source: src/services/trips.ts] — `updateTrip`'s ownership-check pattern, reused for `deleteTrip`.
- [Source: src/app/api/v1/trips/[id]/route.ts] — existing `PATCH`/`parseTripId` from story 1.4, extended here.
- [Source: _bmad-output/planning-artifacts/epics.md#story-15-delete-a-trip-from-a-native-client] — BDD ACs.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5 (BMAD dev-story, autonomous run)

### Debug Log References

- None. Clean implementation, following the `updateTrip`/story 1.4 ownership pattern.

### Completion Notes List

- All 3 ACs implemented. 65 unit tests green (7 new); `tsc`/`eslint`/build clean.
- **Full live end-to-end verification** (last story of Epic 1, so ran the complete CRUD loop through the real dev server against an isolated DB copy — real `local.db` untouched, confirmed clean afterward): auth → create (201) → create with invalid minutes (400) → list (1 trip) → edit own trip (200) → **edit with a second student's token → 404** → **delete with a second student's token → 404, trip still exists** → delete own trip (204) → list again (empty array). This proves ownership isolation (NFR2) across edit and delete with two distinct student accounts, not just mocks.
- Web `deleteTripAction` intentionally preserves its pre-refactor silent-no-op UX (catches and swallows `NotFoundError`) even though the service now explicitly detects and reports non-owned deletes — documented in Dev Notes as a deliberate internal-behavior-change/external-behavior-preserved split.
- `DELETE` returns `204 No Content` with an empty body, consistent REST convention; no new shared seams needed (last story in the epic).
- **Awaiting code review** (per user instruction, to be run on Opus).

### File List

**Modified:**
- `src/services/trips.ts` — added `deleteTrip` (reuses the `updateTrip` ownership-check pattern)
- `src/app/(app)/trips/actions.ts` — `deleteTripAction` refactored onto `deleteTrip`, swallows `NotFoundError` to preserve prior silent behavior
- `src/app/api/v1/trips/[id]/route.ts` — added `DELETE` handler (reuses `parseTripId`)
- `src/services/trips.test.ts` — added `deleteTrip` test suite + delete-chain mock
- `src/app/api/v1/trips/[id]/route.test.ts` — added `DELETE` tests

### Change Log

- 2026-08-09 — Implemented story 1.5: `deleteTrip` service, `DELETE /api/v1/trips/:id`, web `deleteTripAction` refactor. 65 tests green, build clean, full live CRUD + ownership-isolation round-trip verified. Status → review (code review pending on Opus). **Epic 1 dev work complete — all 5 stories implemented and awaiting review.**
