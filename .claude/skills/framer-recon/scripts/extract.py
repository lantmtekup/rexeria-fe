#!/usr/bin/env python3
"""
extract.py — Parse captured computed styles into a structured spec JSON.

Reads:  <workspace>/raw/computed.json + <workspace>/raw/page.html
Writes: <workspace>/raw/extracted.json
"""

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Dict


HEX_RE = re.compile(r"#[0-9a-fA-F]{3,8}")
RGB_RE = re.compile(r"rgba?\([^)]+\)")


def rgb_to_hex(rgb: str) -> str:
    nums = re.findall(r"[\d.]+", rgb)
    if len(nums) < 3:
        return rgb
    r, g, b = int(float(nums[0])), int(float(nums[1])), int(float(nums[2]))
    if len(nums) == 4 and float(nums[3]) < 1:
        a = int(float(nums[3]) * 255)
        return f"#{r:02x}{g:02x}{b:02x}{a:02x}"
    return f"#{r:02x}{g:02x}{b:02x}"


def normalize_color(val: str) -> str:
    if not val:
        return val
    val = val.strip()
    if val.startswith("rgb"):
        return rgb_to_hex(val)
    return val


def is_transparent(val: str) -> bool:
    """rgba(...,0) or 8-digit hex ending in 00 → transparent. Skip from palette."""
    if not val:
        return True
    v = val.strip().lower()
    if v in ("transparent", "rgba(0,0,0,0)"):
        return True
    # 8-digit hex with alpha 00 (#rrggbb00)
    if v.startswith("#") and len(v) == 9 and v.endswith("00"):
        return True
    m = re.match(r"rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)", v)
    if m and float(m.group(1)) == 0:
        return True
    return False


def walk(node, fn, depth=0):
    if node is None:
        return
    fn(node, depth)
    for child in node.get("children", []) or []:
        walk(child, fn, depth + 1)


def extract_typography(root):
    seen = []
    seen_keys = set()

    def visit(node, depth):
        s = node.get("styles", {})
        if not s.get("font-size") or not node.get("text"):
            return
        entry = {
            "font_family": s.get("font-family", "").split(",")[0].strip().strip('"'),
            "font_family_stack": s.get("font-family", ""),
            "font_size": s.get("font-size"),
            "font_weight": s.get("font-weight"),
            "line_height": s.get("line-height"),
            "letter_spacing": s.get("letter-spacing"),
            "color": normalize_color(s.get("color", "")),
            "text_transform": s.get("text-transform"),
            "text_align": s.get("text-align"),
            "sample_text": node.get("text", "")[:60],
        }
        key = (entry["font_family"], entry["font_size"], entry["font_weight"], entry["color"])
        if key not in seen_keys:
            seen_keys.add(key)
            seen.append(entry)

    walk(root, visit)
    def size_px(e):
        m = re.match(r"([\d.]+)", e["font_size"] or "0")
        return -float(m.group(1)) if m else 0
    seen.sort(key=size_px)
    return seen


def extract_colors(root):
    bg = Counter()
    text = Counter()
    border = Counter()

    def visit(node, depth):
        s = node.get("styles", {})
        # Skip transparent backgrounds (alpha=0) — chỉ thấy ở Framer
        # wrappers, ko phải design intent (fix #8).
        bg_val = s.get("background-color")
        if bg_val and not is_transparent(bg_val):
            bg[normalize_color(bg_val)] += 1
        if s.get("color"):
            text[normalize_color(s["color"])] += 1
        b = s.get("border", "")
        for m in HEX_RE.findall(b):
            border[m] += 1
        for m in RGB_RE.findall(b):
            border[normalize_color(m)] += 1

    walk(root, visit)
    return {
        "backgrounds": [{"color": c, "count": n} for c, n in bg.most_common()],
        "text_colors": [{"color": c, "count": n} for c, n in text.most_common()],
        "border_colors": [{"color": c, "count": n} for c, n in border.most_common()],
    }


def extract_spacing(root):
    paddings = Counter()
    margins = Counter()
    gaps = Counter()

    def visit(node, depth):
        s = node.get("styles", {})
        if s.get("padding"):
            paddings[s["padding"]] += 1
        if s.get("margin"):
            margins[s["margin"]] += 1
        if s.get("gap"):
            gaps[s["gap"]] += 1

    walk(root, visit)
    return {
        "paddings": [{"value": v, "count": n} for v, n in paddings.most_common()],
        "margins": [{"value": v, "count": n} for v, n in margins.most_common()],
        "gaps": [{"value": v, "count": n} for v, n in gaps.most_common()],
    }


