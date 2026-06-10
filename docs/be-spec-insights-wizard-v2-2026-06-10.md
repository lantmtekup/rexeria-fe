# BE spec — AI-Insights Wizard v2 (interactive, human-in-the-loop)

> Gửi team BE. FE: branch `feat/insights-wizard-v2`. Nguồn chân lý contract vẫn là
> `be-ReXeR.ai/docs/openapi.yaml` — doc này đề xuất phần **bổ sung**, không phá vỡ
> 3 endpoint hiện có (`prefill`, `reports`, `reports/{id}`).

## 0. Bối cảnh & vì sao

Flow hiện tại: user chọn workspace/product/campaign → `prefill` trả `missing_fields`
→ `create` enqueue **1 job chạy cả 5 bước** (understand → classify_goal → journey →
blocks → templates) server-side → FE poll → blueprint. Goal & journey **chỉ xuất hiện
ở kết quả cuối**, user không can thiệp được.

Wizard v2 (theo mockup sản phẩm) đổi sang **human-in-the-loop**: user nhập brief
nhiều bước, rồi **xác nhận/sửa Experience Goal và Customer Journey TRƯỚC khi** job
dựng blocks/templates. Mỗi bước có **gợi ý lũy tiến** dựa trên các bước trước.

→ Cần BE mở 3 thao tác **đồng bộ, nhẹ** (không enqueue job nặng) + cho `create`
nhận lựa chọn người dùng đã chốt. **FE đã có lớp heuristic client tạm thời**; khi
các endpoint dưới đây sẵn sàng, FE thay heuristic bằng call thật, UI không đổi.

## 1. Tóm tắt thay đổi

| # | Thay đổi | Loại | Ưu tiên |
|---|---|---|---|
| 1 | Chuẩn hoá schema **brief** (`InsightBrief`) cho `inputs` | Không phá vỡ (inputs vẫn `additionalProperties`) | Cao |
| 2 | `POST /v1/insights/suggest` — gợi ý field lũy tiến | Mới | Cao |
| 3 | `POST /v1/insights/classify-goal` — xếp hạng Experience Goal | Mới | Cao |
| 4 | `POST /v1/insights/suggest-journey` — đề xuất Journey theo goal | Mới | Cao |
| 5 | `create`: thêm `selections` (goal/journey user đã chốt) | Bổ sung field optional | Cao |
| 6 | `create`/`prefill`: cho phép **brand-only** (workspace optional) | Nới ràng buộc | Trung |

Tất cả endpoint mới: `cookieAuth`, **tenant-scoped trên brand** (đồng nhất với
3 endpoint cũ), **đồng bộ** (không tạo `ai_job`, không tính cost_credits như report).
Mục tiêu p95 < 4s/endpoint (đây là call tương tác trong lúc user điền form).

---

## 2. Schema `InsightBrief` (chuẩn hoá `inputs`)

FE v2 thu thập brief có cấu trúc thay vì map field rời. Nhồi nguyên object này vào
`inputs` của `create` (vẫn hợp lệ với schema hiện tại). Đề nghị BE **đọc các khoá
sau** khi resolve context (ngoài context DB từ prefill):

```yaml
InsightBrief:
  type: object
  properties:
    brand:
      type: object
      properties:
        name:            { type: string }
        positioning:     { type: string }
        tone:            { type: array, items: { type: string } }   # vd ["Sang trọng","Tin cậy"]
        visual_identity: { type: string }
    product:
      type: object
      properties:
        features:  { type: array, items: { type: string } }
        benefits:  { type: string }
        pricing:   { type: string }
        use_cases: { type: string }
    objective:
      type: object
      properties:
        campaign_objectives: { type: array, items: { type: string } } # Nhận biết|Giáo dục|Thu lead|Chuyển đổi|Ra mắt
    audience:
      type: object
      properties:
        persona:     { type: string }
        age_range:   { type: string }
        behaviours:  { type: string }
        pain_points: { type: array, items: { type: string } }
        motivations: { type: string }
        device:      { type: string, enum: [mobile, desktop, both] }
    market:
      type: object
      properties:
        competitors:  { type: string }
        trends:       { type: string }
        expectations: { type: string }
    assets:
      type: object
      properties:
        items: { type: array, items: { type: string } }   # tên/URL media đã có
    challenges:
      type: array
      items: { type: string }    # Chuyển đổi thấp|Giá trị chưa rõ|Tương tác yếu|Chu kỳ bán dài
```

