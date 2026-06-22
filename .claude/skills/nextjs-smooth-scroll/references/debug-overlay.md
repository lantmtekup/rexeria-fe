# Debug overlay for diagnosing scroll jank

When a user says "still khựng" but you can't reproduce it from code review alone, drop in an on-page perf overlay. Without it you're guessing; with it the user can scroll, FEEL the jank, and read off exactly where it happened.

## What the overlay must show

Bare minimum: rolling FPS / frame avg / variance. That alone tells you if there are slow frames at all — but it WILL miss the kind of "khựng" that's 3 frames at 19ms in a row. Add these to actually find causes:

1. **Frame strip** — last 60 frames as colored vertical bars in a row. Green ≤16.67ms, yellow 16-20, orange 20-33, red >33. Eyeballing the strip during scroll instantly reveals whether stutter clusters exist.
2. **Stutter log** — every frame ≥20ms gets a row capturing: time, scrollY, lenis velocity (sign = scroll direction), section name, currently-active ScrollTrigger names.
3. **Cluster detection** — N consecutive frames ≥18ms that NO single-frame detector would catch. Logged as `×N` rows. This is the difference between "looks fine in numbers" and "actually feels janky".
4. **Flash** — full-viewport red fade-in for 200ms on every spike. Gives the user immediate visual confirmation that what they felt was real.
5. **Variance σ²** — frame timing variance over 60 frames. Low avg + high variance = inconsistent pacing = perceived jitter even when fps "looks fine".
6. **Long task counter** — uses `PerformanceObserver({ entryTypes: ['longtask'] })`. Anything ≥50ms is a main-thread block; rare but extremely visible when it happens.

## Pitfalls

- **The overlay measures itself.** Calling `ScrollTrigger.getAll()` on every spike adds 2-3ms of work that pushes 18ms frames into the 20ms detection bucket. Cache section bounds at mount; only refresh on resize. Throttle UI re-renders to 5Hz max.
- **Headless Playwright is locked at ~30fps.** Any test you run via `playwright.evaluate(...)` will report 33ms frames as the baseline. Use the overlay for live human testing only.
- **Trigger column showing `—`** means there are NO active scrubbing triggers at the spike moment — that's a strong signal the cause is OUTSIDE GSAP (image decode, layer creation, browser background work). Pivot the diagnosis accordingly.

## Diagnostic strategy

1. Open the overlay (auto-opens with `?debug` in URL or via Shift+D).
2. Click `clear` to reset.
3. Scroll the page slowly through ALL sections in BOTH directions.
4. Note where the user feels jank.
5. Read the log: which scrollY range? Which triggers active? Which section?
6. Match against the "Image-heavy sections — pitfalls" checklist in `SKILL.md`.

If the pattern is "spikes at viewport entry, triggers=—" → image decode. If it's "spikes during scrub, multiple triggers active" → too many concurrent scrub animations. If it's "velocity=0 stationary spikes" → some background work (font loading, GC, hover transitions firing).

## Step-by-step disable diagnosis

When the cause is unclear, REMOVE features one at a time:

1. Disable the GSAP animation in the suspect section. If spikes vanish → it's the animation.
2. Replace the image with a colored `<div>`. If spikes vanish → it's the image (decode/layer).
3. Remove `data-lenis-prevent`. If spikes vanish → Lenis was pausing.
4. Strip hover transitions. If spikes vanish → hover state was flickering during scroll.

Re-enable one at a time. The first re-add that brings spikes back is your culprit.

## Debug overlay component

A complete reference implementation lives in this codebase: `app/components/DebugOverlay.tsx`. It's gated behind `?debug` and Shift+D so production users never see it. Drop it in any Next.js project that has a Lenis instance exposed on `window.__lenis` and ScrollTrigger registered as `window.ScrollTrigger`.

Key implementation details:
- Single rAF loop measures every frame; UI re-render throttled to 5Hz.
- Section detection cached at mount, refreshed only on resize.
- Stutter capture uses TWO patterns: single-frame ≥20ms AND clusters of 3+ frames ≥18ms.
- All measurements continue running even when overlay is hidden so the floating "D" button can show last-known stats; zero impact when fully closed.
