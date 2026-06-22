#!/usr/bin/env node
/**
 * Side-by-side visual diff of two URLs using Playwright + pixelmatch.
 *
 * Opens both URLs in parallel Chromium contexts at the same viewport,
 * scrolls each to N evenly-spaced checkpoints, screenshots, diffs, and
 * writes `<out>/checkpoint-NN.png` (original | clone | diff) plus a
 * `report.json` with similarity scores.
 *
 * Usage:
 *   node visual-diff.js <ORIGINAL_URL> <CLONE_URL> [output_dir] [checkpoints]
 *
 * Defaults: output_dir=./diff   checkpoints=8
 *
 * Peer deps (install inside the working dir, not the skill):
 *   pnpm add -D playwright pixelmatch pngjs
 *   npx playwright install chromium
 */
const fs = require('node:fs');
const path = require('node:path');

let playwright, pixelmatch, PNG;
try {
  playwright = require('playwright');
  pixelmatch = require('pixelmatch');
  PNG = require('pngjs').PNG;
} catch (e) {
  console.error(
    'Missing deps. Install in the working dir:\n' +
      '  pnpm add -D playwright pixelmatch pngjs\n' +
      '  npx playwright install chromium',
  );
  process.exit(1);
}

const [ORIG, CLONE, OUT = './diff', CHECKPOINTS = '8'] = process.argv.slice(2);
if (!ORIG || !CLONE) {
  console.error(
    'usage: visual-diff.js <ORIGINAL_URL> <CLONE_URL> [output_dir] [checkpoints]',
  );
  process.exit(1);
}
const N = Math.max(2, parseInt(CHECKPOINTS, 10) || 8);
const VIEWPORT = { width: 1440, height: 900 };

fs.mkdirSync(OUT, { recursive: true });

/** Take a screenshot at scroll progress p ∈ [0,1]. */
async function shotAt(page, p, filepath) {
  await page.evaluate(async (prog) => {
    const max = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
    window.scrollTo({ top: max * prog, left: 0, behavior: 'auto' });
    // Allow motion to settle.
    await new Promise((r) => setTimeout(r, 900));
  }, p);
  await page.screenshot({ path: filepath, fullPage: false });
}

/** Compare two PNGs of identical dimensions. Returns { diffPng, similarity }. */
function diffPngs(aPath, bPath) {
  const a = PNG.sync.read(fs.readFileSync(aPath));
  const b = PNG.sync.read(fs.readFileSync(bPath));
  const { width, height } = a;
  if (b.width !== width || b.height !== height) {
    // Resize b to a via nearest-fit: pad or crop to match.
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
  const similarity = 1 - mismatched / (width * height);
  return { diff, similarity };
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

  // Suppress animations that start on load by scrolling to top first.
  await Promise.all([
    pageA.evaluate(() => window.scrollTo(0, 0)),
    pageB.evaluate(() => window.scrollTo(0, 0)),
  ]);
  await pageA.waitForTimeout(600);

  const report = [];
  for (let i = 0; i < N; i++) {
    const p = i / (N - 1);
    const id = String(i).padStart(2, '0');
    const aPath = path.join(OUT, `orig-${id}.png`);
    const bPath = path.join(OUT, `clone-${id}.png`);
    const dPath = path.join(OUT, `diff-${id}.png`);

    console.log(`  checkpoint ${i + 1}/${N}  (scroll ${(p * 100).toFixed(0)}%)`);
    await Promise.all([shotAt(pageA, p, aPath), shotAt(pageB, p, bPath)]);

    const { diff, similarity } = diffPngs(aPath, bPath);
    fs.writeFileSync(dPath, PNG.sync.write(diff));
    report.push({
      checkpoint: i,
      scrollProgress: p,
      similarity: Number(similarity.toFixed(4)),
      orig: aPath,
      clone: bPath,
      diff: dPath,
    });
    console.log(`    similarity: ${(similarity * 100).toFixed(2)}%`);
  }

  fs.writeFileSync(
    path.join(OUT, 'report.json'),
    JSON.stringify(
      {
        original: ORIG,
        clone: CLONE,
        viewport: VIEWPORT,
        avgSimilarity:
          report.reduce((s, r) => s + r.similarity, 0) / report.length,
        checkpoints: report,
      },
      null,
      2,
    ),
  );

  const avg =
    report.reduce((s, r) => s + r.similarity, 0) / report.length;
  console.log(`\nAverage similarity: ${(avg * 100).toFixed(2)}%`);
  const low = report
    .filter((r) => r.similarity < 0.95)
    .sort((a, b) => a.similarity - b.similarity);
  if (low.length) {
    console.log(`Below-95% checkpoints (iterate on these):`);
    for (const r of low) {
      console.log(
        `  cp ${String(r.checkpoint).padStart(2, '0')}  @ ${(
          r.scrollProgress * 100
        ).toFixed(0)}%  —  ${(r.similarity * 100).toFixed(2)}%  →  ${r.diff}`,
      );
    }
  } else {
    console.log('All checkpoints ≥ 95% — ship it.');
  }
  await browser.close();
})().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
