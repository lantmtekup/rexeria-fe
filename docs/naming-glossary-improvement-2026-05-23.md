# Naming & Terminology Improvement — Rexer Phase 1

> **Date**: 2026-05-23
> **Audience**: BE squad + FE owner + PM
> **Status**: 🟡 **Affects long-term clarity** — không block runtime, nhưng nếu để vậy → tech debt + UX rối + onboarding khó
> **Related**: `docs/be-architecture-clarification-2026-05-23.md` (architecture decision phải xong trước khi rename routes)

---

## 🔥 TL;DR — 7 cụm từ tệ nhất cần fix

| # | Hiện tại | Vấn đề | Đề xuất |
|---|---|---|---|
| 1 | `canvas-templates` (BE namespace) | Tên có chữ "template" nhưng thực ra là **editing surface / canvas data storage**, không phải template | Đổi thành `canvas-pages` hoặc `canvas-documents` |
| 2 | `is_template`, `is_public_template` (cờ trên `canvas-templates`) | 1 entity có 2 cờ "template" → ý nghĩa overlap với `/templates` thật | Bỏ; chuyển thành 1 entity riêng (`canvas-templates` library) hoặc set lên `/templates` |
| 3 | `Project` (BE entity = landing page instance) | Tên generic, không gợi đúng "landing page" | Rename thành `landings` hoặc `landing-pages` |
| 4 | `/portal/templates` GET = brand's landings (FE đã wire) | Endpoint tên "templates" nhưng trả về landing pages của brand | Rename → `/portal/landings` (sau Q1 decision) |
| 5 | `client` (BE) vs `client_user` (role) vs "khách hàng" (UI) | 3 cách gọi cùng 1 thứ + role name dễ nhầm với entity | Chuẩn: BE entity = `brand`; role = `brand_user`; UI = "Khách hàng" |
| 6 | `is_active` (boolean) vs `status` (enum) | 2 cơ chế lifecycle song song, mỗi entity dùng khác nhau | Chuẩn hoá: chỉ dùng `status` enum, bỏ `is_active` (suy ra từ status != 'archived') |
| 7 | `/track` vs `/analytics/events` | 2 endpoint ingest analytics — không rõ canonical | Confirm 1, deprecate cái còn lại |

---

## 1. Entity naming — phân tích chi tiết

### 1.1 `canvas-templates` (BE) — tên gây hiểu nhầm nặng nhất

Hiện tại entity này:
- ✅ Chứa full canvas_data (blocks, motion, extras) — đúng là "drawing surface"
- ❌ Tên có "template" → ai đọc cũng nghĩ là template
- ❌ Có cờ `is_template` + `is_public_template` — entity tên template lại có cờ "có phải template không?"
- ❌ Một số row là landing pages owned by brand (client_id set), một số là templates (is_template=true)

**Đề xuất rename**:

```
canvas-templates          →  canvas-documents  hoặc  canvas-pages
                              ↑
                              Tên trung lập — không gợi "template"

is_template flag          →  bỏ (move sang /templates entity)
is_public_template flag   →  bỏ
client_id  / workspace_id →  giữ
canvas_data               →  giữ
```

Hoặc nếu BE confirm Architecture Option 1 (Project canonical) trong `be-architecture-clarification` → **xoá luôn `canvas-templates` namespace**, chỉ giữ làm internal storage layer cho `/projects`.

### 1.2 `Project` (BE) — tên không gợi semantic

Hiện `Project` = landing page instance của brand, có `template_id`, `status`, `slug`, `releases`. Nhưng "project" generic:
- Có thể là campaign
- Có thể là folder gom landing
- Có thể là gì cũng được

**Đề xuất**: rename → `landings` (singular: `landing`)

```
/v1/projects              →  /v1/landings
/v1/projects/{id}/publish →  /v1/landings/{id}/publish
/v1/projects/{id}/releases→  /v1/landings/{id}/releases
type Project              →  type Landing
```

Nếu BE quá đắt để rename namespace, FE tạo alias type:

