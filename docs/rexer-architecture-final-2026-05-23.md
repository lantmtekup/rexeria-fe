# Rexer Architecture — Final Spec

> **Version**: 1.0 (merged from v1.0 clean-design + v1.1 page-unified)
> **Date**: 2026-05-23
> **Status**: 🟢 **Source of truth** — BE thiết kế DB từ doc này
> **Audience**: BE squad + PM + FE owner
> **Scope**: Phase 1 (managed-service, full 3-surface) + Phase 2 hooks

---

## 0. Quick read (2 phút)

Rexer = platform giúp brand publish 3 loại "page" cho marketing:
1. **Landing page** — public URL với custom domain
2. **Ad creative** — export PNG/MP4 cho brand upload lên Facebook/YouTube/TikTok
3. **Curate widget** — embed `<script>` cho popup/quiz/exit-intent trên landing hoặc external site

**Phase 1 = managed service**: Rexer staff thiết kế Template (canvas blueprint + slot schema), brand fill slot qua form editor + publish. AI hỗ trợ cả 2 phía.

**Cốt lõi data model**: `Page` entity unified với `type` discriminator (`landing`|`ad`|`curate`), `Block` là first-class CRUD entity với `supported_surfaces` text array, `Template` validate canvas_blueprint chỉ chứa blocks match surface.

**3 personas**: Rexer Admin/Staff · Brand Admin/Member · Public Visitor.

---

## 1. Mục lục

```
2.  14 quyết định product (Q1-Q14)
3.  Personas + permissions matrix
4.  Domain model — 22 entities (locale-wrapped values, type_metadata jsonb)
5.  Slot schema spec
6.  ER diagram
7.  State machines (Page, CustomDomain, AIJob)
8.  14 workflows W1-W14
9.  URL + namespace conventions
10. API surface (resource-nested REST)
11. Custom domain provisioning (3 target_types)
12. Analytics data flow
13. AI integration points
14. Naming glossary
15. Phase 1 vs Phase 2 split
16. Trade-offs
17. Sprint plan (16 sprints, ~10 weeks với 2 BE parallel)
18. Seed data — block_types catalog
19. Multi-tenancy RLS ⭐
20. API versioning + deprecation policy ⭐
21. Open questions cho BE
22. Migration mapping
23. Contact
```

---

## 2. 14 quyết định product (locked)

| Q | Decision | Choice |
|---|---|---|
| Q1 | Customization model | **Template + slot-fill** (brand fill form, không drag-drop) |
| Q2 | Template ownership | **Public + brand_private** scope |
| Q3 | Workspace | **Có** — Brand → Workspace → Page |
| Q4 | Public URL | **Custom domain Phase 1** (brand map `coca.vn`) |
| Q5 | Versioning | **Rolling 50 revisions + immutable releases** |
| Q6 | i18n | **Vietnamese only Phase 1** |
| Q7 | Brand roles | **2 levels**: `brand_admin` / `brand_member` |
| Q8 | Campaign | **Standalone** entity (không FK với Page) |
| Q9 | Product binding | **Hybrid** — `Page.freeze_products: bool` per page |
| Q10 | AI | **Cả 2 phía** — staff template draft + brand slot suggest |
| Q11 | Analytics | **Dual-tier** — page-level + block-level |
| Q12 | Block surface | **Multi-surface** — `supported_surfaces: text[]` |
| Q13 | Page entity | **Unified với `type` discriminator** (`landing`/`ad`/`curate`) |
| Q14 | Phase 1 scope | **Full 3 surfaces** với editor UI |

### Implication chính

- **Brand KHÔNG có canvas drag-drop editor** → chỉ form editor render từ template's slot_schema
- **Rexer staff CÓ canvas editor** → tạo Template blueprint
- **1 entity `Page`** cho cả 3 surface, type-specific config gom vào `type_metadata: jsonb`
- **Block multi-surface** → `cta_button` dùng được cho cả landing + ad + curate

### ⭐ 5 hardening mitigations (extensibility insurance)

| # | Mitigation | Section | Cost | Tránh được |
|---|---|---|---|---|
| 1 | **Locale-wrapped text values** từ Phase 1 `{vi: "..."}` | §5.4-5.6 | 0.5 day FE | Multi-lang migration ~2 sprints Phase 2 |
| 2 | **`pages.type_metadata: jsonb`** thay nullable columns | §4.3.1 | 1 day BE | Sparse schema khi thêm page type mới |
| 3 | **`custom_domains.target_type`** enum cho 3 mục đích | §4.5 | 0.5 day BE | Refactor domain routing Phase 2 |
| 4 | **Postgres Row Level Security** | §19 | 1 sprint BE | Tenant data leak risk |
| 5 | **API versioning + deprecation** policy | §20 | 0.5 day BE | Breaking change communication chaos |

→ **+1 sprint Phase 1 work** = tránh **5+ sprint Phase 2 retrofit** + security incident risk.

---

## 3. Personas + permissions

| Persona | Login | Quyền chính |
|---|---|---|
| **Rexer Admin** | `/admin` | All — manage brands, billing, infra, AI quota |
| **Rexer Staff** | `/admin` | Build templates, assign pages cho brand, support |
| **Brand Admin** | `/portal?ws=...` | Full brand actions: invite, edit, publish, domain, billing |
| **Brand Member** | `/portal?ws=...` | Edit page draft, không publish/invite/billing |
| **Public Visitor** | `/p/...` hoặc custom domain | Read-only published landings, fire analytics |

### Permission matrix

| Action | Admin | Staff | Brand_Admin | Brand_Member | Public |
|---|:---:|:---:|:---:|:---:|:---:|
| Create Brand | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Brand profile | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invite brand user | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Workspace | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create system Block | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create brand Block | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create public Template | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create brand Template | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Page (any type) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Page draft | ✅ | ✅ | ✅ | ✅ | ❌ |
| Publish Page | ✅ | ✅ | ✅ | ❌ | ❌ |
| Archive Page | ✅ | ✅ | ✅ | ❌ | ❌ |
| Map Custom Domain | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| Read published Page | — | — | — | — | ✅ |

---

## 4. Domain model — 22 entities

Tables grouped by domain. Postgres-flavored DDL.

### 4.1 Auth + Tenancy (4 tables)

#### `users`
```yaml
- id: uuid PK
- email: string UNIQUE
- password_hash: string
- display_name: string
- avatar_url: string?
- role: enum('admin', 'staff')        # KHÔNG có brand role — brand role ở brand_memberships
- status: enum('active', 'pending', 'disabled')
- last_login_at: timestamp?
- created_at, updated_at
```

#### `brands`
```yaml
- id: uuid PK
- slug: string UNIQUE                 # "coca-cola" immutable
- name: string                        # "Coca-Cola Vietnam"
- legal_name: string?
- contact_email: string
- contact_phone: string?
- country_code: string?
- industry: string?
- logo_asset_id: uuid? FK → media_assets
- status: enum('active', 'pending', 'suspended')
- plan: string                        # 'phase1_managed', 'phase2_self_serve'
- storage_quota_gb: int
- storage_used_gb: numeric
- created_by: uuid FK → users
- created_at, updated_at
```

#### `workspaces`
```yaml
- id: uuid PK
- brand_id: uuid FK → brands
- slug: string                        # "marketing-team"
- name: string
- is_default: boolean
- created_by: uuid FK → users
- created_at, updated_at

CONSTRAINTS:
- UNIQUE (brand_id, slug)
- 1 brand có đúng 1 workspace is_default=true
```

#### `brand_memberships`
N-N user × brand × role.
```yaml
- id: uuid PK
- brand_id: uuid FK → brands
- user_id: uuid FK → users
- role: enum('brand_admin', 'brand_member')
- joined_at: timestamp
- last_seen_at: timestamp?
- invited_by: uuid? FK → users

CONSTRAINTS:
- UNIQUE (brand_id, user_id)
- Mỗi brand có ≥1 brand_admin
```

---

### 4.2 Block layer (2 tables) ⭐

#### `block_types`
System catalog của 14+ built-in types. Admin manage.

