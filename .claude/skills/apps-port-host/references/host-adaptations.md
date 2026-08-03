# Host adaptations — apps prototype → block-editor

Rules that differ from a standalone `apps/<brand>` Next page. Apply these whenever porting overlays, sticky scrub, or container-aware layout.

## 1. Portal (drawers, headers, sticky menus)

`@container` on the block root makes it a containing block for `position: fixed` — overlays clip inside the block / device frame unless portaled out.

**API** — `src/components/modules/block-editor/previewPortal.ts`:

```ts
resolveDrawerPortalHost(anchor) // device-frame → landing-preview → body
isDeviceFrameHost(host)         // true when host has [data-device-frame]
```

**Resolution order:**

1. `[data-device-frame]` — PreviewMode / `/dev/blocks` fixed-width shell
2. `[data-landing-preview]` — legacy full preview overlay
3. `document.body` — public `/p/[id]`

**Pattern:**

```tsx
const [portalHost, setPortalHost] = React.useState<HTMLElement | null>(null);

React.useLayoutEffect(() => {
  if (!mounted) return;
  setPortalHost(resolveDrawerPortalHost(behindRef?.current ?? rootRef.current));
}, [mounted, behindRef, open]);

const inFrame = isDeviceFrameHost(portalHost);
// inFrame → position absolute inset-0 on host
// !inFrame → position fixed inset-0 on body

return portalAlive && portalHost
  ? createPortal(<DrawerUI className={inFrame ? 'absolute' : 'fixed'} />, portalHost)
  : null;
```

Reference implementations: `PnjDiscoverPanel.tsx`, `PnjHeroHotspots.tsx`, `PnjHeader.tsx`, `PnjStickyMenu.tsx`.

## 2. Canvas style editing (full blocks)

Standalone apps style with Tailwind classes and CSS modules. The host editor overrides via **inline `styles` prop** merged through `styleOf`. Class-based tokens cannot be overridden from the toolbar.

| Standalone (`apps/…`) | Host |
|---|---|
| `className="text-white text-4xl font-bold"` | `style={composeStyle({ color: '#fff', fontSize: 'clamp(32px, 6cqi, 64px)', fontWeight: 700 }, styleOf('title'))}` |
| CSS module / global `<style>` for typography | Inline base in `composeStyle`; class only for structure/animation |
| No selection affordance | `data-element-key` + `selectableClass(activeKey === key, …)` |
| Hard-coded colors in JSX | Default in inline base; editor overrides via `elementStyleOf(styles, key)` |

**Required local helper** on every full block:

```tsx
import {
  composeStyle,
  elementStyleOf,
  orderStyle,
  positionStyle,
  selectableClass,
} from './applyStyle';

const styleOf = (key: string) =>
  composeStyle(
    elementStyleOf(styles, key),
    orderStyle(order, key),
    positionStyle(positions, key)
  );
```

**Helpers from `blocks/applyStyle.ts`:**

| Helper | Role |
|---|---|
| `elementStyleOf` | Editor color/font/size overrides for a key |
| `orderStyle` | CSS `order` from element reorder |
| `positionStyle` | `transform: translate()` from free-drag |
| `composeStyle` | Merge partials, drop empties |
| `selectableClass` | Cursor + hover/active selection ring |
| `blockBackgroundStyle` | Block-level background on root `<section>` |

**Port checklist per editable node:**

1. Pick `<key>` matching `elements[]` / `content` path.
2. Move visual tokens from Tailwind → inline base object.
3. Wire `data-element-key`, `style={composeStyle(base, styleOf(key))}`, `selectableClass`.
4. Test: select on canvas → change color/fontSize in toolbar → DOM updates.

Sub-components (drawers): usually inherit styled content from parent props (`content.variants[i].label`). Do not duplicate editable surfaces inside the drawer unless parent forwards `styles`/`activeKey`.

Reference: `PnjVariant.tsx` (`ctaText`, `variants[i].label/desc/highlights`).

## 2c. CTA / link fields (link picker 4 dạng)

Standalone apps: `<a href={url}>{label}</a>`. Host stores **two CMS strings** and wires **two canvas hit-targets**.

