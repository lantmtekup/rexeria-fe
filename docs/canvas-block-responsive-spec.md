# Canvas Block Responsive Spec

**Trạng thái**: 🟢 Chốt convention — chờ BE implement schema mở rộng.
**Phạm vi**: Tất cả block trong `src/components/modules/CanvasTemplate/block-editor/blocks/`.
**Owner FE**: Tekup
**Owner BE**: cần BE owner để extend `canvas_data` schema (xem §5).

> File này gộp: convention responsive cho FE + data model lưu riêng mobile/desktop + work items cho BE update.

---

## 0. Decision summary

| Quyết định | Lý do |
|---|---|
| **3-tier**: mobile / tablet / desktop | Đủ cho hầu hết content; tránh designer/user rối |
| **Tablet dùng layout desktop** (split, không stack) | 834px đủ chỗ cho split; giảm số layout cần maintain |
| **Không hỗ trợ landscape mobile** | Use case hiếm |
| **Touch target ≥ 44px** | Apple/Google guideline; bắt buộc cho CTA |
| **Lưu RIÊNG mobile vs desktop** (cả layout & resource) ⭐ | Tối ưu output: ảnh mobile crop khác desktop, copy ngắn gọn hơn, font size tự do, link CTA có thể khác |
| **Tablet không lưu riêng** — tablet render dùng variant `desktop` | Đơn giản schema; tablet là device "lai" |
| **Container queries** thay viewport breakpoints | Editor có 3 device frame trong cùng 1 viewport browser → không thể dùng `md:`/`lg:` |

⭐ = thay đổi data model lớn, cần BE phối hợp.

---

## 1. Scope & rationale

### Vấn đề hiện tại

Block templates dùng `md:`/`lg:` (viewport breakpoints) — không phản ánh độ rộng frame device trong editor. Khi user toggle "Mobile" trong editor:
- Block render trong frame 390px ✓
- Nhưng browser viewport vẫn ≥1280px → `md:`/`lg:` vẫn fire → layout desktop nhồi vào frame mobile → vỡ.

Ngoài ra: cùng 1 content/ảnh cho mọi device không tối ưu (ảnh portrait tốt cho mobile, landscape cho desktop; copy mobile thường ngắn gọn hơn).

### Mục tiêu

1. Render đúng từng device frame trong editor (container queries).
2. Cho user/AI lưu **bố cục + tài nguyên riêng** cho mobile vs desktop để tối ưu chất lượng output.
3. Convention chuẩn áp dụng được cho **mọi block hiện tại + block mới** trong tương lai.

---

## 2. Convention rules

### R1 — Container queries, không viewport

```tsx
// ❌ SAI
className='text-2xl md:text-4xl lg:text-6xl'

// ✅ ĐÚNG
className='text-2xl @2xl:text-4xl @4xl:text-6xl'
```

ESLint/CI lint: cấm `md:` / `lg:` / `sm:` / `xl:` trong file `block-editor/blocks/*.tsx` (trừ `block-editor/*` ngoài blocks/ và file editor UI).

### R2 — 3-tier breakpoint chuẩn

| Tier | Container width | Tailwind | Device map (frame width) |
|---|---|---|---|
| Base (mobile) | < 672px | (no prefix) | 390px |
| md (tablet) | ≥ 672px | `@2xl:` | 834px |
| lg (desktop) | ≥ 896px | `@4xl:` | 1280px |

Chỉ 3 tier — không đẻ thêm.

### R3 — Mobile-first

Style mặc định = mobile. Tablet/desktop **enhance**, không override toàn bộ.

```tsx
// Pattern chuẩn
'grid grid-cols-1 gap-3 p-6 text-sm
 @2xl:grid-cols-2 @2xl:gap-6 @2xl:p-12 @2xl:text-base
 @4xl:grid-cols-4 @4xl:gap-10 @4xl:p-20 @4xl:text-lg'
```

### R4 — Scale tokens cố định

