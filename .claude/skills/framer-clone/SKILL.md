---
name: framer-clone
description: Clone Framer (or framer-motion / lenis / gsap) sites into a standalone Next.js + framer-motion + tailwindcss page. Extracts real timing/cubic-bezier values + per-breakpoint CSS (810/1200) from the source JS bundle instead of guessing. Pairs with `framer-recon` (does Playwright capture) and `framer-clone-host` (project-scoped CMS integration). Triggers — "clone Framer site", "replicate animation from <framer URL>", "scrape easing values", "rebuild Framer landing page", URLs containing framer.app or framer.website. Do NOT trigger for non-Framer/Motion sites — use generic recon instead.
---

# Framer Clone (standalone)

Clone a Framer-built site to a **standalone Next.js page**. For integrating the clone INTO an existing CMS/block-builder, use the project-scoped `framer-clone-host` skill afterwards.

Stack assumption: **Next.js 14 App Router + framer-motion + lenis + tailwindcss**. Other stacks (Vue/Svelte/CSS Modules) are out of scope — exit early and tell user.

## Why this skill exists

Bundle has the real numbers: `cubic-bezier(0.25, 1, 0.5, 1)`, `{ stiffness: 420, damping: 28 }`, per-breakpoint `font-size`. Natural-language descriptions and static computed-style scrapes lose them. This skill extracts them programmatically.

## Workflow

### 0. Use recon output (recommended)

If `framer-recon` already ran, pass workspace as `--recon-from`:

```bash
# user runs recon first
python3 .claude/skills/framer-recon/scripts/run.py --url <URL> --selector <SEL> --name <NAME>
# (run from project root — recon is project-scoped; if installed user-scope, adjust path)

# then this skill consumes it
# (you'll read /tmp/recon/recon-<NAME>/spec.md + extracted.json)
```

If `/tmp/recon/recon-<NAME>/` missing, ask user to run recon — DON'T re-capture (recon is the capture layer).

### 1. Pull the JS bundle

```bash
bash $SKILL_DIR/scripts/extract-framer-bundle.sh '<URL>' ./framer-bundle
```

Verify framer-motion / GSAP / Lenis / Lottie via:
- `grep -l "framer-motion\|motion\[" framer-bundle/*.js`
- `grep -l "ScrollTrigger\|gsap" framer-bundle/*.js` (→ `references/scroll-animations.md`)
- `grep -l "lenis\|smoothWheel" framer-bundle/*.js`
- `*.json` body with `"v"` + `"fr"` → Lottie

### 2. Extract animations.json

```bash
node $SKILL_DIR/scripts/extract-animations.js ./framer-bundle > animations.json
```

AST-walks `{ initial, animate, transition }`, `{ whileInView, viewport }`, `keyframes`, variant objects.

**Known limitation:** minified Framer bundles mangle variable names. If extraction returns < expected entries, fall back to runtime CSS (`@keyframes` declarations) + manual video inspection. Mark inferred values with `// inferred from video, not bundle` in code.

**Rule:** never invent easing values. Missing in `animations.json` → add `TODO` comment, don't guess.

### 2b. Extract @media breakpoint deltas

