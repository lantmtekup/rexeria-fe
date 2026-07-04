# BE spec — Interactive Ad Creative (2026-07-02)

> Gửi team BE. FE đã dựng xong: block `interactive_ad_widget` (carousel +
> hotspot + CTA, block-editor native — **verify sống**: đã thêm vào 1
> template thật qua editor, render đúng ảnh nền/hotspot/CTA/nút đóng, panel
> sửa hoạt động, không lỗi console), route `/portal/ad-creatives` (list/
> preview/nhúng/báo cáo — brand chỉ xem, giống `/portal/landing-pages`),
> `/admin/ad-creatives` (staff tạo mới), tracking 6 event qua pipeline
> analytics có sẵn. Clone ý tưởng từ tính năng "quảng cáo tương tác" của
> 360-admin-cms (Supabase) — xem `plans/260508-0849-interactive-ads/plan.md`
> bên đó để đối chiếu kiến trúc gốc; rexerai KHÔNG chép schema đó, tái dùng
> `pages`/`page_releases`/`analytics_events` sẵn có thay vì bảng
> `ads`/`ad_versions`/`ad_events` mới.
>
> **✅ §0.1 ĐÃ SỬA TRONG SOURCE (2026-07-03)** — theo yêu cầu trực tiếp của
> user, ghi đè quy tắc "BE read-only" cho đúng 2 gap chặn cứng dưới đây.
> Đã sửa trong `be-ReXeR.ai` (không qua FE workaround):
> `internal/domain/models/template.go` (+`TargetPageType` field trong
> `CreateTemplateRequest`/`UpdateTemplateRequest`), `internal/usecase/
> template.go` (wire field vào `Create()`/`Update()`), migration mới
> `000047_seed_interactive_ad_widget_block_catalog.{up,down}.sql` (seed
> `interactive_ad_widget` vào bảng `blocks`, cùng cơ chế migration 000038/
> 000043 — thiếu bước này thì commit version chứa block này vẫn 400 "unknown
> block type"). `go build ./...` + `go vet` + `go test ./...` (toàn bộ suite,
> gồm `TestPageCanonicalUsecase_Create_RejectsTypeMismatch`) đều sạch, không
> regress. **CHƯA deploy** — migration chưa chạy trên DB thật, binary chưa
> build/release. Cần team BE (hoặc CI/CD pipeline) merge + deploy bản này để
> có hiệu lực trên `rexerai.tekupsoftware.com`; review lại diff trước khi
> merge vẫn cần thiết dù đã test kỹ.

## 0. Scope

**0.1 — ✅ đã sửa trong source, chờ deploy:**
- Đã thêm field `target_page_type` (optional, `oneof=landing ad curate email`) vào `CreateTemplateRequest` + `UpdateTemplateRequest`, wire vào usecase `Create()`/`Update()`. Không set → giữ hành vi cũ (DB trigger `rexer_sync_template_defaults` set `'landing'`).
- Repro trước khi sửa (đã chạy thật):
  ```
  POST /templates {code, name, preview_mode:"static", status:"draft"}
  → 201, template.target_page_type = "landing" (không truyền field này được)
  POST /templates/{id}/versions {version:"1.0.0", schema_version:"2.0",
    field_schema_json:{}, default_config_json:{}, canvas_blueprint:{blocks:[]}}
  → 201, template.current_version_id giờ đã set đúng
  POST /workspaces/{wsId}/pages {type:"ad", template_id, ...}
  → 400 ERR_PAGE_TYPE_MISMATCH
    {"page_type":"ad","template_target_page_type":"landing"}
  ```
  Sau khi sửa: FE gửi `POST /templates {..., target_page_type:"ad"}` → template mang đúng target → `pages.create({type:'ad', template_id})` không còn mismatch.

**Trong phạm vi (sau khi §0.1 deploy):**
- Mở `GET /pages/:id/embed-snippet` cho `type IN ('curate', 'ad')` (hiện chỉ nhận `curate`).
- Xác nhận `PATCH /pages/:id` nhận `type_metadata` tự do (JSON passthrough) hay có schema cứng theo `type` — **đã tự xác nhận qua đọc source `internal/core/type_metadata_validator.go`**: có validator theo `pageType`, `type='ad'` chỉ require `format` + `dimensions.{width,height}` (đúng field FE đã gửi), field lạ như `interactive.*` KHÔNG bị reject (pass-through). Không cần BE đổi gì thêm cho phần này.
- Domain-allowlist + freq-cap enforce phía server (thay client-check tạm của FE).
- Endpoint mới `resolve-ad-variant` cho A/B sticky-bucket.
- Thêm `dimensions.slide_index` / `dimensions.hotspot_id` / `dimensions.variant` vào whitelist `group_by` của `/pages/:id/analytics/breakdown` (nếu chưa có).
- ~~Seed `interactive_ad_widget` vào block catalog~~ — **✅ đã làm** (migration 000047, xem callout đầu file).

