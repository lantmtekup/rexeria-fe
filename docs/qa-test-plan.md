# REXER — QA Test Plan (luồng đã DONE)

Tài liệu này mô tả các luồng đã hoàn thành ở FE để QA chạy test thủ công.
Mỗi mục có: **mục tiêu**, **tiền điều kiện**, **các bước**, **kết quả mong đợi**,
và **edge cases** cần kiểm. Khi tìm thấy bug, ghi lại ID test case + bước
xảy ra + screenshot.

> Trạng thái cập nhật: 2026-05-04. Chỉ liệt kê luồng đã được verify bằng
> Playwright hoặc test thủ công sau code review.

---

## 0. Chuẩn bị môi trường

| Hạng mục | Giá trị |
|---|---|
| FE URL | `http://localhost:3003` (dev) |
| BE URL | đã proxy qua `/api/rexer/*` |
| Browser | Chrome / Edge mới nhất + Safari iOS (mobile flow) |
| Tài khoản test | `admin@rexer.ai` (mật khẩu seeded BE) |
| Viewport desktop | 1440 × 900 |
| Viewport mobile | 375 × 812 (iPhone 13 mini) |

**Lưu ý chung**
- Tất cả các API gọi BE qua cookie `auth-token`. Khi gặp 401 ở giữa luồng
  → đăng nhập lại.
- Một số trang fallback sang **mock data** khi BE down/401 — phân biệt rõ
  bằng nội dung (vd. trên `/home` các template tên *Delvaux / Lider /
  Beuter* là mock; `Hero Banner / Acme Summer Launch` là real).
- Có sẵn các script Playwright đối chiếu trong `scripts/visual-tests/`
  (xem mục 11). Khi nghi ngờ flaky, chạy lại script tương ứng.

---

## 1. Đăng nhập (Sign-in)

**Route:** `/sign-in`

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| AUTH-01 | Mở `/sign-in` | Form Email + Password hiện ra. Nút Submit ở dưới. |
| AUTH-02 | Bỏ trống cả hai field, bấm Submit | Validation error inline (Email/Password is required). |
| AUTH-03 | Nhập email sai format `abc@` → Submit | Error inline báo email không hợp lệ. |
| AUTH-04 | Nhập đúng email + sai password | Toast / banner "Invalid credentials". KHÔNG redirect. |
| AUTH-05 | Nhập đúng credential `admin@rexer.ai` + password → Submit | Redirect tới `/home`. Tên user hiện trong sidebar (`ReXeR Admin`). |
| AUTH-06 | Đã login mà mở `/sign-in` | Redirect tự động sang `/home` (middleware). |
| AUTH-07 | Logout từ sidebar (click avatar → Logout) | Quay về `/sign-in`. Reload page → vẫn ở `/sign-in`. |

**Edge cases**
- Refresh giữa luồng login → cookie phải còn, không bị log-out.
- Token hết hạn → API trả 401 → FE phải redirect về `/sign-in` (không treo).

---

## 2. Trang chủ (Home)

**Route:** `/home`

### 2.1. Header + Dashboard

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| HOME-01 | Mở `/home` | Greeting `Hi, <display_name> 👋`. Email user ở góc phải. |
| HOME-02 | Quan sát 6 ô metrics | Hiện `Projects / Published / Active clients / Page views / CTA clicks / CTR`. Loading state là 6 ô skeleton tròn pill. |
| HOME-03 | Tắt mạng tạm thời → reload | Loading vĩnh viễn ⇒ KHÔNG xảy ra; component fallback hoặc lỗi rõ ràng. |

### 2.2. Cột "Template"

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| HOME-T-01 | Quan sát danh sách template | Tối đa 6 canvas template (BE `canvasTemplates.list({is_active:true,limit:6})`). Mỗi card hiển thị thumbnail, name, kích thước (vd `1200×600`). |
| HOME-T-02 | Click 1 template card | Điều hướng tới `/canvas-templates/<id>` (canvas editor). |
| HOME-T-03 | Click "Show All" | Điều hướng tới `/template`. |
| HOME-T-04 | BE trả 0 item | Hiển thị 3 mock template (Delvaux / Lider / Beuter). Click vẫn dẫn URL `/canvas-templates/t1` (sẽ 404 — đó là behaviour fallback OK). |

