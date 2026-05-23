# Rexer System Spec v1 — Source of Truth

> **Date**: 2026-05-23
> **Status**: 🔴 **Draft for BE alignment** — đọc, mark up, đối thoại, chốt
> **Audience**: BE squad lead + FE owner + PM
> **Purpose**: 1 document duy nhất mô tả toàn bộ hệ thống Rexer ở mức **product + workflow**, để team align trước khi tiếp tục build. Document này **đứng trên tất cả** — `be-todo.md`, `be-audit`, `naming-glossary` là phụ trợ.

---

## 0. Quick read — đọc trong 2 phút

**Rexer** = managed-service platform giúp brand (Coca-Cola, Acme, …) xuất bản landing pages cho campaign mà không cần dev.

**Cơ chế cốt lõi**:
1. **Rexer Staff** thiết kế **Templates** (blueprint dùng được nhiều lần).
2. **Brand** chọn 1 Template → tạo **Landing** (instance riêng của brand đó).
3. Staff/Brand chỉnh sửa Landing qua **Canvas Editor** (WYSIWYG).
4. Click **Publish** → sinh **Release** (snapshot immutable) → URL public sống.
5. Khách public truy cập URL → xem Release đang active.
6. Analytics đo lường trên public traffic → brand xem report.

**3 personas chính**:
- 🛠️ **Admin/Staff Rexer** — build templates, hand-off landings, debug
- 👔 **Brand user** — review landings, xem analytics (Phase 1 chỉ review-only)
- 👤 **Public visitor** — anonymous, xem landing đã publish

**Phase 1 = managed service**: staff làm tất cả, brand chỉ review + xem số. Phase 2 mới mở self-serve.

---

## 1. Mục lục

```
2.  Personas + permissions
3.  Core entities (8 chính + 4 phụ)
4.  Entity relationships diagram
5.  Landing lifecycle (state machine)
6.  Workflows (10 user journeys end-to-end)
7.  URL & namespace conventions
8.  Architecture decision points (cần BE answer)
9.  Renaming roadmap (BE legacy → canonical)
10. Open questions
```

---

## 2. Personas

| # | Persona | Là ai | Đăng nhập ở | Phase 1 quyền hạn |
|---|---|---|---|---|
| 1 | **Rexer Admin** | Founder / tech lead Rexer | `/admin` | Full access: tạo brand, tạo staff, tạo template, build/edit/publish landing cho mọi brand |
| 2 | **Rexer Staff** | Designer / content team Rexer | `/admin` | Tạo template, build landing cho brand được assign, không quản brand/billing |
| 3 | **Brand Owner** | CMO / marketing lead của brand | `/portal?ws=...` | Review landings của brand mình, comment, xem analytics, không edit canvas |
| 4 | **Brand Member** | Marketing team của brand | `/portal?ws=...` | Như Brand Owner nhưng không invite member |
| 5 | **Public Visitor** | Khách hàng cuối của brand | `/p/{landing-slug}/{share-token}` | Anonymous — chỉ xem published landing + tự fire analytics events |

**Note Phase 1**: Brand Owner = Brand Member về mặt UI (cùng quyền). Phân biệt khi Phase 2 mở self-serve.

---

## 3. Core entities

### 3.1 Brand
> Doanh nghiệp đăng ký Rexer. Là **đơn vị billing + ownership**.

```yaml
Brand:
  id: uuid
  name: "Coca-Cola Vietnam"
  legal_name: "Coca-Cola Beverages Vietnam Ltd."
  contact_email: "ops@coca.vn"
  logo_url?: string
  industry?: string
  status: 'active' | 'pending' | 'suspended'
  member_count: int
  storage_used_gb: float
  storage_quota_gb: float
  plan: string
  owner_id: uuid → User    # 1 brand có 1 owner
  created_at, updated_at
```

> 🏷️ **BE legacy name**: `clients` table. **Đề xuất rename**: `brands`. Role member: `client_user` → `brand_user`.

### 3.2 Workspace
> Scope folder bên trong Brand. Brand có ≥ 1 workspace, mặc định 1 cái "Default".
> Mục đích: Coca-Cola có thể tách "Brand HQ campaigns" vs "Mobile team campaigns".

```yaml
Workspace:
  id: uuid
  brand_id: uuid → Brand
  name: "Marketing Team"
  slug: "marketing"
  is_default: bool
  storage_used_gb: float
  created_at, updated_at
```

### 3.3 User
> Người đăng nhập hệ thống.

