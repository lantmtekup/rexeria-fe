# Rexer Architecture — Clean Design v1.0

> **Date**: 2026-05-23
> **Status**: 🟢 **Source of truth** — BE thiết kế DB từ đầu theo doc này, FE refactor sau
> **Audience**: BE squad (DB design) + PM + FE owner
> **Scope**: Phase 1 (managed-service) + Phase 2 hooks (self-serve, AI, analytics drill-down)
> **Supersedes**: All previous architecture docs in `docs/` — này là bản canonical

---

## 1. Executive summary

Rexer = platform giúp brand publish landing pages cho campaign marketing, vận hành theo mô hình **managed service ở Phase 1** (Rexer staff thiết kế template, brand fill slot + publish, AI hỗ trợ cả 2 bên).

### 11 quyết định cốt lõi (đã chốt)

| # | Decision | Choice |
|---|---|---|
| Q1 | Customization model | **Template + slot-fill** (Linktree-style, không phải Webflow) |
| Q2 | Template ownership | **Public + brand-private** (`scope: 'public'│'brand_private'`) |
| Q3 | Workspace | **Có** — Brand → Workspace → Landing |
| Q4 | Public URL | **Custom domain Phase 1** (brand map `coca.vn` → landing) |
| Q5 | Versioning | **Rolling 50 revisions + immutable releases khi publish** |
| Q6 | i18n | **Single-language (VI) Phase 1** |
| Q7 | Brand roles | **2 levels**: `brand_admin` (full) / `brand_member` (no billing/invite) |
| Q8 | Campaign | **Standalone entity** (ads tracking) — không FK với Landing |
| Q9 | Product binding | **Hybrid** — per-landing flag `freeze_products: bool` |
| Q10 | AI | **Cả 2 phía** — staff dùng AI tạo template + brand dùng AI suggest slot |
| Q11 | Analytics | **Page-level + block-level** (dual-tier) |

### Implication chính cho brand UX

- **Brand KHÔNG có canvas drag-drop editor** — chỉ form-based editor với fields theo template schema
- **Rexer staff CÓ canvas editor** — dùng để tạo Template blueprint, không cho brand thấy
- **Custom domain Phase 1** — brand map `coca.vn` → landing với DNS verification + auto TLS

---

## 2. Personas + Permissions matrix

| Persona | Đăng nhập | Phạm vi | Quyền chính |
|---|---|---|---|
| **Rexer Admin** | `/admin` | Toàn hệ thống | All — manage brands, users, templates, billing, infra |
| **Rexer Staff** | `/admin` | Tenants được assign | Build templates, assign landings cho brand, support |
| **Brand Admin** | `/portal?ws=...` | 1 brand | All actions của brand: invite member, edit landing, publish, manage domain, billing |
| **Brand Member** | `/portal?ws=...` | 1 brand | Edit landing draft, không publish, không invite, không billing |
| **Public Visitor** | `/p/...` hoặc custom domain | Public published landings | Read-only, fire analytics events |

### Permission matrix (Phase 1)

| Action | Admin | Staff | Brand_Admin | Brand_Member | Public |
|---|:---:|:---:|:---:|:---:|:---:|
| Create Brand | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Brand profile | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invite brand user | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Workspace | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create public Template | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create brand_private Template | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Landing (from template) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit Landing draft | ✅ | ✅ | ✅ | ✅ | ❌ |
| Publish Landing | ✅ | ✅ | ✅ | ❌ | ❌ |
| Archive Landing | ✅ | ✅ | ✅ | ❌ | ❌ |
| Map Custom Domain | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| Read published Landing | — | — | — | — | ✅ |

---

## 3. Domain model — 18 entities

### 3.1 Auth + Tenancy

#### `User`
Người dùng auth.
```yaml
- id: uuid
- email: string (unique)
- password_hash: string
- display_name: string
- avatar_url: string?
- role: enum('admin', 'staff')   # KHÔNG có brand role ở đây — brand role lưu ở BrandMembership
- status: enum('active', 'pending', 'disabled')
- last_login_at: timestamp?
- created_at, updated_at
```

#### `Brand`
Tenant cao nhất — doanh nghiệp.
```yaml
- id: uuid
- slug: string (unique, immutable)   # "coca-cola"
- name: string                        # "Coca-Cola Vietnam"
- legal_name: string?
- contact_email: string
- contact_phone: string?
- country_code: string?
- industry: string?
- logo_asset_id: uuid? → MediaAsset
- status: enum('active', 'pending', 'suspended')
- plan: string ('phase1_managed' | 'phase2_self_serve' | ...)
- storage_quota_gb: int
- storage_used_gb: numeric
- created_by: uuid → User
- created_at, updated_at
```

#### `Workspace`
Sub-folder bên trong brand.
```yaml
- id: uuid
- brand_id: uuid → Brand
- slug: string                        # "marketing-team"
- name: string                        # "Marketing Team"
- is_default: boolean                 # 1 brand có ≥1 workspace, mặc định 1
- created_by: uuid → User
- created_at, updated_at

CONSTRAINTS:
- UNIQUE (brand_id, slug)
- Mỗi brand có đúng 1 workspace với is_default=true
```

#### `BrandMembership`
N-N giữa User và Brand. User có thể thuộc nhiều brand (vd agency manage nhiều client).
```yaml
- id: uuid
- brand_id: uuid → Brand
- user_id: uuid → User
- role: enum('brand_admin', 'brand_member')
- joined_at: timestamp
- last_seen_at: timestamp?
- invited_by: uuid? → User

CONSTRAINTS:
- UNIQUE (brand_id, user_id)
- Mỗi brand có ≥1 brand_admin
```

---

### 3.2 Content — Template + Landing

#### `Template`
Blueprint trong catalog. Có 2 scope: public (mọi brand thấy) hoặc brand_private (1 brand thấy).

```yaml
- id: uuid
- slug: string (unique)               # "landing-hero-v1"
- name: string                        # "Landing Hero v1"
- description: string?
- category: enum('landing', 'event_rsvp', 'product_showcase', 'lead_gen', ...)
- tags: text[]
- thumbnail_asset_id: uuid? → MediaAsset
- scope: enum('public', 'brand_private')
- owner_brand_id: uuid? → Brand       # NOT NULL nếu scope = brand_private
- created_by: uuid → User
- status: enum('draft', 'published', 'archived')
- current_version_id: uuid? → TemplateVersion
- created_at, updated_at

CONSTRAINTS:
- scope='brand_private' ⇒ owner_brand_id IS NOT NULL
- scope='public' ⇒ owner_brand_id IS NULL
- UNIQUE (owner_brand_id, slug)        # slug unique within scope
```

