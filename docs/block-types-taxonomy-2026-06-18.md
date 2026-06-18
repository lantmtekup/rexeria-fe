# Block-types taxonomy (AI recommend) — chuẩn bị cho 80 block type

> Soạn 2026-06-18 (góc marketing). Mỗi block gán: `function`, `page_role`,
> `proof_type`, `needs_media`, `funnel_stage[]`, `goal_tags[]`, `tone[]`,
> `industry_fit[]`, `has_cta`. Dùng để PATCH `/v1/admin/block-types/{code}`
> (form "TAXONOMY CHO AI GỢI Ý") → AI `recommend_blocks` khớp brief chuẩn hơn.

## Enum (đồng bộ BE `oneof`)
- **function:** hook · pain · value_prop · how_it_works · benefits · social_proof · objection · offer · urgency · lead_capture · final_cta
- **page_role:** opener · body · closer
- **proof_type:** logos · testimonial · stats · review *(chỉ block social_proof; còn lại bỏ trống)*
- **needs_media:** image · video · none
- **funnel_stage:** awareness · consideration · conversion · retention
- **goal_tags:** lead_gen · sales · awareness · launch · event
- **tone:** warm · minimal · bold · corporate · playful
- **industry_fit:** agnostic (mặc định) · saas · fnb · fashion · realestate · ...

## JSON bulk-apply (code → taxonomy)
> Mỗi entry = body PATCH `/v1/admin/block-types/{code}`. `industry_fit:["agnostic"]`
> cho hầu hết (block đa ngành); chỉnh riêng nếu cần.

