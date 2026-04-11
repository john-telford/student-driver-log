# student-driver-log — MVP Spec

## Purpose
Log behind-the-wheel practice hours for an Illinois learner's permit holder
and generate a printable report matching the Illinois SOS 50-hour requirement.

## Users (MVP)
Single user. One driver per account. Username + password auth.

## Future Scope (do not build in MVP)
- v1.0: Multi-user accounts (parent + student logging for same driver), Google OAuth
- v1.5: iOS app with GPS-based start/stop trip tracking

## Data Model
**users**: id, username, password_hash, driver_name, created_at
**trips**: id, user_id, trip_date, location_type, weather, daytime_minutes,
           nighttime_minutes, notes, created_at

- location_type enum: highway, residential, rural, urban, parking_lot
- weather enum: clear, rain, snow, fog, night_only
- Minutes stored as integers, displayed as H:MM in UI

## Routes
- `/` — redirect to /login or /dashboard
- `/login`, `/register`
- `/dashboard` — running totals (day / night / grand), progress to 50h / 10h night
- `/trips` — list + filter all trips, edit/delete
- `/trips/new` — entry form
- `/trips/[id]/edit` — edit existing trip
- `/report` — printable HTML view + "Download PDF" button

## Report Format
Matches Illinois SOS DSD X 152.4 columns:
Date | Location of Practice | Weather Conditions | Daytime | Daytime Total |
Nighttime | Nighttime Total | Grand Total | Initials

## Acceptance Criteria (MVP done when)
- User can register, log in, log out
- User can create, edit, delete trips
- Dashboard shows accurate day/night/grand totals with progress to 50h and 10h night
- Report page renders Illinois SOS format and exports to PDF
- Deployed to Vercel, accessible via HTTPS
- One Vitest unit test and one Playwright e2e test passing in CI