| Token | Mobile | `@2xl:` (tablet) | `@4xl:` (desktop) |
|---|---|---|---|
| Block padding | `p-6` | `p-10` | `p-16` / `p-20` |
| Section gap | `gap-3` | `gap-5` | `gap-8` |
| Heading 1 | `text-2xl` | `text-4xl` | `text-5xl`/`text-6xl` |
| Heading 2 | `text-base` | `text-lg` | `text-xl` |
| Body | `text-sm` | `text-base` | `text-base`/`text-lg` |
| Eyebrow | `text-[10px]` | `text-xs` | `text-xs` |
| Button | `px-4 py-2 text-sm min-h-11` | `px-5 py-2.5 text-sm` | `px-6 py-3 text-base` |
| Grid 4-up | `grid-cols-1` | `grid-cols-2` | `grid-cols-4` |
| Grid 3-up | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` |
| Split (text+image) | `grid-cols-1` (stack) | `grid-cols-[5fr_4fr]` | (same) |

### R5 — Aspect ratio theo device

| Block | Mobile | Tablet+ |
|---|---|---|
| HeroSplit | `aspect-[4/5]` (portrait) | `@2xl:aspect-[16/9]` |
| HeroOverlay | `aspect-[4/5]` | `@2xl:aspect-[16/10]` |
| CtaSection | `min-h-[400px]` | `@2xl:min-h-[480px]` |
| PhotoGallery | `auto` | `auto` |
| FeatureSection | `auto` | `auto` |
| BookingForm | `auto` | `auto` |

### R6 — Stack order trên mobile

Khi block stack dọc trên mobile, thứ tự cố định:
1. Visual hook (ảnh hoặc eyebrow/tag)
2. Tiêu đề
3. Mô tả/body
4. Stats/features/list
5. CTA

Implement bằng `flex-col` + DOM order tự nhiên. **Không** dùng `order-*` để tránh rối khi đọc code.

### R7 — Element ẩn/giữ trên mobile

| Element | Mobile | Tablet+ |
|---|---|---|
| Eyebrow | giữ | giữ |
| Stats (≤3) | giữ — grid 3-col compact | giữ |
| Stats (>3) | grid 2-col, scroll-x nếu cần | giữ |
| Multiple CTAs | stack dọc, full-width | inline |
| Decorative shapes/blur | **ẩn** (`hidden @2xl:block`) | hiện |
| Long descriptions | giữ — line-clamp-3 nếu quá dài | giữ |

> **Nguyên tắc**: KHÔNG ẩn content quan trọng (title, mô tả, CTA). CHỈ ẩn decoration.

### R8 — Touch target ≥ 44px

Mọi nút/CTA: `min-h-11` (44px) trên mobile. Apple HIG + Material Design tối thiểu.

### R9 — Container setup ở wrapper

`BlockPreview.tsx`:

```tsx
<div className='@container' style={{ width: baseWidth }}>
  <RenderBlock ... />
</div>
```

### R10 — Per-device content & resource (xem §5)

Block có thể có content và ảnh khác nhau giữa mobile vs desktop. Khi render:
- Frame `mobile` → load `content.mobile.*` + `resources.mobile.*`
- Frame `tablet`/`desktop` → load `content.desktop.*` + `resources.desktop.*`

Fallback: nếu `mobile` thiếu, fallback sang `desktop` (hoặc ngược lại) để không block render.

---

## 3. Layout pattern catalog

### Pattern A — "Hero split" (text + ảnh)

```
Mobile:                  Tablet+:
┌─────────────┐         ┌──────┬──────┐
│   [Image]   │         │ Text │ Img  │
├─────────────┤         │ ...  │      │
│   Title     │         │ CTA  │      │
│   Desc      │         └──────┴──────┘
│   [CTA]     │
└─────────────┘
```

Class chuẩn:
```tsx
'grid grid-cols-1 aspect-[4/5]
 @2xl:grid-cols-[5fr_4fr] @2xl:aspect-[16/9]'
```

DOM order: image trước, text sau. Trên tablet+ image ở cột phải nhờ CSS grid placement.

### Pattern B — "Hero overlay" (text trên ảnh nền)

```
Mobile + Tablet+: ┌─────────────────┐
                  │   [bg image]    │
                  │                 │
                  │  Title          │
                  │  Description    │
                  │  [CTA]          │
                  └─────────────────┘
