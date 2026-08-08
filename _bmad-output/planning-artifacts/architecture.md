---
stepsCompleted: [1]
inputDocuments:
  - docs/api-contracts.md
  - docs/data-models.md
  - docs/architecture.md
  - _bmad-output/project-context.md
  - SPEC.md (referenced)
  - src/auth.ts (source)
workflowType: 'architecture'
project_name: 'student-driver-log'
user_name: 'John'
date: '2026-06-19'
scope: 'iOS app enablement — core logging release'
authored_by: 'Winston (System Architect)'
---

# Architecture Decision Document — iOS App Enablement

_Right-sized architecture for exposing the existing Next.js web app to a native iOS
client. Scoped deliberately below the full templated workflow because this is a
solo personal project with well-bounded, incremental scope._

---

## 1. Context

The app is a Next.js 16 App Router monolith (React Server Components + Server Actions,
Auth.js v5, Drizzle/libSQL-Turso, Vercel). All mutations flow through **Server Actions**;
all reads happen directly in Server Components. There is **no externally-consumable API** —
Server Actions use a Next.js-internal wire protocol that a native client cannot call.

**Goal:** ship an iOS app (App Store distribution) for John's son Jimmy to log driving
hours from his phone. This document covers the **backend/API architecture** that makes an
iOS client possible. It does **not** design the iOS client itself (Expo vs SwiftUI is
deferred — see §9).

**Milestone alignment:** `project-context.md` frames v3.0 as "iOS app (GPS tracking)."
This document scopes the **base port only** — the GPS/offline capabilities are a later
sub-phase (see §8 Non-Goals).

---

## 2. Scope — Core Logging Release

Decided with John: the first iOS release targets the **minimum viable logging loop**, not
full web parity.

**In scope (the endpoint surface iOS needs):**
- Authentication (obtain + use a token)
- List trips
- Create a trip
- Edit a trip
- Delete a trip
- View the report / totals (and PDF download)

**Deferred to web-only for now (fast-follows):**
- Student management (add student) — stays a parent-on-web action
- Settings / password reset

### 2.1 Key scoping decision: which *role* does iOS serve?

This is the sharpest architectural consequence of "core logging only," and it must be
decided before endpoints are designed.

The web app scopes every trip query to a student via the **`selected_student_id` httpOnly
cookie** (`resolveSelectedStudentId(parentId)` in `src/app/(app)/actions.ts`). **This cookie
pattern does not survive a stateless API** — a native client has no such cookie, and a
parent account is not itself a student.

Two ways to resolve which student a trip belongs to over the API:

| Option | Fit for core-logging |
|---|---|
| **A. iOS serves the student (driver) role.** Jimmy logs in as his own student account; `studentId = his own user id`. No student selection, no student list, no cookie translation. | ✅ Matches the actual use case (Jimmy tracks his own hours). Simplest possible API. **Recommended for v1.** |
| **B. iOS also supports the parent role.** Parent logs in, must pass an explicit `studentId` on every trip request, and needs a read-only `GET /students` to pick from. | Pulls student-read back into "core" scope and adds a selector UI. Defer to a fast-follow. |

**Decided (Option A):** iOS v1 = the **student (Jimmy) logs in as his own account**;
parent-on-iOS is **future scope**. The trip's student context is simply the authenticated
user's own id — no student selection, no student list, no cookie translation in v1.

The API is nonetheless built to **always require an explicit student context**, so parent
support stays a clean additive fast-follow: expose `GET /api/v1/students` and let the client
pass an explicit `studentId`. Nothing in v1 blocks that later.

---

## 3. Architecture Spine

Four components, in dependency order. The **service layer is the foundation** — everything
else is thin on top of it.

```
                 ┌─────────────────────────────┐
   iOS client ──▶│  REST API  /api/v1/*         │──┐
   (Bearer JWT)  └─────────────────────────────┘  │
                 ┌─────────────────────────────┐  ▼
   Web app    ──▶│  Server Actions (unchanged   │ ┌──────────────────────┐
   (session)     │  signatures, now thin)      │▶│  Service layer        │
                 └─────────────────────────────┘ │  src/services/*       │
   Web reads  ──────────────────────────────────▶│  (business logic,     │
   (RSC, direct DB)                               │   validation, Drizzle)│
                                                  └──────────────────────┘
                                                            │
                                                            ▼
                                                      Drizzle / Turso
```

**Principle:** business logic lives **once** in `src/services/*`. Both the web (Server
Actions) and iOS (REST handlers) surfaces are thin adapters over it. No logic duplication,
no drift. This is Option 1 ("parallel REST") done right, chosen over tRPC because John may
build the iOS client in SwiftUI — and SwiftUI cannot consume tRPC without a REST shim.

---

## 4. Service Layer (the foundational work)

Extract the business logic currently inside Server Actions into plain, transport-agnostic
functions. This is ~80% of the effort and is shared by both surfaces.

