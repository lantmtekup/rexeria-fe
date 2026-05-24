# Reply gửi BE — Confirm trước khi lock spec

> **Date**: 2026-05-24
> **From**: FE owner (@Lantm)
> **To**: BE squad
> **Re**: BE review `rexer-architecture-final-2026-05-23.md` (12 mục QA)
> **Status**: 🟡 **Pending BE ack** — sau khi BE OK mục 1-11 → lock spec v1.1
> **Liên quan**: `rexer-architecture-final-2026-05-23.md` (spec), `be-audit-2026-05-23.md` (live probe), `be-handoff-2026-05-23.md` (P0/P1 list)

---

## TL;DR

Cảm ơn BE đã review kỹ. Confirm chi tiết theo đúng 12 mục dưới đây. Sau khi BE OK toàn bộ, mình sẽ commit thành **§22 Migration Matrix v1.0** trong `rexer-architecture-final-2026-05-23.md` và bump status sang `🔒 LOCKED v1.1`.

**Gap lớn nhất hiện tại**: §22 trong spec mới chỉ có stub 7 dòng — không đủ cho BE migrate 44 → ~22 bảng an toàn. Bản reply này fill full matrix cho mục 2.

---

## 1. Scope & status

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Spec final để implement? | ✅ **Final** — 14 decision Q1-Q14 + 5 hardening đã chốt. Sau khi BE ack mục 2-11 dưới đây thì lock v1.1. |
| 2 | Phase 1 có cover landing + ad + curate? | ✅ **Có đủ 3 surface** (Q14). Editor UI ship Day-1, ad export Phase 1 chỉ PNG (MP4/HTML5 deferred Phase 2). |
| 3 | Brand tự tạo page/template? | ✅ **Page**: có (W4). **Template**: Phase 1 chỉ Rexer staff tạo `scope='public'`; brand `scope='brand_private'` defer Phase 2 (xem §15). Brand chỉ clone từ library + fill slot. |
| 4 | Module cũ không còn trong spec → migrate/archive/drop? | **Archive là default**. Xem matrix chi tiết mục 2. Quy tắc: KHÔNG drop silent — phải có 1 trong 3 path: (a) reshape vào table mới, (b) export sang cold storage, (c) drop kèm validation query xác nhận 0-row hoặc không còn dependent flow. |

---

## 2. Migration mapping — Full matrix 44 → ~22 bảng

> **Default action = DROP** sau khi đã (a) reshape data cần giữ sang table mới + (b) chạy validation query xác nhận không còn FE/cron/job nào reference. Mọi DROP đều phải log vào file `docs/migration-2026-Q2/drop-manifest.md`.

### 2.1 Auth/Session (3 bảng)

| Old | Action | Target | Note |
|---|---|---|---|
| `sessions` | **RESHAPE** | Giữ table với schema tối thiểu `(id, user_id, expires_at, ip, ua)` — cookie auth cần | Drop fields legacy nếu có |
| `auth_identities` | **DROP** | — | Phase 1 chỉ email+password. SSO/OAuth defer Phase 2 → tạo lại khi cần. Validation: `SELECT COUNT(*) FROM auth_identities WHERE provider != 'local'` = 0 trước khi drop. |
| `password_reset_tokens` | **KEEP** | giữ nguyên | Reset flow vẫn cần |

### 2.2 Workspace/Member (2 bảng)

| Old | Action | Target |
|---|---|---|
| `clients` | **RENAME** | `brands` (kèm `client_id → brand_id` rename ở mọi FK) |
| `workspace_members` | **DROP + RESHAPE** | `brand_memberships` (N-N user × **brand** × role, không phải workspace). Phase 1 không multi-workspace permission — xem mục 3.6. |

### 2.3 Canvas/Template (3 bảng) ⚠️ **Critical**

| Old | Action | Note |
|---|---|---|
| `canvas_templates` | **DROP** | Concept gộp vào `templates` + `pages`. 18 row hiện tại reshape: row có `client_id IS NOT NULL` → tạo `pages(type='landing')` + lưu `canvas_data` vào `page_revisions.config_json` (như legacy snapshot). Row `is_template=true` → tạo `templates(scope='public')` + `template_versions(canvas_blueprint=...)`. |
| `template_comments` | **ARCHIVE** | Cold storage (S3 JSON dump). Comment feature defer Phase 2 — không thiết kế lại Day-1. Nếu BE muốn giữ live → reshape thành `activity_logs(action='page.comment')`. |
| `projects` | **DROP** | 10 row hiện tại convert → `pages(type='landing')`. Giữ UUID cũ làm `pages.id` (xem mục 4.2). |

