export type Lang = 'vi' | 'en';
export type Device = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'hero_split'
  | 'altura_olympus'
  | 'hero_scroll'
  | 'scroll_mattis'
  | 'hero_overlay'
  | 'feature_section'
  | 'booking_form'
  | 'cta_section'
  | 'image_carousel'
  | 'stories'
  | 'split_screen'
  | 'quiz'
  | 'poll'
  | 'carousel_3d'
  | 'flipbook'
  | 'panorama'
  // ── Animation blocks (port từ CodeGrid 40-demo, mô hình "block tự chạy") ──
  | 'text_displace_hero'
  | 'image_trail'
  | 'sticky_scroll_cards'
  | 'gallery_3d_depth'
  | 'parallax_hero'
  | 'lightbox_flip'
  | 'flip_gallery'
  | 'wheel_gallery'
  | 'hover_reveal_list'
  | 'hover_equalizer_heading'
  | 'brutalist_text'
  | 'image_explosion'
  | 'marquee_band'
  | 'letter_slider'
  | 'seamless_scroll_gallery'
  | 'product_spec_sheet'
  | 'story_slides'
  | 'accordion_media'
  | 'spotlight'
  | 'process_steps'
  | 'dot_matrix'
  | 'interactive_grid'
  | 'pixel_reveal'
  | 'masterise_home_inside'
  // ── Framer-native blocks (migrate từ src/blocks/ legacy → native) ──────
  // Mỗi design framer = 1 block_type riêng, render native + edit inline được.
  // BE phải có code tương ứng active trong catalog block_types.
  | 'framer_yume_hero'
  | 'framer_yuya_hero'
  | 'framer_arpeggio_hero_v2'
  | 'framer_perform_hero'
  | 'framer_bungee_hero_v2'
  | 'framer_purevisuals_hero'
  | 'framer_intro_redefined'
  | 'framer_explore_cta'
  | 'framer_flat_white_process'
  | 'framer_studio_manifesto'
  | 'framer_stats_grid'
  | 'framer_projects_grid'
  | 'framer_team_directory'
  | 'framer_image_stagger'
  | 'framer_clarity_services'
  | 'framer_faq_minimal'
  | 'framer_darling_timeline'
  | 'framer_nftpull_timeline'
  | 'framer_signature_feature'
  | 'framer_vs_collins_projects'
  | 'framer_aestha_editorial'
  | 'aestha_explore'
  | 'aestha_studio'
  | 'aestha_contact'
  | 'aestha_project'
  | 'framer_perform_about'
  | 'framer_ignitex_step'
  | 'framer_realestate02_story'
  | 'framer_realestate02_quote'
  | 'framer_realestate02_product'
  | 'framer_realestate02_overview'
  | 'framer_realestate02_location'
  | 'framer_realestate02_commute'
  | 'framer_realestate02_map'
  | 'framer_realestate02_gallery'
  | 'framer_realestate02_menu'
  | 'framer_perform_pricing'
  | 'framer_firma_template_strategy_digital'
  | 'housent_our_excellence'
  | 'framer_estancia_about_us'
  | 'readymag_case_section'
  // ── Mint-coint sections tách thành data block (port từ src/templates) ──
  | 'mint_details'
  | 'mint_sku'
  | 'mint_hero'
  | 'mint_variants'
  | 'mint_discover'
  // ── PNJ (Citizen L Arcly) — port từ apps/pnj ──
  | 'pnj_hero'
  | 'pnj_details'
  | 'pnj_variant'
  | 'pnj_header'
  | 'pnj_sticky_menu'
  | 'pnj_cta'
  // ── The Grand (Masterise) — port từ apps/the-grand ──
  | 'the_grand_intro'
  | 'the_grand_location'
  | 'the_grand_discover'
  | 'the_grand_service'
  | 'the_grand_about'
  | 'the_grand_footer'
  // ── Mintcoin-v2 sections ──
  | 'mintv2_emblem'
  | 'mintv2_services'
  | 'mintv2_manifesto'
  | 'mintv2_process'
  | 'mintv2_cta'
  | 'mintv2_works'
  // ── Import từ 360-admin-cms ──
  | 'linea_portfolio'
  // ── Mint2026 "The Vault" ──
  | 'mint_vault_hero'
  | 'mint_vault_craft'
  | 'mint_vault_reveal'
  | 'mint_vault_collection'
  | 'mint_vault_invitation'
  // ── Delvaux clone sections ──
  | 'delvaux_header'
  | 'delvaux_subnav'
  | 'delvaux_hero'
  | 'delvaux_details'
  | 'delvaux_product'
  | 'delvaux_variant'
  | 'q80_experience'
  | 'q80_menu'
  // ── Cool Hunter (editorial, port từ apps/cool-hunter) ──
  | 'cool_hunter_hero'
  | 'cool_hunter_section_progress'
  | 'cool_hunter_story'
  | 'cool_hunter_gallery'
  | 'cool_hunter_product'
  | 'cool_hunter_quote'
  | 'cool_hunter_footer'
  // ── Housent (real-estate template, clone từ housent.webflow.io) ──
  | 'housent_hero'
  | 'housent_stats'
  | 'housent_listings'
  | 'housent_cta'
  | 'housent_footer'
  | 'housent_about'
  | 'housent_excellence'
  | 'housent_solutions'
  | 'housent_values'
  | 'housent_faq'
  | 'housent_testimonial'
  | 'housent_blogs'
  // ── Lumea (luxury real-estate template, clone từ lumea-eco.webflow.io) ──
  | 'lumea_hero'
  | 'lumea_statement'
  | 'lumea_immersive'
  | 'lumea_handcrafted'
  | 'lumea_amenities'
  | 'lumea_testimonial'
  | 'lumea_gallery'
  | 'lumea_footer'
  | 'nordhaven_hero'
  | 'nordhaven_about'
  | 'nordhaven_services'
  | 'nordhaven_properties'
  | 'nordhaven_testimonials'
  | 'nordhaven_faq'
  | 'nordhaven_gallery'
  | 'nordhaven_footer'
  | 'firma_hero'
  | 'firma_statement'
  | 'firma_work'
  | 'firma_testimonial'
  | 'firma_services'
  | 'firma_footer'
  | 'ignitex_hero'
  | 'ignitex_services'
  | 'ignitex_projects'
  | 'ignitex_about'
  | 'ignitex_cta'
  | 'ignitex_footer'
  | 'readymag_marquee'
  | 'readymag_projects'
  | 'readymag_footer'
  | 'protection_scrollytelling'
  // ── Interactive ad creative (clone từ 360-admin-cms, xem PageMetadataAd) ──
  | 'interactive_ad_widget'
  // ── Framer clone: BrightEdge agency template (layout/animation only —
  // copy + ảnh là placeholder, xem docs/be-audit ghi chú license) ──
  | 'brightedge_hero'
  // ── Springs Estate clone sections (springs.estate, real-estate landing) ──
  | 'springs_header'
  | 'springs_gallery'
  | 'springs_hero'
  | 'springs_intro'
  | 'springs_wellness'
  | 'springs_nature_place'
  | 'springs_map'
  | 'real_estate_location'
  | 'real_estate_hero'
  | 'real_estate_info'
  | 'real_estate_overview'
  | 'real_estate_highlights'
  | 'real_estate_villa'
  | 'real_estate_utilities'
  | 'springs_design'
  | 'springs_residences'
  | 'springs_interiors'
  | 'springs_contact_footer'
  // ── Sustainit (Readymag source) ──
  | 'sustainit_our_expertise'
  | 'rolex_collection_hero'
  | 'rolex_collection_nav'
  | 'rolex_collection_contact'
  | 'rolex_collection_work'
  | 'rolex_collection_project';

export interface HeroSplitStat {
  value: string;
  label: string;
}

export interface ImageTransform {
  rotation: number; // degrees, -180..180
  scale: number; // 0.5..2.0 (50%..200%)
}

export const DEFAULT_IMAGE_TRANSFORM: ImageTransform = {
  rotation: 0,
  scale: 1,
};

/**
 * Click-through link attached to an arbitrary element (Editor V2).
 * Applied via event delegation at render time, not a real `<a>` tag.
 */
export interface ElementLink {
  href: string;
  target?: '_self' | '_blank';
}

/**
 * Per-element style overrides applied on top of the block's default
 * presentation.
 */
export interface ElementStyle {
  color?: string; // CSS color string (`#fff`, `rgba(...)`)
  fontSize?: number; // px
  fontWeight?: number; // 100..900
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  /** Font id from `src/lib/fonts.ts` (e.g. `inter`, `be-vietnam-pro`). */
  fontFamily?: string;
  /** Explicit size in px (Editor V2). undefined = auto (natural layout). */
  width?: number;
  height?: number;
  /** Per-element fill — `token:*` role or raw CSS color. */
  backgroundColor?: string;
  /** 0..1 */
  opacity?: number;
  borderRadius?: number; // px
  /** Full CSS box-shadow value (preset-driven in the inspector UI). */
  boxShadow?: string;
  /** px → `filter: blur(Npx)` */
  blur?: number;
  link?: ElementLink;
}

export type ElementStylesMap = Record<string, ElementStyle | undefined>;

/**
 * Per-element free-position offset (Figma-style canvas drag).
 *
 * Applied as `transform: translate(Xpx, Ypx)` on top of the element's
 * natural flex/grid position — so the element stays in its sibling slot
 * but can be nudged anywhere visually. This preserves responsive layout
 * (the offset is in the same coord space at every breakpoint) while
 * giving users free-form arrangement.
 *
 * Setting both x and y to 0 is treated as "no override" and the entry
 * is dropped when persisted, keeping wire payloads small.
 */
export interface ElementPosition {
  x: number;
  y: number;
}

export type ElementPositionsMap = Record<string, ElementPosition | undefined>;

/**
 * Block-level background override. Applies to the block's outer card.
 * `color` overrides the block's default background color; `imageUrl` is
 * rendered as a layer behind all block content (positioned absolutely).
 */
export interface BlockBackground {
  color?: string;
  imageUrl?: string;
  imageTransform?: ImageTransform;
}

export interface HeroSplitContent {
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageTransform?: ImageTransform;
  stats: HeroSplitStat[];
  ctaText: string;
  ctaLink: string;
}

export interface AlturaOlympusFeature {
  label: string;
  icon: string;
}

export interface AlturaOlympusContent {
  eyebrow: string;
  heading: string;
  description: string;
  features: AlturaOlympusFeature[];
  ctaText: string;
  ctaLink: string;
  /** 4 ảnh scrub (m1 cover → m2 companion/seq → m3 → m4). Fallback assets nếu thiếu. */
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
  image4Url?: string;
}

export interface HeroScrollContent {
  title: string;
  subtitle: string;
  /** 4 ảnh scroll-reveal (m1→m4). Fallback assets nếu thiếu. */
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
  image4Url?: string;
}

/** Một slide Scroll Mattis (media + marquee + meta). */
export interface ScrollMattisSlideItem {
  url: string;
  bgWord: string;
  title: string;
  category1: string;
  category2: string;
  year: string;
}

export interface ScrollMattisContent {
  portfolioLabel: string;
  /**
   * Preferred: số slide động (thêm/xoá trong Layers / toolbar).
   * Khi có `slides[]` thì bỏ qua flat slide1/2/3 bên dưới.
   */
  slides?: ScrollMattisSlideItem[];
  /** Legacy flat 3-slide — fallback khi chưa migrate sang slides[]. */
  slide1Url?: string;
  slide2Url?: string;
  slide3Url?: string;
  /** Chữ marquee chạy ngang (bgWord) theo slide. */
  slide1BgWord?: string;
  slide2BgWord?: string;
  slide3BgWord?: string;
  /** Meta dưới khung letterbox. */
  slide1Title?: string;
  slide2Title?: string;
  slide3Title?: string;
  slide1Category1?: string;
  slide1Category2?: string;
  slide2Category1?: string;
  slide2Category2?: string;
  slide3Category1?: string;
  slide3Category2?: string;
  slide1Year?: string;
  slide2Year?: string;
  slide3Year?: string;
}

export interface HeroOverlayContent {
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundUrl: string;
  backgroundTransform?: ImageTransform;
}

export interface FeatureItem {
  icon: string; // lucide icon name (Home, Trees, ShieldCheck, Sparkles, ...)
  label: string;
  body: string;
}

export interface FeatureSectionContent {
  eyebrow: string;
  title: string;
  description: string;
  features: FeatureItem[];
}

export interface GalleryPhoto {
  url: string;
  caption: string;
  transform?: ImageTransform;
}

export interface BookingReason {
  label: string;
  value: string;
}

export interface BookingFormContent {
  eyebrow: string;
  title: string;
  description: string;
  reasons: BookingReason[];
  submitText: string;
  noteText: string;
}

/** Mint-coint "details" section (port). Title + 2 đoạn mô tả. */
export interface MintDetailsContent {
  title: string;
  paragraph1: string;
  paragraph2: string;
}

/** Mint-coint "sku-cta" section (port). Ghost title lớn + ảnh nền/packaging. */
export interface MintSkuContent {
  title: string;
  paintingUrl: string;
  packagingUrl: string;
}

/** Mint-coint "hero" section (port). 3 dòng overlay (canvas scrub giữ nội bộ). */
export interface MintHeroContent {
  heroLine1: string;
  heroLine2: string;
  heroLine3: string;
}

export interface MintVariantItem {
  key: string;
  label: string;
  swatch: string;
  image: string;
  ref: string;
}

/** Thông tin hiển thị trong Discover drawer của Mint · Variants (CMS-editable).
 *  Nhập liệu qua panel Lớp (folder "Drawer chi tiết") — drawer không mở trên
 *  canvas nên các field này sửa bằng toolbar chứ không inline. */
export interface MintDiscoverInfo {
  title: string;
  badge: string;
  subtitle: string;
  dimensions: string;
  faceValue: string;
  detailsText: string;
  packagingText: string;
  shippingText: string;
}

/** Mint-coint "variants" section (port). Swatch picker + parallax title. */
export interface MintVariantsContent {
  titleLine1: string;
  titleLine2: string;
  variants: MintVariantItem[];
  /** Optional — content cũ (seed trước khi thêm drawer CMS) có thể thiếu field. */
  discover?: MintDiscoverInfo;
}

export interface MintDiscoverTab {
  key: string;
  label: string;
  desc: string;
  img: string;
  dotX: number;
  dotY: number;
}

/** Mint-coint "discover" section (port). Hotspot + drawer (tự chứa). */
export interface MintDiscoverContent {
  variant: '1' | '2';
  mainImage: string;
  mainAlt: string;
  tabs: MintDiscoverTab[];
}

/** PNJ hero hotspot (canvas scroll-step + drawer). */
export interface PnjHeroHotspot {
  key: string;
  label: string;
  desc: string;
  img: string;
  /** Dot position — % of canvas container. */
  dotX: number;
  dotY: number;
}

/** One device frame sequence (prefix + padded index + ext). */
export interface PnjHeroFrameSequence {
  total: number;
  prefix: string;
}

/**
 * Optional CMS frame config for PnjHero.
 * Omit from content → runtime falls back to PNJ defaults (`/pnj/frames`).
 */
export interface PnjHeroFramesConfig {
  desktop: PnjHeroFrameSequence;
  mobile: PnjHeroFrameSequence;
  /** File extension including dot. Default `.webp`. */
  ext?: string;
}

/**
 * PNJ hero — storefront + overlay copy + canvas frame-scrub + hotspots.
 * Port từ apps/pnj HeroIntroSection.
 * Frame sequence defaults to public/pnj; override via optional `frames` JSON.
 */
export interface PnjHeroContent {
  subtitle: string;
  /**
   * Tiêu đề nhiều dòng (thêm/xoá trên canvas).
   * Legacy: `titleLine1` / `titleLine2` vẫn được resolve nếu thiếu mảng này.
   */
  titleLines?: string[];
  /** @deprecated Prefer `titleLines`. */
  titleLine1?: string;
  /** @deprecated Prefer `titleLines`. */
  titleLine2?: string;
  storefrontUrl: string;
  hotspots: PnjHeroHotspot[];
  /** Optional — omit = PNJ defaults (/pnj/frames). */
  frames?: PnjHeroFramesConfig;
  /** Optional storefront scrim — omit = PNJ dual-gradient default. */
  scrim?: PnjHeroScrimConfig;
}

/**
 * Cool Hunter hero — logo bar + tiêu đề nhiều dòng + khung ảnh scrub từ
 * 78%×75% (desktop) / 92%×78% (mobile) lên full stage. Port từ
 * apps/cool-hunter Hero.tsx (Header logo gộp luôn vào block này).
 *
 * Tiêu đề render 2 lần: bản đen nằm dưới, bản trắng bị khung ảnh clip →
 * chữ đổi màu per-pixel đúng mép ảnh khi ảnh phủ qua.
 */
export interface CoolHunterHeroContent {
  logoUrl?: string;
  logoAlt?: string;
  /** Tiêu đề nhiều dòng (thêm/xoá trên canvas) — dùng chung plumbing với PnjHero. */
  titleLines?: string[];
  imageUrl?: string;
  imageAlt?: string;
}

/**
 * Cool Hunter Section Progress — rail tiến độ + nhãn section bên phải.
 * Port từ apps/cool-hunter SectionProgress.tsx.
 */
export interface CoolHunterSectionProgressItem {
  sectionId: string;
  label: string;
}

export interface CoolHunterSectionProgressContent {
  sections?: CoolHunterSectionProgressItem[];
}

/**
 * Cool Hunter Story — hai đoạn văn + khung ảnh scrub 4 beat (pin→sticky).
 * Port từ apps/cool-hunter StorySection.tsx.
 */
export interface CoolHunterStoryContent {
  text1?: string;
  text2?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Nhãn dọc bên phải (desktop): "01 - Welcome". */
  label?: string;
}

/**
 * Cool Hunter Gallery — dải ngang 3 ảnh+caption scrub (stack → row → scroll).
 * Port từ apps/cool-hunter GallerySection.tsx.
 */
export interface CoolHunterGalleryItem {
  imageUrl?: string;
  imageAlt?: string;
  text?: string;
}

export interface CoolHunterGalleryContent {
  items?: CoolHunterGalleryItem[];
  /** Nhãn dọc bên phải (desktop): "02 - Lake Wehapa". */
  label?: string;
}

/**
 * Cool Hunter Product — mask bg scale + title + product table + panel copy.
 * Port từ apps/cool-hunter ProductSection.tsx.
 */
export interface CoolHunterProductContent {
  title?: string;
  body?: string;
  bgUrl?: string;
  productUrl?: string;
  productAlt?: string;
  /** Nhãn dọc bên phải (desktop): "03 - Architecture". */
  label?: string;
}

/**
 * Cool Hunter Quote — quote giữa + ảnh kéo từ phải phủ màn (veil nhạt dần).
 * Port từ apps/cool-hunter QuoteSection.tsx.
 */
export interface CoolHunterQuoteContent {
  quote?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Nhãn dọc bên phải (desktop): "04 - Interior Design". */
  label?: string;
}

/**
 * Cool Hunter Footer — CTA signup + icon; ảnh nền dâng từ dưới (scrub, không pin).
 * Port từ apps/cool-hunter FooterSection.tsx.
 */
export interface CoolHunterFooterContent {
  bgUrl?: string;
  iconUrl?: string;
  /** Hỗ trợ xuống dòng bằng \\n. */
  title?: string;
  ctaText?: string;
  ctaHref?: string;
}

/** Named scrim presets for PnjHero storefront wash. */
export type PnjHeroScrimPresetId =
  | 'pnj'
  | 'none'
  | 'softLight'
  | 'softDark'
  | 'mint'
  | 'navyFade';

/** One absolute overlay layer on the storefront image. */
export interface PnjHeroScrimLayer {
  /** CSS `background` (linear/radial/solid). */
  background: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  height?: string;
  width?: string;
  opacity?: number;
}

/**
 * Storefront scrim config. Omit from content → PNJ default layers.
 * Non-empty `layers` replaces the named preset entirely.
 */
export interface PnjHeroScrimConfig {
  preset?: PnjHeroScrimPresetId;
  layers?: PnjHeroScrimLayer[];
}

/**
 * PNJ details — pin + scrub word-reveal (title + N đoạn).
 * Port từ apps/pnj DetailsSection.
 */
export interface PnjDetailsContent {
  title: string;
  /** Đoạn văn (thêm/xoá trong editor). */
  paragraphs: string[];
}

/**
 * The Grand · Intro — section editorial nền nâu (heading + description căn giữa,
 * tượng sư tử neo đáy). Port từ apps/the-grand Intro.
 */
export interface TheGrandIntroContent {
  heading: string;
  description: string;
  /** Ảnh tượng neo đáy giữa. */
  imageUrl: string;
  imageAlt: string;
}

/** 1 địa điểm của section The Grand · Location (item trái ↔ card phải). */
export interface TheGrandLocationItem {
  /** Text hiển thị bên trái + tiêu đề card bên phải. */
  label: string;
  imageUrl: string;
  imageAlt?: string;
  description: string;
  /** Con số nổi bật, vd '1' hoặc khoảng '3-50'. */
  statValue: string;
  /** Đơn vị, vd 'Phút đi xe'. */
  statUnit: string;
}

/**
 * The Grand · Location — section "Vị Trí Độc Tôn": aside trái (heading + danh
 * sách địa điểm bấm được) ghim đứng yên, cột phải trượt qua từng card khi cuộn.
 * Port từ apps/the-grand Location.
 */
export interface TheGrandLocationContent {
  heading: string;
  items: TheGrandLocationItem[];
}

/** 1 khu vực của section The Grand · Discover (1 lớp ảnh trong stack). */
export interface TheGrandDiscoverItem {
  /** Tên khu vực — hiện ở nav (phải) + caption (trái). Lưu thường, in hoa bằng CSS. */
  label: string;
  imageUrl: string;
  imageAlt?: string;
}

/**
 * The Grand · Discover — section "Khám Phá Thư Viện": stack ảnh ghim 1 màn, scrub
 * theo cuộn để ảnh active lùi ra sau-trái (ghost) nhường chỗ ảnh kế trượt vào
 * giữa; nav phải + caption trái bám theo. Port từ apps/the-grand Discover.
 */
export interface TheGrandDiscoverContent {
  heading: string;
  description: string;
  /** Ảnh nền mờ decorative phía sau (optional — để rỗng là tắt). */
  backdropImage?: string;
  items: TheGrandDiscoverItem[];
}

/** 1 dịch vụ của section The Grand · Service (card ảnh trái + info phải). */
export interface TheGrandServiceItem {
  /** Tiêu đề dịch vụ, vd 'Dịch vụ ăn uống'. */
  label: string;
  imageUrl: string;
  imageAlt?: string;
  description: string;
}

/**
 * The Grand · Service — section "Dịch Vụ": dải cream tiêu đề dọc bên trái đứng
 * yên, track card trượt ngang đè lên khi cuộn. Port từ apps/the-grand Service.
 */
export interface TheGrandServiceContent {
  heading: string;
  items: TheGrandServiceItem[];
}

/** 1 đối tác trong hàng logo cuối section The Grand · About. */
export interface TheGrandAboutPartner {
  /** Tên đơn vị — dùng làm alt của logo. */
  name: string;
  /** Đường dẫn logo (SVG/PNG). */
  logo: string;
  /** Vai trò, vd 'Công ty kiến trúc'. */
  role: string;
}

/**
 * The Grand · About — section "Giới Thiệu" nền nâu tối: trái ảnh skyline, phải
 * cột nội dung (logo → tiêu đề → mô tả → kẻ ngang → hàng đối tác). Port từ
 * apps/the-grand About.
 */
export interface TheGrandAboutContent {
  /** Logo thương hiệu đứng đầu cột nội dung. */
  logoUrl: string;
  logoAlt: string;
  heading: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  partners: TheGrandAboutPartner[];
}

/** 1 link chính sách ở cột 3 của The Grand · Footer. */
export interface TheGrandFooterPolicy {
  label: string;
  href: string;
}

/**
 * Nền tảng social có sẵn icon SVG trong block — `platform` chọn glyph nào,
 * xem `blocks/theGrandFooterSocialIcons.tsx`.
 */
export type TheGrandFooterSocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tripadvisor'
  | 'youtube'
  | 'tiktok';

/** 1 icon social ở cột 4 của The Grand · Footer. */
export interface TheGrandFooterSocial {
  platform: TheGrandFooterSocialPlatform;
  href: string;
  /** aria-label; rỗng → fallback theo tên platform. */
  label?: string;
}

/**
 * The Grand · Footer — chân trang nền kem: hàng logo (The Grand · Masterise
 * ngăn nhau bởi kẻ dọc), 4 cột (địa chỉ / liên hệ / chính sách / social + đăng
 * ký bản tin), thanh copyright tối căn giữa. Port từ apps/the-grand Footer.
 *
 * `policies` và `socials` là mảng ĐỘNG — thêm/xoá qua ElementToolbar.
 * Href `mailto:` / `tel:` suy ra từ `email` / `hotline`, không phải field riêng.
 */
export interface TheGrandFooterContent {
  logoPrimaryUrl: string;
  logoPrimaryAlt: string;
  logoSecondaryUrl: string;
  logoSecondaryAlt: string;

  projectAddressLabel: string;
  projectAddress: string;
  showroomAddressLabel: string;
  showroomAddress: string;

  emailLabel: string;
  email: string;
  hotlineLabel: string;
  hotline: string;

  policies: TheGrandFooterPolicy[];

  socialLabel: string;
  socials: TheGrandFooterSocial[];

  newsletterLabel: string;
  newsletterPlaceholder: string;
  newsletterSubmitText: string;

  copyright: string;
}

/** Một góc nhìn sản phẩm trong PNJ · Variant. */
export interface PnjVariantItem {
  key: string;
  label: string;
  desc: string;
  image: string;
  highlights: string[];
}

/**
 * PNJ variant — pin + scrub chapters (ảnh + copy theo góc nhìn).
 * Port từ apps/pnj ProductVariantSection.
 */
export interface PnjVariantContent {
  ctaText: string;
  variants: PnjVariantItem[];
}

/** Một mục trong thanh sticky menu PNJ. */
export interface PnjStickyMenuItem {
  key: string;
  label: string;
  /** Section id (vd `discover`) hoặc URL https://… */
  link: string;
}

/**
 * PNJ header — logo cố định góc trên, thu nhỏ khi scroll.
 * Port từ apps/pnj Header.
 */
export interface PnjHeaderContent {
  logoUrl: string;
  logoAlt: string;
  /** URL ngoài hoặc `#` / path nội bộ. Để trống = không điều hướng. */
  logoHref: string;
}

/**
 * PNJ sticky menu — thanh điều hướng cố định đáy viewport.
 * Port từ apps/pnj StickyMenu.
 */
export interface PnjStickyMenuContent {
  items: PnjStickyMenuItem[];
  ctaText: string;
  /** Section id hoặc URL https://… */
  ctaLink: string;
}

/**
 * PNJ CTA — section tối cuối trang với form "để lại thông tin"
 * (email + phone + note). Port từ apps/pnj CtaSection.
 * Chưa nối backend — submit chỉ hiện thông báo cảm ơn cục bộ.
 */
export interface PnjCtaContent {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  noteLabel: string;
  notePlaceholder: string;
  submitText: string;
  /** Thông báo sau khi gửi (chỉ hiện trên /p, không hiện trong editor). */
  successMessage: string;
}

// ── Mintcoin-v2 sections (port từ apps/mintcoin-v2) ──────────────────────
/** Emblem — coin trung tâm + tranh nền 2 bên, title + copy. */
export interface MintV2EmblemContent {
  title: string;
  description: string;
  coinUrl: string;
  decorUrl: string;
}

export interface MintV2ServiceItem {
  key: string;
  label: string;
  preview: string;
  caption: string;
}

/** Services — heading lớn + danh sách chọn (trái) + ảnh preview (phải). */
export interface MintV2ServicesContent {
  eyebrow: string;
  title: string;
  items: MintV2ServiceItem[];
}

/** Manifesto — copy serif + 4 panel xám wipe 2-phase (panel/line decor cố định). */
export interface MintV2ManifestoContent {
  text: string;
}

export interface MintV2ProcessStep {
  key: string;
  no: string;
  title: string;
  body: string;
}

/** Process — center-line scrub + các step zigzag (fade-up). */
export interface MintV2ProcessContent {
  eyebrow: string;
  title: string;
  steps: MintV2ProcessStep[];
}

export interface MintV2Contact {
  key: string;
  label: string;
  value: string;
}

/** Cta — headline + copy + contact strip + form lead-capture. */
export interface MintV2CtaContent {
  eyebrow: string;
  title: string;
  description: string;
  buyLabel: string;
  buyUrl: string;
  contacts: MintV2Contact[];
}

export interface MintV2WorkCard {
  key: string;
  number: string;
  jpLabel: string;
  category: string;
  title: string;
  hero: string;
  backdrop: string;
  thumbs: string[];
  /** Panel background hex (e.g. `#efe9dc`). */
  bgColor: string;
  /** @deprecated Prefer `bgColor`. Legacy Tailwind class e.g. `bg-[#efe9dc]`. */
  bgClass?: string;
}

