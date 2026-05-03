# Story 1.5: Extend Trips Table for State-Specific Fields

Status: ready-for-dev

## Story

As a developer,
I want the trips table extended with state-specific optional fields, a performance index, and confirmed cascade-delete wiring,
so that conditional trip data can be stored efficiently and account deletion cleanly removes all associated records.

## Acceptance Criteria

1. `src/db/schema.ts` adds to the trips table: `inclement_minutes INTEGER NOT NULL DEFAULT 0`, `supervisor_name TEXT` (nullable), `supervisor_license TEXT` (nullable), `vehicle_info TEXT` (nullable), `start_time TEXT` (nullable), `end_time TEXT` (nullable)
2. A composite index on `(student_id, trip_date)` is added to the trips table via Drizzle schema
3. The `trips.student_id` foreign key is confirmed to have `ON DELETE CASCADE`
4. A Drizzle migration is generated and applied without errors
5. The migration is additive only — no existing trip data is modified
6. All existing Playwright E2E tests still pass
7. `npm run build` and `npm test -- --run` pass

## Tasks / Subtasks

- [ ] Add 6 new nullable/defaulted columns to `trips` in `src/db/schema.ts` (AC: 1)
- [ ] Add composite index `(studentId, tripDate)` to trips table (AC: 2)
- [ ] Verify `trips.studentId` FK already has `onDelete: 'cascade'` — no change needed if so (AC: 3)
- [ ] Run `npm run db:generate` and `npm run db:migrate` (AC: 4)
- [ ] Run `npm run test:e2e` to verify no regressions (AC: 6)
- [ ] Verify build and unit tests pass (AC: 7)

## Dev Notes

### Prerequisite

Story 1.4 must be merged first — both stories modify `src/db/schema.ts` and must be sequential to avoid migration conflicts.

### Current Schema State

`src/db/schema.ts` trips table currently has: `id`, `studentId` (FK → users.id CASCADE), `createdBy` (FK → users.id CASCADE), `tripDate`, `locationType`, `weather`, `daytimeMinutes`, `nighttimeMinutes`, `notes`, `createdAt`.

The `trips.studentId` FK **already has** `onDelete: 'cascade'` — verify it's still there after Story 1.4's changes, but do not re-add it.

### Exact Schema Changes

```typescript
// Add to trips table inside sqliteTable('trips', { ... }):
inclementMinutes: integer('inclement_minutes').notNull().default(0),
supervisorName: text('supervisor_name'),       // nullable
supervisorLicense: text('supervisor_license'), // nullable
vehicleInfo: text('vehicle_info'),             // nullable
startTime: text('start_time'),                 // nullable; stored as UTC ISO8601
endTime: text('end_time'),                     // nullable; stored as UTC ISO8601
```

### Composite Index

Add an index using Drizzle's `index()` helper. In the table definition or after:

```typescript
import { sqliteTable, text, integer, index, type AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

// In the sqliteTable definition, add a third argument for extra config:
export const trips = sqliteTable('trips', {
  // ... existing columns ...
  // ... new columns from above ...
}, (table) => ({
  studentDateIdx: index('trips_student_date_idx').on(table.studentId, table.tripDate),
}));
```

This index accelerates the dashboard aggregation query `WHERE student_id = ? ORDER BY trip_date DESC` used in `dashboard/page.tsx`.

### Time Field Storage Convention

`start_time` and `end_time` are stored as **UTC ISO8601 strings** (e.g., `"2026-04-30T22:00:00.000Z"`). Local time is derived at validation time using `StateConfig.timezone` in `validateTrip()` (Story 3.1). Do not store local time in these columns.

### Migration Sequencing

After this migration, the `Trip` type (from `typeof trips.$inferSelect`) will include the 6 new optional fields. Existing queries that select `*` from trips will now return these fields as `null` (or `0` for `inclementMinutes`) for pre-migration rows — this is expected and all existing UI components handle nulls gracefully.

### E2E Regression Check

Run `npm run test:e2e` before marking done. The E2E tests in `tests/e2e/auth.spec.ts` exercise trip creation and must still pass. The migration adds nullable columns with defaults so existing trip insert paths do not break.

### Anti-Patterns

- Do NOT add `locationType` or `weather` enum constraints to the DB columns — these are validated by `validateTrip()` application-side, not by a DB constraint (architecture NFR4)
- Do NOT modify existing column types (additive only)
- Do NOT add a `state_code` column to trips — state is resolved from users.state_code at query time

### References

- Schema file to modify: [src/db/schema.ts](src/db/schema.ts)
- Architecture decision #1 (UTC ISO8601 for time fields): [_bmad-output/planning-artifacts/architecture.md](_bmad-output/planning-artifacts/architecture.md)
- Architecture cross-cutting concern #6 (additive migration)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
