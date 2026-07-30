import type { Product } from '@/services/rexer/types';

import type {
  Block,
  BlockContent,
  BookingFormContent,
  CtaSectionContent,
  DeviceVariants,
  FeatureSectionContent,
  HeroOverlayContent,
  HeroSplitContent,
  Lang,
} from '@/components/modules/block-editor/types';

interface CopyTemplate {
  ctaText: string;
  primaryText: string;
  secondaryText: string;
  submitText: string;
  noteText: string;
  eyebrowFallback: string;
  galleryEyebrow: string;
  bookingEyebrow: string;
  ctaEyebrow: string;
  featureEyebrow: string;
  reasonLabel: string;
  fallbackDescription: string;
  feature: { icon: string; label: string; body: string };
  reason: { label: string; value: string };
  stat: { label: string; value: string };
}

const COPY: Record<Lang, CopyTemplate> = {
  vi: {
    ctaText: 'Khám phá ngay',
    primaryText: 'Mua ngay',
    secondaryText: 'Tìm hiểu thêm',
    submitText: 'Đặt mua',
    noteText: 'Chúng tôi sẽ liên hệ trong vòng 24h.',
    eyebrowFallback: 'Sản phẩm nổi bật',
    galleryEyebrow: 'Bộ sưu tập',
    bookingEyebrow: 'Đăng ký mua',
    ctaEyebrow: 'Sẵn sàng trải nghiệm?',
    featureEyebrow: 'Điểm nổi bật',
    reasonLabel: 'lý do nên chọn',
    fallbackDescription: 'Chất lượng vượt trội, được tin dùng bởi khách hàng.',
    feature: {
      icon: 'Sparkles',
      label: 'Đặc điểm nổi bật',
      body: 'Mô tả tiện ích.',
    },
    reason: { label: 'lý do', value: 'Chất lượng' },
    stat: { label: 'thông số', value: '—' },
  },
  en: {
    ctaText: 'Discover now',
    primaryText: 'Buy now',
    secondaryText: 'Learn more',
    submitText: 'Order',
    noteText: 'We will contact you within 24 hours.',
    eyebrowFallback: 'Featured product',
    galleryEyebrow: 'Collection',
    bookingEyebrow: 'Reserve yours',
    ctaEyebrow: 'Ready to experience?',
    featureEyebrow: 'Highlights',
    reasonLabel: 'reason to choose',
    fallbackDescription: 'Premium quality, trusted by customers worldwide.',
    feature: {
      icon: 'Sparkles',
      label: 'Highlight',
      body: 'Feature description.',
    },
    reason: { label: 'reason', value: 'Quality' },
    stat: { label: 'metric', value: '—' },
  },
};

function mapHeroSplit(
  content: HeroSplitContent,
  product: Product,
  copy: CopyTemplate
): HeroSplitContent {
  const stats: HeroSplitContent['stats'] = [];
  if (product.colors?.length) {
    stats.push({
      value: String(product.colors.length),
      label: copy === COPY.vi ? 'màu sắc' : 'colors',
    });
  }
  if (product.sizes?.length) {
    stats.push({
      value: String(product.sizes.length),
      label: copy === COPY.vi ? 'kích cỡ' : 'sizes',
    });
  }
  if (product.features?.length) {
    stats.push({
      value: String(product.features.length),
      label: copy === COPY.vi ? 'tiện ích' : 'features',
    });
  }

  return {
    ...content,
    eyebrow: product.sku || product.slug || copy.eyebrowFallback,
    title: product.name,
    description: product.description || copy.fallbackDescription,
    stats: stats.length ? stats : content.stats,
    ctaText: content.ctaText || copy.ctaText,
  };
}

function mapHeroOverlay(
  content: HeroOverlayContent,
  product: Product,
  copy: CopyTemplate
): HeroOverlayContent {
  return {
    ...content,
    tag: product.sku || product.slug || copy.eyebrowFallback,
    title: product.name,
    subtitle: product.description || copy.fallbackDescription,
    ctaText: content.ctaText || copy.ctaText,
  };
}