#### `TemplateVersion`
Immutable snapshot của Template — khi publish Template thì sinh version. Landing lock vào 1 version cụ thể.

```yaml
- id: uuid
- template_id: uuid → Template
- version_no: int                     # 1, 2, 3, ...
- version_label: string?              # "v1.0", "v2.1" optional
- slot_schema: jsonb                  # định nghĩa các slot brand fill (xem §4)
- canvas_blueprint: jsonb             # block layout staff vẽ, slot markers
- preview_html: text?                 # rendered preview cho catalog browse
- created_by: uuid → User
- created_at: timestamp

CONSTRAINTS:
- UNIQUE (template_id, version_no)
- INDEX (template_id, version_no DESC)
- canvas_blueprint references slot keys defined in slot_schema (BE validate)
```

#### `Landing`
Instance brand-owned. Tạo từ 1 TemplateVersion, fill slot qua `config_json`.

```yaml
- id: uuid
- brand_id: uuid → Brand
- workspace_id: uuid → Workspace
- slug: string                        # "tet-2026-promo" — unique trong workspace
- name: string                        # "Coca Tết 2026"
- description: string?
- status: enum('draft', 'published', 'archived')
- template_version_id: uuid → TemplateVersion  # version locked tại publish/clone time
- active_release_id: uuid? → LandingRelease
- freeze_products: boolean DEFAULT false  # Q9: nếu true, products được snapshot tại publish
- assigned_by: uuid? → User           # staff handoff cho brand (nullable)
- assigned_at: timestamp?
- handoff_notes: text?
- thumbnail_asset_id: uuid? → MediaAsset
- created_by: uuid → User
- updated_by: uuid → User
- created_at, updated_at, archived_at?

CONSTRAINTS:
- UNIQUE (workspace_id, slug)
- INDEX (brand_id, status)
- INDEX (workspace_id, status)
```

#### `LandingRevision`
Rolling 50 revisions gần nhất của Landing — autosave history. Cron daily xoá revision cũ hơn 50.

```yaml
- id: uuid
- landing_id: uuid → Landing
- revision_no: int                    # 1, 2, 3, ...
- config_json: jsonb                  # slot values (xem §4)
- changed_by: uuid → User
- changed_at: timestamp

CONSTRAINTS:
- UNIQUE (landing_id, revision_no)
- INDEX (landing_id, changed_at DESC)
- Cron: DELETE WHERE landing_id=X AND revision_no < (max - 50)
```

#### `LandingRelease`
Immutable snapshot khi Publish. Public traffic được serve từ active_release. Rollback = activate release cũ.

```yaml
- id: uuid
- landing_id: uuid → Landing
- release_no: int                     # 1, 2, 3, ...
- version_label: string?              # "v1", "v2.1" optional
- config_snapshot: jsonb              # snapshot of revision tại publish time
- canvas_blueprint_snapshot: jsonb    # copy from TemplateVersion (freeze layout)
- product_snapshot: jsonb?            # nếu landing.freeze_products = true (Q9 hybrid)
- published_by: uuid → User
- published_at: timestamp
- is_active: boolean                  # chỉ 1 release per landing active tại 1 thời điểm

CONSTRAINTS:
- UNIQUE (landing_id, release_no)
- UNIQUE PARTIAL (landing_id) WHERE is_active=true   # đảm bảo chỉ 1 active
- INDEX (landing_id, published_at DESC)
```

---

### 3.3 Customization assets

#### `SavedBlock`
Brand-level block library cho reuse (Phase 2 brand sẽ dùng nhiều hơn).

```yaml
- id: uuid
- brand_id: uuid → Brand
- workspace_id: uuid? → Workspace     # optional, scope hẹp hơn
- name: string
- block_json: jsonb                   # 1 block subtree
- tags: text[]
- thumbnail_asset_id: uuid? → MediaAsset
- usage_count: int DEFAULT 0
- created_by: uuid → User
- created_at, updated_at

CONSTRAINTS:
- INDEX (brand_id)
- INDEX (brand_id, tags) USING GIN
```

#### `Product`
Brand product catalog. Reference vào landing qua slot type `product_ref`.

```yaml
- id: uuid
- brand_id: uuid → Brand
- sku: string?
- slug: string                        # "coca-zero-330ml"
- name: string                        # "Coca-Cola Zero Sugar 330ml"
- description: text?
- category: string?
- status: enum('active', 'draft', 'archived')
- price_vnd: numeric?
- thumbnail_asset_id: uuid? → MediaAsset
- attributes: jsonb                   # sizes, colors, ingredients, features, ...
- created_by: uuid → User
- created_at, updated_at

CONSTRAINTS:
- UNIQUE (brand_id, slug)
- INDEX (brand_id, status)
```

#### `MediaAsset`
File upload (image/video/doc).

```yaml
- id: uuid
- brand_id: uuid → Brand
- workspace_id: uuid? → Workspace
- folder_id: uuid? → MediaFolder
- filename: string
- mime_type: string
- size_bytes: bigint
- file_hash: string (SHA-256)         # dedupe per brand
- storage_url: string                 # S3-compat key
- public_cdn_url: string?
- thumbnail_url: string?
- media_type: enum('image', 'video', 'document', 'audio')
- width, height, duration_ms          # nullable
- uploaded_by: uuid → User
- uploaded_at: timestamp

CONSTRAINTS:
- UNIQUE (brand_id, file_hash)        # dedupe within brand
- INDEX (brand_id, folder_id)
```

#### `MediaFolder`
Organize media assets in tree.

```yaml
- id: uuid
- brand_id: uuid → Brand
- parent_id: uuid? → MediaFolder       # null = root
- name: string
- created_by: uuid → User
- created_at, updated_at

CONSTRAINTS:
- UNIQUE (brand_id, parent_id, name)
```

---

### 3.4 Distribution — Custom Domain (Q4)

#### `CustomDomain`
Brand maps own domain to a workspace. Mỗi domain serve toàn bộ landings của workspace đó qua path-based routing.

```yaml
- id: uuid
- brand_id: uuid → Brand
- workspace_id: uuid → Workspace      # 1 domain → 1 workspace (Phase 1)
- domain: string (unique)             # "coca.vn" hoặc "campaigns.coca.vn"
- status: enum('pending', 'verifying', 'verified', 'failed', 'disabled')
- verification_token: string          # random token cho TXT record
- verification_method: enum('dns_txt', 'dns_cname', 'http_file')
- verified_at: timestamp?
- tls_status: enum('none', 'pending', 'active', 'expired')
- tls_cert_id: string?                # reference vào TLS provider
- tls_expires_at: timestamp?
- last_check_at: timestamp?
- failure_reason: text?
- created_by: uuid → User
- created_at, updated_at

CONSTRAINTS:
- UNIQUE (domain)                     # 1 domain global unique
- INDEX (brand_id), INDEX (workspace_id)
- INDEX (status) WHERE status IN ('verifying', 'pending')   # cron polling
```

