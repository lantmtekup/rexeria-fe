# BE Spec — AI Token Usage Tracking (Alpha)

**Mục tiêu**: Theo dõi mức tiêu thụ AI token của từng user / workspace để team Alpha:
1. Phát hiện sớm user "burn" nhiều token (chi phí bất thường, abuse, vòng lặp prompt).
2. Có dữ liệu để thiết lập quota / billing tier sau Alpha.
3. Hiển thị trong trang admin user detail (tab "AI Usage").

**Trạng thái**: 🆕 Chưa có. Cần bảng mới + hook log trong tất cả AI handler hiện có.

**Base**: `/v1`
**Auth**: CookieAuth (admin endpoints) hoặc internal-only (log endpoint)
**Convention**: `snake_case` JSON, UUID IDs, ISO-8601 timestamps
**Error body**: reuse `pkg_http.ErrorBody`

---

## 0. Phạm vi Alpha

**Bao gồm**:
- Log mọi request tới các AI endpoint (`/ai/*` + canvas-apply-product) → bảng `ai_usage`.
- Tính `cost_usd` ngay tại thời điểm log (giá model là moving target → chốt cứng vào row).
- Endpoint admin xem usage theo user / global / feature / time series.
- Export CSV cho reconciliation.

**Loại trừ Alpha** (làm sau):
- Quota enforcement (block request khi vượt limit) — Alpha chỉ alert.
- Per-feature quota.
- Real-time streaming usage.
- LangSmith / Helicone integration (tự log đủ cho Alpha).

---

## 1. Resource: `AIUsage`

### 1.1. Schema

| field                | type                          | required | ghi chú                                                                  |
|----------------------|-------------------------------|:--------:|--------------------------------------------------------------------------|
| `id`                 | uuid                          |    ✓     |                                                                          |
| `user_id`            | uuid                          |    ✓     | FK → `users.id`; lấy từ session                                          |
| `client_id`          | uuid                          |    —     | FK → `clients.id`; nullable nếu user chưa thuộc workspace                |
| `request_id`         | string (≤64)                  |    ✓     | trace ID từ `pkg_http`, để cross-reference logs                          |
| `feature`            | enum                          |    ✓     | xem §1.2 — feature key cố định, **không** lấy từ URL trực tiếp           |
| `model`              | string (≤64)                  |    ✓     | vd. `claude-opus-4-7`, `claude-sonnet-4-6`, `gpt-4o-mini`                |
| `provider`           | enum `anthropic \| openai \| google \| local` | ✓ | để filter chi phí theo nhà cung cấp                                |
| `prompt_tokens`      | int                           |    ✓     | input tokens (incl. system prompt + tool defs nếu có)                    |
| `completion_tokens`  | int                           |    ✓     | output tokens                                                            |
| `total_tokens`       | int                           |    ✓     | `= prompt + completion`; redundant nhưng tiện cho query/index            |
| `cached_tokens`      | int                           |    —     | prompt-cache hit (Anthropic / OpenAI cached input)                       |
| `cost_usd`           | numeric(12,6)                 |    ✓     | server tính tại thời điểm log; xem §2                                    |
| `latency_ms`         | int                           |    —     | tổng thời gian request                                                   |
| `status`             | enum `success \| error \| timeout` | ✓   | `error` vẫn log để biết phí prompt failed                                |
| `error_code`         | string (≤64)                  |    —     | nullable, vd. `RATE_LIMITED`, `CONTENT_FILTERED`                         |
| `meta`               | jsonb (≤2 KB)                 |    —     | free-form: `{ project_id, canvas_template_id, prompt_hash, …}`           |
| `created_at`         | timestamp                     |    ✓     |                                                                          |

### 1.2. Enum `feature`

Map cứng từ AI handler hiện có (xem `src/services/rexer/endpoints.ts` block `ai`):

| feature key                  | endpoint hiện tại                                  |
|------------------------------|----------------------------------------------------|
| `product_enrich`             | `POST /ai/product/enrich`                          |
| `template_suggest`           | `POST /ai/template/suggest`                        |
| `landing_draft`              | `POST /ai/landing/draft`                           |
| `landing_optimize`           | `POST /ai/landing/optimize`                        |
| `media_suggest`              | `POST /ai/media/suggest`                           |
| `campaign_plan`              | `POST /ai/campaign/plan`                           |
| `block_content`              | `POST /ai/block-content`                           |
| `canvas_apply_product`       | `POST /ai/canvas-templates/{id}/apply-product`     |

