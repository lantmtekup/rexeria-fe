// Generate a PDF bug report cho 2 issue phát hiện qua Playwright verify.
// Output: scripts/visual-tests/out/be-issues-report.pdf

import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'out');

const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>BE API Issues — Verify Report</title>
<style>
  @page { size: A4; margin: 18mm 14mm; }
  body { font-family: -apple-system, "SF Pro Text", "Segoe UI", Roboto, sans-serif; color: #111; font-size: 11pt; line-height: 1.5; }
  h1 { font-size: 22pt; margin: 0 0 4pt; }
  h2 { font-size: 14pt; margin: 18pt 0 6pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #111; }
  h3 { font-size: 11pt; margin: 10pt 0 4pt; color: #333; }
  .meta { color: #666; font-size: 9.5pt; margin-bottom: 14pt; }
  .badge { display: inline-block; padding: 1pt 6pt; border-radius: 4pt; font-size: 8.5pt; font-weight: 600; vertical-align: 1pt; }
  .badge-critical { background: #fee2e2; color: #991b1b; }
  .badge-warn { background: #fef3c7; color: #92400e; }
  pre { background: #f6f8fa; border: 1pt solid #d0d7de; border-radius: 4pt; padding: 8pt 10pt; font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 9pt; line-height: 1.4; white-space: pre-wrap; word-break: break-all; overflow-x: auto; }
  .hr { color: #57606a; }
  .hint { color: #57606a; font-size: 9.5pt; }
  .label { font-size: 9pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5pt; color: #57606a; margin: 8pt 0 3pt; }
  table { border-collapse: collapse; width: 100%; font-size: 10pt; margin: 4pt 0; }
  td, th { border: 1pt solid #d0d7de; padding: 4pt 6pt; text-align: left; vertical-align: top; }
  th { background: #f6f8fa; }
  .ok  { color: #1a7f37; }
  .bad { color: #cf222e; }
  .footnote { color: #57606a; font-size: 9pt; margin-top: 8pt; font-style: italic; }
</style>
</head>
<body>

<h1>BE API Issues — Verify Report</h1>
<div class="meta">
  Generated: 2026-04-26 · Project: ReXeR · Source: Playwright e2e on
  <code>http://75.119.128.96:9090</code> · Reporter: FE team
</div>

<h2>Tóm tắt</h2>
<p>
  Trong quá trình verify FE flow bằng Playwright (16 trang),
  phát hiện 2 BE API issue cần BE-team xử lý. Báo cáo này kèm curl
  reproducible để BE-team có thể tái hiện ngay.
</p>
<table>
  <tr><th>#</th><th>Issue</th><th>Severity</th><th>Trang FE bị ảnh hưởng</th></tr>
  <tr>
    <td>A</td>
    <td>TemplatePreview <code>preview_url</code> hard-code <code>localhost:9090</code></td>
    <td><span class="badge badge-warn">High</span></td>
    <td><code>/template/[id]</code> — iframe preview không load</td>
  </tr>
  <tr>
    <td>B</td>
    <td><code>GET /projects/{id}/active-release</code> trả 404 khi chưa publish (vs 200+null)</td>
    <td><span class="badge badge-warn">Medium</span></td>
    <td><code>/product/[id]/landing/[lid]/publish</code> — log network 404 trong console</td>
  </tr>
</table>

<h2>Issue A · Template preview rò <code>localhost:9090</code></h2>
<span class="badge badge-warn">High</span>

<div class="label">Triệu chứng</div>
<p>
  Endpoint <code>GET /v1/templates/{templateId}/preview</code> trả về
  <code>preview_url</code> chứa hostname <code>http://localhost:9090/...</code>
  thay vì hostname production (<code>http://75.119.128.96:9090</code>) hoặc
  relative path. Browser của user gọi URL này sẽ <code>ERR_CONNECTION_REFUSED</code>
  hoặc bị chặn vì cross-origin.
</p>

<div class="label">Curl reproduce</div>
<pre># 1) Login (lưu cookie session)
curl -X POST http://75.119.128.96:9090/v1/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"admin@rexer.ai","password":"Admin1234"}' \\
  -c cookies.txt

# 2) Get template preview
curl -b cookies.txt \\
  http://75.119.128.96:9090/v1/templates/44444444-0000-0000-0000-000000000001/preview</pre>

<div class="label">Response thực tế</div>
<pre>HTTP/1.1 200 OK
Content-Type: application/json

{
  "template_id": "44444444-0000-0000-0000-000000000001",
  "version_id":  "55555555-0000-0000-0000-000000000001",
  "mode": "rendered",
  "preview_url": "http://localhost:9090/preview/landing-hero-v1/1.0.0",
  "preview_html": null,
  "preview_descriptor_json": { "layout": "single-column" }
}</pre>

<div class="label">Response mong muốn</div>
<pre>{
  "preview_url": "http://75.119.128.96:9090/preview/landing-hero-v1/1.0.0"
  // hoặc tốt hơn: "/v1/preview/landing-hero-v1/1.0.0" để FE proxy qua /api/rexer/*
}</pre>

<div class="label">Workaround FE hiện tại</div>
<p>FE iframe vẫn render khung trắng (không crash) nhưng nội dung
preview không hiển thị. Đã ghi nhận trong
<code>/template/[id]/page.tsx</code> để fallback gracefully.</p>

<div class="label">Khuyến nghị BE</div>
<ul>
  <li>Đọc base URL từ env <code>REXER_PUBLIC_URL</code> khi serialize <code>preview_url</code>.</li>
  <li>Tốt nhất trả relative path để FE quyết định gateway.</li>
  <li>Bug cùng pattern với <strong>presigned_url upload media</strong> (xem section 11.5 trong <em>rexerai-mvp-spec.md</em>) — sửa chung 1 helper Go.</li>
</ul>

<h2>Issue B · <code>active-release</code> trả 404 cho expected state</h2>
<span class="badge badge-warn">Medium</span>

<div class="label">Triệu chứng</div>
<p>
  Khi project chưa publish lần nào, <code>GET /v1/projects/{id}/active-release</code>
  trả HTTP 404 với code <code>ERR_RELEASE_NOT_FOUND</code>. Đây là <em>expected state</em>
  của một project mới — không phải lỗi. FE phải catch 404 và treat như "chưa
  publish" (đã làm trong <code>endpoints.ts</code>), nhưng:
</p>
<ul>
  <li>Browser network panel vẫn log đỏ → user/QA tưởng có bug.</li>
  <li>Logger backend (sentry/loki) sẽ ghi error rate giả → noise.</li>
  <li>Field <code>details.id = ""</code> không có giá trị nào — pollutant.</li>
</ul>

<div class="label">Curl reproduce</div>
<pre>curl -b cookies.txt -i \\
  http://75.119.128.96:9090/v1/projects/66666666-0000-0000-0000-000000000001/active-release</pre>

<div class="label">Response thực tế</div>
<pre>HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "code": "ERR_RELEASE_NOT_FOUND",
  "message": "Active release not found",
  "request_id": "df07decb-2c52-4bd5-b46d-7c2af2a9123d",
  "details": { "id": "" }
}</pre>

<div class="label">Response mong muốn (chọn 1 phương án)</div>
<pre>// Option 1 — best: 200 + null
HTTP/1.1 200 OK
{ "release": null }

// Option 2 — REST-pure: 204 No Content
HTTP/1.1 204 No Content

// Option 3 — giữ 404 nhưng KHÔNG log error ở BE side
//           và FE catch nhưng vẫn ngứa mắt console.
</pre>

<div class="label">Workaround FE hiện tại</div>
<pre>// src/services/rexer/endpoints.ts
activeRelease: async (id: string): Promise&lt;Release | null&gt; =&gt; {
  try {
    const r = await rx&lt;ReleaseResponse&gt;(\`/projects/\${id}/active-release\`);
    return r.release ?? null;
  } catch (err) {
    if (err?.status === 404) return null;  // expected
    throw err;
  }
},</pre>

<div class="label">Khuyến nghị BE</div>
<ul>
  <li>Chuyển sang <strong>Option 1 (200 + null)</strong> — semantic cleaner cho concept "đã có hay chưa".</li>
  <li>Nếu giữ 404, gỡ field <code>details.id = ""</code> hoặc thay bằng <code>{ "project_id": "..." }</code>.</li>
  <li>Pattern này áp dụng cả cho các endpoint future "get latest X if exists" — thống nhất convention.</li>
</ul>

<h2>Phụ lục — đã verify</h2>
<table>
  <tr><th>Page</th><th>HTTP</th><th>Verdict</th></tr>
  <tr><td>/sign-in</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/forgot-password (submit → token panel)</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/reset-password</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/setting + /setting/clients (10 clients thật)</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/portal (Client portal layout)</td><td>200</td><td class="ok">PASS (admin → 403 expected)</td></tr>
  <tr><td>/product (BE products)</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/product/[id]/landing (9 landings thật)</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/product/[id]/landing/[lid]/publish</td><td>200</td><td class="ok">PASS (issue B)</td></tr>
  <tr><td>/product/[id]/landing/[lid]/media + UPLOAD pipeline (4 step)</td><td>200/201</td><td class="ok">PASS (sau workaround presigned localhost)</td></tr>
  <tr><td>/product/[id]/landing/[lid]/analytics (reports thật)</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/template/[id]</td><td>200</td><td class="ok">PASS (issue A)</td></tr>
  <tr><td>/ai-agents/start</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/ai-agents/[pid]/template (AI suggest)</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/ai-agents/[pid]/campaign (AI plan)</td><td>200</td><td class="ok">PASS</td></tr>
  <tr><td>/product/[id]/marketing (campaigns thật)</td><td>200</td><td class="ok">PASS</td></tr>
</table>

<p class="footnote">
  Kết quả verify đầy đủ: <code>scripts/visual-tests/out/verify-report.md</code> +
  <code>verify-upload-report.md</code>. Screenshots:
  <code>scripts/visual-tests/out/verify-*.png</code>.
</p>

</body>
</html>`;

const htmlPath = join(OUT, 'be-issues-report.html');
await writeFile(htmlPath, html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + htmlPath, { waitUntil: 'load' });
const pdfPath = join(OUT, 'be-issues-report.pdf');
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', bottom: '18mm', left: '14mm', right: '14mm' },
});
await browser.close();

console.log('PDF generated:', pdfPath);
console.log('HTML kept:    ', htmlPath);
