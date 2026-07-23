/**
 * Shared element-kind resolver for ElementToolbar + canvas hover edit.
 * Registry-first (`BlockDef.elements.fieldType`), then key heuristics.
 */
import { getBlockDef } from './blocks/_registry/registry';
import type { LayerElement } from './LayersPanel';
import type { BlockType } from './types';

export type ElementKind =
  | 'text'
  | 'image'
  | 'stats'
  | 'features'
  | 'reasons'
  | 'slides'
  | 'interactiveAd'
  | 'mintVariants'
  | 'mintTabs'
  | 'pnjParagraphs'
  | 'pnjTitleLines'
  | 'pnjVariants'
  | 'pnjStickyMenuItems'
  | 'mintV2ServicesItems'
  | 'mintV2ProcessSteps'
  | 'mintVaultCraftItems'
  | 'mintVaultCoins'
  | 'mintVaultImages'
  | 'fill'
  | 'pnjFrames'
  | 'pnjScrim'
  | 'delvauxFrames'
  | 'delvauxHotspots'
  | 'delvauxVariants'
  | 'delvauxFaqs'
  | 'delvauxSubnavLinks'
  | 'aesthaNavLinks'
  | 'aesthaExploreProjects'
  | 'aesthaExploreProjectImages'
  | 'aesthaExploreFooterLinks'
  | 'aesthaStudioTeam'
  | 'aesthaStudioFooterLinks'
  | 'aesthaContactSocials'
  | 'aesthaContactFooterLinks'
  | 'aesthaProjectBody'
  | 'aesthaProjectImages'
  | 'aesthaProjectNavLinks'
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
  if (fieldType === 'text' || fieldType === 'textarea') return 'text';
  // `slides` overlaps image_carousel vs interactive_ad_widget — distinguish by type.
  if (key === 'slides' && blockType === 'interactive_ad_widget') {
    return 'interactiveAd';
  }
  // PNJ variant chapters vs Mint swatch variants — cùng key `variants`.
  if (key === 'variants' && blockType === 'pnj_variant') {
    return 'pnjVariants';
  }
  // Delvaux color swatches vs Mint/PNJ variants — cùng key `variants`.
  if (key === 'variants' && blockType === 'delvaux_variant') {
    return 'delvauxVariants';
  }
  if (key === 'faqs' && blockType === 'delvaux_variant') {
    return 'delvauxFaqs';
  }
  if (key === 'links' && blockType === 'delvaux_subnav') {
    return 'delvauxSubnavLinks';
  }
  if (
    /^links\[\d+\]\.(label|targetId)$/.test(key) &&
    blockType === 'delvaux_subnav'
  ) {
    return 'text';
  }
  // Aestha nav: phải chặn trước fallback `ELEMENT_KIND[key] ?? isImageKey` —
  // `navLinks` rơi về 'text' thì toolbar ghi 1 string đè cả mảng.
  if (key === 'navLinks' && blockType === 'framer_aestha_editorial') {
    return 'aesthaNavLinks';
  }
  if (
    /^navLinks\[\d+\]\.(label|href)$/.test(key) &&
    blockType === 'framer_aestha_editorial'
  ) {
    return 'text';
  }
  // Aestha Explore: `projects` / `footerLinks` là mảng động (list manager) —
  // chặn trước fallback để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'aestha_explore') {
    if (key === 'projects') return 'aesthaExploreProjects';
    if (key === 'footerLinks') return 'aesthaExploreFooterLinks';
    // List-manager mảng ảnh chi tiết của 1 dự án — chặn TRƯỚC fallback
    // `isImageKey` (khớp 'images') để không bị coi là 1 ô ảnh đơn.
    if (/^projects\[\d+\]\.detail\.images$/.test(key))
      return 'aesthaExploreProjectImages';
    if (/^projects\[\d+\]\.img$/.test(key)) return 'image';
    if (/^projects\[\d+\]\.(label|href|alt)$/.test(key)) return 'text';
    if (/^footerLinks\[\d+\]\.(label|href)$/.test(key)) return 'text';
  }
  // Aestha Studio: `team` / `footerLinks` là mảng động (list manager) — chặn
  // trước fallback để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'aestha_studio') {
    if (key === 'team') return 'aesthaStudioTeam';
    if (key === 'footerLinks') return 'aesthaStudioFooterLinks';
    if (/^team\[\d+\]\.(name|role)$/.test(key)) return 'text';
    if (/^footerLinks\[\d+\]\.(label|href)$/.test(key)) return 'text';
  }
  // Aestha Contact: `socials` / `footerLinks` là mảng động (list manager) —
  // chặn trước fallback để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'aestha_contact') {
    if (key === 'socials') return 'aesthaContactSocials';
    if (key === 'footerLinks') return 'aesthaContactFooterLinks';
    if (/^socials\[\d+\]\.(label|href)$/.test(key)) return 'text';
    if (/^footerLinks\[\d+\]\.(label|href)$/.test(key)) return 'text';
  }
  // Aestha Project: `body` / `images` / `navLinks` là mảng động (list manager)
  // — chặn trước fallback để toolbar không ghi 1 string đè cả mảng.
  if (blockType === 'aestha_project') {
    if (key === 'body') return 'aesthaProjectBody';
    if (key === 'images') return 'aesthaProjectImages';
    if (key === 'navLinks') return 'aesthaProjectNavLinks';
    if (/^body\[\d+\]$/.test(key)) return 'text';
    if (/^images\[\d+\]\.src$/.test(key)) return 'image';
    if (/^images\[\d+\]\.alt$/.test(key)) return 'text';
    if (/^navLinks\[\d+\]\.(label|href)$/.test(key)) return 'text';
  }
  // Delvaux product hotspots vs Mint/PNJ hero hotspots — cùng key `hotspots`.
  if (key === 'hotspots' && blockType === 'delvaux_product') {
    return 'delvauxHotspots';
  }
  if (
    /^hotspots\[\d+\]\.(title|desc|mediaUrl)$/.test(key) &&
    blockType === 'delvaux_product'
  ) {
    return 'text';
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
  // Vault collection: `coins` là mảng (list manager), KHÔNG phải text.
  if (key === 'coins' && blockType === 'mint_vault_collection') {
    return 'mintVaultCoins';
  }
  // Vault: `images` là mảng string[] (list manager) — xem MINT_VAULT_IMAGE_LABEL.
  if (key === 'images' && blockType && MINT_VAULT_IMAGE_LABEL.has(blockType)) {
    return 'mintVaultImages';
  }
  if (key === 'items' && blockType === 'pnj_sticky_menu') {
    return 'pnjStickyMenuItems';
  }
  if (key === 'items' && blockType === 'mintv2_services') {
    return 'mintV2ServicesItems';
  }
  if (key === 'steps' && blockType === 'mintv2_process') {
    return 'mintV2ProcessSteps';
  }
  if (key === 'items' && blockType === 'mint_vault_craft') {
    return 'mintVaultCraftItems';
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
  // Nested variant fields: variants[0].label / .desc / .highlights → text
  if (/^variants\[\d+\]\.image$/.test(key)) return 'image';
  if (/^variants\[\d+\]\.(label|desc|highlights)$/.test(key)) return 'text';
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
  // Real Estate tổng quan: mỗi hạng mục là icon (ảnh) + một dòng chữ.
  if (blockType === 'real_estate_overview') {
    if (/^stats\[\d+\]\.text$/.test(key)) return 'text';
    if (/^stats\[\d+\]\.iconUrl$/.test(key)) return 'image';
  }
  // Real Estate điểm nổi trội: mỗi card là ảnh + số thứ tự + một dòng chữ.
  // Phải chặn TRƯỚC các fallback `items[i].*` chung ngay bên dưới.
  if (blockType === 'real_estate_highlights') {
    if (/^items\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^items\[\d+\]\.(number|text)$/.test(key)) return 'text';
    // Dải nền 372 phía sau — chỉ có màu, không có nội dung.
    if (key === 'contentSurface') return 'fill';
  }
  // Real Estate biệt thự: mỗi slide là ảnh + tên loại hình + mô tả.
  if (blockType === 'real_estate_villa') {
    if (/^slides\[\d+\]\.imageUrl$/.test(key)) return 'image';
    if (/^slides\[\d+\]\.(title|description)$/.test(key)) return 'text';
    // Nền thẻ — chỉ có màu, không có nội dung.
    if (key === 'cardSurface') return 'fill';
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
  if ((key === 'line' || key === 'dot') && blockType === 'mintv2_process') {
    return 'fill';
  }
  return ELEMENT_KIND[key] ?? (isImageKey(key) ? 'image' : 'text');
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
  const variantLabel = key.match(/^variants\[(\d+)\]\.label$/);
  if (variantLabel) return `Nhãn góc ${Number(variantLabel[1]) + 1}`;
  const variantDesc = key.match(/^variants\[(\d+)\]\.desc$/);
  if (variantDesc) return `Mô tả góc ${Number(variantDesc[1]) + 1}`;
  const variantImg = key.match(/^variants\[(\d+)\]\.image$/);
  if (variantImg) return `Ảnh góc ${Number(variantImg[1]) + 1}`;
  const variantHl = key.match(/^variants\[(\d+)\]\.highlights$/);
  if (variantHl) return `Highlights góc ${Number(variantHl[1]) + 1}`;
  if (key === 'variants' && blockType === 'pnj_variant') return 'Góc nhìn';
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
  // Phải đứng TRƯỚC `navLabel` bên dưới — nếu không `items[i].label` của nội
  // khu sẽ nhận nhãn chung "Nhãn mục N".
  const reUtility = key.match(/^items\[(\d+)\]\.(label|iconUrl)$/);
  if (reUtility && blockType === 'real_estate_utilities') {
    return `Tiện ích ${Number(reUtility[1]) + 1} · ${
      reUtility[2] === 'label' ? 'Nội dung' : 'Icon'
    }`;
  }
  const navLabel = key.match(/^items\[(\d+)\]\.label$/);
  if (navLabel && blockType === 'mintv2_services') {
    return `Mục ${Number(navLabel[1]) + 1} · Nhãn`;
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
  const craftImg = key.match(/^items\[(\d+)\]\.imageUrl$/);
  if (craftImg && blockType === 'mint_vault_craft') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Mục ${Number(craftImg[1]) + 1} · Ảnh`,
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
      kind: 'text',
      fieldType: 'textarea',
      label: `Highlights góc ${Number(vHl[1]) + 1}`,
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
      kind: 'text',
      fieldType: 'text',
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
  if (key === 'navLinks' && blockType === 'framer_aestha_editorial') {
    return {
      kind: 'aesthaNavLinks',
      fieldType: undefined,
      label: 'Thêm / quản lý nav',
    };
  }
  const aesthaNavLink = key.match(/^navLinks\[(\d+)\]\.(label|href)$/);
  if (aesthaNavLink && blockType === 'framer_aestha_editorial') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Nav ${Number(aesthaNavLink[1]) + 1} · ${
        aesthaNavLink[2] === 'label' ? 'Nhãn' : 'Link'
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
  if (key === 'footerLinks' && blockType === 'aestha_explore') {
    return {
      kind: 'aesthaExploreFooterLinks',
      fieldType: undefined,
      label: 'Thêm / quản lý footer',
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
    return {
      kind: field === 'img' ? 'image' : 'text',
      fieldType: field === 'img' ? 'image' : 'text',
      label: `Dự án ${Number(exploreProject[1]) + 1} · ${labels[field] ?? field}`,
    };
  }
  const exploreFooter = key.match(/^footerLinks\[(\d+)\]\.(label|href)$/);
  if (exploreFooter && blockType === 'aestha_explore') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Footer ${Number(exploreFooter[1]) + 1} · ${
        exploreFooter[2] === 'label' ? 'Nhãn' : 'Link'
      }`,
    };
  }
  if (key === 'team' && blockType === 'aestha_studio') {
    return {
      kind: 'aesthaStudioTeam',
      fieldType: undefined,
      label: 'Thêm / quản lý team',
    };
  }
  if (key === 'footerLinks' && blockType === 'aestha_studio') {
    return {
      kind: 'aesthaStudioFooterLinks',
      fieldType: undefined,
      label: 'Thêm / quản lý footer',
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
  const studioFooter = key.match(/^footerLinks\[(\d+)\]\.(label|href)$/);
  if (studioFooter && blockType === 'aestha_studio') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Footer ${Number(studioFooter[1]) + 1} · ${
        studioFooter[2] === 'label' ? 'Nhãn' : 'Link'
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
  if (key === 'footerLinks' && blockType === 'aestha_contact') {
    return {
      kind: 'aesthaContactFooterLinks',
      fieldType: undefined,
      label: 'Thêm / quản lý footer',
    };
  }
  const contactSocial = key.match(/^socials\[(\d+)\]\.(label|href)$/);
  if (contactSocial && blockType === 'aestha_contact') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Mạng xã hội ${Number(contactSocial[1]) + 1} · ${
        contactSocial[2] === 'label' ? 'Nhãn' : 'Link'
      }`,
    };
  }
  const contactFooter = key.match(/^footerLinks\[(\d+)\]\.(label|href)$/);
  if (contactFooter && blockType === 'aestha_contact') {
    return {
      kind: 'text',
      fieldType: 'text',
      label: `Footer ${Number(contactFooter[1]) + 1} · ${
        contactFooter[2] === 'label' ? 'Nhãn' : 'Link'
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
      mediaUrl: 'Media (URL)',
    };
    return {
      kind: 'text',
      fieldType: field === 'desc' ? 'textarea' : 'text',
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

/** Chip / action label for canvas hover affordance. */
export function canvasEditActionLabel(kind: ElementKind): string {
  if (kind === 'image') return 'Đổi ảnh';
  if (kind === 'text') return 'Sửa chữ';
  if (kind === 'background') return 'Nền';
  return 'Chỉnh';
}