```yaml
- code: string PK                     # 'hero_split', 'cta_button', 'popup_form'
- name: string
- description: text
- category: enum('hero','content','media','interactive','advanced','widget','creative')
- icon_name: string                   # lucide icon
- preview_image_url: string?
- props_schema: jsonb                 # định nghĩa structure của block.settings
- supported_surfaces: text[]          # ['landing','ad','curate']
- min_dimensions: jsonb?              # { width, height } cho ad surface
- supported_slot_types: text[]
- is_active: boolean
- engine_version: string              # 'fabric@5.3.0'
- created_at, updated_at

CONSTRAINTS:
- supported_surfaces NOT NULL, ≥ 1 element
- INDEX (supported_surfaces) USING GIN
- INDEX (category, is_active)
```

**Sample row**:
```json
{
  "code": "cta_button",
  "name": "CTA Button",
  "category": "content",
  "supported_surfaces": ["landing", "ad", "curate"],
  "props_schema": {
    "style": {"type": "enum", "values": ["solid","outline","ghost"], "default": "solid"},
    "size": {"type": "enum", "values": ["sm","md","lg","xl"], "default": "md"},
    "background": {"type": "color", "default": "#ff0000"},
    "border_radius": {"type": "number", "default": 8}
  },
  "supported_slot_types": ["text", "url"]
}
```

#### `blocks`
Instance entity với custom settings. CRUD đầy đủ.

```yaml
- id: uuid PK
- type_code: string FK → block_types.code
- brand_id: uuid? FK → brands         # NULL = system block
- workspace_id: uuid? FK → workspaces
- name: string
- description: text?
- settings: jsonb                     # ⭐ KEY STORAGE: layout/motion/style/theme
- thumbnail_asset_id: uuid? FK → media_assets
- tags: text[]
- scope: enum('system', 'brand_private', 'brand_team', 'brand_public')
- usage_count: int DEFAULT 0
- last_used_at: timestamp?
- source_block_id: uuid? FK → blocks   # clone reference
- created_by: uuid FK → users
- updated_by: uuid FK → users
- created_at, updated_at, archived_at?

CONSTRAINTS:
- scope='system' ⇒ brand_id IS NULL
- scope!='system' ⇒ brand_id IS NOT NULL
- INDEX (brand_id, scope, type_code)
- INDEX (brand_id, tags) USING GIN
- INDEX (type_code) WHERE scope='system'
- BE validate settings against block_types.props_schema mỗi PATCH
```

**Sample row** (brand-level custom):
```json
{
  "id": "blk_abc123",
  "type_code": "cta_button",
  "brand_id": "brand_coca",
  "name": "Coca Red CTA",
  "settings": {
    "style": "solid",
    "size": "lg",
    "background": "#ed1c24",
    "border_radius": 16
  },
  "scope": "brand_private",
  "tags": ["coca","red","primary"]
}
```

---

### 4.3 Template + Page (5 tables) ⭐

#### `templates`
Catalog blueprint. 2 scopes: public hoặc brand_private.

```yaml
- id: uuid PK
- slug: string UNIQUE                 # "landing-hero-v1"
- name: string
- description: text?
- category: string
- tags: text[]
- thumbnail_asset_id: uuid? FK → media_assets
- scope: enum('public', 'brand_private')
- owner_brand_id: uuid? FK → brands
- target_page_type: enum('landing', 'ad', 'curate')   # ⭐ 1 template build 1 type
- created_by: uuid FK → users
- status: enum('draft', 'published', 'archived')
- current_version_id: uuid? FK → template_versions
- created_at, updated_at

CONSTRAINTS:
- scope='brand_private' ⇒ owner_brand_id IS NOT NULL
- scope='public' ⇒ owner_brand_id IS NULL
- UNIQUE (owner_brand_id, slug)
- INDEX (target_page_type, scope, status)
```

#### `template_versions`
Immutable snapshot. Page lock vào 1 version.

```yaml
- id: uuid PK
- template_id: uuid FK → templates
- version_no: int
- version_label: string?              # "v1.0"
- slot_schema: jsonb                  # ⭐ định nghĩa slot fields (xem §5)
- canvas_blueprint: jsonb             # ⭐ block layout + slot_bindings (xem §5)
- preview_html: text?
- created_by: uuid FK → users
- created_at: timestamp

CONSTRAINTS:
- UNIQUE (template_id, version_no)
- INDEX (template_id, version_no DESC)
- canvas_blueprint blocks chỉ chứa block_id với supported_surfaces include templates.target_page_type (BE validate)
```

#### `pages` ⭐
Brand-owned instance. Unified entity cho 3 type. Type-specific config gom vào `type_metadata` jsonb để schema không sparse.

```yaml
- id: uuid PK
- brand_id: uuid FK → brands
- workspace_id: uuid FK → workspaces
- slug: string                        # "tet-2026-promo"
- name: string
- description: text?
- type: enum('landing', 'ad', 'curate', ...)   # ⭐ discriminator (extensible)
- type_metadata: jsonb                # ⭐ type-specific config (xem schema bên dưới)
- status: enum('draft', 'published', 'archived')
- template_version_id: uuid FK → template_versions
- active_release_id: uuid? FK → page_releases
- freeze_products: boolean DEFAULT false
- assigned_by: uuid? FK → users
- assigned_at: timestamp?
- handoff_notes: text?
- thumbnail_asset_id: uuid? FK → media_assets
- created_by: uuid FK → users
- updated_by: uuid FK → users
- created_at, updated_at, archived_at?

CONSTRAINTS:
- UNIQUE (workspace_id, type, slug)   # slug unique within type per workspace
- INDEX (brand_id, type, status)
- INDEX (workspace_id, type, status)
- INDEX (type_metadata) USING GIN     # fast filter by type-specific fields
- pages.type MUST match template_version.template.target_page_type (BE validate)
- type_metadata MUST conform to schema defined per type (BE validate, xem §4.3.1)
```

##### 4.3.1 `pages.type_metadata` schema per type

BE validate dựa trên `pages.type`:

```yaml
type='landing':
  type_metadata: {
    # Phase 1: empty {} OK
    # Phase 2+: featured_image?, og_meta?, robots?, sitemap_priority?
  }

type='ad':
  type_metadata: {
    format: 'facebook_feed' | 'banner_728x90' | 'story_1080x1920' | ...,
    dimensions: { width: int, height: int },
    duration_sec?: int      # cho video ads
  }

type='curate':
  type_metadata: {
    trigger: 'time_on_page' | 'scroll_50' | 'exit_intent' | 'click_element',
    trigger_config: {
      delay_ms?: int,
      scroll_threshold_pct?: int,
      target_selector?: string,
      max_show_per_session?: int
    },
    embed_token: string     # generated khi publish
  }
```

→ Thêm `type='email'` Phase 2 chỉ cần định nghĩa schema cho `type_metadata`, **không cần migration**.

#### `page_revisions`
Rolling 50 autosave revisions per page.

```yaml
- id: uuid PK
- page_id: uuid FK → pages
- revision_no: int
- config_json: jsonb                  # slot values
- changed_by: uuid FK → users
- changed_at: timestamp

CONSTRAINTS:
- UNIQUE (page_id, revision_no)
- INDEX (page_id, changed_at DESC)
- Cron daily: DELETE WHERE page_id=X AND revision_no < (max - 50)
```

#### `page_releases`
Immutable snapshot khi publish. Public traffic serve từ active.

```yaml
- id: uuid PK
- page_id: uuid FK → pages
- release_no: int
- version_label: string?
- config_snapshot: jsonb              # slot values tại publish time
- canvas_blueprint_snapshot: jsonb    # block layout + resolved blocks
- product_snapshot: jsonb?            # nếu freeze_products=true
- share_token: string?                # for landing type custom URL
- published_by: uuid FK → users
- published_at: timestamp
- is_active: boolean

CONSTRAINTS:
- UNIQUE (page_id, release_no)
- UNIQUE PARTIAL (page_id) WHERE is_active=true
- INDEX (page_id, published_at DESC)
```

---

### 4.4 Assets (4 tables)

#### `products`
Brand product catalog.
```yaml
- id, brand_id, sku?, slug
- name, description?, category?
- status: enum('active','draft','archived')
- price_vnd: numeric?
- thumbnail_asset_id: uuid?
- attributes: jsonb                   # sizes, colors, ingredients, features
- created_by, created_at, updated_at

CONSTRAINTS:
- UNIQUE (brand_id, slug)
- INDEX (brand_id, status)
```

