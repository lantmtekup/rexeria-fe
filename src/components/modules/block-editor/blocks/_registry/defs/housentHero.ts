/**
 * BlockDef cho `housent_hero` — hero section của housent.webflow.io (real
 * estate template). Component: `blocks/HousentHero.tsx`. Ảnh mặc định trỏ CDN
 * Webflow gốc (public) để block tự chứa.
 */
import { Image as ImageIcon, Pilcrow, Search, Tag, Type } from 'lucide-react';

import { HousentHero } from '../../HousentHero';
import type { HousentHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentHeroContent = {
  badge: 'TRUSTED REAL ESTATE PARTNER',
  title: 'Find Your Future Home with Absolute Confidence',
  subtitle:
    'Discover verified properties designed for modern living and long-term value.',
  searchPlaceholder: 'Search by city, zip code',
  searchLabel: 'Find Property',
  imageUrl:
    'https://cdn.prod.website-files.com/69c8ec3d62ab7aba560d580f/69c9108b1fcc04bd7a40744b_3f75fad6acae920f99115d66b0f868ec_Hero%20Image.webp',
  footerLeft: 'LONDON, UK 14:45',
  footerCenter: 'HERITAGE © EST. 1997',
  footerRight: 'NEW YORK, NY 09:45',
};

const EN: HousentHeroContent = { ...VI };

export const housentHeroDef: BlockDef<HousentHeroContent> = {
  type: 'housent_hero',
  meta: {
    type: 'housent_hero',
    label: 'Hero - Real Estate Search',
    accent: '#e8622c',
    adminLabel: 'Hero - Real Estate Search',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'Hero - Real Estate Search',
    aiLabelVi:
      'hero bất động sản 2 cột: badge + tiêu đề lớn + thanh tìm kiếm bên trái, ảnh toà nhà bo góc bên phải',
    aiLabelEn:
      'real-estate hero, two columns: badge + big heading + search bar on the left, rounded building photo on the right',
  },
  component: HousentHero,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'badge', label: 'Badge', icon: Tag, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    {
      key: 'search',
      label: 'Nút tìm kiếm',
      icon: Search,
      fieldType: 'text',
    },
    { key: 'image', label: 'Ảnh hero', icon: ImageIcon, fieldType: 'image' },
    { key: 'footerLeft', label: 'Footer trái', icon: Type, fieldType: 'text' },
    {
      key: 'footerCenter',
      label: 'Footer giữa',
      icon: Type,
      fieldType: 'text',
    },
    { key: 'footerRight', label: 'Footer phải', icon: Type, fieldType: 'text' },
  ],
};
