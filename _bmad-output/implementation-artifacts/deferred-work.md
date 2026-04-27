
## Deferred from #48 forgot-password (2026-04-26)

- **Rate limit /forgot-password**: No throttle on the unauthenticated endpoint — attacker can spam tokens and burn Resend quota. Fix: apply same IP-based rate limiting as login.
- **Confirm-password field on /reset-password**: Single password field; a typo locks the user out of the account they're recovering. Add a confirmation field.
- **Active sessions not invalidated on password change**: After `resetPasswordAction` updates `passwordHash`, existing JWT sessions for that user stay valid up to 8h. If the reset was triggered by a compromised account, the attacker's session survives. Fix: store `passwordChangedAt` on user and check it in the `jwt` callback.
- **Orphaned expired tokens accumulate**: Only the requesting user's tokens are deleted on each request. Expired tokens from users who never clicked are never purged. Fix: periodic cleanup or delete-on-read of expired rows.
