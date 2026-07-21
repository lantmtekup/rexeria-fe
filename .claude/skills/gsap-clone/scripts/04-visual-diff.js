#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Visual diff for GSAP clones — scrolls both pages in fixed-pixel steps
 * (matches GSAP's pixel-driven start/end positions better than %), shoots
 * each step, runs pixelmatch, and writes report.html with side-by-side gallery.
 *
 * Usage:
 *   node 04-visual-diff.js <ORIGINAL_URL> <CLONE_URL> [output_dir] [step_px]
 *
 * Defaults: output_dir=./diff   step_px=200
 *
 * Peer deps (install in working dir, not the skill):
 *   pnpm add -D playwright pixelmatch pngjs
 *   npx playwright install chromium
 */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

// Resolve deps from the current working directory's node_modules first, so
// users don't have to set NODE_PATH when invoking this script from outside
// the skill folder. Falls back to the script's own require chain.
const cwdRequire = createRequire(path.join(process.cwd(), '__noop.js'));
function loadDep(name) {
  try {
    return cwdRequire(name);
  } catch {
    return require(name);
  }
}

let playwright, pixelmatch, PNG;
try {
  playwright = loadDep('playwright');
  const pm = loadDep('pixelmatch');
  pixelmatch = typeof pm === 'function' ? pm : pm.default || pm;
  PNG = loadDep('pngjs').PNG;
} catch {
  console.error(
    'Missing deps. In the clone working dir, run:\n' +
      '  pnpm add -D playwright pixelmatch pngjs\n' +
      '  npx playwright install chromium'
  );
  process.exit(1);
}

const [ORIG, CLONE, OUT = './diff', STEP_PX = '200'] = process.argv.slice(2);
if (!ORIG || !CLONE) {
  console.error(
    'usage: 04-visual-diff.js <ORIGINAL_URL> <CLONE_URL> [output_dir] [step_px]'
  );
  process.exit(1);
}
const STEP = Math.max(50, parseInt(STEP_PX, 10) || 200);
const VIEWPORT = { width: 1440, height: 900 };

fs.mkdirSync(OUT, { recursive: true });

async function shotAtY(page, y, p) {
  await page.evaluate(async yy => {
    window.scrollTo({ top: yy, left: 0, behavior: 'auto' });
    await new Promise(r => setTimeout(r, 800));
  }, y);
  await page.screenshot({ path: p, fullPage: false });
}

function diffPngs(aPath, bPath) {
  const a = PNG.sync.read(fs.readFileSync(aPath));
  const b = PNG.sync.read(fs.readFileSync(bPath));
  const { width, height } = a;
  if (b.width !== width || b.height !== height) {
    const cb = new PNG({ width, height });
    for (let y = 0; y < Math.min(height, b.height); y++) {
      for (let x = 0; x < Math.min(width, b.width); x++) {
        const i = (y * width + x) * 4;
        const j = (y * b.width + x) * 4;
        cb.data[i] = b.data[j];
        cb.data[i + 1] = b.data[j + 1];
        cb.data[i + 2] = b.data[j + 2];
        cb.data[i + 3] = b.data[j + 3];
      }
    }
    b.data = cb.data;
    b.width = width;
    b.height = height;
  }
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(a.data, b.data, diff.data, width, height, {
    threshold: 0.12,
    alpha: 0.35,
  });
  return { diff, similarity: 1 - mismatched / (width * height) };
}

(async () => {
  const browser = await playwright.chromium.launch();
  const [ctxA, ctxB] = await Promise.all([
    browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 }),
    browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 }),
  ]);
  const [pageA, pageB] = await Promise.all([ctxA.newPage(), ctxB.newPage()]);

  console.log(`→ loading ${ORIG}`);
  await pageA.goto(ORIG, { waitUntil: 'networkidle', timeout: 60000 });
  console.log(`→ loading ${CLONE}`);
  await pageB.goto(CLONE, { waitUntil: 'networkidle', timeout: 60000 });

  // Determine page heights
  const [ha, hb] = await Promise.all([
    pageA.evaluate(() => document.documentElement.scrollHeight),
    pageB.evaluate(() => document.documentElement.scrollHeight),
  ]);
  const H = Math.min(ha, hb);
  const checkpoints = [];
  for (let y = 0; y < H - VIEWPORT.height; y += STEP) checkpoints.push(y);
  checkpoints.push(H - VIEWPORT.height);
  console.log(
    `→ ${checkpoints.length} checkpoints (every ${STEP}px, page ≈ ${H}px)`
  );

  await Promise.all([
    pageA.evaluate(() => window.scrollTo(0, 0)),
    pageB.evaluate(() => window.scrollTo(0, 0)),
  ]);
  await pageA.waitForTimeout(600);

  const report = [];
  for (let i = 0; i < checkpoints.length; i++) {
    const y = checkpoints[i];
    const id = String(i).padStart(3, '0');
    const aPath = path.join(OUT, `orig-${id}.png`);
    const bPath = path.join(OUT, `clone-${id}.png`);
    const dPath = path.join(OUT, `diff-${id}.png`);
    process.stdout.write(`  cp ${i + 1}/${checkpoints.length}  y=${y}px … `);
    await Promise.all([shotAtY(pageA, y, aPath), shotAtY(pageB, y, bPath)]);
    const { diff, similarity } = diffPngs(aPath, bPath);
    fs.writeFileSync(dPath, PNG.sync.write(diff));
    report.push({
      i,
      y,
      similarity: Number(similarity.toFixed(4)),
      orig: path.basename(aPath),
      clone: path.basename(bPath),
      diff: path.basename(dPath),
    });
    console.log(`${(similarity * 100).toFixed(2)}%`);
  }

  const avg = report.reduce((s, r) => s + r.similarity, 0) / report.length;
  fs.writeFileSync(
    path.join(OUT, 'report.json'),
    JSON.stringify(
      {
        original: ORIG,
        clone: CLONE,
        viewport: VIEWPORT,
        avgSimilarity: avg,
        checkpoints: report,
      },
      null,
      2
    )
  );

  // Self-contained HTML report
  const rows = report
    .map(
      r => `
    <tr class="${r.similarity < 0.95 ? 'low' : ''}">
      <td>${r.i}</td><td>${r.y}px</td>
      <td>${(r.similarity * 100).toFixed(2)}%</td>
      <td><img src="${r.orig}" /></td>
      <td><img src="${r.clone}" /></td>
      <td><img src="${r.diff}" /></td>
    </tr>`
    )
    .join('');
  const html = `<!doctype html><meta charset="utf-8"><title>visual diff</title>
<style>
  body{font:14px/1.4 system-ui;margin:24px;background:#0f1115;color:#e5e7eb}
  h1{margin:0 0 6px}
  .sum{color:#9ca3af;margin-bottom:18px}
  table{border-collapse:collapse;width:100%}
  th,td{padding:8px;border-bottom:1px solid #222;text-align:left;vertical-align:top}
  td img{display:block;max-width:360px;height:auto;border:1px solid #222}
  tr.low td:nth-child(3){color:#f87171;font-weight:600}
</style>
<h1>visual diff: clone vs original</h1>
<div class="sum">avg similarity <b>${(avg * 100).toFixed(2)}%</b> · ${report.filter(r => r.similarity < 0.95).length} below 95%</div>
<table><thead><tr><th>#</th><th>y</th><th>%</th><th>original</th><th>clone</th><th>diff</th></tr></thead>
<tbody>${rows}</tbody></table>`;
  fs.writeFileSync(path.join(OUT, 'report.html'), html);

  console.log(
    `\nAvg: ${(avg * 100).toFixed(2)}%   report → ${path.join(OUT, 'report.html')}`
  );
  const low = report.filter(r => r.similarity < 0.95);
  if (low.length) {
    console.log(
      `Below 95%: ${low.length} checkpoint(s) — iterate on lowest first:`
    );
    for (const r of low
      .sort((a, b) => a.similarity - b.similarity)
      .slice(0, 5)) {
      console.log(
        `  cp ${r.i} @ y=${r.y}px — ${(r.similarity * 100).toFixed(2)}%`
      );
    }
  } else {
    console.log('All ≥ 95% — ship it.');
  }
  await browser.close();
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
