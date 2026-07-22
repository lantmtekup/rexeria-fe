#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * verify-tokens.js — Compare design tokens in scaffolded code vs recon's
 * extracted.json. Flags drift (typos, copy mistakes, design slop).
 *
 * Usage:
 *   node verify-tokens.js --recon <recon-dir> --component <path/to/component>
 *
 * Example:
 *   node verify-tokens.js \
 *     --recon /tmp/recon/recon-perform-hero \
 *     --component ./src/blocks/perform-hero/component.tsx
 *
 * Exit codes:
 *   0 — all expected tokens present in code (or only minor drift)
 *   1 — significant drift detected
 *   2 — runtime error (missing files, bad JSON)
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = { recon: null, component: null };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--recon') args.recon = argv[++i];
    else if (argv[i] === '--component') args.component = argv[++i];
  }
  if (!args.recon || !args.component) {
    console.error('usage: verify-tokens.js --recon <dir> --component <file>');
    process.exit(2);
  }
  return args;
}

function loadJson(p) {
  if (!fs.existsSync(p)) {
    console.error(`Missing file: ${p}`);
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadCode(p) {
  if (!fs.existsSync(p)) {
    console.error(`Missing file: ${p}`);
    process.exit(2);
  }
  return fs.readFileSync(p, 'utf8');
}

function normalizePx(v) {
  if (v == null) return null;
  const m = String(v).match(/([\d.]+)\s*px/i);
  return m ? parseFloat(m[1]) : null;
}

function normalizeHex(v) {
  if (v == null) return null;
  const s = String(v).trim().toLowerCase();
  if (s.startsWith('#')) return s;
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) {
    const hex = n => Number(n).toString(16).padStart(2, '0');
    return '#' + hex(m[1]) + hex(m[2]) + hex(m[3]);
  }
  return null;
}

function checkTypography(code, typography) {
  const findings = [];
  for (const t of typography) {
    const sample = (t.sample_text || '').trim().slice(0, 30);
    const sizePx = normalizePx(t.font_size);
    if (!sizePx) continue;

    // Look for either the literal px value or its appearance in clamp() max bound
    const sizeRe = new RegExp(
      `(?:\\b${sizePx}px\\b|clamp\\([^)]*,\\s*${sizePx}px\\s*\\))`,
      'i'
    );
    const colorHex = normalizeHex(t.color);
    const colorRe = colorHex
      ? new RegExp(colorHex.replace('#', '#?'), 'i')
      : null;

    const hasSize = sizeRe.test(code);
    const hasColor = colorRe ? colorRe.test(code) : true;

    if (!hasSize || !hasColor) {
      findings.push({
        level: 'WARN',
        kind: 'typography',
        sample: sample || '<no-sample>',
        expected: `font-size: ${sizePx}px, color: ${colorHex}`,
        missing: [
          !hasSize ? `size ${sizePx}px` : null,
          !hasColor ? `color ${colorHex}` : null,
        ].filter(Boolean),
      });
    }
  }
  return findings;
}

function checkColors(code, colors) {
  const findings = [];
  const all = [...(colors.backgrounds || []), ...(colors.text_colors || [])];
  for (const c of all) {
    const hex = normalizeHex(c.color);
    if (!hex || hex === '#000000' || hex === '#ffffff') continue; // skip
    // commonality threshold — only flag colors used 3+ times (design intent)
    if ((c.count || 0) < 3) continue;
    const re = new RegExp(hex.replace('#', '#?'), 'i');
    if (!re.test(code)) {
      findings.push({
        level: 'WARN',
        kind: 'color',
        expected: hex,
        usage: `${c.count}× in source`,
        missing: [`hex ${hex}`],
      });
    }
  }
  return findings;
}

function checkSpacing(code, spacing) {
  const findings = [];
  // Check the most-used padding/gap values appear somewhere in code
  const top = arr => (arr || []).slice(0, 5);
  for (const cat of ['paddings', 'gaps']) {
    for (const s of top(spacing[cat])) {
      const value = s.value;
      // strip multi-value pad (e.g. "40px 80px" → check first token)
      const first = String(value).split(/\s+/)[0];
      const px = normalizePx(first);
      if (!px || px < 4) continue;
      const re = new RegExp(`\\b${px}px\\b|clamp\\([^)]*${px}px`, 'i');
      if (!re.test(code)) {
        findings.push({
          level: 'INFO',
          kind: `spacing/${cat}`,
          expected: value,
          usage: `${s.count}× in source`,
          missing: [`value ${first}`],
        });
      }
    }
  }
  return findings;
}

function checkAnimations(code, hints) {
  const findings = [];
  for (const h of hints || []) {
    for (const p of h.props || []) {
      if (p.prop === 'transform') {
        // e.g. scale(0.9), rotate(-45deg)
        const m = String(p.value).match(/scale\(([\d.]+)\)/);
        if (m) {
          const scaleVal = m[1];
          if (!code.includes(`scale(${scaleVal})`)) {
            findings.push({
              level: 'WARN',
              kind: 'animation/initial-state',
              expected: p.value,
              context: h.framerName || h.classes,
              missing: [`scale(${scaleVal}) initial`],
            });
          }
        }
      }
    }
  }
  return findings;
}

function main() {
  const args = parseArgs();
  const extracted = loadJson(path.join(args.recon, 'raw', 'extracted.json'));
  const code = loadCode(args.component);

  const findings = [
    ...checkTypography(code, extracted.typography || []),
    ...checkColors(code, extracted.colors || {}),
    ...checkSpacing(code, extracted.spacing || {}),
    ...checkAnimations(code, extracted.inline_animation_hints || []),
  ];

  const warns = findings.filter(f => f.level === 'WARN');
  const infos = findings.filter(f => f.level === 'INFO');

  console.log(`\n━━━ Token verify: ${path.basename(args.component)} ━━━`);
  console.log(`Recon: ${args.recon}`);
  console.log(`Findings: ${warns.length} WARN, ${infos.length} INFO\n`);

  if (warns.length === 0 && infos.length === 0) {
    console.log('✅ All recon tokens present in code.');
    process.exit(0);
  }

  for (const f of [...warns, ...infos]) {
    const tag = f.level === 'WARN' ? '⚠️ ' : 'ℹ️ ';
    console.log(
      `${tag} [${f.kind}] missing: ${f.missing.join(', ')}` +
        (f.sample ? `  (sample: "${f.sample}")` : '') +
        (f.expected ? `  expected: ${f.expected}` : '') +
        (f.usage ? `  source usage: ${f.usage}` : '') +
        (f.context ? `  context: ${f.context}` : '')
    );
  }

  console.log(
    `\n${warns.length > 0 ? '❌' : '⚠️ '} ${warns.length} significant drift(s); ${infos.length} minor info(s).`
  );
  console.log(
    'Hint: compare against recon spec.md section 4 (typography) + 5 (colors) + 6 (spacing).'
  );

  process.exit(warns.length > 0 ? 1 : 0);
}

main();
