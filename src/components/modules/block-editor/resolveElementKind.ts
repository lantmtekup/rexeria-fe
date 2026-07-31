/**
 * Shared element-kind resolver for ElementToolbar + canvas hover edit.
 * Registry-first (`BlockDef.elements.fieldType`), then key heuristics.
 */
import { getBlockDef } from './blocks/_registry/registry';
import {
  FRAMER_PUREVISUALS_PANEL_LABEL,
  isFramerPurevisualsPanelKey,
  parseFramerPurevisualsPanelImageKey,
} from './blocks/_registry/defs/framerPurevisualsHero';
import { isLinkKey } from './links/linkToken';
import type { LayerElement } from './LayersPanel';
import type { BlockType } from './types';

export type ElementKind =
  | 'text'
  | 'image'
  | 'link'
  | 'stats'
  | 'features'
  | 'reasons'
  | 'slides'
  | 'scrollMattisSlides'
  | 'readymagCaseSectionItems'
  | 'masteriseSlides'
  | 'interactiveAd'
  | 'mintVariants'
  | 'mintTabs'
  | 'pnjParagraphs'
  | 'pnjTitleLines'
  | 'pnjVariants'
  | 'pnjVariantHighlights'
  | 'pnjStickyMenuItems'
  | 'mintV2ServicesItems'
  | 'coolHunterGalleryItems'
  | 'framerBungeeHeroV2CardImages'
  | 'coolHunterSectionProgressItems'
  | 'housentOurExcellenceItems'
  | 'sustainitOurExpertiseItems'
  | 'scrollImgScaleItems'
  | 'framerIgnitexStepCards'
  | 'framerClarityServicesItems'
  | 'alturaOlympusFeatures'
  | 'alturaOlympusImages'
  | 'theGrandServiceItems'
  | 'theGrandDiscoverItems'
  | 'theGrandAboutPartners'
  | 'theGrandFooterPolicies'
  | 'theGrandFooterSocials'
  | 'mintV2ProcessSteps'
  | 'framerDarlingTimelineItems'
  | 'framerNftpullTimelineItems'
  | 'framerFlatWhiteProcessSteps'
  | 'framerPerformPricingTiers'
  | 'framerPerformTestimonials'
  | 'ignitexProjectsItems'
  | 'mintVaultCraftItems'
  | 'mintVaultCoins'
  | 'mintVaultImages'
  | 'framerPurevisualsPanelImages'
  | 'lineaPortfolioItems'
  | 'realEstateOverviewStats'
  | 'fill'
  | 'pnjFrames'
  | 'pnjScrim'
  | 'delvauxFrames'
  | 'delvauxHotspots'
  | 'delvauxVariants'
  | 'delvauxFaqs'
  | 'citeFlowFaqs'
  | 'citeFlowAmenityList'
  | 'citeFlowHeaderSocialLinks'
  | 'delvauxSubnavLinks'
  // Nav họ Aestha — nay thuộc block riêng `aestha_nav` (trước ở
  // `framer_aestha_editorial`). Các kind `aestha*FooterLinks` đã bỏ cùng lúc.
  | 'aesthaNavLinks'
  | 'aesthaExploreProjects'
  | 'aesthaExploreProjectImages'
  | 'aesthaStudioTeam'
  | 'aesthaContactSocials'
  | 'mintDiscoverVariant'
  | 'mintDiscoverSurface'
  | 'background';

export const BACKGROUND_LAYER_KEY = '__background__';

/**
 * Block Vault dùng `images: string[]` (trail / gallery 3D / explosion) → nhãn
 * list manager. Cần chặn trước fallback `isImageKey` — `/image/i` khớp cả
 * "images" nên `images` rơi vào kind `image` và ImageControls ghi 1 URL đè cả mảng.
 */
const MINT_VAULT_IMAGE_LABEL = new Map<BlockType, string>([
  ['mint_vault_reveal', 'Ảnh gallery'],
  ['mint_vault_hero', 'Ảnh trail'],
  ['mint_vault_invitation', 'Ảnh explosion'],
]);

const ELEMENT_KIND: Record<string, ElementKind> = {
  eyebrow: 'text',
  title: 'text',
  heading: 'text',
  text: 'text',
  tag: 'text',
  name: 'text',
  count: 'text',
  description: 'text',
  subtitle: 'text',
  ctaText: 'text',
  submitText: 'text',
  noteText: 'text',
  primaryText: 'text',
  secondaryText: 'text',
  imageUrl: 'image',
  backgroundUrl: 'image',
  stats: 'stats',
  features: 'features',
  reasons: 'reasons',
  slides: 'slides',
  variants: 'mintVariants',
  tabs: 'mintTabs',
  hotspots: 'mintTabs',
  paragraphs: 'pnjParagraphs',
  titleLines: 'pnjTitleLines',
  frames: 'pnjFrames',
  scrim: 'pnjScrim',
  [BACKGROUND_LAYER_KEY]: 'background',
};

const ELEMENT_LABEL: Record<string, string> = {
  eyebrow: 'Eyebrow',
  title: 'Tiêu đề',
  tag: 'Tag',
  description: 'Mô tả',
  subtitle: 'Mô tả',
  count: 'Số lượng',
  ctaText: 'Nút CTA',
  submitText: 'Nút gửi',
  noteText: 'Ghi chú',
  note: 'Ghi chú',
  emailPlaceholder: 'Placeholder email',
  successMessage: 'Lời cảm ơn',
  primaryText: 'Nút CTA chính',
  secondaryText: 'Nút CTA phụ',
  imageUrl: 'Ảnh hero',
  backgroundUrl: 'Ảnh nền',
  stats: 'Thống kê',
  features: 'Tiện ích',
  reasons: 'Lý do',
  slides: 'Slides',
  variants: 'Biến thể (swatch)',
  tabs: 'Hotspot / chi tiết',
  hotspots: 'Hotspot / chi tiết',
  paragraphs: 'Đoạn văn',
  titleLines: 'Tiêu đề dòng',
  frames: 'Frame sequence',
  scrim: 'Lớp mờ / scrim',
  [BACKGROUND_LAYER_KEY]: 'Nền',
};

/** Catch dynamic image fields not listed in ELEMENT_KIND. */
export function isImageKey(key: string): boolean {
  return (
    /(image|photo|logo|avatar|thumbnail|picture|cover)/i.test(key) ||
    /url$/i.test(key)
  );
}

export function defFieldType(
  blockType: BlockType,
  key: string
): LayerElement['fieldType'] | undefined {
  return getBlockDef(blockType)?.elements.find(e => e.key === key)?.fieldType;
}

