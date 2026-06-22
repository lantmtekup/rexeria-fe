#!/usr/bin/env python3
"""
synthesize.py — Combine captured assets + extracted JSON into a final spec.md.

Reads:  <workspace>/raw/extracted.json + <workspace>/config.json + screenshots/ + videos/
Writes: <workspace>/spec.md
"""

import argparse
import json
from pathlib import Path


DEFAULT_STACK = "React + Tailwind + Framer Motion"


def load_config(workspace: Path) -> dict:
    cfg_path = workspace / "config.json"
    if cfg_path.exists():
        return json.loads(cfg_path.read_text(encoding="utf-8"))
    return {"url": "(unknown)", "selector": "(unknown)", "target_stack": DEFAULT_STACK}


def fmt_observed_entrance(obs: dict) -> str:
    """Render auto-detected entrance animation from video frame analysis."""
    if not obs:
        return "_No video provided — re-run with `--video` to enable entrance auto-detection._"
    if obs.get("warning"):
        return f"⚠️ {obs['warning']}"
    return (
        f"**Auto-detected from video frames:**\n\n"
        f"- Trigger: `{obs.get('trigger')}`\n"
        f"- Property: `{obs.get('property_observed')}`\n"
        f"- Duration: **{obs.get('duration_ms')}ms**\n"
        f"- Frames: {obs.get('start_frame')} → {obs.get('end_frame')} @ {obs.get('fps')}fps\n"
        f"- Easing: `{obs.get('easing_guess')}`\n"
        f"- Sampled element: `{obs.get('sampled_element')}`\n\n"
        f"> {obs.get('note', '')}"
    )


def fmt_inferred_grid(grid: dict) -> str:
    """Render the inferred grid layout — row × col placement table.
    Source-of-truth for framer-clone-host R15 spacerBefore values."""
    if not grid or not grid.get("rows"):
        return "_No repeating layout pattern detected (need ≥ 2 elements with same data-framer-name)._"

    out = []
    out.append(
        f"**Primary element:** `{grid['primary_element']}` × {grid['total_count']} items"
    )
    out.append(
        f"**Stride:** `{grid.get('stride_px')}px` (item width `{grid.get('item_width_px')}px` + gap `{grid.get('gap_px')}px`)"
    )
    out.append("")
    out.append("**Row × position table** (spacer_after_cols → schema `spacerBefore` of NEXT item):")
    out.append("")
    out.append("| Row | Items | Per-item placement (12-col grid; values = `spacerBefore` for NEXT item) |")
    out.append("|-----|-------|--------------------|")
    for r in grid["rows"]:
        parts = []
        for it in r["items"]:
            sp = (
                f", spacer_after={it['spacer_after_cols']} cols"
                if it.get("spacer_after_cols") is not None and it["spacer_after_cols"] > 0
                else ""
            )
            parts.append(
                f"col {it.get('col_start_grid')}{sp}"
            )
        out.append(f"| {r['row']} | {r['items_count']} | " + "; ".join(parts) + " |")
    out.append("")
    out.append(
        "> 🚨 **R15 — framer-clone-host MUST use these `spacer_after_cols` values as defaults** for the schema's `spacerBefore` field on the NEXT item in flow. Computing spacer from pixel widths without including gap → consistent off-by-one bug (e.g. 670px / 81px = 8 → wrong; (670+36)/(81+36) = 6 → right)."
    )
    return "\n".join(out)


