/**
 * BlockDef cho `pnj_variant` — sticky-track + scrub product-view chapters.
 * Port từ apps/pnj ProductVariantSection. Path A registry.
 *
 * Layers: mỗi góc = 1 folder `groupId` (pattern ScrollMattis) — image / label /
 * desc / highlights editable từng field. Content vẫn là `variants[]` động;
 * `elementsForType` expand từ content khi số góc ≠ default.
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { PnjVariantContent, PnjVariantItem } from '../../../types';
import type { BlockDef } from '../types';

const VI_VARIANTS: PnjVariantItem[] = [
  {
    key: 'dial',
    label: 'Mặt số',
    desc: 'Mặt số xà cừ hồng với họa tiết hoa nhẹ. Kim cương thay thế vạch giờ, tạo điểm nhấn tinh tế khi ánh sáng chiếu qua.',
    image: '/pnj/frames/frame-001.webp',
    highlights: ['Xà cừ hồng', 'Họa tiết hoa', 'Kim cương vạch giờ'],
  },
  {
    key: 'profile',
    label: 'Góc nghiêng',
    desc: 'Vành hai tông bạc và vàng hồng ôm lấy mặt kính. Ba viên kim cương nổi trong rãnh vành là chi tiết đặc trưng khi nhìn nghiêng.',
    image: '/pnj/frames/frame-038.webp',
    highlights: ['Vành hai tông', 'Kim cương nổi', 'Độ mỏng vỏ'],
  },
  {
    key: 'caseback',
    label: 'Mặt sau',
    desc: 'Nắp lưng thép khắc Eco-Drive. Máy chạy bằng ánh sáng, không cần thay pin trong quá trình sử dụng thông thường.',
    image: '/pnj/frames/frame-076.webp',
    highlights: ['Eco-Drive', 'Nắp thép', 'Không thay pin'],
  },
];

const EN_VARIANTS: PnjVariantItem[] = [
  {
    key: 'dial',
    label: 'Dial',
    desc: 'A soft pink mother-of-pearl dial with a delicate floral motif. Diamond hour markers catch the light with quiet brilliance.',
    image: '/pnj/frames/frame-001.webp',
    highlights: ['Pink mother-of-pearl', 'Floral motif', 'Diamond markers'],
  },
  {
    key: 'profile',
    label: 'Profile',
    desc: 'A two-tone silver and rose-gold bezel frames the crystal. Three flush-set diamonds in the bezel groove define the side view.',
    image: '/pnj/frames/frame-038.webp',
    highlights: ['Two-tone bezel', 'Flush diamonds', 'Slim case'],
  },
  {
    key: 'caseback',
    label: 'Caseback',
    desc: 'A steel caseback engraved with Eco-Drive. Powered by light — no battery changes in normal use.',
    image: '/pnj/frames/frame-076.webp',
    highlights: ['Eco-Drive', 'Steel caseback', 'Light-powered'],
  },
];

const VI: PnjVariantContent = {
  ctaText: 'Xem chi tiết',
  variants: VI_VARIANTS,
};

const EN: PnjVariantContent = {
  ctaText: 'View details',
  variants: EN_VARIANTS,
};

/** Layers folders — 1 group / góc nhìn (giống slide1/slide2 ScrollMattis). */
export const pnjVariantItemElements = (
  variants: PnjVariantItem[]
): LayerElement[] => {
  const list = variants.length > 0 ? variants : VI_VARIANTS;
  return list.flatMap((v, i) => {
    const groupId = `variant${i}`;
    const groupLabel = v.label?.trim() || `Góc ${i + 1}`;
    return [
      {
        key: `variants[${i}].image`,
        label: 'ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `variants[${i}].label`,
        label: 'nhãn',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `variants[${i}].desc`,
        label: 'mô tả',
        groupId,
        icon: Type,
        fieldType: 'textarea' as const,
      },
      {
        key: `variants[${i}].highlights`,
        label: 'highlights',
        groupId,
        icon: ListChecks,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const pnjVariantDef: BlockDef<PnjVariantContent> = {
  type: 'pnj_variant',
  meta: {
    type: 'pnj_variant',
    label: 'PNJ · Variant',
    accent: '#003468',
    adminLabel: 'PNJ Variant',
    gradient: 'from-neutral-100 to-slate-200',
    defaultName: 'PNJ Variant',
    aiLabelVi:
      'section góc nhìn sản phẩm PNJ: pin scrub đổi ảnh + mô tả + highlights + CTA',
    aiLabelEn:
      'PNJ product views: pinned scrub chapters of image + copy + highlights + CTA',
  },
  component: dynamic(() => import('../../PnjVariant').then(m => m.PnjVariant)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...pnjVariantItemElements(VI_VARIANTS),
    {
      key: 'variants',
      label: 'Thêm / quản lý góc',
      icon: ListChecks,
    },
    { key: 'ctaText', label: 'CTA', icon: Type, fieldType: 'text' },
  ],
};
