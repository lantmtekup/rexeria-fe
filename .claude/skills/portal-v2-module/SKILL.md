---
name: portal-v2-module
description: Integrate a Portal V2 module from plan-v2 and rexer-platform-v2 prototype into src/app/(portal-v2) using Studio tokens and atomic components. Use when implementing or upgrading /portal-v2/* modules (Brand, Campaigns, Journeys, Experiences, etc.), reading plan-v2, or porting prototype V2 views.
---

# Portal V2 Module Integration

Triển khai (hoặc nâng cấp) **một module** trong Portal V2: đọc plan → prototype → code hiện có → spec → implement.

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

**Nguồn sự thật:**

| Nguồn | File |
|-------|------|
| Plan (IA, yêu cầu) | [`plan-v2/index.html`](../../../plan-v2/index.html) |
| Prototype (UI, mock DATA) | [`plan-v2/rexer-platform-v2.html`](../../../plan-v2/rexer-platform-v2.html) |
| Branding Studio | [`plan-v2/index.html#s2`](../../../plan-v2/index.html) + PNG guidelines trong `plan-v2/` |
| Code reference | Brand module (xem [reference.md](reference.md)) |

Tra nhanh 12 module: [module-map.md](module-map.md).

---

## Workflow (bắt buộc theo thứ tự)

### A. Plan — `plan-v2/index.html`

1. Tìm `#mod-{slug}` (vd. `#mod-campaigns`).
2. Trích từ `<dl>`: **Là gì**, **Hiện trạng**, **Cần đạt**.
3. Ghi route mục tiêu `/portal-v2/...` (đối chiếu [module-map.md](module-map.md) — slug nav có thể khác plan, vd. `intel` → `/portal-v2/ai`, `product` → `/portal-v2/products`).

### B. Prototype — `rexer-platform-v2.html`

1. Map view: grep `VIEWS.{slug}` hoặc `function {slug}View` (xem module-map).
2. Đọc mock `DATA.{...}` (Brand: `const BRAND =`, Campaigns: `DATA.campaigns`, …).
3. Field registry nếu có (Brand: `BFIELDS`, `BLINES`, `BROWS`).
4. Grep CSS class đặc trưng (`.bcard`, `.cgrid`, `.ccard`, …) — **chỉ tham khảo layout**, implement bằng Tailwind + `--pv2-*`.
5. Không copy CSS thuần vào repo; không duplicate mock DATA vào HTML mới.

**Grep cheatsheet:** xem [reference.md](reference.md#prototype-grep).

### C. Code hiện có

Đọc trước khi viết file mới:

| Thành phần | Path |
|------------|------|
| Layout + tokens | [`src/app/(portal-v2)/layout.tsx`](../../../src/app/(portal-v2)/layout.tsx), [`src/styles/portal-v2/tokens.css`](../../../src/styles/portal-v2/tokens.css) |
| Shell | [`src/components/templates/portal-v2/Shell.tsx`](../../../src/components/templates/portal-v2/Shell.tsx) |
| Nav | [`src/lib/portal-v2/nav.ts`](../../../src/lib/portal-v2/nav.ts) |
| Shared UI | `molecules/portal-v2/{Button,Tabs,Placeholder,LocaleSwitch}` |
| **Reference module** | Brand — [`BrandWorkspace`](../../../src/components/organisms/portal-v2/brand/BrandWorkspace.tsx) + panels + `lib/portal-v2/brand/*` |

Nếu page hiện tại chỉ có `Placeholder` → module chưa implement; thay bằng Workspace pattern.

### D. Module spec (viết trước khi code)

Brief ngắn (5–10 dòng):

- Tabs / sections / list vs detail
- Shape mock data (types)
- Read vs Edit mode
- Submit P0: `alert(JSON)` hoặc toast (theo user)
- i18n keys (`portalV2.{module}.*`)
- Danh sách file sẽ tạo/sửa

Chờ user confirm nếu scope lớn hoặc ambiguous; module nhỏ có thể implement luôn sau brief.

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
- Route khớp `PORTAL_V2_NAV` href

---

## Mock vs API

| Phase | Hành vi |
|-------|---------|
| **P0 (mặc định)** | Mock từ prototype `DATA`; save → alert hoặc toast payload |
| **API** | Chỉ khi user yêu cầu; thêm `src/services/` + hook, không block UI shell |

---

## Checklist trước khi xong

- [ ] Plan P0 requirements covered
- [ ] Prototype tabs/fields/list represented
- [ ] `portal-v2/Button` + `portal-v2/Tabs` (không atoms Button)
- [ ] Tokens `--pv2-*` only; không leak vào `globals.css`
- [ ] `portalV2.{module}` i18n en + vi
- [ ] `tsc --noEmit` pass
- [ ] Không sửa `(client-portal)` / `/portal`

---

## Tài liệu thêm

- [module-map.md](module-map.md) — 12 module plan ↔ prototype ↔ route ↔ status
- [reference.md](reference.md) — file map, tokens, Brand pattern, grep cheatsheet

## Ví dụ lệnh user

- *"Triển khai Campaigns portal v2 theo prototype"*
- *"Port module Media từ plan-v2"*
- *"Nâng cấp Brand workspace — thêm field X"*