def fmt_fonts_required(fonts: dict) -> str:
    """Custom font import callout. Block-level fonts that aren't system
    fallbacks MUST be loaded — without `@import` the clone falls back to
    system sans-serif and renders thinner/different than source."""
    if not fonts:
        return "_No font data extracted._"
    custom = fonts.get("custom", [])
    system = fonts.get("system", [])
    if not custom:
        sys_names = ", ".join(f"`{f['family']}`" for f in system) or "none"
        return f"_Only system fonts detected ({sys_names}) — no import needed._"

    lines = ["**🚨 Custom fonts — MUST import or clone will fall back to system sans-serif.**\n"]
    lines.append("| Family | Weights seen |")
    lines.append("|--------|--------------|")
    for f in custom:
        weights = ", ".join(f["weights_seen"]) or "400"
        lines.append(f"| `{f['family']}` | {weights} |")

    url = fonts.get("google_fonts_import_url")
    if url:
        lines.append("")
        lines.append("**Suggested Google Fonts import** (paste into component `<style>` block FIRST line):")
        lines.append("```css")
        lines.append(f"@import url('{url}');")
        lines.append("```")
        lines.append("")
        lines.append("> If Google Fonts doesn't host the family (proprietary foundry), download `.woff2` and host locally / pick a near-match from Google Fonts and flag the substitution.")

    if system:
        lines.append("")
        lines.append("_System-safe fallbacks already in stack: " + ", ".join(f"`{f['family']}`" for f in system) + "._")
    return "\n".join(lines)


def fmt_typography_table(typography: list) -> str:
    if not typography:
        return "_No typography detected — block may have no visible text or capture failed._"
    rows = ["| # | Sample | Font | Size | Weight | Line-height | Letter-spacing | Color |",
            "|---|--------|------|------|--------|-------------|----------------|-------|"]
    for i, t in enumerate(typography[:15]):
        sample = (t.get("sample_text") or "").replace("|", "\\|")[:40]
        rows.append(
            f"| {i+1} | {sample} | {t.get('font_family','')} | "
            f"{t.get('font_size','')} | {t.get('font_weight','')} | "
            f"{t.get('line_height','')} | {t.get('letter_spacing','')} | "
            f"`{t.get('color','')}` |"
        )
    return "\n".join(rows)


def fmt_color_list(colors: list, label: str) -> str:
    if not colors:
        return f"_No {label} colors detected._"
    return "\n".join(f"- `{c['color']}` (used {c['count']}×)" for c in colors[:10])


def fmt_spacing(spacing: dict) -> str:
    parts = []
    label_map = {"paddings": "Paddings", "margins": "Margins", "gaps": "Gaps"}
    for key, values in spacing.items():
        if values:
            parts.append(f"**{label_map.get(key, key.capitalize())}**: " +
                         ", ".join(f"`{v['value']}`" for v in values[:8]))
    return "\n\n".join(parts) if parts else "_No spacing data._"


_RESPONSIVE_ASPECTS = [
    ("Display", "display"),
    ("Flex direction (root)", "flex_direction"),
    ("Grid columns", "grid_template_columns"),
    ("Gap", "gap"),
    ("Width", "width"),
    ("Max-width", "max_width"),
    ("Padding (block root)", "padding"),
    ("Heading font-size", "heading_size"),
    ("Heading weight", "heading_weight"),
    ("Body font-size", "body_size"),
]


