---
name: framer-clone-host
description: Wire a Framer/animation-heavy block clone INTO the rexerai host (native block-editor + Go BE + GSAP motion foundation). Use after `framer-clone` produces standalone component code, OR to scaffold any custom native block from a `framer-recon` spec. Triggers — "wire block into rexerai", "tích hợp clone vào builder", "thêm block vào block-editor", "scaffold native block", "block không hiện trong AddBlockDialog", "block không chỉnh được trên canvas", "animation block không chạy GSAP". rexerai contract — single-file PascalCase `block-editor/blocks/<Name>.tsx`, BlockDef registry (`_registry/`) OR 7-touchpoint switch, `useBlockMotion` GSAP (contract R1–R6 in `docs/landing-motion-foundation.md`), `data-element-key` + `selectableClass()` + `styleOf()`, `@container`/`cqi`. Pairs with `framer-recon` (analysis) and `framer-clone` (standalone codegen) — this skill does the last mile into the live editor.
---

# Framer Clone — rexerai host integration

Project-scoped companion to `framer-clone`. This skill knows the **rexerai native block-editor** conventions so a cloned block integrates into the live editor + public `/p/[id]` renderer without rework.

> ⚠️ This skill is for the **rexerai** repo (`src/components/modules/block-editor/`). It is NOT the 360-admin-cms flow (no `src/blocks/<name>/schema.ts`, no `EditableContainer`, no Supabase `sync_block_types` RPC, no framer-motion `getFieldMotion`). Those patterns DO NOT apply here.

## Prerequisite

1. **A spec** from `framer-recon` — ideally with `--cdp` so the animation section has real timing values.
2. **(Optional) Standalone code** from `framer-clone` — or scaffold directly from the spec. Either way the code gets **rewritten to the rexerai contract** below (props shape, editable markup, GSAP motion). Don't paste a framer-motion standalone component in unchanged.

## The three non-negotiables

