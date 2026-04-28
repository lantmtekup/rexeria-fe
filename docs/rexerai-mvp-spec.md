# ReXeR.ai — MVP Specification (Merged)

> Tài liệu này hợp nhất:
> - **Đề án Phát triển Hệ thống ReXeR.ai** (PDF, Tháng 12/2025) — chiến lược 4 phase.
> - **be-api-products-spec.md** — spec tactical cho Product/Category.
> - **Swagger thực tế** tại `http://75.119.128.96:9090/swagger/index.html` — BE đã code.
> - **FE routes hiện hữu** trong `src/app/(app)/*` và `src/app/(auth)/*`.

Mục tiêu: chốt một MVP duy nhất, end-to-end, tránh tình trạng FE viết Mongoose song song với BE Postgres.

---

## 1. Mục tiêu MVP

Một brand owner / marketer có thể:

1. **Đăng ký, đăng nhập** vào hệ thống.
2. **Quản lý product catalog** (sản phẩm cần quảng bá).
3. **Tạo & quản trị landing page** cho product (chọn template, cấu hình, publish).
4. **Lên kế hoạch marketing** (campaign) gắn với product/landing.
5. **AI assistant** giúp user dựng landing nhanh từ thông tin product.

**Không nằm trong MVP**: Marketplace template, multi-region, PIM/MDM (Phase 4 PDF), Creator Portal (Phase 3 PDF), 3D/AR.

**Timeline**: 3 tháng (theo Gantt PDF Phase 1: 15/01/2026 — 15/04/2026).

---

## 2. Personas & Use Cases

### 2.1. Personas

| # | Persona | Mô tả | Phạm vi truy cập |
|---|---|---|---|
| P1 | **Brand Owner / Marketer** | Khách hàng cuối trả phí SaaS, tự quản lý brand của mình | `(app)/*` — toàn quyền trên `client_id` của mình |
| P2 | **Agency Staff** | Nhân viên agency dùng ReXeR Studio làm dự án bespoke cho nhiều brand | `(app)/*` — switch giữa nhiều `client_id` |
| P3 | **Internal Admin (ReXeR/Scuti team)** | Vận hành nền tảng, quản lý template library, hỗ trợ khách | `(cms)/*` + dashboard tổng |
| P4 | **Client Portal Viewer** | Người được brand/agency cấp quyền chỉ xem báo cáo | Client Portal — read-only theo `access_grants` |
| P5 | **End Visitor** | Người dùng cuối truy cập landing đã publish | Public, ẩn danh, sinh `track` events |

### 2.2. Use Case Catalog (MVP scope)

#### P1 — Brand Owner / Marketer

| ID | Use Case | Mục tiêu | Endpoint chính | FE route |
|---|---|---|---|---|
| UC-01 | Đăng ký tài khoản | Tạo account + client mặc định | `POST /v1/auth/register` | `/sign-up` |
| UC-02 | Đăng nhập / đăng xuất | Truy cập workspace | `POST /v1/auth/login`, `/logout` | `/sign-in` |
| UC-03 | Quên mật khẩu / đổi mật khẩu | Reset / change password | `/v1/auth/forgot-password`, `/reset-password`, `/change-password` | `/sign-in` |
| UC-04 | Xem dashboard tổng quan | Quick view product/landing/campaign/traffic | `GET /v1/dashboard/summary` | `/home` |
| UC-05 | Tạo product mới | Khởi tạo sản phẩm cần quảng bá | `POST /v1/products` | `/product/start` |
| UC-06 | Cập nhật thông tin product | Sửa name, sku, description, sizes/colors/variants/features | `PATCH /v1/products/{id}` | `/product/[id]/information` |
| UC-07 | Quản lý category sản phẩm | Tạo/sửa category, áp template features | CRUD `/v1/product-categories` | dialog trong `/product/[id]/information` |
| UC-08 | Upload media cho product | Thêm ảnh/video sản phẩm | `POST /v1/media/uploads/init` → raw → complete + `/products/{id}/media/bind` | `/product/[id]/media` |
| UC-09 | Liệt kê & tìm product | Filter theo status/category/q | `GET /v1/products?...` | `/product` |
| UC-10 | Archive product | Soft delete | `DELETE /v1/products/{id}` | `/product` |
| UC-11 | Tạo landing page (manual) | Chọn template → cấu hình config JSON | `POST /v1/projects` (kèm `product_id`) + `PUT /projects/{id}/config` | `/product/[id]/landing/[lid]/builder` |
| UC-12 | Preview landing trước khi publish | Xem trước trên các viewport | `GET /v1/projects/{id}/config` + render | `/product/[id]/landing/[lid]/preview` |
| UC-13 | Publish landing | Đẩy lên CDN | `POST /v1/projects/{id}/publish/validate` → `POST /publish` | `/product/[id]/landing/[lid]/publish` |
| UC-14 | Rollback release | Quay về phiên bản cũ khi có lỗi | `POST /v1/releases/{id}/rollback` | `/product/[id]/landing/[lid]/publish` |
| UC-15 | Tạo campaign marketing | Lập kế hoạch quảng bá cho landing | `POST /v1/campaigns` | `/product/[id]/marketing` |
| UC-16 | Cập nhật trạng thái campaign | Active/pause/complete | `PATCH /v1/campaigns/{id}` | `/product/[id]/marketing/[mid]` |
| UC-17 | Xem hiệu quả campaign | Aggregate events theo `utm_campaign` | `GET /v1/campaigns/{id}/metrics` | `/product/[id]/marketing/[mid]` |
| UC-18 | Xem analytics landing | CTR, conversion, traffic theo ngày | `GET /v1/projects/{id}/analytics`, `/events/summary` | `/product/[id]/landing/[lid]/analytics` |
| UC-19 | **AI** — Auto-fill thông tin product | Nhập tên + category, AI sinh description/features | `POST /v1/ai/product/enrich` | `/ai-agents/[pid]/information` |
| UC-20 | **AI** — Gợi ý template phù hợp | Cho product + goal, AI rank template | `POST /v1/ai/template/suggest` | `/ai-agents/[pid]/template` |
| UC-21 | **AI** — Sinh landing draft | Generate config JSON từ product + template | `POST /v1/ai/landing/draft` | `/ai-agents/[pid]/template` |
| UC-22 | **AI** — Gợi ý ảnh từ Media library | Map ảnh có sẵn vào từng section | `POST /v1/ai/media/suggest` | `/ai-agents/[pid]/media` |
| UC-23 | **AI** — Gợi ý kế hoạch campaign | Channels + budget + KPI từ objective | `POST /v1/ai/campaign/plan` | `/ai-agents/[pid]/campaign` |
| UC-24 | **AI** — Tối ưu landing đang có | Đưa suggestion cải thiện section/copy | `POST /v1/ai/landing/optimize` | `/product/[id]/landing/[lid]/builder` |
| UC-25 | Review & publish kết quả AI | Xem toàn bộ landing + campaign do AI sinh, sửa, publish | `POST /v1/projects` + `/publish` + `POST /v1/campaigns` | `/ai-agents/[pid]/marketing` |

