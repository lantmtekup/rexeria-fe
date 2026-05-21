# Phân tích migration — `rexer-smart-ad-demo` → `rexerai`

**Source:** https://rexer-smart-ad-demo.vercel.app/studio (80 format, 12 category)
**Target:** `src/components/modules/CanvasTemplate/block-editor/` (block + extraElements layer)
**Date:** 2026-05-14

---

## 1. Hệ thống hiện tại (snapshot)

### Block types (top-level section)
- `hero_split` · `hero_overlay` · `feature_section` · `photo_gallery` · `booking_form` · `cta_section` · `image_carousel`

### ExtraElement kinds (free-drag overlay inside 1 block)
- `text` · `edit_text` · `photo` · `video` · `hotspot` · `compare` · `range`

**Khả năng compose hiện có:**
- Drag offset per-element (`elementPositions`)
- Motion timeline GSAP per-element
- Per-device variants (desktop / mobile)
- AI apply-product, AI block-content, AI ImportBlock từ ảnh/Figma

---

## 2. Mapping 80 formats → trạng thái rexerai

### 2.1. ✅ ĐÃ CÓ (no work needed)

| Smart-ad-demo | Rexerai |
|---|---|
| Hotspot | ExtraElement `hotspot` (vừa upgrade modal) |
| Slider Compare | ExtraElement `compare` |
| Auto Rotating Gallery / Swipe Gallery | Block `image_carousel` (Swiper) |
| Cinemagraph (đơn giản) | ExtraElement `video` với autoplay/muted/loop |
| Tap to Play | ExtraElement `video` với poster |
| Shoppable | Block `cta_section` + extra `hotspot` |

### 2.2. 🟢 DỄ MIGRATE — extends existing kind (~1 ngày/cái)

| Smart-ad-demo | Đề xuất |
|---|---|
| Animated Counter | Mở rộng `text` ExtraElement: `content.counterTo`, `counterDuration`, `counterFormat`. Render = count-up animation khi vào view. |
| Typewriter / Text Scramble / Split Text Reveal | Thêm `text` `content.animation: 'typewriter' \| 'scramble' \| 'split-slide-up' \| 'fade-up'` + `animationDuration` |
| Marquee Text | Thêm `text` `content.marquee: { speed, direction }` |
| Tap Reveal Tiles | Mở rộng `photo` thêm `content.revealMode: 'tap-flip'` (CSS rotate-y) |
| Tap & Hold (video) | Mở rộng `video` `content.holdToPlay: boolean` |
| Pinch to Zoom (photo) | Mở rộng `photo` `content.zoomable: boolean` (hammer.js or native) |
| Border Beam (CTA) | Style option cho button: `style.beamColor`, `beamSpeed` |
| Magnetic Button (CTA) | Style option: `style.magneticStrength` |
| Glassmorphism | Style option chung: `style.glass: { blur, tint }` |

### 2.3. 🟡 KIND MỚI cần build — independent ExtraElement (~2-3 ngày/cái)

| Format | Kind đề xuất | Content shape sơ bộ |
|---|---|---|
| Countdown / Live Availability | `countdown` | `{ targetDate, format: 'days-hours-mins-secs' \| 'flip', expiredText }` |
| Scratch Reveal | `reveal` (`mode: 'scratch'`) | `{ coverUrl, revealUrl, brushSize }` |
| Peel to Reveal | `reveal` (`mode: 'peel'`) | Same shape, different gesture |
| Draw to Reveal | `reveal` (`mode: 'draw'`) | Same shape |
| Cursor Reveal (spotlight) | `reveal` (`mode: 'spotlight'`) | `{ baseUrl, revealUrl, spotlightSize }` |
| Water Ripple | `effect_canvas` (`mode: 'ripple'`) | `{ imageUrl, rippleStrength }` (WebGL shader) |
| Particle Reveal | `effect_canvas` (`mode: 'particles'`) | `{ imageUrl, particleCount }` |
| Animated Counter | `counter` | `{ from, to, duration, format, prefix, suffix }` (hoặc gộp vào text variant như §2.2) |
| Spin the Wheel | `spin_wheel` | `{ segments: [{label, weight, prize}], spinDuration }` |
| Eyes Follow | `eyes_follow` | `{ pairPositions: [{x,y}], maxRotateDeg }` |
| Liquid Image | `effect_canvas` (`mode: 'liquid'`) | WebGL displacement on pointer move |

