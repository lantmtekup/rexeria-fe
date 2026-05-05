# BE Issue — Canvas save không persist edits (schema 2.0)

**Filed**: 2026-05-05
**Severity**: 🔴 Critical — block flow chỉnh sửa canvas template
**Reporter**: FE team (sontekup)
**ID**: BUG-12 (sẽ thêm vào `be-issues-master.md` §1 sau khi BE confirm)
**Resource**: `canvas_templates`
**Endpoints**: `PATCH /v1/canvas-templates/{id}` + `GET /v1/canvas-templates/{id}/canvas`

---

## 1. Tóm tắt

Sau khi FE migrate sang `canvas_data.schema_version = "2.0"` (per `docs/canvas-block-responsive-spec.md` §5), user edit nội dung trên canvas (vd inline edit title) → autosave fire (PATCH 1.5s sau edit) → nhưng **reload page thì edit không xuất hiện**, canvas trở về trạng thái cũ.

Flow này **trước migration 2.0 hoạt động bình thường** (verified với schema 1.0 cũ). Sau migration, FE đã:
- Bump `canvas_data.schema_version` → `"2.0"`
- Wrap content per-device: `contentVi: { desktop: {...}, mobile?: {...} }`
- Vẫn camelCase block fields (per BE error precedent — xem §3)

Hypothesis của FE: **BE PATCH return 200 nhưng GET sau đó không trả lại canvas_data đã update**. Cần BE debug chuỗi store/retrieve.

---

## 2. Repro steps

1. Login user `admin@rexer.ai` (role `admin`).
2. Mở canvas template `e3e3e3e3-2000-0000-0000-000000000001` (ID test in dev fixtures):
   ```
   GET /v1/canvas-templates/e3e3e3e3-2000-0000-0000-000000000001/canvas
   ```
3. Edit title block đầu tiên qua double-click → gõ text mới → Enter để commit.
4. Đợi ~2s (FE autosave debounce 1500ms) → FE fire `PATCH /v1/canvas-templates/{id}` với body §3.
5. PATCH trả 200 + `canvas_template` updated (FE đoán BE accept).
6. **Reload page (F5)**.
7. Quan sát: title trở về giá trị cũ — edit ở step 3 mất.

**Expected**: title sau reload = giá trị FE vừa save.
**Actual**: title sau reload = giá trị trước khi edit.

---

## 3. PATCH request body (FE → BE)

Đây là body thật từ DevTools Network (user paste trong issue thread, đã verify FE serialize đúng):

```jsonc
{
  "canvas_data": {
    "schema_version": "2.0",
    "active_block_id": "blk_hero",
    "blocks": [
      {
        "id": "blk_hero",
        "blockType": "hero_split",
        "name": "Hero",
        "isVisible": true,
        "thumbnail": "https://picsum.photos/seed/rexer-be-hero/400/200",
        "contentVi": {
          "desktop": {
            "title": "Không gian xanh tiện ích đầy đủ cho gia đình",
            "eyebrow": "DỰ ÁN MỚI 2026",
            "description": "Căn hộ 2-4 phòng ngủ, view sông, gần trung tâm. Bàn giao quý 4 năm 2026.",
            "imageUrl": "https://picsum.photos/seed/rexer-be-hero-d/1600/900",
            "ctaText": "Đặt lịch tham quan",
            "ctaLink": "#booking",
            "stats": [
              { "label": "căn hộ", "value": "120" },
              { "label": "công viên", "value": "4ha" },
              { "label": "bàn giao", "value": "Q4/26" }
            ]
          },
          "mobile": {
            "title": "Không gian tiện ích đầy đủ",
            "eyebrow": "DỰ ÁN MỚI 2026",
            "description": "Căn hộ 2-4 PN, view sông, gần trung tâm.",
            "imageUrl": "https://picsum.photos/seed/rexer-be-hero-m/780/975",
            "ctaText": "",
            "ctaLink": "#booking",
            "stats": [
              { "label": "căn hộ", "value": "120" },
              { "label": "công viên", "value": "4ha" },
              { "label": "bàn giao", "value": "Q4/26" }
            ]
          }
        },
        "contentEn": {
          "desktop": { /* …same shape, EN copy… */ },
          "mobile":  { /* …same shape, EN copy… */ }
        },
        "elementStyles": {
          "desktop": { "title": { "color": "#0f172a", "fontSize": 64 } },
          "mobile":  { "title": { "color": "#0f172a", "fontSize": 32 } }
        },
        "background": {
          "desktop": { "color": "#f8fafc", "imageUrl": null },
          "mobile":  { "color": "#f8fafc", "imageUrl": null }
        },
        "motion": {
          "desktop": {},
          "mobile": {
            "elements": {
              "imageUrl": {
                "presetId": "hero.parallax-soft",
                "speed": "normal", "intensity": "dramatic",
                "cascade": "normal", "enabled": true
              },
              "ctaText": {
                "presetId": "hero.slide-from-right",
                "speed": "normal", "intensity": "normal",
                "cascade": "normal", "enabled": true
              }
            }
          }
        }
      },
      { "id": "blk_features", /* … */ },
      { "id": "blk_cta",      /* … */ }
    ]
  },
  "version": 9
}
```