function mapFeatureSection(
  content: FeatureSectionContent,
  product: Product,
  copy: CopyTemplate
): FeatureSectionContent {
  const features = (product.features ?? []).slice(0, 8).map(f => ({
    icon: copy.feature.icon,
    label: f.label || copy.feature.label,
    body: f.description || copy.feature.body,
  }));

  return {
    ...content,
    eyebrow: copy.featureEyebrow,
    title: product.name,
    description: product.description || copy.fallbackDescription,
    features: features.length ? features : content.features,
  };
}

function mapBookingForm(
  content: BookingFormContent,
  product: Product,
  copy: CopyTemplate
): BookingFormContent {
  const reasons: BookingFormContent['reasons'] = [];
  if (product.colors?.length) {
    reasons.push({
      value: String(product.colors.length),
      label: copy === COPY.vi ? 'màu lựa chọn' : 'color options',
    });
  }
  if (product.sizes?.length) {
    reasons.push({
      value: String(product.sizes.length),
      label: copy === COPY.vi ? 'kích cỡ' : 'sizes',
    });
  }
  if (product.features?.length) {
    reasons.push({
      value: String(product.features.length),
      label: copy === COPY.vi ? 'tiện ích' : 'features',
    });
  }
  if (product.certifications?.length) {
    reasons.push({
      value: String(product.certifications.length),
      label: copy === COPY.vi ? 'chứng nhận' : 'certifications',
    });
  }

  return {
    ...content,
    eyebrow: copy.bookingEyebrow,
    title: product.name,
    description: product.description || copy.fallbackDescription,
    reasons: reasons.length ? reasons.slice(0, 4) : content.reasons,
    submitText: content.submitText || copy.submitText,
    noteText: content.noteText || copy.noteText,
  };
}

function mapCtaSection(
  content: CtaSectionContent,
  product: Product,
  copy: CopyTemplate
): CtaSectionContent {
  return {
    ...content,
    eyebrow: copy.ctaEyebrow,
    title: product.name,
    subtitle: product.description || copy.fallbackDescription,
    primaryText: content.primaryText || copy.primaryText,
    secondaryText: content.secondaryText || copy.secondaryText,
  };
}

function mapContent(
  blockType: Block['blockType'],
  c: BlockContent,
  product: Product,
  copy: CopyTemplate
): BlockContent {
  switch (blockType) {
    case 'hero_split':
      return mapHeroSplit(c as HeroSplitContent, product, copy);
    case 'hero_overlay':
      return mapHeroOverlay(c as HeroOverlayContent, product, copy);
    case 'feature_section':
      return mapFeatureSection(c as FeatureSectionContent, product, copy);
    case 'booking_form':
      return mapBookingForm(c as BookingFormContent, product, copy);
    case 'cta_section':
      return mapCtaSection(c as CtaSectionContent, product, copy);
    default:
      return c;
  }
}

/** Apply mapping to both variants if user has customized mobile, else just desktop. */
function applyVariants(
  variants: DeviceVariants<BlockContent>,
  blockType: Block['blockType'],
  product: Product,
  lang: Lang
): DeviceVariants<BlockContent> {
  const copy = COPY[lang];
  const desktop = mapContent(blockType, variants.desktop, product, copy);
  if (variants.mobile === undefined) return { desktop };
  const mobile = mapContent(blockType, variants.mobile, product, copy);
  return { desktop, mobile };
}

/**
 * Apply product fields to every block's content (both VI + EN, both
 * desktop + mobile variants when present), without touching `elementStyles`
 * or `background`. This is a deterministic mapping — no AI call.
 */
export function applyProductToBlocks(
  blocks: Block[],
  product: Product
): Block[] {
  return blocks.map(b => ({
    ...b,
    contentVi: applyVariants(b.contentVi, b.blockType, product, 'vi'),
    contentEn: applyVariants(b.contentEn, b.blockType, product, 'en'),
  }));
}
