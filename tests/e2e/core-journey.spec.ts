import { test, expect } from '@playwright/test';

// Full journey covers server startup + 6 page loads — 90s is ample.
test.setTimeout(90_000);

test('core journey: register, add student, log trip, verify trips list, view report', async ({ page }) => {
  const ts = Date.now();
  const parentEmail = `parent-${ts}@example.com`;
  const studentEmail = `student-${ts}@example.com`;
  const password = 'testpassword123';
  const today = new Date().toISOString().split('T')[0];

  // --- Register as parent ---
  await page.goto('/register');
  await page.locator('[name="name"]').fill('Test Parent');
  await page.locator('[name="email"]').fill(parentEmail);
  await page.locator('[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page).toHaveURL('/dashboard');

  // --- Add a student ---
  await page.getByRole('link', { name: '+ Add a Student' }).click();
  await expect(page).toHaveURL('/students/new');
  await page.locator('[name="name"]').fill('Test Student');
  await page.locator('[name="email"]').fill(studentEmail);
  await page.locator('[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Add Student' }).click();
  // Wait for addStudentAction to complete and redirect to /dashboard.
  await expect(page).toHaveURL('/dashboard', { timeout: 15_000 });
  // The redirect uses client-side navigation which can serve a cached AppLayout
  // (pre-student). A full reload forces the layout to re-fetch with the new student.
  await page.reload();

  // The select only appears when a student exists. Trigger selectStudentAction
  // so the selected_student_id cookie is written before we log a trip.
  const studentSelect = page.locator('select').first();
  await studentSelect.waitFor({ state: 'visible', timeout: 15_000 });
  await studentSelect.selectOption({ index: 0 });
  await page.waitForLoadState('networkidle');

  // --- Log a trip ---
  await page.goto('/trips/new');
  await page.locator('[name="tripDate"]').fill(today);
  await page.locator('[name="locationType"]').selectOption('highway');
  await page.locator('[name="weather"]').selectOption('clear');
  await page.locator('[name="daytimeMinutes"]').fill('60');
  await page.getByRole('button', { name: 'Log Trip' }).click();
  await expect(page.getByText('Trip Logged')).toBeVisible();

  // --- Verify trip appears in trips list ---
  await page.goto('/trips');
  await expect(page.getByRole('cell', { name: 'Highway' })).toBeVisible();

  // --- Verify trip appears in report ---
  await page.goto('/report');
  await expect(page.getByRole('cell', { name: 'Highway' })).toBeVisible();
  // 60 daytime minutes displays as 1:00 in the report table
  await expect(page.getByRole('cell', { name: '1:00' }).first()).toBeVisible();
});