#### P2 — Agency Staff

> MVP **không bắt buộc** đầy đủ multi-client switch UI, nhưng dữ liệu phải sẵn sàng.

| ID | Use Case | Mục tiêu | Endpoint | Ghi chú MVP |
|---|---|---|---|---|
| UC-26 | Tạo client mới | Onboarding 1 brand mới do agency phục vụ | `POST /v1/clients` | UI tối giản, có thể dùng Postman ở MVP |
| UC-27 | Liệt kê client đang quản lý | Workspace switcher | `GET /v1/clients` | Dropdown ở header |
| UC-28 | Tạo product/landing/campaign cho client | Mọi UC P1, scope theo `client_id` chỉ định | reuse UC-05..25 với `client_id` body | |
| UC-29 | Cấp quyền viewer cho khách | Khách của agency truy cập Client Portal | `POST /v1/clients/{id}/access-grants` | |
| UC-30 | Tạo client user (login giúp khách) | Cấp tài khoản portal | `POST /v1/clients/{id}/users` | |

#### P3 — Internal Admin (ReXeR / Scuti)

| ID | Use Case | Mục tiêu | Endpoint | FE |
|---|---|---|---|---|
| UC-31 | Quản lý template library | Tạo/sửa/version template chuẩn | CRUD `/v1/templates`, `/templates/{id}/versions` | `/template`, `/template/[id]` |
| UC-32 | Preview template | Kiểm thử template trước khi release | `GET /v1/templates/{id}/preview` | `/template/[id]` |
| UC-33 | Quản lý CMS nội bộ | Site settings, contacts, broadcast | `(cms)` routes hiện hữu | `/cms/*` |
| UC-34 | Theo dõi sức khoẻ hệ thống | Số user/product/landing đang chạy | `/dashboard/summary` (mở rộng) | `/cms` |

#### P4 — Client Portal Viewer (read-only)

| ID | Use Case | Mục tiêu | Endpoint | Ghi chú |
|---|---|---|---|---|
| UC-35 | Đăng nhập portal khách | Truy cập workspace giới hạn | `POST /v1/auth/login` (role client_user) | đã có |
| UC-36 | Xem danh sách dự án được assign | List landing được agency làm cho mình | `GET /v1/client-portal/me/projects` | đã có |
| UC-37 | Xem chi tiết & analytics dự án | Xem traffic + conversion | `GET /v1/client-portal/projects/{id}/analytics` | đã có |
| UC-38 | Tải báo cáo định kỳ | Reports do agency upload | `GET /v1/client-portal/projects/{id}/reports` | đã có |

#### P5 — End Visitor (anonymous)

| ID | Use Case | Mục tiêu | Endpoint |
|---|---|---|---|
| UC-39 | Truy cập landing đã publish | Render từ CDN | (CDN, không qua API) |
| UC-40 | Tương tác / click CTA | Sinh event analytics | `POST /v1/track` (kèm `utm_*`, `cta_id`) |

### 2.3. Use Case Coverage Matrix

| Năng lực MVP user yêu cầu | Use case bao phủ |
|---|---|
| **User đăng ký/đăng nhập** | UC-01, UC-02, UC-03 |
| **Quản lý products** | UC-05 → UC-10 (+ UC-19 nếu dùng AI) |
| **Quản trang landing** | UC-11 → UC-14, UC-18 |
| **Lên kế hoạch marketing** | UC-15 → UC-17 (+ UC-23 nếu dùng AI) |
| **AI hỗ trợ làm landing** | UC-19 → UC-25 |

### 2.4. Golden flows (end-to-end)

#### Flow A — Manual (P1 không dùng AI)
```
UC-01 sign-up → UC-02 sign-in → UC-04 home
  → UC-05 create product → UC-06 fill info → UC-08 upload media
  → UC-11 create landing (chọn template) → UC-12 preview → UC-13 publish
  → UC-15 create campaign → UC-17/UC-18 theo dõi
```

