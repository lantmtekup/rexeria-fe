# AI dựng landing từ khuôn — logic và luật đang chạy

Tài liệu này mô tả **chính xác** những gì AI được phép và không được phép làm khi
tính năng "Từ template" (AI-Insights) dựng một landing mới từ một landing có sẵn.

Nguồn: đọc trực tiếp `be-ReXeR.ai` nhánh `fix/insight-content-quality`. Mọi tham
chiếu `file:dòng` bên dưới đều là code thật, không phải mô tả mong muốn.

---

## 1. Toàn cảnh — hai chặng

```
CHẶNG 1 — "Tạo nội dung"                    ~1–3 phút
  POST /insights/reports          brief + ảnh  → report
  poll GET /insights/reports/{id}              → succeeded
  POST /insights/reports/{id}/handoff
       template.source_template_id = khuôn
       publish: false                          → TEMPLATE mới, AI đã viết xong
  đọc canvas template đó                       → đổ vào checklist để soát

CHẶNG 2 — "Tạo trang"                       ~vài giây
  POST /workspaces/{ws}/pages     template_id  → page
  POST /pages/{id}/config         canvas đã ghi đè phần người dùng sửa
  POST /pages/{id}/publish                     → /p/{slug}
```

Handoff **dừng được ở template** vì nhánh tạo page của nó chỉ chạy khi
`publish: true` (`internal/usecase/insight.go:458`). Nhờ vậy mới có bản nháp để
soát mà chưa có gì công khai.

**Không dùng `block_contents` của handoff** để nhận nội dung người dùng nhập:
`applyProvidedContent` (`insight.go:835`) đặt `blk["content"]`, mà
`fillBlockContent` **bỏ qua nguyên block** nếu key đó tồn tại (`insight.go:904`).
Điền 2/5 ô sẽ khiến 3 ô còn lại giữ nguyên chữ của khuôn. Vì thế FE ghi đè **sau
khi** AI viết xong, khớp theo `id` instance nên hai block cùng loại không lẫn.

---

## 2. AI được ghi vào đâu

`cloneTemplateBlocks` (`insight.go:790`) sao chép canvas của **current version**
của khuôn, giữ nguyên mọi key kể cả `id` từng block. Sau đó `fillBlockContent`
(`insight.go:889`) lặp **từng block** và gọi LLM một lần cho mỗi block.

Schema mà model phải tuân được **suy ra từ chính nội dung khuôn đang có**, không
phải từ `props_schema` khai báo tay:

```
contentSchemaFromInstance()   insight_block_schema.go:174
  └─ localeContent(blk)       → contentVi.desktop, fallback contentEn.desktop
  └─ với mỗi key → fieldSchema()
```

Thứ tự dò schema, từ giàu ngữ cảnh nhất xuống (`insight.go:918-930`):

1. nội dung seed của chính instance (mang sẵn trường media → gắn được enum ảnh)
2. bản đăng ký system theo `type_code` (cứu block catalog trần)
3. `props_schema` của brand block (chỉ định hình chữ, không có media)

Không tìm được schema nào → **bỏ qua block đó**, giữ nguyên chữ của khuôn.

---

## 3. Luật phân loại trường

Áp theo thứ tự này, dừng ở luật đầu tiên khớp (`insight_block_schema.go:26-66`,
`:49`):

| # | loại | nhận biết | AI được làm gì |
|---|---|---|---|
| 1 | **ảnh / video** | key kết thúc `url, src, image, photo, img, icon, logo`; **hoặc** giá trị chứa `.jpg .jpeg .png .webp .avif .svg .gif .mp4 .webm`; **hoặc** giá trị bắt đầu `http://` `https://` | **chỉ chọn trong enum đóng** |
| 2 | **link** | key kết thúc `href, link, route, path, anchor, slug, target`; **hoặc** giá trị bắt đầu `#` `mailto:` `tel:` | **không được đụng** |
| 3 | **định danh** | key kết thúc `id, key, code` | **không được đụng** |
| 4 | **chữ** | còn lại, kiểu string | viết lại, có ngân sách độ dài |

Media xét **trước** link để đường dẫn ảnh không bị nhận nhầm thành link.

