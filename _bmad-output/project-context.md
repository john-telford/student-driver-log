# Project Context: student-driver-log

> LLM-optimized implementation guide. Read this before writing any code.
> Generated: 2026-04-27

---

## Project Overview

Illinois learner's permit hour tracker. Parents register, create student accounts, log driving sessions, and generate a printable/PDF report matching Illinois SOS Form DSD X 152.4. Personal project shared publicly (free, non-commercial).

**Milestones:**
- `main` = MVP shipped (auth, trips CRUD, dashboard, report, PDF, CI)
- `v1.1` = Legal pages, password reset, error pages, PWA polish, social meta
- `v2.0` = Multi-state expansion (50 states + DC)
- `v3.0` = iOS app (GPS tracking)

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.3 |
| Runtime | React | 19.2.4 |
| Language | TypeScript (strict) | ^5 |
| Database (local) | libSQL / SQLite file | @libsql/client ^0.17.2 |
| Database (prod) | Turso | libsql:// protocol |
| ORM | Drizzle ORM | ^0.45.2 |
| Auth | Auth.js v5 | next-auth ^5.0.0-beta.30 |
| UI | shadcn/ui on Tailwind CSS | v4 |
| PDF | @react-pdf/renderer | ^4.4.1 |
| Unit tests | Vitest | ^4.1.4 |
| E2E tests | Playwright | ^1.59.1 |
| Hosting | Vercel | — |
| esbuild | Pinned devDep | ^0.28.0 |

**Path alias:** `@/` → `src/` (set in `tsconfig.json` paths)

---

## Critical Implementation Rules

### Next.js 16 / App Router

- **`params` and `searchParams` are async** — always `const { id } = await params` in pages and route handlers. Never destructure synchronously.
- **Server Components by default** — only add `'use client'` when browser APIs, hooks, or interactivity are needed.
- **Mutations use Server Actions** (`'use server'`) — not API routes, except for PDF download which requires a streaming response.
- **Before writing any route handler, page, layout, or middleware**, check `node_modules/next/dist/docs/` for the current pattern. Do not rely on Next.js 13/14 knowledge.
- **Caching changed** — no implicit fetch caching in Next.js 15+. Use `cache: 'force-cache'` explicitly if needed.
- **`middleware.ts` must export `runtime = 'nodejs'`** — auth.ts imports @libsql/client which uses `file:` URLs incompatible with the edge runtime's Web API libSQL client. The export is already in the file; do not remove it.
- **Router cache** — after server action redirects, the client may serve a cached layout. Use `revalidatePath()` in mutations that change data visible in layouts (e.g. adding a student), or document that tests must `page.reload()` to bypass.

### Auth (Auth.js v5)

- Access session in Server Components: `const session = await auth()`
- Access session in Server Actions: `const session = await auth()` — same pattern
- Session fields: `session.user.id` (string), `session.user.userType` ('parent'|'student'), `session.user.parentId` (number|null)
- `AUTH_TRUST_HOST=1` required for any non-localhost:3000 deployment (e2e tests on port 3001, Vercel previews, etc.)
- `AUTH_URL` must be set to the canonical URL in non-standard port environments
- Session `maxAge` = 8 hours

### Database (Drizzle + libSQL)

- **Schema is the source of truth** — never hand-write SQL migrations. Always `npm run db:generate` then `npm run db:migrate`.
- `DATABASE_URL=file:local.db` locally; `libsql://...turso.io/...` in production
- `DATABASE_AUTH_TOKEN` is required for Turso; leave blank/absent for local file
- The DB client is initialized at module load time in `src/db/index.ts` — this means `DATABASE_URL` must be set before `next build` runs (use a placeholder `file:./ci-build.db` in CI build steps)
- All DB queries in Server Components fetch directly — no separate API layer

### Selected-Student Cookie Pattern

- Parents with multiple students use `selected_student_id` httpOnly cookie (30-day TTL, `sameSite: 'lax'`)
- **Always use `resolveSelectedStudentId(parentId)`** from `src/app/(app)/actions.ts` in server components — it validates the cookie against the DB and falls back to the first student
- **Server actions that create/update/delete trips** use a local `resolveStudentId()` helper that reads the cookie directly — if the cookie is absent the action returns an error. This is intentional.
- Setting the cookie requires calling `selectStudentAction(id)` — it is NOT set automatically when a parent falls back to their first student

### Security Patterns

- Passwords: bcrypt 12 rounds, never logged
- All mutations verify ownership before acting: `eq(trips.studentId, resolvedStudentId)` — always include this check when querying or mutating trips
- Student data is always scoped to the parent via `parentId` FK — never query students without `where(eq(users.parentId, parentId))`

---

## Code Organization