/** Works — gallery hover-morph card (zigzag) + lightbox. */
export interface MintV2WorksContent {
  eyebrow: string;
  title: string;
  cards: MintV2WorkCard[];
}

// ── Import từ 360-admin-cms (port theo contract) ─────────────────────────
export interface LineaPortfolioItem {
  img: string;
}

/** Linea Portfolio — eyebrow + heading 3 phần + ticker 9 ảnh (3 cột cuộn). */
export interface LineaPortfolioContent {
  eyebrow: string;
  headingPre: string;
  headingAccent: string;
  headingPost: string;
  items: LineaPortfolioItem[];
  bgColor: string;
  textColor: string;
}

// ── Mint2026 "The Vault" sections (tách từ apps/mint2026) ─────────────────
/** Vault Hero — image-trail tương tác + overlay text. */
export interface MintVaultHeroContent {
  eyebrow: string;
  title: string;
  description: string;
  hintText: string;
  images: string[];
}

export interface MintVaultCraftItem {
  title: string;
  description: string;
  imageUrl: string;
}

/** Vault Craft — heading + accordion media (proof). */
export interface MintVaultCraftContent {
  eyebrow: string;
  title: string;
  items: MintVaultCraftItem[];
}

/** Vault Reveal — gallery 3D "cửa hầm" + parallax sticky. */
export interface MintVaultRevealContent {
  eyebrow: string;
  title: string;
  images: string[];
}

/** Vault Invitation — nền coin-explosion + spotlight + lead form. */
export interface MintVaultInvitationContent {
  eyebrow: string;
  title: string;
  note: string;
  backgroundImageUrl: string;
  images: string[];
  /** Chữ trên form lead — sửa qua Layers (không gắn key lên <input> thật). */
  emailPlaceholder: string;
  submitText: string;
  successMessage: string;
}

export interface MintVaultCoin {
  key: string;
  name: string;
  image: string;
  metal: string;
  weight: string;
  price: string;
  url: string;
}

/** Vault Collection — cuộn ngang (pin) coin + tilt + spotlight + panel info. */
export interface MintVaultCollectionContent {
  eyebrow: string;
  subLabel: string;
  coins: MintVaultCoin[];
}

export interface CtaSectionContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryText: string;
  primaryLink: string;
  secondaryText: string;
  secondaryLink: string;
  backgroundUrl: string;
  backgroundTransform?: ImageTransform;
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  caption?: string;
  altText?: string;
  href?: string;
}

export interface ImageCarouselContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  slides: CarouselSlide[];
  /** Auto-advance interval ms; 0 / undefined = manual only. */
  autoplayMs?: number;
  showPagination?: boolean;
  showNavArrows?: boolean;
}

/**
 * Interactive ad creative — clone của tính năng "quảng cáo tương tác" từ
 * 360-admin-cms (xem PageMetadataAdInteractive ở services/rexer/types.ts).
 * Một block duy nhất, atomic: nhiều slide, mỗi slide có ảnh/video nền +
 * hotspot định vị theo % + nút CTA. Khác `ImageCarouselContent` ở chỗ mỗi
 * slide còn mang hotspots/ctas riêng thay vì chỉ caption tĩnh.
 */
export interface InteractiveAdHotspot {
  id: string;
  xPct: number; // 0..100
  yPct: number; // 0..100
  label: string;
  /** Liên kết tới 1 cta trong cùng slide — click hotspot mở/điều hướng theo cta đó. */
  ctaId?: string;
}

export interface InteractiveAdCta {
  id: string;
  label: string;
  href: string;
  style: 'primary' | 'secondary';
}

export interface InteractiveAdSlide {
  id: string;
  backgroundType: 'image' | 'video';
  backgroundUrl: string;
  /** Auto-advance khi slide này đang active; 0/undefined = dùng autoplayMs chung. */
  durationMs?: number;
  hotspots: InteractiveAdHotspot[];
  ctas: InteractiveAdCta[];
}

export interface InteractiveAdWidgetContent {
  slides: InteractiveAdSlide[];
  closeable: boolean;
  /** Auto-advance interval ms mặc định cho mọi slide; 0/undefined = manual only. */
  autoplayMs?: number;
}

/**
 * Hero 2 cột clone layout/animation từ 1 template Framer đã mua (xem
 * docs/be-audit ghi chú license) — KHÔNG mang copy/ảnh gốc, mọi field dưới
 * đây là placeholder để user tự thay nội dung thật.
 */
export interface BrightedgeHeroAvatar {
  id: string;
  imageUrl: string;
}
export interface BrightedgeHeroContent {
  eyebrow: string;
  heading: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  avatars: BrightedgeHeroAvatar[];
  badgeText: string;
  badgeSubtext: string;
  imageUrl: string;
}

/**
 * Stories block — Instagram-style full-bleed panels with media + caption.
 * Each panel auto-advances after `durationMs`; tap left/right edge to skip
 * back/forward (mobile gesture pattern). At the end the block loops or
 * holds on the last panel based on `loop`.
 */
export interface StoriesSlide {
  id: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  title?: string;
  body?: string;
  /** Optional CTA pill at the bottom of the panel. */
  ctaText?: string;
  ctaUrl?: string;
  /** Duration in ms — default inherited from block config. */
  durationMs?: number;
}

export interface StoriesContent {
  eyebrow?: string;
  title?: string;
  slides: StoriesSlide[];
  /** Default per-slide duration when slides[i].durationMs is unset. Default 4000. */
  defaultDurationMs?: number;
  loop?: boolean;
  /** When true (default), show progress bars at the top of each slide. */
  showProgress?: boolean;
}

/**
 * Split-screen block — two `views` rendered side-by-side (or stacked on
 * mobile). User can toggle which view is "active" via tabs; the inactive
 * view stays visible but dimmed (collapsed on mobile).
 */
export interface SplitScreenView {
  id: string;
  label: string;
  imageUrl?: string;
  title: string;
  body?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface SplitScreenContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  views: SplitScreenView[]; // typically 2
  /** Initial active view by index. Default 0. */
  defaultIndex?: number;
}

/**
 * Quiz block — multi-question form. Each question has options with
 * weights; the renderer sums weights and matches to the highest-scoring
 * `result` bucket. Stores last response in localStorage so user can
 * resume mid-quiz.
 */
export interface QuizOption {
  id: string;
  label: string;
  /** Numeric score added to the running total when this option is picked. */
  score?: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  /** Image shown above the prompt. Optional. */
  imageUrl?: string;
}

export interface QuizResult {
  id: string;
  /** Inclusive lower bound on cumulative score for this result to win. */
  minScore: number;
  title: string;
  body?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface QuizContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  /** Button label on each question to advance. Default "Tiếp". */
  nextLabel?: string;
  /** Button label on the final question to compute. Default "Xem kết quả". */
  finishLabel?: string;
}

/**
 * Poll block — single question, multiple options, vote → see results.
 * Seed counts come from `baseVotes` so the bars feel populated; live votes
 * accumulate locally (and could be POSTed to a BE collector). User can
 * vote once per session (tracked in localStorage by block id).
 */
export interface PollOption {
  id: string;
  label: string;
  /** Initial baseline vote count so result bars aren't 0 / 0 on first render. */
  baseVotes?: number;
}

export interface PollContent {
  eyebrow?: string;
  question: string;
  options: PollOption[];
  /** Hide vote totals before user picks. Default true (mystery vibe). */
  hideResultsUntilVoted?: boolean;
  /** Button copy under each option. Defaults to "Vote". */
  voteLabel?: string;
  /** Message shown to user after vote. Default "Cảm ơn bạn đã bình chọn!". */
  thankYouText?: string;
}

/**
 * 3D coverflow carousel — extends ImageCarouselContent with a `mode`
 * indicator. When mode is `3d-coverflow`, the renderer uses CSS
 * transform-style: preserve-3d + per-slide rotateY for an iTunes-style
 * coverflow effect.
 */
export interface Carousel3dContent extends ImageCarouselContent {
  /** Visual mode. 'flat' falls back to the regular 2D carousel rendering. */
  mode3d?: 'flat' | '3d-coverflow';
  /** Perspective px applied to the outer wrapper. Default 1200. */
  perspectivePx?: number;
}

/**
 * Flipbook — multi-page catalog with CSS-based page-turn animation. Click
 * the right side of a page to advance, left side to go back. Each page is
 * an image; optional caption overlays each page.
 */
export interface FlipbookPage {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface FlipbookContent {
  eyebrow?: string;
  title?: string;
  pages: FlipbookPage[];
  /** Aspect ratio of each page. Default '3/4' (portrait, magazine-like). */
  aspect?: '3/4' | '4/3' | '1/1' | '16/9';
  /** Show page numbers at bottom. Default true. */
  showPageNumbers?: boolean;
}

/**
 * Panorama — equirectangular 2:1 image that the user drags horizontally
 * to rotate the view direction. CSS-only (translateX of an oversized
 * image strip duplicated for seamless wraparound) — no Three.js or
 * libraries required. Hotspot/extra-element overlays still work since the
 * pano is rendered inside the block frame.
 */
export interface PanoramaContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Equirectangular 2:1 image URL (width = 2 × height). */
  imageUrl: string;
  /** Initial yaw offset 0–1 (fraction of the image width). Default 0. */
  initialYaw?: number;
  /** Drag-to-yaw sensitivity multiplier. 1 = 1px drag → 1px translate.
   *  Defaults to 1. Higher values feel "looser". */
  sensitivity?: number;
  /** Optional hint badge shown over the pano in editor view. */
  hint?: string;
}

/**
 * Text-displacement hero — chữ "thổi" văng khỏi con trỏ rồi đàn hồi về (port
 * CodeGrid Menu XL). `title` là khối chữ lớn bị displace; `description` (nếu có)
 * cũng displace theo từ. Các số dưới là config (có default).
 */
export interface TextDisplaceHeroContent {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Tách `title` theo ký tự ('char', mặc định) hay theo từ ('word'). */
  splitBy?: 'word' | 'char';
  /** Bán kính ảnh hưởng quanh con trỏ (px). Default 150. */
  radius?: number;
  /** Lực đẩy tối đa khi con trỏ sát chữ (px). Default 300. */
  strength?: number;
  /** Hệ số lerp 0–1: càng nhỏ càng "trễ"/mượt. Default 0.1. */
  smoothing?: number;
}

/**
 * Image trail — rê con trỏ trong block → ảnh mọc theo vết rồi tự biến mất (port
 * CodeGrid Burocratik). `images` là mảng URL ảnh hiển thị ngẫu nhiên.
 */
export interface ImageTrailContent {
  eyebrow?: string;
  title?: string;
  images: string[];
  /** Khoảng cách con trỏ phải di (px) mới tạo ảnh mới. Default 100. */
  threshold?: number;
  /** Thời gian ảnh tồn tại trước khi mờ đi (ms). Default 750. */
  lifespan?: number;
  /** Thời lượng scale-in / scale-out (ms). Default 750 / 1000. */
  inDuration?: number;
  outDuration?: number;
  /**
   * Chế độ "chào mời": khi user chưa rê chuột, một con trỏ ảo tự đi lang thang
   * trong block để sinh vệt ảnh (cho user biết block tương tác được). Khi user
   * rê chuột thật thì tự tắt. Default false.
   */
  autoDemo?: boolean;
  /**
   * Chế độ "vẽ chữ": con trỏ ảo đi theo nét chữ để ảnh xếp thành `autoDemoText`
   * (vd "2026"), giữ 1.5s rồi mờ và vẽ lại. Cần `autoDemo: true`.
   * CHỈ hỗ trợ ký tự `0` `2` `6` `M` — ký tự khác bị bỏ qua; không còn ký tự
   * nào hợp lệ → rơi về attract mode thường.
   */
  autoDemoText?: string;
}

/**
 * Sticky scroll cards — cuộn để các card ảnh chồng lên nhau (port CodeGrid
 * Ashfall). Mỗi card có ảnh + nhãn; số card quyết định độ dài quãng cuộn.
 */
export interface StickyScrollCardsContent {
  eyebrow?: string;
  title?: string;
  cards: { imageUrl: string; title?: string }[];
  /** Scale card khi bị đẩy ra sau. Default 0.5. */
  finalScale?: number;
  /** Góc xoay card (độ). Default 10. */
  rotateDeg?: number;
  /** Zoom ảnh bên trong card. Default 1.5. */
  imageZoom?: number;
}

/**
 * Gallery 3D depth — khối ảnh bay từ chiều sâu ra trước mặt, lặp vô hạn (port
 * CodeGrid Mat Voyce, CSS-3D + GSAP). `images` là mảng URL.
 */
export interface Gallery3dDepthContent {
  eyebrow?: string;
  title?: string;
  images: string[];
  /** Độ trễ giữa các khối (s). Default 0.25. */
  stagger?: number;
  /** Thời lượng bay vào (s). Default 2. */
  duration?: number;
}

/** Parallax hero — sticker trôi theo con trỏ + marquee (port CodeGrid 002). */
export interface ParallaxHeroContent {
  eyebrow?: string;
  title?: string;
  /** Lớp sticker; `speed` âm = ngược chiều chuột, dương = cùng chiều. */
  layers: {
    imageUrl: string;
    speed: number;
    top?: string;
    left?: string;
    width?: string;
  }[];
  /** Chữ chạy ngang nền (rỗng = tắt). */
  marqueeText?: string;
  /** Chu kỳ marquee (s). Default 40. */
  marqueeSeconds?: number;
}

/** Lightbox flip — lưới ảnh, click phóng to bay ra giữa (port CodeGrid 008). */
export interface LightboxFlipContent {
  eyebrow?: string;
  title?: string;
  images: string[];
  /** Số cột lưới. Default 4. */
  columns?: number;
  /** Thời lượng phóng/thu (s). Default 0.6. */
  duration?: number;
}

/** Flip gallery — nút đổi giữa layout chồng-xoay ↔ dàn hàng (port CodeGrid 130). */
export interface FlipGalleryContent {
  eyebrow?: string;
  title?: string;
  images: string[];
  expandLabel?: string;
  collapseLabel?: string;
}

/** Wheel gallery — bánh xe ảnh quay theo cuộn (port CodeGrid 014). */
export interface WheelGalleryContent {
  eyebrow?: string;
  title?: string;
  images: string[];
}

/** Hover reveal list — danh sách tên, hover hiện ảnh bám chuột (port CodeGrid 001). */
export interface HoverRevealListContent {
  title?: string;
  items: { label: string; imageUrl: string }[];
}

/** Hover equalizer heading — chữ giãn scaleY theo con trỏ (port CodeGrid 049). */
export interface HoverEqualizerHeadingContent {
  heading: string;
  /** scaleY ký tự đang trỏ. Default 2.2. */
  peak?: number;
  /** scaleY 2 ký tự kề bên. Default 1.6. */
  neighbor?: number;
}

/** Brutalist text — tiêu đề uppercase đậm + trail echo opacity xếp chồng. */
export interface BrutalistTextContent {
  heading: string;
  /** Số ghost layer phía dưới primary. Default 3. */
  echoCount?: number;
  /** Khoảng cách dọc giữa các layer (em). Default 0.09. */
  layerStep?: number;
  /** Opacity từng ghost (xa → gần primary). */
  echoOpacities?: number[];
  textColor?: string;
  bgColor?: string;
}

/** Image explosion — ảnh "nổ" bay lên rồi rơi khi cuộn tới (port CodeGrid 246). */
export interface ImageExplosionContent {
  eyebrow?: string;
  title?: string;
  images: string[];
}

/** Story slides — slide tự chạy kiểu IG-stories + thanh index progress. */
export interface StorySlidesContent {
  slides: { imageUrl: string; title: string; subtitle?: string }[];
  /** Thời gian mỗi slide (ms). Default 4000. */
  duration?: number;
}

/** Accordion media — hàng panel ngang, panel active nở (ảnh + tiêu đề + mô tả). */
export interface AccordionMediaContent {
  items: { title: string; description: string; imageUrl: string }[];
}

/** Spotlight — section tối, đèn rọi radial bám chuột làm sáng chữ. */
export interface SpotlightContent {
  title?: string;
  lines: string[];
}

/** Process steps — quy trình đánh số, reveal fade-up lần lượt khi cuộn. */
export interface ProcessStepsContent {
  title?: string;
  steps: { title: string; description?: string }[];
}

/** Dot matrix — canvas lưới chấm phản ứng con trỏ. */
export interface DotMatrixContent {
  title?: string;
  /** Khoảng cách chấm (px). Default 26. */
  gap?: number;
  /** Màu chấm. Default #5b6472. */
  dotColor?: string;
}

/** Interactive grid — lưới ảnh, hover phóng to + làm mờ ô khác. */
export interface InteractiveGridContent {
  images: string[];
}

/** Pixel reveal — ảnh hiện qua pixelation (canvas) khi cuộn vào view. */
export interface PixelRevealContent {
  imageUrl: string;
  title?: string;
}

/** Marquee band — dải chữ lớn chạy ngang vô tận (CSS thuần). */
export interface MarqueeBandContent {
  text: string;
  /** Ký tự ngăn giữa các lần lặp. Default ' · '. */
  separator?: string;
  /** Chu kỳ chạy (s). Default 24. */
  seconds?: number;
}

/** Letter slider — slider sản phẩm, chữ mở từng ký tự (port CodeGrid 027). */
export interface LetterSliderContent {
  slides: { title: string; imageUrl: string }[];
}

/** Seamless scroll gallery — dải ảnh cuộn ngang vô tận liền mạch (port CodeGrid 238). */
export interface SeamlessScrollGalleryContent {
  title?: string;
  images: string[];
  /** Chu kỳ chạy (s). Default 30. */
  seconds?: number;
}

/** Product spec sheet — trang sản phẩm + bảng thông số trượt lên (port CodeGrid 022). */
export interface ProductSpecSheetContent {
  eyebrow?: string;
  title?: string;
  description?: string;
  imageUrl: string;
  specs: { label: string; value: string }[];
  specLabel?: string;
}

/**
 * Hero - Yume (framer-native): 2 dòng tên cực to + avatar tròn top-right +
 * email/bio bottom row. Migrate từ `src/blocks/framer-yume-hero`. `avatar`
 * chuẩn hoá từ object `{url,alt}` (legacy) → `avatarUrl` string cho khớp
 * cách editor sửa ảnh (giống `backgroundUrl`/`imageUrl`).
 */
export interface FramerYumeHeroContent {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  email: string;
  bio: string;
}

/** Hero - Yuya (v2): cùng design với Yume (Yume là clone của Yuya) — dùng
 *  chung renderer + content shape. Tách block_type riêng để giữ 1-1 với
 *  registry legacy. `bgColor` của legacy map sang native background layer. */
export type FramerYuyaHeroContent = FramerYumeHeroContent;

/** Hero - Arpeggio v2: fork độc lập từ v1, cùng layout + layer keys. */
export interface FramerArpeggioHeroV2Content {
  backgroundUrl: string;
  headline: string;
  subtitle: string;
  topRightLabel: string;
  wordmark: string;
  wordmarkSuffix: string;
}

/** Service item cho FramerClarityServicesContent. */
export interface FramerClarityServiceItem {
  iconUrl: string;
  title: string;
  description: string;
}

/**
 * Clarity Services: 3-col grid — 2 card trái, ảnh portrait giữa (span 2 row),
 * 2 card phải. Migrate từ `src/blocks/framer-clarity-services`.
 */
export interface FramerClarityServicesContent {
  bgColor: string;
  cardBg: string;
  centerImageUrl: string;
  services: FramerClarityServiceItem[];
}

/**
 * Sustainit "Our Expertise" — nguồn Readymag (sustainit.space). Geist Mono,
 * ink #282828 + accent green #B6FF3D. 4 expertise item trong grid 2×2 với cell
 * vuông (aspect-ratio 1/1) ở desktop; tablet 2-col auto height; mobile 1-col.
 */
export interface SustainitExpertiseItem {
  /** Ảnh hero của item (organic/biotech texture). */
  imageUrl: string;
  /** Tiêu đề ALL-CAPS, vd "BIOTECH STRATEGY AND INNOVATION SCOUTING". */
  title: string;
  /** Phụ đề trong ngoặc, vd "An R&D department for your brand". */
  subtitle: string;
  /** Danh sách bullet (3 dòng). */
  bullets: string[];
  color: string;
}

export interface SustainitOurExpertiseContent {
  /** Marker index nhỏ ở góc, vd "(01 — 04)". */
  indexLabel: string;
  /** Tiêu đề section (có pill xanh sau nó). */
  heading: string;
  /** Dòng intro dưới heading. */
  intro: string;
  /** Màu nền section. */
  bgColor: string;
  /** Màu pill accent sau heading. */
  accentColor: string;
  /** 4 item. */
  items: SustainitExpertiseItem[];
  /** Nhãn CTA cuối, vd "Work with us". */
  ctaLabel: string;
}

/**
 * Readymag Case Section — vertical 3-column layout (image-stack left, bio
 * middle, wordmark right) with a scroll-driven case cycle. The block plays
 * through N cases as the user scrolls; each case has a name (bold prefix),
 * body description, link CTA, and one image. Inspired by Readymag's
 * `animation-container` Cases pattern, ported to GSAP scrub.
 *
 * - `cases[].key`  — stable key, used by editor to track element edits
 * - `cases[].name` — case-name bolded at start of the bio paragraph
 * - `cases[].body` — bio body (continues after the bolded name)
 * - `cases[].linkText` / `linkHref` — "View case →" CTA
 * - `cases[].imageUrl` — case photo (rendered in the left image-stack)
 * - `bgColor` — page background color (default `#ffffff`)
 * - `textColor` — primary text color (default `#000000`)
 * - `accentColor` — link color (default `#0000ee`)
 * - `wordmarkColor` — color for the big case-name wordmark (default textColor)
 *
 * Port từ framer-recon `recon-readymag-cases` (URL
 * https://readymag.com/designs/6263403/, selector `article.page`).
 */
export interface ReadymagCaseItem {
  key: string;
  name: string;
  body: string;
  linkText: string;
  linkHref: string;
  imageUrl: string;
}

/** Flat editable fields (ScrollMattis pattern). `cases[]` = legacy fallback. */
export interface ReadymagCaseSectionContent {
  case1Name?: string;
  case1Body?: string;
  case1LinkText?: string;
  case1LinkHref?: string;
  case1ImageUrl?: string;
  case2Name?: string;
  case2Body?: string;
  case2LinkText?: string;
  case2LinkHref?: string;
  case2ImageUrl?: string;
  case3Name?: string;
  case3Body?: string;
  case3LinkText?: string;
  case3LinkHref?: string;
  case3ImageUrl?: string;
  case4Name?: string;
  case4Body?: string;
  case4LinkText?: string;
  case4LinkHref?: string;
  case4ImageUrl?: string;
  case5Name?: string;
  case5Body?: string;
  case5LinkText?: string;
  case5LinkHref?: string;
  case5ImageUrl?: string;
  /** Legacy nested array — resolveCases fallback. */
  cases?: ReadymagCaseItem[];
  bgColor: string;
  textColor: string;
  accentColor: string;
  wordmarkColor: string;
}

/**
 * Hero - Perform v1: Manrope 72/500, dark-overlay bg, pill CTA, star reviews,
 * content bên trái. Port từ `src/blocks/framer-perform-hero`.
 */
export interface FramerPerformHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundUrl: string;
  reviewStars: number;
  reviewCount: string;
}

/**
 * Hero - Bungee v2: port theo recon spec từ framer-recon (selector
 * `header[data-framer-name="Header"]`). Cấu trúc giống V1 nhưng refactor theo
 * contract R1–R6 GSAP + ảnh rexel từ framerusercontent.com.
 * - wordmarkUrl — SVG/ảnh "Bungee®" (fallback text "Bungee®")
 * - subtitle — tagline (mặc định "Creative studio based in Gotham.")
 * - timerLabel — nhãn thời gian góc trái ("( 00:44 NY )")
 * - link1Label/Url, link2Label/Url, link3Label/Url — 3 social (BE/DR/X)
 * - marqueeSpeed — chu kỳ marquee CSS (giây). Mặc định 50.
 * - cardImages — mảng ảnh/video trong dải marquee dưới (imageUrl hoặc videoUrl)
 * - accentColor — màu accent tổng thể (mặc định rgb(30,30,30))
 */
export interface FramerBungeeHeroV2Content {
  wordmarkUrl: string;
  subtitle: string;
  timerLabel: string;
  link1Label: string;
  link1Url: string;
  link2Label: string;
  link2Url: string;
  link3Label: string;
  link3Url: string;
  marqueeSpeed: number;
  cardImages: Array<{ imageUrl?: string; videoUrl?: string }>;
  accentColor: string;
}

/**
 * Hero - PureVisuals: 2 flash panel 50/50 đập vào nhau khi load, scroll
 * tách ra để lộ heading. Port từ `recon-purevisuals-hero/spec.md` §9.
 *
 * - leftImageUrl / rightImageUrl — 2 ảnh panel trái / phải
 * - eyebrow — dòng nhỏ phía trên heading (DM Mono)
 * - heading — heading lớn JetBrains Mono 180px (clamp theo container)
 * - subheading — sub heading dưới (JetBrains Mono 18px)
 * - bgColor — màu nền sau khi 2 panel tách ra (mặc định #0a0a0a)
 * - textColor — màu chữ (mặc định #ffffff)
 */
export interface FramerPurevisualsHeroContent {
  leftImageUrl: string | string[];
  rightImageUrl: string | string[];
  eyebrow: string;
  heading: string;
  subheading: string;
  bgColor: string;
  textColor: string;
}

/**
 * Intro Redefined: nền trắng, eyebrow góc phải (DM Mono), tiêu đề italic
 * serif cực lớn (Abril Fatface), đoạn body bên dưới.
 */
export interface FramerIntroRedefinedContent {
  eyebrow: string;
  title: string;
  body: string;
}

/**
 * Explore CTA: căn giữa, nền #F5F3EE, eyebrow DM Mono,
 * headline Abril Fatface italic, link underline dạng [ LABEL ].
 */
export interface FramerExploreCtaContent {
  eyebrow: string;
  headline: string;
  linkLabel: string;
  linkHref: string;
}

/**
 * Flat White — "Our Process": nền #747E90, label pill "/ OUR PROCESS",
 * headline lớn, 3 step card dọc (001 Discover / 002 Design / 003 Deliver),
 * body text màu #D6D9E2, có SVG divider cong động (2 lớp). Port từ
 * `recon-flat-white-our-process/spec.md`. Animation GSAP R1–R6 qua
 * `useBlockMotion`: word-by-word reveal theo stagger + SVG line draw.
 */
export interface FramerFlatWhiteProcessStep {
  /** Số thứ tự hiển thị trong pill (vd "001"). */
  number: string;
  title: string;
  body: string;
}

export interface FramerFlatWhiteProcessContent {
  label: string;
  headline: string;
  steps: FramerFlatWhiteProcessStep[];
  bgColor: string;
  textColor: string;
  bodyTextColor: string;
}

/**
 * Studio Manifesto: nền #F5F3EE, eyebrow DM Mono, tiêu đề italic serif
 * lớn, đoạn body thụt đầu dòng, chữ ký ở cuối.
 */
export interface FramerStudioManifestoContent {
  eyebrow: string;
  title: string;
  body: string;
  signature: string;
}

/**
 * Stats Grid: ảnh nền full-bleed + overlay tối + lưới 4 cột thống kê
 * (số serif trắng + nhãn viết hoa). Port từ `src/blocks/framer-stats-grid`.
 */
export interface FramerStatsGridContent {
  backgroundUrl: string;
  stats: Array<{ value: string; label: string }>;
}

/**
 * Projects Grid: nền #F5F3EE, DM Mono eyebrow, Abril Fatface title,
 * lưới 3 cột dự án với hover zoom. Port từ `src/blocks/framer-projects-grid`.
 */
export interface FramerProjectsGridContent {
  eyebrow: string;
  title: string;
  projects: Array<{
    imageUrl: string;
    name: string;
    category: string;
    href: string;
  }>;
}

export interface MasteriseHomeInsideSlide {
  id: string;
  imageUrl: string;
  alt: string;
  caption?: string;
}

export interface MasteriseHomeInsideContent {
  headingLine1: string;
  headingLine2: string;
  body: string;
  slides: MasteriseHomeInsideSlide[];
}

/**
 * IgniteX — "Step Section": pre-title pill "From concept to launch" +
 * 3-column layout (left "Your / ideas / into Brand", center 3 step cards,
 * right "transform / stories"). Nền trắng, Geist 60/500 cho heading,
 * Great Vibes 62/400 cho "Brand", Geist 28/500 cho card title,
 * Geist 18/500 cho body. Port từ `recon-ignitex-step-section/spec.md`
 * (selector `[data-framer-name='Step Section']`, URL
 * https://ignitex-wbs.framer.website/). Animation GSAP R1–R6 qua
 * `useBlockMotion` (fade-up + sparkle rotate).
 */
export interface FramerIgnitexStepCard {
  title: string;
  body: string;
  mainImageUrl?: string;
  subImageUrl?: string;
}