> BE không bắt buộc validate cứng schema này (giữ `additionalProperties: true`), nhưng
> nên dùng các khoá trên làm tín hiệu cho prompt classify_goal/journey để chất lượng
> tốt hơn. Đặc biệt `audience.pain_points` quyết định stage "Risk Reducer", và
> `brand.tone`/`objective` ảnh hưởng phân loại goal.

---

## 3. `POST /v1/insights/suggest` — gợi ý lũy tiến (đồng bộ)

Dùng cho callout "AI gợi ý" ở mỗi bước. Nhận brief **đang điền dở** + bước hiện tại,
trả về 1 gợi ý ngắn + (tuỳ chọn) giá trị đề xuất để prefill.

**Request** `InsightSuggestRequest`:
```yaml
type: object
required: [step]
properties:
  workspace_id: { type: string, format: uuid }   # optional — xem §6
  product_id:   { type: string, format: uuid }
  campaign_id:  { type: string, format: uuid }
  step:
    type: string
    enum: [product, objective, audience, market, assets, challenges]
  brief: { $ref: '#/components/schemas/InsightBrief' }   # phần đã điền tới hiện tại
```

**Response** `InsightSuggestResponse`:
```yaml
type: object
required: [suggestion]
properties:
  suggestion:
    type: object
    required: [text]
    properties:
      text:       { type: string }                 # 1–2 câu, hiển thị trong callout
      based_on:   { type: array, items: { type: string } }  # vd ["Sản phẩm","Mục tiêu"]
      values:                                       # optional — đề xuất prefill cho field của step
        type: object
        additionalProperties: true                  # vd {"campaign_objectives":["Thu lead"]}
```

Ví dụ: step=`objective`, brief có product BĐS cao cấp → `text`: "BĐS giá trị cao, chu
kỳ quyết định dài → mục tiêu phù hợp nhất là Thu lead.", `values`:
`{"campaign_objectives":["Thu lead"]}`.

---

## 4. `POST /v1/insights/classify-goal` — xếp hạng Experience Goal (đồng bộ)

Đẩy bước `classify_goal` ra **trước** để user xác nhận. Trả về **toàn bộ** goal xếp
theo điểm (không chỉ top-1) để FE render dạng card + badge %.

**Request** `ClassifyGoalRequest`:
```yaml
type: object
properties:
  workspace_id: { type: string, format: uuid }   # optional — §6
  product_id:   { type: string, format: uuid }
  campaign_id:  { type: string, format: uuid }
  brief: { $ref: '#/components/schemas/InsightBrief' }
```

**Response** `ClassifyGoalResponse`:
```yaml
type: object
required: [goals]
properties:
  goals:
    type: array
    items:
      type: object
      required: [goal, confidence]
      properties:
        goal:       { type: string, enum: [product_discovery, interactive_story, comparison, lead_excitement, brand_storytelling, guided_decision] }
        confidence: { type: number, minimum: 0, maximum: 1 }   # đã normalize
        rationale:  { type: string }
        rank:       { type: string, enum: [primary, secondary, other] }
```

> Enum goal giữ **đúng** `#/components/schemas` hiện có. FE hiển thị card; goal có
> `rank=primary` gắn badge "%", `secondary` gắn nhãn "phụ".

---

## 5. `POST /v1/insights/suggest-journey` — đề xuất Journey theo goal (đồng bộ)

Sau khi user chốt goal, đề xuất journey pattern theo ngành + stages **sửa được**.

**Request** `SuggestJourneyRequest`:
```yaml
type: object
required: [primary_goal]
properties:
  workspace_id:   { type: string, format: uuid }   # optional — §6
  product_id:     { type: string, format: uuid }
  campaign_id:    { type: string, format: uuid }
  primary_goal:   { type: string, enum: [product_discovery, interactive_story, comparison, lead_excitement, brand_storytelling, guided_decision] }
  secondary_goal: { type: string, nullable: true }
  brief: { $ref: '#/components/schemas/InsightBrief' }
```

