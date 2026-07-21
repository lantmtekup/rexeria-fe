// Verify the Templates tab actually fetches from BE swagger endpoint.
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { SignJWT } from 'jose';

const base = 'http://localhost:3000';

const envText = await readFile(new URL('../../.env', import.meta.url), 'utf8');
const envMap = Object.fromEntries(
  envText
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const jwtSecret = envMap.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT_SECRET missing');
const secret = new TextEncoder().encode(jwtSecret);
const token = await new SignJWT({ sub: 'dev-capture', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(secret);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await ctx.addCookies([
  { name: '_access_token', value: token, domain: 'localhost', path: '/' },
]);

const page = await ctx.newPage();

let listReq = null;
let listRespStatus = null;
let listRespBody = null;
page.on('request', req => {
  if (req.url().includes('/products') && req.method() === 'GET') {
    const u = new URL(req.url());
    if (u.searchParams.has('is_template')) {
      listReq = u.toString();
    }
  }
});
page.on('response', async resp => {
  if (
    resp.request().method() === 'GET' &&
    resp.url().includes('/products') &&
    resp.url().includes('is_template=true')
  ) {
    listRespStatus = resp.status();
    try {
      listRespBody = await resp.text();
    } catch {}
  }
});

page.on('console', m => {
  if (m.type() === 'error') console.log('[err]', m.text().slice(0, 150));
});

await page.goto(`${base}/product`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Click "Templates" tab
const tabBtn = page.getByRole('button', { name: /Templates/i }).first();
if (await tabBtn.count()) {
  await tabBtn.click();
  await page.waitForTimeout(2000);
}

console.log('=== Templates list request ===');
console.log('URL:', listReq);
console.log('Status:', listRespStatus);
if (listRespStatus && listRespStatus >= 400) {
  console.log('Body:', listRespBody?.slice(0, 400));
} else if (listRespBody) {
  try {
    const json = JSON.parse(listRespBody);
    console.log('items count:', json.items?.length ?? '(no items)');
    if (json.items?.[0]) {
      console.log('first item id:', json.items[0].id);
      console.log('first item is_template:', json.items[0].is_template);
      console.log('first item name:', json.items[0].name);
    }
  } catch {
    console.log('body:', listRespBody.slice(0, 200));
  }
}

await page.screenshot({
  path: 'scripts/visual-tests/out/product-templates-tab.png',
});
console.log('saved screenshot');

await browser.close();
