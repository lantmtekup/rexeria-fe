---
name: block-review
description: >-
  Review code 1 block của rexerai (native ở src/components/modules/block-editor/blocks
  hoặc legacy ở src/blocks) — tập trung RESPONSIVE desktop + mobile, animation,
  và tính nhất quán kiến trúc. Dùng skill này BẤT CỨ KHI NÀO dev nhờ review/kiểm
  tra/QA một block, một component hero/section, file trong `src/blocks/*` hoặc
  `block-editor/blocks/*`, hoặc hỏi "block này responsive chưa", "review block X",
  "sao block vỡ trên mobile", "kiểm tra block trên desktop/mobile", kể cả khi họ
  không nói chữ "review". Skill biết các bẫy responsive đặc thù của repo (container
  query vs media query, cqi, inline style đè class) và cách dùng tool preview W×H/zoom.
---

# Review Block (rexerai)

Mục tiêu: tìm lỗi **trước khi merge** — đặc biệt **responsive vỡ trên mobile** và
**không scale đúng trên desktop**, vì đây là 2 chỗ block hay hỏng nhất trong repo này.

Đọc code block + (nếu chạy được) xem render thật qua tool preview, rồi trả về 1
**báo cáo review có cấu trúc** (template ở cuối). Đừng chỉ liệt kê checklist — hãy
chỉ ra **dòng/đoạn cụ thể** sai và **cách sửa**.

**Nguồn chuẩn (source of truth — đối chiếu khi nghi ngờ):**
- `docs/canvas-block-responsive-spec.md` — convention responsive **R1–R10** (container query, 3-tier `@2xl`/`@4xl`, mobile-first, touch ≥44px, per-device content).
- `docs/landing-motion-foundation.md` — motion **R1–R6** (GSAP `useBlockMotion`/`useLandingMotion`).
- Block mẫu đạt chuẩn: `block-editor/blocks/FramerPerformHero.tsx` (inline clamp+cqi + `useBlockMotion`), `MintV2Works.tsx` (block phức tạp: SplitType + portal).

## Bước 1 — Xác định block & đọc đúng file

Block ở 1 trong 2 hệ; map từ `type_code`/tên:

| Hệ | Vị trí | Nhận biết |
|---|---|---|
| **Native** (canvas editor) | `src/components/modules/block-editor/blocks/<Pascal>.tsx` | type_code snake_case (`hero_split`, `framer_aestha_editorial`); có `case` trong `renderBlock.tsx` |
| **Legacy** | `src/blocks/<slug>/component.tsx` (+ `schema.ts` + `index.ts`) | render qua `legacy_embed` theo `schemaId` (dotted: `framer.arpeggio.hero.v1` → folder `framer-arpeggio-hero`) |

Đọc: `component.tsx` (chính), `schema.ts` (legacy: fields + defaults), và nếu native thì
liếc `renderBlock.tsx` (đúng component?) + `factory.ts` (content mặc định).

## Bước 2 — Responsive (TRỌNG TÂM, fail nhiều nhất)

**Nguyên lý sống còn của repo:** block KHÔNG render full viewport — nó nằm trong 1
**frame** (canvas editor, PreviewMode, Dev preview, hoặc 1 cột trong page). Nên
responsive PHẢI theo **bề rộng container**, không theo viewport.

Soi 5 thứ này (đây đúng là các bug đã từng gặp ở `framer-yuya-hero`):

1. **Container query, KHÔNG media query.** Tìm `@media (max-width: ...)` điều khiển
   layout/size của block → **CỜ ĐỎ**: trong frame nhỏ (preview mobile) viewport vẫn
   là desktop nên `@media` không kích hoạt → block giữ size desktop, vỡ. Phải là
   **`@container (max-width: ...)`** + đơn vị **`cqi`** (1cqi = 1% bề rộng container).

2. **`container-type: inline-size`** đặt trên root của block (hoặc dùng class
   Tailwind `@container`). Thiếu nó thì `cqi`/`@container` không resolve.

3. **Viết TUYỀN INLINE — design token sống trong `style`, không qua class/`<style>`.**
   Element editable PHẢI lấy size/màu/spacing qua `style={composeStyle(base, styleOf(key))}`,
   KHÔNG qua Tailwind utility hay `<style>` rule. Hai lý do: (a) editor override per-element
   (`elementStyleOf`) merge vào **inline** — token để ở class thì editor không đè được; (b)
   né sạch bẫy "inline đè class": `style={{ fontSize: 174 }}` **đồng thời** `.x { font-size }`
   → inline THẮNG → responsive chết. **CỜ ĐỎ**: px cứng trong inline (`fontSize: 174`) HOẶC
   tồn tại song song inline-size + class-size cho cùng element. Tailwind class chỉ dành cho
   **bố cục cấu trúc** (display/flex/grid/position/`@container`) trên wrapper.

