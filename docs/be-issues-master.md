# BE Issues — Master Log

**Owner**: FE team · **Audience**: BE team · **Last updated**: 2026-04-27

Tổng hợp toàn bộ vấn đề BE cần fix, gom từ 3 nguồn:
- `rexerai-mvp-spec.md` section 11 (API issues phát hiện qua wire FE)
- `be-data-gap-home.md` (data thiếu khi render Home)
- `be-issues-report.pdf` + Playwright e2e (`scripts/visual-tests/`)

Mỗi issue có **ID duy nhất**, **repro**, **expected**, **FE workaround hiện tại**, và **fix suggestion**. ID dùng prefix:
- `BUG-*` — bug rõ ràng (sai semantic, broken pipeline, security hole)
- `GAP-*` — field/endpoint thiếu nhưng FE cần
- `DX-*` — developer-experience / inconsistency, không break nhưng tăng cost

---

## 0. Severity matrix

| Severity | Định nghĩa | Open | Closed | Partial |
|---|---|---|---|---|
| 🔴 **Critical** | Block MVP flow / security hole | 0 | **7** | 1 |
| 🟡 **Important** | Cải thiện UX, không block | 8 | **3** | 3 |
| 🟢 **Nice-to-have** | Phase 2, không gấp | 9 | 0 | 0 |

> **2026-04-27 update**: BE team ship update lớn — đa số bug critical đã đóng. Chi tiết status mỗi issue ghi inline + section 5 change log.

### Snapshot ngắn

✅ **Closed (10)**: BUG-01, BUG-02, BUG-03, BUG-04, BUG-05, BUG-06, BUG-07, GAP-04 (Template thumbnail), GAP-08 (Project embed client+template), DX-01 (new resources)
🟡 **Partial (4)**: GAP-01, GAP-02, DX-01 (old resources), GAP-13
⏳ **Open (17)**: GAP-03, GAP-05, GAP-06, GAP-07, GAP-09–16, BUG-08, BUG-09, BUG-10, DX-02, DX-03, DX-04, DX-05

🆕 **2 resource mới ship theo spec**: `canvas_templates` (8 endpoints) + `collections + records` (10 endpoints) — verified Playwright + curl pass.

---

## 1. 🔴 Critical (8 issues — fix trước khi GA)

### ✅ BUG-01 · `presigned_url` upload rò `localhost:9090` → pipeline upload broken — **CLOSED 2026-04-27**

> Fix: BE giờ trả presigned URL S3 thật `https://epictower-media.s3.ap-southeast-1.amazonaws.com/...`. FE workaround có thể gỡ trong `use-upload-and-bind.ts` (detect `localhost`).
- **Endpoint**: `POST /v1/media/uploads/init`
- **Repro**:
  ```bash
  curl -b cookies.txt -X POST http://75.119.128.96:9090/v1/media/uploads/init \
    -H 'Content-Type: application/json' \
    -d '{"filename":"a.png","mime_type":"image/png","file_size":70,"owner_scope":"library","media_type":"image"}'
  ```
- **Response thực tế**:
  ```json
  {
    "upload_id": "...",
    "presigned_url": "http://localhost:9090/v1/media/uploads/.../raw"
  }
  ```
- **Vấn đề**: Browser PUT vào `localhost:9090` → `ERR_CONNECTION_REFUSED` → toàn bộ flow upload media gãy.
- **Phát hiện**: Playwright e2e `verify-upload-flow.mjs`.
- **FE workaround**: Detect `localhost`/`127.0.0.1` trong `presigned_url`, fallback dùng proxy `/api/rexer/media/uploads/{id}/raw` (`use-upload-and-bind.ts`).
- **Fix BE**: Đọc base URL từ env `REXER_PUBLIC_URL`, hoặc trả relative path. Sửa chung helper với BUG-02.

---