### 2.3. Cột "Product"

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| HOME-P-01 | Quan sát product | Tối đa 6 product (BE `products.list({limit:6})`). Mỗi card hiện ảnh, tên, status (Draft/Active/Archived) ở vị trí "Price". |
| HOME-P-02 | Click 1 product card | Điều hướng tới `/product/<id>/information`. |
| HOME-P-03 | Click "Show All" | Điều hướng tới `/product`. |

> Bug đã fix: trước đó cột Product nhầm dùng `projects.list` → click sai
> URL. Verify lại bằng `verify-home-card-clicks.mjs`.

---

## 3. Template list (`/template`)

**Route:** `/template` — list canvas templates.

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| TPL-01 | Mở `/template` | Tab "Canvas designs". Grid card canvas template. |
| TPL-02 | Click "+ New canvas" | Mở dialog Tạo mới với input Name, Width, Height. |
| TPL-03 | Submit name rỗng | Submit bị disabled. |
| TPL-04 | Submit name "Hero Test", 800×500 | Toast `"Hero Test" created`. Redirect editor `/canvas-templates/<id>`. |
| TPL-05 | Filter category | Click tab `All / My Template / Fashion / F&B / …` → grid filter tương ứng (deterministic theo id, ổn định giữa các lần load). |
| TPL-06 | Search | Gõ keyword → list lọc theo name. |
| TPL-07 | Archive | Click trash icon → confirm dialog → xác nhận → toast `Archived`, item biến mất. |

**Edge cases**
- Width/Height = 0 hoặc > 10000 → BE từ chối, FE hiện toast lỗi.
- Khi danh sách empty + chưa search → empty state có CTA "+ New canvas".

---

## 4. Canvas editor (`/canvas-templates/[id]`)

**Mục tiêu:** Mở/sửa/lưu canvas, toolbar add element.

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| CV-01 | Mở canvas vừa tạo | Canvas mount, version v1, etag được trả. Network tab có GET `/canvas-templates/<id>/canvas`. |
| CV-02 | Add Text → Add Rectangle → Add Circle (toolbar) | Mỗi element xuất hiện trên canvas. Console log `[canvas-add]` (dev). |
| CV-03 | Click Save | Toast Save success. Network có PATCH với version bumped (v2). Etag mới. |
| CV-04 | Reload trang ngay sau save | GET canvas trả 304 (etag match) → canvas vẫn render đúng. |
| CV-05 | Mở 2 tab cùng canvas, save ở tab A → save ở tab B | Tab B nhận lỗi conflict (etag mismatch). Hiện toast và reload state mới. |

> Script tham chiếu: `verify-canvas-flow.mjs`.

---

## 4A. ⭐ Flow chính #1 — Apply product vào template

**Mục tiêu:** User mở canvas template → chọn 1 product → AI ghi đè text +
ảnh trong các block bằng dữ liệu product. Canvas trở thành phiên bản
"đã apply" cho product đó.

**Entry points:**
- Manual: `/canvas-templates/<id>` → toolbar **Apply product** (icon
  package).
- Auto: `/canvas-templates/<id>?apply_product=<productId>` (link từ
  campaign detail / AI flow tự kích hoạt apply ngay khi load).

**Endpoints liên quan:**
- `POST /api/rexer/ai/canvas-templates/<id>/apply-product` — body
  `{ product_id }`. Trả `{ blocks_rewritten, blocks_total,
  image_bindings_replaced, blocks }`.
