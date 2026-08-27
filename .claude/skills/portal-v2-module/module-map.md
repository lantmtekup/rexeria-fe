# Portal V2 — Module Map (demo v3)

Bảng tra: prototype `DATA.nav` → `VIEWS` → route code → trạng thái.

**Prototype (canonical):** [`plan-v2/rexer-demo-v3_new.html`](../../../plan-v2/rexer-demo-v3_new.html) (`DATA.nav` ~L2798, `VIEWS`, `DATA` / `BRAND` / `MINING`)

**Plan (phụ):** [`plan-v2/index.html`](../../../plan-v2/index.html) `#mod-*` — IA 12-mod cũ; chỉ dùng P0 khi không mâu thuẫn v3.

**Pitch:** Mining finds it → Journey plans it → Studio builds/ships → Pulse measures.

Số dòng dưới đây là neo; lệch vài trăm dòng thì grep lại (xem [reference.md](reference.md#prototype-grep)).

---

## Summary table

| Group | Nav id | Label | `VIEWS` | Mock | Route (code) | Status |
|-------|--------|-------|---------|------|--------------|--------|
| — | `command` | Command Center | `commandView` ~11189 → `VIEWS.command` ~11446 | `DATA` home metrics | `/portal-v2` | **Done** — `CommandWorkspace` |
| AUDIT | `mining` | Journey Audit | prototype riêng (xem ghi chú Journey Audit) | `lib/portal-v2/journey-audit/mock.ts` | `/portal-v2/journey-audit` (`/portal-v2/mining` redirect) | **Done** — `JourneyAuditWorkspace` |
| AUDIT | `sources` | Sources | prototype riêng | `MOCK_AUDIT_SOURCES` + `MOCK_WIZARDS` | `/portal-v2/sources` | **Done** — `SourcesWorkspace` |
| AUDIT | `dropoff` | Drop-off | prototype riêng | `MOCK_AUDIT_LEAKS` | `/portal-v2/dropoff` | **Done** — `DropoffWorkspace` |
| AUDIT | `experiments` | Experiments | `VIEWS.experiments` ~13581 | `lib/portal-v2/experiments/mock.ts` | `/portal-v2/experiments` | **Done** — `ExperimentsWorkspace` |
| JOURNEY | `brand` | Brand | `brandView` ~12561 → `VIEWS.brand` ~12583 | `const BRAND` ~4433; `BFIELDS`, `BLINES` | `/portal-v2/brand` | **Done** — `BrandWorkspace` |
| JOURNEY | `journeys` | Journey Builder | `VIEWS.journeys` ~14029 | `DATA.journeys`, `ROLES` / `JKIND` | `/portal-v2/journeys` | **Done** — `JourneysWorkspace` |
| JOURNEY | `campaigns` | Campaigns | `campaignsView` ~12621 → `VIEWS.campaigns` ~13081 | `DATA.campaigns` | `/portal-v2/campaigns` | **Done** — `CampaignsWorkspace` |
| STUDIO | `experiences` | Experiences | `VIEWS.experiences()` ~10401 | `DATA.experiences`, `expCategories`, `expObjs` | `/portal-v2/experiences` | **Done** — `ExperiencesWorkspace` |
| STUDIO | `media` | Media | `VIEWS.media()` ~10543 | `DATA.assets`, `mediaUses`, `mediaKinds` | `/portal-v2/media` | **Done** — `MediaWorkspace` |
| STUDIO | `product` | Product | `VIEWS.product()` ~10711 | `DATA.products`, `prodStatus` | `/portal-v2/products` (nav id `products`) | **Done** — `ProductWorkspace` |
| STUDIO | `automation` | Automation | `VIEWS.automation` ~20873 | proven `DATA.experiences` | `/portal-v2/automation` | **Done** — `AutomationWorkspace` |
| STUDIO | `deploy` | Deploy | `deployView` ~10841 → `VIEWS.deploy` ~11056 | deploy channels / live state | `/portal-v2/deploy` | **Done** — `DeployWorkspace` |
| PULSE | `analytics` | Analytics | `pulseView` ~11482; lenses `overview` / `analytics` / `insights` | grain / funnel derived in prototype | **gap** — chưa có `/analytics` | **Not ported** |
| PULSE | `intelligence` | Intelligence | `pulseIntel` ~11922 via `VIEWS.intelligence` ~12190 | Pulse findings (threshold-crossers) | `/portal-v2/ai` (placeholder) | **Placeholder** |
| — | `exchange` | Exchange | `VIEWS.exchange` ~20505 | `MARKET_ITEMS` | `/portal-v2/exchange` | **Done** — `ExchangeWorkspace` |
| bottom | `settings` | Settings | `VIEWS.settings` ~21290 | `GOV_DEFAULTS`, `PRIVACY`, `CAPS` | `/portal-v2/settings` | **Done** — `SettingsWorkspace` |

`VIEWS.overview` / `VIEWS.insights` (~12187–12189) tồn tại nhưng **không** là item rail — chúng set `S.pulse.lens` rồi gọi `pulseView()`.

**Slug:** prototype `product` → href `products`; prototype `intelligence` → code `ai`. Luôn follow [`nav.ts`](../../../src/lib/portal-v2/nav.ts) cho href hiện có; **không** tự thêm href gap.

---

## Per-module notes

### Command Center

Dashboard + next actions. Prototype `commandView`. P0: summary cards + mock alerts.

### AUDIT — Journey Audit (`/portal-v2/journey-audit`)

Đã thay module Mining cũ (Phase 1 UI swap). Nguồn UX canonical là prototype
live-case `rexer-jlo-live-case*.html` (KHÔNG phải `VIEWS.mining` của demo v3):
product rail + Experience Pulse + lens Quality/Flow, touchpoint drawer, flow
map, ghost card theo trạng thái nguồn. Mock shape theo hợp đồng Rx
`/v1/audit/*` (`services/rexer-v2/types/audit.ts`); `/portal-v2/mining`
redirect về đây. Code: `organisms/portal-v2/journey-audit/` +
`lib/portal-v2/journey-audit/`.

### AUDIT — Experiments

Every test traces to a mined leak; ships past `SHIP_GATE` (95). List + detail.
Mock riêng `lib/portal-v2/experiments/`; `ExperimentsDataProvider` mount trong
trang experiments (không còn provider ở layout).

### AUDIT — Sources

Integrations hub của Journey Audit: coverage strip 5 stage (✓/!/✕), sections
Needs attention / Connected / Recommended next / All + search, ConnectWizard
per-provider chạy demo client-side. Hợp đồng Rx `/v1/sources*`
(`services/rexer-v2/types/sources.ts`).

### AUDIT — Drop-off (`/portal-v2/dropoff`)

Phễu 3 hàng (funnel · stage responsible · leak badges), leak xếp hạng + chẩn
đoán + bảng kênh; khoá khi chưa có nguồn analytics. Phase 1 phễu có thể là số
đo thật từ `intel.funnel` (measured) hoặc traffic model (estimated).

### JOURNEY — Brand (REFERENCE)

4 tabs identity/essence/audience/visual. Code: `BrandWorkspace` + `lib/portal-v2/brand/` + `brand-form.tsx`.

### JOURNEY — Journey Builder

Blueprints vs campaign copies; graph stored, scores derived. Code: `JourneysWorkspace`.

### JOURNEY — Campaigns

Card grid / detail. Code: `CampaignsWorkspace` + `/campaigns/[id]`.

### STUDIO — Experiences

Ownership tabs (all / templates / product copies / topic copies); Refine facets; grid/table. Folder tree **đã bỏ** trong v3.

### STUDIO — Media

DAM: Used-for tab rail; kind/status refine; folders = toolbar dropdown.

### STUDIO — Product

Shopify-shaped catalogue; **readiness** is the ReXeR column.

### STUDIO — Automation / Deploy

Proven-experience hub; publish channels + live checks.

### PULSE — Analytics vs Intelligence

- **Analytics** (rail): measurement only — no advice. Workspace identity band + 3 tabs: Overview, Analytics, Rankings (`insights` id). **Gap route**.
- **Intelligence** (rail): what to do — threshold-crossers only, **no lens tabs**. Closest code: `/portal-v2/ai` Placeholder. Không còn `intelView`.

### Exchange / Settings

Exchange: header link, `hidden:true` trên rail prototype; code vẫn list exchange ở group đầu. Settings: 5 tabs, `GOV_DEFAULTS`.

---

## Prototype navigation

From `DATA.nav` (~L2798):

```
command
MINING:  mining | experiments | sources
JOURNEY: brand | journeys | campaigns
STUDIO:  experiences | media | product | automation | deploy
PULSE:   analytics | intelligence
exchange (hidden) | settings (bottom)
```

Adding a module in prototype = `DATA.nav` entry + `VIEWS.{id}`.  
In Next.js: **không** thêm nav/route trừ khi user confirm (xem SKILL gap rules).

Code nav hiện tại (`plan` / `create` / `publish` / `learn`) **lệch** IA này — document only.

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Done** | Workspace + mock/API wiring đã có trong repo |
| **Placeholder** | [`Placeholder`](../../../src/components/molecules/portal-v2/Placeholder.tsx) only |
| **Not ported** | Có trên prototype v3, chưa có route/workspace |

Update bảng này khi module ship hoặc khi `nav.ts` bắt kịp v3.
