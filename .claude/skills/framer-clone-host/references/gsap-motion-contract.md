# GSAP motion contract (R1–R6) — rexerai blocks

Authoritative source: `docs/landing-motion-foundation.md` in the repo. This file mirrors it for the skill; if they diverge, the repo doc wins.

All scroll/entrance animation in a rexerai block goes through the **landing motion foundation** (`src/components/modules/block-editor/motion/LandingMotion.tsx`). A block NEVER sets up its own scroll engine.

## The six rules (verbatim)

| # | Rule |
|---|---|
| **R1** | Mọi scroll-animation qua `useBlockMotion` (hoặc `useLandingMotion` cho block phức tạp). **CẤM** tự `new Lenis`, tự nghe `window` scroll, hay `gsap.registerPlugin` trong block. |
| **R2** | Responsive bằng **container query** (`@2xl:`, `@4xl:`, đơn vị `cqi`) + `isMobile` theo container. **KHÔNG** dùng viewport `md:`/`lg:` hay `window.matchMedia` (cho layout). |
| **R3** | Mọi `scrollTrigger` PHẢI truyền `scroller` (từ api). Thêm `invalidateOnRefresh: true`. |
| **R4** | Sau khi media (ảnh/canvas) load xong → gọi `requestRefresh()` (block đơn giản: hook tự lo; block phức tạp: gọi tay trong `onload`). |
| **R5** | Overlay/drawer **không** đặt `position: fixed` tùy tiện; **không** đặt `container-type` lên tổ tiên của phần `pin`/`fixed` (làm vỡ pin + neo sai). |
| **R6** | Idempotent + cleanup: block đơn giản hook tự `revert`; block phức tạp tự `return () => ctx.revert()` + gỡ listener/observer. |

## Why a foundation (not per-block setup)

ScrollTrigger is registered ONCE in `LandingMotionRoot`. Lenis smooth-scroll runs ONCE (desktop, window-scroller, non-reduced-motion). Centralized `ScrollTrigger.refresh()` fires on mount, `window load`, `fonts.ready`, and a debounced `ResizeObserver`. The correct `scroller` (window for `/p`, the canvas element for the editor) is provided by context. If a block registers plugins or news up Lenis itself, you get double-scroll, wrong trigger math, and broken cleanup.

