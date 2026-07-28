# Extend motion library (nhánh MẶC ĐỊNH khi catalog miss)

Miss catalog → đây là nhánh **MẶC ĐỊNH** của skill **motion-pick**: dùng gsap-*
viết effect mới, đăng ký vào library, rồi dùng như effect có sẵn. Chỉ 2 ngoại
lệ không extend: sibling + attr override (chỉ khác timing/biên độ) và T3
(pin/Flip/trail/mouse-parallax/carousel → `useBlockMotion`). Sau khi đăng ký
xong: `yarn motion:catalog` → pick id mới như flow HIT.

Spec runtime: `docs/landing-motion-foundation.md` §3b.
Registry: `src/components/modules/block-editor/motion/motionLibrary.ts`.
Hook: `src/components/modules/block-editor/motion/useMotionAttributes.ts`.

---

## A. Route skill GSAP theo intent

Đọc skill tương ứng **trước** khi viết `from`/`to` / nhánh special. Path trong repo:

| Intent | Đọc skill | Ghi chú rexerai |
|---|---|---|
| Tween đơn (opacity/x/y/scale/rotate), ease, stagger đơn | `.agents/skills/gsap-core/SKILL.md` (+ `gsap-performance` nếu lo jank) | Map → `from` / `to` / `defaults` |
| Hover / click feedback | `gsap-core` | Trigger `hover`/`click` đã có trong runtime — **không** tự bind pointer trong effect data. Hover: `from` = rest state |
| Scrub / parallax / start–end | `.agents/skills/gsap-scrolltrigger/SKILL.md` | Vẫn qua attribute; scroller từ LandingMotion (không `window`) |
| Choreograph nhiều bước trên **một** element | `.agents/skills/gsap-timeline/SKILL.md` | Attribute = 1 tween/effect. Multi-step phức tạp → T3 hoặc tách nhiều element (T2 group) |
| SplitText / Flip / ScrambleText / plugin khác | `.agents/skills/gsap-plugins/SKILL.md` | SplitText: `split: 'chars'\|'words'\|'lines'`. Flip / Draggable → thường **T3** |
| Wire React cleanup | `.agents/skills/gsap-react/SKILL.md` | **Override:** T1/T2 = `useMotionAttributes`; T3 = `useBlockMotion` — **không** thêm `useGSAP` trong block |
| Jank / 60fps | `.agents/skills/gsap-performance/SKILL.md` | Ưu tiên transform + opacity trong `from`/`to` |

**T3 sau classify:** vẫn đọc gsap-* ở trên, nhưng implement trong `useBlockMotion` (R1–R6), không đăng ký `MOTION_EFFECTS`.

---

## B. Checklist đăng ký effect (T1/T2)

```
Extend progress:
- [ ] 1. id kebab-case unique; category + tags retrieve được
- [ ] 2. Entry MOTION_EFFECTS + meta đầy đủ (TS bắt buộc)
- [ ] 3. Chỉ primitive runtime đã hỗ trợ
- [ ] 4. special ngoài counter? → sửa useMotionAttributes + type special
- [ ] 5. yarn motion:catalog
- [ ] 6. QA /dev/motion#fx-<id> (Stage auto; demos.tsx chỉ khi cần)
- [ ] 7. Verify skill → rồi gắn data-motion vào block
```

### Primitive runtime đã hỗ trợ

- `from` / `to` (GSAP vars)
- `split?: 'chars' | 'words' | 'lines'`
- `distanceVar` / `distanceMode` (`from` | `symmetric`)
- `directional?: true` (clip-reveal + `data-motion-direction`)
- `special?: 'counter'`
- Triggers: `in-view` | `scrub` | `load` | `loop` | `hover` | `click`

Cần logic ngoài tween style (khác counter) → mở rộng `special` trong `motionLibrary.ts` **và** nhánh tương ứng trong `useMotionAttributes.ts`. Không nhét hack vào block.

### Demo

`/dev/motion` auto Stage từ library. Custom `src/app/dev/motion/demos.tsx` chỉ khi QA cần stage đặc biệt (marquee đôi track, hover card cha, …).

### Verify

Theo `.claude/skills/verify/SKILL.md` trên `/dev/motion#fx-<id>` (và block nếu đã wire).

---

## C. Template MotionEffect tối thiểu

```ts
'my-effect': {
  id: 'my-effect',
  label: 'My Effect',
  appliesTo: ['any'], // 'text' | 'image' | 'shape' | 'any'
  from: { opacity: 0, y: 24 },
  to: { opacity: 1, y: 0 },
  defaults: {
    duration: 0.6,
    ease: 'power2.out',
    trigger: 'in-view', // in-view | scrub | load | loop | hover | click
    start: 'top 85%',
  },
  // optional: distanceVar: 'y', distanceMode: 'from',
  // optional: split: 'chars', directional: true, special: 'counter',
  meta: {
    summary: 'Một câu: nhìn thấy gì trên màn hình.',
    whenToUse: ['Intent A', 'Intent B'],
    whenNotToUse: ['Khi nên dùng sibling-x → sibling-x'],
    vs: [{ id: 'fade-up', diff: 'khác biệt 1 dòng' }],
    tags: ['entrance', 'fade'], // retrieve
    category: 'entrance', // entrance | text | scroll | image | hover | loop | special
    prerequisites: [], // điều kiện JSX/DOM; [] = không cần
    relevantAttrs: ['duration', 'delay', 'ease', 'start', 'once', 'distance'],
    example: `<p data-motion='my-effect'>…</p>`,
  },
},
```

Hover: `from` = rest (element bình thường khi chưa tương tác); `defaults.trigger: 'hover'`.

Sau khi thêm: chạy `yarn motion:catalog` — không sửa tay `effects-catalog.md`.

---

## D. Anti-patterns

- Invent `data-motion='…'` trước khi có entry trong library.
- Viết GSAP tay trong block cho case đã/đang đưa vào library.
- Mix `data-motion` + `useBlockMotion` / System B trên cùng element.
- Follow `useGSAP` của gsap-react trong block-editor host.
- Tự `gsap.registerPlugin` / Lenis / scroller `window` trong block (vi phạm R1–R3).
- Extend library cho case T3 (pin, Flip, trail, mouse-parallax theo chuột, carousel).
- Extend chỉ vì khác `duration`/`distance` — dùng attribute override trên sibling.
- Scaffold block mới mà bỏ qua apps-port-host / framer-clone-host.

---

## E. Tạo / port block mới

Intent tạo, port, hoặc wire block → **đọc** [../apps-port-host/SKILL.md](../apps-port-host/SKILL.md)
trước (Framer recon/clone → [../framer-clone-host/SKILL.md](../framer-clone-host/SKILL.md)).
Làm đủ workflow host (full vs sub, canvas styles, Layers, verify). Chỉ sau khi
component host có skeleton mới pick/extend effect (mục A–C) và gắn `data-motion`.
Không duplicate checklist port ở đây.
