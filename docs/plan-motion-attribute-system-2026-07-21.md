# Motion Attribute System — Plan & Tracking

> Cập nhật: 2026-07-21 (rev 2) · Đối chiếu: `docs/blocks-audit-report.md` (169 block, 132 có animation) · Docs kỹ thuật: `docs/landing-motion-foundation.md` mục 3b
>
> ⚠️ **Trạng thái git:** toàn bộ đợt 2 + đợt 4 (motionLibrary.ts, useMotionAttributes.ts, docs §3b, `/dev/motion`, fix space MintV2Process) đang nằm ở **working tree, CHƯA COMMIT**. Việc đầu tiên của session tiếp theo: commit cụm này trước khi migrate.

## 0. Mục tiêu

Chuẩn hoá animation của block thành **library hiệu ứng dùng chung**, dev gắn qua `data-motion-*` attribute trong JSX — không code GSAP tay cho case thường. 3 tầng:

- **T1** — gắn 1 effect có sẵn + chỉnh timing bằng attribute.
- **T2** — choreograph nhiều element: `data-motion-group` + `data-motion-delay` / `data-motion-stagger-children`.
- **T3** — case đặc biệt (pin, frame-scrub, Flip, canvas effect…) giữ `useBlockMotion` (contract R1–R6).

Chưa làm đợt này (đã chốt): UI chỉnh animation trong editor/canvas, lưu CMS.

---

## 1. ĐÃ XONG ✅

### Đợt 1 — Nền tảng + pilot (shipped)

- [x] `src/components/modules/block-editor/motion/motionLibrary.ts` — effect registry thuần data.
- [x] `src/components/modules/block-editor/motion/useMotionAttributes.ts` — runtime hook: quét `[data-motion]`, build GSAP + ScrollTrigger theo contract R1–R6 (scroller từ LandingMotion, `invalidateOnRefresh`, gsap.context revert, revert SplitText); tự skip trên edit-canvas (`[data-testid="active-block-preview"]`) và `prefers-reduced-motion`.
- [x] Trigger: `in-view` (per-element, play/reverse hoặc once) · `scrub` (per-element, trigger-target/end-target) · `load` · `loop`.
- [x] Group choreography: `data-motion-group` trên container — con dùng chung 1 ScrollTrigger, offset bằng delay (giải cả bài toán element lặp trong list).
- [x] **Pilot `MintV2Process` full-fidelity**: xoá ~90 dòng GSAP/SplitType tay → 1 dòng hook + attributes; tái tạo đúng 4 hiệu ứng gốc (heading char-stagger 1.6s/0.06, line scrub 0.8, step fade-up 30/20px offset 0/0.15/0.3 có reverse, dot back.out(2)).
- [x] Docs mục 3b trong `landing-motion-foundation.md`.
- [x] Verified runtime (Playwright, `/dev/blocks?type=mintv2_process`): scrub 2 chiều, per-step reverse, guard edit-canvas, reduced-motion, regression System A.

### Đợt 2 — Mở rộng effect library (shipped, CHƯA migrate block)

- [x] +7 effect mới → tổng **20 effect**.
- [x] Runtime: `data-motion-direction` / `-axis` / `-repeat` / `-yoyo` / `-stagger-children`, trigger `loop`, nhánh `counter` (tween textContent, restore khi cleanup).
- [x] Trang duyệt effect **`/dev/motion`** (`src/app/dev/motion/page.tsx`) — mỗi section 1 effect, id `fx-<effect>`.
- [x] Verified từng effect trên `/dev/motion` (computed style, mid-flight, reverse, không console error).
- [x] Recipe verify: `.claude/skills/verify/SKILL.md`.
- [x] **Agent memory (Hybrid, 2026-07-21):** `MotionEffect.meta` bắt buộc trên 24 effect; skill `motion-pick` + `yarn motion:catalog` → `effects-catalog.md`.

### Bộ effect hiện có (24 = 20 đợt 2 + 4 hover đợt 4)

