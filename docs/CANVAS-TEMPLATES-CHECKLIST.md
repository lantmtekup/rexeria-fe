# Canvas Templates — Block Editor Checklist

Module port từ `360-admin-cms /my-pages/:id` → `rexerai /canvas-templates/[id]`. Tài liệu liệt kê toàn bộ tính năng + API + trạng thái triển khai. Cập nhật 2026-04-28.

---

## 1. UI / Frontend

### 1.1 Layout & shell

| Trạng thái | Tính năng | File |
| --- | --- | --- |
| ✅ Done | Top header: back, tên block động, device toggle (Desktop / Tablet / Mobile), tabs VI / EN / AI, status `Đang lưu / Chưa lưu / Đã lưu`, nút **Xem trước** | `block-editor/BlockEditorHeader.tsx` |
| ✅ Done | Khung canvas preview chứa block, scale theo zoom + device width | `block-editor/BlockPreview.tsx` |
| ✅ Done | Thanh thumbnail blocks ở dưới: render **mini preview thật** của từng block, active có **nút X đỏ** xoá nhanh | `block-editor/BlockTabBar.tsx` |
| ✅ Done | Zoom controls cạnh thumbnail: − / slider 25–200% / + / Maximize 100% | `block-editor/BlockTabBar.tsx` |
| ✅ Done | Sidebar phải 360px, 2 tab: **Cài đặt** (form) và **Lớp** (elements) | `block-editor/BlockEditorSidebar.tsx` |
| ✅ Done | Banner cảnh báo vàng khi REXER lỗi / timeout, dùng dữ liệu mẫu | `BlockEditor.tsx` |
| ✅ Done | Empty state khi không có block + nút "Thêm block" | `BlockEditor.tsx` |

### 1.2 Block library

| Trạng thái | Block type | Renderer | Sidebar form |
| --- | --- | --- | --- |
| ✅ Done | `hero_split` (dark left + photo right + 3 stats) | `blocks/HeroSplit.tsx` | `HeroSplitForm` (eyebrow / tiêu đề / mô tả / ảnh hero + transform / thống kê / CTA) |
| ✅ Done | `hero_overlay` (full-bleed photo + tag + title + subtitle + CTA) | `blocks/HeroOverlay.tsx` | `HeroOverlayForm` (tag / tiêu đề / mô tả / CTA / ảnh nền + transform) |
| ⏳ Backlog | `feature_section` | placeholder | — |
| ⏳ Backlog | `photo_gallery` | placeholder | — |
| ⏳ Backlog | `booking_form` | placeholder | — |
| ⏳ Backlog | `cta_section` | placeholder | — |
| ⏳ Backlog | 50+ block khác từ source 360-admin (master_plan, amenities, virtual_tour, framer_*, …) | — | — |

### 1.3 Block management

| Trạng thái | Tính năng | Ghi chú |
| --- | --- | --- |
| ✅ Done | Add block — modal `AddBlockDialog` với grid 6 type cards, click pick → append + active | `block-editor/AddBlockDialog.tsx` |
| ✅ Done | Remove block — nút X đỏ trên active thumbnail, `window.confirm` trước xoá, fallback active sang block đầu | |
| ✅ Done | Reorder block — drag-and-drop thumbnail dùng `@dnd-kit/sortable` (horizontal) | |
| ✅ Done | Visibility — flag `isVisible` per block (Layers panel chưa expose UI sau rework) | |
| ⏳ Backlog | Visibility toggle UI lại trong tab bar / Layers | |
| ⏳ Backlog | Rename block (đã rút ra khi rework, có thể thêm lại trong Layers tab) | |
| ⏳ Backlog | Duplicate block | |

### 1.4 Settings tab (form)

