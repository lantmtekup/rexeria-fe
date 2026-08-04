/**
 * BlockDef cho `gambit_related_products` — port `RelatedProducts` của
 * apps/gambit-delvaux: lưới sản phẩm gợi ý (2 cột mobile / 4 cột desktop) trồi
 * lên theo stagger khi vào khung nhìn, kèm thanh CTA quay lại ở đáy. Path A.
 *
 * Layers: mỗi sản phẩm = 1 folder (ảnh / tên / chất liệu), cộng manager
 * `products` (thêm-xoá sản phẩm qua ElementToolbar) và cụm CTA (chữ + link).
 *
 * Asset mặc định nằm ở `public/gambit/` (dùng chung với các block Gambit khác).
 */
import {
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  Tag,
  Type,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type {
  GambitRelatedProductItem,
  GambitRelatedProductsContent,
} from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_PRODUCTS: GambitRelatedProductItem[] = [
  {
    imageUrl: '/gambit/p8.png',
    name: 'Cool Box Mini',
    material: 'Taurillon Soft',
  },
  {
    imageUrl: '/gambit/p9.png',
    name: 'Lingot',
    material: 'Alpina Calf',
  },
  {
    imageUrl: '/gambit/p10.png',
    name: 'Pin D Multifonctions',
    material: 'Taurillon Soft',
  },
  {
    imageUrl: '/gambit/p11.png',
    name: 'Pin Swing',
    material: 'Taurillon Soft',
  },
];

/** Default dùng chung cho BlockDef + component (fallback khi field CMS rỗng). */
export const GAMBIT_RELATED_PRODUCTS_DEFAULTS = {
  backLabel: 'Back To Buy Brillant Mini',
  backHref: '',
} as const;

/** Sản phẩm mới khi bấm "Thêm sản phẩm" trong ElementToolbar. */
export const GAMBIT_RELATED_NEW_PRODUCT: GambitRelatedProductItem = {
  imageUrl: '/gambit/p8.png',
  name: 'Tên sản phẩm',
  material: 'Chất liệu',
};

/**
 * Sản phẩm hợp lệ từ content (block + Lớp + toolbar dùng CHUNG hàm này để
 * không lệch nhau); rỗng/sai shape → danh sách mặc định.
 */
export function resolveGambitRelatedProducts(
  content: GambitRelatedProductsContent | undefined
): GambitRelatedProductItem[] {
  const raw = content?.products;
  const list = Array.isArray(raw)
    ? raw.filter(
        (p): p is GambitRelatedProductItem =>
          !!p && typeof p === 'object' && typeof p.name === 'string'
      )
    : [];
  return list.length > 0 ? list : DEFAULT_PRODUCTS;
}

/** Layers folders — 1 group / sản phẩm. */
export const gambitRelatedProductElements = (
  products: GambitRelatedProductItem[]
): LayerElement[] => {
  const list = products.length > 0 ? products : DEFAULT_PRODUCTS;
  return list.flatMap((product, i) => {
    const groupId = `product${i}`;
    const groupLabel = product.name?.trim()
      ? `${i + 1}. ${product.name.trim().slice(0, 32)}`
      : `Sản phẩm ${i + 1}`;

    return [
      {
        key: `products[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `products[${i}].name`,
        label: 'Tên',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `products[${i}].material`,
        label: 'Chất liệu',
        groupId,
        icon: Tag,
        fieldType: 'text' as const,
      },
    ];
  });
};

const VI: GambitRelatedProductsContent = {
  products: DEFAULT_PRODUCTS,
  ...GAMBIT_RELATED_PRODUCTS_DEFAULTS,
};
const EN: GambitRelatedProductsContent = {
  products: DEFAULT_PRODUCTS,
  ...GAMBIT_RELATED_PRODUCTS_DEFAULTS,
};

export const gambitRelatedProductsDef: BlockDef<GambitRelatedProductsContent> =
  {
    type: 'gambit_related_products',
    meta: {
      type: 'gambit_related_products',
      label: 'Product - Related Grid',
      accent: '#111111',
      adminLabel: 'Product - Related Grid',
      gradient: 'from-neutral-100 to-white',
      defaultName: 'Product - Related Grid',
      aiLabelVi:
        'lưới sản phẩm gợi ý dán 1 khung hình: từng túi trồi lên so le, nhãn tên + chất liệu hiện sau, thanh CTA đen quay lại ở đáy',
      aiLabelEn:
        'sticky related-products grid: bags rise in with a stagger, name + material labels follow, black back-to-buy CTA bar pinned at the bottom',
    },
    // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
    component: dynamic(() =>
      import('../../GambitRelatedProducts').then(m => m.GambitRelatedProducts)
    ),
    defaultContent: { vi: VI, en: EN },
    elements: [
      ...gambitRelatedProductElements(DEFAULT_PRODUCTS),
      {
        key: 'products',
        label: 'Thêm / quản lý sản phẩm',
        icon: List,
      },
      {
        key: 'backLabel',
        label: 'Chữ nút quay lại',
        icon: Type,
        fieldType: 'text',
        groupId: 'back',
        groupLabel: 'Thanh quay lại',
      },
      {
        key: 'backHref',
        label: 'Link nút quay lại',
        icon: LinkIcon,
        fieldType: 'link',
        groupId: 'back',
      },
    ],
  };
