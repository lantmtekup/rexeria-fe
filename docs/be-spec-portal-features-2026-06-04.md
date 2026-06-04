# BE spec — 3 tính năng portal: Quảng cáo · Micro-site · Curate

**Ngày:** 2026-06-04
**Soạn:** FE (Lan)
**Trạng thái:** đề xuất — FE đã có UI **cả 2 đầu** (admin staff nhập + portal khách
xem). Hiện chạy **local demo** (mock + localStorage), chờ BE ship endpoint để
wire thật.

## 0. Bối cảnh & nguyên tắc

3 tính năng dưới đây là nơi **nhân viên Rexer cập nhật nội dung cho khách**, rồi
**khách xem ở portal**. Hệ thống CHƯA đấu API các nền tảng (Meta/Google/TikTok)
và analytics do Rexer tự track (script nhúng), nên data hiện **nhập tay / mock**.

FE có 2 mặt cho mỗi tính năng:

| Tính năng | Admin (staff nhập) | Portal (khách xem) |
|---|---|---|
| Quảng cáo | `AdminClientDetailPage` › tab "Quảng cáo" + `/admin/ads` | `/portal/ads` |
| Micro-site | tab "Microsite" | `/portal/micro-sites` |
| Curate | tab "Curate" | `/portal/curate` |

**Nguyên tắc chung BE cần giữ:**

1. **Scoping theo brand.** Mọi entity gắn `brand_id` (và `workspace_id` khi có).
   - Admin truyền `brand_id` (route `clientId`).
   - Portal lọc theo brand của user đăng nhập (`/auth/me` → `brand_id`).
   - ID phải khớp 2 đầu để staff-sửa → khách-thấy.
2. **Phân quyền 2 cấp:**
   - **staff/admin** (`principal_type=admin`): full ghi cho **bất kỳ** brand.
   - **brand user**: chỉ **đọc** brand của mình (một số action như tạo campaign
     có thể cho ghi — xem từng phần).
3. **Pagination** chuẩn như các list khác: `?page&limit`, response
   `{ items: T[], total, page, limit }`.
4. **Soft-delete** ưu tiên (status/`archived`) thay vì xoá cứng.
5. Số tiền (`spend`, `budget`) đơn vị **VND, integer**.

---

## A. Quảng cáo (Ads)

### A.1 Hiện trạng

- **ĐÃ CÓ** CRUD campaign: `/portal/ads/campaigns` (list/get/create/update/
  delete) + `/portal/ads/channels`. Type `PortalAdCampaign`
  (`channels[]`, `objective`, `status`, `budget_amount`, `start/end_date`,
  `landing_template_id`, và aggregate `impressions/clicks/spent_amount/
  conversions`).
- **ĐÃ CÓ** `GET /campaigns/{id}/metrics` → `{ campaign_id, summary, daily }`.
- **THIẾU** endpoint **ghi metrics thủ công** cho staff. → **Xem chi tiết tại
  [`be-spec-ad-metrics.md`](./be-spec-ad-metrics.md)** (đã soạn riêng).

### A.2 Tóm tắt việc cần làm (chi tiết ở be-spec-ad-metrics.md)

1. `PUT /admin/campaigns/{id}/metrics` — staff upsert daily metrics theo khoảng
   ngày (body `{ from, to, mode, daily[] }`, mỗi `daily[]` =
   `{date, impressions, reach, clicks, spend, conversions}`). Idempotent theo
   `(campaign_id, date)`.
2. Bổ sung `reach` vào `summary` + `daily[]` của `GET .../metrics` (hiện thiếu —
   FE portal đang để `reach: 0`).
3. (tuỳ chọn) `GET .../metrics?from&to` lọc theo khoảng để portal xem từng kỳ.

**FE wire:** admin tab Ads + `/admin/ads` đổi `handleSave` local → `PUT`; portal
`/portal/ads` đọc campaign + metrics thật (đang transform qua `beCampaignToLocal`,
cần thêm field `reach` + `trend` lấy từ `daily`).

---

## B. Micro-site

### B.1 Khái niệm

Micro-site = **site Rexer code riêng** cho khách (host riêng: `a.com`, `b.com`…).
Platform chỉ **quản lý danh sách + thông tin chung + xem analytics** — KHÔNG phải
page-builder. Rexer tự track view bằng script nhúng → BE lưu & tổng hợp.

