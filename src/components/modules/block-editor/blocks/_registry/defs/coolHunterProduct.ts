/**
 * BlockDef cho `cool_hunter_product` — product Cool Hunter: mask bg scale +
 * tiêu đề + bàn sản phẩm + panel chữ scrub. Port từ apps/cool-hunter
 * ProductSection.tsx. Path A registry.
 */
import { Image as ImageIcon, Tag, TextCursorInput, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CoolHunterProductContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: CoolHunterProductContent = {
  title: 'Interior Design',
  body: "There's a version of this project that could have been beautiful and forgettable, another polished lake house with good bones and safe choices. What makes the Lake Wehapa retreat compelling is its refusal of the obvious at every turn. The architecture looks settled, as though it grew there; the interiors feel both scholarly and deeply liveable. The whole compound earns what Brown calls its rate of return: they live in every square inch of that house.",
  bgUrl: '/cool-hunter/bg-product.png',
  productUrl: '/cool-hunter/product.png',
  productAlt:
    'A round dining table with a whitewashed top and stone pedestal base',
  label: '03 - Architecture',
};

const EN: CoolHunterProductContent = {
  ...VI,
};

export const coolHunterProductDef: BlockDef<CoolHunterProductContent> = {
  type: 'cool_hunter_product',
  meta: {
    type: 'cool_hunter_product',
    label: 'Cool Hunter · Product',
    accent: '#111111',
    adminLabel: 'Cool Hunter Product',
    gradient: 'from-neutral-500 to-neutral-800',
    defaultName: 'Cool Hunter Product',
    aiLabelVi:
      'product Cool Hunter: mask bg scale + tiêu đề + bàn sản phẩm + panel chữ scrub',
    aiLabelEn:
      'Cool Hunter product: mask bg scale + title + product table + copy panel scrub',
  },
  component: dynamic(() =>
    import('../../CoolHunterProduct').then(m => m.CoolHunterProduct)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Nội dung',
    },
    {
      key: 'body',
      label: 'Đoạn văn',
      icon: TextCursorInput,
      fieldType: 'textarea',
      groupId: 'copy',
    },
    {
      key: 'bgUrl',
      label: 'Mask nền',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
      groupLabel: 'Ảnh',
    },
    {
      key: 'productUrl',
      label: 'Ảnh sản phẩm',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
    },
    {
      key: 'label',
      label: 'Nhãn dọc',
      icon: Tag,
      fieldType: 'text',
    },
  ],
};
