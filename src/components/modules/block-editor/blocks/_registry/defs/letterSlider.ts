/**
 * BlockDef cho `letter_slider` — product card slider; ảnh bay ngang + chữ
 * mở từng ký tự (clip-path stagger). Port từ CodeGrid PRODUCT SLIDER (027).
 *
 * `slides[]` động — thêm/xoá qua Layers「Thêm / quản lý slide」.
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { LetterSliderContent, LetterSliderSlide } from '../../../types';
import type { BlockDef } from '../types';

export const LETTER_SLIDER_DEFAULT_SLIDES: LetterSliderSlide[] = [
  {
    title: 'extra dry',
    imageUrl: '/letter-slider/img-1.png',
    imageAlt: 'extra dry',
  },
  {
    title: 'filson rush',
    imageUrl: '/letter-slider/img-2.png',
    imageAlt: 'filson rush',
  },
  {
    title: 'red sauce',
    imageUrl: '/letter-slider/img-3.png',
    imageAlt: 'red sauce',
  },
  {
    title: 'extra loud',
    imageUrl: '/letter-slider/img-4.png',
    imageAlt: 'extra loud',
  },
];

const VI: LetterSliderContent = {
  slides: LETTER_SLIDER_DEFAULT_SLIDES,
};

const EN: LetterSliderContent = {
  slides: [...LETTER_SLIDER_DEFAULT_SLIDES],
};

/** Resolve slides[] — fallback default khi thiếu / rỗng. */
export const resolveLetterSliderSlides = (
  content: LetterSliderContent | null | undefined
): LetterSliderSlide[] => {
  const raw = content?.slides;
  if (!Array.isArray(raw) || raw.length === 0) {
    return LETTER_SLIDER_DEFAULT_SLIDES.map(slide => ({ ...slide }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

/**
 * Layers folders — 1 group / slide. Dùng chung giữa BlockDef và
 * LayersPanel.elementsForType.
 */
export const letterSliderSlideElements = (
  slides: LetterSliderSlide[]
): LayerElement[] => {
  const list = slides.length > 0 ? slides : LETTER_SLIDER_DEFAULT_SLIDES;
  return list.flatMap((slide, i) => {
    const groupId = `slide${i}`;
    const groupLabel =
      (slide.title ?? '').trim().slice(0, 40) || `Slide ${i + 1}`;
    return [
      {
        key: `slides[${i}].title`,
        label: 'Tên sản phẩm',
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

export const letterSliderDef: BlockDef<LetterSliderContent> = {
  type: 'letter_slider',
  meta: {
    type: 'letter_slider',
    category: 'interactive',
    style: 'modern',
    tags: ['text', 'slider', 'animation', 'product', 'codegrid'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-07',
    label: 'Letter Slider',
    accent: '#1a1a1a',
    adminLabel: 'Letter Slider',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Letter Slider',
    aiLabelVi: 'slider sản phẩm, chữ mở từng ký tự',
    aiLabelEn: 'product slider revealing letters one by one',
  },
  component: dynamic(() =>
    import('../../LetterSlider').then(m => m.LetterSlider)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...letterSliderSlideElements(LETTER_SLIDER_DEFAULT_SLIDES),
    {
      key: 'slides',
      label: 'Thêm / quản lý slide',
      icon: ListChecks,
    },
  ],
};