**Ngoài phạm vi (không làm):**
- KHÔNG tạo bảng `ads`/`ad_versions`/`ad_events` riêng — ad creative là 1 `Page` (`type='ad'`, `type_metadata.format='interactive_widget'`) như mọi page khác, dùng chung `page_releases` cho versioning và `analytics_events` (pipeline `/v1/analytics/events` có sẵn) cho tracking.
- KHÔNG cần loader.js/CDN riêng — nhúng qua `<iframe src="/p/{slug}?embed=1">` thẳng, route `/p/[id]` vốn đã không set `X-Frame-Options`/CSP `frame-ancestors` nên nhúng được ngay hôm nay.

## 1. Field / entity

Không có bảng mới. Field mở rộng nằm trong `type_metadata` (jsonb) của `Page` khi `type='ad'`:

| Field | Type | Bắt buộc | Ghi chú |
|---|---|---|---|
| `format` | string | có | thêm giá trị `'interactive_widget'` vào enum hiện có (`facebook_feed`, `banner_728x90`, ...) |
| `interactive.layout` | `'floating_bottom'\|'sticky_top'\|'inline'\|'modal'` | không | cách hiện trên site đối tác |
| `interactive.trigger` | `'on_load'\|'scroll_pct'\|'exit_intent'\|string` | không | |
| `interactive.trigger_config.delay_ms` | number | không | |
| `interactive.trigger_config.scroll_threshold_pct` | number | không | |
| `interactive.closeable` | boolean | không | |
| `interactive.freq_cap_per_visitor_per_day` | number | không | **chưa enforce server-side** |
| `interactive.allowed_domains` | string[] | không | hỗ trợ wildcard `*.tekup.vn`; **chưa enforce server-side** |
| `interactive.ab_test.enabled` | boolean | không | |
| `interactive.ab_test.variant_release_ids` | string[] | không | 2+ `PageRelease.id` để chia traffic |
| `interactive.ab_test.split_pct` | number[] | không | cùng length với `variant_release_ids`, tổng 100 |
| `interactive.embed_token` | string | không | set bởi BE khi `embed-snippet` chạy lần đầu (mirror `PageMetadataCurate.embed_token`) |

Event taxonomy FE đang bắn qua `POST /v1/analytics/events` (field `event_type`, vốn là string mở, không cần BE đổi schema):

| event_type | Khi nào | element_id | meta.dimensions |
|---|---|---|---|
| `ad_impression` | mount | — | `variant` (nếu có A/B) |
| `ad_viewable` | IntersectionObserver ≥50% diện tích, ≥1000ms | — | — |
| `ad_interaction` | đổi slide (Swiper `onSlideChange`) | — | `slide_index` |
| `ad_cta_click` | click hotspot/CTA | id hotspot/cta | `slide_index`, `hotspot_id`, `cta_id`, `kind` |
| `ad_close` | bấm nút đóng | — | — |
| `ad_outbound` | CTA điều hướng ra ngoài | id cta | — |

## 2. Endpoints

### 2.1 `GET /pages/:id/embed-snippet` — mở cho `type='ad'`

Hiện tại (theo comment trong FE code) endpoint này chỉ trả kết quả cho `type='curate'`. Đề nghị mở rộng guard sang `type IN ('curate', 'ad')`. Request/response giữ nguyên shape:

```json
// response 200
{ "snippet": "<iframe src=\"...\">...</iframe>", "embed_token": "..." }
```

Cho tới khi có, FE tự dựng snippet client-side (`/p/{slug}?embed=1`) — xem `portal/ad-creatives/[id]/embed/page.tsx`.

### 2.1b `POST /templates` — cho set `target_page_type` ✅ đã sửa (chờ deploy)

Đã thêm optional field `target_page_type: 'landing'|'ad'|'curate'|'email'` vào `CreateTemplateRequest` + `UpdateTemplateRequest` (`internal/domain/models/template.go`), wire vào `templateUsecase.Create()`/`Update()` (`internal/usecase/template.go`). Bỏ trống vẫn ra `'landing'` như cũ (DB trigger).

### 2.2 `PATCH /pages/:id` — `type_metadata` freeform ✅ đã tự xác nhận

Đọc source `internal/core/type_metadata_validator.go`: có validator per-`pageType`. `type='ad'` chỉ require `format` (string) + `dimensions.{width,height}` (int dương), optional `duration_sec` — field lạ như `interactive.*` KHÔNG bị reject, chỉ đi qua không validate. Không cần BE đổi gì — payload FE đang gửi đã hợp lệ.

### 2.3 `POST /pages/:id/resolve-ad-variant` (mới) — A/B sticky-bucket

```json
// request
{ "visitor_id": "v_abc123" }
// response 200
{ "release_id": "rel_...", "variant_key": "A" }
```

BE hash `visitor_id` theo `interactive.ab_test.split_pct`, trả cố định cùng 1 variant cho cùng visitor ở các lần gọi sau (sticky). FE gọi endpoint này ở `_block-render.tsx` trước khi render, tag `dimensions.variant` vào mọi event tiếp theo.

