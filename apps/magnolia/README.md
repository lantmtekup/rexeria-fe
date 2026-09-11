# The Magnolia — standalone clone

Clone of https://magnolia-demo-black.vercel.app/ built from the recon in `../../recon/magnolia`.

## Run

```bash
cd apps/magnolia
npm install      # already done
npm run dev      # http://localhost:7790
npm run build && npm start   # production
```

## Stack

Next.js 14 App Router · Tailwind · framer-motion 11 · GSAP ScrollTrigger (parallax layer only).
No Lenis: the original uses native scroll with `scroll-snap-type: y proximity`.

## Layout

| Path | What |
|---|---|
| `app/layout.tsx` | fonts (Playfair Display + Inter via next/font), `<html class="snap-panels">`, preloader, skip link, header |
| `app/page.tsx` | the 8 sections in DOM order |
| `components/sections/*` | one file per section (`#top`, `#heritage`, `#horizontal-slide`, `#interactive-tour`, `#units`, `#grace`, `#gallery`, `#consultation`) |
| `components/shared/*` | header, preloader, cursor glow, panel background + GSAP parallax, scroll-scrubbed video, logo SVG, locale provider |
| `lib/i18n.ts` | full VI + EN dictionary, extracted verbatim from the original bundle |
| `lib/motion.ts` | shared motion constants (`VR` ease, reveal variants, viewport defaults) |
| `lib/site-config.ts` | tour embed URLs, preloader timings, scroll-snap mode |
| `public/images`, `public/videos` | assets. Images are re-encoded WebP (see below); videos are the originals |

## Notes

- The hero is a 260svh scroll-scrubbed video. It plays once per session, then swaps to a
  static hero and resets scroll to the top, exactly like the original.
- The gallery veil and intro blur use a 5th keyframe at progress 1 that the shipped bundle
  text does not show; it was measured off the live site. See `recon/magnolia/source-analysis.md` §8.
- Reduced motion is honoured everywhere: static hero, static gallery, no parallax, no cursor glow.

## Image optimization

Source images were re-encoded from the originals with sharp: capped to the widest size each
one can actually occupy (2x DPR), then WebP quality 82.

| | before | after |
|---|---|---|
| 28 images | 204 MB | 6.8 MB |

Caps: full-bleed backgrounds 2560px, day-experience panels 1920px, unit strips 1600px,
unit cards 1200px, tour preview 1600px. All references now point at `.webp`.
The untouched originals are in `~/Downloads/magnolia-demo-black-assets/`.

Videos are still the originals (57 MB). Re-encoding them with a short keyframe interval
would make the scroll-scrubbed hero seek noticeably smoother, but the local ffmpeg is
broken (`libx265.215.dylib` missing, needs `brew upgrade ffmpeg`).

**Test with the production build, not `npm run dev`** — dev recompiles and re-optimizes on
every request, which reads as scroll jank.

## Deliberate deviations from the original

**Hero scrub pacing.** The original runs its 23.8 s opening film over a 260svh track, so the
film advances 48 px of scroll per second of footage. One mouse-wheel notch is about 100 px,
which means a notch jumps roughly 2 seconds of film and the footage reads as a flicker rather
than a shot. The track here is 520svh and the raw scroll progress is eased through a spring
before it reaches `currentTime`.

| | track | scroll travel | px per second of film | film per wheel notch |
|---|---|---|---|---|
| original | 260svh | 1440 px | 48 | 2.07 s |
| this clone | 520svh | 3780 px | 127 | 0.79 s |

Measured at a 900 px viewport. The new rate lands in the 100-150 px/s band that scroll-driven
film needs to stay legible, and holds across viewports: 114 px/s on a 812 px phone, 152 px/s
on a 1080 px display.

The spring is over-damped on purpose so it never overshoots and rewinds the film, and the
hand-off to the static hero now fires on the eased value rather than the raw one, so a fast
flick cannot cut the film off before it has actually been seen.