- Fallback client-side: `applyProductToBlocks()` (mapping deterministic)
  khi BE 5xx.

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| APPLY-01 | Mở canvas template trống bất kỳ ở `/canvas-templates/<id>` | Editor mount, blocks gốc render. Toolbar có nút **Apply product**. |
| APPLY-02 | Click **Apply product** | Mở `ProductPickerDialog`. List product hiện ra (search box + grid). |
| APPLY-03 | Search keyword → chọn 1 product → Confirm | Toast loading "Đang áp dụng…". Network: 1 POST `/ai/canvas-templates/<id>/apply-product` body chứa `product_id`. |
| APPLY-04 | API thành công | Toast xanh `AI rewrote X/Y block · Z ảnh thay`. Canvas re-render: heading, mô tả, CTA, ảnh nền của các block đã đổi sang giá trị product. Trạng thái Save chuyển sang **dirty** (chấm vàng). |
| APPLY-05 | Click Save sau apply | PATCH canvas, version bump. Toast Save OK. Reload trang → canvas giữ nguyên nội dung apply. |
| APPLY-06 | Auto apply qua URL: `/canvas-templates/<id>?apply_product=<pid>` | Editor load xong → tự động chạy luồng apply ngay (không cần click). Toast hiện. |
| APPLY-07 | Undo (Ctrl+Z) sau apply | Canvas quay về blocks trước apply. Redo (Ctrl+Y) → apply lại. |
| APPLY-08 | BE trả 5xx (giả lập bằng tắt mạng giữa request) | Toast vàng `AI thất bại (…) — đã fill bằng mapping mặc định`. Canvas vẫn được fill bằng mapping client-side. KHÔNG để user kẹt trắng. |
| APPLY-09 | Chọn product không thuộc client của user (admin) | BE có thể trả 403. Toast lỗi rõ ràng, không crash. |
| APPLY-10 | Apply 2 lần liên tiếp với 2 product khác nhau | Lần thứ 2 ghi đè lần 1. Mỗi lần đều push vào undo stack. |

**Edge cases**
- Apply khi canvas chưa save lần nào → mapping vẫn chạy, dirty=true sau apply.
- Apply trên canvas có 0 block đủ điều kiện (chỉ rectangle/circle) → toast `0/0 block` — không bug, đúng là không có gì để rewrite.
- Sau apply, click Publish → release sẽ chứa nội dung đã apply.

**Đo tiến độ apply (UX):**
- Toast loading hiện trong khi pending (≥ 1s thường thấy).
- Toolbar "Apply product" disabled trong lúc applying (xem state
  `applyingProduct`).

---

## 5. Product list & detail

### 5.1. Product list (`/product`)

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| PROD-L-01 | Mở `/product` | Grid product card + tile "+ Add new product" ở đầu. |
| PROD-L-02 | Click "Add new product" | Điều hướng `/product/new/information`. |
| PROD-L-03 | Click 1 card | Điều hướng `/product/<id>/information`. |

### 5.2. Product / Information

**Route:** `/product/[id]/information`

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| PROD-I-01 | Mở | Top bar (back + tên + Save / Add new category). Tab `Product / Landing / Marketing`. SubTab `Information / Media`. |
| PROD-I-02 | Sửa Name, Description, SKU, Sizes, Colors | Field giữ giá trị. Có thể paste comma-separated cho sizes/colors. |
| PROD-I-03 | "+ Add new category" | Dialog category. Submit category mới → toast, value cập nhật. |
| PROD-I-04 | Click Save | Toast `Saved`. PATCH `/products/<id>`. |
| PROD-I-05 | Mở product không tồn tại (`/product/zzzz/information`) | Toast lỗi `Product not found`. Form skeleton. |

### 5.3. Product / Media

**Route:** `/product/[id]/media`

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| PROD-M-01 | Upload ảnh thumbnail | Toast success. Ảnh hiển thị. Field `thumbnail_url` trên product cập nhật. |
| PROD-M-02 | Bind nhiều media | List media render đúng thứ tự upload. |

> Script tham chiếu: `verify-product-media-fix.mjs`.

### 5.4. Product / Landing

**Route:** `/product/[id]/landing`

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| PROD-LD-01 | Mở khi product CHƯA có landing | Empty state "No landings yet — Pick a template…". CTA `+ Pick a template` + nút top-right `+ New landing`. |
| PROD-LD-02 | Click bất kỳ CTA nào | Điều hướng `/ai-agents/<productId>/template` (AI suggest template cho product này). |
| PROD-LD-03 | Mở khi product CÓ landing | List card landing. Mỗi card có badge status + nút `Publish / Media / Analytics`. CHỈ landing thuộc product này hiển thị (filter client-side `product_id === id`). |
| PROD-LD-04 | Click `Publish` | Mở `/product/<id>/landing/<landingId>/publish`. |
| PROD-LD-05 | Click `Media` | Mở `/product/<id>/landing/<landingId>/media`. |
| PROD-LD-06 | Click `Analytics` | Mở `/product/<id>/landing/<landingId>/analytics`. |

