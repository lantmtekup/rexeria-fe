import { defineConfig, devices } from 'playwright/test';

/**
 * Playwright config for Rexer canvas editor E2E.
 *
 * - Reuses an existing dev server on :3000 if already running.
 * - Tests run against the live cloudflare tunnel BE (must be up).
 * - Auth state is captured once via `auth.setup.ts` and reused.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