#### `media_assets`
File upload với SHA-256 dedupe.
```yaml
- id, brand_id, workspace_id?, folder_id?
- filename, mime_type, size_bytes
- file_hash: string (SHA-256)
- storage_url, public_cdn_url?, thumbnail_url?
- media_type: enum('image','video','document','audio')
- width?, height?, duration_ms?
- uploaded_by, uploaded_at

CONSTRAINTS:
- UNIQUE (brand_id, file_hash)        # dedupe within brand
- INDEX (brand_id, folder_id)
```

#### `media_folders`
Tree organization.
```yaml
- id, brand_id, parent_id? (self-FK), name
- created_by, created_at, updated_at

CONSTRAINTS:
- UNIQUE (brand_id, parent_id, name)
```

---

### 4.5 Distribution — Custom Domain (2 tables, landing only)

#### `custom_domains`
Multi-purpose: landing serve / curate CDN / tracking pixel. Brand có thể có 3 domain riêng cho 3 mục đích.

```yaml
- id, brand_id, workspace_id
- domain: string UNIQUE               # "coca.vn" hoặc "cdn.coca.vn" hoặc "track.coca.vn"
- target_type: enum('landing','curate_cdn','tracking')  # ⭐ NEW
- status: enum('pending','verifying','verified','failed','disabled')
- verification_token, verification_method
- verified_at?, tls_status, tls_cert_id?, tls_expires_at?
- last_check_at?, failure_reason?
- created_by, created_at, updated_at

CONSTRAINTS:
- UNIQUE (domain)                     # 1 domain global
- INDEX (brand_id, target_type)
- INDEX (workspace_id, target_type)
- INDEX (status) WHERE status IN ('verifying', 'pending')

target_type semantics:
- 'landing'    → routing: domain → workspace → pages WHERE type='landing'
                 (Phase 1 ship)
- 'curate_cdn' → serve curate.js + widget data từ brand's domain
                 thay vì cdn.rexer.com → tránh CSP issue cross-origin
                 (Phase 2)
- 'tracking'   → analytics pixel endpoint từ brand's domain
                 thay vì track.rexer.com → tránh ad-block
                 (Phase 2)
```

#### `domain_verification_logs`
```yaml
- id, domain_id FK → custom_domains
- check_type: enum('dns_lookup','tls_provision','manual_retry')
- result: enum('success','pending','failure')
- details: jsonb
- checked_at: timestamp

CONSTRAINTS:
- INDEX (domain_id, checked_at DESC)
```

---

### 4.6 Engagement (4 tables)

#### `campaigns`
Standalone ad tracking (Q8).
```yaml
- id, brand_id, workspace_id
- name, slug?
- objective: enum('awareness','traffic','conversion','retention')
- status: enum('draft','active','paused','completed')
- channels: text[]
- budget_amount: numeric?, budget_currency
- start_date?, end_date?
- kpis: jsonb
- notes: text?
- tracked_url: string?
- product_id: uuid? FK → products
- created_by, created_at, updated_at

CONSTRAINTS:
- INDEX (brand_id, status), INDEX (workspace_id, status)
```

#### `campaign_metrics`
```yaml
- id, campaign_id FK
- date: date
- channel: string
- impressions, clicks: bigint
- spent_amount: numeric, conversions: int
- raw: jsonb

CONSTRAINTS:
- UNIQUE (campaign_id, date, channel)
- INDEX (campaign_id, date DESC)
```

#### `analytics_events`
Visitor events — partitioned by month, hot 30 days.
```yaml
- id, page_id FK, release_id? FK
- block_key?, element_key?            # vd "hero", "features[0]"
- visitor_id, session_id
- event_type: enum(
    'page_view','block_view','block_dwell','click','scroll_depth',
    'form_submit','cta_click','product_view','product_click'
  )
- action?, target?, dwell_ms?, scroll_depth?
- viewport_w, viewport_h
- referrer?, utm_source?, utm_medium?, utm_campaign?
- ip_country?, device_type: enum('desktop','mobile','tablet')
- user_agent_summary
- meta: jsonb
- occurred_at: timestamp

CONSTRAINTS:
- INDEX (page_id, occurred_at)
- INDEX (visitor_id, session_id)
- PARTITION BY RANGE (occurred_at)
```

#### `analytics_daily_aggregate`
Rolled-up daily metrics.
```yaml
- page_id FK, date
- block_key?                          # NULL = page-level
- page_views, unique_visitors: int
- block_views?, block_dwell_ms_total: bigint?
- clicks, conversions: int
- avg_scroll_depth: numeric?

CONSTRAINTS:
- PRIMARY KEY (page_id, date, COALESCE(block_key, ''))
- INDEX (page_id, date DESC)
```

---

### 4.7 AI (2 tables) ⭐

#### `ai_jobs`
Generic AI task tracker.
```yaml
- id, requested_by FK → users, brand_id? FK → brands
- job_type: enum(
    'template_draft',         # staff: gen template skeleton
    'slot_suggest',           # brand: AI fill slot
    'page_optimize',          # AI review page
    'image_generate'          # AI gen image
  )
- input_payload: jsonb
- output_payload: jsonb?
- status: enum('queued','running','succeeded','failed')
- cost_credits: int
- model: string                       # 'gpt-4', 'claude-sonnet'
- tokens_in, tokens_out: int?
- error_message: text?
- created_at, completed_at?

CONSTRAINTS:
- INDEX (brand_id, created_at DESC)
- INDEX (status, created_at) WHERE status IN ('queued', 'running')
```

#### `ai_slot_suggestions`
```yaml
- id, page_id FK → pages
- slot_key: string
- suggestion_text: text
- accepted: boolean?                  # null=pending
- ai_job_id: uuid FK → ai_jobs
- suggested_at, responded_at?

CONSTRAINTS:
- INDEX (page_id, slot_key)
```

---

### 4.8 Audit (1 table)

#### `activity_logs`
```yaml
- id, brand_id? FK, actor_id? FK → users
- action: string                      # 'page.publish', 'block.create', 'domain.verify'
- entity_type: string, entity_id: uuid
- metadata: jsonb                     # before/after, reason
- ip_address: inet?, user_agent?
- occurred_at: timestamp

CONSTRAINTS:
- INDEX (brand_id, occurred_at DESC)
- INDEX (entity_type, entity_id, occurred_at DESC)
- PARTITION BY RANGE (occurred_at)
```

---

## 5. Slot schema spec

### 5.1 `template_versions.slot_schema`

```json
{
  "schema_version": "1.0",
  "slots": [
    {
      "key": "headline",
      "type": "text",
      "label": "Tiêu đề chính",
      "required": true,
      "max_length": 100,
      "ai_assistable": true
    },
    {
      "key": "hero_image",
      "type": "image",
      "required": true,
      "aspect_ratio": "16:9",
      "min_width": 1200
    },
    {
      "key": "features",
      "type": "array",
      "max_items": 6,
      "item_schema": {
        "type": "object",
        "fields": [
          { "key": "icon", "type": "icon" },
          { "key": "label", "type": "text", "max_length": 50 },
          { "key": "body", "type": "richtext", "max_length": 300 }
        ]
      }
    },
    {
      "key": "products",
      "type": "product_ref_list",
      "max_items": 12
    }
  ]
}
```

### 5.2 Supported slot types

| Type | Storage | Use |
|---|---|---|
| `text`, `richtext` | string | headline, body |
| `url`, `email`, `phone` | string (validated) | links, contacts |
| `number`, `integer`, `boolean` | typed | counts, flags |
| `color` | `#rrggbb` | brand color |
| `icon` | string name | from icon library |
| `image`, `video` | uuid → media_assets | media slots |
| `gallery` | uuid[] | multi-image |
| `date`, `datetime` | ISO string | dates |
| `product_ref` / `product_ref_list` | uuid / uuid[] → products | product binding |
| `array` | array với `item_schema` | repeatable group |
| `object` | nested với `fields` | grouped fields |

### 5.3 `template_versions.canvas_blueprint`

Reference blocks + bind slot keys.