```
src/
  app/
    (auth)/         ← public pages: /login, /register
    (app)/          ← protected pages: require auth
      layout.tsx    ← AppLayout: auth guard, fetches students, resolves selected student
      actions.ts    ← selectStudentAction, resolveSelectedStudentId (shared across app)
      dashboard/    ← page.tsx + actions.ts (logoutAction)
      trips/        ← page.tsx, trips-table.tsx, actions.ts, new/, [id]/edit/
      report/       ← page.tsx, print-button.tsx
      students/new/ ← page.tsx, add-student-form.tsx, actions.ts
    api/
      auth/[...nextauth]/ ← Auth.js handlers (GET + POST only)
      report/pdf/         ← PDF download route (only API route in app)
  auth.ts           ← Auth.js config (single source of truth)
  db/
    index.ts        ← Drizzle client (import `db` from here)
    schema.ts       ← Schema + inferred types (import types from here)
  components/ui/    ← shadcn/ui components (add via `npx shadcn@latest add`)
  lib/
    utils.ts        ← cn(), formatHMM()
    utils.test.ts   ← Unit tests live alongside source
```

### Naming Conventions

- Pages: `page.tsx` — always `export default async function XxxPage()`
- Server actions: `actions.ts` co-located with route, `'use server'` at top
- Action state types: `export type XxxState = { errors?: {...} }` in same `actions.ts`
- Client components: named file, `'use client'` first line
- No barrel files / `index.ts` re-exports

---

## UI / Styling Rules

- **shadcn/ui only** for UI components — add with `npx shadcn@latest add <component>`. No MUI, Mantine, Chakra, etc.
- Components are copied into `src/components/ui/` — they are owned code, not a runtime dep
- **No state management libraries** — use React state + `useActionState` + Server Components
- `cn()` utility for all className composition (clsx + tailwind-merge)
- Design tokens in `src/app/globals.css`: `--primary` = Interstate green `oklch(0.44 0.16 148)`, `--accent` = highway yellow `oklch(0.88 0.18 89)`
- Print styles in `globals.css` — `print:hidden` hides non-report elements

---

## Testing Rules

### Unit Tests (Vitest)

- Config: `vitest.config.ts` — **excludes `tests/e2e/**`** (critical: Playwright specs use `test.setTimeout()` which breaks under Vitest)
- Test files: co-located with source at `src/lib/utils.test.ts` pattern
- Run: `npm test` (watch mode locally, run mode in CI via `npm test -- --run`)
- Only test pure utility functions — don't test Next.js internals

### E2E Tests (Playwright)

- Config: `playwright.config.ts` — port **3001** (avoids conflict with dev server on 3000)
- **Requires production build before running**: `npm run build` then `npm run test:e2e`
- In CI: build is a separate step, `process.env.CI` causes playwright to skip the build in webServer command
- Test database: `file:./test.db` — isolated, created by global-setup, deleted by global-teardown
- `AUTH_TRUST_HOST=1` and `AUTH_URL=http://localhost:3001` required in webServer env
- After `addStudentAction` redirect, do `page.reload()` before asserting nav elements — Next.js router cache may serve stale AppLayout

### CI (GitHub Actions)

- Workflow: `.github/workflows/ci.yml`
- Order: `npm ci` → `npm test -- --run` → `npm run build` → `npx playwright install chromium --with-deps` → `npm run test:e2e`
- Build step needs `AUTH_SECRET` and `DATABASE_URL` env vars (use placeholders — they're runtime values but libSQL validates URL format at module load)
- **esbuild must be pinned** at `^0.28.0` in devDependencies — vitest's bundled vite@8 peer-requires it; without the pin, `npm ci` fails on Linux

---

## Development Workflow

- **Branch naming**: `feat/<issue-number>-short-description` or `fix/<issue-number>-description`
- **Commit messages**: conventional commits — `feat:`, `fix:`, `chore:`, `test:`, `docs:`
- **One PR per issue**, squash merge into `main`
- When starting an issue: read the full issue body, ask clarifying questions if ambiguous, then implement
- When finishing: run `npm test -- --run`, commit, push, open PR that closes the issue
- Stacked branches (one built on another) require conflict resolution after merges — use `git merge origin/main` not `git rebase` for squash-merge workflows

---

## Hard Guardrails (Never Do Without Asking)

- Do not add npm dependencies outside the approved stack
- Do not add state management libraries (Redux, Zustand, etc.)
- Do not add UI libraries other than shadcn/ui
- Do not write barrel files / `index.ts` re-exports
- Do not add abstraction layers "for future flexibility" (YAGNI)
- Do not touch `.env.local` or commit secrets
- Do not build v2.0 (multi-state) or v3.0 (iOS) features unless the active issue explicitly targets those milestones
- Do not remove `export const runtime = 'nodejs'` from `middleware.ts`

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Runtime | `file:local.db` locally; `libsql://...` prod; `file:./test.db` for e2e; `file:./ci-build.db` for CI build |
| `DATABASE_AUTH_TOKEN` | Prod only | Turso auth token; omit locally |
| `AUTH_SECRET` | Runtime | Any random string locally; secure secret in prod |
| `AUTH_URL` | Non-3000 ports | Set to canonical URL (e.g. `http://localhost:3001` for e2e) |
| `AUTH_TRUST_HOST` | Non-3000 ports | Set to `1` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional | GA4 ID; omit to disable analytics |

---

## Open Work (as of 2026-04-27)

Run `gh issue list --milestone v1.1` for the current v1.1 queue.

Key upcoming work:
- `#48` Forgot password (requires email service — recommend Resend)
- `#46` Privacy policy, `#47` Terms of use
- `#49` 404/500 error pages
- `#54` Open Graph meta tags
- See `gh issue list` for full list
