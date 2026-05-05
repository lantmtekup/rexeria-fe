# ReXeR.ai × Shopify — Kế hoạch tích hợp

> **Trạng thái**: Draft v0.2 — 2026-05-05
> **Phạm vi**: Đưa nền tảng ReXeR.ai (SaaS AI landing + marketing) tiếp cận tệp merchant đang dùng Shopify.
> **Liên quan**: `docs/rexerai-mvp-spec.md`, `docs/be-api-products-spec.md`, Swagger BE `http://75.119.128.96:9090/swagger/index.html`.
> **Changelog**:
> - v0.2 (2026-05-05): Thêm mục 11 "Phân tích đối thủ trên Shopify App Store" + cập nhật positioning.
> - v0.1 (2026-05-04): Bản đầu tiên.

---

## 0. TL;DR

- Đóng gói ReXeR.ai thành **Shopify Public App (embedded)** lên App Store, dùng **managed installation + token exchange**, **GraphQL Admin API** (REST đã legacy từ 2024-10), webhook để sync product.
- **Không** rewrite sang Remix / Hydrogen — giữ codebase Next.js 15 hiện có, chỉ wrap bằng App Bridge khi chạy trong iframe Shopify Admin.
- MVP publish landing theo flow ReXeR cũ (CDN), Phase 2 mới làm Theme App Extension để landing chạy trên domain merchant.
- Billing dùng **Shopify Billing API** (Public App bắt buộc).
- Lộ trình: 3 sprint × 2 tuần = ~6 tuần đến demo cài app + sync product + AI sinh landing + publish.

---

## 1. Mục tiêu & non-goals

### 1.1. Mục tiêu MVP Shopify

1. Merchant tìm "ReXeR.ai" trên Shopify App Store → cài 1 click → embedded app load trong Shopify Admin.
2. App tự pull toàn bộ product Shopify của shop về `products` của ReXeR.
3. Webhook đồng bộ realtime khi merchant tạo/sửa/xoá product trên Shopify.
4. Merchant chọn product → AI sinh landing (UC-19 → UC-25 trong `rexerai-mvp-spec.md`) → publish lên CDN ReXeR.
5. Link landing được ghi vào metafield Shopify để theme merchant tự nhúng button "Xem landing".
6. Tracking campaign UTM hoạt động xuyên suốt từ landing → Shopify checkout (qua `utm_*` query string).

### 1.2. Không nằm trong MVP

- Theme App Extension / App Block render landing trực tiếp trên storefront Shopify.
- Push product ngược ReXeR → Shopify (ReXeR là consumer, Shopify là source of truth).
- Sync inventory, order, customer.
- Multi-shop trong 1 ReXeR account (mặc định 1 shop = 1 client_id).
- Migrate auth ReXeR sang Shopify session token cho mọi route — chỉ áp dụng route embedded.

---

## 2. Bối cảnh nền tảng

### 2.1. ReXeR đang có gì

| Khối | Trạng thái | Endpoint chính |
|---|---|---|
| Auth + multi-tenant client | ✅ | `/v1/auth/*`, `/v1/clients/*` |
| Product catalog | ✅ | `/v1/products`, `/v1/product-categories` |
| Media pipeline | ✅ | `/v1/media/uploads/init|raw|complete`, `/v1/media/bindings` |
| Project (= Landing) | ✅ | `/v1/projects/*`, `/v1/releases/*`, publish/rollback |
| Campaign | ✅ | `/v1/campaigns/*`, `/v1/campaigns/{id}/metrics` |
| AI 6 endpoints | ✅ | `/v1/ai/{product-enrich,template-suggest,landing-draft,landing-optimize,media-suggest,campaign-plan}` |
| Track/analytics | ✅ | `/v1/track`, `/v1/projects/{id}/analytics` |
| Client portal | ✅ | `/v1/client-portal/*` |

### 2.2. Shopify dev landscape (snapshot 2026-05)

- **Authentication**: Shopify đẩy mạnh **managed installation + token exchange** thay cho OAuth code grant — không cần redirect trip nữa, lấy access token bằng cách đổi session token JWT.
- **API**: REST Admin **legacy** từ 2024-10. Public App mới (sau 2025-04-01) **bắt buộc** dùng GraphQL Admin API.
- **Embedded UI**: Polaris (web component) + App Bridge cho navigation/toast/modal trong Admin iframe. Polaris không bắt buộc — vẫn dùng được Tailwind/shadcn nếu UX ổn.
- **Bulk Operation**: `bulkOperationRunQuery` cho initial sync (Shopify trả file JSONL hoặc CSV).
- **Webhook**: HTTPS endpoint hoặc EventBridge / Pub/Sub. HMAC SHA-256 verify bắt buộc.
- **Billing**: `appSubscriptionCreate` mutation → recurring charge thẳng vào hoá đơn Shopify, ăn 0–15% phí (theo doanh thu). Public App **không được** charge ngoài Shopify (vi phạm Acceptable Use Policy).
- **App template chính thức**: `@shopify/shopify-app-react-router` (kế thừa Remix template). Next.js không có official template — ta dùng community template làm tham khảo, không bê y nguyên.