### 2.4. 🟠 BLOCK TYPE MỚI cần build — top-level section (~3-5 ngày/cái)

| Format | BlockType đề xuất | Content shape |
|---|---|---|
| Stories (Instagram-style) | `stories` | `slides: [{ mediaUrl, mediaType, durationMs, caption }]` |
| Split Screen | `split_screen` | `leftView: BlockContent, rightView: BlockContent, defaultView: 'left' \| 'right'` |
| Quiz | `quiz` | `questions: [{ prompt, options: [{label, weight}] }], results: [{ scoreRange, title, body, cta }]` |
| Poll / Survey | `poll` | `question, options: [{label}], showLiveResults` |
| Tile Selector | `tile_selector` | `tiles: [{ id, label, imageUrl, body }], onSelect: 'expand' \| 'navigate'` |
| Bespoke Selector | `wizard` | Multi-step `steps: [{question, options}]` |
| Configurator | `configurator` | `dimensions: [{label, options}]`, `previewLayers: [...]` — heavy |
| Longform Story | `longform_story` | Mixed media `sections: [{mediaUrl, body}]` |
| Chapter Story | `chapter_story` | `chapters: [{title, body, mediaUrl}]` |
| 3D Carousel | `carousel_3d` | Extends `image_carousel` với CSS transform-style: preserve-3d |
| 3D Flip Gallery | `flip_gallery` | `cards: [{frontUrl, backUrl, frontText, backText}]` |
| Flipbook | `flipbook` | `pages: [{imageUrl}]` (turn.js-style) |
| Stories | (đã liệt ở trên) |  |
| Filmstrip | Variant của `image_carousel` (orientation: 'vertical') | 1 prop thêm |
| Pannable (360 panorama) | `panorama` | `{ panoramaUrl, fov, initialYaw }` (PhotoSphere / Three.js) |

### 2.5. 🔴 NẶNG (WebGL / Three.js / specialized) — defer cho phase sau

| Format | Lý do defer |
|---|---|
| AR Camera | getUserMedia + 3D overlay; cần webxr-polyfill |
| Tilt Explore (gyroscope) | DeviceOrientation API + 3D layers |
| Interscroller 3D / Scroll Frames | Three.js + 122-frame canvas — đẹp nhưng heavy asset |
| Hover Frame Sequence | 360-spin frame loader + lazy decode |
| SVG Draw on scroll | SMIL + IntersectionObserver — possible nhưng tốn polish |
| Deep Parallax (multi-layer) | Drag handles, ScrollTrigger setup phức tạp |
| Morph Blob | SVG path morph (anime.js / GSAP MorphSVG) |
| Displacement Gallery | WebGL transition (curtain.js) |
| Motion Tiles | Many tile micro-animations |
| Virtual Tour (room walk) | Multi-panorama + navigation graph — gần như sản phẩm riêng |
| Drag & Drop Planner | Floor-plan editor — gần như sản phẩm riêng |
| Mini Game (stack blocks) | Game engine micro |
| Heatmap Explorer | Heatmap shader + interaction layer |

### 2.6. ⛔ KHÔNG khả thi với FE thuần — bỏ qua

| Format | Lý do |
|---|---|
| Voice Control | SpeechRecognition cross-browser kém |
| Blow to Reveal (mic) | Microphone API, browser permission UX kém |
| Shake Reveal | DeviceMotion permission iOS yêu cầu HTTPS + prompt |
| Gravity Physics | DeviceMotion same |
| Weather Dynamic / Location-Based / Time of Day | BE data source — không thuộc block UI |

---

## 3. Recommended migration waves

### Wave 1 — Quick visual wins (1 tuần)
**Goal:** Mở rộng `text`/`photo` đã có, không thêm kind mới.

- Text animation modes: `typewriter`, `scramble`, `split-slide-up`, `fade-up`
- Counter mode trong text (`counterTo`, `counterDuration`)
- Marquee mode trong text
- Photo `tap-to-flip` reveal
- CTA style options: `beam`, `magnetic`, `glass`

Tác động code: tăng ~250 LOC, không đụng BE spec (chỉ thêm trường optional trong `content` / `style` cũ).

### Wave 2 — High-impact new kinds (2 tuần)