### B.2 Schema

```jsonc
// MicroSite
{
  "id": "uuid",
  "brand_id": "uuid",            // scope theo khách
  "workspace_id": "uuid|null",   // optional
  "name": "ABCe",
  "url": "https://abce.com",     // public URL (có thể rỗng khi đang dev)
  "status": "live | dev | paused",
  "description": "string|null",
  "thumbnail_url": "string|null",
  "created_by": "uuid",          // staff tạo
  "created_at": "iso",
  "updated_at": "iso",
  // denormalised cho list (BE tính từ analytics):
  "views_30d": 482140,
  "views_trend_pct": 12          // % so 30d trước (+/-)
}
```

### B.3 Endpoints

```
GET    /portal/micro-sites?status&workspace_id&page&limit   // brand: của mình; staff: cần ?brand_id
GET    /portal/micro-sites/{id}
POST   /admin/micro-sites          // staff tạo cho 1 brand (body kèm brand_id)
PATCH  /admin/micro-sites/{id}     // staff sửa
DELETE /admin/micro-sites/{id}     // staff xoá (soft-delete → status hoặc archived)
```

- **List response:** `{ items: MicroSite[], total, page, limit }`.
- **Create body:** `{ brand_id, workspace_id?, name, url?, status?, description? }`
  (`status` mặc định `dev`).
- **Patch body:** subset các field trên.
- **Quyền:** đọc = brand user (brand mình) + staff; ghi (POST/PATCH/DELETE) =
  **staff only**.

### B.4 Analytics 1 site

```
GET /portal/micro-sites/{id}/analytics?from&to
```

Response (FE dựng 4 KPI + chart daily + breakdown):

```jsonc
{
  "micro_site_id": "uuid",
  "summary": {
    "views": 482140,
    "visitors": 184200,
    "avg_time_s": 142,          // thời gian TB trên site (giây)
    "bounce_pct": 38.4,
    "views_delta_pct": 12,      // so kỳ trước
    "visitors_delta_pct": 9,
    "bounce_delta_pct": -3
  },
  "daily": [
    { "date": "2026-05-20", "views": 16100, "visitors": 6200 }
  ],
  "top_pages": [                // optional
    { "path": "/", "views": 210400 },
    { "path": "/booking", "views": 88200 }
  ],
  "top_referrers": [            // optional
    { "source": "facebook.com", "views": 142000 }
  ]
}
```

### B.5 Ingest view (script nhúng)

Để có số liệu thật, cần endpoint nhận event từ script Rexer nhúng trên site:

```
POST /collect/micro-site-view        // public, no-auth, gọi từ browser khách cuối
body: { micro_site_id, path, referrer?, visitor_id?, session_id?, ts }
```

- Nhẹ, rate-limit, chấp nhận `204`. BE tổng hợp ra `views_30d`/analytics ở B.3/B.4.
- `visitor_id` = cookie first-party do script set (để tính visitors & bounce).

### B.6 DB gợi ý

| bảng | cột chính |
|---|---|
| `micro_sites` | id, brand_id, workspace_id, name, url, status, description, thumbnail_url, created_by, created_at, updated_at, archived_at |
| `micro_site_events` | id, micro_site_id, path, referrer, visitor_id, session_id, ts |

`views_30d`/analytics = aggregate từ `micro_site_events` (materialized view hoặc
tính on-the-fly có cache).

---

## C. Curate (interaction tracking)

### C.1 Khái niệm

Curate = brand/staff **chọn loại tương tác** Rexer sẽ track trên các trang public
(landing/micro-site) của brand. Mỗi loại bật → script nhúng fire analytics event
→ dashboard tổng hợp. FE hiển thị: lưới loại tương tác (bật/tắt + count 30d) +
feed events real-time.

### C.2 Danh mục loại tương tác (interaction kinds)

16 loại (FE đang dùng — BE nên seed catalog này, cho phép `custom`):

```
page_view, block_view, cta_click, image_click, hover_long, form_submit,
video_play, video_complete, scroll_depth, share, save_bookmark, reaction,
comment, download, swipe, custom
```

Mỗi loại có `scope: page | block | element`. (Bảng đầy đủ label/scope/mô tả: xem
`src/app/(client-portal)/portal/curate/page.tsx` — `INTERACTIONS`.)

