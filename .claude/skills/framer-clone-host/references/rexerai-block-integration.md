# rexerai native block — component contract + wiring topology

Everything needed to make a cloned block a first-class rexerai block. Paths are under `src/components/modules/block-editor/`.

> This replaces the old 360-admin-cms flow. rexerai has NO `src/blocks/<name>/schema.ts`, NO `defineBlock`, NO `EditableContainer/Text/Image`, NO `register-blocks.ts`, NO Supabase migration/RPC. Don't look for them.

---

## 1. Discover an existing sibling FIRST

Read one block close to what you're cloning, in full, before writing:

```bash
cd src/components/modules/block-editor
# a simple GSAP hero:
sed -n '1,120p' blocks/FramerPerformHero.tsx
# a complex GSAP block (SplitType, portal, own context):
sed -n '1,200p' blocks/MintV2Works.tsx
# a migrated registry def:
cat blocks/_registry/defs/framerYumeHero.ts
# the style helpers every block uses:
cat blocks/applyStyle.ts
```

Match the sibling's prop destructuring, `styleOf` usage, and class-prefix style exactly.

---

## 2. Component contract

A block is a single `'use client'` file `blocks/<Name>.tsx`, PascalCase, exporting a named function `Xxx`.

### Props — `BlockRenderProps`

```tsx
interface Props {
  content: XxxContent;            // the editable data (typed in types.ts)
  styles?: ElementStylesMap;      // per-element color/font overrides from the editor
  background?: BlockBackground;   // block-level bg override
  order?: string[];               // element reorder (CSS order)
  positions?: ElementPositionsMap;// free-drag offsets (transform: translate)
  activeKey?: string | null;      // which element is currently selected on canvas
}
```

(Identical to `BlockRenderProps` in `blocks/_registry/types.ts`. `renderBlock.tsx` passes exactly these.)

### Style helpers — `blocks/applyStyle.ts`

| Helper | Signature | Role |
|---|---|---|
| `elementStyleOf` | `(styles, key) => CSSProperties \| undefined` | editor color/font overrides for an element |
| `orderStyle` | `(order, key, extra?) => CSSProperties \| undefined` | CSS `order` from element reorder |
| `positionStyle` | `(positions, key) => CSSProperties \| undefined` | `transform: translate()` from free-drag |
| `composeStyle` | `(...parts) => CSSProperties \| undefined` | merge partials, drop empties |
| `selectableClass` | `(active, base?) => string` | `cursor-pointer` + hover dashed outline + active ring |
| `blockBackgroundStyle` | `(background) => CSSProperties \| undefined` | block-level bg override on root |

Every block defines one local helper:

```tsx
const styleOf = (key: string) =>
  composeStyle(elementStyleOf(styles, key), orderStyle(order, key), positionStyle(positions, key));
```

### Editable element pattern

Each user-editable element needs THREE things, with a single shared `<key>`:

```tsx
<h1
  data-element-key='title'                                  // (1) makes it selectable + hit-testable
  style={composeStyle({ fontSize: 'clamp(40px,7.5cqi,72px)', margin: 0 }, styleOf('title'))} // (2) base + editor overrides, ALL inline
  className={selectableClass(activeKey === 'title', 'xxx-title')}   // (3) selection ring + animation-target class only
>
  {content.title}
</h1>
```

- `<key>` ('title') MUST equal the key in the block's `elements[]` (Path A) or `ELEMENTS_BY_TYPE` (Path B), and the field name in `XxxContent`.
- The extra class on `selectableClass` (`'xxx-title'`) is your GSAP querySelector target — prefix with the block kebab name. Keep it CLASS-FREE of design tokens (see inline rule below).

### ⭐ Write tokens INLINE ("tuyền inline") — the #1 rule

Every design token of an editable element — `fontSize`, `color`, `lineHeight`, `letterSpacing`, padding/margin, `background`, `borderRadius` — lives in the inline `style` via `composeStyle(<base>, styleOf(key))`. **Never** put these on a Tailwind utility class or in a `<style>` block. Two reasons:

1. The editor's per-element override (`elementStyleOf` → merged by `composeStyle`) produces **inline** style. A token sitting on a class can't be overridden by the editor — the Motion/Style panel edit silently no-ops.
2. It eliminates the "inline beats class" dead-zone: `style={{ fontSize: 174 }}` + `.x { font-size: … }` → inline wins → the responsive class never fires. If the value is already inline, there's no conflict.

