# Rexer Architecture v1.1 — Page Unified (Landing + Ad + Curate)

> **Date**: 2026-05-23
> **Status**: 🟢 **Update of `rexer-architecture-clean-design-2026-05-23.md` v1.0**
> **Changes**: Q12 + Q13 + Q14 decisions chốt thêm → restructure Block + Page model
> **Reads with**: v1.0 doc (giữ nguyên cho 80% nội dung). Doc này chỉ ghi delta.

---

## 1. 3 quyết định bổ sung

| Q | Decision | Impact |
|---|---|---|
| Q12 | Block **multi-surface** — 1 block hỗ trợ nhiều surface (`supported_surfaces: text[]`) | Block reusable hơn (vd CTA Button cho cả landing + ad) |
| Q13 | **Rename `Landing` → `Page`** với `type: enum('landing','ad','curate')` discriminator | 1 entity gom cả 3 surface, tránh duplicate Landing/AdCreative/CurateEvent |
| Q14 | **Full Phase 1** — 3 surface block_types + Page entity + editor UI cho cả 3 type | Phase 1 effort +30%, ship được toàn surface ngay |

---

## 2. Schema delta

### 2.1 `block_types` — thêm `supported_surfaces`

```yaml
BlockType:
  code: string PK                       # 'cta_button', 'hero_split', 'popup_form'
  name: string
  description: text
  category: enum('hero','content','media','interactive','advanced','widget','creative')
  icon_name: string
  preview_image_url: string?
  props_schema: jsonb
  supported_surfaces: text[]            # ⭐ NEW: ['landing','ad','curate']
  min_dimensions?: jsonb                # ⭐ NEW: cho ad surface có constraint vd {width:728,height:90}
  supported_slot_types: text[]
  is_active: boolean
  engine_version: string
  created_at, updated_at

CONSTRAINTS:
- supported_surfaces NOT NULL, ≥ 1 element
- INDEX (supported_surfaces) USING GIN
```

**Examples**:

```json
// "Hero Split" — chỉ landing surface
{
  "code": "hero_split",
  "category": "hero",
  "supported_surfaces": ["landing"],
  ...
}

// "CTA Button" — dùng được nhiều surface
{
  "code": "cta_button",
  "category": "content",
  "supported_surfaces": ["landing", "ad", "curate"],
  ...
}

// "Banner Static 728x90" — chỉ ad
{
  "code": "ad_banner_728x90",
  "category": "creative",
  "supported_surfaces": ["ad"],
  "min_dimensions": { "width": 728, "height": 90 },
  ...
}

// "Popup Lead Form" — chỉ curate
{
  "code": "popup_lead_form",
  "category": "widget",
  "supported_surfaces": ["curate"],
  ...
}
```

### 2.2 `Landing` rename → `Page` (+ `type` field)

**BEFORE (v1.0)**:
```yaml
Landing:
  - id, brand_id, workspace_id, slug, name, status
  - template_version_id → TemplateVersion
  - active_release_id → LandingRelease
  - freeze_products: bool
  - ...
```

**AFTER (v1.1)**:
```yaml
Page:
  - id: uuid PK
  - brand_id, workspace_id
  - slug: string                        # unique trong (workspace, type)
  - name, description?
  - type: enum('landing', 'ad', 'curate')   # ⭐ NEW discriminator
  - status: enum('draft','published','archived')
  - template_version_id → TemplateVersion
  - active_release_id → PageRelease
  - freeze_products: boolean DEFAULT false
  - assigned_by, assigned_at, handoff_notes
  - thumbnail_asset_id
  - created_by, updated_by, created_at, updated_at, archived_at

  # Type-specific fields (NULL khi không applicable):
  - ad_format: enum('facebook_feed','youtube_pre_roll','tiktok_in_feed',
                    'banner_728x90','banner_300x250','story_1080x1920',
                    'instagram_square_1080x1080', ...)?    # NULL khi type != 'ad'
  - ad_dimensions: jsonb?               # { width, height } for ad type
  - curate_trigger: enum('time_on_page','scroll_50','exit_intent',
                          'click_element','form_abandon')?    # NULL khi type != 'curate'
  - curate_trigger_config: jsonb?       # { delay_ms, target_selector, ... }
  - curate_embed_token: string?         # for embed snippet (curate type)

CONSTRAINTS:
- UNIQUE (workspace_id, type, slug)     # slug unique within type per workspace
- INDEX (brand_id, type, status)
- INDEX (workspace_id, type, status)
- type='ad' ⇒ ad_format NOT NULL
- type='curate' ⇒ curate_trigger NOT NULL
- template_version → must reference template với same type (BE check)
```

### 2.3 Tương tự rename cho child tables