## Scroll smoothing

Every scroll-driven section reads its progress through `useSmoothProgress`
(`components/shared/use-smooth-progress.ts`), which eases the raw value with an over-damped
spring before it reaches any transform. Raw scroll arrives in discrete jumps, so a transform
wired straight to it teleports instead of moving. The spring turns each jump into a short
glide and never overshoots, so content cannot appear to run backwards. Viewers who ask for
reduced motion get the raw value with no lag.

Applied to: hero film scrub, heritage line sweep, the five-slide journey, the grace sequence,
and the gallery day panels.

Three other fixes in the same pass, all in `horizontal-slide.tsx`:

- The active-slide index was pushed to React state on every scroll frame, re-rendering all
  five slides and captions mid-motion. It now updates only when the slide actually turns over,
  the item list is memoised, and the slide and caption components are wrapped in `memo`.
- The caption used `drop-shadow`, a filter pass re-run every frame on an element that animates
  `y` and `opacity`. On text, `text-shadow` renders the same and costs nothing per frame.
- Slides 2-5 were lazy-loaded. They sit off-screen behind a transform, so the browser fetched
  them at the moment they slid in and the motion stalled on the decode. All five now load up
  front, which is cheap at ~0.5 MB each.

If section boundaries still feel like they grab, the cause is CSS scroll-snap
(`scroll-snap-type: y proximity` on `<html>`, set from `siteConfig.scrollSnap`). Setting that
to `"none"` disables it.

## Journey pacing and the arrival settle

Each slide owns one step of scroll progress, split between *transit* (sliding across) and
*dwell* (sitting still). The original gives dwell only 26 % of the step, so a slide spends
most of its life moving and there is barely a moment to look at it.

| per slide, at a 900 px viewport | before | after |
|---|---|---|
| track | 500vh | 700vh |
| transit | 576 px | 464 px |
| dwell | 198 px | 697 px |

The image also arrives fully resolved, which gives the eye nothing to land on. Two effects
from the rexerai motion library (`src/components/modules/block-editor/motion/motionLibrary.ts`)
now run on arrival, driven by scroll progress rather than an in-view trigger so they stay
locked to the scrub:

- **`media-zoom`** — scale 1.14 → 1.05, the Ken-Burns settle.
- **`blur-in`** — 6 px → sharp, the focus pull.

Together the arc spans 707 px of scroll, about a second of scrolling, so the picture resolves
in front of the viewer. `clip-reveal` was the third candidate and was rejected: it wipes along
an edge, and the slide already enters from the side, so the two directional motions fight.

`FOCUS_BLUR_PX` in `horizontal-slide.tsx` set to 0 removes the focus pull; it is the only
per-frame filter left on the page.

The gallery day panels use the same timeline shape, so their track went 520vh → 640vh, which
stretches every window proportionally and takes each panel from ~340 px of stillness to ~420 px.

## Smooth scroll, video scrubbing, and image quality

### Why the hero never felt like video

The source film was **3840×2160 with one keyframe every 85 frames** — about 1.2 s apart. Every
scroll seek had to decode up to 84 intermediate 4K frames to produce one picture, which no
decoder keeps up with, so frames arrived late and in clumps.

| | resolution | keyframe spacing | size |
|---|---|---|---|
| hero, before | 3840×2160 | 1 per 85 frames | 47 MB |
| hero, after | 1920×1080 | 1 per 7.9 frames | 26.8 MB |
| gallery, before | 1920×1080 | 1 per 86 frames | 12 MB |
| gallery, after | 1920×1080 | 1 per 5.8 frames | 3.4 MB |

Re-encoded with `ffmpeg-static` (a devDependency — the system ffmpeg is broken, see below).
A seek now decodes at most 7 frames at a quarter of the pixels. 1920 is roughly 1:1 on a
2000 px window, so dropping from 4K costs no visible sharpness.

### Lenis

