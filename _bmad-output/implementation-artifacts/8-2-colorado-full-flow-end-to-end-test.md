# Story 8.2: Colorado Full-Flow End-to-End Test

Status: ready-for-dev

## Story

As a developer,
I want an E2E test covering the complete CO user flow,
so that the most critical multi-state path is regression-protected across register, log, dashboard, report, and PDF.

## Acceptance Criteria

1. E2E test registers a CO user, logs a trip, checks dashboard, checks report, and downloads a PDF — all 5 steps pass
2. Test ships in the same PR as the CO state config entry in `src/data/state-configs.ts`
3. Test uses isolated `test.db`, not `local.db` or Turso production
4. `AUTH_TRUST_HOST=1` and `AUTH_URL=http://localhost:3001` are set in the Playwright webServer env
5. `npm run test:e2e` passes with this test included

## Tasks / Subtasks

- [ ] Verify CO state config is in `src/data/state-configs.ts` (from Story 1.2) — if not, add it in this PR
- [ ] Create `tests/e2e/multi-state-co.spec.ts` with all 5 steps (AC: 1)
- [ ] Run `npm run test:e2e` to verify all E2E tests pass (AC: 5)

## Dev Notes

### Prerequisites

All functional stories (1.1–7.1) must be complete. CO state config must be in `STATE_CONFIGS` (Story 1.2 — must ship in same PR if not already done).

### Playwright Configuration

Read `playwright.config.ts` before writing the test. Key facts:
- Port: **3001** (not 3000)
- Requires production build: `npm run build` then `npm run test:e2e`
- Test database: `file:./test.db` (set up by global-setup, torn down by global-teardown)
- `AUTH_TRUST_HOST=1` and `AUTH_URL=http://localhost:3001` in webServer env
- After redirects from Server Actions, may need `page.reload()` to bypass router cache

### Complete E2E Test

```typescript
// tests/e2e/multi-state-co.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Colorado full flow', () => {
  const email = `co-test-${Date.now()}@example.com`;
  const password = 'testpass123';
  const driverName = 'Test Driver CO';

  test('register with CO state', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/name/i).fill(driverName);
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);

    // Select Colorado from state dropdown
    await page.getByRole('combobox', { name: /state/i }).click();
    await page.getByRole('option', { name: 'Colorado' }).click();

    // Verify state summary card shows CO requirements
    await expect(page.getByText('50')).toBeVisible();  // total hours
    await expect(page.getByText('10')).toBeVisible();  // night hours
    await expect(page.getByText(/supervisor/i)).toBeVisible();

    await page.getByRole('button', { name: /create account/i }).click();
    await page.waitForURL('/dashboard');
  });

  test('log a trip with supervisor name (CO requires it)', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/dashboard');

    await page.goto('/trips/new');

    // Supervisor name field should be visible for CO
    await expect(page.getByLabel(/supervisor name/i)).toBeVisible();

    // Fill the form
    const today = new Date().toISOString().split('T')[0];
    await page.getByLabel(/date/i).fill(today);
    await page.getByLabel(/location/i).selectOption({ label: 'Highway' });
    await page.getByLabel(/weather/i).selectOption({ label: 'Clear' });
    await page.getByLabel(/daytime/i).fill('60');
    await page.getByLabel(/supervisor name/i).fill('Jane Supervisor');

    await page.getByRole('button', { name: /log trip/i }).click();
    await page.waitForURL('/trips');
    await expect(page.getByText('Highway')).toBeVisible();
  });

  test('dashboard shows CO targets', async ({ page }) => {
    await page.goto('/dashboard');

    // CO requires 50 hours total, 10 night
    await expect(page.getByText(/50/)).toBeVisible();
    await expect(page.getByText(/Colorado Requirements/i)).toBeVisible();
  });

  test('report shows CO columns including supervisor', async ({ page }) => {
    await page.goto('/report');

    // CO report_columns include supervisor name
    await expect(page.getByRole('columnheader', { name: /supervisor/i })).toBeVisible();
    await expect(page.getByText('Colorado Practice Driving Log')).toBeVisible();
  });

  test('PDF download responds with correct content type and filename', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: /download pdf/i }).click(),
    ]);
    const today = new Date().toISOString().split('T')[0];
    expect(download.suggestedFilename()).toMatch(/driving-log-CO-\d{4}-\d{2}-\d{2}\.pdf/);
  });
});
```

### Test Isolation

The test uses a unique email per run (`Date.now()`). Playwright's global-setup creates `test.db` fresh before the suite — no state from previous runs. Do not use `local.db`.

### Auth and Redirect Handling

After Server Action redirects (e.g., post-registration), `page.waitForURL()` waits for the new URL. If the dashboard or trips page shows stale data due to Next.js router cache, add `await page.reload()` before assertions.

### If test:e2e Fails on Build Step

In CI, the build step runs before E2E. Playwright's `webServer.reuseExistingServer = !process.env.CI` means CI always builds fresh. Run `npm run build` locally before `npm run test:e2e` if testing locally.

### References

- Playwright config: `playwright.config.ts`
- Existing E2E tests: `tests/e2e/auth.spec.ts`
- CO state config: `src/data/state-configs.ts` (Story 1.2)
- Architecture NFR8: CO full-flow E2E requirement

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
