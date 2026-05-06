# Product Attributes V2 + Product Template Spec

**Trạng thái**: 🟢 Spec chốt — chờ BE + FE đồng song song implement.
**Phạm vi**: Resource `Product` + `ProductMediaBinding` + UX `/product/*`.
**Owner FE**: Tekup
**Owner BE**: cần BE owner để extend schema (xem §4 + §5).
**Created**: 2026-05-06
**Reference**: `docs/be-api-products-spec.md` (schema gốc cần extend), `docs/be-canvas-templates-spec.md` (pattern template tham khảo).

> File này gộp **2 yêu cầu** từ user feedback:
>
> 1. **Structured product attributes** — color → image link, feature có icon/ảnh, certification có logo
> 2. **Product Template** — user tạo product nhanh từ template + "save as template"
>
> Lý do gộp: Template clone phải mang theo structured data, nếu template chỉ là vỏ rỗng (text-only attributes) thì user copy về vẫn phải re-upload ảnh per-color → mất ý nghĩa template.

---

## 0. Decision summary

| Quyết định | Lý do |
|---|---|
| **Color → image link** qua tag binding (`color_name` field) | Mỗi màu sản phẩm thường có ảnh khác nhau (đỏ vs xanh) — cần biết ảnh nào của màu nào |
| **Size KHÔNG link image** (giữ `string[]`) | Landing không phải shop e-com — size là info text, ảnh size M/L trông giống nhau. Optional: 1 ảnh `size_chart` chung |
| **Feature: `icon_name` HOẶC `media_id`** (mutual exclusive) | Cho phép cả 2 hướng — quick icon từ lucide HOẶC ảnh upload tuỳ user |
| **Certification structured optional** (`{name, media_id?, url?}`) | Logo cert tăng credibility. Migration: text cũ → `{name: <text>}`. UI fallback text nếu thiếu logo |
| **Color có `is_default`** | UI cần biết màu hiện đầu tiên |
| **Product Template = `is_template` flag** trên `products` | Reuse table + endpoints. Tiết kiệm BE work. Promote sang separate resource sau nếu cần |
| **Templates discovery: tab trong `/product`** | Nhất quán với canvas templates pattern |
| **Save as template + Use template** flow | UX giống canvas template: clone product với `is_template=true/false` |
| **Public + Private templates** | Admin seed library + user's own templates ("My templates") |

---

## 1. Scope & rationale

### Vấn đề hiện tại

#### Attributes (text-only, flat)

```ts
Product {
  sizes: string[];                  // ["S","M","L"] — text
  colors: ProductColor[];           // [{name,hex}] — KHÔNG link ảnh
  features: ProductFeature[];       // [{label,description}] — KHÔNG có icon
  ingredients: string[];            // text
  certifications: string[];         // text — KHÔNG có logo
}
ProductMediaBinding {
  field_key?: string;               // KHÔNG có convention
  slot_key?: string;
}
```

**Hậu quả khi canvas/landing render:**
- Color picker trên landing: click màu → ảnh không đổi (FE không biết ảnh nào của màu nào)
- Feature section: chỉ thấy text, không icon → kém attractive
- Certification badges: không có logo official → kém credibility
- Hero block: chỉ dùng được 1 ảnh primary, không thể swap theo lựa chọn user

#### Template (chưa có)

User tạo product từ scratch mỗi lần — fill ~10 fields × 5-10 phút = chậm.
Không có pattern "Use template" hay "Save as my template" → không reuse được công sức.

### Mục tiêu V2

1. **Per-color media binding** — cho biết ảnh nào của màu nào
2. **Per-feature icon/image** — landing đẹp hơn
3. **Per-cert logo** — credibility cao hơn
4. **Default color flag** — UI đầu tiên hiện đúng màu
5. **Product templates** — clone-and-edit pattern
6. **Backwards compat** — data cũ vẫn load được (auto-migrate `string[]` → structured)

---

## 2. Convention — không break

- **JSON wire format**: snake_case (giữ như V1) — `is_template`, `color_name`, `icon_name`, etc.
- **camelCase ở FE TypeScript**: chuyển đổi tại boundary client (như đã làm với canvas-templates schema)
- **`null` vs missing field**: FE phải tolerant cả 2
- **Backwards compat**: BE accept cả `string[]` (V1) và structured (V2) cho `certifications`. FE auto-detect và normalize khi load

