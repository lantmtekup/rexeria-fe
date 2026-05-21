# BE Spec — `elementPositions` + `image_carousel` block type

**FE owner:** @Lantm
**Date:** 2026-05-14
**Status:** Đề xuất — chờ BE review & xác nhận schema
**Liên quan:**
- `canvas_data` schema v2.0 strict validator
- `docs/be-canvas-templates-spec.md` (base spec)
- `docs/be-extra-elements-spec.md` (cousin spec — `extraElements` cho free-drag user-added objects, **không** chồng lấn với `elementPositions` ở đây)

---

## 1. Tóm tắt cho BE

2 thay đổi optional vào `canvas_data.blocks[]`, hoàn toàn forward-compat — block không có 2 field này phải tiếp tục pass validator như hiện nay.

| Patch | Type | Mục đích |
|---|---|---|
| `Block.elementPositions` | DeviceVariants&lt;Record&lt;string, {x,y}&gt;&gt; | Free-drag offset cho **element cố định** (`title`, `eyebrow`, `imageUrl`, …) — Figma-style nudge trong flex slot. |
| `BlockType.image_carousel` | enum value mới + content schema | Block mới: slide ảnh có pagination/autoplay. |

Cả 2 đã ship trong FE; FE persist `canvas_data` chứa field mới sẽ bị reject nếu BE validator strict. **Cần BE mở rộng schema để chấp nhận.**

---

## 2. `Block.elementPositions` — drag offset cho element cố định

### 2.1. Mục tiêu

User chọn 1 element (title/description/...) trên canvas → kéo chuột → element dịch chuyển theo trục x/y mà **không phá flex layout** (sibling không bị xô). Triển khai bằng `transform: translate(Xpx, Ypx)` áp lên element. FE persist offset per-device để mobile có thể có offset khác desktop.

> **Khác với `extraElements.position`**: `extraElements` là object user TỰ THÊM, mỗi cái absolutely positioned trong block frame, có position riêng trong payload của chính nó. `elementPositions` ở đây áp cho **slot element cố định có sẵn** (title/imageUrl/etc), không thêm node mới — chỉ ghi đè vị trí.

### 2.2. Vị trí trong `canvas_data`

```jsonc
{
  "schema": "block_editor",
  "version": 2,
  "schema_version": "2.0",
  "blocks": [
    {
      "id": "blk_abc",
      "blockType": "hero_split",
      "contentVi":     { "desktop": {…}, "mobile": {…} },
      "contentEn":     { "desktop": {…} },
      "elementStyles": { "desktop": {…} },
      "elementOrder":  { "desktop": ["eyebrow", "title", "description"] },
      "elementPositions": {                       // ← NEW (optional, omit = no override)
        "desktop": {
          "title":       { "x": 48,  "y": -12 },
          "description": { "x": 0,   "y": 24 }
        },
        "mobile": {
          "title":       { "x": 0,   "y": 8 }
        }
      },
      "motion":        { "desktop": {…} }
    }
  ]
}
```

Key naming: **camelCase**, đồng nhất với các field hiện có (`elementStyles`, `elementOrder`).

### 2.3. Shape contract

```ts
type ElementPosition = { x: number; y: number };
type ElementPositionsMap = Record<string, ElementPosition>;
type DeviceVariants<T> = { desktop: T; mobile?: T };

Block.elementPositions?: DeviceVariants<ElementPositionsMap>;
```

### 2.4. Validation rules đề xuất

| Rule | Detail |
|---|---|
| Field optional | Block không có → bỏ qua hoàn toàn, không default |
| `desktop` bắt buộc khi field tồn tại | Như mọi `DeviceVariants` khác — desktop là baseline |
| `mobile` optional | Khi thiếu, FE renderer fall back về desktop |
| Mỗi entry là object `{x, y}` | Cả 2 đều `number` (integer hoặc float đều OK; FE round về integer trước khi gửi) |
| Range `x`, `y` | `-10000 ≤ x,y ≤ 10000` (cho phép nudge âm, đề phòng outlier) |
| Element key | `^[a-zA-Z_][a-zA-Z0-9_]*$` — match với element key của block type tương ứng |
| Cap số entry | ≤ 30 entry mỗi `desktop` / `mobile` (đủ cho mọi block type hiện tại) |
| `{x: 0, y: 0}` | FE thường strip trước khi gửi (treat as "no override"), nhưng BE **không cần** reject nếu lọt qua |

### 2.5. Forward-compat

