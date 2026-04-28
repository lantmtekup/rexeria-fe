// Verify gộp Collections vào Template page.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });
const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Login
await page.goto(BASE + '/sign-in', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('input[type=email]');
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 15000 });

// 1) Sidebar should NOT have "Collections" entry anymore
const collectionsInSidebar = await page
  .locator('aside a[href="/collections"]')
  .count();
log('sidebar /collections links:', collectionsInSidebar);

// 2) /template page should render with 2 tabs
log('GOTO /template');
await page.goto(BASE + '/template', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
const tabLanding = await page
  .getByRole('tab', { name: /Landing templates/ })
  .first()
  .isVisible()
  .catch(() => false);
const tabData = await page
  .getByRole('tab', { name: /Data collections/ })
  .first()
  .isVisible()
  .catch(() => false);
log('tab Landing:', tabLanding, '· tab Data:', tabData);
await page.screenshot({ path: join(OUT, 'merge-01-template-landing.png') });

// 3) Click Data tab → CollectionList should render
log('click Data tab');
await page.getByRole('tab', { name: /Data collections/ }).first().click();
await page.waitForTimeout(1200);
const dataHeader = await page
  .getByText(/Collections/)
  .first()
  .isVisible()
  .catch(() => false);
const newBtn = await page
  .getByRole('button', { name: /New collection/ })
  .first()
  .isVisible()
  .catch(() => false);
log('Data tab — header visible:', dataHeader, '· New collection btn:', newBtn);
await page.screenshot({ path: join(OUT, 'merge-02-template-data.png') });

// 4) /collections route still works (kept for detail nav)
log('GOTO /collections (legacy direct route)');
await page.goto(BASE + '/collections', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1000);
const directOK = await page
  .getByText(/Collections/)
  .first()
  .isVisible()
  .catch(() => false);
log('legacy /collections still renders:', directOK);

await browser.close();

const lines = [
  `sidebar /collections removed: ${collectionsInSidebar === 0 ? 'PASS' : 'FAIL'}`,
  `tab Landing visible: ${tabLanding ? 'PASS' : 'FAIL'}`,
  `tab Data visible: ${tabData ? 'PASS' : 'FAIL'}`,
  `Data tab renders CollectionList: ${dataHeader && newBtn ? 'PASS' : 'FAIL'}`,
  `/collections legacy route still works: ${directOK ? 'PASS' : 'FAIL'}`,
];
console.log('\n' + lines.join('\n'));
