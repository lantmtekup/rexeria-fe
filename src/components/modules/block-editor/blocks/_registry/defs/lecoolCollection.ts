/**
 * BlockDef cho `lecool_collection` — lưới thẻ sản phẩm Le Cool Move.
 * Port từ apps/ecommerce-landing CollectionSection.tsx. Path A registry.
 *
 * `items[i].*` expand trong LayersPanel.elementsForType; ở đây chỉ khai phần
 * đầu section + nhãn nút mua dùng chung.
 */
import {
  ArrowRight,
  Crown,
  Link2,
  ShoppingBag,
  TextCursorInput,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LecoolCollectionContent } from '../../../types';
import { DEFAULT_COLLECTION_ITEMS } from '../../lecoolCollectionData';
import type { BlockDef } from '../types';

const VI: LecoolCollectionContent = {
  crownUrl: '/lecool/hero-emblem.png',
  title: 'The Collection',
  subtitle: 'Enjoy complimentary shipping on all online orders.',
  allProductsLabel: 'All products',
  // Rỗng = "Không link" — author chọn trang / block đích bằng link picker.
  allProductsHref: '',
  addToCartLabel: 'Add to cart',
  items: DEFAULT_COLLECTION_ITEMS.map(item => ({
    ...item,
    colors: item.colors?.map(color => ({ ...color })),
  })),
};

const EN: LecoolCollectionContent = { ...VI };

export const lecoolCollectionDef: BlockDef<LecoolCollectionContent> = {
  type: 'lecool_collection',
  meta: {
    type: 'lecool_collection',
    label: 'Le Cool Move · Collection',
    accent: '#B68D45',
    adminLabel: 'Le Cool Move Collection',
    gradient: 'from-white to-amber-700',
    defaultName: 'Le Cool Move Collection',
    aiLabelVi:
      'lưới sản phẩm Le Cool Move: tiêu đề + link xem tất cả, mỗi thẻ có ảnh đổi theo swatch màu, nút wishlist và nút thêm vào giỏ; thẻ hiện dần khi cuộn tới',
    aiLabelEn:
      'Le Cool Move product grid: heading with an all-products link, cards whose image swaps with the colour swatch, a wishlist toggle and an add-to-cart button; cards fade up on scroll',
  },
  component: dynamic(() =>
    import('../../LecoolCollection').then(m => m.LecoolCollection)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'crownUrl',
      label: 'Vương miện',
      groupId: 'head',
      groupLabel: 'Đầu section',
      icon: Crown,
      fieldType: 'image',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      groupId: 'head',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'subtitle',
      label: 'Mô tả',
      groupId: 'head',
      icon: TextCursorInput,
      fieldType: 'text',
    },
    {
      key: 'allProductsLabel',
      label: 'Nhãn link',
      groupId: 'allProducts',
      groupLabel: 'Link “All products”',
      icon: ArrowRight,
      fieldType: 'text',
    },
    {
      key: 'allProductsHref',
      label: 'Đích đến',
      groupId: 'allProducts',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'addToCartLabel',
      label: 'Nhãn nút mua (dùng chung mọi thẻ)',
      icon: ShoppingBag,
      fieldType: 'text',
    },
    // items[i].* expand in LayersPanel.elementsForType(lecool_collection)
  ],
};
