# Lenis setup

Lenis is the smooth-scroll library that gives Framer / Vietnamese-agency / luxury sites their "buttery" feel. Without it, native scroll is too snappy on macOS and too coarse on Windows — the tempo breaks.

---

## Default config

```ts
import Lenis from 'lenis';

const lenis = new Lenis({
  duration: 1.2,         // animation duration (s)
  lerp: 0.1,             // 0–1, lower = snappier (Framer default)
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expoOut
  smoothWheel: true,
  smoothTouch: false,    // touch devices stay native (much better feel)
  wheelMultiplier: 1,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

---

## Tuning lerp

| lerp | Feel | Use for |
|---|---|---|
| 0.05 | Cinematic glide | Portfolio, brand sites |
| 0.08 | Standard "Framer" | Most landing pages |
| 0.10 | Slightly snappier | Marketing |
| 0.15 | Responsive | Dashboards, docs |
| 0.25 | Nearly native | Heavy data pages |

**Decision rule:** if the original feels "slow and sticky", `lerp ≈ 0.06–0.08`. If "responsive and immediate", `0.12+`.

---

## Sync with GSAP ScrollTrigger

CRITICAL — without this, scrub-driven animations lag scroll by 1–2 frames:

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Drop the manual `requestAnimationFrame(raf)` loop above when you wire to gsap.ticker — gsap's ticker is now the single RAF source.

---

## Disable on mobile

Smooth scroll on mobile causes lag and breaks momentum scrolling — most sites disable it:

```ts
const isMobile = window.matchMedia('(max-width: 768px)').matches;

const lenis = new Lenis({
  smoothWheel: !isMobile,
  smoothTouch: false,
});
```

Or skip Lenis entirely on touch devices:

```ts
if (!('ontouchstart' in window)) {
  const lenis = new Lenis({ /* … */ });
  // …
}
```

---

## Anchor link smooth scroll

```ts
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    if (id === '#') return;
    e.preventDefault();
    lenis.scrollTo(id, { offset: -80, duration: 1.4 });
  });
});
```

`offset: -80` accounts for a 80px sticky header.

---

## Scroll to top button

```ts
btn.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) }));
```

---

## Custom easing functions

Lenis accepts any function `(t: number) => number` returning eased progress:

```ts
// expoOut (Lenis default)
(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

// circOut
(t) => Math.sqrt(1 - Math.pow(t - 1, 2));

// quartOut
(t) => 1 - Math.pow(1 - t, 4);

// quintInOut
(t) => t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;
```

To match a Framer-feel exactly, use `quartOut` with `lerp: 0.08`.

---

## Stop / start (e.g. modal open)

```ts
// when modal opens
lenis.stop();

// when modal closes
lenis.start();
```

Without this, scrolling on the modal backdrop scrolls the page underneath.

---

## Common pitfalls

1. **`overflow: hidden` on `html`/`body`** — Lenis won't work. Use `overflow-clip` if you need to clip overflow without breaking scroll.

2. **`scroll-behavior: smooth` in CSS** — fights Lenis. Remove from globals.

3. **iOS safe-area + Lenis** — set `body { min-height: 100dvh }` to avoid bounce-edge jumps.

4. **Anchor scroll without offset** — header covers the section. Always pass `{ offset: -headerHeight }`.

5. **`prefers-reduced-motion`** — respect it:
   ```ts
   if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
     // skip Lenis entirely
   }
   ```
