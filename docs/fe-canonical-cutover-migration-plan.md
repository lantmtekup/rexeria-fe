# FE Canonical Cutover — Migration Plan

> **Date**: 2026-05-24
> **Author**: @Lantm (FE owner)
> **Status**: 🟡 Draft — chờ BE confirm `/v1/track` shape + Migration 134 prod window
> **Trigger**: BE đã merge cutover (commits `8724cb5` → HEAD trên `main`). Migration 134 sẽ drop 23 bảng legacy + unmount ~30 endpoint cũ → mọi page FE đang gọi endpoint legacy sẽ 404 ngay khi BE chạy prod.
> **Liên quan**:
> - BE handoff: `~/Downloads/handoff-canonical-cutover-2026-05-24.md`
> - FE reply: `docs/be-architecture-qa-reply-2026-05-24.md`
> - Spec: `docs/rexer-architecture-final-2026-05-23.md`

---

## TL;DR

**14 file FE** sẽ gãy ngay sau khi BE chạy Migration 134 trên prod. Effort tổng: **~5-7 ngày FE** (1 dev), chia 3 wave theo dependency. Bắt buộc deploy FE TRƯỚC HOẶC ĐỒNG THỜI với BE cutover.

```
Wave 1 (1-1.5 ngày) — Service layer rewrite
  └── src/services/rexer/endpoints.ts + types.ts
Wave 2 (2-3 ngày) — Critical path: admin + portal pages
  └── 9 page dùng canvasTemplates/clients/savedBlocks/workspaces
Wave 3 (2 ngày) — AI + feedback + analytics tracker
  └── ElementToolbar, useAiApplyProduct, FeedbackDialog, tracker.ts
```

---

## 1. Endpoint mapping — Legacy → Canonical

