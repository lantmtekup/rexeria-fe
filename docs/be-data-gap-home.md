# BE Data Gap — Trang Home (`/home`)

**Ngữ cảnh**: Phân tích trên screenshot ngày 2026-04-26 với data thật từ BE.
Trang Home gồm 3 section: greeting + 6 metric cards + 2 cột (Template / Product).
File FE: `src/app/(app)/home/page.tsx`, `src/components/molecules/{ProductCard,TemplateCard,MetricCard}.tsx`.

Bảng dưới liệt kê **field FE đang cần nhưng BE chưa trả** — group theo resource, kèm lý do, severity, và suggested schema.

---

## 1. Resource `Template` (section bên trái — card "LANDING HERO V1")

BE hiện trả: `id, code, name, description, status, preview_mode, current_version_id, created_at, created_by, updated_at`.

| # | Field thiếu | FE cần để làm gì | Severity | Workaround hiện tại | Suggested schema |
|---|---|---|---|---|---|
| 1.1 | `thumbnail_url` (string, low-res 400×250 hoặc tương đương) | Hiện ảnh nền card thay vì khối xám. Không thể dùng `preview_url` vì (a) đang rò `localhost:9090` (issue A trong PDF) và (b) full preview quá nặng cho thumbnail. | 🔴 High | Hard-code `imageBg: '#f5f3ee'` cho mọi template → tất cả card trông giống nhau. | Thêm field cho cả `Template` và `TemplateVersion`: `thumbnail_url: string` hoặc `thumbnail_storage_key: string`. Có thể auto-generate từ first publish snapshot. |
| 1.2 | `category` / `tags` (string[] hoặc enum) | Filter trên trang `/template` (8 category tabs Fashion / F&B / Tech…). Hiện đang hard-code `CATEGORIES` array trong `template/page.tsx`. | 🟡 Med | UI filter bar render mock 9 category với count `250` cứng. | Thêm `category: string` (enum) hoặc `tags: string[]` vào `Template`. |
| 1.3 | `author_name` (string) hoặc resolve `created_by` → user object | Card hiện hiển thị `code` (slug) thay vì tên author. Trang detail muốn hiện avatar + tên giống Figma. | 🟡 Med | FE dùng `template.code` làm sub-label. | Hoặc trả `created_by_name` flat, hoặc embed `created_by: { id, display_name, avatar_url }`. |
| 1.4 | `usage_count` (int) — số project đã dùng template | Hiển thị "12 landings dùng template này" → social proof. | 🟢 Low | Không hiển thị. | Trả trong list response: `usage_count: int`. |
| 1.5 | `version_count` (int) — số version đã publish | Hiển thị "v3" badge trên card. | 🟢 Low | Không hiển thị. | Trả `current_version: { version: "1.0.0" }` (đã có trong `TemplateResponse` nhưng không có trong `TemplateListResponse`). |

---

## 2. Resource `Project` (section bên phải — "Acme Summer Launch", "Acme Promo October")

BE hiện trả: `id, client_id, product_id, name, slug, status, template_id, template_version_id, active_release_id, created_at, updated_at, created_by`.

> ⚠️ **Note semantic**: section UI gọi là **"Product"** nhưng data thật là **Project (Landing)**. FE sẽ rename section thành "Recent landings" — không phải BE issue, chỉ note.

| # | Field thiếu | FE cần để làm gì | Severity | Workaround hiện tại | Suggested schema |
|---|---|---|---|---|---|
| 2.1 | `og_image_url` / `screenshot_url` (string) | Card cần ảnh preview của landing đã publish. Hiện hiển thị tên project repeat làm placeholder mờ giữa khối xám. | 🔴 High | Render text `name` trên nền xám trong `ProductCard.tsx:96`. | Khi project có `active_release_id`, BE crawl `og:image` từ `page_url` hoặc generate screenshot 1280×720 lưu vào `screenshot_url`. |
| 2.2 | `page_url` / `active_release_url` (string) | Để click "Share" mở landing thật. Hiện chỉ `active_release_id` (UUID), FE phải gọi thêm `GET /releases/{id}` mới có `page_url`. | 🔴 High | Button "Share" không hoạt động. | Trả `active_release_url: string` flat trong `Project`, hoặc embed `active_release: { id, page_url, published_at }`. Cách 2 tốt hơn vì giảm round-trip. |
| 2.3 | `last_publish_at` (date-time) | Hiển thị "Cập nhật 2 ngày trước" giống ProductCard. | 🟡 Med | Dùng `updated_at` (không chính xác — updated_at thay đổi cả khi sửa config draft). | Thêm `last_publish_at: timestamp \| null`. |
| 2.4 | `analytics_summary` (object — pageviews/clicks/conversions) | Hiển thị KPI nhỏ trên card (như Figma có "85% engagement"). BE đã có `ProjectSummary.analytics_summary` nhưng phải gọi `/projects/{id}/summary` riêng cho từng project — N+1 calls. | 🟡 Med | Không hiển thị. | Thêm vào `Project` (list response): `analytics_summary?: SummaryMetrics` (có thể populate optional với `?include=analytics` query param để tránh tốn query). |
| 2.5 | `template_name` (string) | Hiển thị "Powered by Landing Hero v1" trên card. Hiện chỉ có `template_id` (UUID). | 🟡 Med | Không hiển thị. | Embed `template: { id, name, version }` hoặc trả flat `template_name: string`. |
| 2.6 | `client_name` (string) | Multi-tenant view — agency muốn biết landing thuộc client nào. Hiện chỉ `client_id` UUID. | 🟡 Med | Không hiển thị. | Embed `client: { id, name }` hoặc trả `client_name: string`. |
| 2.7 | `created_by_name` (string) hoặc user object | Hiển thị "Created by ReXeR Admin". | 🟢 Low | Không hiển thị. | Embed user. |
| 2.8 | `pinned` / `favorite` (bool) — cho user pin lên top home | "Recent landings" sắp xếp theo `updated_at desc`. Cần pin để giữ landing quan trọng trên top. | 🟢 Low | Không hiển thị. | `pinned: boolean` hoặc resource riêng `pinned_resources`. |