### Quy ước key (FE đã align với BE error precedent)

| Vị trí | Style | Ví dụ |
|---|---|---|
| `canvas_data.schema_version` | snake_case (meta) | `"2.0"` |
| `canvas_data.active_block_id` | snake_case (meta) | `"blk_hero"` |
| `blocks[N].*` (top fields) | **camelCase** | `blockType`, `contentVi`, `isVisible`, `elementStyles` |
| `blocks[N].contentVi.desktop.*` (inner content) | **camelCase** | `imageUrl`, `ctaText`, `imageTransform` |
| `blocks[N].elementStyles.desktop.<key>.*` | **camelCase** | `fontSize`, `fontWeight`, `textAlign` |
| `version` (top-level, ngoài `canvas_data`) | int (etag) | `9` |

> Lý do mixed convention: BE earlier reject với error `validation_errors: { "blocks[0].contentVi": "required (DeviceVariants object)" }` → confirm BE validator dùng camelCase cho block fields. FE chỉ snake_case `schema_version` + `active_block_id` ở top-level meta.

---

## 4. PATCH response (cần BE confirm)

FE đoán PATCH trả **200**, nhưng cần BE confirm thực tế. **BE owner check log** với `request_id` mà FE sẽ paste khi gặp lại; hoặc grep canvas_template `id = e3e3e3e3-2000-0000-0000-000000000001` trong access log từ 2026-05-04 21:00+ ICT.

Cần biết:
- Status code thực sự (200 / 422 / 409 / 500)
- Response body có `canvas_template` không
- DB `canvas_templates.canvas_data` cột sau PATCH lưu nội dung gì (so sánh với body §3)

---

## 5. GET response sau reload (Cần FE supply tiếp)

FE chưa capture được response body của GET sau reload (đang xin user). Khi có sẽ append vào doc này.

**Câu hỏi key**: `canvas_data.blocks[0].contentVi.desktop.title` trong response GET có khớp với title FE vừa PATCH không?

| Khớp | Bug ở | Action |
|---|---|---|
| ✅ Có | FE parse | FE fix `parseCanvas` |
| ❌ Không | BE persist | BE fix store/retrieve |

---

## 6. Hypotheses BE cần check

### H1 — BE accept PATCH nhưng `canvas_data` không được persist
PATCH handler return 200 + updated `canvas_template` metadata, nhưng cột `canvas_data` không được UPDATE trong DB (vd handler chỉ update các field khác như `name`, `version`).

**Check**:
- Source của `PATCH /v1/canvas-templates/{id}` handler — verify SQL UPDATE statement có set `canvas_data` không.
- Sau 1 lần PATCH, query trực tiếp DB: `SELECT canvas_data->'blocks'->0->'contentVi'->'desktop'->'title' FROM canvas_templates WHERE id = '...'` → có giá trị mới không?