```yaml
User:
  id: uuid
  email: string
  display_name: string
  avatar_url?: string
  role: 'admin' | 'staff' | 'brand_user'
  brand_id?: uuid    # Set nếu role = brand_user
  status: 'active' | 'pending' | 'inactive'
  created_at, last_seen_at
```

> Phase 2: thêm sub-roles `brand_owner` / `brand_editor` / `brand_viewer`.

### 3.4 Template (Catalog blueprint) ⭐
> **Blueprint Rexer thiết kế sẵn để brand dùng làm khởi điểm.**
> 1 Template → N Landings (1-to-many).

```yaml
Template:
  id: uuid
  code: "landing-hero-v1"           # slug, ổn định qua versions
  name: "Landing Hero v1"
  description: "Single-hero landing page for campaign launches"
  category: "landing" | "event-rsvp" | "product-showcase" | ...
  tags: ["hero", "launch"]
  thumbnail_url: string
  preview_mode: 'rendered'
  status: 'draft' | 'published' | 'archived'   # catalog lifecycle
  current_version_id: uuid → TemplateVersion
  author: User                                  # ai trong Rexer publish
  created_at, updated_at
```

**System-owned** — không có `brand_id`. Khả dụng cho mọi brand.

### 3.5 TemplateVersion
> Snapshot immutable của Template. Brand dùng Template thực ra là dùng 1 version cụ thể.

```yaml
TemplateVersion:
  id: uuid
  template_id: uuid → Template
  version: "v1.0" | "v1.1" | "v2.0"
  config_schema: JSON        # schema mô tả các slot brand fill (headline, cta_label, …)
  canvas_blueprint: JSON     # canvas data mặc định (blocks, layout)
  created_at
```

### 3.6 Landing Page (Brand's instance) ⭐
> **Brand's deployable landing**. Tạo từ 1 Template, customize tự do, có publish lifecycle.

```yaml
Landing:
  id: uuid
  brand_id: uuid → Brand
  workspace_id: uuid → Workspace
  name: "Coca Tết 2026 — Sum vầy ngày Tết"
  slug: "coca-tet-2026-sum-vay"           # URL identifier, unique trong brand
  status: 'draft' | 'published' | 'archived'

  template_id: uuid → Template            # blueprint nguồn
  template_version_id: uuid → TemplateVersion  # version locked tại thời điểm clone

  canvas_document_id: uuid → CanvasDocument   # editing surface (xem 3.7)
  active_release_id?: uuid → Release          # bản đang public live
  share_token?: string                         # token URL khi public, gen khi publish
  last_publish_at?: timestamp

  assigned_by?: User                           # nếu admin assign cho brand
  assigned_at?: timestamp
  handoff_notes?: string                       # ghi chú admin gửi kèm

  created_by, updated_by, created_at, updated_at
```

> 🏷️ **BE legacy name**: `projects` table. **Đề xuất rename**: `landings`.

### 3.7 Canvas Document ⭐
> **Editing surface** — chứa full canvas data (blocks, motion, extras, mobile variants) mà user đang sửa. Mỗi Landing có 1 Canvas Document gắn liền.
> Khi Publish → snapshot Canvas Document → tạo Release.

```yaml
CanvasDocument:
  id: uuid
  landing_id: uuid → Landing       # 1-1 với Landing
  canvas_data: JSON {              # full WYSIWYG state
    schema_version: "2.0",
    blocks: [ { id, blockType, contentVi, motion, extraElements, ... } ],
    publish: { ... }
  }
  canvas_size_bytes: int
  canvas_etag: string              # optimistic concurrency
  engine: 'fabric'
  engine_version: '5.3.0'
  version: int                      # optimistic lock counter
  width: int
  height: int
  created_by, updated_by, updated_at
```

> 🏷️ **BE legacy name**: `canvas_templates` table — **đổi tên hoàn toàn** vì hiện gây hiểu nhầm "đây là template".

### 3.8 Release ⭐
> **Immutable snapshot** của Landing tại thời điểm Publish. Public traffic được serve từ active_release.

```yaml
Release:
  id: uuid
  landing_id: uuid → Landing
  release_no: int                  # 1, 2, 3, …
  canvas_snapshot: JSON            # copy của CanvasDocument.canvas_data tại publish
  config_snapshot: JSON            # copy template config overrides
  share_token: string              # token gắn với release, dùng trong public URL
  published_by: User
  published_at: timestamp
  is_active: bool                  # chỉ 1 release active per landing tại 1 thời điểm
  rollback_of?: uuid → Release
```