### ✅ BUG-02 · `TemplatePreviewResponse.preview_url` cũng `localhost:9090` — **CLOSED 2026-04-27**

> Fix: BE giờ trả relative path `/preview/landing-hero-v1/1.0.0`. FE cần prefix `/api/rexer` khi load iframe. Cập nhật template detail page.
- **Endpoint**: `GET /v1/templates/{templateId}/preview`
- **Repro**:
  ```bash
  curl -b cookies.txt http://75.119.128.96:9090/v1/templates/44444444-0000-0000-0000-000000000001/preview
  ```
- **Response**:
  ```json
  { "preview_url": "http://localhost:9090/preview/landing-hero-v1/1.0.0", ... }
  ```
- **Vấn đề**: iframe preview không load.
- **FE workaround**: Card hiển thị tên template viết hoa thay cho preview thật.
- **Fix BE**: Cùng helper với BUG-01. Tốt nhất return relative path để FE quyết định gateway.

---

### ✅ BUG-03 · `/auth/forgot-password` rò `reset_token` trong response → security hole — **CLOSED 2026-04-27**

> Fix: response giờ chỉ trả `{"message":"If the email exists, a reset link has been sent"}`. Token đi qua email. FE đã có sẵn forgot/reset password page, vẫn work.
- **Endpoint**: `POST /v1/auth/forgot-password`
- **Vấn đề**: Response body chứa `reset_token` thẳng. Schema comment thừa nhận "MVP only, replace with email in prod" — nhưng nếu deploy production mà quên thay → attacker gọi forgot-password cho bất kỳ email nào và lấy token reset luôn.
- **FE workaround**: Hiển thị token + cảnh báo "MVP — email not sent" để user/dev không quên.
- **Fix BE**:
  - Gate behind env flag `REXER_MVP_RESET_TOKEN_IN_BODY=false` cho prod.
  - Default response chỉ trả `{ message: "If the email exists, a reset link has been sent" }`.
  - Log warning loud nếu MVP mode còn bật trên environment != dev.

---

### ✅ BUG-04 · `SimpleDate` schema sai — wrap thành `{ "time.Time": "..." }` — **CLOSED 2026-04-27**

> Fix: dates trả ISO string trực tiếp với `format: date` example `"2026-02-01"`. `SimpleDate` schema gone.
- **Endpoint**: tất cả endpoint dùng `SimpleDate` (vd `Campaign.start_date`, `end_date`)
- **Repro**:
  ```bash
  curl -b cookies.txt http://75.119.128.96:9090/v1/campaigns
  ```
- **Response**:
  ```json
  { "items": [{ "start_date": { "time.Time": "2026-04-25T00:00:00Z" }, ... }] }
  ```
- **Vấn đề**: FE phải truy cập `date["time.Time"]` — ugly, dễ break, không match Swagger spec phổ thông.
- **FE workaround**: Helper `unwrapSimpleDate(d)` (chưa viết — đang TODO).
- **Fix BE**: Marshal `time.Time` trực tiếp ra ISO-8601 string. Thay tất cả `SimpleDate` field thành `string` (date-time).

---

### ✅ BUG-05 · `PublishProjectRequest.config_revision_no` REQUIRED nhưng FE không có UI builder — **CLOSED 2026-04-27**

> Fix: `config_revision_no` giờ optional. Schema comment: *"When omitted the BE auto-publishes the latest config revision for the project, so a freshly-created project without an explicit revision number can still publish via the FE."* FE có thể publish project mới ngay.
- **Endpoint**: `POST /v1/projects/{id}/publish`
- **Vấn đề**: Spec yêu cầu `config_revision_no` (int, min 1). Nhưng FE chưa có UI builder để generate config revision → user mới tạo project xong KHÔNG publish được.
- **FE workaround**: PublishWorkspace gọi `GET /v1/projects/{id}/config` trước, nếu có `current_revision` thì lấy `revision_no` đó. Nếu chưa có → toast "No config — open builder to save one" và disable nút publish. **Hệ quả**: với BE hiện tại, project mới chưa có config → không bao giờ publish được qua UI.
- **Fix BE**: Cho phép `config_revision_no = null` ⇒ BE auto dùng current revision. Hoặc auto-create empty revision khi tạo project.

