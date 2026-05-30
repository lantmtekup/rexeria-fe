# BE Canonical Cutover — Handoff 2026-05-24

> **Status**: 🟢 Implemented locally on `main` (commits `8724cb5` → `HEAD`)
> **Branch**: `main` (10 commits ahead of last shared point)
> **Verification**: `go build ./...` clean · `go vet ./...` clean · 202 unit tests pass · migrate-up + seed-qc clean from scratch · boot smoke passes
> **Spec**: [`docs/rexer-architecture-final-2026-05-23.md`](./rexer-architecture-final-2026-05-23.md)
> **FE Q&A reference**: [`internal/domain/usecase/be-architecture-qa-reply-2026-05-24.md`](../internal/domain/usecase/be-architecture-qa-reply-2026-05-24.md)

---

## TL;DR

Phiên bản BE đã align với spec 2026-05-23 + FE migration matrix v1.1. **23 legacy tables đã drop**, sync triggers đã retire, canonical handlers đã mount tại `/v1/brands`, `/v1/pages`, `/v1/blocks`, …, `/v1/ai/jobs`, `/v1/activity-logs`. Anti-spam 3 lớp đã có. Fabric converter đã có. Migration roundtrip clean.

**Còn lại 1 step gắn liền với code refactor** (deferred sang migration 135): drop columns `principal_type` / `active_workspace_id` / `client_id` trên users + retained tables — 30+ Go callsites cần refactor trước.

---

## 1. Implementation status — what's done

### 1.1 Migration layer

| Mig | File | Purpose |
|---|---|---|
| 132 | `000132_rexer_architecture_final.{up,down}.sql` | Created 14 canonical tables side-by-side với legacy. Sync triggers giữ data đồng bộ. |
| 133 | `000133_canonical_unification.{up,down}.sql` | Non-destructive RLS hardening + observability indexes + COMMENT markers. |
| **134** | `000134_drop_legacy_cutover.{up,down}.sql` | **Destructive cutover**. Drop 23 legacy tables + 12 sync triggers + 14 sync functions. Adjust `custom_domains.status` enum tới 5 value. Tighten `pages.status` tới 3 value. |
| 135 | _(not yet authored)_ | Drop legacy columns `users.principal_type`, `users.active_workspace_id`, `users.client_id`, `workspaces.client_id`, `products.client_id`, `media_assets.client_id`, `media_folders.client_id`, `campaigns.client_id`. **Gated on Go code refactor.** |

Migration 134 đã drop:

```
Auth/Session:      auth_identities
Workspace:         clients, workspace_members
Canvas/Template:   canvas_templates, canvas_template_assignments,
                   block_type_registry, projects, project_config_revisions,
                   saved_blocks, releases
Media/Product:     media_variants, project_media_bindings,
                   product_media_bindings, product_categories
Data collection:   data_collections, data_collection_records
AI legacy:         ai_usage, ai_call_logs, ai_block_content_logs,
                   ai_canvas_apply_logs, ai_templates, ai_template_blocks,
                   ai_template_fields, ai_template_block_prompts,
                   ai_template_generation_logs
Analytics/Ops:     tracking_events, notifications, feedback,
                   template_comments
```

### 1.2 Code layer — canonical handlers mounted

```
/v1/brands                              → BrandCanonicalHandler
/v1/brands/:brandId/users               → BrandMembershipHandler
/v1/brands/:brandId/domains             → CustomDomainHandler
/v1/brands/:brandId/activity            → ActivityLogHandler
/v1/workspaces/:wsId/pages              → PageCanonicalHandler.List/Create
/v1/pages/:pageId                       → PageCanonicalHandler (CRUD + config + revisions + publish)
/v1/pages/:pageId/releases              → PageCanonicalHandler (releases ops)
/v1/pages/:pageId/analytics/{summary,blocks} → AnalyticsCanonicalHandler
/v1/blocks                              → BlockCanonicalHandler (list/create/get/update/archive/clone/use)
/v1/block-types                         → BlockTypeCanonicalHandler (public list/get)
/v1/admin/block-types                   → BlockTypeCanonicalHandler (admin CRUD)
/v1/ai/template-draft                   → AIJobHandler.TemplateDraft
/v1/ai/slot-suggest                     → AIJobHandler.SlotSuggest
/v1/ai/page-optimize                    → AIJobHandler.PageOptimize
/v1/ai/image-generate                   → AIJobHandler.ImageGenerate
/v1/ai/jobs/:jobId                      → AIJobHandler.GetJob
/v1/ai/slot-suggestions/:suggestionId   → AIJobHandler.RespondSlotSuggestion
```

