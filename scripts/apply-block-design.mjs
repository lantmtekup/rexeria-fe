#!/usr/bin/env node
/**
 * Apply a native block design to an existing saved block (data-level surgery).
 *
 * Đổi 1 block đã có sang design/loại native khác: ghi `type_code` + `settings`
 * (content mặc định từ `createBlock(type)`) để render đi theo design mới.
 * Render thật vẫn cần FE có renderer của `type` đó đã DEPLOY ở môi trường xem.
 *
 * Usage:
 *   node scripts/apply-block-design.mjs <blockId|tên block> <type_code>
 *
 * Env (bắt buộc creds — KHÔNG hardcode trong repo):
 *   REXER_ADMIN_EMAIL, REXER_ADMIN_PASSWORD
 *   REXER_API           (mặc định đọc NEXT_PUBLIC_REXER_API trong .env/.env.local)
 *
 * Ví dụ:
 *   REXER_ADMIN_EMAIL=admin@rexer.ai REXER_ADMIN_PASSWORD=*** \
 *     node scripts/apply-block-design.mjs "Hero Test 01" framer_aestha_editorial
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = process.cwd();
const [target, typeCode] = process.argv.slice(2);

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!target || !typeCode) {
  die(
    'Thiếu tham số.\n  Usage: node scripts/apply-block-design.mjs <blockId|tên> <type_code>'
  );
}

// ── Config ────────────────────────────────────────────────────────────────
function readEnvVar(key) {
  for (const f of ['.env.local', '.env']) {
    const p = join(ROOT, f);
    if (!existsSync(p)) continue;
    const m = readFileSync(p, 'utf8').match(new RegExp(`^${key}=(.+)$`, 'm'));
    if (m) return m[1].trim();
  }
  return undefined;
}

const API = (
  process.env.REXER_API ||
  readEnvVar('NEXT_PUBLIC_REXER_API') ||
  ''
).replace(/\/+$/, '');
const EMAIL = process.env.REXER_ADMIN_EMAIL;
const PASS = process.env.REXER_ADMIN_PASSWORD;
if (!API) die('Thiếu REXER_API (hoặc NEXT_PUBLIC_REXER_API trong .env).');
if (!EMAIL || !PASS)
  die(
    'Thiếu REXER_ADMIN_EMAIL / REXER_ADMIN_PASSWORD (set qua env, đừng hardcode).'
  );

const V1 = `${API}/v1`;

// ── 1. Sinh settings từ createBlock(type) qua esbuild (pure-data) ───────────
function genSettings(type) {
  const dir = mkdtempSync(join(tmpdir(), 'apply-blk-'));
  const entry = join(dir, 'gen.ts');
  const out = join(dir, 'gen.cjs');
  writeFileSync(
    entry,
    `import { createBlock } from '@/components/modules/block-editor/factory';\n` +
      `process.stdout.write(JSON.stringify(createBlock(${JSON.stringify(type)})));\n`
  );
  try {
    execFileSync(
      'npx',
      [
        'esbuild',
        entry,
        '--bundle',
        '--format=cjs',
        '--platform=node',
        `--alias:@=${join(ROOT, 'src')}`,
        `--outfile=${out}`,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] }
    );
  } catch (e) {
    die(`esbuild bundle lỗi:\n${e.stderr?.toString() || e.message}`);
  }
  const json = execFileSync('node', [out]).toString();
  const settings = JSON.parse(json);
  if (settings.blockType !== type)
    die(
      `Type "${type}" không có trong registry FE (BLOCK_TYPE_META). ` +
        `createBlock trả blockType="${settings.blockType}".`
    );
  return settings;
}

// ── HTTP helper giữ cookie session ──────────────────────────────────────────
let COOKIE = '';
async function api(method, path, body) {
  const res = await fetch(`${V1}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(COOKIE ? { cookie: COOKIE } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) COOKIE = setCookie.map(c => c.split(';')[0]).join('; ');
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: res.status, ok: res.ok, data };
}

// ── Main ────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`• Sinh settings cho "${typeCode}"…`);
  const settings = genSettings(typeCode);

  console.log(`• Login BE (${V1})…`);
  const login = await api('POST', '/auth/login', {
    email: EMAIL,
    password: PASS,
  });
  if (!login.ok) die(`Login thất bại (${login.status}).`);

  // Resolve id: nếu target không phải uuid → tìm theo tên
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(target);
  let id = target;
  if (!isUuid) {
    const list = await api('GET', '/blocks?limit=500');
    const matches = (list.data.items ?? []).filter(b => b.name === target);
    if (matches.length === 0) die(`Không tìm thấy block tên "${target}".`);
    if (matches.length > 1)
      die(
        `Có ${matches.length} block trùng tên "${target}". Dùng blockId cho chắc:\n` +
          matches.map(b => `  ${b.id}  (type=${b.type_code})`).join('\n')
      );
    id = matches[0].id;
  }

  settings.name = isUuid ? settings.name : target;
  console.log(`• PATCH /blocks/${id} → type_code=${typeCode}…`);
  const patch = await api('PATCH', `/blocks/${id}`, {
    type_code: typeCode,
    settings,
  });
  if (!patch.ok)
    die(`PATCH thất bại (${patch.status}): ${JSON.stringify(patch.data)}`);

  const after = (await api('GET', `/blocks/${id}`)).data.block ?? {};
  console.log('✓ Done:');
  console.log(`    id            : ${id}`);
  console.log(`    type_code     : ${after.type_code}`);
  console.log(`    settings.blockType: ${after.settings?.blockType}`);
  if (after.type_code !== typeCode || after.settings?.blockType !== typeCode)
    die('Cảnh báo: type_code / settings.blockType chưa khớp — kiểm tra BE.');
  console.log(
    `\n⚠ Render thật cần FE có renderer "${typeCode}" đã deploy ở môi trường xem.`
  );
})().catch(e => die(e.stack || e.message));
