
## Deferred from #48 forgot-password (2026-04-26)

- **Rate limit /forgot-password**: No throttle on the unauthenticated endpoint — attacker can spam tokens and burn Resend quota. Fix: apply same IP-based rate limiting as login.
- **Confirm-password field on /reset-password**: Single password field; a typo locks the user out of the account they're recovering. Add a confirmation field.
- **Active sessions not invalidated on password change**: After `resetPasswordAction` updates `passwordHash`, existing JWT sessions for that user stay valid up to 8h. If the reset was triggered by a compromised account, the attacker's session survives. Fix: store `passwordChangedAt` on user and check it in the `jwt` callback.
- **Orphaned expired tokens accumulate**: Only the requesting user's tokens are deleted on each request. Expired tokens from users who never clicked are never purged. Fix: periodic cleanup or delete-on-read of expired rows.

## Deferred from: code review of stories 1.3–1.5 (2026-08-09)

- **Inconsistent API error contract**: `POST /api/v1/auth/token` hand-rolls `{ error: { code, message } }` with codes `invalid_request`/`invalid_credentials`, while every other `/api/v1` route uses `validation_error`/`unauthorized` via `src/lib/api-error.ts`. Clients can't handle errors uniformly. Pre-existing from story 1.1. Fix: route the token endpoint through a shared error shape (keep a distinct 401 code if desired).
- **Unknown errors bypass CORS + return bare 500**: `errorResponse` (`src/lib/api-error.ts`) re-throws non-typed errors before `withCors` runs, so the resulting 500 carries no CORS headers and no controlled JSON body. Server-fault path only; explicitly accepted in the story 1.2 review. Fix: wrap the re-throw path so a 500 still gets CORS + a JSON body.
- **No rate limiting / user-enumeration timing on `POST /api/v1/auth/token`**: bcrypt is skipped for unknown emails (fast return), leaking valid-email timing, and the endpoint has no throttle. Architecture §8 marks rate-limiting a fast-follow. Fix: apply the same IP-based limiter as web login and/or a constant-time path.
- **`Access-Control-Allow-Credentials: true` unnecessary for a Bearer API** (`src/lib/cors.ts`): the API authenticates only via `Authorization: Bearer` and never reads cookies, so enabling credentials only invites the browser to attach the Auth.js session cookie. Not the wildcard anti-pattern (origin is allow-listed). Pre-existing from 1.1. Fix: drop the credentials flag unless a future cookie-based web client needs it.
- **`tripDate` future-check timezone edge** (`src/services/trips.ts`): `new Date("YYYY-MM-DD")` parses as UTC midnight and is compared against a now-instant, so "today" can be falsely rejected as future for UTC-ahead clients. Near-zero impact for a Chicago/IL single-timezone personal app, and changing the shared validation risks web parity (NFR3). Fix (if ever multi-tz): compare date-only values in a fixed timezone.