**Public URL**: `/p/{landing_slug}/{share_token}` → BE resolve → trả về active_release.canvas_snapshot.

### 3.9 Saved Block
> Block đã lưu vào thư viện của brand để tái sử dụng across landings.

```yaml
SavedBlock:
  id: uuid
  brand_id: uuid → Brand           # private cho brand này
  workspace_id?: uuid              # optional, narrower scope
  created_by: User
  name: "Hero — Tết primary CTA"
  block_json: JSON                 # full block state (1 block, không phải canvas)
  tags: string[]
  scope: 'private' | 'team' | 'public'
  thumbnail_url?: string
  usage_count: int                  # tăng mỗi lần dùng
  source_template_id?: uuid → Template
  created_at, updated_at
```

### 3.10 Block (canvas-internal)
> 1 unit bên trong canvas. **Không có table riêng** — chỉ là phần tử trong `CanvasDocument.canvas_data.blocks[]`. Reference từ analytics qua `block_id`.

```yaml
Block (in-canvas, FE-side type):
  id: string                       # unique trong canvas
  blockType: 'hero_split' | 'feature_section' | 'cta_section' | ...  # 14 types
  contentVi: { desktop, mobile }   # nội dung tiếng Việt + variants
  elementStyles: { ... }
  background: { ... }
  motion: { ... }
  extraElements: [ ... ]           # icons, shapes, hotspots overlay
  isVisible: bool
  elementOrder?: string[]
```

> 🏷️ **FE rename**: `Block` → `CanvasBlock` để rõ ràng tránh confuse với SavedBlock.

### 3.11 Product
> Sản phẩm brand quản lý. Bind vào landing block để hiện ảnh, giá, mô tả.

```yaml
Product:
  id: uuid
  brand_id: uuid → Brand
  name: "Coca-Cola Zero Sugar 330ml"
  sku: string
  status: 'active' | 'draft' | 'archived'
  description: string
  category: string
  thumbnail_url: string
  sizes: [{ label, volume_ml, price_vnd }]
  colors: [{ name, hex }]
  ingredients: string[]
  certifications: { name, ... }[]
  features: { label, description }[]
  media_bindings: [{ block_id, media_id }]   # link với landings
  created_at, updated_at
```

### 3.12 Media Asset
> File upload (image/video/doc/audio).

```yaml
MediaAsset:
  id: uuid
  brand_id: uuid → Brand
  workspace_id?: uuid
  folder_id?: uuid → MediaFolder
  filename: string
  kind: 'image' | 'video' | 'document' | 'audio'
  mime_type: string
  size_bytes: int
  width?, height?, duration_ms?
  url: string                      # CDN public
  thumbnail_url?: string
  uploaded_by: User
  uploaded_at
```

### 3.13 Analytics Event
> Sự kiện tracking khi visitor tương tác với published landing.

```yaml
AnalyticsEvent:
  id: uuid
  landing_id: uuid → Landing       # which landing
  release_id?: uuid → Release       # which snapshot
  block_id?: string                # which block inside canvas
  element_id?: string              # which element inside block
  visitor_id: string               # client-generated, persistent in localStorage
  session_id: string               # 30-min idle expire
  event_type: 'page_view' | 'block_view' | 'block_dwell' | 'click' | 'scroll_depth' | 'form_submit' | 'slide_change' | 'slide_dwell' | 'element_view'
  action?, target?
  dwell_ms?, scroll_depth?
  viewport_w, viewport_h
  referrer?, utm_source?, utm_medium?, utm_campaign?
  meta: JSON
  occurred_at: timestamp
```

---

## 4. Entity relationships diagram