/** Flat card fields (ScrollMattis pattern). `cards[]` = legacy fallback. */
export interface FramerIgnitexStepContent {
  preTitle: string;
  leftTop: string;
  leftBottom: string;
  rightTop: string;
  rightBottom: string;
  card1Title?: string;
  card1Body?: string;
  card1MainImageUrl?: string;
  card2Title?: string;
  card2Body?: string;
  card2MainImageUrl?: string;
  card3Title?: string;
  card3Body?: string;
  card3MainImageUrl?: string;
  /** Legacy nested array — resolveCards fallback. */
  cards?: FramerIgnitexStepCard[];
}

export interface FramerRealEstate02StoryContent {
  slide1Label: string;
  slide1Body: string;
  slide1ImageUrl: string;
  slide2Label: string;
  slide2Body: string;
  slide2ImageUrl: string;
  slide3Label: string;
  slide3Body: string;
  slide3ImageUrl: string;
}

export interface FramerRealEstate02QuoteContent {
  name: string;
  role: string;
  quote: string;
  buildingImageUrl: string;
  headshotImageUrl: string;
}

export interface FramerRealEstate02GalleryContent {
  heading: string;
  image1Url: string;
  image2Url: string;
  image3Url: string;
  image4Url: string;
}

export interface FramerRealEstate02ProductContent {
  bodyText: string;
  photoUrl: string;
}

export interface FramerRealEstate02OverviewContent {
  title1: string;
  title2: string;
  description: string;
  subheadingLine1: string;
  subheadingLine2: string;
  subheadingLine3: string;
  towerImageUrl: string;
  personImageUrl: string;
  panoramaImageUrl: string;
}

export interface FramerRealEstate02LocationContent {
  heading: string;
  photo1Url: string;
  photo2Url: string;
  photo3Url: string;
}

export interface FramerRealEstate02CommuteContent {
  eyebrow: string;
  heading: string;
  walkMinutes: string;
  carHeading: string;
  row1Value: string;
  row1Label: string;
  row2Value: string;
  row2Label: string;
  row3Value: string;
  row3Label: string;
  carPhotoUrl: string;
}

export interface FramerRealEstate02MapContent {
  mapImageUrl: string;
}

export interface FramerRealEstate02MenuContent {
  label: string;
  menuIconUrl?: string;
}

/**
 * Team Directory: nền #F5F3EE, DM Mono eyebrow, Abril Fatface title,
 * danh sách hàng ngang có divider cho từng thành viên.
 * Port từ `src/blocks/framer-team-directory`.
 */
export interface FramerTeamDirectoryContent {
  eyebrow: string;
  title: string;
  members: Array<{ avatarUrl: string; name: string; role: string }>;
}

/**
 * Image Stagger: nền #F5F3EE, eyebrow + Abril Fatface title,
 * lưới CSS bất đối xứng 12 cột cho hiệu ứng xếp lệch.
 * Port từ `src/blocks/framer-image-stagger`.
 */
export interface FramerImageStaggerContent {
  eyebrow: string;
  title: string;
  images: Array<{ imageUrl: string; alt: string }>;
}

export interface RolexCollectionHeroContent {
  backgroundUrl: string;
  backgroundTransform?: ImageTransform;
  mainLetter: string;
  mainTitle: string;
  mainDescription: string;
  heroImageUrl: string;
}

export interface RolexCollectionNavContent {
  navHomeLabel: string;
  navHomeHref: string;
  navCollectionLabel: string;
  navCollectionHref: string;
  navContactLabel: string;
  navContactHref: string;
}

export interface RolexCollectionWorkStage {
  title: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  imageUrl: string;
}

export interface RolexCollectionWorkContent {
  introBackgroundUrl: string;
  ctaLabel: string;
  stages: RolexCollectionWorkStage[];
}

export interface RolexContactContent {
  backgroundUrl: string;
  heading: string;
  email: string;
  phone: string;
  nameLabel: string;
  namePlaceholder: string;
  mailLabel: string;
  mailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  successMessage: string;
  portraitUrl: string;
  instagramLabel: string;
  instagramHref?: string;
  twitterLabel: string;
  twitterHref?: string;
}

/** Trang chi tiết dự án (project-details) của rolex_collection — 1 block DUY
 *  NHẤT dựng lại nguyên trang gốc: Hero split (ảnh + eyebrow + heading lớn
 *  animation per-char + mô tả) → dải ảnh full-width → 2 ảnh cạnh nhau → dải
 *  ảnh full-width → split đóng bài (ảnh + subheading + mô tả + glyph). */
export interface RolexCollectionProjectContent {
  eyebrow: string;
  title: string;
  description: string;
  heroImageUrl: string;
  bandImageUrl1: string;
  pairImageLeftUrl: string;
  pairImageRightUrl: string;
  bandImageUrl2: string;
  closingImageUrl: string;
  closingSubheading: string;
  closingParagraph: string;
  symbol: string;
}

/**
 * Aestha Editorial: cột brand sticky trái + 3 ảnh so le phải + CTA cuối.
 * Port từ `src/blocks/framer-aestha-editorial`.
 */
export interface FramerAesthaEditorialContent {
  brand: string;
  tagline: string;
  scrollLabel: string;
  description: string;
  image1Url: string;
  image2Url: string;
  image3Url: string;
  ctaText: string;
  ctaHref: string;
  navLinks: Array<{ label: string; href: string }>;
}

/** Chi tiết dự án trong trang index EXPLORE — content cho AesthaProject. */
export interface AesthaExploreProjectDetail {
  /** Các đoạn mô tả dự án — mỗi phần tử một đoạn `<p>`. */
  body?: string[];
  /** Thêm ảnh chi tiết (ngoài ảnh chính img). */
  images?: AesthaProjectImage[];
}

export interface AesthaExploreProject {
  label: string;
  href: string;
  img: string;
  alt: string;
  /** Chi tiết dự án — hiển thị khi click vào project trong Explore. */
  detail?: AesthaExploreProjectDetail;
}

/** Link footer nav (Projects / Studio / Contact). */
export interface AesthaExploreFooterLink {
  label: string;
  href: string;
}

/**
 * Aestha Explore: trang index "EXPLORE" (cùng site RAMSA/Aestha).
 * Wide (≥1100px): hover tên dự án → crossfade ảnh featured, cursor-dot.
 * Narrow (<1100px): 1 dự án/màn, vuốt để duyệt. Port từ `app/dev/nami-explore`.
 */
export interface AesthaExploreContent {
  heading: string;
  projects: AesthaExploreProject[];
  footerLinks: AesthaExploreFooterLink[];
  /** Nhãn footer đang là trang hiện tại (tô nhạt) — khớp theo `label`. */
  currentFooterLabel: string;
}

/** Một thành viên team trong trang STUDIO — tên + vai trò. */
export interface AesthaStudioMember {
  name: string;
  role: string;
}

/** Link footer nav (Projects / Studio / Contact) — trang STUDIO. */
export interface AesthaStudioFooterLink {
  label: string;
  href: string;
}

/**
 * Aestha Studio: trang "STUDIO" / About (cùng site RAMSA/Aestha với
 * `aestha_explore`). Wordmark + bio + team + ảnh portrait + footer nav.
 * Wide (≥1200px): full-viewport, cột trái nội dung · ảnh phải cố định 448px,
 * cursor-dot bám con trỏ. Narrow (<1200px): xếp dọc. Port từ
 * `app/dev/ramsa-studio/page.tsx`.
 */
export interface AesthaStudioContent {
  wordmark: string;
  bio: string;
  team: AesthaStudioMember[];
  imageUrl: string;
  imageAlt: string;
  footerLinks: AesthaStudioFooterLink[];
  /** Nhãn footer đang là trang hiện tại (tô nhạt) — khớp theo `label`. */
  currentFooterLabel: string;
}

/** Một mạng xã hội trong trang CONTACT — nhãn hiển thị + link ngoài. */
export interface AesthaContactSocial {
  label: string;
  href: string;
}

/** Link footer nav (Projects / Studio / Contact) — trang CONTACT. */
export interface AesthaContactFooterLink {
  label: string;
  href: string;
}

/**
 * Aestha Contact: trang "CONTACT" (cùng site RAMSA/Aestha với `aestha_explore`
 * / `aestha_studio`). Heading + địa chỉ + email/phone + social + ảnh hero +
 * footer nav. Wide (≥1100px): 2 cột full-viewport (trái CONTACT + địa chỉ, phải
 * ảnh + email/social); cursor-dot. Narrow (<1100px): xếp dọc (địa chỉ → info →
 * ảnh). Port từ `app/dev/aestha-contact/page.tsx`.
 */
export interface AesthaContactContent {
  heading: string;
  /** Địa chỉ nhiều dòng — ngăn cách bằng `\n`, render `white-space: pre-line`. */
  address: string;
  /** Nhãn email hiển thị; href suy ra `mailto:${email}`. */
  email: string;
  /** Nhãn phone hiển thị; href suy ra `tel:` (bỏ khoảng trắng). */
  phone: string;
  imageUrl: string;
  imageAlt: string;
  socials: AesthaContactSocial[];
  footerLinks: AesthaContactFooterLink[];
  /** Nhãn footer đang là trang hiện tại (tô nhạt) — khớp theo `label`. */
  currentFooterLabel: string;
}

/** Một ảnh trong stack cột phải trang PROJECT — nguồn + alt. */
export interface AesthaProjectImage {
  src: string;
  alt: string;
}

/** Link nav trang PROJECT (Dự án / Studio / Liên hệ). */
export interface AesthaProjectNavLink {
  label: string;
  href: string;
}

/**
 * Aestha Project: trang chi tiết dự án (cùng site RAMSA/Aestha với
 * `aestha_explore` / `aestha_studio` / `aestha_contact`). Cột trái sticky
 * (tiêu đề + nhãn "Concept" + đoạn mô tả + nav) · cột phải stack ảnh cuộn dọc.
 * Cuối stack, panel "Concept" crossfade sang panel "See next project".
 * Narrow (<900px): xếp 1 cột, bỏ sticky. Port từ `ProjectView` trong
 * `apps/real-estate/src/AesthaDemoPage.tsx`.
 */
export interface AesthaProjectContent {
  title: string;
  /** Nhãn cột trái, ví dụ "Concept". */
  conceptLabel: string;
  /** Các đoạn mô tả dự án — mỗi phần tử một đoạn `<p>`. */
  body: string[];
  images: AesthaProjectImage[];
  /** Nhãn nhóm panel "dự án tiếp theo", ví dụ "See next project". */
  nextHeading: string;
  /** Tên dự án tiếp theo (hiển thị dạng title-case). */
  nextLabel: string;
  /** Link tới dự án tiếp theo. */
  nextHref: string;
  navLinks: AesthaProjectNavLink[];
}

/**
 * Estancia About Us: nền tan #E7DECF, heading center + CTA pill + grid 3 ảnh
 * chân dung với stat dưới (2012 / 320+ / 200+). Port từ
 * `https://estancia.framer.website/` — block `[data-framer-name="Section - About"]`.
 * Mobile: grid 3 cột → 1 cột (flex-direction: row → column), gap 100 → 14px.
 */
export interface FramerEstanciaAboutUsContent {
  heading: string;
  ctaText: string;
  ctaHref: string;
  card1ImageUrl: string;
  card1Value: string;
  card1Label: string;
  card2ImageUrl: string;
  card2Value: string;
  card2Label: string;
  card3ImageUrl: string;
  card3Value: string;
  card3Label: string;
}

/**
 * Perform About: nền đen, hàng xếp chồng text trái + ảnh phải.
 * Port từ `src/blocks/framer-perform-about`.
 */
export interface FramerPerformAboutContent {
  testimonials: Array<{
    imageUrl: string;
    textHighlight: string;
    textRest: string;
  }>;
}

/**
 * Perform Pricing: nền trắng, header căn giữa, stack pricing card ảnh-trái info-phải.
 * Port từ `src/blocks/framer-perform-pricing`.
 */
export interface FramerPerformPricingContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  tiers: Array<{
    imageUrl: string;
    price: string;
    title: string;
    features: string;
    ctaLabel: string;
    ctaHref: string;
  }>;
}

/**
 * FAQ Minimal: nền trắng, 2 cột (tiêu đề + CTA trái, accordion phải),
 * divider mỏng. Port từ `src/blocks/framer-faq-minimal`.
 */
export interface FramerFaqMinimalContent {
  title: string;
  ctaText: string;
  ctaHref: string;
  items: Array<{ question: string; answer: string }>;
}

/**
 * Darling Timeline: nền kem #f4eed8, header căn giữa, cột sống dọc,
 * các item xen kẽ trái/phải với dấu chấm.
 * Port từ `src/blocks/framer-darling-timeline`.
 */
export interface FramerDarlingTimelineContent {
  heading: string;
  intro: string;
  items: Array<{
    time: string;
    title: string;
    description: string;
    imageUrl: string;
  }>;
}

/**
 * NFTpull Why-Go Timeline: nền tối (~#0e0e0e), header căn giữa (heading +
 * intro), cột sống dọc gradient giữa màn hình, các item xen kẽ trái/phải với
 * chấm tròn đánh số + card dark surface (#3a3b3f) với title + mô tả.
 * Port từ framer-recon `recon-nftpull-why-go` (URL https://nftpull.framer.website/,
 * selector `section[data-framer-name="Why Go Sections"]`).
 */
export interface FramerNftpullTimelineContent {
  heading: string;
  intro: string;
  items: Array<{
    number: string;
    title: string;
    description: string;
  }>;
}

/**
 * Signature Feature: nền #f4f4f0, căn giữa, eyebrow + tiêu đề xanh lá
 * (Aboreto), ảnh full-width, danh sách bullet.
 * Port từ `src/blocks/framer-signature-feature`.
 */
export interface FramerSignatureFeatureContent {
  eyebrow: string;
  title: string;
  imageUrl: string;
  bullets: Array<{ text: string }>;
}

/**
 * VS Collins Projects: lưới 12 cột phân tán, mỗi item dùng spacerBefore
 * để tạo khoảng trống, hover overlay tên + năm.
 * Port từ `src/blocks/framer-vs-collins-projects`.
 */
export interface FramerVsCollinsProjectsContent {
  bgColor: string;
  items: Array<{
    imageUrl: string;
    year: string;
    name: string;
    href: string;
    spacerBefore: number;
  }>;
}

/**
 * Header - Logo (section `.header` của delvaux-clone): thanh logo căn giữa.
 * Component: `blocks/DelvauxHeader.tsx`.
 */
export interface DelvauxHeaderContent {
  logoUrl: string;
  logoText: string;
}

/**
 * Sub-nav nổi (thanh `.sticky-menu` của delvaux-clone): pill trắng dán đáy
 * viewport, gồm các anchor link nhảy tới section + nút "Book" + nút "BUY NOW".
 * Trên /p là `position: fixed` (portal ra body); trong editor render in-flow
 * để không đè lên chrome. Component: `blocks/DelvauxSubnav.tsx`.
 */
export interface DelvauxSubnavLink {
  label: string;
  /** id của section đích (vd 'description' | 'discover' | 'information'). */
  targetId: string;
}
export interface DelvauxSubnavContent {
  links: DelvauxSubnavLink[];
  bookLabel: string;
  bookUrl: string;
  buyLabel: string;
  buyUrl: string;
}

/**
 * Hero - Scroll Video (section `.hero` của delvaux-clone): ảnh sản phẩm đóng
 * khung (padding 80px như gốc) scale 0.9→1 khi vào trang, rồi scale 1→2 + fade
 * theo scroll; phía sau là lớp "intro" — frame-sequence canvas (như canvas
 * 143-frame gốc) HOẶC video scrubbed — hiện dần và tua theo tiến trình scroll.
 * Component: `blocks/DelvauxHero.tsx`.
 */
export interface DelvauxHeroContent {
  videoUrl: string;
  posterUrl: string;
  /** Heading overlay tuỳ chọn — bản gốc KHÔNG có chữ trên hero; để '' nếu muốn giống gốc. */
  heading: string;
  subheading: string;
  /** 0–1: độ tối lớp overlay phủ trên media. */
  overlayOpacity: number;
  /** Mẫu URL frame-sequence, `{i}` = chỉ số frame 1-based (vd `.../img{i}.jpg`). '' = không dùng. */
  frameUrlPattern: string;
  /** Số frame của sequence (bản gốc 143). */
  frameCount: number;
  /** Danh sách URL frame TƯỜNG MINH (ưu tiên hơn pattern) — dùng khi media
   *  lưu trên CDN/S3 với key không tuần tự (mỗi asset một uuid). */
  frameUrls?: string[];
}

/**
 * Story - Editorial (section `.details` của delvaux-clone): tiêu đề căn giữa
 * mask-reveal + 2 đoạn mô tả fade-up. Component: `blocks/DelvauxDetails.tsx`.
 */
export interface DelvauxDetailsContent {
  title: string;
  body1: string;
  body2: string;
}

/**
 * Product - Hotspots (section `.product-detail` của delvaux-clone): ảnh sản
 * phẩm lớn căn giữa (100vh) + các hotspot tròn định vị theo % trên ảnh; bấm
 * hotspot → panel trắng trượt vào từ phải với tiêu đề + mô tả + media (video
 * autoplay hoặc ảnh). Entrance: ảnh scale 2→1 scrub theo scroll (animate-zoomin
 * gốc). Component: `blocks/DelvauxProduct.tsx`.
 */
export interface DelvauxProductHotspot {
  title: string;
  desc: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  /** Vị trí hotspot trên khung ảnh, % (0–100) tính từ trái/trên. */
  x: number;
  y: number;
}
export interface DelvauxProductContent {
  /** Ảnh sản phẩm chính (nền trong suốt như PNG gốc là đẹp nhất). */
  imageUrl: string;
  /** Màu quầng sáng blur sau sản phẩm (gốc #a77c63). */
  glowColor: string;
  hotspots: DelvauxProductHotspot[];
}

/**
 * Product - Variant (section `.product-variant` của delvaux-clone): cột giữa
 * hẹp (max 440px) chứa ảnh sản phẩm, "ghost title" serif khổng lồ mờ phía sau,
 * dãy dot màu dưới ảnh (đổi dot → swap ảnh), parallax nhẹ theo scroll. Nút
 * "More information" mở popup trượt từ phải (như `.content-discover` gốc) chứa
 * accordion chi tiết. Component: `blocks/DelvauxVariant.tsx`.
 */
export interface DelvauxVariantOption {
  label: string;
  ref: string;
  color: string;
  imageUrl: string;
}
export interface DelvauxVariantFaq {
  question: string;
  answer: string;
}
export interface DelvauxVariantContent {
  title: string;
  variants: DelvauxVariantOption[];
  faqs: DelvauxVariantFaq[];
  /** Nhãn nút mở popup chi tiết (gốc: "More information"). */
  moreInfoLabel: string;
  /** Stage 2 "product-sku" (gốc: pin 150%, cuộn quá nửa → media full-bleed +
   *  tên sản phẩm serif trắng khổng lồ reveal theo ký tự + ảnh model). */
  skuName: string;
  skuMediaUrl: string;
  skuMediaType: 'video' | 'image';
  /** Ảnh model/person hiện sau cùng (gốc person3.png). '' = bỏ qua. */
  skuPersonUrl: string;
}

/**
 * Quadplex80 — journey engine (migrate từ quadplex80.com, Nuxt+WebGL L5):
 * block sticky nhiều viewport tái hiện virtual-scroll journey của bản gốc —
 * gate ENTER EXPERIENCE + loader, cảnh three.js (GLB tòa 111W57 + billboard
 * mây/tòa nhà + HDR + lens flare, thông số ĐO từ bundle gốc), 4+ slide suite
 * chuyển bằng shader wipe (trích nguyên logic gl-slides gốc), drawer chi tiết
 * suite, overlay floorplans, overlay "see the view" (press & hold, video
 * timelapse), section contact, sound toggle. Component: `blocks/Q80Experience.tsx`.
 * Phối hợp với `q80_menu` qua window events `q80:goto`/`q80:slide`/`q80:overlay`.
 */
export interface Q80SuiteItem {
  /** Anchor/id nội bộ (gốc: great-room | guest-suite | sunset-lounge | crown-suite). */
  slug: string;
  title: string;
  /** Nhãn tầng hiển thị (gốc: "80th Floor"). */
  floorDisplay: string;
  /** Ảnh nền fullscreen của slide. */
  imageUrl: string;
  /** Video timelapse "see the view" (mp4). '' = dùng ảnh imageUrl thay. */
  viewVideoUrl: string;
  viewVideoThumbUrl: string;
  /** Mô tả trong drawer chi tiết (text thuần). */
  desc: string;
  /** Ảnh nhỏ trong drawer. */
  thumbnailUrl: string;
  /** Ảnh floorplan + PDF tải về. */
  floorplanUrl: string;
  floorplanPdfUrl: string;
}
export interface Q80InfoItem {
  title: string;
  text: string;
}
export interface Q80ExperienceContent {
  // ── Gate/intro (màn "Above The Clouds") ──
  introTitle: string;
  introText: string;
  enterLabel: string;
  enterNoSoundLabel: string;
  loadingLabel: string;
  // ── Slide 01 home/overview ──
  homeEyebrow: string;
  homeTitle: string;
  homeText: string;
  homePrice: string;
  overviewLabel: string;
  overviewTitle: string;
  overviewDesc: string;
  overviewThumbUrl: string;
  overviewFloorplanPdfUrl: string;
  /** Video timelapse view của slide home (overlay press & hold). */
  homeViewVideoUrl: string;
  homeViewVideoLabel: string;
  // ── Bảng unit info + features (overlay floorplans) ──
  infoItems: Q80InfoItem[];
  features: string[];
  floorplansLabel: string;
  // ── 4 suite ──
  suites: Q80SuiteItem[];
  // ── Contact ──
  contactEyebrow: string;
  contactTitle: string;
  contactSubtitle: string;
  email: string;
  phone: string;
  // ── Sound ──
  ambientUrl: string;
  backgroundUrl: string;
  soundLabel: string;
  // ── Copy phụ ──
  scrollLabel: string;
  pressHoldLabel: string;
  seeViewLabel: string;
  // ── Asset cảnh 3D (đổi được để re-skin) ──
  glbUrl: string;
  hdrUrl: string;
  cloudTintUrl: string;
  introCloudUrl: string;
  /** 5 lớp mây billboard (layer0→layer4 gốc). */
  layerUrls: string[];
  /** 4 tòa nhà lân cận (building0..building3new gốc). */
  buildingUrls: string[];
  flare1Url: string;
  flare2Url: string;
}

/**
 * Quadplex80 — chrome cố định: logo 111W57 giữa trên, nút MENU (overlay vàng
 * fullscreen: ảnh tháp + link 01..07 + footer), nút INQUIRE, số điện thoại.
 * Trên /p portal fixed (hasRoot && scroller===null); editor render in-flow.
 * Điều khiển journey qua window event `q80:goto`. Component: `blocks/Q80Menu.tsx`.
 */
export interface Q80MenuLink {
  label: string;
  /** 'home' | slug suite | 'floorplans' | 'contact'. */
  target: string;
}
export interface Q80CreditItem {
  title: string;
  text: string;
}
export interface Q80MenuContent {
  logoText: string;
  menuLabel: string;
  closeLabel: string;
  inquireLabel: string;
  inquireUrl: string;
  menuImageUrl: string;
  links: Q80MenuLink[];
  mainSiteLabel: string;
  mainSiteUrl: string;
  creditsLabel: string;
  creditsTitle: string;
  credits: Q80CreditItem[];
  legalLabel: string;
  legalText: string;
  phone: string;
}

// ── Housent (real-estate template) ──
export interface HousentHeroContent {
  badge: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchLabel: string;
  imageUrl: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

export interface HousentStatItem {
  value: string;
  label: string;
}
export interface HousentStatsContent {
  eyebrow: string;
  stats: HousentStatItem[];
}

export interface HousentListingItem {
  imageUrl: string;
  status: string;
  price: string;
  name: string;
  address: string;
  beds: string;
  baths: string;
  area: string;
}
export interface HousentListingsContent {
  eyebrow: string;
  title: string;
  filters: string[];
  items: HousentListingItem[];
}

export interface HousentCtaContent {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
  imageUrl: string;
}

export interface HousentFooterColumn {
  title: string;
  links: string[];
}
export interface HousentFooterContent {
  brand: string;
  prompt: string;
  email: string;
  columns: HousentFooterColumn[];
  copyright: string;
}

export interface HousentAboutContent {
  eyebrow: string;
  title: string;
  text: string;
  text2: string;
  ctaText: string;
}

export interface HousentFeatureItem {
  icon: string;
  title: string;
  description: string;
}
export interface HousentExcellenceCard {
  image: string;
  label: string;
  value: string;
}
export interface HousentExcellenceContent {
  eyebrow: string;
  title: string;
  items: HousentExcellenceCard[];
}

export interface HousentSolutionItem {
  title: string;
  description: string;
  features: string[];
  image?: string;
}
export interface HousentSolutionsContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: HousentSolutionItem[];
}

export interface HousentValuesContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: HousentFeatureItem[];
}

export interface HousentFaqItem {
  question: string;
  answer: string;
}
export interface HousentFaqContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaAvatar: string;
  items: HousentFaqItem[];
}

export interface HousentTestimonialItem {
  quote: string;
  avatar: string;
  name: string;
  role: string;
}
export interface HousentTestimonialContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: HousentTestimonialItem[];
}

export interface HousentBlogItem {
  imageUrl: string;
  category: string;
  title: string;
  date: string;
}
export interface HousentBlogsContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: HousentBlogItem[];
}

// ── Lumea (luxury real-estate template, clone từ lumea-eco.webflow.io) ──
export interface LumeaHeroContent {
  eyebrow: string;
  title: string;
  primaryCta: string;
  secondaryCta: string;
  imageUrl: string;
}
export interface LumeaStatementContent {
  eyebrow: string;
  title: string;
}
export interface LumeaFeatureContent {
  eyebrow: string;
  title: string;
  text: string;
  imageUrl: string;
  reverse: boolean;
}
export interface LumeaAmenityItem {
  title: string;
  description: string;
}
export interface LumeaAmenitiesContent {
  eyebrow: string;
  title: string;
  items: LumeaAmenityItem[];
}
export interface LumeaTestimonialContent {
  quote: string;
  name: string;
  role: string;
}
export interface LumeaGalleryContent {
  title: string;
  images: string[];
}
export interface LumeaFooterContent {
  brand: string;
  tagline: string;
  links: string[];
  copyright: string;
}

// ── Nordhaven (architecture studio template, clone từ nordhaven.webflow.io) ──
export interface NordhavenHeroContent {
  wordmark: string;
  imageUrl: string;
}
export interface NordhavenAboutContent {
  eyebrow: string;
  title: string;
  text: string;
}
export interface NordhavenServiceItem {
  title: string;
  description: string;
}
export interface NordhavenServicesContent {
  eyebrow: string;
  title: string;
  items: NordhavenServiceItem[];
}
export interface NordhavenPropertyItem {
  imageUrl: string;
  price: string;
  name: string;
  location: string;
}
export interface NordhavenPropertiesContent {
  eyebrow: string;
  title: string;
  items: NordhavenPropertyItem[];
}
export interface NordhavenTestimonialItem {
  quote: string;
  name: string;
  role: string;
}
export interface NordhavenTestimonialsContent {
  eyebrow: string;
  title: string;
  items: NordhavenTestimonialItem[];
}
export interface NordhavenFaqItem {
  question: string;
  answer: string;
}
export interface NordhavenFaqContent {
  eyebrow: string;
  title: string;
  items: NordhavenFaqItem[];
}
export interface NordhavenGalleryContent {
  title: string;
  images: string[];
}
export interface NordhavenFooterContent {
  brand: string;
  links: string[];
  copyright: string;
}

// ── Firma (creative agency Framer template, clone từ firma-template.framer.website) ──
export interface FirmaHeroContent {
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  imageUrl: string;
}
export interface FirmaStatementContent {
  eyebrow: string;
  title: string;
}
export interface FirmaWorkItem {
  imageUrl: string;
  name: string;
  category: string;
}
export interface FirmaWorkContent {
  title: string;
  count: string;
  items: FirmaWorkItem[];
}
export interface FirmaTestimonialContent {
  quote: string;
  authors: string[];
}
export interface FirmaServiceItem {
  title: string;
  description: string;
}
export interface FirmaServicesContent {
  title: string;
  count: string;
  items: FirmaServiceItem[];
}
export interface FirmaFooterContent {
  title: string;
  email: string;
  links: string[];
  copyright: string;
}