```

Layout không đổi giữa device — chỉ scale font/padding. Resource ảnh nền có thể khác (mobile portrait crop, desktop landscape).

### Pattern C — "Feature grid" (4 card)

```
Mobile (1 col)    Tablet (2 col)    Desktop (4 col)
┌──────┐         ┌────┬────┐        ┌──┬──┬──┬──┐
├──────┤         ├────┼────┤        └──┴──┴──┴──┘
├──────┤         └────┴────┘
└──────┘
```

Class: `grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-4`.

### Pattern D — "Photo gallery" (1-9 ảnh)

| # ảnh | Mobile | Tablet | Desktop |
|---|---|---|---|
| 1 | full-width | full-width | full-width |
| 2-3 | 2-col | 3-col | 3-col |
| 4-6 | 2-col | 3-col | 3-col |
| 7-9 | 2-col | 3-col | 4-col |

### Pattern E — "Booking form" (text + form)

Giống Pattern A nhưng cột phải là form input. Mobile stack, tablet+ split.

### Pattern F — "CTA section" (centered)

Centered single-column ở mọi device. Chỉ scale font + padding. Stack 2 nút CTA trên mobile, inline trên tablet+.

---

## 4. Editor UX implications

### 4.1 Device toggle = chế độ chỉnh sửa

Hiện tại 3 nút Desktop/Tablet/Mobile chỉ là **preview**. Sau khi áp spec này, toggle sẽ:

| Mode | Đọc data | Ghi data |
|---|---|---|
| Desktop | `content.desktop` | `content.desktop` |
| Tablet | `content.desktop` (read-only of desktop) | **không cho edit trên tablet** — show banner "Tablet dùng layout desktop. Chuyển sang Desktop hoặc Mobile để chỉnh sửa." |
| Mobile | `content.mobile` | `content.mobile` |

### 4.2 Sync giữa 2 variant

Thêm 2 button trong Header:
- **"Copy desktop → mobile"** (khi đang ở mode Mobile và `content.mobile` rỗng/cũ)
- **"Copy mobile → desktop"** (ngược lại)

Hành động: deep clone toàn bộ content + styles + background sang variant kia, push history (cho undo).

### 4.3 Indicator "đã tuỳ biến mobile"

Trong `LayersPanel` (sidebar phải), nếu element ở mobile khác desktop → show badge `📱 ●` để user biết.

### 4.4 Default khi tạo block mới

Tạo block mới → mặc định **`content.mobile = content.desktop`** (clone). User customize dần khi cần.

### 4.5 ElementToolbar mode awareness

Toolbar bind theo variant đang active. Update style ở mode Mobile chỉ ghi vào `elementStyles.mobile.<key>`.

---

## 5. Data model — per-device storage

### 5.1 FE schema (TypeScript)

#### Schema mới (`types.ts`)

```ts
export type DeviceVariant = 'mobile' | 'desktop';

/**
 * Wraps a value with per-device variants. When `mobile` missing, render falls
 * back to `desktop` (and vice versa). Both can be present and differ.
 */
export interface DeviceVariants<T> {
  desktop: T;
  mobile?: T; // optional — if missing, use `desktop`
}

export interface Block {
  id: string;
  blockType: BlockType;
  name: string;
  isVisible: boolean;
  thumbnail?: string;

  // Per-language, per-device content
  contentVi: DeviceVariants<BlockContent>;
  contentEn: DeviceVariants<BlockContent>;

  // Per-device element styles (lang-agnostic)
  elementStyles?: DeviceVariants<ElementStylesMap>;

