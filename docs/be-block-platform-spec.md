## BE Spec — Block Platform (Block Management + Saved Blocks)

**FE owner:** @Lantm
**Date:** 2026-05-15
**Status:** Đề xuất — chờ BE review & ack
**Scope:** Tổng hợp 2 yêu cầu lớn — (1) BE quản lý danh mục block (admin) + (2) user save block để tái sử dụng.

**Related (đã tách spec gốc, doc này gộp + chi tiết hoá):**
- `docs/be-block-management-spec.md` — block-type registry & admin API
- `docs/be-saved-blocks-spec.md` — saved blocks per user
- `docs/be-block-types-wave3-spec.md` — content schema chi tiết cho stories / split_screen / quiz / poll / carousel_3d / flipbook / panorama
- `docs/be-extra-elements-spec.md` — 10 extra-element kinds
- `docs/be-canvas-templates-spec.md` — canvas_data v2.0 base
- `docs/canvas-block-responsive-spec.md` — wire format camelCase, DeviceVariants
- FE source: `src/components/modules/CanvasTemplate/block-editor/types.ts`

---

## Mục lục

1. [Bối cảnh & mục tiêu](#1-bối-cảnh--mục-tiêu)
2. [Phần A — Block-type Registry (admin)](#2-phần-a--block-type-registry-admin)
   - 2.1 [Catalog 14 block types](#21-catalog-14-block-types)
   - 2.2 [Common Block fields](#22-common-block-fields)
   - 2.3 [Per-type content schema chi tiết](#23-per-type-content-schema-chi-tiết)
   - 2.4 [Extra-element catalog (10 kinds)](#24-extra-element-catalog-10-kinds)
   - 2.5 [DB schema — `block_type_registry`](#25-db-schema--block_type_registry)
   - 2.6 [Admin endpoints](#26-admin-endpoints)
   - 2.7 [User-facing endpoint](#27-user-facing-endpoint)
   - 2.8 [Per-workspace override (phase 2)](#28-per-workspace-override-phase-2)
3. [Phần B — Saved Blocks (user library)](#3-phần-b--saved-blocks-user-library)
   - 3.1 [Phase 1 — FE localStorage (đã ship)](#31-phase-1--fe-localstorage-đã-ship)
   - 3.2 [Phase 2 — BE-backed](#32-phase-2--be-backed)
   - 3.3 [DB schema — `saved_blocks`](#33-db-schema--saved_blocks)
   - 3.4 [Endpoints](#34-endpoints)
   - 3.5 [Migration localStorage → BE](#35-migration-localstorage--be)
   - 3.6 [Thumbnail](#36-thumbnail)
4. [Validation rules — bắt buộc enforce](#4-validation-rules--bắt-buộc-enforce)
5. [Error code](#5-error-code)
6. [Mapping FE ↔ BE](#6-mapping-fe--be)
7. [Migration & versioning](#7-migration--versioning)
8. [Test scenarios BE phải cover](#8-test-scenarios-be-phải-cover)
9. [FE plan tiếp theo](#9-fe-plan-tiếp-theo)
10. [Câu hỏi cần BE confirm (tổng hợp)](#10-câu-hỏi-cần-be-confirm-tổng-hợp)
11. [Phụ lục — payload mẫu](#11-phụ-lục--payload-mẫu)

---

## 1. Bối cảnh & mục tiêu

FE đã mở rộng đáng kể block-editor sau các đợt wave 1 → wave 4:

- **14 block types** đang ship (từ 7 ban đầu lên 14): `hero_split`, `hero_overlay`, `feature_section`, `photo_gallery`, `booking_form`, `cta_section`, `image_carousel`, `stories`, `split_screen`, `quiz`, `poll`, `carousel_3d`, `flipbook`, `panorama`.
- **10 extra-element kinds**: `text`, `edit_text`, `photo`, `video`, `hotspot`, `compare`, `range`, `countdown`, `reveal`, `spin_wheel`.
- User có thể **save block đã tuỳ chỉnh** thành "saved block" để reuse — hiện tại FE đang dùng `localStorage` (Phase 1) và muốn migrate sang BE.

Doc này đưa 2 yêu cầu vào cùng 1 spec để BE schedule trong một patch:

- **Phần A — Block Management:** BE thêm bảng `block_type_registry` + admin endpoints để platform admin enable/disable/version/deprecate block type theo workspace mà KHÔNG cần FE deploy lại.
- **Phần B — Saved Blocks:** BE thêm bảng `saved_blocks` + user endpoints để user save block và list/insert lại từ bất kỳ canvas nào.

Cả 2 đều phụ thuộc vào validator `canvas_data` v2.0 đã có sẵn (`be-canvas-templates-spec.md`) — chỉ cần cập nhật enum + 14 schema content.

---

## 2. Phần A — Block-type Registry (admin)

### 2.1. Catalog 14 block types

| `blockType` | Mục đích | Element keys (cho elementStyles/order/positions) |
|---|---|---|
| `hero_split` | Hero 2 cột (text + ảnh) | `eyebrow`, `title`, `description`, `cta`, `stats`, `image` |
| `hero_overlay` | Hero full-bleed có overlay | `tag`, `title`, `subtitle`, `cta`, `background` |
| `feature_section` | List 3-6 tiện ích/feature | `eyebrow`, `title`, `description`, `features` |
| `photo_gallery` | Mosaic ≤ 5 ảnh | `eyebrow`, `title`, `description`, `photos` |
| `booking_form` | Form đăng ký lead | `eyebrow`, `title`, `description`, `reasons`, `form`, `submit` |
| `cta_section` | CTA cuối trang full-bleed | `eyebrow`, `title`, `subtitle`, `primary`, `secondary`, `background` |
| `image_carousel` | Slider ảnh 1 slide/view | `eyebrow`, `title`, `description`, `slides` |
| `stories` | Insta-style story panels | `eyebrow`, `title`, `slides` |
| `split_screen` | So sánh 2-4 lựa chọn | `eyebrow`, `title`, `description`, `views` |
| `quiz` | Multi-question quiz + result bucket | `eyebrow`, `title`, `description`, `questions`, `results` |
| `poll` | Single-question poll | `eyebrow`, `question`, `options` |
| `carousel_3d` | Coverflow 3D — extends `image_carousel` | giống `image_carousel` |
| `flipbook` | Catalog lật trang | `eyebrow`, `title`, `pages` |
| `panorama` | CSS-only 360° equirectangular viewer | `eyebrow`, `title`, `description`, `imageUrl` |

> **Lưu ý:** Element keys ở trên dùng để FE/BE biết khi user override style/order/position cho element nào trong block. KHÔNG phải required fields của content. Required fields xem §2.3 & §4.

### 2.2. Common Block fields

Schema chung cho tất cả 14 block types (giống nhau, chỉ khác `contentVi/En` shape):

```ts
interface Block {
  id: string;                                          // FE-generated UUID, stable
  blockType: BlockType;                                // discriminator (1 trong 14)
  name: string;                                        // admin label, ≤ 200 char
  isVisible: boolean;                                  // skip render khi false
  thumbnail?: string;                                  // URL CDN — optional, FE generate

  contentVi: DeviceVariants<BlockContent>;             // bắt buộc desktop
  contentEn: DeviceVariants<BlockContent>;             // optional, fallback contentVi

  elementStyles?: DeviceVariants<ElementStylesMap>;    // CSS overrides per element key
  background?:    DeviceVariants<BlockBackground>;     // block-level bg (color + image)
  elementOrder?:  DeviceVariants<string[]>;            // re-order fixed elements
  elementPositions?: DeviceVariants<ElementPositionsMap>; // free-drag offsets

  extraElements?: ExtraElement[];                      // user-added free-drag elements (xem §2.4)

  motion?: DeviceVariants<BlockMotion>;                // per-block motion timeline
}

type DeviceVariants<T> = {
  desktop:  T;          // bắt buộc cho contentVi
  tablet?:  Partial<T>; // optional override
  mobile?:  Partial<T>; // optional override (merge xuống desktop)
};
```

**Wire format:** **camelCase** (match validator hiện tại, không snake_case).

**Đường đi:** `canvas_data.blocks[]` trong `POST/PATCH /v1/canvas-templates`.

### 2.3. Per-type content schema chi tiết

> Đầy đủ schema từng kind xem `docs/be-block-types-wave3-spec.md` §3 & §9 & §10. Tóm tắt:

#### 2.3.1. `hero_split`

```ts
interface HeroSplitContent {
  eyebrow?:     string;       // ≤ 60
  title:        string;       // required, ≤ 200
  description?: string;       // ≤ 500
  ctaText?:     string;       // ≤ 80
  ctaLink?:     string;       // http(s)
  imageUrl:     string;       // required, http(s)
  imageTransform?: ImageTransform;
  stats?: HeroSplitStat[];    // ≤ 6
}
interface HeroSplitStat { id: string; value: string; label: string }
```

#### 2.3.2. `hero_overlay`

```ts
interface HeroOverlayContent {
  tag?:           string;     // ≤ 60
  title:          string;     // required, ≤ 200
  subtitle?:      string;     // ≤ 300
  ctaText:        string;     // required, ≤ 80
  ctaLink?:       string;     // http(s)
  backgroundUrl:  string;     // required, http(s)
  backgroundTransform?: ImageTransform;
}
```

#### 2.3.3. `feature_section`

```ts
interface FeatureItem {
  id:    string;
  label: string;              // required, ≤ 80
  body?: string;              // ≤ 300
  icon:  string;              // required, ∈ Lucide icon whitelist (xem §4.3)
}
interface FeatureSectionContent {
  eyebrow?:     string;
  title:        string;       // required
  description?: string;
  features:     FeatureItem[];// 1..6
}
```

#### 2.3.4. `photo_gallery`

```ts
interface GalleryPhoto {
  id:        string;
  url:       string;          // required, http(s)
  caption?:  string;          // ≤ 200
  transform?: ImageTransform;
}
interface PhotoGalleryContent {
  eyebrow?:     string;
  title:        string;       // required
  description?: string;
  photos:       GalleryPhoto[]; // 1..5
}
```

#### 2.3.5. `booking_form`

```ts
interface BookingReason { id: string; label: string }
interface BookingFormContent {
  eyebrow?:     string;
  title:        string;       // required
  description?: string;
  reasons:      BookingReason[]; // ≤ 8
  submitText:   string;       // required, ≤ 50
  noteText?:    string;       // ≤ 200
}
```

#### 2.3.6. `cta_section`

```ts
interface CtaSectionContent {
  eyebrow?:        string;
  title:           string;    // required
  subtitle?:       string;
  primaryText:     string;    // required, ≤ 80
  primaryLink?:    string;    // http(s)
  secondaryText?:  string;
  secondaryLink?:  string;
  backgroundUrl?:  string;    // http(s)
  backgroundTransform?: ImageTransform;
}
```

#### 2.3.7. `image_carousel`

```ts
interface CarouselSlide {
  id:        string;
  imageUrl:  string;          // required, http(s)
  caption?:  string;
  ctaText?:  string;
  ctaLink?:  string;
  transform?: ImageTransform;
}
interface ImageCarouselContent {
  eyebrow?:        string;
  title?:          string;
  description?:    string;
  slides:          CarouselSlide[]; // 1..20
  autoplayMs?:     number;    // 0 hoặc 500..30000 (0 = tắt autoplay)
  showPagination?: boolean;
  showNavArrows?:  boolean;
}
```

#### 2.3.8. `stories`

```ts
interface StoriesSlide {
  id:         string;
  mediaUrl:   string;         // required, http(s)
  mediaType?: 'image' | 'video';
  title?:     string;         // ≤ 120
  body?:      string;         // ≤ 500
  ctaText?:   string;         // ≤ 30
  ctaUrl?:    string;
  durationMs?: number;        // 1000..30000
}
interface StoriesContent {
  eyebrow?:     string;
  title?:       string;
  slides:       StoriesSlide[]; // 1..20
  defaultDurationMs?: number; // 1000..30000, default 4500
  loop?:        boolean;
  showProgress?: boolean;
}
```

#### 2.3.9. `split_screen`

```ts
interface SplitScreenView {
  id:        string;
  label:     string;          // required, ≤ 30
  imageUrl?: string;
  title:     string;          // required, ≤ 120
  body?:     string;          // ≤ 300
  ctaText?:  string;          // ≤ 30
  ctaUrl?:   string;
}
interface SplitScreenContent {
  eyebrow?:     string;
  title?:       string;
  description?: string;
  views:        SplitScreenView[]; // 2..4 (phase 1)
  defaultIndex?: number;      // [0, views.length)
}
```

#### 2.3.10. `quiz`

```ts
interface QuizOption { id: string; label: string; score: number }
interface QuizQuestion {
  id:       string;
  prompt:   string;           // required, ≤ 200
  imageUrl?: string;
  options:  QuizOption[];     // 2..6
}
interface QuizResult {
  id:        string;
  minScore:  number;          // ≥ 0 (recommended; FE picks highest minScore ≤ totalScore)
  title:     string;          // required, ≤ 120
  body?:     string;          // ≤ 500
  imageUrl?: string;
  ctaText?:  string;
  ctaUrl?:   string;
}
interface QuizContent {
  eyebrow?:     string;
  title?:       string;
  description?: string;
  questions:    QuizQuestion[];  // 1..10
  results:      QuizResult[];    // 1..10, recommend ≥ 1 với minScore=0
  nextLabel?:   string;       // ≤ 30, default "Tiếp"
  finishLabel?: string;       // ≤ 30, default "Xem kết quả"
}
```

#### 2.3.11. `poll`

```ts
interface PollOption { id: string; label: string; baseVotes?: number }
interface PollContent {
  eyebrow?:                string;
  question:                string;     // required, ≤ 200
  options:                 PollOption[]; // 2..6
  hideResultsUntilVoted?:  boolean;
  voteLabel?:              string;     // ≤ 30
  thankYouText?:           string;     // ≤ 120
}
```

#### 2.3.12. `carousel_3d`

```ts
interface Carousel3dContent extends ImageCarouselContent {
  mode3d?:        'flat' | '3d-coverflow';
  perspectivePx?: number;     // 400..3000
}
```

#### 2.3.13. `flipbook`

```ts
interface FlipbookPage {
  id:        string;
  imageUrl:  string;          // required, http(s)
  caption?:  string;          // ≤ 200
}
interface FlipbookContent {
  eyebrow?:        string;
  title?:          string;
  pages:           FlipbookPage[]; // 2..30
  aspect?:         '3/4' | '4/3' | '1/1' | '16/9';
  showPageNumbers?: boolean;
}
```

#### 2.3.14. `panorama`

```ts
interface PanoramaContent {
  eyebrow?:     string;
  title?:       string;
  description?: string;
  imageUrl:     string;       // required, http(s), aspect 2:1
  initialYaw?:  number;       // 0..1
  sensitivity?: number;       // 0.25..3
  hint?:        string;       // ≤ 30
}
```

### 2.4. Extra-element catalog (10 kinds)

Xem chi tiết `docs/be-extra-elements-spec.md` §3 (FE đã mở rộng từ 4 → 10 kinds, doc đó cần update bổ sung 6 kind mới).

| `kind` | Mục đích | Required content fields |
|---|---|---|
| `text` | Label tĩnh (có animation, counter, marquee) | `text` |
| `edit_text` | Form input cho end-user | `placeholder`, `fieldName`, `inputType`, `isRequired` |
| `photo` | Ảnh từ media | `mediaId` |
| `video` | Video URL hoặc media | `source` (`url`/`media`) + `url` hoặc `mediaId` |
| `hotspot` | Pin + popover khi click | `title` (popover header) |
| `compare` | Before/after slider | `beforeUrl`, `afterUrl` |
| `range` | Slider input liên tục | `fieldName`, `min`, `max` |
| `countdown` | Countdown đến ISO time | `targetIso` |
| `reveal` | Scratch / spotlight reveal | `coverUrl`, `revealUrl`, `mode` |
| `spin_wheel` | Wheel of fortune | `segments[].label` (≥2) |

**Common base** (mọi kind đều có):
```ts
{
  id:        string;
  kind:      ExtraElementKind;
  position:  { x: number; y: number };       // px relative to block
  size:      { width: number; height: number };
  style?:    ExtraElementStyle;
  rotation?: number;
  zIndex?:   number;
  tracking?: ExtraElementTracking;
  isVisible?: boolean;
}
```

**Cap:** `extraElements.length` ≤ 50 / block.

### 2.5. DB schema — `block_type_registry`

```sql
CREATE TABLE block_type_registry (
  type            TEXT PRIMARY KEY,             -- 'hero_split' … 'panorama'
  label_vi        TEXT NOT NULL,                -- "Hero Split"
  label_en        TEXT NOT NULL,
  accent_color    TEXT NOT NULL,                -- hex (#0A0A0A) cho AddBlockDialog preview
  description_vi  TEXT,                         -- mô tả ngắn cho user (admin manage page)
  description_en  TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium      BOOLEAN NOT NULL DEFAULT FALSE, -- gated theo plan
  min_app_version TEXT,                         -- semver, hide khỏi FE version cũ
  schema_version  TEXT NOT NULL DEFAULT '2.0',  -- để FE biết cần migrate khi đổi
  json_schema     JSONB,                        -- optional — full JSON schema cho content validator
  sort_order      INT NOT NULL DEFAULT 100,
  deprecated_at   TIMESTAMPTZ,                  -- soft deprecate; template cũ vẫn render
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX block_type_registry_active_idx
  ON block_type_registry (sort_order ASC)
  WHERE is_active = TRUE AND deprecated_at IS NULL;
```

**Seed migration:** 14 row tương ứng 14 block types hiện tại. Mỗi row: `label_vi/en` lấy từ `factory.ts:NAME_BY_TYPE`, `accent_color` lấy từ `BLOCK_TYPE_META` trong `types.ts`, `sort_order` theo thứ tự trong `ORDERED_TYPES` của `AddBlockDialog.tsx`.

### 2.6. Admin endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/v1/admin/block-types` | admin | List tất cả (kể cả inactive/deprecated) — admin manage page |
| `GET` | `/v1/admin/block-types/{type}` | admin | Detail 1 type |
| `POST` | `/v1/admin/block-types` | admin | Tạo type mới (phase 2 — đăng ký type custom) |
| `PATCH` | `/v1/admin/block-types/{type}` | admin | Update label / accent / is_active / json_schema / sort_order |
| `DELETE` | `/v1/admin/block-types/{type}` | admin | Soft delete (`deprecated_at = NOW()`); KHÔNG cứng xoá |

**Admin auth:** dùng JWT scope `admin` hiện có (giống `/v1/admin/canvas-templates`).

**Admin list response (`GET /v1/admin/block-types`):**

```jsonc
{
  "items": [
    {
      "type": "hero_split",
      "label_vi": "Hero Split",
      "label_en": "Hero Split",
      "accent_color": "#0A0A0A",
      "description_vi": "Hero 2 cột text + ảnh",
      "description_en": "Two-column hero",
      "is_active": true,
      "is_premium": false,
      "min_app_version": null,
      "schema_version": "2.0",
      "sort_order": 10,
      "deprecated_at": null,
      "created_at": "2026-05-15T11:00:00Z",
      "updated_at": "2026-05-15T11:00:00Z"
    }
    /* … 13 còn lại */
  ],
  "total": 14
}
```

**Admin PATCH body:** tất cả field optional, chỉ field truyền sẽ update. `version` field cho optimistic lock — defer phase 2.

### 2.7. User-facing endpoint

```
GET /v1/block-types?lang=vi
```

**Auth:** user (cả end-user thường + admin).

**Filter logic:**
- `is_active = TRUE`
- `deprecated_at IS NULL`
- `min_app_version ≤ x-rexer-fe-version` (header)
- (Phase 2) intersect với `workspace_block_type_overrides` — xem §2.8

**Response:**

```jsonc
{
  "items": [
    {
      "type": "hero_split",
      "label": "Hero Split",            // resolved theo lang param (vi/en)
      "description": "Hero 2 cột text + ảnh",
      "accent_color": "#0A0A0A",
      "is_premium": false,
      "schema_version": "2.0",
      "sort_order": 10
    },
    {
      "type": "stories",
      "label": "Stories",
      "accent_color": "#0EA5E9",
      "is_premium": true,
      "schema_version": "2.0",
      "sort_order": 80
    }
    /* … */
  ]
}
```

**Cache:** response cache 5 phút (Cache-Control: `max-age=300`), invalidate qua admin PATCH/POST/DELETE.

### 2.8. Per-workspace override (phase 2)

Defer. Bảng `workspace_block_type_overrides`:

```sql
CREATE TABLE workspace_block_type_overrides (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type         TEXT NOT NULL REFERENCES block_type_registry(type),
  is_enabled   BOOLEAN NOT NULL,
  PRIMARY KEY (workspace_id, type)
);
```

`GET /v1/block-types` query workspace context (từ JWT) và intersect: nếu có row override cho workspace + type → dùng `is_enabled`; nếu không → fallback `block_type_registry.is_active`.

Admin endpoint phụ trợ (defer):
- `GET /v1/admin/workspaces/{id}/block-types`
- `PATCH /v1/admin/workspaces/{id}/block-types/{type}` body `{ is_enabled: bool }`

---

## 3. Phần B — Saved Blocks (user library)

### 3.1. Phase 1 — FE localStorage (đã ship)

FE đã ship Phase 1 dùng `localStorage[rexer:saved-blocks]`:

```ts
interface SavedBlock {
  id:         string;        // sb_<random>
  name:       string;
  thumbnail?: string;        // defer
  block:      Block;         // full block payload — incl. extraElements
  createdAt:  string;        // ISO
}
```

Helpers tại `src/components/modules/CanvasTemplate/block-editor/savedBlocks.ts`: `list / save / rename / delete / instantiate`.

**Hành vi hiện tại:**
- Lưu cục bộ trong trình duyệt user — mất khi clear cookies / đổi máy
- Cross-tab sync qua `storage` event + custom `rexer:saved-blocks:changed`

⚠️ **Hạn chế:** không sync giữa thiết bị; không share giữa user trong cùng team.

### 3.2. Phase 2 — BE-backed

Mục tiêu: thay localStorage bằng BE-stored, sync xuyên thiết bị.

**Auth scope:** user-scope (mỗi row có `user_id`, chỉ owner đọc/sửa/xoá của mình).

**Quota:** Cap **100 saved blocks/user** (phase 1). Phase 2 có thể tier-based — xem §10 Q1.

### 3.3. DB schema — `saved_blocks`

```sql
CREATE TABLE saved_blocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  block_type    TEXT NOT NULL,            -- denormalised from block.blockType (filter/index)
  block         JSONB NOT NULL,           -- full Block payload (xem §2.2)
  thumbnail_url TEXT,                     -- nullable
  version       INT NOT NULL DEFAULT 1,   -- optimistic lock
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX saved_blocks_user_active_idx
  ON saved_blocks (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX saved_blocks_user_type_idx
  ON saved_blocks (user_id, block_type)
  WHERE deleted_at IS NULL;
```

**`block` column** là JSONB — không có DB constraint cứng, BE validator chạy ở app layer khi POST/PATCH (cùng validator với `canvas_data.blocks[]` để tránh duplicate code).

**Bổ sung user profile:** thêm field `has_migrated_saved_blocks BOOLEAN DEFAULT FALSE` vào bảng `users` (hoặc `user_settings`) — phục vụ migration flow §3.5.

### 3.4. Endpoints

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/v1/saved-blocks?page=1&limit=50&block_type=hero_split` | List của user hiện tại (paginated, filter optional) |
| `GET` | `/v1/saved-blocks/{id}` | Detail 1 saved-block |
| `POST` | `/v1/saved-blocks` | Tạo mới |
| `PATCH` | `/v1/saved-blocks/{id}` | Rename / update thumbnail / replace block payload (optimistic lock) |
| `DELETE` | `/v1/saved-blocks/{id}` | Soft delete (set `deleted_at`) |
| `POST` | `/v1/saved-blocks/import` | Bulk import từ FE localStorage (migration aid, 1-time per user) |

Optional, defer phase 3:
- `POST /v1/saved-blocks/{id}/restore` — restore soft-deleted
- `POST /v1/saved-blocks/{id}/share` — share với user khác trong team
- `GET /v1/admin/saved-blocks` — admin xem toàn bộ

#### 3.4.1. List response

```jsonc
{
  "items": [
    {
      "id": "sb_<uuid>",
      "name": "Hero Epic Tower",
      "thumbnail_url": "https://cdn…/sb_xxx.jpg",
      "block_type": "hero_overlay",
      "block": { /* full Block payload */ },
      "version": 1,
      "created_at": "2026-05-14T08:00:00Z",
      "updated_at": "2026-05-14T08:30:00Z",
      "user_id": "<uuid>"
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 4,
  "total_pages": 1
}
```

#### 3.4.2. Create request

```jsonc
{
  "name": "Hero Epic Tower",
  "block": { /* Block payload — match canvas_data block schema v2.0 */ },
  "thumbnail_url": null
}
```

Response: `201 Created` + full `SavedBlock` object (như item ở §3.4.1).

#### 3.4.3. Update request

```jsonc
{
  "name": "Hero Epic Tower v2",     // optional
  "block": { /* … */ },              // optional — replace full payload
  "thumbnail_url": "https://…",      // optional
  "version": 1                       // REQUIRED — optimistic lock; phải match version hiện tại
}
```

Conflict → `409 ERR_CANVAS_VERSION_CONFLICT` với body chứa `current_version`.

#### 3.4.4. Validation (POST/PATCH)

- `name`: 1..200 char, không bắt buộc unique.
- `block`: validate cùng schema `canvas_data.blocks[]` v2.0 (kể cả `extraElements`).
- `block.blockType` ∈ `block_type_registry.type WHERE is_active = TRUE`.
- Cap 100/user → khi đạt → `429 ERR_SAVED_BLOCK_LIMIT`.

#### 3.4.5. Import endpoint

`POST /v1/saved-blocks/import`:

```jsonc
{
  "items": [
    {
      "name": "Hero Epic Tower",
      "block": { /* … */ },
      "created_at": "2026-05-14T08:00:00Z"  // FE preserves the timestamp
    }
  ]
}
```

Response:

```jsonc
{ "created": 4, "skipped": 0, "items": [/* 4 SavedBlock objects */] }
```

**Skip logic:** BE skip khi user đã có ≥ 100 saved blocks (đếm trước import, không partial). FE hiển thị warning.

### 3.5. Migration localStorage → BE

FE flow (1-time per user, idempotent):

1. Login → FE check `localStorage[rexer:saved-blocks]` có data + `me.has_migrated_saved_blocks === false`
2. POST `/v1/saved-blocks/import` với toàn bộ items localStorage
3. Response → merge với BE list, render
4. Clear localStorage key
5. PATCH `/v1/me` với `{ "has_migrated_saved_blocks": true }`

**Edge case:**
- User đăng nhập trên 2 thiết bị cùng lúc: thiết bị A migrate trước → flag set true → thiết bị B login sau thấy flag true → KHÔNG migrate (giữ nguyên localStorage hoặc clear).
- User clear localStorage trước khi migrate: flag vẫn false → migrate sẽ no-op (items rỗng).

### 3.6. Thumbnail

Phase 2 vẫn defer. Options khi đến phase 3:

- **Option A** — BE generate thumbnail tự động khi POST/PATCH (headless render). **Phức tạp**, cần dependency Chromium.
- **Option B** — FE chụp screenshot bằng `html2canvas` rồi upload vào media (existing `/v1/media/upload`), URL set trong `thumbnail_url`. **Đơn giản hơn**.

**Recommend Option B.**

Phase 2: bỏ thumbnail. FE hiển thị icon theo `block_type` thay thế (đã làm).

---

## 4. Validation rules — bắt buộc enforce

BE validator chạy ở 2 chỗ:
1. **`POST/PATCH /v1/canvas-templates`** với `canvas_data.blocks[]`
2. **`POST/PATCH /v1/saved-blocks`** với `block` field

Validator nên là **cùng 1 module** để tránh divergence.

### 4.1. Top-level Block

| Rule | Error code |
|---|---|
| `blockType` ∈ active registry | `ERR_CANVAS_INVALID_BLOCK_TYPE` |
| `name` ≤ 200 | `ERR_CANVAS_INVALID` |
| `contentVi.desktop` required | `ERR_CANVAS_INVALID` |
| `contentEn.desktop` optional — nếu có phải pass cùng schema | `ERR_CANVAS_INVALID` |
| `extraElements.length` ≤ 50 | `ERR_CANVAS_INVALID` |

### 4.2. Per-block content caps

| Block type | Caps & rules |
|---|---|
| `hero_split` | `title` ≤ 200, `imageUrl` URL, `stats.length` ≤ 6 |
| `hero_overlay` | `title` required, `backgroundUrl` URL, `ctaText` required ≤ 80 |
| `feature_section` | `features.length` 1..6, `icon` ∈ Lucide whitelist (§4.3) |
| `photo_gallery` | `photos.length` 1..5 |
| `booking_form` | `reasons.length` ≤ 8, `submitText` required ≤ 50 |
| `cta_section` | `title`, `primaryText` required |
| `image_carousel` | `slides.length` 1..20, `autoplayMs` 0 hoặc 500..30000 |
| `stories` | `slides.length` 1..20, `defaultDurationMs` 1000..30000, `mediaType ∈ {image, video}` |
| `split_screen` | `views.length` 2..4 (phase 1), `defaultIndex ∈ [0, views.length)` |
| `quiz` | `questions.length` 1..10, mỗi `options.length` 2..6, `results.length` 1..10, `id` unique trong block, `minScore ≥ 0` |
| `poll` | `options.length` 2..6, `id` unique, `baseVotes ≥ 0`, `question` ≤ 200 |
| `carousel_3d` | giống `image_carousel` + `perspectivePx` 400..3000, `mode3d ∈ {flat, 3d-coverflow}` |
| `flipbook` | `pages.length` 2..30, `aspect ∈ {3/4, 4/3, 1/1, 16/9}`, `caption` ≤ 200 |
| `panorama` | `imageUrl` required + aspect 2:1 (warn-only, không reject), `initialYaw ∈ [0,1]`, `sensitivity ∈ [0.25, 3]`, `hint ≤ 30` |

### 4.3. URL & icon whitelist

- **URL fields:** validate scheme `http/https` only. Cấm `javascript:`, `file:`, `ftp:`. Cho phép `data:image/*;base64,…` chỉ cho `thumbnail` field (≤ 100KB).
- **Icon whitelist** cho `feature_section.features[].icon`: BE giữ list subset Lucide icon (vd ~200 icon common). FE pass full Lucide string, BE reject nếu không có trong whitelist. Whitelist nên expose qua `GET /v1/block-types/feature_section/icons` (defer phase 2; phase 1 hard-code trong validator).

### 4.4. Extra-element

Per `be-extra-elements-spec.md` §3. BE thêm 6 kind mới (compare/range/countdown/reveal/spin_wheel + cập nhật `text` có thêm `animation`/`counter`/`marquee`) vào validator. Cap `extraElements.length` ≤ 50/block.

### 4.5. ID uniqueness

`id` trong `slides[]`, `options[]`, `questions[]`, `results[]`, `views[]`, `pages[]`, `features[]`, `stats[]`, `photos[]`, `reasons[]`, `segments[]`, `extraElements[]` — unique **trong cùng block**. Regex recommend: `^[a-zA-Z0-9_-]+$`.

---

## 5. Error code

Theo `RxErrorBody` chuẩn:

```jsonc
{
  "code": "ERR_CANVAS_INVALID",
  "message": "blocks[2].content.slides[0].imageUrl không hợp lệ",
  "details": { "path": "blocks[2].content.slides[0].imageUrl", "rule": "url_scheme" },
  "request_id": "req_…"
}
```

| Code | HTTP | Khi nào |
|---|---|---|
| `ERR_CANVAS_INVALID` | 400 | Validate fail (top-level hoặc per-content) — `details.path` chỉ field sai |
| `ERR_CANVAS_INVALID_BLOCK_TYPE` | 400 | `blockType` không có trong active registry |
| `ERR_CANVAS_VERSION_CONFLICT` | 409 | Optimistic lock fail (PATCH với `version` cũ) |
| `ERR_SAVED_BLOCK_NOT_FOUND` | 404 | Saved block id không tồn tại / đã soft-delete |
| `ERR_SAVED_BLOCK_INVALID` | 400 | Payload sai schema (cho saved-blocks riêng) |
| `ERR_SAVED_BLOCK_LIMIT` | 429 | User đạt cap 100/100 |
| `ERR_FORBIDDEN` | 403 | Đọc/sửa row của user khác |
| `ERR_BAD_REQUEST` | 400 | JSON parse / cấu trúc |
| `ERR_BLOCK_TYPE_NOT_FOUND` | 404 | Admin: type không tồn tại |
| `ERR_BLOCK_TYPE_DUPLICATE` | 409 | Admin: POST type đã tồn tại |

→ FE dùng `details.path` để highlight đúng field sai.

---

## 6. Mapping FE ↔ BE

| Concern | FE (đã có) | BE (đề xuất) |
|---|---|---|
| Render block (React) | ✅ Component per type | ❌ |
| Default content seed | ✅ `factory.ts:DEFAULTS_VI/EN` | ❌ |
| AddBlockDialog catalog | ✅ Hard-code `ORDERED_TYPES` | Dynamic từ `/v1/block-types` |
| Validation `canvas_data` | ✅ TS types (compile-time) | ✅ **Bắt buộc** — runtime validator |
| Enable/disable block type | ❌ | ✅ Registry `is_active` |
| Premium gating per plan | ❌ | ✅ Registry `is_premium` |
| Schema versioning | ✅ `SCHEMA_VERSION = '2.0'` const | ✅ Per-type override registry |
| Saved blocks storage | ✅ localStorage (phase 1) | ✅ `saved_blocks` table (phase 2) |
| Saved blocks list/CRUD UI | ✅ `SavedBlocksDrawer` | ❌ (BE chỉ cung cấp endpoint) |
| AI prompt label sync | ✅ `buildAiPrompt.ts:BLOCK_LABEL` | Có thể move sang registry (defer — xem §10 Q6) |

---

## 7. Migration & versioning

### 7.1. Schema version bump

Khi BE thay đổi shape (vd thêm required field cho `quiz`), bump `block_type_registry.schema_version` cho type đó → FE detect khi load canvas và run migrator local (`migrateBlockV1toV2` trong `serialize.ts`).

Phase 1: tất cả 14 type ở `schema_version = '2.0'`.

### 7.2. Backwards compat

- **Type bị deprecate** (`deprecated_at != NULL`): vẫn render được trong canvas đã save, nhưng KHÔNG xuất hiện trong AddBlockDialog mới.
- **Field rỗng / missing:** BE tolerate (nếu optional), FE renderer dùng default từ `factory.ts`.
- **Wave 3 + 4 lock-step:** BE strict validator phải accept 14 type cùng lúc khi deploy — nếu deploy thiếu, FE save canvas có `stories/quiz/...` sẽ fail 400.

### 7.3. AI prompt label sync

Phase 1: giữ `BLOCK_LABEL` hardcode trong `buildAiPrompt.ts` (vi/en). Khi BE registry online, FE chuyển sang đọc label từ `/v1/block-types` response.

---

## 8. Test scenarios BE phải cover

### 8.1. Registry & admin

| Scenario | Expected |
|---|---|
| `GET /v1/block-types` (user) | 200, chỉ active + chưa deprecated + version ≤ FE |
| `GET /v1/admin/block-types` (admin) | 200, tất cả 14+ rows |
| `POST /v1/admin/block-types` với `type` đã tồn tại | 409 `ERR_BLOCK_TYPE_DUPLICATE` |
| `DELETE /v1/admin/block-types/hero_split` | 204, set `deprecated_at`. `GET /v1/block-types` không còn `hero_split`. Canvas đã save vẫn render OK. |
| `PATCH /v1/admin/block-types/quiz` với `is_active=false` | 204, user list không thấy `quiz` |
| `GET /v1/block-types?lang=en` | 200, label trả về tiếng Anh |

### 8.2. Saved blocks

| Scenario | Expected |
|---|---|
| POST với block hợp lệ | 201 + SavedBlock |
| POST với `blockType` không trong registry | 400 `ERR_CANVAS_INVALID_BLOCK_TYPE` |
| POST khi user đã có 100 | 429 `ERR_SAVED_BLOCK_LIMIT` |
| GET của user khác | 403 `ERR_FORBIDDEN` |
| PATCH với `version` cũ | 409 `ERR_CANVAS_VERSION_CONFLICT` |
| DELETE → GET → 404; list không trả | OK |
| Import 4 items khi user đang có 97 | 201 `created: 3, skipped: 1` |
| Import khi đã `has_migrated_saved_blocks=true` | 200, no-op hoặc skip silently |

### 8.3. Per-block content (mẫu — full ở `be-block-types-wave3-spec.md` §6)

#### `stories`
| Scenario | Expected |
|---|---|
| 3 slides hợp lệ | 200 |
| `slides: []` | 400 (length ≥ 1) |
| 21 slides | 400 |
| 2 slide cùng `id` | 400 |
| `mediaUrl: "ftp://..."` | 400 |
| `defaultDurationMs: 500` | 400 |
| `mediaType: "audio"` | 400 |

#### `quiz`
| Scenario | Expected |
|---|---|
| 3 questions + 3 results hợp lệ | 200 |
| `questions: []` | 400 |
| 11 questions | 400 |
| Option duplicate id trong cùng question | 400 |
| `results: []` | 400 |
| Result `minScore: -1` | 400 |
| Options length 1 | 400 |

#### `split_screen`
| Scenario | Expected |
|---|---|
| 2 views hợp lệ | 200 |
| 1 view | 400 |
| 5 views | 400 |
| `defaultIndex: 5` (out of range) | 400 |
| Thiếu `views[].title` | 400 |

#### `panorama`
| Scenario | Expected |
|---|---|
| Valid pano | 200 |
| `imageUrl` thiếu | 400 |
| `imageUrl: "/relative/path.jpg"` | 400 |
| `initialYaw: 1.5` | 400 |
| `sensitivity: 5` | 400 |

#### `poll` / `carousel_3d` / `flipbook` — xem `be-block-types-wave3-spec.md` §9.

---

## 9. FE plan tiếp theo

### 9.1. Sau khi BE ack Phần A (Block Registry)

1. Replace `ORDERED_TYPES` hardcode trong `AddBlockDialog.tsx` bằng `useBlockTypes()` hook gọi `GET /v1/block-types`
2. Loading / error state cho catalog (chưa có)
3. Show premium badge khi `is_premium = true`
4. Hide block khi `min_app_version > NEXT_PUBLIC_APP_VERSION`
5. Sync với BE deprecation — show warning khi mở canvas có block bị deprecated
6. Move `BLOCK_LABEL` từ `buildAiPrompt.ts` sang dùng response từ registry

**Effort wire BE catalog: ~1 ngày FE.**

### 9.2. Sau khi BE ack Phần B (Saved Blocks)

1. Bọc `savedBlocks.ts` thành thin client gọi `rexerApi.savedBlocks.*` thay cho localStorage
2. Giữ shape `SavedBlock` không đổi cho consumers — chỉ thay storage layer
3. Thêm migration flow §3.5
4. Loading / error state cho list (vì giờ là async)
5. Optimistic update: POST/PATCH/DELETE → patch local cache trước, rollback nếu BE fail

**Effort FE wire BE: ~1.5 ngày FE.**

---

## 10. Câu hỏi cần BE confirm (tổng hợp)

### Phần A — Block Registry

1. **Registry table** OK chưa, hay BE muốn giữ block-type enum ở code (deploy-time)? Phase 1 enum cứng + admin endpoint thay bằng feature flag có acceptable không?
2. **`json_schema`** trong registry — BE muốn nhúng full JSON Schema để dùng generic validator (1 engine), hay viết handler per-type? Generic gọn nhưng phải maintain schema cho 14 type.
3. **Per-workspace override** (§2.8) — defer phase 2 OK không?
4. **Validation caps** §4.2 — confirm caps (mỗi block max length cho `slides`, `pages`, `questions`, …). Có cần tier-based (free 10 slides, pro unlimited)?
5. **Icon whitelist** cho `feature_section.features[].icon` — subset Lucide hard-code BE, hay expose qua endpoint `GET /v1/block-types/feature_section/icons`?
6. **AI prompt label** (§7.3) — quản lý ở BE registry hay giữ FE?
7. **Error response `details.path`** — confirm format `blocks[2].content.slides[0].imageUrl` để FE point-lookup chính xác.

### Phần B — Saved Blocks

8. **Cap 100 saved blocks/user** — OK không? Hay tier-based (free 20, pro unlimited)?
9. **Bulk import endpoint** OK không, hay BE chỉ accept POST từng cái (FE loop)?
10. **`me.has_migrated_saved_blocks`** flag — thêm vào `users` table hay `user_settings`?
11. **Validation block payload** — share validator với `canvas_data.blocks[]` (recommended) hay validator riêng cho `saved_blocks`?
12. **Soft delete restore** — phase 2 cần `/restore` endpoint không, hay defer phase 3?
13. **Sharing** (giữa user cùng team / workspace) — phase 3 hay sớm hơn?
14. **Thumbnail** (§3.6) — Option B (FE html2canvas + upload media) OK không?

### Chung

15. **Schedule deploy:** lock-step Phần A + Phần B trong 1 patch, hay tách 2 patch (A trước, B sau)?
16. **Versioning:** `schema_version` field trong registry có cần migration script nếu sau này bump 2.0 → 2.1 cho 1 type cụ thể không?

---

## 11. Phụ lục — payload mẫu

### 11.1. Full Block payload (`hero_split` với extraElements + motion)

```jsonc
{
  "id": "blk_01HXYZ…",
  "blockType": "hero_split",
  "name": "Hero — Epic Tower",
  "isVisible": true,
  "thumbnail": "https://cdn.rexer.ai/thumbs/blk_01HXYZ.jpg",

  "contentVi": {
    "desktop": {
      "eyebrow": "DỰ ÁN MỚI",
      "title": "Epic Tower — Sống đỉnh cao",
      "description": "Căn hộ duplex view sông Sài Gòn",
      "ctaText": "Đăng ký nhận thông tin",
      "ctaLink": "#booking",
      "imageUrl": "https://cdn.rexer.ai/img/hero-epic.jpg",
      "imageTransform": { "scale": 1.05, "x": 0, "y": -20 },
      "stats": [
        { "id": "s1", "value": "120", "label": "Căn duplex" },
        { "id": "s2", "value": "32",  "label": "Tầng cao" }
      ]
    },
    "mobile": {
      "title": "Epic Tower\nSống đỉnh cao"
    }
  },
  "contentEn": {
    "desktop": {
      "eyebrow": "NEW PROJECT",
      "title": "Epic Tower — Live at the top",
      "ctaText": "Get info",
      "imageUrl": "https://cdn.rexer.ai/img/hero-epic.jpg"
    }
  },

  "elementStyles": {
    "desktop": {
      "title": { "fontFamily": "Be Vietnam Pro", "fontWeight": 700, "color": "#0A0A0A" }
    }
  },

  "background": {
    "desktop": { "color": "#FAFAFA", "imageUrl": null }
  },

  "elementOrder": {
    "desktop": ["eyebrow", "title", "description", "cta", "stats"]
  },

  "elementPositions": {
    "desktop": {
      "stats": { "x": 0, "y": 24 }
    }
  },

  "extraElements": [
    {
      "id": "ex_hotspot_01",
      "kind": "hotspot",
      "position": { "x": 480, "y": 320 },
      "size": { "width": 32, "height": 32 },
      "rotation": 0,
      "zIndex": 5,
      "isVisible": true,
      "tracking": { "category": "hero", "action": "hotspot_click", "label": "balcony" },
      "content": {
        "title": "Ban công view sông",
        "body": "Hướng Đông Nam, đón gió mát quanh năm",
        "imageUrl": "https://cdn.rexer.ai/img/balcony.jpg"
      },
      "style": { "color": "#FFFFFF", "backgroundColor": "#0EA5E9" }
    }
  ],

  "motion": {
    "desktop": {
      "tracks": [
        {
          "target": "title",
          "keyframes": [
            { "t": 0,    "opacity": 0, "y": 24 },
            { "t": 0.6,  "opacity": 1, "y": 0 }
          ],
          "easing": "easeOutQuint"
        }
      ],
      "duration": 1200
    }
  }
}
```

### 11.2. Saved block POST request

```http
POST /v1/saved-blocks
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "name": "Hero Epic Tower",
  "block": { /* payload ở §11.1 */ }
}
```

Response `201`:

```jsonc
{
  "id": "sb_01HXYZ…",
  "name": "Hero Epic Tower",
  "block_type": "hero_split",
  "block": { /* full payload echo */ },
  "thumbnail_url": null,
  "version": 1,
  "user_id": "usr_01H…",
  "created_at": "2026-05-15T14:30:00Z",
  "updated_at": "2026-05-15T14:30:00Z"
}
```

### 11.3. Block-types user list

```http
GET /v1/block-types?lang=vi
Authorization: Bearer <jwt>
x-rexer-fe-version: 2.0.42
```

Response `200`:

```jsonc
{
  "items": [
    { "type": "hero_split",      "label": "Hero Split",      "accent_color": "#0A0A0A", "is_premium": false, "schema_version": "2.0", "sort_order": 10 },
    { "type": "hero_overlay",    "label": "Hero Overlay",    "accent_color": "#0A0A0A", "is_premium": false, "schema_version": "2.0", "sort_order": 20 },
    { "type": "feature_section", "label": "Feature Section", "accent_color": "#10B981", "is_premium": false, "schema_version": "2.0", "sort_order": 30 },
    { "type": "photo_gallery",   "label": "Photo Gallery",   "accent_color": "#F59E0B", "is_premium": false, "schema_version": "2.0", "sort_order": 40 },
    { "type": "booking_form",    "label": "Booking Form",    "accent_color": "#8B5CF6", "is_premium": false, "schema_version": "2.0", "sort_order": 50 },
    { "type": "cta_section",     "label": "CTA",             "accent_color": "#EF4444", "is_premium": false, "schema_version": "2.0", "sort_order": 60 },
    { "type": "image_carousel",  "label": "Carousel",        "accent_color": "#06B6D4", "is_premium": false, "schema_version": "2.0", "sort_order": 70 },
    { "type": "stories",         "label": "Stories",         "accent_color": "#0EA5E9", "is_premium": true,  "schema_version": "2.0", "sort_order": 80 },
    { "type": "split_screen",    "label": "Split Screen",    "accent_color": "#14B8A6", "is_premium": true,  "schema_version": "2.0", "sort_order": 90 },
    { "type": "quiz",            "label": "Quiz",            "accent_color": "#F97316", "is_premium": true,  "schema_version": "2.0", "sort_order": 100 },
    { "type": "poll",            "label": "Poll",            "accent_color": "#EC4899", "is_premium": true,  "schema_version": "2.0", "sort_order": 110 },
    { "type": "carousel_3d",     "label": "Carousel 3D",     "accent_color": "#6366F1", "is_premium": true,  "schema_version": "2.0", "sort_order": 120 },
    { "type": "flipbook",        "label": "Flipbook",        "accent_color": "#A855F7", "is_premium": true,  "schema_version": "2.0", "sort_order": 130 },
    { "type": "panorama",        "label": "Panorama 360°",   "accent_color": "#22D3EE", "is_premium": true,  "schema_version": "2.0", "sort_order": 140 }
  ]
}
```

---

## 12. Liên hệ

- **FE:** @Lantm (Lantm@tekup.vn)
- **BE:** ack 16 câu §10 trước khi schedule patch. Đề xuất review chia 2 buổi: A (registry) và B (saved-blocks).
- **Spec / PO:** cần xác nhận §4.2 caps theo plan tier + §10 Q4, Q8 (tier-based caps).
- **Timeline đề xuất:** lock-step deploy Phần A + Phần B trong 1 patch — FE đã sẵn sàng wire khi BE ship.
