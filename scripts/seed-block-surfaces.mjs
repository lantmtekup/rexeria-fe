#!/usr/bin/env node
/**
 * Seed/fix `supported_surfaces` cho 1+ block type mới vào catalog builtin
 * (scope=system) qua API — dùng khi thêm native block mới vào
 * `_registry/registry.ts` (xem checklist cuối
 * `.claude/skills/framer-clone-host/references/rexerai-block-integration.md`).
 * KHÔNG chạy bước này → "Save Version" 400 `does not support surface ...
 * (supports [])` lần đầu ai đó dùng block trên canvas.
 *
 * Chạy NGAY sau khi thêm type_code mới — đừng để "note as pending", việc
 * này làm được từ FE repo, không cần chờ BE / không cần DB DSN.
 *
 * Với mỗi type_code: tìm catalog entry scope=system qua GET /blocks —
 *   - có rồi + supported_surfaces thiếu 1 trong 3 surface → PATCH sửa lại.
 *   - chưa có → POST tạo mới (scope=system, settings rỗng).
 *
 * Usage:
 *   REXER_ADMIN_EMAIL=... REXER_ADMIN_PASSWORD=... \
 *     node scripts/seed-block-surfaces.mjs <type_code> [type_code...]
 *
 * Ví dụ:
 *   node scripts/seed-block-surfaces.mjs framer_aestha_editorial aestha_studio
 *
 * Env (bắt buộc creds — KHÔNG hardcode trong repo):
 *   REXER_ADMIN_EMAIL, REXER_ADMIN_PASSWORD
 *   REXER_API           (mặc định đọc NEXT_PUBLIC_REXER_API trong .env/.env.local)
 *
 * Nên mirror kết quả vào scripts/prod-block-catalog.sql (thêm type_code vào
 * mảng INSERT) để môi trường khác seed lại từ SQL vẫn nhất quán.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TYPE_CODES = process.argv.slice(2);
const SURFACES = ['landing', 'ad', 'curate'];

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (TYPE_CODES.length === 0) {
  die(
    'Thiếu type_code.\n  Usage: node scripts/seed-block-surfaces.mjs <type_code> [type_code...]'
  );
}

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

(async () => {
  console.log(`• Login BE (${V1})…`);
  const login = await api('POST', '/auth/login', {
    email: EMAIL,
    password: PASS,
  });
  if (!login.ok) die(`Login thất bại (${login.status}).`);

  for (const typeCode of TYPE_CODES) {
    console.log(`\n• ${typeCode}`);
    const list = await api(
      'GET',
      `/blocks?type_code=${encodeURIComponent(typeCode)}&scope=system&limit=1`
    );
    if (!list.ok) die(`  GET /blocks thất bại (${list.status}).`);
    const existing = (list.data.items ?? [])[0];

    if (existing) {
      const have = new Set(existing.supported_surfaces ?? []);
      const missing = SURFACES.filter(s => !have.has(s));
      if (missing.length === 0) {
        console.log(`  đã đủ surfaces=[${SURFACES.join(',')}] — bỏ qua`);
        continue;
      }
      console.log(
        `  đã có (id=${existing.id}, supports=[${[...have].join(',')}]) → PATCH thêm [${missing.join(',')}]`
      );
      const patch = await api('PATCH', `/blocks/${existing.id}`, {
        supported_surfaces: SURFACES,
      });
      if (!patch.ok)
        die(
          `  PATCH thất bại (${patch.status}): ${JSON.stringify(patch.data)}`
        );
      console.log(
        `  ✓ supports=[${(patch.data.block?.supported_surfaces ?? []).join(',')}]`
      );
    } else {
      console.log('  chưa có catalog entry → POST tạo mới');
      const created = await api('POST', '/blocks', {
        type_code: typeCode,
        name: `Builtin · ${typeCode}`,
        scope: 'system',
        settings: {},
        tags: ['builtin_catalog'],
        supported_surfaces: SURFACES,
      });
      if (!created.ok)
        die(
          `  POST thất bại (${created.status}): ${JSON.stringify(created.data)}`
        );
      console.log(`  ✓ tạo mới id=${created.data.block?.id}`);
    }
  }

  console.log(
    '\n✓ Done. Nhớ mirror type_code vào scripts/prod-block-catalog.sql (mảng INSERT) để môi trường khác seed lại từ SQL vẫn khớp.'
  );
})().catch(e => die(e.stack || e.message));
