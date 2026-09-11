# The Magnolia — full-page clone spec (index)

Source: https://magnolia-demo-black.vercel.app/  ·  Captured 2026-09-11  ·  Target stack: React + Tailwind + framer-motion (+ GSAP ScrollTrigger for the parallax layer)

This folder is the complete recon for cloning the **whole page** (not one block). Read in this order:

1. **`source-analysis.md`** — the authoritative spec. Per section: exact DOM + Tailwind classes, all copy (vi + en), assets, every framer-motion/GSAP config with real numbers (scroll ranges, easings, durations), state/interaction logic, plus a Shared section (fonts, color tokens, ease, SVG marks, links). Derived from the de-minified bundles in `source/`, not guessed.
2. **`scroll-frames/`** — 45 desktop (1440×900) + 22 mobile (375×812) screenshots taken with real Chrome while scrolling the live page every half viewport. They show the scroll-scrubbed video states and every sticky-panel state. Contact sheets: `scroll-frames/contact-desktop.png`, `scroll-frames/contact-mobile.png`. Frame index below.
3. **`recon-<section>/spec.md`** — per-section Playwright recon (computed styles, typography table, colors, spacing, responsive diffs at 1440/768/375, CDP animation capture, scroll video). These were shot in Playwright's Chromium which cannot decode H.264, so hero/grace/gallery screenshots there show loaders. Use them for numbers; use `scroll-frames/` for visuals.
4. **`source/`** — `index.html` (SSR output), `page.pretty.js`, `layout.pretty.js`, shared chunks `11-*.js` (siteConfig, i18n, motion constants), `178-*.js` (framer-motion), `907-*.js` (GSAP), `styles.pretty.css`.
5. **Assets** — all originals are in `~/Downloads/magnolia-demo-black-assets/` (images, 2 videos, fonts, plus the Real Horizons 3D tour bundle in `tour-3d-realhorizons/`). Copy `images/` and `videos/` into the clone's `public/` unchanged; paths in the spec are root-relative and match.

## Page map (desktop 1440×900, total scroll height 20918px)

| # | Section id | Height | Mechanic | Assets |
|---|---|---|---|---|
| 0 | `header` | fixed, transparent | Story/Explore toggle, VI/EN, Liên hệ, sound toggle (local state only) | logo SVG mark |
| 1 | `#top` (hero) | 260svh, sticky 100svh | scroll-scrubbed video `currentTime = min(1, p/0.8)·duration`; at p ≥ 0.8 swap to static hero + `scrollTo(0,0)` | `videos/hero/FULL_0409.mp4` (23.8s), `images/assets/hero/2cb5…png` |
| 2 | `#heritage` | min 100svh | scroll-linked opacity/blur/y on heading, silhouette parallax | `heritage/silhouette.png`, `silhouette2.png` |
| 3 | `#horizontal-slide` | 500vh track, sticky | 5 slides translateX, journey p 0–0.86, step 0.215, Ken-Burns inner scale; active index → tour URL | `horizontal-slide/slide-1..5.jpg` |
| 4 | `#interactive-tour` | 100svh | iframe Real Horizons tour + fallback preview | `tour/preview.png`, iframe `studio.realhorizons.ai/tours/df3f63d0-…/view` |
| 5 | `#units` | auto (no snap-start) | 3 unit cards + 3-image strip + Townhouse hero, whileInView reveals | `units/card-*.png`, `strip-1..3.png`, `townhouse-hero.png` |
| 6 | `#grace` | 300vh, sticky | title over stair-01..04 image sequence crossfade by scroll | `grace/stair-01..04.png` |
| 7 | `#gallery` | 520vh, sticky | second scrubbed video + 4 time-of-day panels at fixed progress windows (morning/noon/afternoon/evening) + finale | `videos/grace-scroll.mp4` (6.0s), `day-experience/*` |
| 8 | `#consultation` | min 100svh | form (uncontrolled, preventDefault only), footer links, silhouettes | — |

Global: `<html class="snap-panels" style="--snap-strictness:proximity">` → `scroll-snap-type: y proximity`; every section except `#units` has `snap-start`. Preloader: 128px rotating Magnolia mark, min 1400ms, fades out 0.9s.

## Design tokens (from `styles.pretty.css`)

