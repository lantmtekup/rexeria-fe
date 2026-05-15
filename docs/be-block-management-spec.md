# BE Spec — Block Management (Catalog + Validation)

**FE owner:** @Lantm
**Date:** 2026-05-15
**Status:** Đề xuất — chờ BE review trước khi schedule patch
**Related:**
- `docs/be-extra-elements-spec.md` (extra-elements schema)
- `docs/be-saved-blocks-spec.md` (saved-blocks library)
- FE source: `src/components/modules/CanvasTemplate/block-editor/types.ts`

---

## 1. Mục tiêu

FE đã mở rộng đáng kể block catalog & element catalog trong block-editor. Doc này:

1. **Catalogue chính thức 13 block types + 10 extra-element kinds** đang dùng ở FE — để BE align validator schema v2.0 và không reject payload mới.
2. **Đề xuất admin endpoints** để platform admin quản lý catalog (enable/disable per workspace, version, deprecate).
3. **Validation cứng per-kind** mà BE phải áp khi nhận `canvas_data` PATCH.

---

## 2. Block catalog hiện tại (13 types)

| `blockType` | Mục đích | Required content fields | Optional |
|---|---|---|---|
| `hero_split` | Hero 2 cột (text + ảnh) | `title`, `imageUrl`, `stats[]` | eyebrow, description, ctaText, ctaLink |
| `hero_overlay` | Hero full-bleed có overlay | `title`, `backgroundUrl`, `ctaText` | tag, subtitle, ctaLink |
| `feature_section` | List 3-6 tiện ích/feature | `title`, `features[].label/body/icon` | eyebrow, description |
| `photo_gallery` | Mosaic 5 ảnh | `title`, `photos[].url` (≤5) | eyebrow, description, caption per photo |
| `booking_form` | Form đăng ký lead | `title`, `reasons[]`, `submitText` | eyebrow, description, noteText |
| `cta_section` | CTA cuối trang full-bleed | `title`, `primaryText` | eyebrow, subtitle, secondary CTA, backgroundUrl |
| `image_carousel` | Slider ảnh 1 slide/view | `slides[].imageUrl` | eyebrow, title, description, autoplayMs, showPagination, showNavArrows |
| `stories` | Insta-style story panels | `slides[].mediaUrl`, `slides[].title` | defaultDurationMs, loop, showProgress |
| `split_screen` | So sánh 2 lựa chọn | `views[].label/title` (2 items) | description, defaultIndex |
| `quiz` | Multi-question quiz + result bucket | `questions[].prompt/options[]`, `results[].minScore/title` | eyebrow, description, nextLabel, finishLabel |
| `poll` | Single-question poll | `question`, `options[].label` | baseVotes, hideResultsUntilVoted, voteLabel, thankYouText |
| `carousel_3d` | Coverflow 3D — extends image_carousel | (giống `image_carousel`) | mode3d, perspectivePx |
| `flipbook` | Catalog lật trang | `pages[].imageUrl` | eyebrow, title, aspect, showPageNumbers |

### 2.1. Per-type content shape — pointer ra FE

Shape chuẩn cho từng kind tại `src/components/modules/CanvasTemplate/block-editor/types.ts:81-328` (search `XxxContent` interface). BE clone interface sang Go struct hoặc dùng JSON schema; payload đi qua `canvas_data.blocks[].contentVi/contentEn.{desktop,mobile?}`.

### 2.2. Common cross-cutting fields trên `Block`

| Field | Type | Purpose |
|---|---|---|
| `id` | string | Stable id, FE-generated UUID |
| `blockType` | enum (13 values trên) | Discriminator |
| `name` | string | Admin label |
| `isVisible` | boolean | Skip render khi false |
| `thumbnail` | string optional | URL CDN (auto-generated bởi FE / capture) |
| `contentVi/En` | `DeviceVariants<BlockContent>` | Per-language + per-device content |
| `elementStyles` | `DeviceVariants<ElementStylesMap>` optional | CSS overrides per element key |
| `background` | `DeviceVariants<BlockBackground>` optional | Block-level bg |
| `elementOrder` | `DeviceVariants<string[]>` optional | Re-order fixed elements |
| `elementPositions` | `DeviceVariants<ElementPositionsMap>` optional | Free-drag offsets |
| `extraElements` | `ExtraElement[]` optional | User-added free-drag elements (10 kinds) |
| `motion` | `DeviceVariants<BlockMotion>` optional | Per-block motion timeline |

Tất cả đều **camelCase wire** (match BE validator hiện tại theo `docs/canvas-block-responsive-spec.md`).

---

## 3. ExtraElement catalog (10 kinds)

Đầy đủ trong `docs/be-extra-elements-spec.md` — FE đã mở rộng từ 4 → 10 kinds, doc này là update:

