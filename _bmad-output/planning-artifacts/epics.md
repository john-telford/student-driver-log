---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/project-context.md
  - docs/api-contracts.md
  - docs/data-models.md
scope: 'iOS app enablement — core logging release'
---

# student-driver-log - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the **iOS app
enablement (core logging release)**, decomposing the requirements derived from
`architecture.md` (and grounded in `project-context.md`) into implementable stories.

> No PRD exists for this increment by design (solo personal project, tightly-bounded
> scope). Functional requirements are derived from the architecture document's scope
> (§2), endpoint list (§6), and migration sequence (§10).

## Requirements Inventory

### Functional Requirements

FR1: A user authenticates from a native client by exchanging email + password for a bearer token (`POST /api/v1/auth/token`).
FR2: An authenticated student lists their own trips (`GET /api/v1/trips`).
FR3: An authenticated student creates a trip with validated fields (`POST /api/v1/trips`).
FR4: An authenticated student edits a trip they own (`PATCH /api/v1/trips/:id`).
FR5: An authenticated student deletes a trip they own (`DELETE /api/v1/trips/:id`).
FR6: An authenticated student retrieves report totals and progress vs Illinois requirements (`GET /api/v1/report`).
FR7: An authenticated student downloads their driving-log PDF via bearer auth (`GET /api/v1/report/pdf`).

### NonFunctional Requirements

NFR1: Trip validation rules are identical across web and API — a single service layer, no logic duplication or drift.
NFR2: Ownership isolation is enforced in the service layer — a caller can only read or mutate trips for their own student context.
NFR3: Web app behavior is unchanged after the refactor — existing Vitest and Playwright suites pass without modification.
NFR4: Passwords use bcrypt (12 rounds); passwords and tokens are never logged.
NFR5: API tokens are signed (jose HS256, dedicated `API_JWT_SECRET`) and verified for signature and expiry; 8-hour lifetime.
NFR6: CORS is locked to an explicit allow-list — no wildcard-with-credentials.
NFR7: The API is versioned under `/api/v1`.

### Additional Requirements

- Shared service layer `src/services/*` as the foundation for both web (Server Actions) and API surfaces.
- API auth verification helper `requireApiUser` in `src/lib/api-auth.ts`.
- New environment variable `API_JWT_SECRET`.
- Explicit `studentId` context threaded throughout the API; v1 resolves to the authenticated student's own id (parent-on-iOS is future scope).
- Next.js 16 route-handler conventions (async `params`) must be verified against `node_modules/next/dist/docs/` before writing handlers.

### UX Design Requirements

_None — no new UI surface in this increment. The iOS client codebase is a separate later effort._

### FR Coverage Map

FR1: Epic 1 — Bearer-token authentication from a native client
FR2: Epic 1 — List own trips
FR3: Epic 1 — Create trip (validated)
FR4: Epic 1 — Edit own trip
FR5: Epic 1 — Delete own trip
FR6: Epic 2 — Report totals + progress vs Illinois requirements
FR7: Epic 2 — PDF download via bearer auth

## Epic List

### Epic 1: Log driving hours from a native client
A student (Jimmy) can authenticate from a native client and create, view, edit, and delete
his driving trips — the complete logging loop over a stateless API — with the web app's
behavior unchanged. Front-loads the shared foundation (trip + auth service layer,
bearer-token issuance + verification, CORS) as its first stories.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Review driving progress from a native client
An authenticated student can retrieve report totals and progress vs Illinois requirements,
and download the official PDF driving log, from a native client. Builds on Epic 1's auth +
service foundation; Epic 1 does not depend on it.
**FRs covered:** FR6, FR7

## Epic 1: Log driving hours from a native client

A student (Jimmy) can authenticate from a native client and create, view, edit, and delete
his driving trips — the complete logging loop over a stateless API — with the web app's
behavior unchanged. Front-loads the shared foundation (trip + auth service layer,
bearer-token issuance + verification, CORS) as its first story.

### Story 1.1: Authenticate from a native client

As the student driver,
I want to exchange my email and password for a token on my phone,
So that I can make authenticated requests from a native app.

_Front-loads the foundation: `src/services/auth.ts` (extract the bcrypt check from
`authorize()`), `requireApiUser` helper (`src/lib/api-auth.ts`), `API_JWT_SECRET`, and the
CORS policy for `/api/v1`._

**Acceptance Criteria:**

**Given** valid student credentials
**When** I `POST /api/v1/auth/token`
**Then** I receive a signed JWT whose claims are `{ sub, userType, parentId }`
**And** the token expires in 8 hours (NFR5)

**Given** invalid credentials
**When** I `POST /api/v1/auth/token`
**Then** I receive `401` with no token
**And** the password hash is never logged (NFR4)

**Given** a request to a protected `/api/v1` route
**When** the `Authorization: Bearer` header is missing, malformed, or expired
**Then** `requireApiUser` rejects it with `401`