| BEFORE (v1.0) | AFTER (v1.1) |
|---|---|
| `landing_revisions` | `page_revisions` |
| `landing_releases` | `page_releases` |
| `landing_id` (FK column) | `page_id` |

Cấu trúc internal giữ nguyên — chỉ rename.

### 2.4 `Template` — thêm `target_page_type`

```yaml
Template:
  ...existing fields...
  target_page_type: enum('landing','ad','curate')   # ⭐ NEW
  ...

CONSTRAINTS:
- Khi tạo Page từ template → Page.type = Template.target_page_type
- canvas_blueprint trong TemplateVersion chỉ chứa blocks với supported_surfaces include target_page_type (BE validate)
```

Lý do: 1 template chỉ build 1 type page. "Landing Hero v1" không dùng làm ad/curate được vì block library + dimensions khác.

---

## 3. ER diagram update

```
                ┌─────────────────────────┐
                │  block_types            │
                │  - supported_surfaces:  │
                │    ['landing','ad',     │
                │     'curate']           │
                └────────────┬────────────┘
                             │ type_code
                             ▼
                ┌──────────────────────────┐
                │  blocks (CRUD entity)    │
                │  - settings: jsonb       │
                │  - scope (system/brand_*) │
                └──────────────┬───────────┘
                               │ referenced
                               ▼
              ┌────────────────────────────────┐
              │ template_versions.canvas_blueprint
              │ + slot_bindings per instance   │
              │ + target_page_type validation  │
              └────────────────┬───────────────┘
                               │ template_version_id
                               ▼
        ┌──────────────────────────────────────────┐
        │              Page                          │
        │  - type: 'landing'|'ad'|'curate'           │
        │  - slug                                     │
        │  - status: draft/published/archived         │
        │                                             │
        │  type='landing' → custom_domain serves      │
        │  type='ad'      → export to ad platforms    │
        │  type='curate'  → embed snippet for landing │
        └─────────────┬──────────────┬───────────────┘
                      │ 1—N          │ 1—1 (active)
                      ▼              ▼
              ┌──────────────┐ ┌─────────────────┐
              │ page_revisions│ │ page_releases   │
              │ (rolling 50)  │ │ (immutable snap) │
              └──────────────┘ └─────────────────┘
```

---

## 4. Publish flow per page type

### 4.1 `type='landing'` — như v1.0
- Snapshot canvas → release
- Custom domain routing: `coca.vn/{slug}` → active_release
- Analytics event capture

### 4.2 `type='ad'` — export-based
- Snapshot canvas → release
- BE render to fixed dimensions:
  - Static image (PNG/JPG) for image ads
  - Video (MP4) for video ads (Phase 2)
  - HTML5 banner zip (Phase 2)
- Brand download export → upload manually vào FB Ads Manager / Google Ads
- No public URL — ad creatives served bởi ad platform
- Analytics đến từ ad platform metrics import (xem Campaign §11 v1.0)

**Endpoint**:
```
POST /v1/pages/{id}/publish              # snapshot
GET  /v1/pages/{id}/export?format=png    # download render
GET  /v1/pages/{id}/export?format=mp4    # Phase 2 video
GET  /v1/pages/{id}/export?format=html   # Phase 2 HTML5 banner
```

### 4.3 `type='curate'` — embed snippet
- Snapshot canvas → release
- BE generate embed snippet:
  ```html
  <script src="https://cdn.rexer.com/curate.js"
          data-curate-id="page_uuid"
          data-token="curate_embed_token"></script>
  ```
- Brand paste snippet vào landing page (Rexer landing hoặc external site như WordPress/Shopify)
- Curate widget render on trigger (time/scroll/exit/click) theo `curate_trigger`
- Analytics: widget views, interactions, form submits, conversion to landing

**Endpoint**:
```
POST /v1/pages/{id}/publish               # snapshot
GET  /v1/pages/{id}/embed-snippet         # return <script> HTML
GET  /v1/public/curate/{id}?token=...     # actual widget render (cross-origin)
```

---

## 5. Workflows mới

### W13 — Staff tạo Ad page

```
1. /admin/templates → "Create template" → chọn target_page_type='ad'
2. Pick ad format: 'facebook_feed' / 'banner_728x90' / ...
3. Canvas builder load ONLY blocks với supported_surfaces include 'ad'
4. Drag ad-blocks: image_banner, cta_button, headline_overlay
5. Define slots (ad_headline, ad_image, ad_cta_url)
6. Save → POST /v1/templates {target_page_type:'ad', ad_format:'facebook_feed', ...}
7. Brand chọn template → create Page với type='ad'
8. Brand fill slot → BE validate dimensions match ad_format
9. Publish → export PNG/MP4
10. Brand upload export vào ad platform
```

