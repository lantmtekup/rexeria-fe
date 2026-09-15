#!/usr/bin/env node
// Nén lại 5 model .glb (mua bản quyền, xem apps/icggallery gốc) theo đúng pipeline
// Igloo.inc: geometry nén Draco + texture nén KTX2 (Basis Universal), qua
// @gltf-transform/cli `optimize`. Input: apps/icggallery/public/webgl/models —
// Output: public/webgl/models của app này (không sửa app gốc).
import { execFile } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC_DIR = join(__dirname, '../../icggallery/public/webgl/models');
const OUT_DIR = join(__dirname, '../public/webgl/models');
// `ktx` CLI (KhronosGroup KTX-Software) vendored ở đây — không có sẵn qua
// Homebrew, cần cho gltf-transform khi nén texture sang KTX2 (--texture-compress
// ktx2). Nhị phân + dylib đi kèm lấy từ .pkg chính thức, không cài hệ thống.
const BIN_DIR = join(__dirname, 'bin');
const LIB_DIR = join(__dirname, 'lib');
const execEnv = {
  ...process.env,
  PATH: `${BIN_DIR}:${process.env.PATH}`,
  DYLD_LIBRARY_PATH: `${LIB_DIR}:${process.env.DYLD_LIBRARY_PATH ?? ''}`,
};

const MODELS = [
  'ht_living_room.glb',
  'camera_paths_living_room.glb',
  'slider.glb',
  'shadow-leaves.glb',
  'limbo.glb',
];

const fmtKB = bytes => `${(bytes / 1024).toFixed(1)}K`;

async function compressOne(name) {
  const src = join(SRC_DIR, name);
  const out = join(OUT_DIR, name);
  const before = (await stat(src)).size;

  await run(
    'npx',
    [
      '--yes',
      '@gltf-transform/cli@4.4.2',
      'optimize',
      src,
      out,
      '--compress',
      'draco',
      '--texture-compress',
      'ktx2',
    ],
    { env: execEnv, maxBuffer: 1024 * 1024 * 64 }
  );

  const after = (await stat(out)).size;
  const pct = (100 * (1 - after / before)).toFixed(0);
  console.log(`${name}: ${fmtKB(before)} → ${fmtKB(after)} (-${pct}%)`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const name of MODELS) {
    // Tuần tự, không song song — gltf-transform tự spawn worker riêng, chạy
    // đồng thời 5 cái dễ tràn RAM trên máy dev.
    await compressOne(name);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
