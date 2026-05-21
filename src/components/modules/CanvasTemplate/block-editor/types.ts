export type Lang = 'vi' | 'en';
export type Device = 'desktop' | 'tablet' | 'mobile';

export type BlockType =
  | 'hero_split'
  | 'hero_overlay'
  | 'feature_section'
  | 'photo_gallery'
  | 'booking_form'
  | 'cta_section'
  | 'image_carousel'
  | 'stories'
  | 'split_screen'
  | 'quiz'
  | 'poll'
  | 'carousel_3d'
  | 'flipbook'
  | 'panorama';

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

export type BlockContent =
  | HeroSplitContent
  | HeroOverlayContent
  | FeatureSectionContent
  | PhotoGalleryContent
  | BookingFormContent
  | CtaSectionContent
  | ImageCarouselContent
  | StoriesContent
  | SplitScreenContent
  | QuizContent
  | PollContent
  | Carousel3dContent
  | FlipbookContent
  | PanoramaContent
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
  stories: { type: 'stories', label: 'Stories', accent: '#db2777' },
  split_screen: {
    type: 'split_screen',
    label: 'Split screen',
    accent: '#0891b2',
  },
  quiz: { type: 'quiz', label: 'Quiz', accent: '#9333ea' },
  poll: { type: 'poll', label: 'Poll', accent: '#16a34a' },
  carousel_3d: {
    type: 'carousel_3d',
    label: 'Coverflow 3D',
    accent: '#0d9488',
  },
  flipbook: { type: 'flipbook', label: 'Flipbook', accent: '#854d0e' },
  panorama: { type: 'panorama', label: 'Panorama 360°', accent: '#1d4ed8' },
};