| Legacy namespace | Legacy path | Canonical namespace | Canonical path | Note |
|---|---|---|---|---|
| `rexerApi.clients` | `/clients/*` | `rexerApi.brands` | `/brands/*` | Rename. UUID giữ nguyên. |
| `rexerApi.clients.users` | `/clients/:id/users` | `rexerApi.brands.users` | `/brands/:id/users` | Role `client_user` → `brand_admin`/`brand_member` (mapping membership). |
| `rexerApi.canvasTemplates` | `/canvas-templates/*` | **SPLIT** — depends on usage | — | Xem mục 2.1 (3 patterns). |
| `rexerApi.canvasTemplates.assign` | `/canvas-templates/:id/assign` | `rexerApi.adminPages.fromTemplate` | `POST /admin/pages/from-template` | Body shape khác — xem 2.1. |
| `rexerApi.canvasTemplates.cloneToWorkspace` | `/canvas-templates/:id/clone-to-workspace` | `rexerApi.workspaces.pages.create` | `POST /workspaces/:wsId/pages` | Body: `{template_id, type, name}`. |
| `rexerApi.canvasTemplates.getCanvas` | `/canvas-templates/:id/canvas` | `rexerApi.pages.config` | `GET /pages/:id` (config_json trong response) | Canvas data giờ ở `page_revisions.config_json`. |
| `rexerApi.canvasTemplates.setThumbnail` | `PUT /canvas-templates/:id/thumbnail` | `rexerApi.pages.setThumbnail` | `PUT /pages/:id/thumbnail` | Same shape. |
| `rexerApi.savedBlocks` | `/saved-blocks/*` | `rexerApi.blocks` | `/blocks/*` | Scope filter `?scope=brand_private`. Item shape khác — xem 2.2. |
| `rexerApi.releases` | `/releases/*` | `rexerApi.pages.releases` | `/pages/:id/releases/*` | Mọi op (list/get/rollback) move sang nested. |
| `rexerApi.notifications` | `/portal/notifications/*` | — | ❌ no replacement Phase 1 | Xem mục 2.4 (FE strategy). |
| `rexerApi.templateComments` | `/portal/templates/:id/comments/*` | — | ❌ defer Phase 2 | Xem 2.5. |
| `rexerApi.feedback` | `/feedback/*` | — | ❌ defer Phase 2 | Xem 2.6. |
| `rexerApi.adminFeedback` | `/admin/feedback/*` | — | ❌ defer Phase 2 | Same. |
| `rexerApi.ai.productEnrich` | `POST /ai/product/enrich` | `rexerApi.aiJobs.create` | `POST /ai/page-optimize` hoặc custom job_type | BE chỉ còn 4 endpoint AI mới. |
| `rexerApi.ai.templateSuggest` | `POST /ai/template/suggest` | `rexerApi.aiJobs.create` | `POST /ai/template-draft` | Map sang `job_type='template_draft'`. |
| `rexerApi.ai.landingDraft` | `POST /ai/landing/draft` | `rexerApi.aiJobs.create` | `POST /ai/template-draft` | Same. |
| `rexerApi.ai.landingOptimize` | `POST /ai/landing/optimize` | `rexerApi.aiJobs.create` | `POST /ai/page-optimize` | `job_type='page_optimize'`. |
| `rexerApi.ai.mediaSuggest` | `POST /ai/media/suggest` | `rexerApi.aiJobs.create` | `POST /ai/image-generate` | `job_type='image_generate'`. |
| `rexerApi.ai.campaignPlan` | `POST /ai/campaign/plan` | ❌ defer Phase 2 | — | Stub mock cho đến khi BE wire LLM. |
| `rexerApi.ai.blockContent` | `POST /ai/block-content` | `rexerApi.aiJobs.create` | `POST /ai/slot-suggest` | `job_type='slot_suggest'`. |
| `rexerApi.ai.canvasApplyProduct` | `POST /ai/canvas-templates/:id/apply-product` | ❌ defer | — | Map sang `slot-suggest` cho từng slot, hoặc stub. |
| `rexerApi.aiTemplates` | `/ai/templates/*` | ❌ defer Phase 2 | — | Page `/admin/ai-templates` sẽ hide. |
| `rexerApi.adminAiTemplates` | `/admin/ai/templates/*` | ❌ defer Phase 2 | — | Same. |
| `rexerApi.adminAiUsage` | `/admin/ai-usage/*` | `rexerApi.aiJobs.aggregate` | `GET /ai/jobs?aggregate=brand` (derive) | Phase 2 BE thêm endpoint riêng. |
| `rexerApi.meAiUsage` | `/me/ai-usage` | — | Derive client-side từ `/ai/jobs?requested_by=me` | Same. |
| `rexerApi.productCategories` | `/product-categories/*` | — | ❌ DROP | Category → string field `products.category`. |
| `rexerApi.collections` | `/collections/*` | ❌ defer | — | Data collection migrate sang `analytics_events`. |
| `rexerApi.templateAnalytics.ingestEvent` | `POST /analytics/events` | `rexerApi.track` | `POST /track` | Endpoint mới + anti-spam middleware. Cần BE confirm shape. |
| `rexerApi.workspaces.listForClient` | `/clients/:id/workspaces` | `rexerApi.brands.workspaces.list` | `/brands/:id/workspaces` | Rename. |
| `rexerApi.workspaces.create` | `POST /admin/clients/:id/workspaces` | `rexerApi.brands.workspaces.create` | `POST /brands/:id/workspaces` | Path đổi. |
| `rexerApi.workspaces.update/remove` | `/admin/workspaces/:id` | `rexerApi.workspaces.update/remove` | `/workspaces/:id` | Path đổi (no admin prefix). |

---

## 2. Special cases — không phải pure rename

### 2.1 `canvasTemplates` → SPLIT thành 3 entity

Mỗi usage của `rexerApi.canvasTemplates` phải decide map sang `pages` hay `templates` hay cả 2:

```
Trước (1 entity)              Sau (split)
─────────────────              ─────────────────────────────────────────────
admin/canvas-templates    →   admin/templates  (system catalog, scope='public')
                              admin/pages      (admin xem page của brand)
                              admin/canvas-builder/:tplVerId  (canvas editor mới)

portal/templates          →   portal/templates (browse catalog, GET /templates)
(clone from library)          + POST /workspaces/:wsId/pages {template_id}

portal/landing-pages      →   portal/landing-pages (GET /workspaces/:wsId/pages?type=landing)

canvas-templates/:id/canvas → pages/:id (config_json trong response, snapshot vào revision)
                            + templates/:id/versions/:vid (canvas_blueprint for editing)
```

**Heuristic decide**:
- Page list dạng brand-scoped (có `client_id`) → `pages`
- Page list dạng catalog (system, `is_template=true`) → `templates`
- Canvas editor authoring → `templates/:id/versions` (staff) hoặc `pages/:id` (brand fill slot)

### 2.2 `savedBlocks` → `blocks` với scope filter

