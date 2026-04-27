---
title: 'Playwright e2e — core user journey'
type: one-shot
created: '2026-04-26'
status: done
route: one-shot
---

# Playwright e2e — core user journey

## Intent

**Problem:** No e2e test coverage existed; Playwright was in devDependencies but unconfigured.

**Approach:** Added `playwright.config.ts` (port 3001, Node.js production server, isolated `test.db`), global setup/teardown for DB lifecycle, and one test covering register → add student → log trip → verify trips list → verify report. Three non-obvious issues resolved: (1) edge-runtime libSQL rejecting `file:` URLs fixed by adding `export const runtime = 'nodejs'` to middleware; (2) Auth.js `UntrustedHost` on port 3001 fixed via `AUTH_TRUST_HOST=1` and `AUTH_URL`; (3) Next.js router-cache serving stale AppLayout (pre-student) fixed with `page.reload()` after student creation.

## Suggested Review Order

1. [middleware.ts](../../middleware.ts) — `runtime = 'nodejs'` export (production correctness fix)
2. [playwright.config.ts](../../playwright.config.ts) — webServer config, env vars, port 3001
3. [tests/e2e/global-setup.ts](../../tests/e2e/global-setup.ts) — migration against test.db
4. [tests/e2e/global-teardown.ts](../../tests/e2e/global-teardown.ts) — cleanup
5. [tests/e2e/core-journey.spec.ts](../../tests/e2e/core-journey.spec.ts) — the test with inline comments on non-obvious steps
6. [package.json](../../package.json) — `test:e2e` script
7. [.gitignore](../../.gitignore) — `test.db` added
