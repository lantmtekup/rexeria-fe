---
name: motion-pick
description: >-
  Pick or extend rexerai `data-motion` effects from the motion library. Use when
  the user asks which animation to use, gắn data-motion, migrate GSAP tay →
  attribute, chọn effect cho heading/card/ảnh, wire useMotionAttributes, thêm
  effect mới vào library, or tạo/port/wire block (apps/<brand> → block-editor).
  Creating or porting a block requires reading apps-port-host first; Framer
  recon/clone uses framer-clone-host. On catalog miss: extend the library by
  default — read gsap-core / gsap-scrolltrigger / gsap-timeline / gsap-plugins /
  gsap-react / gsap-performance, register in motionLibrary, sync, then use; T3
  (pin/Flip/trail/mouse-parallax/carousel) is the only useBlockMotion exception.
  Never invent effect ids without registering.
---

# Motion pick — retrieve hoặc extend library

## 3 quy tắc cốt lõi

1. **Library CÓ effect phù hợp → dùng.** Pick id từ catalog, gắn `data-motion` + attrs.
2. **Library CHƯA CÓ → MẶC ĐỊNH extend.** Đọc gsap-* skills phù hợp → viết effect mới vào `motionLibrary.ts` → `yarn motion:catalog` → dùng như effect có sẵn. Không hỏi lại user, không viết GSAP tay one-off trong block. Ngoại lệ duy nhất: T3 (xem Hard rule 3).
3. **Yêu cầu tạo / port block → đọc [../apps-port-host/SKILL.md](../apps-port-host/SKILL.md) trước** (Framer recon/clone → [../framer-clone-host/SKILL.md](../framer-clone-host/SKILL.md)); motion-pick chỉ lo bước chọn/extend effect trong workflow port.

Project skill cho **rexerai** Motion Attribute System (T1/T2). Source of truth
runtime + agent memory: `src/components/modules/block-editor/motion/motionLibrary.ts`
(`meta` trên mỗi effect). Catalog đọc nhanh: [references/effects-catalog.md](references/effects-catalog.md).
Extend khi miss: [references/extend-library.md](references/extend-library.md).

## Gate — tạo / port / wire block (trước Step 0)

Intent có **tạo block**, **port** `apps/<brand>`, **wire** section vào block-editor,
hoặc scaffold full/sub block mới:

1. **apps / native host** → đọc và follow [../apps-port-host/SKILL.md](../apps-port-host/SKILL.md)
   (full vs sub, canvas styles, Layers, verify). Không scaffold `BlockType` /
   registry / BE seed chỉ từ motion-pick.
2. **Framer recon/clone** → đọc [../framer-clone-host/SKILL.md](../framer-clone-host/SKILL.md)
   thay apps-port-host.
3. Sau khi component host có skeleton → quay lại flow motion bên dưới (pick /
   extend) trong bước Motion của port. Ưu tiên `useMotionAttributes` +
   catalog; T3 → `useBlockMotion` (R1–R6 host).

Chỉ hỏi “effect nào / gắn data-motion” trên block đã có → bỏ qua gate, vào Step 0.

## Step 0 — Sync catalog (bắt buộc mỗi lần dùng skill)

Trước khi đọc catalog / pick / extend, chạy trong repo root:

```bash
yarn motion:catalog
```

Đợi lệnh xong (stdout/stderr có `Wrote .../effects-catalog.md`). Không skip trừ khi vừa sync trong cùng turn. Catalog stale = pick sai.

## Hard rules

1. **Chỉ dùng id trong catalog allowlist** — trừ khi đang ở nhánh extend (đăng ký xong → sync catalog → mới gắn JSX). Không invent id rồi gắn thẳng.
2. **1 element = 1 driver.** Có `data-motion` thì không gọi `useBlockMotion` / System B track trên cùng element.
3. **T3 → `useBlockMotion`:** pin, sticky, frame-scrub, Flip, image trail/explosion, mouse-parallax theo vị trí chuột, carousel/drawer logic. Không cố nhét vào attribute.
4. Block gắn attribute phải gọi `useMotionAttributes(rootRef[, deps])`.
5. **Miss catalog → MẶC ĐỊNH extend library**: đọc [references/extend-library.md](references/extend-library.md) + gsap-* skills, đăng ký `MOTION_EFFECTS` + sync, rồi dùng. Chỉ 2 ngoại lệ: (a) chỉ khác timing/biên độ so sibling → dùng sibling + attr override; (b) T3 → rule 3. Không bịa attribute ngoài vocabulary §3b.
6. **Tạo / port / wire block** → đọc [../apps-port-host/SKILL.md](../apps-port-host/SKILL.md) (hoặc framer-clone-host) **trước** khi scaffold; làm đủ workflow port. Motion-pick chỉ lo bước chọn/extend effect trong port.

