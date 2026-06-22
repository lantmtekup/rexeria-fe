# Framer Clone Starter

Scaffolded by the `framer-clone` skill. Next.js 14 + framer-motion + Lenis + Tailwind.

## Quick start

```bash
pnpm install
pnpm dev
```

## What's here

| File | Purpose |
|---|---|
| `app/layout.tsx` | Mounts `<SmoothScroll />` (Lenis) once |
| `app/page.tsx` | Demo — replace with your clone |
| `components/smooth-scroll.tsx` | Lenis provider |
| `components/motion-section.tsx` | Reusable scroll-reveal wrapper with 5 presets |
| `tailwind.config.ts` | Includes preset `out-quart`, `out-expo`, `in-out-expo` easings |

## Writing a section

1. Drop in the static JSX with Tailwind (layout phase).
2. Wrap the container in `<MotionSection preset="fade-up" stagger={0.08}>` (preset phase).
3. For animations that come from `animations.json`, use `motion.div` directly with the extracted config.

## Visual diff against source

```bash
node $SKILL_DIR/scripts/visual-diff.js https://original.com http://localhost:3000 ./diff 8
```
