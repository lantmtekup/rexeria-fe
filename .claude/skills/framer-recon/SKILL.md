---
name: framer-recon
description: Capture and analyze a UI block from any website (Framer or otherwise) to produce a clone-ready spec.md. Despite the `framer-` prefix the skill is GENERIC — works on any site. Pairs with `framer-clone` (codegen) and `framer-clone-host` (CMS wiring). Use whenever the user wants to clone, replicate, copy, or recreate a section/block/component from an existing site — even without saying "recon" explicitly. Common triggers — "clone this block", "copy this section from [URL]", "tôi muốn clone block này", "phân tích trang [URL] để clone", "lấy spec block này", "tách block từ site này", "reverse-engineer animation từ site này", "lấy timing animation của block này", "phân tích animation block này". Uses Playwright to capture screenshots (1440 / 768 / 375), record scroll-animation video, extract fonts/colors/spacing/HTML/framer-names/inline-animation-hints, and optionally capture real-time animation events via Chrome DevTools Protocol (catches CSS animations + transitions + Web Animations API used by Framer Motion). Produces a 12+ section spec.md ready for codegen tools (v0.dev, Cursor, Claude, or `framer-clone`). Always run FIRST in any clone task — it's the foundation. Output is spec-only, never code.
---

# Website Block Recon

Capture a UI block from a live website and produce a clone-ready `spec.md`.

## Why this skill exists

The quality of a clone is determined almost entirely by the quality of the initial analysis. Vague specs ("the heading is big, the button is dark") produce vague clones. This skill makes the analysis phase systematic — it captures screenshots at three viewports, records the animation in motion, extracts every computed style, and synthesizes everything into one self-contained spec document that another agent (or the user themself) can paste straight into v0.dev / Cursor / Claude to generate code.

The output is intentionally just a spec — not code. Code generation is a separate concern; the user picks their tool. The spec ends with a copy-pasteable prompt block tuned for **React + Tailwind + Framer Motion**, which is the default stack.

## When to use

Use this skill whenever the user asks to clone, copy, replicate, or recreate any visual element from a live website. Trigger phrases include "clone block from [URL]", "I want to copy this section", "phân tích trang này để clone", "lấy spec block hero của site X", or anything about reverse-engineering animations from a live site. Don't wait for the user to ask for "recon" or "analysis" specifically — if a clone task is starting, run this skill first.

If the user provides a URL without naming a block, ask which block first — don't recon the whole page by default. Pages have many blocks; capturing the wrong one wastes time.

## Workflow

```
URL + block selector
       ↓
[1] Confirm inputs and create workspace
       ↓
[2] Capture (Playwright: screenshots + video + raw HTML/CSS)
       ↓
[2a] (optional) CDP animation capture — for high-fidelity timing
       ↓
[3] Extract (parse computed styles → structured JSON)
       ↓
[4] Synthesize spec.md
       ↓
[5] Present to user
```

The one-shot runner is `scripts/run.py`. For most cases, just call that. If a stage fails or the user wants to redo only one part, the individual scripts (`capture.py`, `capture-cdp-animations.py`, `extract.py`, `synthesize.py`) can be called standalone.

## Step 1: Confirm inputs

You need three things before running:

1. **URL** — full URL of the page.
2. **Block selector** — a CSS selector that uniquely identifies the block. If the user named a section like "the coaching plans block" and the page has an anchor like `#coaching`, that anchor is the selector. Otherwise ask the user to open DevTools, right-click the block, and copy a selector (or describe it visually so you can guess: `section:nth-of-type(3)`, `[data-block="hero"]`, etc.).
3. **Workspace name** — a short slug for the output folder, derived from the URL and block (e.g., `perform-coaching`, `linear-hero`).

You don't need to ask about the target stack — it defaults to React + Tailwind + Framer Motion, which is what this skill is tuned for. Only ask if the user explicitly wants something else.