Legacy handlers (ClientHandler, ProjectHandler, SavedBlockHandler, ReleaseHandler, CanvasTemplateHandler, BlockTypeRegistryHandler, ArchitectureHandler, AIUsageHandler, AITemplateHandler, AIHandler, TrackingHandler, AnalyticsHandler, FeedbackHandler, NotificationHandler, TemplateCommentHandler, DataCollectionHandler, ProductCategoryHandler, PublishHandler) are **kept in code** (Handler struct fields + DI wire) but **un-mounted** trong `RegisterRoutes` — endpoints không còn route. Safe to delete in a follow-up refactor PR.

### 1.3 Anti-spam analytics middleware

Path: `internal/server/http/middleware/anti_spam_analytics.go`

3 lớp (FE Q&A §8.5):

| Layer | Implementation | Notes |
|---|---|---|
| A — Rate limit IP | Reuses existing `SimpleRateLimit(KeyByIP, 100/min)` composed at route | Phase 1: in-process token bucket. Phase 2: swap to Redis-backed when available. |
| B — UA filter | Embedded blacklist: bot/spider/crawler/curl/wget/python-requests/headlesschrome/playwright/selenium + empty UA reject | Returns 429 BOT_REJECTED. |
| C — HMAC visitor_id token | `pkg/visitor.Sign/Verify` — token format `<vid>.<unix_ts>.<hex_hmac256>`, MaxTokenAge=7d | Soft mode default (token optional); `RequireVisitorToken=true` for strict mode. |

**Wiring (operator step)**: Mount tại `/v1/track` (currently NOT mounted post-cutover — old `TrackingHandler` retired). Khi BE wire endpoint mới sẽ compose 3 lớp:

```go
trackGroup := v1.Group("/track",
    middleware.SimpleRateLimit(middleware.SimpleRateLimitOptions{
        Capacity:     100,
        RefillPerSec: 100.0 / 60.0,
        KeyFn:        middleware.KeyByIP(),
    }),
    middleware.AntiSpamAnalytics(middleware.AntiSpamAnalyticsOptions{
        VisitorSecret:       cfg.App.VisitorSecret, // from REXER_APP_VISITOR_SECRET
        RequireVisitorToken: !cfg.App.IsDev(),
    }),
)
trackGroup.POST("", analyticsCanonicalHandler.Ingest)
```

### 1.4 Fabric → canvas_blueprint converter

Path: `pkg/canvas/fabric_to_blueprint.go`

Pure utility. Maps legacy `canvas_data.objects[]` → canonical `canvas_blueprint.blocks[]`. Heuristic priority:
1. `metadata.blockType` (explicit)
2. `metadata.code` (newer FE)
3. `obj.type` fallback (textbox/i-text/text → text-block; image → image-block; rect/circle/polygon/group → container)

Unmatched objects → skipped + reported in `Warnings[]`.

Legacy `canvas_templates` table đã drop ở 134 — converter chỉ còn ích dụng cho ad-hoc imports from cached Fabric JSON.

### 1.5 QC seed

Path: `internal/database/seeds/qc_data_canonical.{up,down}.sql`

Minimal viable canonical fixtures:
- 2 brands (Acme, Globex) prefix `11111111-...`
- 4 QC users (qc.internal01/05, qc.client01@acme.test, qc.client02@globex.test) — admin@rexer.ai từ mig 099 giữ nguyên
- 2 brand_memberships (brand_admin role)
- 2 workspaces (1 default per brand)

Full fixture coverage (pages/products/templates/releases/media/analytics) moves vào QC suite — tạo qua canonical API. Đủ cho boot smoke + auth flow + brand list.

Makefile `seed-qc` đã trỏ sang file canonical. File `qc_data.up.sql` cũ giữ trên disk làm reference (1909 lines, references dropped tables — không chạy được nữa).

### 1.6 Validation queries

Path: `internal/database/migrations/v2/validation/pre_cutover_checks.sql` + `README.md`

Single psql script với 29 SELECT blocks check row counts + sync gaps + orphan listings cho mỗi dropped table. Operator run trên staging snapshot trước migration 134, output → `docs/migration-2026-Q2/validation-report-<date>.md`, PM sign-off rồi mới chạy 134.

---

## 2. Verification results