```
                        ┌──────────────┐
                        │    BRAND     │  1 brand = 1 Coca-Cola
                        │  (clients)   │
                        └──────┬───────┘
                               │ 1—N
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
         ┌────────┐      ┌──────────┐     ┌─────────┐
         │WORKSPACE│     │  USER    │     │ PRODUCT │
         │         │     │(brand_user)│   │         │
         └────┬───┘      └──────────┘     └─────────┘
              │ 1—N
              ▼
         ┌──────────────────────────┐         ┌──────────┐
         │       LANDING            │ N → 1   │ TEMPLATE │
         │  (BE: projects)          │ ◀────── │ (catalog)│
         │  - slug                  │         │ system   │
         │  - status                │         └──────────┘
         │  - template_id           │              │
         │  - canvas_document_id    │ 1—1          │ 1—N
         │  - active_release_id     │              ▼
         └──┬──────────────────────┬┘         ┌────────────────┐
            │ 1—1                  │ 1—N      │TEMPLATE_VERSION│
            ▼                      ▼          │  - config_schema│
   ┌────────────────┐      ┌──────────┐       └────────────────┘
   │ CANVAS_DOCUMENT │      │ RELEASE  │
   │ (BE: canvas_   │      │ snapshot │
   │  templates)    │      │ immutable│
   │ - canvas_data  │      └──────────┘
   │   (full WYSIWYG)│             ▲
   └────────────────┘              │
                                   │ snapshot ON publish
                                   │
                          ┌────────┴─────────┐
                          │  Click "Publish" │
                          └──────────────────┘

         ┌─────────────────┐
         │  SAVED_BLOCK    │  brand's reusable library
         │   - block_json  │  (1 block, không phải canvas)
         │   - scope       │
         └─────────────────┘

         ┌─────────────────┐
         │  MEDIA_ASSET    │  upload, bind vào Product hoặc dùng trong canvas
         └─────────────────┘

         ┌──────────────────┐
         │ ANALYTICS_EVENT  │  visitor tương tác với published landing
         │ landing_id +     │
         │ block_id +       │
         │ event_type       │
         └──────────────────┘
```

### Quan hệ chính (cardinality)

```
Brand     1 ── N  Workspace
Brand     1 ── N  User (brand_user)
Brand     1 ── N  Landing
Brand     1 ── N  Product
Brand     1 ── N  SavedBlock
Brand     1 ── N  MediaAsset

Workspace 1 ── N  Landing
Workspace 1 ── N  MediaAsset (optional scope)

Template       1 ── N  TemplateVersion
Template       1 ── N  Landing (each landing references 1 template)
TemplateVersion 1 ── N  Landing

Landing   1 ── 1  CanvasDocument        # exclusive editing surface
Landing   1 ── N  Release               # nhiều lần publish
Landing   1 ── ? Release.active_release_id (current)
Landing   1 ── N  AnalyticsEvent

Release   N ── 1  Landing
Release         snapshot of CanvasDocument tại publish time
```

### Constraints chính

- `Landing.slug` unique trong scope `(brand_id, workspace_id)`
- `Release.is_active = true` chỉ có 1 record per landing tại 1 thời điểm
- `CanvasDocument` chỉ tồn tại khi gắn với 1 Landing (1-1)
- `Brand.owner_id` phải là User với `role = 'brand_user'` và `brand_id = self`

---

## 5. Landing lifecycle (state machine)

```
                    ┌─────────────────────────────────────┐
                    │                                       │
                    │      ┌──────────┐                    │
       (create from │      │  DRAFT   │  ◀──────┐         │
        template)   │      │          │         │         │
                    └──────▶├──────────┤         │         │
                           │ - editable│         │         │
                           │ - no URL  │  unpublish        │
                           └─────┬─────┘         │         │
                                 │               │         │
                                 │ publish       │         │
                                 ▼               │         │
                           ┌───────────┐         │         │
                           │ PUBLISHED │ ────────┘         │
                           │           │                   │
                           │ - active_ │                   │
                           │   release │                   │
                           │ - share_  │                   │
                           │   token   │ ──────────┐       │
                           └─────┬─────┘           │       │
                                 │                 │ archive│
                                 │ archive         │       │
                                 ▼                 │       │
                           ┌───────────┐           │       │
                           │ ARCHIVED  │ ◀─────────┘       │
                           │           │                   │
                           │ - URL 404 │                   │
                           │ - data    │                   │
                           │   preserved│   restore         │
                           └─────┬─────┘ ────────────────────┘
                                 │
                                 │ delete (hard)
                                 ▼
                              [GONE]
```

### Transitions + side effects

| Edge | Trigger | Side effects |
|---|---|---|
| `(none) → DRAFT` | User chọn template + click "Use" | Tạo Landing + CanvasDocument với canvas_data = template.canvas_blueprint |
| `DRAFT → PUBLISHED` | User click "Publish" | Snapshot CanvasDocument → tạo Release. Set `active_release_id`, `share_token`, `last_publish_at`. URL `/p/{slug}/{token}` sống. |
| `PUBLISHED → DRAFT` | User click "Unpublish" | Set `active_release_id = null`. Invalidate `share_token`. URL 404. Release history giữ. |
| `* → ARCHIVED` | User click "Archive" | Soft-delete: URL 404 nếu publish. Hide khỏi default list. |
| `ARCHIVED → DRAFT` | User click "Restore" | Un-archive. Vẫn ở draft (không auto-republish). |
| `ARCHIVED → (gone)` | Hard delete sau N ngày | Cron job delete forever (Phase 2 GDPR compliance) |

