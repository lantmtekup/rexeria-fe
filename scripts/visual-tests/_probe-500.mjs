import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
const errs = [];
const resps = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
page.on('console', m => {
  if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 300));
});
page.on('response', async r => {
  if (!r.ok() && r.url().includes('/api/rexer/')) {
    const body = await r.text().catch(() => '');
    resps.push(
      `${r.status()} ${r.url().replace('http://localhost:3003', '')} :: ${body.slice(0, 200)}`
    );
  }
});
await page.goto('http://localhost:3003/sign-in', { waitUntil: 'load' });
await page.waitForSelector('input[type=email]');
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 20000 }).catch(() => {});
await page.goto(
  'http://localhost:3003/ai-agents/eee60c59-efbe-46ae-a805-7c35bde02732/template',
  { waitUntil: 'load' }
);
await page.waitForTimeout(5000);
console.log('--- errors ---');
errs.forEach(e => console.log(e));
console.log('--- failed responses ---');
resps.forEach(r => console.log(r));
await browser.close();