#### `DomainVerificationLog`
Audit của các lần check DNS.

```yaml
- id: uuid
- domain_id: uuid → CustomDomain
- check_type: enum('dns_lookup', 'tls_provision', 'manual_retry')
- result: enum('success', 'pending', 'failure')
- details: jsonb                      # raw DNS response, error message
- checked_at: timestamp

CONSTRAINTS:
- INDEX (domain_id, checked_at DESC)
```

---

### 3.5 Engagement — Campaign + Analytics

#### `Campaign` (Q8: standalone)
Marketing campaign tracking cho ads. KHÔNG có FK với Landing.

```yaml
- id: uuid
- brand_id: uuid → Brand
- workspace_id: uuid → Workspace
- name: string                        # "Tết 2026 Coca master campaign"
- slug: string?
- objective: enum('awareness', 'traffic', 'conversion', 'retention')
- status: enum('draft', 'active', 'paused', 'completed')
- channels: text[]                    # ['facebook', 'youtube', 'tiktok']
- budget_amount: numeric?
- budget_currency: string?            # 'VND', 'USD'
- start_date: date?
- end_date: date?
- kpis: jsonb                         # [{name, target, current?}]
- notes: text?
- tracked_url: string?                # primary landing URL with UTM
- product_id: uuid? → Product         # main product nếu có
- created_by: uuid → User
- created_at, updated_at

CONSTRAINTS:
- INDEX (brand_id, status)
- INDEX (workspace_id, status)
```

#### `CampaignMetric`
Đẩy daily từ ad platform (Facebook Ads, GA, …) — không sinh từ Rexer traffic.

```yaml
- id: uuid
- campaign_id: uuid → Campaign
- date: date
- channel: string                     # 'facebook', 'youtube', ...
- impressions: bigint
- clicks: bigint
- spent_amount: numeric
- conversions: int
- raw: jsonb                          # platform-specific extras

CONSTRAINTS:
- UNIQUE (campaign_id, date, channel)
- INDEX (campaign_id, date DESC)
```

#### `AnalyticsEvent` (Q11: page + block dual-tier)
Raw event stream từ visitor — hot storage 30 days, sau đó archive sang cold.

```yaml
- id: uuid
- landing_id: uuid → Landing
- release_id: uuid? → LandingRelease   # which snapshot was served
- block_key: string?                  # slot key trong template (vd "hero", "features[0]")
- element_key: string?                # specific element trong block (vd "cta_label")
- visitor_id: string                  # client-generated UUID persist in localStorage
- session_id: string                  # 30-min idle expire
- event_type: enum(
    'page_view',
    'block_view',
    'block_dwell',
    'click',
    'scroll_depth',
    'form_submit',
    'cta_click',
    'product_view',
    'product_click'
  )
- action: string?
- target: string?
- dwell_ms: int?
- scroll_depth: int?                  # 0-100
- viewport_w, viewport_h: int
- referrer, utm_source, utm_medium, utm_campaign: string?
- ip_country: string?                 # geoip enrichment
- device_type: enum('desktop', 'mobile', 'tablet')
- user_agent_summary: string          # parsed: "Chrome 120 / macOS"
- meta: jsonb
- occurred_at: timestamp

CONSTRAINTS:
- INDEX (landing_id, occurred_at) — hot query
- INDEX (visitor_id, session_id)
- PARTITION BY RANGE (occurred_at)    # monthly partitions
```

#### `AnalyticsDailyAggregate`
Rolled-up daily metrics — fast query cho dashboard. Cron computes from raw events.

```yaml
- landing_id: uuid → Landing
- date: date
- block_key: string?                  # NULL = page-level aggregate
- page_views: int
- unique_visitors: int
- block_views: int?
- block_dwell_ms_total: bigint?
- clicks: int
- conversions: int
- avg_scroll_depth: numeric?

CONSTRAINTS:
- PRIMARY KEY (landing_id, date, COALESCE(block_key, ''))
- INDEX (landing_id, date DESC)
```

---

### 3.6 AI integration (Q10)

#### `AIJob`
Generic AI task tracker — both staff (template draft) và brand (slot suggestion).

```yaml
- id: uuid
- requested_by: uuid → User
- brand_id: uuid? → Brand             # nullable for system jobs
- job_type: enum(
    'template_draft',                 # staff: gen template skeleton
    'slot_suggest',                   # brand: AI fill 1 slot
    'landing_optimize',               # AI suggest improvements
    'image_generate'                  # AI gen hero image
  )
- input_payload: jsonb                # prompt, refs, context
- output_payload: jsonb?              # result
- status: enum('queued', 'running', 'succeeded', 'failed')
- cost_credits: int                   # AI cost tracking
- model: string                       # 'gpt-4', 'claude-sonnet', ...
- tokens_in, tokens_out: int?
- error_message: text?
- created_at, completed_at?

CONSTRAINTS:
- INDEX (brand_id, created_at DESC)
- INDEX (status, created_at) WHERE status IN ('queued', 'running')
```

#### `AISlotSuggestion`
Inline AI suggestions cho brand khi fill landing slot. Lưu để brand accept/reject + track quality.

```yaml
- id: uuid
- landing_id: uuid → Landing
- slot_key: string                    # "headline"
- suggestion_text: text
- accepted: boolean?                  # null=pending, true=accepted, false=rejected
- ai_job_id: uuid → AIJob
- suggested_at: timestamp
- responded_at: timestamp?

CONSTRAINTS:
- INDEX (landing_id, slot_key)
```

---

### 3.7 Audit

#### `ActivityLog`
Audit log mọi action có lifecycle.

```yaml
- id: uuid
- brand_id: uuid? → Brand             # nullable for system actions
- actor_id: uuid? → User              # nullable for system
- action: string                      # 'landing.publish', 'template.create', 'domain.verify'
- entity_type: string                 # 'landing', 'template', 'domain'
- entity_id: uuid
- metadata: jsonb                     # before/after diff, reason, ...
- ip_address: inet?
- user_agent: string?
- occurred_at: timestamp

CONSTRAINTS:
- INDEX (brand_id, occurred_at DESC)
- INDEX (entity_type, entity_id, occurred_at DESC)
- PARTITION BY RANGE (occurred_at)    # monthly
```

---

## 4. Slot schema spec (Q1: slot-fill model)