def fmt_responsive_table(deltas: dict) -> str:
    """3-viewport table from extract.py's responsive_deltas. Bolds aspects
    that differ across breakpoints + appends a delta bullet list."""
    if not deltas or "desktop-1440" not in deltas:
        return (
            "_3-viewport computed.json missing — re-run capture.py to populate. "
            "Until then, eyeball deltas from screenshots._\n\n"
            "| Aspect | Desktop (1440) | Tablet (768) | Mobile (375) |\n"
            "|--------|---------------|--------------|--------------|\n"
            "| Layout direction | _fill in_ | _fill in_ | _fill in_ |\n"
            "| Heading size | _fill in_ | _fill in_ | _fill in_ |\n"
            "| Padding (block) | _fill in_ | _fill in_ | _fill in_ |"
        )

    d = deltas.get("desktop-1440", {})
    t = deltas.get("tablet-768", {})
    m = deltas.get("mobile-375", {})

    rows = [
        "| Aspect | Desktop (1440) | Tablet (768) | Mobile (375) |",
        "|--------|---------------|--------------|--------------|",
    ]
    diffs = []
    for label, key in _RESPONSIVE_ASPECTS:
        dv = d.get(key) or "—"
        tv = t.get(key) or "—"
        mv = m.get(key) or "—"
        differs = len({dv, tv, mv}) > 1
        cell_label = f"**{label}**" if differs else label
        rows.append(f"| {cell_label} | `{dv}` | `{tv}` | `{mv}` |")
        if differs:
            diffs.append(f"- **{label}**: desktop `{dv}` → tablet `{tv}` → mobile `{mv}`")

    out = "\n".join(rows)
    if diffs:
        out += "\n\n**Per-breakpoint deltas (auto-extracted — bold above means values differ):**\n\n" + "\n".join(diffs)
    else:
        out += "\n\n_No deltas detected — block looks identical across breakpoints (suspicious; verify screenshots)._"

    heading_sample = d.get("heading_sample")
    if heading_sample:
        out += f"\n\n_Heading sample at desktop: `\"{heading_sample}\"` ({d.get('heading_size')})._"
    return out


_DIFF_PROP_LABELS = {
    "display": "display",
    "flex-direction": "flex-direction",
    "justify-content": "justify",
    "align-items": "align",
    "gap": "gap",
    "grid-template-columns": "grid-cols",
    "width": "width",
    "height": "height",
    "max-width": "max-w",
    "padding": "padding",
    "margin": "margin",
    "font-size": "font-size",
    "font-weight": "weight",
    "line-height": "lh",
    "text-align": "text-align",
    # Promoted from unnamed descendants — the wrapper carrying text
    # constraints + the actual text node's typography.
    "_wrapper_width": "↳ inner wrapper width",
    "_wrapper_max-width": "↳ inner wrapper max-w",
    "_wrapper_padding": "↳ inner wrapper padding",
    "_wrapper_margin": "↳ inner wrapper margin",
    "_text_font-size": "↳ text font-size",
    "_text_font-weight": "↳ text weight",
    "_text_line-height": "↳ text lh",
    "_text_letter-spacing": "↳ text letter-spacing",
    "_text_color": "↳ text color",
    "_text_text-align": "↳ text align",
}


def fmt_framer_element_deltas(deltas: dict, max_elements: int = 30) -> str:
    """Per-element diff table — only elements where ≥1 tracked prop
    differs across viewports. Sorted by # of changed props desc
    (most reactive elements first)."""
    if not deltas:
        return "_No per-element deltas detected (need 3-viewport capture)._"

    # Sort: most changed first, then by path length desc (deepest first)
    items = sorted(
        deltas.items(),
        key=lambda kv: (-len(kv[1]["changed_props"]), -len(kv[0])),
    )

    truncated = len(items) > max_elements
    items = items[:max_elements]

    out_lines = []
    for path, info in items:
        rows = info["viewports"]
        changed = info["changed_props"]
        text = ""
        for r in rows.values():
            if r.get("_text"):
                text = f' _"{r["_text"]}"_'
                break
        out_lines.append(f"### `{path}`{text}")
        out_lines.append(f"_Changed: {', '.join(_DIFF_PROP_LABELS.get(p, p) for p in changed)}_\n")
        out_lines.append("| Prop | Desktop (1440) | Tablet (768) | Mobile (375) |")
        out_lines.append("|------|---------------|--------------|--------------|")
        for prop in changed:
            label = _DIFF_PROP_LABELS.get(prop, prop)
            d = rows.get("desktop-1440", {}).get(prop) or "—"
            t = rows.get("tablet-768", {}).get(prop) or "—"
            m = rows.get("mobile-375", {}).get(prop) or "—"
            out_lines.append(f"| `{label}` | `{d}` | `{t}` | `{m}` |")
        out_lines.append("")

    if truncated:
        out_lines.append(f"_…{len(deltas) - max_elements} more elements omitted._")

    return "\n".join(out_lines)