export function resolveKind(
  key: string,
  fieldType?: LayerElement['fieldType'],
  blockType?: BlockType
): ElementKind {
  if (fieldType === 'image') return 'image';
  // Before the 'text' branch: a link field declared as text must not fall
  // through to the inline contenteditable path.
  if (fieldType === 'link') return 'link';
  if (fieldType === 'text' || fieldType === 'textarea') return 'text';
  // `slides` overlaps image_carousel vs interactive_ad_widget vs scroll_mattis.
  if (key === 'slides' && blockType === 'interactive_ad_widget') {
    return 'interactiveAd';
  }
  if (key === 'slides' && blockType === 'scroll_mattis') {
    return 'scrollMattisSlides';
  }
  if (key === 'cases' && blockType === 'readymag_case_section') {
    return 'readymagCaseSectionItems';
  }
  if (key === 'slides' && blockType === 'masterise_home_inside') {
    return 'masteriseSlides';
  }
  // PNJ variant chapters vs Mint swatch variants — cùng key `variants`.
  if (key === 'variants' && blockType === 'pnj_variant') {
    return 'pnjVariants';
  }
  // PNJ variant highlights list — chặn trước fallback text (không ghi string đè mảng).
  if (
    /^variants\[\d+\]\.highlights$/.test(key) &&
    blockType === 'pnj_variant'
  ) {
    return 'pnjVariantHighlights';
  }
  // Delvaux color swatches vs Mint/PNJ variants — cùng key `variants`.
  if (key === 'variants' && blockType === 'delvaux_variant') {
    return 'delvauxVariants';
  }
  if (key === 'faqs' && blockType === 'delvaux_variant') {
    return 'delvauxFaqs';
  }
  if (key === 'items' && blockType === 'cite_flow_faq') {
    return 'citeFlowFaqs';
  }
  if (key === 'listItems' && blockType === 'cite_flow_amenity') {
    return 'citeFlowAmenityList';
  }
  if (key === 'socialLinks' && blockType === 'cite_flow_header') {
    return 'citeFlowHeaderSocialLinks';
  }
  if (
    /^socialLinks\[\d+\]\.label$/.test(key) &&
    blockType === 'cite_flow_header'
  ) {
    return 'text';
  }
  if (
    /^socialLinks\[\d+\]\.href$/.test(key) &&
    blockType === 'cite_flow_header'
  ) {
    return 'link';
  }
  if (key === 'links' && blockType === 'delvaux_subnav') {
    return 'delvauxSubnavLinks';
  }
  if (
    /^links\[\d+\]\.(label|targetId)$/.test(key) &&
    blockType === 'delvaux_subnav'
  ) {
    // `targetId` is a link target — must reach the picker, not the plain text
    // input. These hardcoded branches return before `defFieldType` is read, so
    // flipping the registry def alone would have no effect here.
    return key.endsWith('.targetId') ? 'link' : 'text';
  }
  // Aestha nav (block riêng `aestha_nav`): phải chặn trước fallback
  // `ELEMENT_KIND[key] ?? isImageKey` — `navLinks` rơi về 'text' thì toolbar
  // ghi 1 string đè cả mảng.
  if (blockType === 'aestha_nav') {
    if (key === 'navLinks') return 'aesthaNavLinks';
    if (/^navLinks\[\d+\]\.(label|href)$/.test(key)) {
      return key.endsWith('.href') ? 'link' : 'text';
    }
  }
  // Aestha Explore: `projects` là mảng động (list manager) — chặn trước
  // fallback để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'aestha_explore') {
    if (key === 'projects') return 'aesthaExploreProjects';
    // List-manager mảng ảnh chi tiết của 1 dự án — chặn TRƯỚC fallback
    // `isImageKey` (khớp 'images') để không bị coi là 1 ô ảnh đơn.
    if (/^projects\[\d+\]\.detail\.images$/.test(key))
      return 'aesthaExploreProjectImages';
    if (/^projects\[\d+\]\.detail\.images\[\d+\]\.src$/.test(key))
      return 'image';
    if (/^projects\[\d+\]\.detail\.body\[\d+\]$/.test(key)) return 'text';
    if (/^projects\[\d+\]\.img$/.test(key)) return 'image';
    if (/^projects\[\d+\]\.href$/.test(key)) return 'link';
    if (/^projects\[\d+\]\.(label|alt)$/.test(key)) return 'text';
  }
  // Aestha Studio: `team` là mảng động (list manager) — chặn trước fallback để
  // toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'aestha_studio') {
    if (key === 'team') return 'aesthaStudioTeam';
    if (/^team\[\d+\]\.(name|role)$/.test(key)) return 'text';
  }
  // Aestha Contact: `socials` là mảng động (list manager) — chặn trước fallback
  // để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'aestha_contact') {
    if (key === 'socials') return 'aesthaContactSocials';
    if (/^socials\[\d+\]\.label$/.test(key)) return 'text';
    if (/^socials\[\d+\]\.href$/.test(key)) return 'link';
  }
  // Aestha Project: `body` / `images` là mảng động.
  if (blockType === 'aestha_project') {
    if (/^body\[\d+\]$/.test(key)) return 'text';
    if (/^images\[\d+\]\.src$/.test(key)) return 'image';
    if (/^images\[\d+\]\.alt$/.test(key)) return 'text';
  }
  // Delvaux product hotspots vs Mint/PNJ hero hotspots — cùng key `hotspots`.
  if (key === 'hotspots' && blockType === 'delvaux_product') {
    return 'delvauxHotspots';
  }
  if (
    /^hotspots\[\d+\]\.(title|desc|mediaUrl)$/.test(key) &&
    blockType === 'delvaux_product'
  ) {
    return key.endsWith('.mediaUrl') ? 'image' : 'text';
  }
  if (
    /^variants\[\d+\]\.(label|ref|color|imageUrl)$/.test(key) &&
    blockType === 'delvaux_variant'
  ) {
    return key.endsWith('.imageUrl') ? 'image' : 'text';
  }
  if (
    /^faqs\[\d+\]\.(question|answer)$/.test(key) &&
    blockType === 'delvaux_variant'
  ) {
    return 'text';
  }
  if (
    /^items\[\d+\]\.(question|answer)$/.test(key) &&
    blockType === 'cite_flow_faq'
  ) {
    return 'text';
  }
  if (/^listItems\[\d+\]$/.test(key) && blockType === 'cite_flow_amenity') {
    return 'text';
  }
  // Vault collection: `coins` là mảng (list manager), KHÔNG phải text.
  if (key === 'coins' && blockType === 'mint_vault_collection') {
    return 'mintVaultCoins';
  }
  // Vault: `images` là mảng string[] (list manager) — xem MINT_VAULT_IMAGE_LABEL.
  if (key === 'images' && blockType && MINT_VAULT_IMAGE_LABEL.has(blockType)) {
    return 'mintVaultImages';
  }
  // Trước isImageKey('images') — list manager, không phải 1 ô ảnh.
  if (key === 'images' && blockType === 'altura_olympus') {
    return 'alturaOlympusImages';
  }
  if (blockType === 'altura_olympus' && /^images\[\d+\]$/.test(key)) {
    return 'image';
  }
  // PureVisuals: `leftImageUrl` / `rightImageUrl` là mảng ảnh carousel của 2
  // panel — chặn trước `isImageKey` (khớp /url$/i) để toolbar mở list manager
  // thay vì ghi 1 URL đè cả mảng. Slot `leftImageUrl[0]` mới là 1 ô ảnh.
  if (blockType === 'framer_purevisuals_hero') {
    if (isFramerPurevisualsPanelKey(key)) return 'framerPurevisualsPanelImages';
    if (parseFramerPurevisualsPanelImageKey(key)) return 'image';
  }
  if (key === 'items' && blockType === 'pnj_sticky_menu') {
    return 'pnjStickyMenuItems';
  }
  if (key === 'items' && blockType === 'mintv2_services') {
    return 'mintV2ServicesItems';
  }
  if (key === 'items' && blockType === 'cool_hunter_gallery') {
    return 'coolHunterGalleryItems';
  }
  if (key === 'cardImages' && blockType === 'framer_bungee_hero_v2') {
    return 'framerBungeeHeroV2CardImages';
  }
  if (key === 'sections' && blockType === 'cool_hunter_section_progress') {
    return 'coolHunterSectionProgressItems';
  }
  if (key === 'items' && blockType === 'scroll_img_scale') {
    return 'scrollImgScaleItems';
  }
  if (key === 'cards' && blockType === 'framer_ignitex_step') {
    return 'framerIgnitexStepCards';
  }
  if (key === 'items' && blockType === 'housent_our_excellence') {
    return 'housentOurExcellenceItems';
  }
  if (key === 'items' && blockType === 'sustainit_our_expertise') {
    return 'sustainitOurExpertiseItems';
  }
  // Clarity Services: `services` là mảng động (list manager) — chặn trước
  // fallback để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'framer_clarity_services') {
    if (key === 'services') return 'framerClarityServicesItems';
    if (/^services\[\d+\]\.iconUrl$/.test(key)) return 'image';
    if (/^services\[\d+\]\.(title|description)$/.test(key)) return 'text';
  }
  // Trước ELEMENT_KIND.features → 'features' (FeatureSection shape khác).
  if (key === 'features' && blockType === 'altura_olympus') {
    return 'alturaOlympusFeatures';
  }
  if (blockType === 'altura_olympus') {
    if (/^features\[\d+\]\.(label|icon)$/.test(key)) return 'text';
  }
  if (key === 'items' && blockType === 'the_grand_service') {
    return 'theGrandServiceItems';
  }
  if (key === 'items' && blockType === 'the_grand_discover') {
    return 'theGrandDiscoverItems';
  }
  if (key === 'partners' && blockType === 'the_grand_about') {
    return 'theGrandAboutPartners';
  }
  // The Grand · Footer: `policies` / `socials` là 2 mảng động (list manager) —
  // chặn trước fallback để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'the_grand_footer') {
    if (key === 'policies') return 'theGrandFooterPolicies';
    if (key === 'socials') return 'theGrandFooterSocials';
    if (/^policies\[\d+\]\.(label|href)$/.test(key)) return 'text';
    if (/^socials\[\d+\]\.(href|label)$/.test(key)) return 'text';
  }
  if (key === 'steps' && blockType === 'mintv2_process') {
    return 'mintV2ProcessSteps';
  }
  if (key === 'items' && blockType === 'framer_darling_timeline') {
    return 'framerDarlingTimelineItems';
  }
  if (key === 'items' && blockType === 'ignitex_projects') {
    return 'ignitexProjectsItems';
  }
  if (
    /^items\[\d+\]\.imageUrl$/.test(key) &&
    blockType === 'ignitex_projects'
  ) {
    return 'image';
  }
  if (
    /^items\[\d+\]\.(name|tag)$/.test(key) &&
    blockType === 'ignitex_projects'
  ) {
    return 'text';
  }
  if (key === 'testimonials' && blockType === 'framer_perform_about') {
    return 'framerPerformTestimonials';
  }
  if (
    /^testimonials\[\d+\]\.imageUrl$/.test(key) &&
    blockType === 'framer_perform_about'
  ) {
    return 'image';
  }
  if (
    /^testimonials\[\d+\]\.(textHighlight|textRest)$/.test(key) &&
    blockType === 'framer_perform_about'
  ) {
    return 'text';
  }
  if (key === 'items' && blockType === 'framer_nftpull_timeline') {
    return 'framerNftpullTimelineItems';
  }
  if (key === 'steps' && blockType === 'framer_flat_white_process') {
    return 'framerFlatWhiteProcessSteps';
  }
  if (key === 'tiers' && blockType === 'framer_perform_pricing') {
    return 'framerPerformPricingTiers';
  }
  if (key === 'items' && blockType === 'mint_vault_craft') {
    return 'mintVaultCraftItems';
  }
  if (key === 'items' && blockType === 'linea_portfolio') {
    return 'lineaPortfolioItems';
  }
  if ((key === 'line' || key === 'dot') && blockType === 'mintv2_process') {
    return 'fill';
  }
  // Vault craft proof fields: items[0].imageUrl → image; title/description → text
  if (
    /^items\[\d+\]\.imageUrl$/.test(key) &&
    blockType === 'mint_vault_craft'
  ) {
    return 'image';
  }
  if (/^items\[\d+\]\.img$/.test(key) && blockType === 'linea_portfolio') {
    return 'image';
  }
  if (
    /^cardImages\[\d+\]\.(imageUrl|videoUrl)$/.test(key) &&
    blockType === 'framer_bungee_hero_v2'
  ) {
    return 'image';
  }
  if (
    /^items\[\d+\]\.(title|description)$/.test(key) &&
    blockType === 'mint_vault_craft'
  ) {
    return 'text';
  }
  // Nested Vault gallery slots: images[0] → image.
  if (/^images\[\d+\]$/.test(key)) return 'image';
  // Nested paragraph slots: paragraphs[0] → text (inline edit).
  if (/^paragraphs\[\d+\]$/.test(key)) return 'text';
  // Nested PNJ hero title lines: titleLines[0] → text.
  if (/^titleLines\[\d+\]$/.test(key)) return 'text';
  // Nested variant fields: variants[0].label / .desc → text; highlights[i] → text.
  if (/^variants\[\d+\]\.image$/.test(key)) return 'image';
  if (/^variants\[\d+\]\.swatch$/.test(key) && blockType === 'mint_variants') {
    return 'image';
  }
  if (/^variants\[\d+\]\.(label|desc|ref)$/.test(key)) return 'text';
  if (/^variants\[\d+\]\.highlights\[\d+\]$/.test(key)) return 'text';
  // Vault collection coin fields: coins[0].image → image; name/price/metal/weight → text
  if (/^coins\[\d+\]\.image$/.test(key)) return 'image';
  if (/^coins\[\d+\]\.(name|price|metal|weight)$/.test(key)) return 'text';
  if (/^tabs\[\d+\]\.image$/.test(key)) return 'image';
  if (/^tabs\[\d+\]\.img$/.test(key)) return 'image';
  if (/^tabs\[\d+\]\.(label|desc)$/.test(key)) return 'text';
  if (key === 'variant' && blockType === 'mint_discover') {
    return 'mintDiscoverVariant';
  }
  if (key === 'cardSurface' && blockType === 'mint_discover') {
    return 'mintDiscoverSurface';
  }
  // Real Estate banner: `stats` (mảng) là list manager, còn stats[i].label /
  // .value là 2 dòng chữ rời — chặn trước fallback để khỏi phụ thuộc việc
  // BlockDef có khai sẵn đúng số cặp hay không (user thêm/xoá được).
  if (
    /^stats\[\d+\]\.(label|value)$/.test(key) &&
    blockType === 'real_estate_hero'
  ) {
    return 'text';
  }
  // Real Estate tổng quan: mỗi hạng mục là icon (ảnh) + một dòng chữ; `stats`
  // (cả mảng) là list manager riêng — chặn TRƯỚC fallback `ELEMENT_KIND.stats`
  // ('stats' → StatsControls generic trên {value,label}[], sai shape ở đây).
  if (blockType === 'real_estate_overview') {
    if (key === 'stats') return 'realEstateOverviewStats';
    if (/^stats\[\d+\]\.text$/.test(key)) return 'text';
    if (/^stats\[\d+\]\.iconUrl$/.test(key)) return 'image';
  }
  // Real Estate điểm nổi trội: mỗi card là ảnh + số thứ tự + một dòng chữ.
  // Phải chặn TRƯỚC các fallback `items[i].*` chung ngay bên dưới.
  // The Grand · Location: mỗi địa điểm = nhãn / ảnh / mô tả / stat.
  if (blockType === 'the_grand_location') {
    if (/^items\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.(label|description|statValue|statUnit)$/.test(key)) {
      return 'text';
    }
  }
  // The Grand · Service: mỗi dịch vụ = nhãn / ảnh / mô tả.
  if (blockType === 'the_grand_service') {
    if (/^items\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.(label|description)$/.test(key)) return 'text';
  }
  // The Grand · Discover: mỗi khu vực = nhãn / ảnh; thêm ảnh nền mờ decorative.
  if (blockType === 'the_grand_discover') {
    if (key === 'backdropImage') return 'image';
    if (/^items\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.label$/.test(key)) return 'text';
  }
  // The Grand · About: kẻ ngang chỉ có màu; mỗi đối tác = logo / vai trò.
  if (blockType === 'the_grand_about') {
    if (key === 'rule') return 'fill';
    if (/^partners\[\d+\]\.logo$/.test(key)) return 'image';
    if (/^partners\[\d+\]\.role$/.test(key)) return 'text';
  }
  if (blockType === 'real_estate_highlights') {
    if (/^items\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.(number|text)$/.test(key)) return 'text';
    // Dải nền 372 phía sau — chỉ có màu, không có nội dung.
    if (key === 'contentSurface') return 'fill';
  }
  // Cool Hunter Gallery: ảnh + caption.
  if (blockType === 'cool_hunter_gallery') {
    if (/^items\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.text$/.test(key)) return 'text';
  }
  // Cool Hunter Section Progress: nhãn + data-section id.
  if (blockType === 'cool_hunter_section_progress') {
    if (/^sections\[\d+\]\.label$/.test(key)) return 'text';
    if (/^sections\[\d+\]\.sectionId$/.test(key)) return 'text';
  }
  // Scroll Img Scale: title + ảnh.
  if (blockType === 'scroll_img_scale') {
    if (/^items\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.title$/.test(key)) return 'text';
  }
  // IgniteX Step: mỗi card là title + body + ảnh minh hoạ.
  if (blockType === 'framer_ignitex_step') {
    if (/^cards\[\d+\]\.mainImageUrl$/.test(key)) return 'image';
    if (/^cards\[\d+\]\.(title|body)$/.test(key)) return 'text';
  }
  // Housent Excellence: mỗi satellite là nhãn + tên icon lucide.
  if (blockType === 'housent_our_excellence') {
    if (/^items\[\d+\]\.(label|icon)$/.test(key)) return 'text';
  }
  if (blockType === 'sustainit_our_expertise') {
    if (/^items\[\d+\]\.(imageUrl|backImageUrl)$/.test(key)) return 'image';
    if (/^items\[\d+\]\.(title|subtitle|bullets)$/.test(key)) return 'text';
  }
  // Real Estate biệt thự: mỗi slide là ảnh + tên loại hình + mô tả.
  if (blockType === 'real_estate_villa') {
    if (/^slides\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^slides\[\d+\]\.(title|description)$/.test(key)) return 'text';
    // Nền thẻ — chỉ có màu, không có nội dung.
    if (key === 'cardSurface') return 'fill';
  }
  // Masterise "Hệ tiện ích trong nhà": ảnh + alt + caption theo slide.
  if (blockType === 'masterise_home_inside') {
    if (/^slides\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^slides\[\d+\]\.(alt|caption)$/.test(key)) return 'text';
  }
  // Scroll Mattis: media + marquee + meta theo slide.
  if (blockType === 'scroll_mattis') {
    if (/^slides\[\d+\]\.url$/.test(key)) return 'image';
    if (/^slides\[\d+\]\.(bgWord|title|category1|category2|year)$/.test(key)) {
      return 'text';
    }
  }
  if (blockType === 'readymag_case_section') {
    if (/^cases\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^cases\[\d+\]\.linkHref$/.test(key)) return 'link';
    if (/^cases\[\d+\]\.(name|body|linkText)$/.test(key)) return 'text';
  }
  // Real Estate nội khu: mỗi ô là icon (ảnh) + label 2 dòng. `label` cũng trúng
  // fallback chung ngay bên dưới nên kind vẫn đúng, nhưng `iconUrl` thì không —
  // phải chặn ở đây.
  if (blockType === 'real_estate_utilities') {
    if (/^items\[\d+\]\.iconUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.label$/.test(key)) return 'text';
  }
  if (/^items\[\d+\]\.label$/.test(key)) return 'text';
  if (/^items\[\d+\]\.link$/.test(key)) return 'text';
  if (/^items\[\d+\]\.caption$/.test(key) && blockType === 'mintv2_services') {
    return 'text';
  }
  if (/^items\[\d+\]\.preview$/.test(key) && blockType === 'mintv2_services') {
    return 'image';
  }
  if (
    /^steps\[\d+\]\.(no|title|body)$/.test(key) &&
    blockType === 'mintv2_process'
  ) {
    return 'text';
  }
  if (
    /^items\[\d+\]\.(time|title|description)$/.test(key) &&
    blockType === 'framer_darling_timeline'
  ) {
    return 'text';
  }
  if (
    /^items\[\d+\]\.imageUrl$/.test(key) &&
    blockType === 'framer_darling_timeline'
  ) {
    return 'image';
  }
  if (
    /^items\[\d+\]\.(number|title|description)$/.test(key) &&
    blockType === 'framer_nftpull_timeline'
  ) {
    return 'text';
  }
  if (blockType === 'framer_flat_white_process') {
    // `steps[i].card` là khung thẻ (style-only) — phải chặn trước fallback
    // 'text', nếu không toolbar ghi 1 string vào `steps[i].card`.
    if (/^steps\[\d+\]\.card$/.test(key)) return 'fill';
    if (/^steps\[\d+\]\.(number|title|body)$/.test(key)) return 'text';
  }
  if (
    /^tiers\[\d+\]\.(price|title|features|ctaLabel)$/.test(key) &&
    blockType === 'framer_perform_pricing'
  ) {
    return 'text';
  }
  if (
    /^tiers\[\d+\]\.imageUrl$/.test(key) &&
    blockType === 'framer_perform_pricing'
  ) {
    return 'image';
  }
  if (
    /^tiers\[\d+\]\.ctaHref$/.test(key) &&
    blockType === 'framer_perform_pricing'
  ) {
    return 'link';
  }
  if ((key === 'line' || key === 'dot') && blockType === 'mintv2_process') {
    return 'fill';
  }
  if (ELEMENT_KIND[key]) return ELEMENT_KIND[key];
  // Author-time convenience: give link-shaped fields the link picker without
  // touching all ~43 registry defs that still declare them as 'text'. Typing a
  // path by hand still works, so this only changes the control shown.
  //
  // Deliberately NOT matching `*Url`: that suffix is dominated by image fields
  // (`imageUrl`, `coverUrl`, `coinUrl`, …) and `isImageKey` already claims it.
  // A CTA field named `*Url` should declare `fieldType: 'link'` in its def.
  if (isLinkKey(key)) return 'link';
  return isImageKey(key) ? 'image' : 'text';
}