// ── IgniteX (digital agency Framer template, clone từ ignitex-wbs.framer.website) ──
export interface IgnitexHeroContent {
  location: string;
  titleLead: string;
  titleTrail: string;
  subtitle: string;
  imageUrl: string;
  services: string[];
}
export interface IgnitexServiceItem {
  title: string;
  description: string;
}
export interface IgnitexServicesContent {
  title: string;
  items: IgnitexServiceItem[];
}
export interface IgnitexProjectItem {
  imageUrl: string;
  name: string;
  tag: string;
}
export interface IgnitexProjectsContent {
  title: string;
  count: string;
  items: IgnitexProjectItem[];
}
export interface IgnitexStatItem {
  value: string;
  label: string;
}
export interface IgnitexAboutContent {
  eyebrow: string;
  title: string;
  stats: IgnitexStatItem[];
}
export interface IgnitexCtaContent {
  title: string;
  buttonLabel: string;
}
export interface IgnitexFooterContent {
  brand: string;
  email: string;
  links: string[];
  copyright: string;
}

// ── Readymag "RADIUS" (brutalist portfolio, clone từ readymag.com/designs/5969202) ──
export interface ReadymagMarqueeContent {
  text: string;
  pill: string;
}
export interface ReadymagProjectItem {
  no: string;
  name: string;
  role: string;
  imageUrl: string;
}
export interface ReadymagProjectsContent {
  items: ReadymagProjectItem[];
}
export interface ReadymagFooterContent {
  brand: string;
  links: string[];
  copyright: string;
}

// ── Protection (technical fabrics scrollytelling, clone từ en.protection.gr) ──
export interface ProtectionSection {
  title: string;
  more: string;
}
export interface ProtectionScrollytellingContent {
  tagline1: string;
  tagline2: string;
  subtitle: string;
  framePattern: string;
  frameCount: number;
  accent: string;
  sections: ProtectionSection[];
}

/**
 * Springs Estate clone (springs.estate — real-estate wellness residences
 * landing, static-built site, mirrored 1:1 qua web-clone skill). 10 section,
 * theo đúng thứ tự DOM gốc. Components: `blocks/Springs*.tsx`.
 */
export interface SpringsNavLink {
  label: string;
  href: string;
}
export interface SpringsHeaderContent {
  logoText: string;
  menuLabel: string;
  residencesLabel: string;
  contactLabel: string;
  navLinks: SpringsNavLink[];
}

export interface SpringsGalleryContent {
  /** 6 ảnh (gốc `0.preloader/preloader-left-1/2/3` + `preloader-right-1/2/3`),
   *  chia 2 cột x 3 ảnh, mỗi cột crossfade tuần tự khi cuộn qua pin. */
  images: string[];
}

export interface SpringsHeroContent {
  /** h1 opening — gốc "Premium Living\nwith Unrivaled Views" (\n = xuống dòng). */
  title: string;
  /** Subtitle dưới h1 — gốc "Apartments, terraced townhouses...". */
  subtitle: string;
  /** Ảnh nền lớn thu hẹp bằng clip-path khi cuộn (gốc `intro-image`). */
  backgroundImage: string;
  /** 3 ảnh cột phải reveal tuần tự khi cuộn (gốc opening-1/3/2). */
  revealImages: string[];
}

export interface SpringsIntroContent {
  statement: string;
  tagline: string;
  description: string;
  image: string;
}

/**
 * Firma Template — Strategy / Digital: case-study hero card 2 cột.
 */
export interface FramerFirmaTemplateStrategyDigitalContent {
  imageUrl: string;
  eyebrow: string;
  heading: string;
  body: string;
  linkLabel: string;
  linkHref: string;
}

/**
 * Housent Our Excellence: nền trắng, badge "Foundation of Trust" + heading
 * "Our Excellence" + body trung tâm, 8 satellite items (icon + label) xếp
 * theo vòng tròn desktop / stack dọc mobile. Cảm hứng GSAP ScrollTrigger từ
 * housent.webflow.io — entrance là circle-items fade-up + badge reveal.
 * Port từ recon-housent-our-excellence.
 *
 * Flat item fields (ScrollMattis pattern). `items[]` = legacy fallback.
 */
export interface HousentOurExcellenceItem {
  label: string;
  icon: string;
}

export interface HousentOurExcellenceContent {
  badge: string;
  heading: string;
  body: string;
  item1Label?: string;
  item1Icon?: string;
  item2Label?: string;
  item2Icon?: string;
  item3Label?: string;
  item3Icon?: string;
  item4Label?: string;
  item4Icon?: string;
  item5Label?: string;
  item5Icon?: string;
  item6Label?: string;
  item6Icon?: string;
  item7Label?: string;
  item7Icon?: string;
  item8Label?: string;
  item8Icon?: string;
  /** Legacy nested array — resolveItems fallback. */
  items?: HousentOurExcellenceItem[];
}

export interface FramerFaqMinimalContent {
  title: string;
  ctaText: string;
  ctaHref: string;
  items: Array<{ question: string; answer: string }>;
}

export interface SpringsWellnessContent {
  tagline: string;
  heading: string;
  description: string;
  images: string[];
}

export interface SpringsNaturePlaceContent {
  natureHeading: string;
  natureDescription: string;
  natureImage: string;
  placeHeading: string;
  placeDescription: string;
  placeCaption: string;
  placeImage: string;
}

export interface SpringsMapContent {
  heading: string;
  description: string;
  mapImage: string;
}

/**
 * Port section `3. Vị trí` + `4. MaP` của template Framer real-estate-1
 * (apps/real-estate-1). Nguồn là 2 sibling absolute trên canvas 372px cố định,
 * gộp lại thành 1 block: 3 dòng chữ ở trên, video bản đồ full-bleed ở dưới.
 */
export interface RealEstateLocationContent {
  eyebrow: string;
  title: string;
  description: string;
  /** Clip bản đồ chạy loop (mp4). */
  videoUrl: string;
}

/** Một cặp nhãn/giá trị trong hàng thông số đáy banner (vd "VỊ TRÍ" / "ĐẮC ĐỊA"). */
export interface RealEstateHeroStat {
  label: string;
  value: string;
}

/**
 * Port section `1. Banner` của template Framer real-estate-1
 * (apps/real-estate-1): ảnh full-bleed parallax + gradient đen từ đáy + ba cặp
 * thông số canh giữa sát đáy.
 */
export interface RealEstateHeroContent {
  imageUrl: string;
  stats: RealEstateHeroStat[];
}

/**
 * Port section `1.1 Intro` của template Framer real-estate-1
 * (apps/real-estate-1): icon mặt trời + tiêu đề + mô tả, canh giữa.
 *
 * Bản apps hard-code icon thành hằng `ICON_SVG` inline. Ở host icon là field
 * ảnh: author đổi được từ Layers, và bỏ luôn được `<clipPath>` của bản gốc —
 * id trong đó đụng nhau khi block xuất hiện 2 lần trên cùng một trang.
 */
export interface RealEstateInfoContent {
  /** Icon trang trí phía trên tiêu đề (mặc định: sunburst xanh của template). */
  iconUrl: string;
  title: string;
  description: string;
  /**
   * Ảnh đại diện dưới phần mô tả — nguồn là component `2. Hình đại diện`
   * (`HNhIDiN`), 372×454 @ top 852. Khi cuộn tới, khung mask co lại còn
   * 306×374 trong khi ảnh giữ nguyên kích thước → hiệu ứng crop-in.
   */
  imageUrl: string;
}

/** Một hạng mục trong lưới tổng quan: icon tròn ở trên, chữ canh giữa ở dưới. */
export interface RealEstateOverviewStat {
  /**
   * Icon tròn (đĩa trắng + line art xanh). Là field ảnh chứ không phải SVG
   * inline, cùng lý do với `RealEstateInfoContent.iconUrl` ở trên.
   */
  iconUrl: string;
  /** `\n` ép xuống dòng — nguồn ngắt dòng thủ công giữa các cụm. */
  text: string;
}

/**
 * Port section `5. Tổng quan dự án` của template Framer real-estate-1
 * (apps/real-estate-1): tiêu đề 2 dòng canh giữa + lưới 2 cột × 3 hàng, mỗi ô
 * là một icon tròn trên một dòng chữ.
 *
 * Số hạng mục cố định 6 như nguồn — mỗi icon gắn ngữ nghĩa riêng với chữ của
 * nó, nên không mở list manager add/xoá (xem docblock component).
 */
export interface RealEstateOverviewContent {
  /** `\n` ép xuống dòng — nguồn tách title thành 2 dòng để stagger từng dòng. */
  title: string;
  stats: RealEstateOverviewStat[];
}

/** Một card trong track ngang "Điểm nổi trội": ảnh tròn + số lớn + một dòng chữ. */
export interface RealEstateHighlightItem {
  /**
   * Số thứ tự HIỂN THỊ, do author nhập ("1.", "2."…) chứ không suy từ index —
   * giữ đúng nguồn, nơi dấu chấm nằm trong chuỗi và author có thể đánh số khác.
   */
  number: string;
  text: string;
  /** Ảnh vuông, bị crop tròn bằng `border-radius` (nguồn khai `99%`). */
  imageUrl: string;
}

/**
 * Port section `6. Điểm nổi trội dự án` của template Framer real-estate-1
 * (apps/real-estate-1): tiêu đề + mô tả canh giữa, dưới là dãy card trượt ngang
 * theo tiến độ cuộn của chính section.
 *
 * Số card cố định 4 như nguồn — không mở list manager, cùng lý do với
 * `RealEstateOverviewContent` (xem docblock component).
 */
export interface RealEstateHighlightsContent {
  title: string;
  description: string;
  items: RealEstateHighlightItem[];
}

/** Một slide trong carousel "Biệt thự": ảnh ngang + tên loại hình + mô tả. */
export interface RealEstateVillaSlide {
  title: string;
  description: string;
  /** Ảnh ngang, tỉ lệ 322/264 theo canvas nguồn. */
  imageUrl: string;
}

/**
 * Port section `7. Biệt thự` của template Framer real-estate-1
 * (apps/real-estate-1): eyebrow + tiêu đề canh giữa, dưới là carousel 4 slide
 * kèm counter, dots và hai nút prev/next.
 *
 * Slider của NGUỒN không advance được — đo bản live thì counter đứng nguyên
 * "1/4" qua mọi thao tác, vì callback tap bị truyền vào một component sinh tự
 * động và không bao giờ fire. Bản này dựng lại slider THẬT (cùng nội dung, cùng
 * tỉ lệ, thêm dots + phím mũi tên) thay vì chép lại một control chết.
 *
 * Số slide cố định 4 như nguồn — không mở list manager, cùng lý do với
 * `RealEstateHighlightsContent` (xem docblock component).
 */
export interface RealEstateVillaContent {
  eyebrow: string;
  title: string;
  slides: RealEstateVillaSlide[];
}

/** Một ô trong lưới nội khu: icon line art ở trên, label 2 dòng ở dưới. */
export interface RealEstateUtilityItem {
  /**
   * Icon line art nâu. Là field ảnh chứ không phải SVG inline, cùng lý do với
   * `RealEstateOverviewStat.iconUrl` — cộng thêm một lý do riêng: sáu icon này
   * nặng ~40KB (riêng icon BBQ 19KB), inline vào bundle block là phí.
   */
  iconUrl: string;
  /** `\n` ép xuống dòng — nguồn ngắt dòng thủ công giữa hai cụm chữ. */
  label: string;
}

/**
 * Port section `8. Nội khu` của template Framer real-estate-1
 * (apps/real-estate-1): tiêu đề canh giữa + lưới 2 cột × 3 hàng, mỗi ô là một
 * icon line art trên một label 2 dòng.
 *
 * Nguồn CÓ vẽ thêm một ảnh PNG full-bleed trong mỗi ô, nhưng wrapper của nó
 * compute ra `opacity: 0` và giữ nguyên kể cả khi hover — ảnh KHÔNG BAO GIỜ
 * hiện trên trang thật. Cũng không có card chrome: nền ô, hở cột và hở hàng
 * đều sample đúng `rgb(248,241,233)` y hệt nền trang, ô không viền/đổ bóng.
 * Nên section đọc ra là một dải sand phẳng với 6 cụm icon/label, không phải 6
 * panel — và bản port bỏ hẳn lớp ảnh đó thay vì chép một thứ vô hình.
 *
 * Số ô cố định 6 như nguồn — không mở list manager, cùng lý do với
 * `RealEstateOverviewContent` (xem docblock component).
 */
export interface RealEstateUtilitiesContent {
  title: string;
  items: RealEstateUtilityItem[];
}

export interface SpringsDesignSlide {
  subtitle: string;
  text: string;
  imageUrl: string;
}
export interface SpringsDesignContent {
  heading: string;
  slides: SpringsDesignSlide[];
}

export interface SpringsResidencesContent {
  heading: string;
  description: string;
  images: string[];
  captions: string[];
}

export interface SpringsInteriorsContent {
  heading: string;
  description: string;
  introImage: string;
  images: string[];
}

export interface SpringsContactFooterContent {
  contactHeading: string;
  contactDescription: string;
  submitLabel: string;
  footerLogoText: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerLinks: SpringsNavLink[];
  footerCopyright: string;
}

export type BlockContent =
  | HeroSplitContent
  | AlturaOlympusContent
  | HeroScrollContent
  | ScrollMattisContent
  | BrightedgeHeroContent
  | LumeaHeroContent
  | LumeaStatementContent
  | LumeaFeatureContent
  | LumeaAmenitiesContent
  | LumeaTestimonialContent
  | LumeaGalleryContent
  | LumeaFooterContent
  | NordhavenHeroContent
  | NordhavenAboutContent
  | NordhavenServicesContent
  | NordhavenPropertiesContent
  | NordhavenTestimonialsContent
  | NordhavenFaqContent
  | NordhavenGalleryContent
  | NordhavenFooterContent
  | FirmaHeroContent
  | FirmaStatementContent
  | FirmaWorkContent
  | FirmaTestimonialContent
  | FirmaServicesContent
  | FirmaFooterContent
  | IgnitexHeroContent
  | IgnitexServicesContent
  | IgnitexProjectsContent
  | IgnitexAboutContent
  | IgnitexCtaContent
  | IgnitexFooterContent
  | ReadymagMarqueeContent
  | ReadymagProjectsContent
  | ReadymagFooterContent
  | ProtectionScrollytellingContent
  | HousentHeroContent
  | HousentStatsContent
  | HousentListingsContent
  | HousentCtaContent
  | HousentFooterContent
  | HousentAboutContent
  | HousentExcellenceContent
  | HousentSolutionsContent
  | HousentValuesContent
  | HousentFaqContent
  | HousentTestimonialContent
  | HousentBlogsContent
  | HeroOverlayContent
  | FeatureSectionContent
  | BookingFormContent
  | MintDetailsContent
  | MintSkuContent
  | MintHeroContent
  | MintVariantsContent
  | MintDiscoverContent
  | PnjHeroContent
  | CoolHunterHeroContent
  | CoolHunterSectionProgressContent
  | CoolHunterStoryContent
  | CoolHunterGalleryContent
  | CoolHunterProductContent
  | CoolHunterQuoteContent
  | CoolHunterFooterContent
  | PnjDetailsContent
  | PnjVariantContent
  | PnjHeaderContent
  | PnjStickyMenuContent
  | PnjCtaContent
  | TheGrandIntroContent
  | TheGrandLocationContent
  | TheGrandDiscoverContent
  | TheGrandServiceContent
  | TheGrandAboutContent
  | TheGrandFooterContent
  | MintV2EmblemContent
  | MintV2ServicesContent
  | MintV2ManifestoContent
  | MintV2ProcessContent
  | MintV2CtaContent
  | MintV2WorksContent
  | LineaPortfolioContent
  | MintVaultHeroContent
  | MintVaultCraftContent
  | MintVaultRevealContent
  | MintVaultCollectionContent
  | MintVaultInvitationContent
  | CtaSectionContent
  | ImageCarouselContent
  | InteractiveAdWidgetContent
  | StoriesContent
  | SplitScreenContent
  | QuizContent
  | PollContent
  | Carousel3dContent
  | FlipbookContent
  | PanoramaContent
  | TextDisplaceHeroContent
  | ImageTrailContent
  | StickyScrollCardsContent
  | Gallery3dDepthContent
  | ParallaxHeroContent
  | LightboxFlipContent
  | FlipGalleryContent
  | WheelGalleryContent
  | HoverRevealListContent
  | HoverEqualizerHeadingContent
  | BrutalistTextContent
  | ImageExplosionContent
  | StorySlidesContent
  | AccordionMediaContent
  | SpotlightContent
  | ProcessStepsContent
  | DotMatrixContent
  | InteractiveGridContent
  | PixelRevealContent
  | MarqueeBandContent
  | LetterSliderContent
  | SeamlessScrollGalleryContent
  | ProductSpecSheetContent
  | FramerYumeHeroContent
  | FramerArpeggioHeroV2Content
  | FramerPerformHeroContent
  | FramerBungeeHeroV2Content
  | FramerPurevisualsHeroContent
  | FramerIntroRedefinedContent
  | FramerExploreCtaContent
  | FramerFlatWhiteProcessContent
  | FramerStudioManifestoContent
  | FramerStatsGridContent
  | FramerProjectsGridContent
  | MasteriseHomeInsideContent
  | FramerTeamDirectoryContent
  | FramerImageStaggerContent
  | FramerAesthaEditorialContent
  | AesthaExploreContent
  | AesthaStudioContent
  | AesthaContactContent
  | AesthaProjectContent
  | FramerEstanciaAboutUsContent
  | FramerPerformAboutContent
  | FramerPerformPricingContent
  | FramerFirmaTemplateStrategyDigitalContent
  | HousentOurExcellenceContent
  | FramerFaqMinimalContent
  | FramerDarlingTimelineContent
  | FramerNftpullTimelineContent
  | FramerSignatureFeatureContent
  | FramerVsCollinsProjectsContent
  | FramerIgnitexStepContent
  | FramerRealEstate02StoryContent
  | FramerRealEstate02QuoteContent
  | FramerRealEstate02GalleryContent
  | FramerRealEstate02ProductContent
  | FramerRealEstate02OverviewContent
  | FramerRealEstate02LocationContent
  | FramerRealEstate02CommuteContent
  | FramerRealEstate02MapContent
  | FramerRealEstate02MenuContent
  | FramerClarityServicesContent
  | DelvauxHeaderContent
  | DelvauxSubnavContent
  | DelvauxHeroContent
  | DelvauxDetailsContent
  | DelvauxProductContent
  | DelvauxVariantContent
  | Q80ExperienceContent
  | Q80MenuContent
  | SpringsHeaderContent
  | SpringsGalleryContent
  | SpringsHeroContent
  | SpringsIntroContent
  | SpringsWellnessContent
  | SpringsNaturePlaceContent
  | SpringsMapContent
  | RealEstateLocationContent
  | RealEstateHeroContent
  | RealEstateInfoContent
  | RealEstateOverviewContent
  | RealEstateHighlightsContent
  | RealEstateVillaContent
  | RealEstateUtilitiesContent
  | SpringsDesignContent
  | SpringsResidencesContent
  | SpringsInteriorsContent
  | SpringsContactFooterContent
  | ReadymagCaseSectionContent
  | SustainitOurExpertiseContent
  | RolexCollectionHeroContent
  | RolexCollectionNavContent
  | RolexContactContent
  | RolexCollectionWorkContent
  | RolexCollectionProjectContent
  | Record<string, unknown>;

/**
 * Per-device variant wrapper. `desktop` is required (used for tablet too);
 * `mobile` is optional — when missing, render falls back to `desktop`.
 * See `docs/canvas-block-responsive-spec.md` §5 for the convention.
 */
export interface DeviceVariants<T> {
  desktop: T;
  mobile?: T;
}

/** Which variant the editor is currently writing to. Tablet maps to desktop. */
export type EditingVariant = 'desktop' | 'mobile';

export function editingVariantOf(device: Device): EditingVariant {
  return device === 'mobile' ? 'mobile' : 'desktop';
}

/** Resolve the variant to RENDER for the given device. Falls back to desktop. */
export function readVariant<T>(
  v: DeviceVariants<T> | undefined,
  device: Device
): T | undefined {
  if (!v) return undefined;
  if (device === 'mobile') return v.mobile ?? v.desktop;
  return v.desktop;
}

/**
 * Per-block motion config — track-based timeline. See `motion/types.ts`
 * for the full shape definition. Re-exported here as `BlockMotionStored`
 * to keep the wire format name stable.
 */
import type { BlockMotion } from './motion/types';
export type BlockMotionStored = BlockMotion;

// ── ExtraElement (free-drag user-added objects) ──────────────────────────
// Spec: `docs/be-extra-elements-spec.md`. Four kinds per phase 1; each is
// absolutely positioned inside the block frame so users can drag freely
// (Figma-style). Persisted as `block.extraElements[]` in canvas_data.

export type ExtraElementKind =
  | 'text'
  | 'edit_text'
  | 'photo'
  | 'video'
  | 'hotspot'
  | 'compare'
  | 'range'
  | 'countdown'
  | 'reveal'
  | 'spin_wheel';

export interface ExtraPosition {
  x: number;
  y: number;
}
export interface ExtraSize {
  width: number;
  height: number;
}

/** Style fields shared across kinds. Each kind's renderer may ignore irrelevant ones. */
export interface ExtraElementStyle {
  // Text-ish
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  fontFamily?: string; // font id (src/lib/fonts.ts)
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  lineHeight?: number;
  letterSpacing?: number;
  // Box
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  opacity?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  // edit_text input
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  // ── Wave 1 visual effects (any kind can opt in) ──────────────────────
  /** Glassmorphism backdrop blur. When true the element gains backdrop-blur
   *  + a translucent tint, regardless of `backgroundColor`. */
  glass?: boolean;
  /** Optional override of the glass tint. Defaults to white/12%. */
  glassTint?: string;
  /** When set, an animated conic-gradient "beam" runs around the border.
   *  Color = this value. Pair with `borderRadius` for rounded effects. */
  beamColor?: string;
  /** Beam revolution time in seconds. Default 3s. */
  beamSpeedSec?: number;
}

/**
 * Animated-text variants for `text` ExtraElement. All optional — when set,
 * the renderer wraps the text with an effect that fires once on viewport
 * entry (IntersectionObserver). Counter and marquee are mutually exclusive
 * with `animation`; renderer picks them in priority: counter > marquee >
 * animation > plain.
 */
export type TextAnimationMode =
  | 'none'
  | 'fade-up'
  | 'typewriter'
  | 'split-slide-up';

export interface TextCounterConfig {
  /** Starting value of the count-up. Defaults to 0. */
  from?: number;
  /** Required target value once animation completes. */
  to: number;
  /** Duration in ms. Defaults to 1600. */
  durationMs?: number;
  /** Optional prefix shown before the number (e.g. "$"). */
  prefix?: string;
  /** Optional suffix shown after the number (e.g. "+", "%", "₫"). */
  suffix?: string;
  /** Number of decimal places. Defaults to 0. */
  decimals?: number;
  /** When true, thousand separators are inserted (Vietnamese locale). */
  thousandSep?: boolean;
}

export interface TextMarqueeConfig {
  /** Time (seconds) it takes the text to fully cycle once. */
  speedSec?: number;
  /** Direction of travel. Default 'left'. */
  direction?: 'left' | 'right';
}

export interface ExtraTextContent {
  text: string;
  textEn?: string;
  animation?: TextAnimationMode;
  /** Animation duration in ms (used by fade-up / typewriter / split-slide-up). */
  animationDurationMs?: number;
  /** When set, the text is overridden by an animated count-up of `to`. */
  counter?: TextCounterConfig;
  /** When set, the text scrolls horizontally — overrides animation. */
  marquee?: TextMarqueeConfig;
}
export interface ExtraEditTextContent {
  placeholder: string;
  placeholderEn?: string;
  defaultValue?: string;
  fieldName: string;
  inputType: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  isRequired: boolean;
  maxLength?: number;
}
export interface ExtraPhotoContent {
  mediaId: string;
  alt?: string;
  altEn?: string;
  /**
   * When set, the photo becomes a 2-sided card. Tapping (or hovering) flips
   * it to reveal the back side (a separate media id). Powers `tap-to-flip`
   * reveal patterns without needing a separate kind.
   */
  flipMediaId?: string;
  flipMode?: 'tap' | 'hover';
}
export interface ExtraVideoContent {
  source: 'media' | 'url';
  mediaId?: string;
  url?: string;
  poster?: string;
  alt?: string;
}

/**
 * Hotspot: a small pin user-positioned on a block (typically over an image)
 * that opens a popover on click. Use case: floorplan tooltips, product
 * details, map markers. Popover content is editable inline.
 */
export interface ExtraHotspotContent {
  /** Pin label rendered inside the pin chip — often a number or icon char. */
  pinLabel?: string;
  /** Popup title (one-liner). */
  title: string;
  /** Popup body — multi-line text. */
  body?: string;
  /** Optional image rendered at the TOP of the popup (Notion/Figma-style). */
  imageUrl?: string;
  /** Optional CTA button inside the popup. */
  ctaText?: string;
  ctaUrl?: string;
  /** Trigger — phase 1 only `click`; defer hover. */
  trigger?: 'click';
}

/**
 * Compare slider (before/after). Two images stacked; a draggable handle
 * masks the front image via `clip-path: inset(0 X% 0 0)` so dragging the
 * handle reveals the back image. Use case: renovation, day/night,
 * before/after photo edits.
 */
export interface ExtraCompareContent {
  /** Image shown ON TOP, masked by the handle. */
  beforeUrl: string;
  /** Image shown UNDERNEATH, revealed as the handle drags right. */
  afterUrl: string;
  /** Initial reveal ratio 0–1 (handle position). Defaults to 0.5. */
  defaultRatio?: number;
  /** Optional alt text per image for a11y. */
  beforeAlt?: string;
  afterAlt?: string;
}

/**
 * Range slider input — HTML5 `<input type="range">` wrapped so users can
 * place a continuous-value picker (budget, area, etc) on a block. The
 * current value is submitted along with form data via `fieldName`.
 */
export interface ExtraRangeContent {
  fieldName: string;
  label?: string;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  /** When true, the live value is shown next to the track. Default true. */
  showValue?: boolean;
  /** Optional unit suffix appended to the displayed value (e.g. "₫", "m²"). */
  unit?: string;
}

/**
 * Countdown timer — counts down to `targetIso`. Renders the time-remaining
 * in any combination of days/hours/minutes/seconds. After it reaches zero
 * the element shows `expiredText`. Use case: flash sales, event countdowns,
 * Live Availability "X seats left" badges.
 */
export interface ExtraCountdownContent {
  /** ISO timestamp to count down to (e.g. "2026-12-31T23:59:00+07:00"). */
  targetIso: string;
  /** Which units to display. Default ['days', 'hours', 'minutes', 'seconds']. */
  units?: Array<'days' | 'hours' | 'minutes' | 'seconds'>;
  /** Optional label rendered above the digits. */
  label?: string;
  /** Text shown after the target time passes. Defaults to "Đã kết thúc". */
  expiredText?: string;
  /** Visual style — flat digits or flip-card. Default 'flat'. */
  style?: 'flat' | 'flip';
}

/**
 * Reveal element — a "cover" image overlaid on top of a "reveal" image,
 * gradually wiped to expose the bottom layer via user interaction. Mode
 * picks the gesture / wipe geometry:
 *   - 'scratch' — paint over with the cursor to erase
 *   - 'peel' — drag from a corner to peel diagonally
 *   - 'spotlight' — small circle follows pointer (cursor reveal)
 *   - 'tap' — single tap fades out the cover entirely
 */
export interface ExtraRevealContent {
  coverUrl: string;
  revealUrl: string;
  mode: 'scratch' | 'peel' | 'spotlight' | 'tap';
  /** Spotlight / scratch brush radius in px. Default 60. */
  brushSize?: number;
}

/**
 * Spin wheel — segmented circle that spins on click and lands on a random
 * (or weight-biased) segment. The result event fires through tracking.
 */
export interface SpinWheelSegment {
  id: string;
  label: string;
  /** Color of the wedge fill. */
  color?: string;
  /** Optional prize text shown when the wheel lands on this segment. */
  prize?: string;
  /** Weight (default 1). Higher = more likely to be picked. */
  weight?: number;
}

export interface ExtraSpinWheelContent {
  segments: SpinWheelSegment[];
  /** Spin animation duration in ms. Default 4000. */
  spinDurationMs?: number;
  /** Label rendered on the spin button. Default "Quay". */
  buttonLabel?: string;
}

export type ExtraElementContent =
  | ExtraTextContent
  | ExtraEditTextContent
  | ExtraPhotoContent
  | ExtraVideoContent
  | ExtraHotspotContent
  | ExtraCompareContent
  | ExtraRangeContent
  | ExtraCountdownContent
  | ExtraRevealContent
  | ExtraSpinWheelContent;

/**
 * Optional analytics tracking config. When set, public render fires an
 * event when the user interacts with the element (click for text / photo /
 * video / hotspot, submit for edit_text). FE adapter dispatches it via
 * `window.dispatchEvent(new CustomEvent('rexer:track', { detail }))` so
 * any analytics provider (GA, Posthog, custom) can subscribe.
 */
export interface ExtraElementTracking {
  /** Optional toggle — when false, FE skips emitting the event. Default true if any field is set. */
  enabled?: boolean;
  /** Event name string — required when tracking is in use. Example: `cta_click_hotspot_floorplan`. */
  eventName?: string;
  /** Free-form category (e.g. `cta`, `engagement`, `form_submit`). */
  eventCategory?: string;
  /** Optional free-form bag of static properties sent with the event. */
  customData?: Record<string, string | number | boolean>;
}

