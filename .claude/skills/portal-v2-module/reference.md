# Portal V2 Module — Technical Reference

## Codebase file map

```
src/
  app/(portal-v2)/
    layout.tsx                 # fonts, AuthHydrator, Shell, import tokens.css
    portal-v2/
      page.tsx                 # Command Center
      {slug}/page.tsx          # thin → Workspace or Placeholder

  styles/portal-v2/
    tokens.css                 # --pv2-* scoped [data-portal-v2]

  lib/portal-v2/
    nav.ts                     # PORTAL_V2_NAV, isPortalV2NavActive
    rail-preference.ts           # localStorage rail collapsed
    {module}/
      types.ts
      constants.ts
      mock.ts

  helpers/portal-v2/
    initials.ts                # Topbar avatar

  components/
    molecules/portal-v2/
      Button.tsx               # primary | ghost | danger | dashed
      Tabs.tsx                 # underline tabs
      Placeholder.tsx          # coming-soon pages
      LocaleSwitch.tsx
      brand-form.tsx           # BrandCard, Field, ReadField, ChipGroup, LineList, Callout

    organisms/portal-v2/
      Rail.tsx, Topbar.tsx
      brand/
        BrandWorkspace.tsx     # REFERENCE workspace
        *Panel.tsx

    templates/portal-v2/
      Shell.tsx                # grid shell + rail state

  i18n/messages/portal-v2/
    en.json, vi.json           # portalV2.{shell,nav,groups,pages,brand,...}
```

**Legacy (do not import):** `src/components/modules/portal-v2/` — removed after atomic reorg.

---

## Studio tokens (`tokens.css`)

Use via Tailwind arbitrary values: `bg-[var(--pv2-paper)]`, `text-[var(--pv2-mut)]`.