  // Per-device block background (lang-agnostic)
  background?: DeviceVariants<BlockBackground>;
}
```

#### Render resolution

```ts
function resolveVariant<T>(v: DeviceVariants<T> | undefined, device: Device): T | undefined {
  if (!v) return undefined;
  if (device === 'mobile') return v.mobile ?? v.desktop;
  return v.desktop; // tablet + desktop
}
```

#### Edit resolution

```ts
function variantToWrite(device: Device): DeviceVariant {
  return device === 'mobile' ? 'mobile' : 'desktop';
}
```

### 5.2 BE `canvas_data` JSON schema additions

> **BE work item**: extend `canvas_data` JSON schema (file `docs/be-canvas-templates-spec.md` §4) để chứa per-device variants.

#### Hiện tại (schema_version `1.0`)

```jsonc
{
  "schema_version": "1.0",
  "blocks": [
    {
      "id": "blk_01",
      "block_type": "hero_split",
      "name": "Hero",
      "content_vi": { "title": "…", "description": "…", "image_url": "…", "stats": [...] },
      "content_en": { ... },
      "element_styles": { "title": { "color": "#fff", "fontSize": 48 } },
      "background": { "color": "#0a0a0a", "image_url": null }
    }
  ],
  "active_block_id": "blk_01",
  "publish": { "published": true, "share_token": "...", "published_at": "..." }
}
```

#### Mới (schema_version `2.0` — đề xuất)

```jsonc
{
  "schema_version": "2.0",   // BUMP ← FE check & migrate
  "blocks": [
    {
      "id": "blk_01",
      "block_type": "hero_split",
      "name": "Hero",

      "content_vi": {
        "desktop": { "title": "Không gian xanh tiện ích...", "image_url": "https://cdn/desk/hero.jpg", "stats": [...] },
        "mobile":  { "title": "Không gian xanh", "image_url": "https://cdn/mob/hero.jpg",  "stats": [...] }
      },
      "content_en": {
        "desktop": { ... },
        "mobile":  { ... }
      },

      "element_styles": {
        "desktop": { "title": { "fontSize": 64 } },
        "mobile":  { "title": { "fontSize": 32 } }
      },

      "background": {
        "desktop": { "color": "#0a0a0a", "image_url": "https://cdn/desk/bg.jpg" },
        "mobile":  { "color": "#0a0a0a", "image_url": "https://cdn/mob/bg.jpg" }
      },

      "is_visible": true,
      "thumbnail": "https://cdn/blk_01-thumb.jpg"
    }
  ],
  "active_block_id": "blk_01",
  "publish": { ... }
}
```

#### Quy ước

| Field | Required | Note |
|---|---|---|
| `content_*.desktop` | **YES** | BE reject nếu missing |
| `content_*.mobile` | NO | Nếu thiếu → render fallback sang `desktop` |
| `element_styles.desktop` | NO | Block-default styles nếu missing |
| `element_styles.mobile` | NO | Fallback `desktop` nếu missing |
| `background.desktop` | NO | Fallback block default |
| `background.mobile` | NO | Fallback `desktop` |

### 5.3 Migration từ schema 1.0 → 2.0

#### BE migration script

Khi BE deploy schema 2.0, run 1 lần migrate toàn bộ `canvas_templates`:

```sql
-- Pseudo SQL — tuỳ BE chọn cách (Postgres JSONB / app-level migration)
UPDATE canvas_templates
SET canvas_data = jsonb_set(
  canvas_data,
  '{blocks}',
  (
    SELECT jsonb_agg(
      jsonb_set(
        jsonb_set(
          jsonb_set(blk - 'content_vi' - 'content_en' - 'element_styles' - 'background',
            '{content_vi}',
            jsonb_build_object('desktop', blk->'content_vi')
          ),
          '{content_en}',
          jsonb_build_object('desktop', blk->'content_en')
        ),
        '{background}',
        CASE WHEN blk ? 'background'
          THEN jsonb_build_object('desktop', blk->'background')
          ELSE 'null'::jsonb
        END
      )
    )
    FROM jsonb_array_elements(canvas_data->'blocks') AS blk
  )
)
WHERE (canvas_data->>'schema_version') = '1.0' OR canvas_data->>'schema_version' IS NULL;

