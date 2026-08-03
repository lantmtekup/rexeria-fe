/**
 * BlockDef cho `belgo_about_product` — giới thiệu sản phẩm + khối BEVERAGE SPECS.
 * Port từ apps/belgo AboutProduct.tsx. Path A registry.
 */
import {
  FileText,
  Image as ImageIcon,
  ListChecks,
  Ruler,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { BelgoAboutProductContent, BelgoSpecItem } from '../../../types';
import type { BlockDef } from '../types';

export const BELGO_ABOUT_PRODUCT_DEFAULT_TITLE_LINES = [
  'BELGO AMBER',
  '- BOLD, BALANCED, AND',
  'BREWED TO PERFECTION',
];

export const BELGO_ABOUT_PRODUCT_DEFAULT_SPECS: BelgoSpecItem[] = [
  {
    label: 'ABV',
    value: '5.1',
    unit: '%',
    copy: 'A smooth balance of flavor and strength. Just enough kick to keep things interesting, but light enough to keep the good times rolling. Cheers to that!',
  },
  {
    label: 'IBU',
    value: '18',
    unit: '',
    copy: 'Bitterness? Just a whisper. Enough to tease your taste buds, but never overpowering. A sip of balance in every drop.',
  },
  {
    label: 'VOL',
    value: '33',
    unit: 'CL',
    copy: 'Perfectly sized for the right moment. Not too much, not too little—just enough to enjoy every refreshing sip.',
  },
];

/** Normalize titleLines (chuỗi đơn / rỗng → fallback default). */
export const resolveBelgoAboutProductTitleLines = (
  content: BelgoAboutProductContent | undefined
): string[] => {
  const raw = content?.titleLines as unknown;
  if (typeof raw === 'string') return [raw];
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map(line => (typeof line === 'string' ? line : ''));
  }
  return [...BELGO_ABOUT_PRODUCT_DEFAULT_TITLE_LINES];
};

/** Normalize danh sách thông số — luôn trả về ít nhất 1 dòng. */
export const resolveBelgoAboutProductSpecs = (
  content: BelgoAboutProductContent | undefined
): BelgoSpecItem[] => {
  const raw = content?.specs;
  if (!Array.isArray(raw) || raw.length === 0) {
    return BELGO_ABOUT_PRODUCT_DEFAULT_SPECS.map(item => ({ ...item }));
  }
  return raw
    .filter(item => item && typeof item === 'object')
    .map(item => ({
      label: item.label ?? '',
      value: item.value ?? '',
      unit: item.unit ?? '',
      copy: item.copy ?? '',
    }));
};

const BODY_VI =
  'Belgo Amber mang trọn tinh thần thủ công của bia Bỉ: màu hổ phách sâu, vị mạch nha caramel mượt và chút cay nhẹ từ hoa bia noble. Công thức tôn trọng kỹ thuật ủ truyền thống, cho hương vị phức hợp nhưng vẫn sảng khoái, hậu vị giòn và đọng lâu.';

const BODY_EN =
  'Belgo Amber embodies the rich brewing traditions of Belgium, crafted with a deep amber hue, smooth caramel maltiness, and a touch of spice from noble hops. This well-balanced brew honors time-honored techniques, delivering a complex yet refreshing taste with a crisp, lingering finish.';

const BASE = {
  patternUrl: '/belgo/section-2/bg-pattern.png',
  crestUrl: '/belgo/section-2/icon-top.png',
  crestAlt: 'Belgő crest',
  illustrationUrl: '/belgo/section-2/bg.png',
  specsTitle: 'BEVERAGE SPECS',
};

const VI: BelgoAboutProductContent = {
  ...BASE,
  eyebrow: 'ABOUT PRODUCT',
  titleLines: [...BELGO_ABOUT_PRODUCT_DEFAULT_TITLE_LINES],
  body: BODY_VI,
  specs: BELGO_ABOUT_PRODUCT_DEFAULT_SPECS.map(item => ({ ...item })),
};

const EN: BelgoAboutProductContent = {
  ...BASE,
  eyebrow: 'ABOUT PRODUCT',
  titleLines: [...BELGO_ABOUT_PRODUCT_DEFAULT_TITLE_LINES],
  body: BODY_EN,
  specs: BELGO_ABOUT_PRODUCT_DEFAULT_SPECS.map(item => ({ ...item })),
};

/** Layers: mỗi dòng thông số là 1 folder (label / value / unit / copy). */
export const belgoSpecItemElements = (
  specs: BelgoSpecItem[]
): LayerElement[] => {
  const list = specs.length > 0 ? specs : BELGO_ABOUT_PRODUCT_DEFAULT_SPECS;
  return list.flatMap((item, i) => {
    const groupId = `spec${i}`;
    const groupLabel = item.label?.trim() || `Thông số ${i + 1}`;
    return [
      {
        key: `specs[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: Tag,
        fieldType: 'text' as const,
      },
      {
        key: `specs[${i}].value`,
        label: 'Giá trị',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `specs[${i}].unit`,
        label: 'Đơn vị',
        groupId,
        icon: Ruler,
        fieldType: 'text' as const,
      },
      {
        key: `specs[${i}].copy`,
        label: 'Mô tả',
        groupId,
        icon: FileText,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const belgoAboutProductDef: BlockDef<BelgoAboutProductContent> = {
  type: 'belgo_about_product',
  meta: {
    type: 'belgo_about_product',
    category: 'intro',
    style: 'luxury',
    tags: ['belgo', 'about', 'specs', 'beer'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-03',
    label: 'Belgo · About Product',
    accent: '#d72505',
    adminLabel: 'Belgo About Product',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Belgo About Product',
    aiLabelVi:
      'giới thiệu sản phẩm bia: nền hoạ tiết multiply, crest, tiêu đề Bebas nhiều dòng, minh hoạ blend + khối BEVERAGE SPECS (ABV/IBU/VOL) trôi parallax',
    aiLabelEn:
      'beer product intro: patterned multiply background, crest, multi-line Bebas title, blended illustration + parallax BEVERAGE SPECS rows (ABV/IBU/VOL)',
  },
  component: dynamic(() =>
    import('../../BelgoAboutProduct').then(m => m.BelgoAboutProduct)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'patternUrl',
      label: 'Hoạ tiết nền',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'backdrop',
      groupLabel: 'Nền & crest',
    },
    {
      key: 'crestUrl',
      label: 'Crest trên đầu',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'backdrop',
    },
    {
      key: 'crestAlt',
      label: 'Alt crest',
      icon: Tag,
      fieldType: 'text',
      groupId: 'backdrop',
    },
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    // titleLines expand trong LayersPanel.elementsForType(belgo_about_product)
    { key: 'titleLines', label: 'Thêm / quản lý tiêu đề', icon: ListChecks },
    { key: 'body', label: 'Mô tả', icon: FileText, fieldType: 'textarea' },
    {
      key: 'illustrationUrl',
      label: 'Ảnh minh hoạ',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'specsTitle',
      label: 'Tiêu đề khối specs',
      icon: Type,
      fieldType: 'text',
    },
    ...belgoSpecItemElements(BELGO_ABOUT_PRODUCT_DEFAULT_SPECS),
    { key: 'specs', label: 'Thêm / quản lý thông số', icon: ListChecks },
  ],
};