def fmt_cdp_animations(workspace: Path) -> str:
    """Render high-fidelity animation log from CDP capture, if present.

    CDP captures CSS animations, CSS transitions, and Web Animations API calls
    (which Framer Motion uses under the hood). Each animation has REAL timing
    config — not estimated from video. This is far more accurate than the
    manual log template, when available.

    Returns empty string if no cdp-animations.json — caller falls back to the
    manual log template in fmt_animation().
    """
    cdp_path = workspace / "raw" / "cdp-animations.json"
    if not cdp_path.exists():
        return ""

    try:
        data = json.loads(cdp_path.read_text(encoding="utf-8"))
    except Exception:
        return ""

    anims = data.get("animations", [])
    if not anims:
        return ""

    lines = []
    lines.append("### Auto-captured animation log (from CDP)")
    lines.append("")
    lines.append(
        f"_Captured {data.get('significant_animations', len(anims))} significant "
        f"animation(s) via Chrome DevTools Protocol at "
        f"{data.get('playback_rate', 0.25)}× playback. Includes CSS animations, "
        f"CSS transitions, and Web Animations API calls (Framer Motion uses WAAPI). "
        f"GSAP/rAF animations NOT captured here — check `videos/scroll-animation.webm` "
        f"and bundle JS for those._"
    )
    lines.append("")
    lines.append("| # | Element | Type | Duration | Delay | Easing | Iterations |")
    lines.append("|---|---------|------|---------:|------:|--------|-----------:|")

    for i, a in enumerate(anims[:40], 1):
        sel = a.get("selector") or "—"
        # Truncate long selectors so the table doesn't blow out
        if len(sel) > 50:
            sel = sel[:47] + "..."
        atype = (a.get("type") or "?").replace("CSS", "CSS-")
        src = a.get("source") or {}
        dur = src.get("duration")
        dur_str = f"{int(dur)}ms" if isinstance(dur, (int, float)) and dur > 0 else "—"
        delay = src.get("delay")
        delay_str = f"{int(delay)}ms" if isinstance(delay, (int, float)) and delay > 0 else "0"
        easing = src.get("easing") or "—"
        if len(easing) > 30:
            easing = easing[:27] + "..."
        iters = src.get("iterations")
        iters_str = ("∞" if iters and iters > 1e6 else
                     f"{int(iters)}" if isinstance(iters, (int, float)) else "—")
        lines.append(f"| {i} | `{sel}` | {atype} | {dur_str} | {delay_str} | `{easing}` | {iters_str} |")

    if len(anims) > 40:
        lines.append(f"\n_... and {len(anims) - 40} more. See `raw/cdp-animations.json` for the full list._")

    # Show keyframes for the first 3 CSS animations that have them
    keyframed = [a for a in anims if (a.get("source") or {}).get("keyframes_rule")][:3]
    if keyframed:
        lines.append("\n#### Keyframes detail (first 3 with `@keyframes` data)\n")
        for a in keyframed:
            kf = a["source"]["keyframes_rule"]
            name = kf.get("name") or "(unnamed)"
            sel = a.get("selector") or "—"
            lines.append(f"**`{sel}` — `@keyframes {name}`**")
            lines.append("```")
            for k in (kf.get("keyframes") or [])[:8]:
                off = k.get("offset", "—")
                easing_k = k.get("easing") or ""
                lines.append(f"  {off}: easing={easing_k}")
            lines.append("```\n")

    libs = data.get("library_fingerprint") or {}
    if libs:
        lines.append(f"\n**Runtime library globals detected:** {', '.join(libs.keys()) or 'none'}")

    lines.append("")
    lines.append(
        "> **Easing translation:** if you see a `cubic-bezier(...)` value above, copy it "
        "verbatim into Framer Motion's `ease` array (e.g. `ease: [0.22, 1, 0.36, 1]`). "
        "See `references/easing-translation-table.md` for the full mapping table."
    )
    lines.append("")
    lines.append(
        "> **Reduced-motion fallback:** every animation above needs a `prefers-reduced-motion` "
        "alternative. See `references/reduced-motion-patterns.md`."
    )
    return "\n".join(lines)