#### Flow B — AI-assisted (P1 dùng AI Agent)
```
UC-02 sign-in → /ai-agents/start (pick/create product)
  → UC-19 enrich product info
  → UC-20 + UC-21 AI suggest template & draft landing
  → UC-22 AI suggest media
  → UC-23 AI suggest campaign plan
  → UC-25 review → publish landing → publish campaign
  → UC-17 / UC-18 theo dõi metrics
```

#### Flow C — Agency phục vụ client (P2)
```
UC-26 tạo client → UC-30 tạo client user → UC-29 cấp grant
  → (Flow A hoặc B với client_id của khách)
  → khách dùng UC-35..38 vào Client Portal xem report
```

### 2.5. Ưu tiên triển khai theo flow

| Sprint | Flow đảm bảo chạy được |
|---|---|
| Cuối tháng 1 | UC-01 → UC-10 (account + product CRUD + media) |
| Cuối tháng 2 | Flow A đầy đủ (manual landing + campaign) |
| Cuối tháng 3 | Flow B đầy đủ (AI assistant) + Flow C demo được |

---

## 3. Trạng thái 3 nguồn — bảng đối chiếu

| Capability | PDF Phase | BE Swagger | FE Mongoose | MVP quyết |
|---|---|---|---|---|
| Auth (login/logout/me) | Phase 1 | ✅ có | partial | Dùng BE |
| Sign-up / forgot password | Phase 1 | ❌ thiếu | ❌ | **Add BE** |
| Templates CRUD + version | Phase 1 | ✅ có | — | Dùng BE |
| Media upload + CDN | Phase 1 | ✅ có | — | Dùng BE |
| Project (Landing) + config + publish + release + rollback | Phase 1 | ✅ có | — | Dùng BE = "Landing" |
| Analytics + Track event | Phase 1 | ✅ có | — | Dùng BE |
| Client + Client Portal | Phase 1 | ✅ có | — | Dùng BE |
| **Product catalog** | Phase 4 | ❌ | ⚠️ Mongoose tự viết | **Pull-up Phase 4 → BE Postgres** |
| **Product Category** | Phase 4 | ❌ | ❌ | **Add BE** |
| **Marketing Campaign** | (chưa có trong PDF) | ❌ | ❌ | **Add BE (mới)** |
| **AI Landing Assistant** | Phase 2 | ❌ | ❌ | **Pull-up Phase 2 → MVP, scope tối thiểu** |
| Project ↔ Product link | — | ❌ | ❌ | **Add BE binding** |

→ Cần BE bổ sung: **Auth (sign-up/reset)**, **Product**, **ProductCategory**, **Campaign**, **AI endpoints**, **Project↔Product binding**. Mọi thứ khác đã sẵn sàng.

---

## 4. Domain Model

```
User ──owns──┐
             ├── Client (multi-tenant scope, đã có)
             │     └── Product (NEW)              ──┐
             │           ├── Category (NEW)         │
             │           ├── Media[] (đã có)        │
             │           ├── Campaign[] (NEW)       │
             │           └── Landing[] = Project ←──┘ binding (NEW)
             │                 ├── Template + TemplateVersion (đã có)
             │                 ├── ProjectConfig JSON (đã có)
             │                 ├── Release[] (đã có)
             │                 └── Analytics events (đã có)
             │
             └── AI Session (NEW, ephemeral)
                   ├── input: product, brief
                   └── output: suggested config / copy / media picks
```

**Nguyên tắc**:
- Không tạo entity "Landing" mới — `Project` của BE chính là Landing.
- Product là **entity gốc** của user; Landing & Campaign đều gắn với một Product.
- Mọi resource đều scope theo `client_id` (BE đã có pattern).

---

## 5. Modules

### 5.1. Auth & Account

**Đã có (BE)**:
- `POST /v1/auth/login`
- `POST /v1/auth/logout`
- `GET /v1/auth/me`

**Cần thêm**:
- `POST /v1/auth/register` — body `{ email, password, full_name, company_name? }` → tạo User + Client mặc định, set session cookie.
- `POST /v1/auth/forgot-password` — body `{ email }` → gửi mail.
- `POST /v1/auth/reset-password` — body `{ token, new_password }`.
- `POST /v1/auth/change-password` — body `{ old, new }` (cho user đã login).

**FE**: `/sign-up`, `/sign-in` (đã có) — chỉ cần wire vào BE thật, **xoá `/api/auth/setup` & `session-set` proxy** nếu chỉ là tạm thời.

---

### 5.2. Product Management

**Quyết định lớn**: bỏ Mongoose, dùng BE Postgres. Xoá `src/models/Product.ts`, `src/app/api/products/`, `src/server/{controllers,services,validation}/product*` sau khi BE sẵn sàng.

#### 5.2.1. Resource `Product`

| field | type | required | ghi chú |
|---|---|:-:|---|
| `id` | uuid | ✓ | BE sinh |
| `name` | string ≤255 | ✓ | |
| `slug` | string ≤255 | — | auto-gen, unique theo `client_id` |
| `sku` | string ≤64 | — | unique theo `client_id` nếu có |
| `category_id` | uuid | — | FK → `product_categories.id` |
| `description` | text ≤5000 | — | |
| `sizes` | string[] | — | |
| `colors` | `{name, hex}[]` | — | hex `^#[0-9A-Fa-f]{6}$` |
| `variants` | string[] | — | |
| `ingredients` | string[] | — | |
| `certifications` | string[] | — | |
| `features` | `{label, description}[]` | — | |
| `media_ids` | uuid[] | — | FK → `media.id` (Media đã có) |
| `status` | enum `draft\|active\|archived` | — | default `draft` |
| `client_id` | uuid | — | optional; default = client của user |
| `created_by`, `created_at`, `updated_at` | — | ✓ | BE set |

