# Source Tree Analysis

## Project Root

```
student-driver-log/
├── src/                        # All application source code
│   ├── app/                    # Next.js App Router — pages, layouts, API routes
│   │   ├── (auth)/             # Public route group — no app layout
│   │   │   ├── login/          # /login — credentials login form
│   │   │   │   ├── page.tsx    # Client Component — useActionState form
│   │   │   │   └── actions.ts  # loginAction server action
│   │   │   └── register/       # /register — parent self-registration
│   │   │       ├── page.tsx    # Client Component — useActionState form
│   │   │       └── actions.ts  # registerAction server action
│   │   ├── (app)/              # Protected route group — requires auth
│   │   │   ├── layout.tsx      # AppLayout — auth guard, loads students, resolves selected student
│   │   │   ├── app-nav.tsx     # Server Component — nav bar (desktop + mobile hamburger)
│   │   │   ├── student-selector.tsx  # Client Component — select dropdown + selectStudentAction
│   │   │   ├── actions.ts      # selectStudentAction, resolveSelectedStudentId
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx    # Server Component — progress bars, recent trips, student list
│   │   │   │   └── actions.ts  # logoutAction
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx    # Server Component — full trips list
│   │   │   │   ├── trips-table.tsx  # Client Component — table + delete dialog
│   │   │   │   ├── actions.ts  # deleteTripAction, updateTripAction
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx      # Server Component — resolves student, renders TripForm
│   │   │   │   │   ├── trip-form.tsx # Client Component — create trip form
│   │   │   │   │   └── actions.ts    # createTripAction
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           ├── page.tsx          # Server Component — loads trip, auth guard
│   │   │   │           └── edit-trip-form.tsx # Client Component — pre-populated edit form
│   │   │   ├── report/
│   │   │   │   ├── page.tsx       # Server Component — Illinois SOS format table + running totals
│   │   │   │   └── print-button.tsx  # Client Component — Print + Download PDF buttons
│   │   │   └── students/
│   │   │       └── new/
│   │   │           ├── page.tsx          # Server Component — parent-only guard
│   │   │           ├── add-student-form.tsx  # Client Component — create student form
│   │   │           └── actions.ts        # addStudentAction
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts  # Auth.js GET + POST handlers
│   │   │   └── report/
│   │   │       └── pdf/
│   │   │           ├── route.tsx    # PDF download API route
│   │   │           └── document.tsx # @react-pdf/renderer ReportDocument component
│   │   ├── apple-icon.tsx  # PWA apple touch icon (generated)
│   │   ├── icon.tsx        # Favicon (generated) — steering wheel on green background
│   │   ├── globals.css     # Tailwind v4 + design tokens (highway sign theme)
│   │   ├── layout.tsx      # Root layout — fonts, GA script, Toaster
│   │   └── page.tsx        # Root redirect — /dashboard or /login
│   ├── auth.ts             # Auth.js v5 config — providers, JWT/session callbacks, authorized callback
│   ├── components/
│   │   └── ui/             # shadcn/ui components (copied into repo)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── sonner.tsx  # Toast provider (Sonner)
│   │       └── table.tsx
│   ├── db/
│   │   ├── index.ts    # Drizzle client — createClient + drizzle(client, { schema })
│   │   └── schema.ts   # Drizzle schema — users + trips tables, enums, inferred types
│   └── lib/
│       └── utils.ts    # cn() — clsx + tailwind-merge
├── drizzle/
│   ├── 0000_glorious_zarek.sql  # Initial migration — creates users + trips tables
│   └── meta/                    # Drizzle migration metadata
├── public/                      # Static assets
│   ├── file.svg, globe.svg, next.svg, vercel.svg, window.svg  # Default Next.js assets
├── docs/                        # Project knowledge base (this directory)
├── _bmad/                       # BMad AI workflow configuration (installer-managed)
├── .vercel/                     # Vercel project link metadata
├── middleware.ts                # Auth.js middleware — auth guard for all protected routes
├── next.config.ts               # Next.js config (minimal — no custom options yet)
├── drizzle.config.ts            # Drizzle Kit config — points to schema + DB
├── tsconfig.json                # TypeScript config — path alias @/ → src/
├── components.json              # shadcn/ui CLI config
├── eslint.config.mjs            # ESLint config
├── postcss.config.mjs           # PostCSS + Tailwind v4
├── package.json                 # Dependencies + npm scripts
├── local.db                     # SQLite database file (local dev only, gitignored)
├── .env.local                   # Environment variables (gitignored)
├── .env.local.example           # Template for required env vars
├── .nvmrc                       # Node version pin
├── SPEC.md                      # Requirements + data model spec
├── PROJECT-OVERVIEW.md          # Architecture overview + feature status
├── AGENTS.md                    # AI agent instructions (upstream warning re Next.js 15)
└── CLAUDE.md                    # Claude Code project config
```

---

## Critical Directories

| Directory | Purpose |
|---|---|
| `src/app/(app)/` | All protected application pages and their co-located server actions |
| `src/app/(auth)/` | Public login and register pages |
| `src/app/api/` | HTTP API routes — Auth.js handler + PDF download |
| `src/db/` | Database client + Drizzle schema (source of truth for data model) |
| `src/auth.ts` | Auth.js configuration — single source of truth for auth behavior |
| `src/components/ui/` | shadcn/ui components — add new ones via `npx shadcn@latest add <component>` |
| `src/lib/` | Shared utilities |
| `drizzle/` | Migration SQL files — generated by Drizzle Kit |
| `docs/` | AI-readable project knowledge base |

---

## Entry Points

| Entry | File | Notes |
|---|---|---|
| HTTP request → middleware | `middleware.ts` | Runs before every request matching the config |
| App root | `src/app/layout.tsx` | Root HTML shell, fonts, GA, Toaster |
| Auth | `src/auth.ts` | `auth`, `signIn`, `signOut`, `handlers` exported here |
| Database | `src/db/index.ts` | `db` Drizzle instance exported here |
| Schema types | `src/db/schema.ts` | All Drizzle types exported here |

---

## Naming Conventions

| Pattern | Convention |
|---|---|
| Pages | `page.tsx` — always `default export async function` (Server Component) |
| Client components | Named file, `'use client'` at top |
| Server actions | `actions.ts` co-located with route, `'use server'` at top |
| Action return types | `export type XxxState = { errors?: {...} }` co-located in `actions.ts` |
| DB imports | Always `import { db } from '@/db'` and `import { users, trips } from '@/db/schema'` |
| Auth imports | Always `import { auth } from '@/auth'` |
| Path alias | `@/` maps to `src/` via `tsconfig.json` `paths` |
