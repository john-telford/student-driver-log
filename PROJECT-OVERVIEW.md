# Student Driver Log — Project Overview

## Purpose

A web application for tracking Illinois learner's permit behind-the-wheel practice hours. Illinois requires student drivers to log **50 total hours** (including **10 hours at night**) before qualifying for a full license. This app replaces the paper SOS DSD X 152.4 log sheet with a structured digital tracker that generates a printable report in the same format.

Personal project — John Telford tracking hours for his son Jimmy.

---

## Actors

### Parent
- Self-registers with email + password
- Creates and manages student accounts (sets student email + password)
- Can manage **multiple students** (e.g., different children)
- Selects the active student via a nav dropdown; all views (dashboard, trips, report) filter to that student
- Can log, edit, and delete trips on behalf of any of their students

### Student
- Account created by their parent — cannot self-register
- Logs in with email + password set by parent
- Can log, edit, and delete their own trips
- Sees their own dashboard, trip list, and report only — no access to other students' data

### Interactions
```
Parent ──creates──► Student account
Parent ──selects──► active Student (cookie-persisted)
Parent ──logs──────► Trip (for selected Student)
Student ──logs─────► Trip (for themselves)
Parent/Student ──view──► Dashboard (totals + progress)
Parent/Student ──view──► Trips list (CRUD)
Parent/Student ──view──► Report (printable SOS format)
```

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Server Components by default |
| Database | libSQL / SQLite (local file) → Turso (prod) | Serverless-compatible SQLite |
| ORM | Drizzle ORM | Schema-first, type-safe, migrations |
| Auth | Auth.js v5 — credentials provider | JWT sessions; bcrypt password hashing |
| UI | shadcn/ui components on Tailwind CSS v4 | Components copied into repo, not a runtime dep |
| PDF | @react-pdf/renderer | Server-side PDF generation |
| Testing | Vitest (unit) + Playwright (e2e) | |
| CI | GitHub Actions | |
| Hosting | Vercel | |

---

## Architecture

### Next.js App Router pattern
All pages are **React Server Components** by default — they fetch data directly on the server and render HTML. Client Components (`'use client'`) are used only where browser interactivity is needed (form state, dropdowns, dialogs).

Mutations use **Server Actions** — TypeScript functions marked `'use server'` that run on the server and are called directly from forms or client components. No REST API layer needed.

### Route structure
```
/                         → redirect to /login or /dashboard
/login                    → credentials login form
/register                 → parent self-registration form

/(app)/                   → protected layout (auth required)
  /dashboard              → totals + progress bars + recent trips
  /trips                  → paginated trip list with edit/delete
  /trips/new              → trip entry form
  /trips/[id]/edit        → pre-populated edit form
  /report                 → printable Illinois SOS format table
  /students/new           → parent-only: add student account
```

### Data model
```
users
  id            integer PK
  email         text UNIQUE
  password_hash text
  name          text
  user_type     enum(parent, student)
  parent_id     FK → users.id (null for parents)
  created_at    timestamp

trips
  id                  integer PK
  student_id          FK → users.id
  created_by          FK → users.id
  trip_date           text (YYYY-MM-DD)
  location_type       enum(highway, residential, rural, urban, parking_lot, race_track)
  weather             enum(clear, rain, snow, fog, ice)
  daytime_minutes     integer
  nighttime_minutes   integer
  notes               text (optional, max 500 chars)
  created_at          timestamp
```

### Selected-student cookie
Parents with multiple students use a `selected_student_id` httpOnly cookie (30-day TTL) to track which student's data is in view. All server components and actions read this cookie to scope queries. If no cookie is set (e.g., first visit on a new device), the system falls back to the parent's first student automatically.

### Auth flow
Auth.js v5 issues a JWT session on login. The session carries `id`, `name`, `email`, `userType`, and `parentId`. Server components call `auth()` to get the session; server actions do the same before any mutation.

---

## Feature Status

| # | Feature | Status |
|---|---|---|
| 1 | Drizzle schema + migrations + libSQL connection | Done |
| 2 | Auth.js credentials provider (register + login) | Done |
| 3 | shadcn/ui base components | Done |
| 4 | Protected app layout + nav + logout | Done |
| 5 | Trip entry form (`/trips/new`) | Done |
| 6 | Trips list with edit and delete | Done |
| 7 | Dashboard totals + 50h/10h progress bars | Done |
| 8 | Printable report at `/report` (Illinois SOS format) | In review |
| 9 | PDF export via react-pdf | Open |
| 10 | Vitest unit test | Open |
| 11 | Playwright e2e test | Open |
| 12 | GitHub Actions CI | Open |
| 13 | Turso + Vercel production deploy | Open |
| 19 | Multiple parents per student (future) | Backlog |

---

## UI Theme

Highway sign aesthetic — Pantone 342 Interstate green (`oklch(0.44 0.16 148)`), highway yellow accent, Overpass font (open-source Highway Gothic clone), Illinois state route shield on the login screen.

---

## Future Scope (not in MVP)

- **v1.0** — Google OAuth (replace email/password)
- **v1.5** — iOS app with GPS-based automatic trip start/stop tracking
- **Future** — Multiple parents per student (e.g., two-parent households)