```json
{
  "hero_split":        { "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness","consideration"], "goal_tags": ["lead_gen","sales","awareness","launch"], "tone": ["minimal","bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "hero_overlay":      { "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch","sales"], "tone": ["bold","warm"], "industry_fit": ["agnostic"], "has_cta": true },
  "parallax_hero":     { "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "text_displace_hero":{ "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold","playful"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_yume_hero":  { "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["minimal","warm"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_yuya_hero":  { "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_arpeggio_hero":{ "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold","playful"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_mobius_hero":{ "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_avexa_hero": { "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["minimal","corporate"], "industry_fit": ["saas","agnostic"], "has_cta": true },
  "framer_delvaux_hero_intro":{ "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["warm","minimal"], "industry_fit": ["fashion","agnostic"], "has_cta": true },
  "framer_hero":       { "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_perform_hero":{ "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","sales","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_perform_hero_v2":{ "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","sales","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_bungee_hero":{ "function": "hook", "page_role": "opener", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": true },

  "framer_intro_redefined":{ "function": "value_prop", "page_role": "opener", "needs_media": "none", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness","launch"], "tone": ["minimal","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_paradigm_title":{ "function": "value_prop", "page_role": "body", "needs_media": "none", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness"], "tone": ["bold","minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_studio_manifesto":{ "function": "value_prop", "page_role": "body", "needs_media": "none", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness"], "tone": ["warm","minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "split_screen":      { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","lead_gen"], "tone": ["minimal","bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "spotlight":         { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_signature_feature":{ "function": "benefits", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["minimal","warm"], "industry_fit": ["agnostic"], "has_cta": false },

  "feature_section":   { "function": "benefits", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","lead_gen"], "tone": ["minimal","corporate"], "industry_fit": ["agnostic"], "has_cta": false },
  "card_showcase":     { "function": "benefits", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "accordion_media":   { "function": "benefits", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","lead_gen"], "tone": ["minimal","corporate"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_avexa_bento":{ "function": "benefits", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["minimal","bold"], "industry_fit": ["saas","agnostic"], "has_cta": false },
  "framer_clarity_services":{ "function": "value_prop", "page_role": "body", "needs_media": "none", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","sales"], "tone": ["corporate","minimal"], "industry_fit": ["saas","agnostic"], "has_cta": false },
  "framer_velora_services":{ "function": "value_prop", "page_role": "body", "needs_media": "none", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","sales"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_finnegan_expertise":{ "function": "benefits", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","lead_gen"], "tone": ["corporate","warm"], "industry_fit": ["agnostic"], "has_cta": false },
  "product_spec_sheet":{ "function": "benefits", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration","conversion"], "goal_tags": ["sales"], "tone": ["minimal","corporate"], "industry_fit": ["fashion","agnostic"], "has_cta": false },

  "process_steps":     { "function": "how_it_works", "page_role": "body", "needs_media": "none", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","sales"], "tone": ["minimal","corporate"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_darling_timeline":{ "function": "how_it_works", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration","awareness"], "goal_tags": ["awareness","sales"], "tone": ["warm","minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "sticky_scroll_cards":{ "function": "how_it_works", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": false },

  "photo_gallery":     { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness","sales"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "image_carousel":    { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "carousel_3d":       { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness","launch"], "tone": ["bold","playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "flipbook":          { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","launch"], "tone": ["playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "panorama":          { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["bold"], "industry_fit": ["realestate","agnostic"], "has_cta": false },
  "gallery_3d_depth":  { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "flip_gallery":      { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "wheel_gallery":     { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "image_trail":       { "function": "hook", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "lightbox_flip":     { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "gallery_pan_lens":  { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "seamless_scroll_gallery":{ "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness"], "tone": ["minimal","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_image_stagger":{ "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_horizontal_scroll":{ "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","awareness"], "tone": ["bold","minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_projects_grid":{ "function": "social_proof", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","sales"], "tone": ["minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_vs_collins_projects":{ "function": "social_proof", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","sales"], "tone": ["minimal","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_firma_featured":{ "function": "social_proof", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","sales"], "tone": ["minimal","corporate"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_aestha_project_detail":{ "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales"], "tone": ["warm","minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_aestha_editorial":{ "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness"], "tone": ["warm","minimal"], "industry_fit": ["fashion","agnostic"], "has_cta": false },
  "story_slides":      { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "stories":           { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "flip_showreel":     { "function": "value_prop", "page_role": "body", "needs_media": "video", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "video_gallery":     { "function": "value_prop", "page_role": "body", "needs_media": "video", "funnel_stage": ["awareness","consideration"], "goal_tags": ["awareness","sales"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "image_banner":      { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "marquee_band":      { "function": "social_proof", "page_role": "body", "needs_media": "image", "proof_type": "logos", "funnel_stage": ["consideration"], "goal_tags": ["awareness"], "tone": ["minimal","playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "peel_reveal":       { "function": "hook", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "interactive_grid":  { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "dot_matrix":        { "function": "value_prop", "page_role": "body", "needs_media": "none", "funnel_stage": ["awareness"], "goal_tags": ["awareness"], "tone": ["bold","playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "pixel_reveal":      { "function": "hook", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "svg_morph_overlay": { "function": "hook", "page_role": "body", "needs_media": "none", "funnel_stage": ["awareness"], "goal_tags": ["awareness"], "tone": ["bold","playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "image_explosion":   { "function": "hook", "page_role": "body", "needs_media": "image", "funnel_stage": ["awareness"], "goal_tags": ["awareness","launch"], "tone": ["bold","playful"], "industry_fit": ["agnostic"], "has_cta": false },
  "letter_slider":     { "function": "hook", "page_role": "body", "needs_media": "none", "funnel_stage": ["awareness"], "goal_tags": ["awareness"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "hover_reveal_list": { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","awareness"], "tone": ["minimal","bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "hover_grid_reveal": { "function": "value_prop", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["sales","awareness"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": false },
  "hover_equalizer_heading":{ "function": "hook", "page_role": "body", "needs_media": "none", "funnel_stage": ["awareness"], "goal_tags": ["awareness"], "tone": ["playful","bold"], "industry_fit": ["agnostic"], "has_cta": false },

  "framer_perform_about":{ "function": "social_proof", "page_role": "body", "proof_type": "testimonial", "needs_media": "image", "funnel_stage": ["consideration","conversion"], "goal_tags": ["sales","lead_gen"], "tone": ["warm","corporate"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_large_quote":{ "function": "social_proof", "page_role": "body", "proof_type": "testimonial", "needs_media": "none", "funnel_stage": ["consideration","conversion"], "goal_tags": ["sales"], "tone": ["warm","minimal"], "industry_fit": ["agnostic"], "has_cta": false },
  "framer_stats_grid": { "function": "social_proof", "page_role": "body", "proof_type": "stats", "needs_media": "none", "funnel_stage": ["consideration"], "goal_tags": ["sales","lead_gen"], "tone": ["corporate","minimal"], "industry_fit": ["saas","agnostic"], "has_cta": false },
  "framer_team_directory":{ "function": "social_proof", "page_role": "body", "needs_media": "image", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","awareness"], "tone": ["warm","corporate"], "industry_fit": ["agnostic"], "has_cta": false },

  "pricing_table":     { "function": "offer", "page_role": "closer", "needs_media": "none", "funnel_stage": ["conversion"], "goal_tags": ["sales"], "tone": ["minimal","corporate"], "industry_fit": ["saas","agnostic"], "has_cta": true },
  "framer_perform_pricing":{ "function": "offer", "page_role": "closer", "needs_media": "none", "funnel_stage": ["conversion"], "goal_tags": ["sales"], "tone": ["bold","minimal"], "industry_fit": ["saas","agnostic"], "has_cta": true },

  "framer_faq_minimal":{ "function": "objection", "page_role": "closer", "needs_media": "none", "funnel_stage": ["conversion"], "goal_tags": ["lead_gen","sales"], "tone": ["minimal","corporate"], "industry_fit": ["agnostic"], "has_cta": false },

  "booking_form":      { "function": "lead_capture", "page_role": "closer", "needs_media": "none", "funnel_stage": ["conversion"], "goal_tags": ["lead_gen","event"], "tone": ["warm","minimal"], "industry_fit": ["agnostic"], "has_cta": true },
  "quiz":              { "function": "lead_capture", "page_role": "body", "needs_media": "none", "funnel_stage": ["consideration","conversion"], "goal_tags": ["lead_gen"], "tone": ["playful"], "industry_fit": ["agnostic"], "has_cta": true },
  "poll":              { "function": "lead_capture", "page_role": "body", "needs_media": "none", "funnel_stage": ["consideration"], "goal_tags": ["lead_gen","awareness"], "tone": ["playful"], "industry_fit": ["agnostic"], "has_cta": true },

  "cta_section":       { "function": "final_cta", "page_role": "closer", "needs_media": "none", "funnel_stage": ["conversion"], "goal_tags": ["lead_gen","sales"], "tone": ["bold"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_explore_cta":{ "function": "final_cta", "page_role": "closer", "needs_media": "none", "funnel_stage": ["conversion"], "goal_tags": ["lead_gen","sales","launch"], "tone": ["bold","minimal"], "industry_fit": ["agnostic"], "has_cta": true },
  "framer_contact_footer":{ "function": "lead_capture", "page_role": "closer", "needs_media": "none", "funnel_stage": ["conversion"], "goal_tags": ["lead_gen"], "tone": ["minimal","corporate"], "industry_fit": ["agnostic"], "has_cta": true }
}
```

> `legacy_embed` bỏ qua (wrapper kỹ thuật, không phải block marketing).

## Ghi chú áp dụng
- Trường mảng (funnel/goal/tone/industry_fit) gửi cả mảng; `proof_type` chỉ set
  cho 7 block social_proof, còn lại bỏ field.
- Có thể viết script bulk PATCH lặp object trên → `/v1/admin/block-types/{code}`
  (admin token). Hoặc nhập tay qua form từng block.
- Đây là baseline marketing — tinh chỉnh `industry_fit` theo brand thực tế.