---

### ✅ BUG-06 · `Product` response thiếu `status` dù request có — **CLOSED 2026-04-27**

> Fix: Product schema giờ có `status` field (`"active"`/`"draft"`/`"archived"`). FE có thể hiển thị badge ngay.
- **Endpoint**: `GET /v1/products/{id}`, `POST /v1/products`, `PATCH /v1/products/{id}`
- **Vấn đề**: `CreateProductRequest`/`UpdateProductRequest` đều có `status: enum draft|active|archived`, nhưng `Product` schema response **không có** field này. FE save xong không đọc lại được → không hiển thị badge status.
- **FE workaround**: Default hiển thị "draft" cho mọi product.
- **Fix BE**: Thêm `status` vào `Product` schema response.

---

### 🟡 GAP-01 · `Project.active_release_url` (hoặc embed `active_release`) — **PARTIAL 2026-04-27**

> Status: Project list giờ embed `client` + `template` (GAP-08 fix). Nhưng VẪN chưa có `active_release` embed hoặc `page_url` flat. FE muốn link "Open landing" trực tiếp vẫn phải gọi thêm `GET /projects/{id}/active-release`.
> *Đề xuất*: nâng lên priority Important — embed `active_release: { id, page_url, published_at }` vào Project response.
- **Endpoint**: `GET /v1/projects` (list), `GET /v1/projects/{id}`
- **Vấn đề**: BE chỉ trả `active_release_id` (UUID). FE muốn link "Open landing" trên card → phải gọi thêm `GET /releases/{id}` để có `page_url` → N+1 calls trên list.
- **FE workaround**: Card landing chưa render link Share. PublishWorkspace gọi `activeRelease(projectId)` riêng biệt.
- **Fix BE**: Trả `active_release_url: string` flat, hoặc tốt hơn embed `active_release: { id, page_url, published_at }`.

---

### 🟡 GAP-02 · `/auth/me` không trả `client` info — **PARTIAL 2026-04-27**

> Status: `/auth/me` giờ có `user.role` (great), nhưng VẪN chưa có `client` embed. Sidebar workspace name vẫn hard-code "Hnd.Studio".
> *Cần*: thêm `client: { id, name }` (single tenant) hoặc `clients: [...]` (multi tenant) vào response.
- **Endpoint**: `GET /v1/auth/me`
- **Vấn đề**: Sidebar hiển thị workspace name "Hnd.Studio" hard-code. FE muốn hiện client name thật của user. Tương tự, sau register/login FE không biết user thuộc client nào.
- **Hệ quả phụ**: `LoginResponse` cũng thiếu `client` (chỉ `RegisterResponse` mới có) → inconsistency.
- **FE workaround**: Hard-code "Hnd.Studio" trong `AppShellLayout`.
- **Fix BE**: 
  - `/auth/me` trả thêm `client: { id, name }` cho single-tenant user.
  - Hoặc `clients: [{...}]` cho user multi-tenant.
  - Đồng bộ `LoginResponse` cùng shape với `RegisterResponse`.

---

## 2. 🟡 Important (14 issues — nên có Sprint 1-2)

### ✅ BUG-07 · `GET /projects/{id}/active-release` trả 404 cho expected state — **CLOSED 2026-04-27**

