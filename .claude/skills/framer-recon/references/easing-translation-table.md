# Easing Translation Table

When the source site uses a CSS easing curve, you may need to express it in another animation library. This table covers the most common translations.

**For Framer Motion (default target stack), use the cubic-bezier array form** — it's exact. The named tokens (`'easeOut'`, etc.) are approximations.

## Direct equivalents

| CSS cubic-bezier | Name (CSS) | GSAP | Framer Motion |
|------------------|------------|------|---------------|
| `cubic-bezier(0.25, 0.1, 0.25, 1)` | `ease` (default) | `power1.out` (close) | `[0.25, 0.1, 0.25, 1]` |
| `cubic-bezier(0, 0, 1, 1)` | `linear` | `'none'` | `'linear'` |
| `cubic-bezier(0.42, 0, 1, 1)` | `ease-in` | `power1.in` | `'easeIn'` |
| `cubic-bezier(0, 0, 0.58, 1)` | `ease-out` | `power1.out` | `'easeOut'` |
| `cubic-bezier(0.42, 0, 0.58, 1)` | `ease-in-out` | `power1.inOut` | `'easeInOut'` |

## Modern / opinionated curves (very common in 2024+ sites)

| cubic-bezier values | GSAP equivalent | Framer Motion | Vibe |
|---------------------|-----------------|---------------|------|
| `[0.22, 1, 0.36, 1]` | `power3.out` (approx) | `[0.22, 1, 0.36, 1]` | **Smooth ease-out quart.** Default for Framer template fades. Safe guess if unsure. |
| `[0.2, 0.8, 0.2, 1]` | `power3.out` | `[0.2, 0.8, 0.2, 1]` | Sharp out. Common in marketing hero reveals. |
| `[0.44, 0, 0.56, 1]` | `power2.inOut` | `[0.44, 0, 0.56, 1]` | Standard inOut. Used in `motion-config-sync.md` `EASE_OUT` token (project default). |
| `[0.4, 0, 0.2, 1]` | `power2.inOut` | `[0.4, 0, 0.2, 1]` | Material Design standard. |
| `[0.4, 0, 1, 1]` | `power2.in` | `[0.4, 0, 1, 1]` | Material Design accelerate. Exit-style. |
| `[0, 0, 0.2, 1]` | `power2.out` | `[0, 0, 0.2, 1]` | Material Design decelerate. Enter-style. |
| `[0.87, 0, 0.13, 1]` | `expo.inOut` (loose) | `[0.87, 0, 0.13, 1]` | Dramatic pause-then-go. Used for scroll-snap transitions. |

## Overshoot / spring-like (CSS approximations)

These overshoot the target then settle. CSS can fake them with cubic-bezier; GSAP and Framer Motion have native spring support which is more accurate.

| CSS cubic-bezier | GSAP | Framer Motion (use spring) |
|------------------|------|----------------------------|
| `[0.34, 1.56, 0.64, 1]` | `back.out(1.7)` | `{ type: 'spring', stiffness: 300, damping: 20 }` |
| `[0.68, -0.55, 0.265, 1.55]` | `back.inOut(1.7)` | (no exact CSS; use spring) |

**Framer Motion spring tuning:**
- `stiffness` 100 → soft, 200 → standard, 400 → snappy
- `damping` 10 → wobble, 20 → smooth, 30 → no overshoot
- `mass` rarely needs changing from default 1

A common Framer template signature: `{ type: 'spring', stiffness: 200, damping: 25 }` — slight overshoot, settles cleanly.

## When you find a cubic-bezier in the CSS

Keep the exact 4 values verbatim. Don't try to map to a name — the array form works in Framer Motion directly:

```jsx
transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
```

For GSAP, if the values don't match a named easing exactly, use `CustomEase`:

```js
import { CustomEase } from 'gsap/CustomEase';
gsap.registerPlugin(CustomEase);
CustomEase.create('custom', '0.22, 1, 0.36, 1');
// then: ease: 'custom'
```

## When you only have a video (no CSS access)

Judge by shape:

- **Slow start, fast end** → `easeIn` / `[0.42, 0, 1, 1]`
- **Fast start, slow end** (most common) → `easeOut` / `[0.22, 1, 0.36, 1]`
- **Smooth both ends** → `easeInOut` / `[0.4, 0, 0.2, 1]`
- **Overshoots then settles** → spring with damping 20–25
- **Slight wobble at end** → spring with damping 15

Mark these as estimated (`// estimated from video`) in spec.md so the dev knows to verify.

## Framer-specific: bundled JS often exposes the real values

Framer-built sites (`*.framer.website`, `framerusercontent.com`) compile to React + Framer Motion. The bundled JS retains the transition config strings even after minification. Search the page HTML for:

```
"ease":[0.22,1,0.36,1]
"type":"spring","stiffness":200,"damping":25
"duration":0.6
"staggerChildren":0.08
"delay":0.2
```

These are **the source of truth** — copy them verbatim. Framer uses **seconds**, not milliseconds.
