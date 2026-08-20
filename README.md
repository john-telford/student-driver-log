# Student Driver Log

A web app for logging behind-the-wheel practice hours toward an **Illinois learner's permit**,
and exporting a printable report in the format the Illinois Secretary of State expects.

Illinois requires **50 hours** of supervised driving (**10 of them at night**) before a
teen can take the road test. This app tracks those hours, shows progress toward both goals,
and generates the SOS-format PDF to submit.

> Personal project — built to track my son's permit hours. Live at
> **[studentdriver.site](https://www.studentdriver.site)**.

## Features

- **Parent and student accounts.** Parents self-register and create student accounts from
  their dashboard; a parent can manage multiple students. Both can log, edit, and delete trips.
- **Trip logging.** Date, location type, weather, and daytime/nighttime minutes per session,
  with server-side validation.
- **Progress dashboard.** Running day / night / grand totals with progress bars toward the
  50-hour and 10-hour-night requirements.
- **Illinois SOS report.** Printable HTML view plus a one-click **PDF export** matching the
  SOS DSD X 152.4 column format.
- **Password reset** via emailed link (Resend).
- **REST API** (`/api/v1`) with Bearer-token auth, powering a native iOS client (separate repo).

## Stack

- **Next.js 16** (App Router) + **React 19** + TypeScript
- **Drizzle ORM** on **libSQL** — a local file in dev, **Turso** in production
- **Auth.js (NextAuth v5)** — credentials provider, bcrypt-hashed passwords; a dedicated
  HS256 JWT (`jose`) secures the REST API
- **Tailwind CSS** + **shadcn/ui** components
- **@react-pdf/renderer** for the report export
- **Resend** for transactional email
- **Vitest** (unit) + **Playwright** (e2e), run in **GitHub Actions**
- Deployed on **Vercel**

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run db:migrate                  # applies Drizzle migrations to a local SQLite file
npm run dev                         # http://localhost:3000
```

### Environment variables

Set these in `.env.local` (all config is env-based; nothing is committed):

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Auth.js session/cookie signing secret |
| `API_JWT_SECRET` | Dedicated secret for `/api/v1` Bearer tokens (separate from `AUTH_SECRET`) |
| `DATABASE_URL` | libSQL URL — defaults to `file:local.db`; set the Turso URL in prod |
| `DATABASE_AUTH_TOKEN` | Turso auth token (prod only) |
| `RESEND_API_KEY` / `RESEND_FROM` | Password-reset email delivery |
| `NEXT_PUBLIC_APP_URL` | Canonical base URL, used in emails and links |
| `API_ALLOWED_ORIGINS` | CORS allowlist for the REST API |

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run db:generate` | Generate a Drizzle migration from the schema |
| `npm run db:migrate` | Apply migrations |

## Architecture notes

- **Server Components by default**; Client Components only where interactivity requires them.
- **Mutations are Server Actions**, not API routes — the one exception is PDF download and the
  `/api/v1` surface for the iOS client.
- **The Drizzle schema (`src/db/schema.ts`) is the source of truth.** Migrations are generated
  from it; SQL is never hand-written.
- **Trip business logic lives in `src/services/`** and is shared verbatim by the web
  (Server Actions) and the REST API — every function takes an explicit `studentId` and
  enforces ownership itself, so that `where studentId` clause *is* the security boundary.
- The REST API mirrors the Auth.js identity with a standalone HS256 token so native clients
  never touch the session cookie.

## REST API

`/api/v1` is a small Bearer-authenticated surface for the native iOS client. Exchange
credentials for a token at `POST /api/v1/auth/token`, then send `Authorization: Bearer <jwt>`.
Endpoints cover trips (list/create/update/delete), the progress report, and PDF export. The
full contract lives with the route handlers in [src/app/api/v1/](src/app/api/v1/).

> **iOS clients must use the `www` host.** The apex domain 301-redirects to `www` and the
> redirect strips the `Authorization` header.

## Data model

**users** — `id, email, password_hash, name, user_type (parent|student), parent_id, created_at`
**trips** — `id, student_id, created_by, trip_date, location_type, weather, daytime_minutes, nighttime_minutes, notes, created_at`

- `location_type`: `highway`, `residential`, `rural`, `urban`, `parking_lot`, `race_track`
- `weather`: `clear`, `rain`, `snow`, `fog`, `ice`
- Minutes are stored as integers (0–600 per field), displayed as `H:MM`.

See [SPEC.md](SPEC.md) for the full requirements and validation rules.