def extract_effects(root):
    radii = Counter()
    shadows = Counter()
    opacities = Counter()

    def visit(node, depth):
        s = node.get("styles", {})
        if s.get("border-radius"):
            radii[s["border-radius"]] += 1
        if s.get("box-shadow"):
            shadows[s["box-shadow"]] += 1
        if s.get("opacity"):
            opacities[s["opacity"]] += 1

    walk(root, visit)
    return {
        "border_radius": [{"value": v, "count": n} for v, n in radii.most_common()],
        "box_shadows": [{"value": v, "count": n} for v, n in shadows.most_common()],
        "opacities": [{"value": v, "count": n} for v, n in opacities.most_common()],
    }


def _summarize_layout(node):
    s = node.get("styles", {}) or {}
    return {
        "tag": node.get("tag"),
        "framerName": node.get("framerName"),
        "display": s.get("display"),
        "flex_direction": s.get("flex-direction"),
        "justify_content": s.get("justify-content"),
        "align_items": s.get("align-items"),
        "gap": s.get("gap"),
        "grid_template_columns": s.get("grid-template-columns"),
        "grid_template_rows": s.get("grid-template-rows"),
        "width": s.get("width"),
        "max_width": s.get("max-width"),
        "padding": s.get("padding"),
        "child_count": len(node.get("children", []) or []),
    }


ANIMATION_PATTERN_KEYWORDS = {
    'ticker': 'Infinite scroll (vertical/horizontal). NOT a static list.',
    'marquee': 'Infinite scroll horizontal. NOT a static row.',
    'carousel': 'Manual/auto-rotate slider. NOT a static grid.',
    'slider': 'Slide-by-slide rotation. NOT static.',
    'loop': 'Looped animation (infinite).',
    'infinite': 'Infinite-running animation.',
    'autoplay': 'Auto-play animation/video.',
    'autoscroll': 'Auto-scroll (often nested ticker).',
    'parallax': 'Scroll-linked depth motion. NOT entrance fade.',
    'sticky': 'Pin-scroll behavior. Element stays during scroll.',
    'reveal': 'Scroll-triggered reveal (typewriter / clip-path / mask).',
}


def detect_animation_patterns(framer_names):
    """Scan framer-names for component-level animation patterns (Ticker,
    Marquee, etc). These are EASILY MISSED — Framer wraps the actual motion
    in a generic component, and AST-walking JS chunks doesn't surface them.

    Surface findings prominently in spec.md so user verifies expected motion
    BEFORE scaffolding (past bug: built static grid instead of infinite ticker
    because skill missed `Image Ticker` framer-name)."""
    matches = []
    for n in framer_names or []:
        name_lc = (n.get('name') or '').lower()
        for kw, desc in ANIMATION_PATTERN_KEYWORDS.items():
            if kw in name_lc:
                matches.append({
                    'name': n['name'],
                    'keyword': kw,
                    'meaning': desc,
                    'tag': n.get('tag'),
                    'child_count': n.get('child_count', 0),
                })
                break
    return matches


def extract_layout(root):
    """Capture root layout + drill into the first MEANINGFUL inner layout
    (the deepest descendant that still has >1 children — that's where the
    real grid/list structure lives, not the wrapper chain (fix #6)."""
    root_layout = _summarize_layout(root)
    # Walk down through single-child wrappers to find first multi-child node.
    current = root
    while True:
        children = current.get("children", []) or []
        if len(children) == 1:
            current = children[0]
            continue
        break
    inner_layout = _summarize_layout(current) if current is not root else None
    return {
        **root_layout,
        "inner_layout": inner_layout,
    }


def extract_framer_names(root):
    """Catalog every `data-framer-name` in the tree — Framer's intentional
    labels are more meaningful than auto-hashed classes (fix #5)."""
    names = []
    def visit(node, depth):
        n = node.get("framerName")
        if n:
            names.append({
                "name": n,
                "tag": node.get("tag"),
                "depth": depth,
                "child_count": len(node.get("children", []) or []),
            })
    walk(root, visit)
    return names