def fmt_animation(fp: dict) -> str:
    lines = []

    libs = []
    if fp.get("framer_site"):
        libs.append("**Framer site** (uses `framerusercontent.com` assets — likely built in Framer with Motion under the hood)")
    if fp.get("framer_motion"):
        libs.append("**Framer Motion** (`data-framer-*` attributes present)")
    if fp.get("gsap"):
        libs.append("**GSAP**")
    if fp.get("aos"):
        libs.append("**AOS** (`data-aos` attributes)")
    if fp.get("lottie"):
        libs.append("**Lottie**")

    if libs:
        lines.append("**Detected:** " + "; ".join(libs))
    else:
        lines.append("**Detected:** none — likely vanilla CSS transitions/animations.")

    if fp.get("css_transitions"):
        lines.append("\n**Inline CSS transitions found:**")
        for t in fp["css_transitions"][:8]:
            lines.append(f"- `{t['selector_hint']}` → `{t['value']}`")

    if fp.get("css_animations"):
        lines.append("\n**Inline CSS animations found:**")
        for a in fp["css_animations"][:8]:
            lines.append(f"- `{a['selector_hint']}` → `{a['value']}`")

    lines.append(
        "\n> ⚠️ Static CSS inspection only catches part of the picture. "
        "**Watch `videos/scroll-animation.webm` frame-by-frame** to document each animation."
    )

    lines.append("\n### Animation log\n")
    lines.append("Fill in one block per distinct animation observed. Mark estimated values with `// estimated`.\n")
    lines.append("```")
    lines.append("Animation 1:")
    lines.append("  Element:   <e.g. .pricing-card>")
    lines.append("  Trigger:   <scroll-into-view | hover | on-load | click>")
    lines.append("  Property:  <opacity 0→1 + translateY 30px→0>")
    lines.append("  Duration:  <ms>")
    lines.append("  Easing:    <ease-out | cubic-bezier(0.22,1,0.36,1) | spring(stiffness, damping)>")
    lines.append("  Stagger:   <ms between siblings, if multiple>")
    lines.append("  Delay:     <ms before start, if any>")
    lines.append("```")
    return "\n".join(lines)


def _fmt_layout_section(layout: dict, label_map: dict) -> str:
    rows = []
    for k, v in layout.items():
        if k == "inner_layout":
            continue
        if v:
            rows.append(f"- **{label_map.get(k, k)}:** `{v}`")
    return "\n".join(rows) if rows else "_No layout data._"


def fmt_layout(layout: dict) -> str:
    label_map = {
        "tag": "Tag",
        "framerName": "Framer name",
        "display": "Display",
        "flex_direction": "Flex direction",
        "justify_content": "Justify content",
        "align_items": "Align items",
        "gap": "Gap",
        "grid_template_columns": "Grid columns",
        "grid_template_rows": "Grid rows",
        "width": "Width",
        "max_width": "Max width",
        "padding": "Padding",
        "child_count": "Direct child count",
    }
    out = ["### Root\n", _fmt_layout_section(layout, label_map)]
    inner = layout.get("inner_layout")
    if inner:
        out.append(
            "\n\n### Inner layout (first multi-child descendant)\n"
            "_Skill drilled past single-child wrappers to find the meaningful "
            "container — this is usually where the cards/items live._\n"
        )
        out.append(_fmt_layout_section(inner, label_map))
    return "\n".join(out)


