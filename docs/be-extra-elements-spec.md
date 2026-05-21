# BE Spec — Block Extra Elements (Free-drag UI)

**FE owner:** @Lantm
**Date:** 2026-05-14
**Status:** Đề xuất — chờ BE review & xác nhận schema
**Liên quan:** `canvas_data` schema v2.0 đang validate strict; cần extend để chấp nhận `extra_elements`.

---

## 1. Mục tiêu

User trong block editor cần thêm element mới vào block đã có (ngoài các slot cố định như `title`, `imageUrl`, …). Mỗi element user thêm là một đối tượng độc lập, kéo thả tự do trong block (Figma-style), persist cùng canvas.

**10 kind hỗ trợ (Wave 1 + Wave 2):**

| Kind | Mô tả | Use case |
|---|---|---|
| `text` | Label tĩnh + animation modes (typewriter / fade-up / split-slide-up / counter / marquee) | Caption, badge, headline |
| `edit_text` | Input field cho end-user nhập | Form ngắn, search box, comment |
| `photo` | Ảnh + optional flip-card (mặt sau) | Decorative image, logo, flip card, tap-to-flip |
| `video` | Video (URL hoặc media) | Demo, intro, hero clip |
| `hotspot` | Pin click → modal có ảnh / CTA | Tooltip floorplan, marker map, product detail |
| `compare` | Slider before/after | Trước/sau renovate, day/night, retouch |
| `range` | Input range chọn số trong khoảng | Budget / area / chỉ số tham số |
| `countdown` | Đếm ngược tới deadline / sự kiện | Flash sale, event launch, live availability |
| `reveal` | Cào / lột / spotlight để hé lộ ảnh | Coupon scratch, peel-to-reveal banner |
| `spin_wheel` | Vòng quay may mắn với weighted segments | Gamification, prize draw, marketing |

---

## 2. Schema proposal — `Block.extra_elements`

### 2.1. Vị trí trong `canvas_data`

Thêm field optional vào mỗi `block` trong mảng `blocks[]`:

```jsonc
// canvas_data (v2.0+, không đổi top-level)
{
  "schema": "block_editor",
  "version": 2,
  "schema_version": "2.0",
  "blocks": [
    {
      "id": "blk_abc",
      "blockType": "hero_split",
      // ... existing fields ...
      "extraElements": [                    // ← NEW (optional, empty array OK)
        {
          "id": "el_text_01",
          "kind": "text",
          "position": { "x": 120, "y": 40 },
          "size":     { "width": 200, "height": 48 },
          "content":  { "text": "Sale 50%" },
          "style":    { "color": "#fff", "fontSize": 18, "fontWeight": 700, "fontFamily": "be-vietnam-pro" }
        }
      ]
    }
  ]
}
```

Key naming: **camelCase** trong wire payload (match existing block fields: `blockType`, `contentVi`, `isVisible`, …).

### 2.2. Element common shape

```jsonc
{
  "id":       "el_<uuid>",                    // string, required, unique trong block
  "kind":     "text" | "edit_text" | "photo" | "video",   // required
  "position": { "x": number, "y": number },   // required, px relative to block frame top-left
  "size":     { "width": number, "height": number },      // required, px
  "rotation": number,                         // optional, degrees, default 0
  "zIndex":   number,                         // optional, default 0
  "content":  {…},                            // required, kind-specific (xem §3)
  "style":    {…},                            // optional, kind-specific
  "isVisible": boolean,                       // optional, default true (per-device flag để defer)
  "createdAt": "<ISO>",                       // BE set
  "updatedAt": "<ISO>"                        // BE set
}
```

**Constraints BE nên validate:**
- `id`: regex `^el_[a-zA-Z0-9_-]+$`, max 64 char
- `position.x`, `position.y`: integer, có thể âm (cho phép kéo ra ngoài block một chút)
- `size.width`, `size.height`: integer ≥ 1
- `rotation`: -360 ≤ x ≤ 360
- `kind`: enum strict
- Mảng `extraElements` cap 50 element/block (chống abuse)