---

## 3. Data model — Schema V2

### 3.1 Sub-types

```ts
// ── upgrade ──────────────────────────────────────

interface ProductColor {            // unchanged base + 2 fields mới
  name: string;          // "Đỏ"
  hex: string;           // "#FF0000"
  is_default?: boolean;  // ← MỚI: màu mặc định khi load landing
  sort_order?: number;   // ← MỚI: thứ tự hiển thị (default: index in array)
}

interface ProductFeature {          // 2 fields mới
  label: string;
  description: string;
  icon_name?: string;    // ← MỚI: lucide icon name (vd "Sparkles", "Shield")
  media_id?: string;     // ← MỚI: alt — upload ảnh feature
  // FE convention: ưu tiên render media_id nếu có, else icon_name, else default icon
}

interface ProductCertification {    // ← MỚI: replace string[]
  name: string;          // "ISO 22000:2018"
  media_id?: string;     // logo cert (optional)
  url?: string;          // verify cert link (optional)
  description?: string;  // chi tiết
}

interface ProductIngredient {       // ← MỚI: optional upgrade từ string[] (low priority)
  name: string;
  percentage?: number;   // % composition
  description?: string;
}

// ── giữ nguyên ──────────────────────────────────

// sizes: string[] — KHÔNG upgrade
// ingredients: string[] — optional upgrade (Phase 2, nếu user feedback cần)
```

### 3.2 `ProductMediaBinding` — mở rộng

```ts
type MediaFieldKey =
  | 'hero'         // ảnh đại diện chính (1 primary, ưu tiên cho OG image)
  | 'gallery'      // gallery photos chung
  | 'detail'       // ảnh chi tiết (zoom, đường may, label…)
  | 'lifestyle'    // ảnh sử dụng/đời thường (model mặc, đặt trên bàn…)
  | 'feature'      // ảnh minh hoạ feature (1 ảnh / feature) — kết hợp ProductFeature.media_id
  | 'cert'         // logo certification — kết hợp ProductCertification.media_id
  | 'size_chart';  // ảnh bảng size chart (1 ảnh chung)

interface ProductMediaBinding {
  // existing
  id: string;
  product_id: string;
  media_id: string;
  created_at: string;
  // existing optional (loose convention before V2)
  field_key?: MediaFieldKey;
  slot_key?: string;        // free-form, có thể dùng nếu cần variant grouping khác

  // ── MỚI ──
  color_name?: string;      // link tới ProductColor.name — chỉ cho ảnh sản phẩm theo màu
  sort_order?: number;      // thứ tự hiển thị trong gallery
}
```

**Quan hệ Color ↔ Media:**
- `ProductMediaBinding.color_name = "Đỏ"` ↔ `Product.colors[].name = "Đỏ"`
- 1 màu → N bindings (gallery riêng cho màu đó)
- 1 binding → 0-1 màu (binding "general" như hero/lifestyle thì `color_name = null`)

### 3.3 `Product` — full V2

```ts
interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  category_id?: string;
  client_id?: string;
  description?: string;

  // attributes
  sizes?: string[];                          // unchanged
  colors?: ProductColor[];                   // V2
  ingredients?: string[];                    // unchanged (Phase 2 upgrade)
  certifications?: ProductCertification[];   // V2 (was string[])
  features?: ProductFeature[];               // V2

  // template fields ── MỚI ──
  is_template?: boolean;                     // default false
  template_category?: string;                // free-form: "fmcg" | "fashion" | "f&b" | "cosmetics" | ...
  template_tags?: string[];                  // free-form for search/filter
  is_public_template?: boolean;              // admin-curated library vs user's own
  source_template_id?: string;               // nếu product được clone từ template, store id để track

  status?: ProductStatus;                    // 'draft' | 'active' | 'archived'
  thumbnail_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
```

### 3.4 `ProductResponse`

Giữ nguyên — `media: ProductMediaWithAsset[]` đã đủ. Mỗi binding hydrate `asset`. FE filter theo `binding.field_key` + `binding.color_name` để build UI tabs.

---

## 4. BE API changes

### 4.1 DDL changes (PostgreSQL)