```json
{
  "schema_version": "1.0",
  "blocks": [
    {
      "instance_id": "b1",
      "block_id": "blk_hero_split_default",
      "slot_bindings": {
        "title":      {"$slot": "headline"},
        "subtitle":   {"$slot": "subheadline"},
        "cta_label":  {"$slot": "cta_label"},
        "cta_url":    {"$slot": "cta_url"},
        "image":      {"$slot": "hero_image"}
      },
      "override_settings": null
    },
    {
      "instance_id": "b2",
      "block_id": "blk_feature_grid_3col",
      "slot_bindings": {
        "items": {"$slot": "features"}
      }
    }
  ]
}
```

### 5.4 `pages.config_json` (filled instance) — lưu trong page_revisions

⭐ **Locale-wrapped values** ngay từ Phase 1 → multi-language Phase 2 không cần migration.

```json
{
  "headline":    { "vi": "Sum vầy ngày Tết" },
  "subheadline": { "vi": "Coca-Cola đồng hành" },
  "cta_label":   { "vi": "Đặt ngay" },
  "cta_url":     "https://shop.coca.vn",
  "hero_image":  "media_uuid_abc",
  "features": [
    {
      "icon":  "shield",
      "label": { "vi": "Chính hãng" },
      "body":  { "vi": "Phân phối trực tiếp..." }
    },
    {
      "icon":  "truck",
      "label": { "vi": "Giao nhanh" },
      "body":  { "vi": "Miễn phí 200k+" }
    }
  ],
  "products": ["prod_uuid_1", "prod_uuid_2"]
}
```

### 5.5 Locale wrapping rules

| Slot type | Wrap with locale? |
|---|---|
| `text`, `richtext` | ✅ **Wrap** `{vi: "...", en?: "...", ja?: "..."}` |
| `url`, `email`, `phone` | ❌ Không wrap — same across locales |
| `image`, `video`, `gallery` | ❌ Không wrap — media_asset_id same |
| `product_ref`, `product_ref_list` | ❌ Không wrap — id same |
| `color`, `icon`, `number`, `boolean` | ❌ Không wrap |
| `array` items | Wrap nested text fields theo rule trên |

**Phase 1 enforcement**:
- BE validator: all text/richtext slot values phải có ít nhất `vi` key
- FE form editor lưu input → wrap thành `{vi: input}` tự động
- Public render: resolve theo `Accept-Language` header, fallback `vi` (default locale)

**Phase 2 mở multi-lang**:
- Just add `en`, `ja`, … vào existing values
- BE expose `GET /v1/pages/{id}/translations` để brand add/edit locale variants
- KHÔNG cần migrate data — backward compat hoàn toàn

### 5.6 Block default locale

`block_types.props_schema` có field cần text → FE form generator auto-wrap với current user locale (default `vi` Phase 1):

```ts
// FE form submit handler
if (slot.type === 'text' || slot.type === 'richtext') {
  config_json[slot.key] = { vi: userInput };
} else {
  config_json[slot.key] = userInput;
}
```

---

## 6. ER diagram

```
USER (admin/staff)                  BRAND
  │ created_by                        │ 1—N
  │                                   ▼
  │                          ┌──────────────────┐
  │                          │   WORKSPACE      │
  │                          │   - is_default   │
  │                          └────┬─────────────┘
  │                               │ 1—N
  │ N—N via                       │
  │ brand_memberships             ▼
  │ (role: brand_admin/member)
  │                       ┌──────────────────────┐
  ├───────────────────────►       PAGE             │ ⭐
                          │  - type:              │   landing|ad|curate
                          │   'landing|ad|curate' │
                          │  - slug               │
                          │  - status             │
                          │  - template_version_id│──┐
                          │  - active_release_id  │  │
                          │  - ad_format?         │  │
                          │  - curate_trigger?    │  │
                          └─────┬─────────┬───────┘  │
                                │ 1—N    │ 1—N      │
                                ▼        ▼          │
                         ┌──────────┐ ┌──────────┐  │
                         │PAGE_REV  │ │PAGE_REL  │  │
                         │(rolling  │ │(immutable)│  │
                         │ 50)      │ │ - share_token│
                         └──────────┘ │ - is_active││
                                      └─────────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │TEMPLATE_VERSION │
                                          │ - slot_schema   │
                                          │ - canvas_blueprint│──┐
                                          └────────┬────────┘  │
                                                   │ N—1       │
                                                   ▼           │
                                          ┌────────────────┐   │
                                          │   TEMPLATE     │   │
                                          │ - target_page_type
                                          │   ('landing'|'ad' │
                                          │    |'curate')   │   │
                                          │ - scope         │   │
                                          └─────────────────┘   │
                                                                │ references
                                                                ▼
                                          ┌─────────────────────────────┐
                                          │ canvas_blueprint.blocks[]   │
                                          │  { block_id, slot_bindings, │
                                          │    override_settings }       │
                                          └────────────────┬────────────┘
                                                           │ block_id
                                                           ▼
                                          ┌─────────────────────┐
                                          │       BLOCKS         │
                                          │  - type_code         │
                                          │  - settings (jsonb)  │
                                          │  - scope             │
                                          │  - usage_count       │
                                          └──────────┬───────────┘
                                                     │ type_code
                                                     ▼
                                          ┌─────────────────────────┐
                                          │   BLOCK_TYPES (catalog) │
                                          │  - props_schema         │
                                          │  - supported_surfaces[] │ landing|ad|curate
                                          │  - min_dimensions?      │
                                          └─────────────────────────┘

  CUSTOM_DOMAIN ── 1 brand → N domains, 1 domain → 1 workspace (Phase 1 landing only)
  PRODUCT (brand catalog) — ref qua slot type 'product_ref'
  MEDIA_ASSET (brand) — ref qua slot type 'image'/'video'
  CAMPAIGN — standalone (Q8), không FK với Page
  ANALYTICS_EVENT — visitor events keyed by page_id + block_key
  AI_JOB — staff template_draft + brand slot_suggest
  ACTIVITY_LOG — audit
```

---

## 7. State machines

### 7.1 Page lifecycle (all 3 types)

```
(none) ──create from template──▶ DRAFT ─────publish────▶ PUBLISHED
                                   ▲                          │
                                   │ unpublish                │
                                   └──────────────────────────┘
                                   │                          │
                                   ▼ archive          archive ▼
                                  ARCHIVED ◀──────────────────┘
                                   │
                                   │ restore
                                   ▼
                                  DRAFT
```

Transitions theo type:

| Type | Publish action | Result |
|---|---|---|
| `landing` | Snapshot canvas → release. Generate share_token. Custom domain serves active_release. URL `coca.vn/{slug}` | URL live |
| `ad` | Snapshot canvas → release. BE render to PNG/MP4/HTML5. Available via `/v1/pages/{id}/export?format=` | Brand download, upload manual lên FB Ads |
| `curate` | Snapshot canvas → release. Generate embed_token. Embed snippet `<script>` available | Brand paste `<script>` vào landing/external |

### 7.2 CustomDomain lifecycle

```
PENDING ─add DNS─▶ VERIFYING ─DNS check ok─▶ VERIFIED ─provision TLS─▶ ACTIVE
                       │                                                  │
                       └────fail────▶ FAILED ◀──── retry                  │
                                                                          │
                                                          disable / expire│
                                                                          ▼
                                                                       DISABLED
```

### 7.3 AI Job lifecycle

```
queued → running → succeeded
                  ↘ failed
```

---

## 8. Workflows W1-W14

### W1 — Onboard new Brand
```
Actor: Admin
1. /admin/brands → "Create new brand"
2. POST /v1/brands {name, slug, contact_email, plan}
3. BE creates Brand + default Workspace (is_default=true) + ActivityLog
4. Admin invites brand_admin:
   POST /v1/brands/{id}/users {email, display_name, role: 'brand_admin'}
5. BE creates User + BrandMembership, sends email with temp password
6. Brand_admin logs in /portal → status='active'
```

### W2 — Staff creates new Template
```
Actor: Staff
1. /admin/templates → "Create template" → chọn target_page_type (landing/ad/curate)
2. Canvas builder loads ONLY blocks với supported_surfaces include target type
3. Drag blocks vào canvas, configure layout via override_settings
4. Modal "Define slots": add slot key + type + constraints
5. Preview với sample data
6. POST /v1/templates {slug, name, target_page_type, scope='public'}
7. POST /v1/templates/{id}/versions {slot_schema, canvas_blueprint}
8. PATCH /v1/templates/{id} {status='published'}
9. Template appears trong /v1/templates?target_page_type=...&scope=public
```

