#!/usr/bin/env python3
"""
run.py — One-shot orchestrator: capture → extract → synthesize.

Usage:
    python run.py --url <URL> --selector <SELECTOR> --name <SLUG> [--no-video] [--stack "..."]

Example:
    python run.py \\
        --url https://perform.framer.website/ \\
        --selector "#coaching" \\
        --name perform-coaching
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
DEFAULT_STACK = "React + Tailwind + Framer Motion"


def slugify(s: str) -> str:
    return "".join(c if c.isalnum() or c == "-" else "-" for c in s.lower()).strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True)
    ap.add_argument("--selector", required=True)
    ap.add_argument("--name", required=True, help="Short slug for the output folder")
    ap.add_argument("--stack", default=DEFAULT_STACK,
                    help=f"Target tech stack for the spec prompt (default: '{DEFAULT_STACK}')")
    ap.add_argument("--out-base", default=".", help="Base directory for the workspace")
    ap.add_argument("--video", action="store_true",
                    help="Record 10s scroll video. Default: SKIP. Video is fallback for animation reference "
                         "when bundle extraction (framer-clone Step 2) fails or site is non-Framer. "
                         "Framer sites: extract-animations.js parses JS bundle for real easings → no video needed.")
    # Backwards compat — accept --no-video silently (now default)
    ap.add_argument("--no-video", action="store_true", help=argparse.SUPPRESS)
    ap.add_argument("--hide", action="append", default=[],
                    help="CSS selector(s) to hide before screenshot (repeat for multiple). "
                         "Common overlays like nav / cookie banners hidden by default.")
    ap.add_argument("--auth-state",
                    help="Path to Playwright storage state JSON (from save-auth-state.py). "
                         "Required for authed routes (admin / gated content).")
    ap.add_argument("--cdp", action="store_true",
                    help="Also capture animations via Chrome DevTools Protocol (Animation domain). "
                         "Catches CSS animations + CSS transitions + Web Animations API (Framer Motion) "
                         "with real timing config. Does NOT catch GSAP/rAF-driven animations — "
                         "those need bundle JS parsing. Adds ~15-30s to run time.")
    args = ap.parse_args()

    workspace = Path(args.out_base) / f"recon-{slugify(args.name)}"
    workspace.mkdir(parents=True, exist_ok=True)

    config = {
        "url": args.url,
        "selector": args.selector,
        "target_stack": args.stack,
        "name": args.name,
    }
    (workspace / "config.json").write_text(json.dumps(config, indent=2), encoding="utf-8")

    print(f"━━━ Recon: {args.name} ━━━")
    print(f"URL:      {args.url}")
    print(f"Selector: {args.selector}")
    print(f"Stack:    {args.stack}")
    print(f"Output:   {workspace}\n")

    # 1. Capture
    print("[1/3] Capture (Playwright)...")
    cap_args = [sys.executable, str(HERE / "capture.py"),
                "--url", args.url,
                "--selector", args.selector,
                "--out", str(workspace)]
    # Video OFF by default — R5 mandates bundle extraction (framer-clone Step 2)
    # as primary source of animation truth. Only pass --video if user opted in.
    if not args.video:
        cap_args.append("--no-video")
    if args.auth_state:
        cap_args.extend(["--auth-state", args.auth_state])
    for h in args.hide:
        cap_args.extend(["--hide", h])
    if subprocess.run(cap_args).returncode != 0:
        print("Capture failed. Stopping.", file=sys.stderr)
        sys.exit(1)

    # 2. CDP animation capture (optional)
    if args.cdp:
        print("\n[2a/3] CDP animation capture...")
        cdp_args = [sys.executable, str(HERE / "capture-cdp-animations.py"),
                    "--url", args.url,
                    "--selector", args.selector,
                    "--out", str(workspace)]
        if args.auth_state:
            cdp_args.extend(["--auth-state", args.auth_state])
        # CDP failure is non-fatal — spec.md can still be produced from
        # computed-style data; we just lose the high-fidelity animation log.
        if subprocess.run(cdp_args).returncode != 0:
            print("  WARN: CDP capture failed. Continuing without it.", file=sys.stderr)

    # 3. Extract
    print("\n[2/3] Extract computed styles...")
    if subprocess.run([sys.executable, str(HERE / "extract.py"),
                       "--workspace", str(workspace)]).returncode != 0:
        print("Extract failed. Stopping.", file=sys.stderr)
        sys.exit(1)

    # 3. Synthesize
    print("\n[3/3] Synthesize spec.md...")
    if subprocess.run([sys.executable, str(HERE / "synthesize.py"),
                       "--workspace", str(workspace)]).returncode != 0:
        print("Synthesize failed.", file=sys.stderr)
        sys.exit(1)

    print(f"\n✅ Done.")
    print(f"   Spec:   {workspace}/spec.md")
    print(f"   Shots:  {workspace}/screenshots/")
    print(f"   Video:  {workspace}/videos/")
    print(f"\nNext: watch the video, fill in the Animation log section in spec.md, ")
    print(f"      then paste the Ready-to-use prompt (section 9) into v0.dev or Cursor.")


if __name__ == "__main__":
    main()
