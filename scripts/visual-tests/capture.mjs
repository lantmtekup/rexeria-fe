// Headless capture of every REXER UI screen for visual review.
// Run with: yarn visual:capture
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
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
const secret = new TextEncoder().encode(jwtSecret);
const token = await new SignJWT({ sub: 'dev-capture', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('2h')
  .sign(secret);

const DESKTOP = { w: 1440, h: 902 };

const pages = [
  // Auth (no login)
  { name: 'sign-in', path: '/sign-in', auth: false, ...DESKTOP },
  { name: 'sign-in-mobile', path: '/sign-in', auth: false, w: 390, h: 844 },

  // App shell + Home
  { name: 'home', path: '/home', auth: true, ...DESKTOP },

  // Product
  { name: 'product-list', path: '/product', auth: true, ...DESKTOP },
  { name: 'product-start', path: '/product/start', auth: true, ...DESKTOP },
  {
    name: 'product-information-new',
    path: '/product/new/information',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'product-information',
    path: '/product/abc/information',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'product-media-empty',
    path: '/product/new/media',
    auth: true,
    ...DESKTOP,
  },
  { name: 'product-media', path: '/product/abc/media', auth: true, ...DESKTOP },
  {
    name: 'product-marketing-empty',
    path: '/product/new/marketing',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'product-marketing-list',
    path: '/product/abc/marketing',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'marketing-discovery',
    path: '/product/abc/marketing/m1/discovery',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'marketing-concept',
    path: '/product/abc/marketing/m1/concept',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'marketing-assets',
    path: '/product/abc/marketing/m1/assets',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'marketing-campaign',
    path: '/product/abc/marketing/m1/campaign',
    auth: true,
    ...DESKTOP,
  },

  // Template
  { name: 'template-list', path: '/template', auth: true, ...DESKTOP },
  {
    name: 'template-preview',
    path: '/template/delvaux',
    auth: true,
    ...DESKTOP,
  },

  // AI-Agents
  { name: 'ai-agents-empty', path: '/ai-agents', auth: true, ...DESKTOP },
  { name: 'ai-agents-start', path: '/ai-agents/start', auth: true, ...DESKTOP },
  {
    name: 'ai-information',
    path: '/ai-agents/abc/information',
    auth: true,
    ...DESKTOP,
  },
  { name: 'ai-media', path: '/ai-agents/abc/media', auth: true, ...DESKTOP },
  {
    name: 'ai-discovery',
    path: '/ai-agents/abc/marketing/m1/discovery',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'ai-concept',
    path: '/ai-agents/abc/marketing/m1/concept',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'ai-assets',
    path: '/ai-agents/abc/marketing/m1/assets',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'ai-template',
    path: '/ai-agents/abc/template',
    auth: true,
    ...DESKTOP,
  },
  {
    name: 'ai-campaign',
    path: '/ai-agents/abc/campaign',
    auth: true,
    ...DESKTOP,
  },
];

const browser = await chromium.launch();
const results = [];

for (const p of pages) {
  const ctx = await browser.newContext({
    viewport: { width: p.w, height: p.h },
  });
  if (p.auth) {
    await ctx.addCookies([
      {
        name: '_access_token',
        value: token,
        domain: 'localhost',
        path: '/',
      },
    ]);
  }
  const page = await ctx.newPage();
  const url = `${base}${p.path}`;
  const row = { name: p.name, url, status: 0, final: '', ok: false };
  try {
    const res = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });
    row.status = res?.status() ?? 0;
    row.final = page.url();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: join(OUT, `${p.name}.png`),
      fullPage: false,
    });
    // For authed pages, a redirect back to /sign-in is a failure.
    // For unauthed pages, landing on /sign-in is expected.
    const redirectedToSignIn =
      new URL(row.final).pathname === '/sign-in' && p.path !== '/sign-in';
    row.ok = row.status === 200 && !redirectedToSignIn;
  } catch (err) {
    row.err = err.message;
  }
  await ctx.close();
  results.push(row);
  const flag = row.ok ? '✓' : '✗';
  console.log(
    `${flag} ${p.name.padEnd(28)} ${row.status}  ${row.final || row.err || ''}`
  );
}

await browser.close();

const fails = results.filter(r => !r.ok);
console.log(
  `\nDone. ${results.length - fails.length}/${results.length} pages OK.`
);
if (fails.length) {
  console.log('Failed:');
  fails.forEach(f =>
    console.log(`  - ${f.name}: ${f.status} ${f.final || f.err || ''}`)
  );
  process.exitCode = 1;
}