#### 5.2.2. Endpoints
- `POST   /v1/products` — required `name` only
- `GET    /v1/products?status=&category_id=&q=&page=&limit=&sort=`
- `GET    /v1/products/{productId}`
- `PATCH  /v1/products/{productId}`
- `DELETE /v1/products/{productId}` (soft → `status=archived`, set `deleted_at`)
- `POST   /v1/products/{productId}/media/bind` — tương tự `project_media_bindings`
- `DELETE /v1/products/{productId}/media/bindings/{bindingId}`

#### 5.2.3. Resource `ProductCategory`
- `name` unique theo `client_id`, có `features[]` template mặc định (để khi tạo Product lấy từ category sẽ có features sẵn).
- `POST /v1/product-categories`
- `GET /v1/product-categories?q=&page=&limit=`
- `GET|PATCH|DELETE /v1/product-categories/{id}`

#### 5.2.4. Errors
`PRODUCT_NOT_FOUND` (404), `PRODUCT_SKU_DUPLICATE` (409), `PRODUCT_SLUG_DUPLICATE` (409), `CATEGORY_NOT_FOUND` (404), `CATEGORY_NAME_DUPLICATE` (409), `CATEGORY_IN_USE` (409).

**FE**:
- `/product` (đã có) — list.
- `/product/start` (đã có) — wizard tạo mới.
- `/product/[id]/information` (đã có).
- `/product/[id]/media` (đã có) — gắn Media qua bind endpoint.
- `/product/[id]/marketing` (đã có) — chuyển sang module 5.4.

---

### 5.3. Landing Page Management (= BE Project)

**Không tạo entity mới**. Map khái niệm:

| Khái niệm UX | BE entity |
|---|---|
| Landing page | `Project` |
| Giao diện base | `Template` + `TemplateVersion` |
| Nội dung của landing | `ProjectConfig` (JSON) + revisions |
| Phiên bản đã publish | `Release` |
| Lên live / tắt | `POST /projects/{id}/publish`, `POST /releases/{id}/rollback` |
| Theo dõi traffic | `GET /projects/{id}/analytics` + `POST /track` |

**Cần thêm liên kết Product ↔ Project** (1 product có thể có nhiều landing, 1 landing có 1 product chính):
- Thêm cột `product_id` (uuid, nullable) vào bảng `projects` — đơn giản nhất.
- Hoặc bảng binding `project_products` nếu sau này cần n-n. **MVP chọn cột `product_id` nullable**.
- Cập nhật `CreateProjectRequest` & `UpdateProjectRequest` thêm field `product_id`.
- Filter mới: `GET /v1/projects?product_id=...`.

**FE**: cần thêm route landing builder. Đề xuất:
- `/product/[id]/landing` — list landings của product.
- `/product/[id]/landing/[landingId]/builder` — chỉnh `ProjectConfig` (JSON form sinh từ template schema).
- `/product/[id]/landing/[landingId]/preview` — render preview.
- `/product/[id]/landing/[landingId]/publish` — gọi `/projects/{id}/publish`.

> Tận dụng `Template.preview_mode` và `GET /templates/{id}/preview` đã có.

---

### 5.4. Marketing Campaign

PDF chưa có resource Campaign cụ thể, nhưng UX FE đã có `/product/[id]/marketing/[mid]`. MVP định nghĩa entity tối thiểu:

#### 5.4.1. Resource `Campaign`

| field | type | required | ghi chú |
|---|---|:-:|---|
| `id` | uuid | ✓ | |
| `product_id` | uuid | ✓ | FK |
| `name` | string ≤255 | ✓ | |
| `objective` | enum `awareness\|traffic\|conversion\|retention` | — | |
| `channels` | string[] | — | `["facebook","google_ads","email","tiktok"]` |
| `start_date`, `end_date` | date | — | |
| `budget_amount` | number | — | |
| `budget_currency` | string(3) | — | default `VND` |
| `status` | enum `draft\|active\|paused\|completed` | — | default `draft` |
| `landing_project_id` | uuid | — | FK → `projects.id` (landing đi kèm) |
| `kpis` | `{name, target}[]` | — | ví dụ `{name:"CTR", target:0.05}` |
| `notes` | text | — | |
| `client_id`, `created_by`, `created_at`, `updated_at` | — | — | |

#### 5.4.2. Endpoints
- `POST   /v1/campaigns`
- `GET    /v1/campaigns?product_id=&status=&page=&limit=`
- `GET    /v1/campaigns/{campaignId}`
- `PATCH  /v1/campaigns/{campaignId}`
- `DELETE /v1/campaigns/{campaignId}` (soft)
- `GET    /v1/campaigns/{campaignId}/metrics` — aggregate analytics events theo `utm_campaign` (tận dụng field `utm_campaign` đã có ở `TrackEventRequest`).

> Map `utm_campaign` ở event tracking với `Campaign.id` (hoặc `Campaign.slug`) để có report tự động. Quy ước: khi publish landing kèm campaign, BE inject `utm_campaign={campaign_id}` vào URL.

**FE**: `/product/[id]/marketing` (list), `/product/[id]/marketing/[mid]` (detail) — đã có.

---

### 5.5. AI Landing Assistant

PDF Phase 2 nói về Prompt Orchestrator + Safety Guardrails + AI Content Agent. MVP **lấy phần tối thiểu** đủ để chạy AI flow `/ai-agents/[productId]/*`.

#### 5.5.1. Scope MVP
- **In**: text generation (description, headline, CTA copy), template suggestion, basic image picking từ Media library, campaign plan suggestion.
- **Out**: A/B testing automation, batch publishing, fine-tuning, image generation từ scratch (giai đoạn sau).

