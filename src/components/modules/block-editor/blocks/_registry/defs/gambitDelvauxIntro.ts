/**
 * BlockDef cho `gambit_delvaux_intro` — port `Intro` của apps/gambit-delvaux:
 * màn intro phủ kín khung nhìn (curtain tách → logo bay lên → ảnh sản phẩm
 * trồi lên → tên sản phẩm clip trái→phải) rồi tự trượt xuống biến mất. Path A.
 *
 * Layers: 2 folder (Thương hiệu / Sản phẩm) + nút Skip.
 *
 * Asset mặc định nằm ở `public/gambit/` (dùng chung với
 * `gambit_product_overview`).
 */
import { Image as ImageIcon, SkipForward, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { GambitDelvauxIntroContent } from '../../../types';
import type { BlockDef } from '../types';

/**
 * Default dùng chung cho BlockDef + component (component fallback về đây khi
 * field CMS rỗng, để không bao giờ render màn intro trống).
 */
export const GAMBIT_DELVAUX_INTRO_DEFAULTS = {
  logoTopUrl: '/gambit/icon-logo-top.svg',
  logoTextUrl: '/gambit/icon-text.svg',
  logoTextAlt: 'DELVAUX',
  productImageUrl: '/gambit/product.png',
  productImageAlt: 'Delvaux handbag',
  title: 'BRILLANT MINI',
  skipLabel: 'Skip Intro',
} as const satisfies GambitDelvauxIntroContent;

const VI: GambitDelvauxIntroContent = { ...GAMBIT_DELVAUX_INTRO_DEFAULTS };
const EN: GambitDelvauxIntroContent = { ...GAMBIT_DELVAUX_INTRO_DEFAULTS };

export const gambitDelvauxIntroDef: BlockDef<GambitDelvauxIntroContent> = {
  type: 'gambit_delvaux_intro',
  meta: {
    type: 'gambit_delvaux_intro',
    label: 'Intro - Curtain Reveal',
    accent: '#111111',
    adminLabel: 'Intro - Curtain Reveal',
    gradient: 'from-neutral-100 to-white',
    defaultName: 'Intro - Curtain Reveal',
    aiLabelVi:
      'màn intro phủ kín màn hình: hai màn tách ra hé lộ logo, logo bay lên đỉnh + thu nhỏ, ảnh sản phẩm trồi lên, tên sản phẩm hiện dần theo clip rồi cả màn trượt xuống biến mất',
    aiLabelEn:
      'full-screen intro overlay: curtains split to reveal the logo, logo flies to the top and shrinks, product image rises, product name wipes in, then the whole overlay slides away',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../GambitDelvauxIntro').then(m => m.GambitDelvauxIntro)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoTopUrl',
      label: 'Icon trên',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'brand',
      groupLabel: 'Thương hiệu',
    },
    {
      key: 'logoTextUrl',
      label: 'Logo chữ',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'brand',
    },
    {
      key: 'logoTextAlt',
      label: 'Alt logo chữ',
      icon: Type,
      fieldType: 'text',
      groupId: 'brand',
    },
    {
      key: 'productImageUrl',
      label: 'Ảnh sản phẩm',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'product',
      groupLabel: 'Sản phẩm',
    },
    {
      key: 'productImageAlt',
      label: 'Alt ảnh sản phẩm',
      icon: Type,
      fieldType: 'text',
      groupId: 'product',
    },
    {
      key: 'title',
      label: 'Tên sản phẩm',
      icon: Type,
      fieldType: 'text',
      groupId: 'product',
    },
    {
      key: 'skipLabel',
      label: 'Nút bỏ qua',
      icon: SkipForward,
      fieldType: 'text',
    },
  ],
};