UPDATE canvas_templates
SET canvas_data = jsonb_set(canvas_data, '{schema_version}', '"2.0"');
```

#### FE backward-compat (tạm thời 1 sprint)

`parseCanvas()` (file `src/components/modules/CanvasTemplate/block-editor/serialize.ts`) detect schema_version:
- `1.0` (legacy): wrap content cũ thành `{ desktop: <legacy>, mobile: undefined }` ngay khi load.
- `2.0`: parse trực tiếp.

Save luôn ghi `2.0`. Sau 1 sprint deploy ổn định, BE drop support 1.0.

---

## 6. Resource optimization

### 6.1 Image variants per device

Mỗi ảnh trong block (hero, gallery, background) có thể có 2 URL riêng:
- **Desktop**: gốc, landscape crop, ≥1280px width, ≤500KB
- **Mobile**: portrait/square crop, ≥390px width, ≤200KB

#### Khuyến nghị BE: tự động generate biến thể

Khi user upload ảnh:
1. BE lưu ảnh gốc (lossless / 1080p+)
2. BE generate **2 variants** qua image processing (sharp/imagemagick):
   - `desktop_2x.jpg` — 2560px wide, quality 85
   - `desktop_1x.jpg` — 1280px wide, quality 80
   - `mobile_2x.jpg`  — 780px wide, quality 80, crop portrait 4:5
   - `mobile_1x.jpg`  — 390px wide, quality 75, crop portrait 4:5
3. Trả về object:
   ```jsonc
   {
     "url": "https://cdn/blk_01/hero_desktop_1x.jpg",         // default = desktop_1x
     "variants": {
       "desktop_1x": "...",
       "desktop_2x": "...",
       "mobile_1x":  "...",
       "mobile_2x":  "..."
     }
   }
   ```

#### FE render

Dùng `<img srcSet>` đúng chuẩn:
```html
<img
  src="https://cdn/.../desktop_1x.jpg"
  srcSet="
    https://cdn/.../mobile_1x.jpg 390w,
    https://cdn/.../mobile_2x.jpg 780w,
    https://cdn/.../desktop_1x.jpg 1280w,
    https://cdn/.../desktop_2x.jpg 2560w"
  sizes="(max-width: 672px) 100vw, 50vw"
