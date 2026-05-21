# BE Spec — Block types Wave 3 (stories / split_screen / quiz)

**FE owner:** @Lantm
**Date:** 2026-05-15
**Status:** Đề xuất — chờ BE review & xác nhận schema
**Liên quan:**
- `canvas_data` schema v2.0 strict validator
- `docs/be-canvas-templates-spec.md` (base spec)
- `docs/migration-smart-ad-demo.md` Wave 3

---

## 1. Tóm tắt

3 `BlockType` enum mới + content schema mỗi cái. FE đã ship; BE validator strict đang chặn cho đến khi schema được mở rộng.

| Block | Use case | Element keys (cho elementStyles / order / positions) |
|---|---|---|
| `stories` | Insta-style story panels, real estate showcase, sequential reveal | `eyebrow`, `title`, `slides` |
| `split_screen` | So sánh 2 lựa chọn (căn duplex vs studio, gói A vs B) | `eyebrow`, `title`, `description`, `views` |
| `quiz` | Trắc nghiệm gợi ý sản phẩm | `eyebrow`, `title`, `description`, `questions`, `results` |

---

## 2. Enum update

```diff
 type BlockType =
   | "hero_split"
   | "hero_overlay"
   | "feature_section"
   | "photo_gallery"
   | "booking_form"
   | "cta_section"
   | "image_carousel"
+  | "stories"
+  | "split_screen"
+  | "quiz"
```

---

## 3. Content schemas

### 3.1. `stories`

```jsonc
{
  "id": "blk_stories",
  "blockType": "stories",
  "name": "Stories",
  "isVisible": true,
  "contentVi": {
    "desktop": {
      "eyebrow":     "KHÁM PHÁ",                  // optional, ≤ 60 char
      "title":       "Câu chuyện dự án",          // optional, ≤ 120 char
      "slides": [                                  // required, length 1–20
        {
          "id":         "st1",                      // required, regex ^[a-zA-Z0-9_-]+$
          "mediaUrl":   "https://...jpg",           // required, http(s)
          "mediaType":  "image",                    // optional: "image" | "video"
          "title":      "Mặt tiền sang trọng",      // optional, ≤ 120 char
          "body":       "Kiến trúc châu Âu hiện đại",// optional, ≤ 500 char
          "ctaText":    "Đăng ký xem",              // optional, ≤ 30 char
          "ctaUrl":     "#",                        // optional, http(s) or #
          "durationMs": 4500                        // optional, 1000-30000
        }
      ],
      "defaultDurationMs": 4500,                    // optional, 1000-30000, default 4500
      "loop":             true,                     // optional, default true
      "showProgress":     true                      // optional, default true
    }
  },
  "contentEn": { "desktop": { /* same shape */ } }
}
```

**Validation:**
- `slides` length 1–20; `id` unique per block.
- `mediaUrl` http(s) URL; for `mediaType: "video"` BE may want to verify mime.
- `defaultDurationMs` ∈ [1000, 30000].

### 3.2. `split_screen`

```jsonc
{
  "id": "blk_split",
  "blockType": "split_screen",
  "contentVi": {
    "desktop": {
      "eyebrow":     "SO SÁNH",                  // optional, ≤ 60 char
      "title":       "Hai phong cách, một dự án", // optional, ≤ 120 char
      "description": "Chọn loại căn hộ phù hợp",  // optional, ≤ 300 char
      "views": [                                   // required, length 2–4
        {
          "id":       "sv1",                       // required
          "label":    "Căn duplex",                // required, ≤ 30 char
          "imageUrl": "https://...jpg",            // optional, http(s)
          "title":    "Duplex 120m²",              // required, ≤ 120 char
          "body":     "2 tầng riêng tư...",        // optional, ≤ 300 char
          "ctaText":  "Xem chi tiết",              // optional, ≤ 30 char
          "ctaUrl":   "#"                          // optional
        }
      ],
      "defaultIndex": 0                            // optional, integer ≥ 0 < views.length
    }
  }
}
```

**Validation:**
- `views`: 2–4 entries (>4 phá layout responsive).
- `defaultIndex` ∈ [0, views.length).

### 3.3. `quiz`

