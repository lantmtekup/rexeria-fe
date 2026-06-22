#!/usr/bin/env node
/**
 * Parse a Framer bundle directory and extract animation configs.
 *
 * Walks every .js/.mjs file, finds objects that look like framer-motion
 * animation descriptors — `{ initial, animate, transition }`,
 * `{ whileInView, viewport }`, `{ variants }`, `{ keyframes: [...] }`,
 * easing arrays `[a,b,c,d]`, and spring configs `{ stiffness, damping }`.
 *
 * Output is a JSON array on stdout: one record per hit, with source
 * filename + character offset + the extracted object. Downstream: grep +
 * map into your components.
 *
 * Usage:  node extract-animations.js <bundleDir>
 */
const fs = require('node:fs');
const path = require('node:path');

const dir = process.argv[2];
if (!dir) {
  console.error('usage: extract-animations.js <bundleDir>');
  process.exit(1);
}

/** Keys whose presence signals a framer-motion config. */
const MOTION_KEYS = [
  'initial',
  'animate',
  'exit',
  'whileInView',
  'whileHover',
  'whileTap',
  'whileDrag',
  'whileFocus',
  'variants',
  'transition',
];

/** Keys inside a `transition` object. */
const TRANSITION_KEYS = [
  'duration',
  'delay',
  'ease',
  'type',
  'stiffness',
  'damping',
  'mass',
  'bounce',
  'restSpeed',
  'restDelta',
  'staggerChildren',
  'delayChildren',
  'repeat',
  'repeatType',
  'repeatDelay',
];

/** Very small bracket-matching parser — good enough for bundle source.
 *  Returns the substring starting at `from` that forms one balanced {…} block. */
function extractObjectAt(src, from) {
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(from, i + 1);
    }
    if (i - from > 20000) break; // safety bound
  }
  return null;
}

/** Look backwards from a match index to find the enclosing `{`. */
function findEnclosingObjectStart(src, matchIdx) {
  let depth = 0;
  for (let i = matchIdx; i >= 0 && i > matchIdx - 8000; i--) {
    const c = src[i];
    if (c === '}') depth++;
    else if (c === '{') {
      if (depth === 0) return i;
      depth--;
    }
  }
  return -1;
}

/** Rough check whether `body` contains any motion-related key. */
function looksLikeMotion(body) {
  let count = 0;
  for (const k of MOTION_KEYS) {
    // Match `key:` with minification in mind (may have whitespace around).
    const re = new RegExp(`(^|[,{\\s])${k}\\s*:`, 'g');
    if (re.test(body)) count++;
  }
  return count >= 2 || /whileInView\s*:/.test(body);
}

/** Try JSON.parse a JS-object literal by converting to JSON-ish shape.
 *  Doesn't handle every edge case; returns null on failure. */
function tryParse(body) {
  try {
    // Quote unquoted keys.
    const quoted = body
      .replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":')
      // Single → double quotes.
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, s) => JSON.stringify(s))
      // Strip trailing commas.
      .replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(quoted);
  } catch {
    return null;
  }
}

/** Walk recursively to prune parsed config down to only motion-relevant keys. */
function prune(node) {
  if (node == null || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(prune);
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    if (
      MOTION_KEYS.includes(k) ||
      TRANSITION_KEYS.includes(k) ||
      k === 'x' || k === 'y' || k === 'scale' || k === 'opacity' || k === 'rotate' ||
      k === 'clipPath' || k === 'filter' || k === 'keyframes' || k === 'viewport'
    ) {
      out[k] = prune(v);
    }
  }
  return out;
}

const results = [];
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));

for (const f of files) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  // Find every occurrence of a key that starts a motion config.
  const seeds = [
    /whileInView\s*:/g,
    /\binitial\s*:\s*\{/g,
    /\bvariants\s*:\s*\{/g,
    /\btransition\s*:\s*\{/g,
  ];
  const seen = new Set();
  for (const re of seeds) {
    let m;
    while ((m = re.exec(src)) !== null) {
      const start = findEnclosingObjectStart(src, m.index);
      if (start < 0 || seen.has(start)) continue;
      seen.add(start);
      const body = extractObjectAt(src, start);
      if (!body || body.length > 6000) continue;
      if (!looksLikeMotion(body)) continue;
      const parsed = tryParse(body);
      results.push({
        file: f,
        offset: start,
        raw: body.length < 1200 ? body : body.slice(0, 1200) + '…',
        parsed: parsed ? prune(parsed) : null,
      });
    }
  }
}

// Deduplicate by JSON shape of `parsed`.
const uniq = new Map();
for (const r of results) {
  const key = r.parsed ? JSON.stringify(r.parsed) : r.raw.slice(0, 120);
  if (!uniq.has(key)) uniq.set(key, r);
}

console.log(
  JSON.stringify(
    { count: uniq.size, items: Array.from(uniq.values()) },
    null,
    2,
  ),
);
