/**
 * BlockDef cho `framer_bungee_hero_v2` — port từ framer-recon
 * `recon-bungee-hero` (selector `header[data-framer-name="Header"]`,
 * URL https://bungee.framer.website/).
 *
 * Cấu trúc giống V1 nhưng: thêm `accentColor` (mặc định rgb(30,30,30)) + đăng
 * ký Path A qua registry (factory.ts / renderBlock.tsx / LayersPanel.tsx
 * không cần đụng).
 *
 * Component: `blocks/FramerBungeeHeroV2.tsx`. Entrance reveal (wordmark /
 * subtitle / info row / carousel) đi qua `useBlockMotion` theo GSAP R1–R6.
 * Marquee ảnh là ambient CSS @keyframes (R5 safe).
 */
import {
  Image as ImageIcon,
  ListChecks,
  MousePointerClick,
  Pilcrow,
  Type,
} from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type { FramerBungeeHeroV2Content } from '../../../types';
import type { BlockDef } from '../types';

export type FramerBungeeHeroV2Card = {
  imageUrl?: string;
  videoUrl?: string;
};

// Recon assets: ảnh trong dải marquee lấy từ framerusercontent.com CDN
// (cùng pattern với V1). Editor vẫn swap được — đây chỉ là default content.
export const FRAMER_BUNGEE_HERO_V2_DEFAULT_CARDS: FramerBungeeHeroV2Card[] = [
  {
    imageUrl:
      'https://framerusercontent.com/images/LOSSn1XuJFxdkQeIdkzwe48fY.png',
  },
  {
    videoUrl:
      'https://framerusercontent.com/assets/o6ocbBu8Ta7VUr372p01yKOGtY.mp4',
  },
  {
    imageUrl:
      'https://framerusercontent.com/images/ui0xiw6ho8t85E3453z1YpP1M.png',
  },
  {
    imageUrl:
      'https://framerusercontent.com/images/GGQuG2gM9TePsmC84XEwEaDl3g.png',
  },
  {
    videoUrl:
      'https://framerusercontent.com/assets/y2VIDcwXz3puEBTpkCi51q9buBs.mp4',
  },
  {
    imageUrl:
      'https://framerusercontent.com/images/Fih75Xv1jAnsMiQgavGmyB6AgI.png',
  },
  {
    imageUrl:
      'https://framerusercontent.com/images/HfoXDGQsWsPpJU5TGy2N63TFYnc.png',
  },
  {
    imageUrl:
      'https://framerusercontent.com/images/mGQ8JCIsW2AAEHxOugX4Lrge2s.png',
  },
];

const VI: FramerBungeeHeroV2Content = {
  wordmarkUrl: '',
  subtitle: 'Creative studio based in Gotham.',
  timerLabel: 'NY',
  link1Label: 'BE',
  link1Url: 'https://www.behance.net/',
  link2Label: 'DR',
  link2Url: 'https://dribbble.com/',
  link3Label: 'X',
  link3Url: 'https://x.com/',
  marqueeSpeed: 30,
  cardImages: FRAMER_BUNGEE_HERO_V2_DEFAULT_CARDS,
  accentColor: 'rgb(30, 30, 30)',
};

const EN: FramerBungeeHeroV2Content = {
  ...VI,
  subtitle: 'Creative studio based in Gotham.',
};

/** Resolve cardImages[] — fallback default khi thiếu / rỗng. */
export const resolveFramerBungeeHeroV2CardImages = (
  content: FramerBungeeHeroV2Content | null | undefined
): FramerBungeeHeroV2Card[] => {
  const raw = content?.cardImages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return FRAMER_BUNGEE_HERO_V2_DEFAULT_CARDS.map(card => ({ ...card }));
  }
  return raw.filter(card => card && typeof card === 'object');
};

/** Layers folders — 1 group / thẻ marquee. */
export const framerBungeeHeroV2CardElements = (
  cards: FramerBungeeHeroV2Card[]
): LayerElement[] => {
  const list = cards.length > 0 ? cards : FRAMER_BUNGEE_HERO_V2_DEFAULT_CARDS;
  return list.flatMap((card, i) => {
    const groupId = `card${i}`;
    const groupLabel = card.videoUrl?.trim()
      ? `Video ${i + 1}`
      : `Ảnh ${i + 1}`;
    return [
      {
        key: `cardImages[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `cardImages[${i}].videoUrl`,
        label: 'Video',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const framerBungeeHeroV2Def: BlockDef<FramerBungeeHeroV2Content> = {
  type: 'framer_bungee_hero_v2',
  meta: {
    type: 'framer_bungee_hero_v2',
    label: 'Hero - Bungee v2',
    accent: 'rgb(30,30,30)',
    adminLabel: 'Hero - Bungee v2',
    gradient: 'from-gray-100 to-white',
    defaultName: 'Hero - Bungee v2',
    aiLabelVi:
      'block hero studio Bungee v2 (recon spec): wordmark + marquee ảnh + GSAP R1–R6',
    aiLabelEn:
      'Bungee studio hero v2 (recon spec): wordmark + image marquee + GSAP R1–R6',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../FramerBungeeHeroV2').then(m => m.FramerBungeeHeroV2)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'wordmarkUrl',
      label: 'Wordmark',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'subtitle',
      label: 'Subtitle',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    { key: 'timerLabel', label: 'Timer label', icon: Type, fieldType: 'text' },
    {
      key: 'link1Label',
      label: 'Link 1',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'link2Label',
      label: 'Link 2',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'link3Label',
      label: 'Link 3',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    ...framerBungeeHeroV2CardElements(FRAMER_BUNGEE_HERO_V2_DEFAULT_CARDS),
    {
      key: 'cardImages',
      label: 'Thêm / quản lý ảnh',
      icon: ListChecks,
    },
  ],
};