Spec attribute đầy đủ: `docs/landing-motion-foundation.md` §3b. Demo mắt: `/dev/motion#fx-<id>`.

## Flow (bắt buộc)

```
Intent
        │
        ├─ Tạo / port / wire block?
        │     ├─ apps/<brand> hoặc native → ĐỌC + FOLLOW apps-port-host
        │     └─ Framer recon/clone → ĐỌC + FOLLOW framer-clone-host
        │     rồi ↓ bước Motion
        │
        ├─ Step 0: yarn motion:catalog
        │
        ├─ Đọc references/effects-catalog.md
        │     lọc category / tags / appliesTo
        │
        ├─ HIT (1–2 ứng viên)?
        │     → resolve bằng vs + whenNotToUse + prerequisites
        │     → Output: data-motion='<id>' + relevantAttrs + example
        │           + nhắc useMotionAttributes; verify /dev/motion nếu cần
        │
        └─ MISS → MẶC ĐỊNH: Extend library (đọc extend-library.md)
              ├─ Ngoại lệ 1: chỉ khác timing/biên độ so sibling
              │     → dùng sibling + attr override (thực chất là HIT)
              ├─ Ngoại lệ 2: T3 (pin/Flip/trail/mouse-parallax/carousel)
              │     → useBlockMotion + gsap-* — KHÔNG attribute
              └─ Còn lại: route gsap-* → đăng ký MOTION_EFFECTS
                    → yarn motion:catalog → verify → gắn data-motion
```

### Decision tree nhanh (HIT)

| Intent | Ưu tiên xem category / tags |
|---|---|
| Body / card entrance | `entrance` — mặc định `fade-up` |
| Hero heading cinematic | `text` — `char-reveal` / `word-reveal` / `line-reveal` |
| Ảnh reveal / Ken Burns | `image` — `clip-reveal` / `media-zoom` / `zoom-in` |
| Scroll depth / thanh vẽ | `scroll` — `parallax` / `line-draw` |
| Hover feedback | `hover` — `hover-scale` / `lift` / `tilt` / `zoom` |
| Số liệu đếm | `special` — `counter` |
| Ticker ngang | `loop` — `marquee-loop` (prerequisites bắt buộc) |
| Tạo / port block từ apps | **apps-port-host** rồi mới pick/extend |
| Framer → block | **framer-clone-host** rồi mới pick/extend |

Khi 2 effect gần nhau (vd `scale-in` vs `zoom-in` vs `media-zoom`): đọc field `vs` trong catalog — chọn theo độ mạnh + entrance vs settle vs hover.

### MISS — xử lý

| Signal | Nhánh |
|---|---|
| Không có effect nào express đúng intent (mặc định) | **Extend** — [extend-library.md](references/extend-library.md): gsap-* → `MOTION_EFFECTS` → sync → dùng |
| Chỉ khác timing/biên độ so với sibling | **Không extend** — dùng sibling + `data-motion-*` override |
| Pin, sticky, frame-scrub, Flip, trail/explosion, mouse-parallax theo chuột, carousel/drawer | **T3** — `useBlockMotion` + gsap-* (ngoại lệ duy nhất không vào library) |

## Output shape (HIT hoặc sau khi extend)

```tsx
import { useMotionAttributes } from '../motion/useMotionAttributes';

useMotionAttributes(rootRef);

<h2 data-motion='word-reveal'>…</h2>
<p data-motion='fade-up' data-motion-distance='30'>…</p>
```

Group list: `data-motion-group` trên container + `data-motion-stagger-children` (xem §3b).

## Không làm

- Không invent `data-motion` id trước khi có entry trong `motionLibrary.ts`.
- Không viết GSAP tay one-off trong block khi miss — mặc định extend library theo [extend-library.md](references/extend-library.md); chỉ T3 mới `useBlockMotion`.
- Không follow `useGSAP` của gsap-react trong block-editor — T1/T2 = `useMotionAttributes`, T3 = `useBlockMotion`.
- Không tạo `BlockType` / registry / BE seed / canvas wiring mà bỏ qua apps-port-host (hoặc framer-clone-host).
- Không migrate System B (`presets.ts`) hay editor UI.