---

## 3. Resource `DashboardSummary` (6 metric cards trên cùng)

BE hiện trả: `active_clients, projects_total, published_projects, page_views, cta_clicks, conversions, ctr`. **Đầy đủ cho 6 cards hiện tại** ✅.

| # | Field thiếu | FE cần để làm gì | Severity | Suggested schema |
|---|---|---|---|---|
| 3.1 | Trend / delta (`page_views_delta_7d` etc.) | Hiển thị "+12% so với tuần trước" giống dashboard chuẩn. | 🟡 Med | Bổ sung `*_delta_7d`, `*_delta_30d` cho mỗi metric. |
| 3.2 | `range_from` / `range_to` (date-time) | Hiển thị "Số liệu tính từ 2026-04-19 → 2026-04-26". Hiện BE không cho biết range. | 🟢 Low | Thêm 2 field metadata. Cho phép FE pass query `?range=7d`. |
| 3.3 | `currency` & `revenue` (number) | Hiển thị doanh thu nếu có. | 🟢 Low | Optional cho future e-commerce flow. |

---

## 4. Resource `User` (greeting "Hi, ReXeR Admin 👋" + email góc phải)

BE `RxUser` hiện đủ cho greeting (`display_name`, `email`).

| # | Field thiếu | FE cần để làm gì | Severity | Suggested schema |
|---|---|---|---|---|
| 4.1 | `avatar_url` (string) | Render avatar tròn cạnh greeting (Figma có). | 🟡 Med | Add `avatar_url?: string` vào `RxUser`. |
| 4.2 | `client_id` / `client_name` cho user thuộc workspace nào | Sidebar đang hiển thị "Nhóm: Hnd.Studio" hard-code. Cần real workspace name của user. | 🔴 High | `/auth/me` trả `client: { id, name }` hoặc `clients: [{...}]` cho user multi-tenant. (Trùng với issue #15 trong section 11 spec). |
| 4.3 | `role` (string enum — admin/staff/client_user) | Quyết định show/hide section nào trên sidebar. | 🟡 Med | `role: string` trong `/auth/me`. |

---

## 5. Tổng hợp ưu tiên cho BE Sprint kế

### 🔴 Critical (block UX hoàn chỉnh)
- **1.1** `Template.thumbnail_url` — không có thì card Template không có ảnh
- **2.1** `Project.screenshot_url` — không có thì card Landing không có preview  
- **2.2** `Project.active_release_url` (hoặc embed `active_release`) — không có thì button Share không hoạt động
- **4.2** `/auth/me` trả `client` info — không có thì sidebar workspace name fake mãi

### 🟡 Important (cải thiện UX, defer 1-2 sprint OK)
- **1.2** `Template.category/tags`
- **1.3** `Template.author` (resolve user)
- **2.3** `Project.last_publish_at`
- **2.4** `Project.analytics_summary` trong list
- **2.5** `Project.template` embed
- **2.6** `Project.client` embed
- **3.1** `DashboardSummary.*_delta_7d`
- **4.1** `User.avatar_url`
- **4.3** `User.role`

### 🟢 Nice-to-have (Phase 2)
- 1.4, 1.5, 2.7, 2.8, 3.2, 3.3

---

## 6. Khuyến nghị API design pattern

Để giảm N+1 và keep response shape consistent:

```jsonc
// Đề xuất: Project list response giàu hơn
GET /v1/projects?include=template,client,analytics
{
  "items": [
    {
      "id": "...",
      "name": "Acme Summer Launch",
      "slug": "acme-summer-launch",
      "status": "published",
      "screenshot_url": "https://cdn.../snap-acme-summer.jpg",
      "page_url": "https://landings.../acme-summer-launch",          // flat từ active_release
      "last_publish_at": "2026-04-22T10:00:00Z",
      "template": { "id": "...", "name": "Landing Hero", "version": "1.0.0" },
      "client":   { "id": "...", "name": "Acme Corporation" },
      "created_by": { "id": "...", "display_name": "ReXeR Admin" },
      "analytics_summary": { "page_views": 234, "ctr": 0.18, ... }
    }
  ]
}
```

Pattern `?include=` cho phép FE control payload size — list view cần nhiều, edit view không cần `analytics_summary`.

---

## 7. Tham chiếu chéo

- File FE chính: `src/app/(app)/home/page.tsx`
- Spec: `docs/rexerai-mvp-spec.md` section 11 (API issues đã có 6 issue khác)
- Verify report: `scripts/visual-tests/out/verify-report.md`
- BE-team PDF: `scripts/visual-tests/out/be-issues-report.pdf`
