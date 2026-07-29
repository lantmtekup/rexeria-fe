# Portal V2 — Module Map

Bảng tra nhanh: plan → prototype → route code → trạng thái implementation.

**Plan file:** [`plan-v2/index.html`](../../../plan-v2/index.html) (§4, anchors `#mod-*`)  
**Prototype:** [`plan-v2/rexer-platform-v2.html`](../../../plan-v2/rexer-platform-v2.html) (`DATA` + `VIEWS`)

---

## Summary table

| # | Plan `#mod-*` | Nav / slug | Route (code) | Prototype `VIEWS` | Mock / DATA key | Code status |
|---|---------------|------------|--------------|-------------------|-----------------|-------------|
| 1 | `mod-command` | command | `/portal-v2` | `command` → `commandView()` ~L18885 | `DATA` home metrics, campaigns snapshot | **Done** — `CommandWorkspace` |
| 2 | `mod-brand` | brand | `/portal-v2/brand` | `brand` → `brandView()` ~L17783 | `const BRAND` ~L9048; `BFIELDS`, `BLINES` | **Done** — `BrandWorkspace` |
| 3 | `mod-campaigns` | campaigns | `/portal-v2/campaigns` | `campaigns` → `campaignsView()` ~L17863 | `DATA.campaigns`, `CAMP_TYPES`, `CAMP_STATUS` | **Placeholder** |
| 4 | `mod-journey` | journeys | `/portal-v2/journeys` | `journeys` ~L19577 | `DATA.journeys` | **Placeholder** |
| 5 | `mod-experiences` | experiences | `/portal-v2/experiences` | `experiences()` in `VIEWS` ~L16048 | `DATA.experiences`, `expCategories`, facets | **Placeholder** |
| 6 | `mod-automation` | automation | `/portal-v2/automation` | `automation` ~L26495 | automation / promote rules in DATA | **Placeholder** |
| 7 | `mod-media` | media | `/portal-v2/media` | `media()` ~L16269 | `DATA.assets`, folders | **Placeholder** |
| 8 | `mod-product` | products | `/portal-v2/products` | `product()` ~L16508 | `DATA.products`, readiness | **Placeholder** |
| 9 | `mod-deploy` | deploy | `/portal-v2/deploy` | `deploy` → `deployView()` ~L18441 | deploy channels, live state | **Placeholder** |
| 10 | `mod-intel` | ai | `/portal-v2/ai` | `intel` → `intelView()` ~L16724 | intelligence / funnel metrics | **Placeholder** |
| 11 | `mod-exchange` | exchange | `/portal-v2/exchange` | `exchange` ~L26009 | exchange listings (later) | **Done** — `ExchangeWorkspace` |
| 12 | `mod-settings` | settings | `/portal-v2/settings` | `settings` ~L26962 | workspace / gov settings | **Placeholder** |

**Lưu ý slug:** Plan dùng `mod-journey` / `mod-product` / `mod-intel`; code nav dùng `journeys`, `products`, `ai`. Luôn follow [`src/lib/portal-v2/nav.ts`](../../../src/lib/portal-v2/nav.ts) cho href.

---

## Per-module notes

### 1. Command Center (`mod-command`)

- **Plan ~L2113:** Tổng quan vận hành; partial.
- **Prototype:** `commandView` — dashboard cards, next actions.
- **CSS hints:** `.band`, insight cards, metric tiles.
- **P0:** Summary cards + mock alerts; không cần full analytics.

### 2. Brand (`mod-brand`) — REFERENCE

- **Plan ~L2149:** Brand kit 4 tabs; was missing → **implemented**.
- **Prototype:** `BTABS`, `bIdentity`, `bEssence`, `bAudience`, `bVisual`; `BRAND` mock Ilia Beauty.
- **Code:**
  - [`BrandWorkspace.tsx`](../../../src/components/organisms/portal-v2/brand/BrandWorkspace.tsx)
  - [`lib/portal-v2/brand/`](../../../src/lib/portal-v2/brand/)
  - [`brand-form.tsx`](../../../src/components/molecules/portal-v2/brand-form.tsx)

