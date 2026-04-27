# Component Inventory

---

## shadcn/ui Components (`src/components/ui/`)

These are copied into the repository via `npx shadcn@latest add <component>`. They are not a runtime npm dependency — modifications are made directly to the files.

| Component | File | Notes |
|---|---|---|
| Button | `button.tsx` | Used across forms and CTAs |
| Card | `card.tsx` | Card container with header/content/footer slots |
| Dialog | `dialog.tsx` | Used for delete confirmation in TripsTable |
| Input | `input.tsx` | Text inputs in forms |
| Label | `label.tsx` | Form labels |
| Sonner | `sonner.tsx` | Toast notification provider (wraps `sonner` library) |
| Table | `table.tsx` | Table primitives |

To add new shadcn components: `npx shadcn@latest add <component-name>`

---

## Application Components

### Layout & Navigation

#### `AppLayout` — [src/app/(app)/layout.tsx](../src/app/(app)/layout.tsx)
**Type**: Server Component

The protected app shell. Responsibilities:
- Auth guard — redirects to `/login` if no session
- Fetches the parent's student list from DB
- Resolves `selected_student_id` cookie to determine active student
- Computes `canLogTrip` (true if student or parent with ≥1 student)
- Passes all this as props to `AppNav`
- Renders the green header bar + main content area

#### `AppNav` — [src/app/(app)/app-nav.tsx](../src/app/(app)/app-nav.tsx)
**Type**: Server Component (renders `StudentSelector` as a child)

Navigation bar with two layouts:
- **Desktop (sm+)**: horizontal links (Trips, Report, + Log Trip CTA), `StudentSelector`, username/sign-out
- **Mobile**: `<details>/<summary>` hamburger toggle (pure CSS, no JS) with the same links in a dropdown panel

Props: `userType`, `userName`, `students`, `selectedStudent`, `canLogTrip`

#### `StudentSelector` — [src/app/(app)/student-selector.tsx](../src/app/(app)/student-selector.tsx)
**Type**: Client Component (`'use client'`)

Dropdown `<select>` for parents to switch between students. Special last option `value="new"` navigates to `/students/new`. On change, calls `selectStudentAction(id)` then `router.refresh()`.

#### `RootLayout` — [src/app/layout.tsx](../src/app/layout.tsx)
**Type**: Server Component

Root HTML shell. Loads Overpass + Overpass Mono fonts, conditionally injects Google Analytics `<Script>` tags (via `NEXT_PUBLIC_GA_MEASUREMENT_ID`), renders `<Toaster>`.

---

### Auth Pages

#### `LoginPage` — [src/app/(auth)/login/page.tsx](../src/app/(auth)/login/page.tsx)
**Type**: Client Component

Highway sign aesthetic — white reflective border frame wrapping a green panel. Contains Illinois state route shield SVG. Email + password form using `useActionState(loginAction)`.

#### `RegisterPage` — [src/app/(auth)/register/page.tsx](../src/app/(auth)/register/page.tsx)
**Type**: Client Component

Same highway sign aesthetic. Name + email + password form. Note: "Students are added from the dashboard after registration."

---

### Dashboard

#### `DashboardPage` — [src/app/(app)/dashboard/page.tsx](../src/app/(app)/dashboard/page.tsx)
**Type**: Server Component

Sections:
1. **Progress card** — daytime / nighttime / total stats + two progress bars (50h total, 10h night) with hover tooltips showing exact time. Uses CSS `group-hover` pattern (no JS).
2. **Recent trips** — last 5 trips in a mini-table
3. **Students list** (parent only) — lists all students with email + Add Student link

---

### Trips

#### `TripsPage` — [src/app/(app)/trips/page.tsx](../src/app/(app)/trips/page.tsx)
**Type**: Server Component

Fetches all trips for the resolved student, ordered by `tripDate DESC, id DESC`. Passes to `TripsTable`.

#### `TripsTable` — [src/app/(app)/trips/trips-table.tsx](../src/app/(app)/trips/trips-table.tsx)
**Type**: Client Component

Full trips table with Edit link and Delete button per row. Delete uses `shadcn/ui Dialog` for confirmation. Calls `deleteTripAction` via `useTransition`, then `router.refresh()`.

#### `TripForm` — [src/app/(app)/trips/new/trip-form.tsx](../src/app/(app)/trips/new/trip-form.tsx)
**Type**: Client Component

Create-trip form. Fields: date (default today, max today), location type select, weather select, daytime minutes (0–600), nighttime minutes (0–600), notes textarea. Uses `useActionState(createTripAction)`. On success, shows a "Trip Logged ✓" confirmation with links to dashboard or log another.

#### `EditTripForm` — [src/app/(app)/trips/[id]/edit/edit-trip-form.tsx](../src/app/(app)/trips/%5Bid%5D/edit/edit-trip-form.tsx)
**Type**: Client Component

Same form as `TripForm` but pre-populated from the existing trip. Calls `updateTripAction.bind(null, trip.id)`. On success shows "Trip Updated ✓" and a Back to Trips link.

---

### Report

#### `ReportPage` — [src/app/(app)/report/page.tsx](../src/app/(app)/report/page.tsx)
**Type**: Server Component

Renders the Illinois SOS DSD X 152.4 log in HTML. Columns: Date, Location of Practice, Weather Conditions, Daytime, Daytime Total, Nighttime, Nighttime Total, Grand Total, Initials. Has print CSS that hides non-report elements. Includes a totals row and signature block.

#### `ReportActions` — [src/app/(app)/report/print-button.tsx](../src/app/(app)/report/print-button.tsx)
**Type**: Client Component

Two buttons: "Download PDF" (`<a href="/api/report/pdf" download>`) and "Print" (`window.print()`). Hidden via `print:hidden`.

#### `ReportDocument` — [src/app/api/report/pdf/document.tsx](../src/app/api/report/pdf/document.tsx)
**Type**: React PDF component (`@react-pdf/renderer`)

Server-side PDF version of the report. Landscape letter page. Same column structure as the HTML report. Uses Helvetica (PDF-safe), Pantone 342 green `#1a5c2e` for the header row.

---

### Students

#### `AddStudentPage` — [src/app/(app)/students/new/page.tsx](../src/app/(app)/students/new/page.tsx)
**Type**: Server Component

Parent-only guard (`userType !== 'parent'` → redirect to `/dashboard`).

#### `AddStudentForm` — [src/app/(app)/students/new/add-student-form.tsx](../src/app/(app)/students/new/add-student-form.tsx)
**Type**: Client Component

Name + email + password fields. Calls `addStudentAction`. On success, redirects to `/dashboard` (server-side redirect from action).

---

### Icons

#### `icon.tsx` — [src/app/icon.tsx](../src/app/icon.tsx)
Generated favicon — steering wheel SVG on green background.

#### `apple-icon.tsx` — [src/app/apple-icon.tsx](../src/app/apple-icon.tsx)
Generated PWA apple touch icon. Excluded from middleware matcher so it loads without auth.

---

## UI Patterns

| Pattern | Usage |
|---|---|
| `useActionState` | All forms — provides `[state, action, pending]` from a server action |
| `router.refresh()` | After mutations that should update server-fetched data (delete trip, select student) |
| `useTransition` | Wraps async calls to get `isPending` without blocking UI (StudentSelector, TripsTable) |
| `cn()` | All className composition |
| Progress bars | CSS `width: ${pct}%` + `group-hover` tooltip (no JS) |
| Print layout | `print:hidden` Tailwind class hides UI chrome; `@media print` in globals.css |
| Mobile nav | Pure CSS `<details>/<summary>` — no JS toggle |