```typescript
// Trước
await rexerApi.savedBlocks.list({ client_id, limit })

// Sau
await rexerApi.blocks.list({
  brand_id: client_id,        // rename param
  scope: 'brand_private',     // BE filter — system block default ẩn
  limit,
})
```

**Shape change**:
- `block_id` → `id`
- `block_json` → `settings` (jsonb thuần)
- thêm `type_code` (FK → `block_types.code`)
- thêm `scope: 'system'|'brand_private'|'brand_team'|'brand_public'`
- bỏ `is_shared` boolean → dùng `scope`

### 2.3 AI endpoints → 4 job types thống nhất

Mọi AI call giờ qua `POST /ai/{template-draft|slot-suggest|page-optimize|image-generate}` → async job pattern:

```typescript
// Trước (sync)
const result = await rexerApi.ai.blockContent({ block_type, prompt, ... })

// Sau (async job + polling/SSE)
const job = await rexerApi.aiJobs.slotSuggest({ page_id, slot_key, context })
// → { id, status: 'queued' }
const result = await pollJob(job.id)  // GET /ai/jobs/:id until status='succeeded'
```

**Lưu ý**: BE handoff §5.2 nói AI worker hiện stub (return 3 suggestion hard-coded cho `slot_suggest`). FE wire pattern đúng từ Day-1, để Phase 2 BE swap LLM thật là chạy được ngay.

### 2.4 Notification → no replacement Phase 1

BE đã drop `notifications` table + endpoint. 2 option:

- **(A) Hide UI**: comment out `<NotificationsBell />` ở `portal/_shell.tsx`. Đơn giản nhất, 30 phút.
- **(B) Derive từ `activity_logs`**: thêm endpoint client-side `useActivityFeed({ filter: 'cross-user', mark_read })`. Tốn 3-4h FE, không có table track read_at → fake bằng `localStorage`.

Đề xuất: **(A)** Phase 1, ship lại Phase 2 khi BE wire email + activity_logs read_at.

### 2.5 Template comments → defer Phase 2

Tương tự — hide UI ở `portal/comments/page.tsx`. Có thể hiển thị banner "Comments will return in Phase 2" cho đỡ trống. Effort 1h.

### 2.6 Feedback → defer Phase 2

`FeedbackDialog.tsx` đang dùng `rexerApi.feedback.create`. Option:
- **(A)** Disable nút "Send feedback" trong UI menu.
- **(B)** Reshape thành `mailto:feedback@rexer.ai` link.

Đề xuất **(B)** — 30 phút, brand vẫn có path feedback.

### 2.7 Analytics tracker — `/v1/track` shape chờ BE

`src/components/modules/CanvasTemplate/tracker.ts` đang gọi `POST /analytics/events`. BE handoff §5 question 3: "FE đang gửi shape gì?". Cần FE reply BE shape hiện tại:

```typescript
// Current FE payload (tracker.ts)
{
  template_id: string,
  block_id?: string,
  event_type: 'page_view' | 'block_view' | 'click' | 'scroll' | ...,
  visitor_id: string,
  session_id: string,
  meta: object,
  occurred_at: ISO timestamp,
}
```

**Action**: gửi payload mẫu cho BE → BE confirm `/v1/track` accept same shape hay cần adjust. Anti-spam 3 lớp đã có sẵn, chỉ chờ mount.

---

## 3. Wave plan — 3 phase deploy

### Wave 1 — Service layer rewrite (1-1.5 ngày)

**Mục tiêu**: refactor `src/services/rexer/endpoints.ts` + `types.ts` để expose canonical namespaces. Giữ legacy namespace làm shim chuyển hướng (warn `console.warn` deprecated).

| Task | File | Effort |
|---|---|---|
| Add `rexerApi.brands.*` (mirror clients, rename param) | `endpoints.ts` | 2h |
| Add `rexerApi.pages.*` (CRUD + config + revisions + publish + releases) | `endpoints.ts` | 3h |
| Add `rexerApi.blocks.*` (CRUD with scope) | `endpoints.ts` | 1h |
| Add `rexerApi.aiJobs.*` (4 job types + jobs/:id polling) | `endpoints.ts` | 2h |
| Add `rexerApi.track.*` (1 method, chờ BE confirm shape) | `endpoints.ts` | 30m |
| Update `rexerApi.workspaces.*` (path đổi không có /admin prefix) | `endpoints.ts` | 30m |
| Rename types `Client → Brand`, `ClientUser → BrandUser`, etc. | `types.ts` | 1h |
| Add deprecation `console.warn` cho legacy namespace | `endpoints.ts` | 30m |
| Unit test smoke (mock fetcher) | `__mocks__/` | 1h |