def extract_inline_animation_hints(root):
    """Parse inline `style="..."` strings for animation-critical props that
    computed style normalizes away (transform, opacity, will-change). Framer
    Motion bakes initial animation states into inline styles (fix #3)."""
    hints = []
    pattern = re.compile(
        r"(transform|will-change|opacity)\s*:\s*([^;]+)", re.IGNORECASE
    )
    def visit(node, depth):
        inline = node.get("inlineStyle") or ""
        if not inline:
            return
        matches = pattern.findall(inline)
        if not matches:
            return
        # Skip transform: none (default state)
        useful = [
            {"prop": p.strip().lower(), "value": v.strip()}
            for p, v in matches
            if v.strip().lower() not in ("none", "1", "auto")
        ]
        if not useful:
            return
        hints.append({
            "tag": node.get("tag"),
            "framerName": node.get("framerName"),
            "classes": (node.get("classes") or "")[:60],
            "depth": depth,
            "props": useful,
        })
    walk(root, visit)
    return hints


def detect_animation_fingerprints(root, page_html: str = ""):
    findings = {
        "framer_motion": False,
        "framer_site": False,
        "gsap": False,
        "aos": False,
        "lottie": False,
        "css_transitions": [],
        "css_animations": [],
        "framer_data_attrs": 0,
    }

    if "framer-motion" in page_html or "data-framer" in page_html:
        findings["framer_motion"] = True
    if ".framer.website" in page_html or "meta-generator: Framer" in page_html or "framerusercontent.com" in page_html:
        findings["framer_site"] = True
    if "gsap" in page_html.lower() or "GreenSock" in page_html:
        findings["gsap"] = True
    if "data-aos" in page_html:
        findings["aos"] = True
    if "lottie" in page_html.lower():
        findings["lottie"] = True

    def visit(node, depth):
        s = node.get("styles", {})
        if s.get("transition"):
            findings["css_transitions"].append({
                "selector_hint": f"{node.get('tag')}.{(node.get('classes', '') or '')[:40]}",
                "value": s["transition"],
            })
        if s.get("animation"):
            findings["css_animations"].append({
                "selector_hint": f"{node.get('tag')}.{(node.get('classes', '') or '')[:40]}",
                "value": s["animation"],
            })
        classes = node.get("classes", "") or ""
        if "framer-" in classes:
            findings["framer_data_attrs"] += 1

    walk(root, visit)
    return findings


RESPONSIVE_VIEWPORTS = ["desktop-1440", "tablet-768", "mobile-375"]


def _aspects_at_viewport(root):
    """Flatten one viewport's computed.json into a single aspect dict
    (root layout props + heading/body typography extremes)."""
    s = root.get("styles", {}) if root else {}

    text_nodes = []

    def visit(node, depth):
        ns = node.get("styles", {})
        if ns.get("font-size") and node.get("text"):
            m = re.match(r"([\d.]+)", ns["font-size"])
            if m:
                text_nodes.append({
                    "px": float(m.group(1)),
                    "size": ns["font-size"],
                    "weight": ns.get("font-weight"),
                    "family": ns.get("font-family", "").split(",")[0].strip().strip('"'),
                    "sample": (node.get("text") or "")[:40],
                })

    walk(root, visit)
    text_nodes.sort(key=lambda e: e["px"], reverse=True)
    heading = text_nodes[0] if text_nodes else None
    body = text_nodes[-1] if text_nodes else None

    return {
        "display": s.get("display"),
        "flex_direction": s.get("flex-direction"),
        "grid_template_columns": s.get("grid-template-columns"),
        "gap": s.get("gap"),
        "width": s.get("width"),
        "max_width": s.get("max-width"),
        "padding": s.get("padding"),
        "heading_size": heading["size"] if heading else None,
        "heading_weight": heading["weight"] if heading else None,
        "heading_sample": heading["sample"] if heading else None,
        "body_size": body["size"] if body else None,
        "body_weight": body["weight"] if body else None,
        "typography_count": len(text_nodes),
    }


def extract_responsive_deltas(workspace: Path):
    """Per-viewport aspect dict. Empty when capture.py only produced
    desktop computed.json (e.g. older recon workspaces)."""
    out = {}
    for vp in RESPONSIVE_VIEWPORTS:
        path = workspace / "raw" / f"computed-{vp}.json"
        if not path.exists():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        out[vp] = _aspects_at_viewport(data)
    return out


# Properties tracked for per-element diff. Drop low-signal ones
# (background-color, color) since global colors already covered.
ELEMENT_DIFF_PROPS = [
    "display", "flex-direction", "justify-content", "align-items",
    "gap", "grid-template-columns",
    "width", "height", "max-width",
    "padding", "margin",
    "font-size", "font-weight", "line-height",
    "text-align",
]


