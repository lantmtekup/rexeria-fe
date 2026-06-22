#!/usr/bin/env node
/**
 * Parse a GSAP bundle directory and extract animation configs.
 *
 * Walks every .js file (incl. inline-scripts/), finds GSAP / ScrollTrigger /
 * Lenis / SplitType / Swiper call expressions, and emits a JSON catalog with
 * the selector + vars + scrollTrigger config for each animation.
 *
 * Prefers Babel AST parse for accuracy; falls back to bracket-matching regex
 * if @babel/parser isn't installed in the working dir (npm i -D @babel/parser
 * to enable AST mode).
 *
 * Usage:  node 02-extract-animations.js <bundleDir> > animations.json
 */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const dir = process.argv[2];
if (!dir) {
  console.error('usage: 02-extract-animations.js <bundleDir>');
  process.exit(1);
}

// Try cwd's node_modules first (so the user's clone-project deps are found),
// fall back to the script's own resolution chain.
const cwdRequire = createRequire(path.join(process.cwd(), '__noop.js'));
let parser = null;
try { parser = cwdRequire('@babel/parser'); }
catch {
  try { parser = require('@babel/parser'); }
  catch {
    console.error('ℹ️  @babel/parser not found — using regex fallback. For higher accuracy:');
    console.error('   pnpm add -D @babel/parser');
  }
}

/* ───────── shared helpers ───────── */

function readAllJs(root) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|mjs)$/.test(e.name)) out.push(p);
    }
  };
  walk(root);
  return out;
}

/** Pretty-print minified content roughly for grep/regex pass. */
function unminify(src) {
  return src
    .replace(/;/g, ';\n')
    .replace(/\{/g, '{\n')
    .replace(/\}/g, '\n}\n')
    .replace(/,(?=[a-zA-Z_$])/g, ',\n');
}

/* ───────── AST mode ───────── */

function astExtract(src, file) {
  const out = [];
  let ast;
  try {
    ast = parser.parse(src, {
      sourceType: 'unambiguous',
      errorRecovery: true,
      plugins: ['jsx', 'typescript'],
    });
  } catch {
    return null;
  }

  const lit = (node) => {
    if (!node) return undefined;
    if (node.type === 'StringLiteral') return node.value;
    if (node.type === 'NumericLiteral') return node.value;
    if (node.type === 'BooleanLiteral') return node.value;
    if (node.type === 'NullLiteral') return null;
    if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
      return node.quasis.map((q) => q.value.cooked).join('');
    }
    if (node.type === 'ArrayExpression') return node.elements.map(lit);
    if (node.type === 'ObjectExpression') {
      const o = {};
      for (const p of node.properties) {
        if (p.type !== 'ObjectProperty') continue;
        const k = p.key.name || p.key.value;
        if (k == null) continue;
        o[k] = lit(p.value);
      }
      return o;
    }
    if (node.type === 'Identifier') return `<${node.name}>`;
    if (node.type === 'MemberExpression') return `<expr>`;
    return undefined;
  };

  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'CallExpression') {
      const c = node.callee;
      // gsap.to / gsap.from / gsap.fromTo / gsap.set / gsap.timeline
      if (
        c.type === 'MemberExpression' &&
        c.object.type === 'Identifier' &&
        c.object.name === 'gsap' &&
        c.property.type === 'Identifier'
      ) {
        const method = c.property.name;
        if (['to', 'from', 'fromTo', 'set', 'timeline'].includes(method)) {
          const rec = { file: path.basename(file), type: method };
          if (method === 'fromTo') {
            rec.selector = lit(node.arguments[0]);
            rec.fromVars = lit(node.arguments[1]);
            rec.toVars = lit(node.arguments[2]);
            const st = rec.toVars && rec.toVars.scrollTrigger;
            if (st) rec.scrollTrigger = st;
          } else if (method === 'timeline') {
            rec.vars = lit(node.arguments[0]);
          } else {
            rec.selector = lit(node.arguments[0]);
            rec.vars = lit(node.arguments[1]);
            const st = rec.vars && rec.vars.scrollTrigger;
            if (st) rec.scrollTrigger = st;
          }
          out.push(rec);
        }
      }
      // ScrollTrigger.create({...})
      if (
        c.type === 'MemberExpression' &&
        c.object.type === 'Identifier' &&
        c.object.name === 'ScrollTrigger' &&
        c.property.type === 'Identifier' &&
        c.property.name === 'create'
      ) {
        out.push({
          file: path.basename(file),
          type: 'scrollTrigger',
          vars: lit(node.arguments[0]),
        });
      }
    }
    if (node.type === 'NewExpression') {
      const c = node.callee;
      if (c.type === 'Identifier') {
        const name = c.name;
        if (['Lenis', 'SplitType', 'Swiper'].includes(name)) {
          out.push({
            file: path.basename(file),
            type: name.toLowerCase(),
            args: (node.arguments || []).map(lit),
          });
        }
      }
    }
    for (const k of Object.keys(node)) {
      const v = node[k];
      if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === 'object' && v.type) visit(v);
    }
  };
  visit(ast);
  return out;
}