export function resolveLabel(
  key: string,
  kind: ElementKind,
  blockType?: BlockType
): string {
  if (key === 'slides' && blockType === 'interactive_ad_widget') {
    return 'Slides quảng cáo';
  }
  const paraMatch = key.match(/^paragraphs\[(\d+)\]$/);
  if (paraMatch) return `Đoạn ${Number(paraMatch[1]) + 1}`;
  const titleLineMatch = key.match(/^titleLines\[(\d+)\]$/);
  if (titleLineMatch) return `Tiêu đề dòng ${Number(titleLineMatch[1]) + 1}`;
  if (key === 'variants' && blockType === 'delvaux_variant') {
    return 'Thêm / quản lý màu';
  }
  if (key === 'faqs' && blockType === 'delvaux_variant') {
    return 'Thêm / quản lý FAQ';
  }
  if (key === 'links' && blockType === 'delvaux_subnav') {
    return 'Thêm / quản lý link';
  }
  const delvauxLinkLabel = key.match(/^links\[(\d+)\]\.(label|targetId)$/);
  if (delvauxLinkLabel && blockType === 'delvaux_subnav') {
    const field = delvauxLinkLabel[2];
    return `Link ${Number(delvauxLinkLabel[1]) + 1} · ${
      field === 'label' ? 'Nhãn' : 'Section id'
    }`;
  }
  const delvauxVarLabel = key.match(
    /^variants\[(\d+)\]\.(label|ref|color|imageUrl)$/
  );
  if (delvauxVarLabel && blockType === 'delvaux_variant') {
    const field = delvauxVarLabel[2];
    const labels: Record<string, string> = {
      label: 'Nhãn',
      ref: 'REF',
      color: 'Màu',
      imageUrl: 'Ảnh',
    };
    return `Màu ${Number(delvauxVarLabel[1]) + 1} · ${labels[field] ?? field}`;
  }
  const delvauxFaqLabel = key.match(/^faqs\[(\d+)\]\.(question|answer)$/);
  if (delvauxFaqLabel && blockType === 'delvaux_variant') {
    const field = delvauxFaqLabel[2];
    return `FAQ ${Number(delvauxFaqLabel[1]) + 1} · ${
      field === 'question' ? 'Câu hỏi' : 'Trả lời'
    }`;
  }
  const citeFlowFaqLabel = key.match(/^items\[(\d+)\]\.(question|answer)$/);
  if (citeFlowFaqLabel && blockType === 'cite_flow_faq') {
    const field = citeFlowFaqLabel[2];
    return `FAQ ${Number(citeFlowFaqLabel[1]) + 1} · ${
      field === 'question' ? 'Câu hỏi' : 'Trả lời'
    }`;
  }
  const citeFlowAmenityItemLabel = key.match(/^listItems\[(\d+)\]$/);
  if (citeFlowAmenityItemLabel && blockType === 'cite_flow_amenity') {
    return `Mục ${Number(citeFlowAmenityItemLabel[1]) + 1}`;
  }
  const citeFlowHeaderSocialLabel = key.match(
    /^socialLinks\[(\d+)\]\.(label|href)$/
  );
  if (citeFlowHeaderSocialLabel && blockType === 'cite_flow_header') {
    const field = citeFlowHeaderSocialLabel[2];
    return `Social ${Number(citeFlowHeaderSocialLabel[1]) + 1} · ${
      field === 'label' ? 'Nhãn' : 'Link'
    }`;
  }
  const variantLabel = key.match(/^variants\[(\d+)\]\.label$/);
  if (variantLabel) {
    const n = Number(variantLabel[1]) + 1;
    return blockType === 'mint_variants'
      ? `Biến thể ${n} · Nhãn`
      : `Nhãn góc ${n}`;
  }
  const variantSwatch = key.match(/^variants\[(\d+)\]\.swatch$/);
  if (variantSwatch && blockType === 'mint_variants') {
    return `Biến thể ${Number(variantSwatch[1]) + 1} · Swatch`;
  }
  const variantDesc = key.match(/^variants\[(\d+)\]\.desc$/);
  if (variantDesc) return `Mô tả góc ${Number(variantDesc[1]) + 1}`;
  const variantImg = key.match(/^variants\[(\d+)\]\.image$/);
  if (variantImg) {
    const n = Number(variantImg[1]) + 1;
    return blockType === 'mint_variants'
      ? `Biến thể ${n} · Ảnh`
      : `Ảnh góc ${n}`;
  }
  const variantRef = key.match(/^variants\[(\d+)\]\.ref$/);
  if (variantRef && blockType === 'mint_variants') {
    return `Biến thể ${Number(variantRef[1]) + 1} · REF`;
  }
  const variantHl = key.match(/^variants\[(\d+)\]\.highlights$/);
  if (variantHl) return `Highlights góc ${Number(variantHl[1]) + 1}`;
  if (key === 'variants' && blockType === 'pnj_variant') return 'Góc nhìn';
  if (key === 'variants' && blockType === 'mint_variants') {
    return 'Thêm / quản lý biến thể';
  }
  if (key === 'hotspots' && blockType === 'delvaux_product') {
    return 'Thêm / quản lý hotspot';
  }
  const delvauxHsLabel = key.match(
    /^hotspots\[(\d+)\]\.(title|desc|mediaUrl)$/
  );
  if (delvauxHsLabel && blockType === 'delvaux_product') {
    const field = delvauxHsLabel[2];
    const labels: Record<string, string> = {
      title: 'Tiêu đề',
      desc: 'Mô tả',
      mediaUrl: 'Media',
    };
    return `Hotspot ${Number(delvauxHsLabel[1]) + 1} · ${labels[field] ?? field}`;
  }
  if (key === 'coins' && blockType === 'mint_vault_collection') {
    return 'Bộ sưu tập coin';
  }
  const galleryImg = key.match(/^images\[(\d+)\]$/);
  if (galleryImg) return `Ảnh ${Number(galleryImg[1]) + 1}`;
  if (key === 'images' && blockType && MINT_VAULT_IMAGE_LABEL.has(blockType)) {
    return MINT_VAULT_IMAGE_LABEL.get(blockType)!;
  }
  if (key === 'images' && blockType === 'altura_olympus') {
    return 'Thêm / quản lý ảnh';
  }
  const reStat = key.match(/^stats\[(\d+)\]\.(label|value)$/);
  if (reStat && blockType === 'real_estate_hero') {
    return `Thông số ${Number(reStat[1]) + 1} · ${
      reStat[2] === 'label' ? 'Nhãn' : 'Giá trị'
    }`;
  }
  const reOverview = key.match(/^stats\[(\d+)\]\.(text|iconUrl)$/);
  if (reOverview && blockType === 'real_estate_overview') {
    return `Hạng mục ${Number(reOverview[1]) + 1} · ${
      reOverview[2] === 'text' ? 'Nội dung' : 'Icon'
    }`;
  }
  // Trước ELEMENT_LABEL.stats ('Thống kê') — đây là list manager, không phải
  // một ô nội dung.
  if (key === 'stats' && blockType === 'real_estate_overview') {
    return 'Thêm / quản lý hạng mục';
  }
  const reHighlight = key.match(/^items\[(\d+)\]\.(number|text|imageUrl)$/);
  if (reHighlight && blockType === 'real_estate_highlights') {
    const labels: Record<string, string> = {
      number: 'Số thứ tự',
      text: 'Nội dung',
      imageUrl: 'Ảnh',
    };
    return `Điểm nổi trội ${Number(reHighlight[1]) + 1} · ${labels[reHighlight[2]]}`;
  }
  if (key === 'contentSurface' && blockType === 'real_estate_highlights') {
    return 'Nền cột nội dung';
  }
  const reVilla = key.match(/^slides\[(\d+)\]\.(title|description|imageUrl)$/);
  if (reVilla && blockType === 'real_estate_villa') {
    const labels: Record<string, string> = {
      title: 'Tên loại hình',
      description: 'Mô tả',
      imageUrl: 'Ảnh',
    };
    return `Slide ${Number(reVilla[1]) + 1} · ${labels[reVilla[2]]}`;
  }
  if (key === 'cardSurface' && blockType === 'real_estate_villa') {
    return 'Nền thẻ';
  }
  const reMattis = key.match(
    /^slides\[(\d+)\]\.(url|bgWord|title|category1|category2|year)$/
  );
  if (reMattis && blockType === 'scroll_mattis') {
    const labels: Record<string, string> = {
      url: 'media',
      bgWord: 'chữ chạy',
      title: 'title',
      category1: 'category 1',
      category2: 'category 2',
      year: 'năm',
    };
    return `Slide ${Number(reMattis[1]) + 1} · ${labels[reMattis[2]]}`;
  }
  if (key === 'slides' && blockType === 'scroll_mattis') {
    return 'Thêm / quản lý slide';
  }
  const reReadymagCase = key.match(
    /^cases\[(\d+)\]\.(imageUrl|name|body|linkText|linkHref)$/
  );
  if (reReadymagCase && blockType === 'readymag_case_section') {
    const labels: Record<string, string> = {
      imageUrl: 'ảnh',
      name: 'tên',
      body: 'mô tả',
      linkText: 'link text',
      linkHref: 'link URL',
    };
    return `Case ${Number(reReadymagCase[1]) + 1} · ${labels[reReadymagCase[2]]}`;
  }
  if (key === 'cases' && blockType === 'readymag_case_section') {
    return 'Thêm / quản lý case';
  }
  const reMasterise = key.match(/^slides\[(\d+)\]\.(imageUrl|alt|caption)$/);
  if (reMasterise && blockType === 'masterise_home_inside') {
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      alt: 'Alt',
      caption: 'Caption',
    };
    return `Slide ${Number(reMasterise[1]) + 1} · ${labels[reMasterise[2]]}`;
  }
  if (key === 'slides' && blockType === 'masterise_home_inside') {
    return 'Thêm / quản lý slide';
  }
  // Phải đứng TRƯỚC `navLabel` bên dưới — nếu không `items[i].label` của nội
  // khu sẽ nhận nhãn chung "Nhãn mục N".
  const reUtility = key.match(/^items\[(\d+)\]\.(label|iconUrl)$/);
  if (reUtility && blockType === 'real_estate_utilities') {
    return `Tiện ích ${Number(reUtility[1]) + 1} · ${
      reUtility[2] === 'label' ? 'Nội dung' : 'Icon'
    }`;
  }
  const grandLoc = key.match(
    /^items\[(\d+)\]\.(label|imageUrl|description|statValue|statUnit)$/
  );
  if (grandLoc && blockType === 'the_grand_location') {
    const labels: Record<string, string> = {
      label: 'Nhãn',
      imageUrl: 'Ảnh',
      description: 'Mô tả',
      statValue: 'Số liệu',
      statUnit: 'Đơn vị',
    };
    return `Địa điểm ${Number(grandLoc[1]) + 1} · ${labels[grandLoc[2]] ?? grandLoc[2]}`;
  }
  const clarityFieldLabel = key.match(
    /^services\[(\d+)\]\.(title|description|iconUrl)$/
  );
  if (clarityFieldLabel && blockType === 'framer_clarity_services') {
    const labels: Record<string, string> = {
      title: 'Tiêu đề',
      description: 'Mô tả',
      iconUrl: 'Icon',
    };
    return `Dịch vụ ${Number(clarityFieldLabel[1]) + 1} · ${
      labels[clarityFieldLabel[2]] ?? clarityFieldLabel[2]
    }`;
  }
  const grandSvc = key.match(/^items\[(\d+)\]\.(label|imageUrl|description)$/);
  if (grandSvc && blockType === 'the_grand_service') {
    const labels: Record<string, string> = {
      label: 'Nhãn',
      imageUrl: 'Ảnh',
      description: 'Mô tả',
    };
    return `Dịch vụ ${Number(grandSvc[1]) + 1} · ${labels[grandSvc[2]] ?? grandSvc[2]}`;
  }
  const grandDisc = key.match(/^items\[(\d+)\]\.(label|imageUrl)$/);
  if (grandDisc && blockType === 'the_grand_discover') {
    const labels: Record<string, string> = { label: 'Nhãn', imageUrl: 'Ảnh' };
    return `Khu vực ${Number(grandDisc[1]) + 1} · ${labels[grandDisc[2]] ?? grandDisc[2]}`;
  }
  const grandPartner = key.match(/^partners\[(\d+)\]\.(logo|role)$/);
  if (grandPartner && blockType === 'the_grand_about') {
    const labels: Record<string, string> = { logo: 'Logo', role: 'Vai trò' };
    return `Đối tác ${Number(grandPartner[1]) + 1} · ${labels[grandPartner[2]] ?? grandPartner[2]}`;
  }
  if (blockType === 'the_grand_footer') {
    const grandPolicy = key.match(/^policies\[(\d+)\]\.(label|href)$/);
    if (grandPolicy) {
      return `Chính sách ${Number(grandPolicy[1]) + 1} · ${
        grandPolicy[2] === 'label' ? 'Nhãn' : 'Link'
      }`;
    }
    const grandSocial = key.match(/^socials\[(\d+)\]\.(href|label)$/);
    if (grandSocial) {
      return `Social ${Number(grandSocial[1]) + 1} · ${
        grandSocial[2] === 'href' ? 'Link' : 'Nhãn trợ năng'
      }`;
    }
  }
  const navLabel = key.match(/^items\[(\d+)\]\.label$/);
  if (navLabel && blockType === 'mintv2_services') {
    return `Mục ${Number(navLabel[1]) + 1} · Nhãn`;
  }
  // Trước fallback `Nhãn mục N` — Housent hiển thị cặp Nhãn / Icon.
  const housentItem = key.match(/^items\[(\d+)\]\.(label|icon)$/);
  if (housentItem && blockType === 'housent_our_excellence') {
    return `Mục ${Number(housentItem[1]) + 1} · ${
      housentItem[2] === 'label' ? 'Nhãn' : 'Icon'
    }`;
  }
  if (navLabel) return `Nhãn mục ${Number(navLabel[1]) + 1}`;
  const navLink = key.match(/^items\[(\d+)\]\.link$/);
  if (navLink) return `Link mục ${Number(navLink[1]) + 1}`;
  const svcCaption = key.match(/^items\[(\d+)\]\.caption$/);
  if (svcCaption && blockType === 'mintv2_services') {
    return `Mục ${Number(svcCaption[1]) + 1} · Caption`;
  }
  const svcPreview = key.match(/^items\[(\d+)\]\.preview$/);
  if (svcPreview && blockType === 'mintv2_services') {
    return `Mục ${Number(svcPreview[1]) + 1} · Ảnh preview`;
  }
  if (key === 'items' && blockType === 'pnj_sticky_menu') return 'Menu items';
  if (key === 'items' && blockType === 'mintv2_services') {
    return 'Thêm / quản lý mục';
  }
  if (key === 'items' && blockType === 'cool_hunter_gallery') {
    return 'Thêm / quản lý ảnh';
  }
  if (key === 'cardImages' && blockType === 'framer_bungee_hero_v2') {
    return 'Thêm / quản lý ảnh';
  }
  if (key === 'sections' && blockType === 'cool_hunter_section_progress') {
    return 'Thêm / quản lý section';
  }
  if (key === 'items' && blockType === 'scroll_img_scale') {
    return 'Thêm / quản lý mục';
  }
  if (key === 'features' && blockType === 'altura_olympus') {
    return 'Thêm / quản lý features';
  }
  const reAlturaFeat = key.match(/^features\[(\d+)\]\.(label|icon)$/);
  if (reAlturaFeat && blockType === 'altura_olympus') {
    return `Feature ${Number(reAlturaFeat[1]) + 1} · ${
      reAlturaFeat[2] === 'label' ? 'Nhãn' : 'Icon'
    }`;
  }
  const reGallery = key.match(/^items\[(\d+)\]\.(imageUrl|text)$/);
  if (reGallery && blockType === 'cool_hunter_gallery') {
    return `Ảnh ${Number(reGallery[1]) + 1} · ${
      reGallery[2] === 'imageUrl' ? 'Ảnh' : 'Caption'
    }`;
  }
  const reBungeeCard = key.match(/^cardImages\[(\d+)\]\.(imageUrl|videoUrl)$/);
  if (reBungeeCard && blockType === 'framer_bungee_hero_v2') {
    return `Thẻ ${Number(reBungeeCard[1]) + 1} · ${
      reBungeeCard[2] === 'imageUrl' ? 'Ảnh' : 'Video'
    }`;
  }
  const reSectionProgress = key.match(/^sections\[(\d+)\]\.(label|sectionId)$/);
  if (reSectionProgress && blockType === 'cool_hunter_section_progress') {
    return `Section ${Number(reSectionProgress[1]) + 1} · ${
      reSectionProgress[2] === 'label' ? 'Nhãn' : 'data-section id'
    }`;
  }
  const reScrollImg = key.match(/^items\[(\d+)\]\.(imageUrl|title)$/);
  if (reScrollImg && blockType === 'scroll_img_scale') {
    return `Mục ${Number(reScrollImg[1]) + 1} · ${
      reScrollImg[2] === 'imageUrl' ? 'Ảnh' : 'Tiêu đề'
    }`;
  }
  const reIgnitexCard = key.match(
    /^cards\[(\d+)\]\.(title|body|mainImageUrl)$/
  );
  if (reIgnitexCard && blockType === 'framer_ignitex_step') {
    const labels: Record<string, string> = {
      title: 'title',
      body: 'body',
      mainImageUrl: 'ảnh',
    };
    return `Card ${Number(reIgnitexCard[1]) + 1} · ${labels[reIgnitexCard[2]]}`;
  }
  if (key === 'cards' && blockType === 'framer_ignitex_step') {
    return 'Thêm / quản lý card';
  }
  if (key === 'items' && blockType === 'housent_our_excellence') {
    return 'Thêm / quản lý mục';
  }
  const reSustainitItem = key.match(
    /^items\[(\d+)\]\.(imageUrl|backImageUrl|title|subtitle|bullets)$/
  );
  if (reSustainitItem && blockType === 'sustainit_our_expertise') {
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh trước',
      backImageUrl: 'Ảnh sau (blur)',
      title: 'Tiêu đề',
      subtitle: 'Phụ đề',
      bullets: 'Bullets',
    };
    return `Item ${Number(reSustainitItem[1]) + 1} · ${labels[reSustainitItem[2]]}`;
  }
  if (key === 'items' && blockType === 'sustainit_our_expertise') {
    return 'Thêm / quản lý mục';
  }
  const stepField = key.match(/^steps\[(\d+)\]\.(no|title|body)$/);
  if (stepField && blockType === 'mintv2_process') {
    const labels: Record<string, string> = {
      no: 'Số bước',
      title: 'Tiêu đề',
      body: 'Mô tả',
    };
    return `Bước ${Number(stepField[1]) + 1} · ${labels[stepField[2]] ?? stepField[2]}`;
  }
  if (key === 'steps' && blockType === 'mintv2_process') {
    return 'Thêm / quản lý bước';
  }
  const darlingField = key.match(
    /^items\[(\d+)\]\.(time|title|description|imageUrl)$/
  );
  if (darlingField && blockType === 'framer_darling_timeline') {
    const labels: Record<string, string> = {
      time: 'Giờ',
      title: 'Tiêu đề',
      description: 'Mô tả',
      imageUrl: 'Ảnh',
    };
    return `Mốc ${Number(darlingField[1]) + 1} · ${labels[darlingField[2]] ?? darlingField[2]}`;
  }
  if (key === 'items' && blockType === 'framer_darling_timeline') {
    return 'Thêm / quản lý mốc';
  }
  const nftpullField = key.match(
    /^items\[(\d+)\]\.(number|title|description)$/
  );
  if (nftpullField && blockType === 'framer_nftpull_timeline') {
    const labels: Record<string, string> = {
      number: 'Số thứ tự',
      title: 'Tiêu đề',
      description: 'Mô tả',
    };
    return `Mục ${Number(nftpullField[1]) + 1} · ${labels[nftpullField[2]] ?? nftpullField[2]}`;
  }
  if (key === 'items' && blockType === 'framer_nftpull_timeline') {
    return 'Thêm / quản lý mục';
  }
  const tierField = key.match(
    /^tiers\[(\d+)\]\.(imageUrl|price|title|features|ctaLabel|ctaHref)$/
  );
  if (tierField && blockType === 'framer_perform_pricing') {
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      price: 'Giá',
      title: 'Tên gói',
      features: 'Tính năng',
      ctaLabel: 'CTA — Chữ',
      ctaHref: 'CTA — Link',
    };
    return `Gói ${Number(tierField[1]) + 1} · ${labels[tierField[2]] ?? tierField[2]}`;
  }
  if (key === 'tiers' && blockType === 'framer_perform_pricing') {
    return 'Thêm / quản lý gói';
  }
  const testimonialField = key.match(
    /^testimonials\[(\d+)\]\.(imageUrl|textHighlight|textRest)$/
  );
  if (testimonialField && blockType === 'framer_perform_about') {
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      textHighlight: 'Highlight',
      textRest: 'Nội dung',
    };
    return `Card ${Number(testimonialField[1]) + 1} · ${labels[testimonialField[2]] ?? testimonialField[2]}`;
  }
  if (key === 'testimonials' && blockType === 'framer_perform_about') {
    return 'Thêm / quản lý card';
  }
  const ignitexProjectLabel = key.match(
    /^items\[(\d+)\]\.(imageUrl|name|tag)$/
  );
  if (ignitexProjectLabel && blockType === 'ignitex_projects') {
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      name: 'Tên',
      tag: 'Tag',
    };
    return `Project ${Number(ignitexProjectLabel[1]) + 1} · ${labels[ignitexProjectLabel[2]] ?? ignitexProjectLabel[2]}`;
  }
  if (key === 'items' && blockType === 'ignitex_projects') {
    return 'Thêm / quản lý project';
  }
  const tabLabel = key.match(/^tabs\[(\d+)\]\.label$/);
  if (tabLabel) return `Hotspot ${Number(tabLabel[1]) + 1} · tiêu đề`;
  const tabDesc = key.match(/^tabs\[(\d+)\]\.desc$/);
  if (tabDesc) return `Hotspot ${Number(tabDesc[1]) + 1} · mô tả`;
  const tabImg = key.match(/^tabs\[(\d+)\]\.img$/);
  if (tabImg) return `Hotspot ${Number(tabImg[1]) + 1} · ảnh drawer`;
  if (key === 'variant' && blockType === 'mint_discover')
    return 'Theme variant';
  if (key === 'cardSurface' && blockType === 'mint_discover') {
    return 'Thẻ info (nền)';
  }
  const fromDef = blockType
    ? getBlockDef(blockType)?.elements.find(e => e.key === key)?.label
    : undefined;
  if (fromDef) return fromDef;
  if (ELEMENT_LABEL[key]) return ELEMENT_LABEL[key];
  if (kind === 'image') {
    const n = key.match(/(\d+)/)?.[1];
    return n ? `Ảnh ${n}` : 'Ảnh';
  }
  return key;
}