**Providers (already wired — don't add your own):**
- Public `/p/[id]`: `app/p/[id]/_block-render.tsx` → `<LandingMotionRoot enableSmooth>`
- Editor canvas: `BlockPreview.tsx` → `<LandingMotionRoot scrollerRef={surfaceRef} enableSmooth={false}>`

## `useBlockMotion` — the default (simple blocks)

```tsx
export function useBlockMotion(
  rootRef: React.RefObject<HTMLElement | null>,
  build: (api: BlockMotionApi) => void,
  deps?: React.DependencyList,
): void

interface BlockMotionApi {
  scroller: HTMLElement | undefined;  // pass to EVERY scrollTrigger.scroller (R3)
  isMobile: boolean;                  // container width < 768px (ResizeObserver, R2)
  requestRefresh: () => void;         // call after media load (R4)
}
```

The hook wraps `build` in `gsap.context(build, root)` (so selectors scope to the block root) and auto-`ctx.revert()` on unmount / dep change (R6). You only write the animations.

```tsx
useBlockMotion(rootRef, ({ scroller, isMobile, requestRefresh }) => {
  const root = rootRef.current;
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // honor OS pref

  const title = root.querySelector<HTMLElement>('.xxx-title');
  if (title) {
    gsap.fromTo(title,
      { opacity: 0, y: isMobile ? 24 : 48 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: {
          trigger: root, scroller,                 // R3
          start: 'top 85%',
          toggleActions: 'play none none reverse',  // replays on scroll back
          invalidateOnRefresh: true,                // R3
        },
      });
  }

  const img = root.querySelector<HTMLImageElement>('.xxx-img');
  if (img && !img.complete) img.addEventListener('load', requestRefresh, { once: true }); // R4
}, []);   // deps: include anything that changes element count (e.g. content.items.length)
```

Reference block: `blocks/FramerPerformHero.tsx` (bg fade via `useBlockMotion`; title char-stagger via framer-motion — see below). 19 blocks use `useBlockMotion`.

## `useLandingMotion` — complex blocks (own context + cleanup)

When a block needs SplitType, event listeners, observers, a pinned timeline, or a portal lightbox, manage the context yourself:

```tsx
const { scroller, requestRefresh } = useLandingMotion();
const isMobile = useContainerMobile(rootRef);   // from blocks/useContainerMobile.ts (R2)

React.useEffect(() => {
  const root = rootRef.current;
  if (!root) return;
  const removers: Array<() => void> = [];

  const ctx = gsap.context(() => {
    const heading = root.querySelector<HTMLElement>('.works-heading');
    if (heading) {
      const split = new SplitType(heading, { types: 'chars' });
      gsap.fromTo(split.chars,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.6, ease: 'power3.out', stagger: 0.06,
          scrollTrigger: { trigger: heading, scroller, start: 'top 85%',
            toggleActions: 'play none none reverse', invalidateOnRefresh: true },
        });
      removers.push(() => split.revert());
    }
  }, root);

  return () => { removers.forEach(r => r()); ctx.revert(); };   // R6
}, [scroller, requestRefresh, isMobile]);
```

Reference block: `blocks/MintV2Works.tsx` (SplitType heading + portal lightbox via `createPortal(..., document.body)` per R5).

## Text per-character stagger — GSAP-first, framer-motion allowed

Two accepted patterns:

1. **GSAP + SplitType (preferred, default):** `new SplitType(el, { types: 'chars' })` then `gsap.fromTo(split.chars, ..., { stagger })`. Keeps one animation engine. Remember `split.revert()` in cleanup. (`blocks/MintV2Works.tsx`.)
2. **framer-motion (only for char stagger):** `motion.span` per char with `transition={{ delay: i * 0.07 }}`, gated on `useInView`. Use only when it's clearly simpler than SplitType for that specific title. (`blocks/FramerPerformHero.tsx`.) Do NOT introduce framer-motion for section/element entrances — those are GSAP.

## Easing translation (Framer bundle → GSAP)

Most Framer hero eases map cleanly:

| Framer cubic-bezier | GSAP |
|---|---|
| `cubic-bezier(0.16, 1, 0.3, 1)` (expo-ish) | `expo.out` or `power4.out` |
| `cubic-bezier(0.25, 1, 0.5, 1)` | `power3.out` |
| `cubic-bezier(0.44, 0, 0.56, 1)` (in-out) | `power2.inOut` |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` (overshoot) | `back.out(1.7)` |
| exact match required | `CustomEase.create('name', 'M0,0 C0.16,1 0.3,1 1,1')` |

`CustomEase` must be registered in the foundation, not the block (R1). If it isn't yet, prefer the nearest named ease and note the bezier in a comment. See `framer-clone/references/common-easings.md` for the wider table.

## Reduced motion

`LandingMotionRoot` already disables Lenis smooth-scroll under `prefers-reduced-motion`. Inside a block, bail out of the `build` before creating tweens: `if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;` — elements then render in their final CSS state (make sure your base CSS is the "animated-in" state, with the tween setting the FROM, not a permanent `opacity: 0`).

## Mobile pinning

Do NOT use GSAP `pin: true` on mobile — the pin transform fights the iOS Safari compositor and stutters. Wrap in a tall section with a `position: sticky top-0 h-screen` child and use scrub to mutate a JS value only. Desktop branches may keep GSAP pin. See project memory `feedback_ios_scroll_pin`.

## Verification

- Editor: block renders, no console errors about ScrollTrigger/plugin double-registration.
- `/p/[id]`: entrance plays on scroll-in, replays on scroll-back (because `toggleActions: 'play none none reverse'`).
- Resize device picker → `isMobile`-dependent values change.
- DevTools → emulate `prefers-reduced-motion: reduce` → reload → block renders flat, no entrance.