/* ───────── regex fallback ───────── */

function findBalanced(src, from, openCh, closeCh) {
  let d = 0;
  let str = null;
  let esc = false;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (str) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === str) str = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === openCh) d++;
    else if (c === closeCh) {
      d--;
      if (d === 0) return i;
    }
    if (i - from > 20000) break;
  }
  return -1;
}

function tryParseObject(body) {
  try {
    const quoted = body
      .replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":')
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, s) => JSON.stringify(s))
      .replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(quoted);
  } catch {
    return null;
  }
}

function regexExtract(src, file) {
  const out = [];
  const pretty = unminify(src);
  const seeds = [
    { re: /gsap\.(to|from|fromTo|set|timeline)\s*\(/g, kind: 'gsap' },
    { re: /ScrollTrigger\.create\s*\(/g, kind: 'scrollTrigger' },
    { re: /new\s+(Lenis|SplitType|Swiper)\s*\(/g, kind: 'new' },
  ];
  for (const { re, kind } of seeds) {
    let m;
    while ((m = re.exec(pretty)) !== null) {
      const argStart = pretty.indexOf('(', m.index);
      const argEnd = findBalanced(pretty, argStart, '(', ')');
      if (argEnd < 0) continue;
      const args = pretty.slice(argStart + 1, argEnd);
      const rec = { file: path.basename(file), kind };
      if (kind === 'gsap') {
        rec.type = m[1];
      } else if (kind === 'scrollTrigger') {
        rec.type = 'scrollTrigger';
      } else {
        rec.type = m[1].toLowerCase();
      }
      // First quoted string = selector
      const sel = args.match(/^[^,]*?["'`]([^"'`]+)["'`]/);
      if (sel) rec.selector = sel[1];
      // Find first {...} as vars
      const objStart = args.indexOf('{');
      if (objStart >= 0) {
        const objEnd = findBalanced(args, objStart, '{', '}');
        if (objEnd > 0) {
          const body = args.slice(objStart, objEnd + 1);
          rec.vars = tryParseObject(body) || { _raw: body.slice(0, 400) };
        }
      }
      out.push(rec);
    }
  }
  return out;
}

/* ───────── run ───────── */

const files = readAllJs(dir);
const results = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (src.length > 5_000_000) continue; // skip giant minified blobs > 5MB
  let recs = null;
  if (parser) recs = astExtract(src, f);
  if (!recs || !recs.length) recs = regexExtract(src, f);
  results.push(...recs);
}

// Dedupe by JSON shape.
const seen = new Map();
for (const r of results) {
  const key = JSON.stringify({ t: r.type, s: r.selector, v: r.vars, st: r.scrollTrigger });
  if (!seen.has(key)) seen.set(key, r);
}

const items = Array.from(seen.values());

// Counts by type
const counts = items.reduce((acc, r) => ((acc[r.type] = (acc[r.type] || 0) + 1), acc), {});

console.log(JSON.stringify({ count: items.length, counts, items }, null, 2));
