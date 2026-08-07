/**
 * BlockDef cho `cg_radga_horizontal` — sticky pin + horizontal scrub gallery.
 * Port từ Codegrid cg-radga-horizontal-scroll-animation (discord 223).
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  CgRadgaHorizontalContent,
  CgRadgaHorizontalSlide,
} from '../../../types';
import type { BlockDef } from '../types';

export const CG_RADGA_HORIZONTAL_DEFAULT_SLIDES: CgRadgaHorizontalSlide[] = [
  {
    titleLine1: 'Refined Reception',
    titleLine2: 'Lasting Impact',
    imageUrl: '/cg-radga-horizontal/img1.jpeg',
    imageAlt: 'Refined Reception',
  },
  {
    titleLine1: 'Practical Luxury',
    titleLine2: 'Smart Living',
    imageUrl: '/cg-radga-horizontal/img2.jpeg',
    imageAlt: 'Practical Luxury',
  },
  {
    titleLine1: 'Modern Concrete',
    titleLine2: 'Warm Details',
    imageUrl: '/cg-radga-horizontal/img3.jpeg',
    imageAlt: 'Modern Concrete',
  },
  {
    titleLine1: 'Curved Elements',
    titleLine2: 'Modern Flow',
    imageUrl: '/cg-radga-horizontal/img4.jpeg',
    imageAlt: 'Curved Elements',
  },
  {
    titleLine1: 'Minimal Design',
    titleLine2: 'Natural Light',
    imageUrl: '/cg-radga-horizontal/img5.jpeg',
    imageAlt: 'Minimal Design',
  },
];

const VI: CgRadgaHorizontalContent = {
  slides: CG_RADGA_HORIZONTAL_DEFAULT_SLIDES,
  outroTitle: 'Shaping timeless spaces with contemporary vision',
};

const EN: CgRadgaHorizontalContent = {
  slides: [...CG_RADGA_HORIZONTAL_DEFAULT_SLIDES],
  outroTitle: 'Shaping timeless spaces with contemporary vision',
};

export const resolveCgRadgaHorizontalSlides = (
  content: CgRadgaHorizontalContent | null | undefined
): CgRadgaHorizontalSlide[] => {
  const raw = content?.slides;
  if (!Array.isArray(raw) || raw.length === 0) {
    return CG_RADGA_HORIZONTAL_DEFAULT_SLIDES.map(slide => ({ ...slide }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

export const cgRadgaHorizontalSlideElements = (
  slides: CgRadgaHorizontalSlide[]
): LayerElement[] => {
  const list = slides.length > 0 ? slides : CG_RADGA_HORIZONTAL_DEFAULT_SLIDES;
  return list.flatMap((slide, i) => {
    const groupId = `slide${i}`;
    const groupLabel =
      (slide.titleLine1 ?? '').trim().slice(0, 40) || `Slide ${i + 1}`;
    return [
      {
        key: `slides[${i}].titleLine1`,
        label: 'Dòng tiêu đề 1',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].titleLine2`,
        label: 'Dòng tiêu đề 2',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const cgRadgaHorizontalDef: BlockDef<CgRadgaHorizontalContent> = {
  type: 'cg_radga_horizontal',
  meta: {
    type: 'cg_radga_horizontal',
    category: 'gallery',
    style: 'modern',
    tags: ['gallery', 'horizontal', 'scroll', 'animation', 'codegrid', 'radga'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-07',
    label: 'RADGA Horizontal Scroll',
    accent: '#b4aea7',
    adminLabel: 'RADGA Horizontal Scroll',
    gradient: 'from-stone-400 to-stone-700',
    defaultName: 'RADGA Horizontal Scroll',
    aiLabelVi:
      'gallery cuộn ngang ghim sticky; tiêu đề trượt vào khi slide active, parallax ảnh',
    aiLabelEn:
      'sticky pinned horizontal scroll gallery; titles slide in on active slide, image parallax',
  },
  component: dynamic(() =>
    import('../../CgRadgaHorizontal').then(m => m.CgRadgaHorizontal)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...cgRadgaHorizontalSlideElements(CG_RADGA_HORIZONTAL_DEFAULT_SLIDES),
    {
      key: 'slides',
      label: 'Thêm / quản lý slide',
      icon: ListChecks,
    },
    {
      key: 'outroTitle',
      label: 'Outro',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
