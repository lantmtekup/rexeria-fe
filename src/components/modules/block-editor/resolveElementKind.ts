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
  | 'pnjFrames'
  | 'pnjScrim'
  | 'background';

export const BACKGROUND_LAYER_KEY = '__background__';

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
  if (key === 'items' && blockType === 'pnj_sticky_menu') {
    return 'pnjStickyMenuItems';
  }
  // Nested paragraph slots: paragraphs[0] → text (inline edit).
  if (/^paragraphs\[\d+\]$/.test(key)) return 'text';
  // Nested PNJ hero title lines: titleLines[0] → text.
  if (/^titleLines\[\d+\]$/.test(key)) return 'text';
  // Nested variant fields: variants[0].label / .desc / .highlights → text
  if (/^variants\[\d+\]\.image$/.test(key)) return 'image';
  if (/^variants\[\d+\]\.(label|desc|highlights)$/.test(key)) return 'text';
  if (/^items\[\d+\]\.label$/.test(key)) return 'text';
  if (/^items\[\d+\]\.link$/.test(key)) return 'text';
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
  const variantLabel = key.match(/^variants\[(\d+)\]\.label$/);
  if (variantLabel) return `Nhãn góc ${Number(variantLabel[1]) + 1}`;
  const variantDesc = key.match(/^variants\[(\d+)\]\.desc$/);
  if (variantDesc) return `Mô tả góc ${Number(variantDesc[1]) + 1}`;
  const variantImg = key.match(/^variants\[(\d+)\]\.image$/);
  if (variantImg) return `Ảnh góc ${Number(variantImg[1]) + 1}`;
  const variantHl = key.match(/^variants\[(\d+)\]\.highlights$/);
  if (variantHl) return `Highlights góc ${Number(variantHl[1]) + 1}`;
  if (key === 'variants' && blockType === 'pnj_variant') return 'Góc nhìn';
  const navLabel = key.match(/^items\[(\d+)\]\.label$/);
  if (navLabel) return `Nhãn mục ${Number(navLabel[1]) + 1}`;
  const navLink = key.match(/^items\[(\d+)\]\.link$/);
  if (navLink) return `Link mục ${Number(navLink[1]) + 1}`;
  if (key === 'items' && blockType === 'pnj_sticky_menu') return 'Menu items';
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
  const vImg = key.match(/^variants\[(\d+)\]\.image$/);
  if (vImg && blockType === 'pnj_variant') {
    return {
      kind: 'image',
      fieldType: 'image',
      label: `Ảnh góc ${Number(vImg[1]) + 1}`,
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
