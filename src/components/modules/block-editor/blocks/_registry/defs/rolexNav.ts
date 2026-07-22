/**
 * BlockDef cho `rolex_nav` — navigation bar từ capable-seat-351062.framer.app.
 */
import { Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { RolexNavContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: RolexNavContent = {
  navLogoLabel: 'HOME',
  navHomeLabel: 'HOME',
  navBurgerLabel: 'Explore Our Collection',
};

export const rolexNavDef: BlockDef<RolexNavContent> = {
  type: 'rolex_nav',
  meta: {
    type: 'rolex_nav',
    label: 'Rolex Nav',
    accent: '#ffffff',
    adminLabel: 'Rolex Nav',
    gradient: 'from-neutral-800 to-neutral-900',
    defaultName: 'Rolex Nav',
    aiLabelVi: 'nav bar glass với 3 items (logo, home, explore)',
    aiLabelEn: 'glass nav bar with 3 items (logo, home, explore)',
  },
  component: dynamic(() => import('../../RolexNav').then(m => m.RolexNav)),
  defaultContent: { vi: VI, en: { ...VI } },
  elements: [
    { key: 'navLogoLabel', label: 'Logo nav', icon: Type, fieldType: 'text' },
    { key: 'navHomeLabel', label: 'Nav HOME', icon: Type, fieldType: 'text' },
    {
      key: 'navBurgerLabel',
      label: 'Nav burger',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