```sql
-- 4.1.a — products: thêm template fields
ALTER TABLE products
  ADD COLUMN is_template          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN template_category    TEXT,
  ADD COLUMN template_tags        TEXT[],
  ADD COLUMN is_public_template   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN source_template_id   UUID REFERENCES products(id) ON DELETE SET NULL;

-- Index để filter templates nhanh
CREATE INDEX idx_products_is_template
  ON products (is_template, status, client_id) WHERE is_template = true;
CREATE INDEX idx_products_source_template
  ON products (source_template_id) WHERE source_template_id IS NOT NULL;

-- 4.1.b — colors JSONB structure: thêm is_default + sort_order
-- (No DDL change needed — colors field is JSONB; just expand the JSON shape)

-- 4.1.c — features JSONB: add icon_name + media_id
-- (No DDL change — JSONB)

-- 4.1.d — certifications: từ string[] → JSONB structured
-- BE migration script:
--   UPDATE products SET certifications = (
--     SELECT jsonb_agg(jsonb_build_object('name', cert))
--     FROM unnest(certifications) AS cert
--   ) WHERE certifications IS NOT NULL;
-- Sau migration: change column type TEXT[] → JSONB
ALTER TABLE products
  ALTER COLUMN certifications TYPE JSONB USING (
    CASE
      WHEN certifications IS NULL THEN NULL
      ELSE (
        SELECT jsonb_agg(jsonb_build_object('name', cert))
        FROM unnest(certifications) AS cert
      )
    END
  );

-- 4.1.e — product_media_bindings: thêm color_name, sort_order
ALTER TABLE product_media_bindings
  ADD COLUMN color_name TEXT,
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX idx_product_media_bindings_color
  ON product_media_bindings (product_id, color_name, sort_order)
  WHERE color_name IS NOT NULL;
```

### 4.2 Endpoint updates

#### `POST /v1/products` — accept new fields

```jsonc
{
  "name": "Áo thun unisex",
  "colors": [
    { "name": "Đỏ", "hex": "#FF0000", "is_default": true, "sort_order": 0 },
    { "name": "Xanh", "hex": "#0000FF", "sort_order": 1 }
  ],
  "features": [
    { "label": "Cotton 100%", "description": "...", "icon_name": "Leaf" },
    { "label": "Co giãn 4 chiều", "description": "...", "media_id": "media_abc" }
  ],
  "certifications": [
    { "name": "OEKO-TEX Standard 100", "media_id": "media_logo_1", "url": "https://..." },
    { "name": "Cotton USA" }   // text-only OK
  ],
  "is_template": false,
  "template_category": null
}
```

#### `GET /v1/products` — filter

Thêm query params:
- `is_template`: `true` | `false` — filter (default: `false`)
- `template_category`: string — filter by category
- `is_public_template`: `true` | `false` — filter library vs my templates

```
GET /v1/products?is_template=true&template_category=fashion
```

#### `POST /v1/products/{id}/clone` — MỚI (clone from template)

Request:
```jsonc
{
  "name": "Áo thun của tôi",     // override name
  "as_template": false           // default false; true = clone keeps is_template=true
}
```

Response: `ProductResponse` của bản clone mới (đã copy: attributes + media bindings).

> **Alternative**: nếu BE không muốn endpoint mới, FE có thể tự clone bằng `POST /v1/products` với body từ source product + `bind_media` riêng. Nhưng endpoint server-side an toàn + atomic hơn.

#### `POST /v1/products/{id}/media/bind` — accept tags

Request (existing):
```jsonc
{
  "items": [
    { "media_id": "...", "field_key": "hero" },
    { "media_id": "...", "field_key": "gallery", "color_name": "Đỏ", "sort_order": 0 },
    { "media_id": "...", "field_key": "gallery", "color_name": "Đỏ", "sort_order": 1 },
    { "media_id": "...", "field_key": "feature", "slot_key": "feature_0" }
  ]
}
```

`color_name` + `sort_order` thêm vào item shape.

### 4.3 Migration script (one-shot)

Run khi BE deploy V2:

```sql
-- Step 1: certifications text[] → JSONB
-- (xem 4.1.d)

-- Step 2: colors JSONB — thêm is_default ngầm định cho color đầu tiên
UPDATE products SET colors = (
  SELECT jsonb_agg(
    CASE
      WHEN ord = 1 THEN c || '{"is_default": true}'::jsonb
      ELSE c
    END
  )
  FROM jsonb_array_elements(colors) WITH ORDINALITY AS arr(c, ord)
)
WHERE jsonb_array_length(colors) > 0
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(colors) AS c
    WHERE (c->>'is_default')::boolean IS TRUE
  );

-- Step 3: bindings color_name backfill (nếu có legacy data dùng slot_key='color:Đỏ')
UPDATE product_media_bindings
SET color_name = REPLACE(slot_key, 'color:', '')
WHERE slot_key LIKE 'color:%' AND color_name IS NULL;
```