→ Có **converter Fabric JSON → canvas_blueprint** chưa? Trả lời mục 5.1.

### 2.4 Media/Product (7 bảng)

| Old | Action | Note |
|---|---|---|
| `media_assets` | **KEEP + RESHAPE** | Add `folder_id` FK, đổi `client_id → brand_id`. Giữ data. |
| `media_variants` | **DROP** | Phase 1 không cần optimized variant table riêng — dùng CDN on-the-fly resize (Cloudflare Images / R2 + worker). Validation: confirm FE không query variant cụ thể (chỉ `public_cdn_url` + transform query string). |
| `media_upload_sessions` | **KEEP** | 3-step upload (init/raw/complete) trong spec §10 vẫn cần session token. |
| `media_folders` | **KEEP + RESHAPE** | Đổi `client_id → brand_id`. |
| `project_media_bindings` | **DROP** | Binding implicit qua `pages.config_json` slot value (slot type `image`/`gallery` chứa `media_asset_id`). Validation: snapshot vào `page_releases.config_snapshot` khi publish. |
| `product_media_bindings` | **DROP** | Same pattern — binding qua `products.thumbnail_asset_id` + slot value. |
| `products` | **KEEP + RESHAPE** | Đổi `client_id → brand_id`. Sizes/colors/variants/ingredients → `attributes: jsonb` (spec §4.4). |
| `product_categories` | **DROP** | Category → string field trong `products.category` (đủ cho Phase 1). Tree category defer Phase 2 nếu brand cần. |

### 2.5 Data collection

→ BE clarify "data collection" gồm table nào cụ thể? Đoán: `form_submissions`, `lead_captures` hoặc tương tự.

| Old | Action |
|---|---|
| `form_submissions` (nếu có) | **RESHAPE** → `analytics_events(event_type='form_submit', meta=payload)` |
| `lead_captures` (nếu có) | **RESHAPE** → same, `event_type='cta_click'` + `meta.lead_data` |

→ Phase 2 có thể tách riêng `leads` table nếu cần CRM workflow.

### 2.6 AI (~5 bảng)

| Old | Action |
|---|---|
| `ai_jobs` (legacy) | **RESHAPE** → `ai_jobs` mới (spec §4.7). Map `job_type` enum: cũ → mới. |
| `ai_usage` | **DROP** | Cost ledger derive được từ `ai_jobs(cost_credits, tokens_in/out)` aggregate. Phase 1 free 100 jobs/day/brand cap (spec §13.3) — không cần ledger riêng. Nếu BE muốn keep cho audit lâu dài → ARCHIVE sang cold storage. |
| `ai_template_*` (draft logs) | **ARCHIVE** | Dump JSON cold storage. Job log mới đã capture đủ trong `ai_jobs.output_payload`. |
| `ai_prompts` (nếu có) | **DROP** | Prompt template inline trong code/config. |
| Historical AI logs | **ARCHIVE** sang S3 Parquet — không migrate vào `ai_jobs` (volume lớn, không cần query live). |
| User quota fields cũ trên `users` | **DROP** | Cap enforce qua `ai_jobs` count + Phase 2 thêm `brands.ai_credit_balance`. |

### 2.7 Analytics/Tracking

| Old | Action |
|---|---|
| `tracking_events` | **RESHAPE** → `analytics_events` (spec §4.6). Map fields, normalize `event_type` enum, partition by month. Historical events → ARCHIVE sang S3 Parquet, không load vào hot partition. |
| Backfill aggregate? | **KHÔNG** — chỉ aggregate forward từ `migration_date`. |

→ Anti-spam/bot cho public ingest: xem mục 8.5.

### 2.8 Ops (4 bảng)

| Old | Action |
|---|---|
| `notifications` | **DROP** | Phase 1 không có real-time notification UI. Email-based notify đã đủ. Nếu FE đang dùng `/portal/notifications` → reshape thành `activity_logs` filter + `unread_at` column. Cần BE confirm hiện có ai consume. |
| `feedback` | **DROP** | Phase 1 không có feedback widget. Nếu still used → ARCHIVE. |
| `staff_inbox_items` | **KEEP** | Page `/admin/staff-inbox` mới merge tuần này (commit `bab7150`) đang dùng. Confirm: BE giữ table, FE giữ wiring. Nếu BE muốn drop → revert FE page. |
| `curate_interaction_types` | **KEEP** | FE đang dùng `/portal/curate/interaction-types` (be-audit §3.1 confirm live). Giữ làm catalog cho curate widget kind. |