### State invariants

- `PUBLISHED` ⇒ `active_release_id != null` AND `share_token != null`
- `DRAFT` ⇒ `active_release_id = null` (release history vẫn còn nhưng không active)
- `ARCHIVED` ⇒ public URL không phục vụ regardless of share_token

---

## 6. Workflows (10 user journeys end-to-end)

### W1 — Onboard 1 brand mới

**Actor**: Admin

```
1. Admin /admin/brands → click "Tạo khách hàng"
2. Modal: nhập tên + email + plan → POST /v1/brands
3. BE tạo:
   - Brand row
   - 1 Workspace "Default" với is_default=true
4. Admin invite owner: POST /v1/brands/{id}/users
   - Body: {email, display_name, role: 'brand_user'}
   - BE sinh password tạm, gửi email
5. Owner đăng nhập /portal → cookie session + active workspace = Default
```

### W2 — Rexer Staff tạo 1 Template mới

**Actor**: Staff

```
1. Staff /admin/templates → click "Tạo template mới"
2. Mở Canvas Builder /admin/canvas-builder (or /canvas-templates editor)
3. Drag blocks, sửa nội dung, set motion → autosave CanvasDocument
4. Click "Publish as Template" → modal:
   - Code (slug): "event-rsvp-v1"
   - Category: "event"
   - Tags: ["rsvp", "event"]
   - Config schema (slot fields brand sẽ fill): JSON editor
5. POST /v1/templates → tạo Template + TemplateVersion v1.0
6. Template xuất hiện trong /portal/templates (library) cho mọi brand thấy
```

### W3 — Brand chọn template tạo Landing (Phase 2 self-serve)

**Actor**: Brand user (Phase 2)

```
1. Brand /portal/templates → browse catalog, filter category
2. Click 1 template "Landing Hero v1" → preview modal
3. Click "Dùng template này"
4. Modal: nhập tên landing → "Hè 2026 promo"
5. POST /v1/landings
   Body: {
     template_id: 'landing-hero-v1-uuid',
     name: "Hè 2026 promo",
     workspace_id: <active_ws>
   }
6. BE tạo:
   - Landing (status=draft, slug='he-2026-promo')
   - CanvasDocument (canvas_data = clone template_version.canvas_blueprint)
   - Tạo TemplateVersion lock = current
7. Redirect /portal/landings/{id}/edit → canvas editor
```

### W4 — Admin tạo Landing cho brand (Phase 1 managed-service)

**Actor**: Admin

```
1. Admin /admin/brands/{id} → tab "Landings" → "Tạo landing mới"
2. Modal: chọn template + nhập tên + chọn workspace + ghi chú handoff
3. POST /v1/landings với body:
   {
     brand_id: <client>,
     workspace_id: <ws>,
     template_id: <chosen>,
     name: "Hè 2026 promo",
     assigned_by: <admin user>,
     handoff_notes: "Đã set sẵn block hero..."
   }
4. BE tạo Landing + CanvasDocument (clone canvas_blueprint).
   Status = draft. assigned_by set.
5. Admin redirect → canvas editor để bắt đầu dựng
6. Brand thấy notification "Rexer Admin assigned Hè 2026 promo"
```

### W5 — Edit canvas (Phase 1 staff làm)

**Actor**: Staff

```
1. Staff /admin/brands/{brand_id}/landings/{landing_id}
   hoặc /admin/canvas-editor/{canvas_document_id}
2. Mở editor full WYSIWYG
3. Edit blocks, drag-drop, set motion
4. Autosave mỗi 5s:
   PATCH /v1/canvas-documents/{id}
   Body: {canvas_data, version}  # optimistic lock
5. BE check version mismatch → 409, FE merge or retry
6. Save thumbnail: PUT /v1/canvas-documents/{id}/thumbnail (multipart)
```

### W6 — Brand review (Phase 1)

**Actor**: Brand user

```
1. Brand /portal/landings → thấy list, status badge
2. Click "Preview" trên card → /portal/landings/{id}/preview
3. BE: GET /v1/landings/{id}/canvas (auth-gated, no token needed)
4. FE render canvas using same renderer as public page
5. Top bar amber "Preview · brand-only"
6. Brand không thấy Edit button — chỉ Preview + (Analytics nếu published)
7. Nếu muốn sửa: brand comment trên block → POST /v1/landings/{id}/comments
8. Staff thấy comment trong /admin → resolve
```

### W7 — Publish landing