---

## 3. 3 lựa chọn mô hình triển khai

| | A. Public App trên App Store | B. Custom / Private App | C. Hybrid Connector |
|---|---|---|---|
| Đối tượng | Multi-merchant tự cài | 1-2 brand cụ thể | Mọi user ReXeR, Shopify chỉ là 1 data source |
| Đăng ký Shopify Partners | ✓ | ✓ | ✓ |
| Listing App Store | ✓ (review) | ✗ | ✗ |
| Billing | Shopify Billing API | Tự thoả thuận | Stripe self-hosted |
| Embedded UI | ✓ | optional | ✗ (link out) |
| Token exchange | ✓ | ✓ | offline access token |
| Effort initial | High | Medium | Low |
| Reach | Cao nhất | Hẹp | Cao nhưng UX tệ hơn |

**Quyết định khuyến nghị**: đi **A (Public App)** với kiến trúc giữ tinh thần C — tức ReXeR vẫn là SaaS độc lập, Shopify là **1 connector** chứ không phải nơi ReXeR sống. Lợi thế: vẫn list được trên App Store, vẫn dùng được codebase Next.js, dễ thêm Tiktok Shop / WooCommerce sau này.

> **Action cần chốt**: bạn xác nhận đi A, hay cần làm B trước cho 1 khách hàng cụ thể?

---

## 4. Kiến trúc đề xuất

### 4.1. Sơ đồ runtime

```
┌──────────────────────────┐
│  Shopify Admin (iframe)  │
└────────────┬─────────────┘
             │ App Bridge (postMessage + session token JWT)
             ▼
┌──────────────────────────────────┐
│  ReXeR FE (Next.js 15) — embedded│
│   - layout (app) detect ?shop=   │
│   - Shopify session token → ReXeR session cookie
└────────────┬─────────────────────┘
             │
             ▼
┌──────────────────────────────────┐
│  ReXeR BE (Go)                   │
│   - /v1/integrations/shopify/*   │ (NEW)
│   - /v1/products giữ nguyên       │
│   - /v1/ai/* giữ nguyên           │
└────────┬───────────────────┬─────┘
         │                   │
         ▼                   ▼
┌────────────────┐    ┌──────────────────────────────────┐
│ Shopify GraphQL│    │ Postgres                          │
│ Admin API      │    │  - shopify_connections (NEW)      │
│  - products    │    │  - shopify_webhooks (NEW)         │
│  - bulk ops    │    │  - shopify_sync_jobs (NEW)        │
│  - metafields  │    │  - products + source/external_id  │
└────────────────┘    │  - media + external_url           │
         ▲            └──────────────────────────────────┘
         │
         │ Webhook (HMAC verify)
         │
┌────────────────────┐
│ Shopify Webhook    │
│  PRODUCTS_*        │
│  APP_UNINSTALLED   │
│  APP_SUBSCRIPTIONS_│
│  UPDATE            │
└────────────────────┘
```

### 4.2. Auth flow (token exchange)

```
1. Merchant click "Install" trên App Store
2. Shopify redirect → /shopify/install?shop=xyz.myshopify.com
3. BE redirect tới managed installation URL của Shopify
4. Shopify mở app trong Admin iframe với ?shop=&host=&id_token=
5. FE gọi App Bridge getSessionToken() → JWT
6. FE POST /v1/integrations/shopify/exchange { id_token }
7. BE verify JWT (kid từ Shopify JWKS), exchange với Shopify
   POST /admin/oauth/access_token (grant_type=urn:ietf:params:oauth:grant-type:token-exchange)
8. BE lưu access_token vào shopify_connections, tạo / map ReXeR client_id
9. BE set ReXeR session cookie, FE redirect vào /home embedded mode
```

### 4.3. Mapping Shopify ↔ ReXeR

| Shopify entity | ReXeR entity | Ghi chú |
|---|---|---|
| Shop (domain `xyz.myshopify.com`) | `Client` (1-1 mặc định MVP) | Auto-create khi cài app |
| Product | `Product` (`source='shopify'`, `external_id=gid://shopify/Product/{id}`) | Cập nhật qua webhook |
| ProductVariant | `Product.variants[]` (string) hoặc bảng `product_variants` mới | MVP gộp vào field `variants` hiện có |
| ProductImage / MediaImage | `Media` (`external_url`, không re-upload) | Lazy import khi cần |
| Collection | `ProductCategory` (optional) | Có thể defer |
| Metafield `rexer.landing_url` | viết bởi ReXeR sau publish | dùng cho theme merchant |
| Order | (không sync MVP) | Phase sau cho conversion tracking thực |