def _find_constrained_wrapper(node, max_depth=3):
    """Within a framer-named element, look for the nearest unnamed
    descendant that carries an explicit width/max-width AND contains
    a text node. Returns the wrapper's styles, or {}."""
    def search(n, depth):
        if depth > max_depth:
            return None
        s = n.get("styles", {})
        has_text_descendant = bool(n.get("text"))
        if not has_text_descendant:
            for c in n.get("children") or []:
                if c.get("text"):
                    has_text_descendant = True
                    break
        if (s.get("width") or s.get("max-width")) and has_text_descendant:
            return {
                k: s.get(k)
                for k in ("width", "max-width", "padding", "margin")
                if s.get(k)
            }
        for c in n.get("children") or []:
            if c.get("framerName"):
                continue  # stop at next framer-named boundary
            r = search(c, depth + 1)
            if r:
                return r
        return None

    for c in node.get("children") or []:
        if c.get("framerName"):
            continue
        r = search(c, 1)
        if r:
            return r
    return {}


def _find_text_descendant_styles(node, max_depth=3):
    """Within a framer-named element, find the FIRST text-bearing descendant
    and return its typography. Captures <h1>/<p>/<span> styles that are
    invisible to _collect_framer_paths (no data-framer-name on text leaves)."""
    def search(n, depth):
        if depth > max_depth:
            return None
        if n.get("text"):
            s = n.get("styles", {})
            picked = {
                k: s.get(k)
                for k in ("font-size", "font-weight", "line-height",
                          "letter-spacing", "color", "text-align")
                if s.get(k)
            }
            if picked:
                return picked
        for c in n.get("children") or []:
            if c.get("framerName"):
                continue
            r = search(c, depth + 1)
            if r:
                return r
        return None

    for c in node.get("children") or []:
        if c.get("framerName"):
            continue
        r = search(c, 1)
        if r:
            return r
    return {}


def _collect_framer_paths(root):
    """Walk tree, return {path: {prop: value, ...}} for each framer-named
    element. Path = parent-chain of framer-names to disambiguate repeated
    names ('Square', 'Container'). Picks first occurrence per path —
    duplicate paths (siblings with same name) are merged by index suffix.

    Augmented (v2): for each framer-named element, also probe unnamed
    descendants for constrained text wrappers (explicit width/max-width
    on a div containing text) and for the actual text node's typography.
    These otherwise fall through the cracks because Framer doesn't name
    every wrapper or every <h1>/<p>. Promoted as `_wrapper_*` and `_text_*`
    keys on the parent element."""
    out = {}
    seen_paths = {}

    def visit(node, stack):
        fname = node.get("framerName")
        next_stack = stack
        if fname:
            base_path = " > ".join(stack + [fname])
            count = seen_paths.get(base_path, 0) + 1
            seen_paths[base_path] = count
            path = base_path if count == 1 else f"{base_path}[{count}]"

            s = node.get("styles", {})
            props = {k: s.get(k) for k in ELEMENT_DIFF_PROPS if s.get(k)}
            text = node.get("text")
            if text:
                props["_text"] = text[:40]

            # Promote constrained-wrapper width/max-width (e.g. Bio
            # text wrapper width=643px) so code-gen agent sees the
            # constraint even though wrapper has no framer-name.
            wrapper = _find_constrained_wrapper(node)
            for k, v in wrapper.items():
                props[f"_wrapper_{k}"] = v

            # Promote inner text typography (font-size / line-height /
            # letter-spacing of <h1>/<p>/<span> children that aren't
            # framer-named themselves).
            text_styles = _find_text_descendant_styles(node)
            for k, v in text_styles.items():
                props[f"_text_{k}"] = v

            out[path] = props
            next_stack = stack + [fname]

        for c in node.get("children") or []:
            visit(c, next_stack)

    visit(root, [])
    return out


def extract_framer_element_deltas(workspace: Path):
    """Per-framer-named-element diff across 3 viewports. Output keyed by
    path, only includes elements where ≥1 tracked property differs."""
    per_vp = {}
    for vp in RESPONSIVE_VIEWPORTS:
        p = workspace / "raw" / f"computed-{vp}.json"
        if not p.exists():
            continue
        data = json.loads(p.read_text(encoding="utf-8"))
        per_vp[vp] = _collect_framer_paths(data)

    if len(per_vp) < 2:
        return {}

    # Union of all paths seen anywhere
    all_paths = set()
    for vp_data in per_vp.values():
        all_paths.update(vp_data.keys())

    deltas = {}
    for path in all_paths:
        rows = {vp: per_vp[vp].get(path, {}) for vp in per_vp}
        # Find props that differ across viewports. Skip only the text
        # sample key (`_text`) — `_wrapper_*` and `_text_*` promoted from
        # unnamed descendants are diffable and important.
        all_keys = set()
        for r in rows.values():
            all_keys.update(k for k in r.keys() if k != "_text")
        changed = []
        for k in all_keys:
            values = {rows[vp].get(k) for vp in rows}
            if len(values) > 1:
                changed.append(k)
        if changed:
            deltas[path] = {
                "viewports": rows,
                "changed_props": sorted(changed),
            }
    return deltas


