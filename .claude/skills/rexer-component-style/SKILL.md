---
name: rexer-component-style
description: Enforce this project's component code-style when writing or editing any React UI — pages, dialogs, modals, forms, wizards, cards, lists. Use it whenever you create or modify a `.tsx` component so the output uses the project's design-system atoms/molecules instead of raw `<button>`/`<input>` + inline Tailwind, stays small, and reads cleanly. Triggers on: build/add/edit a component, dialog, modal, form, wizard, page, sidebar, table, button, input.
---

# Rexer Component Style

Mục tiêu: code component **gọn, đồng bộ design-system**, không "xấu" (file dài, `<button>`/`<input>` thô, Tailwind inline lặp). Áp dụng MỖI khi viết/sửa `.tsx`.

## 1. Luôn dùng atoms — KHÔNG viết raw element

Có sẵn ở `src/components/atoms/`. Dùng chúng thay vì HTML thô + class inline:

| Đừng viết raw | Dùng atom (`@/components/atoms/...`) |
|---|---|
| `<button className='rounded-lg bg-... px-3 py-2 ...'>` | `Button` (`button`) — có `variant` (primary/outline/ghost/pill-light), `size` |
| `<input className='rounded-lg border ...'>` | `Input` (`input`) |
| `<textarea ...>` | `Textarea` (`textarea`) |
| overlay `<div className='fixed inset-0 ...'>` tự chế modal | `Dialog` + `DialogContent/Header/Title/Footer` (`dialog`) |
| `<label>` thô | `Label` (`label`) |
| status pill / tag inline | `Badge` (`badge`), `Tag` (`tag`), `Chip` (`chip`), `StatusDot` (`status-dot`) |
| spinner inline | `Spinner` (`spinner`) |
| avatar/initials div | `Avatar` (`avatar`) |
| toggle | `Switch` (`switch`), `RadioGroup` (`radio-group`) |
| skeleton loading | `Skeleton` (`skeleton`) |
| color swatch | `ColorSwatch` (`color-swatch`) |

Form phức tạp: `Form` atom + `react-hook-form` + `zod` (đã có `@hookform/resolvers`).

## 2. Tái dùng molecules — đừng dựng lại

`src/components/molecules/`: `EmptyState`, `MetricCard`, `SectionHeader`, `SectionContainer`,
`ImageUpload`, `ProductCard`, `MediaCard`, `TemplateCard`, `ComingSoonState`, `LandingPagePicker`,
`UserProfileMenu`… → dùng thay vì copy markup.

## 3. Kích thước & tách file (chống file dài)

- Component **> ~250 LOC → TÁCH**. File `_product-modal.tsx` 623 LOC là phản ví dụ.
- Mỗi file 1 trách nhiệm. Khi 1 dialog/page phình to:
  - Adapter / map / helper thuần → file `_adapters.ts` / `_helpers.ts` cùng thư mục.
  - Mỗi bước wizard / mỗi section lớn → component riêng (`StepBasic.tsx`, `StepMedia.tsx`…).
  - Sub-component lặp (card, row) → tách ra, không nhồi inline trong `.map`.
- Page route `.tsx`: chỉ orchestrate state + layout; UI nặng đẩy xuống component con.

## 4. Tailwind: tránh class inline dài/lặp

- Cùng 1 chuỗi class lặp ≥ 2 lần → đưa ra `const xClass = '...'` hoặc dùng atom có variant.
- Class điều kiện → `cn()` (`@/lib/cn`), KHÔNG nối chuỗi template bằng tay.
- Ưu tiên token design-system (`text-foreground`, `text-content-muted`, `border-border`,
  `bg-muted`) thay vì hardcode `zinc-*` rải rác khi có token tương đương.

## 5. Handler & props

- Logic > 1 dòng: đặt tên hàm (`const handleSave = …`), không nhồi inline `onClick={() => {...}}`.
- Tránh bùng nổ boolean-prop; nhiều biến thể → compound component / `variant`.

## Checklist trước khi xong 1 component
- [ ] Không còn `<button>`/`<input>`/`<textarea>` thô khi đã có atom tương ứng.
- [ ] Modal dùng `Dialog` atom, không phải overlay div tự chế.
- [ ] File ≤ ~250 LOC; phần lớn/lặp đã tách.
- [ ] Không có chuỗi Tailwind dài lặp ≥ 2 lần.
- [ ] Class điều kiện qua `cn()`.
- [ ] Molecules tái dùng thay vì dựng lại.
