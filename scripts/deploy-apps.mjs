#!/usr/bin/env node
// Deploy apps/* lên Cloudflare Workers.
//   node scripts/deploy-apps.mjs              → tất cả
//   node scripts/deploy-apps.mjs pnj belgo    → chỉ các app được nêu
//   --list     liệt kê app / loại / worker / domain
//   --dry-run  in các bước sẽ chạy, không build/deploy
// Cần `npx wrangler login` một lần, hoặc biến môi trường CLOUDFLARE_API_TOKEN.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const APPS_DIR = resolve(import.meta.dirname, '..', 'apps');
const WORKERS_SUBDOMAIN = process.env.CF_WORKERS_SUBDOMAIN ?? 'lantm';
const MAX_ASSET_BYTES = 25 * 1024 * 1024;

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const names = args.filter(a => !a.startsWith('--'));

function parseJsonc(text) {
  const noComments = text.replace(
    /("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g,
    (m, str) => str ?? ''
  );
  return JSON.parse(noComments.replace(/,(\s*[}\]])/g, '$1'));
}

function detectKind(dir) {
  const files = readdirSync(dir);
  if (files.some(f => /^vite\.config\./.test(f))) return 'vite';
  const nextConfig = files.find(f => /^next\.config\./.test(f));
  if (
    nextConfig &&
    /output\s*:\s*["']export["']/.test(
      readFileSync(join(dir, nextConfig), 'utf8')
    )
  ) {
    return 'next-static';
  }
  return 'next-opennext';
}

function loadApps() {
  const apps = [];
  const skipped = [];
  for (const name of readdirSync(APPS_DIR).sort()) {
    const dir = join(APPS_DIR, name);
    const pkgPath = join(dir, 'package.json');
    const wranglerPath = join(dir, 'wrangler.jsonc');
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    if (!existsSync(wranglerPath) || !pkg.scripts?.['cf:deploy']) {
      skipped.push(name);
      continue;
    }
    const wrangler = parseJsonc(readFileSync(wranglerPath, 'utf8'));
    const kind = detectKind(dir);
    apps.push({
      name,
      dir,
      kind,
      worker: wrangler.name,
      domains: (wrangler.routes ?? [])
        .map(r => (typeof r === 'string' ? r : r.pattern))
        .filter(pattern => !pattern.includes('*')),
      requiredBins:
        kind === 'next-opennext'
          ? ['wrangler', 'opennextjs-cloudflare']
          : ['wrangler'],
    });
  }
  return { apps, skipped };
}

function assertUniqueWorkers(apps) {
  const byWorker = new Map();
  for (const app of apps)
    byWorker.set(app.worker, [...(byWorker.get(app.worker) ?? []), app.name]);
  const clashes = [...byWorker].filter(([, owners]) => owners.length > 1);
  if (clashes.length === 0) return;
  for (const [worker, owners] of clashes) {
    console.error(
      `✗ Worker "${worker}" bị trùng giữa: ${owners.join(', ')} — deploy sẽ ghi đè lẫn nhau.`
    );
  }
  process.exit(1);
}

function printList(apps, skipped) {
  console.table(
    apps.map(a => ({
      app: a.name,
      kind: a.kind,
      worker: a.worker,
      domain: a.domains.join(', ') || '(workers.dev)',
    }))
  );
  if (skipped.length)
    console.log(
      `Bỏ qua (thiếu wrangler.jsonc hoặc script cf:deploy): ${skipped.join(', ')}`
    );
}

function run(cmd, cmdArgs, cwd) {
  const result = spawnSync(cmd, cmdArgs, {
    cwd,
    stdio: 'inherit',
    // Test-rex/package.json khai báo packageManager pnpm → yarn 1 từ chối chạy trong apps/*.
    env: { ...process.env, SKIP_YARN_COREPACK_CHECK: '1' },
  });
  return result.status === 0;
}

function needsInstall(app) {
  return app.requiredBins.some(
    bin => !existsSync(join(app.dir, 'node_modules', '.bin', bin))
  );
}

function findOversizedAssets(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(e => e.isFile())
    .map(e => join(e.parentPath, e.name))
    .filter(file => statSync(file).size > MAX_ASSET_BYTES);
}

function deploy(app, dryRun) {
  const steps = [];
  if (needsInstall(app)) steps.push(['yarn', ['install']]);
  steps.push(['yarn', ['cf:deploy']]);

  console.log(`\n━━━ ${app.name} (${app.kind} → ${app.worker}) ━━━`);
  const oversized = findOversizedAssets(join(app.dir, 'public'));
  if (oversized.length) {
    for (const file of oversized) {
      const mib = (statSync(file).size / 1024 / 1024).toFixed(1);
      console.error(
        `✗ ${relative(app.dir, file)} (${mib} MiB) vượt giới hạn 25 MiB/asset của Workers`
      );
    }
    return false;
  }
  for (const [cmd, cmdArgs] of steps) {
    console.log(`$ ${cmd} ${cmdArgs.join(' ')}   (cwd: apps/${app.name})`);
    if (!dryRun && !run(cmd, cmdArgs, app.dir)) return false;
  }
  return true;
}

function assertNodeVersion() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major > 22 || (major === 22 && minor >= 12)) return;
  console.error(
    `✗ Node ${process.versions.node} quá cũ cho wrangler 4 — cần >= 22.12 (chạy \`nvm use 22\`).`
  );
  process.exit(1);
}

const { apps, skipped } = loadApps();
assertUniqueWorkers(apps);

if (flags.has('--list')) {
  printList(apps, skipped);
  process.exit(0);
}

const unknown = names.filter(n => !apps.some(a => a.name === n));
if (unknown.length) {
  console.error(`✗ Không tìm thấy app: ${unknown.join(', ')}`);
  console.error(`  App hợp lệ: ${apps.map(a => a.name).join(', ')}`);
  process.exit(1);
}

const targets = names.length ? apps.filter(a => names.includes(a.name)) : apps;
const dryRun = flags.has('--dry-run');
if (!dryRun) assertNodeVersion();
const results = [];

for (const app of targets) {
  const started = Date.now();
  const ok = deploy(app, dryRun);
  results.push({
    app: app.name,
    status: ok ? '✓' : '✗',
    time: `${Math.round((Date.now() - started) / 1000)}s`,
    url:
      app.domains.map(d => `https://${d}`).join(', ') ||
      `https://${app.worker}.${WORKERS_SUBDOMAIN}.workers.dev`,
  });
}

console.log('\nKết quả:');
console.table(results);
process.exit(results.some(r => r.status === '✗') ? 1 : 0);