### 4.4 Validation rules

| Field | Rule |
|---|---|
| `colors[].name` | non-empty, unique trong array |
| `colors[].hex` | regex `^#[0-9A-Fa-f]{6}$` |
| `colors[].is_default` | tối đa 1 = `true` per product |
| `features[].icon_name` | optional, nếu set phải match lucide icon list (BE không cần verify, FE responsability) |
| `features[].media_id` | optional, FK tới `media.id` |
| `certifications[].name` | non-empty |
| `certifications[].url` | nếu set, phải valid URL |
| `product_media_bindings.color_name` | nếu set, phải match 1 color trong product.colors[].name |
| `is_template` | boolean, default false |
| `template_category` | optional, max 50 chars |
| `template_tags` | optional, max 10 items, mỗi tag max 30 chars |

### 4.5 Authorization

| Action | Rule |
|---|---|
| Create/update product với `is_template=true` | bất kỳ user authed (mỗi user tự build templates của mình) |
| Set `is_public_template=true` | **chỉ admin role** |
| Clone từ template (any) | bất kỳ user authed |
| Clone từ template `is_public_template=true` | bất kỳ user (không cần own) |
| Clone từ template `is_public_template=false` (private) | chỉ owner (`created_by` match) |
| GET list filter `is_template=true` | trả về public templates + user's own private templates |

---

## 5. UX — UI flows

### 5.1 Discovery — `/product` list page

Thêm tab strip phía trên grid:

```
[Tất cả sản phẩm]  [Templates]  ...

Khi tab = "Templates":
┌─────────────────────────────────────────┐
│ [Filter dropdown: Library / My templates]│
│ [Search: tên template…]                  │
│ [Category chips: FMCG / Fashion / F&B]   │
└─────────────────────────────────────────┘
┌──┬──┬──┬──┐
│  │  │  │  │ ← grid templates với thumbnail + name + category badge
└──┴──┴──┴──┘
```

Mỗi card có:
- Thumbnail (default color hero image)
- Name + category badge
- `[Sử dụng template]` button (primary)
- `[⋯]` menu: Preview / Edit (nếu owner) / Delete

### 5.2 Use template flow

```
Click "Sử dụng template" trên card
  → Modal "Tạo sản phẩm từ template"
    ├─ Preview: thumbnail + summary
    ├─ Input: tên sản phẩm mới (default: "<template_name> - Bản của tôi")
    ├─ [Hủy] [Tạo sản phẩm]
  → Submit
    POST /v1/products/{template_id}/clone { name, as_template: false }
  → Redirect /product/<new_id>/information (đã prefill, status=draft)
  → User chỉ cần edit phần khác biệt + save
```

### 5.3 Save as template

```
Trên trang /product/[id]/information
  → Header thêm button "Lưu thành template" (kế "Lưu thành của tôi" pattern canvas)
  → Click → modal:
    ├─ Tên template (default: "<product_name> - Template")
    ├─ Category (dropdown: FMCG / Fashion / F&B / Cosmetics / Khác)
    ├─ Tags (free-form, ngăn cách dấu phẩy)
    ├─ Public? (checkbox, chỉ visible nếu user là admin)
    ├─ [Hủy] [Lưu template]
  → Submit
    POST /v1/products/{id}/clone { name, as_template: true, template_category, template_tags }
  → Toast "Đã lưu template — tìm trong tab Templates"
  → Stay on current page
```

### 5.4 Media manager — tabs

Refactor `ProductMediaManager` thành 4 tabs:

```
┌───────────────────────────────────────────────────┐
│ [Hero & Lifestyle] [Theo màu] [Features] [Certs] │
├───────────────────────────────────────────────────┤
│                                                   │
│ Tab "Hero & Lifestyle"                            │
│  ├─ Hero image (1 primary, dùng cho OG)           │
│  ├─ Gallery (general, không gắn màu)              │
│  └─ Lifestyle photos                              │
│                                                   │
│ Tab "Theo màu"                                    │
│  ├─ ▼ Đỏ (#ff0000) [⭐ default]    [+ Upload]    │
│  │   ├─ ảnh 1                                     │
│  │   └─ ảnh 2                                     │
│  ├─ ▼ Xanh (#0000ff)                [+ Upload]    │
│  │   └─ (chưa có ảnh)                             │
│  └─ ▼ Trắng (#ffffff)                [+ Upload]   │
│                                                   │
│ Tab "Features"                                    │
│  Mỗi feature: [Icon ⚪ / Ảnh ⚪]                   │
│  ├─ Cotton 100% [Leaf icon]                       │
│  ├─ Co giãn [📷 ảnh upload]                        │
│  └─ ...                                           │
│                                                   │
│ Tab "Certifications"                              │
│  ├─ ISO 22000 [📷 logo]                            │
│  ├─ FDA approved [📷 logo]                         │
│  └─ Vietnam Cotton (text only)                    │
└───────────────────────────────────────────────────┘
```

Filter logic:
- Tab "Hero & Lifestyle" = bindings where `field_key IN ('hero','gallery','detail','lifestyle','size_chart')` AND `color_name IS NULL`
- Tab "Theo màu" = group by `color_name`, show bindings where `field_key='gallery'` AND `color_name IS NOT NULL`
- Tab "Features" = bindings where `field_key='feature'` (slot_key gắn với feature index)
- Tab "Certifications" = bindings where `field_key='cert'` (slot_key gắn với cert index)

### 5.5 Information editor — structured

Refactor `ProductInformationEditor`:

| Section | UI cũ (V1) | UI mới (V2) |
|---|---|---|
| Sizes | Tag input string[] | (giữ nguyên) |
| Colors | List `{name, hex}` | + checkbox "Mặc định" + drag handle reorder |
| Features | List `{label, description}` | + radio "Icon / Ảnh" + icon picker (lucide search) hoặc upload ảnh |
| Certifications | Tag input string[] | List `{name, media_id?, url?}` — hàng có nút "Thêm logo" + "Thêm link verify" |
| Ingredients | Tag input string[] | (giữ nguyên — Phase 2 upgrade nếu cần) |

### 5.6 Default color UX

Trên ProductInformationEditor color list:
```
┌──────────────────────────────────────┐
│ ⠿ [⚫] Đỏ        #FF0000   [⭐] [⋯]   │ ← ⭐ = mặc định
│ ⠿ [⚫] Xanh      #0000FF   [○] [⋯]   │ ← click ○ → set as default
│ ⠿ [⚫] Trắng     #FFFFFF   [○] [⋯]   │
│ [+ Thêm màu]                         │
└──────────────────────────────────────┘
```

Click trên `[○]` của 1 màu khác → set `is_default=true` cho màu đó, `false` cho các màu khác (chỉ 1 default tại 1 thời điểm).

---

## 6. Canvas integration

Khi canvas block render từ product data (qua AI apply-product hoặc deterministic mapping):

### 6.1 HeroSplit / HeroOverlay
- Default: dùng ảnh `hero` field, hoặc fallback `gallery` đầu tiên
- Nếu có default color: ưu tiên ảnh của default color (`color_name === default_color.name`)
- AI prompt context có thể include "primary color: Đỏ" để LLM rewrite copy phù hợp

### 6.2 PhotoGallery
- Default: dùng tất cả `gallery` bindings
- Nếu user chọn 1 color filter: chỉ show bindings của color đó
- Hoặc: tabs theo color (giống Shopee variant gallery)

### 6.3 FeatureSection
- Mỗi `ProductFeature` → 1 card
- `media_id` → render ảnh thumbnail
- `icon_name` → render lucide icon
- Cả 2 missing → render default sparkles icon

### 6.4 Certification badges (mới)
- Có thể là 1 block riêng `cert_badges` (Phase 2) hoặc inline trong block khác
- `media_id` → render logo
- Không có → render text badge với border

---

## 7. BE work items

