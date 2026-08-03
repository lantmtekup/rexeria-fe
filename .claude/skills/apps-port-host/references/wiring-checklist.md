# Wiring checklist — full block / sub / drawer

Paths are under `src/components/modules/block-editor/` unless noted.

## Must-do — every FULL addable block

| # | Touchpoint | Path / action |
|---|---|---|
| 1 | `BlockType` literal | `types.ts` |
| 2 | `XxxContent` (+ nested types) | `types.ts` |
| 3 | `BlockContent` union member | `types.ts` |
| 4 | `BLOCK_TYPE_META[type]` | `types.ts` (required even with Path A) |
| 5 | Component `BlockRenderProps` | `blocks/<Name>.tsx` — full props: `content`, `styles`, `background`, `order`, `positions`, `activeKey` |
| 5b | **Canvas styles wired** | `styleOf` helper + `composeStyle(baseInline, styleOf(key))` on every editable node; keys match `data-element-key` ↔ `elements[]`. Helpers: `blocks/applyStyle.ts` |
| 5c | **Canvas edit fork (if needed)** | `isCanvas` via `closest('[data-testid="active-block-preview"]')` + `hasRoot`; edit layout MAY differ (`data-canvas-edit`); PreviewMode + `/p` keep production. Skip pin/scrub when `isCanvas`. Refs: `HousentOurExcellence`, `ReadymagCaseSection` |
| 5d | **Layers UX** | BlockDef `elements[]`: `fieldType`; cluster with `groupId`/`groupLabel` when paired fields |
| 5e | **CTA / link (if any `<a>`)** | Tách text + href keys; `fieldType: 'link'` on href; DOM split; canvas `preventDefault`; `resolveSiblingLinkKey` + `resolveLinkAnchorKey` in v1 **and** v2 |
| 6 | Motion host API | `useBlockMotion` / `useLandingMotion` + `scroller` — see `docs/landing-motion-foundation.md` |
| 7 | Mobile via container | `blocks/useContainerMobile.ts` |
| 8 | BlockDef | `blocks/_registry/defs/<name>.ts` |
| 9 | Registry line | `blocks/_registry/registry.ts` → `BLOCK_REGISTRY` |
| 10 | Factory Record completeness | `factory.ts` — `DEFAULTS_VI` / `DEFAULTS_EN` entries |
| 11 | Assets in defaults | `public/<brand>/…` or CDN URLs in def `defaultContent` |
| 12 | BE seed note | Go + Postgres: 1 `blocks` row `scope=system`, `type_code` = FE type. Example pattern: `scripts/prod-block-catalog.sql`. Preview/`/p` work without seed; version commit needs it. |

## Usually — full block

| Touchpoint | Path / action |
|---|---|
| Catalog order | `AddBlockDialog.tsx` → `ORDERED_TYPES` |
| BlockDef contract detail | `../framer-clone-host/references/rexerai-block-integration.md` |

## Only-if — arrays / complex CMS

| Touchpoint | Path / action |
|---|---|
| Paired flat fields | BlockDef `groupId` + `groupLabel` (contiguous) — prefer before custom expand |
| Dynamic layer expand | `LayersPanel.tsx` → `elementsForType` (see `pnj_variant`, `pnj_hero`, `pnj_details`) |
| Nested key labels / kinds | `resolveElementKind.ts` (**v1 + v2**) — include `kind: 'link'` for `*.href` / `*.link` in arrays |
| Sibling CTA ↔ href | `resolveSiblingLinkKey` + `resolveLinkAnchorKey` in **both** `resolveElementKind.ts` files |
| Custom field UI | `ElementToolbar.tsx` |
| Content helpers (not registered) | e.g. `blocks/pnjHeroFrames.ts`, `pnjHeroScrim.ts`, `pnjHeroTitleLines.ts` |

## Only-if — pin/scrub hides content on canvas