Khi thêm feature AI mới, bổ sung enum + handler hook trước khi merge.

### 1.3. Index

- `(user_id, created_at DESC)` — query "AI usage của user này"
- `(client_id, created_at DESC)` — workspace level
- `(feature, created_at DESC)` — top features
- `(created_at DESC)` — global feed
- Partial: `WHERE status = 'success'` cho aggregate cost (giảm row count khi summary).

---

## 2. Cost calculation

BE giữ bảng config in-memory (hoặc file YAML reload-on-startup) — **không** hard-code trong handler:

```yaml
models:
  claude-opus-4-7:
    provider: anthropic
    input_per_1m_usd: 15.00
    output_per_1m_usd: 75.00
    cached_input_per_1m_usd: 1.50
  claude-sonnet-4-6:
    provider: anthropic
    input_per_1m_usd: 3.00
    output_per_1m_usd: 15.00
    cached_input_per_1m_usd: 0.30
  claude-haiku-4-5-20251001:
    provider: anthropic
    input_per_1m_usd: 1.00
    output_per_1m_usd: 5.00
  gpt-4o-mini:
    provider: openai
    input_per_1m_usd: 0.15
    output_per_1m_usd: 0.60
```

**Công thức**:
```
cost_usd = (prompt_tokens - cached_tokens) * input_rate / 1_000_000
        + cached_tokens                    * cached_rate / 1_000_000
        + completion_tokens                * output_rate / 1_000_000
```

Khi giá thay đổi, **không** retro-compute — row cũ giữ giá lúc log. Chỉ hot-reload config cho request mới.

> Giá ở trên là minh hoạ; Alpha cập nhật giá thật từ Anthropic/OpenAI pricing page tại deploy time.

---

## 3. Logging hook (BE)

### 3.1. Vị trí gọi

Wrap mọi AI handler bằng middleware/decorator `withAIUsage(feature, fn)`:

```go
// pseudo-code
func withAIUsage[T](feature string, fn func() (T, *LLMResult, error)) http.Handler {
    return func(w, r) {
        start := time.Now()
        result, llm, err := fn()
        defer func() {
            // Fire-and-forget — log failure must NOT fail the user request.
            go aiUsageRepo.Insert(AIUsageRow{
                user_id:           ctx.UserID,
                client_id:         ctx.ClientID,
                request_id:        ctx.RequestID,
                feature:           feature,
                model:             llm.Model,
                provider:          llm.Provider,
                prompt_tokens:     llm.PromptTokens,
                completion_tokens: llm.CompletionTokens,
                total_tokens:      llm.PromptTokens + llm.CompletionTokens,
                cached_tokens:     llm.CachedTokens,
                cost_usd:          calcCost(llm),
                latency_ms:        int(time.Since(start) / time.Millisecond),
                status:            statusOf(err),
                error_code:        codeOf(err),
                meta:              ctx.MetaJSON,
            })
        }()
        // … render response …
    }
}
```

### 3.2. Failure modes

- **Insert lỗi** (DB down) → log warning, KHÔNG bubble up. Mất dữ liệu usage chấp nhận được; làm fail user request thì không.
- **LLM timeout** → vẫn log với `status=timeout`, `completion_tokens=0`, `cost_usd` = chi phí prompt (tốt nhất estimate).
- **LLM error** (rate-limited / content filter) → log với `status=error`, `error_code` từ provider.

### 3.3. Async queue (Beta)

Khi volume tăng, đổi sang queue (NATS / Redis Stream / outbox table) — Alpha không cần.

---

## 4. Endpoints

### 4.1. `GET /v1/admin/users/{id}/ai-usage`

- **Summary**: Usage summary của 1 user.
- **Security**: CookieAuth, role `admin` / `staff`.
- **Query**:
  - `from`, `to` — ISO date (default: 30 ngày gần nhất)
  - `group_by` — enum `day | week | feature | model | provider`, default `day`
  - `status` — filter: `success | error | timeout` (default: tất cả)
