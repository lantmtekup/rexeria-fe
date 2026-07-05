export type Lang = 'vi' | 'en';
export type Device = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'hero_split'
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
  | 'framer_perform_about'
  | 'framer_perform_pricing'
  // ── Mint-coint sections tách thành data block (port từ src/templates) ──
  | 'mint_details'
  | 'mint_sku'
  | 'mint_hero'
  | 'mint_variants'
  | 'mint_discover'
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
  | 'brightedge_hero';

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

/** Mint-coint "variants" section (port). Swatch picker + parallax title. */
export interface MintVariantsContent {
  titleLine1: string;
  titleLine2: string;
  variants: MintVariantItem[];
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
  bgClass: string;
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
 * - cardImages — mảng ảnh trong dải marquee dưới
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
  cardImages: Array<{ imageUrl: string }>;
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
  price: string;
  name: string;
  address: string;
  specs: string;
}
export interface HousentListingsContent {
  eyebrow: string;
  title: string;
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

export interface HousentAboutPoint {
  value: string;
  label: string;
}
export interface HousentAboutContent {
  eyebrow: string;
  title: string;
  text: string;
  points: HousentAboutPoint[];
}

export interface HousentFeatureItem {
  title: string;
  description: string;
}
export interface HousentExcellenceContent {
  eyebrow: string;
  title: string;
  items: HousentFeatureItem[];
}

export interface HousentSolutionItem {
  icon: string;
  title: string;
  description: string;
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
  items: HousentFeatureItem[];
}

export interface HousentFaqItem {
  question: string;
  answer: string;
}
export interface HousentFaqContent {
  eyebrow: string;
  title: string;
  items: HousentFaqItem[];
}

export interface HousentTestimonialItem {
  quote: string;
  name: string;
  role: string;
}
export interface HousentTestimonialContent {
  eyebrow: string;
  title: string;
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

export type BlockContent =
  | HeroSplitContent
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
  | FramerStudioManifestoContent
  | FramerStatsGridContent
  | FramerProjectsGridContent
  | FramerTeamDirectoryContent
  | FramerImageStaggerContent
  | FramerAesthaEditorialContent
  | FramerPerformAboutContent
  | FramerPerformPricingContent
  | FramerFaqMinimalContent
  | FramerDarlingTimelineContent
  | FramerNftpullTimelineContent
  | FramerSignatureFeatureContent
  | FramerVsCollinsProjectsContent
  | FramerClarityServicesContent
  | DelvauxHeaderContent
  | DelvauxSubnavContent
  | DelvauxHeroContent
  | DelvauxDetailsContent
  | DelvauxProductContent
  | DelvauxVariantContent
  | Q80ExperienceContent
  | Q80MenuContent
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
}

export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  hero_split: {
    type: 'hero_split',
    label: 'Hero Split',
    accent: '#0A0A0A',
    adminLabel: 'Hero Split',
    gradient: 'from-rose-400 to-red-500',
    defaultName: 'Hero Split',
    aiLabelVi: 'block hero (chia đôi)',
    aiLabelEn: 'split-layout hero block',
  },
  hero_overlay: {
    type: 'hero_overlay',
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
    label: 'Mint · Discover',
    accent: '#a16207',
    adminLabel: 'Mint Discover',
    gradient: 'from-amber-600 to-yellow-800',
    defaultName: 'Mint Discover',
    aiLabelVi: 'section khám phá chi tiết coin (hotspot + drawer)',
    aiLabelEn: 'coin detail discover section (hotspots + drawer)',
  },
  mintv2_emblem: {
    type: 'mintv2_emblem',
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
    label: 'Hover Equalizer Heading',
    accent: '#0f0f0f',
    adminLabel: 'Hover Equalizer Heading',
    gradient: 'from-lime-400 to-emerald-600',
    defaultName: 'Hover Equalizer Heading',
    aiLabelVi: 'tiêu đề chữ giãn như equalizer khi hover',
    aiLabelEn: 'heading text stretching like an equalizer on hover',
  },
  image_explosion: {
    type: 'image_explosion',
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
    label: 'Explore CTA',
    accent: '#1A1A1A',
    adminLabel: 'Explore CTA',
    gradient: 'from-stone-200 to-stone-400',
    defaultName: 'Explore CTA',
    aiLabelVi: 'block CTA căn giữa + link underline dạng [ LABEL ]',
    aiLabelEn: 'centered CTA section with bracketed underline link',
  },
  framer_studio_manifesto: {
    type: 'framer_studio_manifesto',
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
    label: 'Image Stagger',
    accent: '#1a1a18',
    adminLabel: 'Image Stagger',
    gradient: 'from-stone-300 to-stone-500',
    defaultName: 'Image Stagger',
    aiLabelVi: 'lưới ảnh bất đối xứng 12 cột',
    aiLabelEn: 'asymmetric 12-column image stagger grid',
  },
  framer_faq_minimal: {
    type: 'framer_faq_minimal',
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
  framer_aestha_editorial: {
    type: 'framer_aestha_editorial',
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
  framer_perform_about: {
    type: 'framer_perform_about',
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
};
