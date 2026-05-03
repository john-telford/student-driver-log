# Story 1.4: Extend Users Table for State-Awareness

Status: ready-for-dev

## Story

As a developer,
I want the users table extended with state-awareness columns and the CI pipeline updated,
so that all subsequent auth and onboarding flows can persist and read state-specific user data.

## Acceptance Criteria

1. `src/db/schema.ts` adds to the users table: `state_code TEXT NOT NULL DEFAULT 'IL'`, `state_confirmed BOOLEAN NOT NULL DEFAULT true`, `driver_ed_completed BOOLEAN NOT NULL DEFAULT false`, `permit_issue_date TEXT` (nullable)
2. A Drizzle migration is generated and applied without errors on a fresh local database
3. The migration is additive only — no existing columns are modified or removed
4. `.github/workflows/ci.yml` adds `npm run db:migrate` as a step before `npm test -- --run`
5. `npm run build`, `npm test -- --run`, and the CI workflow all pass

## Tasks / Subtasks

- [ ] Add 4 new columns to the `users` table in `src/db/schema.ts` (AC: 1)
- [ ] Run `npm run db:generate` to create the Drizzle migration (AC: 2)
- [ ] Run `npm run db:migrate` locally to verify migration applies cleanly (AC: 2)
- [ ] Update `.github/workflows/ci.yml` to add `npm run db:migrate` before `npm test -- --run` (AC: 4)
- [ ] Verify `npm run build` and `npm test -- --run` pass (AC: 5)

## Dev Notes

### Current Schema State

`src/db/schema.ts` users table currently has: `id`, `email`, `passwordHash`, `name`, `userType`, `parentId`, `createdAt`. Read [src/db/schema.ts](src/db/schema.ts) before editing.

### Exact Schema Changes

```typescript
// Add to users table inside sqliteTable('users', { ... }):
stateCode: text('state_code').notNull().default('IL'),
stateConfirmed: integer('state_confirmed', { mode: 'boolean' }).notNull().default(true),
driverEdCompleted: integer('driver_ed_completed', { mode: 'boolean' }).notNull().default(false),
permitIssueDate: text('permit_issue_date'),  // nullable — no .notNull()
```

**Drizzle SQLite notes:**
- SQLite has no native BOOLEAN type. Drizzle maps `integer({ mode: 'boolean' })` to `INTEGER` with `0`/`1` values — this is the correct pattern.
- `permitIssueDate` is nullable (no `.notNull()`). Drizzle infers `string | null` for the TypeScript type.
- Defaults: existing rows created before this migration will get `state_code = 'IL'`, `state_confirmed = true` (no modal on next login), `driver_ed_completed = false`.

### Drizzle Migration Commands

```bash
npm run db:generate   # creates drizzle/migrations/XXXX_users_state_columns.sql
npm run db:migrate    # applies to local.db
```

Never hand-write the SQL migration file — always use `db:generate`.

### CI Workflow Update

Current CI order in `.github/workflows/ci.yml`:
```
npm ci → npm test -- --run → npm run build → playwright install → npm run test:e2e
```

Required order after this story:
```
npm ci → npm run db:migrate → npm test -- --run → npm run build → ...
```

The `db:migrate` step must run before `npm test -- --run` because the E2E tests use `test.db` (set up by `global-setup.ts`). Unit tests don't use the DB but the CI step order is cleaner if migrate happens first. Add a new step:

```yaml
- name: Run database migrations
  run: npm run db:migrate
  env:
    DATABASE_URL: file:./ci-build.db
```

Place it immediately after `Install dependencies` and before `Unit tests`.

### Default Values Rationale

- `state_code DEFAULT 'IL'`: All existing users are IL users. New v2.0 users will set state_code during registration (Story 2.2).
- `state_confirmed DEFAULT true`: Existing users do NOT see the confirmation modal on next login (they're already IL). New v2.0 users registered via Story 2.2 will have `state_confirmed = true` (they set it at registration). Only users who were registered via an older registration flow (before Story 2.2 ships) would need `state_confirmed = false`, but since this is a single deployment we default to true.
- `driver_ed_completed DEFAULT false`: Safe default — driver ed waiver is opt-in.
- `permitIssueDate NULL`: Optional field.

### Additive Migration Discipline

This migration must be additive only (architecture cross-cutting concern #6):
- Do NOT rename any existing column
- Do NOT change any existing column's type or constraint
- Do NOT drop any column
- The migration is one-way once deployed to Turso — it cannot be reverted without data loss

### Inferred Types

After the schema change, the Drizzle-inferred `User` type (via `typeof users.$inferSelect`) will automatically include the new columns. Import `User` from `@/db/schema` in Server Components that need to read state fields.

### References

- Current schema: [src/db/schema.ts](src/db/schema.ts)
- CI workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- Architecture cross-cutting concern #6 (additive migration): [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
