# GSAP Clone — starter

Scaffolded by the `gsap-clone` skill. Stack:

- **Astro 4** + Tailwind CSS
- **GSAP 3** + ScrollTrigger
- **Lenis** smooth scroll (synced with gsap.ticker)
- **SplitType** for line/word/char splits
- **Swiper** for carousels
- **imagesloaded** for ScrollTrigger.refresh after image load

## Run

```bash
pnpm install        # or npm / yarn
pnpm dev            # → http://localhost:4321
pnpm build          # static build
```

## Wire your animations

1. Run the extractor on the source site: `node $SKILL_DIR/scripts/02-extract-animations.js ./bundle > animations.json`
2. Open `animations.json` and translate each record into a `gsap.to(...)` / `gsap.from(...)` / `ScrollTrigger.create(...)` call inside `src/scripts/animations.ts`
3. Mirror the original HTML structure section-by-section in `src/pages/index.astro`, using `<MotionSection>` for scroll-revealed blocks
4. Visual diff: `node $SKILL_DIR/scripts/04-visual-diff.js https://original.com http://localhost:4321 ./diff`

## Lenis + ScrollTrigger sync

Already wired in `src/scripts/smooth-scroll.ts`:

```ts
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Without this, scrubbed pins lag scroll by 1–2 frames.

## File map

```
src/
  layouts/Layout.astro          ← html shell, mounts smooth-scroll + animations
  pages/index.astro             ← page content (replace with cloned sections)
  components/MotionSection.astro← reusable scroll-reveal wrapper
  scripts/smooth-scroll.ts      ← Lenis + GSAP.ticker sync
  scripts/animations.ts         ← all gsap.to / ScrollTrigger calls
  styles/global.css             ← tailwind + lenis hooks + reduced-motion
```
