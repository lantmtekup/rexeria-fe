/**
 * BlockDef cho `framer_aestha_editorial` — cột brand sticky trái + stack 3 ảnh
 * so le phải + CTA phủ trắng cuối. Clone recon từ
 * `https://significant-sheet-415363.framer.app/`. Path A registry.
 */
import {
  ImageIcon,
  Link2,
  MousePointerClick,
  Pilcrow,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { FramerAesthaEditorialContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerAesthaEditorialContent = {
  brand: 'RAMSA',
  tagline: 'Nơi thanh lịch cổ điển gặp gỡ tinh tế hiện đại.',
  scrollLabel: 'scroll',
  description:
    'Tọa lạc giữa lòng đô thị, dự án là hiện thân cho phong cách sống đẳng cấp — nơi mỗi chi tiết đều được tinh chỉnh cho nhịp sống hiện đại.',
  image1Url:
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
  image2Url:
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80',
  image3Url:
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
  ctaText: 'KHÁM PHÁ THÊM',
  // `href` để RỖNG có chủ đích — KHÔNG điền path demo (`/projects/…`): path đó
  // 404 trên site public (path thật là `/p/{rootSlug}/{slug}`). Author gán link
  // qua link-picker của toolbar (`fieldType: 'link'`), hỗ trợ 3 case: cuộn tới
  // section · mở tab mới (URL ngoài) · chuyển trang trong template.
  ctaHref: '',
};

const EN: FramerAesthaEditorialContent = {
  brand: 'RAMSA',
  tagline: 'Where classic elegance meets modern refinement.',
  scrollLabel: 'scroll',
  description:
    'Nestled in the heart of the city, the project embodies refined urban living — every detail tuned to the demands of modern luxury.',
  image1Url:
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
  image2Url:
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80',
  image3Url:
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
  ctaText: 'EXPLORE MORE',
  ctaHref: '',
};

// `aesthaNavLinkElements` đã chuyển sang `defs/aesthaNav.ts` cùng lúc nav tách
// thành block riêng `aestha_nav`.

export const framerAesthaEditorialDef: BlockDef<FramerAesthaEditorialContent> =
  {
    type: 'framer_aestha_editorial',
    meta: {
      type: 'framer_aestha_editorial',
      category: 'intro',
      style: 'luxury',
      tags: ['clone', 'framer', 'editorial'],
      status: 'ready',
      responsive: true,
      updatedAt: '2026-07-05',
      label: 'Aestha Editorial',
      accent: '#1A1A1A',
      adminLabel: 'Editorial (Aestha)',
      gradient: 'from-neutral-700 to-neutral-900',
      defaultName: 'Editorial',
      aiLabelVi:
        'trang editorial: cột brand sticky trái + stack 3 ảnh so le phải',
      aiLabelEn:
        'editorial layout: sticky brand column left + staggered image stack right',
    },
    component: dynamic(() =>
      import('../../FramerAesthaEditorial').then(m => m.FramerAesthaEditorial)
    ),
    defaultContent: { vi: VI, en: EN },
    // Không còn mảng động nào → LayersPanel dùng thẳng fallback registry.
    elements: [
      { key: 'brand', label: 'Brand', icon: Type, fieldType: 'text' },
      // `scrollLabel` còn trong content type + default nhưng block KHÔNG render
      // → cố ý không đưa vào Layers để tránh layer chết.
      { key: 'tagline', label: 'Tagline', icon: Pilcrow, fieldType: 'text' },
      {
        key: 'description',
        label: 'Mô tả',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
      { key: 'image1Url', label: 'Ảnh 1', icon: ImageIcon, fieldType: 'image' },
      { key: 'image2Url', label: 'Ảnh 2', icon: ImageIcon, fieldType: 'image' },
      { key: 'image3Url', label: 'Ảnh 3', icon: ImageIcon, fieldType: 'image' },
      {
        key: 'ctaText',
        label: 'Nhãn CTA',
        groupId: 'cta',
        groupLabel: 'Nút CTA',
        icon: MousePointerClick,
        fieldType: 'text',
      },
      {
        key: 'ctaHref',
        label: 'Link CTA',
        groupId: 'cta',
        icon: Link2,
        fieldType: 'link',
      },
    ],
  };
