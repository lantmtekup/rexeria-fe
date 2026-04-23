import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on('console', m => {
  const t = m.type();
  if (t === 'error' || t === 'warning') console.log('[console]', t, m.text());
});
page.on('pageerror', e => console.log('[pageerror]', e.message));
page.on('requestfailed', r =>
  console.log('[reqfailed]', r.url(), r.failure()?.errorText)
);

console.log('1) goto /sign-in');
await page.goto(base + '/sign-in', { waitUntil: 'load' });
console.log('   url=', page.url());

await page.waitForSelector('input[type=email]', { timeout: 20000 });

console.log('2) submit form');
await page.locator('form button[type=submit]').first().click();

await page
  .waitForURL(/\/home/, { timeout: 20000 })
  .catch(e => console.log('  [waitURL]', e.message));
console.log('3) after login url=', page.url());

await page.waitForTimeout(2500);

const greeting = await page
  .locator('h1')
  .first()
  .textContent()
  .catch(() => null);
console.log('   greeting h1:', greeting);

await page.screenshot({
  path: 'scripts/visual-tests/out/home-smoke.png',
  fullPage: false,
});
console.log('4) screenshot saved');

const me = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/auth/me', { credentials: 'include' });
  return { status: r.status, body: await r.text() };
});
console.log('5) /auth/me:', me.status, me.body.slice(0, 300));

const sum = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/dashboard/summary', {
    credentials: 'include',
  });
  return { status: r.status, body: await r.text() };
});
console.log('6) /dashboard/summary:', sum.status, sum.body.slice(0, 300));

const tpl = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/templates', { credentials: 'include' });
  return { status: r.status, body: await r.text() };
});
console.log('7) /templates:', tpl.status, tpl.body.slice(0, 300));

const prj = await page.evaluate(async () => {
  const r = await fetch('/api/rexer/projects', { credentials: 'include' });
  return { status: r.status, body: await r.text() };
});
console.log('8) /projects:', prj.status, prj.body.slice(0, 300));

const account = await page.locator('aside button span').allTextContents();
console.log('9) sidebar account labels:', account.slice(0, 6));

await browser.close();