### 4.1 TemplateVersion.slot_schema shape

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
      "key": "subheadline",
      "type": "text",
      "max_length": 200,
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
      "key": "cta_label",
      "type": "text",
      "default": "Đặt hàng ngay",
      "max_length": 30
    },
    {
      "key": "cta_url",
      "type": "url",
      "required": true
    },
    {
      "key": "background_color",
      "type": "color",
      "default": "#ffffff"
    },
    {
      "key": "features",
      "type": "array",
      "min_items": 0,
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

### 4.2 Supported slot types

| Type | Description | Storage |
|---|---|---|
| `text` | Single-line text | string |
| `richtext` | Markdown/limited HTML | string (sanitized) |
| `url` | URL with validation | string |
| `email`, `phone` | Validated input | string |
| `number`, `integer` | Numeric | number |
| `boolean` | Toggle | boolean |
| `color` | Hex color picker | string `#rrggbb` |
| `icon` | From icon library | string (icon name) |
| `image` | Single MediaAsset reference | uuid |
| `gallery` | Multiple MediaAsset refs | uuid[] |
| `video` | MediaAsset video | uuid |
| `date`, `datetime` | Date picker | ISO string |
| `product_ref` | Single product reference | uuid → Product |
| `product_ref_list` | Multiple products | uuid[] |
| `array` | Repeatable group with `item_schema` | array |
| `object` | Nested group with `fields` | object |

### 4.3 Landing.config_json (filled instance)

```json
{
  "headline": "Sum vầy ngày Tết",
  "subheadline": "Coca-Cola đồng hành cùng mọi gia đình",
  "hero_image": "media_uuid_abc123",
  "cta_label": "Đặt hàng ngay",
  "cta_url": "https://shop.coca.vn/tet",
  "background_color": "#ffe7e1",
  "features": [
    {
      "icon": "shield-check",
      "label": "Chính hãng 100%",
      "body": "Phân phối trực tiếp từ Coca-Cola Vietnam"
    },
    {
      "icon": "truck",
      "label": "Giao tận nhà",
      "body": "Miễn phí với đơn ≥ 200k"
    }
  ],
  "products": ["product_uuid_1", "product_uuid_2", "product_uuid_3"]
}
```

### 4.4 Canvas blueprint references slots

```json
{
  "schema_version": "1.0",
  "blocks": [
    {
      "type": "hero_split",
      "props": {
        "background": { "$slot": "background_color" },
        "left": {
          "title": { "$slot": "headline" },
          "subtitle": { "$slot": "subheadline" },
          "cta": {
            "label": { "$slot": "cta_label" },
            "url": { "$slot": "cta_url" }
          }
        },
        "right": {
          "image": { "$slot": "hero_image" }
        }
      }
    },
    {
      "type": "feature_grid",
      "props": {
        "items": { "$slot": "features" }
      }
    },
    {
      "type": "product_showcase",
      "props": {
        "products": { "$slot": "products" }
      }
    }
  ]
}
```

→ BE render = traverse blueprint, resolve `$slot` refs từ `config_json` → output HTML/JSON.

---

## 5. ER diagram

```
                        ┌──────────────┐
                        │     USER     │ ──────┐
                        │ admin|staff  │       │
                        └──────┬───────┘       │ created_by
                               │               │
              ┌────────────────┼───────────┐  │
              │                │            │  ▼
              ▼                ▼            ▼  ▼
         ┌─────────┐      ┌──────────┐  ┌─────────────┐
         │  BRAND  │ 1—N  │WORKSPACE │  │ TEMPLATE    │ ─── scope='public'
         │ (tenant)│ ───▶ │          │  │  catalog    │     hoặc 'brand_private'
         └────┬────┘      └────┬─────┘  └──────┬──────┘     (FK owner_brand)
              │ 1—N            │ 1—N            │ 1—N
              ▼                ▼                ▼
         ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐
         │BRAND_MEMBER │  │  LANDING     │  │ TEMPLATE_VERSION  │
         │role:        │  │              │ ◀┤  slot_schema      │
         │brand_admin │  │  - slug      │  │  canvas_blueprint │
         │brand_member│  │  - status    │  └───────────────────┘
         └─────────────┘  │  - template_ │
                          │   version_id │
                          │ ─────────────│
                          │ 1—1          │ 1—N
                          ▼              ▼
                     ┌─────────────┐  ┌──────────────────┐
                     │CONFIG_JSON  │  │ LANDING_REVISION │ ◀── rolling 50
                     │ (current)   │  │  (autosave hist) │
                     └─────────────┘  └──────────────────┘
                          │
                          │ 1—N
                          ▼
                     ┌──────────────────┐
                     │LANDING_RELEASE   │ ◀── immutable when publish
                     │ - config_snapshot│
                     │ - canvas_snapshot│
                     │ - is_active      │ (chỉ 1 true per landing)
                     └──────────────────┘
                          ▲
                          │ active_release_id
                          │
                  ┌───────┴──────┐
                  │  PUBLIC URL  │
                  │              │
                  │  CUSTOM_     │── 1 brand → N domains
                  │  DOMAIN     │    1 domain → 1 workspace
                  │  status:    │    serve all landings trong ws
                  │  pending/   │
                  │  verified   │
                  └──────────────┘

         ┌─────────────────┐
         │  SAVED_BLOCK    │  brand-level reusable
         └─────────────────┘

         ┌──────────┐         ┌─────────────┐
         │ PRODUCT  │ — ref ──│landing.     │
         │ (brand)  │         │ config_json │
         └──────────┘         │ products[]  │
                              └─────────────┘

         ┌──────────────┐
         │ MEDIA_ASSET  │  ref qua slot type 'image'/'video'/etc
         │ (brand)      │
         └──────────────┘

         ┌──────────┐
         │ CAMPAIGN │ — standalone (Q8) — KHÔNG có FK landing
         │ (ads     │
         │  tracking)│
         └──────────┘

         ┌────────────────────┐
         │ ANALYTICS_EVENT    │
         │  - landing_id      │
         │  - block_key, slot │
         │  - visitor session │
         │  - event_type      │
         └────────────────────┘
                  │
                  │ rollup cron daily
                  ▼
         ┌─────────────────────────┐
         │ ANALYTICS_DAILY_AGGREGATE│
         └─────────────────────────┘

         ┌──────────┐
         │ AI_JOB   │ — template_draft / slot_suggest / image_generate
         └──────────┘

         ┌──────────────┐
         │ ACTIVITY_LOG │ — audit mọi action
         └──────────────┘
```

---

## 6. State machines

### 6.1 Landing lifecycle

```
                  ┌─────────┐
   create from    │  DRAFT  │ ◀───────────┐
   template       │         │             │
   ────────────▶  │ - editable             │ unpublish
                  │ - no URL │             │
                  └────┬────┘             │
                       │                   │
                publish│                   │
                       ▼                   │
                  ┌──────────┐             │
                  │PUBLISHED │ ────────────┘
                  │          │
                  │ - snapshot                 ┌──────────┐
                  │   release  │── archive ──▶ │ARCHIVED  │
                  │ - share_   │               │          │
                  │   token    │               │ - URL    │
                  └──────────┘                │   404    │
                                              │ - data   │
                                              │   kept   │
                                              └──────────┘
```

State transitions:
- `(none) → DRAFT`: User creates landing from template version. Clone canvas_blueprint, init empty config_json.
- `DRAFT → PUBLISHED`: Snapshot CanvasDocument → tạo LandingRelease (immutable). Set `active_release_id`, `share_token`. URL goes live.
- `PUBLISHED → DRAFT`: Set active_release_id = null. URL returns 404. Release history retained.
- `* → ARCHIVED`: Soft delete, URL 404, hide khỏi default list. Phase 2 thêm hard-delete cron 90 ngày.
- `ARCHIVED → DRAFT`: Restore. Vẫn ở draft (không auto-republish).

### 6.2 CustomDomain lifecycle

```
   ┌─────────┐  brand add ds   ┌───────────┐
   │ PENDING │ ─────────────▶  │ VERIFYING │
   └─────────┘                 └─────┬─────┘
        ▲                            │ poll DNS
        │                            ▼
        │ retry                ┌──────────┐
        └─────────────────────│  FAILED  │
                              └──────────┘
        ┌──────────┐
        │ VERIFIED │ ◀── DNS check pass
        └────┬─────┘
             │
             │ provision TLS
             ▼
        ┌───────────────┐
        │ ACTIVE        │ ── domain live
        │ (TLS valid)   │
        └────┬──────────┘
             │
             │ brand disable / TLS expire
             ▼
        ┌──────────┐
        │ DISABLED │
        └──────────┘
```

### 6.3 AI Job lifecycle

```
   queued → running → succeeded
                     ↘ failed
```

---

## 7. Workflows (Phase 1 — 12 user journeys)

### W1 — Onboard new Brand

```
Actor: Admin
1. /admin/brands → "Create new brand"
2. POST /v1/brands {name, contact_email, plan}
3. BE:
   - Create Brand row, status='pending'
   - Create default Workspace (is_default=true)
   - Activity log: 'brand.create'
4. Admin invites brand_admin:
   POST /v1/brands/{id}/users {email, display_name, role='brand_admin'}
5. BE:
   - Create User + BrandMembership row
   - Send email with magic link + temp password
6. Brand_admin logs in → /portal → status='active' automatically
```

### W2 — Staff creates new Template

```
Actor: Staff (Rexer)
1. /admin/templates → "Create new template"
2. Open Canvas Builder /admin/template-builder
3. Drag blocks, define slot markers in canvas
4. Modal "Define slots":
   - Add slot: key, type, label, required, constraints
   - Repeat for all slot needed
5. Preview với sample data
6. POST /v1/templates {slug, name, category, scope='public', slot_schema, canvas_blueprint}
7. BE:
   - Create Template row, status='draft', scope='public'
   - Create TemplateVersion v1 (slot_schema + canvas_blueprint)
   - Set template.current_version_id = v1.id
8. Staff publishes template:
   PATCH /v1/templates/{id} {status='published'}
9. Template appears in catalog /v1/templates?scope=public
```

### W3 — Brand uses Template (Phase 1: assigned, Phase 2: self-serve)

```
Phase 1 (Admin assigns):
1. Admin /admin/brands/{id}/landings → "Assign landing"
2. Modal: chọn Template từ catalog, nhập tên Landing
3. POST /v1/admin/landings/from-template {
     brand_id, workspace_id, template_id, name, handoff_notes
   }
4. BE:
   - Get template.current_version_id
   - Create Landing row, status='draft',
     template_version_id=current, config_json={},
     assigned_by=admin, handoff_notes=...
   - Create initial LandingRevision (rev_no=1)
   - Activity log: 'landing.assigned'
   - Notification cho brand_admin
5. Brand sees landing in /portal/landings status='draft'

Phase 2 (Brand self-serve):
- Brand /portal/templates → click "Use this template"
- POST /v1/landings {workspace_id, template_id, name}
- Same BE flow
```

### W4 — Brand edits Landing (slot fill)

```
Actor: Brand_admin / brand_member
1. /portal/landings/{id}/edit
2. FE loads:
   - GET /v1/landings/{id}
   - GET /v1/templates/{tpl_id}/versions/{ver_id}  # slot_schema
   - GET /v1/landings/{id}/config-revisions/current
3. FE renders form per slot_schema:
   - text → <input>
   - image → <ImagePickerFromMedia>
   - product_ref_list → <ProductMultiSelect>
   - array → repeatable group
4. User fills slot → debounce 3s → autosave:
   PATCH /v1/landings/{id}/config {
     config_json, base_revision_no
   }
5. BE:
   - Validate config_json against TemplateVersion.slot_schema
   - If invalid → 400 {errors: [{slot_key, message}]}
   - If base_revision_no mismatch → 409 conflict
   - Create new LandingRevision (revision_no++)
   - Cleanup old revisions > 50
6. FE shows "Saved ✓"
7. User clicks "Preview" → /portal/landings/{id}/preview (server-rendered từ current revision)
```

### W5 — AI suggest slot value (Q10)

```
Actor: Brand_admin
1. Click "✦ Suggest" next to a slot in form editor
2. POST /v1/ai/slot-suggest {
     landing_id, slot_key,
     context: {brand_name, template_category, surrounding_slots}
   }
3. BE:
   - Create AIJob row, status='queued', job_type='slot_suggest'
   - Enqueue LLM call (async worker)
4. Worker:
   - Call LLM (Claude/GPT) with context
   - Update AIJob: status='succeeded', output_payload={suggestions: [...]}
   - Create AISlotSuggestion row
5. FE polls or SSE → show 3 suggestions
6. User clicks "Accept" → update form value + PATCH /v1/ai/slot-suggestions/{id} {accepted: true}
```

### W6 — Publish Landing

```
Actor: Brand_admin (Phase 1: also Staff/Admin)
1. /portal/landings/{id}/edit → click "Publish"
2. POST /v1/landings/{id}/publish/validate
3. BE validates:
   - All required slots filled
   - All MediaAsset refs exist
   - All Product refs exist (if freeze_products=true, snapshot them)
   - canvas_blueprint references no undefined slot
4. If invalid → 400 {errors: [...]}
5. POST /v1/landings/{id}/publish {version_label?}
6. BE:
   - Snapshot current LandingRevision.config_json → LandingRelease.config_snapshot
   - Copy TemplateVersion.canvas_blueprint → LandingRelease.canvas_blueprint_snapshot
   - If landing.freeze_products → snapshot product data → LandingRelease.product_snapshot
   - Generate share_token (32-char random)
   - Set release.is_active=true, deactivate previous
   - Update landing: active_release_id, status='published'
   - Activity log: 'landing.publish'
   - Notification cho brand
7. Return public URL
```

### W7 — Public visitor xem landing

```
Actor: Anonymous
1. Visitor opens https://coca.vn/tet-2026 (custom domain)
2. CDN/Edge routes to Rexer backend by Host header
3. BE:
   - Lookup CustomDomain by `coca.vn` → workspace_id
   - Lookup Landing by (workspace_id, slug='tet-2026')
   - Check landing.status='published' + active_release exists
   - Return active_release.config_snapshot + canvas_blueprint_snapshot
4. BE server-renders HTML from blueprint + config (or returns JSON for client SSR)
5. FE loads, fires page_view → POST /v1/analytics/events
6. IntersectionObserver fires block_view as user scrolls
7. Click handlers fire 'click' / 'cta_click' / 'product_click'
8. Form submits fire 'form_submit'
```

### W8 — Brand sees analytics

```
Actor: Brand user
1. /portal/landings/{id}/analytics
2. GET /v1/landings/{id}/analytics/summary?range=7d
   Returns: {
     page_views, unique_visitors, conversions,
     avg_time_on_page, top_referrers, device_breakdown
   }
3. GET /v1/landings/{id}/analytics/blocks?range=7d
   Returns per-block: {
     block_key, views, dwell_ms_avg, clicks, ctr,
     daily_views: [n, n, n, ...]   # sparkline
   }
4. FE renders dashboard with charts
```

### W9 — Brand setups Custom Domain

```
Actor: Brand_admin
1. /portal/profile/domains → "Add domain"
2. Enter "coca.vn"
3. POST /v1/brands/{id}/domains {
     domain: 'coca.vn',
     workspace_id: <selected>
   }
4. BE:
   - Validate domain format
   - Check no existing CustomDomain with same `domain`
   - Create row, status='pending', generate verification_token
   - Return required DNS records:
     {
       cname: { name: '@', value: 'edge.rexer.com' },
       txt: { name: '_rexer-verify', value: 'token_abc123' }
     }
5. UI displays DNS records + "Verify" button
6. Brand adds DNS records at their registrar
7. Brand clicks "Verify"
8. POST /v1/brands/{id}/domains/{domain_id}/verify
9. BE:
   - Set status='verifying'
   - Cron job (every 5 min) checks DNS:
     - DNS lookup TXT _rexer-verify.coca.vn
     - If matches token → status='verified'
     - Trigger TLS provisioning (Caddy auto-cert or Cloudflare API)
   - When TLS active → status='active'
10. Brand can now publish landings — URL is https://coca.vn/{landing_slug}
```

### W10 — Saved block reuse

```
Actor: Staff (Phase 1) / Brand (Phase 2 when allowed)
1. Trong template-builder, select 1 block group
2. Click "Save block to library"
3. POST /v1/saved-blocks {brand_id, name, block_json, tags}
4. Later, in another template, drag block from "My library"
5. Block JSON inserted into canvas_blueprint
```

### W11 — Campaign tracking (Q8 standalone)

```
Actor: Brand_admin
1. /portal/campaigns → "New campaign"
2. POST /v1/campaigns {
     name: "Tết 2026 master",
     objective: 'awareness',
     channels: ['facebook', 'youtube'],
     budget_amount: 500000000,
     start_date, end_date,
     tracked_url: 'https://coca.vn/tet-2026?utm_source=fb&utm_campaign=tet'
   }
3. Brand pastes tracked_url into ad platform
4. Ad platform sends data → daily sync job pulls metrics:
   - POST /v1/campaigns/{id}/metrics/import {date, channel, data}
   - Create CampaignMetric row per (date, channel)
5. /portal/campaigns/{id} shows dashboard
```

### W12 — Archive + restore Landing

```
Actor: Brand_admin
1. Click "Archive" on landing
2. POST /v1/landings/{id}/archive
3. BE:
   - Set landing.status='archived', archived_at=now()
   - Set all releases.is_active=false (URL returns 410 Gone)
   - Activity log
4. Restore: POST /v1/landings/{id}/restore
5. BE: status='draft' (không auto-republish để tránh accident)
```

---

## 8. API surface — resource-nested REST

### Brands

```
GET    /v1/brands?status=&q=&page=&limit=
POST   /v1/brands                                  # admin only
GET    /v1/brands/{id}
PATCH  /v1/brands/{id}
DELETE /v1/brands/{id}                             # admin only, soft

GET    /v1/brands/{id}/users
POST   /v1/brands/{id}/users                       # invite
PATCH  /v1/brands/{id}/users/{userId}              # change role
DELETE /v1/brands/{id}/users/{userId}              # remove

GET    /v1/brands/{id}/workspaces
POST   /v1/brands/{id}/workspaces
PATCH  /v1/brands/{id}/workspaces/{wsId}
DELETE /v1/brands/{id}/workspaces/{wsId}

GET    /v1/brands/{id}/domains
POST   /v1/brands/{id}/domains                     # add custom domain
POST   /v1/brands/{id}/domains/{domainId}/verify
DELETE /v1/brands/{id}/domains/{domainId}
```

### Templates (catalog)

```
GET    /v1/templates?scope=&category=&q=&page=&limit=
POST   /v1/templates                               # admin/staff create
GET    /v1/templates/{id}
PATCH  /v1/templates/{id}
DELETE /v1/templates/{id}

GET    /v1/templates/{id}/versions
POST   /v1/templates/{id}/versions                 # publish new version
GET    /v1/templates/{id}/versions/{versionId}
```

### Landings (brand instances)

```
GET    /v1/workspaces/{wsId}/landings?status=&q=
POST   /v1/workspaces/{wsId}/landings              # body: {template_id, name}
GET    /v1/landings/{id}
PATCH  /v1/landings/{id}                           # rename, freeze_products, etc.
DELETE /v1/landings/{id}                           # archive (soft)
POST   /v1/landings/{id}/restore

POST   /v1/landings/{id}/config                    # autosave revision
GET    /v1/landings/{id}/config-revisions          # history
GET    /v1/landings/{id}/config-revisions/{revNo}
POST   /v1/landings/{id}/config-revisions/{revNo}/revert

POST   /v1/landings/{id}/publish/validate
POST   /v1/landings/{id}/publish
POST   /v1/landings/{id}/unpublish

GET    /v1/landings/{id}/releases
GET    /v1/landings/{id}/releases/{releaseId}
POST   /v1/landings/{id}/releases/{releaseId}/activate    # rollback

GET    /v1/landings/{id}/analytics/summary?range=
GET    /v1/landings/{id}/analytics/blocks?range=

# Admin-side: tạo landing cho brand (Phase 1 managed)
POST   /v1/admin/landings/from-template
```

### Saved blocks

```
GET    /v1/brands/{id}/saved-blocks?tag=&q=
POST   /v1/brands/{id}/saved-blocks
PATCH  /v1/saved-blocks/{id}
DELETE /v1/saved-blocks/{id}
```

### Products

```
GET    /v1/brands/{id}/products?status=&q=
POST   /v1/brands/{id}/products
GET    /v1/products/{id}
PATCH  /v1/products/{id}
DELETE /v1/products/{id}
```

### Media

```
GET    /v1/brands/{id}/media?folder_id=&type=
POST   /v1/media/uploads/init                      # 3-step upload
PUT    /v1/media/uploads/{uploadId}/raw
POST   /v1/media/uploads/complete
GET    /v1/media/{id}
DELETE /v1/media/{id}

GET    /v1/brands/{id}/media-folders
POST   /v1/brands/{id}/media-folders
PATCH  /v1/media-folders/{id}
DELETE /v1/media-folders/{id}
```

### Campaigns (standalone)

```
GET    /v1/workspaces/{wsId}/campaigns
POST   /v1/workspaces/{wsId}/campaigns
GET    /v1/campaigns/{id}
PATCH  /v1/campaigns/{id}
DELETE /v1/campaigns/{id}
GET    /v1/campaigns/{id}/metrics
POST   /v1/campaigns/{id}/metrics/import           # bulk import from ad platform
```

### AI

```
POST   /v1/ai/template-draft                       # staff: gen template
POST   /v1/ai/slot-suggest                         # brand: fill slot
POST   /v1/ai/landing-optimize                     # AI review landing
POST   /v1/ai/image-generate                       # AI gen image
GET    /v1/ai/jobs/{id}                            # poll status
PATCH  /v1/ai/slot-suggestions/{id}                # accept/reject
```

### Analytics ingest (no auth)

```
POST   /v1/analytics/events                        # batch ingest visitor events
POST   /v1/track                                   # alternative single-event ingest
```

### Public render

```
GET    /v1/public/landings/by-domain/{domain}/{slug}    # internal — CDN call this
GET    /v1/public/landings/{landingId}/preview?token=   # preview with token
```

### Activity log

```
GET    /v1/brands/{id}/activity?entity_type=&from=&to=
```

---

## 9. Custom Domain provisioning flow (Q4 detail)

### 9.1 Required infrastructure

- **DNS wildcard**: `*.rexer-edge.com` → load balancer IP
- **TLS provider**: Caddy (auto-cert) hoặc Cloudflare for SaaS API
- **Edge router**: Caddy / NGINX / Cloudflare Worker — route by Host header

### 9.2 BE responsibilities

1. **Domain CRUD** + status state machine
2. **Verification cron**: poll DNS every 5 min for `verifying` domains
3. **TLS provisioning trigger**: when verified, call TLS API
4. **Edge routing config**: write domain → workspace mapping to KV store / DB read replica for fast lookup
5. **Renewal cron**: monitor `tls_expires_at`, renew 30 days before

### 9.3 DNS records brand cần add

```
For "coca.vn":
  CNAME    @    →    edge.rexer-edge.com.
  TXT      _rexer-verify.coca.vn    →    "rexer-verify=token_abc123"

For "campaigns.coca.vn" (subdomain):
  CNAME    campaigns    →    edge.rexer-edge.com.
  TXT      _rexer-verify.campaigns.coca.vn    →    "rexer-verify=token_xyz789"
```

### 9.4 Edge routing logic

```
Request: GET https://coca.vn/tet-2026 HTTP/1.1
         Host: coca.vn

Edge:
  1. Lookup CustomDomain WHERE domain='coca.vn' AND status='active'
     → workspace_id=ws_uuid
  2. Lookup Landing WHERE workspace_id=ws_uuid AND slug='tet-2026'
     → landing_id, active_release_id
  3. If status != 'published' → 404
  4. Serve cached active_release.canvas_snapshot rendered HTML
  5. Embed analytics tracker JS (no auth) → POST /v1/analytics/events
```

### 9.5 Edge case

- **Same domain with different paths**: 1 domain → 1 workspace → N landings via slug
- **Apex vs subdomain**: support both `coca.vn` and `campaigns.coca.vn` as separate CustomDomain rows
- **www handling**: auto-redirect `www.coca.vn` → `coca.vn` (canonical)
- **TLS expired**: serve self-signed 503 page with brand warning

---

## 10. Analytics data flow

### 10.1 Ingestion layer

```
Visitor → FE tracker
  ↓
Batch every 5s or 10 events
  ↓
POST /v1/analytics/events  (no auth, anti-abuse rate limit by IP)
  ↓
BE writes to analytics_events (partitioned monthly)
  ↓
Async stream → message queue (Kafka/SQS)
  ↓
Stream processor → enrichment (geoip, UA parse) → rewrite row
```

### 10.2 Aggregation layer

```
Cron daily 1:00 AM:
  - For each landing with new events:
    - Compute daily aggregates per landing × date
    - Compute daily aggregates per landing × block_key × date
  - Insert/upsert analytics_daily_aggregate

Cron weekly:
  - Archive analytics_events older than 30 days to cold storage (S3 Parquet)
  - DROP partition older than 30 days
```

### 10.3 Query layer

| Use case | Query target | Latency |
|---|---|---|
| Dashboard 7d summary | `analytics_daily_aggregate WHERE landing_id=X AND date >= now-7d` | < 50ms |
| Block-level breakdown | `analytics_daily_aggregate WHERE landing_id=X AND block_key IS NOT NULL` | < 100ms |
| Real-time (last 5 min) | `analytics_events WHERE landing_id=X AND occurred_at >= now-5min` | < 200ms (hot partition) |
| Historical drill (raw events) | Cold storage Parquet via Trino/Athena | < 5s |

---

## 11. AI integration points (Q10)

### 11.1 Staff workflows

- **Template draft from prompt**: Staff types "Landing for sports drink launch with hero + 3 features + CTA"
  → AI generates slot_schema + canvas_blueprint skeleton
  → Staff edits, then publishes Template
- **Template optimize**: AI suggests adding slots, improving layout based on conversion best practices

### 11.2 Brand workflows

- **Slot suggest**: Click ✦ next to `headline` slot → 3 suggestions based on brand + product + template context
- **Slot all-fill**: "Generate full landing" — AI fills all slots with brand-aware copy
- **Image generate**: For `image` slot, instead of upload, AI generates from prompt
- **Landing optimize**: AI reviews filled landing, suggests improvements ("CTA too vague", "headline too long for mobile")

### 11.3 Cost tracking

Each AIJob persists `tokens_in/out` + `cost_credits`. Brand has `ai_credit_balance` (Phase 2 plan field). Phase 1 free, capped at 100 jobs/day/brand.

---

## 12. Naming glossary — canonical

| Term | Definition | BE table |
|---|---|---|
| **Brand** | Doanh nghiệp tenant | `brands` |
| **Workspace** | Sub-folder trong brand | `workspaces` |
| **User** | Người dùng auth (admin/staff) | `users` |
| **Brand membership** | N-N user × brand × role | `brand_memberships` |
| **Template** | Catalog blueprint (public hoặc brand_private) | `templates` |
| **Template version** | Immutable snapshot của template | `template_versions` |
| **Landing** | Brand's landing page instance, từ template version | `landings` |
| **Landing revision** | Autosave rolling 50 versions | `landing_revisions` |
| **Landing release** | Immutable snapshot khi publish | `landing_releases` |
| **Slot** | Field trong template_version.slot_schema | (column, not table) |
| **Saved block** | Brand-level reusable block | `saved_blocks` |
| **Product** | Brand catalog item | `products` |
| **Media asset** | File upload | `media_assets` |
| **Media folder** | Tổ chức assets | `media_folders` |
| **Custom domain** | Brand's domain mapping → workspace | `custom_domains` |
| **Campaign** | Standalone ad tracking entity | `campaigns` |
| **Analytics event** | Visitor interaction raw event | `analytics_events` |
| **Daily aggregate** | Rolled-up analytics | `analytics_daily_aggregate` |
| **AI job** | LLM task tracker | `ai_jobs` |
| **Activity log** | Audit log | `activity_logs` |

---

## 13. Phase 1 vs Phase 2 split

### Phase 1 ship

✅ Brand + Workspace + User + Membership (2 roles)
✅ Template (public scope) + TemplateVersion
✅ Landing + LandingRevision (rolling 50) + LandingRelease (immutable)
✅ Slot-fill UX cho brand (form editor)
✅ Custom Domain với DNS verify + TLS auto-provision
✅ Media + Folders + SHA-256 dedupe
✅ Products (CRUD + ref qua slot)
✅ Page-level + block-level Analytics
✅ AI: template draft (staff) + slot suggest (brand)
✅ ActivityLog
✅ Public render qua custom domain
✅ Campaign standalone (basic CRUD + metric import)

### Phase 2 deferred

- Template scope='brand_private' (Q2 C)
- Brand sub-roles `brand_owner/editor/viewer` (Q7 mở rộng)
- A/B testing trên Release
- Multi-language slot values (Q6 multi)
- Hard-delete cron cho archived landings
- Brand self-serve template creation
- AI image generate
- AI landing optimize (full review)
- Realtime collab (presence indicator)
- Saved block scope (private/team/public)

### Phase 3+

- Vanity URL `rexer.com/{brand_slug}/{landing_slug}`
- Multi-region (replicate releases)
- Advanced A/B testing (multi-arm bandit)
- Custom slot types (plugin API)

---

## 14. Trade-off decisions

| Decision | Choice | Trade-off |
|---|---|---|
| Slot-fill model | Simple form UI cho brand | ❌ Mất design freedom — brand không drag-drop được |
| Rolling 50 revisions | Lưu autosave history | ✅ Undo chi tiết · ❌ Storage cost |
| Custom domain Phase 1 | Brand-first UX | ❌ BE work +1 tuần infra (TLS, DNS check, edge routing) |
| Page+block analytics | Dual-tier | ❌ Events nặng → cần partition + cold archive |
| AI both sides (Q10 C) | Powerful Day-1 | ❌ Cost + abuse risk → cần quota |
| Template scope hybrid | Phase 1 chỉ public, Phase 2 mở brand_private | ✅ Lean Phase 1 |

---

## 15. Phase 1 BE delivery plan (estimate)

| Sprint | Deliverable | Effort |
|---|---|---|
| **S1** | Schema design + migrations + seed data | 1 week |
| **S2** | Auth + Brand + Workspace + User CRUD | 1 week |
| **S3** | Template + TemplateVersion CRUD + slot_schema validator | 1 week |
| **S4** | Landing + Revision + Release lifecycle + publish flow | 1.5 weeks |
| **S5** | Custom Domain + DNS verify + TLS provision + edge routing | 1.5 weeks |
| **S6** | Media upload (3-step) + Product CRUD + bind refs | 1 week |
| **S7** | Analytics ingestion + aggregation cron + dashboard endpoints | 1 week |
| **S8** | AI integration (job queue + slot suggest + template draft) | 1 week |
| **S9** | Campaign + ActivityLog + audit | 0.5 week |
| **S10** | Testing + load test + bug fix | 1 week |

**Total Phase 1**: ~10 weeks BE solo, or ~6 weeks with 2 BE in parallel.

---

## 16. Open questions cho BE confirm

1. **Storage backend**: S3-compatible (Cloudflare R2 / Backblaze B2)? CDN provider?
2. **TLS provider**: Caddy auto-cert (self-host) hay Cloudflare for SaaS API?
3. **Message queue**: Kafka, NATS, SQS, hay Postgres LISTEN/NOTIFY?
4. **Analytics cold storage**: S3 Parquet + Athena, hay ClickHouse?
5. **Rate limit infra**: per-IP for `/track`, per-user for autosave — Redis-based?
6. **Multi-region readiness**: 1 region Phase 1 confirmed?
7. **UUID strategy**: UUID v7 (time-sortable) recommended?
8. **Idempotency keys**: cho POST endpoints có side effect (publish, domain.verify)?

---

## 17. Migration path từ current schema

⚠️ Không gửi BE phần này — chỉ cho FE internal reference.

Current → Clean:

| Current | Clean equivalent | Action |
|---|---|---|
| `clients` | `brands` | Rename table |
| `client_user` role | `brand_admin` / `brand_member` | Migrate + split |
| `canvas_templates` | DELETE — gộp vào `templates` + `landings` | Migration script |
| `projects` | `landings` (Phase 1 chỉ admin path) | Already removed FE |
| `releases` | `landing_releases` | Restructure |
| `templates` (current) | `templates` (canonical) | Add slot_schema column + version table |

---

## 18. Contact

- **Doc author**: @Lantm (FE owner)
- **For decision**: BE squad lead + PM
- **Decision deadline**: trước khi BE start S1 schema migration
- **Revision history**: v1.0 — 2026-05-23 — clean design from scratch
