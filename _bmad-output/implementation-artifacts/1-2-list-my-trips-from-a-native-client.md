# Story 1.2: List my trips from a native client

Status: done

## Story

As the student driver,
I want to fetch my logged trips on my phone,
so that I can see my driving history.

Extracts the trip **read path** into `src/services/trips.ts` and exposes it as
`GET /api/v1/trips`, built on the Story 1.1 auth foundation. Also introduces two
thin shared API seams (studentId resolution + typed-error→HTTP mapping) that
stories 1.3–1.5 reuse.

## Acceptance Criteria

1. `GET /api/v1/trips` with a valid token returns the caller's own trips, **newest first**, as JSON (200).
2. Ownership isolation: the response can only ever contain the caller's trips — the service filters by `studentId` and never returns another student's rows (NFR2).
3. `GET /api/v1/trips` with no token or an invalid token returns `401`.
4. Web regression: the trips page (`src/app/(app)/trips/page.tsx`) is refactored onto `listTrips` and its behavior/ordering is unchanged; existing suites pass (NFR3).
5. The read ordering matches the web page exactly: `ORDER BY tripDate DESC, id DESC`.

## Tasks / Subtasks

- [x] **Task 1: Trip read service (AC: 1, 2, 5)**
  - [x] Create `src/services/trips.ts` exporting `listTrips(studentId: number): Promise<Trip[]>` — `db.select().from(trips).where(eq(trips.studentId, studentId)).orderBy(desc(trips.tripDate), desc(trips.id))`. Ownership is the `where` clause — the security boundary lives in the service (architecture §4).
  - [x] Refactor `src/app/(app)/trips/page.tsx` to call `listTrips(studentId)` instead of the inline query. Keep the parent/student `studentId` resolution and the student-name lookup in the page (web-only concern). Ordering unchanged (AC 5).

- [x] **Task 2: Shared API seams (foundation for 1.2–1.5)**
  - [x] Add `resolveApiStudentId(caller: ApiCaller): number` to `src/lib/api-auth.ts` — for a `student` caller returns `caller.userId`; for a `parent` caller throws `ForbiddenError` ("Parent API access is not supported yet"). This is the explicit-student-context seam (architecture D6/D8); parent support is a clean additive fast-follow.
  - [x] Create `src/lib/api-error.ts` exporting `errorResponse(err: unknown): Response` — maps `ValidationError→400` (include `fields`), `UnauthorizedError→401`, `ForbiddenError→403`, `NotFoundError→404`, anything else → re-throw (let it 500). Body shape `{ error: { code, message, fields? } }` (architecture §6).

- [x] **Task 3: `GET /api/v1/trips` handler (AC: 1, 3)**
  - [x] Create `src/app/api/v1/trips/route.ts` with `GET(request)` and `OPTIONS(request)`. `GET`: `requireApiUser` → `resolveApiStudentId` → `listTrips` → `Response.json(trips)`; wrap in try/catch → `withCors(request, errorResponse(err))`. CORS headers on every response.
  - [x] Next.js 16 route-handler convention (Web Request/Response). No `params` here.

- [x] **Task 4: Tests (AC: 1–5)**
  - [x] `src/services/trips.test.ts` — `listTrips` issues the ownership-filtered, correctly-ordered query (assert the `where`/`orderBy` via the db mock; assert it returns the rows).
  - [x] `src/app/api/v1/trips/route.test.ts` — valid student token → 200 with the trips (mock `requireApiUser` + `listTrips`); no/invalid token → 401; parent token → 403; `OPTIONS` preflight CORS behavior.
  - [x] Full suite green + build.

## Dev Notes

- **Read path today** lives inline in `src/app/(app)/trips/page.tsx`: `db.select().from(trips).where(eq(trips.studentId, studentId)).orderBy(desc(trips.tripDate), desc(trips.id))`. That query is what moves into `listTrips`. The page's parent-vs-student `studentId` resolution (via `resolveSelectedStudentId`) and student-name lookup **stay in the page** — they are web/cookie concerns, not service concerns.
- **studentId for the API**: v1 iOS is the student logging in as themselves, so `studentId = caller.userId` for student accounts. Parent-on-iOS is deferred (architecture D8) → `resolveApiStudentId` throws `ForbiddenError` for parents so the seam is explicit and the fast-follow is additive.
- **Reuse from 1.1**: `requireApiUser`, `withCors`, `preflight`, `ApiCaller`, the typed errors in `src/services/errors.ts`. Do not duplicate.
- **Trip type**: `Trip = typeof trips.$inferSelect` from `@/db/schema`.
- **Scope guardrails**: read-only. No create/update/delete (1.3–1.5). No pagination/filtering (not in scope). No changes to `src/services/auth.ts` or the token endpoint.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#4-service-layer] — service contract, ownership in the service.
- [Source: _bmad-output/planning-artifacts/architecture.md#6-rest-api---apiv1] — endpoint table, error→status mapping, JSON responses.
- [Source: _bmad-output/planning-artifacts/epics.md#story-12-list-my-trips-from-a-native-client] — user story + BDD ACs.
- [Source: src/app/(app)/trips/page.tsx] — current read query + ordering to preserve.
- [Source: src/lib/api-auth.ts] — `requireApiUser`, `ApiCaller` (from story 1.1).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMAD dev-story, autonomous run)

### Debug Log References

- None. Clean implementation on the Story 1.1 foundation.

### Completion Notes List

- All 5 ACs met. 31 unit tests green; build clean.
- **Live end-to-end round-trip verified** against an isolated copy of the dev DB in the scratchpad (real `local.db` never modified, confirmed clean afterward): no token → 401; `POST /api/v1/auth/token` with a seeded student → JWT; `GET /api/v1/trips` with the token → 200 returning only that student's seeded trip; garbage token → 401. This exercises the full 1.1 + 1.2 auth→list flow through the real server.
- Web trips page refactored onto `listTrips`; ordering (`tripDate DESC, id DESC`) preserved (AC4/AC5).
- Two shared seams added for reuse by 1.3–1.5: `resolveApiStudentId` (student→own id, parent→403) and `errorResponse` (typed error→HTTP status).
- Scope held: read-only, no create/update/delete, no pagination.

### File List

**New:** `src/services/trips.ts`, `src/lib/api-error.ts`, `src/app/api/v1/trips/route.ts`, `src/services/trips.test.ts`, `src/app/api/v1/trips/route.test.ts`
**Modified:** `src/lib/api-auth.ts` (add `resolveApiStudentId`), `src/app/(app)/trips/page.tsx` (use `listTrips`)

### Change Log

- 2026-08-08 — Implemented story 1.2: `listTrips` service, `GET /api/v1/trips`, shared studentId/error seams; web trips page refactored. Live round-trip verified. Code review: Approve, 0 findings. Status → done.

## Senior Developer Review (AI)

**Reviewed:** 2026-08-08 · **Outcome:** Approve · No action items.

All 5 ACs verified (AC3 + full 200/ownership path confirmed live). Ownership isolation holds — `listTrips` filters by `studentId`; `resolveApiStudentId` pins a student to their own id. Noted-but-acceptable: an unexpected non-typed error re-thrown by `errorResponse` produces a bare 500 without CORS headers — that path is a server fault, not a client case, and all typed errors are mapped + CORS'd.