Native scroll arrives in ~100 px steps, and a step that size asks the film to jump nearly a
second of footage at once. `components/shared/smooth-scroll.tsx` runs Lenis, which eases the
real scroll position in a rAF loop, so scroll advances in small per-frame deltas and the video
is asked for its *next* frames rather than a distant seek. This is the root fix for smoothness;
the per-section springs only ever smoothed what was already a step, so they were stiffened
(90 → 190) to stop the two low-passes stacking into lag.

CSS scroll-snap is off (`siteConfig.scrollSnap = "none"`) because the browser re-targets the
scroll position mid-glide and it reads as the page grabbing. The hero's end-of-film reset is
routed through Lenis via a `magnolia:scroll-reset` event so its internal position stays in step.

Lenis is skipped entirely under `prefers-reduced-motion`.

### Image quality

Two lossy passes were stacked: the WebP encode at quality 82, then `next/image` re-compressing
at its default quality 75. Sources are now quality 90 with larger caps (full-bleed 3200 px,
day panels 2400 px), and every `<Image>` passes `quality={92}`, so the second pass is
effectively transparent. The journey's focus pull dropped from 6 px to 4 px — it should read as
a pull into focus, not as a soft picture.

| | before | after |
|---|---|---|
| 28 images | 6.8 MB | 14.2 MB |

Still 93 % below the 204 MB of originals.

### Known gap

The system ffmpeg at `/opt/homebrew/bin/ffmpeg` cannot start: it links `libx265.215.dylib`
but the installed x265 4.2 ships `libx265.216.dylib`, and the 215 entry point is genuinely
absent, so a symlink shim does not help. `brew upgrade ffmpeg` fixes it. The asset pipeline
uses the `ffmpeg-static` binary instead and does not depend on the system one.

## Borrowed from the rexerai block library

Two blocks in `src/components/modules/block-editor/blocks/` were used as references.

### `DelvauxHero.tsx` — "Hero - Scroll Video"

Its first choice is a **canvas frame sequence**; scrubbing a `<video>` is only what it falls
back to when no frames are supplied. That is the right order, and it is the fix for the hero
never feeling like video: scrubbing means seeking, and a seek decodes every frame back to the
previous keyframe. A frame sequence has no seek at all — one scroll position, one decoded
image, one `drawImage`.

`components/shared/scroll-frame-sequence.tsx` follows the block's shape: preload each frame as
an `Image`, snap progress to the nearest index, draw on change, paint frame 0 the moment it
lands. Frames live in `public/frames/hero` (286 frames, 12 fps, 1600×900, WebP q72).

| | size | cost per scroll step |
|---|---|---|
| original 4K video | 47 MB | decode up to 84 frames |
| re-encoded video | 26.8 MB | decode up to 7 frames |
| frame sequence | 21.3 MB | one `drawImage` |

The hero `.mp4` is no longer shipped. `components/shared/scroll-scrub-video.tsx` is still in the
tree and still drives the gallery, whose 6 s background video re-encoded down to 3.4 MB.

### `DelvauxSubnav.tsx` — "Sub-nav - Floating Pill"

`components/shared/floating-pill.tsx` carries over the rail (`fixed`, centred,
`bottom: clamp(24px, 4vw, 40px)`, `z-index: 99`, `pointer-events: none` with an opt-in inner),
the entrance (`y: 80 → 0`, `opacity: 0 → 1`, 1 s, `power2.out`, written as its exact
cubic-bezier `[0.25, 0.46, 0.45, 0.94]`), the 0.3 s opacity/visibility hide, and the link group
collapsing by `max-width` on `cubic-bezier(0.45, 0, 0.55, 1)`.

Changed: the source pill is always mounted and morphs on a product event, which has no
counterpart here, so it is tied to `#consultation` being in view; and the white-on-black is
restated in the Magnolia palette. It carries the phone, the map link, and a CTA that focuses
the form.

