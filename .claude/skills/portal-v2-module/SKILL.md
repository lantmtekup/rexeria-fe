---
name: portal-v2-module
description: Integrate a Portal V2 module from plan-v2 and rexer-demo-v3_new.html into src/app/(portal-v2) using Studio tokens and atomic components. Use when implementing or upgrading /portal-v2/* modules (Brand, Campaigns, Journeys, Mining, Journey Audit, Sources, Experiments, Pulse, Analytics, Intelligence, Experiences, etc.), reading plan-v2, or porting prototype V2/v3 views.
---

# Portal V2 Module Integration

Triển khai (hoặc nâng cấp) **một module** trong Portal V2: đọc prototype v3 → plan (nếu không conflict) → code hiện có → spec → implement.

## Phạm vi

**Chỉ đụng Portal V2:**

- `src/app/(portal-v2)/`
- `src/components/{molecules,organisms,templates}/portal-v2/`
- `src/lib/portal-v2/`, `src/helpers/portal-v2/`
- `src/styles/portal-v2/`
- `src/i18n/messages/portal-v2/`

**Không đụng** (trừ khi user yêu cầu rõ):

- `(client-portal)` / `/portal` cũ
- `src/components/atoms/button` cho chrome module (dùng `molecules/portal-v2/Button`)
- `PORTAL_V2_NAV` / routes mới — xem [Gap vs code](#gap-vs-code--không-tự-sửa-nav)

**Nguồn sự thật:**

| Vai trò | File | Khi conflict |
|---------|------|--------------|
| UI, IA rail, mock DATA, `VIEWS` | [`plan-v2/rexer-demo-v3_new.html`](../../../plan-v2/rexer-demo-v3_new.html) | **Thắng** |
| P0 requirements (Là gì / Hiện trạng / Cần đạt) | [`plan-v2/index.html`](../../../plan-v2/index.html) `#mod-*` | Chỉ dùng khi **không** mâu thuẫn v3; ghi conflict vào brief |
| Tokens / Brand pattern / atomic layout | code hiện có (`tokens.css`, Brand workspace) | Giữ |
| Branding Studio | [`plan-v2/index.html#s2`](../../../plan-v2/index.html) + PNG trong `plan-v2/` | Giữ |

**Không grep** (superseded): `plan-v2/rexer-platform-v2.html`, `plan-v2/rexer-demo-v3.html`.

Tra nhanh rail v3: [module-map.md](module-map.md).

---

## Rail v3 — the pitch

**Mining finds it → Journey plans it → Studio builds/ships → Pulse measures.**

`DATA.nav` (~L2798) là IA. Thêm module = một entry nav + một key `VIEWS`. Chi tiết: [module-map.md](module-map.md).

---

## Gap vs code — không tự sửa nav

[`src/lib/portal-v2/nav.ts`](../../../src/lib/portal-v2/nav.ts) vẫn IA cũ (`plan` / `create` / `publish` / `learn`; exchange ở group đầu; `/ai` thay Intelligence).

1. Module **đã có route** → bám UI v3, **không** tự đổi `PORTAL_V2_NAV`.
2. Module **chỉ có trên v3** (mining, experiments, sources, analytics) → dừng ở spec, nêu gap, **hỏi user** trước khi thêm route/nav.
3. `/portal-v2/ai` = `Placeholder`; map conceptual → `VIEWS.intelligence` (`pulseIntel()`). Không còn `intelView`.

---

## Workflow (bắt buộc theo thứ tự)

### A. Prototype — `rexer-demo-v3_new.html` (làm trước)

1. Map view: grep `VIEWS.{id}` **và** method trong object `const VIEWS` (experiences/media/product nằm trong literal ~L10398; mining/pulse gán sau). Xem [module-map.md](module-map.md).
2. Đọc mock: `DATA.{...}`, `const BRAND`, `const MINING`, field registries (`BFIELDS`, `BLINES`, `BROWS`).
3. Grep CSS đặc trưng (`.mine-*`, `.pulse`, `.xtabs`, `.cgrid`, …) — **chỉ tham khảo layout**, implement bằng Tailwind + `--pv2-*`.
4. Không copy CSS thuần; không duplicate mock DATA vào HTML mới.

**Grep cheatsheet:** [reference.md](reference.md#prototype-grep).

### B. Plan — `plan-v2/index.html` (phụ)

1. Tìm `#mod-{slug}` nếu module còn trong plan (vd. `#mod-campaigns`). Module v3-only (mining, sources, experiments, pulse) **không** có `#mod-*` — bỏ bước này.
2. Trích `<dl>`: **Là gì**, **Hiện trạng**, **Cần đạt** — chỉ khi không mâu thuẫn v3.
3. Route mục tiêu: đối chiếu [module-map.md](module-map.md). Slug nav ≠ href (`product` → `/portal-v2/products`; intelligence → `/portal-v2/ai` placeholder).

### C. Code hiện có

Đọc trước khi viết file mới:

| Thành phần | Path |
|------------|------|
| Layout + tokens | [`src/app/(portal-v2)/layout.tsx`](../../../src/app/(portal-v2)/layout.tsx), [`src/styles/portal-v2/tokens.css`](../../../src/styles/portal-v2/tokens.css) |
| Shell | [`src/components/templates/portal-v2/Shell.tsx`](../../../src/components/templates/portal-v2/Shell.tsx) |
| Nav | [`src/lib/portal-v2/nav.ts`](../../../src/lib/portal-v2/nav.ts) — IA cũ; xem gap |
| Shared UI | `molecules/portal-v2/{Button,Tabs,Placeholder,LocaleSwitch}` |
| **Reference module** | Brand — [`BrandWorkspace`](../../../src/components/organisms/portal-v2/brand/BrandWorkspace.tsx) + panels + `lib/portal-v2/brand/*` |

Nếu page hiện tại chỉ có `Placeholder` → module chưa implement; thay bằng Workspace pattern.

### D. Module spec (viết trước khi code)

Brief ngắn (5–10 dòng):

- Tabs / sections / list vs detail (Pulse: 3 lenses trên Analytics; Intelligence không tabs)
- Shape mock data (types)
- Read vs Edit mode
- Submit P0: `alert(JSON)` hoặc toast (theo user)
- i18n keys (`portalV2.{module}.*`)
- Danh sách file sẽ tạo/sửa
- Gap route/nav nếu module v3-only

Chờ user confirm nếu scope lớn, ambiguous, **hoặc cần route/nav mới**; module nhỏ đã có route có thể implement luôn sau brief.

### E. Implement

**Atomic layout:**

| Layer | Path |
|-------|------|
| Route (mỏng) | `src/app/(portal-v2)/portal-v2/{slug}/page.tsx` |
| Workspace | `src/components/organisms/portal-v2/{slug}/{Name}Workspace.tsx` |
| Panels / sub-UI | `src/components/organisms/portal-v2/{slug}/*Panel.tsx` |
| Types + mock | `src/lib/portal-v2/{slug}/{types,constants,mock}.ts` |
| Form primitives (nếu lặp) | `src/components/molecules/portal-v2/{slug}-form.tsx` hoặc tái dùng `brand-form` pattern |
| i18n | `src/i18n/messages/portal-v2/{en,vi}.json` → `portalV2.{module}` |

**Quy ước import:** alias `@/`; export tên ngắn trong folder scoped (`Shell`, `Button`, `Workspace`).

**UI chrome (product workspace — theo Brand đã polish):**

- Header band: title + subtitle (tab-aware) + Edit / Save / Cancel
- **Sticky tabs** riêng: `sticky top-0 z-10 bg-[var(--pv2-paper)]`
- Padding gọn: `px-4 py-5 md:px-5` (full width content; chỉ thu hẹp khi form dài cần ~760px)
- Sections: hairline divide (`BrandCard` trong `brand-form.tsx`), tránh stack nhiều bordered cards
- Dùng [`Button`](../../../src/components/molecules/portal-v2/Button.tsx) + [`Tabs`](../../../src/components/molecules/portal-v2/Tabs.tsx) — không atoms global

**State pattern (mock P0):**

```ts
const [saved, setSaved] = useState(() => cloneMock(MOCK_X));
const [draft, setDraft] = useState(() => cloneMock(MOCK_X));
const [editing, setEditing] = useState(false);
// Save: clean → alert(JSON) → setSaved(cloneMock(cleaned))
```

**Styling:**

- Chỉ token `--pv2-*` trong subtree `[data-portal-v2]`
- `cn()` từ `@/lib/cn`
- Product UI: motion tối thiểu; không áp landing-page rules từ `design-taste-frontend`

### F. Verify

```bash
npx tsc --noEmit
```

- Không import `components/modules/portal-v2/` (legacy đã xóa)
- i18n en + vi đồng bộ key
- Route khớp `PORTAL_V2_NAV` href **chỉ khi** module đã có trong nav; module v3-only không tự thêm href

---

## Mock vs API

| Phase | Hành vi |
|-------|---------|
| **P0 (mặc định)** | Mock từ prototype `DATA` / `MINING` / `BRAND`; save → alert hoặc toast payload |
| **API** | Chỉ khi user yêu cầu; skill [`portal-v2-api-wiring`](../portal-v2-api-wiring/SKILL.md) |

---

## Checklist trước khi xong

- [ ] UI/IA theo `rexer-demo-v3_new.html` (không grep file superseded)
- [ ] Plan P0 covered **hoặc** conflict với v3 đã ghi trong brief
- [ ] Prototype tabs/fields/list represented
- [ ] `portal-v2/Button` + `portal-v2/Tabs` (không atoms Button)
- [ ] Tokens `--pv2-*` only; không leak vào `globals.css`
- [ ] `portalV2.{module}` i18n en + vi
- [ ] `tsc --noEmit` pass
- [ ] Không sửa `(client-portal)` / `/portal`
- [ ] Không tự đổi `nav.ts` / thêm route v3-only trừ khi user đã confirm

---

## Tài liệu thêm

- [module-map.md](module-map.md) — rail v3 ↔ `VIEWS` ↔ route ↔ status
- [reference.md](reference.md) — file map, tokens, Brand pattern, grep cheatsheet

## Ví dụ lệnh user

- *"Triển khai Campaigns portal v2 theo prototype v3"*
- *"Port Journey Audit / Mining từ rexer-demo-v3_new"*
- *"Nâng cấp Brand workspace — thêm field X"*
- *"Port Pulse Analytics theo demo v3"*
