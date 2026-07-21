# Audit checklist — signals & fix pointers

Use while auditing a ported block. Do **not** re-teach porting — follow the Fix pointer into `apps-port-host`.

Paths under `src/components/modules/block-editor/` unless noted.

## Full block — wiring

| Check | Signal (grep / read) | Fix pointer |
|---|---|---|
| Component exists | `blocks/<Name>.tsx` | apps-port-host Workflow §3 |
| `BlockRenderProps` shape | props: `content`, `styles`, `background`, `order`, `positions`, `activeKey` | wiring-checklist §5 |
| BlockType + meta + union | `types.ts` has `'type_code'`, content type, `BLOCK_TYPE_META` | apps-port-host Workflow §2 |
| Path A registry | `blocks/_registry/defs/<name>.ts` + line in `registry.ts` | wiring-checklist §8–9 |
| Factory defaults | `factory.ts` `DEFAULTS_VI` / `DEFAULTS_EN` | wiring-checklist §10 |
| Catalog order | `AddBlockDialog.tsx` `ORDERED_TYPES` (usually) | wiring-checklist Usually |
| Script smoke | `verify-block-wiring.sh <type> <Name>` exit 0 | framer-clone-host/scripts |

## Canvas styles & selection

| Check | Signal | Fix pointer |
|---|---|---|
| Selectable | `data-element-key` on editable nodes | apps-port-host Non-negotiable — canvas styles |
| Style merge | local `styleOf` + `composeStyle(baseInline, styleOf(key))` | host-adaptations §2 |
| Selection ring | `selectableClass(activeKey === key, …)` | host-adaptations §2 |
| Tuyền inline | Important color/size/weight **not** only on `text-*` / `font-*` / `<style>` | apps-port-host Tuyền inline rule |
| Key sync | Keys match BlockDef `elements[]` (and expand paths) | wiring-checklist §5b |

## LayersPanel UX

| Check | Signal | Fix pointer |
|---|---|---|
| `fieldType` | Each element has `'text' \| 'textarea' \| 'image'` | apps-port-host LayersPanel — fieldType + groupId |
| `groupId` folders | Contiguous paired fields share `groupId`; first has `groupLabel` | host-adaptations §2c; refs `pnjCta.ts`, `housentOurExcellence.ts` |
| Dynamic arrays | Length varies → `LayersPanel.elementsForType` + `resolveElementKind` | wiring-checklist Only-if arrays |
| Custom controls | Hotspots/frames/scrim → `ElementToolbar` | host-adaptations §8 |

## Canvas edit surface ≠ preview

| Check | Signal | Fix pointer |
|---|---|---|
| Detect `isCanvas` | `hasRoot` + `closest('[data-testid="active-block-preview"]')` | host-adaptations §2b |
| Edit fork when needed | Pin/scrub/hide-inactive → `if (isCanvas)` flat/grid + `data-canvas-edit='true'` | apps-port-host canvas edit surface ≠ preview |
| Motion guard | `useBlockMotion` early `if (isCanvas) return` | host-adaptations §2b |
| Preview + `/p` clean | Production branch shared; no edit-grid leak when `!isCanvas` / `!hasRoot` | same |

**N/A** if block has no pin/scrub/hide-inactive and all fields are always clickable on canvas.

## Motion & mobile

| Check | Signal | Fix pointer |
|---|---|---|
| Host motion API | `useBlockMotion` or `useLandingMotion` + `gsap.context` | host-adaptations §5 |
| `scroller` | Every `scrollTrigger` includes `scroller` | docs/landing-motion-foundation.md |
| No local Lenis/plugin | No `new Lenis`, no `gsap.registerPlugin` in block | host-adaptations §5 |
| Container mobile | `useContainerMobile` / `@2xl`/`@4xl`/`cqi`; no layout `md:`/`useIsMobile` | host-adaptations §4 |

## Sticky / overlay / drawer

| Check | Signal | Fix pointer |
|---|---|---|
| Sticky scrub set | Type in `BlockPreview.tsx` `STICKY_SCROLL_BLOCK_TYPES` if pin track | wiring-checklist sticky |
| Overlay header set | Type in `OVERLAY_TOP_BLOCK_TYPES` if fixed chrome | wiring-checklist overlay |
| Portal | `createPortal` + `resolveDrawerPortalHost` / `isDeviceFrameHost` | host-adaptations §1 |
| Scroll lock | `useDrawerScrollLock`; `data-lenis-prevent` on panel | host-adaptations §3 |

## Sub-component only

| Check | Signal | Fix pointer |
|---|---|---|
| Not registered | No `BlockType` / BlockDef / factory / BE seed for the sub | apps-port-host Workflow — sub |
| CMS from parent | Props shaped from parent content | same |
| Editable on parent | Keys live on parent full block, not drawer chrome | apps-port-host sub §7 |

## Severity guide

| Level | Examples |
|---|---|
| P0 | Missing registry/types; no `data-element-key`; tokens only on Tailwind so toolbar style dead; drawer clipped (no portal); pin stage blank (missing sticky set) |
| P1 | No `isCanvas` fork when scrub hides items; missing `groupId`/`fieldType`; `md:` breakpoints |
| P2 | `ORDERED_TYPES` order; BE seed note; class prefix polish |

## Verdict rules

- **FAIL** — any P0, or ≥2 P1 that block authoring.
- **PASS_WITH_NOTES** — only P1/P2 that do not block basic edit + `/p`.
- **PASS** — checklist N/A or PASS; script green (full blocks).