> Fix: giờ trả `200 + {"release": null}` cho project chưa publish. Console không còn red noise. FE catch 404 vẫn an toàn (defensive).
- Project chưa publish bao giờ → 404 với code `ERR_RELEASE_NOT_FOUND`. Đây là expected state, không phải lỗi. FE phải catch 404 và treat như null. Browser console log đỏ → noise.
- **Repro**: `curl -b cookies.txt http://75.119.128.96:9090/v1/projects/.../active-release` → `404 + {"code":"ERR_RELEASE_NOT_FOUND","details":{"id":""}}`
- **FE workaround**: `try/catch` 404 → return null trong `endpoints.ts`.
- **Fix BE**: Trả `200 + {release: null}` thay 404. (Phụ: gỡ field rỗng `details.id = ""`.)

---

### 🟡 DX-01 · Pagination thiếu `total_pages` — **PARTIAL 2026-04-27**

> Status: Resource MỚI (`canvas_templates`, `collections`, `records`) đã đi theo flat shape `{ items, page, limit, total, total_pages }` ✅. Nhưng resource CŨ (`products`, `projects`, `campaigns`, `categories`) vẫn dùng wrap `{ items, pagination: {...} }` — inconsistent.
> *Cần*: BE migrate pattern cũ về flat (breaking change — coordinate với FE).
- `ProductListResponse / ProductCategoryListResponse / CampaignListResponse` chỉ trả `{items, page, limit, total}`. FE phải tự `Math.ceil(total/limit)`.
- **Fix**: Thêm `total_pages: int`. Optional thêm `has_next: bool`, `has_prev: bool`.

---

### DX-02 · `BindMediaItem.field_key` required ở Project bind, optional ở Product bind
- Inconsistency giữa 2 endpoint cùng concept. FE hook bind phải biết loại resource.
- **Fix**: Thống nhất 1 trong 2 (recommend optional cả hai, default `gallery`).

---

### DX-03 · `ProductMediaBinding` vs `ProjectMediaBinding` — 2 schema khác nhau
- Cùng pattern `{id, *_id, field_key, slot_key, media_id, created_at}` nhưng tách type. FE dễ nhầm khi build helper chung.
- **Fix**: Gộp thành `MediaBinding` với discriminator `target_type: "project" | "product"`.

---

### BUG-08 · `Campaign.tracked_url` empty khi landing chưa publish — không có lý do
- Schema comment "computed at read-time from active release". Empty khi `landing_project_id` chưa publish. FE đang fallback "—" nhưng không cảnh báo user.
- **Fix**: Thêm `tracked_url_status: "ready" | "no_release" | "no_landing"` để FE hiển thị nguyên nhân.

---

### BUG-09 · AI endpoints không document error responses
- 6 endpoint `/ai/*` chỉ define `200`. Khi LLM provider timeout / quota / 429 thì BE trả gì không rõ. FE đang `try/catch` generic → không thể hiển thị thông báo chính xác.
- **Fix**: Document `429 QuotaExceeded`, `503 LLMUnavailable`, `408 LLMTimeout` với error code chuẩn để FE map message.

---

### DX-04 · `AIMediaSuggestResponse.suggestions: Record<section, string[]>` — `string[]` là gì?
- URL hay description? Schema không clarify. FE đang test cả 2: nếu match `^https?://` thì render `<img>`, không thì render text.
- **Fix**: Đổi thành `Record<section, AIMediaSuggestion[]>` với `{ url?, description?, source?, license? }`.

---

### GAP-03 · Không có `GET /clients/{id}/access-grants` list endpoint
- FE tạo grant qua POST nhưng không có cách enum lại các grant đã tạo. Trang Access Grants chỉ thấy grant mới tạo trong session.
- **FE workaround**: Show empty list + note "BE doesn't expose list yet".
- **Fix**: Thêm `GET /v1/clients/{id}/access-grants`.

---

### BUG-10 · `ChangePasswordRequest` không invalidate sessions khác
- Bảo mật: nếu attacker đã có session active, đổi password không kick được.
- **Fix**: Invalidate other sessions sau change-password thành công. Optionally trả về số sessions bị kick để FE confirm.

---

### ✅ GAP-04 · `Template.thumbnail_url` (không có thì card template không có ảnh) — **CLOSED 2026-04-27**