| id | đối tượng | ghi chú |
|---|---|---|
| `fade-in` / `fade-up` / `fade-down` | any | `-distance` override biên độ |
| `slide-left` / `slide-right` | any | |
| `scale-in` / `zoom-in` / `blur-in` | any / ảnh | |
| `scale-pop` | khung/any | back.out(2) |
| `char-reveal` / `word-reveal` / `line-reveal` | chữ | SplitText + mask + stagger |
| `line-draw` | khung | scrub mặc định; `-axis='x'` → ngang |
| `parallax` | ảnh | scrub full-range, ±distance |
| `clip-reveal` | ảnh/khung | `-direction` down/up/left/right |
| `media-zoom` | ảnh | Ken Burns settle (cần wrapper overflow-hidden) |
| `rotate-in` / `flip-in` | any | |
| `counter` | chữ | đếm số, giữ prefix/suffix/phẩy nghìn |
| `marquee-loop` | any | trigger loop, nội dung nhân đôi trong JSX |
| `hover-scale` / `hover-lift` / `hover-tilt` | any | trigger hover — play/reverse theo pointer, skip touch |
| `hover-zoom` | ảnh | listener card cha qua `closest:.card` |

---

## 2. GAP so với audit (blocks-audit-report.md)

| Nhóm audit | Blocks | Độ phủ sau đợt 2 | Còn thiếu |
|---|---:|---|---|
| entrance | 114 | ✅ ~95% | — |
| text | 18 | ✅ 15/18 | equalizer/displace/letter-slider → T3 vĩnh viễn |
| scroll | 73 | ✅ ~70% | pin/sticky/frame-scrub → T3 |
| image | 71 | ✅ ~60% | Flip/trail/explosion → T3 |
| hover | 22 | ✅ trigger hover + 4 effect (đợt 4 shipped) | tilt theo vị trí chuột (mouse-parallax) → T3 |
| other | 35 | ~20% (marquee) | carousel/drawer/accordion = logic component → T3 |
| none | 37 | (cơ hội gắn free) | — |

Ước lượng: **~100+ block** giờ express được bằng attribute · **~22 block** chờ trigger hover · **~25–30 block** ở lại T3 (đúng vai trò).

---

## 3. VIỆC CÒN LẠI — tracking

### Đợt 3 — Migration waves (gắn attribute vào block, xoá GSAP tay)

> Nguyên tắc: mỗi block migrate xong phải đối chiếu behavior với bản gốc (quay video/screenshot trước khi sửa). Block nào có `data-motion` thì KHÔNG gọi `useBlockMotion` cho cùng element. Verify theo `.claude/skills/verify/SKILL.md`.

**Wave 1 — 37 block "none" (chỉ GẮN attribute, không xoá gì — rẻ nhất):**

- [ ] Lumea pack (8): `lumea_hero`, `lumea_statement`, `lumea_immersive`, `lumea_handcrafted`, `lumea_amenities`, `lumea_testimonial`, `lumea_gallery`, `lumea_footer`
- [ ] Nordhaven pack (7): `nordhaven_hero`, `nordhaven_about`, `nordhaven_services`, `nordhaven_testimonials`, `nordhaven_gallery`, `nordhaven_footer` (+`nordhaven_faq` nếu muốn)
- [ ] Housent pack tĩnh (10): `housent_about`, `housent_cta`, `housent_excellence`, `housent_faq`, `housent_footer`, `housent_solutions`, `housent_stats` (counter!), `housent_testimonial`, `housent_values`
- [ ] Firma pack (5): `firma_hero`, `firma_statement`, `firma_services`, `firma_testimonial`, `firma_footer`
- [ ] Ignitex pack (5): `ignitex_hero`, `ignitex_services`, `ignitex_about`, `ignitex_cta`, `ignitex_footer`
- [ ] Còn lại: `framer_yume_hero`, `framer_yuya_hero`, `readymag_projects`, `readymag_footer`
- Pattern chuẩn: heading `word-reveal`/`fade-up`, body `fade-up`, grid/list bọc `data-motion-group` + `data-motion-stagger-children='0.12'`, stats dùng `counter`.