**Response** `SuggestJourneyResponse` (tái dùng `InsightBlueprintJourney` đang có):
```yaml
type: object
required: [journey]
properties:
  journey: { $ref: '#/components/schemas/InsightBlueprintJourney' }
  industry_pattern:
    type: object
    properties:
      name:   { type: string }                 # vd "REAL ESTATE"
      stages: { type: array, items: { type: string } }  # vd ["Vision","Location","Lifestyle","Investment Value","Inquiry"]
```

> `journey.stages[]` dùng đúng `InsightJourneyStage {key,name,intent,rationale}`. FE
> cho sửa `name` từng stage.

---

## 6. Thay đổi `POST /v1/insights/reports` (create)

Thêm **field optional `selections`** để job tôn trọng goal/journey user đã chốt,
thay vì tự classify lại từ đầu.

```yaml
# bổ sung vào CreateInsightReportRequest:
selections:
  type: object
  description: Lựa chọn user đã xác nhận trong wizard; job dùng làm input cố định thay vì tự sinh.
  properties:
    experience_goal:
      type: object
      properties:
        primary_goal:   { type: string, enum: [...] }
        secondary_goal: { type: string, nullable: true }
    customer_journey:
      $ref: '#/components/schemas/InsightBlueprintJourney'
```

**Hành vi mong muốn của job khi có `selections`:**
- `classify_goal`: **skip** (dùng `selections.experience_goal`), step trace = `skipped`.
- `recommend_journey`: **skip** (dùng `selections.customer_journey`), trace = `skipped`.
- Vẫn chạy `understand_context`, `recommend_blocks`, `recommend_templates` bám theo
  goal/journey đã chốt.
- Nếu **không** có `selections` → giữ nguyên hành vi cũ (chạy đủ 5 bước). **Backward
  compatible tuyệt đối.**

> Đây là lý do các step v1 đã có status `skipped` — khớp sẵn, không cần đổi schema step.

### 6.1 Nới ràng buộc workspace (optional, ưu tiên Trung)

Wizard v2 (portal) có thể chạy ở chế độ **manual brief** không gắn product/campaign.
`create`/`prefill` hiện `required: [workspace_id]`. Đề nghị:
- Cho phép tạo report **brand-only**: nếu thiếu `workspace_id` nhưng principal có
  brand xác định (portal user) → BE resolve brand từ session, `workspace_id` nullable.
- Admin (platform) vẫn phải truyền `workspace_id` (không có brand mặc định).

Nếu chưa làm kịp, FE tạm giữ selector workspace (portal auto-pick workspace mặc định).

---

## 7. Backward compatibility & rollout

- 3 endpoint cũ **không đổi signature**. `inputs` vẫn nhận brief (additionalProperties).
- `selections` optional → client cũ không gửi vẫn chạy đúng.
- FE bật dần: có feature flag `insightsV2`; khi 3 endpoint mới live, FE gỡ heuristic
  client. Trước đó FE vẫn create được (brief trong `inputs`, goal/journey chốt bằng
  heuristic được copy vào `selections` — job có thể bỏ qua nếu chưa đọc `selections`).
- Đề nghị BE trả `501`/`404` rõ ràng nếu endpoint mới chưa deploy để FE fallback sạch.

## 8. Checklist cho BE
- [ ] Thêm schema `InsightBrief`, `InsightSuggest*`, `ClassifyGoal*`, `SuggestJourney*`.
- [ ] `POST /v1/insights/suggest` (đồng bộ, tenant-scoped, p95<4s).
- [ ] `POST /v1/insights/classify-goal` (trả toàn bộ goal + confidence normalize).
- [ ] `POST /v1/insights/suggest-journey` (tái dùng InsightBlueprintJourney).
- [ ] `create`: đọc `selections`, skip classify_goal/journey tương ứng.
- [ ] (tuỳ) workspace optional cho portal brand-only.
- [ ] Cập nhật `docs/openapi.yaml` + `docs/swagger.yaml`.

## 9. FE đang làm song song (Phase A, không chờ BE)
- Wizard nhiều bước (brief 7 bước → goal → journey → review) trong `inputs`.
- Lớp **heuristic client** thay tạm 3 endpoint trên (gắn nhãn "gợi ý dẫn hướng",
  KHÔNG mạo nhận AI). Khi BE live → thay bằng call thật.
- `create` gửi kèm `selections` (BE bỏ qua an toàn nếu chưa đọc).
