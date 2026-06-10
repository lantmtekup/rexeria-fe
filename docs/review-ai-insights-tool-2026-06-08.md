# Phân tích & phản hồi spec — Tool nội bộ "Quản lý dữ liệu & Đánh giá AI-INSIGHTS"

**Ngày:** 2026-06-08 · **Soạn:** FE/Tech review · **Gửi:** team BE + AI
**Đối tượng:** đánh giá spec MVP v1.0 + đối chiếu với dự án ReXeR hiện tại + đề xuất
kiến trúc/triển khai + câu hỏi cần chốt.

> TL;DR: Spec **tốt cho 1 eval harness R&D**, phạm vi MVP hợp lý. Nhưng phần "lõi"
> (công thức tính điểm + định nghĩa metric biên + chọn embedding model) đang **chưa
> đủ chặt để reproduce/test** — cần chốt trước khi code. Về dữ liệu: ReXeR hiện
> **CHƯA có** embeddings/pgvector/brand-brief/fit-fields/eval — tool gần như
> **net-new**, NHƯNG nên (a) tái dùng hạ tầng AI-job + LLM provider sẵn có, (b)
> align với endpoint `ai.templateSuggest` đang stub để sau này production hoá.

---

## 1. Đánh giá tổng quan spec

**Điểm tốt:**
- Phạm vi MVP rõ, tách "ngoài phạm vi" (§10) hợp lý.
- Có cả metric tự động + chấm tay → đúng tinh thần đánh giá recommender khi
  ground-truth nhiễu.
- Vòng "chấm Đúng → bổ sung expected" (§4.4b) là pattern active-learning hợp lý.

