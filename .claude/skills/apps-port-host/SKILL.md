---
name: apps-port-host
description: Port standalone apps/<brand> sections and components into the rexerai native block-editor so they run on the editor canvas and public /p/[id]. Use when the user says port apps/pnj, port apps/mintcoin, wire DiscoverPanel vào host, tách sub-component vs full block, drawer bị clip trên canvas, style không chỉnh được trên canvas, toolbar đổi color/font không thấy, sticky scrub không hiện trong preview, canvas edit layout khác preview, groupId LayersPanel, apps prototype → Pnj*/Mint* block, or bất kỳ apps/<brand> → block-editor wiring. Covers host adaptations (previewPortal, scroll-lock/Lenis, useContainerMobile, sticky/overlay sets), canvas-editable styles (tuyền inline + styleOf + data-element-key), canvas-edit surface vs preview (isCanvas — edit layout có thể khác, preview//p giữ production), LayersPanel groupId/fieldType, CMS types + BlockDef registry, and end-to-end verify. Distinct from framer-clone-host (Framer recon → scaffold); this skill starts from an already-working apps/ prototype.
---

# Apps → block-editor host port

Project-scoped skill for **rexerai** (`src/components/modules/block-editor/`). Input is a working prototype under `apps/<brand>/` (PNJ, mintcoin, …). Output is a block (or sub-component) that runs on the canvas **and** `/p/[id]`.

> Not the 360-admin-cms flow (`src/blocks/<name>/schema.ts`, Supabase). Not Framer recon — for Framer clones use `framer-clone-host`.

## vs framer-clone-host

| | `framer-clone-host` | `apps-port-host` |
|---|---|---|
| Input | Framer recon/clone | `apps/<brand>` prototype already running |
| Main work | Rewrite to GSAP + scaffold BlockDef | Keep app logic; adapt to host contract |
| Drawer/portal | Short edge case | First-class |
| Full vs sub | Almost always full block | Decision tree required |

Reuse (do not duplicate): BlockRenderProps skeleton, Path A/B registry details, GSAP R1–R6 → `../framer-clone-host/references/rexerai-block-integration.md`, `../framer-clone-host/references/gsap-motion-contract.md`. Authoritative repo docs: `docs/landing-motion-foundation.md`, `docs/canvas-block-responsive-spec.md`.

Host-specific detail: [references/host-adaptations.md](references/host-adaptations.md). Touchpoint tables: [references/wiring-checklist.md](references/wiring-checklist.md).

## Step 0 — Decision tree

```
apps/<brand> component
        │
        ├─ Standalone landing section (Hero, Variant, Details, CTA, Header, StickyMenu)
        │     → FULL BLOCK (BlockType + registry + factory defaults + BE seed)
        │
        └─ Parent-bound UI (Discover drawer, Hotspot overlay, frame helpers)
              → SUB-COMPONENT (file next to parent; import only; NO registry / NO type_code)
```

Canonical PNJ map:

| apps/pnj | Host | Kind |
|---|---|---|
| `sections/HeroIntroSection` | `PnjHero` | full |
| `sections/ProductVariantSection` | `PnjVariant` | full |
| `sections/DetailsSection` | `PnjDetails` | full |
| `Header` / `StickyMenu` / `CtaSection` | `PnjHeader` / `PnjStickyMenu` / `PnjCta` | full |
| `DiscoverPanel` | `PnjDiscoverPanel` | **sub** (used by `PnjVariant`) |
| `ProductHotspotUI` | `PnjHeroHotspots` | **sub** (+ shared `useDrawerScrollLock`) |
| frame helpers | `pnjHeroFrames.ts` etc. | **sub** (helpers) |

Wrong call: registering `PnjDiscoverPanel` as its own BlockType. Right call: wire it from the parent block.

## Non-negotiable — canvas styles (full blocks)

Every editable element must be **selectable AND styleable** on the canvas. Three things share one `<key>`:

1. `data-element-key='<key>'` — hit-test + selection
2. `style={composeStyle({ /* base inline tokens */ }, styleOf('<key>'))}` — editor color/font/size overrides merge on top
3. `className={selectableClass(activeKey === '<key>', 'block-target-class')}` — selection ring + GSAP target class only

`<key>` MUST match `elements[]` in BlockDef (and `content` field path for nested keys like `variants[0].label`).

Define once per block:

```tsx
const styleOf = (key: string) =>
  composeStyle(
    elementStyleOf(styles, key),
    orderStyle(order, key),
    positionStyle(positions, key)
  );
```

Helpers from `blocks/applyStyle.ts`. Full contract: `../framer-clone-host/references/rexerai-block-integration.md` §2.

**Tuyền inline rule:** design tokens (color, fontSize, fontWeight, spacing, …) go in the **inline base object**, NOT on Tailwind classes (`text-white`, `text-4xl`, `font-bold`) or `<style>` blocks. If a token lives only on a class, the editor toolbar cannot override it — the class wins.

When porting from `apps/<brand>`, migrate every important visual token from Tailwind/CSS into the inline base. Tailwind is for **structure only** (flex/grid/position + `@2xl`/`@4xl` reflow).

Reference: `PnjVariant.tsx` — `composeStyle({ color: '…', fontSize: 'clamp(…)' }, styleOf('ctaText'))` on every editable node.

## Non-negotiable — canvas edit surface ≠ preview (optional layout fork)

**Rule:** Canvas editor MAY render a different layout to make content/style editing easy. **PreviewMode + `/p/[id]` MUST stay production-faithful** — same composition, sticky/scrub, hide-inactive, motion. Never let edit affordances leak into preview or public page.

### Detect surfaces

| Surface | Signal | Layout |
|---|---|---|
| Editor canvas | `hasRoot` + inside `[data-testid="active-block-preview"]` → `isCanvas === true` | Edit-friendly (flat grid, show all items, skip pin/scrub) |
| PreviewMode (Play) | `hasRoot` + **not** in that node → `isCanvas === false` | Production layout + motion |
| Public `/p` | `!hasRoot` (`useLandingMotion` default) → `isCanvas === false` | Production layout + motion |

```tsx
const { hasRoot } = useLandingMotion();
const [isCanvas, setIsCanvas] = React.useState(true);

React.useLayoutEffect(() => {
  if (!hasRoot) {
    setIsCanvas(false); // /p
    return;
  }
  setIsCanvas(
    !!rootRef.current?.closest('[data-testid="active-block-preview"]')
  );
}, [hasRoot]);
```

### When to fork canvas layout

Use a separate `if (isCanvas) return (…)` branch when production UX **hides or pins** content so authors cannot click/select every field:

- Sticky / pin / scrub stages (inactive slides opacity 0)
- Radial / stacked satellites only visible mid-scroll
- Carousel / case scrub that shows one item at a time
- Tall pin tracks that waste canvas height

**Canvas branch:**

1. Mark root `data-canvas-edit='true'`
2. Flat/grid layout showing **all** editable nodes with `data-element-key` + `styleOf`
3. `height: 'auto'` / sensible `minHeight` — no multi-viewport pin track
4. Skip GSAP pin/scrub in `useBlockMotion` when `isCanvas` (`if (isCanvas) return`)

**Preview + `/p` branch:** keep the real apps layout + motion unchanged.

Canonical refs: `HousentOurExcellence.tsx`, `ReadymagCaseSection.tsx`, `FramerIgnitexStep.tsx`, `PnjVariant.tsx` / `PnjDetails.tsx` / `ScrollMattis.tsx`.

**Do not:** change PreviewMode or `/p` to match the edit grid; put `selectableClass` hover rings on live form `<input>` that ship to `/p` (see `PnjCta` — placeholders edited via Layers, not on the input DOM).

## LayersPanel — `fieldType` + `groupId` (easy content entry)

Editing content is primarily Layers + ElementToolbar, not only click-on-canvas. In BlockDef `elements[]`:

| Field | Purpose |
|---|---|
| `fieldType` | `'text'` \| `'textarea'` \| `'image'` — toolbar control (avoid guessing from key name) |
| `groupId` | Contiguous same id → one collapsible folder in panel Lớp |
| `groupLabel` | Folder title — set on the **first** child of the group only |

```ts
// Contiguous runs share groupId → 1 folder (buildLayerTree in LayersPanel)
{ key: 'emailLabel', label: 'Nhãn', groupId: 'email', groupLabel: 'Ô Email', fieldType: 'text', icon: Tag },
{ key: 'emailPlaceholder', label: 'Placeholder', groupId: 'email', fieldType: 'text', icon: TextCursorInput },
```

Opt-in: omit `groupId` → flat list. Use groups for paired fields (label+placeholder, itemN label+icon, slide fields).

Refs: `pnjCta.ts`, `housentOurExcellence.ts`, `sustainitOurExpertise.ts`. Arrays still need `LayersPanel.elementsForType` expand (step 7 below).

## Workflow — full block

1. **Read source** in `apps/<brand>/…` — hard-coded props, viewport `matchMedia` / `useIsMobile`, window ScrollTrigger, `md:`/`lg:`/`fixed` drawers, local Lenis.
2. **CMS shape** in `types.ts`: `BlockType` literal, `XxxContent` (+ nested item types), add to `BlockContent` union, `BLOCK_TYPE_META[type]` (required even with Path A).
3. **Component** `blocks/<BrandName>.tsx`: `'use client'`, full `BlockRenderProps` (`content`, `styles`, `background`, `order`, `positions`, `activeKey`). Wire canvas styles on every editable node: `data-element-key` + `composeStyle(baseInline, styleOf(key))` + `selectableClass`. Migrate tokens from apps Tailwind/CSS → inline base (see **Non-negotiable — canvas styles**). If pin/scrub/hide-inactive blocks editing, add **canvas edit fork** (`isCanvas` + `data-canvas-edit`) — edit layout may differ; PreviewMode + `/p` keep production (see **canvas edit surface ≠ preview**). Root `@container`, structure via `@2xl`/`@4xl`/`cqi` only — no `md:`/`lg:`/`vw`. See canvas R1–R10.
4. **Motion**: `useBlockMotion` or `useLandingMotion` + `gsap.context`; pass `scroller` on every `scrollTrigger`; `requestRefresh()` after media load. Guard pin/scrub with `if (isCanvas) return`. No `new Lenis`, no `gsap.registerPlugin` inside the block. Prefer keeping the app’s GSAP timings; only rewire to the host API.
5. **Mobile**: `useContainerMobile(rootRef)` (or pass `isMobile` into children). Never viewport `matchMedia` for layout breakpoints inside a canvas block.
6. **Register Path A** (preferred):
   - `blocks/_registry/defs/<name>.ts` → `BlockDef` (`type`, `meta`, `component` via `dynamic()`, `defaultContent` vi/en, `elements[]` with `fieldType`; use `groupId`/`groupLabel` when fields cluster)
   - one line in `blocks/_registry/registry.ts`
   - complete `factory.ts` `DEFAULTS_VI` / `DEFAULTS_EN` (`Record<BlockType, …>` must compile)
   - optional: `ORDERED_TYPES` in `AddBlockDialog.tsx` for catalog order (registry still surfaces the type)
7. **Arrays / nested CMS**: expand in `LayersPanel.elementsForType` (see `pnj_variant` / `pnj_hero` / `pnj_details`); update `resolveElementKind.ts`; add `ElementToolbar` controls when fields are not plain text/image (hotspots, frames, scrim, titleLines manager). Flat paired fields → prefer `groupId` in BlockDef instead of custom expand.
8. **Canvas sets** in `BlockPreview.tsx`:
   - sticky scrub / pin-track → `STICKY_SCROLL_BLOCK_TYPES`
   - fixed header chrome → `OVERLAY_TOP_BLOCK_TYPES`
9. **Assets**: put defaults under `public/<brand>/…` (or CDN URLs) in BlockDef `defaultContent`.
10. **BE seed**: one `blocks` row, `scope=system`, `type_code` = FE block type. Without it: preview + `/p` work; **version commit → 400**. FE repo does not own Go migrations — note the seed as a BE follow-up. Pattern: `scripts/prod-block-catalog.sql`.
11. **Verify** (section below) before declaring done.

## Workflow — sub-component / drawer

1. Port next to the parent (`blocks/PnjDiscoverPanel.tsx`). **Do not** add `BlockType` / registry / BE seed.
2. Replace hard-coded props with CMS shapes from the parent (`variants: PnjVariantItem[]` instead of `images: { dial, profile, caseback }`).
3. **Portal required**: `createPortal` + `resolveDrawerPortalHost` / `isDeviceFrameHost` from `previewPortal.ts`. `@container` on the block root breaks `position: fixed` (clipping in device frame).
4. **Scroll lock**: reuse `useDrawerScrollLock` from `PnjHeroHotspots` (or extract shared if a new brand needs it). Put `data-lenis-prevent` on the scrollable panel.
5. Accept `isMobile` + optional `behindRef` from parent; parent owns open/close state.
6. Prefix local classes (`.pnj-discover-prev`) — block DOM is shared across the page.
7. **Canvas styles:** drawer/overlay chrome is usually NOT independently editable. Editable text/images live on the **parent full block** (`PnjVariant` owns `variants[i].label`, `ctaText`, etc.). Only wire `styles`/`activeKey`/`data-element-key` into a sub-component if the parent explicitly forwards them.
8. Verify drawer on **device-frame preview** and on **`/p`** (body portal).

Details: [references/host-adaptations.md](references/host-adaptations.md).

## Verify — block runs end-to-end

Copy and tick before finishing:

```
Port verify:
- [ ] tsc / type-check clean
- [ ] Full block: types + meta + union + BlockDef + registry line + factory DEFAULTS
- [ ] Full block: ORDERED_TYPES updated if catalog order matters
- [ ] Editable keys: data-element-key matches elements[] / LayersPanel expand
- [ ] elements[]: fieldType set; groupId/groupLabel when paired fields (Layers folders)
- [ ] Canvas: block renders; click element → highlight + toolbar fieldType correct
- [ ] Style override: select element → change color/fontSize in toolbar → visible on canvas immediately
- [ ] No important design tokens left only on Tailwind classes (text-*/text-[…]/font-*)
- [ ] If pin/scrub/hide-inactive: isCanvas edit fork shows all fields; PreviewMode + /p keep production layout (no edit grid leak)
- [ ] Motion skipped or safe on isCanvas; pin/scrub plays in PreviewMode and /p
- [ ] Device frame resize: layout follows @container/cqi (not viewport md:)
- [ ] /p/[id]: renders; scroll entrance / scrub plays with scroller
- [ ] Sticky/overlay: STICKY_SCROLL / OVERLAY_TOP sets updated if needed
- [ ] Drawer (if any): no clip in device frame; scroll lock; Lenis resumes on close
- [ ] Sub-component: NOT registered as BlockType
- [ ] BE seed noted (or "preview-only until seed")
```

If a wiring grep script exists under `framer-clone-host/scripts/`, run it for full blocks.

After port (or when unsure a convert is complete): run **`apps-port-audit`** on the block — structured PASS/FAIL + proposed fixes without re-doing the whole port workflow.

## Common failures

| Symptom | Likely cause |
|---|---|
| Drawer clipped / wrong position in preview | Missing portal / not using `isDeviceFrameHost` for `absolute` vs `fixed` |
| Scroll stuck after closing drawer | Scroll lock cleanup / Lenis not `start()` |
| Layout always desktop in mobile frame | `useIsMobile` / `md:` instead of `useContainerMobile` / `@2xl` |
| Sticky stage blank in editor | Type missing from `STICKY_SCROLL_BLOCK_TYPES` |
| Element not selectable | Missing `data-element-key` or not in `elements[]` / expand |
| Toolbar style change not visible | Token on Tailwind class instead of inline base / missing `styleOf(key)` / key mismatch |
| Cannot edit items hidden by scrub/pin | Need `isCanvas` edit fork (flat grid + skip motion); see HousentOurExcellence / ReadymagCaseSection |
| Preview or `/p` shows edit grid / missing motion | `isCanvas` detection wrong, or production branch accidentally shares canvas layout |
| Layers panel flat / hard to find fields | Missing `groupId`/`groupLabel` on contiguous paired elements |
| Block missing from Add dialog | Not in registry / `ORDERED_TYPES` |
| Version commit 400 | BE `type_code` not seeded |
| Animation wrong scroll position in editor zoom ≠ 100% | Expected — `/p` is source of truth |

## Out of scope

- Framer recon / clone pipeline
- 360-admin-cms schemas
- Actually seeding / migrating the Go BE from this FE skill run
- Post-port readiness audit → use [`../apps-port-audit/SKILL.md`](../apps-port-audit/SKILL.md)