---

## 3. Per-kind content / style shape

### 3.1. `text` (label tĩnh)

```jsonc
{
  "kind": "text",
  "content": {
    "text":   "Sale 50%",          // required, string ≤ 500 char
    "textEn": "Sale 50%"           // optional, i18n English variant
  },
  "style": {
    "color":           "#fff",
    "fontSize":        18,
    "fontWeight":      400 | 500 | 600 | 700 | 900,
    "fontStyle":       "normal" | "italic",
    "fontFamily":      "inter",     // font id (xem src/lib/fonts.ts FE registry)
    "textAlign":       "left" | "center" | "right" | "justify",
    "textDecoration":  "none" | "underline" | "line-through",
    "lineHeight":      number,      // unitless
    "letterSpacing":   number       // px
  }
}
```

### 3.2. `edit_text` (input cho end-user)

```jsonc
{
  "kind": "edit_text",
  "content": {
    "placeholder":   "Nhập email…",      // string
    "placeholderEn": "Enter email…",
    "defaultValue":  "",                 // pre-fill, optional
    "fieldName":     "user_email",       // string slug — key khi submit form
    "inputType":     "text" | "email" | "tel" | "number" | "textarea",
    "isRequired":    boolean,
    "maxLength":     number              // optional cap
  },
  "style": {                            // tương tự text, áp lên input value
    "color":      "#000",
    "fontSize":   14,
    "fontFamily": "inter",
    "borderColor":  "#e5e5e5",
    "borderWidth":  1,
    "borderRadius": 6,
    "padding":      8,
    "backgroundColor": "#fff"
  }
}
```

**Note:** submission flow của `edit_text` (gửi data về đâu) BE confirm — có thể dùng chung pipeline `BookingForm` đã có, hoặc tạo endpoint riêng. Cho phase 1 chỉ cần persist được structure.

### 3.3. `photo`

```jsonc
{
  "kind": "photo",
  "content": {
    "mediaId":  "<uuid>",          // FK media_assets.id, required
    "alt":      "Logo ABC",        // string, ≤ 200 char
    "altEn":    "ABC logo"
  },
  "style": {
    "objectFit":     "cover" | "contain" | "fill" | "none",
    "borderRadius":  number,
    "opacity":       number       // 0..1
  }
}
```

BE constraint: validate `mediaId` tồn tại trong `media_assets` (FK), `status = ready`, `media_type = image`. Nếu media bị xoá sau, FE render placeholder (BE không cascade).

### 3.4. `video`

```jsonc
{
  "kind": "video",
  "content": {
    "source":    "media" | "url",
    "mediaId":   "<uuid>",          // required khi source=media
    "url":       "https://…",       // required khi source=url (vd YouTube embed)
    "poster":    "<media_id?>",     // optional thumbnail
    "alt":       "Demo product"
  },
  "style": {
    "autoplay":    boolean,
    "loop":        boolean,
    "muted":       boolean,
    "controls":    boolean,
    "objectFit":   "cover" | "contain"
  }
}
```

BE validate XOR: `mediaId` hoặc `url`, không cả hai.

### 3.5. `hotspot` (pin click → modal popup)

Pin nhỏ (typical 36×36 chip) chồng lên ảnh / block — click mở **modal fullscreen** có ảnh + tiêu đề + mô tả + CTA. Trigger phase 1 chỉ hỗ trợ `click`.

```jsonc
{
  "kind": "hotspot",
  "content": {
    "pinLabel": "+",                  // optional, ≤ 3 char, hiển thị trong chip
    "title":    "Hồ bơi vô cực",      // required, ≤ 120 char
    "body":     "View toàn cảnh ...", // optional, ≤ 1000 char, multi-line
    "imageUrl": "https://...png",     // optional — show ở top modal
    "ctaText":  "Xem chi tiết",       // optional
    "ctaUrl":   "https://...",        // optional, http(s)
    "trigger":  "click"               // optional, default "click"
  },
  "style": {
    "backgroundColor": "#0ea5e9",
    "color":           "#ffffff",
    "borderColor":     "#ffffff",
    "borderWidth":     3,
    "borderRadius":    999,
    "fontSize":        16,
    "fontWeight":      700,
    "fontFamily":      "inter"
  }
}
```

