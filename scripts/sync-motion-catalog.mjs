#!/usr/bin/env node
/**
 * Sync motion effect agent-memory catalog from motionLibrary.ts (single source).
 *
 * Writes: .claude/skills/motion-pick/references/effects-catalog.md
 * Run:    yarn motion:catalog
 *
 * DO NOT hand-edit the generated catalog — edit meta on each effect in
 * src/components/modules/block-editor/motion/motionLibrary.ts then re-run.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(
  root,
  '.claude/skills/motion-pick/references/effects-catalog.md'
);
const loaderPath = join(root, 'scripts/_sync-motion-catalog-loader.ts');

const result = spawnSync('npx', ['--yes', 'tsx', loaderPath], {
  cwd: root,
  encoding: 'utf8',
  env: process.env,
});

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'sync-motion-catalog failed');
  process.exit(result.status ?? 1);
}

const markdown = result.stdout;
if (!markdown.includes('## `')) {
  console.error(
    'sync-motion-catalog: loader produced unexpected output (missing effect headings)'
  );
  console.error(markdown.slice(0, 500));
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, markdown, 'utf8');
console.error(`Wrote ${outPath}`);
