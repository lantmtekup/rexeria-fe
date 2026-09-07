/**
 * BlockDef cho `lecool_hero` — hero Le Cool Move: ảnh nền full-bleed + vương
 * miện + tiêu đề display nhiều dòng + 2 đoạn copy canh giữa.
 * Port từ apps/ecommerce-landing Hero.tsx. Path A registry.
 *
 * Slot `titleLines[i]` expand trong LayersPanel (không list cứng ở đây).
 */
import { Crown, Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LecoolHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: LecoolHeroContent = {
  backgroundUrl: '/lecool/hero-bg.jpg',
  backgroundAlt: '',
  emblemUrl: '/lecool/hero-emblem.png',
  titleLines: ['On the Bright Side', 'of Movement'],
  introPrefix: 'Introducing',
  introBrand: 'LE COOL MOVE',
  bodyLead:
    'You need not wait for summer to begin carrying a brighter attitude.',
  bodyRest:
    'Belgian surrealism has always understood that a small shift in perspective can improve the atmosphere considerably.',
};

const EN: LecoolHeroContent = { ...VI };

export const lecoolHeroDef: BlockDef<LecoolHeroContent> = {
  type: 'lecool_hero',
  meta: {
    type: 'lecool_hero',
    label: 'Le Cool Move · Hero',
    accent: '#FCF5BD',
    adminLabel: 'Le Cool Move Hero',
    gradient: 'from-sky-700 to-amber-200',
    defaultName: 'Le Cool Move Hero',
    aiLabelVi:
      'hero Le Cool Move: ảnh nền full-bleed, vương miện, tiêu đề display nhiều dòng + 2 đoạn copy canh giữa, chữ hiện dần theo ký tự/dòng',
    aiLabelEn:
      'Le Cool Move hero: full-bleed background image, crown emblem, multi-line display title and two centered copy blocks revealed per character/line',
  },
  component: dynamic(() => import('../../LecoolHero').then(m => m.LecoolHero)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'backgroundUrl',
      label: 'Ảnh nền',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'emblemUrl',
      label: 'Vương miện',
      icon: Crown,
      fieldType: 'image',
    },
    // titleLines slots expand in LayersPanel.elementsForType(lecool_hero)
    {
      key: 'titleLines',
      label: 'Thêm / quản lý tiêu đề',
      icon: ListChecks,
    },
    {
      key: 'introPrefix',
      label: 'Chữ dẫn',
      groupId: 'intro',
      groupLabel: 'Dòng giới thiệu',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'introBrand',
      label: 'Tên sản phẩm',
      groupId: 'intro',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'bodyLead',
      label: 'Câu dẫn',
      groupId: 'body',
      groupLabel: 'Đoạn mô tả',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'bodyRest',
      label: 'Phần còn lại',
      groupId: 'body',
      icon: Type,
      fieldType: 'textarea',
    },
  ],
};
