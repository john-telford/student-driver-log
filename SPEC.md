# student-driver-log — MVP Spec

## Purpose
Log behind-the-wheel practice hours for an Illinois learner's permit holder
and generate a printable report matching the Illinois SOS 50-hour requirement.

## Users (MVP)
Two account types: parent and student.
- Parents self-register (username + password)
- Parents create student accounts from their dashboard (parent sets username + password for student)
- Students cannot self-register
- Both parents and students can log, edit, and delete trips
- Students can view their own dashboard and report only
- A parent can manage multiple students

## Future Scope (do not build in MVP)
- v1.0: Google OAuth
- v1.5: iOS app with GPS-based start/stop trip tracking

## Data Model
**users**: id, username, password_hash, name, user_type, parent_id, created_at
**trips**: id, student_id, created_by, trip_date, location_type, weather, daytime_minutes,
           nighttime_minutes, notes, created_at

- user_type enum: parent, student
- parent_id: null for parent accounts; foreign key to users.id for student accounts
- student_id: foreign key to users.id — the student the trip belongs to
- created_by: foreign key to users.id — the user who logged the trip (parent or student)
- location_type enum: highway, residential, rural, urban, parking_lot, race_track
- weather enum: clear, rain, snow, fog, ice

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

## Validation Rules
- trip_date: required, cannot be in the future
- location_type: required, must be one of the enum values
- weather: required, must be one of the enum values
- daytime_minutes: integer, 0 to 600
- nighttime_minutes: integer, 0 to 600
- At least one of daytime_minutes or nighttime_minutes must be > 0
- notes: optional, max 500 characters
- username: required, 3 to 32 chars, alphanumeric plus underscore
- password: required, minimum 8 characters