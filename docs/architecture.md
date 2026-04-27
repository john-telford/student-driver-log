# Architecture

## Executive Summary

Student Driver Log is a **Next.js 15 App Router monolith** deployed on Vercel. It uses React Server Components for data fetching and rendering, Server Actions for all mutations, and Auth.js v5 for JWT-based session management. The database is libSQL/SQLite locally and Turso in production, accessed through Drizzle ORM. There is no separate API layer — the entire application is a single Next.js project.

---

## Architecture Pattern

**Server-component-first + Server Actions**

- All pages are React Server Components by default — they fetch data directly in the component body and render HTML on the server
- Client Components (`'use client'`) are used only where browser interactivity is required (form state via `useActionState`, dropdowns, dialogs, client-side navigation)
- Mutations use **Server Actions** (`'use server'`) called directly from `useActionState` or form `action` props — no REST API layer except the PDF download endpoint
- Auth.js middleware (`middleware.ts`) guards all routes under `/(app)` and redirects unauthenticated users to `/login`

---

## Route Structure

```
/                              → root page (src/app/page.tsx)
                                 redirects to /dashboard (authenticated) or /login (unauthenticated)

/(auth)/                       → public auth pages (no layout)
  /login                       → credentials login (Client Component)
  /register                    → parent self-registration (Client Component)

/(app)/                        → protected layout (AppLayout — requires auth)
  /dashboard                   → progress bars + recent trips (Server Component)
  /trips                       → paginated trip list with edit/delete (Server + Client)
  /trips/new                   → trip entry form (Server + Client)
  /trips/[id]/edit             → pre-populated edit form (Server + Client)
  /report                      → printable Illinois SOS format table (Server + Client)
  /students/new                → add student (parent only; Server + Client)

/api/auth/[...nextauth]        → Auth.js handlers (GET + POST)
/api/report/pdf                → PDF download (GET; server-side @react-pdf/renderer)
```

Route groups (`(auth)`, `(app)`) are Next.js App Router conventions — they group related routes under shared layouts without appearing in the URL path.

---

## Auth Flow

1. **Middleware** ([middleware.ts](../middleware.ts)) exports `auth` from `@/auth` as the default export. The `config.matcher` excludes `api/auth`, Next.js static assets, `favicon.ico`, `apple-icon`, `/login`, and `/register` — all other paths require authentication.

2. **Auth.js v5** ([src/auth.ts](../src/auth.ts)) configures:
   - **Credentials provider**: looks up user by email, verifies bcrypt hash, returns `{ id, name, email, userType, parentId }`
   - **JWT callback**: stamps `id`, `userType`, `parentId` onto the token
   - **Session callback**: surfaces those fields on `session.user` for use in Server Components via `auth()`
   - **Authorized callback**: allows public paths, rejects unauthenticated requests to protected paths
   - Session `maxAge` = 8 hours

3. **Session access**: Server Components and Server Actions call `const session = await auth()` to read the current user.

4. **Sign-in page** is `/login`; after authentication `redirectTo: '/dashboard'` is passed to `signIn()`.

---

## Selected-Student Context

Parents selecting among multiple students is a first-class concern woven through every data-fetching path:

- `selectStudentAction` sets an httpOnly cookie `selected_student_id` (30-day TTL, `sameSite: 'lax'`)
- `resolveSelectedStudentId(parentId)` reads and **validates** the cookie — verifies the student exists and belongs to the parent, then falls back to the first student if the cookie is absent or stale
- Every server component and action that scopes queries to a student calls this resolver
- The `StudentSelector` client component (nav dropdown) calls `selectStudentAction` on change, then `router.refresh()` to re-render the server-fetched views

---

## Data Flow

### Read path (Server Component)
```
Browser request
  → middleware auth check
  → Server Component renders
     → await auth() → session
     → resolveSelectedStudentId() if parent
     → db.select(...).from(trips).where(...) via Drizzle
     → HTML rendered and streamed
```

### Mutation path (Server Action via useActionState)
```
Form submit (Client Component)
  → useActionState calls Server Action
     → await auth() → verify session
     → resolveStudentId() → validate ownership
     → input validation
     → db.insert/update/delete
     → return { success } or { errors }
  → Client Component re-renders with new state
  → router.refresh() triggers Server Component re-fetch
```

### PDF download path
```
GET /api/report/pdf
  → await auth() → 401 if unauthenticated
  → resolveSelectedStudentId()
  → db.select(trips) → build rows with running totals
  → renderToBuffer(<ReportDocument />) via @react-pdf/renderer
  → NextResponse with Content-Type: application/pdf
```

---

## Security Model

| Concern | Approach |
|---|---|
| Authentication | JWT session via Auth.js v5; 8-hour TTL |
| Password storage | bcrypt, 12 rounds |
| Route protection | Middleware runs on every non-public path |
| Data isolation | All DB queries scope to the validated student ID; ownership verified before every mutation |
| Student cookie spoofing | `resolveSelectedStudentId` always verifies the cookie value against `users` table with `parentId` check |
| Trip spoofing | `deleteTripAction` / `updateTripAction` verify `eq(trips.studentId, resolvedStudentId)` before acting |
| CSRF | Next.js Server Actions have built-in CSRF protection |
| Secrets | All config via `.env.local` (gitignored); never hardcoded |

---

## Component Architecture

### Server Components (default)
All pages under `/(app)/` and the app layout fetch their own data. No prop-drilling of data from layout to page.

### Client Components (`'use client'`)
Used only where browser APIs or interactivity are required:

| Component | Why client |
|---|---|
| `StudentSelector` | `useTransition`, `useRouter` for optimistic nav |
| `TripForm` | `useActionState` for form state + pending |
| `EditTripForm` | `useActionState` for form state + pending |
| `TripsTable` | `useState` for delete confirmation dialog |
| `LoginPage` | `useActionState` |
| `RegisterPage` | `useActionState` |
| `AddStudentForm` | `useActionState` |
| `ReportActions` | `window.print()` |

### shadcn/ui Components (in `src/components/ui/`)
Copied into the repo (not a runtime dependency). Currently installed:
`button`, `card`, `dialog`, `input`, `label`, `sonner` (toaster), `table`

---

## Styling

- **Tailwind CSS v4** with `tw-animate-css` for transitions
- **Design token variables** defined in [src/app/globals.css](../src/app/globals.css)
- **`cn()` utility** ([src/lib/utils.ts](../src/lib/utils.ts)) — `clsx` + `tailwind-merge`
- **Print styles** hide nav/buttons and render a clean black-and-white table

Key design tokens:

```css
--primary:  oklch(0.44 0.16 148)  /* Interstate green  ~#006B3C */
--accent:   oklch(0.88 0.18 89)   /* Highway yellow    ~#FFCD00 */
```

---

## Deployment Architecture

```
Vercel (hosting)
  ├── Next.js serverless functions (per route/action)
  ├── Static assets (CSS, fonts from Google Fonts)
  └── Environment variables:
        DATABASE_URL         = libsql://...turso.io/...
        DATABASE_AUTH_TOKEN  = turso auth token
        AUTH_SECRET          = next-auth secret
        NEXT_PUBLIC_GA_MEASUREMENT_ID = GA4 measurement ID (optional)

Turso (production database)
  └── libSQL over HTTPS — serverless-compatible SQLite
```

Local development uses `DATABASE_URL=file:local.db` with no auth token.