**Wave 2 — entrance thuần (~30 block, THAY code GSAP tay):**

- [ ] Nhóm generic: `feature_section`, `process_steps`, `split_screen`, `stories`, `story_slides`, `product_spec_sheet`, `booking_form`, `quiz`, `poll`
- [ ] Nhóm Framer entrance-only: `framer_intro_redefined`, `framer_explore_cta`, `framer_studio_manifesto`, `framer_stats_grid` (counter), `framer_team_directory`, `framer_image_stagger`, `framer_signature_feature`, `framer_clarity_services`, `framer_aestha_editorial`, `framer_firma_template_strategy_digital`
- [ ] Mint entrance: `mint_details`, `mint_sku`, `mintv2_cta` (đối chiếu SplitType→SplitText)

**Wave 3 — scroll/image (~30 block: fade-up + parallax + clip-reveal + line-draw):**

- [ ] Springs pack (13): header/hero/gallery/intro/design/interiors/residences/wellness/nature_place/map/contact_footer… — ⚠️ `nature_place` đang dùng `data-motion` làm marker nội bộ, phải rename trước khi gắn hook (xem Known issues)
- [ ] RealEstate pack (8): hero/info/overview/highlights/utilities/location/villa…
- [ ] CoolHunter pack (6) + `pnj_cta`, `pnj_details`, `sustainit_our_expertise`, `housent_our_excellence`
- [ ] Cập nhật `blocks-audit-report.md`: thêm tag `attr` cho block đã migrate.

**Ở lại T3 (KHÔNG migrate — ghi nhận để khỏi tốn công):** `mint_hero`, `q80_experience`, `protection_scrollytelling`, `scroll_mattis`, `hero_scroll`, `sticky_scroll_cards`, `wheel_gallery`, `flip_gallery`, `lightbox_flip`, `image_trail`, `image_explosion`, `pixel_reveal`, `text_displace_hero`, `hover_equalizer_heading`, `letter_slider`, `carousel_3d`, `flipbook`, `panorama`, `image_carousel`, `interactive_ad_widget`, drawer/header/nav packs (`q80_menu`, `pnj_header`, `pnj_sticky_menu`, `delvaux_header`, `delvaux_subnav`…).

### Đợt 4 — Trigger tương tác ✅ (shipped 2026-07-21)

- [x] Trigger `hover`: timeline paused + pointerenter/leave (play/reverse), skip thiết bị không hover (`(hover: hover)`), listener gỡ sạch khi cleanup.
- [x] Trigger `click`: toggle play/reverse.
- [x] 4 effect hover: `hover-scale`, `hover-lift`, `hover-tilt`, `hover-zoom` → tổng **24 effect**. Mọi effect khác cũng dùng được với trigger hover/click (immediateRender off).
- [x] `data-motion-trigger-target='closest:<sel>'` — pattern hover card cha → animate con, đúng cho element lặp trong list.
- [x] Demo trên `/dev/motion`.
- → Nhóm hover (22 block) giờ đã migrate được — gộp vào Wave 2/3 khi implement.

### Đợt 5 — Editor (đã hoãn, chờ quyết định)

- [ ] Cho user chỉnh attribute animation từ editor + lưu CMS (hội tụ với System B track-based hoặc panel riêng — cần bàn lại thiết kế khi đến lúc).

---

## 4. Cách dùng nhanh (cho dev implement)

```tsx
import { useMotionAttributes } from '../motion/useMotionAttributes';

useMotionAttributes(rootRef, [items.length]); // deps khi DOM list đổi

<h2 data-motion='char-reveal'>…</h2>
<div data-motion='counter'>1,250+ khách hàng</div>

<li data-motion-group='' data-motion-start='top 80%' data-motion-stagger-children='0.15'>
  <div data-motion='fade-up' data-motion-distance='30' data-motion-duration='0.9' />
  <p   data-motion='fade-up' />
  <span data-motion='scale-pop' />
</li>

<img data-motion='parallax' data-motion-distance='40' />
<div data-motion='clip-reveal' data-motion-direction='left' />
```