| Trạng thái | Tính năng | Ghi chú |
| --- | --- | --- |
| ✅ Done | Prompt textarea + nút **Tạo nội dung AI** với spinner | |
| ✅ Done | Section dynamic theo block type (HeroSplitForm / HeroOverlayForm / UnsupportedPanel) | |
| ✅ Done | Stats CRUD inline cho hero_split (add / sửa value+label / xoá) | |
| ✅ Done | CTA fields (text + link) | |
| ⏳ Backlog | Color picker / typography style cho từng element | |
| ⏳ Backlog | Device-aware styles (`_styles.desktop / _styles.mobile`) như source | |

### 1.5 Layers tab (elements)

| Trạng thái | Tính năng | File |
| --- | --- | --- |
| ✅ Done | List elements per block type với icon (T / ¶ / □ / 📊 / button) | `block-editor/LayersPanel.tsx` |
| ✅ Done | Drag để reorder thứ tự lớp (visual only, không persist) | |
| ⏳ Backlog | Click element → focus / highlight trong preview | |
| ⏳ Backlog | Visibility toggle per element | |
| ⏳ Backlog | Rename / lock per element | |
| ⏳ Backlog | Persist layer order vào `_layerOrder` để áp z-index | |

### 1.6 Image tools

| Trạng thái | Tính năng | File |
| --- | --- | --- |
| ✅ Done | URL input | `block-editor/ImagePicker.tsx` |
| ✅ Done | Upload file qua `/api/upload` (FormData multipart) | |
| ✅ Done | **Xoay** ảnh: slider −180°↔180° + nút ±90° | |
| ✅ Done | **Phóng** ảnh: slider 50–200% + nút zoom in/out | |
| ✅ Done | Nút **Khôi phục** transform về 0°/100% | |
| ✅ Done | Preview thumbnail tự apply transform | |
| ✅ Done | `<TransformedImage>` shared component áp `rotate() scale()` cho renderer | `blocks/TransformedImage.tsx` |
| ⏳ Backlog | Drag để dịch ảnh trong khung crop (offsetX/Y) | |
| ⏳ Backlog | Crop / mask | |
| ⏳ Backlog | Image gallery picker (chọn từ media đã upload trước) | |

### 1.7 Bilingual (i18n)

| Trạng thái | Tính năng |
| --- | --- |
| ✅ Done | Mỗi block có `contentVi` + `contentEn` riêng |
| ✅ Done | Toggle VI/EN trong header swap content + form sidebar đồng bộ |
| ✅ Done | Mock + AI generate trả về cả 2 ngôn ngữ |
| ⏳ Backlog | Auto-translate VI ↔ EN (gọi LLM) |

### 1.8 Persistence flow

| Trạng thái | Tính năng |
| --- | --- |
| ✅ Done | Load metadata `rexerApi.canvasTemplates.get(id)` + canvas data `getCanvas(id)` (ETag handshake) |
| ✅ Done | Parse `canvas_data.schema === 'block_editor'` → blocks; legacy Fabric → seed mock + dirty |
| ✅ Done | Autosave debounce **1500ms** sau khi dirty, silent toast |
| ✅ Done | Manual save trigger (giữ ngầm, hiện không có button — autosave đảm nhiệm) |
| ✅ Done | Version-lock: gửi `version` cũ → REXER reject nếu stale |
| ✅ Done | `beforeunload` flush + cleanup flush khi unmount |
| ✅ Done | Refs cho latest state (tránh stale closure trong setTimeout / event handler) |
| ✅ Done | Timeout **5s** trên REXER calls → fallback mock + banner |

### 1.9 Preview mode

| Trạng thái | Tính năng | File |
| --- | --- | --- |
| ✅ Done | Toggle bằng nút "Xem trước" trong header | `block-editor/PreviewMode.tsx` |
| ✅ Done | Full-screen overlay đen, hide editor chrome | |
| ✅ Done | Render tất cả block visible stacked theo thứ tự | |
| ✅ Done | Device width selector trong preview (Desktop / Tablet / Mobile) | |
| ✅ Done | Đóng bằng nút X hoặc phím Esc | |