# System fonts that don't require import. Anything else = custom font
# that the clone MUST load via @import / <link> / globally.
SYSTEM_FONT_KEYWORDS = {
    "arial", "helvetica", "sans-serif", "serif", "monospace", "system-ui",
    "ui-sans-serif", "ui-serif", "ui-monospace", "ui-rounded",
    "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto",
    "courier", "times", "georgia", "verdana", "tahoma",
}

# Framer (and Adobe Fonts) often expose weight variants as full family names
# like "Inter Medium" or "Inter Semi Bold". Google Fonts treats them as
# ONE family "Inter" with different `wght@` values. Strip suffix → merge.
FRAMER_WEIGHT_SUFFIXES = {
    "thin": "100", "extralight": "200", "extra light": "200",
    "light": "300", "regular": "400", "medium": "500",
    "semibold": "600", "semi bold": "600", "demibold": "600",
    "bold": "700", "extrabold": "800", "extra bold": "800",
    "black": "900", "heavy": "900",
}


def _normalize_font_family(family):
    """Strip Framer weight-suffix words from family name. Returns (base, implied_weight).
    "Inter Medium" → ("Inter", "500")
    "Inter"        → ("Inter", None)
    """
    fam = family.strip()
    low = fam.lower()
    for suffix, weight in FRAMER_WEIGHT_SUFFIXES.items():
        if low.endswith(" " + suffix):
            return fam[: -(len(suffix) + 1)].strip(), weight
    return fam, None


def extract_required_fonts(typography):
    """Unique font families used in the block, split into:
       - custom: needs @import / preload (not in system fallback list)
       - system: safe to use without explicit import.
       Source: typography list from extract_typography().
       Framer weight-suffix family names (e.g. "Inter Medium") are merged
       into their base ("Inter") and the suffix becomes an extra weight."""
    # Walk typography, group by NORMALIZED family
    groups = {}  # normalized_lower → {family: <display>, weights: set}
    for t in typography:
        raw = (t.get("font_family") or "").strip().strip('"').strip("'")
        if not raw:
            continue
        base, implied = _normalize_font_family(raw)
        key = base.lower()
        if key not in groups:
            groups[key] = {"family": base, "weights": set()}
        w = t.get("font_weight")
        if w:
            groups[key]["weights"].add(str(w))
        if implied:
            groups[key]["weights"].add(implied)

    custom = []
    system = []
    for key, info in groups.items():
        is_system = any(kw in key for kw in SYSTEM_FONT_KEYWORDS)
        entry = {
            "family": info["family"],
            "weights_seen": sorted(info["weights"]) or ["400"],
        }
        (system if is_system else custom).append(entry)
    return {"custom": custom, "system": system}


def google_fonts_url(custom_fonts):
    """Build a Google Fonts CSS2 import URL covering all custom fonts +
    weights detected. Caller can paste this directly into a <style> @import."""
    if not custom_fonts:
        return None
    parts = []
    for f in custom_fonts:
        weights = [w for w in f["weights_seen"] if w.isdigit()]
        weights = sorted(set(weights)) or ["400"]
        family = f["family"].replace(" ", "+")
        parts.append(f"family={family}:wght@{';'.join(weights)}")
    return f"https://fonts.googleapis.com/css2?{'&'.join(parts)}&display=swap"


def _collect_named_rects(root):
    """Walk tree, return {framerName: [rect, ...]} for all named elements
    that have a bounding rect. Used by infer_grid_layout to detect repeating
    patterns (Project cards, gallery items)."""
    out: Dict[str, list] = {}
    root_rect = root.get("rect") if root else None
    root_x = root_rect["x"] if root_rect else 0
    root_y = root_rect["y"] if root_rect else 0

    def visit(node):
        fname = node.get("framerName")
        rect = node.get("rect")
        if fname and rect:
            out.setdefault(fname, []).append({
                # Coords relative to root block — easier to compute grid placement
                "x": rect["x"] - root_x,
                "y": rect["y"] - root_y,
                "w": rect["w"],
                "h": rect["h"],
            })
        for c in node.get("children") or []:
            visit(c)

    visit(root)
    return out