> Fix: Template giờ có `thumbnail_url` (CDN URL `https://cdn.rexer.ai/templates/landing-hero-v1.png`) + `category` + `tags` + `author`. FE Home/Template page có thể hiển thị thumbnail thật, gỡ hard-code beige `#f5f3ee`.
- FE hard-code `imageBg: '#f5f3ee'` cho mọi template trên Home + Template list.
- **Fix**: Thêm `thumbnail_url: string` (hoặc `thumbnail_storage_key`) vào `Template` và `TemplateVersion`. Auto-generate từ first publish snapshot.

---

### GAP-05 · `Project.screenshot_url` (không có thì card landing không có preview)
- Card chỉ hiển thị tên project repeat làm placeholder mờ.
- **Fix**: Khi project có `active_release_id`, BE crawl `og:image` từ `page_url` hoặc generate screenshot 1280×720.

---

### GAP-06 · `Project.last_publish_at`
- FE muốn hiển thị "Cập nhật 2 ngày trước". Hiện dùng `updated_at` không chính xác (thay đổi cả khi sửa config draft).
- **Fix**: Thêm `last_publish_at: timestamp | null` (timestamp của latest published release).

---

### GAP-07 · `Project.analytics_summary` trong list response
- BE đã có `ProjectSummary.analytics_summary` qua `GET /projects/{id}/summary` riêng. FE muốn render KPI nhỏ trên card list → N+1 nếu phải gọi summary cho mỗi project.
- **Fix**: Thêm vào `Project` list response: `analytics_summary?: SummaryMetrics` (có thể opt-in qua `?include=analytics`).

---

### ✅ GAP-08 · `Project.template` + `Project.client` embed — **CLOSED 2026-04-27**

> Fix: Project list response giờ có embedded `client: {id, name, status, ...}` và `template: {id, code, name, description, status, current_version_id, thumbnail_url, category, tags, ...}`. FE skip 2 round-trip để hiển thị "Powered by Landing Hero v1" + "Client: Acme Corporation".
- Hiện chỉ có UUID (`template_id`, `client_id`). FE muốn hiển thị "Powered by Landing Hero v1" và "Client: Acme Corporation" → phải gọi thêm 2 endpoints.
- **Fix**: Embed `template: { id, name, version }` và `client: { id, name }`. Hoặc flat `template_name`, `client_name`.

---

## 3. 🟢 Nice-to-have (9 issues — Phase 2)

### GAP-09 · `Template.category` / `tags`
- FE filter bar trên `/template` đang mock 9 category cứng (Fashion / F&B / Tech / etc.) với count `250`. Nên dùng category thật từ BE.
- **Fix**: `category: string` enum hoặc `tags: string[]` trên Template + endpoint `GET /v1/template-categories`.

### GAP-10 · `Template.author_name` (resolve user)
- Card template hiện dùng `template.code` làm sub-label thay vì tên author thật. Trang detail muốn hiện avatar + tên author.
- **Fix**: Embed `created_by: { id, display_name, avatar_url }` hoặc flat `created_by_name`.

### GAP-11 · `Template.usage_count` + `version_count`
- "12 landings dùng template này" → social proof. "v3" badge → cho user biết template có evolve.
- **Fix**: Trả trong list response: `usage_count: int`, populate từ join.

### GAP-12 · `User.avatar_url`
- Render avatar tròn cạnh greeting "Hi, ReXeR Admin 👋".
- **Fix**: `avatar_url?: string` trong `RxUser`.

### GAP-13 · `User.role` (admin / staff / client_user)
- Quyết định show/hide section nào trên sidebar (vd Settings/Clients chỉ admin).
- **Fix**: `role: string` enum trong `/auth/me`.

