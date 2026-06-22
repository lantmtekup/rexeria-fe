# ScrollTrigger recipes

The most common ScrollTrigger configs and gotchas, with a Lenis sync section at the end.

---

## start / end values

`start` and `end` accept a 2-token string `<trigger-edge> <viewport-edge>` (or numeric pixel offset).

| Value | Meaning |
|---|---|
| `'top top'` | Trigger top hits viewport top |
| `'top center'` | Trigger top hits viewport middle |
| `'top 80%'` | Trigger top hits 80% down viewport (= "20% above bottom") |
| `'top bottom'` | Trigger top hits viewport bottom (animation begins as element enters) |
| `'bottom top'` | Trigger bottom hits viewport top (element about to leave above) |
| `'+=500'` | 500px past start position (use for `end`) |
| `'+=100%'` | One full viewport height past start |

Pattern → start/end:

| Effect | start | end |
|---|---|---|
| Fade in as enters | `top 85%` | (auto, plays once) |
| Parallax (scrub) | `top bottom` | `bottom top` |
| Pinned section | `top top` | `+=2000` or `bottom bottom` |
| Sticky-header trigger | `bottom top` (on hero) | — |

---

## scrub

| Value | Behavior |
|---|---|
| `false` (default) | Animation plays once when triggered, ignores scroll position |
| `true` | Animation progress = scroll progress (instant) |
| `1` | Scrubbed with 1s lag (smoother, almost always preferred over `true`) |
| `0.5` | Snappier scrub |

Rule: use `scrub: 1` for parallax / pinned timelines, `false` for one-shot reveals.

---

## pin

```ts
ScrollTrigger.create({
  trigger: '.section',
  start: 'top top',
  end: '+=2000',
  pin: true,
  pinSpacing: true,    // default — adds spacer to compensate for pin
});
```

Gotchas:

- `pin: true` requires the trigger to be a single element with no transform on parent. If parent has `transform`, GSAP can't pin properly — move pin target up.
- `pinSpacing: false` removes the spacer (overlapping next section). Useful for "sticky"-feel sections.
- Pinned elements MUST have a fixed height (or `100vh`) — pinning a `height: auto` element causes layout collapse.
- If you nest pins, they fight each other. Use `pinType: 'transform'` on the inner one as a workaround.

---

## markers (debug)

```ts
ScrollTrigger.create({ ..., markers: true });
// or globally:
ScrollTrigger.defaults({ markers: true });
```

Shows `start` (green) and `end` (red) lines on the page. Remove before shipping.

---

## refresh after image / font load

ScrollTrigger calculates positions on init. If images load late and shift layout, your triggers fire wrong.

```ts
import imagesLoaded from 'imagesloaded';

imagesLoaded(document.body, () => {
  ScrollTrigger.refresh();
});

// Or wait for fonts:
document.fonts.ready.then(() => ScrollTrigger.refresh());
```

Also call `ScrollTrigger.refresh()` after any DOM change that affects heights (carousel mount, accordion open, etc.).

---

## Lenis sync (CRITICAL)

If you use Lenis without syncing, ScrollTrigger reads native scroll position while Lenis renders a smoothed one — triggers fire at wrong times.

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

// 1. Tell ScrollTrigger to listen to Lenis's scroll events
lenis.on('scroll', ScrollTrigger.update);

// 2. Drive Lenis from GSAP's ticker (so RAF is unified)
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);  // disable lag smoothing — important for scrub
```

Without these two lines, scrubbed pins and parallax look "wrong" — animation lags scroll by a frame or two.

---

## Common mistakes

1. **Forgetting to register the plugin**
   ```ts
   import { ScrollTrigger } from 'gsap/ScrollTrigger';
   gsap.registerPlugin(ScrollTrigger);  // ← must call before using
   ```

2. **Selectors before mount** — Astro/React renders may not have placed elements yet. Wrap in `setTimeout` or `useLayoutEffect` / `astro:page-load`.

3. **Refresh on resize** — ScrollTrigger auto-listens, but if you set CSS-driven heights you might need:
   ```ts
   window.addEventListener('resize', () => ScrollTrigger.refresh());
   ```

4. **Using `scrub: true` with `duration`** — `scrub` overrides duration. Don't both.

5. **Not killing on unmount (SPA)** — leaks listeners. In React/Astro view-transitions:
   ```ts
   const ctx = gsap.context(() => { /* all gsap calls */ }, ref);
   return () => ctx.revert();
   ```
