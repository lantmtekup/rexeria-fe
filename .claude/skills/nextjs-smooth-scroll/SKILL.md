---
name: nextjs-smooth-scroll
description: Convert any Next.js page or component with scroll animation jank into a buttery-smooth scroll experience using GSAP ScrollTrigger + Lenis, properly integrated with Next.js App Router or Pages Router. Use this skill whenever the user mentions scroll issues in a Next.js context — keywords like "Next.js scroll giật", "scroll animation Next.js", "smooth scroll Next.js", "Lenis Next.js", "GSAP Next.js scroll", "App Router scroll", "page transition scroll", "hydration mismatch scroll", or shows code with `'use client'`, `useEffect`, `app/` or `pages/` directory structure asking about scroll. Also trigger when the user has Next.js scroll code that breaks on route navigation, fast refresh, or strict mode. This skill handles ALL Next.js-specific concerns (SSR, hydration, RSC, route transitions, App Router vs Pages Router) that the generic smooth-scroll-converter doesn't address. Prefer this skill over the generic one whenever Next.js is mentioned.
---

# Next.js Smooth Scroll Converter

Convert Next.js pages and components with scroll animation jank into smooth scroll experiences. This skill handles Next.js-specific concerns: App Router vs Pages Router, Server Components, SSR/hydration, route transitions, Strict Mode, and Fast Refresh.

## When to apply this skill

Apply when the project is Next.js (any version 13+) AND any of:
- User reports scroll jank / giật / lag in a Next.js app
- User wants to add smooth scroll, parallax, pinned sections, scroll reveals
- User has existing GSAP/Lenis code in Next.js that breaks on navigation
- User has hydration mismatches related to scroll/animation
- User asks about Lenis + ScrollTrigger setup in Next.js
- User mentions `app/`, `pages/`, `'use client'`, RSC, or Next.js routing in scroll context

**Always check Next.js version and router type first** before applying any code:
- Next.js 13+ with `app/` directory → App Router (most common for new projects)
- Next.js with `pages/` directory → Pages Router (older or migrating projects)
- Both can coexist in the same project

## Core principles for Next.js scroll

1. **All scroll/animation code MUST be client-side.** GSAP, Lenis, ScrollTrigger touch `window` and break SSR. Mark with `'use client'` (App Router) or use dynamic imports.

2. **Lenis must be a SINGLE instance at the root.** Don't init Lenis per page or per component — it creates conflicts. One global Lenis in root layout, individual pages just register ScrollTriggers.

3. **Cleanup is non-negotiable.** Every component that registers ScrollTriggers MUST clean them up on unmount. Otherwise navigating between pages accumulates triggers and breaks subsequent pages.

4. **`gsap.context()` is the right pattern.** It scopes selectors and provides `revert()` for atomic cleanup. Don't manually track ScrollTrigger instances.

5. **Refresh ScrollTrigger on route change.** Page heights change between routes; stale start/end positions cause jank.

## Image-heavy sections — pitfalls & fixes (CRITICAL)

When a section's main visual element is a large image (product photo, hero shot, full-bleed background), it is the SINGLE most likely source of "khựng" / micro-jank that no amount of GSAP tuning will fix. Diagnose in this order:

### Pitfall 1 — Unoptimised raw `<img>` source
A 220KB JPG at 1800×816px decodes to ~5MB of raw RGB pixels in GPU memory. Every entry-into-viewport pays that decode + rasterise cost on the main thread, producing 20-40ms paint spikes — visible as "khựng" even when the user isn't scrolling fast.

**Symptom in debug overlay:** stutter logs with `triggers: —` (no ScrollTrigger active) at scroll positions matching section entry points.

**Fix:**
1. Resize source images to max 1600px on the longer axis (covers retina at 1440×900 viewport).
2. Convert JPG/PNG → WebP at quality 78 (preserves alpha; 80–90% file size reduction).
3. Host on CDN (CloudFront, Vercel CDN) with `Cache-Control: public, max-age=31536000, immutable`.
4. Use `next/image` with `priority` + `fill` + `sizes="100vw"` so Next emits responsive srcset matched to actual display size.
5. For raw `<img>` fallbacks: ALWAYS set `loading="eager"`, `decoding="async"`, `fetchPriority="high"` on above-the-fold images.

Bash one-liner for the conversion (requires `cwebp` + `sips`):
```bash
for f in *.jpg *.png; do
  sips -Z 1600 "$f" --out "_tmp_$f" >/dev/null
  cwebp -q 78 -m 6 -alpha_q 80 "_tmp_$f" -o "${f%.*}.webp"
  rm "_tmp_$f"
done
```

### Pitfall 2 — `data-lenis-prevent` on a wrapper without inner scroll
This attribute tells Lenis to ignore wheel events over the element so internal scrollables work. On a static section, it causes Lenis to briefly hand control to the native scroller as the section enters viewport — felt as a 1-frame "khựng" right at the boundary.