```jsonc
{
  "id": "blk_quiz",
  "blockType": "quiz",
  "contentVi": {
    "desktop": {
      "eyebrow":     "TRẮC NGHIỆM",                 // optional
      "title":       "Căn hộ nào phù hợp với bạn?",  // optional
      "description": "Trả lời 3 câu hỏi...",         // optional
      "questions": [                                  // required, length 1–10
        {
          "id":       "q1",                            // required, unique
          "prompt":   "Gia đình bạn có bao nhiêu người?",  // required, ≤ 200 char
          "imageUrl": "https://...jpg",                // optional
          "options": [                                  // required, length 2–6
            { "id": "q1a", "label": "1-2 người", "score": 1 },
            { "id": "q1b", "label": "3-4 người", "score": 3 },
            { "id": "q1c", "label": "5+ người",  "score": 5 }
          ]
        }
      ],
      "results": [                                    // required, length 1–10
        {
          "id":       "r1",                            // required, unique
          "minScore": 0,                               // required, integer ≥ 0
          "title":    "Studio nhỏ gọn",                // required, ≤ 120 char
          "body":     "Phù hợp với...",                // optional, ≤ 500 char
          "imageUrl": "https://...jpg",                // optional
          "ctaText":  "Xem studio",                    // optional
          "ctaUrl":   "#"                              // optional
        }
      ],
      "nextLabel":   "Tiếp",                         // optional, default "Tiếp"
      "finishLabel": "Xem kết quả"                   // optional, default "Xem kết quả"
    }
  }
}
```

**Validation:**
- `questions`: 1–10, options 2–6 per question. `id` unique within block.
- `options[].score` integer (can be negative for misleading-trap questions, BE not strict).
- `results`: 1–10, sorted by `minScore` ASC recommended. FE picks the highest `minScore ≤ totalScore`. At least one result with `minScore: 0` recommended so total=0 still has a winner.
- `nextLabel`, `finishLabel` ≤ 30 char.

---

## 4. API endpoints chịu ảnh hưởng

| Endpoint | Hành động |
|---|---|
| `POST /v1/canvas-templates` | Validator accept 3 new `blockType` + content schema (§3) |
| `PATCH /v1/canvas-templates/{id}` | Cùng |
| `GET .../canvas` (auth + public) | Pass-through nguyên payload — không transform |
| `POST /v1/ai/canvas-templates/{id}/apply-product` | AI có thể không sinh quiz/split_screen ở phase đầu; FE chấp nhận response không có 3 block này. Nếu AI sinh, pass-through. |

---

## 5. Migration / backward compat

- ✅ Templates legacy không có 3 block type này → không ảnh hưởng.
- ❌ Templates mới có 3 type này và BE strict validator chưa update → FE save fail 400 `ERR_CANVAS_INVALID`.
- Không cần data migration.

---

## 6. Test scenarios BE nên cover

### 6.1. `stories`

| Scenario | Expected |
|---|---|
| Block với 3 slides hợp lệ | 200 OK, round-trip giữ nguyên |
| `slides` rỗng `[]` | 400 (length ≥ 1) |
| 21 slides | 400 (length ≤ 20) |
| 2 slide cùng `id` | 400 |
| `mediaUrl: "ftp://..."` | 400 (chỉ http/https) |
| `defaultDurationMs: 500` | 400 (dưới 1000ms) |
| `mediaType: "audio"` | 400 (chỉ image/video) |

### 6.2. `split_screen`

| Scenario | Expected |
|---|---|
| 2 views hợp lệ | 200 OK |
| 1 view duy nhất | 400 (length ≥ 2) |
| 5 views | 400 (length ≤ 4) |
| `defaultIndex: 5` (out of range) | 400 |
| Thiếu `views[].title` | 400 (required) |

### 6.3. `quiz`

| Scenario | Expected |
|---|---|
| 3 questions + 3 results | 200 OK |
| `questions: []` | 400 (length ≥ 1) |
| 11 questions | 400 |
| Option duplicate id trong cùng question | 400 |
| `results: []` | 400 |
| Result `minScore: -1` | 400 (≥ 0) |
| Options length 1 | 400 (length ≥ 2) |

---

## 7. Files thay đổi FE (tham khảo)

- `block-editor/types.ts` — BlockType enum + 3 content interfaces + BlockContent union + BLOCK_TYPE_META
- `block-editor/factory.ts` — NAME_BY_TYPE + DEFAULTS_VI/EN + Vietnamese seed content cho 3 block
- `block-editor/mock.ts` — NAME_BY_TYPE
- `block-editor/buildAiPrompt.ts` — BLOCK_LABEL vi/en
- `block-editor/LayersPanel.tsx` — ELEMENTS_BY_TYPE entries
- `block-editor/AddBlockDialog.tsx` — ORDERED_TYPES
- `block-editor/blocks/{Stories,SplitScreen,Quiz}.tsx` — 3 React components (mỗi cái ~250-300 LOC)
- `block-editor/blocks/renderBlock.tsx` — 3 switch cases

