# FE User Features — Status (Ready vs Chưa ready)

> Phạm vi: khu vực **end-user** = route group `src/app/(app)/*` (land `/home`).
> KHÔNG bao gồm brand (`/portal`), admin (`/admin`), CMS, landing public.
> Persona xác nhận qua `src/middleware.ts` + `src/lib/auth/roleTarget.ts`
> (`role !== 'admin'` và không có brand → `/home`).
>
> Phương pháp: smoke test runtime (Playwright, 15/15 route load 200, auth OK)
> + soi code data-wiring (mock / ComingSoon / rexerApi thật).
> Ngày audit: **2026-07-02**. Tài khoản test user: `qc.internal01@rexer.ai`.

## ✅ READY — nối BE thật, chạy được

| Tính năng | Route | Nguồn data | Ghi chú |
|---|---|---|---|
| Trang chủ | `/home` | `rexerApi.dashboard` | Real; mock chỉ là fallback khi BE 401 (`home/page.tsx` MOCK_*) |
| Template | `/template`, `/template/[id]`, `/template/[id]/edit` | `rexerApi.templates` + BlockEditor | List + editor thật |
| Sản phẩm | `/product`, `/product/[id]` (information, media) | `rexerApi.products` | CRUD thật |
| Marketing | `/marketing` | `rexerApi.campaigns` | List campaign thật (verified data prod) |
| Canvas templates | `/canvas-templates`, `/canvas-templates/[id]` | `rexerApi.canvasTemplates` | ⚠️ toast 404 khi list rỗng |
| Collections | `/collections`, `/collections/[id]` | `dataCollectionRemote` | ⚠️ toast 404 khi list rỗng |

## 🟡 PARTIAL — khung thật nhưng còn mock / TODO

| Tính năng | Route | Vấn đề |
|---|---|---|
| Marketing sub-flow | `/product/[id]/marketing/[mid]/*`, `/ai-agents/[productId]/marketing/[mid]/*` | Tab **campaign** = real (`rexerApi.campaigns`); **concept / discovery / assets** = MOCK (`src/components/modules/Product/marketingMocks.ts` — *"Replace with real API in a later phase"*) |
| AI Agents | `/ai-agents`, `/ai-agents/[productId]/*` | Flow product/agent real; nhánh marketing dùng mock ở trên |
| AI Templates | `/ai-templates`, `/ai-templates/[id]/review` | List/generate real; `[id]/review` còn TODO: chưa map `blocks[]` → block-editor (canvas mapping); có mock-toggle |
| Product start | `/product/start` | Màn intro tĩnh (background placeholder), chưa nối trực tiếp create |

## 🔴 NOT READY — Coming Soon placeholder

| Tính năng | Route | Trạng thái |
|---|---|---|
| Thông báo | `/notification` | `ComingSoonState` |
| Hỗ trợ | `/support` | `ComingSoonState` |
| Setting → Profile | `/setting/profile` | `ComingSoonState` |
| Setting → Security | `/setting/security` | `ComingSoonState` |
| Setting → Theme | `/setting/theme` | `ComingSoonState` |
| Setting → Integrations | `/setting/integrations` | `ComingSoonState` |

> `/setting` (hub) render list 5 mục nhưng mọi trang con đều Coming Soon →
> toàn bộ khu Settings chưa hoạt động.

## Tổng kết

- **6 nhóm READY** · **4 PARTIAL** · **6 trang NOT-READY** (2 coming-soon + 4 settings).
- Lỗi UX đã xác nhận: **toast "Not Found" (HTTP 404)** hiện khi danh sách rỗng ở
  collections / canvas-templates / template — BE trả 404 thay vì `[]`. Fix:
  catch 404 ở FE coi như empty, hoặc BE trả mảng rỗng.
- Data lạ (không phải lỗi FE): `/home` hiện `CTR 130.08%` (>100%) — cần BE xem lại logic.

## Việc cần làm (đề xuất)

1. Wire marketing sub-flow (concept/discovery/assets) vào API thật, bỏ `marketingMocks`.
2. Hoàn thiện AI Template review → map `blocks[]` sang block-editor.
3. Dựng thật Settings (profile/security/theme/integrations) + Notification + Support.
4. Fix toast 404-khi-rỗng ở collections/canvas/template.
