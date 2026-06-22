# Animation Extraction Guide

Detecting animations is the hardest part of recon. Animations live in three places:

1. **CSS** — `transition`, `animation`, `@keyframes`. The capture script grabs these via computed styles.
2. **JavaScript libraries** — Framer Motion, GSAP, AOS, Lottie. These inject styles at runtime, so computed-style extraction sees only the *current frame*, not the config.
3. **The user's eyes** — scroll-triggered fade-ins, hover scales, marquee loops, parallax. These need video observation.

This file is the checklist for filling in the **Animation log** section of spec.md.

---

## Step 1: Library fingerprints

The `extract.py` script reports detected libraries. Cross-reference here:

| Library | Fingerprint |
|---------|-------------|
| Framer Motion | `data-framer-*` attributes, classes like `framer-XXXX`, framer-motion in bundled JS |
| Framer template | URL ending `.framer.website`, assets on `framerusercontent.com` (these sites use Framer Motion under the hood) |
| GSAP | `<script src="...gsap...">`, classes like `gsap-`, ScrollTrigger references |
| AOS | `data-aos="fade-up"` etc. |
| Lottie | `<lottie-player>` tag, `lottie-web` script |
| Tailwind animate-* | classes like `animate-fade-in`, `animate-bounce` |
| Vanilla CSS | none of the above; inline `transition:` and `@keyframes` only |

If Framer Motion is detected, search the page source for animation config strings: `initial`, `animate`, `whileInView`, `transition`, `staggerChildren`. These often survive minification.

---

## Step 2: Watch the video at 0.25× speed

For each animation observed, fill in this template (one block per animation):

```
Animation N:
  Element:   <CSS-ish description of what animates>
  Trigger:   <scroll-into-view | hover | on-load | click>
  Property:  <what visually changes — opacity, transform, color, blur>
  Duration:  <ms — estimate by counting frames if needed>
  Easing:    <see "Easing identification" below>
  Stagger:   <ms between siblings — only if multiple elements animate in sequence>
  Delay:     <ms before start — only if there's a noticeable wait>
```

### Easing identification (judge by the curve shape)

- **Linear** — constant speed. Mechanical, rare in modern UI.
- **Ease-out** — fast start, slow finish. The default for "entering" animations. If unsure, this is the right guess.
- **Ease-in** — slow start, fast finish. Rare alone; usually for "exiting".
- **Ease-in-out** — slow at both ends, fast in the middle. Smooth, hypnotic. Common in marquees and slow reveals.
- **Spring / bounce** — overshoots the target and settles. Framer Motion's signature. Look for slight wobble at the end.
- **Custom cubic-bezier** — Framer often uses `cubic-bezier(0.22, 1, 0.36, 1)` which is a smooth "ease-out quart". This is a safe default for fade/slide animations.

---

## Step 3: Common patterns and their typical values

| Pattern | Typical config |
|---------|----------------|
| Fade-in on scroll | opacity 0→1, 600ms, ease-out, fires at ~30% in viewport |
| Slide-up on scroll | translateY(40px)→0 + opacity 0→1, 600ms, ease-out |
| Staggered card grid | each card delays prev+0.1–0.15s, 500–700ms duration each |
| Number counter | 0 → N, 1500–2500ms, ease-out (decelerates as it reaches target) |
| Marquee | translateX infinite linear, 30–60s depending on width |
| Hover scale | scale 1 → 1.02 or 1.05, 200–300ms, ease-out |
| Hero text reveal | clip-path or mask, 800–1200ms, ease-out, often staggered by word |
| Parallax | translateY based on scroll offset, no duration (continuous) |
| Image zoom on hover | scale 1 → 1.05 with overflow hidden, 400–600ms, ease-out |

When in doubt: **600ms duration + ease-out** is right more often than any other guess. Mark it `// estimated` so the dev knows to verify.

---

## Step 4: Translate to Framer Motion

The default target stack is React + Tailwind + Framer Motion. Here are the patterns:

### Fade-in / slide-up on scroll

```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
  ...content
</motion.div>
```

### Staggered children (e.g., pricing card grid)

```jsx
const parent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const child = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

<motion.div variants={parent} initial="hidden" whileInView="visible" viewport={{ once: true }}>
  {items.map(i => <motion.div variants={child} key={i.id}>...</motion.div>)}
</motion.div>
```

### Hover scale

```jsx
<motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.25 }}>
  ...content
</motion.div>
```

### Number counter

```jsx
import { useMotionValue, useTransform, animate } from "framer-motion";

function Counter({ to, duration = 2 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [to]);
  return <motion.span>{rounded}</motion.span>;
}
```

### Spring (Framer's signature feel)

```jsx
transition={{ type: "spring", stiffness: 200, damping: 25 }}
```

Higher stiffness = snappier. Higher damping = less overshoot. For a UI element that overshoots slightly then settles, try stiffness 300, damping 20.

---

## Step 5: When the original is in Framer

Framer templates (like `perform.framer.website`) compile to React + Framer Motion under the hood. The bundled JS often exposes the `transition` config — search the page HTML for:

- `"type":"spring"` → spring animation; look for `stiffness`, `damping`, `mass` nearby
- `"type":"tween"` → standard duration-based; look for `duration`, `ease`
- `"delay"` → explicit delay in seconds (not ms!)
- `"staggerChildren"` → parent-driven stagger

If you find these, copy the values verbatim — they'll give you the closest possible match. Just remember Framer uses **seconds**, not milliseconds.
