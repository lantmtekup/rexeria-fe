# Scroll animations

Guide for scroll-linked motion when cloning a Framer site. Covers Lenis smooth scroll, framer-motion's `useScroll` + `useTransform`, and GSAP ScrollTrigger fallback.

---

## 1. Lenis smooth scroll

Framer sites feel "buttery" because they ship Lenis (or equivalent) underneath. Without it, native scroll behaves differently on macOS vs Windows, breaking the tempo.

### Setup

```tsx
// components/SmoothScroll.tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      lerp: 0.1,             // Framer default — lower = snappier
      smoothWheel: true,
      smoothTouch: false,    // touch devices stay native
    });
    const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
  return null;
}
```

Wire it once in `app/layout.tsx` just inside `<body>`.

### Tuning lerp

| lerp | Feel | Use for |
|---|---|---|
| 0.05 | Glidey, cinematic | Portfolio hero |
| 0.08 | Standard Framer | Most sites |
| 0.15 | Snappy | Dashboards, docs |
| 0.25 | Nearly native | Heavy data pages |

If original feels "slow and sticky": lerp ≈ 0.06–0.08. If "responsive and immediate": 0.12+.

---

## 2. framer-motion `useScroll`

### Whole-page progress

```tsx
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
```

### Element-local progress (preferred)

```tsx
const ref = useRef<HTMLElement>(null);
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ['start end', 'end start'],
});
```

`offset: ['start end', 'end start']` = "start when top-of-element meets bottom-of-viewport, end when bottom-of-element meets top-of-viewport". 0→1 through the whole encounter. Most natural for parallax.

### useTransform mapping idioms

| Effect | Input range | Output range |
|---|---|---|
| Fade in as element enters | `[0, 0.3]` | `[0, 1]` |
| Parallax slow | `[0, 1]` | `['10%', '-10%']` |
| Zoom as you pass | `[0, 0.5, 1]` | `[1, 1.05, 1]` |
| Paginated cross-fade (slide i) | `[i/n, (i+0.5)/n, (i+1)/n]` | `[0, 1, 0]` |

### Smoothing with useSpring

When `useTransform` output feels jittery against Lenis (rare but happens at high DPI):

```tsx
const raw = useTransform(scrollYProgress, [0, 1], [0, -200]);
const smooth = useSpring(raw, { stiffness: 100, damping: 30 });
<motion.div style={{ y: smooth }} />
```

---

## 3. Sticky + pinned patterns

The most common "wow" Framer effect: a section that pins, then content inside animates as user scrolls past it.

```tsx
function PinnedHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  return (
    <section ref={ref} className="h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.img style={{ scale, opacity }} src="..." className="absolute inset-0 w-full h-full object-cover" />
      </div>
    </section>
  );
}
```

Track height `= N * 100vh` controls how much scroll runway the animation has. More runway = slower pace.

### Paginated stack (N slides, cross-fade)

```tsx
const items = [...]; const n = items.length;
<section ref={ref} className={`h-[${n * 100}vh]`}>
  <div className="sticky top-0 h-screen">
    {items.map((it, i) => {
      const opacity = useTransform(scrollYProgress, [
        (i - 0.5) / n, i / n, (i + 0.5) / n
      ], [0, 1, 0]);
      return <motion.div style={{ opacity }} key={i} className="absolute inset-0">…</motion.div>;
    })}
  </div>
</section>
```

---

## 4. GSAP ScrollTrigger fallback

Use when the source site clearly uses GSAP (grep `gsap` or `ScrollTrigger` in bundle), or when framer-motion's declarative scroll API can't express the effect (complex pinning with snapping, horizontal scroll with timeline markers).

```tsx
'use client';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export function ScrollSection() {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.panel', {
        xPercent: -100 * (panels - 1),
        ease: 'none',
        scrollTrigger: { trigger: ref.current, pin: true, scrub: 1, end: '+=3000' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return <section ref={ref}>…</section>;
}
```

`scrub: 1` = scroll drives the timeline 1:1 with 1s smoothing. `scrub: true` = instant.

---

## 5. Deciding which tool

| Case | Tool |
|---|---|
| Fade/slide in on entry | framer-motion `whileInView` |
| Scroll-linked opacity/scale/parallax | framer-motion `useScroll` + `useTransform` |
| Pinned section with declarative children | sticky CSS + framer-motion |
| Complex timeline with labels/snapping | GSAP ScrollTrigger |
| Horizontal scroll with pinning | GSAP ScrollTrigger (easier) |
| Smooth native scroll feel | Lenis (always) |

Don't mix GSAP and framer-motion on the same element — they fight. Pick per-component.