#### 5.5.2. Endpoints (mới)

Thiết kế thin layer, mỗi endpoint stateless (input đầy đủ, output structured):

| Endpoint | Mục đích | Input | Output |
|---|---|---|---|
| `POST /v1/ai/product/enrich` | Gợi ý mô tả/feature từ tên + category | `{name, category_id?, hint?}` | `{description, features[], suggested_tags[]}` |
| `POST /v1/ai/template/suggest` | Đề xuất template phù hợp với product | `{product_id, goal?}` | `{candidates: [{template_id, version_id, score, reason}]}` |
| `POST /v1/ai/landing/draft` | Sinh `ProjectConfig` JSON từ product + template | `{product_id, template_version_id, brief?}` | `{config_json, copy_blocks[]}` |
| `POST /v1/ai/landing/optimize` | Suggest cải thiện landing đang có | `{project_id}` | `{suggestions: [{section, change, reason}]}` |
| `POST /v1/ai/media/suggest` | Gợi ý ảnh trong Media library cho từng section | `{product_id, section_keys[]}` | `{[section_key]: media_ids[]}` |
| `POST /v1/ai/campaign/plan` | Sinh campaign plan từ product + goal | `{product_id, objective, budget?}` | `{name, channels[], duration_days, kpis[]}` |

#### 5.5.3. Kiến trúc
- **Internal**: Go BE → gọi LLM provider (OpenAI/Anthropic) qua adapter `internal/ai/provider`.
- **Prompt template**: lưu trong `internal/ai/prompts/*.tmpl`.
- **Guardrails MVP**: chỉ check max tokens + content moderation API có sẵn của provider; chưa cần Safety pipeline phức tạp.
- **Cache**: Redis key = `sha256(prompt+input)`, TTL 7 ngày — tránh đốt token.
- **Audit**: ghi log mỗi call vào `ai_call_logs` table (`user_id, endpoint, input_hash, tokens, cost_usd, latency_ms, created_at`).

#### 5.5.4. Quota MVP
- Per user/day: 100 calls (cấu hình ENV).
- Trả `429 AI_QUOTA_EXCEEDED` khi hết.

**FE**: route `/ai-agents/*` đã dựng sẵn — chỉ cần wire vào endpoint thật.

---

## 6. API contract — tổng hợp thay đổi BE

### Giữ nguyên (đã có)
auth (login/logout/me), clients, client-portal, dashboard, media, projects (+config, releases, publish, analytics, reports, media-bindings, events, summary), releases, templates, track.

### Thêm mới
```
POST   /v1/auth/register
POST   /v1/auth/forgot-password
POST   /v1/auth/reset-password
POST   /v1/auth/change-password

POST   /v1/products
GET    /v1/products
GET    /v1/products/{id}
PATCH  /v1/products/{id}
DELETE /v1/products/{id}
POST   /v1/products/{id}/media/bind
DELETE /v1/products/{id}/media/bindings/{bindingId}

POST   /v1/product-categories
GET    /v1/product-categories
GET    /v1/product-categories/{id}
PATCH  /v1/product-categories/{id}
DELETE /v1/product-categories/{id}

POST   /v1/campaigns
GET    /v1/campaigns
GET    /v1/campaigns/{id}
PATCH  /v1/campaigns/{id}
DELETE /v1/campaigns/{id}
GET    /v1/campaigns/{id}/metrics

POST   /v1/ai/product/enrich
POST   /v1/ai/template/suggest
POST   /v1/ai/landing/draft
POST   /v1/ai/landing/optimize
POST   /v1/ai/media/suggest
POST   /v1/ai/campaign/plan
```

### Mở rộng existing
- `CreateProjectRequest` / `UpdateProjectRequest`: thêm `product_id` (uuid, optional).
- `GET /projects`: thêm filter `product_id`.
- `TrackEventRequest`: tận dụng `utm_campaign` đã có để link với Campaign.

### DB migrations
- `products`, `product_categories`, `product_media_bindings` (nếu chọn bảng binding thay vì cột `media_ids`), `campaigns`, `ai_call_logs`.
- Alter `projects` add `product_id uuid null` + index.
- Indexes: `(client_id, status, created_at desc)` cho `products` và `campaigns`; unique `(client_id, slug)` partial cho `products`; unique `(client_id, name)` partial cho `product_categories`.

---

## 7. FE page map — đã có vs cần wire/sửa

| Route | Trạng thái | Action |
|---|---|---|
| `/sign-in`, `/sign-up` | đã có | Wire vào BE thật, bỏ Mongoose-based session |
| `/home` | đã có | Wire vào `/dashboard/summary` |
| `/product` | đã có | Wire vào `/v1/products` |
| `/product/start` | đã có | Wire `POST /v1/products` |
| `/product/[id]/information` | đã có | Wire `GET/PATCH /v1/products/{id}` |
| `/product/[id]/media` | đã có | Wire `/products/{id}/media/bind` + Media upload |
| `/product/[id]/marketing` | đã có | Wire `GET /v1/campaigns?product_id=` |
| `/product/[id]/marketing/[mid]` | đã có | Wire `GET/PATCH /v1/campaigns/{id}` |
| `/product/[id]/landing` | **mới** | List `GET /v1/projects?product_id=` |
| `/product/[id]/landing/[landingId]/builder` | **mới** | `GET/PUT /projects/{id}/config` |
| `/product/[id]/landing/[landingId]/preview` | **mới** | render từ config |
| `/product/[id]/landing/[landingId]/publish` | **mới** | `POST /projects/{id}/publish` |
| `/template` | đã có | Wire `/v1/templates` |
| `/template/[id]` | đã có | Wire `/v1/templates/{id}` + versions |
| `/ai-agents` | đã có | Wire bộ AI endpoints |
| `/ai-agents/start` | đã có | Pick product hoặc tạo mới |
| `/ai-agents/[productId]/information` | đã có | Gọi `/v1/ai/product/enrich` |
| `/ai-agents/[productId]/template` | đã có | Gọi `/v1/ai/template/suggest` |
| `/ai-agents/[productId]/media` | đã có | Gọi `/v1/ai/media/suggest` |
| `/ai-agents/[productId]/campaign` | đã có | Gọi `/v1/ai/campaign/plan` |
| `/ai-agents/[productId]/marketing` | đã có | Review & publish (gọi `/v1/ai/landing/draft` + `POST /projects` + `/publish`) |

