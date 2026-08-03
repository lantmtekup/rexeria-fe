/**
 * BlockDef cho `belgo_our_products` — section sản phẩm bottle/glass + hover card.
 * Port từ apps/belgo OurProducts.tsx. Path A registry.
 */
import {
  ExternalLink,
  Image as ImageIcon,
  MousePointerClick,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  BelgoOurProductItem,
  BelgoOurProductsContent,
} from '../../../types';
import type { BlockDef } from '../types';

export const BELGO_OUR_PRODUCTS_DEFAULT_ITEMS: BelgoOurProductItem[] = [
  {
    label: 'BOTTLE 33CL',
    imageUrl: '/belgo/section-4/c1.png',
    hoverImageUrl: '/belgo/section-4/c1-hover.png',
    hoverTitle: 'BELGO TO YOUR DOORSTEP',
    cta: 'ORDER BEER NOW',
    href: '#',
  },
  {
    label: 'GLASS 33CL',
    imageUrl: '/belgo/section-4/c2.png',
    hoverImageUrl: '/belgo/section-4/c2-hover.png',
    hoverTitle: 'ENJOY DINING AT OUR RESTAURANT',
    cta: 'BOOK A TABLE',
    href: '#',
  },
];

/** Luôn trả về đúng 2 card (trái / phải) — merge với default nếu thiếu field. */
export const resolveBelgoOurProducts = (
  content: BelgoOurProductsContent | undefined
): [BelgoOurProductItem, BelgoOurProductItem] => {
  const merge = (
    item: Partial<BelgoOurProductItem> | undefined,
    fallback: BelgoOurProductItem
  ): BelgoOurProductItem => ({
    label: item?.label ?? fallback.label,
    imageUrl: item?.imageUrl ?? fallback.imageUrl,
    hoverImageUrl: item?.hoverImageUrl ?? fallback.hoverImageUrl,
    hoverTitle: item?.hoverTitle ?? fallback.hoverTitle,
    cta: item?.cta ?? fallback.cta,
    href: item?.href ?? fallback.href,
  });

  const raw = content?.products;
  const leftFallback = BELGO_OUR_PRODUCTS_DEFAULT_ITEMS[0];
  const rightFallback = BELGO_OUR_PRODUCTS_DEFAULT_ITEMS[1];

  if (!Array.isArray(raw) || raw.length === 0) {
    return [{ ...leftFallback }, { ...rightFallback }];
  }

  return [merge(raw[0], leftFallback), merge(raw[1], rightFallback)];
};

const BODY_VI =
  'Trải nghiệm hương vị phong phú của bia thủ công Bỉ. Đặt chai yêu thích hoặc ghé nhà hàng để thưởng thức bia cùng món ăn hoàn hảo!';

const BODY_EN =
  'Experience the rich flavors of Belgian craft beer. Order your favorite bottle or visit our restaurant for the perfect pairing of beer and cuisine!';

const BASE = {
  eyebrow: 'OUR PRODUCTS',
  title: 'ONE BOTTLE, ONE GLASS – A WORLD OF CRAFT BEER IN YOUR HANDS!',
};

const VI: BelgoOurProductsContent = {
  ...BASE,
  body: BODY_VI,
  products: BELGO_OUR_PRODUCTS_DEFAULT_ITEMS.map(item => ({ ...item })),
};

const EN: BelgoOurProductsContent = {
  ...BASE,
  body: BODY_EN,
  products: BELGO_OUR_PRODUCTS_DEFAULT_ITEMS.map(item => ({ ...item })),
};

/** Layers: 2 card cố định (trái bottle / phải glass). */
export const belgoOurProductItemElements = (): LayerElement[] => {
  const slots: Array<{ groupLabel: string }> = [
    { groupLabel: 'Card trái (Bottle)' },
    { groupLabel: 'Card phải (Glass)' },
  ];

  return slots.flatMap(({ groupLabel }, i) => {
    const groupId = `product${i}`;
    return [
      {
        key: `products[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: Tag,
        fieldType: 'text' as const,
      },
      {
        key: `products[${i}].imageUrl`,
        label: 'Ảnh sản phẩm',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `products[${i}].hoverImageUrl`,
        label: 'Ảnh hover',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `products[${i}].hoverTitle`,
        label: 'Tiêu đề hover',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `products[${i}].cta`,
        label: 'Nút CTA',
        groupId,
        icon: MousePointerClick,
        fieldType: 'text' as const,
      },
      {
        key: `products[${i}].href`,
        label: 'Link CTA',
        groupId,
        icon: ExternalLink,
        fieldType: 'link' as const,
      },
    ];
  });
};

export const belgoOurProductsDef: BlockDef<BelgoOurProductsContent> = {
  type: 'belgo_our_products',
  meta: {
    type: 'belgo_our_products',
    category: 'intro',
    style: 'luxury',
    tags: ['belgo', 'products', 'beer', 'hover'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-03',
    label: 'Belgo · Our Products',
    accent: '#e4ddcf',
    adminLabel: 'Belgo Our Products',
    gradient: 'from-neutral-950 to-black',
    defaultName: 'Belgo Our Products',
    aiLabelVi:
      'section sản phẩm Belgo: 2 card bottle/glass hover flip desktop, layout xếp dọc mobile, copy giữa reveal GSAP',
    aiLabelEn:
      'Belgo products section: two bottle/glass hover-flip cards on desktop, stacked mobile layout, center copy with GSAP reveal',
  },
  component: dynamic(() =>
    import('../../BelgoOurProducts').then(m => m.BelgoOurProducts)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      icon: Tag,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Nội dung giữa',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
    },
    {
      key: 'body',
      label: 'Mô tả',
      icon: Type,
      fieldType: 'textarea',
      groupId: 'copy',
    },
    ...belgoOurProductItemElements(),
  ],
};
