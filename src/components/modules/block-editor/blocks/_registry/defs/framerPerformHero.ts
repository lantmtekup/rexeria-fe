/**
 * BlockDef cho `framer_perform_hero` — Hero - 01 (Perform v1).
 * Manrope 72/500/-0.05em, dark-overlay bg, pill CTA, star reviews,
 * content bên trái tối đa 720px. Port từ 360-admin-cms framer-perform-hero.
 */
import { ImageIcon, Link2, Star, Type, Pilcrow } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { FramerPerformHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: FramerPerformHeroContent = {
  eyebrow: 'Huấn luyện viên ba môn phối hợp giàu kinh nghiệm',
  title: 'Nâng Tầm\nHiệu Suất',
  subtitle:
    'Cải thiện thành tích của bạn với các kế hoạch tập luyện được cá nhân hóa từ huấn luyện viên tận tâm.',
  ctaLabel: 'Bắt đầu ngay',
  ctaHref: '#start',
  backgroundUrl:
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80',
  reviewStars: 5,
  reviewCount: '100+ đánh giá tích cực từ khách hàng',
};

const EN: FramerPerformHeroContent = {
  eyebrow: 'Experienced triathlon coach',
  title: 'Level Up Your\nPerformance',
  subtitle:
    'Improve your triathlon performance with personalized training plans guided by an experienced coach committed to your success.',
  ctaLabel: 'Start now',
  ctaHref: '#start',
  backgroundUrl: VI.backgroundUrl,
  reviewStars: 5,
  reviewCount: '100+ Positive Client Reviews',
};

export const framerPerformHeroDef: BlockDef<FramerPerformHeroContent> = {
  type: 'framer_perform_hero',
  meta: {
    type: 'framer_perform_hero',
    category: 'hero',
    style: 'modern',
    tags: ['clone', 'framer', 'hero', 'perform'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'Perform Hero',
    accent: '#0c0c0c',
    adminLabel: 'Hero - 01 (Perform v1)',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Hero - Perform',
    aiLabelVi:
      'hero full-bleed: ảnh nền motion-blur + overlay gradient trái + eyebrow + title per-char stagger + subtitle + pill CTA + star review',
    aiLabelEn:
      'full-bleed hero: motion-blur bg + left gradient overlay + eyebrow + per-char stagger title + subtitle + pill CTA + star review',
  },
  component: dynamic(() =>
    import('../../FramerPerformHero').then(m => m.FramerPerformHero)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'backgroundUrl',
      label: 'Ảnh nền',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'textarea' },
    { key: 'subtitle', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'ctaLabel', label: 'CTA — Chữ', icon: Type, fieldType: 'text' },
    { key: 'ctaHref', label: 'CTA — Link', icon: Link2, fieldType: 'link' },
    { key: 'reviewStars', label: 'Số sao', icon: Star, fieldType: 'text' },
    { key: 'reviewCount', label: 'Đánh giá', icon: Pilcrow, fieldType: 'text' },
  ],
};
