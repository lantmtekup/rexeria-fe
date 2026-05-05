import { expect, test as setup } from 'playwright/test';

const AUTH_FILE = 'tests/e2e/.auth/admin.json';

/**
 * Logs in once with the dev-prefilled admin creds and writes the storage
 * state so subsequent project tests reuse the session without re-logging.
 *
 * We bypass the UI form (which has prefilled defaults that fight with
 * Playwright's `.fill()`) by hitting the BE login endpoint and the local
 * session-mirror endpoint directly. Cookies set by these calls are what
 * the middleware actually checks.
 */
setup('authenticate as admin', async ({ page, baseURL }) => {
  const base = baseURL ?? 'http://localhost:3000';
  // Bootstrap an empty page so the browser context exists, then use
  // `page.request` so cookies set by these calls are stored in the same
  // browser context that subsequent navigation reads from.
  await page.goto(`${base}/sign-in`);

  const loginRes = await page.request.post(`${base}/api/rexer/auth/login`, {
    data: { email: 'admin@rexer.ai', password: 'Admin1234' },
  });
  expect(
    loginRes.ok(),
    `BE login should succeed (got ${loginRes.status()})`
  ).toBeTruthy();

  const sessionRes = await page.request.post(`${base}/api/auth/session-set`);
  expect(
    sessionRes.ok(),
    `session-set should succeed (got ${sessionRes.status()})`
  ).toBeTruthy();

  // Hop to /home to confirm cookies grant access through middleware.
  await page.goto('/home');
  await expect(page).not.toHaveURL(/\/sign-in/, { timeout: 15_000 });
  await page.context().storageState({ path: AUTH_FILE });
});