**Actor**: Admin/Staff (Phase 1) hoặc Brand (Phase 2)

```
1. /admin/canvas-editor → click "Publish"
2. Modal validate:
   POST /v1/landings/{id}/publish/validate
   BE check:
   - canvas_data có ít nhất 1 visible block?
   - required slots đã fill?
   - thumbnail có?
   - slug không trùng trong brand?
3. Nếu valid → modal confirm. Click "Publish".
4. POST /v1/landings/{id}/publish
5. BE:
   - Snapshot CanvasDocument.canvas_data → new Release row
   - Set release.is_active = true (deactivate any previous active)
   - Set landing.active_release_id = new_release.id
   - Set landing.status = 'published'
   - Generate share_token (32-char random)
   - Set landing.share_token, last_publish_at = now()
   - Fire event: notification cho brand + activity feed
6. FE toast "Đã publish — URL: /p/{slug}/{token}"
7. Brand thấy landing chip chuyển sang [PUBLISHED]
```

### W8 — Public visitor xem published landing

**Actor**: Anonymous visitor

```
1. Visitor mở URL /p/{landing_slug}/{share_token}
2. FE Next.js render:
   - useInitTracker(landing_id) → fire page_view
   - useBlockTracking() → IntersectionObserver setup
3. FE call GET /v1/public/landings/{slug}/canvas?share_token={token}
   (BE no auth, validate token, return active_release.canvas_snapshot)
4. Render block tree từ snapshot
5. Visitor scroll, click → FE fire analytics events to POST /v1/analytics/events
   - page_view (once per session)
   - block_view (IntersectionObserver threshold 0.5)
   - block_dwell (accumulate > 250ms)
   - click (delegated capture)
   - scroll_depth (25/50/75/100)
6. BE batch ingest, write to analytics_events table
7. Aggregations đẩy lên dashboard sau 5 phút
```

### W9 — Brand xem analytics

**Actor**: Brand user

```
1. Brand /portal/landings → click "Analytics" trên 1 published landing
2. Open /portal/landings/{id}/analytics
3. FE call GET /v1/portal/landings/{id}/breakdown?range=7d
4. BE return BlockBreakdownRow[]:
   - block_id, block_type
   - views, clicks, unique_viewers, avg_dwell_ms
   - views_by_day: number[]  # daily timeseries
   - top_action, actions: [{name, count}]
5. FE render grid: 1 card per block với
   - Mini thumbnail
   - Views/Clicks/CTR stats
   - Smooth bezier sparkline (catmull-rom)
6. Range picker 7d/14d/30d → reload breakdown
```

### W10 — Saved block reuse

**Actor**: Staff

```
1. Trong canvas editor, click 🔖 trên 1 block
2. Modal "Save block":
   - Name: "Hero — Tết primary CTA"
   - Tags: ["hero", "tet", "primary"]
   - Scope: 'private' (brand only) / 'team' / 'public'
3. POST /v1/saved-blocks
   Body: {brand_id, name, block_json, tags, scope}
4. Trong canvas khác, Sidebar "My blocks" → /portal/blocks
5. Drag block từ library vào canvas → clone block_json vào CanvasDocument
6. BE tăng usage_count
```

---

## 7. URL & namespace conventions

### 7.1 Frontend routes

```
/                          → Landing marketing site
/sign-in, /sign-up         → Auth
/portal/sign-up            → Brand-specific signup

# Admin (role = admin | staff)
/admin                     → Overview
/admin/brands              → List brands             (current: /admin/users)
/admin/brands/{id}         → Brand detail tabs
/admin/templates           → Template catalog
/admin/templates/{id}      → Template detail + versions
/admin/canvas-editor/{cd}  → Canvas editor (cd = canvas_document_id)
/admin/landings/{id}       → Landing detail (admin view)
/admin/blocks              → Block library (admin scope)
/admin/products            → Product catalog
/admin/users               → Users management
/admin/ai-templates        → AI template definitions
/admin/feedback, /ai-usage → Ops

# Portal (role = brand_user)
/portal                    → Dashboard
/portal/landings           → Brand's landing pages   (current: /portal/landing-pages)
/portal/landings/{id}/preview     → Auth-gated preview
/portal/landings/{id}/analytics   → Per-block analytics
/portal/templates          → Template catalog (brand picks from)
/portal/blocks             → Brand's saved blocks
/portal/media              → Media assets
/portal/products           → Brand products
/portal/comments           → Cross-landing comments inbox
/portal/profile            → Brand profile + members
/portal/ads                → Ad campaigns
/portal/curate             → Curate events feed

# Public
/p/{slug}/{share_token}    → Published landing (canonical)
/p/{landing_id}/{token}    → Backward compat
```