- Block legacy thiếu `elementPositions` → validator pass, FE render ở vị trí mặc định.
- Block có `elementPositions` mà BE chưa update → BE 400 với `ERR_CANVAS_INVALID` (path `blocks[0].elementPositions`) → FE block save → user phát hiện sớm.
- Sau khi BE deploy, FE đã serialize sẵn — không cần migration.

### 2.6. Interaction với các field khác

| Tương tác | Ghi chú |
|---|---|
| `elementStyles` | Độc lập. `elementStyles[key]` không bao giờ chứa `transform` — BE không cần merge. |
| `elementOrder` | Độc lập. `elementOrder` set CSS `order`; `elementPositions` set `transform`. FE merge ở client. |
| `motion.tracks` | Motion runtime override transform khi preview/production play. User offset bị tạm ẩn trong lúc animation chạy, sau đó GSAP revert → offset trở lại. BE không cần làm gì. |
| `extraElements` | Hoàn toàn không liên quan — `extraElements[].position` thuộc về node riêng. |

---

## 3. `BlockType.image_carousel` — slide ảnh

### 3.1. Mục tiêu

Bổ sung 1 block type mới render slideshow ảnh (Swiper-based) với optional autoplay + pagination + nav arrows.

### 3.2. Cập nhật enum `BlockType`

```diff
 type BlockType =
   | "hero_split"
   | "hero_overlay"
   | "feature_section"
   | "photo_gallery"
   | "booking_form"
   | "cta_section"
+  | "image_carousel"
```

### 3.3. Content schema — `ImageCarouselContent`

```jsonc
{
  "id": "blk_xyz",
  "blockType": "image_carousel",
  "name": "Slide ảnh",
  "isVisible": true,
  "contentVi": {
    "desktop": {
      "eyebrow":     "BỘ SƯU TẬP",                  // optional
      "title":       "Khám phá không gian sống",    // optional
      "description": "Trượt qua các thiết kế ...",  // optional
      "slides": [                                    // required, ≥ 1
        {
          "id":       "s1",                           // required, unique trong slides[]
          "imageUrl": "https://images.unsplash.com/photo-...",  // required, http(s) URL
          "caption":  "Phòng khách view sông",        // optional, ≤ 200 char
          "altText":  "Living room overlooking river",// optional, a11y
          "href":     "https://example.com/detail"    // optional, link khi click slide
        }
      ],
      "autoplayMs":     4500,    // optional, 0 hoặc undefined = manual only
      "showPagination": true,    // optional, default true
      "showNavArrows":  true     // optional, default true
    },
    "mobile": { /* same shape, optional */ }
  },
  "contentEn": { "desktop": { /* same */ } }
}
```

### 3.4. Validation rules đề xuất

| Field | Type | Constraint |
|---|---|---|
| `eyebrow` | string? | ≤ 60 char |
| `title` | string? | ≤ 120 char |
| `description` | string? | ≤ 500 char |
| `slides` | array | required, length 1–20 |
| `slides[].id` | string | required, regex `^[a-zA-Z0-9_-]+$`, unique trong block |
| `slides[].imageUrl` | string | required, http(s) URL |
| `slides[].caption` | string? | ≤ 200 char |
| `slides[].altText` | string? | ≤ 200 char |
| `slides[].href` | string? | http(s) URL |
| `autoplayMs` | int? | 0 hoặc 1000–60000 (1s–60s); ngoài range → reject |
| `showPagination` | bool? | default true |
| `showNavArrows` | bool? | default true |

### 3.5. Element keys (cho `elementStyles` / `elementOrder` / `elementPositions`)

Block render các element sau với `data-element-key`:

| Key | Element |
|---|---|
| `eyebrow` | Span uppercase trên cùng (nếu có) |
| `title` | h2 tiêu đề |
| `description` | p mô tả |
| `slides` | Container Swiper toàn bộ (mỗi slide không có element-key riêng) |

→ BE validator cho `elementStyles[device][key]` / `elementOrder[device][i]` / `elementPositions[device][key]` chỉ cần allow 4 key trên cho `blockType=image_carousel`.

### 3.6. Tương tác với AI flows

- **`apply-product`**: AI **không cần** sinh `image_carousel` ở phase đầu. Nếu BE prompt template có sẵn slot ảnh nhiều (3+) thì map vào `image_carousel.slides[].imageUrl` được — không bắt buộc.
- **`generate` (AI Template)**: Phase 2; hiện không có block role tương ứng. Khi cần, tạo block role `gallery_carousel` riêng.
- **Image suggestion**: dùng chung media library — `slides[].imageUrl` chấp nhận URL từ media (`https://cdn.../...`) như các block khác.

---

## 4. API endpoints chịu ảnh hưởng