**Deliverable**: PR `feat(rexer): canonical API client + types`. Backward compat — page cũ vẫn chạy với warning.

### Wave 2 — Critical path swap (2-3 ngày)

**Mục tiêu**: swap 9 page dùng `canvasTemplates`/`clients`/`savedBlocks` heavy nhất.

| Order | Page | Namespace cũ → mới | Effort |
|---|---|---|---|
| 1 | `AdminClientDetailPage.tsx` | `clients` → `brands`, `canvasTemplates` → `pages`, `savedBlocks` → `blocks`, `workspaces` rename | 4h |
| 2 | `AdminUsersPage.tsx` | `clients` → `brands` (filter user qua membership) | 2h |
| 3 | `AdminCanvasTemplatesPage.tsx` | `canvasTemplates` → `templates` (system catalog scope) | 3h |
| 4 | `AdminBlocksPage.tsx` | `savedBlocks` → `blocks` | 2h |
| 5 | `AdminAssignTemplateDialog.tsx` | `canvasTemplates.assign` → `adminPages.fromTemplate`, `clients.list` → `brands.list` | 2h |
| 6 | `AdminAddLandingForClientDialog.tsx` | `canvasTemplates.create+assign` → `workspaces.pages.create` body `{template_id, type='landing', name}` | 2h |
| 7 | `AdminCreateUserModal.tsx` | `clients.inviteUser` → `brands.users.invite` (rename) | 1h |
| 8 | `portal/templates/page.tsx` | `canvasTemplates.cloneToWorkspace` → `workspaces.pages.create` body `{template_id}`. `portal.listTemplateLibrary` giữ. | 3h |
| 9 | `portal/landing-pages/*` (toàn folder) | `canvasTemplates.list({client_id})` → `workspaces.pages.list({type:'landing'})`. Detail page swap field. | 4h |

**Deliverable**: PR `feat(admin+portal): swap to canonical API`. Loại bỏ shim legacy ở phase này (chấp nhận hard break).

### Wave 3 — AI + feedback + analytics + cleanup (2 ngày)

| Order | Page | Action | Effort |
|---|---|---|---|
| 10 | `ElementToolbar.tsx` | `ai.blockContent` → `aiJobs.slotSuggest` (async pattern + polling) | 3h |
| 11 | `useAiApplyProduct.ts` | `ai.canvasApplyProduct` → loop `aiJobs.slotSuggest` per slot, hoặc stub | 3h |
| 12 | `AITemplateList.tsx` + `VersionHistoryDrawer.tsx` | Hide UI hoặc gắn banner "Phase 2" | 1h |
| 13 | `FeedbackDialog.tsx` | Switch sang `mailto:` link | 30m |
| 14 | `portal/_remote.tsx` notifications | Hide `<NotificationsBell />` | 30m |
| 15 | `portal/comments/page.tsx` | Hide hoặc banner "Phase 2" | 1h |
| 16 | `AdminOverviewPage.tsx` | Remove `adminAiUsage`, `adminFeedback`; thay bằng `brands.list`, `pages.count` derive | 2h |
| 17 | `tracker.ts` (analytics) | Switch `/analytics/events` → `/track`, thêm HMAC visitor token header | 2h |
| 18 | Delete legacy namespace stub khỏi `endpoints.ts` + `types.ts` | Final cleanup | 1h |
| 19 | E2E smoke test portal + admin flow | Manual + Playwright | 3h |

**Deliverable**: PR `chore(fe): cutover cleanup + e2e smoke`. Sau merge → ready for BE Migration 134 prod.

---

## 4. Coordination với BE — Cutover sequencing

```
Day 0  (now)        : FE start Wave 1
Day 2  (FE)         : Wave 1 PR merge → deploy staging
Day 2  (BE)         : Mount /v1/track + AI worker stub OK on staging
Day 5  (FE)         : Wave 2 merge → deploy staging
Day 7  (FE)         : Wave 3 merge → deploy staging
Day 8  (joint)      : Joint smoke test staging — admin + portal flow end-to-end
Day 9  (PM sign-off): Window confirmed cho prod cutover
Day 10 (joint)      : Maintenance window 2-4h
                      00:00  Backup pg_dump 23 legacy tables
                      00:15  BE run Migration 134 prod
                      00:30  FE deploy canonical build prod
                      00:45  Smoke test prod
                      01:00  Open traffic
Day 10-13           : 72h watch window — rollback ready
Day 14              : Cleanup legacy handler (BE) + announce done
```