### W14 — Brand tạo Curate widget

```
1. Brand /portal/curate → "Create widget"
2. Pick widget type: 'popup_lead_form' / 'exit_intent' / 'quiz' / 'voting'
3. Choose trigger: 'exit_intent' / 'time_on_page' / 'scroll_50'
4. Configure trigger params (vd delay_ms=3000)
5. Form editor fill slot (headline, fields, CTA)
6. Publish → BE generate embed_token + snippet
7. UI hiển thị snippet code:
   <script src="https://cdn.rexer.com/curate.js"
           data-curate-id="page_xyz" data-token="t_abc"></script>
8. Brand copy paste vào landing page (Rexer hoặc external)
9. Visitor browse → trigger fired → widget render → interact → form submit
10. /portal/curate/{id}/analytics shows funnel
```

---

## 6. UI structure mới

```
Portal sidebar (brand view):
─ Dashboard
─ Rexer Product
  ├── Landing pages    (Page.type='landing')
  ├── Ads              (Page.type='ad')    ⭐ NEW canvas editor
  ├── Curate           (Page.type='curate') ⭐ NEW canvas editor
  └── Templates library
─ Assets
  ├── Blocks           (filter by supported_surfaces)
  ├── Media
  └── Products
─ Campaigns            (groups Page.type='ad' + metric import)
─ Comments
─ Profile

Admin sidebar:
─ Dashboard
─ Brands
─ Templates           (target_page_type filter chips: All/Landing/Ad/Curate)
─ Block library       (catalog + brand blocks)
─ AI Studio
─ Users
─ Ops
```

---

## 7. API surface update

### 7.1 `pages` thay thế `landings`

```
# List + create — workspace nested + type filter
GET    /v1/workspaces/{wsId}/pages?type=&status=&q=
POST   /v1/workspaces/{wsId}/pages          # body: {type, template_id, name, ad_format?, curate_trigger?}

# Detail + edit
GET    /v1/pages/{id}
PATCH  /v1/pages/{id}
DELETE /v1/pages/{id}                       # archive
POST   /v1/pages/{id}/restore

# Revisions + releases
POST   /v1/pages/{id}/config                # autosave revision
GET    /v1/pages/{id}/revisions
POST   /v1/pages/{id}/revisions/{revNo}/revert
POST   /v1/pages/{id}/publish/validate
POST   /v1/pages/{id}/publish
POST   /v1/pages/{id}/unpublish
GET    /v1/pages/{id}/releases
POST   /v1/pages/{id}/releases/{relId}/activate     # rollback

# Type-specific
GET    /v1/pages/{id}/export?format=          # type='ad' only — PNG/MP4/HTML
GET    /v1/pages/{id}/embed-snippet           # type='curate' only

# Analytics — all 3 types
GET    /v1/pages/{id}/analytics/summary?range=
GET    /v1/pages/{id}/analytics/blocks?range=

# Admin assign
POST   /v1/admin/pages/from-template          # body: {template_id, brand_id, workspace_id, name, notes}
```

### 7.2 `templates` — thêm filter

```
GET /v1/templates?target_page_type=landing&category=hero&scope=public
```

### 7.3 `block-types` — thêm filter

```
GET /v1/block-types?surface=landing      # blocks usable in landing
GET /v1/block-types?surface=ad           # blocks usable in ads
GET /v1/block-types?surface=curate
```

### 7.4 `blocks` — filter theo surface

```
GET /v1/blocks?surface=ad                # all ad-usable blocks
                                          # BE: WHERE type_code IN
                                          #   (SELECT code FROM block_types WHERE 'ad' = ANY(supported_surfaces))
```

---

## 8. Sprint plan v1.1 (Phase 1 full scope)

| Sprint | Deliverable | Effort | Delta vs v1.0 |
|---|---|---|---|
| S1 | Schema design + migrations + seed (gồm 3 surface block_types) | 1 week | +0.5w (3 surface catalog seed) |
| S2 | Auth + Brand + Workspace + User CRUD | 1 week | — |
| S3 | BlockType (catalog) + Block CRUD + props validator | 1 week | — |
| S4 | Template + TemplateVersion (target_page_type) + slot_schema | 1 week | — |
| S5 | **Page** entity (with type discriminator) + Revisions + Releases | 1.5 weeks | rename + type validation |
| S6 | Page editor — Landing flow (full WYSIWYG slot fill + preview) | 1.5 weeks | unchanged |
| **S7** | **Page editor — Ad flow + export to PNG (Phase 1 only image)** | **1.5 weeks** | ⭐ NEW |
| **S8** | **Page editor — Curate flow + embed snippet + curate.js loader** | **1.5 weeks** | ⭐ NEW |
| S9 | Custom Domain + DNS verify + TLS provision (landing pages only) | 1.5 weeks | unchanged |
| S10 | Media upload + Product CRUD + bind refs | 1 week | — |
| S11 | Analytics ingestion + aggregation (3 page types) | 1.5 weeks | +0.5w (multi-type rollup) |
| S12 | AI integration (job queue + slot suggest + template draft, 3 types) | 1 week | — |
| S13 | Campaign + ActivityLog + audit | 0.5 week | — |
| S14 | Testing + load test + bug fix | 1 week | — |