### W3 — Brand uses Template (Phase 1 admin assigns)
```
Actor: Admin
1. /admin/brands/{id} tab Pages → "Assign page"
2. Modal: chọn Template (filter by target_page_type), enter Page name + workspace
3. POST /v1/admin/pages/from-template {
     template_id, brand_id, workspace_id, name, handoff_notes
   }
4. BE:
   - Read template.current_version_id
   - Create Page {type=template.target_page_type, status='draft', template_version_id=current, config_json={}}
   - If type='ad' → set ad_format from template
   - If type='curate' → set curate_trigger from template
   - Create initial page_revision (rev_no=1)
   - ActivityLog + notification cho brand
5. Brand sees page trong /portal/{landing-pages|ads|curate}
```

### W4 — Brand edits Page (slot fill)
```
Actor: Brand_admin / brand_member
1. /portal/pages/{id}/edit
2. FE loads page + template_version (slot_schema)
3. FE renders form per slot type:
   - text → <input>
   - image → media picker
   - product_ref_list → product multi-select
   - array → repeatable group
4. User fills → autosave debounce 3s:
   POST /v1/pages/{id}/config {config_json, base_revision_no}
5. BE validates config against template_version.slot_schema
   - Invalid → 400 {errors: [{slot_key, message}]}
   - Conflict → 409 if base_revision_no stale
   - Else → create new page_revision (rev_no++)
   - Cleanup revisions > 50
6. FE shows "Saved ✓"
```

### W5 — AI suggest slot value
```
Actor: Brand
1. Click "✦ Suggest" next to slot in form editor
2. POST /v1/ai/slot-suggest {page_id, slot_key, context}
3. BE creates AIJob status='queued', enqueue LLM call
4. Worker: call Claude/GPT, write AIJob output + AISlotSuggestion rows
5. FE polls /v1/ai/jobs/{id} or SSE → show 3 suggestions
6. User accepts → update form + PATCH /v1/ai/slot-suggestions/{id} {accepted: true}
```

### W6 — Publish Page (validate flow)
```
Actor: Brand_admin (Phase 1: also Staff/Admin)
1. /portal/pages/{id}/edit → "Publish"
2. POST /v1/pages/{id}/publish/validate
3. BE validates:
   - All required slots filled
   - All media refs exist
   - All product refs exist (if freeze_products=true, snapshot them)
   - canvas_blueprint blocks all match page.type via supported_surfaces
4. If invalid → 400 {errors}
5. POST /v1/pages/{id}/publish {version_label?}
6. BE:
   - Snapshot current page_revision.config_json → page_release.config_snapshot
   - Resolve blocks (canvas_blueprint refs + block.settings) → canvas_blueprint_snapshot
   - If freeze_products → snapshot product data → product_snapshot
   - Type-specific:
     - landing → generate share_token, set is_active=true
     - ad → render dimensions, store in release
     - curate → generate curate_embed_token, set is_active=true
   - Update page: active_release_id, status='published'
   - ActivityLog: 'page.publish'
7. Return publish info per type (URL / export / embed snippet)
```

### W7 — Public visitor (landing type)
```
Actor: Anonymous
1. Visitor opens https://coca.vn/tet-2026
2. Edge router resolve Host → CustomDomain → workspace_id
3. Lookup Page WHERE workspace_id AND type='landing' AND slug='tet-2026'
4. Check status='published' + active_release
5. Render HTML from active_release.canvas_blueprint_snapshot + config_snapshot
6. FE fires analytics: page_view, block_view (IntersectionObserver), click, scroll
7. POST /v1/analytics/events (batched)
```

### W8 — Brand sees analytics
```
Actor: Brand
1. /portal/pages/{id}/analytics
2. GET /v1/pages/{id}/analytics/summary?range=7d → page_views, conversions, ...
3. GET /v1/pages/{id}/analytics/blocks?range=7d → per-block views/dwell/clicks/sparkline
4. FE renders dashboard
```

### W9 — Setup Custom Domain
```
Actor: Brand_admin (landing pages only)
1. /portal/profile/domains → "Add domain"
2. Enter "coca.vn"
3. POST /v1/brands/{id}/domains {domain, workspace_id}
4. BE creates CustomDomain status='pending', returns DNS records to add
5. UI shows: CNAME @ → edge.rexer-edge.com, TXT _rexer-verify → token
6. Brand adds DNS records
7. Click "Verify" → POST /v1/brands/{id}/domains/{id}/verify
8. BE cron (every 5min) checks DNS → status='verified' → provision TLS → status='active'
9. Brand publishes landing → URL https://coca.vn/{slug}
```

### W10 — Block CRUD
```
Actor: Staff / Brand
A. Create from scratch:
   POST /v1/blocks {type_code, name, settings, brand_id, scope}
   - BE validates settings against block_types.props_schema
B. Clone:
   POST /v1/blocks/{id}/clone → copy với source_block_id ref
C. Save from canvas builder:
   POST /v1/blocks với settings hiện tại của instance
D. Edit:
   PATCH /v1/blocks/{id} {settings}
   - Re-validate, update timestamp
   - KHÔNG retro-update templates (snapshot tại publish time)
E. Use trong template:
   FE thêm vào canvas_blueprint.blocks[]:
     {instance_id, block_id, slot_bindings: {}}
   POST /v1/blocks/{id}/use → ++ usage_count
F. Delete:
   DELETE /v1/blocks/{id} → soft delete archived_at
   - Published templates unaffected (snapshot)
   - Draft templates: UI warning "block archived"
```

### W11 — Campaign tracking
```
Actor: Brand_admin
1. /portal/campaigns → "New campaign"
2. POST /v1/campaigns {name, objective, channels, budget, kpis, tracked_url}
3. Brand paste tracked_url vào ad platform
4. Daily sync job:
   POST /v1/campaigns/{id}/metrics/import {date, channel, data}
5. Dashboard /portal/campaigns/{id} → impressions/clicks/spent/conversions
```

### W12 — Archive + Restore
```
1. POST /v1/pages/{id} → archive (soft) — set status='archived', archived_at=now()
   - All releases → is_active=false → URL 410 Gone
2. POST /v1/pages/{id}/restore → status='draft' (không auto-republish)
3. Phase 2: hard-delete cron 90 ngày
```

### W13 — Staff tạo Ad page ⭐
```
Actor: Staff
1. /admin/templates → "Create template" → target_page_type='ad'
2. Pick ad format: 'facebook_feed' / 'banner_728x90' / ...
3. Canvas builder load ONLY ad-surface blocks
4. Drag ad-blocks: image_banner, cta_button, headline_overlay
5. Define slots (ad_headline, ad_image, ad_cta_url)
6. Save Template với ad_format embed trong target_page_type metadata
7. Brand chooses template → create Page with type='ad', ad_format inherits
8. Brand fills slot → BE validates dimensions match ad_format
9. Publish → BE renders PNG/MP4 → store trong release
10. Brand /portal/pages/{id} → "Download export" → upload thủ công lên FB Ads
```

### W14 — Brand tạo Curate widget ⭐
```
Actor: Brand_admin
1. /portal/curate → "Create widget"
2. Pick widget type: 'popup_lead_form' / 'exit_intent' / 'quiz'
3. Choose trigger: 'exit_intent' / 'time_on_page' / 'scroll_50'
4. Configure trigger params (delay_ms=3000)
5. Form editor fill slot (headline, fields, CTA)
6. Publish → BE generates curate_embed_token + snippet
7. UI displays snippet code:
   <script src="https://cdn.rexer.com/curate.js"
           data-curate-id="page_xyz" data-token="t_abc"></script>
8. Brand pastes vào landing (Rexer hoặc external WordPress/Shopify)
9. Visitor browse → trigger fired → widget renders → interact → form submit
10. /portal/curate/{id}/analytics shows funnel: trigger_fired → opened → submitted
```

---

## 9. URL + namespace conventions

### 9.1 Frontend routes

