# Development Guide

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | See `.nvmrc` | Use `nvm use` to activate |
| npm | Bundled with Node | Package manager |
| Git | Any | |

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd student-driver-log

# 2. Use correct Node version
nvm use

# 3. Install dependencies
npm install

# 4. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local — see Environment Variables section below
```

## Environment Variables

Required in `.env.local` (gitignored — never commit this file):

| Variable | Purpose | Local value |
|---|---|---|
| `DATABASE_URL` | libSQL connection URL | `file:local.db` |
| `DATABASE_AUTH_TOKEN` | Turso auth token | Leave blank for local file |
| `AUTH_SECRET` | Auth.js signing secret | Any random string (e.g. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics GA4 ID | Optional — omit to disable |

Example `.env.local` for local development:

```
DATABASE_URL=file:local.db
AUTH_SECRET=any-random-secret-string
```

## Database

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations to local.db
npm run db:migrate
```

The Drizzle schema at [src/db/schema.ts](../src/db/schema.ts) is the source of truth. Never hand-write SQL migrations.

The local database file is `local.db` at the project root (gitignored).

## Running the Dev Server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

- `/ ` redirects to `/login` (if unauthenticated) or `/dashboard` (if authenticated)
- First run: register a parent account at `/register`, then add a student from the dashboard

## Building

```bash
npm run build  # production build
npm start      # serve the production build locally
```

## Testing

**Unit tests (Vitest)**:
```bash
npm test
```
Not yet configured — see issue #10.

**E2E tests (Playwright)**:
```bash
npm run test:e2e
```
Not yet configured — see issue #11.

## Linting

```bash
npm run lint
```

ESLint with `eslint-config-next`. Fix issues before opening a PR.

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

This copies the component into `src/components/ui/`. Do not install other UI libraries (MUI, Mantine, Chakra, etc.).

## Code Conventions

| Convention | Rule |
|---|---|
| Modules | ES modules, async/await, no callbacks |
| Server Components | Default for all pages — add `'use client'` only when needed |
| Mutations | Server Actions (`'use server'`) — not API routes, except PDF |
| File colocation | Route handlers, components, and action files live in the same directory |
| Secrets | Never hardcode — all config via `.env.local` |
| Passwords | Always bcrypt-hashed (`bcrypt.hash(password, 12)`) |
| Barrel files | Forbidden — no `index.ts` re-exports |
| State management | React state + useActionState + Server Components only — no Redux/Zustand |
| New UI components | shadcn/ui only |

## Next.js 15 Gotchas

- `params` and `searchParams` props in pages are **async** — always `const { id } = await params`
- Caching defaults changed — no implicit fetch caching; use `cache: 'force-cache'` explicitly if needed
- Before writing any new route handler, page, or layout, check `node_modules/next/dist/docs/` for the current pattern

## Git Workflow

| Aspect | Convention |
|---|---|
| Branch naming | `feat/<issue-number>-short-description` |
| Commit messages | Conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:` |
| PRs | One PR per issue; squash merge |
| Starting work | Read the issue body; ask clarifying questions if anything is ambiguous |
| Finishing work | Run tests, commit, push, open PR that closes the issue |

## Project-Specific Guardrails

- Do **not** add dependencies outside the approved stack without justification
- Do **not** build v1.0 features (Google OAuth) or v1.5 features (iOS app, GPS) unless explicitly asked
- Do **not** touch `.env.local` or commit secrets
- Do **not** add abstraction layers "for future flexibility" (YAGNI)