interface ExtraElementBase {
  id: string;
  position: ExtraPosition;
  size: ExtraSize;
  rotation?: number;
  zIndex?: number;
  isVisible?: boolean;
  style?: ExtraElementStyle;
  /** Analytics config — see `ExtraElementTracking`. */
  tracking?: ExtraElementTracking;
}

export interface TextExtraElement extends ExtraElementBase {
  kind: 'text';
  content: ExtraTextContent;
}
export interface EditTextExtraElement extends ExtraElementBase {
  kind: 'edit_text';
  content: ExtraEditTextContent;
}
export interface PhotoExtraElement extends ExtraElementBase {
  kind: 'photo';
  content: ExtraPhotoContent;
}
export interface VideoExtraElement extends ExtraElementBase {
  kind: 'video';
  content: ExtraVideoContent;
}
export interface HotspotExtraElement extends ExtraElementBase {
  kind: 'hotspot';
  content: ExtraHotspotContent;
}
export interface CompareExtraElement extends ExtraElementBase {
  kind: 'compare';
  content: ExtraCompareContent;
}
export interface RangeExtraElement extends ExtraElementBase {
  kind: 'range';
  content: ExtraRangeContent;
}
export interface CountdownExtraElement extends ExtraElementBase {
  kind: 'countdown';
  content: ExtraCountdownContent;
}
export interface RevealExtraElement extends ExtraElementBase {
  kind: 'reveal';
  content: ExtraRevealContent;
}
export interface SpinWheelExtraElement extends ExtraElementBase {
  kind: 'spin_wheel';
  content: ExtraSpinWheelContent;
}

export type ExtraElement =
  | TextExtraElement
  | EditTextExtraElement
  | PhotoExtraElement
  | VideoExtraElement
  | HotspotExtraElement
  | CompareExtraElement
  | RangeExtraElement
  | CountdownExtraElement
  | RevealExtraElement
  | SpinWheelExtraElement;

export interface Block {
  id: string;
  blockType: BlockType;
  name: string;
  isVisible: boolean;
  thumbnail?: string;
  /** Per-language, per-device content. */
  contentVi: DeviceVariants<BlockContent>;
  contentEn: DeviceVariants<BlockContent>;
  /** Per-element CSS overrides — per-device, lang-agnostic. */
  elementStyles?: DeviceVariants<ElementStylesMap>;
  /** Block-level background override (color + image) — per-device, lang-agnostic. */
  background?: DeviceVariants<BlockBackground>;
  /**
   * Custom render order for the block's text-stack elements (e.g. swap title
   * above eyebrow). Stored as `string[]` of element keys; rendering applies
   * CSS `order: N` so reorder only takes effect within siblings of the same
   * flex container. Per-device, lang-agnostic.
   */
  elementOrder?: DeviceVariants<string[]>;
  /**
   * Per-element free-form offset applied via `transform: translate`. Lets
   * the user drag elements around on the canvas without breaking flex
   * layout. Per-device, lang-agnostic.
   */
  elementPositions?: DeviceVariants<ElementPositionsMap>;
  /**
   * User-added free-drag elements layered absolutely on top of the block
   * (text / edit_text / photo / video). Spec: `docs/be-extra-elements-spec.md`.
   * Phase 1: flat array (no per-device override yet — defer per BE Q5).
   */
  extraElements?: ExtraElement[];
  /**
   * Motion config — per-device track-based timeline. Tracks target individual
   * element keys (or `__block__` for the block root). Stored verbatim and
   * passed through serialize.
   */
  motion?: DeviceVariants<BlockMotionStored>;
}

/**
 * Whether an element key has a mobile override that differs from its desktop
 * counterpart. Returns true when ANY of these differ between desktop ↔ mobile:
 *   - element style (e.g. `block.elementStyles.{desktop,mobile}.title`)
 *   - localized content field (e.g. `block.contentVi.{desktop,mobile}.title`)
 *
 * For the special `__background__` key, compares the whole `background` map.
 *
 * Used by LayersPanel to surface a "📱 ●" badge so users know which elements
 * have been customised for the mobile variant.
 */
export function hasMobileOverride(block: Block, elementKey: string): boolean {
  // Background — compare whole map for the key.
  if (elementKey === '__background__') {
    const d = block.background?.desktop;
    const m = block.background?.mobile;
    if (!m) return false;
    return JSON.stringify(d ?? null) !== JSON.stringify(m);
  }
  // Style overrides
  const styleD = block.elementStyles?.desktop?.[elementKey];
  const styleM = block.elementStyles?.mobile?.[elementKey];
  if (styleM && JSON.stringify(styleD ?? null) !== JSON.stringify(styleM)) {
    return true;
  }
  // Position overrides
  const posD = block.elementPositions?.desktop?.[elementKey];
  const posM = block.elementPositions?.mobile?.[elementKey];
  if (posM && JSON.stringify(posD ?? null) !== JSON.stringify(posM)) {
    return true;
  }
  // Content (vi + en).
  for (const lang of ['contentVi', 'contentEn'] as const) {
    const variants = block[lang];
    const d = (variants?.desktop as Record<string, unknown> | undefined)?.[
      elementKey
    ];
    const m = (variants?.mobile as Record<string, unknown> | undefined)?.[
      elementKey
    ];
    if (m === undefined) continue;
    if (JSON.stringify(d ?? null) !== JSON.stringify(m)) return true;
  }
  return false;
}

/**
 * Single source-of-truth metadata cho mỗi block type. Trước đây các thuộc
 * tính này nằm rải ở ~7 map `Record<BlockType, string>` song song (factory
 * NAME_BY_TYPE, mock, buildAiPrompt BLOCK_LABEL, Admin BLOCK_TYPE_LABEL/
 * GRADIENT, analytics…). Gom về đây để thêm 1 block type mới = 1 entry, thay
 * vì sửa 10 chỗ. Mọi consumer derive từ registry này.
 */
/**
 * Category chuẩn cho catalog (brief block-library 2026-07): 14 category BĐS
 * gốc (hero…footer) + nhóm mở rộng cho kho hiện có (cta, feature, listing,
 * portfolio, services, interactive, blog, marquee). `floorplan`/`urgency`
 * chưa có block nào — giữ trong union để recipe dùng dần.
 */
export type BlockCategory =
  | 'hero'
  | 'intro'
  | 'location'
  | 'floorplan'
  | 'amenity'
  | 'gallery'
  | 'pricing'
  | 'progress'
  | 'trust'
  | 'form'
  | 'urgency'
  | 'faq'
  | 'header'
  | 'footer'
  | 'navigation'
  | 'cta'
  | 'feature'
  | 'listing'
  | 'portfolio'
  | 'services'
  | 'interactive'
  | 'blog'
  | 'marquee';

/** Tông thẩm mỹ tổng thể của block — dùng để lọc catalog + ghép recipe đồng bộ. */
export type BlockStyleTone = 'luxury' | 'modern' | 'minimal' | 'friendly';

/**
 * Trạng thái sẵn sàng của block trong catalog: `ready` dùng ngay,
 * `needs-fix` còn lỗi CSS/mobile, `draft` chưa hoàn thiện. Block khác
 * `ready` sẽ bị script build-template từ chối.
 */
export type BlockStatus = 'ready' | 'needs-fix' | 'draft';

export interface BlockTypeMeta {
  type: BlockType;
  /** Nhãn ngắn ở canvas editor (chip block, picker "Block cơ bản"). */
  label: string;
  /** Màu accent (hex) cho chrome editor. */
  accent: string;
  /** Nhãn ở card /admin/blocks + block detail + analytics grid. */
  adminLabel: string;
  /** Tailwind gradient cho card admin. */
  gradient: string;
  /** Tên mặc định khi tạo block mới (factory + mock). */
  defaultName: string;
  /** Mô tả dùng trong prompt AI edit (vi / en). */
  aiLabelVi: string;
  aiLabelEn: string;
  // ── Catalog fields (optional ở đây để def cũ không vỡ; BLOCK_TYPE_META
  // bên dưới ép Required — nguồn sự thật duy nhất cho catalog) ──
  /** Category chuẩn hóa cho catalog/recipe. */
  category?: BlockCategory;
  /** Tag tự do để tìm kiếm trong catalog (site gốc, kỹ thuật, vertical…). */
  tags?: string[];
  /** Tông thẩm mỹ. */
  style?: BlockStyleTone;
  /** Trạng thái sẵn sàng. */
  status?: BlockStatus;
  /** Đã pass QA mobile chưa (container-query là convention nhà, mặc định true). */
  responsive?: boolean;
  /** Ngày cập nhật metadata gần nhất (YYYY-MM-DD). */
  updatedAt?: string;
}

/** Meta đầy đủ trường catalog — bắt buộc với mọi entry trong BLOCK_TYPE_META. */
export type BlockTypeMetaCatalog = BlockTypeMeta &
  Required<
    Pick<
      BlockTypeMeta,
      'category' | 'tags' | 'style' | 'status' | 'responsive' | 'updatedAt'
    >
  >;

