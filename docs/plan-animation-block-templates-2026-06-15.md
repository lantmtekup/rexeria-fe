# Đóng gói 40 ví dụ Frontend Animation → Block Template

> Nghiên cứu + kế hoạch — 2026-06-15. Nguồn: `~/Documents/discord-summarizer/Phan-tich-40-vi-du-Frontend-Animation.pdf` (CodeGrid). Mục tiêu: biến các hiệu ứng thành **block template tái dùng** trong block-editor.

## 1. Kiến trúc hiện tại (tóm tắt nghiên cứu)

### 1a. Thêm 1 block type = ~7 chỗ
| Chỗ | File |
|---|---|
| Content interface + thêm vào union `BlockContent` | `block-editor/types.ts` |
| Thêm literal vào `BlockType` | `types.ts` |
| Entry `BLOCK_TYPE_META` (label, accent, adminLabel, aiLabel…) | `types.ts` |
| Default content VI/EN (`DEFAULTS_VI/EN`) | `block-editor/factory.ts` |
| Component renderer mới | `block-editor/blocks/<Name>.tsx` |
| `switch case` + import | `block-editor/blocks/renderBlock.tsx` |
| Editable elements `ELEMENTS_BY_TYPE` | `block-editor/LayersPanel.tsx` |
| (tùy) thứ tự hiển thị `ORDERED_TYPES` | `block-editor/AddBlockDialog.tsx` |

### 1b. HAI mô hình animation
- **Mô hình A — Motion system khai báo** (`block-editor/motion/`): GSAP 3.15 + ScrollTrigger. 9 preset (`fade/slide/scale/zoom/blur`), 6 property (`opacity,x,y,scale,rotate,blur`), 3 trigger (`load / in-view / scroll-progress` có scrub). Per-element qua `[data-element-key]`. **Không** có: hover, clip-path, FLIP, lerp-bám-chuột, timeline reverse giữa chừng.
- **Mô hình B — Block tự chạy** (Stories, Carousel3d, Panorama, framer-stats-grid): mỗi block tự quản `requestAnimationFrame` / pointer / `setInterval` / `useReveal` (IntersectionObserver), **không** dùng MotionProvider. Bundle nhẹ (vanilla CSS + RAF). **Đây là khuôn cho mọi block tương tác phức tạp.**

→ Đa số 40 ví dụ thuộc **mô hình B** (tự chạy). Khuôn file: `blocks/<Name>.tsx` 200–280 LOC, nhận `{content, styles, background, order, positions, activeKey}`, dùng `composeStyle/elementStyleOf` từ `applyStyle.ts`, cleanup RAF/listener khi unmount.

### 1c. Ràng buộc BE catalog (QUAN TRỌNG)
`AddBlockDialog` chỉ hiện type có trong **FE `ORDERED_TYPES`** ∩ **BE `/v1/block-types` `is_active`**. Commit version chứa block_type ngoài catalog → **BE 400**. Vậy mỗi block mới:
- ✅ Render preview (PreviewMode / insights landing) ngay khi có renderer FE.
- ⛔ Để *thêm vào canvas + lưu template* phải có **BE đăng ký code** (`is_active=true`). → cần doc handoff BE cho danh sách code mới.

