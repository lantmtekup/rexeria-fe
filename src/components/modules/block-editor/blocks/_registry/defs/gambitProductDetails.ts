/**
 * BlockDef cho `gambit_product_details` — port `ProductDetails` của
 * apps/gambit-delvaux: sân khấu dán với dải ảnh cuộn ngang theo scroll dọc,
 * cạnh panel thông tin (màu / size / accordion / hành động). Path A.
 *
 * Layers: các cụm cố định (tên sản phẩm, kích thước) + 1 folder / ảnh, / màu,
 * / size, / accordion, / hành động; cộng 5 manager mảng trên ElementToolbar.
 */
import {
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListChecks,
  Palette,
  Pilcrow,
  Ruler,
  Tag,
  Type,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type {
  GambitProductDetailsAccordion,
  GambitProductDetailsAction,
  GambitProductDetailsColor,
  GambitProductDetailsContent,
} from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_GALLERY: string[] = [
  '/gambit/p1.png',
  '/gambit/p2.png',
  '/gambit/p3.png',
  '/gambit/p4.png',
  '/gambit/p5.png',
  '/gambit/p6.png',
  '/gambit/p7.png',
];

const DEFAULT_COLORS: GambitProductDetailsColor[] = [
  { label: 'Kiwi', hex: '#C5B45A' },
  { label: 'Noir', hex: '#1A1A1A' },
  { label: 'Ivoire', hex: '#F2EDE6' },
  { label: 'Cognac', hex: '#A67B5B' },
];

const DEFAULT_SIZES: string[] = ['Nano', 'Mini', 'PM', 'MM'];

const DEFAULT_ACCORDIONS: GambitProductDetailsAccordion[] = [
  {
    title: 'Details',
    body: 'Smooth Box Calf leather with hand-embroidered embossed stars. Natural calfskin lining, gold metal hardware, removable and adjustable leather shoulder strap.',
  },
  {
    title: 'Care',
    body: 'Store in the protective pouch provided. Avoid prolonged exposure to direct sunlight and humidity. Clean with a soft, dry cloth.',
  },
  {
    title: 'Shipping And Returns',
    body: 'Complimentary shipping on all orders. Returns accepted within 14 days of delivery in original condition with packaging.',
  },
];

const DEFAULT_ACTIONS: GambitProductDetailsAction[] = [
  { label: 'Contact Us', icon: 'plane', href: '' },
  { label: 'Book An Appointment', icon: 'chat', href: '' },
  { label: 'Find A Boutique', icon: 'pin', href: '' },
  {
    label: 'Check Availability In Store',
    icon: 'search',
    href: '',
    primary: true,
  },
  { label: 'Compare Size', icon: 'arrow', href: '' },
];

/** Item mới khi bấm "Thêm …" trong ElementToolbar. */
export const GAMBIT_DETAILS_NEW_IMAGE = '/gambit/p1.png';
export const GAMBIT_DETAILS_NEW_COLOR: GambitProductDetailsColor = {
  label: 'Màu mới',
  hex: '#888888',
};
export const GAMBIT_DETAILS_NEW_SIZE = 'Size';
export const GAMBIT_DETAILS_NEW_ACCORDION: GambitProductDetailsAccordion = {
  title: 'Mục mới',
  body: 'Nội dung mô tả cho mục này.',
};
export const GAMBIT_DETAILS_NEW_ACTION: GambitProductDetailsAction = {
  label: 'Hành động mới',
  icon: 'arrow',
  href: '',
};

/** Nhãn icon cho ElementToolbar (giá trị = `GambitProductDetailsActionIcon`). */
export const GAMBIT_DETAILS_ACTION_ICONS = [
  { value: 'plane', label: 'Máy bay giấy' },
  { value: 'chat', label: 'Tin nhắn' },
  { value: 'pin', label: 'Ghim bản đồ' },
  { value: 'search', label: 'Kính lúp' },
  { value: 'arrow', label: 'Mũi tên' },
] as const;

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

/**
 * Mảng hợp lệ từ content (block + Lớp + toolbar dùng CHUNG các hàm này để
 * không lệch nhau); rỗng/sai shape → mặc định.
 */
export function resolveGambitDetailsGallery(
  content: GambitProductDetailsContent | undefined
): string[] {
  const list = Array.isArray(content?.galleryImages)
    ? content.galleryImages.filter(isNonEmptyString)
    : [];
  return list.length > 0 ? list : DEFAULT_GALLERY;
}

export function resolveGambitDetailsColors(
  content: GambitProductDetailsContent | undefined
): GambitProductDetailsColor[] {
  const list = Array.isArray(content?.colors)
    ? content.colors.filter(
        (c): c is GambitProductDetailsColor =>
          !!c && typeof c === 'object' && typeof c.label === 'string'
      )
    : [];
  return list.length > 0 ? list : DEFAULT_COLORS;
}

export function resolveGambitDetailsSizes(
  content: GambitProductDetailsContent | undefined
): string[] {
  const list = Array.isArray(content?.sizes)
    ? content.sizes.filter(isNonEmptyString)
    : [];
  return list.length > 0 ? list : DEFAULT_SIZES;
}

export function resolveGambitDetailsAccordions(
  content: GambitProductDetailsContent | undefined
): GambitProductDetailsAccordion[] {
  const list = Array.isArray(content?.accordions)
    ? content.accordions.filter(
        (a): a is GambitProductDetailsAccordion =>
          !!a && typeof a === 'object' && typeof a.title === 'string'
      )
    : [];
  return list.length > 0 ? list : DEFAULT_ACCORDIONS;
}

export function resolveGambitDetailsActions(
  content: GambitProductDetailsContent | undefined
): GambitProductDetailsAction[] {
  const list = Array.isArray(content?.actions)
    ? content.actions.filter(
        (a): a is GambitProductDetailsAction =>
          !!a && typeof a === 'object' && typeof a.label === 'string'
      )
    : [];
  return list.length > 0 ? list : DEFAULT_ACTIONS;
}

/** Layers — cụm cố định + 1 folder cho mỗi phần tử mảng. */
export const gambitDetailsElements = (
  content: GambitProductDetailsContent | undefined
): LayerElement[] => {
  const gallery = resolveGambitDetailsGallery(content);
  const colors = resolveGambitDetailsColors(content);
  const sizes = resolveGambitDetailsSizes(content);
  const accordions = resolveGambitDetailsAccordions(content);
  const actions = resolveGambitDetailsActions(content);

  return [
    {
      key: 'title',
      label: 'Tên sản phẩm',
      groupId: 'product',
      groupLabel: 'Tên sản phẩm',
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: 'subtitle',
      label: 'Chất liệu',
      groupId: 'product',
      icon: Tag,
      fieldType: 'text' as const,
    },
    {
      key: 'dimensions',
      label: 'Kích thước',
      groupId: 'dimensions',
      groupLabel: 'Kích thước',
      icon: Ruler,
      fieldType: 'text' as const,
    },
    {
      key: 'dimensionsNote',
      label: 'Chú thích',
      groupId: 'dimensions',
      icon: Ruler,
      fieldType: 'text' as const,
    },
    ...gallery.map((_, i) => ({
      key: `galleryImages[${i}]`,
      label: `Ảnh ${i + 1}`,
      groupId: 'gallery',
      ...(i === 0 ? { groupLabel: 'Dải ảnh' } : {}),
      icon: ImageIcon,
      fieldType: 'image' as const,
    })),
    // groupId KHÔNG được trùng key của manager ('colors'/'sizes'): folder node
    // dùng groupId làm React key, leaf dùng element.key → trùng là duplicate key.
    ...colors.map((color, i) => ({
      key: `colors[${i}].label`,
      label: color.label?.trim() || `Màu ${i + 1}`,
      groupId: 'colorList',
      ...(i === 0 ? { groupLabel: 'Màu' } : {}),
      icon: Palette,
      fieldType: 'text' as const,
    })),
    ...sizes.map((size, i) => ({
      key: `sizes[${i}]`,
      label: size?.trim() || `Size ${i + 1}`,
      groupId: 'sizeList',
      ...(i === 0 ? { groupLabel: 'Size' } : {}),
      icon: Ruler,
      fieldType: 'text' as const,
    })),
    ...accordions.flatMap((item, i) => {
      const groupId = `accordion${i}`;
      const groupLabel = item.title?.trim()
        ? `${i + 1}. ${item.title.trim().slice(0, 32)}`
        : `Mục ${i + 1}`;
      return [
        {
          key: `accordions[${i}].title`,
          label: 'Tiêu đề',
          groupId,
          groupLabel,
          icon: Type,
          fieldType: 'text' as const,
        },
        {
          key: `accordions[${i}].body`,
          label: 'Nội dung',
          groupId,
          icon: Pilcrow,
          fieldType: 'textarea' as const,
        },
      ];
    }),
    ...actions.flatMap((action, i) => {
      const groupId = `action${i}`;
      const groupLabel = action.label?.trim()
        ? `${i + 1}. ${action.label.trim().slice(0, 32)}`
        : `Hành động ${i + 1}`;
      return [
        {
          key: `actions[${i}].label`,
          label: 'Nhãn',
          groupId,
          groupLabel,
          icon: Tag,
          fieldType: 'text' as const,
        },
        {
          key: `actions[${i}].href`,
          label: 'Link',
          groupId,
          icon: LinkIcon,
          fieldType: 'link' as const,
        },
      ];
    }),
  ];
};

const VI: GambitProductDetailsContent = {
  title: 'Brillant Mini',
  subtitle: 'Box Calf',
  dimensions: 'W 20 / H 16 / D 11.5 cm',
  dimensionsNote: '(in)',
  galleryImages: DEFAULT_GALLERY,
  colors: DEFAULT_COLORS,
  sizes: DEFAULT_SIZES,
  accordions: DEFAULT_ACCORDIONS,
  actions: DEFAULT_ACTIONS,
};

const EN: GambitProductDetailsContent = { ...VI };

export const gambitProductDetailsDef: BlockDef<GambitProductDetailsContent> = {
  type: 'gambit_product_details',
  meta: {
    type: 'gambit_product_details',
    label: 'Product - Details Gallery',
    accent: '#111111',
    adminLabel: 'Product - Details Gallery',
    gradient: 'from-neutral-200 to-white',
    defaultName: 'Product - Details Gallery',
    aiLabelVi:
      'trang chi tiết sản phẩm: dải ảnh cuộn ngang theo scroll + panel chọn màu/size, accordion và danh sách hành động (bottom sheet trên mobile)',
    aiLabelEn:
      'product detail stage: horizontally scrubbed image strip beside a spec panel with color/size swatches, accordions and action list (bottom sheet on mobile)',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../GambitProductDetails').then(m => m.GambitProductDetails)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...gambitDetailsElements(VI),
    { key: 'galleryImages', label: 'Thêm / quản lý ảnh', icon: ImageIcon },
    { key: 'colors', label: 'Thêm / quản lý màu', icon: Palette },
    { key: 'sizes', label: 'Thêm / quản lý size', icon: Ruler },
    { key: 'accordions', label: 'Thêm / quản lý accordion', icon: ListChecks },
    { key: 'actions', label: 'Thêm / quản lý hành động', icon: List },
  ],
};
