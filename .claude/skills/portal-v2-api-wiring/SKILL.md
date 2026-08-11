---
name: portal-v2-api-wiring
description: Ráp một màn Portal V2 từ mock sang API thật. Dùng khi người dùng hỏi "màn này ráp API chưa", "ráp API cho màn X", hoặc khi một màn còn đọc MOCK_*. Chứa checklist rút từ 7 lần vấp cùng một chỗ.
---

# Ráp Portal V2 từ mock sang API

Đây là những lỗi đã xảy ra thật khi ráp Automation, Experiences, Products,
Brand, Campaigns, Journeys và Settings — không phải lo xa. Mỗi mục dưới đây đều
đã một lần lọt lên màn hình người dùng.

## Thứ tự bắt buộc

1. **Soát hợp đồng TRƯỚC khi sửa dòng nào.** Đọc model + handler + usecase ở BE,
   đọc type + component ở FE, rồi mới viết. Vá theo từng lỗi người dùng báo là
   cách một buổi test biến thành mười vòng sửa vặt.
2. **Gọi API thật bằng `curl` trước khi ráp.** `tsc` xanh không chứng minh
   endpoint tồn tại. Nhiều lần shape thật khác hẳn type đang khai.
3. Ráp, rồi **nghiệm thu lại bằng API thật** — không phải bằng biên dịch.

## Bảy lần vấp cùng một chỗ: brand scope

Platform admin **không thuộc brand nào**. Mã cứ giả định principal luôn có
brand, và mỗi endpoint hỏng một kiểu:

| Nơi | Triệu chứng |
|---|---|
| media | 8 ảnh `brand_id` NULL, chỉ hiện khi không chọn brand |
| products | sản phẩm mồ côi, `Run` từ chối vì `sameClientScope` |
| hub Automation | `gate()` 403 — màn hình liệt kê template rồi từ chối chính việc nó mời |
| intel | mọi số về 0, đọc như "brand này không có ai" |
| journeys | 400 "requires a brand scope", không tham số nào sửa được |
| campaigns | tạo ra bản ghi mồ côi, biến mất khi chọn brand |
| governance / capabilities | 400, màn Settings của admin trắng |

**Luật:** dùng `requireBrandScope(ctx, override, "<tên mặt>")` cho ghi, và
`effectiveListBrandID(ctx, override)` cho đọc. Endpoint nào cũng nhận
`brand_id`. Ở FE, mọi route lấy brand từ `resolvePortalScope(searchParams)` và
truyền xuống; nút TẠO bị khoá khi chưa chọn brand.

## Checklist trước khi nói "đã ráp xong"

### Đọc
- [ ] Danh sách có kèm quan hệ con không? `GET /campaigns` chỉ trả `items_count`,
      không trả `items[]` — vẽ thẳng sẽ hiện "0 hạng mục" cho chiến dịch có 3.
- [ ] Trường nào BE **cố ý bỏ qua**? `signal_coverage` vắng nghĩa là *chưa đo*,
      không phải 0%. Quy về 0 là dựng lại lời nói dối vừa gỡ.
- [ ] `measured: false` ⇒ trả `null`, đừng vẽ các số 0 kèm theo.
- [ ] Server có chặn trần trang không? `page_size` bị cắt xuống 100 mà không báo
      — xin 200 nhận 100, màn hình hiện 100/110 như thể đã đủ.

### Ghi
- [ ] **Id do SERVER cấp.** `nextCampaignId`, `experienceCopyId(origin×campaign×
      subject)`, `j-promoted-{id}` — mọi id suy ở FE đều trỏ vào hư không sau
      lần tải lại đầu tiên.
- [ ] Động từ đúng chưa? Client v1 gọi `PATCH`, server chỉ nhận `PUT` → 404.
- [ ] Quan hệ con có nằm trong payload cha không? `UpdateCampaignV2Request`
      **không có** `items` — thêm hạng mục rồi lưu chiến dịch là đánh rơi im lặng.
      Hạng mục, trải nghiệm gắn kèm đều đi endpoint riêng.