**Given** the web login flow
**When** it runs after the auth-service extraction
**Then** existing Vitest + Playwright suites pass unchanged (NFR3)

**Given** a cross-origin browser request
**When** it hits `/api/v1`
**Then** only allow-listed origins are permitted, with no wildcard-with-credentials (NFR6)

### Story 1.2: List my trips from a native client

As the student driver,
I want to fetch my logged trips on my phone,
So that I can see my driving history.

_Extracts `listTrips` into `src/services/trips.ts` (read path)._

**Acceptance Criteria:**

**Given** a valid token
**When** I `GET /api/v1/trips`
**Then** I receive only my own trips, newest first, as JSON

**Given** a valid token
**When** I request trips
**Then** I can never receive another student's trips — ownership isolation is enforced in the service (NFR2)

**Given** no token or an invalid token
**When** I `GET /api/v1/trips`
**Then** I receive `401`

### Story 1.3: Create a trip from a native client

As the student driver,
I want to log a new drive from my phone,
So that my hours are recorded.

_Extracts `createTrip` (with validation) into the trip service; refactors web
`createTripAction` onto it._

**Acceptance Criteria:**

**Given** a valid token and a valid trip body
**When** I `POST /api/v1/trips`
**Then** the trip is created for my student id
**And** the created trip is returned as JSON

**Given** an invalid body (future `tripDate`, invalid enum, minutes outside 0–600, or both daytime and nighttime = 0)
**When** I `POST /api/v1/trips`
**Then** I receive `400` with field errors — identical validation rules to the web form (NFR1)

**Given** the web create-trip form
**When** it runs after the refactor
**Then** its behavior is unchanged and tests pass (NFR3)

### Story 1.4: Edit a trip from a native client

As the student driver,
I want to correct a logged drive from my phone,
So that my records are accurate.

_Extracts `updateTrip` into the trip service; refactors web `updateTripAction` onto it._

**Acceptance Criteria:**

**Given** a valid token and a trip I own
**When** I `PATCH /api/v1/trips/:id` with valid fields
**Then** the trip is updated
**And** the updated trip is returned

**Given** a trip id I do not own
**When** I `PATCH` it
**Then** I receive `403`/`404` and nothing changes (NFR2)

**Given** invalid fields
**When** I `PATCH /api/v1/trips/:id`
**Then** I receive `400` with the same validation as create (NFR1)

### Story 1.5: Delete a trip from a native client

As the student driver,
I want to remove a mistaken entry from my phone,
So that my log only contains real drives.

_Extracts `deleteTrip` into the trip service; refactors web `deleteTripAction` onto it._

**Acceptance Criteria:**

**Given** a valid token and a trip I own
**When** I `DELETE /api/v1/trips/:id`
**Then** the trip is deleted

**Given** a trip id I do not own
**When** I `DELETE` it
**Then** I receive `403`/`404` and nothing is deleted (NFR2)

## Epic 2: Review driving progress from a native client

An authenticated student can retrieve report totals and progress vs Illinois requirements,
and download the official PDF driving log, from a native client. Builds on Epic 1's auth +
service foundation; Epic 1 does not depend on it.

### Story 2.1: Retrieve report totals from a native client

As the student driver,
I want to fetch my running totals and progress on my phone,
So that I know how close I am to the Illinois requirements.

_Extracts the totals aggregation into `src/services/report.ts` (currently computed in the
dashboard/report page against `TOTAL_REQUIRED_MIN` = 3000, `NIGHT_REQUIRED_MIN` = 600)._

**Acceptance Criteria:**

**Given** a valid token
**When** I `GET /api/v1/report`
**Then** I receive my total minutes, nighttime minutes, and progress vs the 3000/600-minute requirements as JSON

**Given** a valid token
**When** I request the report
**Then** the totals reflect only my own trips (NFR2)

**Given** no token or an invalid token
**When** I `GET /api/v1/report`
**Then** I receive `401`

**Given** the web dashboard/report
**When** it runs after the totals extraction
**Then** its numbers are unchanged and tests pass (NFR3)

### Story 2.2: Download the official PDF log from a native client

As the student driver,
I want to download my official Illinois driving-log PDF from my phone,
So that I can submit or share it.

_Adapts the existing PDF route (`src/app/api/report/pdf/route.tsx`) to accept bearer auth and
an explicit student context, rather than the session cookie + selected-student cookie._

**Acceptance Criteria:**

**Given** a valid token
**When** I `GET /api/v1/report/pdf`
**Then** I receive the Illinois SOS DSD X 152.4 PDF for my own log with `Content-Type: application/pdf`

**Given** no token or an invalid token
**When** I request the PDF
**Then** I receive `401`

**Given** the existing web PDF download
**When** it runs after the change
**Then** it still works via the session and tests pass (NFR3)