| Touchpoint | Path / action |
|---|---|
| Detect editor canvas | `useLandingMotion().hasRoot` + `rootRef.closest('[data-testid="active-block-preview"]')` |
| Edit layout branch | `if (isCanvas)` → flat/grid, `data-canvas-edit='true'`, auto height |
| Motion guard | `useBlockMotion` early `if (isCanvas) return` |
| Preview + `/p` | Share the **production** branch only — no edit grid |

## Only-if — sticky scrub / fixed chrome

| Touchpoint | Path / action |
|---|---|
| Sticky track height on canvas | `BlockPreview.tsx` → `STICKY_SCROLL_BLOCK_TYPES` |
| Overlay header top-align | `BlockPreview.tsx` → `OVERLAY_TOP_BLOCK_TYPES` |

## Only-if — drawer / overlay / fixed UI

| Touchpoint | Path / action |
|---|---|
| Portal host | `previewPortal.ts` — `resolveDrawerPortalHost`, `isDeviceFrameHost` |
| `createPortal` | Sub-component or block chrome |
| Scroll lock | `blocks/PnjHeroHotspots.tsx` → `useDrawerScrollLock` (reuse) |
| Lenis-safe panel scroll | `data-lenis-prevent` on scrollable drawer body |
| `isMobile` / `behindRef` | Props from parent measured with `useContainerMobile` |

Detail: [host-adaptations.md](host-adaptations.md).

## SUB-COMPONENT only (Discover, Hotspots, helpers)

Do **all** of:

- [ ] New file under `blocks/` (or co-located helper `.ts`)
- [ ] Import from registered parent
- [ ] CMS-shaped props (no hard-coded product enums unless content-driven)
- [ ] Portal + scroll-lock if overlay
- [ ] Prefixed classes

Do **none** of:

- [ ] `BlockType` / `BLOCK_TYPE_META`
- [ ] BlockDef / registry line
- [ ] `factory` defaults
- [ ] `ORDERED_TYPES`
- [ ] BE `type_code` seed
- [ ] `STICKY_SCROLL` / `OVERLAY_TOP` (unless the **parent** needs them)

## Legacy Path B (avoid for new ports)

Only if matching an un-migrated block style:

`factory.ts` maps → `blocks/renderBlock.tsx` `case` → `LayersPanel` `ELEMENTS_BY_TYPE` → `AddBlockDialog` `ORDERED_TYPES`.

Prefer Path A for all new `apps/<brand>` ports.

## Verify matrix

| Surface | What “runs” means |
|---|---|
| Editor canvas | Block mounts; elements selectable; toolbar edits content **and styles** (color/fontSize); device frame resize reflows via `@container` |
| Canvas edit fork | If pin/scrub: edit layout shows all fields; PreviewMode Play still production |
| Layers UX | `fieldType` correct; `groupId` folders when declared |
| CTA / link | Click button text → chip "Đặt link"; href layer opens LinkControls (4 mode); canvas does not navigate |
| Canvas styles | Select element → toolbar style controls → inline override visible; no token trapped on Tailwind class only |
| Sticky/overlay | Stage not blank; header flush top |
| Drawer | Opens inside device frame without clip; locks scroll; unlocks Lenis on close; works on `/p` via body |
| `/p/[id]` | Renders via `src/app/p/[id]/_block-render.tsx` + `LandingMotionRoot`; scroll/scrub with `scroller`; **no** `data-canvas-edit` layout |
| Commit version | Needs BE seed; otherwise 400 unknown type |

## Quick file index

```
types.ts
factory.ts
AddBlockDialog.tsx
BlockPreview.tsx
LayersPanel.tsx
ElementToolbar.tsx
resolveElementKind.ts
block-editor-v2/resolveElementKind.ts
links/LinkControls.tsx
links/linkToken.ts
previewPortal.ts
blocks/<Name>.tsx
blocks/applyStyle.ts
blocks/useContainerMobile.ts
blocks/_registry/registry.ts
blocks/_registry/defs/<name>.ts
blocks/_registry/types.ts
motion/LandingMotion.tsx
docs/landing-motion-foundation.md
docs/canvas-block-responsive-spec.md
public/<brand>/**
apps/<brand>/app/components/**
```