**Thiếu/rủi ro (phải chốt trước khi code):**
1. **Công thức tính điểm chưa định nghĩa** (§4.3 b4 "lọc/cộng điểm theo industry_fit
   và goal_fit"). Đây là **lõi engine** — không có công thức rõ thì không reproduce,
   không unit-test, không so sánh phiên bản được. → xem §4.2 đề xuất.
2. **Embedding model chưa chốt** (model nào, số chiều, đa ngôn ngữ?). Brief/tone
   tiếng Việt → cần model multilingual. Số chiều quyết định cột `vector(N)`.
3. **Metric biên chưa xử lý** (Recall khi |E|>K, Precision khi |E|<K, MRR khi không
   hit, chia 0). → §3.
4. **Ground-truth tiến hoá gây lệch khi so sánh phiên bản engine** (§4.4b bổ sung
   expected sau mỗi lần chấm) → data leakage giữa các version. → §3.4.
5. **Chuẩn hoá/normalize vector + ngôn ngữ brief** chưa nêu.
6. **Stack lệch repo chính** (FastAPI/Python vs BE Go hiện tại) — ok cho tool nội
   bộ, nhưng ảnh hưởng đường "production hoá engine" sau này. → §5.

---

## 2. Đối chiếu với dự án ReXeR hiện tại (EXISTS vs NET-NEW)

| Hạng mục | ReXeR đã có | Cho tool này |
|---|---|---|
| **Hạ tầng AI job (async)** | ✅ `/v1/ai/template-draft, slot-suggest, page-optimize, image-generate` + poll `/ai/jobs/:id`; bảng `ai_jobs` (status queued/running/succeeded/failed, tokens, cost) — `handler/ai_job.go`, `models/ai_job.go` | **TÁI DÙNG** pattern job + tracking cost/token |
| **LLM provider** | ✅ BE có cấu hình OpenAI-compatible endpoint (`.env.example`) | **TÁI DÙNG** để gọi **embedding API** (cùng provider) |
| **`ai.templateSuggest`** (product_id→candidates `{template_id, score, reason}`) | ⚠️ Có **type/endpoint ở FE** (`types.ts:1065` AITemplateCandidate) nhưng **CHƯA mount ở BE** (stub) | **ALIGN**: tool chính là bản R&D của engine này; sau khi validate → đây thành backend thật của templateSuggest |
| **Embeddings / pgvector / cosine** | ❌ KHÔNG có (0 cột vector, 0 pgvector, 0 cosine ở BE) | **NET-NEW** |
| **Block catalog** | ✅ `block_types` (code, name, category, props_schema, supported_surfaces, slot_types…) — `models/block_type.go`; `blocks` (type_code, tags[], scope, usage_count) — `models/block.go` | **NET-NEW fields**: `industry_fit[], goal_fit[], style_tags[], tone[], embedding_text, embedding`. Có thể **seed** từ block_types.code |
| **Brand / brief** | ✅ Brand chỉ có `industry` (text). ❌ KHÔNG có brand-brief (positioning, key_messages, customer_segments, tone, campaign_objective) | **NET-NEW** entity brief |
| **Product** | ✅ `description, features[], tags[], category_id, colors, sizes` — `models/product.go` (không embedding) | Có thể tham chiếu làm input brief, nhưng không bắt buộc cho v1 |
| **Template** | ✅ `category, tags[], target_page_type` (không industry/goal/tone/embedding) | NET-NEW nếu sau này rank template |
| **Eval harness (Precision/Recall/MRR/NDCG, A/B, runs)** | ❌ KHÔNG có gì | **NET-NEW toàn bộ** |

**Kết luận đối chiếu:** ~80% là net-new. Cái tái dùng được: **AI-job infra + LLM
provider config + shape `{score, reason}`**. Cái cần quyết định chiến lược: **tool
standalone (data riêng, import JSON) hay đọc block thật của production**.

---

## 3. Rà soát định nghĩa metrics (§5) — sửa cho chặt

Gọi R = top-K đề xuất, E = đáp án đúng.

| Metric | Spec | Vấn đề | Đề xuất |
|---|---|---|---|
| Precision@K | \|R∩E\|/K | Khi \|E\|<K, mẫu số K phạt oan (không thể đạt 1) | Bổ sung **Precision@\|E\|** hoặc dùng **AP** |
| Recall@K | \|R∩E\|/\|E\| | Khi \|E\|>K, trần Recall < 1 dù engine hoàn hảo | Ghi rõ caveat; cân nhắc Recall@(K≥\|E\|) |
| Hit Rate@K | 1 nếu có ≥1 hit | OK | giữ |
| MRR | 1/rank(hit đầu) | **Không hit → undefined** (chia 0) | Định nghĩa **= 0 khi không hit** |
| Tổng thể | TB từng metric | Macro-average — nhạy khi ít brief | Ghi rõ N brief + xem cả median |

**Đề xuất thêm:** **NDCG@K** (xếp hạng có trọng số vị trí) — chuẩn vàng cho ranking,
không tốn nhiều công. Và **Coverage** (bao nhiêu block từng được đề xuất) để phát
hiện engine "thiên vị".

### 3.4 Cảnh báo phương pháp luận (quan trọng)
§4.4b cho phép "chấm Đúng → bổ sung vào `expected_blocks_hint`". Nếu **dùng cùng
brief để so sánh engine v1 vs v2** mà E đã được bồi đắp giữa chừng → **không công
bằng** (E của v2 giàu hơn). → **Đề nghị:** version-hoá E (snapshot `expected` tại
thời điểm run, lưu trong `runs`), và khi báo "độ chính xác tổng thể qua các phiên
bản" thì cố định 1 bộ E chuẩn (golden set) tách khỏi vòng active-learning.

### 3.5 Worked example để unit-test (đáp ứng §9 "tính tay 1 ví dụ")
K=5, E = {B2, B7, B9} (|E|=3). Engine trả R (rank 1→5) = [B5, **B7**, B1, **B2**, B8].
- Hit ở R: B7 (rank2), B2 (rank4) → \|R∩E\|=2.
- Precision@5 = 2/5 = **0.40**
- Recall@5 = 2/3 = **0.667**
- HitRate@5 = **1**
- MRR = 1/2 = **0.50** (hit đầu ở rank 2)
- (NDCG@5 nếu thêm: DCG = 1/log2(2+1)+1/log2(4+1)=0.6309+0.4307=1.0616; IDCG (3 hit ở
  rank1-3)=1/log2(2)+1/log2(3)+1/log2(4)=1+0.6309+0.5=2.1309 → NDCG=**0.498**)
> BE dùng đúng ví dụ này làm test fixture.

---

## 4. Phần lõi cần chốt: embedding + công thức điểm

### 4.1 Embedding
- **Model:** chốt 1 model multilingual (brief/tone tiếng Việt). Gợi ý
  `text-embedding-3-small` (1536d, rẻ, đa ngôn ngữ ổn) hoặc `-3-large` (3072d) nếu
  cần chất lượng. → cột `vector(1536)`.
- **Chuẩn hoá:** normalize L2 rồi cosine (hoặc dùng `<=>` cosine distance của
  pgvector). Lưu cả `embedding_model` + `embedding_dim` trên mỗi row để biết khi
  nào phải re-embed (đổi model).
- **Brief embedding:** tính lúc run từ chuỗi ghép (§4.3 b1); **cache theo hash** của
  chuỗi để run lại cùng brief không gọi API lại.

### 4.2 Công thức điểm — ĐỀ XUẤT cụ thể (cần team AI chốt)
```
sim          = cosine(emb_brief, emb_block)            # 0..1 (sau normalize)
ind_match    = 1 nếu brief.industry ∈ block.industry_fit else 0   (hoặc Jaccard nếu brief đa industry)
goal_match   = overlap(brief.campaign_objective, block.goal_fit)  # 0..1
score        = w_sim*sim + w_ind*ind_match + w_goal*goal_match     # rồi clamp/normalize 0..1
mặc định: w_sim=0.6, w_ind=0.2, w_goal=0.2
```
- **Lọc cứng vs cộng mềm:** quyết định industry_fit là **hard filter** (loại block
  sai ngành) hay **soft bonus**. Đề xuất: soft (cộng điểm) cho MVP để không loại oan,
  nhưng cho cấu hình bật "strict industry".
- **Lưu breakdown** (sim, ind_match, goal_match) trong `runs.results[]` để debug +
  giải thích (giống `reason` của templateSuggest).
- Weights **lưu vào `runs`** (snapshot) để biết run nào dùng tham số gì (tiền đề A/B
  ở §10).

---

## 5. Kiến trúc đề xuất (cho BE + AI)

### 5.1 Stack & vị trí
- Spec đề xuất **Python + FastAPI** — hợp lý cho R&D (hệ sinh thái embedding/eval).
  Nhưng **BE chính là Go**. → 2 lựa chọn:
  - **(A) Service Python riêng** (khuyến nghị cho MVP): nhanh dựng, độc lập, không
    đụng BE production. Dùng chung Postgres (schema riêng `ai_insights`).
  - **(B) Làm trong BE Go**: Go gọi embedding API qua HTTP + pgvector. Tránh thêm
    service, nhưng chậm hơn để dựng + trộn vào codebase production.
  → **Đề nghị (A) cho v1**, thiết kế contract để (B)/production hoá sau (xem §5.4).

### 5.2 Lưu trữ (Postgres + pgvector)
```sql
-- blocks: §4.1 fields + 
embedding        vector(1536),
embedding_model  text,
embedding_text   text,
industry_fit     text[],  goal_fit text[],  style_tags text[],  tone text[],
content_schema   jsonb,
updated_at       timestamptz
-- briefs: §4.2 fields + updated_at, expected_blocks_hint text[]
-- runs:
id, brief_id, k int, weights jsonb, engine_version text,
expected_snapshot text[],          -- E tại thời điểm run (chống lệch §3.4)
results jsonb,                       -- [{block_id, score, rank, sim, ind, goal, manual_label}]
metrics jsonb,                       -- {precision, recall, hit_rate, mrr, ndcg}
created_at
```
Dữ liệu nhỏ → **không cần index ivfflat/hnsw** (brute-force cosine ổn); thêm sau khi
nhiều block.

### 5.3 Endpoints (FastAPI)
```
# Blocks
GET/POST/PUT/DELETE /blocks            (POST/PUT → tự sinh embedding nếu embedding_text đổi)
POST /blocks/import   /blocks/export   (JSON theo block_library.json)
# Briefs
GET/POST/PUT/DELETE /briefs
POST /briefs/import   /briefs/export   (brand_briefs.json)
PATCH /briefs/{id}/expected            (cập nhật expected_blocks_hint — §4.4b)
# Run + eval
POST /run            { brief_id, k, weights? } → { results[], metrics }
GET  /runs?brief_id=                    (lịch sử)
GET  /runs/{id}
PATCH /runs/{id}/labels                 (chấm Đúng/Sai/Tạm được)
GET  /metrics/summary                   (TB toàn bộ brief — §4.5)
```

### 5.4 Align với production ReXeR
- **Shape kết quả** dùng lại `{block_id, score, reason/breakdown}` ~ `AITemplateCandidate`
  để sau này gắn vào `ai.templateSuggest` (đang stub) mà không đổi FE contract nhiều.
- **Embedding**: dùng **cùng LLM provider** BE đang cấu hình (OpenAI-compatible) →
  thống nhất key/billing.
- **Block source**: cân nhắc **seed block library từ `block_types`/`blocks` thật**
  (map theo `code`) thay vì tạo bộ tách rời, để eval phản ánh production. Nếu v1 cần
  nhanh thì import JSON tách rời, nhưng **ghi nợ kỹ thuật**: 2 nguồn block sẽ phải
  đồng bộ.

---

## 6. Rủi ro & nợ kỹ thuật cần ghi nhận
1. **2 nguồn block** (tool JSON vs production block_types) → drift. Quyết sớm.
2. **Stack Python tách BE Go** → thêm 1 service để vận hành; nếu sau này muốn engine
   chạy trong luồng sản phẩm phải port sang Go (hoặc gọi service Python từ Go).
3. **Ground-truth nhỏ + nhiễu** → metric biến động mạnh; cần đủ brief (≥20-30) +
   golden set cố định để con số "tổng thể" có ý nghĩa.
4. **Chi phí embedding**: cache bắt buộc (block theo embedding_text hash, brief theo
   chuỗi-ghép hash) — spec đã nêu, nhấn mạnh.
5. **Đa ngôn ngữ**: nếu block mô tả tiếng Anh còn brief tiếng Việt → cosine giảm; nên
   thống nhất ngôn ngữ `embedding_text` hoặc dùng model đa ngữ mạnh.

---

## 7. Câu hỏi cần team BE/AI chốt
1. **Công thức điểm + weights** (§4.2): industry_fit là hard-filter hay soft-bonus?
   goal_fit so khớp kiểu gì (exact/overlap/embedding)? Weights mặc định?
2. **Embedding model** + số chiều + đa ngôn ngữ? Dùng provider nào (OpenAI-compatible
   BE đang có, hay riêng)?
3. **Stack**: service Python riêng (A) hay nhúng BE Go (B)? Postgres dùng chung hay riêng?
4. **Nguồn block**: import JSON tách rời (nhanh) hay seed từ `block_types` production?
5. **Golden set** để so sánh phiên bản engine — có tách khỏi vòng active-learning không?
6. **Metric bộ chuẩn**: có thêm NDCG/AP không, hay đúng 4 metric như spec?
7. **Quy mô dữ liệu** dự kiến (số block, số brief) — để quyết index vector.
8. **Sản phẩm hoá**: tool này có định hướng thành backend thật của `ai.templateSuggest`
   không? (ảnh hưởng lựa chọn §5.1/§5.4).

---

## 8. Đề xuất thứ tự triển khai (sprint)
1. **Hạ tầng**: Postgres + pgvector + bảng blocks/briefs/runs; import 2 JSON mẫu.
2. **Embedding service**: gọi API + cache; CRUD block/brief + auto re-embed.
3. **Engine**: ghép brief → embed → cosine + fit → rank (công thức §4.2, weights config).
4. **Eval tự động**: 4 metric (+NDCG) + worked-example test (§3.5).
5. **UI**: Blocks → Briefs → Run → History (4 màn §8 spec).
6. **Chấm tay + cập nhật expected** (§4.4b) + golden set.
7. **Metrics summary** + lưu lịch sử + snapshot E/weights/engine_version.

→ Mỗi mục acceptance bám §9 spec; bổ sung: **test metric bằng worked-example §3.5**
và **snapshot E trong runs (§3.4)** vào tiêu chí nghiệm thu.
