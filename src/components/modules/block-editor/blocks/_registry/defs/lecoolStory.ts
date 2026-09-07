/**
 * BlockDef cho `lecool_story` — section 3 panel Le Cool Move (Design / Details
 * / Products) dùng chung rail menu sticky.
 * Port từ apps/ecommerce-landing ProductStorySection.tsx. Path A registry.
 *
 * Các mảng (nhãn menu, đoạn văn, thẻ ảnh, hotspot, ảnh sản phẩm, màu, thông số,
 * hành động) expand thành slot trong LayersPanel.elementsForType — ở đây chỉ
 * khai field phẳng.
 */
import {
  Crown,
  Image as ImageIcon,
  Tag,
  TextCursorInput,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LecoolStoryContent } from '../../../types';
import {
  DEFAULT_DESIGN_CARDS,
  DEFAULT_DESIGN_PARAGRAPHS,
  DEFAULT_DETAIL_ROWS,
  DEFAULT_MENU_LABELS,
  DEFAULT_PRODUCT_ACTIONS,
  DEFAULT_PRODUCT_COLORS,
  DEFAULT_PRODUCT_IMAGES,
  DEFAULT_PRODUCT_SPECS,
} from '../../lecoolStoryData';
import type { BlockDef } from '../types';

const VI: LecoolStoryContent = {
  crownUrl: '/lecool/hero-emblem.png',
  menuLabels: [...DEFAULT_MENU_LABELS],
  designHeadingAccent: 'Le Cool Move',
  designHeadingRest: ' was designed accordingly',
  designParagraphs: [...DEFAULT_DESIGN_PARAGRAPHS],
  designCards: DEFAULT_DESIGN_CARDS.map(card => ({ ...card })),
  bannerHeading: 'As you move, the bag moves with you',
  bannerSub: 'The rest is movement, colour, and excellent timing.',
  bannerImageUrl: '/lecool/story/design-banner.jpg',
  detailsImageUrl: '/lecool/story/details-bag.jpg',
  detailRows: DEFAULT_DETAIL_ROWS.map(row => ({ ...row })),
  productImages: [...DEFAULT_PRODUCT_IMAGES],
  productName: 'Cool Move',
  productColors: DEFAULT_PRODUCT_COLORS.map(color => ({ ...color })),
  productSpecs: DEFAULT_PRODUCT_SPECS.map(spec => ({ ...spec })),
  productActions: DEFAULT_PRODUCT_ACTIONS.map(action => ({ ...action })),
  addToCartLabel: 'Add to cart',
};

const EN: LecoolStoryContent = { ...VI };

export const lecoolStoryDef: BlockDef<LecoolStoryContent> = {
  type: 'lecool_story',
  meta: {
    type: 'lecool_story',
    label: 'Le Cool Move · Story',
    accent: '#B68D45',
    adminLabel: 'Le Cool Move Story',
    gradient: 'from-amber-700 to-neutral-300',
    defaultName: 'Le Cool Move Story',
    aiLabelVi:
      'section 3 panel Le Cool Move: rail menu sticky (Design/Details/Products), strip ảnh cuộn ngang theo scroll, ảnh hotspot phóng to, và panel sản phẩm có swatch màu + thông số + nút mua',
    aiLabelEn:
      'Le Cool Move three-panel story: sticky rail menu (Design/Details/Products), scroll-driven horizontal image strip, zoomable hotspot image, and a product panel with colour swatches, specs and buy actions',
  },
  component: dynamic(() =>
    import('../../LecoolStory').then(m => m.LecoolStory)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'crownUrl', label: 'Vương miện', icon: Crown, fieldType: 'image' },
    // menuLabels[i] expand in LayersPanel.elementsForType(lecool_story)
    {
      key: 'designHeadingAccent',
      label: 'Tiêu đề · phần vàng',
      groupId: 'designHeading',
      groupLabel: 'Design · Tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'designHeadingRest',
      label: 'Tiêu đề · phần đen',
      groupId: 'designHeading',
      icon: Type,
      fieldType: 'text',
    },
    // designParagraphs[i] + designCards[i] expand in LayersPanel
    {
      key: 'bannerHeading',
      label: 'Tiêu đề',
      groupId: 'banner',
      groupLabel: 'Design · Banner vàng',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'bannerSub',
      label: 'Mô tả',
      groupId: 'banner',
      icon: TextCursorInput,
      fieldType: 'text',
    },
    {
      key: 'bannerImageUrl',
      label: 'Ảnh',
      groupId: 'banner',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'detailsImageUrl',
      label: 'Details · Ảnh túi',
      icon: ImageIcon,
      fieldType: 'image',
    },
    // detailRows[i] + productImages[i] + productColors[i] + productSpecs[i]
    // + productActions[i] expand in LayersPanel
    {
      key: 'productName',
      label: 'Tên sản phẩm',
      groupId: 'product',
      groupLabel: 'Products · Thẻ mua',
      icon: Tag,
      fieldType: 'text',
    },
    {
      key: 'addToCartLabel',
      label: 'Nhãn nút mua',
      groupId: 'product',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
