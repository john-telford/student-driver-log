import { test, expect } from '@playwright/test';

// Public info pages must load signed out. /support and /privacy are the App
// Store listing's Support and Privacy Policy URLs, so a redirect to /login
// here would fail App Review.

test('/support is public and shows the support email', async ({ page }) => {
  await page.goto('/support');
  await expect(page).toHaveURL('/support');
  await expect(page.getByRole('heading', { level: 1, name: 'Support' })).toBeVisible();
  await expect(page.locator('main a[href="mailto:support@studentdriver.site"]')).toHaveText('support@studentdriver.site');
  await expect(page.locator('main a[href="/privacy"]')).toBeVisible();
});

test('/privacy is public and covers the iOS app', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page).toHaveURL('/privacy');
  await expect(page.locator('main')).toContainText('Teen Driver Log');
  await expect(page.locator('main')).toContainText('The iOS app contains no analytics and no tracking');
  await expect(page.locator('main')).toContainText('The iOS app cannot delete an account.');
  await expect(page.locator('main')).toContainText(
    "Deletion removes your data from our live database immediately and can't be undone.",
  );
});

test('/faq and /about no longer say there is no App Store app', async ({ page }) => {
  for (const path of ['/faq', '/about']) {
    await page.goto(path);
    await expect(page).toHaveURL(path);
    await expect(page.locator('main')).toContainText('Teen Driver Log');
    await expect(page.locator('main')).not.toContainText(/no App Store required|without any app store/i);
  }
});

// /login is App Review's first screen; its footer links are a plain div, not
// a <footer>, so find the one Support link by role on each page.
for (const path of ['/about', '/login']) {
  test(`${path} links to /support`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole('link', { name: 'Support', exact: true }).click();
    await expect(page).toHaveURL('/support');
  });
}