Chỉ mở ra cho AI: `string`, `[]string`, và `[]object` mà mọi member là string.
Số, boolean, object lồng nhau là **layout/config** — cho model sửa là vỡ giao
diện chứ không phải cải thiện nội dung (`insight_block_schema.go:166`).

Trong mảng lặp, link và định danh không bỏ hẳn được (strict mode buộc mọi
property phải `required`), nên bị **ghim bằng enum một giá trị** —
`{"enum": ["giá trị gốc"]}`.

---

## 4. Luật ảnh — enum đóng, không có ngoại lệ

Đây là ràng buộc **cứng nhất** trong cả hệ thống.

```
collectMediaPool()   insight_block_schema.go:92
  ảnh trong brief người dùng   ← xếp TRƯỚC
  + mọi ảnh đang có trên canvas
  → khử trùng lặp

mediaEnum(current, pool, brief)   :284
  → enum = [ảnh brief…, ảnh hiện tại của ô, phần còn lại của pool]
```

Model **không thể** trả về một URL ngoài danh sách — đó là `enum` trong JSON
schema, structured output cưỡng chế được.

Lý do (`insight_block_schema.go:86-91`): provider hiện tại chỉ sinh văn bản, sinh
ảnh vẫn là stub. Model nếu được tự do "cập nhật ảnh" sẽ bịa URL trông rất hợp lý
và render ra ảnh vỡ.

**Ảnh brief đọc ở key `media`, `media_urls`, `images`** — ở gốc `inputs` hoặc
dưới `inputs.manual` (`briefMedia`, `:122`). **KHÔNG đọc `image_urls`.**

`rotate(briefMedia, i)` (`:230`) xoay danh sách theo vị trí trường, để 3 ảnh
không bị dồn cả 3 vào cùng một chỗ mà rải ra khắp trang.

---

## 5. Luật chữ — ngân sách độ dài

Thêm ở commit `ecb2933`.

```
lengthBudget(chữ gốc)  =  max(16, số ký tự × 1.5)
```

Chữ khuôn là **tín hiệu duy nhất** về vai trò của trường: `ctaText` 7 ký tự là
nhãn nút, `quote` 128 ký tự là đoạn văn. Nhân 1.5 vì tiếng Việt dài hơn nguồn
tiếng Anh; sàn 16 để nhãn ngắn không bị bóp thành vô nghĩa.

Ngân sách đặt vào **`description`**, **không phải `maxLength`**:

> Schema này `strict` (`additionalProperties: false`, `strictSchema` `:294`), mà
> strict structured outputs của OpenAI **từ chối keyword không hỗ trợ**. Nặng
> hơn, provider bật `require_parameters: true` trên OpenRouter
> (`internal/ai/provider/openai.go:114`) đúng để không degrade âm thầm — nên một
> keyword lạ sẽ biến **mọi** lời gọi thành lỗi. `description` được hỗ trợ và
> model có đọc.

Vì `description` là gợi ý chứ không cưỡng chế, có thêm **một vòng kiểm lại**
(`insight.go`, sau khi sinh): `overBudget()` liệt kê trường vượt hạn mức, gọi lại
đúng một lần với `_too_long` trong context. Vẫn vượt thì **vẫn ghi xuống** — chữ
hơi dài còn dùng được, bỏ trống thì renderer dựng ra khối trắng.

Số đo trước khi có luật này:

| khuôn | trung vị | vượt 1.5× | tệ nhất |
|---|---|---|---|
| the-cool-hunter-v4 | 1.19× | 14/34 | `title` 15→57 (3.8×) |
| mint-2026 | 1.78× | 22/34 | `subLabel` 18→79 (4.4×) |

---

## 6. Ngữ cảnh mỗi lần gọi

Mỗi block được gọi riêng, kèm `_placement` (`placementContext`, `insight.go:1102`):

| khoá | nội dung | dùng để |
|---|---|---|
| `block_position` | `"3/7"` | biết mình đứng đâu trong trang |
| `stage_key` | giai đoạn hành trình | viết cho ĐÚNG giai đoạn đó |
| `stage_rationale` | lý do giai đoạn | — |
| `why_this_block` | lý do chọn block | — |
| `already_used_copy` | tiêu đề/CTA các block TRƯỚC đã dùng | **không lặp lại** |