**New files:**
- `src/services/trips.ts` — `listTrips`, `createTrip`, `updateTrip`, `deleteTrip`
- `src/services/auth.ts` — `verifyCredentials` (the bcrypt check currently in `authorize()`)
- `src/services/report.ts` — totals aggregation (extract from `dashboard/page.tsx` /
  report page) if not already isolable

**Contract for every service function:**
- Takes plain arguments + an explicit **caller context** `{ userId, userType, parentId }`
  and an explicit **`studentId`** where relevant — never `FormData`, cookies, or `redirect()`.
- Performs validation and the ownership check (`eq(trips.studentId, studentId)`) internally —
  this is the security boundary, so it must live in the service, not the caller.
- Returns typed data or throws a typed error (e.g. `ValidationError`, `NotFoundError`,
  `ForbiddenError`). Callers translate errors to their transport (action state vs HTTP status).

**Refactor existing Server Actions into thin wrappers** that: parse `FormData` → resolve
session via `auth()` → resolve `studentId` from the cookie (`resolveSelectedStudentId`) →
call the service → map result to action state / `revalidatePath`. **Web behavior is
unchanged** — validated by the existing test suite (§10).

Source actions to drain into services:
- `src/app/(app)/trips/new/actions.ts` — `createTripAction`
- `src/app/(app)/trips/actions.ts` — `updateTripAction`, `deleteTripAction`
- `src/app/(auth)/login/actions.ts` + `src/auth.ts` `authorize()` — credential verification

Validation rules to preserve (from `docs/api-contracts.md`): `tripDate` required & not
future; `locationType`/`weather` must be valid enum values; `daytimeMinutes`/`nighttimeMinutes`
0–600 with at least one > 0; `notes` optional ≤ 500 chars.

---

## 5. Authentication — expose the JWT the app already issues

**Key finding:** the app **already mints JWTs.** Auth.js v5 with no DB adapter uses the JWT
session strategy by default (`src/auth.ts`): `authorize()` already does the bcrypt check and
the `jwt`/`session` callbacks already carry `id`, `userType`, `parentId`. Today that JWT
lives in an httpOnly **cookie** for the browser.

The iOS work is therefore **not "add JWT auth"** — it is "issue that same identity as a
**Bearer token** a native client can hold in the Keychain, and accept it on `/api/v1`."

**Design:**
- **`POST /api/v1/auth/token`** — accepts `{ email, password }`, calls
  `verifyCredentials()` (the extracted service), and returns a **signed JWT** whose claims
  mirror the session shape: `{ sub: userId, userType, parentId }`.
- **Signing:** use `jose` with a symmetric secret. Recommend a **dedicated API-token secret**
  (e.g. `API_JWT_SECRET`) rather than reusing Auth.js's encrypted cookie token — the Auth.js
  JWE cookie is not designed for third-party/native Bearer use, and a clean HS256 token is
  simpler for a Swift or RN client to carry. `jose` is already an Auth.js transitive
  dependency, so this adds no new top-level stack dependency of consequence — confirm at build.
- **Verification helper** — `src/lib/api-auth.ts` `requireApiUser(request) → { userId, userType, parentId }`,
  used by every `/api/v1` handler. Reads the `Authorization: Bearer <jwt>` header, verifies
  signature + expiry, returns the caller context or throws → `401`.