→ **BE acknowledge từng dòng** mục 2.1-2.8 trước khi mình lock matrix.

---

## 3. Auth / Tenant model

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Brand User model thế nào? | **`users` thuần auth** (admin/staff role only) + **`brand_memberships`** (N-N user × brand × role `brand_admin`/`brand_member`). User không có column `role='client_user'` nữa — role brand-side hoàn toàn ở membership. |
| 2 | Giữ `principal_type`? | **KHÔNG**. Polymorphic principal phức tạp + không cần Phase 1. Replace bằng `users.role IN ('admin','staff')` cho Rexer-side + `brand_memberships.role` cho brand-side. |
| 3 | `client_id → brand_id`? | ✅ **Rename toàn bộ** ở mọi table + FK. Code-mod cả BE handler + FE type (FE đã có shim sẵn ở `src/services/rexer/types.ts`). |
| 4 | `active_workspace_id`? | **KHÔNG persistent** ở user row. Lưu ở client-side cookie `ws=<workspace_slug>` (đã có sẵn `/portal?ws=...` trong spec §3). BE resolve workspace từ URL/header per request, không cần column. |
| 5 | `workspace_members → brand_memberships`? | ✅ **Reshape** — membership ở scope brand, không workspace. Phase 1: 1 user trong brand có quyền với mọi workspace của brand đó. |
| 6 | Multi-workspace permission Phase 1? | **KHÔNG**. Phase 1: membership ở brand-level → user thấy mọi workspace của brand. Phase 2 thêm `workspace_memberships` nếu cần per-WS permission. |

---

## 4. Page / Release migration

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | `projects → pages(type='landing')`? | ✅ Đúng. 10 row hiện có convert script. |
| 2 | Giữ UUID cũ? | ✅ **Giữ** `projects.id` làm `pages.id` để tránh break external link/share token đã share. |
| 3 | `project_config_revisions → page_revisions`? | ✅ Reshape, giữ `revision_no` sequence. Cron cleanup rolling 50 từ migration_date forward. Cũ > 50 → ARCHIVE 1 lần sang S3 nếu BE muốn audit, không thì DROP. |
| 4 | `releases → page_releases`? | ✅ Reshape. Map `project_id → page_id`. Snapshot fields (`config_snapshot`, `canvas_blueprint_snapshot`) — nếu cũ chưa có `canvas_blueprint_snapshot`, build từ template_version tương ứng tại migration time. |
| 5 | Mapping status cũ/new? | `draft → draft`, `published → published`, `archived → archived`. Nếu cũ có `in_review` hoặc state nào khác → map về `draft` + ghi `handoff_notes`. BE list giùm status enum cũ để chốt cụ thể. |
| 6 | `project_media_bindings` đi đâu? | **DROP** — binding implicit qua `pages.config_json` slot value (xem 2.4). Đảm bảo migration script populate slot value từ binding cũ trước khi drop bảng. |

---

## 5. Template / Canvas / Block

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Converter Fabric JSON → `canvas_blueprint`? | ⚠️ **Chưa có**. Đề xuất: BE viết converter trong S1 (effort ~3-4 ngày) — parse `fabric.canvas_data.objects[]` → map mỗi object sang `{block_id, slot_bindings}`. Heuristic: match `object.type` + `object.metadata.blockType` → `block_types.code`. |
| 2 | Nếu chưa có converter → giữ `legacy_canvas_templates` read-only? | ✅ **Có** — tạo table `legacy_canvas_templates` (rename + freeze write) làm cold reference cho 2 tuần đầu migration. FE có nút "Tải bản gốc" để brand download canvas_data JSON. Drop sau khi confirm không còn ai dùng (validation: 0 read 30 ngày). |
| 3 | `saved_blocks → blocks` scope nào? | `scope='brand_private'` (default). Nếu cũ có flag `is_shared` → `scope='brand_team'` (Phase 2 mới expose UI nhưng schema sẵn từ Phase 1). System block → `scope='system'`. |
| 4 | `block_type_registry → block_types`? | ✅ **Reshape**. Đổi PK sang `code: string` (spec §4.2). Add `supported_surfaces: text[]`, `props_schema: jsonb`. Seed thêm cho ad/curate surface (~11 type mới — xem §18). |
| 5 | `template_comments` còn dùng? | **KHÔNG Phase 1** — Archive. Reactivate qua `activity_logs(action='page.comment')` nếu sau này cần. |