---

## 5. Module mới — chi tiết

### 5.1. BE: package `internal/integrations/shopify`

```
internal/integrations/shopify/
├── oauth.go         // managed install URL, token exchange
├── jwt.go           // verify session token (JWKS cache)
├── graphql.go       // typed client cho Admin API 2026-04
├── bulk.go          // bulkOperationRunQuery + poll + ingest JSONL
├── webhook.go       // HMAC verify, dispatch
├── sync_product.go  // upsert Product từ Shopify payload
├── sync_media.go    // map ProductImage → Media + binding
├── billing.go       // appSubscriptionCreate, status callback
└── client_resolver.go // shop_domain → client_id mapping
```

### 5.2. DB migrations

```sql
-- shopify_connections: 1 row / shop
CREATE TABLE shopify_connections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  shop_domain     text NOT NULL UNIQUE,                -- xyz.myshopify.com
  access_token    text NOT NULL,                       -- encrypted at rest
  scopes          text[] NOT NULL,
  installed_at    timestamptz NOT NULL DEFAULT now(),
  uninstalled_at  timestamptz,
  last_synced_at  timestamptz,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_shopify_connections_client ON shopify_connections(client_id);

-- shopify_webhooks: idempotency
CREATE TABLE shopify_webhooks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain     text NOT NULL,
  topic           text NOT NULL,                       -- products/create
  webhook_id      text NOT NULL,                       -- X-Shopify-Webhook-Id
  payload_hash    text NOT NULL,
  received_at     timestamptz NOT NULL DEFAULT now(),
  processed_at    timestamptz,
  error           text,
  UNIQUE(shop_domain, webhook_id)
);

-- shopify_sync_jobs: bulk import tracking
CREATE TABLE shopify_sync_jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id   uuid NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  type            text NOT NULL,                       -- 'initial_products' | 'reconcile'
  status          text NOT NULL,                       -- 'queued' | 'running' | 'completed' | 'failed'
  bulk_op_id      text,                                -- gid://shopify/BulkOperation/...
  result_url      text,
  total_imported  int DEFAULT 0,
  started_at      timestamptz,
  completed_at    timestamptz,
  error           text
);

-- mở rộng products
ALTER TABLE products
  ADD COLUMN source           text NOT NULL DEFAULT 'manual',  -- 'manual' | 'shopify'
  ADD COLUMN external_id      text,                            -- gid://shopify/Product/123
  ADD COLUMN external_updated_at timestamptz,
  ADD COLUMN external_payload jsonb;                           -- raw cache cho debug/diff
CREATE UNIQUE INDEX uq_products_source_external
  ON products(client_id, source, external_id) WHERE external_id IS NOT NULL;

-- mở rộng media
ALTER TABLE media
  ADD COLUMN source       text NOT NULL DEFAULT 'manual',
  ADD COLUMN external_url text,
  ADD COLUMN external_id  text;
```

### 5.3. BE endpoints mới

```
# Connection lifecycle
GET  /v1/integrations/shopify/install?shop=...     # redirect tới managed install URL
GET  /v1/integrations/shopify/callback             # post-install callback (ít dùng vì managed)
POST /v1/integrations/shopify/exchange             # token exchange từ session JWT
GET  /v1/integrations/shopify/connection           # status hiện tại của shop đang login
DELETE /v1/integrations/shopify/connection         # disconnect (chỉ xoá local; Shopify uninstall qua webhook)

# Sync control
POST /v1/integrations/shopify/sync/products        # trigger reconcile manual
GET  /v1/integrations/shopify/sync/jobs            # list job + progress
GET  /v1/integrations/shopify/sync/jobs/{id}       # detail

# Webhook receiver (public, có HMAC)
POST /webhooks/shopify/{topic}                     # products/create, products/update, ...

# Billing
POST /v1/integrations/shopify/billing/subscribe    # tạo recurring charge
GET  /v1/integrations/shopify/billing/status
POST /webhooks/shopify/app_subscriptions/update    # callback từ Shopify
```

### 5.4. FE thay đổi

