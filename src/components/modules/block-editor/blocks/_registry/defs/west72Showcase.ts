/**
 * BlockDef cho 3 type showcase của 212 West 72nd — dùng chung component
 * `West72Showcase`, khác nhau ở defaultContent (preset):
 *   - `west72_showcase`           → Custom-Designed Kitchens (8 hotspot, rèm combined)
 *   - `west72_showcase_landmark`  → Landmark Views (rèm split, thẻ dưới-phải)
 *   - `west72_showcase_sanctuary` → Your Private Sanctuary (không rèm, 6 hotspot)
 * Port từ apps/212-west FeatureShowcase. Path A registry.
 *
 * Nội dung preset + helper `isWest72ShowcaseType` nằm ở
 * `blocks/west72ShowcasePresets.ts` (data thuần) và được re-export ở đây.
 */
import {
  AlignLeft,
  Heading2,
  Image as ImageIcon,
  LayoutTemplate,
  ListChecks,
  Tag,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import {
  BLOCK_TYPE_META,
  type West72ShowcaseContent,
  type West72ShowcaseHotspot,
} from '../../../types';
import type { LayerElement } from '../../../LayersPanel';
import type { BlockDef } from '../types';
import {
  west72ShowcasePreset,
  type West72ShowcasePresetId,
  type West72ShowcaseType,
} from '../../west72ShowcasePresets';

export {
  WEST72_SHOWCASE_PRESET_LABELS,
  WEST72_SHOWCASE_PRESETS,
  WEST72_SHOWCASE_TYPES,
  isWest72ShowcaseType,
  west72ShowcasePreset,
  type West72ShowcasePresetId,
  type West72ShowcaseType,
} from '../../west72ShowcasePresets';

/** Expand từng hotspot thành 2 lớp nhãn / mô tả trong panel Lớp. */
export const west72ShowcaseHotspotElements = (
  hotspots: West72ShowcaseHotspot[]
): LayerElement[] =>
  hotspots.flatMap((_, i) => [
    {
      key: `hotspots[${i}].label`,
      label: 'Nhãn',
      groupId: `hotspot${i}`,
      groupLabel: `Hotspot ${i + 1}`,
      icon: Tag,
      fieldType: 'text' as const,
    },
    {
      key: `hotspots[${i}].desc`,
      label: 'Mô tả',
      groupId: `hotspot${i}`,
      icon: AlignLeft,
      fieldType: 'textarea' as const,
    },
  ]);

const component = dynamic(() =>
  import('../../West72Showcase').then(m => m.West72Showcase)
);

/** Chung cho cả 3 type — key khớp `data-element-key` trong West72Showcase. */
const ELEMENTS: LayerElement[] = [
  {
    key: 'chip',
    label: 'Nhãn chip',
    icon: Tag,
    fieldType: 'text',
    groupId: 'card',
    groupLabel: 'Thẻ nội dung',
  },
  {
    key: 'title',
    label: 'Tiêu đề (mỗi dòng 1 hàng)',
    icon: Heading2,
    fieldType: 'textarea',
    groupId: 'card',
  },
  {
    key: 'desc',
    label: 'Đoạn mô tả',
    icon: AlignLeft,
    fieldType: 'textarea',
    groupId: 'card',
  },
  {
    key: 'imageUrl',
    label: 'Ảnh',
    icon: ImageIcon,
    fieldType: 'image',
    groupId: 'media',
    groupLabel: 'Ảnh',
  },
  {
    key: 'imageAlt',
    label: 'Alt ảnh',
    icon: Tag,
    fieldType: 'text',
    groupId: 'media',
  },
  // Pseudo-key (không có trong content) → control chọn preset + bố cục.
  {
    key: 'layout',
    label: 'Bố cục thẻ / reveal',
    icon: LayoutTemplate,
  },
  {
    key: 'hotspots',
    label: 'Hotspot / chi tiết',
    icon: ListChecks,
  },
];

function makeWest72ShowcaseDef(
  type: West72ShowcaseType,
  presetId: West72ShowcasePresetId
): BlockDef<West72ShowcaseContent> {
  return {
    type,
    // Nguồn sự thật meta là BLOCK_TYPE_META (types.ts) — không nhân bản.
    meta: BLOCK_TYPE_META[type],
    component,
    defaultContent: {
      vi: west72ShowcasePreset(presetId),
      en: west72ShowcasePreset(presetId),
    },
    elements: ELEMENTS,
  };
}

export const west72ShowcaseDef = makeWest72ShowcaseDef(
  'west72_showcase',
  'kitchens'
);
export const west72ShowcaseLandmarkDef = makeWest72ShowcaseDef(
  'west72_showcase_landmark',
  'landmark'
);
export const west72ShowcaseSanctuaryDef = makeWest72ShowcaseDef(
  'west72_showcase_sanctuary',
  'sanctuary'
);