def _fmt_animation_pattern_alert(patterns: list) -> str:
    """High-visibility callout at top of spec.md when bundle has Ticker/
    Marquee/etc framer-names. User MUST verify expected motion before
    scaffolding — past bug: built static grid instead of vertical ticker."""
    if not patterns:
        return (
            "## ⚠️  Animation pattern check\n\n"
            "_No infinite/scroll-linked patterns detected. Likely "
            "static layout + entrance animation. Proceed normally._"
        )
    lines = [
        "## 🚨 ANIMATION PATTERN DETECTED — verify BEFORE scaffolding\n",
        "Block has framer-names matching motion patterns. This is NOT a static layout.",
        "**Confirm with user what the expected motion is BEFORE writing any component code.**\n",
        "| Framer name | Keyword | Meaning |",
        "|---|---|---|",
    ]
    for p in patterns:
        lines.append(
            f"| `{p['name']}` | `{p['keyword']}` | {p['meaning']} |"
        )
    lines.append(
        "\n**Next step:** open `videos/scroll-animation.webm` (re-run "
        "recon with `--video` if skipped) OR open source URL in browser "
        "to OBSERVE motion. Then describe expected behavior to user. "
        "DO NOT scaffold as static grid/list."
    )
    return "\n".join(lines)


def fmt_framer_names(names: list) -> str:
    if not names:
        return "_No `data-framer-name` attributes found. Block likely not built in Framer._"
    rows = ["| `data-framer-name` | Tag | Depth | Children |",
            "|---|---|---|---|"]
    for n in names[:30]:
        rows.append(
            f"| `{n['name']}` | {n['tag']} | {n['depth']} | {n['child_count']} |"
        )
    note = (
        "\n> Use these names to identify substructure — they're more reliable than "
        "CSS classes (which are auto-hashed like `framer-oddlcj`)."
    )
    return "\n".join(rows) + note


def fmt_inline_hints(hints: list) -> str:
    if not hints:
        return "_No inline transform/opacity/will-change found. Block has no JS-driven initial animation states._"
    lines = [
        "_Initial animation states baked into inline `style=\"...\"` "
        "by Framer Motion / other libraries. Computed style normalizes these "
        "away — these are the smoking-gun values for animation reconstruction._\n"
    ]
    for h in hints[:20]:
        label = h.get("framerName") or h.get("classes") or h.get("tag")
        props_str = ", ".join(f"`{p['prop']}: {p['value']}`" for p in h["props"])
        lines.append(f"- **{label}** (depth {h['depth']}): {props_str}")
    return "\n".join(lines)


def list_screenshots(workspace: Path) -> str:
    shots = sorted((workspace / "screenshots").glob("*.png"))
    if not shots:
        return "_No screenshots captured._"
    return "\n".join(f"- `screenshots/{s.name}`" for s in shots)


def list_videos(workspace: Path) -> str:
    vids = sorted((workspace / "videos").glob("*.webm")) + sorted((workspace / "videos").glob("*.mp4"))
    if not vids:
        return "_No videos captured (--no-video or capture failed)._"
    return "\n".join(f"- `videos/{v.name}`" for v in vids)


