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

import type { LayerElement } from '../../../LayersPanel';
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
  ctaHref: '/projects',
  navLinks: [
    { label: 'Dự án', href: '/projects' },
    { label: 'Studio', href: '/studio' },
    { label: 'Liên hệ', href: '/contact' },
  ],
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
  ctaHref: '/projects',
  navLinks: [
    { label: 'Projects', href: '/projects' },
    { label: 'Studio', href: '/studio' },
    { label: 'Contact', href: '/contact' },
  ],
};

/**
 * Nav link là mảng động → không biểu diễn được trong `elements` tĩnh.
 * `LayersPanel.elementsForType` gọi helper này để expand `navLinks[i]`
 * (pattern `delvauxSubnavLinkElements`).
 */
export const aesthaNavLinkElements = (
  links: Array<{ label: string; href: string }>
): LayerElement[] =>
  links.flatMap((_, i) => [
    {
      key: `navLinks[${i}].label`,
      label: 'Nhãn',
      groupId: `nav${i}`,
      groupLabel: `Nav ${i + 1}`,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `navLinks[${i}].href`,
      label: 'Link',
      groupId: `nav${i}`,
      icon: Link2,
      fieldType: 'text' as const,
    },
  ]);

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
    // Phần tĩnh. `navLinks` được LayersPanel expand động qua
    // `aesthaNavLinkElements` — xem branch `framer_aestha_editorial` ở đó.
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
        fieldType: 'text',
      },
    ],
  };
