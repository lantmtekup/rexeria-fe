/**
 * BlockDef cho `cg_responsive_landing_loader` — port Codegrid
 * `cg-responsive-landing-page` (discord 111): preloader counter + copy letter +
 * lớp đen/đỏ — không hero/ảnh/nền sau, không site-content.
 */
import { Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CgResponsiveLandingLoaderContent } from '../../../types';
import type { BlockDef } from '../types';

export const CG_RESPONSIVE_LANDING_LOADER_DEFAULTS = {
  copyText: 'New reality',
} as const satisfies CgResponsiveLandingLoaderContent;

const VI: CgResponsiveLandingLoaderContent = {
  ...CG_RESPONSIVE_LANDING_LOADER_DEFAULTS,
};
const EN: CgResponsiveLandingLoaderContent = {
  ...CG_RESPONSIVE_LANDING_LOADER_DEFAULTS,
};

export const cgResponsiveLandingLoaderDef: BlockDef<CgResponsiveLandingLoaderContent> =
  {
    type: 'cg_responsive_landing_loader',
    meta: {
      type: 'cg_responsive_landing_loader',
      category: 'intro',
      style: 'modern',
      tags: [
        'intro',
        'preloader',
        'loader',
        'codegrid',
        'animation',
        'overlay',
      ],
      status: 'ready',
      responsive: true,
      updatedAt: '2026-08-07',
      label: 'Responsive Landing Loader',
      accent: '#ff0000',
      adminLabel: 'Responsive Landing Loader',
      gradient: 'from-neutral-900 via-red-600 to-neutral-800',
      defaultName: 'Responsive Landing Loader',
      aiLabelVi:
        'màn preloader full-screen: counter đếm ngẫu nhiên 0–100, chữ copy animate từng ký tự, lớp đen thu + lớp đỏ collapse rồi biến mất — không hé lộ ảnh/nền',
      aiLabelEn:
        'full-screen preloader: random 0–100 counter, per-letter copy animation, black/red layers collapse then disappear — no image or background reveal',
    },
    component: dynamic(() =>
      import('../../CgResponsiveLandingLoader').then(
        m => m.CgResponsiveLandingLoader
      )
    ),
    defaultContent: { vi: VI, en: EN },
    elements: [
      {
        key: 'copyText',
        label: 'Copy',
        icon: Type,
        fieldType: 'text',
        groupId: 'loader',
        groupLabel: 'Loader',
      },
    ],
  };