## 2. Hạ tầng dùng chung cần bổ sung trước (anim kit)
Tạo `block-editor/blocks/_anim/` gom helper để mọi block tái dùng (viết 1 lần):
- `useReveal` — đã có ở `src/blocks/_shared/use-reveal.ts` (IO + reduced-motion). Tái dùng.
- `useLerpFollow(targetRef)` — lerp `current += (target-current)*k` mỗi rAF; bám chuột/scroll (pattern #5).
- `useScrollScrub({trigger, pin, scrub})` — wrap GSAP ScrollTrigger (pattern #3). ⚠️ kèm biến thể `position:sticky` cho mobile (xem §5).
- `useFlip()` — wrap `Flip.getState/from` (pattern #4) — cần register plugin `Flip`.
- `useRafLoop(tick)` — chuẩn hoá vòng rAF + cleanup.
- (Mô hình A mở rộng) thêm property `clipPath` + preset `mask-reveal` (overflow:hidden + y) vào `motion/presets.ts` + `runtime.tsx` → phục vụ pattern #1, #7 cho MỌI block sẵn có mà không cần block mới.

## 3. Phân tầng 40 ví dụ

**Tier A — chỉ cần MỞ RỘNG motion system (không tạo block mới):** mask-reveal (#11 portfolio, #26 clip-path), stagger fade-up, scroll reveal. → thêm preset `mask-reveal` + property `clipPath`. Áp được cho mọi block hiện có.

**Tier B — block tương tác MỚI (mô hình B, ưu tiên build):**
| # | Ví dụ | Block code đề xuất | Kỹ thuật | Mobile |
|---|---|---|---|---|
| 36 | Sticky Cards | `sticky_scroll_cards` | ScrollTrigger pin+scrub / sticky | ⚠️ dùng sticky |
| 34 | Text Displacement | `text_displace_hero` | lerp + rAF (zero-dep) | ✅ |
| 39 | Image Trail | `image_trail` | DOM + CSS transition | ✅ |
| 7 | Parallax stickers | `parallax_hero` | mousemove transform | ✅ (tắt trên touch) |
| 17 | Scroll wheel gallery | `wheel_gallery` | ScrollTrigger + lượng giác | ⚠️ |
| 23 | Gallery 3D depth | `gallery_3d_depth` | CSS 3D translateZ | ✅ |
| 18 | FLIP layout | `flip_gallery` | GSAP Flip | ✅ |
| 22 | Lightbox | `lightbox_flip` | GSAP Flip | ✅ |
| 35 | Image Explosion | `image_explosion` | physics rAF (gravity) | ✅ |
| 3 | Hover pixel image | `hover_pixel_image` | blend-mode + rAF | ✅ |
| 4 | Hover equalizer text | `hover_equalizer_heading` | per-char scaleY | ✅ |
| 1 | Hover reveal list | `hover_reveal_list` | image-follow chuột | ⚠️ |
| 20 | Product letter slider | `letter_slider` | Anime/clip-path per char | ✅ |
| 28 | Product spec sheet | `product_spec_sheet` | bottom-sheet timeline | ✅ |
| 24 | Canvas pan + lens | `gallery_pan_lens` | WAAPI pan + scrub | ⚠️ |
| 16 | Seamless loop cards | `seamless_scroll_gallery` | ScrollTrigger wrap | ⚠️ khó |
| 25 | SVG morph overlay | `svg_morph_overlay` | SVG path tween | ✅ khó |
| 9/12 | Marquee band | `marquee_band` | CSS keyframes | ✅ dễ |

**Tier C — app-level / WebGL nặng (KHÔNG thành block, để code-template hoặc hoãn):** preloader (#8), menu-overlay/nav (#13,14), page transitions (#30,32,40), GSAP nav (#31), Three.js Asset ORB (#33), Lens GLSL (#37), Cielrose (#38), Spline landing (#10), audio canvas (#6). Các cái này thuộc tầng trang/nav/shader, nằm ngoài "block" — nếu cần thì làm `src/templates/{code}` (code-template) riêng.

## 4. Lộ trình theo batch
- **Batch 0 — Hạ tầng:** anim kit (`_anim/`) + mở rộng motion `mask-reveal`/`clipPath`. (~0.5–1 ngày)
- **Batch 1 — 4 block "wow" nhẹ, mobile-OK (đề xuất bắt đầu):** `sticky_scroll_cards`, `text_displace_hero`, `image_trail`, `gallery_3d_depth`.
- **Batch 2 — FLIP & gallery:** `flip_gallery`, `lightbox_flip`, `wheel_gallery`, `parallax_hero`.
- **Batch 3 — hover & slider:** `hover_pixel_image`, `hover_equalizer_heading`, `letter_slider`, `marquee_band`.
- **Batch 4 — khó/đặc thù:** `seamless_scroll_gallery`, `svg_morph_overlay`, `gallery_pan_lens`, `image_explosion`, `product_spec_sheet`.
- Tier C: đánh giá riêng (code-template).

Mỗi batch: build renderer FE → preview verify (Playwright) → gửi danh sách code cho BE đăng ký catalog → enable trong `ORDERED_TYPES`.

## 5. Rủi ro / nguyên tắc
- **BE catalog gate**: block mới phải được BE `is_active` mới thêm/lưu được (xem §1c). Cần handoff doc cho từng batch.
- **Mobile iOS pin**: pin bằng `transform`/GSAP hay giật trên iOS → ưu tiên `position:sticky` (đã ghi ở memory). Mỗi block scroll/pin phải có biến thể hoặc fallback mobile.
- **Bundle**: ưu tiên mô hình B vanilla (rAF + CSS), tránh kéo thêm lib. GSAP/ScrollTrigger/Flip đã có sẵn — dùng lại, không thêm.
- **reduced-motion**: tôn trọng `prefers-reduced-motion` (useReveal đã có) cho mọi block.
- **i18n + editable**: mỗi block khai báo content VI/EN + `ELEMENTS_BY_TYPE` để sửa được trong editor.

## 7. Source thật — đã đọc & xác minh (port spec)

Mã nguồn gốc 40 demo nằm ở `~/Documents/discord-summarizer/output/projects/<id>_<slug>/` (249 demo, `projects_index.json` map slug→entry html). Đã đọc code thật 3 block batch-1:

### `text_displace_hero` — từ `240_…menuxl-text-displacement` (✅ vanilla, zero-dep, dễ nhất)
- DOM: tách `textContent` theo word/letter → `<span class="word|letter">`, space giữ làm text-node. `will-change:transform`.
- JS: sau 100ms chụp tâm mỗi span (`getBoundingClientRect`) làm `originalX/Y`. `mousemove`: với mỗi span, `dist=hypot(ox-mx, oy-my)`; nếu `dist<radius(150)` → `force=(1-dist/radius)*max(300)`, `targetX=(dx/dist)*force`. Vòng rAF: `currentX += (targetX-currentX)*0.1` → `transform:translate(currentX,currentY)`.
- Content: heading, splitBy(word/char). Config: radius, maxDisplacement, lerp.
- ⚠️ phải re-split + chụp lại tâm khi resize; thêm `touchmove`; tôn trọng reduced-motion; cleanup listener+rAF khi unmount/đổi deps.

### `image_trail` — từ `243_…burocratik-image-trail-js` (✅ vanilla + Lenis optional)
- DOM: `<section.trail-container>` (relative); ảnh tạo động `createElement('img').trail-img` (absolute, 200px, `pointer-events:none`, `transform:translate(-50%,-50%) rotate(r) scale(0→1)`).
- JS: config object đầy đủ (imageCount 35, mouseThreshold 100px Pythagoras, idleCursorInterval 300, imageLifespan 750, in 750/out 1000ms, easing in/out). Vòng rAF gọi `createTrailImage()` (tạo ảnh khi di đủ xa hoặc idle) + `removeOldImages()` (throttle 50ms, scale-out rồi remove DOM). Queue `trail[]` giữ `{element,rotation,removeTime}`.
- Content: images[] (URL). Config: threshold, lifespan, durations.
- ⚠️ thao tác DOM trực tiếp trong useEffect(ref) — KHÔNG render ảnh bằng React; cleanup remove toàn bộ ảnh + listener + rAF. Section giữa trang (không full-page). Bỏ Lenis nếu không cần.

### `sticky_scroll_cards` — từ `250_…ashfall-rebuild-js` (⚠️ GSAP+ScrollTrigger+Lenis, lưu ý iOS)
- DOM: `<section.sticky-cards>` > `.cards-container`(relative, overflow:hidden) > N×`.card`(absolute 100%) chứa `.tag`+`<img>`.
- JS: timeline ScrollTrigger `start:'top top'`, `end:'+= innerHeight*(N-1)'`, `scrub:0.5`. Vòng `for i in 0..N-2` tại position `i`: card[i] `scale→0.5, rotation→10`; img bên trong `scale→1.5`; card[i+1] `y:100%→0%`. Khởi tạo card[0] y:0, còn lại y:100%.
- Content: cards[{imageUrl,title}]. Config: finalScale .5, rotateDeg 10, imageZoom 1.5, scrub .5.
- ⚠️ **iOS**: GSAP `pin:true` dùng `position:fixed` → giật. Dùng **`position:sticky` + bỏ pin** (giữ scrub timeline). Lenis ticker cần init/destroy trong useEffect. GSAP/ScrollTrigger đã có sẵn trong repo.

→ Kết luận: cả 3 port được faithfully bằng **mô hình B (block tự chạy)**, dùng đúng lib repo đã có. `text_displace_hero` là PoC sạch nhất để chốt khuôn.

## 8. Việc cần chốt
1. Bắt đầu **Batch 0 + Batch 1** (4 block) hay làm **1 PoC** (`text_displace_hero`) trước để chốt khuôn?
2. BE handoff doc: **để sau** (đã chốt) — build FE + preview trước.
