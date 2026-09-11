#!/usr/bin/env python3
"""
capture.py — Capture screenshots, video, raw HTML + computed styles of a UI block.

Outputs per-viewport:
    raw/block-{viewport}.html
    raw/computed-{viewport}.json
    screenshots/{viewport}.png

Desktop alias (back-compat with extract.py):
    raw/block.html        == raw/block-desktop-1440.html
    raw/computed.json     == raw/computed-desktop-1440.json

Usage:
    python capture.py --url <URL> --selector <CSS_SELECTOR> --out <WORKSPACE_DIR> [--no-video]
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path



def _goto_resilient(page, url):
    """networkidle first; sites that stream video never go idle -> fall back to load + settle."""
    try:
        page.goto(url, wait_until="networkidle", timeout=20_000)
    except Exception:
        try:
            page.wait_for_load_state("load", timeout=30_000)
        except Exception:
            pass
        page.wait_for_timeout(2500)

def ensure_playwright():
    """Install playwright + chromium if not present."""
    try:
        import playwright  # noqa: F401
    except ImportError:
        print("Installing playwright...")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "playwright", "--break-system-packages"],
            check=True,
        )
    try:
        subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            check=True,
            capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"Warning: playwright install chromium failed: {e}", file=sys.stderr)


VIEWPORTS = [
    {"name": "desktop-1440", "width": 1440, "height": 900, "is_mobile": False},
    {"name": "tablet-768", "width": 768, "height": 1024, "is_mobile": False},
    {"name": "mobile-375", "width": 375, "height": 812, "is_mobile": True},
]


# Selectors hidden by default before screenshot — covers nav overlays, cookie
# banners, chatbots, "made in Framer" badges. User can supply more via --hide.
DEFAULT_HIDE_SELECTORS = [
    "nav", "header[role='navigation']",
    "[data-framer-name*='Nav' i]",
    "[data-framer-name*='Menu' i]",
    "[aria-label*='cookie' i]",
    ".framer-badge-container",
    "[id*='cookie' i]",
]


# Recursive computed-style walker. Runs in browser via el.evaluate(...).
# Captures the same shape across 3 viewports so extract.py / synthesize.py
# can diff typography / spacing / layout per breakpoint.
COMPUTED_WALK_JS = r"""el => {
    const RELEVANT = [
        'display','flex-direction','justify-content','align-items','gap',
        'grid-template-columns','grid-template-rows',
        'width','height','max-width','min-height',
        'padding','margin',
        'font-family','font-size','font-weight','line-height','letter-spacing',
        'color','background-color','background-image',
        'border','border-radius','box-shadow','opacity',
        'transform','transition','animation','will-change',
        'text-align','text-transform'
    ];
    // Framer Motion baseline noise — skip these CSS values (the real
    // animation config lives in JS, not these placeholders).
    const TRANSITION_NOISE = new Set(['all', 'all 0s ease 0s', 'none 0s ease 0s 1 normal none running']);
    function isNoiseTransition(v) {
        const t = v.trim();
        return TRANSITION_NOISE.has(t) || t.startsWith('all 0s') || t.startsWith('none 0s');
    }
    function dump(node, depth) {
        // Framer wraps text 8+ levels deep — depth 14 covers all
        // realistic block depths without runaway memory.
        if (depth > 14) return null;
        const cs = getComputedStyle(node);
        const styles = {};
        for (const prop of RELEVANT) {
            const v = cs.getPropertyValue(prop);
            if (!v || v === 'none' || v === 'normal' || v === 'auto' || v === '0px') continue;
            if ((prop === 'transition' || prop === 'animation') && isNoiseTransition(v)) continue;
            styles[prop] = v;
        }
        // Capture inline style separately — Framer Motion sets
        // `style="transform: scale(0.9)"` etc. that computed style
        // normalizes/loses.
        const inline = node.getAttribute('style') || '';
        // Framer's data-framer-name is more meaningful than auto-hashed
        // classes.
        const framerName = node.getAttribute('data-framer-name') || null;
        // Bounding rect — used by extract.py to INFER grid layout (cols, rows,
        // spacers) from visible positions. Critical for repeating-element
        // patterns (Project cards, gallery items) where DOM hierarchy alone
        // doesn't reveal grid layout.
        let rect = null;
        try {
            const r = node.getBoundingClientRect();
            if (r && (r.width > 0 || r.height > 0)) {
                // Relative to viewport — extract.py normalizes by subtracting
                // the root block's offset for grid-relative coords.
                rect = {
                    x: Math.round(r.left * 100) / 100,
                    y: Math.round(r.top * 100) / 100,
                    w: Math.round(r.width * 100) / 100,
                    h: Math.round(r.height * 100) / 100,
                };
            }
        } catch (e) { /* defensive — some Framer nodes throw on getBoundingClientRect */ }
        return {
            tag: node.tagName.toLowerCase(),
            classes: node.className && typeof node.className === 'string' ? node.className : '',
            framerName,
            inlineStyle: inline || null,
            rect,
            text: node.children.length === 0 ? node.textContent?.trim().slice(0,120) : null,
            styles,
            children: Array.from(node.children).map(c => dump(c, depth+1)).filter(Boolean)
        };
    }
    return dump(el, 0);
}"""


def _hide_overlays(page, extra):
    """Inject display:none on common floating overlays so element screenshots
    aren't polluted by fixed-position nav / cookie banners."""
    selectors = DEFAULT_HIDE_SELECTORS + (extra or [])
    css = ", ".join(selectors) + " { display: none !important; visibility: hidden !important; }"
    page.add_style_tag(content=css)


