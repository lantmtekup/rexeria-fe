/**
 * BlockDef cho `delvaux_product` — port section `.product-detail` của
 * delvaux-clone: ảnh sản phẩm lớn căn giữa + quầng sáng + hotspot; bấm →
 * panel trắng trượt từ phải. Entrance zoom scrub. Path A.
 *
 * Layers: imageUrl + glowColor + expand hotspots[i].* (title/desc/mediaUrl)
 * + manager `hotspots` (x/y/mediaType/add-remove qua ElementToolbar).
 */
import {
  Image as ImageIcon,
  ListChecks,
  Palette,
  Pilcrow,
  Type,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type {
  DelvauxProductContent,
  DelvauxProductHotspot,
} from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_HOTSPOTS: DelvauxProductHotspot[] = [
  {
    title: 'Leather shoulder strap',
    desc: 'Crafted with exquisite gold-tone metal, the hardware of the Brillant MM S Dream adds a touch of timeless sophistication. From the signature buckle to the delicate accents, each detail reflects Delvaux’s unparalleled craftsmanship, elevating the bag’s elegance with a radiant, polished finish.',
    mediaType: 'video',
    mediaUrl:
      'https://d10zufojjcedud.cloudfront.net/uploads/a9c8d23e-dfa0-4580-a481-c6b3f23b24c5/delvaux-product-leather-hover.mp4',
    x: 34,
    y: 35.5,
  },
  {
    title: 'Gold metal hardware',
    desc: 'Crafted with exquisite gold-tone metal, the hardware of the Brillant MM S Dream adds a touch of timeless sophistication. From the signature buckle to the delicate accents, each detail reflects Delvaux’s unparalleled craftsmanship, elevating the bag’s elegance with a radiant, polished finish.',
    mediaType: 'image',
    mediaUrl:
      'https://d10zufojjcedud.cloudfront.net/uploads/adcfc54c-ce78-403a-9721-1a981ee1cfa4/delvaux-product-hardware.png',
    x: 51.5,
    y: 57,
  },
  {
    title: 'Dream Calf leather',
    desc: 'Crafted with exquisite gold-tone metal, the hardware of the Brillant MM S Dream adds a touch of timeless sophistication. From the signature buckle to the delicate accents, each detail reflects Delvaux’s unparalleled craftsmanship, elevating the bag’s elegance with a radiant, polished finish.',
    mediaType: 'video',
    mediaUrl:
      'https://d10zufojjcedud.cloudfront.net/uploads/f99248ec-b4b6-47ad-b835-83d496ac978f/delvaux-product-dream-calf.mp4',
    x: 20,
    y: 72,
  },
];

const VI: DelvauxProductContent = {
  imageUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/d157390f-9847-44a4-a52d-40f08e83ac94/delvaux-product-1.png',
  glowColor: '#a77c63',
  hotspots: DEFAULT_HOTSPOTS,
};

const EN: DelvauxProductContent = { ...VI };

/** Layers folders — 1 group / hotspot. */
export const delvauxProductHotspotElements = (
  hotspots: DelvauxProductHotspot[]
): LayerElement[] => {
  const list = hotspots.length > 0 ? hotspots : DEFAULT_HOTSPOTS;
  return list.flatMap((h, i) => {
    const groupId = `hs${i}`;
    const groupLabel = h.title?.trim() || `Hotspot ${i + 1}`;
    return [
      {
        key: `hotspots[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `hotspots[${i}].desc`,
        label: 'Mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
      {
        key: `hotspots[${i}].mediaUrl`,
        label: 'Media (URL)',
        groupId,
        icon: ImageIcon,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const delvauxProductDef: BlockDef<DelvauxProductContent> = {
  type: 'delvaux_product',
  meta: {
    type: 'delvaux_product',
    label: 'Product - Hotspots',
    accent: '#111111',
    adminLabel: 'Product - Hotspots',
    gradient: 'from-neutral-200 to-white',
    defaultName: 'Product - Hotspots',
    aiLabelVi:
      'ảnh sản phẩm lớn căn giữa + hotspot: bấm điểm tròn → panel chi tiết trượt từ phải, entrance zoom scrub',
    aiLabelEn:
      'large centered product image with hotspots: tap a dot → detail panel slides in from the right, scroll zoom entrance',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../DelvauxProduct').then(m => m.DelvauxProduct)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'imageUrl',
      label: 'Ảnh sản phẩm',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'product',
      groupLabel: 'Sản phẩm',
    },
    {
      key: 'glowColor',
      label: 'Màu quầng sáng',
      icon: Palette,
      fieldType: 'text',
      groupId: 'product',
    },
    ...delvauxProductHotspotElements(DEFAULT_HOTSPOTS),
    {
      key: 'hotspots',
      label: 'Thêm / quản lý hotspot',
      icon: ListChecks,
    },
  ],
};