| File | Thay đổi |
|---|---|
| `src/app/layout.tsx` | Detect query `shop` + `host`, lazy load `@shopify/app-bridge-react` chỉ khi embedded |
| `src/app/(app)/layout.tsx` | Khi embedded: ẩn AppSidebar/WorkspaceTopBar, dùng App Bridge `<NavMenu>` thay thế |
| `src/components/templates/AppShellLayout.tsx` | Prop `embedded?: boolean`, render compact mode |
| Mới: `src/app/(app)/setting/integrations/shopify/page.tsx` | Status connection, nút sync, danh sách job, disconnect |
| Mới: `src/app/(app)/setting/integrations/shopify/connect/page.tsx` | Dùng cho non-embedded (user vào từ rexerai.com) |
| Mới: `src/lib/shopify/app-bridge.ts` | Provider + hook `useShopifySession()` trả session token |
| Mới: `src/services/shopify/*` | Wrapper gọi BE `/v1/integrations/shopify/*` |
| `src/services/base/fetchInstance.ts` | Khi embedded: attach `Authorization: Bearer <session_token>` để BE nhận diện shop |

### 5.5. Manifest app (`shopify.app.toml`)

File mới ở root repo (FE), hoặc repo riêng cho Shopify config:

```toml
name = "ReXeR.ai"
client_id = "<from Partner Dashboard>"
application_url = "https://app.rexer.ai"
embedded = true

[access_scopes]
scopes = "read_products,write_products,read_product_listings,read_files,write_files,read_themes"
use_legacy_install_flow = false

[auth]
redirect_urls = [
  "https://app.rexer.ai/api/shopify/callback"
]

[webhooks]
api_version = "2026-04"

[[webhooks.subscriptions]]
topics = [
  "products/create",
  "products/update",
  "products/delete",
  "app/uninstalled",
  "app_subscriptions/update"
]
uri = "https://api.rexer.ai/webhooks/shopify"

[pos]
embedded = false

[build]
include_config_on_deploy = true
```

---

## 6. Lộ trình 3 sprint

### Sprint 1 — Foundation (tuần 1-2)

**Mục tiêu**: app cài được vào dev shop, embedded UI render, lưu connection.

- [ ] Tạo Shopify Partners account + app trong Partner Dashboard.
- [ ] BE: bảng `shopify_connections`, encrypt access_token (KMS hoặc libsodium).
- [ ] BE: implement managed install + token exchange.
- [ ] BE: endpoint `POST /v1/integrations/shopify/exchange` với JWKS verify.
- [ ] FE: App Bridge wrapper + detect embedded mode.
- [ ] FE: trang `/setting/integrations/shopify` skeleton.
- [ ] Smoke test: cài vào dev shop `rexer-test.myshopify.com`, xem được `/home`.

**Deliverable**: video demo cài app vào dev shop, app load trong Admin iframe.

### Sprint 2 — Product sync (tuần 3-4)

**Mục tiêu**: product Shopify hiện trong `/product` của ReXeR, realtime với webhook.

- [ ] Mở rộng `products` + `media` schema (source, external_id, external_url).
- [ ] BE: bulk operation initial sync (`bulkOperationRunQuery` + poll + JSONL parse + upsert).
- [ ] BE: webhook receiver + HMAC verify + idempotency check.
- [ ] BE: subscribe webhook `products/create|update|delete`, `app/uninstalled`.
- [ ] FE: filter "Source: Shopify | Manual" trong `/product`.
- [ ] FE: badge nguồn + tooltip "Synced from Shopify, edit on Shopify".
- [ ] FE: lock các field name/sku/price khi `source='shopify'`.
- [ ] Reconcile job: nightly cron so sánh count + dirty diff.

**Deliverable**: tạo 5 product trên Shopify dev shop → 5 product hiện trong ReXeR < 30s, edit trên Shopify → ReXeR cập nhật < 30s.

### Sprint 3 — AI flow + landing publish + billing (tuần 5-6)

**Mục tiêu**: end-to-end Shopify product → AI landing → publish → metafield → billing.

- [ ] AI flow chạy với product `source='shopify'` (không cần code mới ở AI side, chỉ test).
- [ ] BE: sau publish landing thành công, gọi Shopify `metafieldsSet` ghi `rexer.landing_url` vào product.
- [ ] BE: campaign tracked URL inject `utm_source=shopify&utm_medium=app`.
- [ ] BE: `appSubscriptionCreate` mutation + handle `app_subscriptions/update` webhook.
- [ ] FE: trang billing tier hiển thị plan + nút upgrade.
- [ ] Test: tạo product trên Shopify → mở app → AI Agent flow → publish landing → kiểm tra metafield đã có URL.

**Deliverable**: golden flow end-to-end demo được, sẵn sàng submit App Store review (Phase 2).

### Out-of-scope MVP (Phase 2+)