**Dọn dẹp**: xoá `src/models/Product.ts`, `src/app/api/products/*`, `src/server/controllers/product.controller.ts`, `src/server/services/product.service.ts`, `src/server/validation/product.ts` sau khi BE sẵn sàng (Sprint 2 cuối tuần).

### 7.1 FE Gap Tracker vs BE Swagger (chiều ngược lại)

Đối chiếu **BE đã code → FE còn thiếu UI**. Mục 6 và 7 ở trên là chiều "FE đi trước, BE thiếu". Mục này là chiều "BE đã có, FE chưa wire".

#### 7 flow chính BE đã code

| # | Flow BE | Endpoints chính | FE hiện tại |
|---|---------|-----------------|-------------|
| F1 | **Auth + Session** | `POST /auth/login`, `/logout`, `GET /auth/me` | ✅ `(auth)/sign-in`, `/sign-up` |
| F2 | **Multi-tenant Clients** | `GET/POST /clients`, `PATCH /clients/{id}`, `/access-grants`, `/clients/{id}/users` | ❌ Không có UI |
| F3 | **Template + Versioning** | `GET/POST /templates`, `/templates/{id}/versions`, `/templates/{id}/preview` | 🟡 Có `/template`, `/template/[id]` nhưng thiếu UI version |
| F4 | **Project (Landing) lifecycle** | `POST /projects`, `GET/PUT /config`, `/config/revisions`, `POST /publish/validate`, `POST /publish`, `GET /releases`, `POST /releases/{id}/rollback`, `GET /active-release` | ❌ Thiếu toàn bộ phần publish/release/rollback/config history |
| F5 | **Media pipeline + binding** | `init` → `raw` → `complete`, `POST /projects/{id}/media/bind`, `DELETE /media/bindings/{id}` | 🟡 Upload có (`/api/upload`) nhưng **không gọi bind** → media không hiển thị trên landing publish |
| F6 | **Track + Analytics** | `POST /track`, `GET /projects/{id}/analytics`, `/reports`, `/events/summary`, `GET /dashboard/summary` | 🟡 `/home` đọc summary chung, thiếu Analytics theo từng landing |
| F7 | **Client Portal** | `GET /client-portal/me/projects`, `/client-portal/projects/{id}`, `/analytics`, `/reports` | ❌ Hoàn toàn chưa có |

#### 🔴 Gap CHẶN MVP — phải bổ sung trong Sprint 2-3

| Gap | Việc phải làm FE | Endpoint BE | Sprint |
|-----|------------------|-------------|--------|
| **G1. Publish/Release UI** | Thêm tab `/product/[id]/landing/[landingId]/publish` gồm: nút **Validate** → **Publish** → list **Releases** → nút **Rollback** | `POST /projects/{id}/publish/validate`, `POST /publish`, `GET /releases`, `POST /releases/{id}/rollback` | 2.2 |
| **G2. Media binding hook** | Sau khi upload thành công, **tự động gọi** `POST /projects/{projectId}/media/bind` và lưu `binding_id`. Trang Media hiển thị danh sách binding, có nút unbind. | `POST /projects/{id}/media/bind`, `DELETE /media/bindings/{id}` | 2.1 |
| **G3. Analytics tối thiểu** | Thêm `/product/[id]/landing/[landingId]/analytics` đọc pageview/conversion/UTM theo campaign | `GET /projects/{id}/analytics`, `/reports`, `/events/summary` | 2.2 |

#### 🟡 Gap CÓ THỂ DEFER Phase 2 (không chặn MVP)

| Gap | Phương án MVP | Lý do defer |
|-----|---------------|-------------|
| **G4. Clients/Workspace UI** | Auto-create 1 client khi sign-up, ẩn UI quản lý | MVP single-tenant per user là đủ |
| **G5. Template Versions UI** | FE luôn pin `latest_version` khi tạo project | Chưa có nhu cầu version pinning |
| **G6. Client Portal** | — | Chỉ cần khi agency có khách hàng thật |
| **G7. Config revisions diff viewer** | List revision number thôi, không diff | Nice-to-have, không phải core flow |

#### Coverage sau khi đóng G1-G3

- F1 ✅ F2 🟡(defer) F3 🟡(defer) **F4 ✅** **F5 ✅** **F6 ✅** F7 🟡(defer)
- → Toàn bộ golden flow A/B/C trong mục 2 chạy được end-to-end.

---

## 8. Kế hoạch triển khai (3 tháng — khớp Gantt PDF)

### Tháng 1 — Foundation & Product
**BE**
- Sprint 1.1: Auth mở rộng (register, forgot/reset password, change password).
- Sprint 1.2: `Product` + `ProductCategory` resources + media bind.
- Sprint 1.3: Migrate FE Mongoose data (nếu có) sang Postgres; xoá `src/models/Product.ts`.

