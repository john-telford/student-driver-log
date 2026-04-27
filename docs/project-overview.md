# Student Driver Log — Project Overview

## Purpose

A web application for tracking Illinois learner's permit behind-the-wheel practice hours. Illinois requires student drivers to log **50 total hours** (including **10 hours at night**) before qualifying for a full license. This app replaces the paper SOS DSD X 152.4 log sheet with a structured digital tracker that generates a printable and PDF-downloadable report in the same format.

Personal project — John Telford tracking hours for his son Jimmy.

---

## Project Classification

| Attribute | Value |
|---|---|
| Repository type | Monolith |
| Project type | Web (Next.js App Router) |
| Primary language | TypeScript |
| Architecture pattern | Server-component-first + Server Actions |

---

## Actors

### Parent
- Self-registers with email + password
- Creates and manages student accounts (sets student email + password)
- Can manage **multiple students** (e.g., different children)
- Selects the active student via a nav dropdown; all views filter to that student
- `selected_student_id` httpOnly cookie (30-day TTL) persists selection across requests

### Student
- Account created by their parent — cannot self-register
- Logs in with email + password set by parent
- Can log, edit, and delete their own trips
- Sees only their own dashboard, trip list, and report

---

## Feature Status

| # | Feature | Status |
|---|---|---|
| 1 | Drizzle schema + migrations + libSQL connection | Done |
| 2 | Auth.js v5 credentials provider (register + login) | Done |
| 3 | shadcn/ui base components | Done |
| 4 | Protected app layout + nav + logout | Done |
| 5 | Trip entry form (`/trips/new`) | Done |
| 6 | Trips list with edit and delete | Done |
| 7 | Dashboard totals + 50h/10h progress bars | Done |
| 8 | Printable report at `/report` (Illinois SOS format) | Done |
| 9 | PDF export via @react-pdf/renderer | Open |
| 10 | Vitest unit test | Open |
| 11 | Playwright e2e test | Open |
| 12 | GitHub Actions CI | Open |
| 13 | Turso + Vercel production deploy | Open |
| 19 | Multiple parents per student | Backlog |

---

## Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.2.3 | Server Components by default |
| Runtime | React | 19.2.4 | |
| Language | TypeScript | ^5 | |
| Database (local) | libSQL / SQLite | @libsql/client ^0.17.2 | `local.db` file |
| Database (prod) | Turso | — | Serverless-compatible SQLite |
| ORM | Drizzle ORM | ^0.45.2 | Schema-first, type-safe |
| Auth | Auth.js v5 (next-auth) | ^5.0.0-beta.30 | Credentials provider, JWT sessions |
| Password hashing | bcryptjs | ^3.0.3 | 12 rounds |
| UI Components | shadcn/ui | — | Copied into src/components/ui/ |
| CSS | Tailwind CSS v4 | ^4 | |
| CSS utilities | tw-animate-css, tailwind-merge, clsx, cva | — | |
| Font | Overpass (Google Fonts) | — | Open-source Highway Gothic clone |
| Toasts | Sonner | ^2.0.7 | |
| PDF | @react-pdf/renderer | ^4.4.1 | Server-side, API route |
| Testing (unit) | Vitest | ^4.1.4 | Not yet configured |
| Testing (e2e) | Playwright | ^1.59.1 | Not yet configured |
| Linting | ESLint + eslint-config-next | 16.2.3 | |
| CI | GitHub Actions | — | Not yet configured |
| Hosting | Vercel | — | `.vercel/project.json` linked |

---

## Design System

Highway sign aesthetic:

- **Primary color**: Pantone 342 / Interstate green — `oklch(0.44 0.16 148)` ≈ `#006B3C`
- **Accent color**: FHWA highway yellow — `oklch(0.88 0.18 89)` ≈ `#FFCD00`
- **Font**: Overpass (open-source Highway Gothic / FHWA Series E clone)
- **Login screen**: Illinois state route shield SVG on green sign panel
- **Print mode**: Full CSS print styles — hides nav/buttons, renders table for paper