**Recommend CDP if animation matters.** If the user mentions animations, motion, timing, easing, or "how this site animates" in their request, default to passing `--cdp` to `run.py`. It costs ~15-30s extra and dramatically improves Section 9 of the spec.

Don't proceed until you have a real selector. Guessing is expensive — Playwright takes 30+ seconds per run, and a wrong selector means the screenshots are useless.

## Step 2: Capture

Run `scripts/run.py` with the inputs from step 1. It orchestrates the sub-scripts in order. The capture stage uses Playwright headless Chromium to:

- Load the page at three viewports: 1440×900 (desktop), 768×1024 (tablet), 375×812 (mobile).
- Scroll to the target block at each viewport and screenshot just the block element.
- Take one fullpage desktop screenshot for context.
- Record a 10-second video at desktop scrolling past the block — this catches scroll-triggered animations that text scraping misses entirely.
- Extract the block's `outerHTML` and the computed styles of every descendant.
- Download up to 20 images referenced inside the block.

If Playwright isn't installed, the script auto-installs it (`pip install playwright && playwright install chromium`). The script is idempotent — re-running overwrites the workspace cleanly.

**If Playwright fails** (no Chromium available, headless blocked by Cloudflare, sandboxed environment): tell the user the specific error, then offer to skip the capture stage and accept manually-provided screenshots + a screen recording instead. Specify which viewports you need (1440 / 768 / 375) and that the video should be 5–10s of scrolling through the block at desktop width. Then run only `extract.py` and `synthesize.py` against their inputs (note: `extract.py` will produce a thinner spec without computed-styles data — fall back to writing the spec mostly from the screenshots).

## Step 2a (optional): CDP animation capture

Pass `--cdp` to `run.py` (or run `scripts/capture-cdp-animations.py` standalone) to capture animations via the Chrome DevTools Protocol Animation domain. This is the single biggest leap in spec quality for animation-heavy sites.

**What it catches:**
- CSS animations (`@keyframes`) with full keyframe data
- CSS transitions firing on state change
- Web Animations API calls — **this is what Framer Motion uses under the hood**, so Framer template sites get real timing config (not estimates)
- Per-animation: real `delay`, `duration`, `easing`, `iterations`, target selector