- **Responses**:
  - `200`:
    ```json
    {
      "summary": {
        "total_requests": 123,
        "prompt_tokens": 245678,
        "completion_tokens": 67890,
        "total_tokens": 313568,
        "cached_tokens": 12000,
        "cost_usd": 4.567890,
        "first_at": "2026-04-08T01:23:45Z",
        "last_at": "2026-05-08T03:21:00Z"
      },
      "series": [
        {
          "bucket": "2026-05-08",
          "requests": 12,
          "prompt_tokens": 23456,
          "completion_tokens": 7890,
          "cost_usd": 0.345
        }
      ],
      "top_features": [
        {
          "feature": "canvas_apply_product",
          "requests": 47,
          "total_tokens": 145000,
          "cost_usd": 1.234
        }
      ],
      "top_models": [
        { "model": "claude-sonnet-4-6", "requests": 80, "cost_usd": 2.5 }
      ]
    }
    ```
  - `404` — user không tồn tại
  - `403` — không phải admin

### 4.2. `GET /v1/admin/ai-usage`

- **Summary**: Global view (tất cả users).
- **Security**: CookieAuth, role `admin`.
- **Query**: cùng 4.1 + `user_id`, `client_id`, `feature`, `model`, `provider` filter, `page`, `limit`.
- **Responses**:
  - `200`:
    ```json
    {
      "summary": { … như 4.1 },
      "top_users": [
        {
          "user_id": "u_01HX…",
          "user_email": "alpha@tekup.vn",
          "requests": 200,
          "total_tokens": 500000,
          "cost_usd": 8.5
        }
      ],
      "top_clients": [ … ],
      "top_features": [ … ]
    }
    ```

### 4.3. `GET /v1/admin/ai-usage/list`

- **Summary**: Recent request list (paged) — drilldown cho debug.
- **Security**: CookieAuth, role `admin`.
- **Query**:
  - `user_id`, `client_id`, `feature`, `model`, `provider`, `status`, `from`, `to`
  - `page` (default 1), `limit` (default 50, max 200), `sort` (default `-created_at`)
- **Responses**:
  - `200` — `{ items: AIUsage[], page, limit, total }`

### 4.4. `GET /v1/admin/ai-usage/export.csv`

- **Summary**: Export filtered data cho reconciliation / billing.
- **Security**: CookieAuth, role `admin`.
- **Query**: cùng 4.3.
- **Responses**: `200` `text/csv`; cột:
  ```
  created_at, request_id, user_id, user_email, client_id, feature, provider,
  model, prompt_tokens, completion_tokens, cached_tokens, total_tokens,
  cost_usd, latency_ms, status, error_code
  ```

### 4.5. `GET /v1/me/ai-usage` — User self-view

- **Summary**: User xem usage của chính mình. Cho phép user thấy mình đang dùng nhiều/ít, chuẩn bị cho quota Beta.
- **Security**: CookieAuth (mọi user, không yêu cầu admin).
- **Server logic**: BE **bắt buộc** force `user_id = ctx.user_id` từ session, ignore mọi `user_id` query param. Không bao giờ trả data của user khác.
- **Query**: cùng 4.1 trừ:
  - **Bỏ** field `status` filter (user không quan tâm error log nội bộ)
  - **Không** trả field `error_code` / `request_id` trong response (không leak debug info)
- **Responses**: cùng shape 4.1 (chỉ `summary` + `series` + `top_features`; bỏ `top_models`).

### 4.6. (Optional) `GET /v1/admin/ai-usage/anomalies`

- **Summary**: List user/feature có usage tăng đột biến > N% so với baseline 7 ngày.
- **Status**: P2 — Alpha có thể skip; làm khi cần alert.

---

## 5. Quota fields trên `User` (chuẩn bị Beta)

Migrate sẵn để FE Alpha render được "Quota: ∞ / Unlimited" mà không phải đổi schema sau:

| field                       | type            | default | ghi chú                                |
|-----------------------------|-----------------|---------|----------------------------------------|
| `ai_quota_tokens_month`     | int             | NULL    | NULL = unlimited (Alpha default)        |
| `ai_quota_cost_usd_month`   | numeric(10,2)   | NULL    | alt: tính theo $ thay vì tokens         |
| `ai_quota_period_start_at`  | timestamp       | NULL    | reset window                           |
| `ai_quota_hard_limit`       | bool            | false   | `true` = block, `false` = chỉ alert     |

Alpha **không enforce**; Beta sẽ làm middleware check trước khi gọi LLM.

---

## 6. Error codes