| Token | Value |
|---|---|
| font-display | Playfair Display (next/font, 400/500/600, normal + italic) |
| font-sans | Inter (300/400/500) |
| charcoal-950 | #0b0908 |
| charcoal-900 / 800 / 700 / 600 | #14110e / #1f1a15 / #2c2621 / #3d352d |
| charcoal-night | rgb(10 14 20) |
| ivory | #e8e5dd |
| champagne-50 / 100 / 200 / 300 / 400 | hsl(38 52% 96%) / #f2e9da / #e6d6bc / #d8c09a / #c9a961 |
| amber-600 / 700 / 800 | #a9660f / #8a5418 / #6b3f12 |
| ease-luxe / VR | cubic-bezier(.22, 1, .36, 1) = `[0.22, 1, 0.36, 1]` |
| shared reveal | `hidden {opacity:0,y:28}` → `visible {opacity:1,y:0}`, duration 0.8, ease VR, viewport `{once:true, amount:0.28}` |
| spring | `{stiffness:90, damping:22, mass:0.6}` |

## Scroll-frame index

| viewport | file | scrollY | visible sections | video state |
|---|---|---|---|---|
| desktop | `000-y0-top.png` | 0 | top | FULL_0409.mp4 @ 0s / 23.83s |
| desktop | `001-y450-top.png` | 450 | top | FULL_0409.mp4 @ 9.31s / 23.83s |
| desktop | `002-y900-top.png` | 900 | top | FULL_0409.mp4 @ 18.62s / 23.83s |
| desktop | `003-y1350-top+heritage.png` | 9 | top, heritage | - |
| desktop | `004-y1800-heritage.png` | 1800 | heritage | - |
| desktop | `005-y2250-heritage.png` | 2250 | heritage | - |
| desktop | `006-y2700-heritage+horizontal-slide.png` | 2700 | heritage, horizontal-slide | - |
| desktop | `007-y3150-heritage+horizontal-slide.png` | 3160 | heritage, horizontal-slide | - |
| desktop | `008-y3600-horizontal-slide.png` | 3600 | horizontal-slide | - |
| desktop | `009-y4050-horizontal-slide.png` | 4050 | horizontal-slide | - |
| desktop | `010-y4500-horizontal-slide.png` | 4500 | horizontal-slide | - |
| desktop | `011-y4950-horizontal-slide.png` | 4950 | horizontal-slide | - |
| desktop | `012-y5400-horizontal-slide.png` | 5400 | horizontal-slide | - |
| desktop | `013-y5850-horizontal-slide.png` | 5850 | horizontal-slide | - |
| desktop | `014-y6300-horizontal-slide.png` | 6300 | horizontal-slide | - |
| desktop | `015-y6750-horizontal-slide.png` | 6750 | horizontal-slide | - |
| desktop | `016-y7200-horizontal-slide+interactive-tour.png` | 7200 | horizontal-slide, interactive-tour | - |
| desktop | `017-y7650-horizontal-slide+interactive-tour.png` | 7652 | horizontal-slide, interactive-tour | - |
| desktop | `018-y8100-interactive-tour+units.png` | 8100 | interactive-tour, units | - |
| desktop | `019-y8550-interactive-tour+units.png` | 8550 | interactive-tour, units | - |
| desktop | `020-y9000-units.png` | 9000 | units | - |
| desktop | `021-y9450-units.png` | 9450 | units | - |
| desktop | `022-y9900-units.png` | 9900 | units | - |
| desktop | `023-y10350-units+grace.png` | 10350 | units, grace | - |
| desktop | `024-y10800-units+grace.png` | 10800 | units, grace | - |
| desktop | `025-y11250-grace.png` | 11250 | grace | - |
| desktop | `026-y11700-grace.png` | 11700 | grace | - |
| desktop | `027-y12150-grace.png` | 12150 | grace | grace-scroll.mp4 @ 0s / 6.04s |
| desktop | `028-y12600-grace.png` | 12600 | grace | grace-scroll.mp4 @ 0s / 6.04s |
| desktop | `029-y13050-grace.png` | 12998 | grace | grace-scroll.mp4 @ 0s / 6.04s |
| desktop | `030-y13500-grace+gallery.png` | 13500 | grace, gallery | grace-scroll.mp4 @ 0s / 6.04s |
| desktop | `031-y13950-gallery.png` | 13950 | gallery | grace-scroll.mp4 @ 0.08s / 6.04s |
| desktop | `032-y14400-gallery.png` | 14400 | gallery | grace-scroll.mp4 @ 0.78s / 6.04s |
| desktop | `033-y14850-gallery.png` | 14850 | gallery | grace-scroll.mp4 @ 1.52s / 6.04s |
| desktop | `034-y15300-gallery.png` | 15300 | gallery | grace-scroll.mp4 @ 2.23s / 6.04s |
| desktop | `035-y15750-gallery.png` | 15750 | gallery | grace-scroll.mp4 @ 2.96s / 6.04s |
| desktop | `036-y16200-gallery.png` | 16200 | gallery | grace-scroll.mp4 @ 3.67s / 6.04s |
| desktop | `037-y16650-gallery.png` | 16650 | gallery | grace-scroll.mp4 @ 4.38s / 6.04s |
| desktop | `038-y17100-gallery.png` | 17100 | gallery | grace-scroll.mp4 @ 5.11s / 6.04s |
| desktop | `039-y17550-gallery.png` | 17550 | gallery | grace-scroll.mp4 @ 5.82s / 6.04s |
| desktop | `040-y18000-gallery+consultation.png` | 18000 | gallery, consultation | grace-scroll.mp4 @ 6s / 6.04s |
| desktop | `041-y18450-gallery+consultation.png` | 18498 | gallery, consultation | grace-scroll.mp4 @ 6s / 6.04s |
| desktop | `042-y18900-consultation.png` | 18578 | consultation | grace-scroll.mp4 @ 6s / 6.04s |
| desktop | `043-y19350-consultation.png` | 18578 | consultation | grace-scroll.mp4 @ 6s / 6.04s |
| desktop | `044-y19800-consultation.png` | 18578 | consultation | grace-scroll.mp4 @ 6s / 6.04s |
| mobile | `000-y0-top.png` | 0 | top | FULL_0409.mp4 @ 0s / 23.83s |
| mobile | `001-y812-top.png` | 812 | top | FULL_0409.mp4 @ 18.62s / 23.83s |
| mobile | `002-y1624-top.png` | 0 | top | - |
| mobile | `003-y2436-heritage+horizontal-slide.png` | 2436 | heritage, horizontal-slide | - |
| mobile | `004-y3248-horizontal-slide.png` | 3248 | horizontal-slide | - |
| mobile | `005-y4060-horizontal-slide.png` | 4060 | horizontal-slide | - |
| mobile | `006-y4872-horizontal-slide.png` | 4872 | horizontal-slide | - |
| mobile | `007-y5684-horizontal-slide.png` | 5684 | horizontal-slide | - |
| mobile | `008-y6496-horizontal-slide+interactive-tour.png` | 6496 | horizontal-slide, interactive-tour | - |
| mobile | `009-y7308-interactive-tour+units.png` | 7308 | interactive-tour, units | - |
| mobile | `010-y8120-units.png` | 8120 | units | - |
| mobile | `011-y8932-units+grace.png` | 8932 | units, grace | - |
| mobile | `012-y9744-grace.png` | 9744 | grace | - |
| mobile | `013-y10556-grace.png` | 10556 | grace | grace-scroll.mp4 @ 0s / 6.04s |
| mobile | `014-y11368-grace.png` | 11205 | grace | grace-scroll.mp4 @ 0s / 6.04s |
| mobile | `015-y12180-gallery.png` | 12180 | gallery | grace-scroll.mp4 @ 0.28s / 6.04s |
| mobile | `016-y12992-gallery.png` | 12992 | gallery | grace-scroll.mp4 @ 1.72s / 6.04s |
| mobile | `017-y13804-gallery.png` | 13804 | gallery | grace-scroll.mp4 @ 3.15s / 6.04s |
| mobile | `018-y14616-gallery.png` | 14616 | gallery | grace-scroll.mp4 @ 4.59s / 6.04s |
| mobile | `019-y15428-gallery.png` | 15428 | gallery | grace-scroll.mp4 @ 5.99s / 6.04s |
| mobile | `020-y16240-consultation.png` | 16240 | consultation | grace-scroll.mp4 @ 5.99s / 6.04s |
| mobile | `021-y17052-consultation.png` | 16258 | consultation | grace-scroll.mp4 @ 5.99s / 6.04s |