| Token | Role |
|-------|------|
| `--pv2-electric` | Primary accent (#3862ff) |
| `--pv2-electric-soft` | Chip/tab active bg |
| `--pv2-electric-hover` | Button hover |
| `--pv2-ink` | Primary text |
| `--pv2-mut` | Secondary text |
| `--pv2-faint` | Tertiary / placeholder |
| `--pv2-paper` | Surface (header, cards) |
| `--pv2-canvas` | Page background |
| `--pv2-hair` | Borders / dividers |
| `--pv2-error`, `--pv2-warning`, `--pv2-success` | Semantic |
| `--pv2-disp` | Space Grotesk — headings |
| `--pv2-ui` | Manrope — body |
| `--pv2-r`, `--pv2-r-sm`, `--pv2-r-lg` | Border radius |
| `--pv2-sh-soft` | Elevation for floating surfaces — the default |
| `--pv2-sh-sm` | Elevation, subtle. Rarely the right answer |
| `--pv2-sh-deep` | Elevation, heavy. Currently unused |
| `--pv2-rail`, `--pv2-rail-full`, `--pv2-top` | Shell geometry |
| `--pv2-z-rail`, `--pv2-z-top` | Stacking |

Fonts loaded in [`layout.tsx`](../../../src/app/(portal-v2)/layout.tsx): `--font-space-grotesk`, `--font-manrope`.

---

## Elevation: two levels, no third

The shadow tokens went undocumented for long enough that four disconnected
shadow scales grew inside `block-editor-v2` alone. The rule:

- **Level 0 — anything in the layout flow** (rails, panels, headers, rows,
  cards, tiles, buttons, segmented controls): **no shadow**. Separate with a 1px
  `--pv2-hair` hairline or a background step (`--pv2-canvas` against
  `--pv2-paper`). Selection is **one** ring in `--pv2-electric` — never a border
  and a ring and a shadow on the same element.
- **Level 1 — anything floating above the page** (popovers, menus, drag ghosts,
  floating toolbars, dialogs): exactly `shadow-[var(--pv2-sh-soft)]` and **no
  border** — the shadow already describes the edge. Keep a `ring-1` only where
  the surface sits on arbitrary content and needs a defined edge against it.

The editor's copy of this rule, with the radius scale, lives in
[`block-editor-v2/chrome.ts`](../../../src/components/modules/block-editor-v2/chrome.ts).

---

## Brand workspace pattern (copy for new modules)

### Page (server-friendly, no logic)

```tsx
import { CampaignsWorkspace } from '@/components/organisms/portal-v2/campaigns/CampaignsWorkspace';

export default function PortalV2CampaignsPage() {
  return <CampaignsWorkspace />;
}
```

### Workspace structure

1. `useTranslations('portalV2.{module}')`
2. Tab state + optional edit mode
3. `saved` / `draft` + `cloneMock()` from `lib/portal-v2/{module}/mock`
4. Header: title, dynamic subtitle from active tab, actions
5. Sticky `Tabs` bar (separate from header scroll)
6. Tab panels → `*Panel` components
7. Save P0: normalize arrays → `window.alert(JSON.stringify(...))`

### BrandCard sections (hairline rhythm)

From [`brand-form.tsx`](../../../src/components/molecules/portal-v2/brand-form.tsx):

- Section title + hint (max ~62ch)
- `pb-5 mb-5 border-b border-[var(--pv2-hair)]` between sections
- Read: `ReadField`; Edit: `Field` + `TextInput` / `TextTextarea` / `ChipGroup` / `LineList`

### Buttons & tabs

```tsx
import { Button } from '@/components/molecules/portal-v2/Button';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
```

Variants: `primary`, `ghost`, `danger`, `dashed`. Do **not** use `@/components/atoms/button` inside portal-v2 module UI.

---

## i18n

Registered in [`src/i18n/request.ts`](../../../src/i18n/request.ts):

```ts
import(`./messages/portal-v2/${locale}.json`)
```

Add keys under `portalV2.{module}` in **both** `en.json` and `vi.json`:

```json
"portalV2": {
  "brand": {
    "title": "Brand",
    "edit": "Edit",
    "tabIdentity": "Identity"
  }
}
```

Shell/nav/pages keys already exist; module-specific keys are additive.

---

## Navigation

Canonical IA is prototype `DATA.nav` (~L2798 in `rexer-demo-v3_new.html`):

```
command
MINING:  mining | experiments | sources
JOURNEY: brand | journeys | campaigns
STUDIO:  experiences | media | product | automation | deploy
PULSE:   analytics | intelligence
exchange (hidden:true — header link) | settings (bottom)
```

[`PORTAL_V2_NAV`](../../../src/lib/portal-v2/nav.ts) still uses the **old** groups (`plan` / `create` / `publish` / `learn`), lists exchange in the first group, and maps Intelligence to `/portal-v2/ai`. **Do not change `nav.ts`** unless the user confirms. Existing module pages keep current hrefs.

Active state: `isPortalV2NavActive(pathname, href)`.

Exchange in prototype: header link + hidden rail entry so the router can reach it. Code: `/portal-v2/exchange` (also in the first nav group — gap, not a license to rewrite the rail).

---

## Prototype grep

Canonical file: [`plan-v2/rexer-demo-v3_new.html`](../../../plan-v2/rexer-demo-v3_new.html).

**Do not grep** `rexer-platform-v2.html` or `rexer-demo-v3.html` (superseded).

`VIEWS` is an object literal ~L10398 **plus** later assignments (`VIEWS.mining = …`). Grep both.

```bash
# Assignments after the literal
rg "VIEWS\.\w+\s*=" plan-v2/rexer-demo-v3_new.html

# Methods inside const VIEWS
rg "^\s*(experiences|media|product)\(\)" plan-v2/rexer-demo-v3_new.html
rg "function \w+View\(" plan-v2/rexer-demo-v3_new.html

# Mock / registries
rg "const MINING|const BRAND\s*=" plan-v2/rexer-demo-v3_new.html
rg "BFIELDS|BLINES|BROWS" plan-v2/rexer-demo-v3_new.html
rg "DATA\.campaigns|DATA\.nav" plan-v2/rexer-demo-v3_new.html

# CSS (translate to Tailwind + --pv2-*; do not copy blocks)
rg "\.mine-|\.pulse|\.xtabs|\.cgrid|\.ccard|\.bcard|\.mtabs" plan-v2/rexer-demo-v3_new.html
```

Line numbers below are anchors; if the file shifted, grep — do not trust stale numbers.

### VIEWS registry

| Key | Kind | Approx line |
|-----|------|-------------|
| `experiences` | method in `const VIEWS` | ~10401 |
| `media` | method | ~10543 |
| `product` | method | ~10711 |
| `deploy` | `deployView` → `VIEWS.deploy` | ~10841 / ~11056 |
| `command` | `commandView` → `VIEWS.command` | ~11189 / ~11446 |
| `analytics` | `pulseView` (3 lenses) | ~11482; `VIEWS.analytics` ~12188 |
| `overview` | sets lens, not a rail item | ~12187 |
| `insights` | sets lens (label Rankings), not a rail item | ~12189 |
| `intelligence` | `pulseIntel` via `VIEWS.intelligence` | ~11922 / ~12190 |
| `brand` | `brandView` → `VIEWS.brand` | ~12561 / ~12583 |
| `campaigns` | `campaignsView` → `VIEWS.campaigns` | ~12621 / ~13081 |
| `mining` | `VIEWS.mining` | ~13287 |
| `sources` | `VIEWS.sources` | ~13370 |
| `experiments` | `VIEWS.experiments` | ~13581 |
| `journeys` | `VIEWS.journeys` | ~14029 |
| `exchange` | `VIEWS.exchange` | ~20505 |
| `automation` | `VIEWS.automation` | ~20873 |
| `settings` | `VIEWS.settings` | ~21290 |

No `intelView`. Old Intelligence screen is Pulse `pulseIntel()`.

### Mock roots

| Const | Approx line | Used by |
|-------|-------------|---------|
| `const DATA` | ~2783 | org, nav, experiences, campaigns, journeys, assets, products, … |
| `const BRAND` | ~4433 | Brand workspace |
| `BFIELDS` / `BLINES` / `BROWS` | ~4576+ | Brand field registry |
| `const MINING` | ~5109 | Journey Audit, Sources, Experiments (`stages`, `opps`, `sources`, `experiments`) |

### Pulse lenses

```
PULSE_WS_LENSES = ['overview', 'analytics', 'insights']
```

- Rail **Analytics**: `pulseView()` + identity band (“what happened”) + 3 tabs. Internal id `insights` labels as Rankings.
- Rail **Intelligence**: `pulseIntel()` only — no tabs, advice not measurement.
- CSS hints: `.pulse`, `.pmtabs`, `.pv-wsid`, `.intel-*` (Pulse intel cards — still translate to `--pv2-*`).

### Mining CSS hints

`.mine-page`, `.mine-opp`, `.mine-cov`, `.mine-leak` / leak map SVG, `.mine-src` — layout reference only.

---

## Plan grep

```bash
rg 'id="mod-' plan-v2/index.html
```

Plan still lists the old 12 modules (`mod-intel`, no mining/pulse). Use `#mod-*` P0 copy only when it does not contradict v3.

Section §2 branding theme: `#s2` in [`plan-v2/index.html`](../../../plan-v2/index.html).  
PNG guidelines: `plan-v2/1. ReXerStudio - Branding Identity Guidelines.png`, `plan-v2/2. ReXer - Branding Identity Guidelines.png`.

---

## Middleware / isolation

Portal V2 routes under `/portal-v2/*` are protected separately from old `/portal`. Do not change unless user asks.

Layout scopes theme: `<div data-portal-v2>` in [`layout.tsx`](../../../src/app/(portal-v2)/layout.tsx).

---

## TypeScript & conventions

- Strict types in `lib/portal-v2/{module}/types.ts`
- `structuredClone` or dedicated `cloneX()` for draft copies
- `@/` imports only
- `cn()` for conditional classes
- Client components: `'use client'` on workspace/panels with state
- Verify: `npx tsc --noEmit`

---

## Related skills

- [`rexer-component-style`](../../rexer-component-style/SKILL.md) — general atoms/molecules (portal-v2 overrides Button for module chrome)
- [`design-taste-frontend`](../../design-taste-frontend/SKILL.md) — landing/marketing only; portal modules = product UI, low motion
- [`feature-section`](../../feature-section/SKILL.md) — CMS sections (different stack; do not mix with portal-v2 module flow)
- [`portal-v2-api-wiring`](../portal-v2-api-wiring/SKILL.md) — mock → real API (only when the user asks)