### 2.4 `group_by` whitelist bổ sung

`/pages/:id/analytics/breakdown` hiện nhận `group_by` whitelisted (`block_key`, `event_type`, `dimensions.cta_id`, `dimensions.variant`, ...). Xác nhận `dimensions.slide_index` và `dimensions.hotspot_id` đã có trong whitelist chưa — nếu chưa, thêm.

## 3. Enforcement (server-side, thay client-check tạm)

- **Domain allowlist**: check `Referer`/`Origin` header khi serve `GET /v1/public/pages/{slug}`, so khớp `type_metadata.interactive.allowed_domains` (hỗ trợ wildcard). Không khớp → 403 hoặc trả response rỗng để FE hiện "not authorized".
- **Freq cap**: đếm impression theo `(page_id, visitor_id, ngày)` — có thể dùng COUNT trên `analytics_events` (event_type='ad_impression') hoặc bảng đếm riêng nếu volume cao. Câu hỏi mở: đếm theo visitor/ngày, theo session, hay theo (page × domain)? (xem §4.4).
- **Block catalog seed**: ✅ đã làm — migration `000047_seed_interactive_ad_widget_block_catalog.{up,down}.sql`, cùng cơ chế 000038/000043 (INSERT `blocks` scope='system', supported_surfaces={landing,ad,curate}, idempotent).

## 4. Câu hỏi mở

~~0. (Ưu tiên cao nhất) §0.1/§2.1b~~ — đã tự trả lời bằng cách sửa trực tiếp (thêm field vào cả create lẫn update).
~~1. `PATCH /pages/:id` — type_metadata freeform?~~ — đã tự xác nhận (§2.2): có validator nhưng chỉ check field bắt buộc, field lạ pass-through.
2. `group_by=dimensions.cta_id` hiện đọc từ đâu — JSONB column populated từ `AnalyticsEventInput.meta.dimensions.*` lúc ingest, hay có bước xử lý riêng? FE đang double-write vừa `element_id` top-level vừa `meta.dimensions.*` — có cần cả 2 không hay chỉ 1 đủ?
3. A/B: cookie sticky bucket ở BE hay FE tự lưu cookie rồi gửi lại `visitor_id` mỗi lần?
4. Freq-cap: đếm theo visitor/ngày, theo session, hay theo (page_id × domain đối tác)?
5. `embed_token` (mirror `PageMetadataCurate.embed_token`) — có cần bắt buộc kiểm tra token khi serve embed, hay domain-allowlist đã đủ?

## 5. Test plan

- §0.1: ✅ `go test ./...` (toàn bộ suite, không regress) **+ đã chạy tích hợp thật** trên Postgres local (brew, `postgresql@17`, DB `rexer_ai` — restore từ remote qua `make restore-local` từ trước) sau `make migrate-up` (44→47): `go run ./cmd/app -env=dev` (port 8080) → `POST /templates {..., target_page_type:"ad"}` → 201 `target_page_type:"ad"` đúng → `POST /templates/:id/versions` → `current_version_id` set đúng → `POST /workspaces/:id/pages {type:"ad", template_id}` → **201** (trước đây 400 `ERR_PAGE_TYPE_MISMATCH`). Đồng thời xác nhận thêm 1 điều quan trọng: `CreateVersion` **bỏ qua `canvas_blueprint` trong request body**, luôn đọc từ `templates.draft_canvas_blueprint` (autosave buffer) — phải `PATCH /templates/:id/draft-canvas-blueprint` trước rồi mới `POST .../versions` thì block mới thật sự được commit (đã test: `PATCH` draft có `interactive_ad_widget` → `POST versions` → 201, `canvas_blueprint` trong response chứa đúng block, **xác nhận migration 000047 (seed block catalog) hoạt động đúng** — không seed thì bước này sẽ 400 "unknown block type"). **Còn thiếu**: smoke test trên `rexerai.tekupsoftware.com` sau khi deploy thật (local test không tự động áp dụng cho server đó).
- Domain khớp/không khớp allowlist → 200/403 đúng.
- Freq-cap: impression thứ N+1 trong ngày (N = cap) → không tính thêm / có cờ báo vượt cap.
- `resolve-ad-variant` gọi lặp lại cùng `visitor_id` → luôn trả cùng `release_id`.
- `embed-snippet` với `type='ad'` → 200 (hiện 404/403 nếu vẫn guard `curate` only).

## 6. FE → BE migration checklist

Khi từng phần ở trên ship, FE sẽ:
- [ ] Đổi `ad-creatives/[id]/embed/page.tsx` từ tự dựng URL sang gọi `pages.embedSnippet(id)`.
- [ ] Bỏ check domain-allowlist client-side trong `_block-render.tsx` (giữ lại làm fallback UX, không phải nguồn enforce).
- [ ] Gọi `resolve-ad-variant` trước khi render nếu `interactive.ab_test.enabled`.
- [ ] Thêm view so sánh A/B vào `ad-creatives/[id]/analytics/page.tsx`.