> Bug đã fix: trước đó `landing` page không filter → load TẤT CẢ projects
> của user. Verify bằng `verify-product-landing-filter.mjs` +
> `verify-landing-empty-cta.mjs`.

### 5.5. Product / Marketing

**Route:** `/product/[id]/marketing` → list marketing instance →
`/product/[id]/marketing/[mid]` (overview) →
`/product/[id]/marketing/[mid]/{discovery|concept|assets|campaign}`.

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| PROD-MK-01 | Mở list marketing | Hiển thị marketing instances thuộc product. |
| PROD-MK-02 | Click `+ Add more Marketing` | Mở `Create Marketing` dialog (xem mục 7). |
| PROD-MK-03 | Click 1 marketing → vào trang detail | Sidebar trái có 4 mục: Discovery → Concept → Assets → Campaign. Nội dung mỗi tab khớp. |
| PROD-MK-04 | Click Save | Toast Save thành công. Có ARIA "Continue/Save" tuỳ trang. |

---

## 6. AI Agents wizard

**Route:** `/ai-agents/[productId]/{information|template|marketing|campaign}`.

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| AI-01 | Mở `/ai-agents/<id>/information` | Stepper 4 bước (Product / Template / Marketing / Campaign). Bước 1 active. |
| AI-02 | Điền form Product → Continue | Sang `/template`. Step 2 active. |
| AI-03 | `/template` | List candidate template do AI suggest theo `product_id` + goal. Mặc định chọn item đầu (preview bên phải). |
| AI-04 | Sửa goal → Refresh suggestions | Network call `/ai/template/suggest`. List re-rank. |
| AI-05 | Continue → `/marketing` | Vào marketing wizard (Discovery / Concept / Assets), sidebar tương tự Product Marketing nhưng KHÔNG có Campaign sub-section (campaign là step riêng). |
| AI-06 | Continue dần qua các sub-section | Mỗi click `Continue` chuyển URL đúng theo thứ tự `discovery → concept → assets → /campaign` (step 4). |
| AI-07 | Hoàn tất Campaign → Save | Toast hoàn thành. |

**Lưu ý dev mode**
- Lần click `Continue` đầu tiên qua route mới có thể chậm 2–3s do
  Turbopack compile route đích. Lần thứ hai chỉ ~200ms. Production build
  KHÔNG có delay này. (Verified bằng `measure-continue-delay.mjs`.)

---

## 6A. ⭐ Flow chính #2 — AI end-to-end: pick product → AI template → apply → marketing → campaign

**Mục tiêu (luồng vàng):** Một product chưa có gì → đi hết wizard
AI-Agents → kết thúc bằng một campaign quảng cáo có template đã apply
+ kế hoạch channel/KPI từ AI.

**Entry points:**
- `/product` → click "Add new product" → tạo xong product → redirect
  `/ai-agents/<productId>/information`.
- `/product/<id>/landing` (empty state) → click **Pick a template** →
  `/ai-agents/<id>/template` (skip step 1 nếu product đã có info đầy đủ).
- `/ai-agents/start` → tạo agent mới.

**Data flow:**
1. `sessionStorage` lưu wizard state theo `productId`: `template_id`,
   `goal`, `marketing_brief`. Đọc lại ở step Campaign để gửi cùng request
   `campaigns.create`.
2. Step Template gọi `POST /ai/template/suggest` → trả candidate có
   `score` + `reason`. Pick → lưu `template_id` vào wizard.
3. Step Campaign gọi `POST /ai/campaign/plan` → trả `name`, `channels`,
   `kpis`, `budget_amount`, `notes`. Click Launch → gọi
   `POST /campaigns` body có `product_id`, `client_id`,
   `landing_project_id` (= template_id picked), `objective`, `channels`,
   `kpis`, `budget_amount`, `notes`. Sau đó redirect tới
   `/product/<id>/marketing/<campaignId>`.