**Fix:** Only use `data-lenis-prevent` on elements that actually have `overflow: scroll`/`auto` content (modals, side drawers, code blocks). Remove it from plain image wrappers.

### Pitfall 3 — Layout-property transitions on visible elements
`transition: width`, `transition: flex-basis`, `transition-all` all watch LAYOUT properties. Every animation frame triggers reflow on the element AND all its children. With an image inside, this means re-laying out the image on every transition tick = visible drag.

**Fix:** Replace with `transform: translateX/Y` and `opacity`. Both are compositor-only — the GPU just shifts the existing layer. Side panels that need to slide in:
```tsx
// BAD — layout reflow every frame
<div className={tabOpen ? 'w-1/2' : 'w-0'} style={{ transition: 'width 500ms' }} />

// GOOD — composite-only
<div
  className="w-1/2"
  style={{
    transform: tabOpen ? 'translate3d(0,0,0)' : 'translate3d(100%,0,0)',
    transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
    willChange: 'transform',
  }}
/>
```

### Pitfall 4 — GPU layer not pre-warmed
Even after image optimisation, the FIRST scroll-into-view of a section can spike 20-25ms because the browser allocates a new composite layer at that exact moment. The fix is to tell the browser to create the layer at parse time:

```tsx
<div className="relative" style={{ contain: 'paint' }}>
  <Image src={...} fill priority />
</div>
```

`contain: paint` declares "no children leak outside this element's box," letting the browser pre-rasterise the section into its own layer ahead of viewport intersection.

### Pitfall 5 — Hover transitions watching layout properties
Hotspots, tooltips, and hover-revealed pills often use `transition: max-width` or `transition: width` to animate a slide-in. As the user scrolls, the cursor's relative position over the section changes, causing brief hover state activations on every frame the cursor grazes the element. Each activation fires the layout transition = reflow chain = "khựng".

**Fix:** Switch to `transform` + `opacity`, and move the revealed text to `position: absolute` so its presence doesn't take layout space:
```tsx
<button className="group">
  <span className="block w-8 h-8">+</span>
  <span
    className="absolute left-full ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
  >Label</span>
</button>
```
`pointer-events-none` on the label prevents cursor proximity to the label from re-triggering hover.

### Pitfall 6 — `backdrop-filter: blur` on fixed elements
Fixed headers / sticky menus with `backdrop-filter: blur` recompute the gaussian blur every scroll frame because the content beneath shifted. On integrated GPUs this costs 3-5ms per frame, eating into the 16ms frame budget and producing slow-scroll khựng.

**Fix:** Use a solid background or a soft `linear-gradient` fade to transparent. Keep the readable area opaque; let the edges blend. Drop `backdrop-filter` entirely.

### Pitfall 7 — `pinType: 'fixed'` (default) on sections with siblings
GSAP's default pin wraps the pinned element in a pin-spacer DIV and toggles `position: fixed`. At un-pin (scrolling past the end), GSAP REMOVES the wrapper — a DOM mutation that browsers paint as a 1-frame hitch.

**Fix:** Use `pinType: 'transform'` everywhere a pin sits between visible siblings. The element stays in flow throughout; un-pinning just zeroes a CSS translate3d. No DOM mutation, smooth in both scroll directions.
```ts
ScrollTrigger.create({
  trigger: el, start: 'top top', end: '+=150%',
  pin: true, pinSpacing: true, pinType: 'transform',
  anticipatePin: 1, fastScrollEnd: true,
});
```

### Pitfall 8 — 3D transforms (rotationX, perspective) on many elements
SplitType char-by-char animations using `rotationX: -90` + `z: -200` + parent `perspective: 1000` force the GPU to recompute a 3D transform matrix for EVERY char on every scroll tick. Reverse-scroll through the section visibly stutters as 25+ matrix calculations run per frame in the OPPOSITE direction.

**Fix:** Use 2D `y` + `opacity` for entrance reveals. Drop scrub for these — `toggleActions: 'play none none reverse'` plays the animation atomically once, no per-tick interpolation.

### Pitfall 9 — Stutter detector blind spot
A simple "frame > 24ms = stutter" detector misses CLUSTERS — 3-5 frames at 18-22ms in a row also feel as "khựng" but no single frame trips the threshold. Always include cluster detection: `N consecutive frames ≥ 18ms = stutter cluster, log scroll position + active triggers + lenis velocity sign`. See `references/debug-overlay.md`.

### Pitfall 10 — Debug overlay polluting its own measurements
Calling `ScrollTrigger.getAll().filter(isActive)` on every spike adds 2-3ms of work that pushes 18ms frames over the 20ms threshold. Cache section bounds at mount; only refresh on resize.

## Workflow

### Step 1: Identify the setup

Ask or deduce:
1. **Router type:** App Router (`app/`) or Pages Router (`pages/`)?
2. **Next.js version:** 13, 14, 15? (Affects which APIs are available)
3. **What's the user trying to do?**
   - Site-wide smooth scroll only → minimal Lenis bootstrap
   - Specific page with scroll animations → page-level setup
   - Both → root Lenis + per-page ScrollTriggers