- Theme App Extension (App Block) render landing trên storefront.
- Order webhook → conversion tracking thực thay vì click event.
- Push product ngược ReXeR → Shopify.
- Multi-shop / agency mode (1 user manage nhiều shop).
- B2B / Shopify Plus features.
- App Store listing assets (screenshot, demo video, GDPR doc).

---

## 7. Vấn đề kỹ thuật cần xử lý

### 7.1. Infra blockers

1. **BE hiện đang ở `75.119.128.96:9090` (HTTP)** — Shopify webhook + App Bridge bắt buộc HTTPS. Cần:
   - Domain `api.rexer.ai` + TLS cert (Let's Encrypt / Cloudflare).
   - Hoặc Cloudflare Tunnel cho dev.
2. **FE app URL** cũng phải HTTPS — Vercel hoặc tự deploy có TLS.
3. **`presigned_url` rò `localhost:9090`** (issue đã ghi trong `rexerai-mvp-spec.md` mục 11.5) — phải fix dứt điểm trước khi public app.

### 7.2. Auth dual-mode

ReXeR FE đang dùng cookie session. Khi embedded:
- Browser sandbox iframe Shopify Admin chặn third-party cookie → cookie session không gửi được.
- Phải đổi sang **Authorization header với Shopify session token** (JWT 1 phút), BE dịch sang ReXeR client_id.
- FE `fetchInstance.ts` cần biết khi nào embedded để đổi auth scheme.

### 7.3. Idempotency + ordering

- Webhook Shopify **không đảm bảo thứ tự**. Phải dùng `external_updated_at` (từ payload) để bỏ qua event cũ hơn.
- Webhook có thể duplicate → dedupe bằng `X-Shopify-Webhook-Id`.
- Có case `products/create` đến **sau** `products/update` (đã ghi trong forum Shopify dev). Solution: nếu update đến mà không có row, treat as create.

### 7.4. Rate limit

- GraphQL Admin API dùng cost-based throttle (1000 points/shop/đỉnh, refill 50/s).
- Bulk operation 1 lần / shop / loại — phải queue, không gọi song song.
- Cần circuit breaker + exponential backoff trong `internal/integrations/shopify/graphql.go`.

### 7.5. GDPR webhooks

Public App **bắt buộc** implement 3 endpoint GDPR (Shopify check khi review):
- `customers/data_request`
- `customers/redact`
- `shop/redact`

MVP chỉ cần endpoint trả 200 + log; xử lý thực sau.

### 7.6. Stack alignment

- Shopify khuyến nghị `@shopify/shopify-app-react-router`. Ta dùng Next.js 15 → tự implement helpers, **không** import được package react-router. Tham khảo logic, không bê thư viện.
- App Bridge React (`@shopify/app-bridge-react`) tương thích Next.js 15 (React 19) nhưng cần test SSR boundaries (App Bridge chỉ chạy client-side).
- Polaris vs Tailwind: khuyến nghị **không dùng Polaris** để tránh hai design system. Khi embedded, override theme tokens để gần với Polaris (border-radius, font Inter).

---

## 8. Câu hỏi mở — cần chốt với stakeholder

| # | Câu hỏi | Default đề xuất | Ai chốt |
|---|---|---|---|
| Q1 | Mô hình A/B/C? | A (Public App) | Founder |
| Q2 | Landing publish target | Option 2 (CDN ReXeR), inject metafield | PM |
| Q3 | Direction sync | 1 chiều Shopify → ReXeR | PM |
| Q4 | 1 shop = 1 client_id, hay multi-shop? | 1-1 ở MVP | PM |
| Q5 | Billing | Shopify Billing API, plan free + $29 + $99/tháng | Founder |
| Q6 | Giữ Next.js? | Có | Tech Lead |
| Q7 | Domain production | `app.rexer.ai` (FE), `api.rexer.ai` (BE) | DevOps |
| Q8 | Encrypt access_token | KMS (AWS) hay libsodium local | Tech Lead |
| Q9 | Variant mapping | Gộp vào `variants[]` string MVP | BE Dev |
| Q10 | Collection → Category | Defer Phase 2 | PM |
| Q11 | Có hỗ trợ Shopify Markets multi-currency / language ngay không | Không, MVP single market | PM |
| Q12 | App Store submission Phase nào | Phase 2, sau khi có 5 beta merchant | Founder |

---

## 9. Tiêu chí chấp nhận MVP

Kết thúc Sprint 3, hệ thống đạt khi:

1. ✅ Cài app từ dev shop URL `https://partners.shopify.com/.../apps/<app-id>/test` thành công.
2. ✅ App load embedded trong Shopify Admin, hiển thị `/home` ReXeR (đã có sidebar collapse cho embedded).
3. ✅ Bulk import 100 product từ Shopify dev shop hoàn tất < 2 phút, hiện đầy đủ trong `/product`.
4. ✅ Tạo product mới trên Shopify Admin → xuất hiện trong ReXeR `/product` < 30s.
5. ✅ Sửa product Shopify → ReXeR đồng bộ < 30s.
6. ✅ Xoá product Shopify → ReXeR mark archived.
7. ✅ Uninstall app → connection ghi `uninstalled_at`, không xoá data.
8. ✅ Mở AI Agent với product Shopify → flow chạy đến publish landing thành công.
9. ✅ Sau publish, kiểm tra metafield `rexer.landing_url` đã set trên Shopify product.
10. ✅ Subscribe gói paid qua Shopify Billing → app nhận webhook, unlock feature gating.
11. ✅ Webhook GDPR 3 endpoint trả 200.

---

## 10. Phụ lục

### 10.1. Tham khảo official

- Shopify App Build (Remix): https://shopify.dev/docs/apps/build/build?framework=remix
- Token exchange: https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/use-token-exchange
- GraphQL Admin: https://shopify.dev/docs/api/admin-graphql/latest
- Bulk operations: https://shopify.dev/docs/api/usage/bulk-operations/queries
- Webhook subscriptions: https://shopify.dev/docs/api/admin-graphql/latest/enums/WebhookSubscriptionTopic
- Billing API: https://shopify.dev/docs/apps/build/billing
- App Bridge: https://shopify.dev/docs/api/app-bridge-library
- GDPR webhooks: https://shopify.dev/docs/apps/build/privacy-law-compliance

### 10.2. Mã trích từ codebase ReXeR có thể tái sử dụng

- `src/services/base/fetchInstance.ts` — extend cho session token mode.
- `src/components/templates/AppShellLayout.tsx` — thêm prop `embedded`.
- `src/components/organisms/AppSidebar.tsx` — hide khi embedded.
- BE: hiện chưa có module integrations, sẽ tạo mới ở `internal/integrations/shopify/`.

### 10.3. Risk register

| Risk | Mức độ | Mitigation |
|---|---|---|
| Shopify từ chối App Store review (UX, Polaris) | Cao | Phase 1 chỉ làm Custom App cho beta merchant, submit Phase 2 |
| Webhook ordering gây race condition | Trung | Dùng `updated_at` từ payload làm versioning |
| Chi phí AI tăng vọt khi merchant có 10k product | Cao | Quota AI per shop, lazy enrich (chỉ enrich khi user mở AI Agent) |
| Token Shopify rò rỉ | Cao | Encrypt at rest + HSM, rotate khi merchant uninstall/reinstall |
| Conflict: merchant edit product song song trên 2 nơi | Trung | MVP lock edit field synced, hiện cảnh báo "Edit on Shopify" |
| BE Go scaling cho webhook spike | Trung | Queue webhook vào Redis stream, worker xử lý async |

---

**Next step gợi ý**:
1. Bạn review và comment trên các Open Question (mục 8).
2. Nếu approve hướng A + Option 2: mình bắt đầu Sprint 1 — tạo skeleton `src/app/(app)/setting/integrations/shopify/*` và BE module `internal/integrations/shopify/oauth.go`.
3. Song song: bạn (hoặc PM) lo Shopify Partners account + dev shop để có credentials test.

---

## 11. Phân tích đối thủ trên Shopify App Store

> Snapshot 2026-05-05. Số liệu rating / reviews lấy từ Shopify App Store listing tại thời điểm research.

### 11.1. Bản đồ thị trường — 4 tier

```
TIER 1 — Page Builder lâu năm (incumbent giants)
  PageFly · Shogun · GemPages · Replo
  ─ 11k+ reviews · giá $24-$399/mo · AI là bolt-on
  ─ ReXeR cạnh tranh trực tiếp ở "tạo landing"

TIER 2 — AI-first Page Builder (đối thủ trực tiếp nhất)
  PagePilot AI · Instant AI · Zeno AI
  ─ 90-300 reviews · giá free-$249/mo · AI là core
  ─ ReXeR cạnh tranh trực tiếp về flow AI, UX wizard

TIER 3 — AI Product Content (adjacent, hẹp hơn)
  Shopify Magic (free, built-in) · ChatGPT-AI Product Description
  ShopGPT · AI Product Descriptions Writer
  ─ Chỉ sinh copy, không sinh landing

TIER 4 — Marketing automation (adjacent, lệch trục)
  Klaviyo · Omnisend · ActiveCampaign · Maestra
  ─ Email/SMS-led, không phải landing-led
  ─ ReXeR thiên về upper funnel + landing, có thể tích hợp với họ
```

### 11.2. Tier 1 — Page Builder lâu năm

| App | Rating | Reviews | Pricing | Điểm mạnh | Điểm yếu vs ReXeR |
|---|---|---|---|---|---|
| **PageFly** | 4.9 | 11,900+ | Free → $99/mo | Free tier rộng, 24/7 support, 141 integrations, AI-CRO bolt-on | Lighthouse mobile 52 (chậm); AI là feature phụ, không có flow agent |
| **Shogun** | — | ~3k | $39 → $299/mo | Built-in analytics + A/B test, target enterprise | Đắt, UI cũ; không có AI campaign |
| **GemPages** | — | ~5k | $29 → $199/mo | Bundle page + AI content + funnel builder, Pro $99 có A/B | AI vẫn là tool rời, không có khái niệm "Product → AI Agent" |
| **Replo** | — | ~1k | $99 / $399/mo | JS runtime nhẹ nhất (80kb), Lighthouse mobile 79, dev-friendly | Không có flow AI sinh từ product, đắt từ entry |

**Insight**: Tier 1 đã giành được trận chiến "page builder thuần". ReXeR **không nên** đối đầu trực diện ở khía cạnh page builder visual editor — sẽ thua về maturity, library template, brand recognition.

### 11.3. Tier 2 — AI-first (đối thủ trực tiếp nhất)

| App | Rating | Reviews | Pricing | AI flow | Khác biệt |
|---|---|---|---|---|---|
| **PagePilot AI** | 4.9 | 117 | Free / $39/mo | Paste link AliExpress/Amazon → AI sinh page + ad creative + AI image | Tập trung dropshipping, có "10 winning products/day" + course. AI image sinh được |
| **Instant AI** | 5.0 | 301 | Free → $249/mo | 800+ template, AI design, Figma plugin, A/B test, custom cart | Định vị "all-in-one thay PageFly/Shogun/GemPages". Mạnh nhất Tier 2 |
| **Zeno AI** | 4.8 | 92 | **Free** | AI copy + AI section qua prompt, 20+ page type | Hoàn toàn miễn phí, mới, ít template; sẽ là threat khi họ scale |

**Insight đáng chú ý**:
- **Instant AI** là đối thủ nguy hiểm nhất hiện tại — rating 5.0 từ 301 reviews, định vị all-in-one, có Figma plugin (designer-friendly).
- **PagePilot** có ngách rõ: dropshipping, ad creative — overlap mạnh với ReXeR ở "AI sinh từ product link".
- **Zeno free** sẽ kéo giá toàn thị trường xuống. ReXeR cần free tier hoặc value rõ rệt khác.

### 11.4. Đối thủ gián tiếp nhưng quan trọng

- **Shopify Magic** — built-in, miễn phí, sinh product description / email subject / blog. Là baseline mọi merchant đã có. ReXeR phải vượt hẳn về depth (campaign + landing) để justify trả thêm tiền.
- **Klaviyo** — không phải đối thủ landing, nhưng sở hữu data marketing. Nếu ReXeR push vào campaign automation, sẽ va Klaviyo. Khôn hơn: tích hợp (đẩy event landing → Klaviyo).

### 11.5. Bảng so sánh feature ReXeR vs đối thủ trực tiếp

| Feature | ReXeR | PageFly | Instant AI | PagePilot | GemPages |
|---|:-:|:-:|:-:|:-:|:-:|
| Visual page builder drag-drop | 🟡 (canvas) | ✅ | ✅ | ✅ | ✅ |
| AI sinh landing **từ product data** | ✅ wizard 6 step | 🟡 bolt-on | ✅ | ✅ | 🟡 |
| AI suggest template phù hợp với product | ✅ UC-20 | ❌ | ❌ | ❌ | ❌ |
| AI sinh **campaign plan** (channel + KPI + budget) | ✅ UC-23 | ❌ | ❌ | ❌ | ❌ |
| AI gợi ý media từ thư viện theo section | ✅ UC-22 | ❌ | 🟡 | ✅ | ❌ |
| Campaign + UTM tracking tích hợp | ✅ | ❌ | ❌ | ❌ | ❌ |
| A/B testing | ❌ Phase 2 | 🟡 | ✅ | ❌ | ✅ Pro |
| Sync product Shopify | (đang plan) | ✅ | ✅ | ✅ | ✅ |
| Multi-client / Agency mode | ✅ | ❌ | ❌ | ❌ | ❌ |
| Client Portal (read-only cho khách) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tiếng Việt UI | ✅ | ❌ | ❌ | ❌ | ❌ |
| Free tier | (chưa quyết) | ✅ | ✅ dev store | ✅ limit | ❌ |

**Legend**: ✅ có & mạnh · 🟡 có nhưng yếu/phụ · ❌ không có

### 11.6. Positioning ReXeR vs thị trường

ReXeR **không** nên định vị là "thêm 1 page builder cho Shopify". Thị trường đó đã bão hoà.

**3 đường định vị khả thi** (chọn 1):

#### Đường A — "AI Marketing Agent" (khuyến nghị)
> *"Không phải page builder. Đây là AI agent dắt bạn từ product đến launch campaign — landing + UTM + KPI trong 1 wizard 6 bước."*

- Vũ khí: 6 endpoint AI đã có (`enrich → template → draft → media → campaign → optimize`) là moat thật, đối thủ Tier 1/2 chưa app nào có flow agent end-to-end như vậy.
- Đối thủ thực sự không phải PageFly mà là **người dùng + ChatGPT + 3 tab** — ReXeR thay thế workflow này bằng 1 wizard.
- Risk: phải chứng minh chất lượng AI output đủ tốt để khỏi cần edit nhiều.

#### Đường B — "Agency Studio for Shopify"
> *"1 ReXeR account, nhiều client Shopify, Client Portal cho khách xem report."*

- Vũ khí: multi-tenant + access grants + Client Portal đã code sẵn — không page builder Shopify nào có.
- Target: agency phục vụ 5-50 brand Shopify, hiện đang dùng PageFly/GemPages từng tài khoản.
- Risk: agency niche nhỏ hơn DTC merchant.

#### Đường C — "Vietnam/SEA-first Shopify Studio"
> *"AI marketing studio cho thương hiệu Việt Nam đang lên Shopify, support tiếng Việt, hiểu market local."*

- Vũ khí: i18n vi/en sẵn, team VN, có thể bundle với agency Scuti.
- Risk: TAM nhỏ, Shopify Vietnam vẫn đang trẻ.

**Đề xuất**: chính = A, kèm chiến thuật B (cho agency upsell) và C (cho ngách launch đầu tiên).

### 11.7. Action item từ phân tích đối thủ

| # | Action | Owner | Sprint |
|---|---|---|---|
| C1 | Cài thử PageFly + Instant AI + PagePilot vào dev shop, ghi nhận UX flow & onboarding (max 4 giờ research/app) | PM/Tech Lead | Trước Sprint 1 |
| C2 | Update landing page rexer.ai/shopify nhấn mạnh "AI Agent" thay vì "Page Builder" | Marketing | Sprint 2 |
| C3 | Quyết định free tier (đối với Zeno free) — đề xuất: free 3 landing/tháng, no AI campaign | Founder | Sprint 3 |
| C4 | Quyết định pricing đầu vào — benchmark $29 (vs Instant Starter $39, GemPages $29, PagePilot Lite $39) | Founder | Sprint 3 |
| C5 | Demo video so sánh "ReXeR 1 wizard vs ChatGPT + PageFly 3 tab" để dùng cho App Store listing | Marketing | Phase 2 |
| C6 | Theo dõi 6 tháng/lần Tier 2 (Zeno đang scale rất nhanh) | PM | Quarterly |

### 11.8. Risk update từ competitor research

| Risk mới | Mức độ | Mitigation |
|---|---|---|
| Instant AI roll out feature campaign trước ReXeR | Cao | Đẩy nhanh Sprint 3 (campaign + UTM), public beta sớm |
| Zeno free + open source clone hạ giá thị trường | Trung | ReXeR phải có moat: AI quality (model fine-tune theo niche), agency mode |
| Shopify Magic tự sinh landing trong native Admin | Cao | Theo dõi Shopify Editions hằng quý; nếu Shopify ra → pivot sang B (Agency) hoặc C (Vietnam) |
| Page builder Tier 1 acquire 1 AI startup | Trung | Tăng tốc go-to-market; build community VN trước khi Tier 1 chú ý market này |

### 11.9. Tham khảo

- PageFly: https://apps.shopify.com/pagefly · https://pagefly.io
- Shogun: https://apps.shopify.com/shogun
- GemPages: https://apps.shopify.com/gempages · https://gempages.net
- Replo: https://apps.shopify.com/alchemy · https://www.replo.app
- PagePilot AI: https://apps.shopify.com/pagepilotai · https://pagepilot.ai
- Instant AI: https://apps.shopify.com/instant-builder · https://instant.so
- Zeno AI: https://apps.shopify.com/zeno-page-builder
- Shopify Magic: https://www.shopify.com/magic
- Best landing builder 2026 (Replo blog): https://www.replo.app/blog/best-shopify-landing-page-builders
- Best Shopify AI tools 2026 (Ringly): https://www.ringly.io/blog/best-ai-tools-for-shopify
- Best Shopify AI product description (Instant blog): https://instant.so/blog/best-shopify-app-ai-product-description