```
/sign-in, /sign-up                  Auth

# Admin (admin/staff)
/admin                              Overview
/admin/brands                       List brands (was /admin/users)
/admin/brands/{id}                  Brand detail tabs
/admin/templates                    Template catalog (filter target_page_type)
/admin/templates/{id}               Detail + versions
/admin/canvas-builder/{tplVerId}    Canvas builder (template authoring)
/admin/pages/{id}                   Admin view of any page
/admin/block-library                Block library + types catalog
/admin/products, /admin/users
/admin/ai-studio                    AI job tracker

# Portal (brand_user)
/portal                             Dashboard
/portal/landing-pages               type='landing' pages (Page list)
/portal/landing-pages/{id}/edit     Slot form editor
/portal/landing-pages/{id}/preview
/portal/landing-pages/{id}/analytics
/portal/ads                         type='ad' pages list
/portal/ads/{id}/edit
/portal/ads/{id}/export             Download PNG/MP4
/portal/curate                      type='curate' pages list
/portal/curate/{id}/edit
/portal/curate/{id}/embed           Show snippet code
/portal/templates                   Browse catalog
/portal/blocks                      Brand block library
/portal/media, /portal/products
/portal/campaigns                   Ad campaign metric tracking
/portal/profile/domains             Custom domain mgmt
/portal/profile                     Brand info + members

# Public
/p/{landing_slug}/{share_token}     Default Rexer URL (landing only)
https://{custom_domain}/{slug}      Custom domain landing
https://cdn.rexer.com/curate.js     Curate loader
```

### 9.2 API namespaces

```
/v1/auth/*                          Login, register, me
/v1/me                              Current user
/v1/me/brands                       My brand memberships

/v1/brands/*                        Brand CRUD (admin scope)
/v1/brands/{id}/users               Members
/v1/brands/{id}/workspaces          Workspaces
/v1/brands/{id}/domains             Custom domains
/v1/brands/{id}/saved-blocks        Removed — use /v1/blocks?brand_id=
/v1/brands/{id}/products            Brand products
/v1/brands/{id}/media               Brand media

/v1/block-types/*                   System catalog (admin manage)
/v1/blocks/*                        Block CRUD with scope filter

/v1/templates/*                     Template catalog
/v1/templates/{id}/versions         Version snapshots

/v1/workspaces/{wsId}/pages         List pages (filter by type)
/v1/pages/{id}                      Page detail
/v1/pages/{id}/config               Autosave revision
/v1/pages/{id}/revisions
/v1/pages/{id}/publish, /unpublish
/v1/pages/{id}/releases
/v1/pages/{id}/export?format=       (ad type only)
/v1/pages/{id}/embed-snippet        (curate type only)
/v1/pages/{id}/analytics/*

/v1/admin/pages/from-template       Admin assigns page

/v1/workspaces/{wsId}/campaigns
/v1/campaigns/{id}/metrics

/v1/media/uploads/*                 Upload flow
/v1/analytics/events                Public ingest

/v1/ai/*                            AI jobs

/v1/public/pages/by-domain/{host}/{slug}    Internal — edge router
/v1/public/curate/{id}?token=               Curate widget render
```

---

## 10. API surface — resource-nested REST

```
# Brands (admin scope)
GET    /v1/brands?status=&q=&page=&limit=
POST   /v1/brands
GET    /v1/brands/{id}
PATCH  /v1/brands/{id}
DELETE /v1/brands/{id}                      # soft archive

GET    /v1/brands/{id}/users
POST   /v1/brands/{id}/users
PATCH  /v1/brands/{id}/users/{userId}       # change role
DELETE /v1/brands/{id}/users/{userId}

GET    /v1/brands/{id}/workspaces
POST   /v1/brands/{id}/workspaces
PATCH  /v1/brands/{id}/workspaces/{wsId}
DELETE /v1/brands/{id}/workspaces/{wsId}

GET    /v1/brands/{id}/domains
POST   /v1/brands/{id}/domains
POST   /v1/brands/{id}/domains/{domainId}/verify
DELETE /v1/brands/{id}/domains/{domainId}

# Block types (admin manage)
GET    /v1/block-types?surface=&category=
GET    /v1/block-types/{code}
POST   /v1/admin/block-types
PATCH  /v1/admin/block-types/{code}
DELETE /v1/admin/block-types/{code}

# Blocks (CRUD with scope filter)
GET    /v1/blocks?scope=&type_code=&brand_id=&surface=&tag=&q=
POST   /v1/blocks
GET    /v1/blocks/{id}
PATCH  /v1/blocks/{id}
DELETE /v1/blocks/{id}
POST   /v1/blocks/{id}/clone
POST   /v1/blocks/{id}/use

# Templates
GET    /v1/templates?target_page_type=&scope=&category=&q=
POST   /v1/templates
GET    /v1/templates/{id}
PATCH  /v1/templates/{id}
DELETE /v1/templates/{id}
GET    /v1/templates/{id}/versions
POST   /v1/templates/{id}/versions
GET    /v1/templates/{id}/versions/{versionId}

# Pages (3 types unified)
GET    /v1/workspaces/{wsId}/pages?type=&status=&q=
POST   /v1/workspaces/{wsId}/pages       # body: {type, template_id, name}
GET    /v1/pages/{id}
PATCH  /v1/pages/{id}                    # rename, freeze_products
DELETE /v1/pages/{id}                    # archive
POST   /v1/pages/{id}/restore

POST   /v1/pages/{id}/config             # autosave revision
GET    /v1/pages/{id}/revisions
POST   /v1/pages/{id}/revisions/{revNo}/revert

POST   /v1/pages/{id}/publish/validate
POST   /v1/pages/{id}/publish
POST   /v1/pages/{id}/unpublish
GET    /v1/pages/{id}/releases
GET    /v1/pages/{id}/releases/{releaseId}
POST   /v1/pages/{id}/releases/{releaseId}/activate    # rollback

GET    /v1/pages/{id}/export?format=     # ad type — PNG/MP4/HTML
GET    /v1/pages/{id}/embed-snippet      # curate type

GET    /v1/pages/{id}/analytics/summary?range=
GET    /v1/pages/{id}/analytics/blocks?range=

POST   /v1/admin/pages/from-template     # admin assign

# Products
GET    /v1/brands/{id}/products?status=&q=
POST   /v1/brands/{id}/products
GET    /v1/products/{id}
PATCH  /v1/products/{id}
DELETE /v1/products/{id}

# Media
GET    /v1/brands/{id}/media?folder_id=&type=
POST   /v1/media/uploads/init
PUT    /v1/media/uploads/{uploadId}/raw
POST   /v1/media/uploads/complete
GET    /v1/media/{id}
DELETE /v1/media/{id}

GET    /v1/brands/{id}/media-folders
POST   /v1/brands/{id}/media-folders
PATCH  /v1/media-folders/{id}
DELETE /v1/media-folders/{id}

# Campaigns
GET    /v1/workspaces/{wsId}/campaigns
POST   /v1/workspaces/{wsId}/campaigns
GET    /v1/campaigns/{id}
PATCH  /v1/campaigns/{id}
DELETE /v1/campaigns/{id}
GET    /v1/campaigns/{id}/metrics
POST   /v1/campaigns/{id}/metrics/import

# AI
POST   /v1/ai/template-draft
POST   /v1/ai/slot-suggest
POST   /v1/ai/page-optimize
POST   /v1/ai/image-generate
GET    /v1/ai/jobs/{id}
PATCH  /v1/ai/slot-suggestions/{id}      # accept/reject

# Analytics ingest (public, no auth)
POST   /v1/analytics/events
POST   /v1/track

# Public render (edge)
GET    /v1/public/pages/by-domain/{host}/{slug}    # landing routing
GET    /v1/public/curate/{id}?token=               # curate widget data

# Activity audit
GET    /v1/brands/{id}/activity?entity_type=&from=&to=
```

---

## 11. Custom Domain provisioning (landing type only)

### 11.1 Infrastructure required

- **Wildcard DNS**: `*.rexer-edge.com` → load balancer IP
- **TLS provider**: Caddy auto-cert OR Cloudflare for SaaS API
- **Edge router**: Caddy / NGINX / Cloudflare Worker — route by Host header

### 11.2 BE responsibilities