---

## 6. Media & Product

Đã trả lời chi tiết ở mục 2.4. Tóm tắt:

| Câu hỏi | Trả lời |
|---|---|
| `media_variants` drop? | ✅ DROP — dùng CDN on-the-fly resize. |
| Thumbnail/optimized lấy từ đâu? | `media_assets.thumbnail_url` (1 thumbnail) + CDN URL với transform query (`?w=400&q=80`). Không cần variant table. |
| `media_upload_sessions` còn cần? | ✅ KEEP — 3-step upload (§10). |
| `product_media_bindings`? | DROP — binding qua `products.thumbnail_asset_id` + slot value. |
| `product_categories` table riêng? | DROP — dùng string column. Tree defer Phase 2. |
| Product fields → attributes? | ✅ `sizes`, `colors`, `variants`, `ingredients`, `features` đều vào `products.attributes: jsonb`. Indexed bằng GIN nếu cần filter. |

---

## 7. AI

Đã trả lời mục 2.6. Tóm tắt:

| Câu hỏi | Trả lời |
|---|---|
| `ai_jobs` thay toàn bộ AI logs cũ? | ✅ — schema mới (spec §4.7) cover `job_type` enum 4 type. Logs cũ → ARCHIVE S3. |
| Giữ `ai_usage` làm ledger? | **KHÔNG** — derive từ `ai_jobs` aggregate. Phase 2 thêm `brands.ai_credit_balance` nếu cần billing. |
| `ai_template_*` migrate/archive? | ARCHIVE cold storage, không migrate. |
| Historical AI logs? | ARCHIVE S3 Parquet. |
| User quota fields cũ? | DROP — cap qua `ai_jobs` count Phase 1 (100/day/brand). |

---

## 8. Analytics

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | `tracking_events → analytics_events`? | ✅ Reshape (spec §4.6). Forward-only migration. |
| 2 | `analytics_events` là editor analytics hay public? | **Public visitor analytics** (page_view, block_view, click, scroll, form_submit). Editor analytics (staff hành vi trong canvas builder) → `activity_logs` riêng. |
| 3 | Giữ historical analytics? | ARCHIVE S3 Parquet. Brand query qua "Legacy data" tab (Athena), không vào hot partition. |
| 4 | Backfill aggregate? | **KHÔNG** — forward-only từ migration_date. |
| 5 | Public ingest anti-spam/bot? | **3 lớp**: (a) Rate limit theo IP (Redis, 100 req/min/IP), (b) Bot UA filter (UA blacklist + heuristic — empty UA, headless detect), (c) Visitor_id signed token gen ở edge (HMAC IP+UA+date) → spam burst 1 IP không gen được nhiều visitor_id giả. Phase 2: Cloudflare Turnstile cho form_submit. |

---

## 9. Notification / Ops

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Giữ `notifications`? | **DROP** Phase 1. Email-based đủ. Nếu FE `/portal/notifications` đang dùng → reshape thành view trên `activity_logs` (filter actor != current_user + thêm `read_at` per user). BE quyết: drop full hay giữ light? |
| 2 | `feedback` còn dùng? | **DROP** Phase 1  Có 
| 3 | `staff_inbox_items` cho workflow? | **KEEP** — page `/admin/staff-inbox` mới merge tuần này (commit `bab7150`). Confirm BE giữ. |
| 4 | `curate_interaction_types` migrate/archive? | **KEEP** — FE đang dùng (be-audit §3.1). Reshape: đổi `client_id → brand_id` nếu có. Giữ làm catalog. |

---