---

## 2. API / Backend

### 2.1 REXER backend (external, qua proxy `/api/rexer/*`)

Tất cả call qua `rexerApi` client (`src/services/rexer/endpoints.ts`).

| Trạng thái | Endpoint | Mục đích |
| --- | --- | --- |
| ✅ Reuse | `GET /canvas-templates?...` | List templates (cho `/canvas-templates` page) |
| ✅ Reuse | `GET /canvas-templates/:id` | Metadata template |
| ✅ Reuse | `GET /canvas-templates/:id/canvas` (ETag) | Lazy-load canvas_data + 304 short-circuit |
| ✅ Reuse | `POST /canvas-templates` | Create (engine `block_editor@1`) |
| ✅ Reuse | `PATCH /canvas-templates/:id` | Update (yêu cầu `version` cho optimistic lock) |
| ✅ Reuse | `DELETE /canvas-templates/:id` | Soft delete |
| ✅ Reuse | `PUT /canvas-templates/:id/thumbnail` | Set thumbnail URL |
| ⏳ Backlog | Endpoint AI generate thật trên REXER (hiện đang stub local) | |
| ⏳ Backlog | Comments / collaborators / publish flow của my-pages source | |

**Wire format `canvas_data`:**

```ts
{
  schema: 'block_editor',
  version: 1,
  blocks: Block[],          // each block with contentVi + contentEn + isVisible + blockType
  activeBlockId?: string
}
```

### 2.2 Local Next.js API routes

| Trạng thái | Route | Mục đích | File |
| --- | --- | --- | --- |
| ✅ Done | `POST /api/ai/block-content` | Stub AI generate per block type — input `{blockType, prompt, lang}` → output content shape khớp block | `app/api/ai/block-content/route.ts` |
| ✅ Reuse | `POST /api/upload` | Multipart upload → S3 → trả URL | `app/api/upload/route.ts` |
| ✅ Reuse | `/api/auth/*`, `/api/products/*`, … | Các route hiện có khác | — |
| ⏳ Backlog | AI route gọi LLM thật (Anthropic / OpenAI) thay vì stub | |
| ⏳ Backlog | `/api/canvas-templates/*` local (nếu muốn rút khỏi REXER) | — |

### 2.3 Data shapes

| Trạng thái | Type | File |
| --- | --- | --- |
| ✅ Done | `Block`, `BlockType`, `BlockContent`, `BLOCK_TYPE_META` | `block-editor/types.ts` |
| ✅ Done | `HeroSplitContent`, `HeroOverlayContent`, `HeroSplitStat` | |
| ✅ Done | `ImageTransform`, `DEFAULT_IMAGE_TRANSFORM` | |
| ✅ Done | `BlockEditorCanvas` + `parseCanvas` + `serializeCanvas` + `seedBlocks` | `block-editor/serialize.ts` |
| ✅ Done | `createBlock(type)` factory với defaults VI + EN | `block-editor/factory.ts` |

---

## 3. State / Logic

| Trạng thái | Logic | Ghi chú |
| --- | --- | --- |
| ✅ Done | Editor state holding (blocks, activeId, lang, device, zoom, dirty, saving, loading, loadError, addOpen, previewing) | |
| ✅ Done | Refs để tránh stale closure cho autosave / beforeunload | |
| ✅ Done | Mutations: `updateActiveContent`, `handleAdd`, `handleRemove`, `handleReorder` | |
| ✅ Done | Loading / error fallback flow | |
| ⏳ Backlog | Undo / redo stack | |
| ⏳ Backlog | Element selection state (highlight + sidebar focus) | |

---

## 4. Infra / Deploy