**Validation cụ thể:**
- `pinLabel` ≤ 3 char
- `imageUrl` (nếu có) phải là http(s) URL
- `ctaUrl` (nếu có) phải là http(s) URL
- `trigger` ∈ `["click"]` (hover defer phase 2)

### 3.6. `compare` (slider before/after)

Hai ảnh chồng lên nhau, divider drag từ trái → phải để reveal phần ảnh sau. Use case: trước/sau renovate, day/night, retouch.

```jsonc
{
  "kind": "compare",
  "content": {
    "beforeUrl":    "https://...before.jpg",  // required, ảnh ON TOP (bị mask)
    "afterUrl":     "https://...after.jpg",   // required, ảnh dưới (lộ ra khi kéo)
    "defaultRatio": 0.5,                      // optional, 0–1, default 0.5
    "beforeAlt":    "Trước",                  // optional, label corner
    "afterAlt":     "Sau"                     // optional, label corner
  },
  "style": {
    "borderRadius": 8,
    "opacity":      1
  }
}
```

**Validation cụ thể:**
- `beforeUrl`, `afterUrl` required, http(s) URL
- `defaultRatio` ∈ [0, 1] — BE clamp về [0.02, 0.98] trước khi lưu
- `beforeAlt`, `afterAlt` ≤ 60 char

### 3.7. `range` (input slider giá trị)

`<input type="range">` cho user kéo chọn 1 giá trị trong khoảng. Submit cùng form data qua `fieldName` (giống `edit_text`).

```jsonc
{
  "kind": "range",
  "content": {
    "fieldName":    "budget",          // required, regex ^[a-zA-Z_][a-zA-Z0-9_]*$
    "label":        "Ngân sách",       // optional, ≤ 60 char
    "min":          0,                  // required, number
    "max":          5000,               // required, number > min
    "step":         100,                // optional, default 1, > 0
    "defaultValue": 2000,               // optional, mặc định = min
    "showValue":    true,               // optional, default true
    "unit":         "₫"                 // optional, ≤ 8 char (vd "₫", "m²", "°C")
  },
  "style": {
    "backgroundColor": "#0ea5e9",       // accent color (track + thumb)
    "color":           "#0a0a0a",       // label text color
    "padding":         8
  }
}
```

**Validation cụ thể:**
- `min`, `max`: number, `max > min`
- `defaultValue` (nếu có) ∈ [min, max]
- `step` > 0, ≤ (max − min)
- `fieldName` unique trong block (BE có thể defer check, FE chịu)

### 3.8. `countdown` (đếm ngược)

Timer tick mỗi giây tới `targetIso`, hiện days/hours/minutes/seconds. Sau khi hết → `expiredText`.

```jsonc
{
  "kind": "countdown",
  "content": {
    "targetIso":   "2026-12-31T23:59:00+07:00",   // required, ISO 8601
    "units":       ["days", "hours", "minutes", "seconds"],  // optional
    "label":       "Còn lại",                      // optional, ≤ 60 char
    "expiredText": "Đã kết thúc",                  // optional, ≤ 60 char
    "style":       "flat"                          // optional: "flat" | "flip"
  },
  "style": {
    "fontSize":   28,
    "fontWeight": 700,
    "color":      "#0a0a0a",
    "textAlign":  "center"
  }
}
```

**Validation cụ thể:**
- `targetIso` parse được bằng `Date.parse()`
- `units` items ∈ ["days","hours","minutes","seconds"], length 1-4, no duplicates
- `style` ∈ ["flat","flip"]

### 3.9. `reveal` (cào / lột / spotlight)

Cover image overlay trên reveal image, mask theo tương tác.