**Responsive lives inside the inline value** via `clamp(min, N·cqi, max)` — `min` stops mobile overflow, `max` caps large screens, `cqi` tracks container width. So a heading is `style={{ fontSize: 'clamp(40px, 7.5cqi, 72px)' }}`, not `className='text-2xl @4xl:text-6xl'`.

**Tailwind classes are for STRUCTURE only:** `display`/`flex`/`grid`/`position`/`overflow`/`@container` and structural reflow breakpoints (`@2xl:grid-cols-2`, `@4xl:flex-row`). Never sizing/color tokens on editable elements.

🔴 Red flags in review: hardcoded px in inline (`fontSize: 174`), a sizing token on a className of an editable element, any `@media` (must be `@container`), any `md:`/`lg:`/`vw`.

### Layout — container queries (responsive R1–R10)

Authoritative: `docs/canvas-block-responsive-spec.md`. Essentials:

- **R1/R2** — `@container` on the root `<section>` (with `ref` + `blockBackgroundStyle`). Reflow with the 3 container tiers: base (mobile, no prefix) → `@2xl:` (tablet ≥672px) → `@4xl:` (desktop ≥896px). The editor canvas changes WIDTH not viewport, so `vw`/`md:`/`lg:` peg to desktop in preview.
- **R3** — mobile-first: default styles = mobile, larger tiers enhance.
- **R6** — mobile stack order (visual → title → body → stats → CTA) via `flex-col` + natural DOM order; avoid `order-*`.
- **R7** — on mobile hide ONLY decoration (`hidden @2xl:block`), never title/body/CTA.
- **R8** — touch targets ≥ 44px (`min-h-11`) for every CTA/button.
- **R10 (optional)** — per-device content/resource: a block MAY resolve `content.mobile.*` vs `content.desktop.*` (tablet falls back to desktop). Only wire this if the recon spec genuinely needs different crop/copy per device; otherwise one responsive variant via `cqi` is enough.
- Block-local class names: prefix with the kebab block name — `<style>`/querySelector scope is global.

### Animation

Via `useBlockMotion` / `useLandingMotion` — see `gsap-motion-contract.md`. Never set up scroll/Lenis/plugins in the block.

---

## 3. Wiring topology

### Always (both paths): `types.ts`

1. **BlockType union** — add `| 'xxx'` to `export type BlockType`.
2. **Content interface** — `export interface XxxContent { title: string; ... }`.
3. **BlockContent union** — add `| XxxContent`.
4. **BLOCK_TYPE_META** — add an entry:
   ```tsx
   xxx: {
     type: 'xxx', label: 'Hero - Xxx', accent: '#000', adminLabel: 'Hero - Xxx',
     gradient: 'from-neutral-700 to-neutral-900', defaultName: 'Hero - Xxx',
     aiLabelVi: 'block hero …', aiLabelEn: 'minimal hero block …',
   },
   ```

### Path A — BlockDef registry (preferred)

5A. Create `blocks/_registry/defs/<name>.ts`:
```tsx
import { Type, Image as ImageIcon } from 'lucide-react';
import { Xxx } from '../../Xxx';
import type { XxxContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: XxxContent = { title: '…', /* … */ };

export const xxxDef: BlockDef<XxxContent> = {
  type: 'xxx',
  meta: { /* same shape as BLOCK_TYPE_META entry */ },
  component: Xxx,
  defaultContent: { vi: VI, en: { ...VI } },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'imageUrl', label: 'Ảnh', icon: ImageIcon, fieldType: 'image' },
  ],
};
```
6A. Register — one line in `blocks/_registry/registry.ts`:
```tsx
import { xxxDef } from './defs/xxx';
export const BLOCK_REGISTRY: Partial<Record<BlockType, BlockDef>> = {
  framer_yume_hero: framerYumeHeroDef as BlockDef,
  xxx: xxxDef as BlockDef,            // ← added
};
```
`renderBlock`/`factory`/`LayersPanel` now resolve `xxx` registry-first automatically.

7A. **`AddBlockDialog.tsx`** — still add `'xxx'` to `ORDERED_TYPES` (manual list, NOT registry-driven; it controls display order in the Add dialog).