1. Domain CRUD + status state machine
2. Verification cron: poll DNS every 5 min for `verifying` domains
3. TLS provisioning when verified
4. Edge routing config: domain → workspace mapping
5. Renewal cron: monitor `tls_expires_at`, renew 30 days before

### 11.3 DNS records brand adds

```
For "coca.vn":
  CNAME    @           edge.rexer-edge.com.
  TXT      _rexer-verify.coca.vn    "rexer-verify=token_abc123"

For "campaigns.coca.vn":
  CNAME    campaigns    edge.rexer-edge.com.
  TXT      _rexer-verify.campaigns.coca.vn    "rexer-verify=token_xyz"
```

### 11.4 Edge routing

```
Request: GET https://coca.vn/tet-2026
         Host: coca.vn

Edge:
  1. Lookup CustomDomain WHERE domain='coca.vn' AND status='active'
     → workspace_id
  2. Lookup Page WHERE workspace_id AND type='landing' AND slug='tet-2026'
  3. If status!='published' → 404
  4. Serve cached active_release content
  5. Inject analytics tracker → POST /v1/analytics/events
```

---

## 12. Analytics data flow

### 12.1 Ingestion

```
Visitor → FE tracker → batch every 5s/10events
  ↓
POST /v1/analytics/events (anti-abuse rate limit by IP)
  ↓
BE writes to analytics_events (partitioned monthly)
  ↓
Async stream → message queue (Kafka/SQS)
  ↓
Stream processor → enrichment (geoip, UA parse)
```

### 12.2 Aggregation

```
Cron daily 1:00 AM:
  - Compute daily aggregates per page × date
  - Compute per page × block_key × date
  - Upsert analytics_daily_aggregate

Cron weekly:
  - Archive events > 30 days to cold storage (S3 Parquet)
  - DROP partition
```

### 12.3 Query patterns

| Use case | Source | Latency |
|---|---|---|
| Dashboard 7d | `analytics_daily_aggregate` | < 50ms |
| Block breakdown | aggregate with `block_key` filter | < 100ms |
| Real-time 5min | `analytics_events` hot partition | < 200ms |
| Historical raw | Cold storage Parquet | < 5s |

---

## 13. AI integration

### 13.1 Staff workflows

- **Template draft from prompt**: AI generates slot_schema + canvas_blueprint skeleton
- **Template optimize**: AI suggests adding slots, improving layout

### 13.2 Brand workflows

- **Slot suggest**: ✦ icon next to slot → 3 AI suggestions
- **Slot all-fill**: "Generate full page" — AI fills all slots
- **Image generate**: For `image` slot, AI generates instead of upload
- **Page optimize**: AI reviews filled page, suggests improvements

### 13.3 Cost tracking

Each AIJob persists `tokens_in/out` + `cost_credits`. Brand has `ai_credit_balance` (Phase 2). Phase 1 free with 100 jobs/day/brand cap.

---

## 14. Naming glossary

| Term | Definition | BE table |
|---|---|---|
| **Brand** | Doanh nghiệp tenant | `brands` |
| **Workspace** | Sub-folder trong brand | `workspaces` |
| **User** | Người dùng auth (admin/staff) | `users` |
| **Brand membership** | N-N user × brand × role | `brand_memberships` |
| **Block type** | System catalog của built-in types với props_schema + supported_surfaces | `block_types` |
| **Block** | Instance entity với settings (layout/motion/style), CRUD đầy đủ | `blocks` |
| **Template** | Catalog blueprint (public hoặc brand_private) — build 1 target_page_type | `templates` |
| **Template version** | Immutable snapshot của template (slot_schema + canvas_blueprint) | `template_versions` |
| **Page** | Brand's deployable page với type discriminator | `pages` |
| **Page type** | `'landing'` / `'ad'` / `'curate'` — chứa fields type-specific | (column) |
| **Page revision** | Autosave rolling 50 versions | `page_revisions` |
| **Page release** | Immutable snapshot khi publish | `page_releases` |
| **Slot** | Field trong template_version.slot_schema | (column) |
| **Slot binding** | Mapping slot key → block prop trong canvas_blueprint | (column) |
| **Product** | Brand catalog item | `products` |
| **Media asset** | File upload | `media_assets` |
| **Media folder** | Tổ chức assets | `media_folders` |
| **Custom domain** | Brand domain → workspace mapping (landing only) | `custom_domains` |
| **Campaign** | Standalone ad tracking | `campaigns` |
| **Analytics event** | Visitor interaction raw | `analytics_events` |
| **Daily aggregate** | Rolled-up analytics | `analytics_daily_aggregate` |
| **AI job** | LLM task tracker | `ai_jobs` |
| **Activity log** | Audit log | `activity_logs` |

---

## 15. Phase 1 ship list vs Phase 2

### Phase 1 (target ship)

✅ Brand + Workspace + User + Membership (2 roles: brand_admin / brand_member)
✅ BlockType catalog (3 surfaces, ~25 types)
✅ Block CRUD (system + brand_private scopes) với settings validation
✅ Template + TemplateVersion (target_page_type='landing'|'ad'|'curate')
✅ Page entity unified (3 types) + revisions (rolling 50) + releases (immutable)
✅ Slot-fill form editor (brand UI cho cả 3 type)
✅ Canvas builder (staff UI để tạo template + block)
✅ Landing publish → custom domain serves
✅ Ad publish → export PNG (Phase 1) — MP4/HTML5 Phase 2
✅ Curate publish → embed snippet + curate.js loader
✅ Media + Folders + SHA-256 dedupe
✅ Products (CRUD + ref qua slot type 'product_ref')
✅ Page-level + block-level Analytics (3 types)
✅ AI: template draft (staff) + slot suggest (brand)
✅ ActivityLog audit
✅ Custom domain (landing only)
✅ Campaign + metric import (ad platform sync)

### Phase 2 deferred

- Template scope='brand_private' UI cho brand
- Brand sub-roles `brand_editor` / `brand_viewer`
- A/B testing trên Release
- Multi-language slot values
- Hard-delete cron 90 ngày
- Brand self-serve template creation
- AI image generate + page optimize
- Realtime collab (presence indicator)
- Block scope 'brand_team' / 'brand_public'
- Ad MP4 + HTML5 banner export
- Subdomain alternative URL (`{brand_slug}.rexer.com`)

### Phase 3+

- Multi-region replication
- Advanced A/B testing (multi-arm bandit)
- Plugin API for custom block types

---

## 16. Trade-off decisions

| Decision | Lợi | Hại |
|---|---|---|
| Q1 Slot-fill model | Simple form UI cho brand, schema-bound validate | Mất design freedom — brand không drag-drop |
| Q5 Rolling 50 + releases | Undo chi tiết + rollback dễ | Storage cost cho revisions |
| Q4 Custom domain Phase 1 | Brand-first UX, professional | BE +1.5w infra (TLS, DNS check, edge routing) |
| Q11 Page+block analytics | Dual-tier insight | Events nặng → partition + cold archive |
| Q10 AI both sides | Powerful Day-1 | Cost + abuse risk → quota cap |
| Q12 Multi-surface block | Reuse cao (CTA Button shared) | Block render engine handles 3 contexts |
| Q13 Page unified | 1 entity, lifecycle nhất quán | Nullable type-specific fields → schema "messy" |
| Q14 Full Phase 1 | Day-1 ecosystem ready | +4 weeks BE vs landing-only Phase 1 |

---

## 17. Sprint plan (15 sprints, ~10 weeks với 2 BE parallel)

| Sprint | Deliverable | Effort |
|---|---|---|
| S1 | Schema design + migrations + seed (block_types 3 surfaces, ~25 types) + **RLS policies** ⭐ + **API versioning middleware** ⭐ | 1.5 weeks |
| S2 | Auth + Brand + Workspace + User + Membership CRUD | 1 week |
| S3 | BlockType catalog + Block CRUD + props validator | 1 week |
| S4 | Template + TemplateVersion + slot_schema + canvas_blueprint validator | 1 week |
| S5 | Page entity (3 types) + revisions + releases lifecycle | 1.5 weeks |
| S6 | Landing publish flow + slot fill form editor (FE/BE) | 1.5 weeks |
| **S7** ⭐ | Ad publish flow + PNG export rendering | 1.5 weeks |
| **S8** ⭐ | Curate publish flow + embed snippet + curate.js cross-origin loader | 1.5 weeks |
| S9 | Custom Domain + DNS verify + TLS auto-provision + edge routing | 1.5 weeks |
| S10 | Media upload (3-step) + Product CRUD + bind refs | 1 week |
| S11 | Analytics ingestion + aggregation cron + dashboard endpoints (3 types) | 1.5 weeks |
| S12 | AI integration (job queue + slot suggest + template draft) | 1 week |
| S13 | Campaign + metric import + ActivityLog | 0.5 week |
| S14 | Testing + load test + bug fix | 1 week |
| S15 | Production deploy + monitoring + runbook | 0.5 week |

