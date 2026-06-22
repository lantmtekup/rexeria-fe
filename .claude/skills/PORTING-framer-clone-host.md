# Porting `framer-clone-host` to a new project

`framer-clone-host` is the ONLY skill in this pack that is **not portable as-is**.
It wires a cloned Framer/animation block into the `360-admin-cms` host. It hard-codes
contracts that only exist in that repo. Before using it elsewhere, rewrite the
host-specific layer.

## What is coupled to 360-admin-cms (must re-map per project)
- **Block registry**: `BLOCK_TYPES` + `BLOCK_TIERS` arrays — target project's block list.
- **Sync RPC**: `Đồng bộ Block Types` Supabase RPC — target's block-registration mechanism.
- **Content keys**: `_motion` / `_motionEnabled` — target's motion-config convention.
- **Motion editor**: `rexerai` motion panel integration — target's animation editor (if any).
- **i18n mandate**: `useTranslation` requirement from the host CLAUDE.md.
- **Builder paths**: `src/blocks/*`, v2 block builder folder layout.

## What IS reusable (keep)
- The general flow: recon (framer-recon) → codegen (framer-clone) → wire into host.
- The standalone component output of `framer-clone` (Next.js + framer-motion + tailwind)
  is host-agnostic — only the wiring/registration step needs rewriting.

## Recommendation
If the new project has NO block-builder/CMS, drop `framer-clone-host` entirely and
use `framer-recon` + `framer-clone` to produce standalone components, then import them
directly. Only keep `framer-clone-host` if the new project also has a block registry +
motion editor to integrate with — and rewrite the contracts above first.