### C.3 Config bật/tắt theo brand

```
GET   /portal/curate/config?brand_id           // staff cần brand_id; brand user → brand mình
PUT   /portal/curate/config                     // upsert toàn bộ map (staff ghi)
```

Response/body:

```jsonc
{
  "brand_id": "uuid",
  "interactions": {
    "page_view":  { "enabled": true,  "count_30d": 124820 },
    "cta_click":  { "enabled": true,  "count_30d": 5620 },
    "comment":    { "enabled": false, "count_30d": 24 }
    // … đủ 16 kind; count_30d do BE tính từ events, FE chỉ đọc
  },
  "updated_by": "uuid",
  "updated_at": "iso"
}
```

- **PUT body** chỉ cần `{ brand_id, enabled: Record<kind, boolean> }`; `count_30d`
  BE tự điền khi trả về (read-only với FE).
- **Quyền:** đọc = brand user + staff; ghi = staff (và có thể cho brand tự bật/tắt
  — tuỳ chính sách, FE đã có toggle ở cả portal).

### C.4 Events feed

```
GET /portal/curate/events?brand_id&kind&limit     // mới nhất trước
```

```jsonc
{
  "items": [
    {
      "id": "uuid",
      "kind": "cta_click",
      "page_name": "Coca-Cola Tết 2026",   // tên landing/micro-site
      "target": "btn-book-now",            // element/selector
      "visitor": "v_8e4a",
      "meta": "referrer=facebook.com",     // optional, free text/json
      "at": "iso"
    }
  ]
}
```

### C.5 Ingest event (script nhúng)

```
POST /collect/interaction        // public, no-auth, từ browser khách cuối
body: { brand_id, page_id?, micro_site_id?, kind, target?, visitor_id?, meta?, ts }
```

- BE chỉ lưu khi `kind` đang `enabled` trong config của brand (hoặc lưu hết, lọc
  khi đọc — tuỳ). Dùng để tính `count_30d` + feed.

### C.6 DB gợi ý

| bảng | cột chính |
|---|---|
| `interaction_kinds` | code (PK), label, scope, is_default |
| `brand_interaction_config` | brand_id, kind_code, enabled, updated_by, updated_at |
| `interaction_events` | id, brand_id, page_id, micro_site_id, kind_code, target, visitor_id, meta, ts |

`count_30d` = COUNT events theo `(brand_id, kind, ts >= now-30d)`.

---

## D. Bảng phân quyền tổng hợp

| Action | brand user (brand mình) | staff/admin |
|---|---|---|
| Đọc campaigns/metrics, micro-sites, curate config/events | ✅ | ✅ (mọi brand) |
| Ghi metrics thủ công (A) | ❌ | ✅ |
| CRUD micro-site (B) | ❌ | ✅ |
| Bật/tắt curate config (C) | tuỳ chính sách | ✅ |
| Tạo/sửa campaign (đã có) | ✅ (mình) | ✅ |
| Ingest `/collect/*` | n/a (public, no-auth, rate-limit) | n/a |

---

## E. Thứ tự ưu tiên đề xuất

1. **A** — `PUT .../metrics` + `reach` (nhỏ, tận dụng campaign + metrics đã có).
2. **B** — micro-sites CRUD (`/admin/micro-sites` + `/portal/micro-sites`); analytics
   có thể stub trước (trả summary từ field denormalised), ingest sau.
3. **C** — curate config + events; ingest script chung với B.

Ingest (`/collect/*`) là phần hạ tầng analytics dùng chung cho B & C — có thể làm
1 lần.

---

## F. Câu hỏi cho BE

1. Route ghi đặt dưới `/admin/...` (rõ phân quyền staff) hay `/portal/...` có
   guard? FE đề xuất `/admin/` cho các action staff-only.
2. Analytics micro-site & curate: BE tự host ingest (`/collect/*`) hay dùng
   pipeline có sẵn? Script nhúng Rexer cấp `visitor_id` thế nào (cookie first-party)?
3. `count_30d` / `views_30d`: tính realtime (cache) hay materialized view theo lịch?
4. Brand user có được tự bật/tắt curate config không, hay chỉ staff?
5. Có cần `workspace_id` cho micro-site/campaign (scope sâu hơn brand) ngay từ đầu?
