#!/usr/bin/env node
/**
 * Block library discipline tripwire (Phase 5).
 *
 * The Canva-style architecture wins when small variants (image left/right,
 * with/without CTA, layout switches) are handled by a `select` slot on an
 * EXISTING block — not by spawning a new BlockType per variant. Left unchecked
 * the canvas BlockType union grows unbounded (one design = one block), which is
 * exactly the trap the architecture is meant to avoid.
 *
 * This script counts the canvas BlockType union and fails when it exceeds a
 * soft cap, forcing a conscious "variant or new block?" decision. It is a
 * tripwire, not a hard ban: if growth is genuinely warranted, bump MAX_BLOCK_TYPES
 * with a one-line justification.
 *
 * Run: `yarn lint:blocks` (wire into CI alongside lint/type-check).
 * See: docs/block-library-discipline.md
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Soft cap. Current baseline at introduction: 49. Headroom of 3 forces review
// on the next additions. Bump deliberately (with justification) when a new
// block type is the right call, not a variant.
const MAX_BLOCK_TYPES = 52;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(
  root,
  'src/components/modules/CanvasTemplate/block-editor/types.ts'
);

const src = readFileSync(file, 'utf8');
const union = src.match(/export type BlockType =([\s\S]*?);/);
if (!union) {
  console.error('check-block-library: BlockType union not found in', file);
  process.exit(2);
}
const count = new Set(
  [...union[1].matchAll(/'([a-z0-9_]+)'/g)].map(m => m[1])
).size;

console.log(`Block types: ${count} / ${MAX_BLOCK_TYPES} (cap)`);

if (count > MAX_BLOCK_TYPES) {
  console.error(
    `\n✗ Block library tripwire: ${count} block types exceeds the cap of ${MAX_BLOCK_TYPES}.\n\n` +
      `Before adding a new BlockType, prefer a 'select' slot variant on an\n` +
      `existing block when the DOM is the same (image left/right, with/without\n` +
      `CTA, layout switch…). Only add a new block type when the DOM differs\n` +
      `fundamentally.\n\n` +
      `If this growth is intentional, bump MAX_BLOCK_TYPES in\n` +
      `scripts/check-block-library.mjs with a one-line justification.\n` +
      `See docs/block-library-discipline.md.`
  );
  process.exit(1);
}
console.log('✓ Block library within cap.');
