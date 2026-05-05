// Interactive E2E for /product/new/information — fills fields, clicks Save,
// reports network responses + every stdout line.
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SignJWT } from 'jose';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');
await mkdir(OUT, { recursive: true });

const base = process.env.BASE_URL ?? 'http://localhost:3000';
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

const token = await new SignJWT({ sub: 'dev-capture', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(new TextEncoder().encode(jwtSecret));

const log = (...a) =>
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
await ctx.addCookies([
  { name: '_access_token', value: token, domain: 'localhost', path: '/' },
]);
const page = await ctx.newPage();

page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warn')
    log('[browser]', msg.type(), msg.text());
});
page.on('pageerror', err => log('[pageerror]', err.message));
page.on('response', async res => {
  const url = res.url();
  if (url.includes('/api/products')) {
    let body = '';
    try {
      body = await res.text();
    } catch {}
    log(
      `[network] ${res.request().method()} ${url} → ${res.status()} ${body.slice(0, 200)}`
    );
  }
});

const url = `${base}/product/new/information`;
log('→ GOTO', url);
await page.goto(url, { waitUntil: 'networkidle' });
log('→ landed', page.url());
await page.screenshot({ path: join(OUT, 'pn-01-initial.png') });

// 1) type Product Name
log('→ type Product Name');
const nameInput = page.locator('input[placeholder="Product Name"]');
await nameInput.fill('Test Shoe 01');
await page.waitForTimeout(150);

// 2) Category dropdown
log('→ open Category');
await page.getByText('Select your category').click();
await page.waitForTimeout(150);
await page.getByRole('button', { name: 'Fashion', exact: true }).click();

// 3) Description
log('→ type Description');
await page
  .locator('input[placeholder="Describe something"]')
  .fill('A nice shoe');

// 4) SKU
log('→ type SKU');
await page.locator('input[placeholder="Select your SKU"]').fill('SKU-001');

// 5) Size
log('→ add size S, M, L');
const sizeInput = page.getByTestId('size-input');
for (const s of ['S', 'M', 'L']) {
  await sizeInput.click();
  await page.keyboard.type(s);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(120);
}

// 6) Color — click the + button
log('→ add color');
// The color + button is inside a FieldShell labeled "Color"
await page.getByRole('button', { name: 'Add color' }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: join(OUT, 'pn-02-color-popover.png') });
// Click preset "Red"
await page.locator('button[title="Red"]').click();
await page.locator('button[title="Blue"]').click();

// 7) Variant / Ingredients / Certifications — now multi-tag
const addTags = async (testId, tags) => {
  const field = page.getByTestId(testId);
  for (const t of tags) {
    await field.click();
    await page.keyboard.type(t);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
  }
};
log('→ add variants V-01, V-02');
await addTags('variant-input', ['V-01', 'V-02']);
log('→ add ingredients Leather, Rubber');
await addTags('ingredients-input', ['Leather', 'Rubber']);
log('→ add certifications ISO-9001, FDA');
await addTags('certifications-input', ['ISO-9001', 'FDA']);

await page.screenshot({ path: join(OUT, 'pn-03-filled.png') });

// 8) Click Save
log('→ click Save');
const saveBtn = page.getByRole('button', { name: /^Save$/i });
await saveBtn.click();

// Wait for network / navigation
await page.waitForTimeout(2500);
log('→ after save, url =', page.url());
await page.screenshot({ path: join(OUT, 'pn-04-after-save.png') });

await browser.close();
log('DONE. Screenshots in', OUT);