## 10. RLS / FK

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Dùng physical FK? | ✅ **CÓ** cho mọi quan hệ brand-scoped (FK + `ON DELETE RESTRICT`). Defense-in-depth + cascade rules rõ. Exception: `analytics_events` (high-write, partitioned) → KHÔNG FK với `pages` để tránh write amplification, dùng app-level integrity check. |
| 2 | Cleanup orphan trước migration? | ✅ **BẮT BUỘC**. Trước mỗi `RENAME/RESHAPE`: chạy `validation_query.sql` (BE viết) trả 0 row orphan. Output dump vào `docs/migration-2026-Q2/validation-{table}.md`. Nếu có orphan: phân loại — `DELETE` (rác) hoặc `RESCUE` (tạo parent giả + log). |
| 3 | Denormalize `brand_id` cho RLS? | ✅ **CÓ** — mọi table multi-tenant phải có `brand_id` cột riêng (kể cả khi derive được qua join), để RLS policy dùng `WHERE brand_id = current_setting('app.brand_id')` không cần join (spec §19.1). Tốn 16 bytes/row, đổi lấy index hiệu quả + RLS đơn giản. |
| 4 | RLS dùng direct `brand_id` hay join? | **Direct `brand_id`**. Join trong policy = slow query + plan unstable. |
| 5 | Staged constraint validation? | ✅ — `ALTER TABLE ... ADD CONSTRAINT ... NOT VALID` rồi `VALIDATE CONSTRAINT` sau (tránh long lock prod). FK mới add theo pattern này. |

---

## 11. Custom domain

| # | Câu hỏi | Trả lời |
|---|---|---|
| 1 | Final enum `custom_domains.status`? | **`('pending','verifying','verified','failed','disabled')`** (spec §4.5). Đây là final. |
| 2 | `verified` hay `active`? | **`verified`** = DNS OK. **`active`** = `verified` + TLS provisioned + tham gia routing. **Quyết định**: KHÔNG dùng `active` riêng — gộp vào `verified` + thêm column `tls_status: enum('none','provisioning','active','expired','failed')` (xem dòng dưới). Status enum chỉ có 5 value. |
| 3 | `tls_status` riêng? | ✅ **CÓ** — column riêng `tls_status` + `tls_cert_id` + `tls_expires_at` (đã có trong §4.5). Tách khỏi `status` để retry TLS không reset DNS state. |
| 4 | Re-check ownership định kỳ? | ✅ Cron daily check TXT record cho domain `verified`. Sau 3 lần fail liên tiếp → `status='failed'` + alert brand. Cron 5 phút cho domain `verifying`. Cron daily check `tls_expires_at < 30 days` → renew. |

---

## 12. Final lock criteria

OK với cả 7 điều kiện BE đề xuất. Acceptance criteria mình đề xuất kèm:

| # | Criteria | Acceptance |
|---|---|---|
| 1 | Full migration matrix cho ~44 bảng cũ | ✅ Đã cover mục 2.1-2.8 — BE acknowledge từng dòng. |
| 2 | Decision keep/reshape/archive/drop | ✅ Cùng mục 2. |
| 3 | Final schema + table count | **22 bảng** (spec §4 đã list). BE confirm khớp đầy đủ DDL trước S1. |
| 4 | Auth/brand/workspace model | ✅ Mục 3. |
| 5 | Legacy canvas/media/AI/tracking/notification handling | ✅ Mục 2.3, 2.4, 2.6, 2.7, 2.8. |
| 6 | RLS/FK strategy | ✅ Mục 10 + spec §19. |
| 7 | Validation query + acceptance criteria | BE viết `migrations/v2/validation/` (1 SQL file per old table) — output dump vào `docs/migration-2026-Q2/validation-report.md`. PM ký off trước khi drop. |

**Bonus mình đề xuất thêm**:

- **Migration dry-run staging**: clone prod DB sang staging, chạy full migration script, FE smoke test 1 ngày → mới chạy prod.
- **Rollback plan**: mỗi `DROP` đi kèm `pg_dump --table=<old>` cold backup giữ 90 ngày, đặt trong `infra/migration-backups/2026-Q2/`.
- **Migration window**: chốt downtime window với PM trước (estimate 2-4h cho data migration + validation).

---

## Next steps

Sau khi BE OK mục 1-11:

1. FE commit chi tiết vào `rexer-architecture-final-2026-05-23.md` §22 (replace stub 7 dòng hiện tại).
2. Bump status `🔒 LOCKED v1.1`.
3. Mở PR `docs: lock migration matrix v1.1` để PM ký off.
4. BE start S1.

---

## Contact

- **FE owner**: @Lantm (`lantm.tekup@gmail.com`)
- **Repo**: `gitlab.com/lantm.tekup/rexerai` branch `develop`
- **Reply date**: 2026-05-24
- **Reference**:
  - `docs/rexer-architecture-final-2026-05-23.md` — spec đang review
  - `docs/be-audit-2026-05-23.md` — live BE probe
  - `docs/be-handoff-2026-05-23.md` — P0/P1 hand-off
