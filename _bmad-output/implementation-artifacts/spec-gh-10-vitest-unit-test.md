---
title: 'Vitest setup with formatHMM unit tests'
type: one-shot
created: '2026-04-26'
status: done
route: one-shot
---

# Vitest setup with formatHMM unit tests

## Intent

**Problem:** Vitest was in devDependencies but not configured, no `npm test` script existed, and `formatHMM` was duplicated inline across three files with no test coverage.

**Approach:** Extracted `formatHMM` to `src/lib/utils.ts` as a named export, replaced the three inline definitions with imports, added `"test": "vitest"` to `package.json`, and created `src/lib/utils.test.ts` with 7 test cases covering the primary AC plus edge cases (zero, boundary, negative clamping, float truncation).

## Suggested Review Order

1. [src/lib/utils.ts](../../src/lib/utils.ts) — extracted function + JSDoc precondition
2. [src/lib/utils.test.ts](../../src/lib/utils.test.ts) — 7 test cases
3. [package.json](../../package.json) — `"test": "vitest"` added to scripts
4. [src/app/(app)/dashboard/page.tsx](../../src/app/(app)/dashboard/page.tsx) — inline removed, import added
5. [src/app/(app)/report/page.tsx](../../src/app/(app)/report/page.tsx) — inline removed, import added
6. [src/app/api/report/pdf/document.tsx](../../src/app/api/report/pdf/document.tsx) — inline removed, import added