**Total Phase 1 v1.1**: ~16 weeks BE solo, or **~10 weeks với 2 BE parallel** (4 tuần đầu cùng làm schema + core, 6 tuần cuối split: BE1 publish flows / BE2 editor surfaces).

⚠️ **+4 weeks vs v1.0** vì thêm Ad export + Curate embed.

---

## 9. Tradeoffs

| Decision | Lợi | Hại |
|---|---|---|
| Q12 B (multi-surface block) | Reuse cao, tránh duplicate "CTA Button" cho từng surface | Block render engine phải handle 3 dimensions/contexts |
| Q13 Option 2 (Page unified) | 1 entity simple, lifecycle nhất quán, query dễ | Page row có nullable type-specific fields (ad_format, curate_trigger) → schema "messy" |
| Q14 C (full Phase 1) | Ship Day-1 với full ecosystem (ad + curate market-ready) | +4 weeks BE, +3 weeks FE (3 editor surfaces) |

---

## 10. Migration từ v1.0 doc

Đối với BE đã đọc v1.0:

| v1.0 | v1.1 | Action |
|---|---|---|
| `landings` table | `pages` table | Rename + add `type` column DEFAULT 'landing' |
| `landing_revisions` | `page_revisions` | Rename column `landing_id` → `page_id` |
| `landing_releases` | `page_releases` | Same |
| `BlockType.surface_type` (single) | `BlockType.supported_surfaces` (text[]) | Migration script: `surface_type` → `ARRAY[surface_type]` |
| Workflows W1-W12 | Vẫn áp dụng + thêm W13 (ad), W14 (curate) | Append |
| Phase 1 ship list | +AdPage editor + CuratePage editor + 3-surface block_types seed | Append |

---

## 11. Sample seed data

### block_types catalog (Phase 1 minimum)

**Landing surface** (~14 types — đã có):
```
hero_split, hero_overlay, feature_section, feature_grid, photo_gallery,
booking_form, cta_section, image_carousel, stories, split_screen, quiz,
poll, carousel_3d, flipbook, panorama
```

**Ad surface** (~6 types — Phase 1 launch):
```
ad_banner_728x90        — leaderboard banner
ad_banner_300x250       — medium rectangle
ad_facebook_feed_1200x628
ad_instagram_square_1080x1080
ad_story_1080x1920
ad_youtube_thumbnail_1280x720
```

**Curate surface** (~5 types — Phase 1 launch):
```
popup_lead_form
exit_intent_offer
quiz_modal
voting_widget
floating_cta_button
```

**Multi-surface blocks** (vừa landing vừa ad):
```
cta_button             (supported_surfaces: ['landing','ad','curate'])
headline_overlay       (supported_surfaces: ['landing','ad'])
product_card           (supported_surfaces: ['landing','ad'])
```

---

## 12. Phase 1 ship list update

✅ Brand + Workspace + User + Membership (2 roles)
✅ BlockType catalog (3 surfaces, ~25 types total)
✅ Block CRUD (system + brand_private scopes)
✅ Template + TemplateVersion (target_page_type='landing'|'ad'|'curate')
✅ **Page** entity unified (3 types: landing / ad / curate)
✅ Page revisions (rolling 50) + releases (immutable)
✅ Slot-fill form editor (cho cả 3 type)
✅ Landing publish → custom domain serve
✅ Ad publish → export PNG (Phase 1) — MP4/HTML5 Phase 2
✅ Curate publish → embed snippet + curate.js loader
✅ Media + Folders + SHA-256 dedupe
✅ Products (CRUD + ref qua slot)
✅ Page-level + block-level Analytics (3 types)
✅ AI: template draft + slot suggest (all 3 types)
✅ ActivityLog
✅ Custom domain (landing only Phase 1)
✅ Campaign + metric import

---

## 13. Liên hệ

- **Doc author**: @Lantm
- **Đọc cùng**: `rexer-architecture-clean-design-2026-05-23.md` (v1.0, sections không bị thay đổi)
- **Status**: ready for BE design review
