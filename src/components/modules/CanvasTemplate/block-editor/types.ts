export type Lang = 'vi' | 'en';
export type Device = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'hero_split'
  | 'hero_overlay'
  | 'feature_section'
  | 'photo_gallery'
  | 'booking_form'
  | 'cta_section'
  | 'image_carousel';

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
  /** Font id from `src/lib/fonts.ts` (e.g. `inter`, `be-vietnam-pro`). */
  fontFamily?: string;
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

export type BlockContent =
  | HeroSplitContent
  | HeroOverlayContent
  | FeatureSectionContent
  | PhotoGalleryContent
  | BookingFormContent
  | CtaSectionContent
  | ImageCarouselContent
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
  | 'hotspot';

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
}

export interface ExtraTextContent {
  text: string;
  textEn?: string;
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
  /** Popover title (one-liner). */
  title: string;
  /** Popover body — multi-line text. */
  body?: string;
  /** Optional CTA button inside the popover. */
  ctaText?: string;
  ctaUrl?: string;
  /** Trigger — phase 1 only `click`; defer hover. */
  trigger?: 'click';
}

export type ExtraElementContent =
  | ExtraTextContent
  | ExtraEditTextContent
  | ExtraPhotoContent
  | ExtraVideoContent
  | ExtraHotspotContent;

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

export type ExtraElement =
  | TextExtraElement
  | EditTextExtraElement
  | PhotoExtraElement
  | VideoExtraElement
  | HotspotExtraElement;

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
  image_carousel: {
    type: 'image_carousel',
    label: 'Slide',
    accent: '#2563eb',
  },
};