```jsonc
{
  "kind": "reveal",
  "content": {
    "coverUrl":  "https://...cover.jpg",   // required, http(s)
    "revealUrl": "https://...reveal.jpg",  // required, http(s)
    "mode":      "scratch",                 // required: "scratch" | "peel" | "spotlight" | "tap"
    "brushSize": 60                         // optional, 10-200 px
  },
  "style": { "borderRadius": 8 }
}
```

**Validation cụ thể:**
- `coverUrl`, `revealUrl` required, http(s) URL
- `mode` enum strict
- `brushSize` ∈ [10, 200]

### 3.10. `spin_wheel` (vòng quay may mắn)

```jsonc
{
  "kind": "spin_wheel",
  "content": {
    "segments": [                                    // required, length 2-12
      { "id": "s1", "label": "10%", "color": "#0ea5e9", "prize": "Giảm 10%", "weight": 1 },
      { "id": "s2", "label": "5%",  "color": "#a855f7", "prize": "Giảm 5%",  "weight": 1 },
      { "id": "s3", "label": "20%", "color": "#22c55e", "prize": "Giảm 20%", "weight": 1 }
    ],
    "spinDurationMs": 4000,    // optional, 500-10000
    "buttonLabel":    "Quay"   // optional, ≤ 30 char
  }
}
```

**Validation cụ thể:**
- `segments`: 2-12 entries, `id` unique trong block, regex `^[a-zA-Z0-9_-]+$`
- `segments[].label` ≤ 30 char, required
- `segments[].color` hex / rgba string, optional (default `#94a3b8`)
- `segments[].weight` ≥ 0 (FE clamps NaN/negative to 1)
- `segments[].prize` ≤ 100 char, optional
- `spinDurationMs` ∈ [500, 10000]

**Tracking gợi ý:** spin wheel nên fire event với `customData: { wonSegmentId, wonPrize }` để analytics theo dõi prize distribution.

---

## 4. Hành vi nghiệp vụ

### 4.1. Per-device override (defer)

Phase 1 dùng 1 set `extraElements` chung cho desktop/mobile (giống `BookingForm.reasons` hiện tại). Khi cần variant device:

```jsonc
"extraElements": {
  "desktop": [{...}],
  "mobile":  [{...}]                // override hoặc inherit từ desktop
}
```

Defer đến phase 2 nếu BE thấy phức tạp; phase 1 chỉ cần 1 mảng phẳng.

### 4.2. AI integration

Khi user dùng `apply-product` hoặc `block-content` AI flows, BE **không cần** sinh `extraElements` (chỉ AI cho slot cố định). `extraElements` luôn do user tự thêm tay.

### 4.3. Reorder & z-index

FE cho phép user `Bring to front` / `Send to back` → cập nhật `zIndex`. BE chỉ persist con số; cap 0..999 (không cần ép unique).

### 4.4. Versioning

`elementPositions` hiện tại (đang in-progress của motion team) cho element cố định **không liên quan** đến `extraElements.position`. `extraElements` self-contained có position riêng.

---

## 5. API impact

| Endpoint | Change |
|---|---|
| `POST /v1/canvas-templates` | `canvas_data.blocks[].extraElements` optional, validate per §2.2 + §3 |
| `PATCH /v1/canvas-templates/{id}` | Tương tự, validate trong `canvas_data` payload |
| `GET /v1/canvas-templates/{id}/canvas` | Trả về nguyên `extraElements` đã lưu |
| Public `/v1/public/canvas-templates/{id}/canvas` | Tương tự — đã published view |

**Validation cứng:**
- Schema mismatch → trả `ERR_CANVAS_INVALID` 400 với `details.path` pointer (vd `blocks[0].extraElements[1].size`) để FE highlight đúng element

**Không cần** endpoint riêng cho CRUD element — FE mutate trong canvas_data rồi PATCH cả block như cũ.

---

## 6. Migration

