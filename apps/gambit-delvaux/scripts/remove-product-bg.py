#!/usr/bin/env python3
"""Remove background from product1/2/3 PNGs in public/.

Default: write product{N}-nobg.png (keeps originals).
Use --inplace to overwrite product{N}.png (creates .bak first).
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from rembg import remove

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
PRODUCTS = ("product1.png", "product2.png", "product3.png")


def resolve_paths(name: str, inplace: bool) -> tuple[Path, Path]:
    src = PUBLIC / name
    if inplace:
        return src, src
    stem = Path(name).stem
    return src, PUBLIC / f"{stem}-nobg.png"


def process(src: Path, dest: Path, inplace: bool) -> None:
    if not src.is_file():
        raise FileNotFoundError(f"Missing input: {src}")

    data = src.read_bytes()
    result = remove(data)

    if inplace:
        bak = src.with_suffix(src.suffix + ".bak")
        shutil.copy2(src, bak)
        print(f"  backup → {bak.name}")

    dest.write_bytes(result)
    print(f"  {src.name} → {dest.name} ({len(result):,} bytes)")


def main() -> int:
    parser = argparse.ArgumentParser(description="Remove BG from product PNGs")
    parser.add_argument(
        "--inplace",
        action="store_true",
        help="Overwrite product{N}.png (writes .bak first)",
    )
    args = parser.parse_args()

    print(f"public: {PUBLIC}")
    for name in PRODUCTS:
        src, dest = resolve_paths(name, args.inplace)
        print(f"\nProcessing {name}...")
        process(src, dest, args.inplace)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1)
