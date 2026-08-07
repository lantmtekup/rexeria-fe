/**
 * BlockDef cho `cg_3d_slider` — curved Three.js plane + scroll-scrub texture.
 * Port từ Codegrid cg-3d-slider-threejs (discord 215). Bỏ chữ 4 góc nav/footer.
 *
 * `slides[]` động — thêm/xoá qua Layers「Thêm / quản lý slide」.
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { Cg3dSliderContent, Cg3dSliderSlide } from '../../../types';
import type { BlockDef } from '../types';

export const CG_3D_SLIDER_DEFAULT_SLIDES: Cg3dSliderSlide[] = [
  {
    title: 'Field Unit',
    imageUrl: '/cg-3d-slider/img1.jpg',
    imageAlt: 'Field Unit',
  },
  {
    title: 'Astral Convergence',
    imageUrl: '/cg-3d-slider/img2.jpg',
    imageAlt: 'Astral Convergence',
  },
  {
    title: 'Eclipse Core',
    imageUrl: '/cg-3d-slider/img3.jpg',
    imageAlt: 'Eclipse Core',
  },
  {
    title: 'Luminous',
    imageUrl: '/cg-3d-slider/img4.jpg',
    imageAlt: 'Luminous',
  },
  {
    title: 'Serenity',
    imageUrl: '/cg-3d-slider/img5.jpg',
    imageAlt: 'Serenity',
  },
  {
    title: 'Nebula Point',
    imageUrl: '/cg-3d-slider/img6.jpg',
    imageAlt: 'Nebula Point',
  },
  {
    title: 'Horizon',
    imageUrl: '/cg-3d-slider/img7.jpg',
    imageAlt: 'Horizon',
  },
];

const VI: Cg3dSliderContent = {
  slides: CG_3D_SLIDER_DEFAULT_SLIDES,
};

const EN: Cg3dSliderContent = {
  slides: [...CG_3D_SLIDER_DEFAULT_SLIDES],
};

/** Resolve slides[] — fallback default khi thiếu / rỗng. */
export const resolveCg3dSliderSlides = (
  content: Cg3dSliderContent | null | undefined
): Cg3dSliderSlide[] => {
  const raw = content?.slides;
  if (!Array.isArray(raw) || raw.length === 0) {
    return CG_3D_SLIDER_DEFAULT_SLIDES.map(slide => ({ ...slide }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

export const cg3dSliderSlideElements = (
  slides: Cg3dSliderSlide[]
): LayerElement[] => {
  const list = slides.length > 0 ? slides : CG_3D_SLIDER_DEFAULT_SLIDES;
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

export const cg3dSliderDef: BlockDef<Cg3dSliderContent> = {
  type: 'cg_3d_slider',
  meta: {
    type: 'cg_3d_slider',
    category: 'gallery',
    style: 'modern',
    tags: ['gallery', '3d', 'scroll', 'threejs', 'animation', 'codegrid'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-07',
    label: '3D Image Scroll',
    accent: '#0a0a0a',
    adminLabel: '3D Image Scroll',
    gradient: 'from-neutral-900 to-black',
    defaultName: '3D Image Scroll',
    aiLabelVi:
      'slider 3D cong: plane Three.js cuộn sticky, texture ảnh+tiêu đề theo scroll',
    aiLabelEn:
      'curved 3D slider: sticky Three.js plane, image+title texture scrubbed by scroll',
  },
  component: dynamic(() => import('../../Cg3dSlider').then(m => m.Cg3dSlider)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...cg3dSliderSlideElements(CG_3D_SLIDER_DEFAULT_SLIDES),
    {
      key: 'slides',
      label: 'Thêm / quản lý slide',
      icon: ListChecks,
    },
  ],
};
