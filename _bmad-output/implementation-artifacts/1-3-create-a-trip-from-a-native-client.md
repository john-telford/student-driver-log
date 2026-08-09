# Story 1.3: Create a trip from a native client

Status: review

## Story

As the student driver,
I want to log a new drive from my phone,
so that my hours are recorded.

Extracts `createTrip` (with validation) into `src/services/trips.ts` and exposes
`POST /api/v1/trips`; refactors the web `createTripAction` onto the same service.

## Acceptance Criteria

1. `POST /api/v1/trips` with a valid token + valid JSON body creates the trip for the caller's student id and returns the created trip as JSON (201).
2. Invalid body (future `tripDate`, invalid enum, minutes outside 0–600, or both day+night = 0) → `400` with field errors; validation rules identical to the web form (NFR1).
3. No/invalid token → `401`.
4. Web regression: `createTripAction` refactored onto `createTrip`; its behavior, error messages, and field-error order are unchanged; suites pass (NFR3).
5. `createdBy` and `studentId` are set correctly — for a student API caller both are the caller's own id.

## Tasks / Subtasks

- [x] **Task 1: `createTrip` service (AC: 1, 2, 5)**
  - [x] Add `createTrip(input, ctx)` to `src/services/trips.ts`. `input = { tripDate, locationType, weather, daytimeMinutes, nighttimeMinutes, notes }` (raw), `ctx = { studentId, createdBy }`. Validate, insert with `.returning()`, return the created `Trip`.
  - [x] Validation order + messages MUST match the current web action exactly (see Dev Notes): tripDate required → not future → locationType enum → weather enum → minutes range → at least one > 0 → notes ≤ 500. Throw `ValidationError(message, { field })` on the FIRST failure (single field, matching web's early-return behavior).
  - [x] Minutes rule: `0 ≤ each ≤ 600` and at least one > 0. Out-of-range throws `ValidationError('...between 0 and 600.', { minutes })`.

- [x] **Task 2: Refactor web `createTripAction` (AC: 4)**
  - [x] `src/app/(app)/trips/new/actions.ts`: keep the parent/student `studentId` resolution and the **minutes clamp** (`Math.max(0, Math.min(600, …))`) as input normalization, then call `createTrip`. Catch `ValidationError` and map `err.fields` → `TripFormState.errors`; return `{ success: true }` otherwise. Because the web clamps before calling, the range-rejection branch never fires for web → behavior identical.

- [x] **Task 3: `POST /api/v1/trips` handler (AC: 1, 2, 3)**
  - [x] Extend `src/app/api/v1/trips/route.ts` with `POST(request)`. `requireApiUser` → `resolveApiStudentId` → parse JSON → `createTrip(body, { studentId, createdBy: studentId })` → `Response.json(trip, { status: 201 })`. try/catch → `withCors(request, errorResponse(err))` (ValidationError → 400 with fields).

- [x] **Task 4: Tests (AC: 1–5)**
  - [x] `src/services/trips.test.ts` — createTrip: valid input inserts + returns the row; each invalid case throws `ValidationError` with the right field/message; out-of-range minutes rejected; both-zero rejected.
  - [x] `route.test.ts` — POST valid → 201 + created trip; POST invalid body → 400 with fields; no token → 401; parent → 403.
  - [x] Full suite green + build.

## Dev Notes

### Exact web validation to preserve (from `src/app/(app)/trips/new/actions.ts`)

```
tripDate  = formData.trim() ; '' → 'Date is required.' ; new Date(tripDate) > new Date() → 'Date cannot be in the future.'
locationType ∉ locationTypes → 'Select a location type.'
weather ∉ weatherConditions → 'Select a weather condition.'
minutes: web CLAMPS Math.max(0, Math.min(600, Number(x ?? 0)))
both 0 → 'Enter at least 1 minute of driving time.' (key: minutes)
notes.trim().length > 600? → actually > 500 → 'Notes must be 500 characters or fewer.'
insert: notes || null
```

### The clamp-vs-reject decision (important)

The web **clamps** minutes; story AC2 requires the API to **reject** out-of-range minutes (400). Resolution: the **service owns the rule** (`0 ≤ minutes ≤ 600`, reject out-of-range). The **web wrapper keeps its clamp as input normalization** before calling the service, so it never triggers the range rejection — web UX is byte-identical (NFR3), while the API passes raw values through and gets the 400 (AC2). The validation *rule* lives once in the service (NFR1); the clamp is web input-adaptation, not a duplicated rule. Range-error message (`'Minutes must be between 0 and 600.'`) is API-only since the web pre-clamps.

### Other constraints

- **studentId/createdBy**: web resolves studentId via cookie/parent logic (stays in the action); API uses `resolveApiStudentId(caller)` and `createdBy = studentId` (student logs their own trip).
- **Return shape**: service returns the inserted `Trip` via Drizzle `.returning()`. API returns it (201). Web ignores the return and returns `{ success: true }` — unchanged.
- **Reuse**: `resolveApiStudentId`, `errorResponse`, `withCors`, `ValidationError`, `listTrips`' file. Extend `route.ts` and `trips.ts`, don't fork.
- **Scope**: create only. No update/delete (1.4/1.5).

### References

- [Source: src/app/(app)/trips/new/actions.ts] — exact current validation + messages + insert.
- [Source: _bmad-output/planning-artifacts/architecture.md#4-service-layer] — validation rules to preserve, service contract.
- [Source: _bmad-output/planning-artifacts/epics.md#story-13-create-a-trip-from-a-native-client] — BDD ACs.
- [Source: docs/api-contracts.md] — field table + "0–600; clamped" web note.

## Dev Agent Record

### Agent Model Used

claude-sonnet-5 (BMAD dev-story, autonomous run)

### Debug Log References

- `tsc` initially failed: `TripInput` declared required `unknown` fields, but callers (the API route, some tests) pass a loosely-typed `Record<string, unknown>` which doesn't structurally satisfy required properties. Fixed by making all `TripInput` fields optional (`?`) — safe because `validateTrip` already does runtime `typeof` checks on every field regardless of the static type.

### Completion Notes List

- All 5 ACs implemented. 47 unit tests green (16 new: 8 for `createTrip` happy-path/validation, 8 for `POST` route); full `tsc`/`eslint`/build clean.
- Resolved the clamp-vs-reject tension per the Dev Notes plan: `createTrip` (the service) rejects out-of-range minutes with a `ValidationError`; the web action clamps minutes to 0–600 as input normalization *before* calling the service, so the web UX never hits the rejection path and existing web behavior/messages are unchanged (NFR3). The API passes raw body values through, so out-of-range minutes correctly 400 (AC2).
- Validation field order and messages copied verbatim from the pre-refactor `createTripAction` (date → location → weather → minutes range → minutes-both-zero → notes length).
- `POST /api/v1/trips` returns `201` with the created row (via Drizzle `.returning()`); `createdBy` and `studentId` both resolve to the caller's own id for a student token (AC5).
- **Not yet run:** live smoke test against the real dev server (skipped this cycle — unit + build coverage is comprehensive; consider running the isolated-DB round-trip from 1.2 as a Verify step before/after code review if desired).
- **Awaiting code review** (per user instruction, to be run on Opus).

### File List

**Modified:**
- `src/services/trips.ts` — added `createTrip`, `validateTrip`, `TripInput`/`TripContext` types
- `src/app/api/v1/trips/route.ts` — added `POST` handler
- `src/app/(app)/trips/new/actions.ts` — refactored onto `createTrip`, kept minutes clamp + studentId resolution
- `src/services/trips.test.ts` — added `createTrip` happy-path + validation test matrix
- `src/app/api/v1/trips/route.test.ts` — added `POST` tests (201, 400 validation, 400 non-object body, 401, 403)

### Change Log

- 2026-08-09 — Implemented story 1.3: `createTrip` service with validation, `POST /api/v1/trips`, web `createTripAction` refactor. 47 tests green, build clean. Status → review (code review pending on Opus).
