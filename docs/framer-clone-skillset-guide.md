# Bộ skill Clone Framer — Cách dùng & nguyên tắc

> 3 skill nối tiếp nhau để clone 1 block từ site bất kỳ (Framer hoặc không) vào
> **native block-editor rexerai**. Đã verified bằng case thật:
> `flat-white.framer.website#our-process` → block `framer_process_steps`.

## 1. Ba skill & pipeline

```
URL + block  ──▶  framer-recon  ──▶  spec.md  ──▶  framer-clone-host  ──▶  block trong editor + /p
                  (capture+phân tích)            (wire vào rexerai)
                                     └─(tùy)─▶ framer-clone ─▶ component standalone (Next+framer-motion)
```

| Skill | Việc | Output |
|---|---|---|
| **framer-recon** | Playwright capture 3 breakpoint (1440/768/375) + video + computed styles + framer-names + **CDP animation timing** | `recon-<name>/spec.md` (15 mục) |
| **framer-clone** | (tùy chọn) codegen spec → component **standalone** Next.js + framer-motion + tailwind | component rời, host-agnostic |
| **framer-clone-host** | "Last mile": viết lại theo **contract rexerai** + đăng ký vào editor | block chạy trong editor + `/p/[id]` |

> Có thể đi tắt **recon → host** (scaffold thẳng từ spec), bỏ qua clone — như case test đã làm.

## 2. Cách dùng (step-by-step)

### Bước 0 — Tìm selector block
Trang có nhiều block → cần CSS selector chính xác. Probe nhanh bằng Playwright: load trang, tìm `<section>`/`[data-framer-name]` chứa heading mục tiêu, lấy `id`/`data-framer-name`. (VD tìm được `#our-process`.)

### Bước 1 — Recon
```bash
python3 .claude/skills/framer-recon/scripts/run.py \
  --url "https://..." --selector "#our-process" --name <slug> \
  --out-base <dir> --cdp --video
```
- `--cdp`: bắt timing thật của CSS anim/transition/**Framer Motion (WAAPI)**. **Bắt buộc khi có animation.**
- `--video`: quay scroll (để bắt animation CDP bỏ sót — GSAP/rAF/SVG-draw).
- Đọc `spec.md`: cấu trúc (framer-names), typography, màu, spacing, responsive deltas, bảng animation.

### Bước 2 — Wire vào editor (framer-clone-host)
1. Đọc spec → map timing/easing sang GSAP (`cubic-bezier` → CustomEase/named ease).
2. `types.ts`: thêm `BlockType` union + `XxxContent` interface + `BLOCK_TYPE_META`.
3. Viết `blocks/<Name>.tsx` theo contract (mục 3).
4. Animation qua `useBlockMotion` (R1–R6).
5. Đăng ký — **Path A** (BlockDef registry): 1 def + 1 dòng `registry.ts` + thêm vào `ORDERED_TYPES`.
6. **BE seed** 1 row `blocks` (scope=system) cho `type_code` (việc của BE).
7. Verify: `tsc` → editor canvas → `/p/[id]` → `scripts/verify-block-wiring.sh <type> <Name>`.

## 3. Nguyên tắc hoạt động (3 contract BẮT BUỘC)

1. **Block component**: 1 file `'use client'`, props **`BlockRenderProps`** `{content, styles, background, order, positions, activeKey}`. Mỗi element sửa được: `data-element-key="<key>"` + `selectableClass(activeKey===key, ...)` + `style={composeStyle(BASE, styleOf(key))}`. `<key>` phải khớp `elements[]` trong def.
2. **Tuyền inline + responsive**: mọi **token thiết kế** (font-size/color/spacing) ở **inline `style`** (để editor override per-element được), KHÔNG đặt trên class Tailwind / `<style>`. Responsive = `clamp(min, N·cqi, max)` + `@container` + `@2xl`/`@4xl`. **KHÔNG** `@media`/`md:`/`lg:`/`vw`. Touch ≥44px.
3. **GSAP motion R1–R6**: mọi animation qua **`useBlockMotion`** (hoặc `useLandingMotion` cho block phức tạp). KHÔNG `new Lenis`, KHÔNG `gsap.registerPlugin` trong block, KHÔNG `window` scroll listener. **Mọi `scrollTrigger` phải truyền `scroller`** (từ api) + `invalidateOnRefresh`. **Reduced-motion bail** đầu hàm. framer-motion CHỈ dùng cho per-char text stagger.

### Đăng ký: Path A vs B
- **A (khuyến nghị)**: BlockDef registry → renderBlock/factory/LayersPanel/AddBlockDialog tự đọc. Chi phí: 1 def + 1 dòng. (Vẫn cần `BlockType` union + Content interface ở types.ts + 1 dòng `ORDERED_TYPES`.)
- **B (legacy)**: sửa 7 chỗ trong types/factory/renderBlock/LayersPanel/AddBlockDialog.

### BE seed
`type_code` mới cần 1 row `blocks` scope=system, nếu không **commit version page → 400**. Block vẫn **preview + render `/p`** được khi chưa seed. (BE = Go+Postgres, repo read-only → việc BE.)

## 4. CDP bắt gì / KHÔNG bắt gì

| Bắt được | KHÔNG bắt |
|---|---|
| CSS `@keyframes`, transition, **Web Animations API (Framer Motion)** | **GSAP/rAF**, Canvas/WebGL, Lottie, **SVG path scroll-draw** |

→ Với phần CDP bỏ sót: **xem video** + **probe live** (lấy thẳng từ DOM).

## 5. Bài học thực chiến (case `our-process`)

- **Đường cong SVG vẽ theo scroll**: CDP KHÔNG bắt (không phải WAAPI). Giải pháp đúng = **trích nguyên `path d` + `viewBox` từ SVG gốc bằng Playwright** (`getAttribute('d')`, `getComputedStyle` lấy stroke/dasharray/dashoffset). Gốc dùng 2 path chồng: track mờ (white 0.1) + line trắng `strokeDashoffset` scrub theo scroll.
- **ĐỪNG tự chế path** trong `viewBox 100×100` + `preserveAspectRatio='none'`: kéo giãn làm méo bo góc + đoạn ngang giật trái-phải. Dùng **viewBox gốc** (vd `0 0 1199 1434`) + path gốc.
- **"animate khi scroll" = scrub**, không phải one-shot entrance: `scrollTrigger:{ scrub:true, start, end }` cho `strokeDashoffset 1→0` (dùng `pathLength={1}` + `strokeDasharray:1`).
- **Editor canvas zoom ≠ 100%** làm lệch toán ScrollTrigger — bình thường, output `/p` mới đúng, đừng "fix" trong block.
- **iOS**: đừng GSAP-`pin` mobile → dùng CSS `position: sticky`.

## 6. File tham chiếu trong repo

- `.claude/skills/framer-recon/` — capture (run.py, capture.py, capture-cdp-animations.py, extract.py, synthesize.py)
- `.claude/skills/framer-clone-host/` — SKILL.md + `references/{rexerai-block-integration,gsap-motion-contract}.md` + `scripts/verify-block-wiring.sh`
- `docs/landing-motion-foundation.md` — R1–R6 (nguồn chuẩn; nếu lệch skill thì repo doc thắng)
- Block mẫu chuẩn: `block-editor/blocks/FramerYumeHero.tsx`, `FramerProcessSteps.tsx`
