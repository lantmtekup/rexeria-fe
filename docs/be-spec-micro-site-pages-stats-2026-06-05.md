# BE spec — Micro-site: Pages + Số liệu nhập tay (2026-06-05)

> **✅ RESOLVED 2026-06-05.** BE đã ship đúng spec (commit `413b173` +
> migration `000020`): pages CRUD, manual metrics `PUT .../metrics` (Option 1 —
> merge ingest+manual, có cờ `source`). FE đã wire thật & gỡ localStorage demo
> (`microSiteLocal.ts` xoá). Routes/model khớp 100% với §A/§B dưới. Tích hợp:
> `endpoints.ts` (`microSites.listPages/createPage/updatePage/removePage/upsertMetrics`),
> `MicroSiteManageDialog.tsx`, badge `source` ở portal `/micro-sites`.

**Soạn:** FE (Lan) · **Trạng thái:** đề xuất. FE đã có UI **admin** (tab Microsite
› nút "Quản lý" → 2 tab Pages / Số liệu), hiện chạy **local demo**
(`localStorage`, xem `microSiteLocal.ts`) vì BE mới chỉ có `micro_sites` +
`micro_site_events`. Cần BE ship 2 nhóm endpoint dưới để wire thật + cross-user.

> Nối tiếp `be-spec-portal-features-2026-06-04.md` §B (micro-site CRUD + analytics
> đã ship `b59f72b`). Đây là phần bổ sung **pages** + **manual metrics**.

## Bối cảnh

- Micro-site = tổ hợp nhiều **page** (mỗi page 1 path, vd `/`, `/booking`).
- Analytics hiện đến từ script nhúng (`micro_site_events`) → `top_pages` là
  **derived**. FE cần thêm **danh sách page có quản lý** (staff tự thêm/sửa/xoá,
  có trạng thái) — khác top_pages thống kê.
- Khi chưa có script đo (giống Ads chưa đấu Meta API), staff cần **nhập tay số
  liệu cơ bản** để brand thấy ngay → cần endpoint upsert metrics micro-site.

## A. Pages (managed list)

### Schema
```jsonc
// MicroSitePage
{
  "id": "uuid",
  "micro_site_id": "uuid",
  "name": "Trang đặt lịch",
  "path": "/booking",          // unique trong 1 micro_site
  "status": "live | dev | paused",
  "sort_order": 0,             // optional, kéo-thả sau
  "views_30d": 88200,          // denormalised từ micro_site_events theo path
  "created_at": "iso",
  "updated_at": "iso"
}
```

### Endpoints
```
GET    /portal/micro-sites/{id}/pages           // brand đọc; staff cần scope brand
POST   /admin/micro-sites/{id}/pages            // staff thêm
PATCH  /admin/micro-sites/{id}/pages/{pageId}   // staff sửa
DELETE /admin/micro-sites/{id}/pages/{pageId}   // staff xoá (soft-delete)
```
- List response: `{ items: MicroSitePage[] }` (flat, như các list khác).
- Create/Patch body: subset `{ name, path, status?, sort_order? }`. `path` validate
  bắt đầu `/`, unique theo `micro_site_id`.
- `views_30d`: BE tính từ `micro_site_events WHERE path = page.path` (read-only).
- Quyền: đọc = brand user (site thuộc brand mình) + staff; ghi = **staff only**
  (qua `EnsureCanAccessBrand` như micro-site CRUD).

### DB
| bảng | cột |
|---|---|
| `micro_site_pages` | id, micro_site_id (fk), name, path, status, sort_order, created_at, updated_at, archived_at |
Unique `(micro_site_id, path) WHERE archived_at IS NULL`.

## B. Số liệu nhập tay (manual metrics) — "cả hai"

Mục tiêu: staff **seed/override** khi chưa có script; khi có ingest thật thì
analytics **ưu tiên dữ liệu thật**. 2 cách BE chọn:

**Option 1 (đề xuất) — bảng override riêng, merge khi đọc analytics**
```
PUT /admin/micro-sites/{id}/metrics
body: {
  "from": "2026-05-01", "to": "2026-05-31",
  "mode": "range | daily",
  "daily": [ { "date":"2026-05-01", "views":16100, "visitors":6200,
               "avg_time_s":142, "bounce_pct":38.4 } ]   // 1..92, idempotent/(site,date)
}
→ trả MicroSiteAnalytics đã refresh
```
- BE lưu vào `micro_site_metrics_daily` (manual). `GET .../analytics`: nếu ngày nào
  có **event ingest** thì dùng event; ngày nào chỉ có manual thì dùng manual
  (manual = fallback). Trả thêm cờ `source: "ingest" | "manual" | "mixed"` để FE
  hiện badge.
- Validate giống Ads metrics: `from<=to`, ≤92 ngày, dates trong khoảng, ≥0.

**Option 2 (đơn giản hơn)** — chỉ cho set field denormalised trên `micro_sites`
(`views_30d`, `views_trend_pct`) qua PATCH; bỏ daily. Mất chart theo ngày.

→ FE ưu tiên **Option 1** (đồng bộ UX với Ads `PUT /admin/campaigns/{id}/metrics`,
tái dùng được dialog nhập theo khoảng/từng ngày).

### DB (Option 1)
| bảng | cột |
|---|---|
| `micro_site_metrics_daily` | micro_site_id, date (pk kép), views, visitors, avg_time_s, bounce_pct, source='manual', updated_by, updated_at |

## C. FE hiện trạng (local demo — sẽ wire khi BE ship)

- `microSiteLocal.ts`: localStorage `rexer:micro-site-pages` + `rexer:micro-site-stats`.
- `MicroSiteManageDialog.tsx`: tab **Pages** (CRUD) + **Số liệu** (nhập theo khoảng,
  chia đều ra daily để vẽ trend). Banner "demo".
- Khi BE ready: thay 6 hàm trong `microSiteLocal.ts` bằng `rexerApi.microSites.*`
  (pages CRUD + metrics) — consumer (dialog) không đổi.
- ⚠️ localStorage per-browser → số liệu staff nhập **không** sang được user brand.
  Cross-user **bắt buộc** cần BE (A + B).

## D. Câu hỏi cho BE
1. Pages: route lồng `/{id}/pages` (đề xuất) hay top-level `/micro-site-pages`?
2. Manual metrics: Option 1 (merge ingest+manual, có `source`) hay Option 2?
3. `views_30d` per page: tính realtime (cache) hay materialized như site-level?