def _group_by_row(items, tolerance=8):
    """Cluster items into rows by y-coordinate. items are sorted by y first.
    Same-row tolerance = ~8px (sub-pixel + gap jitter)."""
    if not items:
        return []
    sorted_items = sorted(items, key=lambda i: (i["y"], i["x"]))
    rows = [[sorted_items[0]]]
    for it in sorted_items[1:]:
        if abs(it["y"] - rows[-1][0]["y"]) <= tolerance:
            rows[-1].append(it)
        else:
            rows.append([it])
    return [sorted(r, key=lambda i: i["x"]) for r in rows]


def infer_grid_layout(root, container_padding_left=0):
    """Infer grid placement (col_start, col_span, spacer_after) for each
    repeating framer-named element. Output is the SOURCE-OF-TRUTH for
    schema spacer values in framer-clone-host R15.

    Algorithm:
      1. Collect rects of every named element.
      2. For each name appearing >= 2 times (= repeating), group by row.
      3. Compute col_unit + gap from FIRST 2 items' x-distance + width.
      4. For each row, derive col_start + col_span per item; spacer_after =
         gap between item N's end and item N+1's start, measured in cols.
    """
    named = _collect_named_rects(root)
    repeating = {n: rs for n, rs in named.items() if len(rs) >= 2}
    if not repeating:
        return {}

    # Pick the MOST repeated framer-name as the primary grid driver.
    primary_name, primary_rects = max(repeating.items(), key=lambda kv: len(kv[1]))
    if len(primary_rects) < 2:
        return {}

    rows = _group_by_row(primary_rects)
    if not rows or not rows[0] or len(rows[0]) < 2:
        # Can't infer col_unit from < 2 items in first row — fall back to
        # global widths.
        return {"primary": primary_name, "count": len(primary_rects), "rows_count": len(rows)}

    first_row = rows[0]
    item_w = round(first_row[0]["w"], 2)
    # Gap between consecutive items — sample across ALL rows then pick MIN.
    # Median includes spacer-wide gaps (e.g. 6-col spacer = 6× normal gap).
    # MIN gap = tight neighbors = actual grid `gap` property.
    all_gaps = []
    for row in rows:
        for a, b in zip(row, row[1:]):
            gap = round(b["x"] - (a["x"] + a["w"]), 2)
            if gap > 0:
                all_gaps.append(gap)
    median_gap = min(all_gaps) if all_gaps else 0
    stride = item_w + median_gap

    # Assume each item spans 2 grid cols (most common Framer pattern).
    # 1 "stride unit" of spacer = 1 item-width-equivalent = 2 grid cols.
    SPAN_PER_ITEM = 2
    # Above-fold threshold: 600px — conservative; many laptop screens have
    # < 800px usable viewport after browser chrome. Items below this y are
    # below-fold → animate on scroll. Items above-fold should skip entrance
    # OR use longer base-delay to avoid jerky page-load cascade.
    ABOVE_FOLD_Y = 600

    rows_data = []
    for ridx, row in enumerate(rows):
        items_out = []
        for iidx, it in enumerate(row):
            # col_start in stride space → convert to grid-col by × span.
            col_start_stride = round(it["x"] / stride) + 1 if stride > 0 else None
            col_start_grid = (col_start_stride - 1) * SPAN_PER_ITEM + 1 if col_start_stride else None
            spacer_after_strides = None
            spacer_after_grid_cols = None
            if iidx + 1 < len(row):
                next_it = row[iidx + 1]
                gap_px = next_it["x"] - (it["x"] + it["w"])
                spacer_after_strides = round((gap_px - median_gap) / stride) if stride > 0 else None
                if spacer_after_strides is not None:
                    spacer_after_grid_cols = spacer_after_strides * SPAN_PER_ITEM
            items_out.append({
                "idx_in_row": iidx,
                "col_start_grid": col_start_grid,
                "spacer_after_cols": spacer_after_grid_cols,
                "x": it["x"],
                "y": it["y"],
                "w": it["w"],
                # R16: skip entrance animation if above-fold (already visible
                # at page load → avoids jerky synchronized cascade).
                "above_fold": it["y"] < ABOVE_FOLD_Y,
            })
        rows_data.append({
            "row": ridx + 1,
            "items_count": len(row),
            "items": items_out,
        })

    return {
        "primary_element": primary_name,
        "total_count": len(primary_rects),
        "stride_px": stride,
        "item_width_px": item_w,
        "gap_px": median_gap,
        "rows": rows_data,
    }