- `countdown` (Live Availability + flip clock)
- `reveal` (scratch + peel + spotlight, 1 kind 4 modes)
- `counter` (nếu Wave 1 chưa cover)
- `spin_wheel` (gamification, dễ kiếm KPI)

Tác động: types.ts + renderer + toolbar + factory + BE spec update (per-kind §3).

### Wave 3 — Block-level lift (3-4 tuần)

- `stories` (Insta) — block type mới
- `split_screen` — block type mới
- `quiz` + `poll` — 2 block types form-like
- `carousel_3d` — extend `image_carousel`

Tác động: BlockType enum mở rộng, factory, renderer, BlockTypeMeta, AddBlockDialog, BE spec.

### Wave 4 — WebGL / Three.js (theo nhu cầu)

Chỉ build khi có brief cụ thể từ sale/client. Mỗi cái 1-2 tuần.

Ưu tiên (subjective):
1. `panorama` (real estate use case rõ)
2. `flipbook` (catalog use case rõ)
3. `interscroller_3d` (ad media monetisation)
4. `cinemagraph_pro` (vẫn ext của video)

---

## 4. Mapping sang code locations (cho developer)

| Action | File chính |
|---|---|
| Thêm ExtraElement kind | `block-editor/types.ts` → enum + content interface + ExtraElement union |
| | `block-editor/extraElements.ts` → DEFAULT_SIZE + factory case |
| | `block-editor/AddExtraElementButton.tsx` → KINDS array |
| | `block-editor/ExtraElementOverlay.tsx` → switch case + renderer fn |
| | `block-editor/ExtraElementToolbar.tsx` → KIND_LABEL/KIND_ICON + editor fn |
| | `block-editor/ExtraElementsList.tsx` → KIND_META + labelOf case |
| | `docs/be-extra-elements-spec.md` → §3.X new section |
| Thêm BlockType | `block-editor/types.ts` → BlockType enum + Content interface + BlockContent union |
| | `block-editor/factory.ts` → NAME_BY_TYPE + DEFAULTS_VI/EN + createBlock case |
| | `block-editor/AddBlockDialog.tsx` → ORDERED_TYPES |
| | `block-editor/LayersPanel.tsx` → ELEMENTS_BY_TYPE entry |
| | `block-editor/blocks/{NewBlock}.tsx` → React component |
| | `block-editor/blocks/renderBlock.tsx` → switch case |
| | `block-editor/BLOCK_TYPE_META` → label + accent color |
| | `docs/be-canvas-templates-spec.md` (hoặc tách spec mới) |

---

## 5. BE delta cần lobby (cho mỗi wave)

| Wave | BE work |
|---|---|
| 1 | Optional fields trong existing `text`/`photo` schema — additive, không breaking |
| 2 | Mỗi kind mới (`countdown`/`reveal`/`counter`/`spin_wheel`) là 1 entry vào ExtraElementKind enum + content schema. BE strict validator phải biết. Cập nhật `docs/be-extra-elements-spec.md` §3 đã có template. |
| 3 | BlockType enum mới + content schema cho từng cái. Cập nhật `docs/be-canvas-templates-spec.md`. |
| 4 | Có thể cần media pipeline (panorama tile generator, frame extractor). |

---

## 6. Tracking / analytics (đã có hook)

Mọi element mới nên reuse `ExtraElementTracking` (đã có trong `types.ts`). Public renderer fire `window.dispatchEvent('rexer:track', detail)` — GA/Posthog adapter subscribe.

Quiz / Poll / Spin Wheel đặc biệt cần track sự kiện chi tiết (answer chosen, prize won). Mở rộng `eventName` strategy theo từng kind.

---

## 7. Effort estimate tổng

| Wave | LOC ước tính | Tuần dev (1 người) |
|---|---|---|
| Wave 1 | +400 | 1 |
| Wave 2 | +1200 | 2-3 |
| Wave 3 | +2500 | 4-5 |
| Wave 4 | +1500/cái | 1-2 mỗi format |

Tổng cumulative Wave 1-3: ~4 KLOC + tương đương BE schema work. Sản phẩm đủ cạnh tranh với smart-ad-demo trong 7-9 tuần.

---

## 8. Liên hệ

- FE: @Lantm
- Quyết định thứ tự Wave: cần product owner + sale priority
- BE timeline: phụ thuộc Wave 2+ — BE strict validator hiện chặn schema mới