| Trạng thái | Tính năng | Ghi chú |
| --- | --- | --- |
| ✅ Done | Build production `yarn build` pass (~21s local, 30s Vercel) | |
| ✅ Done | Type-check `yarn type-check` pass | |
| ✅ Done | Lint + Prettier auto-format pass | |
| ✅ Done | `vercel.json` (region `sin1`, build/install command, upload route maxDuration 30s) | |
| ✅ Done | `.vercelignore` loại visual-tests / docs khỏi build | |
| ✅ Done | `scripts/vercel-env-import.sh` đẩy `.env` lên Vercel cho 3 environment | |
| ✅ Done | Production live: **https://rexerai.vercel.app** | |
| ✅ Done | Editor URL prod: https://rexerai.vercel.app/canvas-templates/[id] | |
| ✅ Done | GitLab repo `lantm.tekup/rexerai` connect Vercel — push commit auto preview deploy | |
| ✅ Done | 5 env vars đã đẩy: `NEXT_PUBLIC_REXER_API`, `STORAGE_SERVER`, `UPLOAD_SKIP_CONFIRM`, `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS` | |
| ⏳ Backlog | `MONGODB_URI` (cần cho admin/product/seo routes nếu deploy admin) | |
| ⏳ Backlog | `S3_*` (cho upload ảnh trên prod) | |
| ⏳ Backlog | Custom domain (ví dụ `rexer.tekup.vn`) | `vercel domains add` + DNS CNAME |
| ⏳ Backlog | REXER URL HTTPS (hiện đang HTTP `75.119.128.96:9090`) | |

---

## 5. Test scripts (Playwright)

| Trạng thái | Script | Mục đích |
| --- | --- | --- |
| ✅ Done | `scripts/visual-tests/snap-block-editor.mjs` | Snapshot editor mặc định |
| ✅ Done | `scripts/visual-tests/snap-block-editor-interactions.mjs` | VI/EN switch + add block flow |
| ✅ Done | `scripts/visual-tests/snap-block-editor-phase4-6.mjs` | Hero Overlay + AI generate |
| ✅ Done | `scripts/visual-tests/snap-fixes.mjs` | Layers tab + Preview mode |
| ✅ Done | `scripts/visual-tests/snap-rotate.mjs` | Image rotate + zoom |

---

## 6. Backlog (priority order)

1. **C — Free-form transform per element** trong preview (Fabric/Figma style: bounding box 8 handles + rotation, drag move). Cần đổi layout HeroSplit từ grid sang absolute, persist `_transforms[elementKey]`.
2. **B — Block-level rotation + aspect ratio chooser** (16:9 / 4:3 / 1:1 / 9:16, rotation ±90°/180°).
3. **Element interaction** — click element trong preview → focus tương ứng trong Layers + sidebar.
4. **AI thật** — wire `/api/ai/block-content` vào Anthropic SDK với prompt caching, replace stub.
5. **Block type rollout** — port lần lượt các block còn lại (feature, gallery, booking, CTA, master_plan, amenities, …).
6. **Undo/redo** stack.
7. **Visibility / rename UI** lại trong Layers tab.
8. **Drag offset cho image** trong ImagePicker.
9. **Layer order persist** vào content `_layerOrder` để áp z-index.
10. **Auto-translate** nội dung VI ↔ EN qua LLM.
11. **Comments / collaborators / publish** từ source 360-admin.
12. **Đổi REXER → HTTPS** + cấu hình `NEXT_PUBLIC_REXER_API` đúng prod.

---

## 7. Đường dẫn tham chiếu

- Editor source: `src/components/modules/CanvasTemplate/`
  - Main: `BlockEditor.tsx`
  - Sub: `block-editor/*`
  - Renderers: `block-editor/blocks/*`
- API client: `src/services/rexer/endpoints.ts` + `client.ts` + `types.ts`
- Local API: `src/app/api/ai/block-content/route.ts`, `src/app/api/upload/route.ts`
- Page route: `src/app/(app)/canvas-templates/[id]/page.tsx`
- Source clone gốc: `~/Documents/360-admin-cms/src/containers/frontend/user-pages/`
