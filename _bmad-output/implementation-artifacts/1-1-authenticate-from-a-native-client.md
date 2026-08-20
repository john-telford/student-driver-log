# Story 1.1: Authenticate from a native client

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the student driver,
I want to exchange my email and password for a token on my phone,
so that I can make authenticated requests from a native app.

This is the **foundation story** for Epic 1. It front-loads the shared plumbing every later
story depends on: the auth service extraction, Bearer-token issuance, the `requireApiUser`
verification helper, the typed-error set, and the CORS policy for `/api/v1`. Stories 1.2–1.5
are thin trip endpoints built on this.

## Acceptance Criteria

1. **Token issuance (happy path).** `POST /api/v1/auth/token` with a valid `{ email, password }`
   JSON body returns `200` with `{ token }`, a signed JWT whose claims are
   `{ sub: <userId as string>, userType, parentId }` and whose expiry is 8 hours from issuance.
2. **Token issuance (bad credentials).** `POST /api/v1/auth/token` with an unknown email or wrong
   password returns `401` with `{ error: { code, message } }` and no token. The password hash is
   never logged (NFR4).
3. **`requireApiUser` accepts valid Bearer tokens.** Given a token minted by the endpoint, calling
   `requireApiUser(request)` on a request carrying `Authorization: Bearer <token>` returns
   `{ userId, userType, parentId }` (userId as a number).
4. **`requireApiUser` rejects bad tokens.** A missing header, a non-`Bearer` scheme, a malformed
   token, a token with a bad signature, or an expired token each cause `requireApiUser` to throw an
   `UnauthorizedError`, which a route maps to `401` (NFR5).
5. **Web login regression.** After `authorize()` is refactored onto the new
   `verifyCredentials` service, the existing Vitest + Playwright suites pass unchanged (NFR3).
   Web login/register/logout behavior is byte-for-byte the same.
6. **CORS locked down.** A cross-origin browser preflight (`OPTIONS`) to `/api/v1/auth/token` from
   an **allow-listed** origin succeeds with the correct `Access-Control-Allow-*` headers; from a
   **non-allow-listed** origin, the response does not grant access. No wildcard `*` is ever paired
   with `Access-Control-Allow-Credentials` (NFR6).
7. **Middleware does not gate `/api/v1`.** A request to `/api/v1/auth/token` with **no session
   cookie** is **not** redirected to `/login` — the auth middleware no longer intercepts `/api/v1/*`.
   (Without this, every Bearer request would be bounced to the web login page.)
8. **Config.** A new `API_JWT_SECRET` env var is required; `requireApiUser` and the token endpoint
   fail loudly (throw at call time, not silently) if it is unset. `jose` is promoted to an explicit
   dependency in `package.json`.

## Tasks / Subtasks

- [x] **Task 1: Extract the credential check into a service (AC: 1, 2, 5)**
  - [x] Create `src/services/auth.ts` exporting `verifyCredentials({ email, password }): Promise<AuthUser | null>`, where `AuthUser = { id: number; name: string; email: string; userType: UserType; parentId: number | null }`.
  - [x] Move the exact logic from `authorize()` in `src/auth.ts` (lines ~30–52): look up user by email, `bcrypt.compare`, return the user shape or `null`. **Do not change the algorithm or bcrypt rounds** — reuse `bcryptjs` (NFR4).
  - [x] Refactor `src/auth.ts` `authorize()` to call `verifyCredentials` and adapt the result to Auth.js's expected return (`id: String(user.id)`, plus the same fields). The returned shape to Auth.js must be identical to today's so the web session is unchanged (AC 5).
  - [x] Keep `verifyCredentials` transport-agnostic: plain args in, typed data out, **no** `FormData`, cookies, `redirect()`, or logging of secrets (architecture §4 service contract).