export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMetaCatalog> = {
  hero_split: {
    type: 'hero_split',
    category: 'hero',
    style: 'modern',
    tags: ['hero', 'split'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero Split',
    accent: '#0A0A0A',
    adminLabel: 'Hero Split',
    gradient: 'from-rose-400 to-red-500',
    defaultName: 'Hero Split',
    aiLabelVi: 'block hero (chia đôi)',
    aiLabelEn: 'split-layout hero block',
  },
  hero_scroll: {
    type: 'hero_scroll',
    category: 'hero',
    style: 'modern',
    tags: ['hero', 'scroll'],
    status: 'draft',
    responsive: true,
    updatedAt: '2026-07-07',
    label: 'Hero Scroll',
    accent: '#171717',
    adminLabel: 'Hero Scroll',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Hero Scroll',
    aiLabelVi: 'block hero scroll (placeholder)',
    aiLabelEn: 'scroll-linked hero block (placeholder)',
  },
  altura_olympus: {
    type: 'altura_olympus',
    category: 'intro',
    style: 'luxury',
    tags: ['scroll', 'split', 'gallery'],
    status: 'draft',
    responsive: true,
    updatedAt: '2026-07-07',
    label: 'Altura Olympus',
    accent: '#457B6D',
    adminLabel: 'Altura Olympus',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Altura Olympus',
    aiLabelVi:
      'scroll split 50/50: ảnh trái đè ảnh phải → thoát → content trái + ảnh phải scrub m1-m4',
    aiLabelEn:
      '50/50 scroll split: left image overlays right → exits → left content + right image scrub m1-m4',
  },
  scroll_mattis: {
    type: 'scroll_mattis',
    category: 'hero',
    style: 'modern',
    tags: ['scroll'],
    status: 'draft',
    responsive: true,
    updatedAt: '2026-07-07',
    label: 'Scroll - Mattis',
    accent: '#171717',
    adminLabel: 'Scroll - Mattis',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Scroll - Mattis',
    aiLabelVi:
      'scroll reveal N slide (ảnh/video): slide active thu nhỏ + mờ, slide kế zoom in thay thế theo cuộn',
    aiLabelEn:
      'scroll reveal with N slides (image/video): active slide shrinks and fades while the next zooms in',
  },
  hero_overlay: {
    type: 'hero_overlay',
    category: 'hero',
    style: 'modern',
    tags: ['hero', 'overlay'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero Overlay',
    accent: '#1f2937',
    adminLabel: 'Hero Overlay',
    gradient: 'from-zinc-700 to-zinc-900',
    defaultName: 'Hero Overlay',
    aiLabelVi: 'block hero (toàn cảnh có overlay)',
    aiLabelEn: 'full-bleed hero overlay block',
  },
  feature_section: {
    type: 'feature_section',
    category: 'feature',
    style: 'modern',
    tags: ['feature'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Feature',
    accent: '#0f766e',
    adminLabel: 'Features',
    gradient: 'from-emerald-400 to-teal-500',
    defaultName: 'Tiện ích nổi bật',
    aiLabelVi: 'section tiện ích / điểm nổi bật',
    aiLabelEn: 'feature highlights section',
  },
  booking_form: {
    type: 'booking_form',
    category: 'form',
    style: 'friendly',
    tags: ['form', 'booking', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Booking',
    accent: '#b45309',
    adminLabel: 'Booking Form',
    gradient: 'from-blue-500 to-violet-500',
    defaultName: 'Đặt chỗ',
    aiLabelVi: 'form đăng ký / đặt chỗ',
    aiLabelEn: 'booking / lead form',
  },
  cta_section: {
    type: 'cta_section',
    category: 'cta',
    style: 'modern',
    tags: ['cta'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'CTA',
    accent: '#be123c',
    adminLabel: 'CTA',
    gradient: 'from-amber-400 to-orange-500',
    defaultName: 'CTA',
    aiLabelVi: 'section call-to-action cuối trang',
    aiLabelEn: 'closing call-to-action section',
  },
  mint_details: {
    type: 'mint_details',
    category: 'feature',
    style: 'luxury',
    tags: ['mint', 'product'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Mint · Details',
    accent: '#a16207',
    adminLabel: 'Mint Details',
    gradient: 'from-amber-500 to-yellow-700',
    defaultName: 'Mint Details',
    aiLabelVi: 'section mô tả chi tiết sản phẩm (tiêu đề + 2 đoạn)',
    aiLabelEn: 'product details section (title + 2 paragraphs)',
  },
  mint_sku: {
    type: 'mint_sku',
    category: 'pricing',
    style: 'luxury',
    tags: ['mint', 'sku', 'product'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Mint · SKU',
    accent: '#a16207',
    adminLabel: 'Mint SKU',
    gradient: 'from-yellow-600 to-amber-800',
    defaultName: 'Mint SKU',
    aiLabelVi: 'section showcase SKU cuối trang (tiêu đề lớn)',
    aiLabelEn: 'closing SKU showcase section (large title)',
  },
  mint_hero: {
    type: 'mint_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['mint', 'hero'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Mint · Hero',
    accent: '#a16207',
    adminLabel: 'Mint Hero',
    gradient: 'from-amber-400 to-yellow-600',
    defaultName: 'Mint Hero',
    aiLabelVi: 'hero coin với canvas xoay + overlay 3 dòng',
    aiLabelEn: 'coin hero with rotating canvas + 3-line overlay',
  },
  mint_variants: {
    type: 'mint_variants',
    category: 'pricing',
    style: 'luxury',
    tags: ['mint', 'variants', 'product'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Mint · Variants',
    accent: '#a16207',
    adminLabel: 'Mint Variants',
    gradient: 'from-yellow-500 to-amber-700',
    defaultName: 'Mint Variants',
    aiLabelVi: 'section chọn biến thể sản phẩm (swatch picker)',
    aiLabelEn: 'product variant picker section',
  },
  mint_discover: {
    type: 'mint_discover',
    category: 'gallery',
    style: 'luxury',
    tags: ['mint', 'discover'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Mint · Discover',
    accent: '#a16207',
    adminLabel: 'Mint Discover',
    gradient: 'from-amber-600 to-yellow-800',
    defaultName: 'Mint Discover',
    aiLabelVi: 'section khám phá chi tiết coin (hotspot + drawer)',
    aiLabelEn: 'coin detail discover section (hotspots + drawer)',
  },
  pnj_hero: {
    type: 'pnj_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['pnj', 'hero', 'watch', 'citizen'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-14',
    label: 'PNJ · Hero',
    accent: '#003468',
    adminLabel: 'PNJ Hero',
    gradient: 'from-blue-900 to-slate-800',
    defaultName: 'PNJ Hero',
    aiLabelVi:
      'hero PNJ: ảnh storefront + overlay chữ + canvas scrub frame + hotspot drawer',
    aiLabelEn:
      'PNJ hero: storefront image + overlay copy + canvas frame scrub + hotspot drawer',
  },
  cool_hunter_section_progress: {
    type: 'cool_hunter_section_progress',
    category: 'feature',
    style: 'minimal',
    tags: ['cool-hunter', 'progress', 'navigation', 'overlay'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Cool Hunter · Section Progress',
    accent: '#111111',
    adminLabel: 'Cool Hunter Section Progress',
    gradient: 'from-neutral-200 to-neutral-700',
    defaultName: 'Cool Hunter Section Progress',
    aiLabelVi:
      'rail progress Cool Hunter: thanh tiến độ + nhãn section bên phải (desktop)',
    aiLabelEn:
      'Cool Hunter section progress rail: right-side scroll progress + section label (desktop)',
  },
  cool_hunter_hero: {
    type: 'cool_hunter_hero',
    category: 'hero',
    style: 'minimal',
    tags: ['cool-hunter', 'hero', 'scroll', 'scrub'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Cool Hunter · Hero',
    accent: '#111111',
    adminLabel: 'Cool Hunter Hero',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Cool Hunter Hero',
    aiLabelVi:
      'hero Cool Hunter: logo + tiêu đề serif, khung ảnh scrub phóng to phủ chữ (chữ đổi đen ↔ trắng)',
    aiLabelEn:
      'Cool Hunter hero: logo + serif title, image frame scrubs to full bleed over the copy (title flips black ↔ white)',
  },
  cool_hunter_story: {
    type: 'cool_hunter_story',
    category: 'intro',
    style: 'minimal',
    tags: ['cool-hunter', 'story', 'scroll', 'scrub'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Cool Hunter · Story',
    accent: '#111111',
    adminLabel: 'Cool Hunter Story',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Cool Hunter Story',
    aiLabelVi:
      'story Cool Hunter: hai đoạn văn + khung ảnh scrub 4 beat (text/ảnh trượt rồi đổi chỗ)',
    aiLabelEn:
      'Cool Hunter story: two copy blocks + image frame 4-beat scrub (text and image swap positions)',
  },
  cool_hunter_gallery: {
    type: 'cool_hunter_gallery',
    category: 'gallery',
    style: 'minimal',
    tags: ['cool-hunter', 'gallery', 'scroll', 'scrub'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Cool Hunter · Gallery',
    accent: '#111111',
    adminLabel: 'Cool Hunter Gallery',
    gradient: 'from-neutral-600 to-neutral-900',
    defaultName: 'Cool Hunter Gallery',
    aiLabelVi:
      'gallery Cool Hunter: N ảnh+caption scrub ngang (stack → hàng → cuộn, text fade theo nhịp)',
    aiLabelEn:
      'Cool Hunter gallery: N image+caption horizontal scrub (stack → row → scroll, text fades in beat)',
  },
  cool_hunter_product: {
    type: 'cool_hunter_product',
    category: 'feature',
    style: 'minimal',
    tags: ['cool-hunter', 'product', 'scroll', 'scrub'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Cool Hunter · Product',
    accent: '#111111',
    adminLabel: 'Cool Hunter Product',
    gradient: 'from-neutral-500 to-neutral-800',
    defaultName: 'Cool Hunter Product',
    aiLabelVi:
      'product Cool Hunter: mask bg scale + tiêu đề + bàn sản phẩm + panel chữ scrub',
    aiLabelEn:
      'Cool Hunter product: mask bg scale + title + product table + copy panel scrub',
  },
  cool_hunter_quote: {
    type: 'cool_hunter_quote',
    category: 'intro',
    style: 'minimal',
    tags: ['cool-hunter', 'quote', 'scroll', 'scrub'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Cool Hunter · Quote',
    accent: '#e8e3d8',
    adminLabel: 'Cool Hunter Quote',
    gradient: 'from-stone-300 to-neutral-700',
    defaultName: 'Cool Hunter Quote',
    aiLabelVi:
      'quote Cool Hunter: câu trích dẫn giữa + ảnh kéo từ phải phủ màn (veil nhạt dần)',
    aiLabelEn:
      'Cool Hunter quote: centered pull-quote covered by image wipe from the right (veil fades)',
  },
  cool_hunter_footer: {
    type: 'cool_hunter_footer',
    category: 'cta',
    style: 'minimal',
    tags: ['cool-hunter', 'footer', 'cta', 'scrub'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Cool Hunter · Footer',
    accent: '#111111',
    adminLabel: 'Cool Hunter Footer',
    gradient: 'from-neutral-200 to-neutral-800',
    defaultName: 'Cool Hunter Footer',
    aiLabelVi:
      'footer Cool Hunter: icon + tiêu đề CTA + nút Sign Up, ảnh nền dâng từ dưới khi scroll',
    aiLabelEn:
      'Cool Hunter footer: icon + CTA headline + Sign Up button, background image rises on scroll',
  },
  pnj_details: {
    type: 'pnj_details',
    category: 'intro',
    style: 'luxury',
    tags: ['pnj', 'details', 'editorial', 'citizen'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-14',
    label: 'PNJ · Details',
    accent: '#003468',
    adminLabel: 'PNJ Details',
    gradient: 'from-slate-100 to-blue-50',
    defaultName: 'PNJ Details',
    aiLabelVi:
      'section mô tả PNJ: pin scroll + word reveal tiêu đề và các đoạn văn',
    aiLabelEn:
      'PNJ details section: pinned scroll with word-reveal title and paragraphs',
  },
  pnj_variant: {
    type: 'pnj_variant',
    category: 'feature',
    style: 'luxury',
    tags: ['pnj', 'variant', 'product', 'citizen'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-14',
    label: 'PNJ · Variant',
    accent: '#003468',
    adminLabel: 'PNJ Variant',
    gradient: 'from-neutral-100 to-slate-200',
    defaultName: 'PNJ Variant',
    aiLabelVi:
      'section góc nhìn sản phẩm PNJ: pin scrub đổi ảnh + mô tả + highlights + CTA',
    aiLabelEn:
      'PNJ product views section: pinned scrub of image chapters + copy + highlights + CTA',
  },
  pnj_header: {
    type: 'pnj_header',
    category: 'navigation',
    style: 'luxury',
    tags: ['pnj', 'header', 'logo', 'citizen'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-15',
    label: 'PNJ · Header',
    accent: '#003468',
    adminLabel: 'PNJ Header',
    gradient: 'from-white to-neutral-100',
    defaultName: 'PNJ Header',
    aiLabelVi: 'header PNJ: logo fixed top trong suốt, thu nhỏ khi scroll',
    aiLabelEn:
      'PNJ fixed-top logo header: transparent over hero, shrinks on scroll',
  },
  pnj_sticky_menu: {
    type: 'pnj_sticky_menu',
    category: 'navigation',
    style: 'luxury',
    tags: ['pnj', 'nav', 'sticky', 'citizen'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-15',
    label: 'PNJ · Sticky Menu',
    accent: '#003468',
    adminLabel: 'PNJ Sticky Menu',
    gradient: 'from-white to-neutral-200',
    defaultName: 'PNJ Sticky Menu',
    aiLabelVi:
      'thanh menu cố định đáy màn hình PNJ: anchor link tới section hoặc URL + nút CTA',
    aiLabelEn:
      'PNJ fixed bottom nav: section anchors or external URLs + CTA button',
  },
  pnj_cta: {
    type: 'pnj_cta',
    category: 'cta',
    style: 'luxury',
    tags: ['pnj', 'cta', 'form', 'contact', 'citizen'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-15',
    label: 'PNJ · CTA',
    accent: '#c79119',
    adminLabel: 'PNJ CTA',
    gradient: 'from-neutral-900 to-neutral-800',
    defaultName: 'PNJ CTA',
    aiLabelVi:
      'section CTA tối cuối trang PNJ: tiêu đề + mô tả + form email/phone/note + nút đăng ký',
    aiLabelEn:
      'PNJ closing CTA section: dark form with title, copy and email/phone/note register form',
  },
  the_grand_intro: {
    type: 'the_grand_intro',
    category: 'intro',
    style: 'luxury',
    tags: ['the-grand', 'intro', 'editorial', 'masterise'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-24',
    label: 'The Grand · Intro',
    accent: '#5a3d29',
    adminLabel: 'The Grand Intro',
    gradient: 'from-amber-900 to-stone-900',
    defaultName: 'The Grand Intro',
    aiLabelVi:
      'section giới thiệu The Grand: nền nâu gradient, tiêu đề serif + mô tả căn giữa, tượng sư tử neo đáy, entrance fade-up',
    aiLabelEn:
      'The Grand intro section: brown gradient backdrop, centered serif title + copy, bottom sculpture, fade-up entrance',
  },
  the_grand_location: {
    type: 'the_grand_location',
    category: 'location',
    style: 'luxury',
    tags: ['the-grand', 'location', 'sticky', 'scrub', 'masterise'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-24',
    label: 'The Grand · Location',
    accent: '#0f0b08',
    adminLabel: 'The Grand Location',
    gradient: 'from-stone-900 to-amber-950',
    defaultName: 'The Grand Location',
    aiLabelVi:
      'section vị trí The Grand: nền nâu đậm, aside trái ghim (tiêu đề + danh sách địa điểm bấm được), cột phải sticky trượt qua từng card 60% ảnh / 40% info khi cuộn',
    aiLabelEn:
      'The Grand location section: dark brown backdrop, pinned left aside (title + clickable place list), right sticky column scrubbing through cards (60% image / 40% info) on scroll',
  },
  the_grand_discover: {
    type: 'the_grand_discover',
    category: 'gallery',
    style: 'luxury',
    tags: ['the-grand', 'discover', 'gallery', 'sticky', 'scrub', 'masterise'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-27',
    label: 'The Grand · Discover',
    accent: '#e8d9b5',
    adminLabel: 'The Grand Discover',
    gradient: 'from-stone-800 to-stone-950',
    defaultName: 'The Grand Discover',
    aiLabelVi:
      'section thư viện ảnh The Grand: nền nâu gradient ghim 1 màn, stack ảnh scrub theo cuộn (ảnh active lùi ra sau-trái thành ghost, ảnh kế trượt vào giữa), nav khu vực bấm được góc dưới phải + caption góc dưới trái',
    aiLabelEn:
      'The Grand gallery section: brown gradient pinned to one screen, image stack scrubbing on scroll (active image recedes back-left as a ghost while the next slides in), clickable area nav bottom-right + caption bottom-left',
  },
  the_grand_service: {
    type: 'the_grand_service',
    category: 'services',
    style: 'luxury',
    tags: ['the-grand', 'service', 'sticky', 'scrub', 'masterise'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-24',
    label: 'The Grand · Service',
    accent: '#f0e8d6',
    adminLabel: 'The Grand Service',
    gradient: 'from-amber-100 to-stone-200',
    defaultName: 'The Grand Service',
    aiLabelVi:
      'section dịch vụ The Grand: dải cream tiêu đề dọc bên trái đứng yên, track card (ảnh trái + info phải) trượt ngang đè lên khi cuộn',
    aiLabelEn:
      'The Grand service section: cream vertical title strip pinned left, horizontal card track (image left + info right) scrubbing across it on scroll',
  },
  the_grand_about: {
    type: 'the_grand_about',
    category: 'intro',
    style: 'luxury',
    tags: ['the-grand', 'about', 'editorial', 'partners', 'masterise'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-27',
    label: 'The Grand · About',
    accent: '#4a3122',
    adminLabel: 'The Grand About',
    gradient: 'from-amber-950 to-stone-900',
    defaultName: 'The Grand About',
    aiLabelVi:
      'section giới thiệu The Grand: nền nâu gradient, trái ảnh skyline clip-reveal, phải cột nội dung (logo thương hiệu, tiêu đề serif, mô tả, kẻ ngang, hàng logo đối tác)',
    aiLabelEn:
      'The Grand about section: brown gradient backdrop, left skyline image with clip reveal, right content column (brand logo, serif title, copy, divider rule, partner logo row)',
  },
  the_grand_footer: {
    type: 'the_grand_footer',
    category: 'footer',
    style: 'luxury',
    tags: ['the-grand', 'footer', 'contact', 'newsletter', 'masterise'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-27',
    label: 'The Grand · Footer',
    accent: '#f2ecdf',
    adminLabel: 'The Grand Footer',
    gradient: 'from-amber-50 to-stone-200',
    defaultName: 'The Grand Footer',
    aiLabelVi:
      'chân trang The Grand: nền kem, hàng logo The Grand · Masterise ngăn bởi kẻ dọc, 4 cột (địa chỉ / email + hotline / chính sách / social + đăng ký bản tin), thanh copyright nâu đậm căn giữa',
    aiLabelEn:
      'The Grand footer: cream backdrop, The Grand · Masterise logo row split by a vertical rule, four columns (addresses / email + hotline / policies / socials + newsletter), dark centred copyright bar',
  },
  mintv2_emblem: {
    type: 'mintv2_emblem',
    category: 'intro',
    style: 'luxury',
    tags: ['mint', 'emblem', 'brand'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Emblem',
    accent: '#c79119',
    adminLabel: 'MintV2 Emblem',
    gradient: 'from-amber-300 to-yellow-600',
    defaultName: 'Emblem',
    aiLabelVi: 'coin trung tâm + tranh nền 2 bên, title lớn (drop + reveal)',
    aiLabelEn: 'centre coin emblem with flanking art + big title',
  },
  mintv2_services: {
    type: 'mintv2_services',
    category: 'services',
    style: 'modern',
    tags: ['mint', 'services'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Services',
    accent: '#c79119',
    adminLabel: 'MintV2 Services',
    gradient: 'from-yellow-500 to-amber-700',
    defaultName: 'Services',
    aiLabelVi: 'heading lớn + danh sách chọn + ảnh preview đổi theo mục',
    aiLabelEn: 'big heading + selector list + swapping preview image',
  },
  mintv2_manifesto: {
    type: 'mintv2_manifesto',
    category: 'intro',
    style: 'luxury',
    tags: ['mint', 'manifesto'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Manifesto',
    accent: '#c79119',
    adminLabel: 'MintV2 Manifesto',
    gradient: 'from-amber-500 to-yellow-700',
    defaultName: 'Manifesto',
    aiLabelVi: 'tuyên ngôn serif + 4 panel xám wipe theo scroll (2 pha)',
    aiLabelEn: 'serif manifesto with 4-panel gray wipe on scroll',
  },
  mintv2_process: {
    type: 'mintv2_process',
    category: 'progress',
    style: 'modern',
    tags: ['mint', 'process'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Process',
    accent: '#c79119',
    adminLabel: 'MintV2 Process',
    gradient: 'from-yellow-600 to-amber-800',
    defaultName: 'Process',
    aiLabelVi: 'timeline các bước zigzag + đường giữa vẽ theo scroll',
    aiLabelEn: 'zigzag step timeline with scroll-drawn centre line',
  },
  mintv2_cta: {
    type: 'mintv2_cta',
    category: 'cta',
    style: 'modern',
    tags: ['mint', 'cta'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · CTA',
    accent: '#c79119',
    adminLabel: 'MintV2 CTA',
    gradient: 'from-amber-400 to-yellow-700',
    defaultName: 'CTA',
    aiLabelVi: 'CTA cuối: headline + contact + form lead-capture',
    aiLabelEn: 'closing CTA: headline + contact + lead-capture form',
  },
  mintv2_works: {
    type: 'mintv2_works',
    category: 'portfolio',
    style: 'modern',
    tags: ['mint', 'works'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Works',
    accent: '#c79119',
    adminLabel: 'MintV2 Works',
    gradient: 'from-amber-500 to-yellow-800',
    defaultName: 'Works',
    aiLabelVi: 'gallery card hover-morph (thumb bay vào) + lightbox',
    aiLabelEn: 'hover-morph gallery cards (fly-in thumbs) + lightbox',
  },
  linea_portfolio: {
    type: 'linea_portfolio',
    category: 'portfolio',
    style: 'minimal',
    tags: ['linea', 'portfolio'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Linea · Portfolio',
    accent: '#121212',
    adminLabel: 'Linea Portfolio',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Portfolio',
    aiLabelVi: 'portfolio: heading + lưới 9 ảnh ticker 3 cột cuộn ngược chiều',
    aiLabelEn: 'portfolio heading + 9-image 3-column scrolling ticker',
  },
  mint_vault_hero: {
    type: 'mint_vault_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['mint', 'vault', 'hero'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Vault · Hero',
    accent: '#c9a96e',
    adminLabel: 'Vault Hero',
    gradient: 'from-amber-300 to-yellow-700',
    defaultName: 'Vault Hero',
    aiLabelVi: 'hero coin image-trail theo chuột + overlay tiêu đề',
    aiLabelEn: 'cursor image-trail coin hero + title overlay',
  },
  mint_vault_craft: {
    type: 'mint_vault_craft',
    category: 'feature',
    style: 'luxury',
    tags: ['mint', 'vault', 'craft'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Vault · Craft',
    accent: '#c9a96e',
    adminLabel: 'Vault Craft',
    gradient: 'from-amber-400 to-yellow-800',
    defaultName: 'Vault Craft',
    aiLabelVi: 'heading + accordion media (lý do đáng sở hữu)',
    aiLabelEn: 'heading + accordion media proof points',
  },
  mint_vault_reveal: {
    type: 'mint_vault_reveal',
    category: 'gallery',
    style: 'luxury',
    tags: ['mint', 'vault', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Vault · Reveal',
    accent: '#c9a96e',
    adminLabel: 'Vault Reveal',
    gradient: 'from-amber-300 to-yellow-700',
    defaultName: 'Vault Reveal',
    aiLabelVi: 'gallery 3D "cửa hầm" + parallax sticky theo scroll',
    aiLabelEn: '3D vault-door gallery + sticky scroll parallax',
  },
  mint_vault_collection: {
    type: 'mint_vault_collection',
    category: 'listing',
    style: 'luxury',
    tags: ['mint', 'vault', 'collection'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Vault · Collection',
    accent: '#c9a96e',
    adminLabel: 'Vault Collection',
    gradient: 'from-amber-500 to-yellow-800',
    defaultName: 'Vault Collection',
    aiLabelVi: 'cuộn ngang (pin) bộ sưu tập coin + tilt + spotlight',
    aiLabelEn: 'pinned horizontal coin collection + tilt + spotlight',
  },
  mint_vault_invitation: {
    type: 'mint_vault_invitation',
    category: 'cta',
    style: 'luxury',
    tags: ['mint', 'vault', 'invitation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Vault · Invitation',
    accent: '#c9a96e',
    adminLabel: 'Vault Invitation',
    gradient: 'from-amber-400 to-yellow-700',
    defaultName: 'Vault Invitation',
    aiLabelVi: 'CTA cuối: coin-explosion nền + spotlight + lead form',
    aiLabelEn: 'closing CTA: coin-explosion bg + spotlight + lead form',
  },
  image_carousel: {
    type: 'image_carousel',
    category: 'gallery',
    style: 'modern',
    tags: ['carousel', 'slider'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Slide',
    accent: '#2563eb',
    adminLabel: 'Carousel',
    gradient: 'from-cyan-400 to-blue-500',
    defaultName: 'Slide ảnh',
    aiLabelVi: 'slide ảnh chuyển động',
    aiLabelEn: 'image carousel / slider',
  },
  interactive_ad_widget: {
    type: 'interactive_ad_widget',
    category: 'interactive',
    style: 'friendly',
    tags: ['ad', 'widget', 'quang-cao'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Quảng cáo tương tác',
    accent: '#7c3aed',
    adminLabel: 'Interactive Ad',
    gradient: 'from-violet-500 to-fuchsia-600',
    defaultName: 'Quảng cáo tương tác',
    aiLabelVi: 'widget quảng cáo nhiều slide có hotspot và nút CTA',
    aiLabelEn: 'multi-slide ad widget with hotspots and CTA buttons',
  },
  brightedge_hero: {
    type: 'brightedge_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'brightedge'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - BrightEdge',
    accent: '#f55733',
    adminLabel: 'Hero - BrightEdge',
    gradient: 'from-orange-500 to-neutral-700',
    defaultName: 'Hero - BrightEdge',
    aiLabelVi: 'hero 2 cột: tiêu đề lớn + avatar stack + ảnh + badge tròn',
    aiLabelEn:
      'split hero: big heading + avatar stack + image + circular badge',
  },
  stories: {
    type: 'stories',
    category: 'gallery',
    style: 'friendly',
    tags: ['stories', 'slider'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Stories',
    accent: '#db2777',
    adminLabel: 'Stories',
    gradient: 'from-orange-400 to-pink-500',
    defaultName: 'Stories',
    aiLabelVi: 'panel Stories (Insta-style)',
    aiLabelEn: 'stories panels (Instagram-style)',
  },
  split_screen: {
    type: 'split_screen',
    category: 'feature',
    style: 'modern',
    tags: ['split', 'screen'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Split screen',
    accent: '#0891b2',
    adminLabel: 'Split Screen',
    gradient: 'from-slate-500 to-zinc-600',
    defaultName: 'Split screen',
    aiLabelVi: 'so sánh 2 lựa chọn (split screen)',
    aiLabelEn: 'split-screen comparison',
  },
  quiz: {
    type: 'quiz',
    category: 'interactive',
    style: 'friendly',
    tags: ['quiz', 'engagement'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Quiz',
    accent: '#9333ea',
    adminLabel: 'Quiz',
    gradient: 'from-violet-500 to-purple-600',
    defaultName: 'Quiz',
    aiLabelVi: 'trắc nghiệm gợi ý sản phẩm',
    aiLabelEn: 'quiz / product recommender',
  },
  poll: {
    type: 'poll',
    category: 'interactive',
    style: 'friendly',
    tags: ['poll', 'engagement'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Poll',
    accent: '#16a34a',
    adminLabel: 'Poll',
    gradient: 'from-indigo-500 to-blue-600',
    defaultName: 'Bình chọn',
    aiLabelVi: 'bình chọn 1 câu hỏi nhiều lựa chọn',
    aiLabelEn: 'single-question poll',
  },
  carousel_3d: {
    type: 'carousel_3d',
    category: 'gallery',
    style: 'modern',
    tags: ['3d', 'coverflow', 'carousel'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Coverflow 3D',
    accent: '#0d9488',
    adminLabel: 'Carousel 3D',
    gradient: 'from-fuchsia-500 to-pink-600',
    defaultName: 'Coverflow 3D',
    aiLabelVi: 'slide ảnh 3D coverflow',
    aiLabelEn: '3D coverflow image carousel',
  },
  flipbook: {
    type: 'flipbook',
    category: 'gallery',
    style: 'friendly',
    tags: ['flipbook', '3d'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Flipbook',
    accent: '#854d0e',
    adminLabel: 'Flipbook',
    gradient: 'from-amber-500 to-yellow-500',
    defaultName: 'Flipbook',
    aiLabelVi: 'sách catalog lật trang',
    aiLabelEn: 'page-turn flipbook catalog',
  },
  panorama: {
    type: 'panorama',
    category: 'gallery',
    style: 'modern',
    tags: ['panorama', '360', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Panorama 360°',
    accent: '#1d4ed8',
    adminLabel: 'Panorama',
    gradient: 'from-sky-500 to-cyan-600',
    defaultName: 'Panorama 360°',
    aiLabelVi: 'ảnh 360° xoay được',
    aiLabelEn: '360° equirectangular panorama',
  },
  text_displace_hero: {
    type: 'text_displace_hero',
    category: 'hero',
    style: 'modern',
    tags: ['animation', 'gsap', 'text'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Text Displace Hero',
    accent: '#0f0f0f',
    adminLabel: 'Text Displace Hero',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Text Displace Hero',
    aiLabelVi: 'hero chữ lớn "thổi" văng theo con trỏ',
    aiLabelEn: 'hero with text that scatters away from the cursor',
  },
  image_trail: {
    type: 'image_trail',
    category: 'interactive',
    style: 'modern',
    tags: ['animation', 'gsap', 'trail'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Image Trail',
    accent: '#0f0f0f',
    adminLabel: 'Image Trail',
    gradient: 'from-zinc-400 to-zinc-600',
    defaultName: 'Image Trail',
    aiLabelVi: 'vệt ảnh mọc theo con trỏ',
    aiLabelEn: 'image trail following the cursor',
  },
  sticky_scroll_cards: {
    type: 'sticky_scroll_cards',
    category: 'feature',
    style: 'modern',
    tags: ['animation', 'scroll', 'cards'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Sticky Scroll Cards',
    accent: '#0f0f0f',
    adminLabel: 'Sticky Scroll Cards',
    gradient: 'from-stone-500 to-stone-700',
    defaultName: 'Sticky Scroll Cards',
    aiLabelVi: 'card ảnh chồng lên nhau khi cuộn',
    aiLabelEn: 'cards that stack on scroll',
  },
  gallery_3d_depth: {
    type: 'gallery_3d_depth',
    category: 'gallery',
    style: 'modern',
    tags: ['3d', 'gallery', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Gallery 3D Depth',
    accent: '#0f0f0f',
    adminLabel: 'Gallery 3D Depth',
    gradient: 'from-indigo-500 to-purple-700',
    defaultName: 'Gallery 3D Depth',
    aiLabelVi: 'khối ảnh bay từ chiều sâu 3D',
    aiLabelEn: '3D image blocks flying from depth',
  },
  parallax_hero: {
    type: 'parallax_hero',
    category: 'hero',
    style: 'modern',
    tags: ['parallax', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Parallax Hero',
    accent: '#0f0f0f',
    adminLabel: 'Parallax Hero',
    gradient: 'from-amber-400 to-orange-600',
    defaultName: 'Parallax Hero',
    aiLabelVi: 'hero sticker trôi theo con trỏ + marquee',
    aiLabelEn: 'hero with parallax stickers + marquee',
  },
  lightbox_flip: {
    type: 'lightbox_flip',
    category: 'gallery',
    style: 'modern',
    tags: ['lightbox', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Lightbox Flip',
    accent: '#0f0f0f',
    adminLabel: 'Lightbox Flip',
    gradient: 'from-zinc-500 to-zinc-700',
    defaultName: 'Lightbox Flip',
    aiLabelVi: 'lưới ảnh click phóng to bay ra',
    aiLabelEn: 'image grid with flip lightbox',
  },
  flip_gallery: {
    type: 'flip_gallery',
    category: 'gallery',
    style: 'modern',
    tags: ['gallery', 'flip', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Flip Gallery',
    accent: '#0f0f0f',
    adminLabel: 'Flip Gallery',
    gradient: 'from-rose-400 to-pink-600',
    defaultName: 'Flip Gallery',
    aiLabelVi: 'gallery đổi layout chồng ↔ dàn hàng',
    aiLabelEn: 'gallery toggling stacked ↔ spread layout',
  },
  wheel_gallery: {
    type: 'wheel_gallery',
    category: 'gallery',
    style: 'modern',
    tags: ['gallery', 'wheel', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Wheel Gallery',
    accent: '#0f0f0f',
    adminLabel: 'Wheel Gallery',
    gradient: 'from-cyan-400 to-blue-600',
    defaultName: 'Wheel Gallery',
    aiLabelVi: 'bánh xe ảnh quay theo cuộn',
    aiLabelEn: 'image wheel rotating on scroll',
  },
  hover_reveal_list: {
    type: 'hover_reveal_list',
    category: 'interactive',
    style: 'minimal',
    tags: ['hover', 'list', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hover Reveal List',
    accent: '#0f0f0f',
    adminLabel: 'Hover Reveal List',
    gradient: 'from-orange-400 to-red-600',
    defaultName: 'Hover Reveal List',
    aiLabelVi: 'danh sách tên, hover hiện ảnh bám chuột',
    aiLabelEn: 'name list revealing image on hover',
  },
  hover_equalizer_heading: {
    type: 'hover_equalizer_heading',
    category: 'interactive',
    style: 'modern',
    tags: ['hover', 'heading', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hover Equalizer Heading',
    accent: '#0f0f0f',
    adminLabel: 'Hover Equalizer Heading',
    gradient: 'from-lime-400 to-emerald-600',
    defaultName: 'Hover Equalizer Heading',
    aiLabelVi: 'tiêu đề chữ giãn như equalizer khi hover',
    aiLabelEn: 'heading text stretching like an equalizer on hover',
  },
  brutalist_text: {
    type: 'brutalist_text',
    category: 'interactive',
    style: 'modern',
    tags: ['typography', 'brutalist', 'heading', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Brutalist Text',
    accent: '#000000',
    adminLabel: 'Brutalist Text',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Brutalist Text',
    aiLabelVi:
      'tiêu đề brutalist uppercase đậm, trail echo opacity xếp chồng trên nền đen',
    aiLabelEn:
      'bold uppercase brutalist heading with stacked opacity echo trail on black',
  },
  image_explosion: {
    type: 'image_explosion',
    category: 'gallery',
    style: 'modern',
    tags: ['animation', 'explosion'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Image Explosion',
    accent: '#0f0f0f',
    adminLabel: 'Image Explosion',
    gradient: 'from-fuchsia-500 to-rose-600',
    defaultName: 'Image Explosion',
    aiLabelVi: 'ảnh nổ tung bay lên rồi rơi khi cuộn tới',
    aiLabelEn: 'images exploding upward then falling on scroll',
  },
  marquee_band: {
    type: 'marquee_band',
    category: 'marquee',
    style: 'modern',
    tags: ['marquee', 'band'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Marquee Band',
    accent: '#0f0f0f',
    adminLabel: 'Marquee Band',
    gradient: 'from-neutral-500 to-neutral-700',
    defaultName: 'Marquee Band',
    aiLabelVi: 'dải chữ lớn chạy ngang vô tận',
    aiLabelEn: 'large text marquee scrolling horizontally',
  },
  story_slides: {
    type: 'story_slides',
    category: 'gallery',
    style: 'friendly',
    tags: ['slides', 'story'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Story Slides',
    accent: '#0f0f0f',
    adminLabel: 'Story Slides',
    gradient: 'from-rose-500 to-orange-500',
    defaultName: 'Story Slides',
    aiLabelVi: 'slide tự chạy kiểu story có thanh tiến trình',
    aiLabelEn: 'auto-advancing story slides with progress bars',
  },
  accordion_media: {
    type: 'accordion_media',
    category: 'feature',
    style: 'modern',
    tags: ['accordion', 'media'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Accordion Media',
    accent: '#0f0f0f',
    adminLabel: 'Accordion Media',
    gradient: 'from-teal-500 to-emerald-600',
    defaultName: 'Accordion Media',
    aiLabelVi: 'accordion ảnh ngang, panel active nở rộng',
    aiLabelEn: 'horizontal image accordion, active panel expands',
  },
  spotlight: {
    type: 'spotlight',
    category: 'feature',
    style: 'modern',
    tags: ['spotlight', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Spotlight',
    accent: '#0f0f0f',
    adminLabel: 'Spotlight',
    gradient: 'from-yellow-400 to-amber-600',
    defaultName: 'Spotlight',
    aiLabelVi: 'đèn rọi bám chuột làm sáng chữ trên nền tối',
    aiLabelEn: 'cursor-following spotlight revealing text on dark',
  },
  process_steps: {
    type: 'process_steps',
    category: 'progress',
    style: 'modern',
    tags: ['process', 'steps'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Process Steps',
    accent: '#0f0f0f',
    adminLabel: 'Process Steps',
    gradient: 'from-indigo-500 to-blue-600',
    defaultName: 'Process Steps',
    aiLabelVi: 'quy trình đánh số hiện lần lượt khi cuộn',
    aiLabelEn: 'numbered process steps revealing on scroll',
  },
  dot_matrix: {
    type: 'dot_matrix',
    category: 'interactive',
    style: 'modern',
    tags: ['canvas', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Dot Matrix',
    accent: '#0f0f0f',
    adminLabel: 'Dot Matrix',
    gradient: 'from-cyan-500 to-blue-600',
    defaultName: 'Dot Matrix',
    aiLabelVi: 'canvas lưới chấm phình sáng theo con trỏ',
    aiLabelEn: 'canvas dot grid reacting to cursor',
  },
  interactive_grid: {
    type: 'interactive_grid',
    category: 'interactive',
    style: 'modern',
    tags: ['grid', 'hover'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Interactive Grid',
    accent: '#0f0f0f',
    adminLabel: 'Interactive Grid',
    gradient: 'from-lime-500 to-emerald-600',
    defaultName: 'Interactive Grid',
    aiLabelVi: 'lưới ảnh hover phóng to + làm mờ ô khác',
    aiLabelEn: 'image grid where hover enlarges a tile, dims others',
  },
  pixel_reveal: {
    type: 'pixel_reveal',
    category: 'gallery',
    style: 'modern',
    tags: ['animation', 'reveal'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Pixel Reveal',
    accent: '#0f0f0f',
    adminLabel: 'Pixel Reveal',
    gradient: 'from-purple-500 to-violet-600',
    defaultName: 'Pixel Reveal',
    aiLabelVi: 'ảnh hiện dần qua hiệu ứng pixel khi cuộn',
    aiLabelEn: 'image resolving from pixelation on scroll',
  },
  letter_slider: {
    type: 'letter_slider',
    category: 'interactive',
    style: 'modern',
    tags: ['text', 'slider', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Letter Slider',
    accent: '#0f0f0f',
    adminLabel: 'Letter Slider',
    gradient: 'from-violet-500 to-fuchsia-600',
    defaultName: 'Letter Slider',
    aiLabelVi: 'slider sản phẩm, chữ mở từng ký tự',
    aiLabelEn: 'product slider revealing letters one by one',
  },
  seamless_scroll_gallery: {
    type: 'seamless_scroll_gallery',
    category: 'gallery',
    style: 'modern',
    tags: ['gallery', 'scroll', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Seamless Scroll Gallery',
    accent: '#0f0f0f',
    adminLabel: 'Seamless Scroll Gallery',
    gradient: 'from-sky-500 to-indigo-600',
    defaultName: 'Seamless Scroll Gallery',
    aiLabelVi: 'dải ảnh cuộn ngang vô tận liền mạch',
    aiLabelEn: 'seamless infinite horizontal image strip',
  },
  product_spec_sheet: {
    type: 'product_spec_sheet',
    category: 'pricing',
    style: 'minimal',
    tags: ['product', 'spec'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Product Spec Sheet',
    accent: '#0f0f0f',
    adminLabel: 'Product Spec Sheet',
    gradient: 'from-stone-500 to-neutral-700',
    defaultName: 'Product Spec Sheet',
    aiLabelVi: 'trang sản phẩm + bảng thông số trượt lên',
    aiLabelEn: 'product page with a sliding spec sheet',
  },
  framer_yume_hero: {
    type: 'framer_yume_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'yume'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Yume',
    accent: '#000000',
    adminLabel: 'Hero - Yume',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Hero - Yume',
    aiLabelVi: 'block hero tối giản (tên lớn + avatar)',
    aiLabelEn: 'minimal hero block (big name + avatar)',
  },
  framer_yuya_hero: {
    type: 'framer_yuya_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'yuya'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Yuya',
    accent: '#000000',
    adminLabel: 'Hero - Yuya',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Hero - Yuya',
    aiLabelVi: 'block hero tối giản hai tầng (tên lớn + avatar)',
    aiLabelEn: 'minimal two-tier hero block (big name + avatar)',
  },
  framer_arpeggio_hero_v2: {
    type: 'framer_arpeggio_hero_v2',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'arpeggio'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Arpeggio v2',
    accent: '#FF4D2E',
    adminLabel: 'Hero - Arpeggio v2',
    gradient: 'from-orange-500 to-red-600',
    defaultName: 'Hero - Arpeggio v2',
    aiLabelVi: 'block hero Arpeggio v2 (ảnh nền + wordmark lớn)',
    aiLabelEn: 'Arpeggio v2 hero with large wordmark',
  },
  framer_perform_hero: {
    type: 'framer_perform_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'perform'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Perform',
    accent: '#ffffff',
    adminLabel: 'Hero - Perform',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Hero - Perform v1',
    aiLabelVi: 'block hero tối Manrope + overlay gradient + CTA pill',
    aiLabelEn:
      'dark hero with Manrope typography + gradient overlay + pill CTA',
  },
  framer_bungee_hero_v2: {
    type: 'framer_bungee_hero_v2',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'bungee'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Bungee v2',
    accent: 'rgb(30,30,30)',
    adminLabel: 'Hero - Bungee v2',
    gradient: 'from-gray-100 to-white',
    defaultName: 'Hero - Bungee v2',
    aiLabelVi:
      'block hero studio Bungee v2 (recon spec): wordmark + marquee ảnh + GSAP R1–R6',
    aiLabelEn:
      'Bungee studio hero v2 (recon spec): wordmark + image marquee + GSAP R1–R6',
  },
  framer_purevisuals_hero: {
    type: 'framer_purevisuals_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'purevisuals'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - PureVisuals',
    accent: '#0a0a0a',
    adminLabel: 'Hero - PureVisuals',
    gradient: 'from-neutral-900 to-neutral-700',
    defaultName: 'Hero - PureVisuals',
    aiLabelVi:
      'block hero PureVisuals (recon spec): 2 flash panel 50/50 đập vào giữa rồi scroll tách ra để lộ heading',
    aiLabelEn:
      'PureVisuals hero (recon spec): two 50/50 flash panels that converge on load and split on scroll to reveal heading',
  },
  framer_intro_redefined: {
    type: 'framer_intro_redefined',
    category: 'intro',
    style: 'modern',
    tags: ['clone', 'framer', 'intro'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Intro Redefined',
    accent: '#111111',
    adminLabel: 'Intro Redefined',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Intro Redefined',
    aiLabelVi: 'block intro nền trắng, tiêu đề serif italic lớn',
    aiLabelEn: 'white-background intro with large italic serif title',
  },
  framer_explore_cta: {
    type: 'framer_explore_cta',
    category: 'cta',
    style: 'modern',
    tags: ['clone', 'framer'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Explore CTA',
    accent: '#1A1A1A',
    adminLabel: 'Explore CTA',
    gradient: 'from-stone-200 to-stone-400',
    defaultName: 'Explore CTA',
    aiLabelVi: 'block CTA căn giữa + link underline dạng [ LABEL ]',
    aiLabelEn: 'centered CTA section with bracketed underline link',
  },
  framer_flat_white_process: {
    type: 'framer_flat_white_process',
    category: 'progress',
    style: 'minimal',
    tags: ['clone', 'framer', 'process'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Flat White - Our Process',
    accent: '#747E90',
    adminLabel: 'Flat White - Our Process',
    gradient: 'from-slate-500 to-slate-700',
    defaultName: 'Flat White - Our Process',
    aiLabelVi:
      'block Flat White "Our Process" (recon spec): nền xám, pill label, headline lớn, 3 step card dọc, body màu #D6D9E2, có SVG divider cong động',
    aiLabelEn:
      'Flat White "Our Process" (recon spec): gray background, pill label, large headline, 3 vertical step cards, body text #D6D9E2, animated curved SVG divider',
  },
  framer_studio_manifesto: {
    type: 'framer_studio_manifesto',
    category: 'intro',
    style: 'minimal',
    tags: ['clone', 'framer', 'manifesto'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Studio Manifesto',
    accent: '#1A1A1A',
    adminLabel: 'Studio Manifesto',
    gradient: 'from-stone-200 to-stone-400',
    defaultName: 'Studio Manifesto',
    aiLabelVi: 'block nội dung dạng tuyên ngôn + chữ ký',
    aiLabelEn: 'manifesto-style content block with signature',
  },
  framer_stats_grid: {
    type: 'framer_stats_grid',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'framer', 'stats'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Stats Grid',
    accent: '#111111',
    adminLabel: 'Stats Grid',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Stats Grid',
    aiLabelVi: 'lưới số liệu thống kê trên ảnh nền tối',
    aiLabelEn: 'stats grid with dark background image',
  },
  framer_projects_grid: {
    type: 'framer_projects_grid',
    category: 'portfolio',
    style: 'modern',
    tags: ['clone', 'framer', 'projects'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Projects Grid',
    accent: '#1a1a18',
    adminLabel: 'Projects Grid',
    gradient: 'from-stone-300 to-stone-500',
    defaultName: 'Projects Grid',
    aiLabelVi: 'lưới dự án 3 cột + hover zoom',
    aiLabelEn: '3-column project grid with hover zoom',
  },
  framer_team_directory: {
    type: 'framer_team_directory',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'framer', 'team'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Team Directory',
    accent: '#1a1a18',
    adminLabel: 'Team Directory',
    gradient: 'from-stone-300 to-neutral-400',
    defaultName: 'Team Directory',
    aiLabelVi: 'danh sách thành viên nhóm theo hàng',
    aiLabelEn: 'row-based team member directory',
  },
  framer_image_stagger: {
    type: 'framer_image_stagger',
    category: 'gallery',
    style: 'modern',
    tags: ['clone', 'framer', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Image Stagger',
    accent: '#1a1a18',
    adminLabel: 'Image Stagger',
    gradient: 'from-stone-300 to-stone-500',
    defaultName: 'Image Stagger',
    aiLabelVi: 'lưới ảnh bất đối xứng 12 cột',
    aiLabelEn: 'asymmetric 12-column image stagger grid',
  },
  housent_our_excellence: {
    type: 'housent_our_excellence',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Housent Excellence',
    accent: '#ff810a',
    adminLabel: 'Our Excellence (Housent)',
    gradient: 'from-stone-100 to-stone-200',
    defaultName: 'Our Excellence',
    aiLabelVi:
      'block Our Excellence: badge + heading + body giữa, 8 satellite icon-item xếp vòng tròn (desktop) hoặc stack dọc (mobile)',
    aiLabelEn:
      'Our Excellence block: center badge+heading+body with 8 satellite icon items on a radial circle (desktop) or stacked list (mobile)',
  },
  framer_faq_minimal: {
    type: 'framer_faq_minimal',
    category: 'faq',
    style: 'minimal',
    tags: ['clone', 'framer', 'faq'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'FAQ Minimal',
    accent: '#111111',
    adminLabel: 'FAQ Minimal',
    gradient: 'from-gray-100 to-gray-300',
    defaultName: 'FAQ Minimal',
    aiLabelVi: 'FAQ nền trắng 2 cột, accordion câu hỏi',
    aiLabelEn: 'minimal white FAQ with two-column accordion',
  },
  framer_darling_timeline: {
    type: 'framer_darling_timeline',
    category: 'progress',
    style: 'modern',
    tags: ['clone', 'framer', 'timeline'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Timeline',
    accent: '#1f1d14',
    adminLabel: 'Darling Timeline',
    gradient: 'from-amber-100 to-amber-300',
    defaultName: 'Timeline',
    aiLabelVi: 'timeline nền kem, cột sống dọc, item xen kẽ trái/phải',
    aiLabelEn: 'cream timeline with vertical spine and alternating items',
  },
  framer_nftpull_timeline: {
    type: 'framer_nftpull_timeline',
    category: 'progress',
    style: 'modern',
    tags: ['clone', 'framer', 'timeline'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Why-Go Timeline',
    accent: '#0e0e0e',
    adminLabel: 'NFTpull Why-Go Timeline',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Why-Go Timeline',
    aiLabelVi:
      'timeline nền tối, cột sống dọc gradient, card dark surface xen kẽ trái/phải, badge số trên spine',
    aiLabelEn:
      'dark timeline with vertical gradient spine and alternating dark cards, numbered badges on the spine',
  },
  framer_signature_feature: {
    type: 'framer_signature_feature',
    category: 'feature',
    style: 'modern',
    tags: ['clone', 'framer'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Signature Feature',
    accent: '#00940c',
    adminLabel: 'Signature Feature',
    gradient: 'from-stone-200 to-stone-400',
    defaultName: 'Signature Feature',
    aiLabelVi:
      'feature căn giữa nền xám nhạt, eyebrow + tiêu đề xanh lá, bullet list',
    aiLabelEn: 'centered light-gray feature with green title and bullet list',
  },
  framer_vs_collins_projects: {
    type: 'framer_vs_collins_projects',
    category: 'portfolio',
    style: 'modern',
    tags: ['clone', 'framer', 'projects'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Projects Grid',
    accent: '#111111',
    adminLabel: 'VS Collins Projects',
    gradient: 'from-gray-100 to-gray-300',
    defaultName: 'Projects',
    aiLabelVi: 'lưới 12 cột dự án phân tán, hover overlay',
    aiLabelEn: '12-column scattered project grid with hover overlay',
  },
  framer_clarity_services: {
    type: 'framer_clarity_services',
    category: 'services',
    style: 'modern',
    tags: ['clone', 'framer', 'services'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Clarity Services',
    accent: '#1c2706',
    adminLabel: 'Services 3-col (Clarity)',
    gradient: 'from-lime-600 to-green-700',
    defaultName: 'Dịch vụ',
    aiLabelVi:
      'lưới 3 cột: 2 card dịch vụ trái, ảnh portrait giữa, 2 card phải',
    aiLabelEn:
      '3-col grid: 2 service cards left, portrait image center, 2 cards right',
  },
  framer_ignitex_step: {
    type: 'framer_ignitex_step',
    category: 'progress',
    style: 'modern',
    tags: ['clone', 'framer', 'ignitex'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'IgniteX - Step Section',
    accent: '#05080c',
    adminLabel: 'IgniteX - Step Section',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Step Section',
    aiLabelVi:
      'block IgniteX "Step Section" (recon spec): nền trắng, pill "From concept to launch", 3-cột (trái "Your ideas into Brand" + giữa 3 step card + phải "transform stories"), Geist 60/500 cho heading + Great Vibes 62/400 cho "Brand", card Geist 28/500 title + Geist 18/500 body #5b5b5b',
    aiLabelEn:
      'IgniteX "Step Section" (recon spec): white background, "From concept to launch" pill, 3-column (left "Your ideas into Brand" + center 3 step cards + right "transform stories"), Geist 60/500 heading + Great Vibes 62/400 for "Brand", card Geist 28/500 title + Geist 18/500 body #5b5b5b',
  },
  framer_realestate02_story: {
    type: 'framer_realestate02_story',
    category: 'gallery',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'carousel'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'RealEstate02 - Story Carousel',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Story Carousel',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Story Carousel',
    aiLabelVi:
      'block "story carousel" 3 slide (AESTHETICS/DIVERSITY/SECURITY): card cố định 375×781, ảnh nền full-bleed, tiêu đề lớn 52px màu #c49f8a chồng lên ảnh, panel caption vuông #c49f8a góc dưới-phải chứa nhãn + mô tả + 2 nút điều hướng + bộ đếm N/3',
    aiLabelEn:
      '3-slide "story carousel" block (AESTHETICS/DIVERSITY/SECURITY): fixed 375×781 card, full-bleed background image, large 52px #c49f8a title overlapping the image, bottom-right #c49f8a square caption panel with label + description + prev/next buttons + N/3 counter',
  },
  framer_realestate02_quote: {
    type: 'framer_realestate02_quote',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'quote', 'testimonial'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'RealEstate02 - Architect Quote',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Architect Quote',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Architect Quote',
    aiLabelVi:
      'block "quote kiến trúc sư" testimonial: card cố định 375×567 nền #2c2926, header tên + chức danh màu #c49f8a/#66634d, trích dẫn 3 dòng màu #c49f8a, ảnh building crop 234×282 và ảnh headshot 94×129 chồng lên góc dưới-trái',
    aiLabelEn:
      '"architect quote" testimonial block: fixed 375×567 card on #2c2926 background, name + role header in #c49f8a/#66634d, 3-line quote in #c49f8a, cropped 234×282 building photo with a 94×129 headshot overlapping its bottom-left corner',
  },
  framer_realestate02_product: {
    type: 'framer_realestate02_product',
    category: 'amenity',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'editorial'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'RealEstate02 - Landscape Editorial',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Landscape Editorial',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Landscape Editorial',
    aiLabelVi:
      'block editorial "landscape" card cố định 375×443 nền #c49f8a: ảnh mask-reveal 281×187 sát góc trên-phải (trượt lên 112px khi vào viewport), đoạn mô tả uppercase #2c2926 11px bên dưới cách 32px, gutter trái 94px để trống',
    aiLabelEn:
      'fixed 375×443 "landscape" editorial card on #c49f8a background: 281×187 mask-reveal photo flush to the top-right (slides up 112px on scroll-into-view), uppercase #2c2926 11px description below with a 32px gap, 94px empty left gutter',
  },
  framer_realestate02_overview: {
    type: 'framer_realestate02_overview',
    category: 'amenity',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'overview', 'panorama'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'RealEstate02 - Overview Panorama',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Overview Panorama',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Overview Panorama',
    aiLabelVi:
      'block "overview panorama" card cố định 375×948 nền olive #565440: 2 ảnh top (tháp + người, parallax ngược chiều), heading lớn "Over/View" 64.6px màu #c49f8a, mô tả nhỏ 11px uppercase màu #e9e4dc, heading phụ 3 dòng xếp lệch cố ý tràn 2 mép card, ảnh panorama full-bleed cuối block',
    aiLabelEn:
      '"overview panorama" block: fixed 375×948 card on #565440 olive background — 2 top photos (tower + person, opposite-direction parallax), large 64.6px #c49f8a "Over/View" heading, small 11px uppercase #e9e4dc description, 3-line staggered subheading intentionally bleeding past both card edges, full-bleed panorama photo at the bottom',
  },
  framer_realestate02_location: {
    type: 'framer_realestate02_location',
    category: 'location',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'location', 'parallax', 'collage'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'RealEstate02 - Location Collage',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Location Collage',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Location Collage',
    aiLabelVi:
      'block "location collage" card cố định 375×585 nền #e9e4dc: 3 ảnh position-absolute tràn mép trái/phải cố ý (không mask/crop), mỗi ảnh trôi liên tục theo scrollY tuyệt đối (không phải theo % tiến trình cuộn riêng block) — ảnh dưới-trái hệ số -0.1, 2 ảnh phải hệ số +0.1; heading "LOCATION" Inter 300 72px màu #565440 tràn mép trái, trượt ngang 1 lần mỗi khi cuộn vào viewport',
    aiLabelEn:
      '"location collage" block: fixed 375×585 card on #e9e4dc background — 3 position-absolute photos deliberately bleeding past the left/right edges (no mask/crop), each drifting continuously with raw absolute scrollY (not the block\'s own scroll-progress) — lower-left photo factor -0.1, the other two +0.1; "LOCATION" heading in Inter 300 72px #565440 bleeding off the left edge, sliding in horizontally each time it re-enters the viewport',
  },
  framer_realestate02_commute: {
    type: 'framer_realestate02_commute',
    category: 'location',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'location', 'stats', 'counter'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'RealEstate02 - Commute Stats',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Commute Stats',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Commute Stats',
    aiLabelVi:
      'block "commute stats" card cố định 375×1038 nền #e9e4dc: vòng tròn tiến trình + số đếm lớn 80px chạy 0→N phút đi bộ (đếm lại mỗi lần cuộn vào viewport), heading mô tả điểm đến, section "BY CAR" màu #c49f8a với ảnh xe top-down + list 3 dòng số phút/tên địa điểm có đường kẻ chia, mọi chữ hiện theo từng ký tự khi cuộn tới',
    aiLabelEn:
      '"commute stats" block: fixed 375×1038 card on #e9e4dc background — radial progress ring + large 80px count-up (0→N walk minutes, replays every time it re-enters the viewport), destination heading, #c49f8a "BY CAR" section with a top-down car photo + a 3-row minutes/destination list with divider lines, every text label revealing character-by-character on scroll',
  },
  framer_realestate02_map: {
    type: 'framer_realestate02_map',
    category: 'location',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'location', 'map'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'RealEstate02 - Location Map',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Location Map',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Location Map',
    aiLabelVi:
      'block "location map" card cố định 375×359 nền #e9e4dc: 1 ảnh minh hoạ bản đồ tĩnh full-bleed (đường + công viên + 4 pin phụ vẽ sẵn trong ảnh) cùng 1 marker "R" lớn overlay màu #565440 bập bênh liên tục lên xuống ~5px (không phải hiệu ứng xuất hiện 1 lần)',
    aiLabelEn:
      '"location map" block: fixed 375×359 card on #e9e4dc background — one full-bleed static map illustration (roads + parks + 4 secondary pins baked into the image) with one large overlay "R" marker in #565440 continuously bobbing ~5px up and down (not a one-time entrance effect)',
  },
  framer_realestate02_gallery: {
    type: 'framer_realestate02_gallery',
    category: 'gallery',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'gallery', 'carousel'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'RealEstate02 - Infrastructure Gallery',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Infrastructure Gallery',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Infrastructure Gallery',
    aiLabelVi:
      'block "gallery tiện ích" card cố định 375×704, nền trong suốt: tiêu đề lớn 2 dòng "INFRAS/TRUCTURE" màu #c49f8a, slider 4 ảnh tiện ích 307×307 (gap 12px, hé lộ ảnh kế tiếp), 2 nút tròn 35×35 viền #c49f8a điều hướng trước/sau, bộ đếm "N/4" màu #e9e4dc',
    aiLabelEn:
      '"infrastructure gallery" block: fixed 375×704 card, transparent background — large 2-line "INFRAS/TRUCTURE" heading in #c49f8a, 4-image amenity slider (307×307, 12px gap, peeking next image), two 35×35 circular #c49f8a-bordered prev/next buttons, "N/4" counter in #e9e4dc',
  },
  framer_realestate02_menu: {
    type: 'framer_realestate02_menu',
    category: 'navigation',
    style: 'modern',
    tags: ['clone', 'framer', 'real-estate', 'navigation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-22',
    label: 'RealEstate02 - Menu',
    accent: '#c49f8a',
    adminLabel: 'RealEstate02 - Menu',
    gradient: 'from-amber-100 to-orange-200',
    defaultName: 'Menu',
    aiLabelVi:
      'block "menu" navigation bar dạng pill: flex row chứa label dropdown (chữ Inter 11px uppercase #565440 trên nền tròn #e9e4dc viền #c49f8a border-radius 20px) bên trái + icon hamburger 3 gạch trong circle #e9e4dc viền #c49f8a bên phải; chữ hiện từng ký tự stagger 75ms khi vào viewport',
    aiLabelEn:
      '"menu" navigation pill block: flex row with a label pill (Inter 11px uppercase #565440 on #e9e4dc circle with #c49f8a border-radius 20px) on the left + a 3-line hamburger icon inside an #e9e4dc circle with #c49f8a border on the right; text reveals character-by-character with 75ms stagger on scroll-into-view',
  },
  framer_aestha_editorial: {
    type: 'framer_aestha_editorial',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'editorial'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Aestha Editorial',
    accent: '#1A1A1A',
    adminLabel: 'Editorial (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Editorial',
    aiLabelVi:
      'trang editorial: cột brand sticky trái + stack 3 ảnh so le phải',
    aiLabelEn:
      'editorial layout: sticky brand column left + staggered image stack right',
  },
  aestha_explore: {
    type: 'aestha_explore',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'index'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Explore',
    accent: '#0F0F0F',
    adminLabel: 'Explore index (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Explore',
    aiLabelVi:
      'trang index EXPLORE: menu dự án hover đổi ảnh featured (desktop) / vuốt carousel (mobile)',
    aiLabelEn:
      'EXPLORE index page: project menu hover-swaps featured image (desktop) / swipe carousel (mobile)',
  },
  aestha_studio: {
    type: 'aestha_studio',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'about'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Studio',
    accent: '#0F0F0F',
    adminLabel: 'Studio / About (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Studio',
    aiLabelVi:
      'trang STUDIO / About: wordmark + bio + danh sách team + ảnh portrait + footer nav',
    aiLabelEn:
      'STUDIO / About page: wordmark + bio + team list + portrait image + footer nav',
  },
  aestha_contact: {
    type: 'aestha_contact',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'contact'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Contact',
    accent: '#0F0F0F',
    adminLabel: 'Contact (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Contact',
    aiLabelVi:
      'trang CONTACT: heading + địa chỉ + email/phone + social + ảnh hero + footer nav',
    aiLabelEn:
      'CONTACT page: heading + address + email/phone + socials + hero image + footer nav',
  },
  aestha_project: {
    type: 'aestha_project',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'project'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Project',
    accent: '#0F0F0F',
    adminLabel: 'Project detail (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Project',
    aiLabelVi:
      'trang chi tiết dự án: cột trái sticky (tiêu đề + mô tả) · cột phải stack ảnh cuộn, cuối trang đổi sang "dự án tiếp theo"',
    aiLabelEn:
      'project detail page: sticky left column (title + concept) · scrolling right image stack, swaps to "next project" at the end',
  },
  masterise_home_inside: {
    type: 'masterise_home_inside',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'masterise', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Masterise Home Inside',
    accent: '#c64a26',
    adminLabel: 'Masterise — Hệ tiện ích trong nhà',
    gradient: 'from-orange-100 to-orange-200',
    defaultName: 'Hệ tiện ích trong nhà',
    aiLabelVi:
      'section Masterise, heading 2 dòng cam #c64a26 ("Hệ tiện ích / trong nhà") + body mô tả + Swiper carousel 5 slide ảnh (slidesPerView 1/1.2/2) + 2 nút prev/next tròn viền cam',
    aiLabelEn:
      'Masterise section, 2-line orange #c64a26 heading ("Indoor amenities") + body description + Swiper 5-slide image carousel (1/1.2/2 slides per view) + 2 round prev/next buttons with orange border',
  },
  framer_perform_about: {
    type: 'framer_perform_about',
    category: 'intro',
    style: 'modern',
    tags: ['clone', 'framer', 'about'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Perform About',
    accent: '#ffffff',
    adminLabel: 'Testimonials (Perform)',
    gradient: 'from-neutral-800 to-black',
    defaultName: 'Về chúng tôi',
    aiLabelVi: 'stack testimonial nền đen: text trái + ảnh phải mỗi hàng',
    aiLabelEn: 'dark testimonial stack: text left + image right per row',
  },
  framer_perform_pricing: {
    type: 'framer_perform_pricing',
    category: 'pricing',
    style: 'modern',
    tags: ['clone', 'framer', 'pricing'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Perform Pricing',
    accent: '#0c0c0c',
    adminLabel: 'Pricing Cards (Perform)',
    gradient: 'from-neutral-200 to-white',
    defaultName: 'Bảng giá',
    aiLabelVi: 'stack pricing card: ảnh trái + giá/tính năng/CTA phải mỗi card',
    aiLabelEn:
      'stacked pricing cards: image left + price/features/CTA right per card',
  },
  delvaux_header: {
    type: 'delvaux_header',
    category: 'header',
    style: 'luxury',
    tags: ['clone', 'delvaux'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Header - Logo',
    accent: '#000000',
    adminLabel: 'Header - Logo',
    gradient: 'from-white to-neutral-100',
    defaultName: 'Header - Logo',
    aiLabelVi: 'thanh header tối giản chỉ có logo căn giữa',
    aiLabelEn: 'minimal centered logo header bar',
  },
  delvaux_subnav: {
    type: 'delvaux_subnav',
    category: 'header',
    style: 'luxury',
    tags: ['clone', 'delvaux', 'subnav'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Sub-nav - Floating Pill',
    accent: '#111111',
    adminLabel: 'Sub-nav - Floating Pill',
    gradient: 'from-white to-neutral-200',
    defaultName: 'Sub-nav - Floating Pill',
    aiLabelVi:
      'thanh điều hướng pill trắng nổi dán đáy màn hình: anchor link tới section + nút mua hàng',
    aiLabelEn:
      'floating white pill sub-nav pinned to viewport bottom: section anchors + buy button',
  },
  delvaux_hero: {
    type: 'delvaux_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', 'delvaux', 'video', 'scroll'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Scroll Video',
    accent: '#0a0a0a',
    adminLabel: 'Hero - Scroll Video',
    gradient: 'from-neutral-900 to-neutral-700',
    defaultName: 'Hero - Scroll Video',
    aiLabelVi:
      'hero cinematic: video dán sticky tua theo scroll + heading overlay, phong cách cao cấp',
    aiLabelEn:
      'cinematic hero: sticky scroll-scrubbed video + overlay heading, luxury tone',
  },
  delvaux_details: {
    type: 'delvaux_details',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'delvaux', 'editorial'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Story - Editorial',
    accent: '#000000',
    adminLabel: 'Story - Editorial',
    gradient: 'from-neutral-100 to-white',
    defaultName: 'Story - Editorial',
    aiLabelVi:
      'block kể chuyện sản phẩm căn giữa: tiêu đề mask-reveal + 2 đoạn mô tả, phong cách editorial cao cấp',
    aiLabelEn:
      'centered editorial product-story block: masked title reveal + 2 paragraphs, luxury tone',
  },
  delvaux_product: {
    type: 'delvaux_product',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'delvaux', 'product'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Product - Feature Cards',
    accent: '#111111',
    adminLabel: 'Product - Feature Cards',
    gradient: 'from-neutral-200 to-white',
    defaultName: 'Product - Feature Cards',
    aiLabelVi:
      'hàng thẻ đặc điểm sản phẩm: mỗi thẻ tiêu đề + ảnh/video, entrance zoom-in theo scroll',
    aiLabelEn:
      'row of product feature cards: title + image/video each, scroll zoom-in entrance',
  },
  delvaux_variant: {
    type: 'delvaux_variant',
    category: 'pricing',
    style: 'luxury',
    tags: ['clone', 'delvaux', 'variant'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Product - Variant',
    accent: '#764733',
    adminLabel: 'Product - Variant',
    gradient: 'from-amber-100 to-white',
    defaultName: 'Product - Variant',
    aiLabelVi:
      'chọn biến thể màu: swatch đổi ảnh sản phẩm + accordion FAQ, phong cách cao cấp',
    aiLabelEn:
      'color-variant selector: swatches swap product image + FAQ accordion, luxury tone',
  },
  q80_experience: {
    type: 'q80_experience',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', 'q80', '3d', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Experience - 3D Journey',
    accent: '#7c7262',
    adminLabel: 'Experience - 3D Journey',
    gradient: 'from-sky-200 to-white',
    defaultName: 'Experience - 3D Journey',
    aiLabelVi:
      'journey 3D bất động sản cao cấp: gate enter + cảnh WebGL tòa tháp trên mây + slide suite chuyển shader + contact, cuộn điều khiển toàn bộ',
    aiLabelEn:
      'luxury real-estate 3D journey: enter gate + WebGL tower-above-clouds scene + shader-wipe suite slides + contact, fully scroll-driven',
  },
  q80_menu: {
    type: 'q80_menu',
    category: 'header',
    style: 'luxury',
    tags: ['clone', 'q80', 'menu'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Menu - Fullscreen Gold',
    accent: '#7c7262',
    adminLabel: 'Menu - Fullscreen Gold',
    gradient: 'from-amber-100 to-stone-200',
    defaultName: 'Menu - Fullscreen Gold',
    aiLabelVi:
      'chrome cố định: logo serif + nút menu mở overlay vàng fullscreen (ảnh + link đánh số) + nút inquire',
    aiLabelEn:
      'fixed chrome: serif logo + hamburger opening gold fullscreen overlay (image + numbered links) + inquire button',
  },
  housent_hero: {
    type: 'housent_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'housent', 'bds', 'search'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Real Estate Search',
    accent: '#e8622c',
    adminLabel: 'Hero - Real Estate Search',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Hero - Real Estate Search',
    aiLabelVi:
      'hero bất động sản 2 cột: badge + tiêu đề lớn + thanh tìm kiếm bên trái, ảnh toà nhà bo góc bên phải',
    aiLabelEn:
      'real-estate hero, two columns: badge + big heading + search bar on the left, rounded building photo on the right',
  },
  housent_stats: {
    type: 'housent_stats',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'housent', 'bds', 'stats'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Stats - Dark Band',
    accent: '#e8622c',
    adminLabel: 'Stats - Dark Band',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Stats - Dark Band',
    aiLabelVi: 'dải chỉ số nền tối: hàng 4-5 số liệu lớn màu cam + nhãn',
    aiLabelEn: 'dark stats band: row of 4-5 big orange metrics with labels',
  },
  housent_listings: {
    type: 'housent_listings',
    category: 'listing',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Listings - Property Grid',
    accent: '#e8622c',
    adminLabel: 'Listings - Property Grid',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Listings - Property Grid',
    aiLabelVi:
      'lưới card bất động sản: ảnh + giá + tên + địa chỉ + thông số bed/bath/diện tích',
    aiLabelEn:
      'property listing grid: image + price + name + address + bed/bath/area specs',
  },
  housent_cta: {
    type: 'housent_cta',
    category: 'cta',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'CTA - Orange Banner',
    accent: '#e8622c',
    adminLabel: 'CTA - Orange Banner',
    gradient: 'from-orange-400 to-orange-600',
    defaultName: 'CTA - Orange Banner',
    aiLabelVi: 'băng CTA cam bo góc lớn: tiêu đề trắng + nút hành động',
    aiLabelEn: 'large rounded orange CTA banner: white heading + action button',
  },
  housent_footer: {
    type: 'housent_footer',
    category: 'footer',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Footer - Dark Columns',
    accent: '#e8622c',
    adminLabel: 'Footer - Dark Columns',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Footer - Dark Columns',
    aiLabelVi:
      'footer nền tối: brand + prompt "cần hỗ trợ?" + nhóm cột link + hàng legal',
    aiLabelEn:
      'dark footer: brand + "need assistance?" prompt + link columns + legal row',
  },
  housent_about: {
    type: 'housent_about',
    category: 'intro',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'About - Split Intro',
    accent: '#e8622c',
    adminLabel: 'About - Split Intro',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'About - Split Intro',
    aiLabelVi:
      'giới thiệu 2 cột: tiêu đề lớn trái + đoạn mô tả và mini-stat phải',
    aiLabelEn:
      'two-column intro: big heading left + description and mini-stats right',
  },
  housent_excellence: {
    type: 'housent_excellence',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Excellence - Numbered List',
    accent: '#e8622c',
    adminLabel: 'Excellence - Numbered List',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Excellence - Numbered List',
    aiLabelVi: 'danh sách ưu điểm đánh số trong vòng tròn trên nền tối',
    aiLabelEn:
      'numbered excellence list with circular indices on a dark background',
  },
  housent_solutions: {
    type: 'housent_solutions',
    category: 'services',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Solutions - Service Cards',
    accent: '#e8622c',
    adminLabel: 'Solutions - Service Cards',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Solutions - Service Cards',
    aiLabelVi: 'lưới card dịch vụ: icon + tiêu đề + mô tả',
    aiLabelEn: 'service card grid: icon + title + description',
  },
  housent_values: {
    type: 'housent_values',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Values - Principle Stack',
    accent: '#e8622c',
    adminLabel: 'Values - Principle Stack',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Values - Principle Stack',
    aiLabelVi: 'stack nguyên tắc: số thứ tự + tiêu đề + mô tả, hàng phân cách',
    aiLabelEn: 'principle stack: index + title + description in divided rows',
  },
  housent_faq: {
    type: 'housent_faq',
    category: 'faq',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'FAQ - Accordion',
    accent: '#e8622c',
    adminLabel: 'FAQ - Accordion',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'FAQ - Accordion',
    aiLabelVi:
      'FAQ accordion nền tối: heading trái + danh sách câu hỏi mở/đóng phải',
    aiLabelEn:
      'dark FAQ accordion: heading left + expandable question list right',
  },
  housent_testimonial: {
    type: 'housent_testimonial',
    category: 'trust',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Testimonial - Quote Cards',
    accent: '#e8622c',
    adminLabel: 'Testimonial - Quote Cards',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Testimonial - Quote Cards',
    aiLabelVi: 'lưới card đánh giá: trích dẫn + tên + vai trò',
    aiLabelEn: 'testimonial card grid: quote + name + role',
  },
  housent_blogs: {
    type: 'housent_blogs',
    category: 'blog',
    style: 'modern',
    tags: ['clone', 'housent', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Blogs - Post Grid',
    accent: '#e8622c',
    adminLabel: 'Blogs - Post Grid',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Blogs - Post Grid',
    aiLabelVi: 'lưới bài viết: ảnh + category + tiêu đề + ngày',
    aiLabelEn: 'blog post grid: image + category + title + date',
  },
  lumea_hero: {
    type: 'lumea_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Luxury Fullbleed',
    accent: '#a68a5b',
    adminLabel: 'Hero - Luxury Fullbleed',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Hero - Luxury Fullbleed',
    aiLabelVi:
      'hero full-bleed ảnh nội thất + overlay tối, eyebrow + heading serif lớn + 2 nút',
    aiLabelEn:
      'full-bleed interior hero with dark overlay, eyebrow + big serif heading + two CTAs',
  },
  lumea_statement: {
    type: 'lumea_statement',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Statement - Centered Serif',
    accent: '#a68a5b',
    adminLabel: 'Statement - Centered Serif',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Statement - Centered Serif',
    aiLabelVi: 'câu tuyên ngôn serif lớn căn giữa trên nền kem',
    aiLabelEn: 'large centered serif statement on a cream background',
  },
  lumea_immersive: {
    type: 'lumea_immersive',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Feature - Image Left',
    accent: '#a68a5b',
    adminLabel: 'Feature - Image Left',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Feature - Image Left',
    aiLabelVi: 'feature 2 cột: ảnh trái + heading serif và mô tả phải',
    aiLabelEn: 'two-column feature: image left + serif heading and copy right',
  },
  lumea_handcrafted: {
    type: 'lumea_handcrafted',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Feature - Image Right',
    accent: '#a68a5b',
    adminLabel: 'Feature - Image Right',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Feature - Image Right',
    aiLabelVi: 'feature 2 cột đảo: heading serif và mô tả trái + ảnh phải',
    aiLabelEn:
      'reversed two-column feature: serif heading and copy left + image right',
  },
  lumea_amenities: {
    type: 'lumea_amenities',
    category: 'amenity',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Amenities - Dark Grid',
    accent: '#a68a5b',
    adminLabel: 'Amenities - Dark Grid',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Amenities - Dark Grid',
    aiLabelVi:
      'lưới tiện ích nền nâu đậm: heading serif + danh sách tiêu đề/mô tả',
    aiLabelEn: 'dark amenity grid: serif heading + title/description list',
  },
  lumea_testimonial: {
    type: 'lumea_testimonial',
    category: 'trust',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Testimonial - Serif Quote',
    accent: '#a68a5b',
    adminLabel: 'Testimonial - Serif Quote',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Testimonial - Serif Quote',
    aiLabelVi: 'trích dẫn serif lớn căn giữa + tên + vai trò',
    aiLabelEn: 'large centered serif quote + name + role',
  },
  lumea_gallery: {
    type: 'lumea_gallery',
    category: 'gallery',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Gallery - Interior Grid',
    accent: '#a68a5b',
    adminLabel: 'Gallery - Interior Grid',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Gallery - Interior Grid',
    aiLabelVi: 'lưới ảnh nội thất bo góc + heading serif',
    aiLabelEn: 'rounded interior image grid + serif heading',
  },
  lumea_footer: {
    type: 'lumea_footer',
    category: 'footer',
    style: 'luxury',
    tags: ['clone', 'lumea', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Footer - Serif Brand',
    accent: '#a68a5b',
    adminLabel: 'Footer - Serif Brand',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Footer - Serif Brand',
    aiLabelVi: 'footer nâu đậm: brand serif lớn + tagline + link + legal',
    aiLabelEn: 'dark footer: big serif brand + tagline + links + legal',
  },
  nordhaven_hero: {
    type: 'nordhaven_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Masked Wordmark',
    accent: '#111111',
    adminLabel: 'Hero - Masked Wordmark',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Hero - Masked Wordmark',
    aiLabelVi:
      'chữ khổng lồ wordmark mask ảnh kiến trúc + ảnh nền, nền gần đen',
    aiLabelEn:
      'giant wordmark masking an architecture photo over a dark background',
  },
  nordhaven_about: {
    type: 'nordhaven_about',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'About - Uppercase Statement',
    accent: '#111111',
    adminLabel: 'About - Uppercase Statement',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'About - Uppercase Statement',
    aiLabelVi: 'câu lớn uppercase + đoạn mô tả trên nền đen',
    aiLabelEn: 'large uppercase statement + copy on a dark background',
  },
  nordhaven_services: {
    type: 'nordhaven_services',
    category: 'services',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Services - Divided List',
    accent: '#111111',
    adminLabel: 'Services - Divided List',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Services - Divided List',
    aiLabelVi: 'list dịch vụ hàng ngang phân cách (số + tiêu đề + mô tả)',
    aiLabelEn: 'divided service list (index + title + description)',
  },
  nordhaven_properties: {
    type: 'nordhaven_properties',
    category: 'listing',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Properties - Dark Grid',
    accent: '#111111',
    adminLabel: 'Properties - Dark Grid',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Properties - Dark Grid',
    aiLabelVi: 'lưới card bất động sản nền tối (ảnh + giá + tên + địa điểm)',
    aiLabelEn: 'dark property grid (image + price + name + location)',
  },
  nordhaven_testimonials: {
    type: 'nordhaven_testimonials',
    category: 'trust',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Testimonials - Dark Cards',
    accent: '#111111',
    adminLabel: 'Testimonials - Dark Cards',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Testimonials - Dark Cards',
    aiLabelVi: 'lưới card đánh giá nền tối viền mảnh',
    aiLabelEn: 'dark testimonial card grid with thin borders',
  },
  nordhaven_faq: {
    type: 'nordhaven_faq',
    category: 'faq',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'FAQ - Dark Accordion',
    accent: '#111111',
    adminLabel: 'FAQ - Dark Accordion',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'FAQ - Dark Accordion',
    aiLabelVi: 'accordion FAQ nền tối 2 cột',
    aiLabelEn: 'dark two-column FAQ accordion',
  },
  nordhaven_gallery: {
    type: 'nordhaven_gallery',
    category: 'gallery',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Gallery - Architecture Grid',
    accent: '#111111',
    adminLabel: 'Gallery - Architecture Grid',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Gallery - Architecture Grid',
    aiLabelVi: 'lưới ảnh kiến trúc nền tối',
    aiLabelEn: 'dark architecture image grid',
  },
  nordhaven_footer: {
    type: 'nordhaven_footer',
    category: 'footer',
    style: 'luxury',
    tags: ['clone', 'nordhaven', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Footer - Wordmark',
    accent: '#111111',
    adminLabel: 'Footer - Wordmark',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Footer - Wordmark',
    aiLabelVi: 'footer nền đen: wordmark lớn + link + legal',
    aiLabelEn: 'dark footer: big wordmark + links + legal',
  },
  firma_hero: {
    type: 'firma_hero',
    category: 'hero',
    style: 'minimal',
    tags: ['clone', 'firma'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Editorial Serif',
    accent: '#8a7f6a',
    adminLabel: 'Hero - Editorial Serif',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Hero - Editorial Serif',
    aiLabelVi: 'hero serif tao nha + subtext + anh lon bo goc tren nen kem',
    aiLabelEn:
      'editorial serif hero + subtext + large rounded image on a cream background',
  },
  firma_statement: {
    type: 'firma_statement',
    category: 'intro',
    style: 'minimal',
    tags: ['clone', 'firma'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Statement - Serif Centered',
    accent: '#8a7f6a',
    adminLabel: 'Statement - Serif Centered',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Statement - Serif Centered',
    aiLabelVi: 'cau lon serif can giua + eyebrow tren nen kem',
    aiLabelEn: 'large centered serif statement + eyebrow on cream',
  },
  firma_work: {
    type: 'firma_work',
    category: 'portfolio',
    style: 'minimal',
    tags: ['clone', 'firma'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Work - Project Grid',
    accent: '#8a7f6a',
    adminLabel: 'Work - Project Grid',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Work - Project Grid',
    aiLabelVi: 'luoi project (anh + ten + category) serif',
    aiLabelEn: 'project grid (image + name + category) serif',
  },
  firma_testimonial: {
    type: 'firma_testimonial',
    category: 'trust',
    style: 'minimal',
    tags: ['clone', 'firma'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Testimonial - Dark Serif',
    accent: '#8a7f6a',
    adminLabel: 'Testimonial - Dark Serif',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Testimonial - Dark Serif',
    aiLabelVi: 'trich dan serif lon nen toi + hang ten tac gia',
    aiLabelEn: 'large serif quote on dark + author row',
  },
  firma_services: {
    type: 'firma_services',
    category: 'services',
    style: 'minimal',
    tags: ['clone', 'firma'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Services - Divided List',
    accent: '#8a7f6a',
    adminLabel: 'Services - Divided List',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Services - Divided List',
    aiLabelVi: 'list dich vu phan cach serif',
    aiLabelEn: 'divided service list serif',
  },
  firma_footer: {
    type: 'firma_footer',
    category: 'footer',
    style: 'minimal',
    tags: ['clone', 'firma'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Footer - CTA Serif',
    accent: '#8a7f6a',
    adminLabel: 'Footer - CTA Serif',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Footer - CTA Serif',
    aiLabelVi: 'footer CTA serif lon + email + link tren nen kem',
    aiLabelEn: 'large serif CTA footer + email + links on cream',
  },
  ignitex_hero: {
    type: 'ignitex_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'ignitex', '3d'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - 3D Big Type',
    accent: '#111111',
    adminLabel: 'Hero - 3D Big Type',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Hero - 3D Big Type',
    aiLabelVi:
      'chu Design & Strategy khong lo tren anh 3D nen toi + list dich vu',
    aiLabelEn:
      'giant Design & Strategy type over a 3D image on dark + service list',
  },
  ignitex_services: {
    type: 'ignitex_services',
    category: 'services',
    style: 'modern',
    tags: ['clone', 'ignitex'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Services - Solutions List',
    accent: '#111111',
    adminLabel: 'Services - Solutions List',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Services - Solutions List',
    aiLabelVi: 'list dich vu danh so phan cach nen toi',
    aiLabelEn: 'numbered divided service list on dark',
  },
  ignitex_projects: {
    type: 'ignitex_projects',
    category: 'portfolio',
    style: 'modern',
    tags: ['clone', 'ignitex'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Projects - Dark Grid',
    accent: '#111111',
    adminLabel: 'Projects - Dark Grid',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Projects - Dark Grid',
    aiLabelVi: 'luoi project nen toi (anh + ten + tag)',
    aiLabelEn: 'dark project grid (image + name + tag)',
  },
  ignitex_about: {
    type: 'ignitex_about',
    category: 'intro',
    style: 'modern',
    tags: ['clone', 'ignitex', 'stats'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'About - Stats Row',
    accent: '#111111',
    adminLabel: 'About - Stats Row',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'About - Stats Row',
    aiLabelVi: 'cau lon + hang mini-stat nen toi',
    aiLabelEn: 'large statement + mini-stat row on dark',
  },
  ignitex_cta: {
    type: 'ignitex_cta',
    category: 'cta',
    style: 'modern',
    tags: ['clone', 'ignitex'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'CTA - Big Type',
    accent: '#111111',
    adminLabel: 'CTA - Big Type',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'CTA - Big Type',
    aiLabelVi: 'heading khong lo + nut nen toi',
    aiLabelEn: 'giant CTA heading + button on dark',
  },
  ignitex_footer: {
    type: 'ignitex_footer',
    category: 'footer',
    style: 'modern',
    tags: ['clone', 'ignitex'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Footer - Wordmark',
    accent: '#111111',
    adminLabel: 'Footer - Wordmark',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Footer - Wordmark',
    aiLabelVi: 'wordmark + email + link + legal nen toi',
    aiLabelEn: 'wordmark + email + links + legal on dark',
  },
  readymag_marquee: {
    type: 'readymag_marquee',
    category: 'marquee',
    style: 'modern',
    tags: ['clone', 'readymag', 'brutalist'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Marquee - Brutalist Band',
    accent: '#000000',
    adminLabel: 'Marquee - Brutalist Band',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Marquee - Brutalist Band',
    aiLabelVi: 'bang chay ngang chu uppercase + pill book call, vien den',
    aiLabelEn: 'scrolling uppercase marquee + book call pill with black border',
  },
  readymag_projects: {
    type: 'readymag_projects',
    category: 'portfolio',
    style: 'modern',
    tags: ['clone', 'readymag', 'brutalist'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Projects - Brutalist Grid',
    accent: '#000000',
    adminLabel: 'Projects - Brutalist Grid',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Projects - Brutalist Grid',
    aiLabelVi: 'luoi brutalist: card danh so ten lon xen card anh oval nen den',
    aiLabelEn:
      'brutalist grid: numbered name cards alternating with black oval image cards',
  },
  readymag_footer: {
    type: 'readymag_footer',
    category: 'footer',
    style: 'modern',
    tags: ['clone', 'readymag', 'brutalist'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Footer - Big Wordmark',
    accent: '#000000',
    adminLabel: 'Footer - Big Wordmark',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Footer - Big Wordmark',
    aiLabelVi: 'wordmark khong lo + link, nen trang vien den',
    aiLabelEn: 'giant wordmark + links, white with black border',
  },
  protection_scrollytelling: {
    type: 'protection_scrollytelling',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'protection', 'scrollytelling', 'animation'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Hero - Frame Scrollytelling',
    accent: '#FCC200',
    adminLabel: 'Hero - Frame Scrollytelling',
    gradient: 'from-amber-100 to-neutral-200',
    defaultName: 'Hero - Frame Scrollytelling',
    aiLabelVi:
      'hero pin canvas 240 frame theo scroll: tagline truot len roi section title cycle, cham cuoi vang',
    aiLabelEn:
      'pinned 240-frame canvas scrollytelling hero: tagline slides up then section titles cycle',
  },
  springs_header: {
    type: 'springs_header',
    category: 'header',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Springs - Header',
    accent: '#173620',
    adminLabel: 'Springs - Header',
    gradient: 'from-emerald-950 to-emerald-800',
    defaultName: 'Springs - Header',
    aiLabelVi:
      'header bất động sản: logo giữa, menu + residences + contact us, icon yêu thích',
    aiLabelEn:
      'real-estate header: centered logo, menu + residences + contact us, favourite icon',
  },
  springs_gallery: {
    type: 'springs_gallery',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Gallery Intro',
    accent: '#173620',
    adminLabel: 'Springs - Gallery Intro',
    gradient: 'from-emerald-950 to-emerald-800',
    defaultName: 'Springs - Gallery Intro',
    aiLabelVi:
      'intro gallery pin 200vh: preloader fade + 2 cột ảnh xoay chéo crossfade tuần tự trước khi vào Hero',
    aiLabelEn:
      'pinned 200vh intro gallery: preloader fade + 2 diagonally-rotated columns crossfading images before the Hero',
  },
  springs_hero: {
    type: 'springs_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Hero',
    accent: '#173620',
    adminLabel: 'Springs - Hero',
    gradient: 'from-emerald-950 to-emerald-700',
    defaultName: 'Springs - Hero',
    aiLabelVi:
      'hero sticky-scroll 600vh: tiêu đề fade-up, ảnh nền thu hẹp clip-path, 3 ảnh reveal tuần tự',
    aiLabelEn:
      'sticky-scroll hero 600vh: title fade-up, background clip-path narrow, 3 images sequential reveal',
  },
  springs_intro: {
    type: 'springs_intro',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Intro',
    accent: '#173620',
    adminLabel: 'Springs - Intro',
    gradient: 'from-emerald-900 to-emerald-600',
    defaultName: 'Springs - Intro',
    aiLabelVi:
      'khoảng lặng thương hiệu: câu tuyên ngôn serif lớn + đoạn mô tả phụ, đi kèm 1 ảnh, nền cream',
    aiLabelEn:
      'brand-statement pause: large serif statement + supporting paragraph paired with an image, cream background',
  },
  springs_wellness: {
    type: 'springs_wellness',
    category: 'amenity',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds', 'wellness'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Wellness',
    accent: '#2f6b4f',
    adminLabel: 'Springs - Wellness',
    gradient: 'from-emerald-800 to-emerald-500',
    defaultName: 'Springs - Wellness',
    aiLabelVi:
      'section wellness: eyebrow + heading serif canh phải, dải ảnh spa/thư giãn với clip-path reveal riêng từng ảnh, nền gradient xanh rêu/teal',
    aiLabelEn:
      'wellness section: right-aligned eyebrow + serif heading, spa/lifestyle image strip with per-image clip-path reveal, green/teal gradient wash',
  },
  springs_nature_place: {
    type: 'springs_nature_place',
    category: 'amenity',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Nature & Place',
    accent: '#2f6b4f',
    adminLabel: 'Springs - Nature & Place',
    gradient: 'from-emerald-800 to-lime-600',
    defaultName: 'Springs - Nature & Place',
    aiLabelVi:
      '2 sticky pin nối tiếp: Nature rồi Place, curtain-reveal clip-path + zoom-out parallax + caption trồi lên muộn',
    aiLabelEn:
      '2 chained sticky pins: Nature then Place, clip-path curtain reveal + zoom-out parallax + late-rising caption',
  },
  springs_map: {
    type: 'springs_map',
    category: 'location',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds', 'map'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Map',
    accent: '#173620',
    adminLabel: 'Springs - Map',
    gradient: 'from-emerald-950 to-emerald-700',
    defaultName: 'Springs - Map',
    aiLabelVi:
      'sticky pin 220vh: ảnh bản đồ curtain-reveal + zoom nhẹ, caption trồi lên muộn ở nửa sau',
    aiLabelEn:
      'sticky pin 220vh: map image curtain reveal + subtle zoom, caption rises late in the second half',
  },
  real_estate_location: {
    type: 'real_estate_location',
    category: 'location',
    style: 'luxury',
    tags: ['clone', 'real-estate', 'bds', 'map', 'framer'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-17',
    label: 'Real Estate - Vị trí & Bản đồ',
    accent: '#009336',
    adminLabel: 'Real Estate - Vị trí & Bản đồ',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Vị trí & Bản đồ',
    aiLabelVi:
      'section vị trí: eyebrow + tiêu đề + mô tả canh giữa, dưới là video bản đồ full-bleed chạy loop; chữ fade-up lần lượt khi cuộn tới',
    aiLabelEn:
      'location section: centered eyebrow + title + description above a full-bleed looping map video; text fades up in sequence on scroll',
  },
  real_estate_hero: {
    type: 'real_estate_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', 'real-estate', 'bds', 'hero', 'banner', 'framer'],
    status: 'ready',
    // Co giãn theo container (cqi), không viewport unit — nhưng aspect 372/454
    // giữ nguyên mọi tier vì nguồn là canvas 372 cố định, zero media query.
    responsive: true,
    updatedAt: '2026-07-17',
    label: 'Real Estate - Banner',
    accent: '#009336',
    adminLabel: 'Real Estate - Banner',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Banner',
    aiLabelVi:
      'banner mở đầu: ảnh full-bleed trôi parallax nhẹ khi cuộn, phủ gradient đen từ đáy, ba cặp thông số (nhãn + giá trị) canh giữa sát đáy',
    aiLabelEn:
      'opening banner: full-bleed image drifting with subtle scroll parallax, black bottom gradient scrim, three centred label/value stat pairs near the bottom',
  },
  real_estate_info: {
    type: 'real_estate_info',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'real-estate', 'bds', 'intro', 'framer'],
    status: 'ready',
    // Cùng lý do `real_estate_hero`: nguồn là canvas 372 cố định, zero media
    // query — co giãn tuyến tính theo cqi, không cần breakpoint.
    responsive: true,
    updatedAt: '2026-07-18',
    label: 'Real Estate - Giới thiệu',
    accent: '#009336',
    adminLabel: 'Real Estate - Giới thiệu',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Giới thiệu',
    aiLabelVi:
      'section giới thiệu ngắn: icon trang trí + tiêu đề + đoạn mô tả canh giữa, dưới cùng là ảnh đại diện; chữ fade-up lần lượt, ảnh crop-in khi cuộn tới',
    aiLabelEn:
      'short intro section: decorative icon above a centred title and description, closing with a feature image; text fades up in sequence, the image crops in on scroll',
  },
  real_estate_overview: {
    type: 'real_estate_overview',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'real-estate', 'bds', 'overview', 'framer'],
    status: 'ready',
    // Cùng lý do `real_estate_info`: canvas 372 cố định, zero media query.
    // Lưới giữ 2 cột ở mọi bề rộng như nguồn, chỉ cap lại chiều rộng cột nội
    // dung — nên không có breakpoint nào để hỏng.
    responsive: true,
    updatedAt: '2026-07-19',
    label: 'Real Estate - Tổng quan',
    accent: '#009336',
    adminLabel: 'Real Estate - Tổng quan',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Tổng quan',
    aiLabelVi:
      'section tổng quan dự án: tiêu đề 2 dòng canh giữa, dưới là lưới 2 cột × 3 hàng gồm 6 icon tròn, mỗi icon kèm một dòng thông số; tiêu đề rồi từng ô fade-up lần lượt khi cuộn tới',
    aiLabelEn:
      'project overview section: a centred two-line title above a 2×3 grid of six circular icons, each captioned with one project figure; title then each cell fades up in sequence on scroll',
  },
  real_estate_highlights: {
    type: 'real_estate_highlights',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'real-estate', 'bds', 'highlights', 'scroll', 'framer'],
    status: 'ready',
    // Card giữ tỉ lệ 249/359 và tự là container riêng, nên nội dung bên trong
    // co giãn theo card chứ không theo viewport — không breakpoint nào để hỏng.
    // Trên canvas editor block đổi sang lưới wrap để chọn được đủ 4 card.
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Real Estate - Điểm nổi trội',
    accent: '#009336',
    adminLabel: 'Real Estate - Điểm nổi trội',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Điểm nổi trội',
    aiLabelVi:
      'section điểm nổi trội dự án: tiêu đề và mô tả canh giữa, dưới là dãy card ảnh tròn kèm số thứ tự lớn màu xanh, trượt ngang theo tiến độ cuộn của section',
    aiLabelEn:
      'project highlights section: a centred title and description above a row of cards with circular photos and large green ordinals, the row sliding horizontally as the section scrolls past',
  },
  real_estate_villa: {
    type: 'real_estate_villa',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'real-estate', 'bds', 'villa', 'carousel', 'framer'],
    status: 'ready',
    // Mỗi slide tự là container riêng nên tỉ lệ ảnh/chữ giữ nguyên ở mọi bề
    // rộng — zero media query. Trên canvas editor block đổi sang lưới 2 cột để
    // chọn được cả 4 slide (carousel chỉ render 1 slide một lúc).
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Real Estate - Biệt thự',
    accent: '#009336',
    adminLabel: 'Real Estate - Biệt thự',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Biệt thự',
    aiLabelVi:
      'section các loại hình biệt thự: eyebrow và tiêu đề canh giữa, dưới là carousel ảnh kèm tên loại hình, mô tả, counter và nút chuyển slide',
    aiLabelEn:
      'villa typologies section: a centred eyebrow and title above an image carousel with the typology name, description, a slide counter and prev/next controls',
  },
  real_estate_utilities: {
    type: 'real_estate_utilities',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'real-estate', 'bds', 'utilities', 'amenities', 'framer'],
    status: 'ready',
    // Lưới giữ 2 cột ở mọi bề rộng như nguồn, chỉ cap chiều rộng cột nội dung —
    // không breakpoint nào để hỏng. Ô cao theo nội dung nên label 3 dòng cũng
    // không tràn.
    responsive: true,
    updatedAt: '2026-07-20',
    label: 'Real Estate - Nội khu tiện ích',
    accent: '#009336',
    adminLabel: 'Real Estate - Nội khu tiện ích',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Nội khu tiện ích',
    aiLabelVi:
      'section nội khu tiện ích: tiêu đề canh giữa, dưới là lưới 2 cột × 3 hàng gồm 6 icon line art nâu, mỗi icon kèm tên tiện ích 2 dòng; tiêu đề rồi từng ô fade-up lần lượt khi cuộn tới',
    aiLabelEn:
      'on-site amenities section: a centred title above a 2×3 grid of six brown line-art icons, each captioned with a two-line amenity name; title then each cell fades up in sequence on scroll',
  },
  springs_design: {
    type: 'springs_design',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds', 'design'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Design',
    accent: '#173620',
    adminLabel: 'Springs - Design',
    gradient: 'from-stone-800 to-stone-500',
    defaultName: 'Springs - Design',
    aiLabelVi:
      'kiến trúc: chuỗi card so le trái-phải, mỗi ảnh trôi ngang luân phiên (parallax) khi cuộn qua',
    aiLabelEn:
      'architecture: alternating left-right card sequence, each image drifts horizontally (parallax) on scroll',
  },
  springs_residences: {
    type: 'springs_residences',
    category: 'listing',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Residences',
    accent: '#173620',
    adminLabel: 'Springs - Residences',
    gradient: 'from-stone-700 to-stone-400',
    defaultName: 'Springs - Residences',
    aiLabelVi:
      'sticky pin slideshow 3 nhịp: ảnh phối cảnh crossfade + caption loại căn hộ + progress bar',
    aiLabelEn:
      'sticky pin 3-beat slideshow: crossfading render images + unit-type caption + progress bar',
  },
  springs_interiors: {
    type: 'springs_interiors',
    category: 'gallery',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds', 'interior'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-08',
    label: 'Springs - Interiors',
    accent: '#173620',
    adminLabel: 'Springs - Interiors',
    gradient: 'from-amber-900 to-amber-600',
    defaultName: 'Springs - Interiors',
    aiLabelVi:
      'sticky pin 2 beat: ảnh intro full-bleed + tiêu đề "Interiors" phải-canh → crossfade sang slider ảnh nội thất + rail thumbnail',
    aiLabelEn:
      'sticky pin 2-beat: full-bleed intro image + right-aligned "Interiors" heading → crossfades to interior slider with thumbnail rail',
  },
  springs_contact_footer: {
    type: 'springs_contact_footer',
    category: 'footer',
    style: 'luxury',
    tags: ['clone', 'springs', 'bds', 'form'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Springs - Contact & Footer',
    accent: '#0d1f14',
    adminLabel: 'Springs - Contact & Footer',
    gradient: 'from-neutral-950 to-emerald-950',
    defaultName: 'Springs - Contact & Footer',
    aiLabelVi:
      'form liên hệ + footer: địa chỉ, điện thoại, email, link mạng xã hội',
    aiLabelEn: 'contact form + footer: address, phone, email, social links',
  },
  sustainit_our_expertise: {
    type: 'sustainit_our_expertise',
    category: 'services',
    style: 'modern',
    tags: ['clone', 'sustainit'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Sustainit - Our Expertise',
    accent: '#B6FF3D',
    adminLabel: 'Sustainit - Our Expertise',
    gradient: 'from-lime-300 to-neutral-200',
    defaultName: 'Sustainit - Our Expertise',
    aiLabelVi:
      'grid 2×2 cell vuông: 4 expertise item (ảnh + tiêu đề ALL-CAPS + bullets), Geist Mono, accent xanh',
    aiLabelEn:
      '2×2 square-cell grid: 4 expertise items (image + ALL-CAPS title + bullets), Geist Mono, green accent',
  },
  framer_firma_template_strategy_digital: {
    type: 'framer_firma_template_strategy_digital',
    category: 'portfolio',
    style: 'minimal',
    tags: ['clone', 'firma', 'case-study'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Firma Project Card',
    accent: '#000000',
    adminLabel: 'Project Card (Firma)',
    gradient: 'from-stone-50 to-stone-200',
    defaultName: 'Project Card',
    aiLabelVi:
      'block case-study 2 cột (recon spec): ảnh chân dung vuông trái + card trắng phải với eyebrow, heading serif, body, link gạch chân reveal-on-hover',
    aiLabelEn:
      'two-column case-study block (recon spec): square portrait image left + white card right with eyebrow, serif heading, body, underline-reveal-on-hover link',
  },
  readymag_case_section: {
    type: 'readymag_case_section',
    category: 'portfolio',
    style: 'minimal',
    tags: ['readymag', 'clone', 'portfolio', 'scroll-driven'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Readymag Cases',
    accent: '#000000',
    adminLabel: 'Readymag Cases',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Cases',
    aiLabelVi:
      'section cases Readymag: 3-cột tuyệt đối (ảnh trái + bio giữa + wordmark phải) với case-cycle scroll-driven (GSAP scrub R1–R6)',
    aiLabelEn:
      'Readymag cases: 3-column absolute layout (image-stack left + bio middle + wordmark right) with scroll-driven case cycle (GSAP scrub R1–R6)',
  } as any,
  framer_estancia_about_us: {
    type: 'framer_estancia_about_us',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'estancia', 'bds'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Estancia About Us',
    accent: '#e7decf',
    adminLabel: 'About Us (Estancia)',
    gradient: 'from-amber-100 to-amber-200',
    defaultName: 'About Us',
    aiLabelVi:
      'section nền tan #E7DECF, heading center + pill "About us" + grid 3 ảnh chân dung với stat (2012 / 320+ / 200+)',
    aiLabelEn:
      'tan #E7DECF section, centered heading + "About us" pill CTA + 3 portrait photo cards with stats (2012 / 320+ / 200+)',
  },
  rolex_collection_hero: {
    type: 'rolex_collection_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'hero'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-22',
    label: 'Rolex Collection Hero',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Hero',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Rolex Collection Hero',
    aiLabelVi:
      'hero section tối: chữ R lớn + COSMOGRAPH DAYTONA + Ever Oyster + ảnh đồng hồ Rolex + link Contact',
    aiLabelEn:
      'dark hero: big R letter + COSMOGRAPH DAYTONA + Ever Oyster + Rolex watch image + Contact link',
  },
  rolex_collection_nav: {
    type: 'rolex_collection_nav',
    category: 'navigation',
    style: 'modern',
    tags: ['clone', 'framer', 'nav'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-22',
    label: 'Rolex Collection Nav',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Nav',
    gradient: 'from-neutral-800 to-neutral-900',
    defaultName: 'Rolex Collection Nav',
    aiLabelVi: 'nav bar glass với 3 items (home, explore collection, contact)',
    aiLabelEn: 'glass nav bar with 3 items (home, explore collection, contact)',
  },
  rolex_collection_work: {
    type: 'rolex_collection_work',
    category: 'gallery',
    style: 'modern',
    tags: ['clone', 'framer', 'scroll', 'gallery'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-23',
    label: 'Rolex Collection Work',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Work',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Rolex Collection Work',
    aiLabelVi:
      'showcase pin-scroll 7 model đồng hồ Rolex: mỗi giai đoạn đổi màu nền + tiêu đề chữ lớn + ảnh đồng hồ lật 3D (Oyster/Perpetual/Daytona/Submariner/Sea Dweler/Deep Sea/GMT Master)',
    aiLabelEn:
      'scroll-pinned 7-stage Rolex watch showcase: each stage swaps background color + large title + 3D-flip watch image (Oyster/Perpetual/Daytona/Submariner/Sea Dweler/Deep Sea/GMT Master)',
  },
  rolex_collection_contact: {
    type: 'rolex_collection_contact',
    category: 'form',
    style: 'modern',
    tags: ['clone', 'framer', 'contact', 'form'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-23',
    label: 'Rolex Collection Contact',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Contact',
    gradient: 'from-neutral-800 to-black',
    defaultName: 'Rolex Collection Contact',
    aiLabelVi:
      'section "SAY HELLO" tối: card kính mờ chứa form liên hệ (tên/email/lời nhắn) bên trái + ảnh chân dung + link Instagram/Twitter bên phải',
    aiLabelEn:
      'dark "SAY HELLO" glass card: contact form (name/email/message) left + portrait photo with Instagram/Twitter links right',
  },
  rolex_collection_project: {
    type: 'rolex_collection_project',
    category: 'feature',
    style: 'luxury',
    tags: ['clone', 'framer', 'project-detail'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-24',
    label: 'Rolex Collection Project',
    accent: '#000000',
    adminLabel: 'Rolex Collection Project',
    gradient: 'from-neutral-100 to-white',
    defaultName: 'Rolex Collection Project',
    aiLabelVi:
      'toàn bộ trang chi tiết dự án: hero (ảnh + heading animation per-char + mô tả) → dải ảnh full-width → 2 ảnh cạnh nhau → dải ảnh full-width → split đóng bài (ảnh + subheading + mô tả + glyph)',
    aiLabelEn:
      'full project-details page: hero (image + per-char animated heading + description) → full-width image band → 2 side-by-side images → full-width image band → closing split (image + subheading + description + glyph)',
  },
};