**Pre-cutover blockers** — không deploy prod khi còn 1 trong các điều này chưa OK:
- [ ] BE confirm `/v1/track` shape match FE payload
- [ ] BE confirm AI worker stub OK Phase 1 (hard-coded 3 suggestion)
- [ ] BE wire `users.active_workspace_id` → cookie/header fallback (xem BE handoff §3.2)
- [ ] FE đã wire toàn bộ 14 page (Wave 1+2+3 merge)
- [ ] Staging smoke test pass (admin assign + brand clone + page publish + visit landing)
- [ ] `pg_dump` 23 table xong, lưu `infra/migration-backups/2026-Q2/`
- [ ] Validation report `docs/migration-2026-Q2/validation-report-*.md` PM ký off

---

## 5. Risk + mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| BE Migration 134 chạy prod trước FE deploy → portal 404 toàn diện | Medium | Joint deploy window, FE deploy TRƯỚC BE migrate. |
| `canvas_data` legacy không convert được sang `canvas_blueprint` | Medium | BE đã có Fabric converter (`pkg/canvas/fabric_to_blueprint.go`). FE giữ nút "Tải bản gốc JSON" cho brand 2 tuần. |
| AI stub return giống nhau → UX kém | Low | Đã chấp nhận trong Phase 1 — FE hiển thị badge "AI Beta — slot suggestions are placeholder until Phase 2". |
| Notification UI đột ngột mất → brand thắc mắc | Low | In-app banner 1 tuần đầu: "Notifications via email — in-app coming Phase 2". |
| `/v1/track` rate-limit quá strict → analytics drop | Low | Phase 1: log dropped events, alert nếu >5%/h. BE adjust capacity. |
| Saved-blocks localStorage cache out-of-sync với canonical | Medium | Wave 2 chuyển hoàn toàn sang server-backed, localStorage chỉ làm offline cache với TTL 1h + ETag check. |
| 8 legacy AI endpoint biến mất → break canvas builder | High | Wave 3 stub `aiJobs` chạy local mock cho dev — Phase 2 swap LLM thật. |

---

## 6. Out-of-scope (defer Phase 2)

Không touch trong wave này, ghi nhận cho Phase 2 backlog:

- `/admin/ai-templates` full page (block `aiTemplates` namespace mất)
- `/portal/comments` full page (template comments mất)
- Feedback dialog → form sang link mailto, không build form mới
- `notifications` real-time UI
- `data_collections` page (chưa thấy FE dùng)
- `product_categories` page (chưa thấy FE dùng)
- AI worker LLM dispatch — BE Phase 2
- Email-based notifications — BE Phase 2
- TLS provisioning real — BE Phase 2 (FE chỉ hiển thị status từ `tls_status` column)

---

## 7. Acceptance criteria

FE cutover được coi là done khi:

- [ ] Tất cả 14 file Wave 1+2+3 swap xong, không còn `console.warn` deprecated
- [ ] `npm run build` + `npm run type-check` clean
- [ ] E2E suite pass (admin flow + portal flow + public landing render)
- [ ] Manual smoke checklist: login admin → tạo brand → assign page → brand login → fill slot → publish → visit public URL → analytics event fire
- [ ] No fetch error trong DevTools Network sau khi navigate qua mọi page admin + portal
- [ ] Legacy `rexerApi.clients|projects|savedBlocks|canvasTemplates|ai|aiTemplates|feedback|notifications|templateComments|productCategories|collections` đã delete khỏi `endpoints.ts`
- [ ] PR description list rõ breaking change cho BE/PM

---

## 8. Contact

- **FE owner**: @Lantm (`lantm.tekup@gmail.com`)
- **BE owner**: see `~/Downloads/handoff-canonical-cutover-2026-05-24.md` git log
- **Repo FE**: `gitlab.com/lantm.tekup/rexerai` branch `develop`
- **Repo BE**: BE-side, branch `main` 7 commit ahead
- **Cutover window**: TBD — propose 2026-06-03 00:00 ICT (Wed), confirm với PM
