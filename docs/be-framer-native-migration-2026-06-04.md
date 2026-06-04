# BE task — seed catalog cho framer-native blocks (migrate legacy → native)

> **Bối cảnh:** FE đang migrate 43 design framer ở `src/blocks/` (legacy, render qua
> `legacy_embed` — đã gỡ khỏi canvas) sang **native block_type** (mỗi design = 1
> `block_type` riêng, render native + sửa inline được, như 14 type chuẩn). Mỗi design
> native cần 1 dòng trong catalog `block_types` thì editor mới commit + publish được.
>
> **Pilot đầu tiên (đã xong FE + verify):** `framer_yume_hero` (Hero - Yume).

> **✅ TIẾN ĐỘ 2026-06-04 — HOÀN TẤT. Schema version → 17, catalog 34 framer blocks.**
>
> | Migration | Blocks | Schema |
> |---|---|---|
> | `000012` | framer_yume_hero | 12 |
> | `000013` | framer_yuya_hero, framer_arpeggio_hero | 13 |
> | `000014` | delvaux_hero_intro, framer_hero, perform_hero, perform_hero_v2, bungee_hero | 14 |
> | `000015` | mobius_hero, avexa_hero, intro_redefined, paradigm_title, explore_cta, studio_manifesto, large_quote | 15 |
> | `000016` | stats_grid, projects_grid, team_directory, image_stagger, horizontal_scroll, avexa_bento, clarity_services, velora_services, firma_featured | 16 |
> | `000017` | aestha_editorial, aestha_project_detail, perform_about, perform_pricing, contact_footer, faq_minimal, finnegan_expertise, darling_timeline, signature_feature, vs_collins_projects | 17 |
>
> **34/34 framer designs migrated** — tất cả có renderer native + inline-edit + commit gate ✓
> FE type-check ✓ · lint 0 errors ✓. Catalog per-request từ DB → server không cần restart.

---

## 1. BE cần làm — thêm `block_type` vào catalog

### Vì sao bắt buộc (đã verify live trên `:9090`)
Gate catalog nằm ở **2 chỗ**, đều qua `CanvasBlueprintValidator` (check mỗi block:
`block_type` phải có trong catalog **và** `target_surface ∈ supported_surfaces`):

| Điểm | Code BE | Hành vi nếu thiếu catalog |
|---|---|---|
| **Commit version** | `internal/usecase/template.go:323` (`CreateVersion`) | `400 ERR_VALIDATION_FAILED` — `blocks[i].block_type: unknown block type "…"` |
| **Publish page** | `internal/usecase/page_canonical.go` `ValidatePublish` → `canvasVal.Validate` | `422 ERR_PAGE_PUBLISH_NOT_READY` |

Bằng chứng (template `4793b38d…`, BE `:9090`):
- draft block `framer_yume_hero` (đã có catalog) → commit **201** ✅
- draft block `framer_bogus_xyz` (chưa catalog) → commit **400** `unknown block type "framer_bogus_xyz"` ✅

> ⚠️ **Lưu ý:** `framer_yume_hero` đã được FE thêm tạm vào catalog QC `:9090` bằng
> `POST /v1/admin/block-types` để verify pilot. Migration dưới đây dùng
> `ON CONFLICT (code) DO NOTHING` nên **idempotent** — chạy được dù row đã tồn tại.
> Cần migration để (a) **vĩnh viễn** (API add không qua migrate → mất khi reset DB),
> (b) áp cho **remote/stg/prod**.

### Migration `000012` — copy-paste

`internal/database/migrations/000012_seed_framer_native_blocks.up.sql`:
```sql
-- 000012_seed_framer_native_blocks
-- Catalog cho block native migrate từ FE src/blocks/ (framer designs).
-- Thêm dần theo tiến độ FE migrate renderer. Pilot 1: framer_yume_hero.
INSERT INTO public.block_types
  (code, name, description, category, icon_name, preview_image_url,
   props_schema, supported_surfaces, min_dimensions, supported_slot_types,
   is_active, engine_version, created_at, updated_at)
VALUES
  ('framer_yume_hero', 'Hero - Yume',
   'Hero tối giản: 2 dòng tên lớn + avatar tròn + email/bio (framer-native).',
   'hero', 'image', NULL, '{}', '{landing}', NULL, '{text,image}',
   true, 'fabric@5.3.0', now(), now())
ON CONFLICT (code) DO NOTHING;
```

`internal/database/migrations/000012_seed_framer_native_blocks.down.sql`:
```sql
DELETE FROM public.block_types WHERE code = 'framer_yume_hero';
```

### Quy ước cho 42 design còn lại (FE sẽ thêm dần)
- **`code`** = `framer_<slug>` snake_case (vd `framer_arpeggio_hero`, `framer_avexa_bento`).
  FE chốt tên khi migrate từng design — **không tự đặt trước** để khỏi lệch với FE.
- **`category`** ∈ `hero | content | media | interactive | advanced` (theo nhóm design).
- **`supported_surfaces`** = `{landing}` cho hầu hết (hero/section); design nào dùng cho
  `ad`/`curate` thì thêm.
- **`supported_slot_types`** = các loại field design dùng (`text`, `image`, `richtext`, `url`…).
- **`engine_version`** = `'fabric@5.3.0'` (khớp 29 row hiện có).

> Cách làm gợi ý: mỗi đợt FE migrate N design → FE gửi danh sách `code` + meta, BE
> append vào 1 migration mới (`000013…`) cùng pattern trên. Hoặc BE mở sẵn
> `POST /v1/admin/block-types` cho FE tự seed (đã hoạt động) rồi BE chốt bằng migration.

---

## 2. FE đã làm gì (tham chiếu)

Pilot `framer_yume_hero` đã hoàn tất phía FE (type-check ✓ · lint ✓ · render + inline-edit
+ commit verify ✓ trên `:9090`):
- `block-editor/types.ts` — thêm union `framer_yume_hero` + `FramerYumeHeroContent` +
  registry `BLOCK_TYPE_META` (Phase 0 đã gom 7 map về 1 nguồn).
- `factory.ts` — default content (port từ `src/blocks/framer-yume-hero/schema.ts`,
  `avatar{url,alt}` → `avatarUrl` string).
- `LayersPanel.tsx` — 6 layer editable (firstName/lastName/avatarUrl/email/bio + nền).
- `blocks/FramerYumeHero.tsx` — renderer native (data-element-key + selectableStyle,
  container-query, mount animation).
- `renderBlock.tsx` + `AddBlockDialog.tsx` (ORDERED_TYPES).

Picker editor lọc `ORDERED_TYPES ∩ /v1/block-types?is_active` → block chỉ hiện sau khi
BE có catalog code (đúng hành vi an toàn: không mời block chưa commit được).