**Total**: ~16.5 weeks BE solo, **~10 weeks với 2 BE parallel** (S1-S5 cùng làm core, S6-S15 split: BE1 publish flows + custom domain, BE2 editors + analytics + AI). +0.5 week vs original cho RLS + API versioning hardening (§19-20).

---

## 18. Seed data — `block_types` catalog (Phase 1)

### Landing surface (~14 types)
```
hero_split          — Tiêu đề + ảnh chia đôi, CTA + stats
hero_overlay        — Ảnh nền full + tag + CTA
feature_section     — 3 cột feature icon + label + body
feature_grid        — Lưới 2/3/4 cột
photo_gallery       — Grid ảnh mosaic + lightbox
booking_form        — Form thu lead
cta_section         — Khối CTA cuối trang
image_carousel      — Carousel ngang
stories             — Instagram-style slides
split_screen        — 2 tab view chia đôi
quiz                — Quiz tương tác
poll                — Bình chọn
carousel_3d         — Coverflow 3D
flipbook            — Lật trang
panorama            — Ảnh 360°
```

### Ad surface (~6 types)
```
ad_banner_728x90              — Leaderboard
ad_banner_300x250             — Medium rectangle
ad_facebook_feed_1200x628
ad_instagram_square_1080x1080
ad_story_1080x1920
ad_youtube_thumbnail_1280x720
```

### Curate surface (~5 types)
```
popup_lead_form               — Email/phone capture
exit_intent_offer             — Last-chance discount
quiz_modal                    — Personality quiz
voting_widget                 — Vote A/B
floating_cta_button           — Sticky CTA
```

### Multi-surface blocks
```
cta_button              supported_surfaces=['landing','ad','curate']
headline_overlay        supported_surfaces=['landing','ad']
product_card            supported_surfaces=['landing','ad']
```

---

## 19. Multi-tenancy isolation — Postgres RLS ⭐

Defense-in-depth: ngoài BE handler filter `WHERE brand_id = $ctx`, enable **Row Level Security** ở DB level để tránh tenant leak nếu BE code có bug.

### 19.1 RLS setup per multi-tenant table

```sql
-- 1. Enable RLS trên mọi bảng brand-scoped
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_aggregate ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_slot_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_memberships ENABLE ROW LEVEL SECURITY;

-- 2. Policy: brand_user chỉ thấy row có brand_id matching context
CREATE POLICY tenant_isolation_pages ON pages
  FOR ALL
  USING (
    brand_id = current_setting('app.brand_id', true)::uuid
    OR current_setting('app.role', true) IN ('admin', 'staff')
  );

-- (Tương tự cho mọi table)

-- 3. Public/system rows
CREATE POLICY system_blocks_readable ON blocks
  FOR SELECT
  USING (scope = 'system' OR brand_id = current_setting('app.brand_id', true)::uuid);

CREATE POLICY public_templates_readable ON templates
  FOR SELECT
  USING (scope = 'public' OR owner_brand_id = current_setting('app.brand_id', true)::uuid);
```

### 19.2 BE set context per request

```go
// pseudo-code Go BE
func authMiddleware(c echo.Context) error {
    session := validateCookie(c)
    db := c.Get("db").(*sql.DB)

    // Set context vars per connection
    db.Exec("SET LOCAL app.brand_id = $1", session.BrandID)
    db.Exec("SET LOCAL app.user_id = $1", session.UserID)
    db.Exec("SET LOCAL app.role = $1", session.Role)

    return next(c)
}
```

### 19.3 Admin bypass

`role IN ('admin', 'staff')` trong policy cho phép admin xem all brands — đủ cho ops/support.

### 19.4 Cost vs benefit

- **Cost**: +1 sprint setup (15 tables × 1-2 policies + integration test)
- **Benefit**: bug-resistant tenant isolation, audit comply, defense-in-depth

→ **Strongly recommended Phase 1** vì cost thấp + giảm risk leak nghiêm trọng.

---

## 20. API versioning + deprecation policy ⭐

### 20.1 Versioning scheme

- All public endpoints `/v1/...` prefix
- Breaking changes → ship `/v2` parallel với `/v1` for 6 tháng
- `/v1` deprecation announcement có sunset date 12 tháng trước remove
- Non-breaking additions (new field, new endpoint) → `/v1` stays

### 20.2 Deprecation headers

BE return headers cho deprecated endpoints:

```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Wed, 31 Dec 2026 23:59:59 GMT
Link: </v2/pages/{id}>; rel="successor-version"
Warning: 299 - "Endpoint deprecated, migrate to /v2/pages/{id}"
```

### 20.3 Changelog endpoint

```
GET /v1/_meta/changelog
GET /v1/_meta/changelog/{version}
```

Returns:
```json
{
  "current_version": "v1.4.2",
  "released_at": "2026-05-23T...",
  "changes": [
    {"type": "added", "path": "/pages/{id}/export", "since": "v1.4.0"},
    {"type": "deprecated", "path": "/legacy/...", "sunset": "2026-12-31"}
  ]
}
```

### 20.4 Client version pinning

Optional header để FE pin API version:

```http
GET /v1/pages/123
Rexer-API-Version: 2026-05-23
```

→ BE response shape locked to that date. Default = latest stable.

### 20.5 Implementation cost

- Headers + middleware: ~0.5 day BE
- Changelog endpoint: ~0.5 day BE
- Doc + announcement process: PM owns

→ **Recommend Phase 1** — adopt từ Day-1 rẻ, làm sau khó.

---

## 21. Open questions cho BE

1. **Storage backend**: S3-compatible (Cloudflare R2 / Backblaze B2)? CDN provider?
2. **TLS provider**: Caddy auto-cert (self-host) hay Cloudflare for SaaS?
3. **Message queue**: Kafka, NATS, SQS, hay Postgres LISTEN/NOTIFY?
4. **Analytics cold storage**: S3 Parquet + Athena hay ClickHouse?
5. **Rate limit infra**: Redis-based?
6. **Ad rendering engine**: Headless Chrome (Puppeteer) cho PNG/MP4 export?
7. **Curate cross-origin**: CSP allow `https://cdn.rexer.com`? Whitelist embed?
8. **UUID strategy**: v7 time-sortable recommended?
9. **Idempotency keys**: cho POST publish, domain.verify?
10. **Multi-region**: Phase 1 single region (VN) confirmed?

---

## 22. Migration mapping từ schema hiện tại

(FE internal reference — không gửi BE)

| Current | Clean | Action |
|---|---|---|
| `clients` table | `brands` | Rename |
| `client_user` role | `brand_admin`/`brand_member` | Migrate + split |
| `canvas_templates` | DROP — concept gộp vào `templates` + `pages` | Migration script |
| `projects` | DROP — gộp vào `pages` với type='landing' | Already removed |
| `releases` (project-based) | `page_releases` | Restructure |
| `templates` (current) | `templates` (canonical) | Add target_page_type, slot_schema, canvas_blueprint via template_versions |
| `saved_blocks` | DROP — gộp vào `blocks` với scope='brand_private' | Migration |

---

## 23. Contact

- **Doc author**: @Lantm (FE owner, `lantm.tekup@gmail.com`)
- **Decision authority**: PM + BE squad lead
- **Doc version**: Final v1.0 (gộp v1.0 + v1.1)
- **Decision deadline**: trước khi BE start S1 schema migration
- **Supersedes**:
  - `rexer-architecture-clean-design-2026-05-23.md`
  - `rexer-architecture-v1.1-page-unified.md`
  - All prior `docs/be-*` design discussion docs

---

**Doc này là source of truth duy nhất — đọc + phản hồi đây, không cần xem các doc cũ.**
