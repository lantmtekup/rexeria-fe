#!/usr/bin/env python3
"""
capture-cdp-animations.py — Capture animations via Chrome DevTools Protocol.

Catches CSS animations, CSS transitions, and Web Animations API (WAAPI) calls
as they fire. Framer Motion uses WAAPI under the hood, so this captures its
real timing config — something computed-style extraction can never see.

Outputs: <workspace>/raw/cdp-animations.json

Usage:
    python capture-cdp-animations.py --url <URL> --selector <SEL> --out <WORKSPACE>

Limitations:
- GSAP / requestAnimationFrame-driven animations DO NOT show up here
  (they're not registered with the browser animation engine). For those,
  parse the bundle JS for `gsap.to(`, `gsap.timeline(`, etc.
- Canvas / WebGL animations are invisible to CDP.
"""

import argparse
import json
import subprocess
import sys
import time
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
    try:
        import playwright  # noqa: F401
    except ImportError:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "playwright", "--break-system-packages"],
            check=True,
        )
        subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            check=True,
            capture_output=True,
        )


def capture(url, selector, workspace, scroll_steps=8, scroll_pause_ms=600, playback_rate=0.25, auth_state=None):
    from playwright.sync_api import sync_playwright

    workspace = Path(workspace)
    (workspace / "raw").mkdir(parents=True, exist_ok=True)
    out_path = workspace / "raw" / "cdp-animations.json"

    auth_kwargs = {"storage_state": auth_state} if auth_state else {}
    animations = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            **auth_kwargs,
            viewport={"width": 1440, "height": 900},
        )
        page = context.new_page()
        cdp = context.new_cdp_session(page)

        # Enable Animation domain
        cdp.send("Animation.enable")
        # Slow playback so we don't miss short animations
        cdp.send("Animation.setPlaybackRate", {"playbackRate": playback_rate})

        # Listen for animationStarted events
        def on_started(event):
            anim = event.get("animation", {})
            src = anim.get("source") or {}
            animations.append({
                "captured_at": time.time(),
                "id": anim.get("id"),
                "name": anim.get("name"),
                "type": anim.get("type"),  # CSSTransition | CSSAnimation | WebAnimation
                "play_state": anim.get("playState"),
                "playback_rate": anim.get("playbackRate"),
                "start_time": anim.get("startTime"),
                "current_time": anim.get("currentTime"),
                "source": {
                    "delay": src.get("delay"),
                    "duration": src.get("duration"),
                    "easing": src.get("easing"),
                    "iterations": src.get("iterations"),
                    "iteration_start": src.get("iterationStart"),
                    "direction": src.get("direction"),
                    "fill": src.get("fill"),
                    "backend_node_id": src.get("backendNodeId"),
                    "keyframes_rule": src.get("keyframesRule"),
                },
            })

        cdp.on("Animation.animationStarted", on_started)

        # ---- Navigate (catches on-load animations) ----
        print(f"[cdp] loading {url}...")
        _goto_resilient(page, url)
        page.wait_for_timeout(2000)  # let on-load animations fire

        # ---- Scroll to target block, recording in-view animations ----
        try:
            el = page.query_selector(selector)
            if el:
                el.scroll_into_view_if_needed()
                page.wait_for_timeout(1500)
            else:
                print(f"[cdp] WARN: selector '{selector}' not found", file=sys.stderr)
        except Exception as e:
            print(f"[cdp] WARN: scroll failed: {e}", file=sys.stderr)

        # ---- Progressive scroll to fire IntersectionObserver-gated animations ----
        try:
            height = page.evaluate("document.documentElement.scrollHeight")
            for i in range(1, scroll_steps + 1):
                target_y = int((height / scroll_steps) * i)
                page.evaluate(f"window.scrollTo({{ top: {target_y}, behavior: 'instant' }})")
                page.wait_for_timeout(scroll_pause_ms)
        except Exception as e:
            print(f"[cdp] WARN: progressive scroll failed: {e}", file=sys.stderr)

        # ---- Resolve backendNodeIds to readable selectors ----
        for anim in animations:
            node_id = anim["source"].get("backend_node_id")
            if not node_id:
                continue
            try:
                resolved = cdp.send("DOM.resolveNode", {"backendNodeId": node_id})
                obj = resolved.get("object", {})
                obj_id = obj.get("objectId")
                if not obj_id:
                    continue
                fn = """function() {
                    const el = this;
                    if (el.id) return '#' + el.id;
                    const tag = (el.tagName || '').toLowerCase();
                    const framerName = el.getAttribute && el.getAttribute('data-framer-name');
                    if (framerName) return tag + '[data-framer-name="' + framerName + '"]';
                    const cls = (el.className && typeof el.className === 'string')
                        ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
                        : '';
                    return tag + cls;
                }"""
                result = cdp.send("Runtime.callFunctionOn", {
                    "objectId": obj_id,
                    "functionDeclaration": fn,
                })
                anim["selector"] = result.get("result", {}).get("value")
            except Exception:
                pass  # node may be gone

        # ---- Library fingerprint (cross-check with extract.py detection) ----
        detected = page.evaluate("""() => {
            const out = {};
            if (window.gsap) out.gsap = window.gsap.version || true;
            if (window.ScrollTrigger) out.scrollTrigger = true;
            if (window.Motion) out.motionOne = true;
            if (window.Lenis || window.lenis) out.lenis = true;
            // Framer Motion sets style.willChange + uses Web Animations API
            const hasWillChange = !!document.querySelector('[style*="will-change"]');
            if (hasWillChange) out.usesWillChange = true;
            return out;
        }""")

        context.close()
        browser.close()

    # ---- Filter out noise: very short transitions (<50ms) that are usually
    # focus rings / hover micro-states that aren't structural to the block.
    significant = [a for a in animations
                   if (a["source"].get("duration") or 0) >= 50
                   or a.get("type") == "WebAnimation"]

    output = {
        "url": url,
        "selector": selector,
        "captured_at": time.time(),
        "playback_rate": playback_rate,
        "library_fingerprint": detected,
        "total_animations": len(animations),
        "significant_animations": len(significant),
        "animations": significant,
        "all_raw": animations,  # keep for debugging
    }

    out_path.write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(f"[cdp] ✓ {out_path.name} ({len(significant)} significant, {len(animations)} total)")
    print(f"[cdp] libraries detected: {detected}")
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--selector", required=True)
    ap.add_argument("--out", required=True, help="Workspace directory (same as capture.py)")
    ap.add_argument("--auth-state", help="Playwright storage state JSON")
    ap.add_argument("--playback-rate", type=float, default=0.25,
                    help="0.0-1.0; lower = slower = more reliable capture (default 0.25)")
    args = ap.parse_args()

    ensure_playwright()
    capture(
        args.url, args.selector, args.out,
        playback_rate=args.playback_rate,
        auth_state=args.auth_state,
    )


if __name__ == "__main__":
    main()