- [x] **Task 2: Typed error set for the API (AC: 4)**
  - [x] Create `src/services/errors.ts` with `UnauthorizedError`, `ValidationError`, `NotFoundError`, `ForbiddenError` (each `extends Error`, sets `name`, optional `fields?` on `ValidationError`). Story 1.1 only throws `UnauthorizedError`; the others are the foundation stories 1.2–1.5 map to `400/404/403`.
  - [x] Keep it minimal — plain classes, no framework, no factory. (YAGNI: don't add codes/registries not needed yet.)

- [x] **Task 3: JWT issuance + verification helpers (AC: 1, 3, 4, 8)**
  - [x] Promote `jose` to an explicit dependency: `npm install jose` (now `^6.2.8` in package.json).
  - [x] Create `src/lib/api-auth.ts`: `getApiSecret()` (throws if `API_JWT_SECRET` unset), `issueApiToken(user)` (HS256, `sub`/`userType`/`parentId`, 8h), `requireApiUser(request)` (Bearer parse + `jwtVerify` → `{ userId, userType, parentId }`, throws `UnauthorizedError` on any failure). Never logs the token.
  - [x] Add `API_JWT_SECRET` to `.env.local` (gitignored) and to `.env.local.example`. Vercel needs the same var set for prod (see Completion Notes).

- [x] **Task 4: CORS helper for `/api/v1` (AC: 6)**
  - [x] Create `src/lib/cors.ts`: allow-list from `API_ALLOWED_ORIGINS` (default `http://localhost:3000`); `corsHeaders` echoes a specific allow-listed origin (never `*` with credentials); `withCors` and `preflight` helpers.
  - [x] CORS applied at the route layer, not `middleware.ts`.

- [x] **Task 5: The token route handler (AC: 1, 2, 6)**
  - [x] Create `src/app/api/v1/auth/token/route.ts` with `POST` and `OPTIONS`; JSON body → `verifyCredentials` → `issueApiToken`; `401` on bad creds, `400` on invalid JSON; CORS headers on every response.
  - [x] Follows the Next.js 16 route-handler convention (verified against the local Next docs).

- [x] **Task 6: Exclude `/api/v1` from auth middleware (AC: 7)**
  - [x] Added `api/v1` to the `matcher` negative-lookahead; verified live that `/api/v1/auth/token` with no cookie returns `401` JSON, not a `/login` redirect. Kept `runtime = 'nodejs'`.

- [x] **Task 7: Tests (AC: 1–7)**
  - [x] `src/services/auth.test.ts` (4 tests), `src/lib/api-auth.test.ts` (7 tests), `src/app/api/v1/auth/token/route.test.ts` (6 tests).
  - [x] Full suite green (24 tests) + `npm run build` succeeds; live smoke test of the endpoint + CORS + middleware exclusion.

## Dev Notes

### Current state of files being modified (READ THESE before coding)

- **`src/auth.ts`** — Auth.js v5, JWT session strategy (no DB adapter), `session.maxAge = 8h`.
  `authorize(credentials)` does: email lookup via Drizzle → `bcrypt.compare` → returns
  `{ id: String(user.id), name, email, userType, parentId }` or `null`. The `jwt`/`session`
  callbacks propagate `id`, `userType`, `parentId`. **This is the identity shape the API token
  must mirror** (architecture §5). Preserve `authorize()`'s external return shape exactly.
- **`middleware.ts`** — `export { auth as default }`, `runtime = 'nodejs'`, and a `matcher`
  negative-lookahead that currently excludes `api/auth`, `_next/*`, and the public pages **but not
  `api/v1`**. This means `/api/v1/*` is currently caught by the `authorized` callback, which
  redirects unauthenticated requests to `/login`. **Task 6 fixes this** — it is the single most
  likely regression/blocker in this story.
- **`src/app/(auth)/login/actions.ts`** — `loginAction` calls `signIn('credentials', …)`. Unchanged
  by this story, but it exercises `authorize()` → `verifyCredentials`, so its Playwright coverage is
  your regression signal.
- **`src/app/api/report/pdf/route.tsx`** — existing route handler; use it as the **house pattern**
  for route handlers (imports `NextResponse`, returns `new NextResponse(body, { status })`,
  `session = await auth()` guard). The new v1 route uses Bearer auth instead of `auth()`, but the
  response idioms should match.

### Key architectural constraints

- **Service contract** (architecture §4): every service fn takes plain args + explicit caller
  context, does its own validation/ownership, returns typed data or throws a typed error. No
  transport concerns leak in. `verifyCredentials` is the first such service.
- **Auth design** (architecture §5, D4/D5): the app already mints Auth.js JWTs in a cookie; this
  story issues the **same identity** as a standalone HS256 Bearer token via `jose` with a
  **dedicated `API_JWT_SECRET`** — do NOT reuse the Auth.js JWE cookie secret. Claims:
  `{ sub, userType, parentId }`. 8h lifetime to mirror the web `maxAge`. Refresh tokens are
  explicitly deferred (§8) — re-login on expiry is acceptable for v1.
- **CORS** (architecture §7): allow-list only, include the `Authorization` header, never `*`
  with credentials. Native clients don't enforce CORS, but configure it for a future web/PWA client
  and to keep the browser surface locked. Do it at the route layer, not middleware.
- **Ownership/studentId**: not exercised in this story (no trip access yet), but note the API is
  built to always require an explicit student context (D6/D8). For a **student** account, the
  resolved `studentId` will be the caller's own `userId`. Stories 1.2–1.5 consume that.

### Next.js 16 specifics (verified, do not code from memory)

- Route handlers: `export async function POST(request: Request) {}` / `OPTIONS`. Use Web
  `Request`/`Response`; `Response.json(body, { status })`. POST is not cached. `params` (none here)
  would be async. Source: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`.
- `middleware.ts` must keep `runtime = 'nodejs'` because `@/auth` imports `@libsql/client`
  (file: URLs) which is incompatible with the edge runtime (comment already in the file).

### Data / identity shapes

- `users.id` is a numeric PK; Auth.js carries it as a **string** in the session (`String(user.id)`).
  The API token `sub` is a string (JWT convention); `requireApiUser` returns `userId` as a
  **number** (`Number(payload.sub)`) so it lines up with `trips.studentId` (number) in later stories.
- `userType` is `'parent' | 'student'` (`UserType` from `@/db/schema`). `parentId` is
  `number | null`.

### Validation rules (for context; trip validation lands in 1.3, not here)

From `docs/api-contracts.md`: `tripDate` required & not future; `locationType`/`weather` valid enum;
`daytimeMinutes`/`nighttimeMinutes` 0–600 with at least one > 0; `notes` optional ≤ 500. **Not this
story** — listed so you don't accidentally pull trip logic into the auth foundation.

### Scope guardrails (do NOT do in this story)

- No trip endpoints (`GET/POST/PATCH/DELETE /api/v1/trips`) — those are 1.2–1.5.
- No `src/services/trips.ts` or `report.ts` extraction yet.
- No refresh-token flow, no rate-limiting of `/api/v1/auth/token` (fast-follows, §8). Note: the web
  login already has IP rate-limiting via `src/lib/rate-limit.ts`; do not wire it into the API here.
- No new UI. No state-management libs. No barrel/index re-exports (CLAUDE.md guardrails).

### Project Structure Notes

- New files: `src/services/auth.ts`, `src/services/errors.ts`, `src/lib/api-auth.ts`,
  `src/lib/cors.ts`, `src/app/api/v1/auth/token/route.ts`, plus colocated tests
  (`src/services/auth.test.ts`, `src/lib/api-auth.test.ts`, and a token-route test).
- Modified: `src/auth.ts` (authorize → verifyCredentials), `middleware.ts` (matcher), `package.json`
  (jose), `.env.local` / `.env.example` (`API_JWT_SECRET`, optional `API_ALLOWED_ORIGINS`).
- Aligns with architecture §4/§6 (`src/services/*`, `/api/v1/**`). No conflicts detected.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#5-authentication] — Bearer token, jose HS256, `API_JWT_SECRET`, claims, 8h lifetime.
- [Source: _bmad-output/planning-artifacts/architecture.md#4-service-layer] — service contract; `verifyCredentials` extraction.
- [Source: _bmad-output/planning-artifacts/architecture.md#7-cors] — allow-list, Authorization header, no wildcard-with-credentials.
- [Source: _bmad-output/planning-artifacts/architecture.md#10-migration-sequence--verification] — sequence (extract services → issuance + requireApiUser → CORS), verification strategy.
- [Source: _bmad-output/planning-artifacts/epics.md#story-11-authenticate-from-a-native-client] — user story + BDD acceptance criteria.
- [Source: docs/api-contracts.md] — existing endpoint/action inventory and validation rules.
- [Source: src/auth.ts] — current `authorize()` and callbacks (identity shape to mirror).
- [Source: middleware.ts] — matcher to amend for `/api/v1` exclusion.
- [Source: node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md] — Next 16 route-handler convention.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMAD dev-story workflow, autonomous run)

### Debug Log References

- Initial `npm test` failed to resolve the `@/` path alias (existing tests used relative imports). Fixed by adding a `resolve.alias` to `vitest.config.ts` mirroring the tsconfig `@/* → ./src/*` mapping.
- `npm run build` initially failed with `LibsqlError: URL_INVALID: ''` during `/_not-found` page-data collection. Root cause: empty `DATABASE_URL` from the Vercel-created `.env.production.local` when building locally — a pre-existing local-env condition, unrelated to this story (no new module is imported by `/_not-found`). Build succeeds with a valid `DATABASE_URL` in the process env.

### Completion Notes List

- **All 8 ACs satisfied.** 24 unit tests pass; production build succeeds; live smoke test on `npm run dev` confirmed the three behaviors unit tests can't reach: bad creds → `401` JSON (not a `/login` redirect, proving the middleware exclusion, AC7); `OPTIONS` from `http://localhost:3000` → `204` + `Access-Control-Allow-Origin` echo (AC6); `OPTIONS` from a disallowed origin → `204` with no ACAO grant (AC6).
- **Web regression (AC5):** `authorize()` now delegates to `verifyCredentials`; its external return shape to Auth.js is byte-identical. Existing suite unchanged and green.
- **⚠️ Deployment action for John:** `API_JWT_SECRET` must be set in Vercel (Production + Preview) before the API works in prod — generate with `openssl rand -base64 32`, keep it distinct from `AUTH_SECRET`. Optionally set `API_ALLOWED_ORIGINS` for any browser client (defaults to `http://localhost:3000`).
- **Scope held:** no trip endpoints, no services/trips or report extraction, no refresh tokens, no API rate-limiting — all correctly deferred to later stories / fast-follows per architecture §8.
- `jose` promoted from transitive to explicit dependency (`^6.2.8`) per architecture D5.

### File List

**New:**
- `src/services/auth.ts` — `verifyCredentials` service
- `src/services/errors.ts` — typed service errors (`UnauthorizedError` + foundation for 1.2–1.5)
- `src/lib/api-auth.ts` — `issueApiToken`, `requireApiUser`, `getApiSecret`
- `src/lib/cors.ts` — `/api/v1` CORS allow-list helpers
- `src/app/api/v1/auth/token/route.ts` — `POST`/`OPTIONS` token endpoint
- `src/services/auth.test.ts`, `src/lib/api-auth.test.ts`, `src/app/api/v1/auth/token/route.test.ts` — tests

**Modified:**
- `src/auth.ts` — `authorize()` refactored onto `verifyCredentials`
- `middleware.ts` — matcher excludes `api/v1`
- `vitest.config.ts` — `@/` alias resolution
- `package.json` / `package-lock.json` — `jose` explicit dependency
- `.env.local` (gitignored) / `.env.local.example` — `API_JWT_SECRET`, `API_ALLOWED_ORIGINS`

### Change Log

- 2026-08-08 — Implemented story 1.1: auth-service extraction, Bearer-token issuance/verification, CORS, middleware exclusion. Status → review.
- 2026-08-08 — Code review (Approve). Fixed 1 Low finding + added regression test. 25 tests green. Status → done.

## Senior Developer Review (AI)

**Reviewed:** 2026-08-08 · **Outcome:** Approve · **Diff:** 531+/17− across 13 files

Adversarial review (Blind Hunter / Edge Case Hunter / Acceptance Auditor lenses) run inline against the diff and this spec. All 8 acceptance criteria verified — AC6 (CORS) and AC7 (middleware exclusion) confirmed against the live dev server, not just unit tests.

**Action Items:**

- [x] [Low] `POST /api/v1/auth/token` with a JSON body of literal `null` parses successfully but then dereferenced `null.email`, throwing an unhandled `TypeError` → 500 instead of a clean 400. Fixed with a non-object-body guard in `src/app/api/v1/auth/token/route.ts`; regression test added (non-object JSON body → 400).

**Confirmed clean:** no wildcard-with-credentials CORS (NFR6); no password/token logging (NFR4); `requireApiUser` rejects missing/wrong-scheme/malformed/bad-signature/expired tokens (AC4); `API_JWT_SECRET` misconfiguration surfaces as 500, not swallowed as 401; `authorize()` external shape byte-identical → web login unchanged (AC5).