def analyze_video_entrance(workspace: Path, grid: dict):
    """B — Auto-detect entrance animation from scroll-animation.webm.

    Pipeline:
      1. Use ffmpeg to extract frames at 15fps (≈120 frames for 8s).
      2. For each repeating item rect, compute frame-by-frame mean luminance
         in that bounding box.
      3. Find the frame index where luminance "stabilizes" (delta vs final
         frame drops below 5%) → that's when the item finished entering.
      4. Find first frame where luminance is > 50% of final → entrance start.
      5. Duration = (stable_frame - start_frame) / fps.

    Output: `observed_entrance.duration_ms` per primary element.
    Falls back to empty dict if ffmpeg missing or video absent."""
    video_path = workspace / "videos" / "scroll-animation.webm"
    if not video_path.exists():
        return {}

    import shutil
    import subprocess
    if not shutil.which("ffmpeg"):
        return {"warning": "ffmpeg not installed — skip video animation analysis"}

    frames_dir = workspace / "raw" / "_video_frames"
    if frames_dir.exists():
        for f in frames_dir.glob("*.png"):
            f.unlink()
    frames_dir.mkdir(parents=True, exist_ok=True)

    fps = 15
    try:
        subprocess.run(
            ["ffmpeg", "-i", str(video_path), "-vf", f"fps={fps}",
             "-loglevel", "error", str(frames_dir / "f_%03d.png")],
            check=True, capture_output=True, timeout=60,
        )
    except Exception as e:
        return {"warning": f"ffmpeg failed: {e}"}

    frames = sorted(frames_dir.glob("f_*.png"))
    if len(frames) < 10:
        return {"warning": f"too few frames ({len(frames)}) — entrance pattern indeterminate"}

    # Use Pillow to sample luminance per frame inside each item's rect.
    try:
        from PIL import Image
    except ImportError:
        try:
            subprocess.run(
                [__import__("sys").executable, "-m", "pip", "install",
                 "pillow", "--break-system-packages"],
                check=True, capture_output=True,
            )
            from PIL import Image
        except Exception:
            return {"warning": "Pillow not available — skip"}

    if not grid or not grid.get("rows"):
        return {"warning": "no inferred_grid_layout — can't sample item regions"}

    # Sample 1st row 1st item — entrance is similar across items.
    target = grid["rows"][0]["items"][0]
    rect = (
        int(target["x"]),
        int(target.get("y", 0)),
        int(target["x"] + target["w"]),
        int(target.get("y", 0) + target["w"] * 4 / 3),  # 3:4 aspect guess
    )
    # Scale rect — frames may be rendered at different size than capture viewport.
    first = Image.open(frames[0])
    scale_x = first.width / 1440  # capture was 1440 wide
    scaled = tuple(int(c * scale_x) for c in rect)

    luminance_series = []
    for fp in frames:
        try:
            img = Image.open(fp).convert("L")  # greyscale
            crop = img.crop(scaled)
            # Mean brightness in region. Lower = more saturated/dark content.
            pixels = list(crop.getdata())
            if not pixels:
                luminance_series.append(None)
                continue
            mean = sum(pixels) / len(pixels)
            luminance_series.append(mean)
        except Exception:
            luminance_series.append(None)

    valid = [v for v in luminance_series if v is not None]
    if len(valid) < 5:
        return {"warning": "luminance sampling failed"}

    final_lum = valid[-1]
    # Estimate "empty viewport" (white-ish bg) ≈ 240. Item-content luminance is
    # usually 100-180. Find first frame where luminance drops > 30% toward final.
    bg_lum = 240
    contrast = bg_lum - final_lum
    if abs(contrast) < 20:
        return {"warning": "low contrast between item and background — can't detect"}

    start_idx = None
    end_idx = None
    for i, lum in enumerate(luminance_series):
        if lum is None:
            continue
        progress = (bg_lum - lum) / contrast if contrast != 0 else 0
        if start_idx is None and progress > 0.1:
            start_idx = i
        if start_idx is not None and progress > 0.95:
            end_idx = i
            break

    if start_idx is None or end_idx is None:
        return {"warning": "entrance frames not found in video — item may already be visible at video start"}

    duration_ms = (end_idx - start_idx) * (1000 / fps)
    return {
        "trigger": "scroll-into-view",
        "property_observed": "opacity (luminance proxy)",
        "duration_ms": round(duration_ms),
        "start_frame": start_idx,
        "end_frame": end_idx,
        "fps": fps,
        "easing_guess": "easeOut (heuristic — slow start, fast end)",
        "sampled_element": grid["primary_element"],
        "note": "Auto-extracted from scroll-animation.webm. Visual confirmation recommended.",
    }


