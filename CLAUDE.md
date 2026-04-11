# student-driver-log

Personal project. Illinois learner's permit hour tracker for John's son Jimmy.
MVP is simple with parent and student accounts; v1.0 adds Google OAuth. v1.5 adds iOS app.
Do not build v1.0 or v1.5 features unless explicitly asked.

## Stack
- Next.js 15 (App Router) + TypeScript
- Drizzle ORM + libSQL (local: file, prod: Turso)
- Auth.js v5 (credentials provider for MVP)
- shadcn/ui components on Tailwind CSS
- @react-pdf/renderer for report export
- Vitest (unit) + Playwright (e2e)
- GitHub Actions for CI
- Deployed on Vercel

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm test` — Vitest
- `npm run test:e2e` — Playwright
- `npm run db:generate` — Drizzle migration from schema
- `npm run db:migrate` — apply migrations
- `npx shadcn@latest add <component>` — add a shadcn component

## Conventions
- ES modules, async/await, no callbacks
- Server Components by default; Client Components only when needed
- Server Actions for mutations, not API routes (except for PDF download)
- Colocate route handlers, components, and tests
- No hardcoded secrets. All config via `.env.local` (gitignored)
- Passwords hashed with bcrypt, never logged
- Drizzle schema is the source of truth; never hand-write SQL migrations
- Commit messages: conventional commits (feat:, fix:, chore:, test:, docs:)
- Branch per issue: `feat/<issue-number>-short-description`
- One PR per issue, squash merge

## Guardrails (do not do these without asking)
- Do not add dependencies beyond the stack above without justification
- Do not introduce state management libraries (Redux, Zustand). Use React state + server components
- UI components come from shadcn/ui (copied into src/components/ui/). Add new ones via `npx shadcn@latest add <component>`. Do not add other UI libraries (no MUI, Mantine, Chakra, etc.)
- Do not write barrel files / index.ts re-exports
- Do not add abstraction layers "for future flexibility". YAGNI
- Do not touch `.env.local` or commit secrets
- Do not build v1.0 or v1.5 features (OAuth, mobile, GPS)

## Context files
- `SPEC.md` — requirements and data model
- GitHub issues — active work (use `gh issue list` to read)

## Working style
John is an experienced developer returning to hands-on work after 20 years in
consulting leadership. He knows architecture, HTTP, SQL, OOP. He is learning
modern JS/TS ecosystem. Explain non-obvious modern conventions briefly when
you use them. Do not explain fundamentals.

When starting an issue: read the issue body, ask clarifying questions before
coding if anything is ambiguous, then implement. When finishing: run tests,
commit with a conventional message, push, open a PR that closes the issue.

## Next.js 15 specifics
- This project uses Next.js 15. APIs and conventions have changed from 13/14. Do not write code from memory for Next.js.
- Before writing any route handler, page, layout, server action, or middleware, check `node_modules/next/dist/docs/` for the current pattern.
- Known breakages from prior versions: `params` and `searchParams` are now async (must be awaited), caching defaults changed, some `next/headers` APIs changed.
- See AGENTS.md for the upstream warning.