def _disable_motion(page):
    """Freeze transitions/animations/transforms so screenshot is mid-animation-safe."""
    page.add_style_tag(content=(
        "*, *::before, *::after {"
        " transition: none !important;"
        " animation: none !important;"
        " transform: none !important;"
        "}"
    ))


def capture(url, selector, out_dir, record_video=True, hide_selectors=None, auth_state=None):
    from playwright.sync_api import sync_playwright
    hide_selectors = hide_selectors or []
    # Optional Playwright storage state — loads cookies + localStorage so
    # capture can access authed pages (admin routes, gated content).
    # Generate via `save-auth-state.py` first.
    auth_kwargs = {"storage_state": auth_state} if auth_state else {}

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "screenshots").mkdir(exist_ok=True)
    (out_dir / "videos").mkdir(exist_ok=True)
    (out_dir / "raw").mkdir(exist_ok=True)
    (out_dir / "assets").mkdir(exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ---- 3 viewports: each captures screenshot + computed.json + block.html ----
        for vp in VIEWPORTS:
            context = browser.new_context(
                **auth_kwargs,
                viewport={"width": vp["width"], "height": vp["height"]},
                is_mobile=vp["is_mobile"],
                device_scale_factor=2,
            )
            page = context.new_page()
            print(f"[{vp['name']}] loading {url}...")
            _goto_resilient(page, url)
            page.wait_for_timeout(1500)  # let webfonts/lazy images settle

            el = None
            try:
                el = page.query_selector(selector)
                if el:
                    el.scroll_into_view_if_needed()
                    # Let lazy webfonts/responsive media swap after scroll
                    page.wait_for_timeout(800)
                else:
                    print(f"  WARN: selector '{selector}' not found at {vp['name']}", file=sys.stderr)
            except Exception as e:
                print(f"  WARN: scroll failed: {e}", file=sys.stderr)

            # 1) computed.json + block.html — BEFORE disabling motion (so
            # inline Framer Motion transforms survive in raw/inlineStyle).
            if el:
                try:
                    outer_html = el.evaluate("e => e.outerHTML")
                    (out_dir / "raw" / f"block-{vp['name']}.html").write_text(outer_html, encoding="utf-8")

                    computed = el.evaluate(COMPUTED_WALK_JS)
                    (out_dir / "raw" / f"computed-{vp['name']}.json").write_text(
                        json.dumps(computed, indent=2), encoding="utf-8"
                    )
                    print(f"  ✓ raw/computed-{vp['name']}.json ({len(outer_html)} HTML chars)")

                    # Back-compat alias — extract.py + synthesize.py still
                    # read raw/computed.json + raw/block.html as desktop.
                    if vp["name"] == "desktop-1440":
                        (out_dir / "raw" / "block.html").write_text(outer_html, encoding="utf-8")
                        (out_dir / "raw" / "computed.json").write_text(
                            json.dumps(computed, indent=2), encoding="utf-8"
                        )
                except Exception as e:
                    print(f"  WARN: computed/HTML capture failed: {e}", file=sys.stderr)

            # 2) Screenshot — freeze motion + hide overlays.
            if el:
                try:
                    _disable_motion(page)
                    _hide_overlays(page, hide_selectors)
                    page.wait_for_timeout(2500)
                    block_path = out_dir / "screenshots" / f"{vp['name']}.png"
                    el.screenshot(path=str(block_path))
                    print(f"  ✓ {block_path.name}")
                except Exception as e:
                    print(f"  WARN: block screenshot failed ({e}); falling back to viewport", file=sys.stderr)
                    page.screenshot(path=str(out_dir / "screenshots" / f"{vp['name']}.png"), full_page=False)
            else:
                page.screenshot(path=str(out_dir / "screenshots" / f"{vp['name']}.png"), full_page=False)
                print(f"  ✓ {vp['name']}.png (full viewport — selector missed)")

            # 3) Desktop-only extras: fullpage screenshot, page.html, image downloads.
            if vp["name"] == "desktop-1440":
                page.screenshot(
                    path=str(out_dir / "screenshots" / "desktop-fullpage.png"),
                    full_page=True,
                )
                print(f"  ✓ desktop-fullpage.png")

                full_html = page.content()
                (out_dir / "raw" / "page.html").write_text(full_html, encoding="utf-8")

                if el:
                    try:
                        img_urls = el.evaluate(
                            """el => Array.from(el.querySelectorAll('img'))
                                .map(i => i.src)
                                .filter(s => s && !s.startsWith('data:'))"""
                        )
                        for i, img_url in enumerate(img_urls[:20]):
                            try:
                                resp = page.request.get(img_url)
                                if resp.ok:
                                    ext = ".jpg"
                                    u = img_url.lower()
                                    if ".png" in u:
                                        ext = ".png"
                                    elif ".svg" in u:
                                        ext = ".svg"
                                    elif ".webp" in u:
                                        ext = ".webp"
                                    (out_dir / "assets" / f"img-{i:02d}{ext}").write_bytes(resp.body())
                            except Exception as e:
                                print(f"  WARN: failed to download {img_url}: {e}", file=sys.stderr)
                        print(f"  ✓ {len(img_urls)} images discovered, downloaded up to 20")
                    except Exception as e:
                        print(f"  WARN: image discovery failed: {e}", file=sys.stderr)

            context.close()

        # ---- Scroll animation video (desktop) ----
        if record_video:
            print("[video] recording scroll animation...")
            context = browser.new_context(
                **auth_kwargs,
                viewport={"width": 1440, "height": 900},
                record_video_dir=str(out_dir / "videos"),
                record_video_size={"width": 1440, "height": 900},
            )
            page = context.new_page()
            _goto_resilient(page, url)
            page.wait_for_timeout(1000)

            el = page.query_selector(selector)
            if el:
                el.scroll_into_view_if_needed()
                page.evaluate("window.scrollBy(0, -300)")
                page.wait_for_timeout(800)
                for _ in range(12):
                    page.evaluate("window.scrollBy(0, 80)")
                    page.wait_for_timeout(150)
                page.wait_for_timeout(2000)
            else:
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                page.wait_for_timeout(4000)

            context.close()

            videos = list((out_dir / "videos").glob("*.webm"))
            target = out_dir / "videos" / "scroll-animation.webm"
            if videos and videos[0] != target:
                videos[0].rename(target)
            if target.exists():
                print(f"  ✓ scroll-animation.webm")
        else:
            print("[video] skipped (--no-video)")

        browser.close()

    print(f"\n✓ Capture complete → {out_dir}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--selector", required=True,
                    help="CSS selector for the block (e.g. '#hero', '[data-block=\"coaching\"]')")
    ap.add_argument("--out", required=True, help="Output workspace directory")
    ap.add_argument("--no-video", action="store_true", help="Skip the animation video recording")
    ap.add_argument("--hide", action="append", default=[],
                    help="CSS selector(s) to hide before screenshot (repeat for multiple). "
                         "Common overlays like nav / cookie banners are hidden by default.")
    ap.add_argument("--auth-state",
                    help="Path to Playwright storage state JSON (from save-auth-state.py). "
                         "Loads cookies + localStorage so capture works on authed pages.")
    args = ap.parse_args()

    ensure_playwright()
    capture(args.url, args.selector, Path(args.out),
            record_video=not args.no_video,
            hide_selectors=args.hide,
            auth_state=args.auth_state)


if __name__ == "__main__":
    main()