### 6A.1. Step Product (`/ai-agents/<id>/information`)

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| E2E-P-01 | Mở step Product | Stepper highlight bước 1 / 4. Form rỗng (hoặc prefill nếu product đã có info). |
| E2E-P-02 | Click **Pick a product** (mở dialog) | `ProductPickerDialog` mở. Có thể chọn product có sẵn để prefill thông tin hoặc tạo mới. |
| E2E-P-03 | Click "AI fill" (Sparkles) khi đã có Name/SKU | Network `POST /ai/product/enrich`. Toast "AI fill OK". Description / sizes / colors / ingredients / certifications được điền. |
| E2E-P-04 | Save → Continue | Toast Save. Sang `/template` (step 2). |

### 6A.2. Step Template (`/ai-agents/<id>/template`)

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| E2E-T-01 | Mở step Template ngay sau Product | Network `POST /ai/template/suggest` body `{product_id, goal:""}`. Spinner trong khi chờ. |
| E2E-T-02 | API trả candidates | Cột trái render N card có `score%` + `reason`. Item đầu tự được select (preview bên phải). |
| E2E-T-03 | Sửa Goal vào input "drive pre-orders" → click **Refresh suggestions** | Network call lại với goal mới. List re-rank. Toast OK. |
| E2E-T-04 | Click 1 candidate khác | Preview bên phải đổi sang template đó. Goal giữ nguyên. |
| E2E-T-05 | Click **Use this template** hoặc **Continue** | `template_id` được lưu vào sessionStorage wizard state (verify bằng DevTools → Application → Session Storage). Sang `/marketing/<mid>/discovery`. |

### 6A.3. Step Marketing (3 sub-sections)

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| E2E-M-01 | `/marketing/<mid>/discovery` | Form Marketing concept / target audience / plan. Có nút **AI-Assistant**. |
| E2E-M-02 | Click **AI-Assistant** | Toast generated. Nội dung điền tự động. |
| E2E-M-03 | Click Continue | Sang `/marketing/<mid>/concept`. |
| E2E-M-04 | Concept → Continue | Sang `/marketing/<mid>/assets`. |
| E2E-M-05 | Assets → Continue | Sang `/campaign` (step 4). |

### 6A.4. Step Campaign (`/ai-agents/<id>/campaign`)

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| E2E-C-01 | Mở step Campaign | Form: Objective (vd "Drive sign-ups"), Budget (USD). Nút **AI plan**. |
| E2E-C-02 | Để objective rỗng → click AI plan | Validation: yêu cầu nhập objective (toast hoặc field error). |
| E2E-C-03 | Nhập Objective + Budget → click **AI plan** | Network `POST /ai/campaign/plan` body `{product_id, objective, budget}`. Spinner. |
| E2E-C-04 | API trả plan | Card hiển thị: name, channels (vd `instagram, tiktok, google_ads`), KPI list, budget split. Toast "AI plan ready". |
| E2E-C-05 | Click **Launch** khi chưa có plan | Button disabled. |
| E2E-C-06 | Click **Launch** sau khi plan ready | Network `POST /campaigns` body chứa: `product_id`, `client_id` (lấy từ `products.get`), `landing_project_id` = template_id từ wizard, `objective`, `channels`, `kpis`, `budget_amount`, `notes` (packed wizard state). |
| E2E-C-07 | Tạo campaign thành công | Toast `Campaign "<tên>" created`. Wizard state bị xoá khỏi sessionStorage. Redirect `/product/<id>/marketing/<campaignId>`. |
| E2E-C-08 | Mở lại trang marketing detail | Section campaign hiển thị template_id link tới canvas đã pick. Click → mở canvas editor với `?apply_product=<id>` (luồng auto apply). |