- Duyệt effect bằng mắt: **`/dev/blocks`** (block thật) và **`/dev/motion`** (catalog 24 effect).
- Bảng attribute đầy đủ: `docs/landing-motion-foundation.md` mục 3b.
- Rule: 1 element chỉ 1 driver — không mix `data-motion` với `useBlockMotion`/System B track trên cùng element.

## 5. Motion memory / skill (agent retrieve)

Hybrid memory — **không** đoán effect từ `label`/`from`/`to`:

| Lớp | Vai trò |
|---|---|
| `MotionEffect.meta` trong `motionLibrary.ts` | Single source: summary, whenToUse, whenNotToUse, vs, tags, category, prerequisites, relevantAttrs, example |
| `yarn motion:catalog` → `scripts/sync-motion-catalog.mjs` | Generate `.claude/skills/motion-pick/references/effects-catalog.md` |
| Skill `.claude/skills/motion-pick/` | Decision tree + hard rule: chỉ pick id trong catalog allowlist |

Helpers: `listMotionEffects()`, `listMotionEffectIndex()`. Sau khi sửa meta → chạy sync trước khi dựa skill.

## 6. Files liên quan

| File | Vai trò |
|---|---|
| `src/components/modules/block-editor/motion/motionLibrary.ts` | Registry 24 effect + meta (agent memory) |
| `src/components/modules/block-editor/motion/useMotionAttributes.ts` | Runtime attribute → GSAP |
| `src/components/modules/block-editor/motion/LandingMotion.tsx` | Nền scroller/refresh (không sửa) |
| `src/components/modules/block-editor/blocks/MintV2Process.tsx` | Block pilot (mẫu tham khảo migrate) |
| `src/app/dev/motion/page.tsx` | Trang catalog/QA effect |
| `docs/landing-motion-foundation.md` §3b | Spec attribute + rule T1/T2/T3 |
| `docs/blocks-audit-report.md` | Nguồn phân loại 169 block |
| `.claude/skills/verify/SKILL.md` | Recipe verify runtime |
| `.claude/skills/motion-pick/SKILL.md` | Skill pick đúng effect |
| `.claude/skills/motion-pick/references/effects-catalog.md` | Catalog generate (DO NOT EDIT BY HAND) |
| `scripts/sync-motion-catalog.mjs` | Sync meta → catalog |

## 7. Known issues / lưu ý

- ⚠️ `MintV2Process.tsx:242` — space trong class `` `step-body${' @2xl:ml-auto'}` `` từng bị session khác revert (buffer cũ). Hiện fix đã nằm lại trong working tree (chưa commit — xem cảnh báo đầu doc). Nếu thấy step lẻ mất `ml-auto` hoặc `.step-body` không match → kiểm tra lại dòng này.
- ⚠️ **Va chạm tên attribute:** `SpringsNaturePlace.tsx` đang dùng `data-motion='heading' | 'body' | 'caption-late'` làm **marker selector nội bộ** cho GSAP tay (không phải effect id). Hiện vô hại vì block chưa gọi `useMotionAttributes` (runtime chỉ quét trong root có gọi hook), nhưng khi migrate Springs pack (Wave 3) **phải rename các marker này trước** (vd `data-anim='heading'`), nếu không runtime sẽ parse chúng như effect id và fail.
- FOUC nhỏ trên `/p`: element scrub hiện rest state trong khoảng JS-load gap (block dưới fold nên thực tế không thấy).
- `marquee-loop` yêu cầu nội dung nhân đôi trong JSX (track 200%).
- `media-zoom` đặt lên `<img>`/inner div bên trong wrapper `overflow-hidden`.
- Editor scrub chỉ chuẩn ở zoom 100% (caveat sẵn có của nền, xem docs §5).