```ts
// services/rexer/types.ts
export type Landing = Project;        // alias, gradually migrate
export type LandingResponse = ProjectResponse;
```

### 1.3 `/templates` vs `/portal/templates` vs `/portal/templates/library`

3 endpoint tên gần giống nhau, ngữ nghĩa khác hẳn:

| Endpoint | Trả về | Tên nên là |
|---|---|---|
| `GET /v1/templates` | System catalog (Landing Hero v1, …) | ✅ giữ — đúng `templates` |
| `GET /v1/portal/templates` | **Brand's landings** (canvas-templates) | ❌ rename → `/portal/landings` |
| `GET /v1/portal/templates/library` | System catalog filter (visible to brand) | ❌ rename → `/portal/templates` (cho thẳng) |

→ `/portal/templates` đang dùng cho 2 thứ khác nhau (instance list vs library) — tệ nhất.

**Hệ quả**: brand đọc URL `/portal/templates` không biết mình đang xem template catalog hay landing pages của mình.

### 1.4 `client` vs `client_user` vs "khách hàng"

| Vị trí | Term hiện tại | Ý nghĩa thực |
|---|---|---|
| BE table | `clients` | Doanh nghiệp đăng ký Rexer (Coca-Cola, Acme, …) |
| BE role | `client_user` | Member thuộc 1 client (anh staff của Coca-Cola) |
| BE field | `client_id` | FK tới `clients` |
| FE i18n (vi) | "Khách hàng" | ✅ đúng — customer |
| FE i18n (en) | "Customers" | ✅ đúng |
| FE component | `AdminClientDetailPage` | ✅ ok |
| FE portal | "brand" (FAKE_BRAND, brand_owner) | ⚠️ alias — bằng "client" |

**Vấn đề**:
- Có khi FE gọi "brand" (`brand_owner`, `FAKE_BRAND`), có khi gọi "client" — không nhất quán
- BE `client_user` dễ nhầm với "khách của client" (vd: visitor của landing page)

**Đề xuất chuẩn hoá**:

```
BE entity 'clients'  →  rename 'brands' (recommend) hoặc giữ 'clients' nhưng FE dùng nhất quán
BE role 'client_user' → rename 'brand_member' hoặc 'brand_user'
FE everywhere      → "brand" (en) / "Khách hàng" (vi) — đã đúng
```

### 1.5 `release` vs `version` vs `revision`

3 từ gần nghĩa, BE đang dùng cả 3:
- `Template.current_version_id` — **version** của template (immutable snapshot khi update)
- `Project.template_version_id` — version locked
- `Project.releases` — **release** của project (immutable snapshot khi publish)
- `Project.config.current_revision` — **revision** của config (mỗi lần edit config)
- `canvas-templates.version: int` — **version** counter (optimistic lock)

Có cách phân biệt nhưng hơi rối:
- `version` = snapshot của Template (catalog)
- `release` = snapshot của Project (instance) khi publish
- `revision` = autosave step của config (chưa publish)

**Đề xuất** giữ nhưng document rõ trong glossary. Đừng đặt thêm từ thứ 4.

---

## 2. Lifecycle / status field — 3 cơ chế song song

### 2.1 Bảng so sánh

| Entity | Field lifecycle | Giá trị |
|---|---|---|
| `Client` | `status: string` | active / pending / suspended / inactive |
| `Project` | `status: string` | draft / published / archived |
| `Template` (catalog) | `status: string` | draft / active / archived |
| `canvas-templates` | `is_active: boolean` | true / false (no enum) |
| `Workspace` | `status?` (chưa rõ) | — |
| `SavedBlock` | `scope: enum` | private / team / public (không phải lifecycle) |

**Vấn đề**:
- 5 entity, 5 cách diễn đạt lifecycle
- `canvas-templates` dùng boolean → không phân biệt được "archived" vs "deleted" vs "draft"
- `Template.status` có "active" thay vì "published" → khác `Project.status`

**Đề xuất chuẩn hoá**:

