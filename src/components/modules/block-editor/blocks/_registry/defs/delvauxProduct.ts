/**
 * BlockDef cho `delvaux_product` — port section `.product-detail` của
 * delvaux-clone (https://delvaux.alphacreative.vn/): ảnh sản phẩm lớn căn giữa
 * 100vh + quầng sáng màu + hotspot tròn trên ảnh; bấm hotspot → panel trắng
 * trượt vào từ phải (tiêu đề serif + mô tả + media). Entrance: ảnh scale 2→1
 * scrub theo scroll (animate-zoomin gốc). GSAP R1–R6 qua useBlockMotion.
 *
 * Component: `blocks/DelvauxProduct.tsx`. Đăng ký Path A.
 *
 * Default dùng asset + copy thật của trang gốc (thuộc sở hữu dự án), đặt
 * trong `public/delvaux/`.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { DelvauxProductContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: DelvauxProductContent = {
  imageUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/d157390f-9847-44a4-a52d-40f08e83ac94/delvaux-product-1.png',
  glowColor: '#a77c63',
  hotspots: [
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
  ],
};

const EN: DelvauxProductContent = { ...VI };

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
    },
    {
      key: 'hotspot-0-title',
      label: 'Hotspot 1 - Tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'hotspot-0-desc',
      label: 'Hotspot 1 - Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'hotspot-1-title',
      label: 'Hotspot 2 - Tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'hotspot-1-desc',
      label: 'Hotspot 2 - Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'hotspot-2-title',
      label: 'Hotspot 3 - Tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'hotspot-2-desc',
      label: 'Hotspot 3 - Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
  ],
};