| # | Task | Priority | Estimate |
|---|---|---|---|
| BP-1 | DDL: add template columns + indexes (§4.1.a) | P0 | 0.25d |
| BP-2 | DDL: certifications text[] → JSONB + migration (§4.1.d) | P0 | 0.5d |
| BP-3 | DDL: product_media_bindings add color_name + sort_order (§4.1.e) | P0 | 0.25d |
| BP-4 | Update create/update product DTO + handler validation | P0 | 1d |
| BP-5 | Update bind media endpoint accept color_name + sort_order | P0 | 0.5d |
| BP-6 | Update list endpoint với filter `is_template`, `template_category`, `is_public_template` | P0 | 0.5d |
| BP-7 | NEW endpoint: `POST /v1/products/{id}/clone` (atomic clone product + bindings) | P0 | 1d |
| BP-8 | OpenAPI spec update | P0 | 0.5d |
| BP-9 | Migration script (legacy data) | P0 | 0.5d |
| BP-10 | (Optional) Seed 5-10 admin templates per category | P1 | 1d |
| BP-11 | E2E test: round-trip V2 + clone flow | P0 | 1d |

**Tổng BE**: P0 ~6d. Có thể parallelize 2 dev BE cho 3-4d wall time.

---

## 8. FE work items

| # | Task | LOC | Priority | Files |
|---|---|---|---|---|
| FP-1 | Update types V2 (`ProductCertification`, ProductColor extras, ProductFeature extras, MediaFieldKey, ProductMediaBinding tags, Product template fields) | ~80 | P0 | `services/rexer/types.ts` |
| FP-2 | Auto-migrate helpers — load legacy `string[]` cert/sizes wraps to V2 shape at boundary | ~60 | P0 | `services/rexer/normalizers.ts` (new) |
| FP-3 | `ProductInformationEditor` — color list with `is_default` toggle + drag reorder | ~120 | P0 | `components/modules/Product/ProductInformationEditor.tsx` |
| FP-4 | `ProductInformationEditor` — features section with icon/media radio + icon picker | ~150 | P0 | + new `IconPicker.tsx`, `FeatureMediaPicker.tsx` |
| FP-5 | `ProductInformationEditor` — certifications structured editor | ~80 | P0 | new `CertEditor.tsx` |
| FP-6 | `ProductMediaManager` refactor → 4 tabs (Hero/Color/Feature/Cert) | ~250 | P0 | `ProductMediaManager.tsx` + sub-components |
| FP-7 | `ColorVariantUploader` — upload + bind with color_name | ~120 | P0 | new |
| FP-8 | `ProductTemplateList` — list templates với filter + search | ~120 | P0 | new |
| FP-9 | Tab "Templates" trên `/product` list page | ~50 | P0 | `app/(app)/product/page.tsx` |
| FP-10 | `UseTemplateDialog` — modal use template + clone | ~80 | P0 | new |
| FP-11 | `SaveAsTemplateDialog` — save current product as template | ~80 | P0 | new |
| FP-12 | Endpoint params + new `clone()` wrapper | ~30 | P0 | `services/rexer/endpoints.ts` |
| FP-13 | i18n strings VI + EN (template + structured attrs) | ~30 | P0 | `i18n/messages/app/{vi,en}.json` |
| FP-14 | Canvas blocks — read color-tagged media for HeroSplit/PhotoGallery | ~80 | P0 | `block-editor/blocks/*.tsx` |
| FP-15 | `applyProduct.ts` — pass color-tagged media + use is_default color | ~50 | P0 | `block-editor/applyProduct.ts` |
| FP-16 | Visual regression — 6 block × default vs custom color | ~80 | P0 | `scripts/visual-tests/` |

**Tổng FE**: P0 ~1430 LOC, ~7-8d 1 dev.

---

## 9. Migration plan (rollout order)

### Tuần 1 — Foundation
- BP-1, BP-2, BP-3, BP-9 (BE) — DDL + migration script
- FP-1, FP-2 (FE) — types + normalizers
- BE deploy V2 với data migrated. FE chưa render mới.

### Tuần 2 — Editor V2
- BP-4, BP-5, BP-6, BP-8 (BE) — endpoints
- FP-3..FP-7 (FE) — Information editor + Media manager tabs
- E2E: tạo product với colors có default + features có icon + cert có logo. Bind media với color_name.

### Tuần 3 — Template flow
- BP-7 (BE) — clone endpoint
- FP-8..FP-12 (FE) — template list + use/save dialogs
- BP-10 (BE optional) — seed admin templates
- E2E: save as template + use template + verify clone giữ media bindings

### Tuần 4 — Canvas integration + polish
- FP-14, FP-15 (FE) — canvas block reads tagged media
- FP-16 (FE) — visual regression
- BP-11 (BE) — E2E test
- UAT + bug fix

---