### 6A.5. Đồng bộ end-to-end

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| E2E-X-01 | Đi từ Product → Template → Marketing → Campaign theo đúng thứ tự, không bỏ bước | Tại bước Campaign, `landing_project_id` trong body phải KHỚP với template đã pick ở step 2. |
| E2E-X-02 | Quay lại bước Template (back/click stepper), pick template KHÁC → lại sang Campaign → Launch | Campaign mới phải dùng template MỚI (không stale). |
| E2E-X-03 | Mở luồng cho 2 product song song (2 tab) | Mỗi tab có wizard state riêng (key theo `productId`). Không bị lẫn. |
| E2E-X-04 | Reload giữa wizard | sessionStorage được giữ → vào lại stepper đúng vị trí cuối. |
| E2E-X-05 | Lỗi BE ở step Campaign create (vd 400 client mismatch) | Toast lỗi rõ ràng. Wizard state KHÔNG bị xoá → user retry mà không mất template đã pick. |
| E2E-X-06 | Sau Launch thành công, vào lại `/ai-agents/<id>/campaign` | sessionStorage rỗng → form trở lại trạng thái ban đầu. KHÔNG re-tạo campaign trùng. |

**Edge cases & UX checks**
- Mỗi `Continue` không gây 2-3s delay trên prod (chỉ dev). Verify bằng
  thời gian thực tế trên Vercel.
- Khi product `client_id` null (admin own), campaign vẫn tạo được (BE
  cho phép `client_id` undefined). Khi product có `client_id` mà session
  user thuộc client khác → 403, toast rõ.
- AI suggest trả 0 candidate → empty state "No suggestions yet — try
  refining the goal".
- Network slow (3G throttle): spinner phải hiện liên tục, KHÔNG flash
  empty state giữa các call.

> Khi đo flow E2E end-to-end, ưu tiên smoke trên prod (`smoke-prod.mjs`)
> trước, sau đó chạy luồng manual để xác nhận điều hướng + dữ liệu giữa
> các step trùng khớp.

---

## 7. Marketing module — Create Marketing dialog

**Route:** `/marketing` (top-level) hoặc nút `+ Add more Marketing` ở
trang Product Marketing.

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| MK-01 | Click `+ Add more Marketing` / `+ Create Marketing` | Dialog mở. Tiêu đề "Create Marketing". Default Marketing name = "Marketing name". |
| MK-02 | Click pencil hoặc text "Marketing name" | Field thành Input. Đổi tên + Enter / blur → giữ tên mới. |
| MK-03 | Member section default | 4 chip: Zayden Jarvis, Kailee Rogers, Ember Mooney, Jaxon Reed. |
| MK-04 | Click X trên 1 chip | Chip bị xoá. Số chip giảm về 3. |
| MK-05 | Click `+ Add` (chip dashed) | Hiện input "Member name" autoFocus. |
| MK-06 | Gõ tên → Enter | Chip mới được thêm. Input đóng lại. |
| MK-07 | Gõ tên trùng đã có → Enter | KHÔNG duplicate. |
| MK-08 | Gõ rỗng → Enter / Esc / blur | Huỷ thêm. |
| MK-09 | Campaign section: gõ tên + Add more | Thêm row mới. Mỗi row có X để xoá (chỉ khi có > 1 row). |
| MK-10 | Status: chọn Active / Stop | Chọn lựa hiển thị highlight. |
| MK-11 | Submit khi tên còn "Marketing name" | Toast lỗi `Đặt tên cho marketing trước`. |
| MK-12 | Submit khi 0 campaign | Toast lỗi `Thêm ít nhất 1 campaign`. |
| MK-13 | Submit hợp lệ | Toast `Đã tạo "<tên>" với N campaign`. Dialog đóng. |

> Script tham chiếu: `verify-marketing-member.mjs`.

---

## 8. Settings

**Route:** `/setting/{profile|security|theme|integrations|clients}`

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| SET-01 | Profile: đổi display name | Save → toast OK. Reload vẫn còn. |
| SET-02 | Security: đổi password | Yêu cầu password cũ. Validate password mới >= 8 ký tự. |
| SET-03 | Theme: chọn Light/Dark/System | Theme áp dụng ngay. |
| SET-04 | Integrations: bật/tắt | Toggle persist. |
| SET-05 | Clients list | List client. Click 1 client → `/setting/clients/<id>` (detail). |

---

## 9. Mobile responsive (375 × 812)

**Áp dụng cho mọi route trong `(app)`.**

