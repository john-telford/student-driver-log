# Data Models

Source of truth: [src/db/schema.ts](../src/db/schema.ts)

Migration SQL: [drizzle/0000_glorious_zarek.sql](../drizzle/0000_glorious_zarek.sql)

---

## Database

| Environment | Driver | Location |
|---|---|---|
| Local development | libSQL (SQLite file) | `local.db` at project root |
| Production | Turso (libSQL over HTTPS) | Configured via `DATABASE_URL` + `DATABASE_AUTH_TOKEN` |

Connection is initialized once in [src/db/index.ts](../src/db/index.ts) and exported as `db`.

---

## Tables

### `users`

Stores both parent and student accounts in a single self-referential table.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `email` | TEXT | NOT NULL, UNIQUE | Lowercase-normalized on write |
| `password_hash` | TEXT | NOT NULL | bcrypt, 12 rounds |
| `name` | TEXT | NOT NULL | Display name |
| `user_type` | TEXT (enum) | NOT NULL | `parent` or `student` |
| `parent_id` | INTEGER | FK → users.id, ON DELETE CASCADE, nullable | `null` for parent accounts; set to parent's id for students |
| `created_at` | TEXT | NOT NULL, DEFAULT current_timestamp | ISO-like string |

**Relationships**:
- A parent has many students (`parent_id` → `users.id`)
- Students cannot self-register — always created by a parent via `addStudentAction`
- Cascade delete: deleting a parent deletes their students; deleting a student cascades to their trips

**TypeScript types** (inferred by Drizzle):
```ts
type User    = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;
type UserType = 'parent' | 'student';
```

---

### `trips`

Represents one behind-the-wheel driving session.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTOINCREMENT | |
| `student_id` | INTEGER | NOT NULL, FK → users.id, ON DELETE CASCADE | The student this trip belongs to |
| `created_by` | INTEGER | NOT NULL, FK → users.id, ON DELETE CASCADE | The user who logged it (parent or student) |
| `trip_date` | TEXT | NOT NULL | Format: `YYYY-MM-DD`; cannot be future date |
| `location_type` | TEXT (enum) | NOT NULL | See enum below |
| `weather` | TEXT (enum) | NOT NULL | See enum below |
| `daytime_minutes` | INTEGER | NOT NULL, DEFAULT 0 | 0–600; total minutes driven during daytime |
| `nighttime_minutes` | INTEGER | NOT NULL, DEFAULT 0 | 0–600; at least one of day/night must be > 0 |
| `notes` | TEXT | nullable | Optional, max 500 characters |
| `created_at` | TEXT | NOT NULL, DEFAULT current_timestamp | |

**TypeScript types**:
```ts
type Trip    = typeof trips.$inferSelect;
type NewTrip = typeof trips.$inferInsert;
```

---

## Enums

All enums are defined as TypeScript `as const` arrays and passed to `sqliteTable` for runtime enforcement.

### `location_type`

| Value | Display Label |
|---|---|
| `highway` | Highway |
| `residential` | Residential |
| `rural` | Rural |
| `urban` | Urban |
| `parking_lot` | Parking Lot |
| `race_track` | Race Track |

### `weather`

| Value | Display Label |
|---|---|
| `clear` | Clear |
| `rain` | Rain |
| `snow` | Snow |
| `fog` | Fog |
| `ice` | Ice |

---

## Illinois Requirements (domain logic)

| Requirement | Constant | Value |
|---|---|---|
| Total hours required | `TOTAL_REQUIRED_MIN` | 3000 min (50 h) |
| Night hours required | `NIGHT_REQUIRED_MIN` | 600 min (10 h) |

These constants live in [src/app/(app)/dashboard/page.tsx](../src/app/(app)/dashboard/page.tsx) and are used to compute progress bar percentages.

Minutes are stored as integers and formatted as `H:MM` everywhere in the UI.

---

## Entity Relationship Diagram

```
users (parent)
  id ──────────────────────────────────┐
  email                                │
  password_hash                        │
  name                                 │
  user_type = 'parent'                 │ FK parent_id
  parent_id = NULL                     │
                                       ▼
users (student)               trips
  id ──────────────────────── student_id
  email                       created_by ──┐ (parent or student)
  password_hash               trip_date    │
  name                        location_type│
  user_type = 'student'       weather      │
  parent_id ────► parent.id   daytime_min  │
                              nighttime_min│
                              notes        │
                              created_at   │
                                           │
                              users.id ◄───┘
```

---

## Selected Student Cookie

Parents with multiple students use a `selected_student_id` httpOnly cookie (30-day TTL, `sameSite: 'lax'`, path `/`) to track which student's data is in view.

All server components and actions that scope queries to a student call `resolveSelectedStudentId(parentId)` from [src/app/(app)/actions.ts](../src/app/(app)/actions.ts), which:
1. Reads the cookie value
2. **Verifies** the student exists AND belongs to this parent (prevents stale cross-account cookie leakage)
3. Falls back to the parent's first student if cookie is absent or stale
