---
title: 'Forgot password / password reset flow'
type: 'feature'
created: '2026-04-26'
status: 'done'
baseline_commit: '2af0a405a05168db0bd0b2fb654d3ca067404ced'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Users who forget their password are permanently locked out — no recovery path exists before public launch.

**Approach:** Classic token-based reset flow using Resend for email delivery. Raw token travels in the email link; only a SHA-256 hash is stored in the DB. Tokens expire after 1 hour and are invalidated after use.

## Boundaries & Constraints

**Always:**
- Store only the SHA-256 hash of the token — never the raw token
- Always return the same success message whether or not the email exists (prevent enumeration)
- Tokens expire after 1 hour; used tokens are immediately invalidated
- New reset request deletes all prior tokens for that user
- Password minimum 8 characters; bcrypt 12 rounds
- Derive base URL from `x-forwarded-host` / `host` headers — no new env var needed

**Ask First:**
- If Resend rejects the `RESEND_FROM` address (domain not verified), surface a clear deploy-time error rather than silently swallowing it

**Never:**
- Expose whether an email is registered
- Allow a token to be used more than once
- Build OAuth / magic-link login (v1.0 scope)

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path — request | Valid email, user exists | "If that email is registered, you'll receive a link shortly." | — |
| Unknown email | Email not in DB | Same success message | Silently no-op |
| Happy path — reset | Valid unexpired token, password ≥ 8 chars | Password updated, token invalidated, redirect to /login?reset=1 | — |
| Expired token | Token older than 1 hour | "This link has expired. Request a new one." with link to /forgot-password | — |
| Already-used token | `used_at` IS NOT NULL | Same expired error message | — |
| Invalid token | Hash not found | Same expired error message | — |
| Password too short | < 8 characters | "Password must be at least 8 characters." | Stays on page |
| No token in URL | /reset-password with no `?token=` | "Invalid reset link." with link to /forgot-password | — |

</frozen-after-approval>

## Code Map

- `src/db/schema.ts` — add `passwordResetTokens` table
- `src/app/(auth)/forgot-password/page.tsx` — email entry form (Client Component)
- `src/app/(auth)/forgot-password/actions.ts` — create token, send email via Resend
- `src/app/(auth)/reset-password/page.tsx` — new password form; reads `token` from async `searchParams`
- `src/app/(auth)/reset-password/actions.ts` — validate token, update password, invalidate token
- `src/app/(auth)/login/page.tsx` — add "Forgot password?" link
- `src/middleware.ts` — add `/forgot-password` and `/reset-password` to public matcher exclusions
- `package.json` — add `resend` dependency

## Tasks & Acceptance

**Execution:**
- [x] `src/db/schema.ts` — add `passwordResetTokens` table (`id`, `userId` FK→users cascade, `tokenHash` unique, `expiresAt`, `usedAt`, `createdAt`)
- [x] run `npm run db:generate` then `npm run db:migrate` to apply schema
- [x] `package.json` — `npm install resend`
- [x] `src/app/(auth)/forgot-password/actions.ts` — `requestPasswordResetAction`: look up user, generate `crypto.randomBytes(32).toString('hex')`, store SHA-256 hash with `expiresAt = now + 1h`, send Resend email, always return success message
- [x] `src/app/(auth)/forgot-password/page.tsx` — Client Component with `useActionState`; match login page highway sign aesthetic
- [x] `src/app/(auth)/reset-password/actions.ts` — `resetPasswordAction`: hash received token, find valid (unexpired, unused) row, validate password length, bcrypt-hash new password, update user, mark token `used_at`, redirect to `/login?reset=1`
- [x] `src/app/(auth)/reset-password/page.tsx` — Server Component awaits `searchParams`; if no token render "Invalid link"; passes token to `ResetPasswordForm` Client Component
- [x] `src/app/(auth)/login/page.tsx` — add `<Link href="/forgot-password">` beside the password label
- [x] `middleware.ts` — add `forgot-password` and `reset-password` to the matcher exclusion regex

**Acceptance Criteria:**
- Given a registered email is submitted, when the action runs, then the response always reads "If that email is registered, you'll receive a link shortly."
- Given a valid reset link, when a new password ≥ 8 chars is submitted, then the user can log in with the new password and the link is invalidated
- Given an expired, used, or invalid token, when the reset page loads or the form is submitted, then a clear error appears with a link back to /forgot-password

## Design Notes

**Token flow:**
```
raw = crypto.randomBytes(32).toString('hex')        // sent in email URL
hash = sha256(raw)                                   // stored in DB
reset URL: /reset-password?token={raw}
On reset: sha256(req.token) → DB lookup
```

**Resend setup (required before deploy):**
1. Create account at resend.com
2. Add `RESEND_API_KEY` to Vercel env vars
3. Add `RESEND_FROM` to Vercel env vars — use `onboarding@resend.dev` for testing, or a verified domain address for production

**Base URL derivation (no extra env var):**
```ts
const hdrs = await headers();
const host = hdrs.get('x-forwarded-host') ?? hdrs.get('host') ?? 'localhost:3000';
const proto = hdrs.get('x-forwarded-proto') ?? 'http';
const resetUrl = `${proto}://${host}/reset-password?token=${raw}`;
```

## Verification

**Commands:**
- `npm run db:generate` — expected: new migration file in drizzle/
- `npm run db:migrate` — expected: migration applied, no errors
- `npm test -- --run` — expected: all tests pass

**Manual checks:**
- Submit forgot-password form → email arrives within ~5s
- Reset link works once; second use shows expired error
- /reset-password with no `?token=` shows invalid link message
- /forgot-password and /reset-password are accessible without login

## Suggested Review Order

**Security core — token lifecycle**

- Entry point: raw→hash split, token stored hashed, raw sent only in email
  [`actions.ts:30`](../../src/app/(auth)/forgot-password/actions.ts#L30)

- Expiry + used check pushed to SQL WHERE clause (not app-side comparison)
  [`actions.ts:27`](../../src/app/(auth)/reset-password/actions.ts#L27)

- Atomic password update + token invalidation in one transaction
  [`actions.ts:44`](../../src/app/(auth)/reset-password/actions.ts#L44)

- Delete + insert wrapped in transaction — prevents race on concurrent requests
  [`actions.ts:35`](../../src/app/(auth)/forgot-password/actions.ts#L35)

- Resend failure caught silently — prevents leaking whether email exists
  [`actions.ts:48`](../../src/app/(auth)/forgot-password/actions.ts#L48)

- HTML-escape user.name before interpolating into email body
  [`actions.ts:46`](../../src/app/(auth)/forgot-password/actions.ts#L46)

**Schema**

- New `password_reset_tokens` table — tokenHash unique, cascade on user delete
  [`schema.ts:40`](../../src/db/schema.ts#L40)

**Pages + UI**

- Server Component awaits searchParams, passes token to Client Component or renders invalid-link state
  [`page.tsx:1`](../../src/app/(auth)/reset-password/page.tsx#L1)

- Hidden token input binds URL param to form submission
  [`reset-password-form.tsx:12`](../../src/app/(auth)/reset-password/reset-password-form.tsx#L12)

- "Forgot?" link added inline with Password label
  [`page.tsx:87`](../../src/app/(auth)/login/page.tsx#L87)

**Config**

- Middleware exclusion for /forgot-password and /reset-password
  [`middleware.ts:16`](../../middleware.ts#L16)