### GAP-14 · `DashboardSummary.*_delta_7d`
- Hiển thị "+12% so với tuần trước" giống dashboard chuẩn.
- **Fix**: Bổ sung `page_views_delta_7d`, `cta_clicks_delta_7d`, etc. — tính ratio so với 7 ngày trước.

### GAP-15 · `DashboardSummary.range_from / range_to`
- Hiển thị "Số liệu tính từ 2026-04-19 → 2026-04-26".
- **Fix**: Thêm 2 field metadata. Cho phép FE pass `?range=7d`.

### GAP-16 · `Project.pinned` / `favorite`
- Recent landings sắp xếp theo `updated_at desc`. Cần pin để giữ landing quan trọng trên top.
- **Fix**: `pinned: boolean` hoặc resource riêng `/v1/users/me/pinned-resources`.

### DX-05 · `Track` endpoint nhận `release_id` optional nhưng public landing không biết
- Landing public không biết chính xác `release_id` của mình (chỉ biết qua HTML inject).
- **Fix**: BE inject `<script data-release-id="...">` vào published HTML để FE track helper đọc từ DOM.

---

## 4. Cross-cutting đề xuất API design

### Pattern 1 · `?include=` cho list endpoints
Cho phép FE chủ động giảm/tăng payload size.
```
GET /v1/projects?include=template,client,analytics,active_release
```
List view cần nhiều, edit view không cần `analytics_summary`. Hiện tại các endpoint trả fixed shape → N+1 cho list 20 project.

### Pattern 2 · Helper Go cho serialize URL
BUG-01 (`presigned_url`) và BUG-02 (`preview_url`) cùng gốc: hard-code `localhost:9090`. Nên có 1 helper:
```go
func PublicURL(path string) string {
    base := os.Getenv("REXER_PUBLIC_URL")
    if base == "" { base = "http://localhost:9090" }
    return base + path
}
```
Hoặc tốt hơn — luôn return relative path, để FE/CDN quyết định base.

### Pattern 3 · Thống nhất nullable thay 404
BUG-07 (`active-release` trả 404 cho expected state). Pattern này có thể áp dụng cho các endpoint future "get latest X if exists" — nên thống nhất convention `200 + null` thay 404 cho semantic "đã có hay chưa".

### Pattern 4 · Embed thay UUID raw
GAP-01, GAP-08 — list response trả UUID khiến FE phải gọi thêm 2-3 endpoint nữa để hiển thị tên. Embed lightweight object là chuẩn (vd Stripe, Linear).

---

## 5. Change log

| Date | Action | By |
|---|---|---|
| 2026-04-25 | Initial 17 issues from `rexerai-mvp-spec.md` section 11 | FE |
| 2026-04-26 | + BUG-01/02 phát hiện qua Playwright e2e | FE |
| 2026-04-26 | + GAP-04 → GAP-16 từ Home page analysis | FE |
| 2026-04-26 | Consolidated thành master log này | FE |
| **2026-04-27** | **BE ship update lớn**: closed 7 critical bugs (BUG-01→BUG-07) + 2 gaps (GAP-04, GAP-08). Ship 2 resource mới: `canvas_templates` (per `be-canvas-templates-spec.md`) và `collections + records` (per `be-collections-spec.md`). 304 ETag handshake hoạt động đúng spec. | BE → verified by FE curl |

---

## 6. References

- Source spec: `docs/rexerai-mvp-spec.md` (section 11)
- Home gap: `docs/be-data-gap-home.md`
- E2E test: `scripts/visual-tests/verify-new-flows.mjs`, `verify-upload-flow.mjs`
- BE-team report PDF: `scripts/visual-tests/out/be-issues-report.pdf`
- Swagger: `http://75.119.128.96:9090/swagger/index.html`

---

**Next action (FE)**: Khi BE close issue nào, FE sẽ:
1. Gỡ workaround tương ứng trong code.
2. Update mục đó trong file này thành `~~strikethrough~~ (closed YYYY-MM-DD)`.
3. Cập nhật `change log`.
