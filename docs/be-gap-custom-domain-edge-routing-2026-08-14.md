# BE/Infra gap — Custom Domain verify được, nhưng chưa serve được traffic thật

2026-08-14 · FE → BE/Infra · Deploy (`/portal-v2/deploy`) + `/portal/profile/domains`

## Bối cảnh

FE vừa nối domain CRUD + verify trong Deploy (portal-v2) vào đúng backend thật
mà `/portal/profile/domains` đã dùng (`rexerApi.brands.domains.*`). Test bằng
domain thật (`demo.tenmiencuaban.com` trỏ CNAME/TXT theo hướng dẫn) verify
chạy đúng: DNS sai → `failed`, DNS đúng → `verified`.

Nhưng đến đó là hết. Mở domain đó lên trình duyệt **không có gì trả về** —
BE mới ship §11.2 mục 1 (domain CRUD + state machine); mục 2-5 chưa xác nhận
tồn tại. Tài liệu gốc: `rexer-architecture-final-2026-05-23.md` §11
(`Custom Domain provisioning`), §7.2 (lifecycle), §4.5 (bảng `custom_domains`).

## Đã có — không cần làm lại

- `POST/GET/PATCH/DELETE /v1/brands/{id}/domains` — CRUD đầy đủ.
- `POST /v1/brands/{id}/domains/{id}/verify` — trả `status` cập nhật +
  `dns_records` (FE hiện tự dựng lại CNAME/TXT theo convention thay vì đọc
  field này, xem `src/lib/portal-v2/deploy/constants.ts` — nói ra để BE biết
  field đó tồn tại nhưng FE hai nơi đều chưa phụ thuộc vào nó).
- Response `verify` cho biết ngay DNS đúng/sai hay không (không phải polling
  — FE gọi 1 lần, đọc `status` trong response, xong).

## Còn thiếu — đúng theo §11.2 mục 2-5

### 1. Cron verify DNS định kỳ (§11.2.2)

> "Verification cron: poll DNS every 5 min for `verifying` domains"

Hiện verify chỉ chạy khi người dùng bấm nút. Domain ở trạng thái `verifying`
(BE đang tự check async, nếu có) không có gì tự cập nhật lại nếu người dùng
không quay lại bấm verify lần nữa. Cần xác nhận: verify hiện tại có chạy
đồng bộ trong request (trả kết quả ngay) hay có nhánh async nào cần cron này
đứng sau? Nếu đồng bộ hoàn toàn thì mục này có thể không cần — ghi rõ ra
trong response để FE biết.

### 2. Tự cấp TLS khi verified (§11.2.3, §7.2)

> `VERIFIED ─provision TLS─▶ ACTIVE`

Chọn 1 trong 2 hướng đã note ở §11.1:
- **Cloudflare for SaaS** (Custom Hostname API) — tự động, nhưng cần account
  Cloudflare có gói hỗ trợ + `CF_API_TOKEN`/`CF_ZONE_ID`. Đã grep toàn repo,
  **chưa thấy** biến môi trường hay account nào set sẵn.
- **Caddy on-demand TLS** (Let's Encrypt) — tự xin cert khi có request đầu
  tiên tới domain đó, rẻ hơn nhưng cần tự vận hành Caddy ở edge.

`tls_status`/`tls_expires_at` đã có sẵn field trên `custom_domains` — chỉ
thiếu tiến trình nào ghi vào đó.

### 3. Edge router theo Host header (§11.1, §11.4)

> Wildcard DNS `*.rexer-edge.com` → LB → router đọc Host header → tra
> `CustomDomain WHERE domain=... AND status='active'` → `workspace_id` →
> serve nội dung.

Đây là phần lớn nhất còn thiếu — chưa có bất kỳ router/edge nào trong repo
hay hạ tầng hiện tại làm việc này (`middleware.ts` của FE chỉ hardcode 2 host
cố định `portal.rexerstudio.com`/`rexerstudio.com`, không tra bảng domain
động). Cần: 1 service (Cloudflare Worker / Caddy / Nginx) đứng trước, nhận
mọi request tới domain khách hàng, tra domain → đích, forward.

**⚠️ Gap kiến trúc cần chốt trước khi làm phần này — xem mục riêng bên dưới.**

### 4. Cron gia hạn TLS (§11.2.5)

> "Renewal cron: monitor `tls_expires_at`, renew 30 days before"

Phụ thuộc mục 2 (chỉ cần khi đã có TLS tự cấp).

## ⚠️ Cần chốt trước khi build routing: domain trỏ vào Landing Page hay vào Deploy experience?

Spec gốc (§11.4, W9) viết rõ: routing là
`domain → workspace → Page WHERE type='landing' AND slug=...` — tức
**custom domain chỉ dành cho landing page có slug**, brand tự thêm domain ở
`/portal/profile/domains` rồi **publish landing page** lên domain đó.

Nhưng Deploy module (portal-v2) mới build cho phép gắn domain vào **một
deployment/experience** (kết quả của campaign → Ready → Deploy), không phải
một landing page có slug theo nghĩa migration `page_id` trong `custom_domains`.
Hai model này hiện KHÔNG khớp nhau:

- Nếu domain chỉ route được tới landing page → domain gắn từ Deploy sẽ verify
  DNS được (đúng/sai) nhưng sẽ không bao giờ serve được gì, vì nó không có
  `page_id` gắn — đây đang là behavior hiện tại của FE (`page_id: null` khi
  Deploy tạo domain), route mãi 404.
- Nếu muốn Deploy's domain thực sự serve được → cần 1 trong 2:
  - (a) BE mở rộng `target_type` hoặc routing để domain có thể trỏ tới 1
    deployment/experience thay vì chỉ landing page, hoặc
  - (b) Deploy tự tạo/quản lý 1 landing page ẩn đứng sau mỗi deployment và
    bind `page_id` vào đó — tái dùng nguyên model landing page có sẵn, không
    cần BE đổi gì thêm ở tầng domain.

**Đề xuất**: (b) rẻ hơn nhiều — không cần BE sửa domain/routing model, chỉ
cần FE (Deploy) tạo page ẩn + gọi `PATCH .../domains/{id} {page_id}` để bind.
Nhưng cần BE/product xác nhận hướng này hợp lý trước khi FE build thêm, vì nó
đổi ý nghĩa của "deploy một experience lên Web microsite".

## Test sau khi xong (mục 2-3)

```bash
# Domain đã verified qua UI, brandId + domainId đã biết
curl -sI https://demo.tenmiencuaban.com
# Kỳ vọng: 200 (hoặc redirect hợp lệ), có chứng chỉ TLS hợp lệ (không cảnh báo trình duyệt)
# Hiện tại: connection refused / DNS trỏ vào nơi không có gì lắng nghe
```