If router type isn't clear, check for `app/layout.tsx` (App Router) vs `pages/_app.tsx` (Pages Router).

### Step 2: Set up the foundation

The foundation = global Lenis instance synced with GSAP ticker. This belongs at the ROOT, not per-page.

For **App Router**, read `references/app-router.md`.
For **Pages Router**, read `references/pages-router.md`.

The foundation provides:
- A `<SmoothScrollProvider>` client component wrapping all children
- Global Lenis instance with GSAP ticker sync
- Route change listener that refreshes ScrollTrigger
- Proper cleanup on unmount

### Step 3: Build per-page/component scroll animations

Once foundation is set up, individual pages/components register ScrollTriggers using the standard pattern:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: '.block',
          start: 'top top',
          end: '+=150%',
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 1.2,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        }
      })
      .from('.target', { yPercent: 100, opacity: 0, stagger: 0.1 });
    }, containerRef);

    return () => ctx.revert(); // CRITICAL
  }, []);

  return <div ref={containerRef}>...</div>;
}
```

Read `references/component-patterns.md` for full examples (parallax, reveals, horizontal scroll, pinned sections).

### Step 4: Handle Next.js-specific gotchas

Read `references/gotchas.md` for the full list, but the top 5:

1. **`useLayoutEffect` warning in SSR** → Use `useIsomorphicLayoutEffect` helper
2. **Strict Mode double-mount in dev** → `gsap.context()` cleanup handles this
3. **Route transition timing** → Refresh ScrollTrigger AFTER new page mounts, not during transition
4. **Fast Refresh adds duplicate triggers** → Same cleanup pattern handles this
5. **Image/font loading shifts layout** → Refresh on `document.fonts.ready` AND after image loads

### Step 5: Verify the conversion

Before delivering, verify:

1. ✅ Lenis is initialized ONCE at root layout (not per page)
2. ✅ Foundation component has `'use client'` directive
3. ✅ Every component using GSAP/ScrollTrigger has `'use client'`
4. ✅ Every `useEffect` with ScrollTrigger returns `ctx.revert()` cleanup
5. ✅ ScrollTrigger refreshes on route change (App Router: `usePathname` listener; Pages Router: `router.events`)
6. ✅ All animated CSS has `will-change: transform; transform: translate3d(0,0,0)`
7. ✅ Animations only touch `transform` and `opacity`
8. ✅ All pinned triggers have `pinSpacing: true` + `anticipatePin: 1`
9. ✅ All scrubbed triggers use `scrub: 1` to `1.5` (number, not `true`)
10. ✅ No hydration mismatches (initial state matches between server and client)

### Step 6: Deliver

Save the converted files preserving Next.js project structure:
- `app/components/SmoothScrollProvider.tsx` (App Router foundation)
- `app/layout.tsx` (updated to include provider)
- Modified page/component files

Use `present_files` for each file. Include a brief migration guide in the response.

## Decision tree

```
User has Next.js scroll problem
│
├── No existing scroll code → Build from scratch
│   ├── App Router → references/app-router.md
│   └── Pages Router → references/pages-router.md
│
├── Has scroll code but jank → Diagnose first
│   ├── Custom wheel/preventDefault → Full rewrite using foundation
│   └── ScrollTrigger feel stiff → Add Lenis foundation only
│
└── Code works but breaks on navigation
    └── Missing route-change refresh → references/gotchas.md (Fix #3)
```

## Common pitfalls (Next.js-specific)

- ❌ Don't put Lenis in `'use server'` files or Server Components — won't work
- ❌ Don't import GSAP at module top-level in shared utilities — breaks SSR. Always inside useEffect or behind dynamic import.
- ❌ Don't forget `'use client'` on components using hooks — they'll fail to mount
- ❌ Don't init Lenis multiple times (one per page) — cumulative scroll listeners cause weird behavior
- ❌ Don't use `next/dynamic` with `ssr: false` for the WHOLE page just to use scroll — wrap only the animation component
- ❌ Don't rely on `window.scrollTo()` — use `lenis.scrollTo()` instead so Lenis tracks correctly
- ❌ Don't use Next.js `<Link>` `scroll={true}` (default) on a Lenis page — disable with `scroll={false}` and handle scroll manually via Lenis
- ❌ Don't write to `document.documentElement.style.scrollBehavior` — causes layout recalc

## Reference files

- `references/app-router.md` — Full App Router setup (Next.js 13/14/15 with `app/`)
- `references/pages-router.md` — Full Pages Router setup (Next.js with `pages/`)
- `references/component-patterns.md` — Common scroll animation patterns (parallax, reveals, horizontal, pin)
- `references/gotchas.md` — Next.js-specific issues and fixes
- `references/typescript.md` — TypeScript types for refs, hooks, GSAP, Lenis