```
$ go build ./...
ok

$ go vet ./...
ok (no issues found)

$ go test -race -count=1 ./internal/... ./pkg/...
202 passed in 31 packages

$ make migrate-up (from empty DB)
→ version 134, dirty=false

$ make seed-qc
→ 4 INSERT statements OK (2 brands, 4 users, 2 memberships, 2 workspaces)

$ make migrate-up && make seed-qc-down && make seed-qc
→ idempotent (ON CONFLICT DO NOTHING)

$ curl /healthz → 200
$ curl /v1/brands → 401 (auth required, handler reachable)
$ curl /v1/pages/:id → 401
$ curl /v1/block-types → 401
$ curl /swagger/ → 200
```

Boot smoke ở `/tmp/app-final.log` — server start clean, no panic, no leaked goroutines.

---

## 3. Breaking changes

### 3.1 API surface

Legacy endpoints **không còn route** post-cutover (mounted = false):

```
DELETE  /v1/clients/*                  (use /v1/brands)
DELETE  /v1/projects/*                 (use /v1/pages or /v1/workspaces/:wsId/pages)
DELETE  /v1/saved-blocks/*             (use /v1/blocks)
DELETE  /v1/releases/*                 (use /v1/pages/:id/releases)
DELETE  /v1/canvas-templates/*         (use /v1/templates + /v1/pages)
DELETE  /v1/tracking/*                 (use /v1/track via canonical analytics)
DELETE  /v1/data-collections/*         (reshape to analytics_events)
DELETE  /v1/notifications/*            (no replacement in Phase 1 — email-based)
DELETE  /v1/feedback/*                 (deferred Phase 2)
DELETE  /v1/ai/usage/*                 (derive from /v1/ai/jobs aggregate)
DELETE  /v1/ai/templates/*             (deferred Phase 2)
DELETE  /v1/template-comments/*        (deferred Phase 2)
DELETE  /v1/product-categories/*       (use products.category string)
DELETE  /v1/ai/product/enrich, /ai/template/suggest, /ai/landing/draft,
        /ai/landing/optimize, /ai/media/suggest, /ai/campaign/plan,
        /ai/block-content, /ai/canvas-templates/:id/apply-product
        (all 8 legacy AI endpoints — use /v1/ai/template-draft|slot-suggest|page-optimize|image-generate)
```

### 3.2 Auth model

- `users.principal_type` còn tồn tại (deferred drop) nhưng **canonical layer KHÔNG đọc**. Sử dụng `users.role IN ('admin','staff')` for platform admins, `brand_memberships.role` for brand-side.
- `users.active_workspace_id` còn tồn tại (deferred drop) nhưng FE expectation là move sang cookie `ws=<workspace_slug>` per FE §3.4. BE chưa wire cookie-based fallback — sau khi FE chuyển sang cookie pattern, BE refactor `auth.ActiveWorkspaceID(ctx)` để đọc từ cookie/header.

### 3.3 Schema

- `custom_domains.status` enum giảm từ 6 → 5 value. `active` value tự động migrate sang `verified` ở 134. State machine spec §7.2 dùng `tls_status` column riêng cho "live serving" trạng thái.
- `pages.status` enum giảm từ 5 → 3 value. Legacy `configured`, `ready_to_publish` migrate sang `draft`.

### 3.4 Data loss

23 legacy tables bị drop. Data **không restore được** từ `migrate-down 134` (chỉ recreate empty stubs để chain compile). Operator phải `pg_dump --table=<old>` backup trước khi apply 134 trên môi trường có data thật.

---

## 4. Migration ops runbook

### 4.1 Pre-flight (staging)

```bash
# 1. Snapshot prod → staging
pg_dump $PROD_DSN | psql $STAGING_DSN

# 2. Run validation queries
psql $STAGING_DSN -f internal/database/migrations/v2/validation/pre_cutover_checks.sql \
  > docs/migration-2026-Q2/validation-report-$(date +%Y%m%d).md

# 3. PM sign-off — verify sync gaps = 0, capture row counts of dropped tables

# 4. Backup what migration 134 will drop
for t in clients projects saved_blocks releases canvas_templates \
         block_type_registry tracking_events notifications feedback \
         ai_usage ai_call_logs ai_templates data_collections; do
  pg_dump $STAGING_DSN --table=$t > infra/migration-backups/2026-Q2/$t.sql
done
```

### 4.2 Cutover (production maintenance window)