| Endpoint | Thay đổi |
|---|---|
| `POST /v1/canvas-templates` | Validator chấp nhận `canvas_data.blocks[].elementPositions` (§2.4) và `blockType: "image_carousel"` (§3.4) |
| `PATCH /v1/canvas-templates/{id}` | Tương tự — validator strict đang là pain point chính. FE save flow gửi nguyên `canvas_data` mỗi 1.5s. |
| `GET /v1/canvas-templates/{id}/canvas` | Trả về nguyên `elementPositions` + carousel slides đã lưu, không transform |
| `GET /v1/public/canvas-templates/{id}/canvas` | Tương tự — public landing page render carousel + offsets |
| `POST /v1/ai/canvas-templates/{id}/apply-product` | Không bắt buộc đụng. Nếu AI output có `elementPositions` thì BE pass-through; nếu không thì FE giữ nguyên field cũ trong diff merge. |
| `POST /v1/ai/templates/{id}/generate` (AI Template) | Phase 2; chưa đụng. |

---

## 5. Error envelope

Khi schema mismatch:

```jsonc
{
  "code": "ERR_CANVAS_INVALID",
  "message": "canvas_data validation failed",
  "request_id": "req_…",
  "details": {
    "validation_errors": {
      "blocks[0].elementPositions.desktop.title.x":  "must be number",
      "blocks[2].slides[0].imageUrl":                 "must be valid url"
    }
  }
}
```

FE đọc `details.validation_errors` map → toast field-level (đã wire trong `useAutosave` Phase 1 refactor).

---

## 6. Migration / backward compat

- ✅ Templates cũ không có `elementPositions` → vẫn pass (field optional).
- ✅ Templates cũ không dùng `image_carousel` → không ảnh hưởng (enum mới).
- ❌ Template mới có `elementPositions` mà BE strict reject → FE save fail.
- Không cần data migration (FE tự fallback render khi field thiếu).

---

## 7. Test scenarios BE nên cover

### 7.1. `elementPositions`

| Scenario | Expected |
|---|---|
| Block với `elementPositions.desktop.title = {x:48, y:-12}` | 200 OK, round-trip giữ nguyên |
| Block không có field | 200 OK |
| `elementPositions.desktop` thiếu (chỉ có mobile) | 400 `ERR_CANVAS_INVALID` (desktop bắt buộc) |
| `x: "48"` (string thay vì number) | 400 với path chính xác |
| `x: 99999` (vượt range) | 400 |
| 31 entries trong `desktop` | 400 (vượt cap 30) |

### 7.2. `image_carousel`

| Scenario | Expected |
|---|---|
| Block `blockType: image_carousel` với 3 slides | 200 OK |
| Slides rỗng `[]` | 400 `ERR_CANVAS_INVALID` (length ≥ 1) |
| 21 slides | 400 (vượt cap 20) |
| `autoplayMs: 500` (dưới min) | 400 |
| `slides[0].imageUrl: "not-a-url"` | 400 |
| Slide thiếu `id` | 400 |
| 2 slide cùng `id` | 400 |

---

## 8. Files thay đổi phía FE (tham khảo)

- `src/components/modules/CanvasTemplate/block-editor/types.ts` — `ElementPosition`, `ElementPositionsMap`, `Block.elementPositions`, `ImageCarouselContent`, `BlockType += 'image_carousel'`
- `src/components/modules/CanvasTemplate/block-editor/blocks/applyStyle.ts` — `positionStyle()`, `composeStyle()` helpers
- `src/components/modules/CanvasTemplate/block-editor/blocks/renderBlock.tsx` — switch case `image_carousel` + thread `positions` prop
- `src/components/modules/CanvasTemplate/block-editor/blocks/ImageCarousel.tsx` — block component (Swiper-based)
- `src/components/modules/CanvasTemplate/block-editor/blocks/{6 existing blocks}.tsx` — merge `positionStyle` vào inline style
- `src/components/modules/CanvasTemplate/block-editor/BlockPreview.tsx` — pointer handlers (`onPointerDown/Move/Up`) cho free-drag, scale-aware
- `src/components/modules/CanvasTemplate/BlockEditor.tsx` — `handleCommitElementPosition` dùng `canvas.mutateActive` + immer
- `src/components/modules/CanvasTemplate/block-editor/factory.ts` — `createBlock('image_carousel')` + seed carousel content

---

## 9. Liên hệ

- FE: @Lantm
- Spec / PO: chốt với BE timeline deploy
- Khi BE deploy xong: FE chỉ cần verify (forward-compat hiện có), không cần đổi code
