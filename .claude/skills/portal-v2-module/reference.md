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
| `--pv2-rail`, `--pv2-rail-full`, `--pv2-top` | Shell geometry |
| `--pv2-z-rail`, `--pv2-z-top` | Stacking |

Fonts loaded in [`layout.tsx`](../../../src/app/(portal-v2)/layout.tsx): `--font-space-grotesk`, `--font-manrope`.

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

[`PORTAL_V2_NAV`](../../../src/lib/portal-v2/nav.ts) defines rail items. New module pages do **not** require nav changes if route already listed (all 12 routes exist).

Active state: `isPortalV2NavActive(pathname, href)`.

Exchange: topbar link to `/portal-v2/exchange`, not in main rail groups.

---

## Prototype grep

Run from repo root against [`plan-v2/rexer-platform-v2.html`](../../../plan-v2/rexer-platform-v2.html):

```bash
# View function assignment
rg "VIEWS\.\w+\s*=" plan-v2/rexer-platform-v2.html
rg "function \w+View\(" plan-v2/rexer-platform-v2.html

# Module-specific
rg "function campaignsView" plan-v2/rexer-platform-v2.html
rg "const BRAND\s*=" plan-v2/rexer-platform-v2.html
rg "DATA\.campaigns" plan-v2/rexer-platform-v2.html

# CSS classes (translate to Tailwind, do not copy block)
rg "\.cgrid|\.ccard|\.bcard|\.mtabs" plan-v2/rexer-platform-v2.html

# Field registries (Brand-style forms)
rg "BFIELDS|BLINES|BROWS" plan-v2/rexer-platform-v2.html
```

### VIEWS registry (inline object ~L16046)

| Key | Kind | Approx line |
|-----|------|-------------|
| `experiences` | method in `VIEWS` | ~16048 |
| `media` | method | ~16269 |
| `product` | method | ~16508 |
| `intel` | `intelView` → assigned ~17304 | ~16724 |
| `brand` | `brandView` → ~17816 | ~17783 |
| `campaigns` | `campaignsView` → ~18250 | ~17863 |
| `deploy` | `deployView` → ~18695 | ~18441 |
| `command` | `commandView` → ~19187 | ~18885 |
| `journeys` | function → ~19577 | ~19577 |
| `exchange` | function → ~26009 | ~26009 |
| `automation` | function → ~26495 | ~26495 |
| `settings` | arrow → ~26962 | ~26962 |

---

## Plan grep

```bash
rg 'id="mod-' plan-v2/index.html
```

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