export interface ResolvedElementMeta {
  kind: ElementKind;
  fieldType: LayerElement['fieldType'] | undefined;
  label: string;
}

export function resolveElementMeta(
  blockType: BlockType,
  key: string
): ResolvedElementMeta {
  if (/^paragraphs\[\d+\]$/.test(key)) {
    const n = Number(key.match(/^paragraphs\[(\d+)\]$/)?.[1] ?? 0);
    return {
      kind: 'text',
      fieldType: 'textarea',
      label: `Đoạn ${n + 1}`,
    };
  }
  if (/^titleLines\[\d+\]$/.test(key)) {
    const n = Number(key.match(/^titleLines\[(\d+)\]$/)?.[1] ?? 0);
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Tiêu đề dòng ${n + 1}`,
    };
  }
  const galleryImg = key.match(/^images\[(\d+)\]$/);
  if (galleryImg) {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Ảnh ${Number(galleryImg[1]) + 1}`,
    };
  }
  if (key === 'images' && MINT_VAULT_IMAGE_LABEL.has(blockType)) {
    return {
      kind: 'mintVaultImages',
      fieldType: undefined,
      label: MINT_VAULT_IMAGE_LABEL.get(blockType)!,
    };
  }
  if (key === 'images' && blockType === 'altura_olympus') {
    return {
      kind: 'alturaOlympusImages',
      fieldType: undefined,
      label: 'Thêm / quản lý ảnh',
    };
  }
  if (blockType === 'framer_purevisuals_hero') {
    if (isFramerPurevisualsPanelKey(key)) {
      return {
        kind: 'framerPurevisualsPanelImages',
        fieldType: undefined,
        label: FRAMER_PUREVISUALS_PANEL_LABEL[key],
      };
    }
    const panelImg = parseFramerPurevisualsPanelImageKey(key);
    if (panelImg) {
      return {
        kind: 'image',
        fieldType: 'image',
        label: `${FRAMER_PUREVISUALS_PANEL_LABEL[panelImg.panel]} ${panelImg.index + 1}`,
      };
    }
  }
  const vImg = key.match(/^variants\[(\d+)\]\.image$/);
  if (vImg && blockType === 'pnj_variant') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Ảnh góc ${Number(vImg[1]) + 1}`,
    };
  }
  const coinImg = key.match(/^coins\[(\d+)\]\.image$/);
  if (coinImg && blockType === 'mint_vault_collection') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Ảnh coin ${Number(coinImg[1]) + 1}`,
    };
  }
  const coinText = key.match(/^coins\[(\d+)\]\.(name|price|metal|weight)$/);
  if (coinText && blockType === 'mint_vault_collection') {
    const labels: Record<string, string> = {
      name: 'Tên',
      price: 'Giá',
      metal: 'Kim loại',
      weight: 'Trọng lượng',
    };
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Coin ${Number(coinText[1]) + 1} · ${labels[coinText[2]] ?? coinText[2]}`,
    };
  }
  const grandLocMeta = key.match(
    /^items\[(\d+)\]\.(label|imageUrl|description|statValue|statUnit)$/
  );
  if (grandLocMeta && blockType === 'the_grand_location') {
    const field = grandLocMeta[2];
    const labels: Record<string, string> = {
      label: 'Nhãn',
      imageUrl: 'Ảnh',
      description: 'Mô tả',
      statValue: 'Số liệu',
      statUnit: 'Đơn vị',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType:
        field === 'imageUrl'
          ? 'image'
          : field === 'description'
            ? 'textarea'
            : 'text',
      label: `Địa điểm ${Number(grandLocMeta[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const clarityFieldMeta = key.match(
    /^services\[(\d+)\]\.(title|description|iconUrl)$/
  );
  if (clarityFieldMeta && blockType === 'framer_clarity_services') {
    const field = clarityFieldMeta[2];
    const labels: Record<string, string> = {
      title: 'Tiêu đề',
      description: 'Mô tả',
      iconUrl: 'Icon',
    };
    return {
      kind: field === 'iconUrl' ? 'image' : 'text',
      fieldType:
        field === 'iconUrl'
          ? 'image'
          : field === 'description'
            ? 'textarea'
            : 'text',
      label: `Dịch vụ ${Number(clarityFieldMeta[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const grandSvcMeta = key.match(
    /^items\[(\d+)\]\.(label|imageUrl|description)$/
  );
  if (grandSvcMeta && blockType === 'the_grand_service') {
    const field = grandSvcMeta[2];
    const labels: Record<string, string> = {
      label: 'Nhãn',
      imageUrl: 'Ảnh',
      description: 'Mô tả',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType:
        field === 'imageUrl'
          ? 'image'
          : field === 'description'
            ? 'textarea'
            : 'text',
      label: `Dịch vụ ${Number(grandSvcMeta[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (blockType === 'the_grand_discover' && key === 'backdropImage') {
    return { kind: 'image', fieldType: 'image', label: 'Ảnh nền mờ' };
  }
  const grandDiscMeta = key.match(/^items\[(\d+)\]\.(label|imageUrl)$/);
  if (grandDiscMeta && blockType === 'the_grand_discover') {
    const field = grandDiscMeta[2];
    const labels: Record<string, string> = { label: 'Nhãn', imageUrl: 'Ảnh' };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType: field === 'imageUrl' ? 'image' : 'text',
      label: `Khu vực ${Number(grandDiscMeta[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const grandPartnerMeta = key.match(/^partners\[(\d+)\]\.(logo|role)$/);
  if (grandPartnerMeta && blockType === 'the_grand_about') {
    const field = grandPartnerMeta[2];
    const labels: Record<string, string> = { logo: 'Logo', role: 'Vai trò' };
    return {
      kind: field === 'logo' ? 'image' : 'text',
      fieldType: field === 'logo' ? 'image' : 'text',
      label: `Đối tác ${Number(grandPartnerMeta[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (blockType === 'the_grand_footer') {
    const policyMeta = key.match(/^policies\[(\d+)\]\.(label|href)$/);
    if (policyMeta) {
      return {
        kind: 'text',
        fieldType: 'text',
        label: `Chính sách ${Number(policyMeta[1]) + 1} · ${
          policyMeta[2] === 'label' ? 'Nhãn' : 'Link'
        }`,
      };
    }
    const socialMeta = key.match(/^socials\[(\d+)\]\.(href|label)$/);
    if (socialMeta) {
      return {
        kind: 'text',
        fieldType: 'text',
        label: `Social ${Number(socialMeta[1]) + 1} · ${
          socialMeta[2] === 'href' ? 'Link' : 'Nhãn trợ năng'
        }`,
      };
    }
  }
  const craftImg = key.match(/^items\[(\d+)\]\.imageUrl$/);
  if (craftImg && blockType === 'mint_vault_craft') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Mục ${Number(craftImg[1]) + 1} · Ảnh`,
    };
  }
  const lineaImg = key.match(/^items\[(\d+)\]\.img$/);
  if (lineaImg && blockType === 'linea_portfolio') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Ảnh ${Number(lineaImg[1]) + 1}`,
    };
  }
  const craftText = key.match(/^items\[(\d+)\]\.(title|description)$/);
  if (craftText && blockType === 'mint_vault_craft') {
    const field = craftText[2];
    return {
      kind: 'text',
      fieldType: field === 'description' ? 'textarea' : 'text',
      label: `Mục ${Number(craftText[1]) + 1} · ${field === 'description' ? 'Mô tả' : 'Tiêu đề'}`,
    };
  }
  if (key === 'items' && blockType === 'mint_vault_craft') {
    return {
      kind: 'mintVaultCraftItems',
      fieldType: undefined,
      label: 'Thêm / quản lý mục',
    };
  }
  if (key === 'items' && blockType === 'linea_portfolio') {
    return {
      kind: 'lineaPortfolioItems',
      fieldType: undefined,
      label: 'Thêm / quản lý ảnh',
    };
  }
  const vLabel = key.match(/^variants\[(\d+)\]\.label$/);
  if (vLabel && blockType === 'pnj_variant') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Nhãn góc ${Number(vLabel[1]) + 1}`,
    };
  }
  const vDesc = key.match(/^variants\[(\d+)\]\.desc$/);
  if (vDesc && blockType === 'pnj_variant') {
    return {
      kind: 'text',
      fieldType: 'textarea',
      label: `Mô tả góc ${Number(vDesc[1]) + 1}`,
    };
  }
  const vHl = key.match(/^variants\[(\d+)\]\.highlights$/);
  if (vHl && blockType === 'pnj_variant') {
    return {
      kind: 'pnjVariantHighlights',
      fieldType: undefined,
      label: `Highlights góc ${Number(vHl[1]) + 1}`,
    };
  }
  const vHlItem = key.match(/^variants\[(\d+)\]\.highlights\[(\d+)\]$/);
  if (vHlItem && blockType === 'pnj_variant') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Highlight ${Number(vHlItem[2]) + 1} · góc ${Number(vHlItem[1]) + 1}`,
    };
  }
  const navLabel = key.match(/^items\[(\d+)\]\.label$/);
  if (navLabel && blockType === 'pnj_sticky_menu') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Nhãn mục ${Number(navLabel[1]) + 1}`,
    };
  }
  const navLink = key.match(/^items\[(\d+)\]\.link$/);
  if (navLink && blockType === 'pnj_sticky_menu') {
    return {
      kind: 'link',
      fieldType: 'link',
      label: `Link mục ${Number(navLink[1]) + 1}`,
    };
  }
  const tabLabel = key.match(/^tabs\[(\d+)\]\.label$/);
  if (tabLabel && blockType === 'mint_discover') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Hotspot ${Number(tabLabel[1]) + 1} · tiêu đề`,
    };
  }
  const tabDesc = key.match(/^tabs\[(\d+)\]\.desc$/);
  if (tabDesc && blockType === 'mint_discover') {
    return {
      kind: 'text',
      fieldType: 'textarea',
      label: `Hotspot ${Number(tabDesc[1]) + 1} · mô tả`,
    };
  }
  const tabImg = key.match(/^tabs\[(\d+)\]\.img$/);
  if (tabImg && blockType === 'mint_discover') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Hotspot ${Number(tabImg[1]) + 1} · ảnh drawer`,
    };
  }
  const reStatField = key.match(/^stats\[(\d+)\]\.(label|value)$/);
  if (reStatField && blockType === 'real_estate_hero') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Thông số ${Number(reStatField[1]) + 1} · ${
        reStatField[2] === 'label' ? 'Nhãn' : 'Giá trị'
      }`,
    };
  }
  const reOverviewField = key.match(/^stats\[(\d+)\]\.(text|iconUrl)$/);
  if (reOverviewField && blockType === 'real_estate_overview') {
    const isText = reOverviewField[2] === 'text';
    return {
      kind: isText ? 'text' : 'image',
      // Chữ có ngắt dòng thủ công `\n` → textarea, không phải input 1 dòng.
      fieldType: isText ? 'textarea' : 'image',
      label: `Hạng mục ${Number(reOverviewField[1]) + 1} · ${
        isText ? 'Nội dung' : 'Icon'
      }`,
    };
  }
  if (key === 'stats' && blockType === 'real_estate_overview') {
    return {
      kind: 'realEstateOverviewStats',
      fieldType: undefined,
      label: 'Thêm / quản lý hạng mục',
    };
  }
  const reHighlightField = key.match(
    /^items\[(\d+)\]\.(number|text|imageUrl)$/
  );
  if (reHighlightField && blockType === 'real_estate_highlights') {
    const field = reHighlightField[2];
    const labels: Record<string, string> = {
      number: 'Số thứ tự',
      text: 'Nội dung',
      imageUrl: 'Ảnh',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      // Chữ trong card dài và hay xuống dòng → textarea; số thì 1 dòng.
      fieldType:
        field === 'imageUrl' ? 'image' : field === 'text' ? 'textarea' : 'text',
      label: `Điểm nổi trội ${Number(reHighlightField[1]) + 1} · ${labels[field]}`,
    };
  }
  if (key === 'contentSurface' && blockType === 'real_estate_highlights') {
    // Style-only như `line`/`dot` của mintv2_process → không có fieldType.
    return { kind: 'fill', fieldType: undefined, label: 'Nền cột nội dung' };
  }
  const reVillaField = key.match(
    /^slides\[(\d+)\]\.(title|description|imageUrl)$/
  );
  if (reVillaField && blockType === 'real_estate_villa') {
    const field = reVillaField[2];
    const labels: Record<string, string> = {
      title: 'Tên loại hình',
      description: 'Mô tả',
      imageUrl: 'Ảnh',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      // Mô tả slide dài nhiều dòng → textarea; tên loại hình 1 dòng.
      fieldType:
        field === 'imageUrl'
          ? 'image'
          : field === 'description'
            ? 'textarea'
            : 'text',
      label: `Slide ${Number(reVillaField[1]) + 1} · ${labels[field]}`,
    };
  }
  if (key === 'cardSurface' && blockType === 'real_estate_villa') {
    // Style-only như `contentSurface` của real_estate_highlights → no fieldType.
    return { kind: 'fill', fieldType: undefined, label: 'Nền thẻ' };
  }
  const reMattisField = key.match(
    /^slides\[(\d+)\]\.(url|bgWord|title|category1|category2|year)$/
  );
  if (reMattisField && blockType === 'scroll_mattis') {
    const field = reMattisField[2];
    const labels: Record<string, string> = {
      url: 'media',
      bgWord: 'chữ chạy',
      title: 'title',
      category1: 'category 1',
      category2: 'category 2',
      year: 'năm',
    };
    return {
      kind: field === 'url' ? 'image' : 'text',
      fieldType: field === 'url' ? 'image' : 'text',
      label: `Slide ${Number(reMattisField[1]) + 1} · ${labels[field]}`,
    };
  }
  if (key === 'slides' && blockType === 'scroll_mattis') {
    return {
      kind: 'scrollMattisSlides',
      fieldType: undefined,
      label: 'Thêm / quản lý slide',
    };
  }
  if (key === 'cases' && blockType === 'readymag_case_section') {
    return {
      kind: 'readymagCaseSectionItems',
      fieldType: undefined,
      label: 'Thêm / quản lý case',
    };
  }
  const reReadymagCaseField = key.match(
    /^cases\[(\d+)\]\.(imageUrl|name|body|linkText|linkHref)$/
  );
  if (reReadymagCaseField && blockType === 'readymag_case_section') {
    const field = reReadymagCaseField[2];
    const labels: Record<string, string> = {
      imageUrl: 'ảnh',
      name: 'tên',
      body: 'mô tả',
      linkText: 'link text',
      linkHref: 'link URL',
    };
    return {
      kind:
        field === 'imageUrl' ? 'image' : field === 'linkHref' ? 'link' : 'text',
      fieldType:
        field === 'imageUrl'
          ? 'image'
          : field === 'linkHref'
            ? 'link'
            : field === 'body'
              ? 'textarea'
              : 'text',
      label: `Case ${Number(reReadymagCaseField[1]) + 1} · ${labels[field]}`,
    };
  }
  const reMasteriseField = key.match(
    /^slides\[(\d+)\]\.(imageUrl|alt|caption)$/
  );
  if (reMasteriseField && blockType === 'masterise_home_inside') {
    const field = reMasteriseField[2];
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      alt: 'Alt',
      caption: 'Caption',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType: field === 'imageUrl' ? 'image' : 'text',
      label: `Slide ${Number(reMasteriseField[1]) + 1} · ${labels[field]}`,
    };
  }
  if (key === 'slides' && blockType === 'masterise_home_inside') {
    return {
      kind: 'masteriseSlides',
      fieldType: undefined,
      label: 'Thêm / quản lý slide',
    };
  }
  const reUtilityField = key.match(/^items\[(\d+)\]\.(label|iconUrl)$/);
  if (reUtilityField && blockType === 'real_estate_utilities') {
    const isLabel = reUtilityField[2] === 'label';
    return {
      kind: isLabel ? 'text' : 'image',
      // Label có ngắt dòng thủ công `\n` → textarea, không phải input 1 dòng.
      fieldType: isLabel ? 'textarea' : 'image',
      label: `Tiện ích ${Number(reUtilityField[1]) + 1} · ${
        isLabel ? 'Nội dung' : 'Icon'
      }`,
    };
  }
  const svcText = key.match(/^items\[(\d+)\]\.(label|caption)$/);
  if (svcText && blockType === 'mintv2_services') {
    const field = svcText[2];
    const labels: Record<string, string> = {
      label: 'Nhãn',
      caption: 'Caption',
    };
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Mục ${Number(svcText[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const svcPreview = key.match(/^items\[(\d+)\]\.preview$/);
  if (svcPreview && blockType === 'mintv2_services') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Mục ${Number(svcPreview[1]) + 1} · Ảnh preview`,
    };
  }
  const processStep = key.match(/^steps\[(\d+)\]\.(no|title|body)$/);
  if (processStep && blockType === 'mintv2_process') {
    const field = processStep[2];
    const labels: Record<string, string> = {
      no: 'Số bước',
      title: 'Tiêu đề',
      body: 'Mô tả',
    };
    return {
      kind: 'text',
      fieldType: field === 'body' ? 'textarea' : 'text',
      label: `Bước ${Number(processStep[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (key === 'steps' && blockType === 'mintv2_process') {
    return {
      kind: 'mintV2ProcessSteps',
      fieldType: undefined,
      label: 'Thêm / quản lý bước',
    };
  }
  const darlingField = key.match(
    /^items\[(\d+)\]\.(time|title|description|imageUrl)$/
  );
  if (darlingField && blockType === 'framer_darling_timeline') {
    const field = darlingField[2];
    const labels: Record<string, string> = {
      time: 'Giờ',
      title: 'Tiêu đề',
      description: 'Mô tả',
      imageUrl: 'Ảnh',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType:
        field === 'imageUrl'
          ? 'image'
          : field === 'description'
            ? 'textarea'
            : 'text',
      label: `Mốc ${Number(darlingField[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (key === 'items' && blockType === 'framer_darling_timeline') {
    return {
      kind: 'framerDarlingTimelineItems',
      fieldType: undefined,
      label: 'Thêm / quản lý mốc',
    };
  }
  const nftpullField = key.match(
    /^items\[(\d+)\]\.(number|title|description)$/
  );
  if (nftpullField && blockType === 'framer_nftpull_timeline') {
    const field = nftpullField[2];
    const labels: Record<string, string> = {
      number: 'Số thứ tự',
      title: 'Tiêu đề',
      description: 'Mô tả',
    };
    return {
      kind: 'text',
      fieldType: field === 'description' ? 'textarea' : 'text',
      label: `Mục ${Number(nftpullField[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (key === 'items' && blockType === 'framer_nftpull_timeline') {
    return {
      kind: 'framerNftpullTimelineItems',
      fieldType: undefined,
      label: 'Thêm / quản lý mục',
    };
  }
  if (blockType === 'framer_flat_white_process') {
    const stepCard = key.match(/^steps\[(\d+)\]\.card$/);
    if (stepCard) {
      return {
        kind: 'fill',
        fieldType: undefined,
        label: `Bước ${Number(stepCard[1]) + 1} · Khung`,
      };
    }
    const stepField = key.match(/^steps\[(\d+)\]\.(number|title|body)$/);
    if (stepField) {
      const field = stepField[2];
      const labels: Record<string, string> = {
        number: 'Số thứ tự',
        title: 'Tiêu đề',
        body: 'Mô tả',
      };
      return {
        kind: 'text',
        fieldType: field === 'number' ? 'text' : 'textarea',
        label: `Bước ${Number(stepField[1]) + 1} · ${labels[field] ?? field}`,
      };
    }
    if (key === 'steps') {
      return {
        kind: 'framerFlatWhiteProcessSteps',
        fieldType: undefined,
        label: 'Thêm / quản lý bước',
      };
    }
  }
  const tierField = key.match(
    /^tiers\[(\d+)\]\.(imageUrl|price|title|features|ctaLabel|ctaHref)$/
  );
  if (tierField && blockType === 'framer_perform_pricing') {
    const field = tierField[2];
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      price: 'Giá',
      title: 'Tên gói',
      features: 'Tính năng',
      ctaLabel: 'CTA — Chữ',
      ctaHref: 'CTA — Link',
    };
    const kind =
      field === 'imageUrl' ? 'image' : field === 'ctaHref' ? 'link' : 'text';
    return {
      kind,
      fieldType:
        field === 'imageUrl'
          ? 'image'
          : field === 'ctaHref'
            ? 'link'
            : field === 'features'
              ? 'textarea'
              : 'text',
      label: `Gói ${Number(tierField[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (key === 'items' && blockType === 'ignitex_projects') {
    return {
      kind: 'ignitexProjectsItems',
      fieldType: undefined,
      label: 'Thêm / quản lý project',
    };
  }
  const ignitexProjectField = key.match(
    /^items\[(\d+)\]\.(imageUrl|name|tag)$/
  );
  if (ignitexProjectField && blockType === 'ignitex_projects') {
    const field = ignitexProjectField[2];
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      name: 'Tên',
      tag: 'Tag',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType: field === 'imageUrl' ? 'image' : 'text',
      label: `Project ${Number(ignitexProjectField[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (key === 'testimonials' && blockType === 'framer_perform_about') {
    return {
      kind: 'framerPerformTestimonials',
      fieldType: undefined,
      label: 'Thêm / quản lý card',
    };
  }
  const testimonialField = key.match(
    /^testimonials\[(\d+)\]\.(imageUrl|textHighlight|textRest)$/
  );
  if (testimonialField && blockType === 'framer_perform_about') {
    const field = testimonialField[2];
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh',
      textHighlight: 'Highlight',
      textRest: 'Nội dung',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType: field === 'imageUrl' ? 'image' : 'text',
      label: `Card ${Number(testimonialField[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  if (key === 'tiers' && blockType === 'framer_perform_pricing') {
    return {
      kind: 'framerPerformPricingTiers',
      fieldType: undefined,
      label: 'Thêm / quản lý gói',
    };
  }
  if (key === 'line' && blockType === 'mintv2_process') {
    return {
      kind: 'fill',
      fieldType: undefined,
      label: 'Đường timeline',
    };
  }
  if (key === 'dot' && blockType === 'mintv2_process') {
    return {
      kind: 'fill',
      fieldType: undefined,
      label: 'Chấm bước',
    };
  }
  const worksText = key.match(
    /^cards\[(\d+)\]\.(jpLabel|category|title|bgColor)$/
  );
  if (worksText && blockType === 'mintv2_works') {
    const field = worksText[2];
    const labels: Record<string, string> = {
      jpLabel: 'Nhãn JP',
      category: 'Category',
      title: 'Tiêu đề',
      bgColor: 'Màu nền',
    };
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Card ${Number(worksText[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const worksImg = key.match(/^cards\[(\d+)\]\.(hero|backdrop)$/);
  if (worksImg && blockType === 'mintv2_works') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Card ${Number(worksImg[1]) + 1} · ${worksImg[2]}`,
    };
  }
  const worksThumb = key.match(/^cards\[(\d+)\]\.thumbs\[(\d+)\]$/);
  if (worksThumb && blockType === 'mintv2_works') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Card ${Number(worksThumb[1]) + 1} · Thumb ${Number(worksThumb[2]) + 1}`,
    };
  }
  if (key === 'variant' && blockType === 'mint_discover') {
    return {
      kind: 'mintDiscoverVariant',
      fieldType: undefined,
      label: 'Theme variant',
    };
  }
  if (key === 'cardSurface' && blockType === 'mint_discover') {
    return {
      kind: 'mintDiscoverSurface',
      fieldType: undefined,
      label: 'Thẻ info (nền)',
    };
  }
  if (key === 'items' && blockType === 'mintv2_services') {
    return {
      kind: 'mintV2ServicesItems',
      fieldType: undefined,
      label: 'Thêm / quản lý mục',
    };
  }
  if (key === 'items' && blockType === 'cool_hunter_gallery') {
    return {
      kind: 'coolHunterGalleryItems',
      fieldType: undefined,
      label: 'Thêm / quản lý ảnh',
    };
  }
  if (key === 'cardImages' && blockType === 'framer_bungee_hero_v2') {
    return {
      kind: 'framerBungeeHeroV2CardImages',
      fieldType: undefined,
      label: 'Thêm / quản lý ảnh',
    };
  }
  const reBungeeCardField = key.match(
    /^cardImages\[(\d+)\]\.(imageUrl|videoUrl)$/
  );
  if (reBungeeCardField && blockType === 'framer_bungee_hero_v2') {
    const field = reBungeeCardField[2];
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Thẻ ${Number(reBungeeCardField[1]) + 1} · ${
        field === 'imageUrl' ? 'Ảnh' : 'Video'
      }`,
    };
  }
  if (key === 'sections' && blockType === 'cool_hunter_section_progress') {
    return {
      kind: 'coolHunterSectionProgressItems',
      fieldType: undefined,
      label: 'Thêm / quản lý section',
    };
  }
  const reSectionProgressField = key.match(
    /^sections\[(\d+)\]\.(label|sectionId)$/
  );
  if (reSectionProgressField && blockType === 'cool_hunter_section_progress') {
    const field = reSectionProgressField[2];
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Section ${Number(reSectionProgressField[1]) + 1} · ${
        field === 'label' ? 'Nhãn' : 'data-section id'
      }`,
    };
  }
  if (key === 'items' && blockType === 'scroll_img_scale') {
    return {
      kind: 'scrollImgScaleItems',
      fieldType: undefined,
      label: 'Thêm / quản lý mục',
    };
  }
  if (key === 'items' && blockType === 'housent_our_excellence') {
    return {
      kind: 'housentOurExcellenceItems',
      fieldType: undefined,
      label: 'Thêm / quản lý mục',
    };
  }
  const reHousentItemField = key.match(/^items\[(\d+)\]\.(label|icon)$/);
  if (reHousentItemField && blockType === 'housent_our_excellence') {
    const field = reHousentItemField[2];
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Mục ${Number(reHousentItemField[1]) + 1} · ${
        field === 'label' ? 'Nhãn' : 'Icon'
      }`,
    };
  }
  if (key === 'items' && blockType === 'sustainit_our_expertise') {
    return {
      kind: 'sustainitOurExpertiseItems',
      fieldType: undefined,
      label: 'Thêm / quản lý mục',
    };
  }
  const reSustainitItemField = key.match(
    /^items\[(\d+)\]\.(imageUrl|backImageUrl|title|subtitle|bullets)$/
  );
  if (reSustainitItemField && blockType === 'sustainit_our_expertise') {
    const field = reSustainitItemField[2];
    const labels: Record<string, string> = {
      imageUrl: 'Ảnh trước',
      backImageUrl: 'Ảnh sau (blur)',
      title: 'Tiêu đề',
      subtitle: 'Phụ đề',
      bullets: 'Bullets',
    };
    return {
      kind: field === 'imageUrl' || field === 'backImageUrl' ? 'image' : 'text',
      fieldType:
        field === 'imageUrl' || field === 'backImageUrl'
          ? 'image'
          : field === 'bullets' || field === 'subtitle'
            ? 'textarea'
            : 'text',
      label: `Item ${Number(reSustainitItemField[1]) + 1} · ${labels[field]}`,
    };
  }
  if (key === 'features' && blockType === 'altura_olympus') {
    return {
      kind: 'alturaOlympusFeatures',
      fieldType: undefined,
      label: 'Thêm / quản lý features',
    };
  }
  const reAlturaFeatField = key.match(/^features\[(\d+)\]\.(label|icon)$/);
  if (reAlturaFeatField && blockType === 'altura_olympus') {
    const field = reAlturaFeatField[2];
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Feature ${Number(reAlturaFeatField[1]) + 1} · ${
        field === 'label' ? 'Nhãn' : 'Icon'
      }`,
    };
  }
  const reGalleryField = key.match(/^items\[(\d+)\]\.(imageUrl|text)$/);
  if (reGalleryField && blockType === 'cool_hunter_gallery') {
    const field = reGalleryField[2];
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType: field === 'imageUrl' ? 'image' : 'textarea',
      label: `Ảnh ${Number(reGalleryField[1]) + 1} · ${
        field === 'imageUrl' ? 'Ảnh' : 'Caption'
      }`,
    };
  }
  const reScrollImgField = key.match(/^items\[(\d+)\]\.(imageUrl|title)$/);
  if (reScrollImgField && blockType === 'scroll_img_scale') {
    const field = reScrollImgField[2];
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType: field === 'imageUrl' ? 'image' : 'text',
      label: `Mục ${Number(reScrollImgField[1]) + 1} · ${
        field === 'imageUrl' ? 'Ảnh' : 'Tiêu đề'
      }`,
    };
  }
  const reIgnitexCardField = key.match(
    /^cards\[(\d+)\]\.(title|body|mainImageUrl)$/
  );
  if (reIgnitexCardField && blockType === 'framer_ignitex_step') {
    const field = reIgnitexCardField[2];
    const labels: Record<string, string> = {
      title: 'title',
      body: 'body',
      mainImageUrl: 'ảnh',
    };
    return {
      kind: field === 'mainImageUrl' ? 'image' : 'text',
      fieldType:
        field === 'mainImageUrl'
          ? 'image'
          : field === 'body'
            ? 'textarea'
            : 'text',
      label: `Card ${Number(reIgnitexCardField[1]) + 1} · ${labels[field]}`,
    };
  }
  if (key === 'cards' && blockType === 'framer_ignitex_step') {
    return {
      kind: 'framerIgnitexStepCards',
      fieldType: undefined,
      label: 'Thêm / quản lý card',
    };
  }
  if (key === 'services' && blockType === 'framer_clarity_services') {
    return {
      kind: 'framerClarityServicesItems',
      fieldType: undefined,
      label: 'Thêm / quản lý dịch vụ',
    };
  }
  if (key === 'items' && blockType === 'the_grand_service') {
    return {
      kind: 'theGrandServiceItems',
      fieldType: undefined,
      label: 'Thêm / quản lý dịch vụ',
    };
  }
  if (key === 'items' && blockType === 'the_grand_discover') {
    return {
      kind: 'theGrandDiscoverItems',
      fieldType: undefined,
      label: 'Thêm / quản lý khu vực',
    };
  }
  if (key === 'partners' && blockType === 'the_grand_about') {
    return {
      kind: 'theGrandAboutPartners',
      fieldType: undefined,
      label: 'Thêm / quản lý đối tác',
    };
  }
  if (blockType === 'the_grand_footer') {
    if (key === 'policies') {
      return {
        kind: 'theGrandFooterPolicies',
        fieldType: undefined,
        label: 'Thêm / quản lý chính sách',
      };
    }
    if (key === 'socials') {
      return {
        kind: 'theGrandFooterSocials',
        fieldType: undefined,
        label: 'Thêm / quản lý social',
      };
    }
  }
  if (key === 'frameUrls' && blockType === 'delvaux_hero') {
    return {
      kind: 'delvauxFrames',
      fieldType: undefined,
      label: 'Chuỗi frame intro',
    };
  }
  if (key === 'hotspots' && blockType === 'delvaux_product') {
    return {
      kind: 'delvauxHotspots',
      fieldType: undefined,
      label: 'Thêm / quản lý hotspot',
    };
  }
  if (key === 'variants' && blockType === 'delvaux_variant') {
    return {
      kind: 'delvauxVariants',
      fieldType: undefined,
      label: 'Thêm / quản lý màu',
    };
  }
  if (key === 'faqs' && blockType === 'delvaux_variant') {
    return {
      kind: 'delvauxFaqs',
      fieldType: undefined,
      label: 'Thêm / quản lý FAQ',
    };
  }
  if (key === 'links' && blockType === 'delvaux_subnav') {
    return {
      kind: 'delvauxSubnavLinks',
      fieldType: undefined,
      label: 'Thêm / quản lý link',
    };
  }
  if (key === 'navLinks' && blockType === 'aestha_nav') {
    return {
      kind: 'aesthaNavLinks',
      fieldType: undefined,
      label: 'Thêm / quản lý nav',
    };
  }
  const aesthaNavLink = key.match(/^navLinks\[(\d+)\]\.(label|href)$/);
  if (aesthaNavLink && blockType === 'aestha_nav') {
    // `.href` phải ra link-picker (trang trong template / cuộn tới block / URL
    // ngoài). Nhánh hardcode này return TRƯỚC `defFieldType`, nên đổi mỗi
    // registry def sẽ không có tác dụng — xem ghi chú ở `delvaux_subnav`.
    const isHref = aesthaNavLink[2] === 'href';
    return {
      kind: isHref ? 'link' : 'text',
      fieldType: isHref ? 'link' : 'text',
      label: `Nav ${Number(aesthaNavLink[1]) + 1} · ${
        isHref ? 'Link' : 'Nhãn'
      }`,
    };
  }
  if (key === 'projects' && blockType === 'aestha_explore') {
    return {
      kind: 'aesthaExploreProjects',
      fieldType: undefined,
      label: 'Thêm / quản lý dự án',
    };
  }
  const exploreProjImages = key.match(/^projects\[(\d+)\]\.detail\.images$/);
  if (exploreProjImages && blockType === 'aestha_explore') {
    return {
      kind: 'aesthaExploreProjectImages',
      fieldType: undefined,
      label: `Dự án ${Number(exploreProjImages[1]) + 1} · Thêm / quản lý ảnh`,
    };
  }
  const exploreProject = key.match(/^projects\[(\d+)\]\.(label|href|img|alt)$/);
  if (exploreProject && blockType === 'aestha_explore') {
    const field = exploreProject[2];
    const labels: Record<string, string> = {
      label: 'Nhãn',
      href: 'Link',
      img: 'Ảnh',
      alt: 'Alt',
    };
    const kind = field === 'img' ? 'image' : field === 'href' ? 'link' : 'text';
    return {
      kind,
      fieldType: kind === 'image' ? 'image' : kind === 'link' ? 'link' : 'text',
      label: `Dự án ${Number(exploreProject[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const exploreDetailImage = key.match(
    /^projects\[(\d+)\]\.detail\.images\[(\d+)\]\.src$/
  );
  if (exploreDetailImage && blockType === 'aestha_explore') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Dự án ${Number(exploreDetailImage[1]) + 1} · Ảnh chi tiết ${Number(exploreDetailImage[2]) + 1}`,
    };
  }
  if (key === 'team' && blockType === 'aestha_studio') {
    return {
      kind: 'aesthaStudioTeam',
      fieldType: undefined,
      label: 'Thêm / quản lý team',
    };
  }
  const studioMember = key.match(/^team\[(\d+)\]\.(name|role)$/);
  if (studioMember && blockType === 'aestha_studio') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Thành viên ${Number(studioMember[1]) + 1} · ${
        studioMember[2] === 'name' ? 'Tên' : 'Vai trò'
      }`,
    };
  }
  if (key === 'socials' && blockType === 'aestha_contact') {
    return {
      kind: 'aesthaContactSocials',
      fieldType: undefined,
      label: 'Thêm / quản lý social',
    };
  }
  const contactSocial = key.match(/^socials\[(\d+)\]\.(label|href)$/);
  if (contactSocial && blockType === 'aestha_contact') {
    const isHref = contactSocial[2] === 'href';
    return {
      kind: isHref ? 'link' : 'text',
      fieldType: isHref ? 'link' : 'text',
      label: `Mạng xã hội ${Number(contactSocial[1]) + 1} · ${
        isHref ? 'Link' : 'Nhãn'
      }`,
    };
  }
  const delvauxNavLink = key.match(/^links\[(\d+)\]\.(label|targetId)$/);
  if (delvauxNavLink && blockType === 'delvaux_subnav') {
    const field = delvauxNavLink[2];
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Link ${Number(delvauxNavLink[1]) + 1} · ${
        field === 'label' ? 'Nhãn' : 'Section id'
      }`,
    };
  }
  const delvauxHs = key.match(/^hotspots\[(\d+)\]\.(title|desc|mediaUrl)$/);
  if (delvauxHs && blockType === 'delvaux_product') {
    const field = delvauxHs[2];
    const labels: Record<string, string> = {
      title: 'Tiêu đề',
      desc: 'Mô tả',
      mediaUrl: 'Media',
    };
    const isMedia = field === 'mediaUrl';
    return {
      kind: isMedia ? 'image' : 'text',
      fieldType: field === 'desc' ? 'textarea' : isMedia ? 'image' : 'text',
      label: `Hotspot ${Number(delvauxHs[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const delvauxVar = key.match(
    /^variants\[(\d+)\]\.(label|ref|color|imageUrl)$/
  );
  if (delvauxVar && blockType === 'delvaux_variant') {
    const field = delvauxVar[2];
    const labels: Record<string, string> = {
      label: 'Nhãn',
      ref: 'REF',
      color: 'Màu swatch',
      imageUrl: 'Ảnh',
    };
    return {
      kind: field === 'imageUrl' ? 'image' : 'text',
      fieldType: field === 'imageUrl' ? 'image' : 'text',
      label: `Màu ${Number(delvauxVar[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const delvauxFaq = key.match(/^faqs\[(\d+)\]\.(question|answer)$/);
  if (delvauxFaq && blockType === 'delvaux_variant') {
    const field = delvauxFaq[2];
    return {
      kind: 'text',
      fieldType: field === 'answer' ? 'textarea' : 'text',
      label: `FAQ ${Number(delvauxFaq[1]) + 1} · ${
        field === 'question' ? 'Câu hỏi' : 'Trả lời'
      }`,
    };
  }
  if (blockType === 'mint_variants' && key.startsWith('discover.')) {
    const DISCOVER_META: Record<
      string,
      { fieldType: 'text' | 'textarea'; label: string }
    > = {
      title: { fieldType: 'text', label: 'Drawer · Tiêu đề' },
      badge: { fieldType: 'text', label: 'Drawer · Nhãn (mintage)' },
      subtitle: { fieldType: 'text', label: 'Drawer · Phụ đề' },
      dimensions: { fieldType: 'textarea', label: 'Drawer · Kích thước' },
      faceValue: { fieldType: 'text', label: 'Drawer · Face value' },
      detailsText: { fieldType: 'textarea', label: 'Drawer · Chi tiết' },
      packagingText: { fieldType: 'textarea', label: 'Drawer · Đóng gói' },
      shippingText: { fieldType: 'textarea', label: 'Drawer · Vận chuyển' },
    };
    const meta = DISCOVER_META[key.slice('discover.'.length)];
    if (meta) {
      return { kind: 'text', fieldType: meta.fieldType, label: meta.label };
    }
  }
  const mintVarField = key.match(
    /^variants\[(\d+)\]\.(label|swatch|image|ref)$/
  );
  if (mintVarField && blockType === 'mint_variants') {
    const field = mintVarField[2];
    const labels: Record<string, string> = {
      label: 'Nhãn',
      swatch: 'Swatch',
      image: 'Ảnh',
      ref: 'REF',
    };
    const isImg = field === 'swatch' || field === 'image';
    return {
      kind: isImg ? 'image' : 'text',
      fieldType: isImg ? 'image' : 'text',
      label: `Biến thể ${Number(mintVarField[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const fieldType = defFieldType(blockType, key);
  const kind = resolveKind(key, fieldType, blockType);
  const label = resolveLabel(key, kind, blockType);
  return { kind, fieldType, label };
}

/** Flat string fields eligible for contenteditable inline edit. */
export function isInlineTextKey(blockType: BlockType, key: string): boolean {
  if (!key || key.startsWith('__')) return false;
  return resolveElementMeta(blockType, key).kind === 'text';
}

/**
 * PNJ sticky menu (and similar) expose label/CTA text on canvas but store
 * the href on a sibling field — map label → link for the canvas chip.
 */
export function resolveSiblingLinkKey(
  blockType: BlockType,
  key: string
): string | null {
  if (blockType === 'pnj_sticky_menu') {
    const navLabel = key.match(/^items\[(\d+)\]\.label$/);
    if (navLabel) return `items[${navLabel[1]}].link`;
    if (key === 'ctaText') return 'ctaLink';
  }
  if (blockType === 'aestha_nav') {
    const navLabel = key.match(/^navLinks\[(\d+)\]\.label$/);
    if (navLabel) return `navLinks[${navLabel[1]}].href`;
  }
  return null;
}

/** Reverse of `resolveSiblingLinkKey` — anchor link-only layers to visible text. */
export function resolveLinkAnchorKey(
  blockType: BlockType,
  key: string
): string {
  if (blockType === 'pnj_sticky_menu') {
    const navLink = key.match(/^items\[(\d+)\]\.link$/);
    if (navLink) return `items[${navLink[1]}].label`;
    if (key === 'ctaLink') return 'ctaText';
  }
  if (blockType === 'aestha_nav') {
    const navHref = key.match(/^navLinks\[(\d+)\]\.href$/);
    if (navHref) return `navLinks[${navHref[1]}].label`;
  }
  if (blockType === 'pnj_header' && key === 'logoHref') return 'logoUrl';
  return key;
}

/** Chip / action label for canvas hover affordance. */
export function canvasEditActionLabel(kind: ElementKind): string {
  if (kind === 'image') return 'Đổi ảnh';
  if (kind === 'text') return 'Sửa chữ';
  if (kind === 'link') return 'Đặt link';
  if (kind === 'background') return 'Nền';
  if (kind === 'framerPurevisualsPanelImages') return 'Quản lý ảnh';
  return 'Chỉnh';
}