**What it does NOT catch:**
- GSAP / rAF-driven animations (those bypass the browser animation engine — they're just `requestAnimationFrame` loops mutating styles)
- Canvas / WebGL animations
- Lottie internal animations

For GSAP-heavy sites, also parse the bundle JS for `gsap.to(`, `gsap.timeline(`, etc. — `references/animation-extraction.md` has the method.

The CDP output (`raw/cdp-animations.json`) is automatically rendered into Section 9 of spec.md if present. A failed CDP capture is non-fatal — spec generation proceeds with the manual log template as fallback.

## Step 3: Extract

`scripts/extract.py` reads `raw/computed-*.json` (3 viewports) and produces structured `raw/extracted.json` covering:

- **Layout** — display type, grid/flex props, max-width, padding, gap of the block root.
- **Typography** — every distinct combination of (font-family, size, weight, line-height, color), sorted by size descending so headings appear first.
- **Colors** — backgrounds, text colors, border colors, deduplicated and tallied by frequency.
- **Spacing** — all padding/margin/gap values in use.
- **Effects** — border-radius, box-shadow, opacity values.
- **Animation fingerprints** — detects Framer Motion (look for `data-framer-*`), GSAP, AOS, vanilla CSS transitions. Records the library and any inline transition/animation values it can see.
- **`responsive_deltas`** — per-viewport aspect dict (root layout + heading/body typography extremes). Source: 3 separate `computed-{viewport}.json` files captured by `capture.py`.
- **`framer_element_deltas`** — per-framer-named-element diff across 3 viewports. Path-keyed (`Hero > Container > Profile Section`) for dedup of repeated names. Only includes elements where ≥1 tracked property differs.

### 🚨 Critical: unnamed wrapper / text node promotion

Framer doesn't put `data-framer-name` on every wrapper. Common gap: `<div width=643>` containing the bio `<p>`, or the `<h1>` element itself inside a "First Name" container. Without explicit promotion these were invisible to recon.

`_collect_framer_paths` walks unnamed descendants of every framer-named element (max depth 3, stops at the next framer-name boundary) and promotes 2 categories:

- **`_wrapper_*`** keys (`_wrapper_width`, `_wrapper_max-width`, `_wrapper_padding`, `_wrapper_margin`) — the nearest unnamed wrapper that constrains a text node. Captures things like the bio's 643px right-column wrapper.
- **`_text_*`** keys (`_text_font-size`, `_text_font-weight`, `_text_line-height`, `_text_letter-spacing`, `_text_color`, `_text_text-align`) — the actual `<h1>`/`<p>`/`<span>` typography deep inside a named container. Captures bio letter-spacing `-2.4px`, line-height `44px`, `text-align: justify`, etc.

**Why this matters for downstream Phase 2 clone:** without `_text_text-align` we missed `justify`; without `_wrapper_max-width` the bio kept full width instead of right-aligned 643px. Verify on a fresh recon that both keys appear under text-bearing framer-named elements (e.g., `Bio Section`, `First Name`) before handing to `framer-clone-host`.

The extraction is purely from CSS computed styles, which means it sees the *current* state, not the animation config. For library-driven animations (especially Framer Motion), the actual animation parameters live in JavaScript and need video inspection OR CDP capture to recover — `references/animation-extraction.md` explains the manual method, and `--cdp` in `run.py` handles the automatic one.

## Step 4: Synthesize spec.md

`scripts/synthesize.py` combines everything into one markdown file. The structure is fixed (see `assets/spec-structure.md` for the rationale behind each section):

1. Source URL, selector, target stack
2. Links to screenshots and videos
3. Layout
4. Typography table
5. Colors
6. Spacing
7. Effects
8. Inline animation hints (Framer Motion `transform` snapshots from inline style)
9. **Animation** — auto-captured timing table from CDP (if available) + library detection + manual log template
10. **Responsive** — 3-viewport diff table auto-extracted from `computed-*.json`. Bold rows = property differs across breakpoints.
11. **Per-element responsive diff** — every framer-named element with ≥1 property changing. Includes `_wrapper_*` constraints + `_text_*` typography promoted from unnamed descendants. **Highest-value section for Phase 2 codegen.**
12. **Observed entrance animation** (auto-detected from video frame analysis)
13. **Inferred grid layout** (from bounding rects)
14. **Ready-to-use prompt** — copy-pasteable block primed for v0.dev / Cursor / Claude
15. Quality checklist

**Quality bars for spec.md** (run `references/spec-quality-checklist.md` mentally before declaring done):

- Every measurement has a real number and unit. No "small", "medium", "large".
- Every color is hex.
- Every detected animation has trigger + property + duration + easing fields, even if some are estimated (mark estimates with `// estimated`).
- The responsive table has actual deltas, not `_fill in_` placeholders.
- Section 11 (Per-element diff) — for every text-bearing framer-named element, BOTH `_wrapper_*` and `_text_*` keys should appear in viewport rows. Their absence = capture missed something (re-run capture.py).
- **If `--cdp` was used:** every row in the auto-captured table should have a reduced-motion fallback noted before handoff. See `references/reduced-motion-patterns.md`.
- **Easing translation:** any `cubic-bezier(...)` value should be translated to Framer Motion array form. See `references/easing-translation-table.md` for the mapping (the array form `[0.22, 1, 0.36, 1]` is exact; named tokens are approximations).
- The ready-to-use prompt at the end is self-contained: another agent reading just the prompt + screenshots should produce a faithful clone.

If the agent (you) is running interactively, **watch the video** before finalizing spec.md and fill in the animation log section yourself rather than leaving it as a template. The script can't watch the video — you can. With CDP capture, much of this is automated, but the video still catches GSAP/rAF animations that CDP misses. This is the single highest-impact thing you can do to improve spec quality.

## Step 5: Present to user

Summarize counts, not details:

> "Captured 4 screenshots (desktop, tablet, mobile, fullpage), 1 animation video, 14 unique colors, 6 typography styles, detected Framer Motion, captured 12 animations via CDP. Spec is at `recon-<name>/spec.md`."

Point them to:
- `spec.md` itself
- `screenshots/` for visual reference
- `videos/scroll-animation.webm` to watch the animation
- `raw/cdp-animations.json` for raw timing data (if `--cdp` was used)
- The "Ready-to-use prompt" section at the bottom of spec.md, which they can copy into v0.dev / Cursor / Claude

Then ask if they want refinement: "Do you want me to watch the video and fill in the animation log, or are you taking it from here?" Some users prefer to do animation work themselves; some want you to do it.

**Do not generate component code in this skill.** Code generation is a separate, downstream concern. If the user wants code, they'll feed spec.md into their tool of choice (often `framer-clone`). This skill's job ends at spec.md.

## Edge cases

**Block selector is ambiguous.** Don't guess. Screenshot the page once, ask the user to identify which block they mean, then get a precise selector.

**SPA / lazy-loaded content.** The capture script waits for `networkidle` and scrolls to the block first. If you see blank screenshots, the block likely hasn't rendered yet — increase the wait or check whether the page requires JS interactions to reveal the block.

**Site blocks headless browsers.** Cloudflare and similar challenge systems may reject Playwright. Don't retry endlessly. Tell the user, suggest they save the page locally (Ctrl+S) and supply screenshots manually. The extract and synthesize stages can run on manual inputs.

**Webfonts behind a foundry.** Capture the font-family name from computed styles, but flag in spec.md that the font may need licensing. Suggest a Google Fonts alternative based on the visual style (Inter for Geist, Plus Jakarta Sans for proprietary geometric sans, Fraunces for proprietary serif).

**Static block, no animation.** The animation section should explicitly say "no animation — static block" rather than leaving a confusing empty template.

**CDP capture finds nothing on a clearly animated site.** Likely culprits: (1) GSAP — animations bypass the browser engine; check bundle JS. (2) IntersectionObserver gating — the animation only fires when the element enters viewport, and the scroll path missed it. Try increasing `scroll_steps` or scrolling more slowly. (3) Animations on click/hover — CDP captures on-load + on-scroll by default; for click animations, the user needs to interact manually with `--ui-headed` (planned, not yet implemented) or accept the video-only fallback.

**User just wants a quick look.** Skip the video stage by passing `--no-video` to `run.py` (faster, half the time). Skip CDP by omitting `--cdp`. The spec will still cover layout, typography, colors, and spacing — just not animation detail.

## Reference files

- `references/animation-extraction.md` — How to detect animations from video + HTML fingerprints, plus typical values for common patterns and how to translate to Framer Motion. Also covers GSAP bundle parsing.
- `references/easing-translation-table.md` — CSS cubic-bezier ↔ GSAP ↔ Framer Motion translation table. Consult when copying easing values from CDP capture or computed styles.
- `references/reduced-motion-patterns.md` — `prefers-reduced-motion` fallback patterns for every common animation type. Each CDP-captured animation needs a fallback noted in spec.md.
- `references/spec-quality-checklist.md` — Self-check before handing spec.md to the user.

## Scripts

- `scripts/capture.py` — Playwright capture (screenshots + video + computed styles).
- `scripts/capture-cdp-animations.py` — CDP Animation domain capture (real-time animation events). Optional but high-value for animation-heavy sites.
- `scripts/extract.py` — Parse computed styles into structured JSON.
- `scripts/synthesize.py` — Build spec.md from the JSON + workspace contents. Auto-renders CDP data into Section 9 if present.
- `scripts/save-auth-state.py` — Save browser session for authed routes.
- `scripts/run.py` — Orchestrator; call this for the common case. Pass `--cdp` for animation work.

The scripts are designed to compose. A standalone power-user can run each one directly; in a normal flow, just call `run.py`.
