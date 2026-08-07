/**
 * BlockDef cho `cg_modular_slider` — title strip + dual-clip image carousel.
 * Port từ CodeGrid cg-modular-slider (discord 164). Bỏ nav/footer góc trang.
 *
 * `slides[]` động — thêm/xoá qua Layers「Thêm / quản lý slide」.
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  CgModularSliderContent,
  CgModularSliderSlide,
} from '../../../types';
import type { BlockDef } from '../types';

export const CG_MODULAR_SLIDER_DEFAULT_SLIDES: CgModularSliderSlide[] = [
  {
    title: 'Neo Forge Towers',
    imageUrl: '/cg-modular-slider/img1.jpg',
    imageAlt: 'Neo Forge Towers',
  },
  {
    title: 'Arcadian Complex',
    imageUrl: '/cg-modular-slider/img2.jpg',
    imageAlt: 'Arcadian Complex',
  },
  {
    title: 'Shadowline Spire',
    imageUrl: '/cg-modular-slider/img3.jpg',
    imageAlt: 'Shadowline Spire',
  },
  {
    title: 'Echo Nexus Habitat',
    imageUrl: '/cg-modular-slider/img4.jpg',
    imageAlt: 'Echo Nexus Habitat',
  },
  {
    title: 'Cascade Enclave',
    imageUrl: '/cg-modular-slider/img5.jpg',
    imageAlt: 'Cascade Enclave',
  },
  {
    title: 'Prism Sector',
    imageUrl: '/cg-modular-slider/img6.jpg',
    imageAlt: 'Prism Sector',
  },
  {
    title: 'Iron Eden Colony',
    imageUrl: '/cg-modular-slider/img7.jpg',
    imageAlt: 'Iron Eden Colony',
  },
];

const VI: CgModularSliderContent = {
  slides: CG_MODULAR_SLIDER_DEFAULT_SLIDES,
};

const EN: CgModularSliderContent = {
  slides: [...CG_MODULAR_SLIDER_DEFAULT_SLIDES],
};

/** Resolve slides[] — fallback default khi thiếu / rỗng. */
export const resolveCgModularSliderSlides = (
  content: CgModularSliderContent | null | undefined
): CgModularSliderSlide[] => {
  const raw = content?.slides;
  if (!Array.isArray(raw) || raw.length === 0) {
    return CG_MODULAR_SLIDER_DEFAULT_SLIDES.map(slide => ({ ...slide }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

export const cgModularSliderSlideElements = (
  slides: CgModularSliderSlide[]
): LayerElement[] => {
  const list = slides.length > 0 ? slides : CG_MODULAR_SLIDER_DEFAULT_SLIDES;
  return list.flatMap((slide, i) => {
    const groupId = `slide${i}`;
    const groupLabel =
      (slide.title ?? '').trim().slice(0, 40) || `Slide ${i + 1}`;
    return [
      {
        key: `slides[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        groupLabel,
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

export const cgModularSliderDef: BlockDef<CgModularSliderContent> = {
  type: 'cg_modular_slider',
  meta: {
    type: 'cg_modular_slider',
    category: 'interactive',
    style: 'modern',
    tags: ['slider', 'carousel', 'gallery', 'animation', 'codegrid'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-07',
    label: 'Modular Carousel',
    accent: '#0f0f0f',
    adminLabel: 'Modular Carousel',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Modular Carousel',
    aiLabelVi:
      'carousel modular: dải tiêu đề trượt ngang + ảnh cắt đôi ở giữa, click để chuyển slide',
    aiLabelEn:
      'modular carousel: horizontal title strip + center dual-clip image, click to advance',
  },
  component: dynamic(() =>
    import('../../CgModularSlider').then(m => m.CgModularSlider)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...cgModularSliderSlideElements(CG_MODULAR_SLIDER_DEFAULT_SLIDES),
    {
      key: 'slides',
      label: 'Thêm / quản lý slide',
      icon: ListChecks,
    },
  ],
};