def extract(workspace: Path):
    computed_path = workspace / "raw" / "computed.json"
    if not computed_path.exists():
        raise FileNotFoundError(f"Run capture.py first — missing {computed_path}")

    root = json.loads(computed_path.read_text(encoding="utf-8"))

    page_html_path = workspace / "raw" / "page.html"
    page_html = page_html_path.read_text(encoding="utf-8") if page_html_path.exists() else ""

    result = {
        "layout": extract_layout(root),
        "typography": extract_typography(root),
        "colors": extract_colors(root),
        "spacing": extract_spacing(root),
        "effects": extract_effects(root),
        "animation_fingerprints": detect_animation_fingerprints(root, page_html),
        "framer_names": extract_framer_names(root),
        "inline_animation_hints": extract_inline_animation_hints(root),
        "responsive_deltas": extract_responsive_deltas(workspace),
        "framer_element_deltas": extract_framer_element_deltas(workspace),
        "inferred_grid_layout": infer_grid_layout(root),
    }
    result["observed_entrance_animation"] = analyze_video_entrance(workspace, result["inferred_grid_layout"])
    result["animation_patterns_detected"] = detect_animation_patterns(result["framer_names"])
    result["fonts_required"] = extract_required_fonts(result["typography"])
    result["fonts_required"]["google_fonts_import_url"] = google_fonts_url(
        result["fonts_required"]["custom"]
    )

    out_path = workspace / "raw" / "extracted.json"
    out_path.write_text(json.dumps(result, indent=2), encoding="utf-8")

    print(f"✓ extracted.json written")
    print(f"  Typography variants: {len(result['typography'])}")
    print(f"  Unique background colors: {len(result['colors']['backgrounds'])}")
    print(f"  Unique text colors: {len(result['colors']['text_colors'])}")
    fp = result["animation_fingerprints"]
    libs = [k for k in ("framer_motion", "framer_site", "gsap", "aos", "lottie") if fp[k]]
    print(f"  Animation library detected: {', '.join(libs) if libs else 'none / vanilla CSS'}")
    print(f"  CSS transitions found: {len(fp['css_transitions'])} (after noise filter)")
    print(f"  Framer-named elements: {len(result['framer_names'])}")
    print(f"  Inline animation hints: {len(result['inline_animation_hints'])}")
    rd = result["responsive_deltas"]
    print(f"  Responsive viewports captured: {len(rd)} ({', '.join(rd.keys()) or 'none'})")
    fed = result["framer_element_deltas"]
    print(f"  Framer elements with cross-viewport deltas: {len(fed)}")
    fonts = result["fonts_required"]
    n_custom = len(fonts["custom"])
    print(f"  Fonts required: {n_custom} custom ({', '.join(f['family'] for f in fonts['custom']) or 'none'})")
    if fonts.get("google_fonts_import_url"):
        print(f"  → @import: {fonts['google_fonts_import_url']}")
    grid = result.get("inferred_grid_layout") or {}
    if grid.get("primary_element"):
        rows = grid.get("rows") or []
        row_counts = " + ".join(str(r["items_count"]) for r in rows)
        above = sum(1 for r in rows for it in r["items"] if it.get("above_fold"))
        below = sum(1 for r in rows for it in r["items"]) - above
        print(f"  Inferred grid: {grid['total_count']}× {grid['primary_element']} → rows {row_counts}  (stride {grid.get('stride_px', '?')}px, gap {grid.get('gap_px', '?')}px)")
        print(f"  Above-fold items (R16 — skip animation): {above}; below-fold (animate on scroll): {below}")
    obs = result.get("observed_entrance_animation") or {}
    if obs.get("duration_ms") is not None:
        print(f"  Observed entrance animation: {obs['duration_ms']}ms (frames {obs['start_frame']}–{obs['end_frame']} @ {obs['fps']}fps)")
    elif obs.get("warning"):
        print(f"  Video analysis: {obs['warning']}")

    return result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", required=True)
    args = ap.parse_args()
    extract(Path(args.workspace))


if __name__ == "__main__":
    main()
