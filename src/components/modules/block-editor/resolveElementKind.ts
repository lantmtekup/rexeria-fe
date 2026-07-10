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
