# Deployment Guide

## Infrastructure

| Component | Service | Notes |
|---|---|---|
| Hosting | Vercel | Project linked via `.vercel/project.json` |
| Database (prod) | Turso | libSQL over HTTPS; serverless-compatible SQLite |
| Database (local) | SQLite file | `local.db` at project root |
| CI/CD | GitHub Actions | Not yet configured (issue #12) |

---

## Vercel Deployment

The project is linked to Vercel (`.vercel/project.json` is present). Deploy via:

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

Or via Vercel's GitHub integration — push to `main` triggers a production deploy.

### Required Environment Variables on Vercel

Set these in the Vercel dashboard under Project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `libsql://your-db-name.turso.io` |
| `DATABASE_AUTH_TOKEN` | Your Turso auth token |
| `AUTH_SECRET` | A secure random string (production-grade secret) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (optional) |

---

## Turso Setup (issue #13)

Turso is the production database — a hosted libSQL service with a SQLite-compatible API.

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Authenticate
turso auth login

# Create a database
turso db create student-driver-log

# Get the connection URL
turso db show student-driver-log --url
# Output: libsql://student-driver-log-<org>.turso.io

# Create an auth token
turso db tokens create student-driver-log
```

Add the URL and token to Vercel environment variables (see above).

### Running Migrations on Turso

After setting environment variables locally with Turso credentials:

```bash
DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:migrate
```

Or use `.env.local` temporarily for the migration run.

---

## GitHub Actions CI (issue #12)

Not yet configured. Planned workflow should:
1. Run on pull requests to `main`
2. Install dependencies (`npm ci`)
3. Run `npm run build`
4. Run `npm test` (Vitest)
5. Run `npm run test:e2e` (Playwright) — needs a test database

Suggested workflow file location: `.github/workflows/ci.yml`

---

## PWA / Mobile

The app has PWA metadata configured (`apple-mobile-web-app-capable`, `apple-mobile-web-app-title`) and includes generated icons:
- `src/app/icon.tsx` — favicon
- `src/app/apple-icon.tsx` — Apple touch icon (steering wheel on green background)

The `apple-icon` path is excluded from the auth middleware so it loads without authentication.

Open issue #30: refine PWA home screen icon to wheel-only (no text).

---

## Print / PDF

The report at `/report` has full print CSS — `@media print` in `globals.css` hides nav and buttons, renders a clean black-and-white table suitable for paper submission.

The PDF download at `GET /api/report/pdf` generates a landscape-letter PDF server-side using `@react-pdf/renderer` — no browser print dialog needed.