4. **Responsive nằm TRONG inline qua `clamp(min, N·cqi, max)`.** Vì token là inline (rule 3),
   responsive cũng phải inline: `style={{ fontSize: 'clamp(40px, 7.5cqi, 72px)' }}`. `min` để
   mobile không tràn, `max` để màn lớn không phình; `cqi` track bề rộng container (không phải
   viewport). Reflow cấu trúc (stack→split, grid cols) thì dùng `@2xl:`/`@4xl:` trên className
   wrapper. Tránh px cứng cho text/padding chính.

5. **Quyết định cap vs fill rõ ràng** trên desktop lớn: hoặc `maxWidth` + canh giữa,
   hoặc bỏ cap để fill edge-to-edge. Sai chỗ này → 1920 đầy lề trống hoặc chữ tí hon.

Ngoài ra: `white-space: nowrap` + text/wordmark to → kiểm **tràn ngang trên mobile**;
ảnh có `object-fit: cover` + scale; layout có **reflow/stack** ở breakpoint mobile
(đảo cột, full-width) không.

## Bước 3 — Xem render thật (nếu môi trường chạy được)

Đừng chỉ đọc code — nếu có dev server, xem render ở nhiều bề rộng bằng tool đã có:

- **PreviewMode**: `/admin/blocks` → nút ▶ trên block. Có **device + ô W×H + zoom%/Fit**.
- **Dev preview** (block legacy): `/admin/blocks/preview` → chọn block trong dropdown,
  cùng bộ điều khiển W×H/zoom.

Test các bề rộng: **mobile 360 / 390 / 414**, **tablet 768 / 834**, **desktop 1280 / 1440 / 1920**.
Gõ thẳng W vào ô để nhảy đúng số. Cách nhanh để kiểm bằng telemetry (đo thật, không
đoán) — đo `getComputedStyle(title).fontSize` + `scrollWidth > clientWidth` (tràn?)
ở vài bề rộng qua một throwaway Playwright spec (dùng auth admin sẵn ở
`tests/e2e/.auth/admin.json`), rồi xoá spec + cleanup.

## Checklist nhanh

**Mobile (360–414):**
- [ ] KHÔNG scroll ngang / tràn (lỗi #1)
- [ ] Text ≥ ~12px, đọc được; không tràn dòng
- [ ] Layout stack đúng qua `@container`; padding/gap co lại
- [ ] Ảnh/avatar scale, không méo; tap target đủ lớn

**Desktop (1280/1440/1920):**
- [ ] Cap-centered hay fill — đúng ý đồ, không lề trống vô lý / chữ lọt thỏm
- [ ] Tỉ lệ scale theo container; không scroll ngang

**Content / data:**
- [ ] Đọc từ props/schema.defaults; có fallback khi rỗng; ảnh thiếu không vỡ
- [ ] Text dài hơn default không phá layout; VI/EN đều ổn

**Animation (GSAP foundation — `docs/landing-motion-foundation.md` R1–R6):**
- [ ] Scroll/entrance qua `useBlockMotion` (block đơn giản) hoặc `useLandingMotion`+`gsap.context`
  (block phức tạp). **CỜ ĐỎ**: tự `new Lenis`, `gsap.registerPlugin`, nghe `window` scroll, hay
  còn dùng `useReveal` (đã bỏ) trong block
- [ ] Mọi `scrollTrigger` truyền `scroller` (từ api) + `invalidateOnRefresh: true` (R3)
- [ ] Sau media load gọi `requestRefresh()` (R4); cleanup `ctx.revert()` + gỡ listener (R6)
- [ ] framer-motion CHỈ cho per-char text stagger; entrance section là GSAP. Animate bằng
  `transform`/`opacity` (GPU), không width/height/top (giật)
- [ ] Tôn trọng `prefers-reduced-motion` (bail trước khi tween); mobile KHÔNG GSAP `pin` (dùng
  CSS `position:sticky`); chạy được trong frame preview

**Kiến trúc / code:**
- [ ] `type_code` ↔ `settings.blockType` ↔ `renderBlock` khớp (native); `schemaId` đúng (legacy)
- [ ] Đặt đúng hệ (native vs legacy); không trùng lặp vô ích
- [ ] type-check sạch, không lỗi mới

## Định dạng báo cáo (luôn theo template này)

```
## Review: <tên block> (`<type_code>` · <đường dẫn file>)

### 🔴 Bug (phải sửa)
- [Responsive/mobile] <mô tả> — `file:line` · cách sửa: <…>

### 🟡 Nên sửa
- <…>

### ✅ Ổn
- <…>

### Đã test bề rộng
- mobile 390 / 414: <kết quả + số đo nếu có> · desktop 1280 / 1920: <…>

### Kết luận: <APPROVE | CẦN SỬA> — <1 câu>
```

Ưu tiên **mục 🔴 Bug** lên đầu, chỉ rõ `file:line` + fix. Nếu không chạy được render
thật, nói rõ "review tĩnh (chỉ đọc code)" và đề xuất dev tự test bề rộng nào.