**FE**
- Wire `/sign-up`, `/sign-in`, `/home` vào BE thật.
- Wire `/product/*` (list, create, info, media) sang `/v1/products`.

**Deliverable**: User đăng ký được, tạo product được, upload media được.

### Tháng 2 — Landing & Campaign
**BE**
- Sprint 2.1: Mở rộng `Project` add `product_id`; thêm filter `?product_id=`.
- Sprint 2.2: Resource `Campaign` + endpoint `metrics` (join với analytics events qua `utm_campaign`).

**FE**
- Build `/product/[id]/landing/*` (list, builder, preview, publish).
- Wire `/product/[id]/marketing/*` vào `/v1/campaigns`.
- Tích hợp publish flow + show release history.

**Deliverable**: User tạo landing manual từ template, publish được, lên kế hoạch campaign.

### Tháng 3 — AI Assistant + Polish
**BE**
- Sprint 3.1: AI provider adapter (OpenAI/Anthropic) + cache Redis + `ai_call_logs`.
- Sprint 3.2: 6 endpoints `/v1/ai/*` + quota.

**FE**
- Wire toàn bộ flow `/ai-agents/[productId]/*`.
- E2E test: pick product → AI draft landing → publish → xem analytics.
- Bug bash + UAT.

**Deliverable**: AI flow chạy end-to-end. Release MVP.

### Resource (theo PDF Phase 1)
- 1 PM (0.5 mm/tháng)
- 1 Tech Lead (0.3)
- 1 BA (0.5)
- 2 Senior Dev (2.0) — **cân nhắc tăng 0.5 cho AI module nếu chưa ai làm AI trước đó**
- 0.5 Tester
- Tổng theo PDF: 510M VND / 3 tháng.

---

## 9. Open questions cần chốt trước Sprint 1

1. **Multi-tenant**: `client_id` bắt buộc hay optional cho Product/Campaign? Đề xuất: optional ở MVP, default = client của user đang login.
2. **Auth provider**: PDF nhắc Auth0/Cognito; BE đang dùng CookieAuth tự build. Giữ CookieAuth cho MVP, migrate sau? → Đề xuất giữ.
3. **AI provider**: chọn OpenAI hay Anthropic? Có cần fallback? → Đề xuất 1 provider duy nhất ở MVP, bỏ fallback.
4. **Quota AI**: 100 calls/user/day có đủ không? → Cần BA xác nhận.
5. **Publish target**: BE Publish hiện sinh release artifact ở đâu (S3/R2 + CloudFront)? Cần xác nhận domain phục vụ landing đã publish.
6. **Email service**: forgot-password cần SMTP/SES/Resend nào? Cần chốt provider.
7. **Project ↔ Product**: 1-n (1 product nhiều landing) hay 1-1? Đề xuất 1-n, cột `product_id` nullable trên `projects`.
8. **Pagination convention**: BE đang dùng `page+limit+total_pages` hay `cursor`? Cần đồng bộ với các list hiện có.

---

## 10. Mức tối thiểu để demo MVP cuối tháng 3

- Sign-up → sign-in → tạo 1 Product có ảnh.
- AI gợi ý template + sinh ProjectConfig draft.
- User chỉnh sửa, publish landing → có URL truy cập được trên CDN.
- Tạo Campaign gắn với landing (+UTM tự động).
- Truy cập landing tạo events → `/dashboard/summary` & `/campaigns/{id}/metrics` hiển thị số liệu.

Nếu chạy được flow này end-to-end, MVP đạt.

---

## 11. API Issues (snapshot 2026-04-26 sau khi BE bổ sung 19 endpoints)

Sau khi BE đã add Products / ProductCategories / Campaigns / AI / Auth-extended, FE đã wire toàn bộ. Các issue dưới đây cần BE-team review trước khi production:

### 🔴 Bug / phải sửa

1. **`SimpleDate` schema sai** — BE serialize `start_date / end_date` của Campaign thành `{ "time.Time": "..." }` thay vì ISO string trực tiếp. FE phải truy cập `date["time.Time"]` — rất ugly và dễ break. *Fix*: marshal `time.Time` trực tiếp ra string ISO-8601.

2. **`/auth/forgot-password` trả `reset_token` thẳng trong response body** — comment trong schema thừa nhận "MVP only, replace with email in prod". Đây là **lỗ hổng bảo mật nghiêm trọng** nếu deploy production mà chưa thay → kẻ tấn công gọi `forgot-password` cho bất kỳ email nào và lấy token reset luôn. *Fix*: gate behind env flag, default response chỉ trả `{ message }`, log warning loud nếu chế độ MVP còn bật.

3. **`Product` schema thiếu `status` ở Response** mặc dù `CreateProductRequest` có `status` enum và `UpdateProductRequest` cũng có. FE không đọc lại được `status` sau khi save → không thể hiển thị "draft / active / archived" badge sau create. *Fix*: thêm `status` vào `Product` schema response.

4. **`features` của Product không tự inherit từ Category** — UI Add Category dialog tạo template `features` nhưng khi user pick category vào product, BE không auto-merge. FE phải fetch `/product-categories/{id}` riêng rồi merge tay. *Fix*: BE compute và trả luôn `features` template trong `ProductResponse.category` hoặc auto-prefill khi create với `category_id`.

