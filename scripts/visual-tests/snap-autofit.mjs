// Verify auto-fit zoom on mount + device change.
import { chromium } from 'playwright';

const base = 'http://localhost:3000';
const url = `${base}/canvas-templates/e3e3e3e3-2000-0000-0000-000000000001`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Read zoom value from the slider/label
const readZoom = async () => {
  return await page.evaluate(() => {
    // BlockTabBar shows zoom % as text like "75%" near the slider
    const els = Array.from(document.querySelectorAll('*'));
    const m = els.find(e => /^\d{1,3}%$/.test(e.textContent?.trim() || ''));
    return m?.textContent?.trim() ?? null;
  });
};

console.log('Initial zoom (desktop):', await readZoom());
await page.screenshot({
  path: 'scripts/visual-tests/out/autofit-1-desktop.png',
});

await page.getByRole('button', { name: 'Tablet' }).first().click();
await page.waitForTimeout(500);
console.log('After Tablet:', await readZoom());
await page.screenshot({
  path: 'scripts/visual-tests/out/autofit-2-tablet.png',
});

await page.getByRole('button', { name: 'Mobile' }).first().click();
await page.waitForTimeout(500);
console.log('After Mobile:', await readZoom());
await page.screenshot({
  path: 'scripts/visual-tests/out/autofit-3-mobile.png',
});

await browser.close();