| `kind` | Mục đích | Required content fields |
|---|---|---|
| `text` | Label tĩnh | `text` |
| `edit_text` | Form input cho end-user | `placeholder`, `fieldName`, `inputType`, `isRequired` |
| `photo` | Ảnh từ media | `mediaId` |
| `video` | Video URL hoặc media | `source` (`url`/`media`) + `url` hoặc `mediaId` |
| `hotspot` | Pin + popover khi click | `title` (popover header) |
| `compare` | Before/after slider | `beforeUrl`, `afterUrl` |
| `range` | Slider input liên tục | `fieldName`, `min`, `max` |
| `countdown` | Countdown đến ISO time | `targetIso` |
| `reveal` | Scratch / spotlight reveal | `coverUrl`, `revealUrl`, `mode` |
| `spin_wheel` | Wheel of fortune | `segments[].label` (≥2) |

Tất cả share base: `id`, `kind`, `position{x,y}`, `size{width,height}`, `style?`, `rotation?`, `zIndex?`, `tracking?`, `isVisible?`.

**FE source** cho shape chi tiết: `types.ts:482-637`. Cập nhật `be-extra-elements-spec.md` §3 — bổ sung 6 kind mới (compare/range/countdown/reveal/spin_wheel + những thuộc tính text mới như `animation`, `counter`, `marquee` trong `ExtraTextContent`).

---

## 4. Admin block management endpoints (proposal)

Mục tiêu: cho phép platform admin **enable/disable** block types per workspace, **deprecate** type cũ, **publish** type mới mà không phải code-deploy FE.

### 4.1. Block-type registry (BE-side)

DB table mới:

```sql
CREATE TABLE block_type_registry (
  type           TEXT PRIMARY KEY,             -- 'hero_split', 'stories', …
  label_vi       TEXT NOT NULL,
  label_en       TEXT NOT NULL,
  accent_color   TEXT NOT NULL,                -- hex, dùng cho AddBlockDialog preview
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium     BOOLEAN NOT NULL DEFAULT FALSE,  -- gated theo plan
  min_app_version TEXT,                        -- semver, hide khỏi FE version cũ
  schema_version TEXT NOT NULL DEFAULT '2.0',  -- để FE biết cần migrate khi đổi
  json_schema    JSONB,                        -- optional — full JSON schema cho content validator
  sort_order     INT NOT NULL DEFAULT 100,
  deprecated_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Seed bằng migration 13 row hiện tại (`hero_split` → `flipbook`).

### 4.2. Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| `GET` | `/v1/block-types` | user | List block types `is_active=true` cho FE AddBlockDialog. Filter theo `min_app_version` ≤ client header `x-rexer-fe-version` |
| `GET` | `/v1/admin/block-types` | admin | List tất cả (kể cả inactive/deprecated) cho admin manage page |
| `GET` | `/v1/admin/block-types/{type}` | admin | Detail |
| `POST` | `/v1/admin/block-types` | admin | Tạo type mới (cho phép admin đăng ký type custom — phase 2) |
| `PATCH` | `/v1/admin/block-types/{type}` | admin | Update label / accent / is_active / json_schema |
| `DELETE` | `/v1/admin/block-types/{type}` | admin | Soft delete (`deprecated_at = NOW()`); template cũ vẫn render |

**Response shape (user-facing list)**

```jsonc
{
  "items": [
    {
      "type": "hero_split",
      "label": "Hero Split",          // resolved by accept-language header
      "accent_color": "#0A0A0A",
      "is_premium": false,
      "schema_version": "2.0"
    },
    { "type": "stories",  "label": "Stories", "accent_color": "#0ea5e9", "is_premium": true,  "schema_version": "2.0" },
    /* ... */
  ]
}
```

### 4.3. Per-workspace gating (optional, phase 2)

Bảng `workspace_block_type_overrides` cho phép admin disable type cho 1 workspace cụ thể (vd tắt `spin_wheel` ở enterprise tier):

```sql
CREATE TABLE workspace_block_type_overrides (
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  type         TEXT NOT NULL REFERENCES block_type_registry(type),
  is_enabled   BOOLEAN NOT NULL,
  PRIMARY KEY (workspace_id, type)
);
```

`GET /v1/block-types` query workspace context và intersect với registry. Defer phase 2.

---

## 5. Validation rules (BE phải enforce)

Khi nhận `canvas_data` PATCH từ `POST/PATCH /v1/canvas-templates`:

### 5.1. Top-level block

- `blockType` ∈ `block_type_registry.type WHERE is_active = true` → nếu không → 400 `ERR_CANVAS_INVALID_BLOCK_TYPE`
- `name` ≤ 200 chars
- `contentVi.desktop` bắt buộc; `contentEn.desktop` optional nhưng nếu có phải pass per-type validation cùng schema

### 5.2. Per-block content

| Block type | Hard validation |
|---|---|
| `hero_split` | `title` ≤ 200, `imageUrl` URL, `stats.length` ≤ 6 |
| `hero_overlay` | `title`, `backgroundUrl` URL, `ctaText` ≤ 80 |
| `feature_section` | `features.length` ≥ 1 ≤ 6, `icon` ∈ Lucide icon whitelist |
| `photo_gallery` | `photos.length` ≥ 1 ≤ 5 |
| `booking_form` | `reasons.length` ≤ 8, `submitText` required ≤ 50 |
| `cta_section` | `title`, `primaryText` required |
| `image_carousel` | `slides.length` ≥ 1 ≤ 20, `autoplayMs` 0 hoặc 500..30000 |
| `stories` | `slides.length` ≥ 1 ≤ 20, `defaultDurationMs` 1000..30000 |
| `split_screen` | `views.length` đúng 2 (phase 1) |
| `quiz` | `questions.length` ≥ 1 ≤ 10, mỗi `options.length` 2..6, `results.length` ≥ 1 ≤ 5 — `minScore` không-giảm |
| `poll` | `options.length` 2..8 |
| `carousel_3d` | giống `image_carousel` + `perspectivePx` 200..3000 |
| `flipbook` | `pages.length` 2..50, `aspect` ∈ enum `'3/4'/'4/3'/'1/1'/'16/9'` |

Tất cả URL field — validate scheme `http/https` (cấm `javascript:`, `data:` trừ image inline base64 cho thumbnail).

### 5.3. ExtraElement

Per `be-extra-elements-spec.md` §3 — BE thêm 6 kind mới (compare/range/countdown/reveal/spin_wheel) vào validator. Cap `extraElements.length` ≤ 50/block.

### 5.4. Error response

Theo `RxErrorBody` chuẩn:
```jsonc
{
  "code": "ERR_CANVAS_INVALID",
  "message": "blocks[2].content.slides[0].imageUrl không hợp lệ",
  "details": { "path": "blocks[2].content.slides[0].imageUrl", "rule": "url_scheme" },
  "request_id": "req_…"
}
```

→ FE dùng `details.path` để highlight đúng field.

---

## 6. Migration & versioning

### 6.1. Schema version bump

Khi BE thay đổi shape (vd thêm required field), bump `block_type_registry.schema_version` → FE sẽ run migrator local (`migrateBlockV1toV2` trong `serialize.ts`).

Phase 1: tất cả type ở `schema_version = '2.0'`.

### 6.2. Backwards compat

Block đã save trước khi BE deploy:
- Type bị deprecate (`deprecated_at != NULL`) — vẫn render được trong canvas, nhưng KHÔNG xuất hiện trong AddBlockDialog mới.
- Field rỗng / missing — BE tolerate, FE renderer dùng default.

### 6.3. AI prompt label sync

BE Q: có muốn quản lý `BLOCK_LABEL` (per-lang) ở BE registry không, hay giữ ở FE code (`buildAiPrompt.ts`)?

Phase 1: giữ FE. Khi BE registry online, FE đọc label từ `/v1/block-types` response (i18n).

---

## 7. Mapping FE ↔ BE responsibility

| Concern | FE (đã có) | BE (đề xuất) |
|---|---|---|
| Render block | ✅ React component / type | ❌ |
| Default content seed | ✅ `factory.ts:DEFAULTS_VI/EN` | ❌ |
| AddBlockDialog catalog | ✅ Hard-code `ORDERED_TYPES` | Dynamic từ `/v1/block-types` |
| Validation `canvas_data` | ✅ TS types (compile-time) | ✅ Bắt buộc — JSON validator runtime |
| Enable/disable block | ❌ | ✅ Registry |
| Gating premium / per-plan | ❌ | ✅ |
| Schema versioning | ✅ `SCHEMA_VERSION = '2.0'` const | ✅ Per-type override |

---

## 8. Câu hỏi cần BE confirm

1. **Registry table** OK chưa, hay BE muốn giữ block-type enum ở code (deploy-time)? Phase 1 enum cứng + admin endpoint thay thế bằng feature flag là OK?
2. **`json_schema`** trong registry — BE muốn nhúng full JSON Schema để validator generic (single validator engine), hay viết handler per-type? Generic gọn nhưng phải maintain schema.
3. **Per-workspace override** (§4.3) — defer phase 2 OK không?
4. **Per-block validation** §5.2 — confirm caps (mỗi block max length cho `slides`, `pages`, `questions`, …). Có cần tier-based (free 10 slides, pro unlimited)?
5. **Icon whitelist** cho `feature_section.features[].icon` — BE muốn cứng (subset Lucide) hay free-form string?
6. **AI prompt label** (§6.3) — quản lý ở BE hay FE?
7. **Error response `details.path`** — confirm format cho phép FE point-lookup chính xác element (vd `blocks[2].content.slides[0].imageUrl`).

---

## 9. FE plan tiếp theo (sau khi BE ack)

1. Replace `ORDERED_TYPES` hardcode trong `AddBlockDialog.tsx` bằng `useBlockTypes()` hook gọi `GET /v1/block-types`
2. Loading / error state cho catalog (chưa có)
3. Show premium badge khi `is_premium = true`
4. Hide block khi `min_app_version` lớn hơn `NEXT_PUBLIC_APP_VERSION`
5. Sync với BE deprecation — show warning khi mở canvas có block bị deprecated

Effort wire BE catalog: **~1 ngày**.

---

## 10. Liên hệ

- FE: @Lantm
- BE: ack 7 câu §8 trước khi schedule patch
- Spec / PO: cần xác nhận §5.2 caps theo plan tier