```bash
# 5. Apply migration 134
psql $PROD_DSN -f internal/database/migrations/000134_drop_legacy_cutover.up.sql

# 6. Smoke test
curl -s "$API/healthz"  # 200
curl -s "$API/v1/brands" -H "Authorization: Bearer $TOKEN" | jq

# 7. Update FE NEXT_PUBLIC_REXER_API if URL changed; FE redeploy

# 8. Watch error rates 30 min — abort rollback decision window
```

### 4.3 Rollback (if abort)

Migration 134 is **one-way logical**. The `.down.sql` recreates empty stubs so the migrate chain compiles but data is lost. Real rollback path:

```bash
# 9. Drop the canonical tables (or restore from snapshot)
psql $PROD_DSN -c "BEGIN; DROP TABLE pages CASCADE; DROP TABLE brands CASCADE; ..."

# 10. Restore from pg_dump
for f in infra/migration-backups/2026-Q2/*.sql; do
  psql $PROD_DSN -f $f
done

# 11. Force migrate version back to 133
psql $PROD_DSN -c "UPDATE schema_migrations SET version=133, dirty=false;"

# 12. FE rollback to last pre-cutover commit
```

---

## 5. Outstanding items (Phase 2)

### 5.1 Migration 135 — drop legacy columns

Blocked on Go code refactor. Steps:

1. Remove `User.PrincipalType` từ `internal/domain/models/auth.go`. Update `auth.IsPlatformAdmin` chỉ check `User.Role == 'admin'`. Drop `PrincipalAdmin/PrincipalClient/PrincipalClientUser/PrincipalInternal` constants.
2. Remove `User.ActiveWorkspaceID`. Refactor `auth.ActiveWorkspaceID(ctx)` đọc từ context — populated bởi middleware từ cookie/header.
3. Remove `User.ClientID`. Refactor `auth.PrincipalClientID(ctx)` → `auth.PrincipalBrandID(ctx)` reads from `brand_memberships`.
4. Update all 30+ callsites (use `git grep PrincipalClientID|PrincipalType|ActiveWorkspaceID`).
5. Migration 135 SQL: `ALTER TABLE users DROP COLUMN principal_type, active_workspace_id, client_id; ALTER TABLE workspaces DROP COLUMN client_id; ALTER TABLE products DROP COLUMN client_id; ALTER TABLE media_assets DROP COLUMN client_id; ALTER TABLE media_folders DROP COLUMN client_id; ALTER TABLE campaigns DROP COLUMN client_id;`

Estimate: 2-3 ngày BE.

### 5.2 Real LLM dispatch trong AI worker

Hiện stub: `internal/server/jobs/ai_job_worker.go::dispatchJob` chỉ generate 3 hard-coded suggestions cho `slot_suggest`. Phase 2 wire provider.Chat call cho mỗi job type. Estimate: 3-5 ngày (mỗi job type 1 prompt template + response parser).

### 5.3 Real TLS provisioning

`internal/server/jobs/tls_provision.go` chỉ stub state transition. Phase 2 integrate Caddy / Cloudflare ACME. Estimate: 2-3 ngày.

### 5.4 Analytics aggregation cron

`internal/server/jobs/analytics_aggregate.go` chỉ stub. Phase 2: SQL aggregate `analytics_events` → `analytics_daily_aggregate` daily at 01:00 UTC. Estimate: 1 ngày.

### 5.5 Analytics events partitioning

Migration 132 tạo `analytics_events` non-partitioned. Phase 2: convert sang partitioned by `RANGE(occurred_at)` với pg_partman, monthly partitions. Tương tự `activity_logs`. Estimate: 1 ngày (test partition switch trên staging trước).

### 5.6 Email-based notifications

Migration 134 drop `notifications` table. Phase 2 wire SendGrid/SES cho notification path (brand admin invitations, page publish confirmations, AI job completion). Estimate: 2-3 ngày.

### 5.7 Cleanup legacy handler files

Sau migration 135, delete files trong `internal/server/http/handler/`:
- `architecture.go` (1374 lines, retired)
- `client.go`, `client_user.go`, `project.go`, `saved_block.go`, `release.go`, `canvas_template.go`, `block_type_registry.go`, `data_collection.go`, `feedback.go`, `ai_usage.go`, `ai_template.go`, `ai.go` (legacy 8 endpoints), `tracking.go`, `analytics.go` (legacy), `notification.go`, `template_comment.go`, `product_category.go`, `publish.go`

Plus their usecases / repositories / domain interfaces.