| Concern | Rule |
|---|---|
| BlockDef | URL field → `fieldType: 'link'` (`ctaHref`, `*.href`, `*.link`). Label field → `fieldType: 'text'`. |
| DOM | `data-element-key` **href key on `<a>`**, text key on inner `<span>`. Button chrome (padding/bg) on `<a>`; typography on span. |
| Canvas | `href={isCanvas ? undefined : value \|\| '#'}` + `onClick={isCanvas ? e => e.preventDefault() : undefined}` |
| Chip UX | `resolveSiblingLinkKey`: `ctaText` → `ctaHref`, `products[i].cta` → `.href`, `navLinks[i].label` → `.href` |
| Chip anchor | `resolveLinkAnchorKey`: reverse mapping so link-only layer highlights the visible button |
| Both editors | Update `resolveElementKind.ts` in **block-editor** and **block-editor-v2** |

Link tokens (`links/linkToken.ts`): `#page:<id>`, `#block:<id>`, external URL, empty/`#` = none. `LinkControls` exposes all four modes.

Refs: `CoolHunterFooter.tsx`, `FramerEstanciaAboutUs.tsx`, `BelgoOurProducts.tsx`, `BelgoHeader.tsx`.

## 2b. Canvas edit surface vs Preview / `/p`

**Invariant:** edit UX on the canvas may diverge; **PreviewMode + public `/p` must not**. Authors need every field visible/selectable; visitors need the real sticky/scrub composition.

### Detection (`isCanvas`)

```tsx
const { hasRoot } = useLandingMotion();
const [isCanvas, setIsCanvas] = React.useState(true);

React.useLayoutEffect(() => {
  if (!hasRoot) {
    setIsCanvas(false); // production /p — no LandingMotion root
    return;
  }
  // PreviewMode also has hasRoot, but is NOT inside this node
  setIsCanvas(
    !!rootRef.current?.closest('[data-testid="active-block-preview"]')
  );
}, [hasRoot]);
```

| `hasRoot` | Inside `[data-testid="active-block-preview"]` | Mode |
|---|---|---|
| false | — | `/p` production |
| true | yes | Editor canvas → may use edit layout |
| true | no | PreviewMode Play → production layout + motion |

### Edit fork pattern

```tsx
// Skip pin/scrub while authoring
useBlockMotion(rootRef, ({ scroller }) => {
  if (isCanvas) return;
  // … real ScrollTriggers
}, [isCanvas, …]);

if (isCanvas) {
  return (
    <section ref={rootRef} data-canvas-edit='true' /* auto height, flat grid */>
      {/* ALL editable nodes visible + data-element-key + styleOf */}
    </section>
  );
}

return (
  <section ref={rootRef} /* production sticky / radial / scrub */>
    …
  </section>
);
```

**When required:** production hides inactive items, pins a tall track, or stacks content so click-targets are missing on the canvas.

**Never:** ship the edit grid to PreviewMode/`/p`; leave `selectableClass` on live form controls that publish; “fix” preview to look like the edit surface.

Refs: `HousentOurExcellence.tsx`, `ReadymagCaseSection.tsx`, `FramerIgnitexStep.tsx`, `ScrollMattis.tsx`, `PnjVariant.tsx`.

## 2c. LayersPanel — `fieldType` + `groupId`

Content entry lives in panel Lớp + ElementToolbar. Declare on BlockDef `elements[]` (type `LayerElement`):

| Prop | Effect |
|---|---|
| `fieldType?: 'text' \| 'textarea' \| 'image'` | Toolbar control type (do not rely on key-name heuristics) |
| `groupId?: string` | Contiguous same id → one collapsible folder (`buildLayerTree`) |
| `groupLabel?: string` | Folder label — only needed on the first element of the run |

```ts
// pnjCta — form field folders (placeholder NOT on <input> DOM — avoids /p hover rings)
{
  key: 'emailLabel',
  label: 'Nhãn',
  groupId: 'email',
  groupLabel: 'Ô Email',
  fieldType: 'text',
  icon: Tag,
},
{
  key: 'emailPlaceholder',
  label: 'Placeholder',
  groupId: 'email',
  fieldType: 'text',
  icon: TextCursorInput,
},
```

Flat item pairs (`item1Label` + `item1Icon`) → same pattern (`housentOurExcellence.ts`). Dynamic-length arrays still need `elementsForType` expand (§8).

## 3. Scroll lock + Lenis

Standalone apps often lock scroll via local hooks tied to a page-level Lenis provider. On the host, Lenis lives on `window.__lenis` (from `LandingMotionRoot`).

**Reuse** `useDrawerScrollLock(activeKey, isMobile)` from `blocks/PnjHeroHotspots.tsx`:

- `activeKey !== null` → lock; `null` → unlock
- Mobile: `body` `position: fixed` + saved scrollY
- Desktop: `html` `overflow: hidden` + scrollbar padding
- Always `lenis?.stop()` on lock and `lenis?.start()` on unlock **and** in effect cleanup

