# API Contracts

This project uses **Server Actions** for almost all mutations. There is no REST API layer. The two exceptions are the Auth.js catch-all route and the PDF download endpoint.

---

## HTTP API Endpoints

### `GET|POST /api/auth/[...nextauth]`

Auth.js v5 handler. Handles all OAuth/credentials flows internally.

- **Source**: [src/app/api/auth/[...nextauth]/route.ts](../src/app/api/auth/%5B...nextauth%5D/route.ts)
- Used by Auth.js internally for sign-in, sign-out, and session callbacks
- Not called directly by application code (Auth.js manages this via `signIn()` / `signOut()`)

---

### `GET /api/report/pdf`

Download the current student's driving log as a PDF file.

- **Source**: [src/app/api/report/pdf/route.tsx](../src/app/api/report/pdf/route.tsx)
- **Auth required**: Yes — returns `401 Unauthorized` if not signed in
- **Method**: GET (safe, downloadable)

**Response — success**

```
HTTP 200
Content-Type: application/pdf
Content-Disposition: attachment; filename="driving-log-{student-name}.pdf"

<binary PDF buffer>
```

**Response — errors**

| Status | Condition |
|---|---|
| 401 | No valid session |
| 400 | Authenticated as parent but no student selected |

**PDF content**: Illinois SOS DSD X 152.4 landscape table — same columns as the HTML report: Date, Location of Practice, Weather Conditions, Daytime, Daytime Total, Nighttime, Nighttime Total, Grand Total, Initials. Plus running totals row and signature block.

---

## Server Actions

Server Actions are TypeScript functions marked `'use server'`. They are called directly from Client Components via `useActionState` or form `action` props. All actions re-validate the session and ownership before any mutation.

### Auth Actions

#### `loginAction(prev, formData) → LoginState`

- **Source**: [src/app/(auth)/login/actions.ts](../src/app/(auth)/login/actions.ts)
- Calls `signIn('credentials', { email, password, redirectTo: '/dashboard' })`
- Returns `{ error: 'Invalid email or password.' }` on `AuthError`
- On success, Auth.js handles redirect — action never returns a success value

```ts
type LoginState = { error: string } | undefined
```

#### `registerAction(prev, formData) → RegisterState`

- **Source**: [src/app/(auth)/register/actions.ts](../src/app/(auth)/register/actions.ts)
- Validates name, email (regex), password (≥8 chars)
- Checks for duplicate email
- Inserts user as `userType: 'parent'` with bcrypt hash (12 rounds)
- Auto-signs in via `signIn('credentials', { redirectTo: '/dashboard' })`

```ts
type RegisterState = { errors: Record<string, string> } | undefined
```

#### `logoutAction() → void`

- **Source**: [src/app/(app)/dashboard/actions.ts](../src/app/(app)/dashboard/actions.ts)
- Deletes `selected_student_id` cookie
- Calls `signOut({ redirectTo: '/login' })`

---

### Student Selection

#### `selectStudentAction(studentId: number) → void`

- **Source**: [src/app/(app)/actions.ts](../src/app/(app)/actions.ts)
- Sets `selected_student_id` httpOnly cookie (30-day TTL, `sameSite: 'lax'`)

#### `resolveSelectedStudentId(parentId: number) → Promise<number | null>`

- **Source**: [src/app/(app)/actions.ts](../src/app/(app)/actions.ts)
- Not a user-facing action — helper called by server components and actions
- Reads cookie, validates ownership, falls back to first student
- Returns `null` if parent has no students

---

### Trip Actions

#### `createTripAction(prev, formData) → TripFormState`

- **Source**: [src/app/(app)/trips/new/actions.ts](../src/app/(app)/trips/new/actions.ts)
- **Auth required**: Yes
- **FormData fields**:
  | Field | Type | Validation |
  |---|---|---|
  | `tripDate` | string (YYYY-MM-DD) | Required, cannot be future |
  | `locationType` | enum string | Required, must be valid `locationTypes` value |
  | `weather` | enum string | Required, must be valid `weatherConditions` value |
  | `daytimeMinutes` | number | 0–600; clamped |
  | `nighttimeMinutes` | number | 0–600; clamped; at least one of day/night > 0 |
  | `notes` | string | Optional, max 500 chars |
- Inserts into `trips` table with `studentId` from resolved cookie (parent) or `session.user.id` (student)
- Returns `{ success: true }` on success

```ts
type TripFormState = {
  success?: true;
  errors?: {
    tripDate?: string; locationType?: string; weather?: string;
    minutes?: string; notes?: string; form?: string;
  };
}
```

#### `updateTripAction(tripId, prev, formData) → TripEditState`

- **Source**: [src/app/(app)/trips/actions.ts](../src/app/(app)/trips/actions.ts)
- Same validation as `createTripAction`
- Verifies the trip belongs to the resolved student before updating
- Returns `{ success: true }` on success

```ts
type TripEditState = TripFormState  // same shape
```

#### `deleteTripAction(tripId: number) → void`

- **Source**: [src/app/(app)/trips/actions.ts](../src/app/(app)/trips/actions.ts)
- Verifies `eq(trips.studentId, resolvedStudentId)` before deleting — prevents ID spoofing

---

### Student Management

#### `addStudentAction(prev, formData) → AddStudentState`

- **Source**: [src/app/(app)/students/new/actions.ts](../src/app/(app)/students/new/actions.ts)
- **Auth required**: Yes; also checks `userType === 'parent'` — returns `{ errors: { form: 'Unauthorized.' } }` otherwise
- **FormData fields**: `name`, `email`, `password`
- Inserts user with `userType: 'student'` and `parentId: session.user.id`
- Redirects to `/dashboard` on success

```ts
type AddStudentState = {
  errors?: { name?: string; email?: string; password?: string; form?: string; }
}
```
