#!/usr/bin/env node
/**
 * Codemod: chuẩn hoá design tokens trong .tsx.
 *
 *   node scripts/codemod-design-tokens.mjs <path> [--write] [--color]
 *
 * - Mặc định DRY-RUN (chỉ in thay đổi). Thêm `--write` để ghi file.
 * - Mặc định chỉ đổi FONT-SIZE (`text-[Npx]` → class scale) — an toàn, chỉ làm
 *   tròn cỡ chữ về thang chuẩn (xem .claude/skills/rexer-component-style).
 * - Thêm `--color` để đổi luôn `zinc-*` → token ngữ nghĩa (LOSSY: đổi màu thật,
 *   review kỹ + QA visual từng vùng).
 *
 * Chạy theo TỪNG thư mục + verify (tsc + xem màn) thay vì cả repo 1 lần.
 */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const args = process.argv.slice(2);
const write = args.includes('--write');
const doColor = args.includes('--color');
const root = args.find(a => !a.startsWith('--')) ?? 'src';

// px → class (8..72). Làm tròn về bậc gần nhất của thang.
const FONT = [
  [10.5, 'text-3xs'],
  [10, 'text-3xs'],
  [9.5, 'text-3xs'],
  [9, 'text-3xs'],
  [8, 'text-3xs'],
  [11.5, 'text-2xs'],
  [11, 'text-2xs'],
  [12.5, 'text-xs'],
  [12, 'text-xs'],
  [14, 'text-sm'],
  [13.5, 'text-sm'],
  [13, 'text-sm'],
  [16, 'text-base'],
  [15, 'text-base'],
  [18, 'text-lg'],
  [20, 'text-xl'],
  [26, 'text-2xl'],
  [24, 'text-2xl'],
  [30, 'text-3xl'],
  [40, 'text-4xl'],
  [38, 'text-4xl'],
  [36, 'text-4xl'],
  [48, 'text-5xl'],
  [44, 'text-5xl'],
  [60, 'text-6xl'],
  [56, 'text-6xl'],
  [72, 'text-7xl'],
];
function fontClass(px) {
  let best = FONT[0];
  for (const e of FONT)
    if (Math.abs(e[0] - px) < Math.abs(best[0] - px)) best = e;
  return best[1];
}

// zinc-* → token (chỉ chạy khi --color). Map bảo thủ.
const COLOR = [
  [/\btext-zinc-(950|900|800)\b/g, 'text-foreground'],
  [/\btext-zinc-(700|600|500)\b/g, 'text-content-muted'],
  [/\btext-zinc-(400|300)\b/g, 'text-muted-foreground'],
  [/\bbg-zinc-(100|50)\b/g, 'bg-muted'],
  [/\bborder-zinc-(300|200|100)\b/g, 'border-border'],
];

let changed = 0;
function processFile(file) {
  const src = readFileSync(file, 'utf8');
  let out = src.replace(/([a-z-]*text)-\[(\d+(?:\.\d+)?)px\]/g, (m, pre, n) => {
    if (pre !== 'text') return m; // chỉ font-size, bỏ qua leading-[..] v.v.
    return fontClass(parseFloat(n));
  });
  if (doColor) for (const [re, to] of COLOR) out = out.replace(re, to);
  if (out !== src) {
    changed++;
    if (write) writeFileSync(file, out);
    console.log(`${write ? 'WROTE' : 'DIFF'}  ${file}`);
  }
}

function walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) {
    if (/node_modules|\.next|\.git/.test(p)) return;
    for (const e of readdirSync(p)) walk(join(p, e));
  } else if (extname(p) === '.tsx') processFile(p);
}

walk(root);
console.log(
  `\n${changed} file(s) ${write ? 'changed' : 'would change'}. font-size${doColor ? ' + color(zinc→token)' : ' only'}.`
);