```ts
type LifecycleStatus = 'draft' | 'published' | 'archived';

// Apply to: Project, Template, canvas-templates (nếu giữ), Workspace
// Bỏ is_active boolean — suy ra: is_active = status !== 'archived'
```

Sau khi chuẩn hoá:
- FE chỉ cần 1 helper `statusChip(status)` → màu emerald/amber/zinc
- BE 1 column type → migration đơn giản
- UX nhất quán

### 2.2 `is_active` boolean → tệ ở đâu

```ts
// FE đang phải làm
const statusLabel = item.is_active ? 'active' : 'inactive';
```

→ Không có "draft" hay "archived" — gộp tất cả "không active" thành "inactive". Mất thông tin.

---

## 3. Routes — label vs URL không khớp

| Route URL | Label hiển thị | Đúng/sai |
|---|---|---|
| `/admin/canvas-templates` | "Landing pages" | ❌ URL chứa "canvas-templates" nhưng UI nói "Landing pages" → developer search "landing" không thấy route |
| `/admin/templates` | "Landing page template" | ⚠️ URL `templates` ok nếu /v1/templates là catalog; label dài |
| `/admin/users` | "Khách hàng" | ❌ Brand chứ không phải user — URL `/users` nhưng list `/clients` |
| `/portal/landing-pages` | "Landing pages" | ✅ khớp |
| `/portal/templates` | "Template library" | ❌ URL dễ nhầm với /portal/landing-pages |
| `/portal/blocks` | "Blocks" | ✅ |
| `/portal/profile` | "Cài đặt brand" | ⚠️ URL `profile` (chỉ định user) nhưng nội dung là brand profile + members |

**Đề xuất** sau khi BE quyết định architecture (Architecture doc Q1):

```
/admin/canvas-templates    →  /admin/landings  (Option 1) hoặc /admin/canvas-pages
/admin/templates           →  /admin/template-catalog hoặc giữ /admin/templates
/admin/users               →  /admin/brands     (rename i18n + route)
/portal/landing-pages      →  giữ
/portal/templates          →  /portal/template-library  (đỡ confuse)
/portal/profile            →  /portal/brand-settings
```

Hoặc giữ URL hiện tại, **chỉ chuẩn hoá label**:
- Đảm bảo URL substring khớp với 1 phần label
- Vd: `/admin/users` label phải có chữ "user" hoặc "khách hàng", không phải cả 2

---

## 4. Concept overlap — entity nào làm gì

### 4.1 "Block" — 3 ý nghĩa

| Từ "block" | Ý nghĩa |
|---|---|
| `Block` type FE | 1 block trong canvas (hero_split, feature_section, …) |
| `SavedBlock` FE | 1 block đã lưu vào thư viện brand để tái sử dụng |
| `SavedBlockServer` FE | Server-backed version (BE /saved-blocks) |
| `BlockType` enum | 14 loại built-in (hero_split, …) |
| `block_id` (analytics) | Reference 1 block trong canvas đang track |
| `block_type` (analytics) | type của block đang track |

→ Cùng từ "block" trải qua nhiều layer. Khi ai đó nói "blocks" cần context.

**Đề xuất** giữ "block" nhưng:
- BE chính thức dùng `saved_blocks` (đã có), không gọi tắt "blocks"
- FE rename `Block` (canvas entity) → `CanvasBlock` để rõ ràng

### 4.2 "Workspace" — gặp ở 2 chỗ

- BE `workspace` = scope folder trong 1 client (vd: Coca-Cola có workspace "Brand HQ" và "Mobile team")
- FE portal active workspace switcher = chip ở header

✅ Nhất quán — chỉ cần document rõ workspace là **inside** brand, không độc lập.

### 4.3 "Asset" vs "Media" vs "Product"

- `media_assets` (BE) = file uploads (ảnh, video, docs)
- `media_folders` = tổ chức assets
- `assets_count` (dashboard summary) = tổng số media assets
- `products` = entity riêng (sản phẩm brand)

→ "assets" trong dashboard summary thực ra là "media assets", không bao gồm products. Có thể confuse PM.