### 3. Campaigns (`mod-campaigns`)

- **Plan ~L2184:** Brief, items, status Planning→Live; partial in old marketing.
- **Prototype:** `campaignsView` — `.cgrid`, `.ccard`, progress bar, item chips.
- **DATA:** `DATA.campaigns`, `CAMP_TYPES`, `CAMP_STATUS`, `campExpCount`.
- **P0:** Card grid + detail drawer/modal optional; mock CRUD via edit mode.

### 4. Journeys (`mod-journey`)

- **Plan ~L2229:** Multi-page patterns; missing.
- **Prototype:** `VIEWS.journeys` — journey builder, roles ATT/EDU/EXP/TRU/CON.
- **DATA:** `DATA.journeys`, `ROLES`.
- **P0:** List journeys + readonly flow preview; builder phase 2.

### 5. Experiences (`mod-experiences`)

- **Plan ~L2273:** Rebuild; template vs copy, editor integration.
- **Prototype:** `VIEWS.experiences()` — tab rail (all/templates/copies), facet chips, card library.
- **DATA:** `DATA.experiences`, `expCategories`, `XSTATES`.
- **CSS:** `.chipbar`, experience cards, ownership tabs.
- **P0:** Library list + filters; no full block editor.

### 6. Automation (`mod-automation`)

- **Plan ~L2319:** Promote proven experiences; partial.
- **Prototype:** `VIEWS.automation` — rules / promote queue.
- **P0:** Read-only list + stub actions.

### 7. Media (`mod-media`)

- **Plan ~L2359:** Asset library, folders, brand kit scope.
- **Prototype:** `VIEWS.media()` — asset grid, folders, picker pattern (`pickasset` modals in Brand).
- **DATA:** `DATA.assets`, folder scopes.
- **P0:** Grid + folder filter; mock assets from prototype.

### 8. Products (`mod-product`)

- **Plan ~L2395:** Catalogue, readiness 5 cells.
- **Prototype:** `VIEWS.product()` — product rows, readiness grid.
- **Route:** `/portal-v2/products` (nav id `products`).
- **P0:** Product list + readiness badges mock.

### 9. Deploy (`mod-deploy`)

- **Plan ~L2436:** Publish hub; missing.
- **Prototype:** `deployView` — channels, live URLs, checks.
- **P0:** Status list + channel cards mock.

### 10. AI / Intelligence (`mod-intel`)

- **Plan ~L2479:** Funnel intel, Ask; partial.
- **Prototype:** `intelView` — tables, AI insights, profiles.
- **Route:** `/portal-v2/ai` (nav label `ai`, plan says Intelligence).
- **P0:** Placeholder dashboard or 1–2 insight cards mock.

### 11. Exchange (`mod-exchange`)

- **Plan ~L2520:** Later / marketplace.
- **Prototype:** `VIEWS.exchange` — hidden nav, header link in shell.
- **Code:** `ExchangeWorkspace` — catalog from `GET /v1/templates` + mock overlay; install via `pages.create`.
- **P0:** Featured strip, kind/obj/price filters, detail + buy modals; buy → alert(JSON).

### 12. Settings (`mod-settings`)

- **Plan ~L2544:** Workspace gov, users; partial.
- **Prototype:** `VIEWS.settings` — workspace prefs.
- **P0:** Form sections mock; link to existing auth/profile if needed.

---

## Prototype navigation ↔ VIEWS keys

From `DATA.nav` (~L5427):

```
command | brand | campaigns | journeys | experiences | automation | media | product
deploy | intel (→ ai route) | exchange (hidden rail) | settings
```

Adding a module in prototype = `DATA.nav` entry + `VIEWS.{id}` function.  
In Next.js = route page + optional nav entry (already wired in [`nav.ts`](../../../src/lib/portal-v2/nav.ts)).

---

## Implementation status legend

| Status | Meaning |
|--------|---------|
| **Done** | Workspace + mock + i18n module namespace |
| **Placeholder** | [`Placeholder`](../../../src/components/molecules/portal-v2/Placeholder.tsx) only |
| **Partial** | Some UI without full prototype parity |

Update this table when a module ships.