def build_ready_prompt(cfg: dict, layout: dict, typography: list, colors: dict, fp: dict) -> str:
    """Copy-pasteable prompt — adapts animation guidance to target_stack
    (no Framer Motion / no Tailwind variants supported, fix #7)."""
    primary_font = typography[0].get("font_family") if typography else "Inter"
    primary_bg = colors["backgrounds"][0]["color"] if colors["backgrounds"] else "#ffffff"
    primary_text = colors["text_colors"][0]["color"] if colors["text_colors"] else "#000000"

    stack = (cfg.get("target_stack") or DEFAULT_STACK).lower()
    is_framer_source = fp.get("framer_motion") or fp.get("framer_site")
    stack_excludes_framer_motion = "no framer motion" in stack or "no framer-motion" in stack
    stack_excludes_tailwind = "no tailwind" in stack

    if stack_excludes_framer_motion:
        animation_note = (
            "Target stack excludes Framer Motion. Use `IntersectionObserver` + CSS "
            "transitions to replicate scroll-triggered entrance animations. Pattern:\n"
            "```\n"
            "const [visible, setVisible] = useState(false);\n"
            "useEffect(() => { const io = new IntersectionObserver(([e]) => "
            "{ if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, "
            "{ threshold: 0.3 }); io.observe(ref.current); return () => io.disconnect(); }, []);\n"
            "// style: transform: visible ? 'scale(1)' : 'scale(0.9)', "
            "transition: 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)'\n"
            "```"
        )
    elif is_framer_source:
        animation_note = (
            "The original uses Framer Motion. Replicate the feel with `motion.div` + `whileInView` for scroll triggers, "
            "and use `transition={{ duration, ease: [0.22, 1, 0.36, 1] }}` as a default tween. Use `staggerChildren` "
            "on parent variants for grid/list animations."
        )
    else:
        animation_note = (
            "Use Framer Motion for animations. Wrap animated elements in `motion.div`, use `whileInView` with "
            "`viewport={{ once: true, amount: 0.3 }}` for scroll triggers, and `transition={{ duration: 0.6, "
            "ease: [0.22, 1, 0.36, 1] }}` as a sensible default."
        )

    if stack_excludes_tailwind:
        responsive_note = (
            "Use plain CSS / CSS Modules / styled-components. Mobile-first media "
            "queries: `@media (min-width: 768px)` cho tablet, `@media (min-width: 1200px)` "
            "cho desktop (match Framer's breakpoints)."
        )
    else:
        responsive_note = (
            "Match the three screenshots exactly at 1440 / 768 / 375. Use Tailwind's "
            "default breakpoints (`md:` ≥ 768px, `lg:` ≥ 1024px). Mobile-first."
        )

    return f"""Build a {cfg.get('target_stack', DEFAULT_STACK)} component that clones the block from {cfg.get('url')}.

**Reference assets** (attach these to the prompt or upload them alongside this message):
- `screenshots/desktop-1440.png` — desktop appearance, source of truth for layout
- `screenshots/tablet-768.png` — tablet breakpoint
- `screenshots/mobile-375.png` — mobile breakpoint
- `videos/scroll-animation.webm` — animation reference

**Layout:**
- {layout.get('display', '?')} layout, {layout.get('grid_template_columns') or layout.get('flex_direction') or 'see spec'}
- Max-width: {layout.get('max_width') or 'fluid'}
- Gap: {layout.get('gap') or 'see spec'}
- Padding: {layout.get('padding') or 'see spec'}

**Typography:**
- Primary font: `{primary_font}` (load via Google Fonts if available, otherwise pick a close substitute and flag it)
- {len(typography)} distinct text styles — full table in spec.md section 4

**Colors:**
- Background: `{primary_bg}`
- Primary text: `{primary_text}`
- Full palette in spec.md section 5

**Responsive:**
{responsive_note}

**Animations:**
{animation_note}

See the "Animation log" in spec.md section 8 for each animation's trigger, property, duration, easing, and stagger.

**Don't simplify.** If a value is marked `// estimated` in the spec, use it as a starting point and tune by eye against the screenshots. The goal is a clone that's visually indistinguishable from the original at all three breakpoints."""


