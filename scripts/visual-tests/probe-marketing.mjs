import { chromium } from 'playwright';

const base = 'http://localhost:3001';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();

await page.goto(`${base}/sign-in`, { waitUntil: 'load' });
await page.waitForTimeout(800);
await page.locator('form button[type=submit]').first().click();
await page.waitForURL(/\/home/, { timeout: 20000 }).catch(() => {});

const productsResp = await page.request.get(
  `${base}/api/rexer/products?limit=3`
);
const products = await productsResp.json();
console.log('--- products ---');
for (const p of products.items?.slice(0, 3) ?? []) {
  console.log(`${p.id}  ${p.name}`);
}

const firstProduct = products.items?.[0];
if (firstProduct) {
  const cResp = await page.request.get(
    `${base}/api/rexer/campaigns?product_id=${firstProduct.id}&limit=5`
  );
  console.log(`\n--- campaigns for ${firstProduct.id} (${cResp.status()}) ---`);
  const body = await cResp.text();
  console.log(body.slice(0, 1500));

  // Also try without product filter
  const cAll = await page.request.get(`${base}/api/rexer/campaigns?limit=5`);
  console.log(`\n--- campaigns ALL (${cAll.status()}) ---`);
  console.log((await cAll.text()).slice(0, 800));
}

await browser.close();
