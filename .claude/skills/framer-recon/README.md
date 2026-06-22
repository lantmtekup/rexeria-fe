# website-block-recon (framer-recon)

A Claude Code skill that captures a UI block from any live website and produces a clone-ready `spec.md` for **React + Tailwind + Framer Motion**.

The skill's job is analysis only — it does not generate component code. The output is a structured spec you can paste into v0.dev, Cursor, or Claude to generate the code itself.

## Install

1. Copy the entire `framer-recon/` folder into your Claude Code skills directory:
   ```bash
   # User-level skills
   cp -r framer-recon ~/.claude/skills/

   # Or project-local
   cp -r framer-recon ./.claude/skills/
   ```

2. Pre-install Python dependencies (optional — the script auto-installs on first run):
   ```bash
   pip install playwright
   playwright install chromium
   ```

3. Restart Claude Code so it picks up the new skill.

## Use

Just describe what you want to clone:

> "Clone the coaching plans block from https://perform.framer.website/"

> "Tôi muốn copy block hero của https://linear.app"

> "Reverse-engineer animation của block pricing trên https://example.com"

Claude will trigger the skill, ask for the block selector if needed, and run the full pipeline. You'll get a `recon-<name>/` folder with everything you need.

## What you get

```
recon-<name>/
├── screenshots/
│   ├── desktop-1440.png
│   ├── tablet-768.png
│   ├── mobile-375.png
│   └── desktop-fullpage.png
├── videos/
│   └── scroll-animation.webm
├── assets/                (images from the block)
├── raw/
│   ├── block.html              (outerHTML of the target block)
│   ├── computed.json           (full computed-styles tree)
│   ├── cdp-animations.json     (CDP animation capture — if --cdp used)
│   ├── extracted.json          (structured analysis data)
│   └── page.html               (full page HTML for context)
├── config.json
└── spec.md                ← the deliverable
```

`spec.md` ends with a copy-pasteable prompt section pre-tuned for **React + Tailwind + Framer Motion**.

## Run manually (skip Claude Code)

```bash
python scripts/run.py \
  --url https://perform.framer.website/ \
  --selector "#coaching" \
  --name perform-coaching \
  --cdp
```

Skip the video for faster runs:

```bash
python scripts/run.py --url ... --selector ... --name ... --no-video
```

Include CDP animation capture (recommended for animation-heavy sites):

```bash
python scripts/run.py --url ... --selector ... --name ... --cdp
```

Run one stage at a time:

```bash
python scripts/capture.py --url ... --selector ... --out recon-foo
python scripts/capture-cdp-animations.py --url ... --selector ... --out recon-foo
python scripts/extract.py --workspace recon-foo
python scripts/synthesize.py --workspace recon-foo
```

## Limitations

- **Bot protection** — sites behind Cloudflare etc. may reject the headless browser. If that happens, capture screenshots manually and run `extract.py` + `synthesize.py` against your inputs.
- **CDP captures CSS + WAAPI only** — GSAP animations that use `requestAnimationFrame` directly (instead of WAAPI) won't show up in CDP capture. Parse bundle JS for those. Canvas/WebGL animations are also invisible.
- **Animation detection is partly heuristic** — even with CDP, animations triggered by hover/click need manual interaction. Watch `videos/scroll-animation.webm` to catch those.
- **Responsive deltas are partial** — only desktop computed styles are extracted. The responsive table in spec.md needs visual comparison of the three screenshots to fill in tablet/mobile changes.

## Files

- `SKILL.md` — Main skill instructions (what Claude reads).
- `scripts/run.py` — One-shot orchestrator.
- `scripts/capture.py` — Playwright capture.
- `scripts/capture-cdp-animations.py` — CDP Animation domain capture.
- `scripts/extract.py` — Parse computed styles.
- `scripts/synthesize.py` — Build spec.md.
- `references/animation-extraction.md` — Deep dive on animations + Framer Motion translation.
- `references/easing-translation-table.md` — CSS ↔ GSAP ↔ Framer Motion easing translations.
- `references/reduced-motion-patterns.md` — `prefers-reduced-motion` fallback patterns.
- `references/spec-quality-checklist.md` — Self-check before handoff.