---

## 8. Liên hệ

- FE: @Lantm
- BE timeline: phụ thuộc Wave 3 priority; FE sẵn sàng để release lock-step

---

## 9. Wave 3.5 + 4-lite addendum (poll / carousel_3d / flipbook)

3 BlockType nữa đã ship FE. Cùng pattern validation strict; field optional rộng rãi.

### 9.1. `poll`

```jsonc
{
  "blockType": "poll",
  "contentVi": {
    "desktop": {
      "eyebrow":  "BÌNH CHỌN",                       // optional, ≤ 60
      "question": "Bạn ưu tiên tiện ích nào nhất?",  // required, ≤ 200
      "options": [                                     // required, length 2–6
        { "id": "po1", "label": "Hồ bơi vô cực", "baseVotes": 142 },
        { "id": "po2", "label": "Phòng gym + spa", "baseVotes": 98 }
      ],
      "hideResultsUntilVoted": true,                  // optional, default true
      "voteLabel":             "Bình chọn",            // optional, ≤ 30
      "thankYouText":          "Cảm ơn bạn đã bình chọn!" // optional, ≤ 120
    }
  }
}
```

Validation: options 2–6, `id` unique, `label` ≤ 60, `baseVotes ≥ 0`.

### 9.2. `carousel_3d`

```jsonc
{
  "blockType": "carousel_3d",
  "contentVi": {
    "desktop": {
      // All ImageCarouselContent fields, plus:
      "mode3d":        "3d-coverflow",   // optional: "flat" | "3d-coverflow", default "flat"
      "perspectivePx": 1200              // optional, 400–3000, default 1200
    }
  }
}
```

Validation: same as `image_carousel` + `mode3d` enum + `perspectivePx` range.

### 9.3. `flipbook`

```jsonc
{
  "blockType": "flipbook",
  "contentVi": {
    "desktop": {
      "eyebrow": "BROCHURE",                    // optional
      "title":   "Lật để xem trọn dự án",        // optional
      "pages": [                                  // required, length 2–30
        { "id": "fp1", "imageUrl": "https://...jpg", "caption": "..." }
      ],
      "aspect":          "3/4",                  // optional: "3/4"|"4/3"|"1/1"|"16/9"
      "showPageNumbers": true                    // optional, default true
    }
  }
}
```

Validation: pages 2–30, `id` unique, `imageUrl` http(s), `caption` ≤ 200.

---

## 10. Wave 4 addendum (panorama)

CSS-only equirectangular 360° viewer. No Three.js / external libs. Spec is light because the only new field is the image URL + a couple of UX knobs.

### 10.1. `panorama`

```jsonc
{
  "blockType": "panorama",
  "contentVi": {
    "desktop": {
      "eyebrow":     "KHÁM PHÁ 360°",                // optional, ≤ 60
      "title":       "Tham quan ảo dự án",            // optional, ≤ 120
      "description": "Kéo ngang để xoay góc nhìn",    // optional, ≤ 300
      "imageUrl":    "https://...pano.jpg",            // REQUIRED, http(s), aspect 2:1
      "initialYaw":  0,                                // optional, 0..1 fraction of strip width, default 0
      "sensitivity": 1,                                // optional, 0.25..3, default 1
      "hint":        "Kéo để xoay"                     // optional, ≤ 30 char (shown as badge in editor)
    }
  }
}
```

**Validation:**
- `imageUrl` required, http(s). FE assumes 2:1 aspect (equirectangular); BE may warn but not strict-reject.
- `initialYaw` ∈ [0, 1].
- `sensitivity` ∈ [0.25, 3].
- `hint` ≤ 30 char.

**Element keys (cho elementStyles / order / positions):** `eyebrow`, `title`, `description`, `imageUrl`.

**Tương tác với ExtraElements:** Hotspot pins, text labels, CTAs trong `extraElements` vẫn được render ON TOP của khung pano, position theo frame (KHÔNG follow yaw). UX hợp lý cho real-estate use case: pin "Hồ bơi" cố định ở góc dưới, user xoay pano để xem các phần khác nhau của không gian, pin vẫn giữ nguyên vị trí frame.

**Test scenarios:**

| Scenario | Expected |
|---|---|
| Valid pano (2:1 image) | 200 OK |
| `imageUrl` thiếu | 400 (required) |
| `imageUrl: "/relative/path.jpg"` | 400 (must be absolute http/https) |
| `initialYaw: 1.5` | 400 (out of [0,1]) |
| `sensitivity: 5` | 400 (out of [0.25, 3]) |