- [ ] Có khoá lạc quan không? `PUT /journeys` bắt gửi `version` vừa đọc; shape
      UI không mang trường đó nên phải giữ riêng.
- [ ] Trạng thái do BE **suy ra** hay do FE đặt? `core.DeriveCampaignStage` tự
      tính; `PATCH .../status` chỉ nhận `done` hoặc `null`, giá trị khác là 400.

### Sau khi nạp lại
- [ ] Đổi brand có nạp lại không? `useState(() => prop)` chỉ chạy lúc mount —
      **phải** `key={scope.brandId}` để remount, nếu không màn hình giữ dữ liệu
      brand cũ, kể cả `version` (bấm Save là ghi đè nhầm).
- [ ] Nạp chi tiết có xoá mất liên kết vừa ghép không? `GET /campaigns/{id}`
      không trả `journey_id`, nên gán thẳng vào state là mất liên kết.

## Không bao giờ

- **Không rơi về mock khi nạp hỏng.** `data ?? MOCK_BRAND` khiến người dùng đọc
  "Ilia Beauty" và tưởng đó là brand của mình. Hiện khung TRỐNG kèm lỗi.
- **Không chép API thành hằng số.** `JOURNEY_SEGMENTS` là bản chép của
  `/intel/segments` với `share` đóng băng — và hằng số 0.07 đó đem NHÂN vào số
  phiên có thật.
- **Không bịa số đo.** `seed.ts` băm id ra `+45% HIGH CONFIDENCE · 15,993
  sessions`. Ổn định theo id nên đọc như phép đo.
- **Không chép luật của BE sang FE.** Nếu buộc phải (bản nháp chưa lưu không hỏi
  server được) thì ghi rõ file BE cần đối chiếu — `validateJourney` từng lệch 9
  luật / 12 và khiến màn hình báo "100% ready" rồi `PUT` trả 422.

## Nói thật trên màn hình

- Nút xám **không tự giải thích được vì sao nó xám** — người dùng đọc thành
  "hỏng" hoặc "đã gắn rồi". Hiện lý do thành chữ, đừng giấu trong `title`.
- Lỗi của BE gọi node bằng KHOÁ (`n3`); trên canvas nó tên là "New experience".
  Dịch sang tên trước khi hiện.
- Autosave cục bộ **không phải** "Saved". Nhãn đó khiến người dùng đóng tab khi
  server vừa từ chối 422.
- Hai lời gọi thì báo hai kết quả: "lưu được nhưng chưa đổi được trạng thái"
  khác hẳn "không lưu được".

## Dọn sau khi ráp

Xoá file mock và helper đã chết — `seed.ts`, `mapPage.ts`, `automationRun.ts`,
`routeJourneyOntoCampaign`. Kiểm bằng đường import đầy đủ
(`grep "experiences/seed'"`), đừng grep tên trần: nó khớp cả chữ "seed" trong
câu bình luận và cho ra 64 kết quả giả.

## Nghiệm thu

```bash
npx tsc --noEmit                    # 0 lỗi
npx eslint <đúng file đã sửa>       # 0 lỗi
python3 -c "..."                    # khoá i18n vi/en không lệch
curl ...                            # đường ĐỌC và đường GHI, trên dữ liệu thật
docker exec ... psql ...            # bản ghi có thật trong DB
```

`next build` **giết dev server** đang chạy (`build` ghi đè `.next`). Tắt dev
trước, hoặc đừng chạy.

Sửa file i18n xong **phải khởi động lại dev**: Turbopack không theo dõi
`import(\`./messages/${locale}.json\`)`, nên khoá mới sẽ hiện ra nguyên chuỗi
`portalV2.x.y` — đã mất một vòng chẩn đoán vì chuyện này.
