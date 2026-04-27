import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  webServer: {
    // Port 3001 avoids conflict with the dev server on 3000.
    // next build is required before running tests locally (CI does it automatically).
    command: 'npm run build && npm start -- -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: 'file:./test.db',
      DATABASE_AUTH_TOKEN: '',
      AUTH_SECRET: 'test-secret-for-e2e-only-not-for-production',
      AUTH_URL: 'http://localhost:3001',
      AUTH_TRUST_HOST: '1',
    },
  },
});
