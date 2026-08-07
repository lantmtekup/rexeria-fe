/**
 * BlockDef cho `lusion_lp_reveal` — port Codegrid / Awwwards
 * `cg-lusion-lp-reveal`: preloader bar + counter → reveal 2 dòng headline. Path A.
 *
 * Layers: 1 folder Headline (line1 / line2). Không asset.
 */
import { Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LusionLpRevealContent } from '../../../types';
import type { BlockDef } from '../types';

export const LUSION_LP_REVEAL_DEFAULTS = {
  line1: 'Website',
  line2: 'Content',
} as const satisfies LusionLpRevealContent;

const VI: LusionLpRevealContent = { ...LUSION_LP_REVEAL_DEFAULTS };
const EN: LusionLpRevealContent = { ...LUSION_LP_REVEAL_DEFAULTS };

export const lusionLpRevealDef: BlockDef<LusionLpRevealContent> = {
  type: 'lusion_lp_reveal',
  meta: {
    type: 'lusion_lp_reveal',
    label: 'Intro - Lusion LP Reveal',
    accent: '#000000',
    adminLabel: 'Intro - Lusion LP Reveal',
    gradient: 'from-neutral-900 to-neutral-700',
    defaultName: 'Intro - Lusion LP Reveal',
    aiLabelVi:
      'màn preloader đen với thanh bar + counter reel đếm lên, thanh xoay/scale thoát rồi hé lộ hai dòng headline phía dưới',
    aiLabelEn:
      'black preloader with growing bars and a digit counter reel, bars rotate and scale away to reveal two headline lines underneath',
  },
  component: dynamic(() =>
    import('../../LusionLpReveal').then(m => m.LusionLpReveal)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'line1',
      label: 'Dòng 1',
      icon: Type,
      fieldType: 'text',
      groupId: 'headline',
      groupLabel: 'Headline',
    },
    {
      key: 'line2',
      label: 'Dòng 2',
      icon: Type,
      fieldType: 'text',
      groupId: 'headline',
    },
  ],
};