### 7.2 API namespaces

```
/v1/auth/*                 → Login, register, me
/v1/me/*                   → Current user
/v1/brands                 → Admin: list/get/create brands (current: /clients)
/v1/brands/{id}            → Brand CRUD
/v1/brands/{id}/users      → Brand members
/v1/brands/{id}/workspaces → Workspaces

/v1/templates              → Template catalog (system)
/v1/templates/{id}/versions
/v1/landings               → All landings (admin)         (current: /projects)
/v1/landings/{id}/canvas   → CanvasDocument (auth)
/v1/landings/{id}/publish  → Publish flow
/v1/landings/{id}/releases
/v1/canvas-documents/{id}  → Direct CanvasDocument access (autosave)

/v1/portal/me              → Current user
/v1/portal/me/brand        → My brand
/v1/portal/me/members      → My brand members
/v1/portal/landings        → Brand-scoped landings        (current: /portal/templates)
/v1/portal/templates       → Catalog filtered for brand   (current: /portal/templates/library)
/v1/portal/dashboard/summary
/v1/portal/comments
/v1/portal/activity
/v1/portal/notifications

/v1/saved-blocks           → Block library CRUD
/v1/products               → Product CRUD
/v1/media, /v1/media/folders, /v1/media/uploads → Media
/v1/analytics/events       → Ingest (POST)
/v1/portal/landings/{id}/breakdown → Per-block stats

/v1/public/landings/{slug}/canvas?share_token=... → Public render
```

---

## 8. Architecture decision points (BE cần confirm)

### D1. Landing vs Project naming

> Current BE: `projects` table is the brand-owned landing instance.
> **Question**: Rename `projects` → `landings` ở BE?
> **Recommendation**: ✅ rename — "project" quá generic, không gợi semantic.
> **Impact**: BE migration + endpoint deprecation, FE alias type Phase A → switch Phase B.

### D2. Canvas Document table

> Current BE: `canvas_templates` table chứa full canvas_data. Có cả `is_template`, `is_public_template`, `client_id`, `workspace_id` — vai trò unclear.
>
> **Question**: Canvas Document tách riêng vs gộp vào Landing?
>
> - **Option A** (recommended): tách bảng `canvas_documents`, 1-1 với Landing. CanvasDocument có id riêng, version optimistic lock. Landing reference qua `canvas_document_id`.
> - **Option B**: gộp `canvas_data` thành field JSON trên Landing trực tiếp. Đơn giản hơn nhưng row Landing nặng (canvas_data hàng MB).
>
> **Recommendation**: ✅ A — tách bảng. Lý do:
> - Canvas data có thể nặng → query Landing list không cần load
> - Optimistic lock riêng cho autosave editor
> - Release có thể snapshot canvas_data dễ dàng

### D3. Template canvas_blueprint vs slot schema

> Current BE: `templates` có `current_version_id`, version có gì chưa rõ.
>
> **Question**: Template version chứa gì?
>
> - **Option A**: Chỉ `config_schema` (slot fields) + system default blocks. Brand customize sâu qua canvas editor.
> - **Option B**: Full `canvas_blueprint` (block tree mặc định) + config_schema cho slot quick-edit. Brand vừa quick-fill vừa custom canvas được.
>
> **Recommendation**: ✅ B — best of both worlds:
> - `config_schema` = slot bindings (vd: {headline, cta_label, hero_image}) cho Phase 2 brand quick edit
> - `canvas_blueprint` = full canvas mặc định, brand clone xong tự edit canvas
> - 2 layer customization tách bạch

### D4. Public render URL pattern

> Current: `/p/{canvas_template_id}/{share_token}`.
>
> **Question**: Sau khi rename, URL public là gì?
>
> - **Option A**: `/p/{landing_slug}/{share_token}` — đẹp, SEO-friendly
> - **Option B**: `/p/{landing_id}/{share_token}` — id-based, không lo collision
> - **Option C**: `/p/{brand_slug}/{landing_slug}` — gấp đôi brand visibility
>
> **Recommendation**: ✅ A — slug landing đủ unique (constraint trong brand_id) + token đủ random để không guess được.

### D5. Saved Block backing storage

