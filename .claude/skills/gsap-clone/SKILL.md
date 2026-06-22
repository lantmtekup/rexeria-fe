---
name: gsap-clone
description: Clone websites that use GSAP + ScrollTrigger + Lenis stack (common in luxury sites and Vietnamese agency work). Use this skill whenever the user mentions clone GSAP site, clone scroll animation, replicate a site with smooth scroll, copy a luxury landing page, recreate animation from URL, build like a reference site, clone Vietnamese agency site, or asks to match animations precisely from a target URL. Skill auto-detects stack and extracts GSAP animation configs directly from the source bundle — no manual animation description needed.
---

# GSAP Clone

Clone a GSAP-built site by reading its JS bundle as the source-of-truth, scaffolding an Astro + GSAP + Lenis replica, then visual-diffing until it matches.

## Why this skill exists

Describing GSAP animations in natural language loses information: the difference between `power3.out` and `expo.out` is invisible in words but obvious on screen. Same for `ScrollTrigger` `start: "top 80%"` vs `start: "top center"`. The only way to feel-match is to extract the actual configs from the bundle.

This skill is **decoupled** from `framer-clone`: if the source is a Framer site (detected by `framerusercontent.com` in HTML), stop and route the user to `framer-clone` instead.

## Workflow

Execute in order. Do NOT skip steps — each unlocks the next.

### 1. Verify it's a GSAP stack

Quick HTML probe before any download:

```bash
curl -sL -A "Mozilla/5.0" <URL> | grep -oE '(gsap|ScrollTrigger|lenis|framerusercontent)[^"]{0,40}' | sort -u
```

- ✅ `gsap.min.js`, `ScrollTrigger.min.js`, `lenis` → proceed
- ❌ `framerusercontent.com` → STOP, tell user to use `/framer-clone` skill
- ⚠️ Neither → ask user: site might be Webflow/custom — confirm before continuing

### 2. Fetch bundle

```bash
bash $SKILL_DIR/scripts/01-fetch-bundle.sh <URL> ./bundle
```

Downloads:
- `page.html`
- Every `<script src="...">` JS file (resolves relative URLs)
- Inline `<script>` blocks → `inline-scripts/NNN.js`

At the end it prints the **most likely animation file** (largest non-vendor `.js`).

### 3. Extract animation configs

```bash
node $SKILL_DIR/scripts/02-extract-animations.js ./bundle > animations.json
```

This parses every `.js` chunk and extracts:
- `gsap.to(selector, vars)` / `gsap.from(...)` / `gsap.fromTo(...)`
- `gsap.timeline({...})`
- `ScrollTrigger.create({...})`
- `new SplitType(...)` / `new Swiper(...)` / `new Lenis(...)`

Output schema per record:

```json
{
  "file": "script.min.js",
  "type": "to|from|fromTo|timeline|scrollTrigger|splitType|swiper|lenis",
  "selector": ".feature-image",
  "vars": { "y": 0, "opacity": 1, "duration": 1.2, "ease": "power3.out" },
  "scrollTrigger": { "trigger": ".feature", "start": "top 80%", "scrub": false }
}
```

Prefers Babel AST parse (`@babel/parser`) — falls back to bracket-matching regex if Babel deps not installed in the working dir.

**Rule:** never invent eases. If the bundle records `power3.out`, use `power3.out` — not `easeOut`.

### 4. Scaffold project

```bash
bash $SKILL_DIR/scripts/03-scaffold-project.sh ./output
```

Copies the starter template (Astro + Tailwind + GSAP + ScrollTrigger + Lenis + SplitType + Swiper) and runs `pnpm install`. Then:

1. Open `animations.json` and translate each record into `src/scripts/animations.ts`
2. Map selectors to Astro components in `src/components/`
3. Mirror the original HTML structure section-by-section
4. Wire Lenis at the layout level (config matches what `02-extract` recorded)

**Image strategy:** keep original CDN URLs in `<img src>` — don't download unless they're behind auth.

### 5. Visual diff loop (required)

```bash
node $SKILL_DIR/scripts/04-visual-diff.js <ORIGINAL_URL> http://localhost:4321 ./diff
```

Opens both URLs in parallel Chromium contexts, scrolls in 200px steps, screenshots, runs pixelmatch, and writes `report.html` with a side-by-side gallery and per-checkpoint similarity %.

**Target:** all checkpoints ≥ 95%. Iterate on lowest first. Common failure modes:

| Score | Likely cause |
|---|---|
| < 80% | Layout off — wrong section order, missing component |
| 80–92% | GSAP config off — wrong `start`, `scrub`, `ease`, or `pin` |
| 92–95% | Micro — Lenis lerp, font loading, image filter |

### 6. Edge cases

| Pattern | Implementation |
|---|---|
| Pinned section | `ScrollTrigger.create({ trigger, pin: true, start, end, scrub: 1 })` |
| Horizontal scroll | `gsap.to(track, { x: -100*(n-1) + '%', scrollTrigger: { pin, scrub } })` |
| SplitType char stagger | `new SplitType(el, { types: 'chars' })` then `gsap.from(el.chars, { stagger: 0.02 })` |
| Image clip-path reveal | `gsap.from(img, { clipPath: 'inset(100% 0 0 0)', duration: 1.1, ease: 'power4.out' })` |
| Lenis + ScrollTrigger sync | `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add((t) => lenis.raf(t*1000))` |
| Counter | `gsap.to({ n: 0 }, { n: target, onUpdate: () => el.textContent = Math.floor(this.targets()[0].n) })` |
| Marquee infinite | `gsap.to(strip, { xPercent: -50, repeat: -1, duration: 30, ease: 'none' })` |

See `references/gsap-patterns.md` for the full catalog.

## When to fall back

Some sites use proprietary GSAP plugins (`MorphSVG`, `DrawSVG`, `Flip`) that require Club GreenSock licenses. If you can't replicate after 3 visual-diff iterations and the gap traces to a missing plugin:

1. Record a 30s screen-capture of the broken section
2. Note the plugin in a TODO comment
3. Ask the user whether to ship the 90% match or pay for the plugin

Don't silently approximate — declare the gap.

## Quick commands reference

| Command | Purpose |
|---|---|
| `bash $SKILL_DIR/scripts/01-fetch-bundle.sh <URL>` | Download HTML + all JS chunks |
| `node $SKILL_DIR/scripts/02-extract-animations.js <dir>` | Parse bundle → animations.json |
| `bash $SKILL_DIR/scripts/03-scaffold-project.sh <out>` | Copy starter + install deps |
| `node $SKILL_DIR/scripts/04-visual-diff.js <orig> <local>` | Pixel-compare clone vs source |

## References

- `references/gsap-patterns.md` — 15 most common GSAP patterns with templates
- `references/scrolltrigger-recipes.md` — start/end/scrub/pin cheatsheet + Lenis sync
- `references/lenis-setup.md` — config, mobile disable, anchor scroll, easing