> `LayerElement` (in `LayersPanel.tsx`): `{ key, label, icon, fieldType?: 'text' | 'textarea' | 'image' }`. `fieldType` drives the toolbar control; declaring it (Path A `elements[]`) beats the legacy name-heuristic.

### Path B — legacy 7-touchpoint switch

If not using the registry, also edit:

5B. **`factory.ts`** — `XXX_VI` / `XXX_EN` content objects + add to the two default maps (`createBlock` returns correct defaults). `factory.ts` already imports `getBlockDef` and tries registry first.
6B. **`renderBlock.tsx`** — add a `case 'xxx': return <Xxx content={content as XxxContent} styles={styles} background={background} order={order} positions={positions} activeKey={activeKey} />;`. (Registry-first `getBlockDef()` runs before the switch.)
7B. **`LayersPanel.tsx`** — `ELEMENTS_BY_TYPE.xxx = [BACKGROUND_LAYER, { key:'title', label:'Tiêu đề', icon: Type }, …]`. `elementsForType()` resolves registry-first then this map. Array-typed elements (e.g. a list) need a kind+control in `ElementToolbar.tsx`.
8B. **`AddBlockDialog.tsx`** — add to `ORDERED_TYPES` (same as 7A).

### Touchpoint summary

| # | File | Symbol | A (registry) | B (legacy) |
|---|---|---|---|---|
| 1 | types.ts | `BlockType` union | ✅ | ✅ |
| 2 | types.ts | `XxxContent` + `BlockContent` union | ✅ | ✅ |
| 3 | types.ts | `BLOCK_TYPE_META` | ✅ | ✅ |
| 4 | _registry/defs/xxx.ts + registry.ts | `BlockDef` + `BLOCK_REGISTRY` | ✅ (replaces 5–7 of B) | — |
| 5 | factory.ts | `XXX_VI/EN` + maps | — | ✅ |
| 6 | blocks/renderBlock.tsx | `case 'xxx'` | — | ✅ |
| 7 | LayersPanel.tsx | `ELEMENTS_BY_TYPE.xxx` | — | ✅ |
| 8 | AddBlockDialog.tsx | `ORDERED_TYPES` | ✅ | ✅ |

---

## 4. Backend seed (Go BE)

rexerai BE is Go + Postgres. `type_code` is a free string (the `block_types` catalog was dropped — see project memory `project_blocks_no_block_type`). For a NEW type to be committable as a page version, BE seeds **one `blocks` row at scope `system`** for it — otherwise version commit → `400 unknown block type`. This is a BE-side task; the FE repo for BE is read-only (`be-readonly-policy`). The block still previews in the editor and renders on `/p/[id]` before the seed; only version-commit is gated.

---

## 5. Pre-commit checklist

- [ ] `blocks/<Name>.tsx` — `BlockRenderProps`, `data-element-key`+`selectableClass`+`styleOf` on every editable element
- [ ] **Tuyền inline**: all design tokens in `style={composeStyle(base, styleOf(key))}` (no sizing/color on classes, no `<style>` blocks); responsive via `clamp(min, N·cqi, max)`; NO hardcoded px for primary text/padding
- [ ] Responsive: `@container` root, 3-tier `@2xl`/`@4xl` reflow, mobile stack order (R6), decoration-only hide (R7), CTA `min-h-11` (R8); NO `@media`/`md:`/`lg:`/`vw`
- [ ] Animation via `useBlockMotion`/`useLandingMotion`, `scroller` on every scrollTrigger, `invalidateOnRefresh`, cleanup (R1–R6); framer-motion only for per-char text stagger
- [ ] `types.ts`: BlockType + interface + BlockContent union + BLOCK_TYPE_META
- [ ] Path A: def file + `BLOCK_REGISTRY` line  —  OR Path B: factory + renderBlock + LayersPanel
- [ ] `ORDERED_TYPES` in AddBlockDialog (both paths)
- [ ] `npx tsc --noEmit` clean
- [ ] Editor: every element selectable + correct toolbar control
- [ ] `/p/[id]`: entrance plays on scroll-in, replays on scroll-back
- [ ] Device picker resize adapts (container query, not viewport)
- [ ] BE seeded the `type_code` (or noted as pending) for version commit