> Current: BE đã ship `/saved-blocks` table với `client_id`, `block_json`, `scope`, `tags`.
>
> **Question**: Có cần move sang per-workspace scope (block của workspace A không thấy ở workspace B)?
>
> **Recommendation**: Giữ brand-level (mọi workspace trong brand thấy được saved blocks chung). Phase 2 thêm filter `?workspace_id=` nếu user muốn.

---

## 9. Renaming roadmap

### Phase A — FE alias (1 ngày)

FE thêm types/components dùng tên mới song song:

```ts
// services/rexer/types.ts
export type Brand = Client;
export type BrandResponse = ClientResponse;
export type BrandUser = ClientUser;
export type Landing = Project;
export type LandingListResponse = ProjectListResponse;
export type CanvasDocument = CanvasTemplate;
export type CanvasBlock = Block;
```

Code mới dùng nameset mới. Code cũ stay.

### Phase B — BE backward-compat rename (1 sprint)

BE expose endpoint mới song song endpoint cũ:

```
GET /v1/brands              → 200 (mới)
GET /v1/clients             → 200, set header Deprecation: true

GET /v1/landings            → 200 (mới)
GET /v1/projects            → 200, set header Deprecation: true

GET /v1/canvas-documents/{id} → 200 (mới)
GET /v1/canvas-templates/{id} → 200, set header Deprecation: true
```

FE switch sang tên mới. Sau 2 sprint, BE remove endpoint cũ.

### Phase C — Route rename + status enum chuẩn hoá

```
# FE routes
/admin/users        → /admin/brands         (i18n + Next redirect 301)
/portal/landing-pages → /portal/landings    (đồng bộ với API)
/portal/templates   → /portal/template-library (clear meaning)

# Status enum chuẩn hoá tất cả entities về 'draft' | 'published' | 'archived'
# Bỏ is_active boolean
```

### Phase D — Documentation

- Glossary doc lưu vào repo root README
- Onboarding doc cho dev mới: 1 page về system spec
- Swagger doc regen với tên mới

---

## 10. Open questions cho buổi họp BE

### Architecture
- [ ] Approve naming canonical: Brand / Landing / CanvasDocument / Release / Template?
- [ ] Approve tách bảng `canvas_documents` 1-1 với Landing (D2 Option A)?
- [ ] Approve Template có cả `config_schema` + `canvas_blueprint` (D3 Option B)?
- [ ] Approve URL public dạng `/p/{landing_slug}/{share_token}` (D4 Option A)?

### Lifecycle
- [ ] Status enum chuẩn `'draft' | 'published' | 'archived'` cho mọi entity có lifecycle?
- [ ] Confirm Release immutable, không sửa được sau khi tạo (rollback bằng cách activate release cũ)?
- [ ] Publish flow có cần `/publish/validate` step không? Hay validate inline trong `/publish`?

### Endpoints
- [ ] BE commit ship 4 endpoint lifecycle:
   - [ ] `POST /v1/landings/{id}/publish`
   - [ ] `POST /v1/landings/{id}/unpublish`
   - [ ] `POST /v1/landings/{id}/archive`
   - [ ] `POST /v1/landings/{id}/restore`
- [ ] ETA cho phase B (backward-compat rename)?

### Permissions
- [ ] Phase 1 — confirm brand_user chỉ có 1 role (không hierarchy)?
- [ ] Phase 2 — split brand_owner / brand_editor / brand_viewer khi nào?

### Data
- [ ] Brand có default Workspace tự động khi tạo không?
- [ ] Landing có constraint `slug` unique trong `(brand_id, workspace_id)` hay `(brand_id)`?
- [ ] Hard-delete archived landings sau bao nhiêu ngày?

### Migration
- [ ] BE viết migration script convert canvas-templates → landings + canvas_documents như thế nào?
- [ ] Existing 18 canvas-templates rows xử lý ra sao? (1 landing per row? Discard nếu không có brand?)

---

## 11. Tham chiếu

- `docs/be-architecture-clarification-2026-05-23.md` — bản trước với 3 entity confusion
- `docs/be-audit-2026-05-23.md` — swagger gap audit
- `docs/naming-glossary-improvement-2026-05-23.md` — naming detail
- `docs/be-todo.md` — master TODO
- `docs/be-handoff-2026-05-23.md` — quick handoff

**Sau buổi họp**, doc này sẽ là **canonical source** — các doc khác sẽ archive hoặc rewrite theo doc này.

---

## 12. Liên hệ

- **FE owner / doc author**: @Lantm (`lantm.tekup@gmail.com`)
- **Repo**: `gitlab.com/lantm.tekup/rexerai` branch `develop`
- **Doc version**: v1.0 — draft, awaiting BE alignment