| code                          | http | khi nào                                  |
|-------------------------------|:----:|------------------------------------------|
| `VALIDATION_ERROR`            | 400  | query sai format                         |
| `AI_USAGE_USER_NOT_FOUND`     | 404  | user_id không tồn tại                    |
| `FORBIDDEN`                   | 403  | không phải admin                         |
| `AI_QUOTA_EXCEEDED`           | 429  | (Beta) hard limit vượt — request bị block|

---

## 7. PII & Privacy

- **KHÔNG log prompt content** vào `ai_usage.meta` — quá nhạy cảm + chiếm DB. Nếu cần debug prompt, log riêng vào `ai_usage_debug` (TTL 7 ngày, admin-only access).
- `request_id` đủ để cross-ref tới logs ở observability stack.
- `meta.prompt_hash` (SHA-256 prompt) cho phép detect dup prompt mà không lưu nội dung.

---

## 8. Frontend integration

### 8.1. User detail tab "AI Usage"

Trong `src/components/modules/Admin/AdminUserDetailPage.tsx` (chưa làm) — thêm tab thứ N:

```tsx
const summary = await rexerApi.adminAiUsage.userSummary(userId, {
  from, to, group_by: 'day',
});
```

UI:
- **Card top-left**: total tokens 30 ngày + sparkline.
- **Card top-right**: total cost USD + so với tháng trước.
- **Quota progress bar** (placeholder "Unlimited" trong Alpha).
- **Bar chart** time series.
- **Table top features** + top models.
- **Recent requests** (paged).

### 8.2. Endpoints client (TS)

Bổ sung vào `src/services/rexer/endpoints.ts`:

```ts
adminAiUsage: {
  userSummary: (id: string, query?: AiUsageQuery) =>
    rx<AiUsageSummaryResponse>(`/admin/users/${id}/ai-usage`, { query }),
  globalSummary: (query?: AiUsageQuery) =>
    rx<AiUsageGlobalResponse>('/admin/ai-usage', { query }),
  list: (query?: AiUsageListQuery) =>
    rx<AiUsageListResponse>('/admin/ai-usage/list', { query }),
  exportCsv: async (query?: AiUsageListQuery): Promise<Blob> => {
    /* tương tự adminFeedback.exportCsv */
  },
},
```

Types: `AIUsage`, `AiUsageSummary`, `AiUsageBucket`, `AiUsageTopRow`, `AiUsageQuery`, `AiUsageListQuery`, các Response.

---

## 9. Phạm vi & Action items

### 9.1. Bao gồm Alpha

- Bảng `ai_usage` + index.
- Hook `withAIUsage` wrap 8 AI handler hiện có.
- 4 endpoint admin (4.1–4.4) + 1 endpoint self-view (4.5).
- FE tab "AI Usage" trong user detail page + page `/admin/ai-usage` global.
- Quota fields migrated (chưa enforce).

### 9.2. Hậu Alpha

- Hard quota enforcement.
- Anomaly detection (4.6).
- Async queue.
- Slack alert webhook.

### 9.3. Action items

| # | Hạng mục                                                       | Owner   | Trạng thái |
|---|----------------------------------------------------------------|:-------:|:----------:|
| 1 | BE: migration bảng `ai_usage` + indexes                        | BE      | ☐ |
| 2 | BE: cost config YAML + reload                                  | BE      | ☐ |
| 3 | BE: `withAIUsage` middleware + wire vào 8 AI handler hiện có   | BE      | ☐ |
| 4 | BE: 4 endpoint admin (4.1–4.4) + self-view `/me/ai-usage` (4.5) | BE      | ☐ |
| 5 | BE: migration thêm 4 cột quota lên `users` (default NULL)      | BE      | ☐ |
| 6 | FE: types + `adminAiUsage.*` trong `endpoints.ts`              | FE      | ☐ |
| 7 | FE: tab "AI Usage" trong user detail page                      | FE      | ☐ |
| 8 | DevOps: cấu hình giá model thật (không dùng giá mẫu)           | DevOps  | ☐ |
| 9 | QA: test plan (log success/error/timeout, cost match, export)  | QA      | ☐ |

---

## 10. References

- AI endpoints hiện có: `src/services/rexer/endpoints.ts` block `ai` (line ~363)
- Spec gốc Alpha: `docs/be-alpha-spec.md`
- Anthropic pricing: <https://www.anthropic.com/pricing>
- OpenAI pricing: <https://openai.com/api/pricing/>
- LangSmith (tham khảo, không dùng Alpha): <https://docs.smith.langchain.com/>
