/**
 * BlockDef cho `pnj_hero` — hero PNJ (Citizen L Arcly): storefront + overlay
 * chữ + canvas frame-scrub + hotspot drawer. Port từ apps/pnj HeroIntroSection.
 * Path A registry.
 *
 * Title lines expand trong LayersPanel từ `titleLines[]` (không list cứng
 * titleLine1/2 ở đây).
 */
import {
  Blend,
  Film,
  Image as ImageIcon,
  ListChecks,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { PnjHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: PnjHeroContent = {
  subtitle: 'CITIZEN',
  titleLines: ['Đồng Hồ Citizen', 'L Arcly Nữ Dây Kim Loại'],
  storefrontUrl: '/pnj/bg-hero.png',
  hotspots: [
    {
      key: 'discover-specs',
      label: 'Thông số kỹ thuật',
      desc: 'Xuất xứ thương hiệu: Nhật Bản\nXuất xứ bộ máy: Nhật Bản',
      img: '/pnj/frames/frame-001.webp',
      dotX: 60,
      dotY: 42,
    },
    {
      key: 'discover-material',
      label: 'Chất liệu & hoàn thiện',
      desc: 'Vỏ thép không gỉ\nMặt kính sapphire chống trầy\nDây kim loại liên kết',
      img: '/pnj/frames/frame-038.webp',
      dotX: 50,
      dotY: 22,
    },
    {
      key: 'craft-dial',
      label: 'Thiết kế mặt số',
      desc: 'Kim đồng hồ thanh mảnh\nVạch chỉ giờ tinh xảo\nLogo Citizen tinh tế',
      img: '/pnj/frames/frame-020.webp',
      dotX: 50,
      dotY: 36,
    },
    {
      key: 'craft-eco',
      label: 'Công nghệ Eco-Drive',
      desc: 'Năng lượng ánh sáng\nKhông cần thay pin\nHoạt động bền bỉ',
      img: '/pnj/frames/frame-076.webp',
      dotX: 55,
      dotY: 54,
    },
  ],
};

const EN: PnjHeroContent = {
  ...VI,
  subtitle: 'CITIZEN',
  titleLines: ['Citizen Watch', 'L Arcly Ladies Metal Bracelet'],
  hotspots: [
    {
      key: 'discover-specs',
      label: 'Technical specs',
      desc: 'Brand origin: Japan\nMovement origin: Japan',
      img: '/pnj/frames/frame-001.webp',
      dotX: 60,
      dotY: 42,
    },
    {
      key: 'discover-material',
      label: 'Materials & finish',
      desc: 'Stainless steel case\nScratch-resistant sapphire crystal\nLinked metal bracelet',
      img: '/pnj/frames/frame-038.webp',
      dotX: 50,
      dotY: 22,
    },
    {
      key: 'craft-dial',
      label: 'Dial design',
      desc: 'Slim hands\nRefined hour markers\nSubtle Citizen logo',
      img: '/pnj/frames/frame-020.webp',
      dotX: 50,
      dotY: 36,
    },
    {
      key: 'craft-eco',
      label: 'Eco-Drive technology',
      desc: 'Light-powered\nNo battery changes\nLong-lasting performance',
      img: '/pnj/frames/frame-076.webp',
      dotX: 55,
      dotY: 54,
    },
  ],
};

export const pnjHeroDef: BlockDef<PnjHeroContent> = {
  type: 'pnj_hero',
  meta: {
    type: 'pnj_hero',
    label: 'PNJ · Hero',
    accent: '#003468',
    adminLabel: 'PNJ Hero',
    gradient: 'from-blue-900 to-slate-800',
    defaultName: 'PNJ Hero',
    aiLabelVi:
      'hero PNJ: ảnh storefront + overlay chữ + canvas scrub frame + hotspot drawer',
    aiLabelEn:
      'PNJ hero: storefront image + overlay copy + canvas frame scrub + hotspot drawer',
  },
  component: dynamic(() => import('../../PnjHero').then(m => m.PnjHero)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'subtitle',
      label: 'Subtitle / brand',
      icon: Type,
      fieldType: 'text',
    },
    // titleLines slots expand in LayersPanel.elementsForType(pnj_hero)
    {
      key: 'titleLines',
      label: 'Thêm / quản lý tiêu đề',
      icon: ListChecks,
    },
    {
      key: 'storefrontUrl',
      label: 'Ảnh storefront',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'hotspots',
      label: 'Hotspot / chi tiết',
      icon: ListChecks,
    },
    {
      key: 'frames',
      label: 'Frame sequence / JSON',
      icon: Film,
    },
    {
      key: 'scrim',
      label: 'Lớp mờ / scrim',
      icon: Blend,
    },
  ],
};
