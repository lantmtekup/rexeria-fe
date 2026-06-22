#!/usr/bin/env python3
"""
save-auth-state.py — Open browser, let user login manually, save Playwright
storage state (cookies + localStorage) to JSON file. Capture/extract scripts
reuse it via --auth-state.

Usage:
    python save-auth-state.py --url <LOGIN_URL> --out <PATH_TO_JSON>

Example:
    python save-auth-state.py \\
        --url http://localhost:5005/auth/sign-in \\
        --out ./recon-auth.json
    # → browser opens, user logs in, press Enter in terminal when done

The output JSON can be reused by `capture.py --auth-state ./recon-auth.json`.

Notes:
- Storage state expires when server invalidates session. Re-run on auth errors.
- File contains session tokens — treat as secret. Add to .gitignore.
- Works for any auth flow (form, OAuth redirect, magic link) — user does the
  flow in the visible browser, script just snapshots final state.
"""

import argparse
import sys
from pathlib import Path


def ensure_playwright():
    try:
        import playwright  # noqa: F401
    except ImportError:
        import subprocess
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "playwright", "--break-system-packages"],
            check=True,
        )
        subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            check=True,
            capture_output=True,
        )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True, help="URL of login page")
    ap.add_argument("--out", required=True, help="Where to save storage state JSON")
    args = ap.parse_args()

    ensure_playwright()
    from playwright.sync_api import sync_playwright

    out_path = Path(args.out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.goto(args.url)

        print(f"\n→ Browser opened at: {args.url}")
        print("→ Complete login manually in the browser.")
        print("→ When you're authenticated (you see the post-login page),")
        print("  return here and press Enter to save the session.\n")

        try:
            input("Press Enter when login is complete (Ctrl+C to abort)... ")
        except KeyboardInterrupt:
            print("\nAborted.")
            browser.close()
            sys.exit(1)

        context.storage_state(path=str(out_path))
        print(f"\n✓ Saved storage state → {out_path}")
        print(f"  Cookies + localStorage captured.")
        print(f"  Reuse: --auth-state {out_path}")
        browser.close()


if __name__ == "__main__":
    main()