**Đề xuất**: dashboard summary đổi `assets_count` → `media_count`. Hoặc thêm `products_count` riêng cho rõ.

---

## 5. Role naming

```
admin           → Rexer ops, full access — ✅ ok
staff           → Rexer team member, less than admin — ✅ ok
client_user     → Brand member (đăng nhập từ brand portal) — ❌ rename brand_member
brand_owner     → ⚠️ FE-only term, không có trong BE roles
brand_member    → ⚠️ FE-only term
brand_viewer    → ⚠️ FE-only term, read-only
```

**Vấn đề**: FE đã đặt `brand_owner/member/viewer` để diễn đạt hierarchy nhưng BE chỉ có `client_user`. Không có cơ chế phân quyền dưới brand.

**Đề xuất**:

```
BE: rename client_user → brand_user (single role, không hierarchy)
   HOẶC ship 3 sub-roles: brand_owner / brand_editor / brand_viewer
   để FE permission check chính xác

FE: align với BE — chỉ dùng role thật BE có, bỏ hardcoded brand_owner/member/viewer fake
```

---

## 6. Glossary canonical (đề xuất)

Sau khi rename, dictionary thống nhất:

| Term | Định nghĩa chính thức | Where it lives |
|---|---|---|
| **Brand** | Doanh nghiệp đăng ký Rexer (Coca-Cola, Acme, …). Đơn vị billing + ownership. | BE: `clients` table → propose rename `brands` |
| **Workspace** | Scope folder bên trong brand (Marketing Team, Mobile Team, …). Brand có ≥1 workspace, mặc định 1. | BE: `workspaces` table |
| **Brand user** | Người dùng thuộc 1 brand, đăng nhập từ portal. | BE: role `client_user` → propose rename `brand_user` |
| **Template** | Blueprint trong catalog Rexer (Landing Hero v1, Event RSVP v2). Versioned. **System-owned, không có brand**. | BE: `templates` table |
| **Landing** (Page) | Brand's deployable instance, tạo từ Template. Có lifecycle draft → published → archived + releases. | BE: `projects` table → propose rename `landings` |
| **Release** | Immutable snapshot của Landing khi publish. Rollback được. | BE: `releases` table |
| **Canvas document** | Raw canvas data layer (blocks, motion, extras). Backing storage cho Landing (nếu BE quyết Option 2 trong architecture doc). | BE: `canvas_templates` → propose rename `canvas_documents` |
| **Saved block** | Block đã lưu vào brand's library để tái sử dụng. | BE: `saved_blocks` |
| **Block** (canvas) | 1 unit trong canvas (hero, feature, CTA, …). Không lưu rời. | FE only: `CanvasBlock` (rename từ `Block`) |
| **Block type** | Enum 14 loại built-in: hero_split, feature_section, … | FE only: `BlockType` |
| **Product** | Sản phẩm brand quản lý (Coca Zero 330ml, Lavie 500ml). Bind vào landing block. | BE: `products` table |
| **Media asset** | File upload (ảnh, video, doc, audio). Tổ chức trong folders. | BE: `media_assets` table |
| **Status** | Lifecycle state. Chuẩn enum: `draft` / `published` / `archived`. Áp dụng cho Brand, Template, Landing, CanvasDocument. | BE: column `status`, bỏ `is_active` |
| **Share token** | Token URL-safe để khách public xem published Landing. Sinh khi publish, invalidate khi unpublish. | BE: `landings.share_token` |
| **Release** vs **Version** vs **Revision** | Release = snapshot Landing khi publish · Version = snapshot Template trong catalog · Revision = autosave config trước publish | — |

---

## 7. Migration priority

### 🔴 P0 — Quyết kiến trúc trước (block mọi rename)

1. **BE confirm `Project.config_json` flexibility** (Architecture doc Q1)
   → quyết được canvas-documents có cần tồn tại không

### 🟡 P1 — High impact rename (sau khi architecture xong)