def synthesize(workspace: Path):
    extracted_path = workspace / "raw" / "extracted.json"
    if not extracted_path.exists():
        raise FileNotFoundError(f"Run extract.py first — missing {extracted_path}")

    data = json.loads(extracted_path.read_text(encoding="utf-8"))
    cfg = load_config(workspace)

    spec = f"""# Block Recon Spec

**Source URL:** {cfg.get('url')}
**Block selector:** `{cfg.get('selector')}`
**Target stack:** {cfg.get('target_stack', DEFAULT_STACK)}

{_fmt_animation_pattern_alert(data.get('animation_patterns_detected', []))}

---

## 1. Visual references

### Screenshots
{list_screenshots(workspace)}

### Videos
{list_videos(workspace)}

---

## 2. Block identity (Framer / data-* names)

{fmt_framer_names(data.get('framer_names', []))}

---

## 3. Layout

{fmt_layout(data['layout'])}

---

## 4. Typography

{fmt_typography_table(data['typography'])}

### Fonts required (read BEFORE writing component)

{fmt_fonts_required(data.get('fonts_required', {}))}

---

## 5. Colors

### Backgrounds
{fmt_color_list(data['colors']['backgrounds'], 'background')}

### Text
{fmt_color_list(data['colors']['text_colors'], 'text')}

### Borders
{fmt_color_list(data['colors']['border_colors'], 'border')}

---

## 6. Spacing

{fmt_spacing(data['spacing'])}

---

## 7. Effects

**Border-radius:** {', '.join(f"`{r['value']}`" for r in data['effects']['border_radius'][:5]) or 'none'}

**Box-shadow:** {', '.join(f"`{s['value']}`" for s in data['effects']['box_shadows'][:3]) or 'none'}

**Opacity:** {', '.join(f"`{o['value']}`" for o in data['effects']['opacities'][:5]) or 'none'}

---

## 8. Inline animation hints (initial states)

{fmt_inline_hints(data.get('inline_animation_hints', []))}

---

## 9. Animation

{fmt_cdp_animations(workspace)}

{fmt_animation(data['animation_fingerprints'])}

---

## 10. Responsive

Compare `screenshots/desktop-1440.png`, `screenshots/tablet-768.png`, and `screenshots/mobile-375.png` side by side.

{fmt_responsive_table(data.get('responsive_deltas', {}))}

> Auto-extracted from `raw/computed-*.json` (3 viewports). In Tailwind this maps to default (mobile) → `md:` (≥768px) → `lg:` (≥1024px). In CSS, Framer's breakpoints are 810px / 1200px.

---

## 11. Per-element responsive diff

Each Framer-named element that has at least one property changing across viewports. Use this to author media queries — the path matches the DOM hierarchy.

{fmt_framer_element_deltas(data.get('framer_element_deltas', {}))}

---

## 12. Observed entrance animation (auto-detected from video)

{fmt_observed_entrance(data.get('observed_entrance_animation') or {})}

---

## 13. Inferred grid layout (R15 — visual verification from bounding rects)

Per-item placement reconstructed from `getBoundingClientRect()`. Use this — NOT pixel-width math — to derive `spacerBefore` values in schema defaults.

{fmt_inferred_grid(data.get('inferred_grid_layout') or {})}

---

## 14. Ready-to-use prompt

Paste the block below into v0.dev, Cursor, Claude, or Bolt — along with the screenshots — to generate the component:

```
{build_ready_prompt(cfg, data['layout'], data['typography'], data['colors'], data['animation_fingerprints'])}
```

---

## 15. Quality checklist

Before handing this spec off, verify:

- [ ] Every measurement is a real number with units (no "small/medium/large")
- [ ] Every color is hex
- [ ] Each animation in the log has trigger + property + duration + easing
- [ ] Estimated values are marked `// estimated`
- [ ] Responsive table is filled in (no remaining `_fill in_`)
- [ ] Screenshots match expectation when opened
- [ ] The animation video plays and animations are watchable
- [ ] If CDP capture ran: every animation row in Section 9 has a reduced-motion fallback noted (see `references/reduced-motion-patterns.md`)
- [ ] Easing values that look like `cubic-bezier(...)` translated to Framer Motion array form (see `references/easing-translation-table.md`)
"""

    out_path = workspace / "spec.md"
    out_path.write_text(spec, encoding="utf-8")
    print(f"✓ spec.md written ({len(spec)} chars)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", required=True)
    args = ap.parse_args()
    synthesize(Path(args.workspace))


if __name__ == "__main__":
    main()