5. **`presigned_url` rò `localhost:9090` (chặn pipeline upload)** — `POST /v1/media/uploads/init` trả về:
   ```json
   { "presigned_url": "http://localhost:9090/v1/media/uploads/{id}/raw", ... }
   ```
   FE gọi PUT vào URL này từ browser → `ERR_CONNECTION_REFUSED` → toàn bộ pipeline upload broken. Phát hiện qua Playwright e2e (`scripts/visual-tests/verify-upload-flow.mjs`). FE đã workaround: phát hiện `localhost`/`127.0.0.1` trong `presigned_url` thì fallback dùng proxy `/api/rexer/media/uploads/{id}/raw` (`use-upload-and-bind.ts`). **Fix BE chính thức**: serialize URL với hostname production hoặc tốt hơn là trả relative path.

6. **`TemplatePreviewResponse.preview_url` cũng `localhost:9090`** — cùng pattern bug như #5 nhưng ở template preview. FE iframe không load được. Tạm thời FE fallback hiển thị card trắng.

### 🟡 Inconsistency / khó dùng

5. **Pagination không có `total_pages`** — `ProductListResponse / ProductCategoryListResponse / CampaignListResponse` chỉ trả `{ items, page, limit, total }`. FE phải tự tính `Math.ceil(total/limit)`. *Đề xuất*: thêm `total_pages` để FE tránh bug round-down.

6. **`BindMediaItem.field_key` required ở Project bind, optional ở Product bind** — 2 endpoint cùng concept nhưng schema khác. FE dễ nhầm, hook bind phải biết loại resource. *Fix*: thống nhất 1 trong 2.

7. **`ProductMediaBinding` vs `ProjectMediaBinding`** — 2 type tách biệt nhưng cùng pattern (`{id, *_id, field_key, slot_key, media_id, created_at}`). Có thể gộp thành `MediaBinding` với discriminator `target_type`.

8. **`RegisterResponse` có `client` field, `LoginResponse` thì không** — sau register FE biết được client_id, sau login phải gọi `/clients` thêm 1 round-trip. *Fix*: thêm `client` (hoặc `clients[]`) vào `LoginResponse` & `AuthMeResponse`.

9. **`Campaign.tracked_url`** comment "computed at read-time from active release" — nếu landing chưa publish, field empty. FE đang fallback "—" nhưng không cảnh báo user. *Đề xuất*: BE thêm `tracked_url_status` (`"ready" | "no_release"`) hoặc cho FE biết lý do.

10. **AI endpoints chưa documented error responses** — chỉ define `200`. Khi LLM provider timeout / quota exceeded / 429 thì BE trả gì không rõ. FE đang `try/catch` generic. *Fix*: document `429 QuotaExceeded`, `503 LLMUnavailable`, `408 LLMTimeout`.

11. **`AIMediaSuggestResponse.suggestions: Record<section, string[]>`** — `string[]` là URL hay description? Schema không clarify. *Fix*: đổi thành `Record<section, AIMediaSuggestion[]>` với `{ url?, description?, source?, license? }`.

12. **`PublishProjectRequest.config_revision_no` REQUIRED** nhưng FE chưa có UI builder để generate config revision → user kẹt: tạo project xong không publish được. *Đề xuất*: cho phép publish với latest revision tự động (`config_revision_no = null` ⇒ dùng current).

13. **Không có `GET /clients/{id}/access-grants` list endpoint** — FE tạo grant qua POST nhưng không có cách enum lại các grant đã tạo (chỉ thấy trong session sau khi vừa tạo). *Fix*: thêm GET list endpoint.

14. **`ChangePasswordRequest`** không yêu cầu logout sessions khác — bảo mật: nếu attacker đã có session active thì đổi password không kick được. *Fix*: invalidate other sessions sau change-password thành công.

### ⚪ Nice-to-have

15. **`/auth/me` không trả `client_id`** dù user thuộc 1 client. FE hiện hard-code `client_id` từ Redux state đã set lúc login. Đề xuất expose `client_id` (hoặc `client_ids[]` cho user multi-tenant).

16. **`Track` endpoint nhận `release_id` optional** nhưng public landing không biết chính xác release_id của mình (chỉ biết qua HTML inject). Nếu BE inject `<script data-release-id="...">` vào published HTML thì FE track helper nên đọc từ DOM.

17. **Product không có endpoint list `?landing_project_id=`** — FE muốn từ landing detail trace ngược về product nào tạo nó cũng phải query separately.

### Đã wire FE (hoàn tất turn này)

| Module | Endpoints | UI |
|---|---|---|
| Products CRUD | `/v1/products` | `/product/*` (đã migrate khỏi Mongoose proxy) |
| Product categories | `/v1/product-categories` | (FE chưa có UI manage — defer) |
| Campaigns | `/v1/campaigns/*` | (FE marketing pages chưa wire — defer next turn) |
| AI 6 endpoints | `/v1/ai/*` | (FE ai-agents wizard chưa wire — defer next turn) |
| Auth extended | `/v1/auth/{register,forgot,reset,change}-password` | (signup đã đổi `display_name → full_name`; forgot/reset chưa có UI — defer) |
| Project publish/release | `/v1/projects/{id}/publish/*`, `/v1/releases/*` | `/product/[id]/landing/[landingId]/publish` ✅ |
| Project media bind | `/v1/projects/{id}/media/bind` + upload pipeline | `/product/[id]/landing/[landingId]/media` ✅ |
| Project analytics | `/v1/projects/{id}/analytics`, `/events/summary`, `/reports` | `/product/[id]/landing/[landingId]/analytics` ✅ |
| Template versions | `/v1/templates/{id}/versions` | `/template/[id]` (panel bên phải) ✅ |
| Clients/Workspaces | `/v1/clients/*` | `/setting/clients/*` ✅ |
| Client portal | `/v1/client-portal/*` | `(client-portal)/portal/*` ✅ |