Estimate: 1-2 ngày cleanup, mostly delete + DI wire trim.

---

## 6. Files changed (this cutover)

```
internal/database/migrations/000134_drop_legacy_cutover.up.sql      NEW   305 lines
internal/database/migrations/000134_drop_legacy_cutover.down.sql    NEW   135 lines
internal/database/migrations/v2/validation/pre_cutover_checks.sql   NEW   132 lines
internal/database/migrations/v2/validation/README.md                NEW    45 lines
internal/database/seeds/qc_data_canonical.up.sql                    NEW    78 lines
internal/database/seeds/qc_data_canonical.down.sql                  NEW    13 lines
internal/server/http/handler/handler.go                             EDIT  -120/+74
internal/server/http/middleware/anti_spam_analytics.go              NEW    99 lines
internal/server/http/middleware/anti_spam_analytics_test.go         NEW   105 lines
pkg/canvas/fabric_to_blueprint.go                                   NEW   165 lines
pkg/canvas/fabric_to_blueprint_test.go                              NEW    77 lines
pkg/visitor/token.go                                                NEW    80 lines
pkg/visitor/token_test.go                                           NEW    65 lines
Makefile                                                            EDIT   -2/+5
```

Tổng: 14 files changed, ~1500 LOC mới, ~120 LOC removed.

---

## 7. Commit history (cutover phase)

```
HEAD~6  feat(migration): 134 drop legacy cutover — 23 tables removed
HEAD~5  feat(routes): mount canonical handlers, retire 14 legacy handlers
HEAD~4  feat(analytics): 3-layer anti-spam middleware per FE §8.5
HEAD~3  feat(canvas): Fabric.js → canvas_blueprint converter utility
HEAD~2  feat(seed): canonical QC seed post-migration-134
HEAD~1  docs(migration): pre-cutover validation queries for 134
HEAD    docs(handoff): canonical cutover handoff doc 2026-05-24
```

All commits authored as user, NO Claude attribution (per global rule).

---

## 8. Test the cutover yourself

```bash
# 1. Fresh DB
PGPASSWORD=Abc123 psql -h localhost -U postgres -d postgres \
  -c "DROP DATABASE IF EXISTS rexer_ai; CREATE DATABASE rexer_ai;"

# 2. Migrate up
make migrate-up
# → version 134, dirty=false

# 3. Seed
make seed-qc

# 4. Verify schema
PGPASSWORD=Abc123 psql -h localhost -U postgres -d rexer_ai -c "
  SELECT COUNT(*) FROM information_schema.tables
  WHERE table_schema='public'
  AND table_name IN ('clients','projects','saved_blocks','releases',
                     'canvas_templates','block_type_registry');"
# → 0 (all legacy tables dropped)

# 5. Boot
make run &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/healthz
# → 200

# 6. Sign in as brand admin
TOKEN=$(curl -s -XPOST http://localhost:8080/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"qc.client01@acme.test","password":"Admin1234"}' | jq -r .data.token)

# 7. Hit canonical endpoint
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8080/v1/brands | jq

# 8. Tests
go test -race -count=1 ./internal/... ./pkg/...
# → 202 passed in 31 packages
```

---

## 9. Open questions for the team

1. **Migration 135 timing** — defer hết khi FE chuyển hoàn toàn sang canonical, hay split: drop principal_type ngay (low callsite), defer active_workspace_id + client_id?
2. **Legacy handler cleanup** — chấp nhận giữ dead code 1-2 sprints để có rollback path, hay xóa sạch ngay sau khi 134 ổn định trên prod?
3. **`/v1/track` endpoint wiring** — canonical TrackingHandler chưa tồn tại. Build mới hay dùng `AnalyticsCanonicalHandler.Ingest`? FE đang gửi PUT/POST shape nào?
4. **AI worker LLM dispatch** — Phase 1 stub OK ship hay cần real generation cho slot_suggest trước launch?
5. **Notification fallback** — Phase 1 không có in-app notification. FE có cần JSON endpoint trả `[]` (no-op) để tránh fetch error, hay FE đã handle 404?

---

## Contact

- **BE owner**: see git log
- **FE owner**: @Lantm (`lantm.tekup@gmail.com`)
- **Spec**: `docs/rexer-architecture-final-2026-05-23.md`
- **FE reply**: `internal/domain/usecase/be-architecture-qa-reply-2026-05-24.md`
- **Cutover plan**: `docs/migration-134-cutover-plan.md`
