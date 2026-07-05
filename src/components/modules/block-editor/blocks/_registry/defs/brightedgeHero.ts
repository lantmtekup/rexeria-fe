/**
 * BlockDef cho `brightedge_hero` — clone layout/animation từ 1 template
 * Framer đã mua (xem BrightedgeHero.tsx docstring). Nội dung mặc định là
 * placeholder, không phải copy/ảnh gốc.
 */
import { Image as ImageIcon, Type } from 'lucide-react';

import { BrightedgeHero } from '../../BrightedgeHero';
import type { BrightedgeHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: BrightedgeHeroContent = {
  eyebrow: 'Chúng tôi là studio thiết kế số',
  heading: 'Sáng tạo',
  subtitle:
    'Từ ý tưởng đến hiện thực — thiết kế đẹp có sức mạnh thu hút mọi ánh nhìn.',
  ctaLabel: 'Gặp đội ngũ',
  ctaHref: '#team',
  avatars: [
    { id: 'a1', imageUrl: '' },
    { id: 'a2', imageUrl: '' },
    { id: 'a3', imageUrl: '' },
    { id: 'a4', imageUrl: '' },
  ],
  badgeText: 'SÁNG TẠO • Ý TƯỞNG • GIẢI PHÁP • ',
  badgeSubtext: 'Kiến tạo giá trị khác biệt',
  imageUrl: '',
};

export const brightedgeHeroDef: BlockDef<BrightedgeHeroContent> = {
  type: 'brightedge_hero',
  meta: {
    type: 'brightedge_hero',
    label: 'Hero - BrightEdge',
    accent: '#f55733',
    adminLabel: 'Hero - BrightEdge',
    gradient: 'from-orange-500 to-neutral-700',
    defaultName: 'Hero - BrightEdge',
    aiLabelVi: 'hero 2 cột: tiêu đề lớn + avatar stack + ảnh + badge tròn',
    aiLabelEn:
      'split hero: big heading + avatar stack + image + circular badge',
  },
  component: BrightedgeHero,
  defaultContent: { vi: VI, en: { ...VI } },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Mô tả', icon: Type, fieldType: 'textarea' },
    { key: 'ctaLabel', label: 'Nút CTA', icon: Type, fieldType: 'text' },
    { key: 'imageUrl', label: 'Ảnh hero', icon: ImageIcon, fieldType: 'image' },
    {
      key: 'badgeText',
      label: 'Badge (chữ vòng)',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'badgeSubtext',
      label: 'Chữ nhỏ trên ảnh',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