1. **Block component contract** — every block is a single-file `'use client'` component taking `BlockRenderProps`, with editable elements marked `data-element-key` + `selectableClass()` + `styleOf()`. See `references/rexerai-block-integration.md` §2.
2. **Tuyền inline + responsive** — design tokens (font-size/color/spacing/…) live in inline `style={composeStyle(base, styleOf(key))}`, NOT on Tailwind classes or `<style>` blocks (so the editor's per-element override applies and the "inline beats class" trap is impossible). Responsive via `clamp(min, N·cqi, max)`; `@container` + 3-tier `@2xl`/`@4xl` reflow; touch ≥44px. No `@media`/`md:`/`lg:`/`vw`. Authoritative: `docs/canvas-block-responsive-spec.md` (R1–R10).
3. **GSAP motion contract R1–R6** — all scroll/entrance animation goes through `useBlockMotion` (or `useLandingMotion` for complex blocks). No `new Lenis`, no `gsap.registerPlugin`, no `window` scroll listeners inside a block. framer-motion is allowed ONLY for per-character text stagger. See `references/gsap-motion-contract.md`.

## When to use

The deliverable is "block working in the rexerai editor + on `/p/[id]`", not "standalone page". Triggers:

- "Tích hợp clone này vào block-editor"
- "Scaffold block X từ spec"
- "Animation không chạy / giật trên canvas" → likely violating R1/R3 (missing `scroller`) or registering plugins inside the block
- "Block không xuất hiện trong AddBlockDialog" → missing from `ORDERED_TYPES` / registry
- "Element không chọn/sửa được trên canvas" → missing `data-element-key` / not in `elements[]` / `ELEMENTS_BY_TYPE`

## Two registration paths — pick ONE

| Path | When | Cost |
|---|---|---|
| **A — BlockDef registry** (preferred for new blocks) | New block, want minimal wiring | 1 def file + 1 line in `_registry/registry.ts`. renderBlock/factory/LayersPanel/AddBlockDialog read it registry-first. |
| **B — Legacy 7-touchpoint switch** | Matching an existing un-migrated block's style, or registry not desired | Edit 7 spots in `types.ts`/`factory.ts`/`renderBlock.tsx`/`LayersPanel.tsx`/`AddBlockDialog.tsx`. |

Path A still needs the `BlockType` union + `XxxContent` interface in `types.ts` (the registry is typed against them). Full enumeration with code in `references/rexerai-block-integration.md`.

## Workflow

```
spec.md (framer-recon, ideally --cdp)
   ↓
[1] Read spec → extract per-element entrance timing + easing (→ GSAP vars/eases)
   ↓
[2] Add BlockType + XxxContent interface + BLOCK_TYPE_META (types.ts)
   ↓
[3] Write blocks/<Name>.tsx — BlockRenderProps + data-element-key + @container/cqi
   ↓
[4] Wire animation with useBlockMotion (R1–R6), scroller on every scrollTrigger
   ↓
[5] Register — Path A: 1 def + registry line.  Path B: factory + renderBlock + LayersPanel + AddBlockDialog
   ↓
[6] BE seed: 1 `blocks` row (scope=system) for the new type_code, else version commit → 400
   ↓
[7] Verify: tsc clean → editor canvas (select/edit element) → /p[id] (scroll entrance plays)
```

## Step 1 — Read spec, map timing to GSAP

Open `recon-<name>/spec.md`, animation section. For each element capture: entrance type, duration, delay, easing (cubic-bezier). Translate to GSAP:

- `cubic-bezier(a,b,c,d)` → `CustomEase.create('x','M0,0 ...')` OR the nearest named ease (`power2.out`, `power3.out`, `expo.out`). Most Framer hero eases ≈ `power3.out` / `expo.out`. See `framer-clone/references/common-easings.md` for the bezier→named table.
- duration in **seconds** for GSAP (`duration: 0.8`), delay via `stagger` or `delay`.
- Keep the bundle var as a comment: `// ease ≈ var Ze (yuya bundle) → power3.out`.

## Step 2 — Declare the type

In `src/components/modules/block-editor/types.ts`: add the `BlockType` literal, the `XxxContent` interface, add it to the `BlockContent` union, and add a `BLOCK_TYPE_META` entry (label/accent/gradient/aiLabelVi/aiLabelEn). Default content (VI/EN) goes in the BlockDef (Path A) or `factory.ts` (Path B).

## Step 3 — Write the component

`blocks/<Name>.tsx`, single file. Skeleton (full version in `references/rexerai-block-integration.md` §2):

```tsx
'use client';
import * as React from 'react';
import gsap from 'gsap';

import { useBlockMotion } from '../motion/LandingMotion';
import type { BlockBackground, ElementPositionsMap, ElementStylesMap, XxxContent } from '../types';
import { blockBackgroundStyle, composeStyle, elementStyleOf, orderStyle, positionStyle, selectableClass } from './applyStyle';

interface Props {
  content: XxxContent;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
}

export function Xxx({ content, styles, background, order, positions, activeKey }: Props) {
  const rootRef = React.useRef<HTMLElement>(null);
  const styleOf = (key: string) =>
    composeStyle(elementStyleOf(styles, key), orderStyle(order, key), positionStyle(positions, key));

  useBlockMotion(rootRef, ({ scroller }) => {
    const root = rootRef.current;
    if (!root) return;
    const title = root.querySelector<HTMLElement>('.xxx-title');
    if (title) {
      gsap.fromTo(title, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: root, scroller, start: 'top 85%', toggleActions: 'play none none reverse', invalidateOnRefresh: true },
      });
    }
  }, []);

  return (
    <section ref={rootRef} style={blockBackgroundStyle(background)} className='xxx @container relative w-full overflow-hidden'>
      <h1 data-element-key='title' style={composeStyle({ fontSize: 'clamp(40px, 7.5cqi, 72px)' }, styleOf('title'))}
          className={selectableClass(activeKey === 'title', 'xxx-title')}>
        {content.title}
      </h1>
    </section>
  );
}
```

**Rules:**
- Props EXACTLY `{ content, styles, background, order, positions, activeKey }` (matches `BlockRenderProps`). No `className` needed unless you forward it.
- Every editable element: `data-element-key='<key>'` + `style={composeStyle(<base>, styleOf('<key>'))}` + `className={selectableClass(activeKey === '<key>', '<animation-target-class>')}`. The `<key>` MUST match the `elements[]` / `ELEMENTS_BY_TYPE` key exactly.
- **Tuyền inline**: every design token (size/color/spacing) goes in the inline `<base>` object, never on a Tailwind class or `<style>` rule — otherwise the editor can't override it. Responsive = `clamp(min, N·cqi, max)` inside that inline value.
- `@container` on the root `<section>`; Tailwind classes for STRUCTURE only (flex/grid/position + `@2xl`/`@4xl` reflow). NEVER `md:`/`lg:`/`vw`/`@media`.
- Prefix every block-local class with the kebab name (`.xxx-title`) — `<style>`/querySelector scope is shared.

## Step 4 — Animation (R1–R6, GSAP-first)

See `references/gsap-motion-contract.md` for the full contract. The short form:

- **R1**: animate only inside `useBlockMotion(rootRef, build, deps)`. The hook owns `gsap.context` + cleanup. For a block with its own listeners/observers/SplitType, use `useLandingMotion()` + `gsap.context` + `return () => ctx.revert()`.
- **R3**: pass `scroller` (from the api) to EVERY `scrollTrigger` + `invalidateOnRefresh: true`.
- **R4**: after image/canvas load → `requestRefresh()`.
- **framer-motion** is permitted ONLY for per-char text stagger (e.g. `motion.span` with `delay: i*0.07`), as in `blocks/FramerPerformHero.tsx`. For a pure-GSAP title use `SplitType` + `gsap.fromTo(split.chars, ...)` as in `blocks/MintV2Works.tsx`. **Default to GSAP**; reach for framer-motion only when the char-stagger is simpler that way.
- **Reduced motion**: bail early — `if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;` (Lenis smooth-scroll is already gated in `LandingMotionRoot`).

## Step 5 — Register (pick path A or B)

**Path A (registry, preferred):** create `blocks/_registry/defs/<name>.ts` exporting a `BlockDef` (type, meta, component, defaultContent {vi,en}, elements[]) and add one line to `blocks/_registry/registry.ts` `BLOCK_REGISTRY`. Also add the type to `ORDERED_TYPES` in `AddBlockDialog.tsx` (that list is manual — not registry-driven). Done.

**Path B (legacy switch):** `factory.ts` (VI/EN defaults + maps) → `renderBlock.tsx` (`case`) → `LayersPanel.tsx` (`ELEMENTS_BY_TYPE`) → `AddBlockDialog.tsx` (`ORDERED_TYPES`). See `references/rexerai-block-integration.md` §3.

## Step 6 — BE seed

rexerai BE is **Go + Postgres** (no Supabase, no client-side migration). A new `type_code` needs **one seed `blocks` row at scope `system`**, or committing a version returns `400 unknown block type`. This is a BE task (repo read-only — see project memory `be-readonly-policy`). Until seeded, the block still **previews** in the editor and renders on `/p`, but you can't commit a version with it.

## Step 7 — Verify

1. `npx tsc --noEmit` clean.
2. Editor canvas: block renders; click each element → it highlights (`selectableClass`) and the toolbar opens with the right control (text/textarea/image from `fieldType`).
3. `/p/[id]`: scroll the block into view → entrance plays once; scroll away+back → replays (`toggleActions: 'play none none reverse'`).
4. Resize the canvas device picker → layout adapts via `@container`/`cqi` (not pegged to desktop).
5. `helper/verify-block-wiring.sh <type> <Name>` greps that all touchpoints exist.

## Edge cases

- **Animation runs at wrong scroll position in editor** — expected: editor canvas uses `transform: scale()` per zoom, so ScrollTrigger math is off at zoom ≠ 100%. Output on `/p` is correct. Don't "fix" it in the block.
- **Element won't select on canvas** — missing `data-element-key`, OR key not in `elements[]`/`ELEMENTS_BY_TYPE`, OR no `selectableClass`.
- **Block missing from Add dialog** — not in `ORDERED_TYPES` (manual list, even Path A needs it).
- **Animation janky on iOS** — don't GSAP-`pin` on mobile; use CSS `position: sticky`. See project memory `feedback_ios_scroll_pin`.
- **Drawer/overlay clipped to block** — `@container` on root makes it the containing block for `position: fixed`. Portal the overlay to `document.body` (R5), as `blocks/MintV2Works.tsx` does for its lightbox.
- **Version commit 400** — BE hasn't seeded the `type_code` (Step 6).

## Reference files

- `references/rexerai-block-integration.md` — Component contract + all 7 wiring touchpoints (registry-first + legacy), with real symbol names/paths.
- `references/gsap-motion-contract.md` — R1–R6 verbatim + `useBlockMotion`/`useLandingMotion` usage + simple vs complex block templates + reduced-motion + text-stagger.

Authoritative source in the repo: `docs/landing-motion-foundation.md` (R1–R6 + add-a-block checklist). If it diverges from these references, the repo doc wins — re-sync the skill.

## Scripts

- `scripts/verify-block-wiring.sh <type_code> <ComponentName>` — greps the block's touchpoints (type union, meta, renderBlock/registry, LayersPanel, AddBlockDialog) and reports what's missing. No DB calls (BE is Go, seed is a BE task).
