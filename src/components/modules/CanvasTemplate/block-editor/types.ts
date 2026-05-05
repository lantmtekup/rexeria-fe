export type Lang = 'vi' | 'en';
export type Device = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'hero_split'
  | 'hero_overlay'
  | 'feature_section'
  | 'photo_gallery'
  | 'booking_form'
  | 'cta_section';

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
}

export type ElementStylesMap = Record<string, ElementStyle | undefined>;

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

export interface PhotoGalleryContent {
  eyebrow: string;
  title: string;
  description: string;
  photos: GalleryPhoto[];
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

export type BlockContent =
  | HeroSplitContent
  | HeroOverlayContent
  | FeatureSectionContent
  | PhotoGalleryContent
  | BookingFormContent
  | CtaSectionContent
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
 * Per-block motion config — block-level entrance/ambient + optional
 * per-element overrides. The shape lives in `motion/types.ts` to avoid
 * a circular import here; we re-declare a structural subset to avoid
 * pulling motion types into every consumer of `Block`.
 */
export interface BlockMotionMapStored {
  block?: BlockMotionConfigStored;
  elements?: Record<string, BlockMotionConfigStored>;
}

export interface BlockMotionConfigStored {
  presetId: string;
  speed: 'slow' | 'normal' | 'fast';
  intensity: 'subtle' | 'normal' | 'dramatic';
  cascade: 'off' | 'normal' | 'slow';
  delay?: number;
  enabled?: boolean;
}

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
   * Motion config — per-device. Block-level entrance/ambient applies to all
   * children; element-level overrides target individual element keys. Stored
   * verbatim and passed through serialize.
   */
  motion?: DeviceVariants<BlockMotionMapStored>;
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

export interface BlockTypeMeta {
  type: BlockType;
  label: string;
  accent: string;
}

export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  hero_split: { type: 'hero_split', label: 'Hero Split', accent: '#0A0A0A' },
  hero_overlay: {
    type: 'hero_overlay',
    label: 'Hero Overlay',
    accent: '#1f2937',
  },
  feature_section: {
    type: 'feature_section',
    label: 'Feature',
    accent: '#0f766e',
  },
  photo_gallery: {
    type: 'photo_gallery',
    label: 'Gallery',
    accent: '#7c3aed',
  },
  booking_form: { type: 'booking_form', label: 'Booking', accent: '#b45309' },
  cta_section: { type: 'cta_section', label: 'CTA', accent: '#be123c' },
};