## Known gaps

- `#interactive-tour` iframe (Gaussian splat, WebGL) never finished loading in headless capture; use the live-tour screenshot and the downloaded `tour-3d-realhorizons/` bundle for reference. The clone should embed the same iframe URL.
- Hover states were not captured; hover rules are in the class strings (`hover:bg-ivory hover:text-black`, `group-hover/card:scale-105`, …).
- Sound toggle and Story/Explore mode have no consumers in the shipped bundle (see source-analysis §1).

## Ready-to-use prompt (whole page)

> Clone https://magnolia-demo-black.vercel.app/ as a Next.js (app router) page with Tailwind + framer-motion. Use `recon/magnolia/source-analysis.md` as the exact spec: reproduce the DOM and Tailwind classes verbatim per section, the Vietnamese copy with the EN dictionary for the VI/EN toggle, the design tokens above in `tailwind.config`, Playfair Display + Inter via next/font, and every motion config exactly as listed (scroll-scrubbed videos in `#top` and `#gallery`, 500vh horizontal journey, 300vh grace sequence, whileInView reveals with the shared `VR` ease). Assets live in `public/images/assets/**` and `public/videos/**` with the same paths. Respect `prefers-reduced-motion` per the reduced branches in the spec. Match `scroll-frames/contact-desktop.png` and `contact-mobile.png` at every scroll position.
