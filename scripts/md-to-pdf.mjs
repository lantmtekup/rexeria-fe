#!/usr/bin/env node
/**
 * Convert a markdown file to a styled PDF using:
 *   1. pandoc → standalone HTML (with built-in syntax highlighting)
 *   2. Playwright Chromium → print-to-PDF
 *
 * Usage: node scripts/md-to-pdf.mjs <input.md> <output.pdf>
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('usage: md-to-pdf <input.md> <output.pdf>');
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), 'md2pdf-'));
const htmlPath = join(tmp, 'out.html');

// 1. Pandoc → standalone HTML with syntax highlighting + table support.
execFileSync(
  'pandoc',
  [
    inputArg,
    '-f',
    'markdown+pipe_tables',
    '-t',
    'html5',
    '--standalone',
    '--highlight-style=tango',
    '--metadata',
    'title:Canvas Template Architecture',
    '-o',
    htmlPath,
  ],
  { stdio: 'inherit' }
);

// 2. Inject print-friendly CSS for sensible margins, mono fonts, and
//    code-block borders. Pandoc emits clean semantic HTML; we just style it.
const css = `
@page { size: A4; margin: 18mm 14mm; }
html { font-size: 11px; }
body {
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  line-height: 1.55;
  color: #111;
  max-width: 100%;
}
h1 { font-size: 1.8rem; margin: 1.4rem 0 0.8rem; border-bottom: 2px solid #111; padding-bottom: 0.3rem; }
h2 { font-size: 1.35rem; margin: 1.6rem 0 0.6rem; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.2rem; }
h3 { font-size: 1.12rem; margin: 1.1rem 0 0.4rem; color: #1e293b; }
h4 { font-size: 1rem; margin: 0.9rem 0 0.3rem; color: #334155; }
p { margin: 0.5rem 0; }
ul, ol { margin: 0.4rem 0 0.4rem 1.3rem; }
li { margin: 0.15rem 0; }
hr { border: none; border-top: 1px dashed #94a3b8; margin: 1.5rem 0; }
strong { color: #0f172a; }
code {
  font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, monospace;
  font-size: 0.86em;
  background: #f1f5f9;
  padding: 0.05em 0.35em;
  border-radius: 3px;
}
pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 0.9rem 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.82em;
  line-height: 1.45;
  page-break-inside: avoid;
  margin: 0.6rem 0;
}
pre code { background: none; padding: 0; color: inherit; }
table {
  border-collapse: collapse;
  width: 100%;
  margin: 0.6rem 0;
  font-size: 0.92em;
  page-break-inside: avoid;
}
th, td { border: 1px solid #cbd5e1; padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
th { background: #f1f5f9; font-weight: 600; }
tr:nth-child(even) td { background: #fafbfc; }
blockquote { border-left: 3px solid #94a3b8; margin: 0.6rem 0; padding: 0.2rem 0 0.2rem 0.9rem; color: #475569; }
`;
let html = readFileSync(htmlPath, 'utf-8');
html = html.replace('</head>', `<style>${css}</style></head>`);
writeFileSync(htmlPath, html);

// 3. Playwright → PDF.
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: outputArg,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
});
await browser.close();

rmSync(tmp, { recursive: true, force: true });
console.log(`PDF: ${outputArg}`);
