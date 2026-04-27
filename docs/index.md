# Student Driver Log — Documentation Index

> **Primary entry point for AI-assisted development.**
> Start here when writing new features, debugging, or reviewing the codebase.

---

## Project Overview

- **Type**: Monolith — Next.js App Router (TypeScript)
- **Architecture**: Server-component-first + Server Actions
- **Primary language**: TypeScript
- **Stack**: Next.js 16.2.3 · React 19 · Drizzle ORM · libSQL/Turso · Auth.js v5 · shadcn/ui · Tailwind CSS v4
- **Entry point**: `src/app/page.tsx` → redirects to `/login` or `/dashboard`

---

## Quick Reference

| Need | Where to look |
|---|---|
| Data model (tables, enums, types) | [Data Models](./data-models.md) |
| Route structure | [Architecture → Route Structure](./architecture.md#route-structure) |
| Auth flow | [Architecture → Auth Flow](./architecture.md#auth-flow) |
| Server Actions catalog | [API Contracts → Server Actions](./api-contracts.md#server-actions) |
| Component list | [Component Inventory](./component-inventory.md) |
| How to run locally | [Development Guide → Setup](./development-guide.md#setup) |
| Deploy to production | [Deployment Guide](./deployment-guide.md) |
| File locations | [Source Tree Analysis](./source-tree-analysis.md) |

---

## Generated Documentation

- [Project Overview](./project-overview.md) — Purpose, actors, feature status, tech stack, design system
- [Architecture](./architecture.md) — Patterns, auth flow, data flow, security model, deployment
- [Data Models](./data-models.md) — Database schema, enums, relationships, selected-student cookie
- [API Contracts](./api-contracts.md) — HTTP endpoints + all Server Actions with types and validation
- [Source Tree Analysis](./source-tree-analysis.md) — Annotated directory tree, entry points, naming conventions
- [Component Inventory](./component-inventory.md) — All components: type, props, responsibilities, UI patterns
- [Development Guide](./development-guide.md) — Setup, env vars, commands, conventions, guardrails
- [Deployment Guide](./deployment-guide.md) — Vercel + Turso setup, CI, PWA, PDF

---

## Existing Documentation (project root)

- [SPEC.md](../SPEC.md) — Requirements, data model, routes, acceptance criteria, validation rules
- [PROJECT-OVERVIEW.md](../PROJECT-OVERVIEW.md) — Architecture narrative + feature status table
- [CLAUDE.md](../CLAUDE.md) — Claude Code project conventions and guardrails
- [AGENTS.md](../AGENTS.md) — AI agent instructions (important Next.js 15 warnings)

---

## Getting Started

### Run locally
```bash
nvm use
npm install
cp .env.local.example .env.local   # set DATABASE_URL=file:local.db and AUTH_SECRET
npm run db:migrate
npm run dev
# → http://localhost:3000
# → /register to create a parent account
# → /dashboard → Add a Student → /trips/new to log trips
```

### Key files for common tasks

| Task | File |
|---|---|
| Add a new field to trips | `src/db/schema.ts` → `npm run db:generate` → `npm run db:migrate` |
| Add a new route | Create `src/app/(app)/<route>/page.tsx` + `actions.ts` |
| Add a new shadcn component | `npx shadcn@latest add <component>` |
| Modify auth behavior | `src/auth.ts` |
| Change middleware routing | `middleware.ts` |
| Change design tokens | `src/app/globals.css` |

---

## Open Work

See GitHub issues — `gh issue list` or the repo Issues tab.
