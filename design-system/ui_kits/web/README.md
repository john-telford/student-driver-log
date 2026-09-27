# Web UI Kit — Student Driver Log (studentdriver.site)

Click-through recreation of the Next.js app at `student-driver-log/src/app`. Open `index.html`.

## Flow
Login sign card → Sign In → app shell (green header, 4px yellow rule, 896px content column).
Header links switch routes: Trips (delete a row via the confirm dialog), + Log Trip (fill the form, get the "Trip Logged ✓" confirmation and a toast), Report (Illinois SOS DSD X 152.4 table with running totals and signature block), Settings (danger zone), About (public page copy).

## Screens
| File | Source |
|---|---|
| `LoginScreen.jsx` | `src/app/(auth)/login/page.tsx` |
| `DashboardScreen.jsx` | `src/app/(app)/dashboard/page.tsx` |
| `TripsScreen.jsx` | `src/app/(app)/trips/trips-table.tsx` |
| `TripFormScreen.jsx` | `src/app/(app)/trips/new/trip-form.tsx` |
| `ReportScreen.jsx` | `src/app/(app)/report/page.tsx` |
| `AboutScreen.jsx` | `src/app/(public)/about/page.tsx` |
| `App.jsx` | `src/app/(app)/layout.tsx` + `app-nav.tsx` |

Data is fake and lives in `data.jsx`. Every visual comes from the design system's components and tokens — nothing is re-implemented locally.