- **Token lifetime:** short-lived access token (mirror the web's 8h `maxAge` to start).
  A refresh-token flow is a **fast-follow, not v1** — for a personal app, re-login on expiry
  is acceptable. Flag `refresh` as deferred.

**Security notes:** reuse bcrypt (12 rounds) via the service — never re-implement. Never log
tokens or password hashes (existing guardrail). Rate-limit `POST /auth/token` (Vercel
firewall or a simple in-memory/Turso counter) as a fast-follow.

---

## 6. REST API — `/api/v1`

Versioned route handlers under `src/app/api/v1/**`. Each handler is thin: `requireApiUser()`
→ resolve `studentId` (v1: the caller's own id for student accounts) → call service → return
JSON (or map thrown typed errors to HTTP status).

**Core-logging endpoints:**

| Method & path | Service call | Notes |
|---|---|---|
| `POST /api/v1/auth/token` | `verifyCredentials` | Returns `{ token }`. No auth required. |
| `GET  /api/v1/trips` | `listTrips` | Trips for the resolved student, newest first. |
| `POST /api/v1/trips` | `createTrip` | JSON body (not FormData). Returns created trip. |
| `PATCH /api/v1/trips/:id` | `updateTrip` | Ownership enforced in service. |
| `DELETE /api/v1/trips/:id` | `deleteTrip` | Ownership enforced in service. |
| `GET  /api/v1/report` | `report` totals | Totals + progress vs IL requirements (3000/600 min). |
| `GET  /api/v1/report/pdf` | reuse existing | Already an API route (`src/app/api/report/pdf/route.tsx`) — adapt to accept Bearer auth + explicit studentId. |

**Conventions:**
- JSON request/response (not `FormData`). Errors: `{ error: { code, message, fields? } }`.
- HTTP status mapping: `ValidationError → 400`, missing/expired token → `401`,
  ownership/`ForbiddenError → 403`, `NotFoundError → 404`.
- **Next.js 16:** `params` is async — `const { id } = await params` in every handler.
  Before writing handlers, check `node_modules/next/dist/docs/` for the current route-handler
  signature (per project guardrail — do not code Next.js from memory).
- The existing PDF route returns `400` when a parent has no student selected; under the API
  it instead reads the explicit/resolved `studentId`.

---

## 7. CORS

Currently a non-issue (same-origin). A separate iOS client needs explicit CORS on `/api/v1`.

- Native apps (Swift URLSession, RN fetch) are **not** browsers and do not enforce CORS —
  so for a pure native client CORS is technically moot. **But** configure it anyway to (a)
  support a future web/PWA client hitting the same API and (b) keep the browser attack surface
  explicit and locked down.
- Add an allow-list (dev origin + any future web origin), allowed methods, and the
  `Authorization` header, via a shared wrapper or `middleware.ts`. Do **not** use `*` with
  credentials. Lock origins tightly.
- Reminder: `middleware.ts` must keep `export const runtime = 'nodejs'` (existing guardrail).

---

## 8. Non-Goals (explicitly deferred)

Keeping these out is what makes this a shippable increment rather than a rewrite:

- **GPS / active trip tracking**, location entitlements, route geometry schema — the v3.0
  "advanced features." No schema changes in this phase.
- **Offline-first / on-device SQLite / sync layer.**
- **Refresh tokens**, rate-limiting hardening — fast-follows after the loop works.
- **Parent-role logging on iOS** and **student management on iOS** — web-only for v1 (§2.1).
- **The iOS client codebase itself** — separate effort (§9).
- **Rewriting web reads to use the API** — Server Components keep querying the DB directly.
  No client-side state management is introduced (existing guardrail).

---

## 9. iOS Client (separate, later)

The API is client-agnostic. Expo/React Native (stay in TypeScript, share types) vs SwiftUI
(native, App Store-first) is deferred — and the plain-REST choice keeps **both** doors open.
Decide when the API is live and testable.

---

## 10. Migration Sequence & Verification

**Sequence (each step keeps the web app green):**
1. Extract services (`src/services/*`), refactor Server Actions to call them. **No new
   surface yet.** Run full suite → proves no web regression.
2. Add JWT issuance + `requireApiUser` helper + `POST /api/v1/auth/token`.
3. Add `/api/v1/trips` + `/api/v1/report` handlers over the services.
4. Adapt the PDF route for Bearer auth + explicit studentId.
5. Add CORS.
6. (Later) build the iOS client.

**Verification:**
- **Web regression (the safety net):** existing Vitest (`npm test -- --run`) and Playwright
  (`npm run build && npm run test:e2e`) must pass unchanged after step 1. This is the whole
  reason to route web through the same services.
- **Service unit tests:** test `src/services/*` directly — validation rules, and critically
  the **ownership isolation** (a caller cannot read/mutate another student's trips).
- **API integration tests:** token required; missing/expired/tampered token → `401`; a token
  for student A cannot touch student B's trips → `403/404`; full CRUD round-trip; CORS
  preflight from an allowed origin succeeds and a disallowed origin is rejected.
- **Manual:** `npm run dev` → `POST /api/v1/auth/token` with Jimmy's student credentials →
  exercise trip CRUD + report with `Authorization: Bearer <token>` via curl/Postman.

---

## 11. Decisions Log

| # | Decision | Rationale |
|---|---|---|
| D1 | Plain REST over tRPC | Keeps SwiftUI option open; tRPC is TS-client-only. |
| D2 | Shared service layer (`src/services/*`) | Single source of business logic; no web/iOS drift. |
| D3 | Web app untouched in behavior; Server Actions become thin wrappers | Lowest risk; existing test suite guards it. |
| D4 | Reuse existing Auth.js JWT identity, expose as Bearer via `/api/v1/auth/token` | App already mints JWTs; don't rebuild auth. |
| D5 | Dedicated `jose` HS256 API token, not the Auth.js JWE cookie | Cleaner for native clients; JWE cookie isn't built for Bearer. |
| D6 | Explicit `studentId` context in the API; v1 iOS uses the student-account path | Cookie-based student selection can't survive a stateless API. |
| D7 | Core-logging scope; student mgmt/settings deferred to web | Smaller surface, faster to ship. |
| D8 | iOS v1 = student (Jimmy) logs in as own account; **parent-on-iOS is future scope** | Matches the real use case; parent support is a clean additive fast-follow (`GET /api/v1/students`). |