`already_used_copy` gom từ `usedCopy.absorb` (`insight.go:1073`), chỉ lấy các
trường: `title, eyebrow, tag, subtitle, ctaText, primaryText, secondaryText`.

System prompt (`internal/insight/interactive.go:141-146`) nói rõ với model:
`_placement` là **lệnh của hệ thống, không phải một phần brief của người dùng**;
mỗi block phải có góc nhìn, tiêu đề và CTA riêng; nếu giai đoạn đã được block
trước phủ thì phải đi sâu vào một chi tiết hẹp hơn thay vì tóm tắt lại cả trang;
và **không được trả chuỗi rỗng**.

Ảnh **không** đi qua `_placement` — chúng bị ràng ở tầng schema, chặt hơn nhiều.

---

## 7. Kiểm chất lượng và thử lại

Hai vòng kiểm, độc lập nhau:

**a. `contentUnusable`** (`insight.go:1051`) — nội dung rỗng hoặc `title`/
`headline` quá ngắn / là rác. Gặp thì gọi lại **bỏ ràng buộc "đừng lặp"**, vì ép
quá chặt khiến model thà trả object đúng schema nhưng rỗng còn hơn trùng — quan
sát thật: một block trả mọi field là `""`, một block khác trả title `"x"`.

**b. `overBudget`** — vượt ngân sách độ dài, gọi lại kèm `_too_long`.

Sau các vòng đó vẫn hỏng → **bỏ qua block, giữ nguyên chữ khuôn** và ghi log
warning. Không bao giờ ghi nội dung rỗng xuống canvas.

---

## 8. Tóm tắt: AI KHÔNG được làm gì

- Không bịa URL ảnh — chỉ chọn trong enum đóng
- Không sửa link điều hướng (`href`, `route`, `mailto:`, `tel:`…)
- Không sửa định danh (`id`, `key`, `code`)
- Không sửa số, boolean, object lồng — tức không đụng layout
- Không thêm/bớt/đổi thứ tự block — bố cục khuôn giữ nguyên 100%
- Không đụng page gốc — luôn tạo template + page mới

---

## 9. Người dùng ghi đè ở đâu

FE `applyOverrides` (`src/components/modules/Insights/intake/checklistModel.ts`)
chạy **sau khi** AI viết xong, ghi thẳng vào canvas của page:

- khớp theo **`id` instance** của block → hai block cùng `type_code` không lẫn
- ghi vào **cả `contentVi` lẫn `contentEn`** `.desktop`, giống `mergeLocaleContent`
  của BE (`insight.go:629`) — renderer đọc theo ngôn ngữ đang xem
- chỉ ghi ô có giá trị; ô để trống giữ nguyên chữ AI
- làm trên **JSON thô**, không qua `parseCanvas/serialize` (hàm đó làm rụng
  field, đã xác nhận nó bỏ `block_id`)

Vá vào **page_revision** chứ không vào template: BE `Publish()` luôn ưu tiên
revision mới nhất của page hơn template version khi revision đó đã có block — mà
nó luôn có, vì được seed lúc tạo page (xem chú thích cùng nội dung ở
`CanvasTemplate/BlockEditor.tsx:1213`).

---

## 10. Giới hạn đã biết

| giới hạn | hệ quả | chữa được chưa |
|---|---|---|
| Ảnh chỉ được chọn, không sinh mới | 11 ô ảnh mà brief có 3 ảnh → lặp | nút "Gán ảnh tự động" rải xoay vòng |
| Không kiểm tỉ lệ ảnh | ảnh vuông 1:1 vào khung 16:9 bị `object-cover` cắt | chưa — phải chọn khuôn hợp loại ảnh |
| Chỉ ghi được vào trường đã có trong khuôn | khuôn không có ô giá thì giá không lên trang | chưa — chọn khuôn có block thông số |
| `description` không cưỡng chế được độ dài | vẫn có thể vượt sau 1 vòng retry | một phần |
| Handoff đồng bộ, không idempotent | gateway cắt giữa chừng vẫn có thể đã tạo template | chưa — cần idempotency key |
| Không kiểm quyền cross-brand | report brand A clone được template brand B | chưa — cần báo BE |