/>
```

### 6.2 Crop khác nhau per device

Mobile thường cần **portrait crop** (4:5 hoặc 1:1), desktop cần **landscape** (16:9). User có thể chọn `image_transform` riêng cho từng variant trong editor.

`ImageTransform` lưu trong content variant tương ứng:
- `content_vi.desktop.image_transform = { rotation: 0, scale: 1.0 }`
- `content_vi.mobile.image_transform  = { rotation: 0, scale: 1.2 }` (zoom hơn để fill portrait)

---

## 7. BE work items

| # | Task | Priority | Estimate |
|---|---|---|---|
| BE-1 | Bump `canvas_data.schema_version` → `2.0` | P0 | 0.5d |
| BE-2 | Update OpenAPI/Swagger spec cho `content_*`/`element_styles`/`background` thành `DeviceVariants<T>` | P0 | 0.5d |
| BE-3 | Migration script convert 1.0 → 2.0 | P0 | 1d |
| BE-4 | Validate `content_*.desktop` required, `content_*.mobile` optional | P0 | 0.5d |
| BE-5 | (Tuỳ) Image processing: generate 4 variants khi upload | P1 | 2d |
| BE-6 | (Tuỳ) Trả `image.variants` object trong upload response | P1 | 0.5d |
| BE-7 | AI block-content endpoint (`/v1/ai/block-content`) — extend output để trả cả `desktop` + `mobile` content | P1 | 1d |
| BE-8 | AI canvas-apply-product endpoint — generate per-device content khi apply | P1 | 1.5d |
| BE-9 | E2E test: round-trip schema 2.0 + migration | P0 | 1d |

**Tổng BE effort**: ~8.5d (P0 ~3.5d + P1 ~5d). P0 cần hoàn thành trước khi FE rollout.

### Yêu cầu BE update specs

Cần update các file sau cho align:
- `docs/be-canvas-templates-spec.md` — §4 schema, §15 test matrix
- `docs/be-ai-block-content-spec.md` — output schema có `desktop` + `mobile`
- `docs/be-ai-canvas-apply-product-spec.md` — generate per-device content

---

## 8. FE work items

| # | Task | Priority | Estimate |
|---|---|---|---|
| FE-1 | Update `types.ts`: `DeviceVariants<T>` wrapper, Block schema | P0 | 0.5d |
| FE-2 | Update `serialize.ts`: parse `2.0`, backward-compat `1.0` | P0 | 1d |
| FE-3 | Refactor 6 block templates dùng container queries (xem §3) | P0 | 1.5d |
| FE-4 | `BlockPreview.tsx`: thêm `@container` wrapper | P0 | 0.25d |
| FE-5 | Editor: device toggle = mode chỉnh sửa (không chỉ preview) | P0 | 1d |
| FE-6 | "Copy desktop → mobile" + ngược lại button trong header | P1 | 0.5d |
| FE-7 | Indicator badge "đã tuỳ biến mobile" trong LayersPanel | P1 | 0.5d |
| FE-8 | `ElementToolbar` ghi style theo variant active | P0 | 0.5d |
| FE-9 | Tablet mode: read-only banner | P0 | 0.25d |
| FE-10 | `<img srcSet>` với 4 variants (sau khi BE-5/6 ready) | P1 | 0.5d |
| FE-11 | ESLint rule cấm `md:`/`lg:` trong `blocks/*.tsx` | P2 | 0.5d |
| FE-12 | Visual regression: 6 block × 3 device = 18 screenshot | P0 | 1d |

**Tổng FE effort**: ~7.5d (P0 ~6d + P1 ~1.5d).

---

## 9. Acceptance criteria

### FE
- [ ] Render 6 block đúng layout ở mọi frame (mobile 390 / tablet 834 / desktop 1280) trong editor.
- [ ] User edit ở mode Mobile → chỉ ảnh hưởng `content.mobile`, không động đến `desktop`.
- [ ] Tablet mode read-only, có banner.
- [ ] "Copy desktop → mobile" hoạt động, push history (undo được).
- [ ] Schema legacy 1.0 load được không lỗi (auto-wrap thành 2.0 in-memory).
- [ ] Save luôn ghi 2.0.
- [ ] Visual regression CI pass (18 screenshot diff < threshold).

### BE
- [ ] `POST /v1/canvas-templates` reject nếu `content_*.desktop` missing.
- [ ] Migration 1.0 → 2.0 chạy idempotent.
- [ ] OpenAPI spec ghi rõ `DeviceVariants<T>` shape.
- [ ] AI endpoint trả `desktop` + `mobile` content.
- [ ] (P1) Upload trả 4 variant URLs.

### End-to-end
- [ ] User flow: tạo block → edit desktop → switch sang mobile → edit mobile → save → reload → giữ nguyên cả 2 variant.
- [ ] Public share view (`/v/<share_token>`) responsive đúng theo device thực của khách (qua user agent hoặc viewport detection).

---

## 10. Open questions

1. **Tablet edit?** — Hiện tại đề xuất read-only. Nếu user phản hồi muốn edit tablet riêng, cần mở rộng schema thành 3-variant (`desktop` / `tablet` / `mobile`). Quyết định: chốt 2-variant cho MVP, mở rộng sau nếu cần.

2. **Lazy-load `mobile` variant?** — `canvas_data` có thể nặng nếu cả 2 variant đầy đủ (đặc biệt với `image_url` x4 variants). BE có cần endpoint `/canvas/:id?device=mobile` để chỉ trả 1 variant? — Quyết định: không cho MVP, vì client chỉ render 1 variant tại 1 thời điểm nhưng vẫn cần load cả để chuyển device không cần network round-trip.

3. **AI auto-generate mobile từ desktop** — khi user click "Áp dụng SP" hoặc "AI tạo nội dung", AI có nên tự động sinh ra cả 2 variant (mobile copy ngắn hơn, desktop dài hơn) hay user phải edit mobile thủ công? — Đề xuất: AI gen cả 2, user override nếu muốn.

4. **CDN delivery** — variants ảnh nên ở CDN riêng (CloudFront/S3) hay cùng domain với BE? — Theo `be-canvas-templates-spec.md` §7 thì Phase 2 mới tách CDN. Image variants có thể chờ Phase 2.

---

## 11. Migration timeline

| Tuần | Việc |
|---|---|
| 1 | BE-1, BE-2, BE-3, BE-4, BE-9 (P0). FE-1, FE-2 (P0). FE chạy được với cả 1.0 + 2.0. |
| 2 | FE-3, FE-4, FE-5, FE-8, FE-9, FE-12 (P0). Visual regression baseline. |
| 3 | BE-5, BE-6, BE-7, BE-8 (P1). FE-6, FE-7, FE-10 (P1). Image variants ready. |
| 4 | UAT + bug fix + drop support 1.0 ở BE. FE-11 (lint enforce). |

---

## 12. References

- `docs/be-canvas-templates-spec.md` — schema gốc cần extend.
- `docs/be-ai-block-content-spec.md` — AI endpoint cần update để trả per-device content.
- `docs/be-ai-canvas-apply-product-spec.md` — apply product cần gen per-device.
- Tailwind 4 container queries: <https://tailwindcss.com/docs/responsive-design#container-queries>
- Apple HIG touch targets: <https://developer.apple.com/design/human-interface-guidelines/buttons>