2. **Status enum chuẩn hoá** cho mọi entity → `draft/published/archived`. Bỏ `is_active` boolean.
3. **Rename `clients` → `brands`** (BE table + role `client_user` → `brand_user`)
4. **Rename `projects` → `landings`** nếu architecture chọn Option 1

### 🟢 P2 — Polish (sau khi P1)

5. **Endpoint rename**:
   - `/portal/templates` → `/portal/landings`
   - `/portal/templates/library` → `/portal/templates`
   - `/admin/users` → `/admin/brands` (cả route lẫn label)
6. **FE alias types** trước khi BE rename xong, để FE migrate dần:
   ```ts
   export type Brand = Client;
   export type Landing = Project;
   ```
7. **`CanvasBlock` rename FE-side** (Block → CanvasBlock để bớt nhầm với SavedBlock)
8. **Dashboard summary field clarification**: `assets_count` → `media_count` (nếu chỉ count media) hoặc tách `products_count`

### 🔵 P3 — Nice to have

9. **`/track` vs `/analytics/events`** — confirm canonical, deprecate cái kia
10. **`is_template` + `is_public_template`** trên canvas-templates → bỏ (nếu canvas-templates được xoá toàn bộ trong Option 1) hoặc clarify trong glossary

---

## 8. Migration plan — không break runtime

### Phase A — FE alias (1 ngày)

FE thêm type alias + i18n keys mới song song với keys cũ:

```ts
// services/rexer/types.ts
export type Brand = Client;
export type BrandResponse = ClientResponse;
export type Landing = Project;
export type CanvasBlock = Block;
```

```json
// i18n/admin/vi.json — thêm key mới, giữ key cũ
{
  "nav": {
    "brands": "Khách hàng",      // mới
    "users": "Khách hàng",        // cũ — sẽ deprecate
    "landings": "Landing pages",  // mới
    "canvasTemplates": "Landing pages"  // cũ — sẽ deprecate
  }
}
```

### Phase B — BE rename với backward compat (1 tuần)

BE expose endpoint mới song song endpoint cũ:

```
GET /v1/brands          → 200  (mới)
GET /v1/clients         → 200, set deprecation header (cũ)

GET /v1/landings        → 200  (mới)
GET /v1/projects        → 200, set deprecation header (cũ)
```

FE switch hoàn toàn sang endpoint mới. Sau 2 sprint, BE remove endpoint cũ.

### Phase C — Route rename FE (sau Phase B)

```ts
// next.config.ts redirects
async redirects() {
  return [
    { source: '/admin/users/:path*', destination: '/admin/brands/:path*', permanent: true },
    { source: '/portal/templates', destination: '/portal/template-library', permanent: false },
  ];
}
```

---

## 9. Quick wins (làm ngay, không cần BE)

Không cần đợi quyết định architecture, FE có thể làm:

- [ ] **Glossary doc nội bộ** ở `docs/glossary.md` — copy section 6 ra để onboarding mới đọc
- [ ] **Component naming**: rename `PortalTemplatesPage` (legacy) → `PortalLandingsPage` để khớp UI
- [ ] **Type alias**: thêm `Brand = Client` + `Landing = Project` để code mới dùng tên mới
- [ ] **Comment ở chỗ confuse**: vd ở `loadTemplates()` thêm doc `// returns landings (BE calls them canvas-templates due to legacy naming)`
- [ ] **i18n review**: đảm bảo cả vi/en đều nhất quán dùng "brand" (en) / "khách hàng" (vi)
- [ ] **PortalTemplate type** rename → `PortalLanding` để khớp UI

---

## 10. Liên hệ + tham chiếu

- **FE owner**: @Lantm (`lantm.tekup@gmail.com`)
- **Reference docs**:
  - `docs/be-architecture-clarification-2026-05-23.md` — Q1/Q2/Q3 cần answer trước
  - `docs/be-audit-2026-05-23.md` — swagger gap audit
  - `docs/be-todo.md` — master TODO
- **Decision needed**: PM + BE lead align về naming + ETA migration