### H2 — BE silently strip fields không hợp lệ schema
JSON validator có thể **filter out** fields không match schema thay vì reject (mode "strip unknown"). Vd nếu BE schema 2.0 không list `motion` field → bị strip → save lại canvas_data thiếu motion.

Tương tự với `elementOrder` (FE có gửi nhưng có thể không có trong PATCH body trên).

**Check**:
- BE schema 2.0 definition (Go struct, JSON schema, hoặc Pydantic model — tuỳ stack BE) có cover đủ FE fields không?
- Fields BE expect: `id`, `blockType`, `name`, `isVisible`, `thumbnail`, `contentVi`, `contentEn`, `elementStyles`, `background`, `elementOrder`, `motion`?

### H3 — Cache/CDN trả version cũ
`GET /canvas/...` có ETag/Cache-Control → browser hoặc upstream cache return version cũ.

**Check**:
- Response header `Cache-Control`, `ETag` của GET endpoint
- Browser DevTools "Disable cache" rồi reload — vẫn không persist?

### H4 — Race condition autosave debounce
FE autosave debounce 1500ms — nếu user edit rồi reload trong < 1500ms, PATCH chưa fire. Đã loại trừ vì user đợi >2s.

### H5 — BE store JSON dạng string thay vì JSONB
Nếu BE write `canvas_data` thành string serialised, đọc ra parse error → fallback empty/default.

**Check**:
- `\d canvas_templates` trong psql → cột `canvas_data` là `jsonb` hay `text`?
- Nếu JSONB: query `canvas_data ?? 'blocks'` để kiểm key tồn tại.

### H6 — Optimistic concurrency rollback
Cùng lúc 2 client save → BE detect conflict (version mismatch) → silently rollback latest. FE gửi `version: 9` → có conflict?

**Check**:
- Log handler với version=9: có path nào throw conflict mà response vẫn 200?

---

## 7. FE workaround hiện tại

Không có workaround. User mất edit sau reload → block hoàn toàn flow "edit + persist".

Nếu BE chưa fix kịp, FE có thể tạm:
- Show banner đỏ sau save: "Edit có thể chưa lưu — kiểm lại sau reload" — UX kém
- Hoặc chuyển sang client-only persistence (localStorage) — không bền

→ **Cần BE fix gấp**.

---

## 8. FE-side verification sẵn sàng khi BE fix xong

```bash
# Test wire format hợp lệ + round-trip
node scripts/visual-tests/snap-save-2.0.mjs

# Smoke test full flow editor
node scripts/visual-tests/snap-block-editor-interactions.mjs
```

E2E acceptance:
- [ ] PATCH 200 với body §3
- [ ] DB `canvas_data` chứa exactly body sent (mod normalisation)
- [ ] GET sau PATCH trả lại nguyên field `motion`, `elementOrder`, `contentVi.desktop.title` đã update
- [ ] Reload browser → title hiển thị đúng giá trị mới

---

## 9. Tham chiếu

- `docs/canvas-block-responsive-spec.md` §5 — schema 2.0 contract
- `docs/be-canvas-templates-spec.md` §4 + §5 — `canvas_data` JSON schema + lazy-load endpoints
- `docs/be-issues-master.md` BUG-12 (sẽ thêm) — link về doc này
- FE serialize source: `src/components/modules/CanvasTemplate/block-editor/serialize.ts`
- FE save handler: `src/components/modules/CanvasTemplate/BlockEditor.tsx` `doSave()` ~line 245

---

## 10. BE owner action checklist

1. [ ] Confirm hash schema 2.0 với FE (nếu BE define schema riêng — share JSON schema / Go struct).
2. [ ] Reproduce bug local: PATCH với body §3 → query DB → check `canvas_data` đã update chưa.
3. [ ] Nếu UPDATE statement không set `canvas_data` → fix handler.
4. [ ] Nếu schema validator strip fields lạ → adjust to passthrough hoặc explicitly support `motion`, `elementOrder`.
5. [ ] Reply PR/MR + linked issue ID (BUG-12) trên `be-issues-master.md`.

---

**FE liên hệ**: Tekup team / sontekup
**Reply qua**: comment trên doc này + ping kênh `#rexer-be-fe`