## 10. Acceptance criteria

### Attributes V2
- [ ] Create product với 3 colors, 1 marked `is_default` → save → reload → default đúng
- [ ] Upload 3 ảnh cho color "Đỏ" → save → reload → ảnh hiển thị dưới tab "Theo màu" → group "Đỏ"
- [ ] Feature có icon `Sparkles` → render icon trên landing
- [ ] Feature có media_id → render ảnh thay icon
- [ ] Cert "ISO 22000" với logo → landing show logo. Cert "Cotton VN" text-only → show text
- [ ] Legacy product (sizes/certs là `string[]`) load OK, auto-migrate to structured at FE boundary

### Template flow
- [ ] User Click "Lưu thành template" trên product → modal → save → product mới với `is_template=true`
- [ ] Tab "Templates" hiển thị templates với thumbnail + category badge
- [ ] Filter "My templates" / "Library" hoạt động
- [ ] Click "Sử dụng template" → modal nhập tên → submit → tạo product mới với data clone (kể cả media bindings)
- [ ] Cloned product có `source_template_id` trỏ về template gốc
- [ ] Public template chỉ admin set được. User thường tạo private template OK
- [ ] Delete template → các product clone trước đó vẫn còn (CASCADE NULL trên `source_template_id`)

### Canvas integration
- [ ] AI apply-product → HeroSplit dùng ảnh của default color
- [ ] PhotoGallery filter theo color → show ảnh tương ứng
- [ ] FeatureSection render icon hoặc ảnh tương ứng
- [ ] Cert badges render logo hoặc text fallback

### Backwards compat
- [ ] Product cũ (V1 wire format) load không lỗi → FE auto-migrate
- [ ] Save lại từ FE → ghi V2 format
- [ ] BE accept cả V1 + V2 trong 1 sprint, drop V1 support sau khi all data migrated

---

## 11. Open questions

1. **Ingredient structured upgrade**: có cần `{name, percentage, description}` không? — Hiện đề xuất: Phase 2, đợi user feedback (Phase 1 giữ `string[]`)
2. **Variant matrix (Color × Size)**: nếu user cần SKU + price + stock per variant → upgrade lên L3 schema. — Hiện đề xuất: KHÔNG cho V2 (Rexer là canvas/landing builder, không phải shop engine). Track riêng nếu user yêu cầu.
3. **Template versioning**: khi admin update template library, các product đã clone có nên update theo? — Hiện đề xuất: KHÔNG. Clone là one-shot snapshot. Nếu cần "follow template", thêm `inherit_from_template_id` field sau (Phase 3).
4. **Template marketplace** (user share template ↔ user khác mua): Phase 3, không trong scope.
5. **Image variants per device** (mobile crop khác desktop): đã có trong canvas-block-responsive-spec — nhưng chưa apply cho product images. Có nên include không?
   - Đề xuất: KHÔNG cho V2. Product image dùng generic `<img srcSet>` với BE-generated thumbnails (1x/2x). Per-device crop là quá đủ.

---

## 12. References

- `docs/be-api-products-spec.md` — schema gốc V1, cần extend (5.1, 5.2, 5.3)
- `docs/be-canvas-templates-spec.md` — pattern template tham khảo (template metadata, clone endpoint)
- `docs/canvas-block-responsive-spec.md` — pattern spec format (sections, work items)
- `docs/be-issues-master.md` — track các bug-link nếu phát sinh trong rollout

---

## 13. Cross-team checklist

### BE owner cần
1. [ ] Confirm DDL changes OK với current DB load (production migration risk)
2. [ ] Implement `POST /v1/products/{id}/clone` atomic (BE-7) — clone product + media_bindings trong 1 transaction
3. [ ] Run migration script trên staging trước, verify legacy products load OK
4. [ ] Update OpenAPI/Swagger
5. [ ] Reply MR + linked issue ID nếu có problem

### FE owner cần
1. [ ] FE-1, FE-2 ship trước (types + normalizers) → unlock UI work
2. [ ] Visual regression baseline trước khi code editor V2
3. [ ] Documentation update — add screenshots into this spec sau khi UI hoàn thành

### QA / Content team cần
1. [ ] (P1) Seed 5-10 admin templates với content thật cho 5 ngành (FMCG / Fashion / F&B / Cosmetics / Tech)
2. [ ] Test plan cover migration scenarios (V1 product + V2 product mix)