- DB: `canvas_data` đã là JSONB — không cần ALTER table.
- Schema v2.0 validator: bổ sung rule cho `extraElements` field (optional). Templates cũ không có → vẫn pass.
- Không breaking; rollout BE trước, FE wire sau.

---

## 7. FE plan (cho BE tham khảo)

FE đã chốt scope với PO (xem chat):
1. **B (full feature)** — 4 kind, persist, render canvas
2. **Free-drag positioning** — Figma-style, absolute x/y trong block frame
3. **Phụ thuộc BE schema confirm** trước khi wire

### FE work (sau khi BE ack)
- Extend `Block` type FE thêm `extraElements?: ExtraElement[]`
- LayersPanel: nút "+ Thêm element" → popover chọn kind
- Canvas overlay: render element absolute-positioned trên block; drag/resize bằng `@dnd-kit` (đã có)
- ElementToolbar: switch property editor per kind (text vs edit_text vs photo vs video)
- Serialize: extra elements vào canvas_data payload, BE PATCH save
- 2 commit pre-existing `ElementPosition` infra trong types.ts đã có thể tái dùng

### Effort ước
~ 3-5 ngày dev FE sau khi BE ship schema.

---

## 8. Câu hỏi cần BE confirm

1. Schema validator có chấp nhận thêm `extraElements` field không, hay phải bump `schema_version` lên `2.1`?
2. `edit_text` submission — BE muốn FE gửi qua endpoint nào? Có cần BE side store form responses không (như BookingForm), hay chỉ render dạng visual cho phase 1?
3. Cap 50 element/block có phù hợp không, hay BE muốn limit khác?
4. `extraElements[].id` BE muốn FE tự generate (uuid), hay BE assign trong response sau khi save?
5. Per-device override (`extraElements: { desktop, mobile }`) — phase 1 skip hay làm luôn?
6. Validation error trả về có thể chứa `details.path` cụ thể không (vd `blocks[0].extraElements[1].position`) — để FE highlight đúng chỗ?

---

## 9. Phụ lục — sample full payload

```jsonc
{
  "blocks": [
    {
      "id": "blk_hero_01",
      "blockType": "hero_split",
      "contentVi": { "title": "GreenBoost", ... },
      "extraElements": [
        {
          "id": "el_001",
          "kind": "text",
          "position": { "x": 24, "y": 24 },
          "size":     { "width": 120, "height": 32 },
          "zIndex": 10,
          "content": { "text": "Mới", "textEn": "New" },
          "style":   {
            "color": "#ff3b30", "fontSize": 14, "fontWeight": 700,
            "fontFamily": "be-vietnam-pro"
          }
        },
        {
          "id": "el_002",
          "kind": "edit_text",
          "position": { "x": 24, "y": 400 },
          "size":     { "width": 320, "height": 44 },
          "content": {
            "placeholder": "Nhập email để nhận tin",
            "fieldName":   "newsletter_email",
            "inputType":   "email",
            "isRequired":  true
          },
          "style": {
            "fontSize": 14, "fontFamily": "inter",
            "borderRadius": 8, "padding": 10
          }
        },
        {
          "id": "el_003",
          "kind": "photo",
          "position": { "x": 600, "y": 100 },
          "size":     { "width": 240, "height": 240 },
          "rotation": -5,
          "content": { "mediaId": "<uuid>", "alt": "Logo" },
          "style":   { "objectFit": "cover", "borderRadius": 16 }
        },
        {
          "id": "el_004",
          "kind": "video",
          "position": { "x": 24, "y": 480 },
          "size":     { "width": 560, "height": 315 },
          "content": {
            "source": "url",
            "url": "https://www.youtube.com/embed/abc123",
            "alt":  "Demo sản phẩm"
          },
          "style": { "controls": true, "autoplay": false }
        }
      ]
    }
  ]
}
```

---

## 10. Liên hệ

- FE: @Lantm
- Spec / PO: cần align nếu phase 1 mở rộng (vd brand-kit binding cho text color)
- BE: ack lại 6 câu §8 trước khi FE wire