| ID | Bước | Kết quả mong đợi |
|----|------|------------------|
| MOB-01 | Mở `/home` ở 375px | KHÔNG có scroll ngang ở body. Sidebar ẨN. Top bar mobile có ☰ + logo REXER. |
| MOB-02 | Tap ☰ | Drawer slide từ trái 200ms. Backdrop dimmed (opacity 40%, blur 2px). |
| MOB-03 | Bên trong drawer: tap nút X (góc phải header) | Drawer trượt về. Backdrop biến mất. |
| MOB-04 | Mở drawer → tap backdrop | Drawer đóng. |
| MOB-05 | Mở drawer → bấm phím Esc (desktop chrome devtools) | Drawer đóng. |
| MOB-06 | Mở drawer → tap nav item bất kỳ | Điều hướng URL + drawer auto đóng. |
| MOB-07 | `/home` các cột Template & Product | Stack DỌC (không phải side-by-side như desktop). Padding 4 (vs 6 desktop). |
| MOB-08 | `/product/<id>/information` | Top bar workspace 3 hàng: row1 (back + title), row2 (tabs Product/Landing/Marketing scroll ngang), row3 (actions Save / Add new category). |
| MOB-09 | Body scroll khi drawer mở | KHÔNG cuộn được (locked). Đóng drawer → scroll lại bình thường. |

> Script tham chiếu:
> - `audit-mobile.mjs` — quét 10 page chính, fail nếu có overflow ngang.
> - `verify-mobile-drawer.mjs` — kiểm 9 hành vi drawer.

**Edge cases**
- Quay từ portrait sang landscape (rotate iPad): viewport vượt `md`
  (768px) → drawer auto-đóng + sidebar desktop xuất hiện.
- Form input focus trên iOS: KHÔNG zoom (font-size ≥ 16px).

---

## 10. Smoke test toàn hệ thống

Một lượt nhanh sau mỗi deploy:

1. `/sign-in` → login → `/home`.
2. `/home` → click 1 template → editor mở.
3. `/home` → click 1 product → information page.
4. `/template` → tạo canvas mới → editor mở.
5. `/product` → click product → `/product/<id>/landing` → click "Pick a
   template" → AI template page.
6. `/marketing` → mở Create Marketing dialog → thêm/xoá member → submit.
7. Mobile (Chrome DevTools 375×812): mở drawer → đóng bằng X / backdrop /
   nav.
8. Logout từ sidebar.

Mọi bước phải KHÔNG có lỗi đỏ trong console + toast lỗi không mong đợi.

---

## 11. Script Playwright tham chiếu

Tất cả ở `scripts/visual-tests/`. Chạy `BASE_URL=http://localhost:3003
node scripts/visual-tests/<file>`:

| Script | Cover |
|---|---|
| `verify-home-card-clicks.mjs` | Home → click Template card / Product card |
| `verify-product-landing-filter.mjs` | `/product/<id>/landing` filter `product_id` |
| `verify-landing-empty-cta.mjs` | Empty state CTA → AI template picker |
| `verify-marketing-member.mjs` | Add / remove member trong Create Marketing |
| `verify-mobile-drawer.mjs` | Drawer open/close (☰, X, backdrop, Esc, nav tap) |
| `audit-mobile.mjs` | Quét 10 page mobile, detect horizontal overflow |
| `verify-canvas-flow.mjs` | Tạo canvas → add element → save → reload → archive |
| `verify-collection-flow.mjs` | Tạo collection → add record → search |
| `verify-template-merge.mjs` | Merge canvas template vào product |
| `verify-upload-flow.mjs` | Upload media → bind product |
| `verify-product-media-fix.mjs` | Product media binding |
| `verify-duplicate-flow.mjs` | Duplicate canvas template |
| `verify-new-flows.mjs` | Smoke `/product/start`, `/ai-agents/start` empty states |

Chạy thất bại → screenshot tự động lưu trong `scripts/visual-tests/out/`.

---

## 12. Báo cáo bug

Khi tìm bug, ghi vào issue tracker theo format:

```
[ID test case]   ví dụ: PROD-LD-03
Mô tả    : một câu ngắn
Bước repro: 1. ... 2. ... 3. ...
Mong đợi  : ...
Thực tế   : ...
Môi trường: Chrome 130 / 1440x900 hoặc iPhone 13 / 375x812
Kèm      : screenshot, console log nếu có
```

Nếu tìm thấy bug response/UI ở mobile, đính kèm cả URL và viewport size.