Put `data-lenis-prevent` on the drawer’s scrollable region so inner scroll does not drive Lenis.

Use a unique lock id per surface (`'pnj-discover'`, hotspot tab key, …) so nested locks do not fight.

## 4. Mobile = container, not viewport

| Standalone (`apps/…`) | Host |
|---|---|
| `useIsMobile()` / `matchMedia('(max-width: …)')` | `useContainerMobile(rootRef)` |
| Tailwind `md:` / `lg:` | `@2xl:` / `@4xl:` + `cqi` / `clamp(…, N·cqi, …)` |
| Window width | Device-frame width inside the canvas |

Pass `isMobile` into sub-components (drawers) from the parent that owns the measured root — do not re-measure with viewport hooks inside the child.

Authoritative: `docs/canvas-block-responsive-spec.md` (R1–R10).

## 5. Motion rewiring (keep timings, change host)

Preserve GSAP durations/eases from the app. Change only the host contract:

- Entrance / simple scroll → `useBlockMotion(rootRef, ({ scroller }) => { … }, deps)`
- Complex pin/scrub/SplitType → `useLandingMotion()` + `gsap.context` + cleanup `ctx.revert()`
- Every `scrollTrigger` gets `scroller` + `invalidateOnRefresh: true`
- After image/frame sequence load → `requestRefresh()`
- No `new Lenis`, no `gsap.registerPlugin` inside the block
- Respect `prefers-reduced-motion`

Full R1–R6: `docs/landing-motion-foundation.md` and `../framer-clone-host/references/gsap-motion-contract.md`.

**Editor zoom caveat:** ScrollTrigger positions can look wrong when canvas zoom ≠ 100%. `/p` is correct — do not “fix” zoom math in the block.

## 6. Sticky scrub + overlay chrome (canvas)

Editor height logic differs from `/p`. Without these sets, sticky stages can render blank/misplaced in preview even though public pages work.

In `BlockPreview.tsx`:

| Set | When |
|---|---|
| `STICKY_SCROLL_BLOCK_TYPES` | Pin/scrub track must keep ~100% stage height (`pnj_variant`, `pnj_details`, …) |
| `OVERLAY_TOP_BLOCK_TYPES` | Fixed header/nav chrome — canvas aligns top, no vertical centering gap (`pnj_header`, …) |

## 7. CMS / props reshape (examples)

### DiscoverPanel → PnjDiscoverPanel

| Standalone | Host |
|---|---|
| Default export | Named `PnjDiscoverPanel` |
| `images: { dial, profile, caseback }` | `variants: PnjVariantItem[]` + `initialViewKey` |
| `useIsMobile()` | `isMobile` prop |
| Inline `fixed` DOM | Portal + `inFrame` absolute/fixed |
| `md:` panel width | `@2xl` / `@4xl` + GSAP open/close |
| Local scroll-lock hook | Shared `useDrawerScrollLock(..., 'pnj-discover')` |
| Classes `.discover-prev` | Prefixed `.pnj-discover-prev` |

### HeroIntroSection → PnjHero

| Standalone | Host |
|---|---|
| Window ScrollTrigger | `useLandingMotion` + `scroller` |
| Local hotspot UI | `PnjHeroHotspots` + portal |
| Hard-coded copy/frames | `content` + helpers (`pnjHeroFrames`, `pnjHeroScrim`, `pnjHeroTitleLines`) |
| No editor select | `data-element-key` + `styleOf` + LayersPanel expand for `titleLines[i]` / hotspots |

## 8. When to touch ElementToolbar / LayersPanel

Default Path A `elements[]` covers flat text/image/textarea.

Add custom expand / toolbar when:

- Dynamic arrays whose length ≠ default (`variants[]`, `paragraphs[]`, `titleLines[]`) → `LayersPanel.elementsForType` + helpers like `pnjVariantItemElements`
- Structured fields (hotspot coords, frame sequences, scrim presets) → dedicated `ElementToolbar` controls
- Nested keys need labels → `resolveElementKind.ts`

Prefer **declarative** Layers UX first:

- Always set `fieldType` on BlockDef elements
- Cluster paired fields with contiguous `groupId` + `groupLabel` on the first child (form label/placeholder, itemN label/icon)
- Only then add `elementsForType` expand for true dynamic arrays

## 9. Class prefix + shared DOM

All blocks share one document. Prefix block-local classes and Swiper nav selectors with the brand/block kebab name to avoid collisions (`pnj-discover-prev`, not `discover-prev`).