Skipping = "looks right at desktop, broken on mobile" (#1 failure mode).

```bash
grep -hE "@media[^{]+\{" framer-bundle/*.mjs framer-bundle/page.html | sort -u
grep -oE "preset-<className>[^}]+font-size:[^;]+;[^}]+" framer-bundle/chunk-*.mjs
```

Record per-token `{ desktop, tablet, mobile }`. Framer breakpoints: 1200 / 810 (NOT 768). Full protocol in `references/responsive-cloning.md`.

### 3. Scaffold standalone Next.js

```bash
cp -R $SKILL_DIR/assets/starter-template/* .
pnpm install   # match user's pkg manager
```

Stack: Next.js 14 App Router + framer-motion + lenis + tailwindcss. Lenis wired in `components/SmoothScroll.tsx`, MotionSection wrapper in `components/MotionSection.tsx`.

For **CMS/block integration** instead: stop here and invoke `framer-clone-host` (project-scoped). For the rexerai repo it scaffolds a native single-file block (`block-editor/blocks/<Name>.tsx` + BlockDef registry) and **rewrites animation to GSAP** (`useBlockMotion`, contract R1–R6) — see its `references/rexerai-block-integration.md` + `references/gsap-motion-contract.md`. If the clone is headed for rexerai, don't over-invest in framer-motion section entrances here — they'll be re-authored in GSAP. Per-character text stagger is the one thing that may carry over.

**Asset strategy:** keep `framerusercontent.com` URLs (CDN). Only download non-CDN or `.lottie`/`.mp4` assets. For production deploy, see `references/image-strategy.md` (Next.js Image migration + custom CDN handoff).

### 4. Code in two phases

1. **Layout** — translate HTML → JSX/Tailwind. Match widths, gaps, gridTemplate, typography. NO motion yet.
2. **Animation** — wrap entries from `animations.json` in `<motion.div>` with recorded initial/animate/transition.

Keeps diffs small while iterating animation.

**MANDATORY rules** before writing CSSProperties:

1. **Inside `clamp()`: use `cqi`, NEVER `vw`** when block runs inside a CMS canvas iframe. Standalone Next.js page (this skill's path) can use `vw` — viewport === document. (`references/responsive-cloning.md` §8 Rule 1).
2. **Accessibility from start** (`references/accessibility-checklist.md`) — `prefers-reduced-motion`, focus rings, ARIA labels, WCAG AA contrast. Not optional. Add `useReducedMotion()` to every motion component.
3. **Image strategy** (`references/image-strategy.md`) — `next/image` for static, `<img loading="lazy">` for CDN, `fetchpriority="high"` on hero LCP image.

### 4b. Mobile sanity (BLOCKING)

Load clone at 390px BEFORE visual-diff. Eyeball check beats pixel diff for layout breaks. Anti-patterns in `references/responsive-cloning.md` §9.

### 4c. Token verify (BLOCKING — past bugs)

**R4 — `verify-tokens.js` exit 0 + visual-diff ≥85% pixel + ≥95% layout are BLOCKING. Don't claim "done" without both passing.**

### 🛑 R6 — Animation pattern recognition from framer-names (past bug)

**Bundle extraction script (extract-animations.js) catches `{initial, animate, transition}` objects but MISSES Framer's COMPONENT-LEVEL animations** (Ticker, Marquee, Carousel, etc) that use built-in framer modules. These show as `data-framer-name` in recon.

**Before treating block as "static layout + entrance animation," grep block.html for animation-component framer-names:**

```bash
grep -oE 'data-framer-name="(Ticker|Marquee|Carousel|Slider|Loop|Infinite|Auto[^"]*)"' \
  /tmp/recon/recon-<NAME>/raw/block.html | sort -u
```

If matches → bundle has a component variant. Find config:

```bash
# Example: Image Ticker found → search for its config
grep -oE 'Image Ticker[^}]+}' /tmp/<bundle>/*.mjs | head -1
# yields: f(Ht, {direction:'top', gap:16, hoverFactor:1, fadeOptions:{fadeWidth:25,...}})
```

Translate to React:
- Vertical/horizontal infinite scroll container with `overflow: hidden`
- Inner track `translateY/X` animated `0 → -50%` infinite (duplicate items 2× for seamless loop)
- Edge fade mask (`-webkit-mask-image: linear-gradient(...)`)
- Pause on hover (`onMouseEnter` → pause animation)

**Past bug (this skill, 2026-05-20):** Linea Portfolio block had `Image Ticker` framer-name — extracted as static 3-col grid + fade-up. Animation faithful=0. Rework cost: 3h.

→ When framer-name matches Ticker/Marquee/etc pattern, NEVER scaffold as static grid. Implement infinite scroll first, verify motion before claim done.

### 🛑 R5 — Proof-of-completion (HARD GATE, no exceptions)

LLMs (you, Claude) WILL skip steps if rules are text-only. Past sessions: claimed "done" after `verify-tokens` pass, skipped video + visual-diff → shipped wrong animations + layout. Time lost: ~3h iteration.

**Before claiming "block done" you MUST produce ALL FOUR artifacts. No "type-check pass = good enough":**

1. ✅ **`verify-tokens.js` exit 0** — output paste vào reply ("Findings: 0 WARN")
2. ✅ **Animation log filled in spec.md from BUNDLE (primary) or VIDEO (fallback)**:
   - **Primary (Framer/Motion sites):** Step 1+2 of this skill — `extract-framer-bundle.sh <URL>` + `extract-animations.js <dir> > animations.json`. AST extracts real `cubic-bezier` + duration + initial/animate values from JS. Copy entries into spec.md animation log verbatim. THIS IS AUTOMATED, NO VIDEO NEEDED.
   - **Fallback only if bundle minified/encrypted or non-Framer site:** open `videos/scroll-animation.webm` + transcribe manually.
   - KO copy-paste empty template. KO invent easing values.
3. ✅ **Visual-diff output ≥85% pixel @ desktop 1440** — paste similarity score per checkpoint
4. ✅ **Visual-diff output ≥85% pixel @ mobile 390** — same

If ANY of the 4 missing → reply with exactly: `BLOCKED: missing artifact #N — running now` and run it. Do NOT proceed.

If artifact ko thu thập được (ví dụ Playwright env down) → reply: `BLOCKED: artifact #N unrunnable, reason: <X>. Recommend: <human-action>.` User decides.

**Past failures justify this rule** — checklist alone không đủ. Artifact gate forces actual execution.

After coding, check scaffolded component uses the actual recon tokens:

```bash
node $SKILL_DIR/scripts/verify-tokens.js \
  --recon /tmp/recon/recon-<NAME> \
  --component ./path/to/component.tsx
```

Output: WARN (missing significant tokens) + INFO (missing minor spacing). **Exit code 1 = drift, MUST fix before visual-diff.**

Catches: typo'd font sizes (174 → 184), wrong color (`#0c0c0c` → `#000000`), missing initial `scale(0.9)` from inline-animation-hints.

**Known gap:** script catches MISSING tokens, NOT EXTRA invented fields (e.g. a content field not in recon). Mitigate by deriving `defaultContent` (BlockDef) / VI-EN defaults strictly from recon — see `framer-clone-host/references/rexerai-block-integration.md` §3.

### 5. Visual diff loop (BLOCKING per R4)

3 viewports — not just one:

```bash
for vw in 1440 900 390; do
  node $SKILL_DIR/scripts/visual-diff.js --viewport=${vw}x900 <ORIGINAL_URL> http://localhost:3000
done
```

**Realistic targets** (pure pixelmatch on font-rendered content overestimates breaks):

| Metric | Target | Why |
|---|---|---|
| Layout diff (named elements bbox) | ≥ 98% | Catches column widths, padding, spacing |
| Pixel diff per checkpoint | ≥ 85% | Allow font anti-aliasing (Mac vs Linux 5-10% noise), shadow blur |
| Animation timing | Manual video review | Pixelmatch only sees end-states, not motion |

| Score | Likely cause |
|---|---|
| <80% pixel | Layout wrong (columns/missing section/mobile flip) |
| 80–92% | Animation timing or mobile padding mismatch |
| 92–98% | Micro (font render, shadow blur) — usually acceptable |

### 6. Verify before commit

```bash
yarn tsc --noEmit                        # type-check
yarn lint                                # lint
# Run dev server, manually test:
# - keyboard nav (Tab through interactive elements)
# - prefers-reduced-motion (DevTools Rendering panel)
# - 3 viewports + scroll behavior
```

### 7. Git commit pattern

Suggested 2 commits:
1. `feat(clone): scaffold <name> layout + structure`
2. `feat(clone): apply <name> animations + tokens`

Keeps animation iteration diffs reviewable.

## When to fall back

After 3 diff iterations still <85% pixel + <95% layout AND `animations.json` doesn't explain it:

1. Record 30s screen-cap of original (`cmd+shift+5`)
2. Attach to TODO comment
3. Ask user: ship as-is or invest more time. Declare the gap.

## Quick commands

| Command | Purpose |
|---|---|
| `bash $SKILL_DIR/scripts/extract-framer-bundle.sh '<URL>'` | Download JS chunks (URL must be quoted) |
| `node $SKILL_DIR/scripts/extract-animations.js <dir>` | Parse → animations.json |
| `node $SKILL_DIR/scripts/visual-diff.js <orig> <local>` | Pixel-compare |
| `node $SKILL_DIR/scripts/verify-tokens.js --recon <dir> --component <file>` | Token drift check vs recon |
| `cp -R $SKILL_DIR/assets/starter-template/* .` | Copy boilerplate |

## References

- `references/framer-motion-patterns.md` — 15 patterns + detect heuristics + edge cases
- `references/responsive-cloning.md` — breakpoints, per-breakpoint extraction, mobile anti-patterns, sizing rules
- `references/accessibility-checklist.md` — a11y enforcement (reduced-motion, focus, ARIA, contrast)
- `references/image-strategy.md` — Next.js Image migration, CDN handoff, LCP optimization
- `references/scroll-animations.md` — GSAP / ScrollTrigger / Lenis recipes
- `references/common-easings.md` — Framer easing curve cheatsheet (verified for Framer Motion v11.x as of 2026-01)
